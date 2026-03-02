import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

export type TokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AppUser;
};

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

const STORAGE_KEY = 'app_access_token';

export const getApiBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

export const getStoredToken = () => SecureStore.getItemAsync(STORAGE_KEY);

export const setStoredToken = (token: string) => SecureStore.setItemAsync(STORAGE_KEY, token);

export const clearStoredToken = () => SecureStore.deleteItemAsync(STORAGE_KEY);

export const exchangeCode = async (code: string): Promise<TokenResponse> => {
  try {
    const response = await api.post('/auth/app/token', { code });
    return response.data as TokenResponse;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const reviewLogin = async (email: string, password: string): Promise<TokenResponse> => {
  try {
    const response = await api.post('/auth/app/review', { email, password });
    return response.data as TokenResponse;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const fetchMe = async (token: string): Promise<AppUser | null> => {
  try {
    const response = await api.get('/auth/app/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data as AppUser;
  } catch (error) {
    const apiError = normalizeApiError(error);
    if (apiError.status === 401) {
      return null;
    }
    throw apiError;
  }
};

export const formatApiError = (error: unknown): string => {
  const apiError = normalizeApiError(error);
  if (apiError.code) {
    return `${apiError.code}: ${apiError.message}`;
  }
  if (apiError.status) {
    return `${apiError.message} (${apiError.status})`;
  }
  return apiError.message;
};

const normalizeApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; code?: string }>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;
    const message = data?.message || axiosError.message || 'Request failed';
    return {
      message,
      status,
      code: data?.code,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'Unknown error' };
};
