'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-app-data';
import { AuthScreen } from '@/components/auth-screen';
import { BottomNav } from '@/components/bottom-nav';
import { HomePage } from '@/components/home-page';
import { EarnPage } from '@/components/earn-page';
import { NotificationsPage } from '@/components/notifications-page';
import { ProfilePage } from '@/components/profile-page';
import { AdminPanel } from '@/components/admin-panel';

export default function NexoraApp() {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount || 0;

  // Refresh user data periodically
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshUser();
    const interval = setInterval(refreshUser, 60000); // Every minute
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUser]);

  // Check for referral code in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        sessionStorage.setItem('nexora-referral', ref);
      }
    }
  }, []);

  if (!isAuthenticated || !user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-4 pb-20">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'earn' && <EarnPage />}
        {activeTab === 'notifications' && <NotificationsPage />}
        {activeTab === 'profile' && (
          <ProfilePage onOpenAdmin={() => setShowAdmin(true)} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
      />

      {/* Admin Panel */}
      <AdminPanel
        open={showAdmin}
        onClose={() => setShowAdmin(false)}
      />
    </div>
  );
}
