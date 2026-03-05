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

// Better Auth (email & password)
// Docs: https://better-auth.com/docs/authentication/email-password
// Note: Depending on server configuration, the response may not match TokenResponse exactly.
// We normalize a few common shapes to keep the app session handling consistent.
export const emailPasswordSignUp = async (params: {
  name: string;
  email: string;
  password: string;
  image?: string;
}): Promise<TokenResponse> => {
  try {
    const response = await api.post('/sign-up/email', params);
    return normalizeTokenResponse(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const emailPasswordSignIn = async (params: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<TokenResponse> => {
  try {
    const response = await api.post('/sign-in/email', params);
    return normalizeTokenResponse(response.data);
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

export const deleteMe = async (token: string): Promise<{ ok: true }> => {
  try {
    const response = await api.delete('/auth/app/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data as { ok: true };
  } catch (error) {
    throw normalizeApiError(error);
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

const normalizeTokenResponse = (data: unknown): TokenResponse => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid auth response');
  }

  const anyData = data as any;
  const payload = anyData?.data ?? anyData;

  const accessToken =
    (typeof payload.accessToken === 'string' && payload.accessToken) ||
    (typeof payload.token === 'string' && payload.token) ||
    (typeof payload.session?.token === 'string' && payload.session.token) ||
    (typeof payload.session?.accessToken === 'string' && payload.session.accessToken);

  const user = (payload.user ?? payload.session?.user) as AppUser | undefined;

  if (!accessToken) {
    // If the server is configured cookie-first, mobile may not get a token.
    // In that case, fail explicitly so we can adjust endpoint config.
    throw new Error('Auth response missing access token');
  }

  if (!user) {
    throw new Error('Auth response missing user');
  }

  return {
    accessToken,
    tokenType: anyData.tokenType ?? 'Bearer',
    expiresIn: typeof anyData.expiresIn === 'number' ? anyData.expiresIn : 0,
    user,
  };
};
