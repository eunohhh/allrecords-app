import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
  careDate: Date;
  onOpenDatePicker: () => void;
  onOpenTimePicker: () => void;
  note: string;
  onChangeNote: (value: string) => void;
  isSaving: boolean;
  onSave: () => void;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
};

export function CareEditModal({
  visible,
  onClose,
  isDark,
  theme,
  careDate,
  onOpenDatePicker,
  onOpenTimePicker,
  note,
  onChangeNote,
  isSaving,
  onSave,
  formatDate,
  formatTime,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.pickerOverlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
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
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>케어 수정</Text>
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
                <Text style={[styles.label, { color: theme.icon }]}>케어 날짜</Text>
                <Pressable
                  style={[
                    styles.selectButton,
                    {
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      borderColor: isDark ? '#4B5563' : '#E5E7EB',
                    },
                  ]}
                  onPress={onOpenDatePicker}
                >
                  <Text style={[styles.selectButtonText, { color: theme.text }]}>
                    {formatDate(careDate)}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.icon }]}>케어 시간</Text>
                <Pressable
                  style={[
                    styles.selectButton,
                    {
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      borderColor: isDark ? '#4B5563' : '#E5E7EB',
                    },
                  ]}
                  onPress={onOpenTimePicker}
                >
                  <Text style={[styles.selectButtonText, { color: theme.text }]}>
                    {formatTime(careDate)}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.icon }]}>메모</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      borderColor: isDark ? '#4B5563' : '#E5E7EB',
                      color: theme.text,
                    },
                  ]}
                  value={note}
                  onChangeText={onChangeNote}
                  placeholder="메모"
                  placeholderTextColor={theme.icon}
                  multiline
                  numberOfLines={3}
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
                <Text style={styles.saveButtonText}>케어 저장</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
