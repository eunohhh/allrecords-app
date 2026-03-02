import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { registerPushToken, removePushToken } from '@/lib/notification-api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PushNotificationState = {
  expoPushToken: string | null;
  isRegistered: boolean;
  error: string | null;
};

export function usePushNotifications(accessToken: string | null) {
  const [state, setState] = useState<PushNotificationState>({
    expoPushToken: null,
    isRegistered: false,
    error: null,
  });

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      setState((prev) => ({
        ...prev,
        error: '푸시 알림은 실제 기기에서만 사용 가능합니다.',
      }));
      return null;
    }

    if (Platform.OS !== 'ios') {
      setState((prev) => ({
        ...prev,
        error: '현재 iOS만 지원합니다.',
      }));
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setState((prev) => ({
          ...prev,
          error: '푸시 알림 권한이 거부되었습니다.',
        }));
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        setState((prev) => ({
          ...prev,
          error: 'EAS 프로젝트 ID가 설정되지 않았습니다.',
        }));
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenData.data;

      setState((prev) => ({
        ...prev,
        expoPushToken: token,
        error: null,
      }));

      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '푸시 토큰 발급 실패';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const registerTokenWithServer = useCallback(
    async (pushToken: string) => {
      if (!accessToken) {
        return;
      }

      try {
        await registerPushToken(accessToken, pushToken);
        setState((prev) => ({
          ...prev,
          isRegistered: true,
          error: null,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '서버 토큰 등록 실패';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
      }
    },
    [accessToken],
  );

  const unregisterToken = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      await removePushToken(accessToken);
      setState((prev) => ({
        ...prev,
        isRegistered: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '서버 토큰 삭제 실패';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const setup = async () => {
      const pushToken = await registerForPushNotifications();
      if (pushToken) {
        await registerTokenWithServer(pushToken);
      }
    };

    void setup();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;
      if (data?.type === 'care_reminder' && data?.careId) {
        // TODO: 케어 상세 화면으로 네비게이션
        console.log('Navigate to care:', data.careId);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [accessToken, registerForPushNotifications, registerTokenWithServer]);

  return {
    ...state,
    registerForPushNotifications,
    registerTokenWithServer,
    unregisterToken,
  };
}
