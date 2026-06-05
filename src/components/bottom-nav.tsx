'use client';

import React from 'react';
import { Home, Zap, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'home' | 'earn' | 'notifications' | 'profile';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  unreadCount: number;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'earn', label: 'Earn', icon: Zap },
  { id: 'notifications', label: 'Alerts', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onTabChange, unreadCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 nav-glass pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-5 min-w-[68px] transition-all duration-200"
            >
              {isActive && (
                <motion.div
                  layoutId="navGlow"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-10 h-1 nav-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive ? 'text-[#3B82F6] drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-muted-foreground'
                  }`}
                  fill={isActive ? 'currentColor' : 'none'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-[#EF4444] rounded-full text-[9px] text-white flex items-center justify-center font-bold px-1 shadow-lg shadow-[#EF4444]/30">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-semibold transition-all duration-200 ${
                  isActive ? 'text-[#3B82F6]' : 'text-muted-foreground/60'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
