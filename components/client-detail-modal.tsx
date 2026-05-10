import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { SittingClient } from '@/lib/sitting-api';

import { styles as sharedStyles } from './add-care-modal.styles';

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
  if (!client) return null;

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
            {client.coverPhoto && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.icon }]}>대표 사진</Text>
                <Image
                  source={{ uri: client.coverPhoto.url }}
                  style={styles.catImage}
                  resizeMode="cover"
                />
              </View>
            )}
            <DetailRow label="등록일" value={formatDateTime(client.createdAt)} theme={theme} />
            <DetailRow label="수정일" value={formatDateTime(client.updatedAt)} theme={theme} />
          </ScrollView>
        </View>
      </View>
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
  catImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 4,
  },
});
