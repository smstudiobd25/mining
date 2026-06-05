'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Helper to get user ID from auth store
function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('nexora-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.user?.id || null;
    }
  } catch {
    // ignore
  }
  return null;
}

// Fetch user data
export function useUserData() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/user', {
        headers: { 'x-user-id': userId },
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    refetchInterval: 30000,
    enabled: !!getUserId(),
  });
}

// Mining status
export function useMiningStatus() {
  return useQuery({
    queryKey: ['mining'],
    queryFn: async () => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/mining', {
        headers: { 'x-user-id': userId },
      });
      if (!res.ok) throw new Error('Failed to fetch mining status');
      return res.json();
    },
    refetchInterval: 10000,
    enabled: !!getUserId(),
  });
}

// Start mining mutation
export function useStartMining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/mining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ action: 'start' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start mining');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mining'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Claim mining reward
export function useClaimMining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/mining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ action: 'claim' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to claim reward');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mining'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Tasks
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/tasks', {
        headers: { 'x-user-id': userId },
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    enabled: !!getUserId(),
  });
}

// Complete task mutation
export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ taskId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to complete task');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Notifications
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/notifications', {
        headers: { 'x-user-id': userId },
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    refetchInterval: 30000,
    enabled: !!getUserId(),
  });
}

// Mark notification read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ action, notificationId }: { action: string; notificationId?: string }) => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ action, notificationId }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Referrals
export function useReferrals() {
  return useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/referrals', {
        headers: { 'x-user-id': userId },
      });
      if (!res.ok) throw new Error('Failed to fetch referrals');
      return res.json();
    },
    enabled: !!getUserId(),
  });
}

// Leaderboard
export function useLeaderboard(period: string = 'all') {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const userId = getUserId();
      const res = await fetch(`/api/leaderboard?period=${period}&userId=${userId || ''}`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json();
    },
  });
}

// Ads
export function useAds(position: string = 'home_banner') {
  return useQuery({
    queryKey: ['ads', position],
    queryFn: async () => {
      const res = await fetch(`/api/ads?position=${position}`);
      if (!res.ok) throw new Error('Failed to fetch ads');
      return res.json();
    },
  });
}

// Watch ad & earn mutation
export function useWatchAdEarn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ action: 'watch_earn' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Settings
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });
}

// Admin
export function useAdminData(section: string) {
  return useQuery({
    queryKey: ['admin', section],
    queryFn: async () => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch(`/api/admin?section=${section}`, {
        headers: { 'x-user-id': userId },
      });
      if (!res.ok) throw new Error('Failed to fetch admin data');
      return res.json();
    },
    enabled: !!getUserId(),
  });
}

export function useAdminAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ section, action, data }: { section: string; action: string; data?: Record<string, unknown> }) => {
      const userId = getUserId();
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ section, action, data }),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', variables.section] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
