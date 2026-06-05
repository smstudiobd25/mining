'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Megaphone, Gift, Zap, Users, Shield, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkNotificationRead } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';

export function NotificationsPage() {
  const { data: notifData, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  const handleMarkRead = (id: string) => {
    markRead.mutate({ action: 'markRead', notificationId: id });
  };

  const handleMarkAllRead = () => {
    markRead.mutate({ action: 'markAllRead' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'mining': return <Zap className="w-4 h-4 text-[#2563EB]" />;
      case 'task': return <CheckCheck className="w-4 h-4 text-green-500" />;
      case 'referral': return <Users className="w-4 h-4 text-[#7C3AED]" />;
      case 'announcement': return <Megaphone className="w-4 h-4 text-[#F59E0B]" />;
      case 'ad': return <Gift className="w-4 h-4 text-[#06B6D4]" />;
      case 'system': return <Shield className="w-4 h-4 text-[#2563EB]" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const announcements = notifData?.announcements || [];
  const notifications = notifData?.notifications || [];

  return (
    <div className="pb-20 px-4 pt-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Notifications</h2>
        {notifData && notifData.unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-[#2563EB] text-xs"
          >
            <CheckCheck className="w-3 h-3 mr-1" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
            <Megaphone className="w-3 h-3" />
            Announcements
          </h3>
          {announcements.map((ann: {
            id: string;
            title: string;
            message: string;
            isImportant: boolean;
          }) => (
            <div
              key={ann.id}
              className={`rounded-xl p-3 border ${
                ann.isImportant
                  ? 'bg-[#F59E0B]/5 border-[#F59E0B]/20'
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start gap-2">
                <Megaphone className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ann.isImportant ? 'text-[#F59E0B]' : 'text-muted-foreground'}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{ann.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ann.message}</p>
                </div>
                {ann.isImportant && (
                  <span className="text-[10px] bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                    Important
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Notifications */}
      <div className="space-y-2">
        <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Recent
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map((notif: {
              id: string;
              title: string;
              message: string;
              type: string;
              isRead: boolean;
              createdAt: string;
            }) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                className={`rounded-xl p-3 border cursor-pointer transition-all ${
                  notif.isRead
                    ? 'bg-card border-border opacity-60'
                    : 'bg-card border-[#2563EB]/20 hover:border-[#2563EB]/40'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{notif.title}</p>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[#2563EB] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
