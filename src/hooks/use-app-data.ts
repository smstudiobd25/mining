'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './use-auth';

// Generic fetch hook
function useFetch<T>(url: string | null, options?: { enabled?: boolean }) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled !== false;

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch');
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setIsLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useMiningStatus() {
  const { user } = useAuth();
  const url = user ? `/api/mining?userId=${user.id}` : null;
  // We use POST for mining status, so we'll use a custom approach
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/mining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', userId: user.id }),
      });
      const data = await res.json();
      setSession(data.session);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { session, isLoading, refetch: fetchStatus };
}

export function useTasks() {
  const { user } = useAuth();
  return useFetch<{
    tasks: Array<Record<string, unknown>>;
  }>(user ? `/api/tasks?userId=${user.id}` : null);
}

export function useNotifications() {
  const { user } = useAuth();
  return useFetch<{
    notifications: Array<Record<string, unknown>>;
    announcements: Array<Record<string, unknown>>;
    unreadCount: number;
  }>(user ? `/api/notifications?userId=${user.id}` : null);
}

export function useReferrals() {
  const { user } = useAuth();
  return useFetch<Record<string, unknown>>(user ? `/api/referrals?userId=${user.id}` : null);
}

export function useLeaderboard(period: string = 'all') {
  const { user } = useAuth();
  return useFetch<{
    leaderboard: Array<Record<string, unknown>>;
  }>(user ? `/api/leaderboard?period=${period}&userId=${user.id}` : null);
}

export function useAds(position?: string) {
  const url = position ? `/api/ads?position=${position}` : '/api/ads';
  return useFetch<{ ads: Array<Record<string, unknown>> }>(url);
}
