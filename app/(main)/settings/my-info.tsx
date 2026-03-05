import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/providers/auth-provider';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MyInfoScreen() {
  const { user, deleteAccount } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [isDeleting, setIsDeleting] = useState(false);

  const onPressDeleteAccount = useCallback(() => {
    Alert.alert(
      '계정을 삭제할까요?',
      '계정을 삭제하면 복구할 수 없어요. 계속 진행할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            if (isDeleting) return;
            setIsDeleting(true);
            try {
              await deleteAccount();
            } catch (error) {
              // auth-provider에서 status로도 관리하지만, 사용자에게 즉시 표시
              Alert.alert('계정 삭제 실패', error instanceof Error ? error.message : '알 수 없는 오류');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }, [deleteAccount, isDeleting]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Image
            source={{ uri: user?.image || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <ThemedText type="title" style={styles.name}>{user?.name || 'User Name'}</ThemedText>
          <ThemedText style={[styles.email, { color: theme.icon }]}>{user?.email || 'user@example.com'}</ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.item}>
            <ThemedText type="defaultSemiBold">User ID</ThemedText>
            <ThemedText style={{ color: theme.icon, fontSize: 10 }}>{user?.id}</ThemedText>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.icon, opacity: 0.2 }]} />

          <View style={styles.item}>
            <ThemedText type="defaultSemiBold">Provider</ThemedText>
            <ThemedText style={{ color: theme.icon }}>Google</ThemedText>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.icon, opacity: 0.2 }]} />

          <View style={styles.item}>
            <ThemedText type="defaultSemiBold">Role</ThemedText>
            <ThemedText style={{ color: theme.icon }}>{user?.role}</ThemedText>
          </View>
        </View>

        <View style={[styles.dangerSection, { borderColor: theme.icon, backgroundColor: theme.background }]}>
          <ThemedText type="defaultSemiBold" style={styles.dangerTitle}>
            계정 관리
          </ThemedText>
          <ThemedText style={{ color: theme.icon, opacity: 0.9 }}>
            계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
          </ThemedText>
          <Pressable
            onPress={onPressDeleteAccount}
            disabled={isDeleting}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && { opacity: 0.8 },
              isDeleting && { opacity: 0.5 },
            ]}
          >
            <ThemedText style={styles.deleteButtonText}>
              {isDeleting ? '삭제 중…' : '계정 삭제'}
            </ThemedText>
          </Pressable>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    gap: 32,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  name: {
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  separator: {
    height: 1,
    width: '100%',
  },
  dangerSection: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  dangerTitle: {
    fontSize: 14,
  },
  deleteButton: {
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#E53935',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
