'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Megaphone, Gift, Zap, Users, Shield, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkNotificationRead } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';

export function NotificationsPage() {
  const { data: notifData, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  const handleMarkRead = (id: string) => { markRead.mutate({ action: 'markRead', notificationId: id }); };
  const handleMarkAllRead = () => { markRead.mutate({ action: 'markAllRead' }); };

  const getIcon = (type: string) => {
    switch (type) {
      case 'mining': return <Zap className="w-4 h-4 text-[#3B82F6]" />;
      case 'task': return <CheckCheck className="w-4 h-4 text-green-500" />;
      case 'referral': return <Users className="w-4 h-4 text-[#8B5CF6]" />;
      case 'announcement': return <Megaphone className="w-4 h-4 text-[#F59E0B]" />;
      case 'ad': return <Gift className="w-4 h-4 text-[#06B6D4]" />;
      case 'system': return <Shield className="w-4 h-4 text-[#3B82F6]" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  };

  const announcements = notifData?.announcements || [];
  const notifications = notifData?.notifications || [];

  return (
    <div className="pb-20 px-4 pt-5 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Notifications</h2>
        {notifData && notifData.unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-[#3B82F6] text-xs font-bold">
            <CheckCheck className="w-3 h-3 mr-1" />Mark All Read
          </Button>
        )}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h3 className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Megaphone className="w-3 h-3" />Announcements
          </h3>
          {announcements.map((ann: { id: string; title: string; message: string; isImportant: boolean }) => (
            <div
              key={ann.id}
              className="rounded-xl p-3.5 border"
              style={{
                background: ann.isImportant
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(239,68,68,0.03))'
                  : 'linear-gradient(145deg, rgba(8,12,24,0.6), rgba(15,27,54,0.4))',
                borderColor: ann.isImportant ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.08)',
              }}
            >
              <div className="flex items-start gap-2.5">
                <Megaphone className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ann.isImportant ? 'text-[#F59E0B]' : 'text-muted-foreground/50'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{ann.title}</p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">{ann.message}</p>
                </div>
                {ann.isImportant && (
                  <span className="text-[9px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] px-1.5 py-0.5 rounded-full flex-shrink-0">
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
        <h3 className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">Recent</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#3B82F6]/20 border-t-[#3B82F6] rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground/40 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map((notif: {
              id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string;
            }) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                className="rounded-xl p-3.5 border cursor-pointer transition-all duration-200"
                style={{
                  background: notif.isRead
                    ? 'rgba(8,12,24,0.3)'
                    : 'linear-gradient(145deg, rgba(8,12,24,0.7), rgba(15,27,54,0.4))',
                  borderColor: notif.isRead ? 'rgba(59,130,246,0.04)' : 'rgba(59,130,246,0.12)',
                  opacity: notif.isRead ? 0.5 : 1,
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(59,130,246,0.06)' }}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{notif.title}</p>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[#3B82F6] flex-shrink-0 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/50 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[9px] text-muted-foreground/30 mt-1 font-medium">{timeAgo(notif.createdAt)}</p>
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
