import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { SittingProvider } from '@/providers/sitting-provider';

export const unstable_settings = {
  anchor: '(main)',
};

function PushNotificationHandler({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  usePushNotifications(accessToken);
  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <PushNotificationHandler>
          <SittingProvider>
            <Stack>
              <Stack.Screen name="(main)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </SittingProvider>
        </PushNotificationHandler>
      </AuthProvider>
    </ThemeProvider>
  );
}
