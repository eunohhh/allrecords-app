import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  createCare,
  deleteCare,
  getCaresForCalendar,
  toggleCareComplete,
  updateCare,
  type CreateCareInput,
  type SittingCare,
  type UpdateCareInput,
} from '@/lib/sitting-api';

import { useAuth } from './auth-provider';

const KST_OFFSET_HOURS = 9;

type SittingContextValue = {
  cares: SittingCare[];
  isLoading: boolean;
  error: string | null;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  fetchCaresForMonth: (date?: Date) => Promise<void>;
  createCare: (data: CreateCareInput) => Promise<SittingCare>;
  updateCare: (careId: string, data: UpdateCareInput) => Promise<SittingCare>;
  deleteCare: (careId: string) => Promise<void>;
  toggleComplete: (careId: string) => Promise<SittingCare>;
  getCaresByDate: (dateString: string) => SittingCare[];
};

const SittingContext = createContext<SittingContextValue | null>(null);

export const SittingProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useAuth();
  const [cares, setCares] = useState<SittingCare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());

  const fetchCaresForMonth = useCallback(
    async (date?: Date) => {
      if (!accessToken) return;

      const targetDate = date ?? selectedMonth;
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();

      // 달력에 표시할 범위: KST 기준 이전달 마지막 주 ~ 다음달 첫 주
      const kstOffsetMs = KST_OFFSET_HOURS * 60 * 60 * 1000;
      const kstMonthStartUtc = new Date(Date.UTC(year, month, 1, -KST_OFFSET_HOURS));
      const startDay = new Date(kstMonthStartUtc.getTime() + kstOffsetMs).getUTCDay();
      const from = new Date(kstMonthStartUtc);
      from.setUTCDate(from.getUTCDate() - startDay); // KST 기준 해당 주의 일요일

      const kstMonthEndUtc = new Date(
        Date.UTC(year, month + 1, 0, 23 - KST_OFFSET_HOURS, 59, 59, 999),
      );
      const endDay = new Date(kstMonthEndUtc.getTime() + kstOffsetMs).getUTCDay();
      const to = new Date(kstMonthEndUtc);
      to.setUTCDate(to.getUTCDate() + (6 - endDay)); // KST 기준 해당 주의 토요일

      try {
        setIsLoading(true);
        setError(null);
        const data = await getCaresForCalendar(accessToken, from.toISOString(), to.toISOString());
        setCares(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cares');
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, selectedMonth],
  );

  const handleCreateCare = useCallback(
    async (data: CreateCareInput): Promise<SittingCare> => {
      if (!accessToken) throw new Error('Not authenticated');
      const newCare = await createCare(accessToken, data);
      await fetchCaresForMonth();
      return newCare;
    },
    [accessToken, fetchCaresForMonth],
  );

  const handleUpdateCare = useCallback(
    async (careId: string, data: UpdateCareInput): Promise<SittingCare> => {
      if (!accessToken) throw new Error('Not authenticated');
      const updated = await updateCare(accessToken, careId, data);
      await fetchCaresForMonth();
      return updated;
    },
    [accessToken, fetchCaresForMonth],
  );

  const handleDeleteCare = useCallback(
    async (careId: string): Promise<void> => {
      if (!accessToken) throw new Error('Not authenticated');
      await deleteCare(accessToken, careId);
      await fetchCaresForMonth();
    },
    [accessToken, fetchCaresForMonth],
  );

  const handleToggleComplete = useCallback(
    async (careId: string): Promise<SittingCare> => {
      if (!accessToken) throw new Error('Not authenticated');
      const updated = await toggleCareComplete(accessToken, careId);
      // 로컬 상태 즉시 업데이트 (낙관적 업데이트)
      setCares((prev) => prev.map((c) => (c.id === careId ? updated : c)));
      return updated;
    },
    [accessToken],
  );

  const getCaresByDate = useCallback(
    (dateString: string): SittingCare[] => {
      // dateString: "2026-01-25" 형식
      return cares.filter((care) => {
        const careDate = new Date(care.careTime);
        const localDate = careDate.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: 'Asia/Seoul',
        });
        // "2026. 01. 25." -> "2026-01-25"
        const formatted = localDate.replace(/\. /g, '-').replace('.', '');
        return formatted === dateString;
      });
    },
    [cares],
  );

  const handleSetSelectedMonth = useCallback(
    (date: Date) => {
      setSelectedMonth(date);
    },
    [],
  );

  const value = useMemo<SittingContextValue>(
    () => ({
      cares,
      isLoading,
      error,
      selectedMonth,
      setSelectedMonth: handleSetSelectedMonth,
      fetchCaresForMonth,
      createCare: handleCreateCare,
      updateCare: handleUpdateCare,
      deleteCare: handleDeleteCare,
      toggleComplete: handleToggleComplete,
      getCaresByDate,
    }),
    [
      cares,
      isLoading,
      error,
      selectedMonth,
      handleSetSelectedMonth,
      fetchCaresForMonth,
      handleCreateCare,
      handleUpdateCare,
      handleDeleteCare,
      handleToggleComplete,
      getCaresByDate,
    ],
  );

  return <SittingContext.Provider value={value}>{children}</SittingContext.Provider>;
};

export const useSitting = () => {
  const context = useContext(SittingContext);
  if (!context) {
    throw new Error('useSitting must be used within SittingProvider');
  }
  return context;
};
