import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';
import { useSitting } from '@/providers/sitting-provider';
import { BookingCreateModal } from '@/components/booking-create-modal';
import { BookingPickerModal } from '@/components/booking-picker-modal';
import { ClientCreateModal } from '@/components/client-create-modal';
import { ClientPickerModal } from '@/components/client-picker-modal';
import { ContactMethodPickerModal } from '@/components/contact-method-picker-modal';
import { DateTimePickerModal } from '@/components/date-time-picker-modal';
import { styles } from '@/components/add-care-modal.styles';
import {
  createBooking,
  createClient,
  getBookings,
  getClients,
  type SittingBooking,
  type SittingClient,
} from '@/lib/sitting-api';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialDate?: Date;
};

const contactMethodOptions = ['카톡', '숨고', '기타'];

export function AddCareModal({ visible, onClose, initialDate }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const { accessToken } = useAuth();
  const { createCare, fetchCaresForMonth } = useSitting();

  const [bookings, setBookings] = useState<SittingBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<SittingBooking | null>(null);
  const [clients, setClients] = useState<SittingClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<SittingClient | null>(null);
  const [careDate, setCareDate] = useState(initialDate ?? new Date());
  const [bookingDate, setBookingDate] = useState(initialDate ?? new Date());
  const [note, setNote] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCatName, setClientCatName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEntryNote, setClientEntryNote] = useState('');
  const [clientRequirements, setClientRequirements] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [amount, setAmount] = useState('');
  const [contactMethod, setContactMethod] = useState<string | null>('카톡');
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBooking, setIsSavingBooking] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showBookingPicker, setShowBookingPicker] = useState(false);
  const [showBookingCreateModal, setShowBookingCreateModal] = useState(false);
  const [showClientCreateModal, setShowClientCreateModal] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showContactMethodPicker, setShowContactMethodPicker] = useState(false);
  const [showBookingDatePicker, setShowBookingDatePicker] = useState(false);
  const [showBookingTimePicker, setShowBookingTimePicker] = useState(false);
  const [pendingBookingOpen, setPendingBookingOpen] = useState(false);


  // 초기 날짜 설정
  useEffect(() => {
    if (initialDate) {
      setCareDate(initialDate);
      setBookingDate(initialDate);
    }
  }, [initialDate]);

  const loadBookings = useCallback(async () => {
    if (!accessToken) return [];
    try {
      setIsLoadingBookings(true);
      const data = await getBookings(accessToken, { status: 'CONFIRMED' });
      setBookings(data);
      if (data.length > 0) {
        setSelectedBooking((prev) => {
          if (prev && data.some((booking) => booking.id === prev.id)) {
            return prev;
          }
          return data[0];
        });
      } else {
        setSelectedBooking(null);
      }
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

  // Booking 목록 가져오기
  useEffect(() => {
    if (visible && accessToken) {
      loadBookings();
    }
  }, [visible, accessToken, loadBookings]);

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
    Keyboard.dismiss();
    setBookingDate(careDate);
    const data = await loadClients();
    if (data.length === 0) {
      setPendingBookingOpen(true);
      setShowClientCreateModal(true);
      return;
    }
    setShowBookingCreateModal(true);
  }, [careDate, loadClients]);

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

      const created = await createBooking(accessToken, {
        clientId: selectedClient.id,
        reservationKst,
        expectedAmount: expectedValue,
        amount: amountValue,
        contactMethod: contactMethod ?? undefined,
      });

      const updated = await loadBookings();
      const matched = updated.find((booking) => booking.id === created.id);
      setSelectedBooking(matched ?? updated[0] ?? null);
      setShowBookingCreateModal(false);
      setShowBookingDatePicker(false);
      setShowBookingTimePicker(false);
      setExpectedAmount('');
      setAmount('');
      setContactMethod('카톡');
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

  const handleSave = useCallback(async () => {
    if (!selectedBooking) {
      Alert.alert('알림', '예약을 선택해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      // KST 형식으로 변환: "2026-01-25T14:30:00"
      const kstDate = new Date(careDate.getTime() + 9 * 60 * 60 * 1000);
      const careTimeKst = kstDate.toISOString().slice(0, 19);

      await createCare({
        bookingId: selectedBooking.id,
        careTimeKst,
        note: note.trim() || undefined,
      });

      await fetchCaresForMonth();
      handleClose();
      Alert.alert('완료', '케어가 추가되었습니다.');
    } catch (error) {
      Alert.alert('오류', '케어 추가에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedBooking, careDate, note, createCare, fetchCaresForMonth]);

  const handleClose = useCallback(() => {
    setBookings([]);
    setClients([]);
    setSelectedBooking(null);
    setSelectedClient(null);
    setCareDate(new Date());
    setBookingDate(new Date());
    setNote('');
    setClientName('');
    setClientCatName('');
    setClientAddress('');
    setClientEntryNote('');
    setClientRequirements('');
    setExpectedAmount('');
    setAmount('');
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowBookingPicker(false);
    setShowBookingCreateModal(false);
    setShowClientCreateModal(false);
    setShowClientPicker(false);
    setShowContactMethodPicker(false);
    setShowBookingDatePicker(false);
    setShowBookingTimePicker(false);
    setPendingBookingOpen(false);
    onClose();
  }, [onClose]);

  const handleGoToBookingList = useCallback(() => {
    handleClose();
    router.push('/cat-sitting/bookings');
  }, [handleClose, router]);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      const newDate = new Date(careDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setCareDate(newDate);
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      const newDate = new Date(careDate);
      newDate.setHours(date.getHours(), date.getMinutes());
      setCareDate(newDate);
    }
  };

  const handleBookingDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowBookingDatePicker(false);
    }
    if (date) {
      const newDate = new Date(bookingDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setBookingDate(newDate);
    }
  };

  const handleBookingTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowBookingTimePicker(false);
    }
    if (date) {
      const newDate = new Date(bookingDate);
      newDate.setHours(date.getHours(), date.getMinutes());
      setBookingDate(newDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
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
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                Keyboard.dismiss();
              }}
            >
              {/* 헤더 */}
              <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>케어 추가</Text>
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
              {/* 예약 선택 */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.icon }]}>예약 선택</Text>
                {isLoadingBookings ? (
                  <ActivityIndicator size="small" color={theme.tint} />
                ) : bookings.length === 0 ? (
                  <Text style={[styles.emptyText, { color: theme.icon }]}>
                    진행중인 예약이 없습니다
                  </Text>
                ) : (
                  <Pressable
                    style={[
                      styles.selectButton,
                      {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        borderColor: isDark ? '#4B5563' : '#E5E7EB',
                      },
                    ]}
                    onPress={() => setShowBookingPicker(true)}
                  >
                    <Text style={[styles.selectButtonText, { color: theme.text }]}>
                      {selectedBooking
                        ? `${selectedBooking.client?.clientName} - ${selectedBooking.catName}`
                        : '예약을 선택하세요'}
                    </Text>
                    <Text style={{ color: theme.icon }}>▼</Text>
                  </Pressable>
                )}
              </View>

              {/* 날짜 선택 */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.icon }]}>날짜</Text>
                <Pressable
                  style={[
                    styles.selectButton,
                    {
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      borderColor: isDark ? '#4B5563' : '#E5E7EB',
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.selectButtonText, { color: theme.text }]}>
                    {formatDate(careDate)}
                  </Text>
                </Pressable>
              </View>

              {/* 시간 선택 */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.icon }]}>시간</Text>
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
                    {formatTime(careDate)}
                  </Text>
                </Pressable>
              </View>

              {/* 메모 */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.icon }]}>메모 (선택)</Text>
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
                  onChangeText={setNote}
                  placeholder="메모를 입력하세요"
                  placeholderTextColor={theme.icon}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            {/* 저장/예약 추가 버튼 */}
            <View style={styles.actionRow}>
              <Pressable
                style={[
                  styles.actionButton,
                  styles.secondaryButton,
                  {
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: isDark ? '#4B5563' : '#E5E7EB',
                  },
                  isLoadingBookings && { opacity: 0.6 },
                ]}
                onPress={handleGoToBookingList}
                disabled={isLoadingBookings}
              >
                {isLoadingBookings ? (
                  <ActivityIndicator size="small" color={theme.tint} />
                ) : (
                  <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                    예약 추가
                  </Text>
                )}
              </Pressable>
              <View style={styles.actionSpacer} />
              <Pressable
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.tint },
                  (isSaving || !selectedBooking) && { opacity: 0.6 },
                ]}
                onPress={handleSave}
                disabled={isSaving || !selectedBooking}
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

      <BookingPickerModal
        visible={showBookingPicker}
        onClose={() => setShowBookingPicker(false)}
        bookings={bookings}
        selectedBooking={selectedBooking}
        onSelect={setSelectedBooking}
        theme={theme}
        isDark={isDark}
      />

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

      <DateTimePickerModal
        visible={showDatePicker}
        title="날짜 선택"
        value={careDate}
        mode="date"
        onChange={handleDateChange}
        onClose={() => setShowDatePicker(false)}
        isDark={isDark}
        theme={theme}
      />

      <DateTimePickerModal
        visible={showTimePicker}
        title="시간 선택"
        value={careDate}
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
