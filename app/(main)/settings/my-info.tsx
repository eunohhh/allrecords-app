import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/providers/auth-provider';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MyInfoScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

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
  }
});
