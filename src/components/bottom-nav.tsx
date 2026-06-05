'use client';

import { Home, Zap, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'earn', label: 'Earn', icon: Zap },
  { id: 'notifications', label: 'Alerts', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onTabChange, unreadCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 transition-colors ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
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
