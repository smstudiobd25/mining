'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserData {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  isAdmin: boolean;
  roleId: string;
  role: {
    id: string;
    name: string;
    minReferrals: number;
    miningBoost: number;
    color: string;
    icon: string;
  } | null;
  nxrBalance: number;
  vaultBalance: number;
  miningDays: number;
  tasksCompleted: number;
  streak: number;
  bestStreak: number;
  referralCode: string;
  adViewsToday: number;
  lastAdViewDate: string | null;
}

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, referralCode?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<UserData>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', email, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ isLoading: false });
            return { success: false, error: data.error };
          }
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch {
          set({ isLoading: false });
          return { success: false, error: 'Network error' };
        }
      },

      signup: async (email: string, password: string, name: string, referralCode?: string) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'signup', email, password, name, referralCode }),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ isLoading: false });
            return { success: false, error: data.error };
          }
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch {
          set({ isLoading: false });
          return { success: false, error: 'Network error' };
        }
      },

      loginAsGuest: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'guest' }),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ isLoading: false });
            return { success: false, error: data.error };
          }
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch {
          set({ isLoading: false });
          return { success: false, error: 'Network error' };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const res = await fetch('/api/user', {
            headers: { 'x-user-id': user.id },
          });
          if (res.ok) {
            const data = await res.json();
            set({ user: { ...data, role: data.role } });
          }
        } catch {
          // silently fail
        }
      },

      updateUser: (data: Partial<UserData>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...data } });
        }
      },
    }),
    {
      name: 'nexora-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
