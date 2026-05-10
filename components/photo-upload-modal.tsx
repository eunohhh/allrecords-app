import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { uploadOnePhoto } from '@/lib/photo-upload';
import { useAuth } from '@/providers/auth-provider';

import { styles as sharedStyles } from './add-care-modal.styles';

type Theme = {
  text: string;
  icon: string;
  tint: string;
};

type Props = {
  visible: boolean;
  clientId: string;
  isDark: boolean;
  theme: Theme;
  onClose: (uploadedCount: number) => void;
};

type UploadStatus = 'pending' | 'uploading' | 'done' | 'failed';

type UploadItem = {
  id: string;
  asset: ImagePicker.ImagePickerAsset;
  status: UploadStatus;
  error?: string;
};

const statusLabel = (s: UploadStatus) => {
  switch (s) {
    case 'pending':
      return '대기';
    case 'uploading':
      return '업로드 중';
    case 'done':
      return '완료';
    case 'failed':
      return '실패';
  }
};

const statusColor = (s: UploadStatus) => {
  switch (s) {
    case 'pending':
      return '#9CA3AF';
    case 'uploading':
      return '#0284C7';
    case 'done':
      return '#10B981';
    case 'failed':
      return '#EF4444';
  }
};

export function PhotoUploadModal({ visible, clientId, isDark, theme, onClose }: Props) {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const processOne = useCallback(
    async (item: UploadItem, token: string) => {
      updateItem(item.id, { status: 'uploading', error: undefined });
      try {
        await uploadOnePhoto({ token, clientId, asset: item.asset });
        updateItem(item.id, { status: 'done' });
      } catch (e) {
        updateItem(item.id, {
          status: 'failed',
          error: (e as Error).message ?? '업로드 실패',
        });
      }
    },
    [clientId, updateItem],
  );

  const runQueue = useCallback(
    async (queue: UploadItem[]) => {
      if (!accessToken) return;
      setIsProcessing(true);
      for (const item of queue) {
        await processOne(item, accessToken);
      }
      setIsProcessing(false);
    },
    [accessToken, processOne],
  );

  const handlePick = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      selectionLimit: 0,
      quality: 0.9,
    });
    if (result.canceled || result.assets.length === 0) return;

    const newItems: UploadItem[] = result.assets.map((asset, idx) => ({
      id: `${Date.now()}-${idx}-${asset.assetId ?? asset.uri}`,
      asset,
      status: 'pending',
    }));
    setItems(newItems);
    void runQueue(newItems);
  }, [runQueue]);

  const handleRetry = useCallback(
    async (item: UploadItem) => {
      if (!accessToken || isProcessing) return;
      setIsProcessing(true);
      await processOne(item, accessToken);
      setIsProcessing(false);
    },
    [accessToken, isProcessing, processOne],
  );

  const handleClose = useCallback(() => {
    if (isProcessing) return;
    const successCount = items.filter((it) => it.status === 'done').length;
    onClose(successCount);
    setItems([]);
  }, [isProcessing, items, onClose]);

  const allDone = items.length > 0 && items.every((it) => it.status === 'done');

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
            <Text style={[sharedStyles.title, { color: theme.text }]}>사진 등록</Text>
            <Pressable onPress={handleClose} disabled={isProcessing}>
              <Text
                style={[
                  sharedStyles.closeButton,
                  { color: isProcessing ? theme.icon : theme.tint },
                ]}
              >
                {allDone ? '완료' : '닫기'}
              </Text>
            </Pressable>
          </View>

          {items.length === 0 ? (
            <View style={styles.empty}>
              <Pressable
                style={[styles.pickButton, { backgroundColor: theme.tint }]}
                onPress={handlePick}
              >
                <Text style={styles.pickButtonText}>갤러리에서 선택</Text>
              </Pressable>
              <Text style={[styles.hint, { color: theme.icon }]}>
                여러 장 선택 가능 · JPG/PNG/WebP · 최대 10MB
              </Text>
            </View>
          ) : (
            <ScrollView
              style={sharedStyles.form}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {items.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemRow,
                    { borderColor: isDark ? '#374151' : '#E5E7EB' },
                  ]}
                >
                  <Image
                    source={{ uri: item.asset.uri }}
                    style={styles.thumb}
                    contentFit="cover"
                  />
                  <View style={styles.itemMeta}>
                    <Text
                      style={[styles.itemName, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {item.asset.fileName ?? '사진'}
                    </Text>
                    <View style={styles.itemStatusRow}>
                      {item.status === 'uploading' && (
                        <ActivityIndicator size="small" color={statusColor(item.status)} />
                      )}
                      <Text
                        style={[styles.itemStatus, { color: statusColor(item.status) }]}
                      >
                        {statusLabel(item.status)}
                      </Text>
                      {item.error && (
                        <Text
                          style={[styles.itemError, { color: theme.icon }]}
                          numberOfLines={1}
                        >
                          · {item.error}
                        </Text>
                      )}
                    </View>
                  </View>
                  {item.status === 'failed' && (
                    <Pressable
                      style={[styles.retryButton, { borderColor: theme.tint }]}
                      onPress={() => handleRetry(item)}
                      disabled={isProcessing}
                    >
                      <Text style={[styles.retryText, { color: theme.tint }]}>재시도</Text>
                    </Pressable>
                  )}
                </View>
              ))}

              {!isProcessing && (
                <Pressable
                  style={[styles.addMoreButton, { borderColor: theme.tint }]}
                  onPress={handlePick}
                >
                  <Text style={[styles.addMoreText, { color: theme.tint }]}>
                    + 사진 추가 선택
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  pickButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  pickButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  itemMeta: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemError: {
    fontSize: 11,
    flexShrink: 1,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addMoreButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
