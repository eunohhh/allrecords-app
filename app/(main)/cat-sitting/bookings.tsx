import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingCreateModal } from '@/components/booking-create-modal';
import { ClientCreateModal } from '@/components/client-create-modal';
import { ClientPickerModal } from '@/components/client-picker-modal';
import { ContactMethodPickerModal } from '@/components/contact-method-picker-modal';
import { DateTimePickerModal } from '@/components/date-time-picker-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';
import {
  createBooking,
  createClient,
  getBookings,
  getClients,
  type SittingBooking,
  type SittingClient,
} from '@/lib/sitting-api';
import { IconSymbol } from '@/components/ui/icon-symbol';

const contactMethodOptions = ['카톡', '숨고', '기타'];

export default function BookingListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const { accessToken } = useAuth();

  const [bookings, setBookings] = useState<SittingBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const [clients, setClients] = useState<SittingClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<SittingClient | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date());
  const [clientName, setClientName] = useState('');
  const [clientCatName, setClientCatName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEntryNote, setClientEntryNote] = useState('');
  const [clientRequirements, setClientRequirements] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [amount, setAmount] = useState('');
  const [contactMethod, setContactMethod] = useState<string | null>('카톡');
  const [isSavingBooking, setIsSavingBooking] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [showBookingCreateModal, setShowBookingCreateModal] = useState(false);
  const [showClientCreateModal, setShowClientCreateModal] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showContactMethodPicker, setShowContactMethodPicker] = useState(false);
  const [showBookingDatePicker, setShowBookingDatePicker] = useState(false);
  const [showBookingTimePicker, setShowBookingTimePicker] = useState(false);
  const [pendingBookingOpen, setPendingBookingOpen] = useState(false);

  const loadBookings = useCallback(async () => {
    if (!accessToken) return [];
    try {
      setIsLoadingBookings(true);
      const data = await getBookings(accessToken, { status: 'CONFIRMED' });
      setBookings(data);
      return data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || '알 수 없는 오류';
      Alert.alert('오류', `예약 목록을 불러올 수 없습니다.\n${message}`);
      console.error('loadBookings error:', error?.response?.data || error);
      return [];
    } finally {
      setIsLoadingBookings(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const loadClients = useCallback(async () => {
    if (!accessToken) return [];
    try {
      setIsLoadingClients(true);
      const data = await getClients(accessToken);
      setClients(data);
      if (data.length > 0) {
        setSelectedClient((prev) => {
          if (prev && data.some((client) => client.id === prev.id)) {
            return prev;
          }
          return data[0];
        });
      } else {
        setSelectedClient(null);
      }
      return data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || '알 수 없는 오류';
      Alert.alert('오류', `고객 목록을 불러올 수 없습니다.\n${message}`);
      console.error('loadClients error:', error?.response?.data || error);
      return [];
    } finally {
      setIsLoadingClients(false);
    }
  }, [accessToken]);

  const handleOpenBookingCreate = useCallback(async () => {
    setBookingDate(new Date());
    const data = await loadClients();
    if (data.length === 0) {
      setPendingBookingOpen(true);
      setShowClientCreateModal(true);
      return;
    }
    setShowBookingCreateModal(true);
  }, [loadClients]);

  const handleOpenClientCreate = useCallback(() => {
    setPendingBookingOpen(true);
    setShowBookingCreateModal(false);
    setShowClientCreateModal(true);
  }, []);

  const handleOpenClientPickerFromBookingCreate = useCallback(() => {
    setPendingBookingOpen(true);
    setShowBookingCreateModal(false);
    setShowClientPicker(true);
  }, []);

  const handleCloseClientPicker = useCallback(() => {
    setShowClientPicker(false);
    if (pendingBookingOpen) {
      setShowBookingCreateModal(true);
      setPendingBookingOpen(false);
    }
  }, [pendingBookingOpen]);

  const handleOpenContactMethodPicker = useCallback(() => {
    setPendingBookingOpen(true);
    setShowBookingCreateModal(false);
    setShowContactMethodPicker(true);
  }, []);

  const handleCloseContactMethodPicker = useCallback(() => {
    setShowContactMethodPicker(false);
    if (pendingBookingOpen) {
      setShowBookingCreateModal(true);
      setPendingBookingOpen(false);
    }
  }, [pendingBookingOpen]);

  const handleOpenBookingDatePicker = useCallback(() => {
    setPendingBookingOpen(true);
    setShowBookingCreateModal(false);
    setShowBookingDatePicker(true);
  }, []);

  const handleCloseBookingDatePicker = useCallback(() => {
    setShowBookingDatePicker(false);
    if (pendingBookingOpen) {
      setShowBookingCreateModal(true);
      setPendingBookingOpen(false);
    }
  }, [pendingBookingOpen]);

  const handleOpenBookingTimePicker = useCallback(() => {
    setPendingBookingOpen(true);
    setShowBookingCreateModal(false);
    setShowBookingTimePicker(true);
  }, []);

  const handleCloseBookingTimePicker = useCallback(() => {
    setShowBookingTimePicker(false);
    if (pendingBookingOpen) {
      setShowBookingCreateModal(true);
      setPendingBookingOpen(false);
    }
  }, [pendingBookingOpen]);

  const handleCloseClientModal = useCallback(() => {
    setShowClientCreateModal(false);
    setPendingBookingOpen(false);
  }, []);

  const handleCreateClient = useCallback(async () => {
    if (!accessToken) return;
    if (!clientName.trim()) {
      Alert.alert('알림', '고객 이름을 입력해주세요.');
      return;
    }
    if (!clientCatName.trim()) {
      Alert.alert('알림', '고양이 이름을 입력해주세요.');
      return;
    }
    if (!clientAddress.trim()) {
      Alert.alert('알림', '주소를 입력해주세요.');
      return;
    }

    try {
      setIsSavingClient(true);
      const created = await createClient(accessToken, {
        clientName: clientName.trim(),
        catName: clientCatName.trim(),
        address: clientAddress.trim(),
        entryNote: clientEntryNote.trim() || undefined,
        requirements: clientRequirements.trim() || undefined,
      });

      const updated = await loadClients();
      const matched = updated.find((client) => client.id === created.id);
      setSelectedClient(matched ?? created);
      setClientName('');
      setClientCatName('');
      setClientAddress('');
      setClientEntryNote('');
      setClientRequirements('');
      setShowClientCreateModal(false);
      Alert.alert('완료', '고객이 추가되었습니다.');
      if (pendingBookingOpen) {
        setShowBookingCreateModal(true);
        setPendingBookingOpen(false);
      }
    } catch (error) {
      Alert.alert('오류', '고객 추가에 실패했습니다.');
    } finally {
      setIsSavingClient(false);
    }
  }, [
    accessToken,
    clientName,
    clientCatName,
    clientAddress,
    clientEntryNote,
    clientRequirements,
    pendingBookingOpen,
    loadClients,
  ]);

  const handleCreateBooking = useCallback(async () => {
    if (!accessToken) return;
    if (!selectedClient) {
      Alert.alert('알림', '고객을 선택해주세요.');
      return;
    }

    if (!expectedAmount.trim()) {
      Alert.alert('알림', '예상 금액을 입력해주세요.');
      return;
    }
    if (!amount.trim()) {
      Alert.alert('알림', '결제 금액을 입력해주세요.');
      return;
    }

    const expectedValue = Number(expectedAmount.replace(/,/g, '').trim());
    const amountValue = Number(amount.replace(/,/g, '').trim());

    if (!Number.isFinite(expectedValue) || expectedValue < 0) {
      Alert.alert('알림', '예상 금액을 숫자로 입력해주세요.');
      return;
    }
    if (!Number.isInteger(expectedValue)) {
      Alert.alert('알림', '예상 금액은 정수로 입력해주세요.');
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue < 0) {
      Alert.alert('알림', '결제 금액을 숫자로 입력해주세요.');
      return;
    }
    if (!Number.isInteger(amountValue)) {
      Alert.alert('알림', '결제 금액은 정수로 입력해주세요.');
      return;
    }

    try {
      setIsSavingBooking(true);
      // KST 형식으로 변환: "2026-01-25T14:30:00"
      const kstDate = new Date(bookingDate.getTime() + 9 * 60 * 60 * 1000);
      const reservationKst = kstDate.toISOString().slice(0, 19);

      await createBooking(accessToken, {
        clientId: selectedClient.id,
        reservationKst,
        expectedAmount: expectedValue,
        amount: amountValue,
        contactMethod: contactMethod ?? undefined,
      });

      await loadBookings();
      setExpectedAmount('');
      setAmount('');
      setShowBookingCreateModal(false);
      setShowBookingDatePicker(false);
      setShowBookingTimePicker(false);
      setPendingBookingOpen(false);
      Alert.alert('완료', '예약이 추가되었습니다.');
    } catch (error) {
      Alert.alert('오류', '예약 추가에 실패했습니다.');
    } finally {
      setIsSavingBooking(false);
    }
  }, [
    accessToken,
    selectedClient,
    expectedAmount,
    amount,
    contactMethod,
    bookingDate,
    loadBookings,
  ]);

  const handleBookingDateChange = (event: any, date?: Date) => {
    if (date) {
      const newDate = new Date(bookingDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setBookingDate(newDate);
    }
  };

  const handleBookingTimeChange = (event: any, date?: Date) => {
    if (date) {
      const newDate = new Date(bookingDate);
      newDate.setHours(date.getHours(), date.getMinutes());
      setBookingDate(newDate);
    }
  };

  const handleOpenDrawer = useCallback(() => {
    const drawer = navigation as { openDrawer?: () => void };
    drawer.openDrawer?.();
  }, [navigation]);

  const formatReservationTime = useCallback((reservationDate: string) => {
    const date = new Date(reservationDate);
    if (Number.isNaN(date.getTime())) {
      return reservationDate;
    }
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  }, []);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const bookingEmpty = useMemo(() => !isLoadingBookings && bookings.length === 0, [
    isLoadingBookings,
    bookings.length,
  ]);

  return (
    <SafeAreaView style={[pageStyles.safeArea, { backgroundColor: theme.background }]}>
      <View style={pageStyles.container}>
        <View style={pageStyles.header}>
          <Pressable style={pageStyles.headerSide} onPress={handleOpenDrawer}>
            <IconSymbol name="line.3.horizontal" size={24} color={theme.text} />
          </Pressable>
          <Text style={[pageStyles.title, { color: theme.text }]}>예약 목록</Text>
          <Pressable style={pageStyles.headerSide} onPress={() => router.back()}>
            <Text style={[pageStyles.headerAction, { color: theme.tint }]}>닫기</Text>
          </Pressable>
        </View>

        {isLoadingBookings && bookings.length === 0 ? (
          <View style={pageStyles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.tint} />
          </View>
        ) : (
          <ScrollView
            style={pageStyles.listContainer}
            contentContainerStyle={pageStyles.list}
            showsVerticalScrollIndicator={false}
          >
            {bookingEmpty ? (
              <Text style={[pageStyles.emptyText, { color: theme.icon }]}>
                등록된 예약이 없습니다.
              </Text>
            ) : (
              bookings.map((booking) => (
                <View
                  key={booking.id}
                  style={[
                    pageStyles.card,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : '#E5E7EB',
                    },
                  ]}
                >
                  <Text style={[pageStyles.cardTitle, { color: theme.text }]}>
                    {booking.client?.clientName ?? '고객 미지정'} · {booking.catName}
                  </Text>
                  <Text style={[pageStyles.cardSub, { color: theme.icon }]}>
                    {booking.addressSnapshot || '주소 없음'}
                  </Text>
                  <Text style={[pageStyles.cardSub, { color: theme.icon }]}>
                    {formatReservationTime(booking.reservationDate)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        <View style={pageStyles.actionRow}>
          <Pressable
            style={[
              pageStyles.primaryButton,
              { backgroundColor: theme.tint },
              isLoadingBookings && { opacity: 0.6 },
            ]}
            onPress={handleOpenBookingCreate}
            disabled={isLoadingBookings}
          >
            <Text style={pageStyles.primaryButtonText}>예약 추가</Text>
          </Pressable>
        </View>
      </View>

      <BookingCreateModal
        visible={showBookingCreateModal}
        onClose={() => setShowBookingCreateModal(false)}
        isDark={isDark}
        theme={theme}
        clients={clients}
        selectedClient={selectedClient}
        isLoadingClients={isLoadingClients}
        onOpenClientPicker={handleOpenClientPickerFromBookingCreate}
        onOpenClientCreate={handleOpenClientCreate}
        onOpenContactMethodPicker={handleOpenContactMethodPicker}
        bookingDate={bookingDate}
        onOpenDatePicker={handleOpenBookingDatePicker}
        onOpenTimePicker={handleOpenBookingTimePicker}
        contactMethod={contactMethod}
        expectedAmount={expectedAmount}
        onChangeExpectedAmount={setExpectedAmount}
        amount={amount}
        onChangeAmount={setAmount}
        isSaving={isSavingBooking}
        onSave={handleCreateBooking}
        formatDate={formatDate}
        formatTime={formatTime}
      />

      <ContactMethodPickerModal
        visible={showContactMethodPicker}
        onClose={handleCloseContactMethodPicker}
        options={contactMethodOptions}
        selected={contactMethod}
        onSelect={setContactMethod}
        theme={theme}
        isDark={isDark}
      />

      <ClientPickerModal
        visible={showClientPicker}
        onClose={handleCloseClientPicker}
        clients={clients}
        selectedClient={selectedClient}
        onSelect={setSelectedClient}
        theme={theme}
        isDark={isDark}
      />

      <ClientCreateModal
        visible={showClientCreateModal}
        onClose={handleCloseClientModal}
        isDark={isDark}
        theme={theme}
        clientName={clientName}
        onChangeClientName={setClientName}
        clientCatName={clientCatName}
        onChangeClientCatName={setClientCatName}
        clientAddress={clientAddress}
        onChangeClientAddress={setClientAddress}
        clientEntryNote={clientEntryNote}
        onChangeClientEntryNote={setClientEntryNote}
        clientRequirements={clientRequirements}
        onChangeClientRequirements={setClientRequirements}
        isSaving={isSavingClient}
        onSave={handleCreateClient}
      />

      <DateTimePickerModal
        visible={showBookingDatePicker}
        title="예약 날짜"
        value={bookingDate}
        mode="date"
        onChange={handleBookingDateChange}
        onClose={handleCloseBookingDatePicker}
        isDark={isDark}
        theme={theme}
      />

      <DateTimePickerModal
        visible={showBookingTimePicker}
        title="예약 시간"
        value={bookingDate}
        mode="time"
        onChange={handleBookingTimeChange}
        onClose={handleCloseBookingTimePicker}
        isDark={isDark}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const pageStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerAction: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    marginLeft: 36,
  },
  headerSide: {
    width: 64,
  },
  list: {
    paddingBottom: 24,
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSub: {
    fontSize: 13,
    marginTop: 6,
  },
  actionRow: {
    paddingTop: 8,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
