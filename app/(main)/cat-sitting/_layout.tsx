import { Stack } from 'expo-router';

import CustomHeader from '@/components/ui/custom-header';

export default function CatSittingLayout() {
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
          title: '고양이 돌보미',
        }}
      />
      <Stack.Screen
        name="care/[id]"
        options={{
          title: '케어 상세',
          header: ({ options }) => (
            <CustomHeader title={options.title ?? ''} showCloseButton />
          ),
        }}
      />
      <Stack.Screen
        name="bookings"
        options={{
          title: '예약 목록',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="admin"
        options={{
          title: '관리자',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
