import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
} from 'react-native';

import { BookingCreateModal } from '@/components/booking-create-modal';
import { CareEditModal } from '@/components/care-edit-modal';
import { ClientCreateModal } from '@/components/client-create-modal';
import { ContactMethodPickerModal } from '@/components/contact-method-picker-modal';
import { DateTimePickerModal } from '@/components/date-time-picker-modal';
import { PhotoGrid, sortPhotosCoverFirst } from '@/components/photo-grid';
import { PhotoLightbox } from '@/components/photo-lightbox';
import { PhotoUploadModal } from '@/components/photo-upload-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePhotos } from '@/hooks/use-photos';
import {
    getBooking,
    getCare,
    updateBooking,
    updateCare,
    updateClient,
    type SittingBooking,
    type SittingCare,
} from '@/lib/sitting-api';
import { useAuth } from '@/providers/auth-provider';
import { useSitting } from '@/providers/sitting-provider';

export default function CareDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const { accessToken } = useAuth();
  const { toggleComplete, deleteCare, fetchCaresForMonth } = useSitting();

  const [care, setCare] = useState<SittingCare | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 고객 수정
  const [showClientEditModal, setShowClientEditModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientCatName, setClientCatName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEntryNote, setClientEntryNote] = useState('');
  const [clientRequirements, setClientRequirements] = useState('');
  const [isSavingClient, setIsSavingClient] = useState(false);

  // 예약 수정
  const [showBookingEditModal, setShowBookingEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<SittingBooking | null>(null);
  const [editBookingDate, setEditBookingDate] = useState(new Date());
  const [editExpectedAmount, setEditExpectedAmount] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editContactMethod, setEditContactMethod] = useState<string | null>('카톡');
  const [editEntryNote, setEditEntryNote] = useState('');
  const [isSavingBooking, setIsSavingBooking] = useState(false);
  const [isFetchingBooking, setIsFetchingBooking] = useState(false);

  // 돌봄 수정
  const [showCareEditModal, setShowCareEditModal] = useState(false);
  const [editCareDate, setEditCareDate] = useState(new Date());
  const [editCareNote, setEditCareNote] = useState('');
  const [isSavingCare, setIsSavingCare] = useState(false);

  // 픽커
  const [showContactMethodPicker, setShowContactMethodPicker] = useState(false);
  const [showBookingDatePicker, setShowBookingDatePicker] = useState(false);
  const [showBookingTimePicker, setShowBookingTimePicker] = useState(false);
  const [showCareDatePicker, setShowCareDatePicker] = useState(false);
  const [showCareTimePicker, setShowCareTimePicker] = useState(false);
  const [pendingBookingEditOpen, setPendingBookingEditOpen] = useState(false);
  const [pendingCareEditOpen, setPendingCareEditOpen] = useState(false);

  const clientId = care?.booking?.client?.id ?? null;
  const { photos, coverPhotoId, refetch: refetchPhotos } = usePhotos({ clientId });

  // 사진 관리
  const [uploadVisible, setUploadVisible] = useState(false);
  const [coverSelectMode, setCoverSelectMode] = useState(false);
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);

  const loadCare = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!accessToken || !id) return;
      const silent = options?.silent ?? false;
      try {
        if (!silent) setIsLoading(true);
        const data = await getCare(accessToken, id);
        setCare(data);
      } catch (error) {
        Alert.alert('오류', '돌봄 정보를 불러올 수 없습니다.');
        router.back();
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [accessToken, id, router],
  );

  useEffect(() => {
    loadCare();
  }, [loadCare]);

  const handleToggleComplete = useCallback(async () => {
    if (!care) return;
    const updated = await toggleComplete(care.id);
    setCare(updated);
  }, [care, toggleComplete]);

  const handleDelete = useCallback(async () => {
    if (!care) return;

    Alert.alert('돌봄 삭제', '정말로 이 돌봄 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteCare(care.id);
            await fetchCaresForMonth();
            router.back();
          } catch {
            setIsDeleting(false);
            Alert.alert('오류', '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  }, [care, deleteCare, fetchCaresForMonth, router]);

  const openNaverMap = async (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const naverMapUrl = `nmap://search?query=${encodedAddress}&appname=com.eunsun.allrecords`;
    const webUrl = `https://map.naver.com/v5/search/${encodedAddress}`;

    try {
      await Linking.openURL(naverMapUrl);
    } catch {
      await Linking.openURL(webUrl);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    });
  };

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

  // 고객 수정
  const handleOpenClientEdit = useCallback(() => {
    const c = care?.booking?.client;
    if (!c) return;
    setClientName(c.clientName ?? '');
    setClientCatName(c.catName ?? '');
    setClientAddress(c.address ?? '');
    setClientEntryNote(c.entryNote ?? '');
    setClientRequirements(c.requirements ?? '');
    setShowClientEditModal(true);
  }, [care]);

  const handleSaveClient = useCallback(async () => {
    if (!accessToken || !care?.booking?.client?.id) return;
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
      await updateClient(accessToken, care.booking.client.id, {
        clientName: clientName.trim(),
        catName: clientCatName.trim(),
        address: clientAddress.trim(),
        entryNote: clientEntryNote.trim() || undefined,
        requirements: clientRequirements.trim() || undefined,
      });
      await loadCare({ silent: true });
      setShowClientEditModal(false);
    } catch {
      Alert.alert('오류', '고객 수정에 실패했습니다.');
    } finally {
      setIsSavingClient(false);
    }
  }, [
    accessToken,
    care,
    clientName,
    clientCatName,
    clientAddress,
    clientEntryNote,
    clientRequirements,
    loadCare,
  ]);

  // 예약 수정
  const handleOpenBookingEdit = useCallback(async () => {
    if (!accessToken || !care?.bookingId) return;
    try {
      setIsFetchingBooking(true);
      const booking = await getBooking(accessToken, care.bookingId);
      setEditingBooking(booking);
      setEditBookingDate(new Date(booking.reservationDate));
      setEditExpectedAmount(String(booking.expectedAmount ?? ''));
      setEditAmount(String(booking.amount ?? ''));
      setEditContactMethod(booking.contactMethod ?? '카톡');
      setEditEntryNote(booking.entryNoteSnapshot ?? '');
      setShowBookingEditModal(true);
    } catch {
      Alert.alert('오류', '예약 정보를 불러올 수 없습니다.');
    } finally {
      setIsFetchingBooking(false);
    }
  }, [accessToken, care]);

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
      setIsSavingBooking(true);
      const kstDate = new Date(editBookingDate.getTime() + 9 * 60 * 60 * 1000);
      const reservationKst = kstDate.toISOString().slice(0, 19);
      await updateBooking(accessToken, editingBooking.id, {
        reservationKst,
        expectedAmount: expectedValue,
        amount: amountValue,
        contactMethod: editContactMethod ?? undefined,
        entryNoteSnapshot: editEntryNote.trim() || undefined,
      });
      await loadCare({ silent: true });
      setShowBookingEditModal(false);
    } catch {
      Alert.alert('오류', '예약 수정에 실패했습니다.');
    } finally {
      setIsSavingBooking(false);
    }
  }, [
    accessToken,
    editingBooking,
    editBookingDate,
    editExpectedAmount,
    editAmount,
    editContactMethod,
    editEntryNote,
    loadCare,
  ]);

  // 돌봄 수정
  const handleOpenCareEdit = useCallback(() => {
    if (!care) return;
    setEditCareDate(new Date(care.careTime));
    setEditCareNote(care.note ?? '');
    setShowCareEditModal(true);
  }, [care]);

  const handleUpdateCare = useCallback(async () => {
    if (!accessToken || !care) return;
    try {
      setIsSavingCare(true);
      const kstDate = new Date(editCareDate.getTime() + 9 * 60 * 60 * 1000);
      const careTimeKst = kstDate.toISOString().slice(0, 19);
      await updateCare(accessToken, care.id, {
        careTimeKst,
        note: editCareNote.trim() || undefined,
      });
      await loadCare({ silent: true });
      await fetchCaresForMonth();
      setShowCareEditModal(false);
    } catch {
      Alert.alert('오류', '돌봄 수정에 실패했습니다.');
    } finally {
      setIsSavingCare(false);
    }
  }, [accessToken, care, editCareDate, editCareNote, loadCare, fetchCaresForMonth]);

  // 사진등록 / 대표사진변경
  const handleUploadClose = useCallback(
    (uploadedCount: number) => {
      setUploadVisible(false);
      if (uploadedCount > 0) void refetchPhotos();
    },
    [refetchPhotos],
  );

  const handleCoverSelect = useCallback(
    async (photoId: string) => {
      if (!accessToken || !clientId || isUpdatingCover) return;
      setIsUpdatingCover(true);
      try {
        await updateClient(accessToken, clientId, { coverPhotoId: photoId });
        await refetchPhotos();
        setCoverSelectMode(false);
      } catch {
        Alert.alert('오류', '대표사진 변경에 실패했습니다.');
      } finally {
        setIsUpdatingCover(false);
      }
    },
    [accessToken, clientId, isUpdatingCover, refetchPhotos],
  );

  // 픽커 열기/닫기 (부모 모달 재오픈 댄스)
  const handleOpenBookingDatePicker = useCallback(() => {
    setPendingBookingEditOpen(true);
    setShowBookingEditModal(false);
    setShowBookingDatePicker(true);
  }, []);

  const handleOpenBookingTimePicker = useCallback(() => {
    setPendingBookingEditOpen(true);
    setShowBookingEditModal(false);
    setShowBookingTimePicker(true);
  }, []);

  const handleCloseBookingDatePicker = useCallback(() => {
    setShowBookingDatePicker(false);
    if (pendingBookingEditOpen) {
      setShowBookingEditModal(true);
      setPendingBookingEditOpen(false);
    }
  }, [pendingBookingEditOpen]);

  const handleCloseBookingTimePicker = useCallback(() => {
    setShowBookingTimePicker(false);
    if (pendingBookingEditOpen) {
      setShowBookingEditModal(true);
      setPendingBookingEditOpen(false);
    }
  }, [pendingBookingEditOpen]);

  const handleBookingDateChange = useCallback(
    (_event: unknown, date?: Date) => {
      if (!date) return;
      const newDate = new Date(editBookingDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setEditBookingDate(newDate);
    },
    [editBookingDate],
  );

  const handleBookingTimeChange = useCallback(
    (_event: unknown, date?: Date) => {
      if (!date) return;
      const newDate = new Date(editBookingDate);
      newDate.setHours(date.getHours(), date.getMinutes());
      setEditBookingDate(newDate);
    },
    [editBookingDate],
  );

  const handleOpenContactMethodPicker = useCallback(() => {
    setPendingBookingEditOpen(true);
    setShowBookingEditModal(false);
    setShowContactMethodPicker(true);
  }, []);

  const handleCloseContactMethodPicker = useCallback(() => {
    setShowContactMethodPicker(false);
    if (pendingBookingEditOpen) {
      setShowBookingEditModal(true);
      setPendingBookingEditOpen(false);
    }
  }, [pendingBookingEditOpen]);

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

  const handleCareDateChange = useCallback(
    (_event: unknown, date?: Date) => {
      if (!date) return;
      const newDate = new Date(editCareDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setEditCareDate(newDate);
    },
    [editCareDate],
  );

  const handleCareTimeChange = useCallback(
    (_event: unknown, date?: Date) => {
      if (!date) return;
      const newDate = new Date(editCareDate);
      newDate.setHours(date.getHours(), date.getMinutes());
      setEditCareDate(newDate);
    },
    [editCareDate],
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!care) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          돌봄 정보를 찾을 수 없습니다.
        </Text>
      </View>
    );
  }

  const isCompleted = !!care.completedAt;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* 상태 배지 */}
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: isCompleted
              ? isDark
                ? '#374151'
                : '#F3F4F6'
              : isDark
                ? '#0C4A6E'
                : '#E0F2FE',
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: isCompleted ? theme.icon : '#0284C7' },
          ]}
        >
          {isCompleted ? '완료됨' : '예정됨'}
        </Text>
      </View>

      {/* 사진 */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.icon }]}>
          {coverSelectMode ? '사진 — 대표로 지정할 사진을 선택' : '사진'}
        </Text>
        <PhotoGrid
          photos={photos}
          coverPhotoId={coverPhotoId}
          onPhotoPress={(index) => setLightboxIndex(index)}
          cornerBadge="star"
          isDark={isDark}
          mode={coverSelectMode ? 'cover-select' : 'view'}
          onCoverSelect={handleCoverSelect}
        />
      </View>

      {/* 돌봄 시간 */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.icon }]}>돌봄 시간</Text>
        <Text style={[styles.sectionValue, { color: theme.text }]}>
          {formatDateTime(care.careTime)}
        </Text>
      </View>

      {/* 고양이 정보 */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.icon }]}>고양이</Text>
        <Text style={[styles.sectionValue, { color: theme.text }]}>
          {care.booking?.catName || care.booking?.client?.catName || '-'}
        </Text>
      </View>

      {/* 고객 정보 */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.icon }]}>고객</Text>
        <Text style={[styles.sectionValue, { color: theme.text }]}>
          {care.booking?.client?.clientName || '-'}
        </Text>
      </View>

      {/* 주소 */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.icon }]}>주소</Text>
        <Text style={[styles.sectionValue, { color: theme.text }]}>
          {care.booking?.client?.address || '-'}
        </Text>
      </View>

      {/* 출입 메모 */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.icon }]}>출입 메모</Text>
        <ExpandableText
          text={care.booking?.client?.entryNote ?? '-'}
          style={[styles.sectionValue, { color: theme.text }]}
          theme={theme}
        />
      </View>

      {/* 요구사항 */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.icon }]}>요구사항</Text>
        <ExpandableText
          text={care.booking?.client?.requirements ?? '-'}
          style={[styles.sectionValue, { color: theme.text }]}
          theme={theme}
        />
      </View>

      {/* 메모 */}
      {care.note && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.icon }]}>메모</Text>
          <Text style={[styles.sectionValue, { color: theme.text }]}>{care.note}</Text>
        </View>
      )}

      {/* 완료 시간 */}
      {care.completedAt && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.icon }]}>완료 시간</Text>
          <Text style={[styles.sectionValue, { color: theme.text }]}>
            {formatDateTime(care.completedAt)}
          </Text>
        </View>
      )}

      {/* 액션 버튼들 */}
      <View style={styles.actions}>
        {coverSelectMode ? (
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.tint }]}
              onPress={() => setCoverSelectMode(false)}
            >
              <Text numberOfLines={1} style={styles.editButtonText}>
                완료
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Row 1: 주요 액션 */}
            <View style={styles.actionsRow}>
              {care.booking?.client?.address ? (
                <Pressable
                  style={[styles.actionButton, styles.naverMapButton]}
                  onPress={() => openNaverMap(care.booking!.client!.address)}
                >
                  <Text numberOfLines={1} style={styles.naverMapButtonText}>
                    네이버 지도
                  </Text>
                </Pressable>
              ) : (
                <View style={[styles.actionButton, { opacity: 0 }]} />
              )}

              <Pressable
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isCompleted ? theme.background : theme.tint,
                    borderColor: theme.tint,
                    borderWidth: isCompleted ? 1 : 0,
                  },
                ]}
                onPress={handleToggleComplete}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.actionButtonText,
                    { color: isCompleted ? theme.tint : '#FFFFFF' },
                  ]}
                >
                  {isCompleted ? '완료 취소' : '완료 처리'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text numberOfLines={1} style={styles.deleteButtonText}>
                  삭제
                </Text>
              </Pressable>
            </View>

            {/* Row 2: 수정 액션 */}
            <View style={styles.actionsRow}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.tint }]}
                onPress={handleOpenClientEdit}
              >
                <Text numberOfLines={1} style={styles.editButtonText}>
                  고객 수정
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.tint, opacity: isFetchingBooking ? 0.6 : 1 },
                ]}
                onPress={handleOpenBookingEdit}
                disabled={isFetchingBooking}
              >
                {isFetchingBooking ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text numberOfLines={1} style={styles.editButtonText}>
                    예약 수정
                  </Text>
                )}
              </Pressable>

              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.tint }]}
                onPress={handleOpenCareEdit}
              >
                <Text numberOfLines={1} style={styles.editButtonText}>
                  돌봄 수정
                </Text>
              </Pressable>
            </View>

            {/* Row 3: 사진 액션 (중앙정렬) */}
            <View style={styles.photoActionsRow}>
              <Pressable
                style={[styles.photoActionButton, { backgroundColor: theme.tint }]}
                onPress={() => setUploadVisible(true)}
              >
                <Text numberOfLines={1} style={styles.editButtonText}>
                  사진등록
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.photoActionButton,
                  {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: photos.length === 0 ? theme.icon : theme.tint,
                  },
                ]}
                onPress={() => setCoverSelectMode(true)}
                disabled={photos.length === 0}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.editButtonText,
                    { color: photos.length === 0 ? theme.icon : theme.tint },
                  ]}
                >
                  대표사진변경
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </ScrollView>
    {(isDeleting || isUpdatingCover) && (
      <View style={styles.deletingOverlay}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    )}
    <PhotoLightbox
      visible={lightboxIndex !== null}
      photos={sortPhotosCoverFirst(photos, coverPhotoId)}
      initialIndex={lightboxIndex ?? 0}
      onClose={() => setLightboxIndex(null)}
    />

    {clientId && (
      <PhotoUploadModal
        visible={uploadVisible}
        clientId={clientId}
        isDark={isDark}
        theme={theme}
        onClose={handleUploadClose}
      />
    )}

    <ClientCreateModal
      visible={showClientEditModal}
      onClose={() => setShowClientEditModal(false)}
      isDark={isDark}
      theme={theme}
      title="고객 수정"
      saveLabel="고객 수정"
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
      visible={showBookingEditModal}
      onClose={() => setShowBookingEditModal(false)}
      isDark={isDark}
      theme={theme}
      title="예약 수정"
      saveLabel="예약 수정"
      allowClientChange={false}
      showClientCreate={false}
      clients={editingBooking?.client ? [editingBooking.client] : []}
      selectedClient={editingBooking?.client ?? null}
      isLoadingClients={false}
      onOpenClientPicker={() => {}}
      onOpenClientCreate={() => {}}
      onOpenContactMethodPicker={handleOpenContactMethodPicker}
      bookingDate={editBookingDate}
      onOpenDatePicker={handleOpenBookingDatePicker}
      onOpenTimePicker={handleOpenBookingTimePicker}
      contactMethod={editContactMethod}
      entryNote={editEntryNote}
      onChangeEntryNote={setEditEntryNote}
      expectedAmount={editExpectedAmount}
      onChangeExpectedAmount={setEditExpectedAmount}
      amount={editAmount}
      onChangeAmount={setEditAmount}
      isSaving={isSavingBooking}
      onSave={handleUpdateBooking}
      formatDate={formatDate}
      formatTime={formatTime}
    />

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
      isSaving={isSavingCare}
      onSave={handleUpdateCare}
      formatDate={formatDate}
      formatTime={formatTime}
    />

    <ContactMethodPickerModal
      visible={showContactMethodPicker}
      onClose={handleCloseContactMethodPicker}
      options={['카톡', '숨고', '기타']}
      selected={editContactMethod}
      onSelect={setEditContactMethod}
      theme={theme}
      isDark={isDark}
    />

    <DateTimePickerModal
      visible={showBookingDatePicker}
      title="예약 날짜"
      value={editBookingDate}
      mode="date"
      onChange={handleBookingDateChange}
      onClose={handleCloseBookingDatePicker}
      isDark={isDark}
      theme={theme}
    />

    <DateTimePickerModal
      visible={showBookingTimePicker}
      title="예약 시간"
      value={editBookingDate}
      mode="time"
      onChange={handleBookingTimeChange}
      onClose={handleCloseBookingTimePicker}
      isDark={isDark}
      theme={theme}
    />

    <DateTimePickerModal
      visible={showCareDatePicker}
      title="돌봄 날짜"
      value={editCareDate}
      mode="date"
      onChange={handleCareDateChange}
      onClose={handleCloseCareDatePicker}
      isDark={isDark}
      theme={theme}
    />

    <DateTimePickerModal
      visible={showCareTimePicker}
      title="돌봄 시간"
      value={editCareDate}
      mode="time"
      onChange={handleCareTimeChange}
      onClose={handleCloseCareTimePicker}
      isDark={isDark}
      theme={theme}
    />
    </View>
  );
}

type ExpandableTextProps = {
  text: string;
  style: StyleProp<TextStyle>;
  theme: typeof Colors.light;
};

function ExpandableText({ text, style, theme }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncate, setNeedsTruncate] = useState(false);
  const [measured, setMeasured] = useState(false);
  const isEmpty = text === '-';

  return (
    <View>
      <Text style={style} numberOfLines={expanded ? undefined : 1}>
        {text}
      </Text>

      {!measured && !isEmpty && (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, right: 0, opacity: 0 }}
        >
          <Text
            style={style}
            onTextLayout={(e) => {
              setNeedsTruncate(e.nativeEvent.lines.length > 1);
              setMeasured(true);
            }}
          >
            {text}
          </Text>
        </View>
      )}

      {!isEmpty && measured && needsTruncate && (
        <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8}>
          <Text style={{ color: theme.icon, fontSize: 13, marginTop: 4 }}>
            {expanded ? '접기' : '더보기'}
          </Text>
        </Pressable>
      )}
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
  content: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  naverMapButton: {
    backgroundColor: '#2DB400',
  },
  naverMapButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  photoActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  photoActionButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
