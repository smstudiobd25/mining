'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserRole {
  id: string;
  name: string;
  minReferrals: number;
  miningBoost: number;
  color: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  roleId: string;
  referralCode: string;
  referredBy: string | null;
  nxrBalance: number;
  vaultBalance: number;
  miningDays: number;
  tasksCompleted: number;
  streak: number;
  lastMiningDate: string | null;
  isBanned: boolean;
  isAdmin: boolean;
  adViewsToday: number;
  lastAdViewDate: string | null;
  createdAt: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, referralCode?: string) => Promise<{ success: boolean; error?: string }>;
  guestLogin: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserBalance: (nxr: number, vault: number) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
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

      signup: async (email, password, name, referralCode) => {
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

      guestLogin: async () => {
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
          const res = await fetch(`/api/user?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user });
          }
        } catch {
          // Silent fail on refresh
        }
      },

      updateUserBalance: (nxr, vault) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            nxrBalance: user.nxrBalance + nxr,
            vaultBalance: user.vaultBalance + vault,
          },
        });
      },
    }),
    {
      name: 'nexora-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
