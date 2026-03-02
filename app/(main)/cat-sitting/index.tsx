import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar, type DateData, LocaleConfig } from 'react-native-calendars';

import { AddCareModal } from '@/components/add-care-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SittingCare } from '@/lib/sitting-api';
import { useAuth } from '@/providers/auth-provider';
import { useSitting } from '@/providers/sitting-provider';

// 한국어 로케일 설정
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  monthNamesShort: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const MAX_VISIBLE_CARES = 3;

// 연도 범위
const START_YEAR = 2024;
const FUTURE_YEARS = 5;
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function CatSittingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();

  const { cares, isLoading, fetchCaresForMonth, toggleComplete, selectedMonth, setSelectedMonth } =
    useSitting();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [yearMonthPickerVisible, setYearMonthPickerVisible] = useState(false);
  const [addCareModalVisible, setAddCareModalVisible] = useState(false);

  // 연도 목록 생성
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const endYear = currentYear + FUTURE_YEARS;
    const result: number[] = [];
    for (let i = START_YEAR; i <= endYear; i++) {
      result.push(i);
    }
    return result;
  }, []);

  const yearScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchCaresForMonth();
  }, [fetchCaresForMonth]);

  const formatDateKey = useCallback((dateTime: string) => {
    const localDate = new Date(dateTime).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul',
    });
    return localDate.replace(/\. /g, '-').replace('.', '');
  }, []);

  // 날짜별로 care 그룹핑
  const caresByDate = React.useMemo(() => {
    const grouped: Record<string, SittingCare[]> = {};
    for (const care of cares) {
      const dateKey = formatDateKey(care.careTime);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(care);
    }
    // 각 날짜별로 시간순 정렬
    for (const key of Object.keys(grouped)) {
      grouped[key].sort(
        (a, b) => new Date(a.careTime).getTime() - new Date(b.careTime).getTime(),
      );
    }
    return grouped;
  }, [cares, formatDateKey]);

  // 마킹 데이터 생성
  const markedDates = React.useMemo(() => {
    const marks: Record<string, { dots: { key: string; color: string }[] }> = {};
    for (const [date, carelist] of Object.entries(caresByDate)) {
      const dots = carelist.slice(0, 4).map((care, idx) => ({
        key: `${care.id}-${idx}`,
        color: care.completedAt ? '#9CA3AF' : '#38BDF8', // gray-400 / sky-400
      }));
      marks[date] = { dots };
    }
    return marks;
  }, [caresByDate]);

  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      const dayCares = caresByDate[day.dateString] || [];
      if (dayCares.length === 0) return;

      if (dayCares.length > MAX_VISIBLE_CARES) {
        setSelectedDate(day.dateString);
        setModalVisible(true);
      } else {
        // 3개 이하면 첫번째 care로 바로 이동
        setSelectedDate(day.dateString);
        setModalVisible(true);
      }
    },
    [caresByDate],
  );

  const handleMonthChange = useCallback(
    (month: { year: number; month: number }) => {
      const newDate = new Date(month.year, month.month - 1, 1);
      setSelectedMonth(newDate);
      fetchCaresForMonth(newDate);
    },
    [setSelectedMonth, fetchCaresForMonth],
  );

  const handleYearMonthSelect = useCallback(
    (year: number, month: number) => {
      const newDate = new Date(year, month - 1, 1);
      setSelectedMonth(newDate);
      fetchCaresForMonth(newDate);
      setYearMonthPickerVisible(false);
    },
    [setSelectedMonth, fetchCaresForMonth],
  );

  // 연/월 선택 모달이 열릴 때 현재 연도로 스크롤
  useEffect(() => {
    if (yearMonthPickerVisible && yearScrollRef.current) {
      const selectedYear = selectedMonth.getFullYear();
      const yearIndex = years.indexOf(selectedYear);
      if (yearIndex >= 0) {
        const itemHeight = 48; // pickerItem paddingVertical(12)*2 + marginBottom(4) + text height
        const scrollViewHeight = 250; // pickerScroll maxHeight
        const offset = Math.max(0, yearIndex * itemHeight - scrollViewHeight / 2 + itemHeight / 2);
        setTimeout(() => {
          yearScrollRef.current?.scrollTo({ y: offset, animated: false });
        }, 50);
      }
    }
  }, [yearMonthPickerVisible, selectedMonth, years]);

  // 커스텀 헤더 렌더링
  const renderCustomHeader = useCallback(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1;

    return (
      <View style={styles.customHeader} pointerEvents="box-none">
        <Pressable
          style={styles.customHeaderButton}
          onPress={() => setYearMonthPickerVisible(true)}
          hitSlop={8}
        >
          <Text style={[styles.headerText, { color: theme.text }]}>
            {year}년 {month}월
          </Text>
          <Text style={[styles.headerChevron, { color: theme.icon }]}>▼</Text>
        </Pressable>
      </View>
    );
  }, [selectedMonth, theme]);

  const handleArrowMonthChange = useCallback(
    (direction: 'prev' | 'next') => {
      const offset = direction === 'prev' ? -1 : 1;
      const newDate = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() + offset,
        1,
      );
      setSelectedMonth(newDate);
      fetchCaresForMonth(newDate);
    },
    [selectedMonth, setSelectedMonth, fetchCaresForMonth],
  );

  const handleCarePress = useCallback(
    (careId: string) => {
      setModalVisible(false);
      router.push(`/cat-sitting/care/${careId}` as any);
    },
    [router],
  );

  const handleToggleComplete = useCallback(
    async (careId: string) => {
      await toggleComplete(careId);
    },
    [toggleComplete],
  );

  const formatCareTime = (careTime: string) => {
    const date = new Date(careTime);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    });
  };

  const selectedDateCares = selectedDate ? caresByDate[selectedDate] || [] : [];

  const currentMonthKey = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = String(selectedMonth.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }, [selectedMonth]);

  // 커스텀 Day 컴포넌트
  const renderDay = useCallback(
    ({ date, state }: { date?: DateData; state?: string }) => {
      if (!date) return null;
      const dayCares = caresByDate[date.dateString] || [];
      const isToday = date.dateString === new Date().toISOString().split('T')[0];
      const isDisabled = state === 'disabled';

      return (
        <Pressable
          onPress={() => handleDayPress({ dateString: date.dateString })}
          style={[
            styles.dayContainer,
            isToday && { backgroundColor: theme.tint + '20' },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              { color: isDisabled ? theme.icon : theme.text },
              isToday && { color: theme.tint, fontWeight: '600' },
            ]}
          >
            {date.day}
          </Text>
          <View style={styles.caresPreview}>
            {dayCares.slice(0, MAX_VISIBLE_CARES).map((care) => (
              <View
                key={care.id}
                style={[
                  styles.careDot,
                  { backgroundColor: care.completedAt ? '#9CA3AF' : '#38BDF8' },
                ]}
              />
            ))}
            {dayCares.length > MAX_VISIBLE_CARES && (
              <Text style={[styles.moreText, { color: theme.icon }]}>
                +{dayCares.length - MAX_VISIBLE_CARES}
              </Text>
            )}
          </View>
        </Pressable>
      );
    },
    [caresByDate, handleDayPress, theme],
  );

  if (isLoading && cares.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Calendar
        key={currentMonthKey}
        current={currentMonthKey}
        onMonthChange={handleMonthChange}
        onPressArrowLeft={() => handleArrowMonthChange('prev')}
        onPressArrowRight={() => handleArrowMonthChange('next')}
        markingType="multi-dot"
        markedDates={markedDates}
        dayComponent={renderDay}
        renderHeader={renderCustomHeader}
        theme={{
          backgroundColor: theme.background,
          calendarBackground: theme.background,
          textSectionTitleColor: theme.text,
          monthTextColor: theme.text,
          arrowColor: theme.tint,
          todayTextColor: theme.tint,
          dayTextColor: theme.text,
          textDisabledColor: theme.icon,
        }}
        style={styles.calendar}
      />

      {user?.role === 'admin' && (
        <View style={styles.adminButtonRow}>
          <Pressable
            style={[
              styles.adminButton,
              {
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderColor: isDark ? '#374151' : '#E5E7EB',
              },
            ]}
            onPress={() => router.push('/cat-sitting/admin')}
          >
            <Text style={[styles.adminButtonText, { color: theme.text }]}>관리자</Text>
          </Pressable>
        </View>
      )}

      {/* 일별 상세 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {selectedDate}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Text style={[styles.closeButton, { color: theme.tint }]}>닫기</Text>
                </Pressable>
              </View>

              <ScrollView style={styles.careList}>
                {selectedDateCares.map((care) => (
                  <Pressable
                    key={care.id}
                    style={[
                      styles.careItem,
                      {
                        backgroundColor: care.completedAt
                          ? isDark
                            ? '#374151'
                            : '#F3F4F6'
                          : isDark
                            ? '#0C4A6E'
                            : '#E0F2FE',
                      },
                    ]}
                    onPress={() => handleCarePress(care.id)}
                  >
                    <View style={styles.careInfo}>
                      <Text
                        style={[
                          styles.careTime,
                          { color: care.completedAt ? theme.icon : theme.text },
                        ]}
                      >
                        {formatCareTime(care.careTime)}
                      </Text>
                      <Text
                        style={[
                          styles.careCatName,
                          { color: care.completedAt ? theme.icon : theme.text },
                        ]}
                        numberOfLines={1}
                      >
                        {care.booking?.catName || care.booking?.client?.catName}
                      </Text>
                      {care.note && (
                        <Text
                          style={[styles.careNote, { color: theme.icon }]}
                          numberOfLines={1}
                        >
                          {care.note}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      style={[
                        styles.completeButton,
                        {
                          backgroundColor: care.completedAt ? theme.tint : 'transparent',
                          borderColor: theme.tint,
                        },
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(care.id);
                      }}
                    >
                      <Text
                        style={{
                          color: care.completedAt ? '#FFFFFF' : theme.tint,
                          fontSize: 12,
                        }}
                      >
                        {care.completedAt ? '완료' : '미완료'}
                      </Text>
                    </Pressable>
                  </Pressable>
                ))}
              </ScrollView>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* 연/월 선택 모달 */}
      <Modal
        visible={yearMonthPickerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setYearMonthPickerVisible(false)}
      >
        <Pressable
          style={styles.yearMonthModalOverlay}
          onPress={() => setYearMonthPickerVisible(false)}
        >
          <View
            style={[
              styles.yearMonthPickerContent,
              { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  날짜 선택
                </Text>
                <Pressable onPress={() => setYearMonthPickerVisible(false)}>
                  <Text style={[styles.closeButton, { color: theme.tint }]}>닫기</Text>
                </Pressable>
              </View>

              <View style={styles.pickerContainer}>
                {/* 연도 선택 */}
                <View style={styles.pickerColumn}>
                  <Text style={[styles.pickerLabel, { color: theme.icon }]}>연도</Text>
                  <ScrollView
                    ref={yearScrollRef}
                    style={styles.pickerScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {years.map((year) => (
                      <Pressable
                        key={year}
                        style={[
                          styles.pickerItem,
                          year === selectedMonth.getFullYear() && {
                            backgroundColor: theme.tint + '20',
                          },
                        ]}
                        onPress={() =>
                          handleYearMonthSelect(year, selectedMonth.getMonth() + 1)
                        }
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            { color: theme.text },
                            year === selectedMonth.getFullYear() && {
                              color: theme.tint,
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {year}년
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* 월 선택 */}
                <View style={styles.pickerColumn}>
                  <Text style={[styles.pickerLabel, { color: theme.icon }]}>월</Text>
                  <ScrollView
                    style={styles.pickerScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {MONTHS.map((month) => (
                      <Pressable
                        key={month}
                        style={[
                          styles.pickerItem,
                          month === selectedMonth.getMonth() + 1 && {
                            backgroundColor: theme.tint + '20',
                          },
                        ]}
                        onPress={() =>
                          handleYearMonthSelect(selectedMonth.getFullYear(), month)
                        }
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            { color: theme.text },
                            month === selectedMonth.getMonth() + 1 && {
                              color: theme.tint,
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {month}월
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* 오늘로 이동 버튼 */}
              <Pressable
                style={[styles.todayButton, { borderColor: theme.tint }]}
                onPress={() => {
                  const today = new Date();
                  handleYearMonthSelect(today.getFullYear(), today.getMonth() + 1);
                }}
              >
                <Text style={[styles.todayButtonText, { color: theme.tint }]}>
                  오늘로 이동
                </Text>
              </Pressable>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* 케어 추가 모달 */}
      <AddCareModal
        visible={addCareModalVisible}
        onClose={() => setAddCareModalVisible(false)}
      />

      {/* 플로팅 액션 버튼 */}
      <Pressable
        style={[styles.fab, { backgroundColor: theme.tint }]}
        onPress={() => setAddCareModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    paddingBottom: 10,
  },
  adminButtonRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  adminButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dayContainer: {
    width: 44,
    height: 72,
    alignItems: 'center',
    paddingTop: 6,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
  },
  caresPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 2,
    gap: 2,
  },
  careDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreText: {
    fontSize: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  yearMonthModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  careList: {
    maxHeight: 400,
  },
  careItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  careInfo: {
    flex: 1,
  },
  careTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  careCatName: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  careNote: {
    fontSize: 12,
    marginTop: 2,
  },
  completeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  customHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerChevron: {
    fontSize: 10,
  },
  yearMonthPickerContent: {
    borderRadius: 20,
    padding: 16,
    width: '90%',
    maxHeight: '60%',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  pickerScroll: {
    maxHeight: 250,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  todayButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  todayButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
