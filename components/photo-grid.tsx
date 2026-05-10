import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SittingPhoto } from '@/lib/sitting-api';

const GAP = 6;
const COLS = 3;

/** cover 사진을 맨 앞으로 정렬한 배열을 반환. cover가 없거나 목록에 없으면 원본 그대로. */
export function sortPhotosCoverFirst(
  photos: SittingPhoto[],
  coverPhotoId: string | null,
): SittingPhoto[] {
  if (!coverPhotoId) return photos;
  const cover = photos.find((p) => p.id === coverPhotoId);
  if (!cover) return photos;
  return [cover, ...photos.filter((p) => p.id !== coverPhotoId)];
}

type Props = {
  photos: SittingPhoto[];
  coverPhotoId: string | null;
  onPhotoPress?: (index: number) => void;
  /** cover 사진 우상단 배지. 'star'(돌봄 상세) | 'check'(고객 상세) | undefined(없음) */
  cornerBadge?: 'star' | 'check';
  isDark: boolean;
};

export function PhotoGrid({ photos, coverPhotoId, onPhotoPress, cornerBadge, isDark }: Props) {
  const sortedPhotos = useMemo(
    () => sortPhotosCoverFirst(photos, coverPhotoId),
    [photos, coverPhotoId],
  );

  if (sortedPhotos.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: isDark ? '#111827' : '#F3F4F6' }]}>
        <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          사진이 없습니다
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {sortedPhotos.map((photo, index) => {
        const isCover = photo.id === coverPhotoId;
        return (
          <Pressable
            key={photo.id}
            style={styles.cell}
            onPress={() => onPhotoPress?.(index)}
          >
            <Image
              source={{ uri: photo.url }}
              style={styles.image}
              contentFit="cover"
              transition={150}
            />
            {cornerBadge && isCover && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cornerBadge === 'star' ? '★' : '✓'}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -GAP / 2,
  },
  cell: {
    width: `${100 / COLS}%`,
    aspectRatio: 1,
    padding: GAP / 2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  badge: {
    position: 'absolute',
    top: GAP,
    right: GAP,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  empty: {
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
