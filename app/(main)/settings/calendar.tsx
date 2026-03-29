import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGoogleCalendarLink } from '@/hooks/use-google-calendar-link';
import { useAuth } from '@/providers/auth-provider';

export default function CalendarSettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { accessToken, apiBaseUrl, redirectUrl } = useAuth();
  const { isLinked, isLoading, error, linkCalendar } = useGoogleCalendarLink(
    accessToken,
    apiBaseUrl,
    redirectUrl,
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 연동 상태 */}
        <View style={[styles.section, { borderColor: theme.icon }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold">Google 캘린더 연동 상태</ThemedText>
          </View>
          <View style={styles.statusRow}>
            <Ionicons
              name={isLinked ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={isLinked ? '#34C759' : '#FF3B30'}
            />
            <ThemedText style={[styles.statusText, { color: theme.icon }]}>
              {isLinked
                ? 'Google 캘린더가 연동되어 있습니다'
                : 'Google 캘린더가 연동되어 있지 않습니다'}
            </ThemedText>
          </View>
        </View>

        {/* 설명 */}
        <View style={[styles.section, { borderColor: theme.icon }]}>
          <View style={styles.descRow}>
            <ThemedText style={[styles.descText, { color: theme.icon }]}>
              연동하면 케어 일정이 자동으로 Google 캘린더에 동기화됩니다. 케어 생성, 수정, 삭제 시
              캘린더에 자동 반영됩니다.
            </ThemedText>
          </View>
        </View>

        {/* 연동 버튼 */}
        {!isLinked && (
          <Pressable
            style={({ pressed }) => [
              styles.linkButton,
              { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={linkCalendar}
          >
            <Ionicons name="logo-google" size={18} color="#fff" />
            <ThemedText style={styles.linkButtonText}>Google 캘린더 연동하기</ThemedText>
          </Pressable>
        )}

        {/* 에러 */}
        {error && (
          <View style={[styles.section, { borderColor: '#FF3B30' }]}>
            <View style={styles.statusRow}>
              <Ionicons name="warning" size={18} color="#FF3B30" />
              <ThemedText style={[styles.statusText, { color: '#FF3B30' }]}>{error}</ThemedText>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    flex: 1,
  },
  descRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  descText: {
    fontSize: 14,
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
