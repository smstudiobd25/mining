'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Bell, Megaphone, Gift, Users, Settings, CheckCheck, Loader2, AlertCircle } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  isImportant: boolean;
  isActive: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
  system: Settings,
  reward: Gift,
  referral: Users,
  announcement: Megaphone,
  mining: Bell,
};

export function NotificationsPage() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useNotifications();
  const [markingAll, setMarkingAll] = useState(false);
  const { toast } = useToast();

  const notifications = (data?.notifications || []) as NotificationItem[];
  const announcements = (data?.announcements || []) as AnnouncementItem[];
  const unreadCount = data?.unreadCount || 0;

  const handleMarkAllRead = async () => {
    if (!user) return;
    setMarkingAll(true);
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', userId: user.id }),
      });
      refetch();
      toast({ title: 'All notifications marked as read' });
    } catch {
      toast({ title: 'Error', description: 'Failed to mark notifications', variant: 'destructive' });
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    if (!user) return;
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', userId: user.id, notificationId }),
      });
      refetch();
    } catch {
      // silent
    }
  };

  const formatTime = (dateStr: string) => {
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

  return (
    <div className="pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={handleMarkAllRead}
            disabled={markingAll}
          >
            {markingAll ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCheck className="w-4 h-4 mr-1" />}
            Mark all read
          </Button>
        )}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-2">
          {announcements.map((ann) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`border-primary/20 ${ann.isImportant ? 'bg-primary/5' : 'bg-card'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Megaphone className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground text-sm">{ann.title}</h4>
                        {ann.isImportant && (
                          <AlertCircle className="w-3.5 h-3.5 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{ann.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatTime(ann.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Notifications */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start mining and completing tasks to get notified!</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-2">
            {notifications.map((notif, index) => {
              const Icon = typeIcons[notif.type] || Bell;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className={`bg-card border-border/50 cursor-pointer hover:bg-card/80 transition-colors ${
                      !notif.isRead ? 'border-l-2 border-l-primary' : ''
                    }`}
                    onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground text-sm">{notif.title}</h4>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatTime(notif.createdAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
