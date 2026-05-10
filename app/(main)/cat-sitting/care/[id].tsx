import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCare, type SittingCare } from '@/lib/sitting-api';
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

  const loadCare = useCallback(async () => {
    if (!accessToken || !id) return;
    try {
      setIsLoading(true);
      const data = await getCare(accessToken, id);
      setCare(data);
    } catch (error) {
      Alert.alert('오류', '돌봄 정보를 불러올 수 없습니다.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, id, router]);

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
      {care.booking?.client?.entryNote && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.icon }]}>출입 메모</Text>
          <Text style={[styles.sectionValue, { color: theme.text }]}>
            {care.booking.client.entryNote}
          </Text>
        </View>
      )}

      {/* 요구사항 */}
      {care.booking?.client?.requirements && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.icon }]}>요구사항</Text>
          <Text style={[styles.sectionValue, { color: theme.text }]}>
            {care.booking.client.requirements}
          </Text>
        </View>
      )}

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
        {care.booking?.client?.address && (
          <Pressable
            style={[styles.actionButton, styles.naverMapButton]}
            onPress={() => openNaverMap(care.booking!.client!.address)}
          >
            <Text style={styles.naverMapButtonText}>네이버 지도</Text>
          </Pressable>
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
          <Text style={styles.deleteButtonText}>삭제</Text>
        </Pressable>
      </View>
    </ScrollView>
    {isDeleting && (
      <View style={styles.deletingOverlay}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
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
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  naverMapButton: {
    backgroundColor: '#2DB400',
  },
  naverMapButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
