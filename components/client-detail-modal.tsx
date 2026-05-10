import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { usePhotos } from '@/hooks/use-photos';
import type { SittingClient } from '@/lib/sitting-api';

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

export function ClientDetailModal({ visible, onClose, isDark, theme, client }: Props) {
  const { photos, coverPhotoId, refetch } = usePhotos({
    clientId: visible ? (client?.id ?? null) : null,
    knownCoverPhotoId: client?.coverPhoto?.id ?? null,
  });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadVisible, setUploadVisible] = useState(false);

  if (!client) return null;

  const handleUploadClose = (uploadedCount: number) => {
    setUploadVisible(false);
    if (uploadedCount > 0) {
      void refetch();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={sharedStyles.pickerOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            sharedStyles.formModalContent,
            { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
          ]}
        >
          <View style={sharedStyles.header}>
            <Text style={[sharedStyles.title, { color: theme.text }]}>고객 상세</Text>
            <Pressable onPress={onClose}>
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
              <Text style={[styles.sectionLabel, { color: theme.icon }]}>사진</Text>
              <PhotoGrid
                photos={photos}
                coverPhotoId={coverPhotoId}
                onPhotoPress={(index) => setLightboxIndex(index)}
                cornerBadge="check"
                isDark={isDark}
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
              onPress={() => {
                /* 다음 이터레이션에서 wire-up */
              }}
              disabled
            >
              <Text style={[styles.footerButtonText, { color: theme.icon }]}>
                대표사진변경
              </Text>
            </Pressable>
          </View>
        </View>
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
});
