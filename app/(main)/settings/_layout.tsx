import { Stack } from 'expo-router';
import React from 'react';

import CustomHeader from '@/components/ui/custom-header';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options }) => (
          <CustomHeader title={options.title ?? ''} />
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '설정',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: '알림 설정',
          header: ({ options }) => (
            <CustomHeader title={options.title ?? ''} showDrawerToggle showCloseButton />
          ),
        }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{
          title: '개인정보 처리방침',
          header: ({ options }) => (
            <CustomHeader title={options.title ?? ''} showDrawerToggle showCloseButton />
          ),
        }}
      />
      <Stack.Screen
        name="my-info"
        options={{
          title: '내 정보',
          header: ({ options }) => (
            <CustomHeader title={options.title ?? ''} showDrawerToggle showCloseButton />
          ),
        }}
      />
    </Stack>
  );
}
