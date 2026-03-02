import { Tabs } from 'expo-router';
import React from 'react';

import CustomHeader from '@/components/ui/custom-header';

export default function HomeLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: 'none' },
        header: ({ options }) => (
          <CustomHeader title={options.title ?? 'Home'} />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
        }}
      />
    </Tabs>
  );
}
