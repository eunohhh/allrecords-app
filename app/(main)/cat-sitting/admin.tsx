import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddCareModal } from '@/components/add-care-modal';
import { BookingCreateModal } from '@/components/booking-create-modal';
import { CareEditModal } from '@/components/care-edit-modal';
import { ClientCreateModal } from '@/components/client-create-modal';
import { ClientPickerModal } from '@/components/client-picker-modal';
import { ContactMethodPickerModal } from '@/components/contact-method-picker-modal';
import { DateTimePickerModal } from '@/components/date-time-picker-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import useAdminBookingState from './hooks/use-admin-booking-state';
import useAdminCareState from './hooks/use-admin-care-state';
import useAdminClientState from './hooks/use-admin-client-state';
import AdminBookingsTab from './components/admin/AdminBookingsTab';
import AdminCaresTab from './components/admin/AdminCaresTab';
import AdminClientsTab from './components/admin/AdminClientsTab';
import AdminHeader from './components/admin/AdminHeader';
import AdminTabs from './components/admin/AdminTabs';
import {
  createBooking,
  createClient,
  deleteCare,
  deleteClient,
  getBookings,
  getCaresForCalendar,
  getClients,
  updateBooking,
  updateBookingStatus,
  updateCare,
  updateClient,
  type SittingBooking,
  type SittingCare,
  type SittingClient,
} from '@/lib/sitting-api';
import { useAuth } from '@/providers/auth-provider';
import styles from './admin-styles';
import type { AdminTab } from './admin-types';
import {
  buildCalendarRange,
  formatShortDate,
  normalizeDateOnly,
  toKstEndUtc,
  toKstStartUtc,
} from './lib/admin-utils';

const contactMethodOptions = ['카톡', '숨고', '기타'];
const bookingStatusOptions: { value: 'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'; label: string }[] =
  [
    { value: 'ALL', label: '전체' },
    { value: 'CONFIRMED', label: '확정' },
    { value: 'COMPLETED', label: '완료' },
    { value: 'CANCELLED', label: '취소' },
  ];
export default function AdminScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { accessToken } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState<AdminTab>('clients');
  const {
    clients,
    setClients,
    isLoadingClients,
    setIsLoadingClients,
    clientQuery,
    setClientQuery,
    clientModalVisible,
    setClientModalVisible,
    editingClient,
    setEditingClient,
    clientName,
    setClientName,
    clientCatName,
    setClientCatName,
    clientAddress,
    setClientAddress,
    clientEntryNote,
    setClientEntryNote,
    clientRequirements,
    setClientRequirements,
    isSavingClient,
    setIsSavingClient,
    resetClientForm,
    hydrateClientForm,
  } = useAdminClientState();
  const {
    bookings,
    setBookings,
    isLoadingBookings,
    setIsLoadingBookings,
    bookingQuery,
    setBookingQuery,
    bookingStatusFilter,
    setBookingStatusFilter,
    bookingClientFilter,
    setBookingClientFilter,
    selectedClient,
    setSelectedClient,
    bookingDate,
    setBookingDate,
    expectedAmount,
    setExpectedAmount,
    amount,
    setAmount,
    contactMethod,
    setContactMethod,
    isSavingBooking,
    setIsSavingBooking,
    showBookingCreateModal,
    setShowBookingCreateModal,
    showClientCreateModal,
    setShowClientCreateModal,
    showClientPicker,
    setShowClientPicker,
    clientPickerTarget,
    setClientPickerTarget,
    editingBooking,
    setEditingBooking,
    editBookingDate,
    setEditBookingDate,
    editExpectedAmount,
    setEditExpectedAmount,
    editAmount,
    setEditAmount,
    editContactMethod,
    setEditContactMethod,
    editEntryNote,
    setEditEntryNote,
    hydrateBookingEditForm,
    isUpdatingBooking,
    setIsUpdatingBooking,
    showBookingEditModal,
    setShowBookingEditModal,
    showContactMethodPicker,
    setShowContactMethodPicker,
    contactMethodTarget,
    setContactMethodTarget,
    showBookingDatePicker,
    setShowBookingDatePicker,
    showBookingTimePicker,
    setShowBookingTimePicker,
    bookingPickerTarget,
    setBookingPickerTarget,
    pendingBookingCreateOpen,
    setPendingBookingCreateOpen,
    pendingBookingEditOpen,
    setPendingBookingEditOpen,
  } = useAdminBookingState();
  const {
    cares,
    setCares,
    isLoadingCares,
    setIsLoadingCares,
    careQuery,
    setCareQuery,
    careFilterFrom,
    setCareFilterFrom,
    careFilterTo,
    setCareFilterTo,
    showCareFilterDatePicker,
    setShowCareFilterDatePicker,
    careFilterDateTarget,
    setCareFilterDateTarget,
    careMonth,
    setCareMonth,
    showCareCreateModal,
    setShowCareCreateModal,
    showCareEditModal,
    setShowCareEditModal,
    editingCare,
    setEditingCare,
    editCareDate,
    setEditCareDate,
    editCareNote,
    setEditCareNote,
    hydrateCareEditForm,
    isUpdatingCare,
    setIsUpdatingCare,
    showCareDatePicker,
    setShowCareDatePicker,
    showCareTimePicker,
    setShowCareTimePicker,
    pendingCareEditOpen,
    setPendingCareEditOpen,
  } = useAdminCareState();

  const loadClients = useCallback(async () => {
    if (!accessToken) return [];
    try {
      setIsLoadingClients(true);
      const data = await getClients(accessToken);
      setClients(data);
      setBookingClientFilter((prev) => {
        if (!prev) return null;
        return data.some((client) => client.id === prev.id) ? prev : null;
      });
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

  const loadBookings = useCallback(
    async (params?: { clientId?: string; status?: string }) => {
      if (!accessToken) return [];
      try {
        setIsLoadingBookings(true);
        const data = await getBookings(accessToken, params);
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
    },
    [accessToken],
  );

  const loadCares = useCallback(
    async (options?: { range?: { from: Date; to: Date }; baseDate?: Date }) => {
      if (!accessToken) return [];
      const { range, baseDate } = options ?? {};
      const { from, to } = range
        ? { from: toKstStartUtc(range.from), to: toKstEndUtc(range.to) }
        : buildCalendarRange(baseDate ?? careMonth);
      try {
        setIsLoadingCares(true);
        const data = await getCaresForCalendar(
          accessToken,
          from.toISOString(),
          to.toISOString(),
        );
        setCares(data);
        return data;
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || '알 수 없는 오류';
        Alert.alert('오류', `케어 목록을 불러올 수 없습니다.\n${message}`);
        console.error('loadCares error:', error?.response?.data || error);
        return [];
      } finally {
        setIsLoadingCares(false);
      }
    },
    [accessToken, careMonth],
  );

  const bookingFilterParams = useMemo(() => {
    const params: { clientId?: string; status?: string } = {};
    if (bookingStatusFilter !== 'ALL') {
      params.status = bookingStatusFilter;
    }
    if (bookingClientFilter) {
      params.clientId = bookingClientFilter.id;
    }
    return params;
  }, [bookingStatusFilter, bookingClientFilter]);

  const normalizedCareRange = useMemo(() => {
    if (!careFilterFrom && !careFilterTo) return null;
    const from = careFilterFrom ?? careFilterTo;
    const to = careFilterTo ?? careFilterFrom;
    if (!from || !to) return null;
    return from <= to ? { from, to } : { from: to, to: from };
  }, [careFilterFrom, careFilterTo]);

  const filteredClients = useMemo(() => {
    const query = clientQuery.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) => {
      const haystack = [
        client.clientName,
        client.catName,
        client.address,
        client.entryNote ?? '',
        client.requirements ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [clients, clientQuery]);

  const filteredBookings = useMemo(() => {
    const query = bookingQuery.trim().toLowerCase();
    if (!query) return bookings;
    return bookings.filter((booking) => {
      const haystack = [
        booking.client?.clientName ?? '',
        booking.catName ?? '',
        booking.addressSnapshot ?? '',
        booking.entryNoteSnapshot ?? '',
        booking.contactMethod ?? '',
        String(booking.amount ?? ''),
        String(booking.expectedAmount ?? ''),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [bookings, bookingQuery]);

  const filteredCares = useMemo(() => {
    const query = careQuery.trim().toLowerCase();
    if (!query) return cares;
    return cares.filter((care) => {
      const haystack = [
        care.booking?.client?.clientName ?? '',
        care.booking?.catName ?? '',
        care.booking?.addressSnapshot ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [cares, careQuery]);

  const refreshBookings = useCallback(() => loadBookings(bookingFilterParams), [
    loadBookings,
    bookingFilterParams,
  ]);

  const refreshCares = useCallback(() => {
    if (normalizedCareRange) {
      return loadCares({ range: normalizedCareRange });
    }
    return loadCares({ baseDate: careMonth });
  }, [normalizedCareRange, loadCares, careMonth]);

  useEffect(() => {
    if (activeTab === 'clients') {
      loadClients();
    }
  }, [activeTab, loadClients]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookings(bookingFilterParams);
    }
  }, [activeTab, loadBookings, bookingFilterParams]);

  useEffect(() => {
    if (activeTab === 'cares') {
      refreshCares();
    }
  }, [activeTab, refreshCares]);

  const handleOpenDrawer = useCallback(() => {
    const drawer = navigation as { openDrawer?: () => void };
    drawer.openDrawer?.();
  }, [navigation]);

  const handleCloseAdmin = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenClientCreate = useCallback(() => {
    setEditingClient(null);
    resetClientForm();
    setClientModalVisible(true);
  }, [resetClientForm]);

  const handleOpenClientEdit = useCallback((client: SittingClient) => {
    setEditingClient(client);
    hydrateClientForm({
      clientName: client.clientName ?? '',
      clientCatName: client.catName ?? '',
      clientAddress: client.address ?? '',
      clientEntryNote: client.entryNote ?? '',
      clientRequirements: client.requirements ?? '',
    });
    setClientModalVisible(true);
  }, [hydrateClientForm]);

  const handleSaveClient = useCallback(async () => {
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
      if (editingClient) {
        await updateClient(accessToken, editingClient.id, {
          clientName: clientName.trim(),
          catName: clientCatName.trim(),
          address: clientAddress.trim(),
          entryNote: clientEntryNote.trim() || undefined,
          requirements: clientRequirements.trim() || undefined,
        });
      } else {
        await createClient(accessToken, {
          clientName: clientName.trim(),
          catName: clientCatName.trim(),
          address: clientAddress.trim(),
          entryNote: clientEntryNote.trim() || undefined,
          requirements: clientRequirements.trim() || undefined,
        });
      }
      await loadClients();
      setClientModalVisible(false);
      if (showClientCreateModal && pendingBookingCreateOpen) {
        setShowClientCreateModal(false);
        setShowBookingCreateModal(true);
        setPendingBookingCreateOpen(false);
      }
    } catch (error) {
      Alert.alert('오류', editingClient ? '고객 수정에 실패했습니다.' : '고객 추가에 실패했습니다.');
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
    editingClient,
    loadClients,
    pendingBookingCreateOpen,
    showClientCreateModal,
  ]);

  const handleDeleteClient = useCallback(
    (client: SittingClient) => {
      if (!accessToken) return;
      Alert.alert('고객 삭제', '정말로 이 고객을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await deleteClient(accessToken, client.id);
            await loadClients();
          },
        },
      ]);
    },
    [accessToken, loadClients],
  );

  const handleOpenBookingCreate = useCallback(async () => {
    setBookingDate(new Date());
    const data = await loadClients();
    if (data.length === 0) {
      setPendingBookingCreateOpen(true);
      setEditingClient(null);
      resetClientForm();
      setShowClientCreateModal(true);
      return;
    }
    setShowBookingCreateModal(true);
  }, [loadClients, resetClientForm]);

  const handleOpenClientPicker = useCallback((target: 'booking-create' | 'booking-filter') => {
    setClientPickerTarget(target);
    if (target === 'booking-create') {
      setPendingBookingCreateOpen(true);
      setShowBookingCreateModal(false);
    }
    setShowClientPicker(true);
  }, []);

  const handleOpenBookingFilterClientPicker = useCallback(() => {
    handleOpenClientPicker('booking-filter');
  }, [handleOpenClientPicker]);

  const handleOpenClientCreateFromBooking = useCallback(() => {
    setPendingBookingCreateOpen(true);
    setShowBookingCreateModal(false);
    setEditingClient(null);
    resetClientForm();
    setShowClientCreateModal(true);
  }, [resetClientForm]);

  const handleCloseClientPicker = useCallback(() => {
    setShowClientPicker(false);
    if (clientPickerTarget === 'booking-create' && pendingBookingCreateOpen) {
      setShowBookingCreateModal(true);
      setPendingBookingCreateOpen(false);
    }
    setClientPickerTarget(null);
  }, [clientPickerTarget, pendingBookingCreateOpen]);

  const handleCloseClientCreateModal = useCallback(() => {
    setShowClientCreateModal(false);
    if (pendingBookingCreateOpen) {
      setShowBookingCreateModal(true);
      setPendingBookingCreateOpen(false);
    }
  }, [pendingBookingCreateOpen]);

  const handleSelectClient = useCallback(
    (client: SittingClient) => {
      if (clientPickerTarget === 'booking-filter') {
        setBookingClientFilter(client);
        return;
      }
      setSelectedClient(client);
    },
    [clientPickerTarget],
  );

  const handleOpenContactMethodPicker = useCallback(
    (target: 'create' | 'edit') => {
      setContactMethodTarget(target);
      if (target === 'create') {
        setPendingBookingCreateOpen(true);
        setShowBookingCreateModal(false);
      } else {
        setPendingBookingEditOpen(true);
        setShowBookingEditModal(false);
      }
      setShowContactMethodPicker(true);
    },
    [],
  );

  const handleCloseContactMethodPicker = useCallback(() => {
    setShowContactMethodPicker(false);
    if (contactMethodTarget === 'create' && pendingBookingCreateOpen) {
      setShowBookingCreateModal(true);
      setPendingBookingCreateOpen(false);
    }
    if (contactMethodTarget === 'edit' && pendingBookingEditOpen) {
      setShowBookingEditModal(true);
      setPendingBookingEditOpen(false);
    }
    setContactMethodTarget(null);
  }, [contactMethodTarget, pendingBookingCreateOpen, pendingBookingEditOpen]);

  const handleOpenBookingDatePicker = useCallback((target: 'create' | 'edit') => {
    setBookingPickerTarget(target);
    if (target === 'create') {
      setPendingBookingCreateOpen(true);
      setShowBookingCreateModal(false);
    } else {
      setPendingBookingEditOpen(true);
      setShowBookingEditModal(false);
    }
    setShowBookingDatePicker(true);
  }, []);

  const handleOpenBookingTimePicker = useCallback((target: 'create' | 'edit') => {
    setBookingPickerTarget(target);
    if (target === 'create') {
      setPendingBookingCreateOpen(true);
      setShowBookingCreateModal(false);
    } else {
      setPendingBookingEditOpen(true);
      setShowBookingEditModal(false);
    }
    setShowBookingTimePicker(true);
  }, []);

  const handleCloseBookingDatePicker = useCallback(() => {
    setShowBookingDatePicker(false);
    if (bookingPickerTarget === 'create' && pendingBookingCreateOpen) {
      setShowBookingCreateModal(true);
      setPendingBookingCreateOpen(false);
    }
    if (bookingPickerTarget === 'edit' && pendingBookingEditOpen) {
      setShowBookingEditModal(true);
      setPendingBookingEditOpen(false);
    }
    setBookingPickerTarget(null);
  }, [bookingPickerTarget, pendingBookingCreateOpen, pendingBookingEditOpen]);

  const handleCloseBookingTimePicker = useCallback(() => {
    setShowBookingTimePicker(false);
    if (bookingPickerTarget === 'create' && pendingBookingCreateOpen) {
      setShowBookingCreateModal(true);
      setPendingBookingCreateOpen(false);
    }
    if (bookingPickerTarget === 'edit' && pendingBookingEditOpen) {
      setShowBookingEditModal(true);
      setPendingBookingEditOpen(false);
    }
    setBookingPickerTarget(null);
  }, [bookingPickerTarget, pendingBookingCreateOpen, pendingBookingEditOpen]);

  const handleBookingDateChange = (event: any, date?: Date) => {
    if (!date) return;
    if (bookingPickerTarget === 'edit') {
      const newDate = new Date(editBookingDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setEditBookingDate(newDate);
      return;
    }
    const newDate = new Date(bookingDate);
    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setBookingDate(newDate);
  };

  const handleBookingTimeChange = (event: any, date?: Date) => {
    if (!date) return;
    if (bookingPickerTarget === 'edit') {
      const newDate = new Date(editBookingDate);
      newDate.setHours(date.getHours(), date.getMinutes());
      setEditBookingDate(newDate);
      return;
    }
    const newDate = new Date(bookingDate);
    newDate.setHours(date.getHours(), date.getMinutes());
    setBookingDate(newDate);
  };

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
    if (!Number.isFinite(expectedValue) || expectedValue < 0 || !Number.isInteger(expectedValue)) {
      Alert.alert('알림', '예상 금액을 정수로 입력해주세요.');
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue < 0 || !Number.isInteger(amountValue)) {
      Alert.alert('알림', '결제 금액을 정수로 입력해주세요.');
      return;
    }

    try {
      setIsSavingBooking(true);
      const kstDate = new Date(bookingDate.getTime() + 9 * 60 * 60 * 1000);
      const reservationKst = kstDate.toISOString().slice(0, 19);
      await createBooking(accessToken, {
        clientId: selectedClient.id,
        reservationKst,
        expectedAmount: expectedValue,
        amount: amountValue,
        contactMethod: contactMethod ?? undefined,
      });
      await refreshBookings();
      setExpectedAmount('');
      setAmount('');
      setShowBookingCreateModal(false);
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
    refreshBookings,
  ]);

  const handleOpenBookingEdit = useCallback((booking: SittingBooking) => {
    setEditingBooking(booking);
    hydrateBookingEditForm({
      editBookingDate: new Date(booking.reservationDate),
      editExpectedAmount: String(booking.expectedAmount ?? ''),
      editAmount: String(booking.amount ?? ''),
      editContactMethod: booking.contactMethod ?? '카톡',
      editEntryNote: booking.entryNoteSnapshot ?? '',
    });
    setShowBookingEditModal(true);
  }, [hydrateBookingEditForm]);

  const handleUpdateBooking = useCallback(async () => {
    if (!accessToken || !editingBooking) return;
    if (!editExpectedAmount.trim()) {
      Alert.alert('알림', '예상 금액을 입력해주세요.');
      return;
    }
    if (!editAmount.trim()) {
      Alert.alert('알림', '결제 금액을 입력해주세요.');
      return;
    }

    const expectedValue = Number(editExpectedAmount.replace(/,/g, '').trim());
    const amountValue = Number(editAmount.replace(/,/g, '').trim());
    if (!Number.isFinite(expectedValue) || expectedValue < 0 || !Number.isInteger(expectedValue)) {
      Alert.alert('알림', '예상 금액을 정수로 입력해주세요.');
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue < 0 || !Number.isInteger(amountValue)) {
      Alert.alert('알림', '결제 금액을 정수로 입력해주세요.');
      return;
    }

    try {
      setIsUpdatingBooking(true);
      const kstDate = new Date(editBookingDate.getTime() + 9 * 60 * 60 * 1000);
      const reservationKst = kstDate.toISOString().slice(0, 19);
      await updateBooking(accessToken, editingBooking.id, {
        reservationKst,
        expectedAmount: expectedValue,
        amount: amountValue,
        contactMethod: editContactMethod ?? undefined,
        entryNoteSnapshot: editEntryNote.trim() || undefined,
      });
      await refreshBookings();
      setShowBookingEditModal(false);
    } catch (error) {
      Alert.alert('오류', '예약 수정에 실패했습니다.');
    } finally {
      setIsUpdatingBooking(false);
    }
  }, [
    accessToken,
    editingBooking,
    editBookingDate,
    editExpectedAmount,
    editAmount,
    editContactMethod,
    editEntryNote,
    refreshBookings,
  ]);

  const handleCancelBooking = useCallback(
    (booking: SittingBooking) => {
      if (!accessToken) return;
      Alert.alert('예약 취소', '이 예약을 취소 처리하시겠습니까?', [
        { text: '닫기', style: 'cancel' },
        {
          text: '취소',
          style: 'destructive',
          onPress: async () => {
            await updateBookingStatus(accessToken, booking.id, 'CANCELLED');
            await refreshBookings();
          },
        },
      ]);
    },
    [accessToken, refreshBookings],
  );

  const handleCloseCareCreate = useCallback(() => {
    setShowCareCreateModal(false);
    refreshCares();
  }, [refreshCares]);

  const handleOpenCareEdit = useCallback((care: SittingCare) => {
    setEditingCare(care);
    hydrateCareEditForm({
      editCareDate: new Date(care.careTime),
      editCareNote: care.note ?? '',
    });
    setShowCareEditModal(true);
  }, [hydrateCareEditForm]);

  const handleOpenCareFilterDatePicker = useCallback((target: 'from' | 'to') => {
    setCareFilterDateTarget(target);
    setShowCareFilterDatePicker(true);
  }, []);

  const handleCloseCareFilterDatePicker = useCallback(() => {
    setShowCareFilterDatePicker(false);
    setCareFilterDateTarget(null);
  }, []);

  const handleOpenCareDatePicker = useCallback(() => {
    setPendingCareEditOpen(true);
    setShowCareEditModal(false);
    setShowCareDatePicker(true);
  }, []);

  const handleOpenCareTimePicker = useCallback(() => {
    setPendingCareEditOpen(true);
    setShowCareEditModal(false);
    setShowCareTimePicker(true);
  }, []);

  const handleCloseCareDatePicker = useCallback(() => {
    setShowCareDatePicker(false);
    if (pendingCareEditOpen) {
      setShowCareEditModal(true);
      setPendingCareEditOpen(false);
    }
  }, [pendingCareEditOpen]);

  const handleCloseCareTimePicker = useCallback(() => {
    setShowCareTimePicker(false);
    if (pendingCareEditOpen) {
      setShowCareEditModal(true);
      setPendingCareEditOpen(false);
    }
  }, [pendingCareEditOpen]);

  const handleCareDateChange = (event: any, date?: Date) => {
    if (!date) return;
    const newDate = new Date(editCareDate);
    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setEditCareDate(newDate);
  };

  const handleCareTimeChange = (event: any, date?: Date) => {
    if (!date) return;
    const newDate = new Date(editCareDate);
    newDate.setHours(date.getHours(), date.getMinutes());
    setEditCareDate(newDate);
  };

  const handleCareFilterDateChange = (event: any, date?: Date) => {
    if (!date) return;
    const next = normalizeDateOnly(date);
    if (careFilterDateTarget === 'from') {
      setCareFilterFrom(next);
      return;
    }
    if (careFilterDateTarget === 'to') {
      setCareFilterTo(next);
    }
  };

  const handleUpdateCare = useCallback(async () => {
    if (!accessToken || !editingCare) return;
    try {
      setIsUpdatingCare(true);
      const kstDate = new Date(editCareDate.getTime() + 9 * 60 * 60 * 1000);
      const careTimeKst = kstDate.toISOString().slice(0, 19);
      await updateCare(accessToken, editingCare.id, {
        careTimeKst,
        note: editCareNote.trim() || undefined,
      });
      await refreshCares();
      setShowCareEditModal(false);
    } catch (error) {
      Alert.alert('오류', '케어 수정에 실패했습니다.');
    } finally {
      setIsUpdatingCare(false);
    }
  }, [accessToken, editingCare, editCareDate, editCareNote, refreshCares]);

  const handleDeleteCare = useCallback(
    (care: SittingCare) => {
      if (!accessToken) return;
      Alert.alert('케어 삭제', '정말로 이 케어 기록을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await deleteCare(accessToken, care.id);
            await refreshCares();
          },
        },
      ]);
    },
    [accessToken, refreshCares],
  );

  const handleCareMonthChange = useCallback(
    (direction: 'prev' | 'next') => {
      const offset = direction === 'prev' ? -1 : 1;
      const newDate = new Date(careMonth.getFullYear(), careMonth.getMonth() + offset, 1);
      setCareFilterFrom(null);
      setCareFilterTo(null);
      setCareMonth(newDate);
    },
    [careMonth],
  );

  const handleClearCareFilters = useCallback(() => {
    setCareFilterFrom(null);
    setCareFilterTo(null);
  }, [setCareFilterFrom, setCareFilterTo]);

  const handleClearBookingClientFilter = useCallback(() => {
    setBookingClientFilter(null);
  }, [setBookingClientFilter]);

  const handleOpenCareCreate = useCallback(() => {
    setShowCareCreateModal(true);
  }, [setShowCareCreateModal]);

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

  const formatCareTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    });
  }, []);

  const formatMonthLabel = useMemo(() => {
    const year = careMonth.getFullYear();
    const month = careMonth.getMonth() + 1;
    return `${year}년 ${month}월`;
  }, [careMonth]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <AdminHeader
          theme={theme}
          onOpenDrawer={handleOpenDrawer}
          onClose={handleCloseAdmin}
        />

        <AdminTabs activeTab={activeTab} onChangeTab={setActiveTab} theme={theme} />

        {activeTab === 'clients' && (
          <AdminClientsTab
            clients={clients}
            filteredClients={filteredClients}
            clientQuery={clientQuery}
            isLoadingClients={isLoadingClients}
            isDark={isDark}
            theme={theme}
            onChangeClientQuery={setClientQuery}
            onEditClient={handleOpenClientEdit}
            onDeleteClient={handleDeleteClient}
            onOpenClientCreate={handleOpenClientCreate}
          />
        )}

        {activeTab === 'bookings' && (
          <AdminBookingsTab
            bookings={bookings}
            filteredBookings={filteredBookings}
            bookingQuery={bookingQuery}
            bookingStatusFilter={bookingStatusFilter}
            bookingStatusOptions={bookingStatusOptions}
            bookingClientFilter={bookingClientFilter}
            isLoadingBookings={isLoadingBookings}
            isDark={isDark}
            theme={theme}
            onChangeBookingQuery={setBookingQuery}
            onChangeBookingStatus={setBookingStatusFilter}
            onOpenClientPicker={handleOpenBookingFilterClientPicker}
            onClearBookingClientFilter={handleClearBookingClientFilter}
            onEditBooking={handleOpenBookingEdit}
            onCancelBooking={handleCancelBooking}
            onOpenBookingCreate={handleOpenBookingCreate}
            formatCareTime={formatCareTime}
          />
        )}

        {activeTab === 'cares' && (
          <AdminCaresTab
            cares={cares}
            filteredCares={filteredCares}
            careQuery={careQuery}
            careFilterFrom={careFilterFrom}
            careFilterTo={careFilterTo}
            normalizedCareRange={normalizedCareRange}
            isLoadingCares={isLoadingCares}
            isDark={isDark}
            theme={theme}
            formatMonthLabel={formatMonthLabel}
            onChangeCareQuery={setCareQuery}
            onOpenCareFilterDatePicker={handleOpenCareFilterDatePicker}
            onClearCareFilters={handleClearCareFilters}
            onChangeCareMonth={handleCareMonthChange}
            onEditCare={handleOpenCareEdit}
            onDeleteCare={handleDeleteCare}
            onOpenCareCreate={handleOpenCareCreate}
            formatShortDate={formatShortDate}
            formatCareTime={formatCareTime}
          />
        )}
      </View>

      <ClientCreateModal
        visible={clientModalVisible}
        onClose={() => setClientModalVisible(false)}
        isDark={isDark}
        theme={theme}
        title={editingClient ? '고객 수정' : '고객 추가'}
        saveLabel={editingClient ? '고객 수정' : '고객 저장'}
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
        onSave={handleSaveClient}
      />

      <BookingCreateModal
        visible={showBookingCreateModal}
        onClose={() => setShowBookingCreateModal(false)}
        isDark={isDark}
        theme={theme}
        clients={clients}
        selectedClient={selectedClient}
        isLoadingClients={isLoadingClients}
        onOpenClientPicker={() => handleOpenClientPicker('booking-create')}
        onOpenClientCreate={handleOpenClientCreateFromBooking}
        onOpenContactMethodPicker={() => handleOpenContactMethodPicker('create')}
        bookingDate={bookingDate}
        onOpenDatePicker={() => handleOpenBookingDatePicker('create')}
        onOpenTimePicker={() => handleOpenBookingTimePicker('create')}
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

      <BookingCreateModal
        visible={showBookingEditModal}
        onClose={() => setShowBookingEditModal(false)}
        isDark={isDark}
        theme={theme}
        title="예약 수정"
        saveLabel="예약 수정"
        allowClientChange={false}
        showClientCreate={false}
        clients={clients}
        selectedClient={editingBooking?.client ?? null}
        isLoadingClients={false}
        onOpenClientPicker={() => {}}
        onOpenClientCreate={() => {}}
        onOpenContactMethodPicker={() => handleOpenContactMethodPicker('edit')}
        bookingDate={editBookingDate}
        onOpenDatePicker={() => handleOpenBookingDatePicker('edit')}
        onOpenTimePicker={() => handleOpenBookingTimePicker('edit')}
        contactMethod={editContactMethod}
        entryNote={editEntryNote}
        onChangeEntryNote={setEditEntryNote}
        expectedAmount={editExpectedAmount}
        onChangeExpectedAmount={setEditExpectedAmount}
        amount={editAmount}
        onChangeAmount={setEditAmount}
        isSaving={isUpdatingBooking}
        onSave={handleUpdateBooking}
        formatDate={formatDate}
        formatTime={formatTime}
      />

      <ContactMethodPickerModal
        visible={showContactMethodPicker}
        onClose={handleCloseContactMethodPicker}
        options={contactMethodOptions}
        selected={contactMethodTarget === 'edit' ? editContactMethod : contactMethod}
        onSelect={(value) => {
          if (contactMethodTarget === 'edit') {
            setEditContactMethod(value);
          } else {
            setContactMethod(value);
          }
        }}
        theme={theme}
        isDark={isDark}
      />

      <ClientPickerModal
        visible={showClientPicker}
        onClose={handleCloseClientPicker}
        clients={clients}
        selectedClient={clientPickerTarget === 'booking-filter' ? bookingClientFilter : selectedClient}
        onSelect={handleSelectClient}
        theme={theme}
        isDark={isDark}
      />

      <ClientCreateModal
        visible={showClientCreateModal}
        onClose={handleCloseClientCreateModal}
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
        onSave={handleSaveClient}
      />

      <DateTimePickerModal
        visible={showBookingDatePicker}
        title="예약 날짜"
        value={bookingPickerTarget === 'edit' ? editBookingDate : bookingDate}
        mode="date"
        onChange={handleBookingDateChange}
        onClose={handleCloseBookingDatePicker}
        isDark={isDark}
        theme={theme}
      />

      <DateTimePickerModal
        visible={showBookingTimePicker}
        title="예약 시간"
        value={bookingPickerTarget === 'edit' ? editBookingDate : bookingDate}
        mode="time"
        onChange={handleBookingTimeChange}
        onClose={handleCloseBookingTimePicker}
        isDark={isDark}
        theme={theme}
      />

      <AddCareModal visible={showCareCreateModal} onClose={handleCloseCareCreate} />

      <CareEditModal
        visible={showCareEditModal}
        onClose={() => setShowCareEditModal(false)}
        isDark={isDark}
        theme={theme}
        careDate={editCareDate}
        onOpenDatePicker={handleOpenCareDatePicker}
        onOpenTimePicker={handleOpenCareTimePicker}
        note={editCareNote}
        onChangeNote={setEditCareNote}
        isSaving={isUpdatingCare}
        onSave={handleUpdateCare}
        formatDate={formatDate}
        formatTime={formatTime}
      />

      <DateTimePickerModal
        visible={showCareDatePicker}
        title="케어 날짜"
        value={editCareDate}
        mode="date"
        onChange={handleCareDateChange}
        onClose={handleCloseCareDatePicker}
        isDark={isDark}
        theme={theme}
      />

      <DateTimePickerModal
        visible={showCareTimePicker}
        title="케어 시간"
        value={editCareDate}
        mode="time"
        onChange={handleCareTimeChange}
        onClose={handleCloseCareTimePicker}
        isDark={isDark}
        theme={theme}
      />

      <DateTimePickerModal
        visible={showCareFilterDatePicker}
        title={careFilterDateTarget === 'to' ? '종료 날짜' : '시작 날짜'}
        value={
          careFilterDateTarget === 'to'
            ? careFilterTo ?? new Date()
            : careFilterFrom ?? new Date()
        }
        mode="date"
        onChange={handleCareFilterDateChange}
        onClose={handleCloseCareFilterDatePicker}
        isDark={isDark}
        theme={theme}
      />
    </SafeAreaView>
  );
}
