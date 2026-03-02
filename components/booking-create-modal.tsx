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

import type { SittingClient } from '@/lib/sitting-api';

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
  allowClientChange?: boolean;
  showClientCreate?: boolean;
  clients: SittingClient[];
  selectedClient: SittingClient | null;
  isLoadingClients: boolean;
  onOpenClientPicker: () => void;
  onOpenClientCreate: () => void;
  onOpenContactMethodPicker: () => void;
  bookingDate: Date;
  onOpenDatePicker: () => void;
  onOpenTimePicker: () => void;
  contactMethod: string | null;
  entryNote?: string;
  onChangeEntryNote?: (value: string) => void;
  expectedAmount: string;
  onChangeExpectedAmount: (value: string) => void;
  amount: string;
  onChangeAmount: (value: string) => void;
  isSaving: boolean;
  onSave: () => void;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
};

export function BookingCreateModal({
  visible,
  onClose,
  isDark,
  theme,
  title,
  saveLabel,
  allowClientChange,
  showClientCreate,
  clients,
  selectedClient,
  isLoadingClients,
  onOpenClientPicker,
  onOpenClientCreate,
  onOpenContactMethodPicker,
  bookingDate,
  onOpenDatePicker,
  onOpenTimePicker,
  contactMethod,
  entryNote,
  onChangeEntryNote,
  expectedAmount,
  onChangeExpectedAmount,
  amount,
  onChangeAmount,
  isSaving,
  onSave,
  formatDate,
  formatTime,
}: Props) {
  const heading = title ?? '예약 추가';
  const saveText = saveLabel ?? '예약 저장';
  const canSelectClient = allowClientChange !== false;
  const canCreateClient = showClientCreate !== false;

  return (
    <>
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
                  <Text style={[styles.label, { color: theme.icon }]}>고객</Text>
                    {isLoadingClients ? (
                      <ActivityIndicator size="small" color={theme.tint} />
                    ) : clients.length === 0 ? (
                      <Text style={[styles.emptyText, { color: theme.icon }]}>
                        등록된 고객이 없습니다
                      </Text>
                    ) : canSelectClient ? (
                      <Pressable
                        style={[
                          styles.selectButton,
                          {
                            backgroundColor: isDark ? '#374151' : '#F3F4F6',
                            borderColor: isDark ? '#4B5563' : '#E5E7EB',
                          },
                        ]}
                        onPress={onOpenClientPicker}
                      >
                        <Text style={[styles.selectButtonText, { color: theme.text }]}>
                          {selectedClient
                            ? `${selectedClient.clientName} - ${selectedClient.catName}`
                            : '고객을 선택하세요'}
                        </Text>
                        <Text style={{ color: theme.icon }}>▼</Text>
                      </Pressable>
                    ) : (
                      <View
                        style={[
                          styles.selectButton,
                          {
                            backgroundColor: isDark ? '#374151' : '#F3F4F6',
                            borderColor: isDark ? '#4B5563' : '#E5E7EB',
                          },
                        ]}
                      >
                        <Text style={[styles.selectButtonText, { color: theme.text }]}>
                          {selectedClient
                            ? `${selectedClient.clientName} - ${selectedClient.catName}`
                            : '고객 정보 없음'}
                        </Text>
                      </View>
                    )}

                    {canCreateClient && (
                      <Pressable style={styles.linkButton} onPress={onOpenClientCreate}>
                        <Text style={[styles.linkText, { color: theme.tint }]}>
                          + 고객 추가
                        </Text>
                      </Pressable>
                    )}
                  </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>문의 경로</Text>
                  <Pressable
                    style={[
                      styles.selectButton,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                      },
                    ]}
                    onPress={onOpenContactMethodPicker}
                  >
                    <Text style={[styles.selectButtonText, { color: theme.text }]}>
                      {contactMethod ?? '문의 경로를 선택하세요'}
                    </Text>
                    <Text style={{ color: theme.icon }}>▼</Text>
                  </Pressable>
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>예약 날짜</Text>
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
                      {formatDate(bookingDate)}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>예약 시간</Text>
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
                      {formatTime(bookingDate)}
                    </Text>
                  </Pressable>
                </View>

                  <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.icon }]}>예상 금액</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                        color: theme.text,
                      },
                    ]}
                    value={expectedAmount}
                    onChangeText={onChangeExpectedAmount}
                    placeholder="예상 금액 (원)"
                    placeholderTextColor={theme.icon}
                    keyboardType="numeric"
                  />
                  </View>

                  <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.icon }]}>결제 금액</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                        color: theme.text,
                      },
                    ]}
                    value={amount}
                    onChangeText={onChangeAmount}
                    placeholder="결제 금액 (원)"
                    placeholderTextColor={theme.icon}
                      keyboardType="numeric"
                    />
                  </View>

                  {onChangeEntryNote && (
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
                        value={entryNote ?? ''}
                        onChangeText={onChangeEntryNote}
                        placeholder="메모"
                        placeholderTextColor={theme.icon}
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  )}
                </ScrollView>

              <Pressable
                style={[
                  styles.saveButton,
                  { backgroundColor: theme.tint },
                  isSaving && { opacity: 0.6 },
                ]}
                onPress={onSave}
                disabled={isSaving || !selectedClient}
              >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>{saveText}</Text>
                  )}
                </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}
