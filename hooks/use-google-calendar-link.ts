import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';

import { fetchCalendarStatus, formatApiError } from '@/lib/auth-api';

export function useGoogleCalendarLink(
  accessToken: string | null,
  apiBaseUrl: string,
  redirectUrl: string,
) {
  const [isLinked, setIsLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!accessToken) {
      setIsLinked(false);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const { linked } = await fetchCalendarStatus(accessToken);
      setIsLinked(linked);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const linkCalendar = useCallback(async () => {
    if (!accessToken) return;

    try {
      setError(null);
      const linkUrl = `${apiBaseUrl}/auth/app/link/google-calendar?token=${encodeURIComponent(accessToken)}`;
      const result = await WebBrowser.openAuthSessionAsync(linkUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        if (parsed.queryParams?.calendarLinked === 'true') {
          setIsLinked(true);
          return;
        }
        if (parsed.queryParams?.error) {
          setError(String(parsed.queryParams.error));
          return;
        }
        // Fallback: re-check server status
        await refreshStatus();
      }
    } catch (err) {
      setError(formatApiError(err));
    }
  }, [accessToken, apiBaseUrl, redirectUrl, refreshStatus]);

  return { isLinked, isLoading, error, linkCalendar, refreshStatus };
}
