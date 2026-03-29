import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { styles } from '@/components/add-care-modal.styles';
import { DateTimePickerModal } from '@/components/date-time-picker-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SittingBooking } from '@/lib/sitting-api';
import { useSitting } from '@/providers/sitting-provider';

type Props = {
  visible: boolean;
  onClose: () => void;
  booking: SittingBooking | null;
};

export function BulkCareCreateModal({ visible, onClose, booking }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const { bulkCreateCares } = useSitting();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [careTime, setCareTime] = useState(() => {
    const d = new Date();
    d.setHours(18, 0, 0, 0);
    return d;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleClose = useCallback(() => {
    setStartDate(new Date());
    setEndDate(new Date());
    const d = new Date();
    d.setHours(18, 0, 0, 0);
    setCareTime(d);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowTimePicker(false);
    onClose();
  }, [onClose]);

  const handleSave = useCallback(async () => {
    if (!booking) return;

    // 날짜 검증: 시작일 <= 종료일
    const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    if (startOnly > endOnly) {
      Alert.alert('알림', '시작일은 종료일보다 이전이어야 합니다.');
      return;
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const startDateKst = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
    const endDateKst = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
    const careTimeKst = `${pad(careTime.getHours())}:${pad(careTime.getMinutes())}`;

    try {
      setIsSaving(true);
      const created = await bulkCreateCares(booking.id, {
        startDateKst,
        endDateKst,
        careTimeKst,
      });
      handleClose();
      Alert.alert('완료', `${created.length}건의 돌봄이 등록되었습니다.`);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || '알 수 없는 오류';
      Alert.alert('오류', `돌봄 일괄 등록에 실패했습니다.\n${message}`);
    } finally {
      setIsSaving(false);
    }
  }, [booking, startDate, endDate, careTime, bulkCreateCares, handleClose]);

  const handleStartDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowStartDatePicker(false);
    if (date) {
      const newDate = new Date(startDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setStartDate(newDate);
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowEndDatePicker(false);
    if (date) {
      const newDate = new Date(endDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setEndDate(newDate);
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (date) {
      const newDate = new Date(careTime);
      newDate.setHours(date.getHours(), date.getMinutes());
      setCareTime(newDate);
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <View
            style={[
              styles.content,
              { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* 헤더 */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>돌봄 한번에 등록</Text>
                <Pressable onPress={handleClose}>
                  <Text style={[styles.closeButton, { color: theme.tint }]}>취소</Text>
                </Pressable>
              </View>

              <ScrollView
                style={styles.form}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
              >
                {/* 예약 정보 */}
                {booking && (
                  <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.icon }]}>예약</Text>
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
                        {booking.client?.clientName ?? '고객 미지정'} · {booking.catName}
                      </Text>
                    </View>
                  </View>
                )}

                {/* 시작일 */}
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>시작일</Text>
                  <Pressable
                    style={[
                      styles.selectButton,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                      },
                    ]}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={[styles.selectButtonText, { color: theme.text }]}>
                      {formatDate(startDate)}
                    </Text>
                  </Pressable>
                </View>

                {/* 종료일 */}
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>종료일</Text>
                  <Pressable
                    style={[
                      styles.selectButton,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                      },
                    ]}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={[styles.selectButtonText, { color: theme.text }]}>
                      {formatDate(endDate)}
                    </Text>
                  </Pressable>
                </View>

                {/* 돌봄 시간 */}
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.icon }]}>돌봄 시간</Text>
                  <Pressable
                    style={[
                      styles.selectButton,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                      },
                    ]}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={[styles.selectButtonText, { color: theme.text }]}>
                      {formatTime(careTime)}
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>

              {/* 저장 버튼 */}
              <View style={styles.actionRow}>
                <Pressable
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.tint },
                    isSaving && { opacity: 0.6 },
                  ]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>저장</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </View>
        </Pressable>

        <DateTimePickerModal
          visible={showStartDatePicker}
          title="시작일 선택"
          value={startDate}
          mode="date"
          onChange={handleStartDateChange}
          onClose={() => setShowStartDatePicker(false)}
          isDark={isDark}
          theme={theme}
        />

        <DateTimePickerModal
          visible={showEndDatePicker}
          title="종료일 선택"
          value={endDate}
          mode="date"
          onChange={handleEndDateChange}
          onClose={() => setShowEndDatePicker(false)}
          isDark={isDark}
          theme={theme}
        />

        <DateTimePickerModal
          visible={showTimePicker}
          title="돌봄 시간 선택"
          value={careTime}
          mode="time"
          onChange={handleTimeChange}
          onClose={() => setShowTimePicker(false)}
          isDark={isDark}
          theme={theme}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}
