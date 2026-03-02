import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import type { SittingBooking } from '@/lib/sitting-api';

import { styles } from './add-care-modal.styles';

type Theme = {
  text: string;
  icon: string;
  tint: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  bookings: SittingBooking[];
  selectedBooking: SittingBooking | null;
  onSelect: (booking: SittingBooking) => void;
  theme: Theme;
  isDark: boolean;
};

export function BookingPickerModal({
  visible,
  onClose,
  bookings,
  selectedBooking,
  onSelect,
  theme,
  isDark,
}: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  };

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime()
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.pickerOverlay} onPress={onClose}>
        <View
          style={[
            styles.pickerContent,
            { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>예약 선택</Text>
              <Pressable onPress={onClose}>
                <Text style={[styles.closeButton, { color: theme.tint }]}>완료</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.bookingList}>
              {sortedBookings.map((booking) => (
                <Pressable
                  key={booking.id}
                  style={[
                    styles.bookingItem,
                    {
                      backgroundColor:
                        selectedBooking?.id === booking.id
                          ? theme.tint + '20'
                          : 'transparent',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  ]}
                  onPress={() => {
                    onSelect(booking);
                    onClose();
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bookingName, { color: theme.text }]}>
                      {booking.client?.clientName}
                    </Text>
                    <Text style={[styles.bookingCat, { color: theme.icon }]}>
                      {booking.catName} · {booking.addressSnapshot}
                    </Text>
                  </View>
                  <Text style={{ color: theme.icon, fontSize: 12 }}>
                    {formatDate(booking.reservationDate)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
