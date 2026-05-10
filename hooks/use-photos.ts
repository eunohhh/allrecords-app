import { useCallback, useEffect, useRef, useState } from 'react';

import { getClient, getPhotos, type SittingPhoto } from '@/lib/sitting-api';
import { useAuth } from '@/providers/auth-provider';

type Options = {
  clientId: string | null | undefined;
  /**
   * 이미 부모가 cover 정보를 알고 있으면 전달. undefined면 hook이 getClient로 보충 fetch.
   * null은 "cover 없음"을 명시하는 값.
   */
  knownCoverPhotoId?: string | null;
};

type Result = {
  photos: SittingPhoto[];
  coverPhotoId: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export function usePhotos({ clientId, knownCoverPhotoId }: Options): Result {
  const { accessToken } = useAuth();
  const [photos, setPhotos] = useState<SittingPhoto[]>([]);
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(knownCoverPhotoId ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const needsCoverFetch = knownCoverPhotoId === undefined;

  const refetch = useCallback(async () => {
    if (!accessToken || !clientId) {
      setPhotos([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (needsCoverFetch) {
        const [photoList, client] = await Promise.all([
          getPhotos(accessToken, clientId),
          getClient(accessToken, clientId),
        ]);
        setPhotos(photoList);
        setCoverPhotoId(client.coverPhoto?.id ?? null);
      } else {
        const photoList = await getPhotos(accessToken, clientId);
        setPhotos(photoList);
      }
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, clientId, needsCoverFetch]);

  // 부모가 prop으로 cover를 알려준 경우 동기화
  const lastKnownCoverRef = useRef<string | null | undefined>(knownCoverPhotoId);
  useEffect(() => {
    if (knownCoverPhotoId !== undefined && knownCoverPhotoId !== lastKnownCoverRef.current) {
      setCoverPhotoId(knownCoverPhotoId);
      lastKnownCoverRef.current = knownCoverPhotoId;
    }
  }, [knownCoverPhotoId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { photos, coverPhotoId, isLoading, error, refetch };
}
