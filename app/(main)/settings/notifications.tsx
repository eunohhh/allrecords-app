import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from '@/lib/notification-api';
import { useAuth } from '@/providers/auth-provider';

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = [5, 10, 15, 30, 45, 60, 90, 120];

export default function NotificationsSettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { accessToken } = useAuth();
  const { expoPushToken, isRegistered, error: pushError } = usePushNotifications(accessToken);

  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const data = await getNotificationSettings(accessToken);
      setSettings(data);
    } catch (error) {
      Alert.alert('오류', '설정을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleUpdateSetting = useCallback(
    async (key: keyof NotificationSettings, value: boolean | number) => {
      if (!accessToken || !settings) return;

      const prevSettings = settings;
      setSettings({ ...settings, [key]: value });

      try {
        setIsSaving(true);
        const updated = await updateNotificationSettings(accessToken, { [key]: value });
        setSettings(updated);
      } catch (error) {
        setSettings(prevSettings);
        Alert.alert('오류', '설정 저장에 실패했습니다.');
      } finally {
        setIsSaving(false);
      }
    },
    [accessToken, settings],
  );

  const showHourPicker = useCallback(() => {
    if (!settings) return;

    const options = HOUR_OPTIONS.map((h) => `${h.toString().padStart(2, '0')}:00`);

    if (Platform.OS === 'ios') {
      Alert.alert(
        '오전 알림 시간',
        '알림을 받을 시간을 선택하세요',
        [
          ...HOUR_OPTIONS.filter((h) => h >= 6 && h <= 12).map((h) => ({
            text: `${h.toString().padStart(2, '0')}:00`,
            onPress: () => void handleUpdateSetting('morningAlertHour', h),
          })),
          { text: '취소', style: 'cancel' as const },
        ],
      );
    }
  }, [settings, handleUpdateSetting]);

  const showMinutesPicker = useCallback(() => {
    if (!settings) return;

    if (Platform.OS === 'ios') {
      Alert.alert(
        '사전 알림 시간',
        '케어 몇 분 전에 알림을 받을지 선택하세요',
        [
          ...MINUTE_OPTIONS.map((m) => ({
            text: `${m}분 전`,
            onPress: () => void handleUpdateSetting('beforeMinutes', m),
          })),
          { text: '취소', style: 'cancel' as const },
        ],
      );
    }
  }, [settings, handleUpdateSetting]);

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
        {/* 푸시 토큰 상태 */}
        <View style={[styles.section, { borderColor: theme.icon }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold">푸시 알림 상태</ThemedText>
          </View>
          <View style={styles.statusRow}>
            <Ionicons
              name={isRegistered ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={isRegistered ? '#34C759' : '#FF3B30'}
            />
            <ThemedText style={[styles.statusText, { color: theme.icon }]}>
              {isRegistered
                ? '푸시 알림이 활성화되어 있습니다'
                : pushError || '푸시 알림이 비활성화되어 있습니다'}
            </ThemedText>
          </View>
          {/* {expoPushToken && (
            <ThemedText style={[styles.tokenText, { color: theme.icon }]} numberOfLines={1}>
              토큰: {expoPushToken.slice(0, 30)}...
            </ThemedText>
          )} */}
        </View>

        {/* 알림 설정 */}
        {settings && (
          <>
            <View style={[styles.section, { borderColor: theme.icon }]}>
              <View style={styles.sectionHeader}>
                <ThemedText type="defaultSemiBold">알림 설정</ThemedText>
                {isSaving && <ActivityIndicator size="small" color={theme.tint} />}
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText>알림 활성화</ThemedText>
                  <ThemedText style={[styles.settingDesc, { color: theme.icon }]}>
                    모든 푸시 알림을 켜거나 끕니다
                  </ThemedText>
                </View>
                <Switch
                  value={settings.enabled}
                  onValueChange={(value) => void handleUpdateSetting('enabled', value)}
                  trackColor={{ false: '#767577', true: theme.tint }}
                />
              </View>
            </View>

            <View style={[styles.section, { borderColor: theme.icon, opacity: settings.enabled ? 1 : 0.5 }]}>
              <View style={styles.sectionHeader}>
                <ThemedText type="defaultSemiBold">오전 요약 알림</ThemedText>
              </View>

              <Pressable
                style={styles.settingRow}
                onPress={showHourPicker}
                disabled={!settings.enabled}
              >
                <View style={styles.settingInfo}>
                  <ThemedText>알림 시간</ThemedText>
                  <ThemedText style={[styles.settingDesc, { color: theme.icon }]}>
                    오늘의 케어 일정을 알려드립니다
                  </ThemedText>
                </View>
                <View style={styles.settingValue}>
                  <ThemedText style={{ color: theme.tint }}>
                    {settings.morningAlertHour.toString().padStart(2, '0')}:00
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={theme.icon} />
                </View>
              </Pressable>
            </View>

            <View style={[styles.section, { borderColor: theme.icon, opacity: settings.enabled ? 1 : 0.5 }]}>
              <View style={styles.sectionHeader}>
                <ThemedText type="defaultSemiBold">케어 사전 알림</ThemedText>
              </View>

              <Pressable
                style={styles.settingRow}
                onPress={showMinutesPicker}
                disabled={!settings.enabled}
              >
                <View style={styles.settingInfo}>
                  <ThemedText>사전 알림</ThemedText>
                  <ThemedText style={[styles.settingDesc, { color: theme.icon }]}>
                    케어 시작 전 미리 알림을 받습니다
                  </ThemedText>
                </View>
                <View style={styles.settingValue}>
                  <ThemedText style={{ color: theme.tint }}>{settings.beforeMinutes}분 전</ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={theme.icon} />
                </View>
              </Pressable>
            </View>
          </>
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
  tokenText: {
    fontSize: 11,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
