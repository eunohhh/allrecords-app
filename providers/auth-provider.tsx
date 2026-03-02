import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  clearStoredToken,
  exchangeCode,
  fetchMe,
  formatApiError,
  getApiBaseUrl,
  getStoredToken,
  setStoredToken,
  reviewLogin,
  type AppUser,
} from '@/lib/auth-api';

type StatusTone = 'neutral' | 'success' | 'warning' | 'error';

export type AuthStatus = {
  tone: StatusTone;
  label: string;
  detail?: string;
};

type AuthContextValue = {
  apiBaseUrl: string;
  redirectUrl: string;
  status: AuthStatus;
  accessToken: string | null;
  user: AppUser | null;
  isLoading: boolean;
  startGoogleLogin: () => Promise<void>;
  startAppleLogin: () => Promise<void>;
  startReviewLogin: (email: string, password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const redirectUrl = useMemo(() => Linking.createURL('auth/callback'), []);

  const [status, setStatus] = useState<AuthStatus>({ tone: 'neutral', label: 'idle' });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastCodeRef = useRef<string | null>(null);

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  const setErrorStatus = useCallback((message: string) => {
    setStatus({
      tone: 'error',
      label: 'login error',
      detail: message,
    });
  }, []);

  const clearSession = useCallback(async () => {
    await clearStoredToken();
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(
    async (tokenOverride?: string) => {
      const token = tokenOverride ?? accessToken;
      if (!token) {
        setStatus({ tone: 'warning', label: 'missing token' });
        return;
      }

      try {
        setStatus({ tone: 'neutral', label: 'fetching profile...' });
        const profile = await fetchMe(token);
        if (!profile) {
          await clearSession();
          setStatus({ tone: 'warning', label: 'session expired' });
          return;
        }
        setUser(profile);
        setStatus({ tone: 'success', label: 'authenticated' });
      } catch (error) {
        setErrorStatus(formatApiError(error));
      }
    },
    [accessToken, clearSession, setErrorStatus],
  );

  const exchangeCodeAndStore = useCallback(
    async (code: string) => {
      if (lastCodeRef.current === code) {
        return;
      }
      lastCodeRef.current = code;

      try {
        setStatus({ tone: 'neutral', label: 'exchanging code...' });
        const data = await exchangeCode(code);
        await setStoredToken(data.accessToken);
        setAccessToken(data.accessToken);
        setUser(data.user);
        await refreshProfile(data.accessToken);
      } catch (error) {
        setErrorStatus(formatApiError(error));
      }
    },
    [refreshProfile, setErrorStatus],
  );

  const handleRedirect = useCallback(
    (url: string) => {
      const parsed = Linking.parse(url);
      const error = parsed.queryParams?.error;
      const code = parsed.queryParams?.code;

      if (typeof error === 'string') {
        const errorMessage =
          error === 'unauthorized_email' ? '허용되지 않은 계정입니다' : error;
        setErrorStatus(errorMessage);
        return;
      }

      if (typeof code === 'string') {
        void exchangeCodeAndStore(code);
      }
    },
    [exchangeCodeAndStore, setErrorStatus],
  );

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => handleRedirect(url));

    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          handleRedirect(url);
        }
      })
      .catch(() => {});

    return () => {
      subscription.remove();
    };
  }, [handleRedirect]);

  useEffect(() => {
    let isActive = true;
    const bootstrap = async () => {
      try {
        setStatus({ tone: 'neutral', label: 'restoring session...' });
        const stored = await getStoredToken();
        if (!stored || !isActive) {
          setStatus({ tone: 'neutral', label: 'idle' });
          setIsLoading(false);
          return;
        }
        setAccessToken(stored);
        await refreshProfile(stored);
      } catch {
        setStatus({ tone: 'neutral', label: 'idle' });
      } finally {
        if (isActive) {
            setIsLoading(false);
        }
      }
    };

    void bootstrap();
    return () => {
      isActive = false;
    };
  }, [refreshProfile]);

  const startGoogleLogin = useCallback(async () => {
    try {
      setStatus({ tone: 'neutral', label: 'starting login...' });
      const loginUrl = `${apiBaseUrl}/auth/app/login/google`;
      const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        handleRedirect(result.url);
        return;
      }

      if (result.type === 'cancel') {
        setStatus({ tone: 'warning', label: 'login cancelled' });
        return;
      }

      setStatus({ tone: 'warning', label: `login ended: ${result.type}` });
    } catch (error) {
      setErrorStatus(formatApiError(error));
    }
  }, [apiBaseUrl, handleRedirect, redirectUrl, setErrorStatus]);

  const startAppleLogin = useCallback(async () => {
    try {
      setStatus({ tone: 'neutral', label: 'starting login...' });
      const loginUrl = `${apiBaseUrl}/auth/app/login/apple`;
      const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        handleRedirect(result.url);
        return;
      }

      if (result.type === 'cancel') {
        setStatus({ tone: 'warning', label: 'login cancelled' });
        return;
      }

      setStatus({ tone: 'warning', label: `login ended: ${result.type}` });
    } catch (error) {
      setErrorStatus(formatApiError(error));
    }
  }, [apiBaseUrl, handleRedirect, redirectUrl, setErrorStatus]);

  const startReviewLogin = useCallback(
    async (email: string, password: string) => {
      try {
        setStatus({ tone: 'neutral', label: 'logging in...' });
        const data = await reviewLogin(email, password);
        await setStoredToken(data.accessToken);
        setAccessToken(data.accessToken);
        setUser(data.user);
        setStatus({ tone: 'success', label: 'authenticated' });
      } catch (error) {
        setErrorStatus(formatApiError(error));
      }
    },
    [setErrorStatus],
  );

  const logout = useCallback(async () => {
    await clearSession();
    setStatus({ tone: 'neutral', label: 'logged out' });
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      apiBaseUrl,
      redirectUrl,
      status,
      accessToken,
      user,
      isLoading,
      startGoogleLogin,
      startAppleLogin,
      startReviewLogin,
      refreshProfile: () => refreshProfile(),
      logout,
    }),
    [apiBaseUrl, redirectUrl, status, accessToken, user, isLoading, startGoogleLogin, startAppleLogin, startReviewLogin, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
