import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { AuthStatus } from '@/providers/auth-provider';
import type { AppUser } from '@/lib/auth-api';

type AuthPanelProps = {
  status: AuthStatus;
  apiBaseUrl: string;
  redirectUrl: string;
  user: AppUser | null;
  accessToken: string | null;
  onLogin: () => void;
  onLogout: () => void;
  onRefresh: () => void;
};

const toneStyles = {
  neutral: {
    background: '#F3F4F6',
    border: '#D1D5DB',
    text: '#111827',
  },
  success: {
    background: '#ECFDF5',
    border: '#A7F3D0',
    text: '#064E3B',
  },
  warning: {
    background: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
  },
  error: {
    background: '#FEF2F2',
    border: '#FECACA',
    text: '#991B1B',
  },
} as const;

const truncateToken = (token: string) => {
  if (token.length <= 18) {
    return token;
  }
  return `${token.slice(0, 10)}…${token.slice(-6)}`;
};

export const AuthPanel = ({
  status,
  apiBaseUrl,
  redirectUrl,
  user,
  accessToken,
  onLogin,
  onLogout,
  onRefresh,
}: AuthPanelProps) => {
  const tone = toneStyles[status.tone];
  const hasSession = Boolean(accessToken);

  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">App Login</ThemedText>

      <View
        style={[
          styles.statusBox,
          { backgroundColor: tone.background, borderColor: tone.border },
        ]}>
        <ThemedText style={[styles.statusText, { color: tone.text }]}>
          {status.label}
        </ThemedText>
        {status.detail ? (
          <ThemedText style={[styles.statusDetail, { color: tone.text }]}>
            {status.detail}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={onLogin}>
          <ThemedText type="defaultSemiBold">Google 로그인</ThemedText>
        </Pressable>
        {hasSession ? (
          <Pressable style={styles.button} onPress={onRefresh}>
            <ThemedText type="defaultSemiBold">프로필 새로고침</ThemedText>
          </Pressable>
        ) : null}
        {hasSession ? (
          <Pressable style={styles.button} onPress={onLogout}>
            <ThemedText type="defaultSemiBold">로그아웃</ThemedText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <ThemedText>{`API: ${apiBaseUrl}`}</ThemedText>
        <ThemedText numberOfLines={1}>{`Redirect: ${redirectUrl}`}</ThemedText>
      </View>

      {user ? (
        <ThemedView style={styles.userCard}>
          <ThemedText type="defaultSemiBold">프로필</ThemedText>
          <ThemedText>{`${user.name} (${user.email})`}</ThemedText>
          <ThemedText numberOfLines={1}>{`id: ${user.id}`}</ThemedText>
        </ThemedView>
      ) : null}

      {accessToken ? (
        <ThemedText numberOfLines={1}>{`token: ${truncateToken(accessToken)}`}</ThemedText>
      ) : null}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  statusBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
  },
  statusDetail: {
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  metaRow: {
    gap: 4,
  },
  userCard: {
    gap: 6,
    padding: 12,
    borderRadius: 12,
  },
});
