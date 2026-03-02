import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { SittingBooking, SittingClient } from '@/lib/sitting-api';

import styles from '../../admin-styles';
import type { Theme } from '../../admin-types';

type BookingStatusOption = {
  value: 'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  label: string;
};

type AdminBookingsTabProps = {
  bookings: SittingBooking[];
  filteredBookings: SittingBooking[];
  bookingQuery: string;
  bookingStatusFilter: BookingStatusOption['value'];
  bookingStatusOptions: BookingStatusOption[];
  bookingClientFilter: SittingClient | null;
  isLoadingBookings: boolean;
  isDark: boolean;
  theme: Theme;
  onChangeBookingQuery: (value: string) => void;
  onChangeBookingStatus: (value: BookingStatusOption['value']) => void;
  onOpenClientPicker: () => void;
  onClearBookingClientFilter: () => void;
  onEditBooking: (booking: SittingBooking) => void;
  onCancelBooking: (booking: SittingBooking) => void;
  onOpenBookingCreate: () => void;
  formatCareTime: (value: string) => string;
};

export default function AdminBookingsTab({
  bookings,
  filteredBookings,
  bookingQuery,
  bookingStatusFilter,
  bookingStatusOptions,
  bookingClientFilter,
  isLoadingBookings,
  isDark,
  theme,
  onChangeBookingQuery,
  onChangeBookingStatus,
  onOpenClientPicker,
  onClearBookingClientFilter,
  onEditBooking,
  onCancelBooking,
  onOpenBookingCreate,
  formatCareTime,
}: AdminBookingsTabProps)  {
  return (
    <>
      {isLoadingBookings ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      ) : (
        <>
          <View style={styles.filterSection}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                  color: theme.text,
                },
              ]}
              placeholder="예약 검색 (고객/주소/메모)"
              placeholderTextColor={theme.icon}
              value={bookingQuery}
              onChangeText={onChangeBookingQuery}
            />
            <View style={styles.filterRow}>
              {bookingStatusOptions.map((option) => {
                const isActive = bookingStatusFilter === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.filterChip,
                      isActive && { backgroundColor: theme.tint, borderColor: theme.tint },
                    ]}
                    onPress={() => onChangeBookingStatus(option.value)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: isActive ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.filterRow}>
              <Pressable
                style={[
                  styles.filterChip,
                  bookingClientFilter && {
                    backgroundColor: theme.tint,
                    borderColor: theme.tint,
                  },
                ]}
                onPress={onOpenClientPicker}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: bookingClientFilter ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {bookingClientFilter
                    ? `${bookingClientFilter.clientName} (${bookingClientFilter.catName})`
                    : '고객 선택'}
                </Text>
              </Pressable>
              {bookingClientFilter && (
                <Pressable style={styles.filterClearButton} onPress={onClearBookingClientFilter}>
                  <Text style={[styles.filterClearText, { color: theme.tint }]}>초기화</Text>
                </Pressable>
              )}
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
            {filteredBookings.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.icon }]}>
                {bookings.length === 0 ? '등록된 예약이 없습니다.' : '검색 결과가 없습니다.'}
              </Text>
            ) : (
              filteredBookings.map((booking) => (
                <View
                  key={booking.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : '#E5E7EB',
                    },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    {booking.client?.clientName ?? '고객 미지정'} · {booking.catName}
                  </Text>
                  <Text style={[styles.cardSub, { color: theme.icon }]}>
                    {booking.addressSnapshot || '주소 없음'}
                  </Text>
                  <Text style={[styles.cardSub, { color: theme.icon }]}>
                    {formatCareTime(booking.reservationDate)}
                  </Text>
                  <View style={styles.cardActions}>
                    <Pressable onPress={() => onEditBooking(booking)}>
                      <Text style={[styles.actionText, { color: theme.tint }]}>수정</Text>
                    </Pressable>
                    <Pressable onPress={() => onCancelBooking(booking)}>
                      <Text style={[styles.actionText, { color: '#EF4444' }]}>삭제</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
      <Pressable
        style={[styles.primaryButton, { backgroundColor: theme.tint }]}
        onPress={onOpenBookingCreate}
      >
        <Text style={styles.primaryButtonText}>예약 추가</Text>
      </Pressable>
    </>
  );
};
