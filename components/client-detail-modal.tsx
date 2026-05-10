import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { usePhotos } from '@/hooks/use-photos';
import { type SittingClient, updateClient } from '@/lib/sitting-api';
import { useAuth } from '@/providers/auth-provider';

import { styles as sharedStyles } from './add-care-modal.styles';
import { PhotoGrid, sortPhotosCoverFirst } from './photo-grid';
import { PhotoLightbox } from './photo-lightbox';
import { PhotoUploadModal } from './photo-upload-modal';

type Theme = {
  text: string;
  icon: string;
  tint: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  theme: Theme;
  client: SittingClient | null;
  /** 클라이언트 정보가 갱신됐을 때 부모에 전파 (목록/뷰잉 상태 동기화) */
  onClientUpdated?: (client: SittingClient) => void;
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

type DetailRowProps = {
  label: string;
  value: string;
  theme: Theme;
};

function DetailRow({ label, value, theme }: DetailRowProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: theme.icon }]}>{label}</Text>
      <Text style={[styles.sectionValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

export function ClientDetailModal({
  visible,
  onClose,
  isDark,
  theme,
  client,
  onClientUpdated,
}: Props) {
  const { accessToken } = useAuth();
  const { photos, coverPhotoId, refetch } = usePhotos({
    clientId: visible ? (client?.id ?? null) : null,
    knownCoverPhotoId: client?.coverPhoto?.id ?? null,
  });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [coverSelectMode, setCoverSelectMode] = useState(false);
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);

  const handleUploadClose = useCallback(
    (uploadedCount: number) => {
      setUploadVisible(false);
      if (uploadedCount > 0) void refetch();
    },
    [refetch],
  );

  const handleCoverSelect = useCallback(
    async (photoId: string) => {
      if (!accessToken || !client || isUpdatingCover) return;
      setIsUpdatingCover(true);
      try {
        const updated = await updateClient(accessToken, client.id, { coverPhotoId: photoId });
        onClientUpdated?.(updated);
        setCoverSelectMode(false);
      } catch {
        Alert.alert('오류', '대표사진 변경에 실패했습니다.');
      } finally {
        setIsUpdatingCover(false);
      }
    },
    [accessToken, client, isUpdatingCover, onClientUpdated],
  );

  const handleClose = useCallback(() => {
    if (isUpdatingCover) return;
    setCoverSelectMode(false);
    onClose();
  }, [isUpdatingCover, onClose]);

  if (!client) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={sharedStyles.pickerOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View
          style={[
            sharedStyles.formModalContent,
            { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
          ]}
        >
          <View style={sharedStyles.header}>
            <Text style={[sharedStyles.title, { color: theme.text }]}>
              {coverSelectMode ? '대표사진 선택' : '고객 상세'}
            </Text>
            <Pressable onPress={handleClose}>
              <Text style={[sharedStyles.closeButton, { color: theme.tint }]}>닫기</Text>
            </Pressable>
          </View>
          <ScrollView
            style={sharedStyles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <DetailRow label="고객 이름" value={client.clientName} theme={theme} />
            <DetailRow label="고양이 이름" value={client.catName} theme={theme} />
            <DetailRow label="주소" value={client.address} theme={theme} />
            <DetailRow label="출입 메모" value={client.entryNote ?? '-'} theme={theme} />
            <DetailRow label="요구사항" value={client.requirements ?? '-'} theme={theme} />
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.icon }]}>
                {coverSelectMode ? '사진 — 대표로 지정할 사진을 선택' : '사진'}
              </Text>
              <PhotoGrid
                photos={photos}
                coverPhotoId={coverPhotoId}
                onPhotoPress={(index) => setLightboxIndex(index)}
                cornerBadge="check"
                isDark={isDark}
                mode={coverSelectMode ? 'cover-select' : 'view'}
                onCoverSelect={handleCoverSelect}
              />
            </View>
            <DetailRow label="등록일" value={formatDateTime(client.createdAt)} theme={theme} />
            <DetailRow label="수정일" value={formatDateTime(client.updatedAt)} theme={theme} />
          </ScrollView>
          <View
            style={[
              styles.footer,
              { borderTopColor: isDark ? '#374151' : '#E5E7EB' },
            ]}
          >
            {coverSelectMode ? (
              <Pressable
                style={[styles.footerButton, { backgroundColor: theme.tint }]}
                onPress={() => setCoverSelectMode(false)}
              >
                <Text style={styles.footerButtonText}>완료</Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  style={[styles.footerButton, { backgroundColor: theme.tint }]}
                  onPress={() => setUploadVisible(true)}
                >
                  <Text style={styles.footerButtonText}>사진등록</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.footerButton,
                    styles.footerButtonOutline,
                    { borderColor: theme.tint },
                  ]}
                  onPress={() => setCoverSelectMode(true)}
                  disabled={photos.length === 0}
                >
                  <Text
                    style={[
                      styles.footerButtonText,
                      { color: photos.length === 0 ? theme.icon : theme.tint },
                    ]}
                  >
                    대표사진변경
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
        {isUpdatingCover && (
          <View style={styles.blockingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>
      <PhotoLightbox
        visible={lightboxIndex !== null}
        photos={sortPhotosCoverFirst(photos, coverPhotoId)}
        initialIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
      />
      <PhotoUploadModal
        visible={uploadVisible}
        clientId={client.id}
        isDark={isDark}
        theme={theme}
        onClose={handleUploadClose}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    paddingHorizontal: 0,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  footerButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  blockingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
