'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-app-data';
import { AuthScreen } from '@/components/auth-screen';
import { BottomNav, TabId } from '@/components/bottom-nav';
import { HomePage } from '@/components/home-page';
import { EarnPage } from '@/components/earn-page';
import { NotificationsPage } from '@/components/notifications-page';
import { ProfilePage } from '@/components/profile-page';
import { LeaderboardModal } from '@/components/leaderboard-modal';
import { AdminPanel } from '@/components/admin-panel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount || 0;

  // Refresh user data periodically
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshUser();
      const interval = setInterval(refreshUser, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id, refreshUser]);

  // Handle referral code from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem('nexora-ref', ref);
      }
    }
  }, []);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onOpenLeaderboard={() => setShowLeaderboard(true)} />;
      case 'earn':
        return <EarnPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return (
          <ProfilePage
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenAdmin={() => setShowAdmin(true)}
          />
        );
      default:
        return <HomePage onOpenLeaderboard={() => setShowLeaderboard(true)} />;
    }
  };

  return (
    <div className="min-h-screen crypto-bg crypto-grid crypto-nebula">
      <div className="relative z-10">
        {renderPage()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} unreadCount={unreadCount} />
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
