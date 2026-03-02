import axios from 'axios';

import { getApiBaseUrl } from './auth-api';

export type NotificationSettings = {
  enabled: boolean;
  morningAlertHour: number;
  beforeMinutes: number;
};

export type UpdateNotificationSettingsInput = {
  enabled?: boolean;
  morningAlertHour?: number;
  beforeMinutes?: number;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const registerPushToken = async (token: string, pushToken: string): Promise<void> => {
  await api.post('/notifications/push-token', { pushToken }, authHeaders(token));
};

export const removePushToken = async (token: string): Promise<void> => {
  await api.post('/notifications/push-token/remove', {}, authHeaders(token));
};

export const getNotificationSettings = async (token: string): Promise<NotificationSettings> => {
  const response = await api.get('/notifications/settings', authHeaders(token));
  return response.data;
};

export const updateNotificationSettings = async (
  token: string,
  data: UpdateNotificationSettingsInput,
): Promise<NotificationSettings> => {
  const response = await api.patch('/notifications/settings', data, authHeaders(token));
  return response.data;
};
