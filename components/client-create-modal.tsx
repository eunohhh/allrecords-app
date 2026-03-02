import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { styles } from './add-care-modal.styles';

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
  title?: string;
  saveLabel?: string;
  clientName: string;
  onChangeClientName: (value: string) => void;
  clientCatName: string;
  onChangeClientCatName: (value: string) => void;
  clientAddress: string;
  onChangeClientAddress: (value: string) => void;
  clientEntryNote: string;
  onChangeClientEntryNote: (value: string) => void;
  clientRequirements: string;
  onChangeClientRequirements: (value: string) => void;
  isSaving: boolean;
  onSave: () => void;
};

export function ClientCreateModal({
  visible,
  onClose,
  isDark,
  theme,
  title,
  saveLabel,
  clientName,
  onChangeClientName,
  clientCatName,
  onChangeClientCatName,
  clientAddress,
  onChangeClientAddress,
  clientEntryNote,
  onChangeClientEntryNote,
  clientRequirements,
  onChangeClientRequirements,
  isSaving,
  onSave,
}: Props) {
  const heading = title ?? '고객 추가';
  const saveText = saveLabel ?? '고객 저장';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.pickerOverlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View
            style={[
              styles.formModalContent,
              { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>{heading}</Text>
                <Pressable onPress={onClose}>
                  <Text style={[styles.closeButton, { color: theme.tint }]}>취소</Text>
                </Pressable>
              </View>

              <ScrollView
                style={styles.form}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>고객 이름</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                        color: theme.text,
                      },
                    ]}
                    value={clientName}
                    onChangeText={onChangeClientName}
                    placeholder="고객 이름"
                    placeholderTextColor={theme.icon}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>고양이 이름</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                        color: theme.text,
                      },
                    ]}
                    value={clientCatName}
                    onChangeText={onChangeClientCatName}
                    placeholder="고양이 이름"
                    placeholderTextColor={theme.icon}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>주소</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                        color: theme.text,
                      },
                    ]}
                    value={clientAddress}
                    onChangeText={onChangeClientAddress}
                    placeholder="주소"
                    placeholderTextColor={theme.icon}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>출입 메모 (선택)</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                        color: theme.text,
                      },
                    ]}
                    value={clientEntryNote}
                    onChangeText={onChangeClientEntryNote}
                    placeholder="출입 메모"
                    placeholderTextColor={theme.icon}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>요구사항 (선택)</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                        color: theme.text,
                      },
                    ]}
                    value={clientRequirements}
                    onChangeText={onChangeClientRequirements}
                    placeholder="요구사항"
                    placeholderTextColor={theme.icon}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </ScrollView>

              <Pressable
                style={[
                  styles.saveButton,
                  { backgroundColor: theme.tint },
                  isSaving && { opacity: 0.6 },
                ]}
                onPress={onSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>{saveText}</Text>
                )}
              </Pressable>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
