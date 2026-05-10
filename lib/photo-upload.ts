import type { ImagePickerAsset } from 'expo-image-picker';

import { confirmPhoto, requestPhotoUploadUrl, type SittingPhoto, uploadToS3 } from './sitting-api';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type AllowedMime = (typeof ALLOWED_MIMES)[number];

const isAllowedMime = (m: string): m is AllowedMime =>
  (ALLOWED_MIMES as readonly string[]).includes(m);

/**
 * picker가 제공한 mimeType, 없으면 URI 확장자에서 추론. 허용 외면 throw.
 */
const resolveMimeType = (asset: ImagePickerAsset): AllowedMime => {
  if (asset.mimeType && isAllowedMime(asset.mimeType)) return asset.mimeType;

  const ext = asset.uri.toLowerCase().split('.').pop();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';

  throw new Error(`지원하지 않는 형식입니다: ${asset.mimeType ?? ext ?? 'unknown'}`);
};

type UploadOnePhotoArgs = {
  token: string;
  clientId: string;
  asset: ImagePickerAsset;
};

/**
 * 한 장의 사진을 업로드: presign → S3 PUT → confirm 직렬 수행.
 * 각 단계에서 실패 시 throw. 호출자가 catch해서 재시도/표시 처리.
 */
export const uploadOnePhoto = async ({
  token,
  clientId,
  asset,
}: UploadOnePhotoArgs): Promise<SittingPhoto> => {
  const mimeType = resolveMimeType(asset);

  // RN의 fetch(localUri)는 file:// URI를 읽어 Blob을 만들 수 있다.
  const fileResponse = await fetch(asset.uri);
  const blob = await fileResponse.blob();
  const sizeBytes = asset.fileSize ?? blob.size;

  if (sizeBytes <= 0) throw new Error('빈 파일입니다.');
  if (sizeBytes > MAX_BYTES) {
    throw new Error(`파일이 너무 큽니다 (${(sizeBytes / 1024 / 1024).toFixed(1)}MB / 10MB)`);
  }

  const { photoId, uploadUrl } = await requestPhotoUploadUrl(token, clientId, {
    mimeType,
    sizeBytes,
  });

  await uploadToS3(uploadUrl, mimeType, blob);

  return confirmPhoto(token, clientId, photoId, {
    originalFileName: asset.fileName ?? undefined,
  });
};
