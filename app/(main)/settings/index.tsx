import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SettingsItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
};

function SettingsItem({ icon, title, onPress }: SettingsItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={theme.tint} style={styles.itemIcon} />
        <ThemedText style={styles.itemTitle}>{title}</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.icon} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.section, { backgroundColor: theme.background, borderColor: theme.icon }]}>
        <SettingsItem
          icon="notifications-outline"
          title="알림 설정"
          onPress={() => router.push('/settings/notifications' as Href)}
        />
        <SettingsItem
          icon="document-text-outline"
          title="개인정보 처리방침"
          onPress={() => router.push('/settings/privacy-policy' as Href)}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
  },
});
