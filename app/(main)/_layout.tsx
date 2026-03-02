import { Drawer } from 'expo-router/drawer';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CustomDrawerContent } from '@/components/custom-drawer-content';
import { useAuth } from '@/providers/auth-provider';

export default function MainLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: theme.tint,
        drawerType: 'front',
      }}
    >
      <Drawer.Screen
        name="(home)"
        options={{
          drawerLabel: '홈',
          title: '홈',
        }}
      />
      <Drawer.Screen
        name="cat-sitting"
        options={{
          drawerLabel: '고양이 돌보미',
          title: '고양이 돌보미',
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: '설정',
          title: '설정',
        }}
      />
    </Drawer>
  );
}