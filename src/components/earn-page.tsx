'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-app-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdBanner } from './ad-banner';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ExternalLink, Check, Zap, Coins, Eye, Loader2, Gift } from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  nxrReward: number;
  vaultReward: number;
  isActive: boolean;
  completed: boolean;
}

export function EarnPage() {
  const { user, refreshUser } = useAuth();
  const { data, isLoading, refetch } = useTasks();
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adViewsToday, setAdViewsToday] = useState(user?.adViewsToday || 0);
  const [dailyAdLimit, setDailyAdLimit] = useState(2);
  const { toast } = useToast();

  const tasks = (data?.tasks || []) as TaskItem[];

  useEffect(() => {
    // Fetch daily ad limit
    fetch('/api/ads?position=earn_banner')
      .then(res => res.json())
      .then(() => {})
      .catch(() => {});
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    if (!user || completingTasks.has(taskId)) return;
    setCompletingTasks(prev => new Set(prev).add(taskId));
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', userId: user.id, taskId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }
      toast({
        title: '🎉 Task Completed!',
        description: `You earned ${data.reward.nxr} NXR and $${data.reward.vault.toFixed(2)} vault reward!`,
      });
      refetch();
      refreshUser();
    } catch {
      toast({ title: 'Error', description: 'Failed to complete task', variant: 'destructive' });
    } finally {
      setCompletingTasks(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const handleWatchAd = useCallback(async () => {
    if (!user || isWatchingAd) return;
    setIsWatchingAd(true);
    try {
      // Simulate watching an ad for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view_ad', userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Ad Limit', description: data.error, variant: 'destructive' });
        return;
      }
      toast({
        title: '🎉 Ad Reward!',
        description: `You earned ${data.reward} NXR for watching an ad!`,
      });
      setAdViewsToday(data.adViewsToday);
      setDailyAdLimit(data.dailyLimit);
      refreshUser();
    } catch {
      toast({ title: 'Error', description: 'Failed to watch ad', variant: 'destructive' });
    } finally {
      setIsWatchingAd(false);
    }
  }, [user, isWatchingAd, toast, refreshUser]);

  return (
    <div className="pb-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Earn NXR</h2>
        <p className="text-sm text-muted-foreground">Complete tasks and watch ads to earn rewards</p>
      </div>

      {/* Watch Ad & Earn */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Watch Ad & Earn</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Watch a short ad and earn <span className="text-primary font-semibold">5 NXR</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {adViewsToday}/{dailyAdLimit} views today
                </p>
              </div>
              <Button
                onClick={handleWatchAd}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isWatchingAd || adViewsToday >= dailyAdLimit}
              >
                {isWatchingAd ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    Watching...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-1" />
                    Watch
                  </>
                )}
              </Button>
            </div>
            {adViewsToday >= dailyAdLimit && (
              <p className="text-xs text-orange-400 mt-2">Daily ad limit reached. Come back tomorrow!</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Social Tasks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Social Tasks</h3>
          <Badge variant="secondary" className="ml-auto text-xs">
            {tasks.filter(t => t.completed).length}/{tasks.length}
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`bg-card border-border/50 ${task.completed ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground text-sm">{task.title}</h4>
                          {task.completed && (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] px-1.5">
                              <Check className="w-3 h-3 mr-0.5" />
                              Done
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <Coins className="w-3 h-3" />
                            +{task.nxrReward} NXR
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            +${task.vaultReward.toFixed(2)} Vault
                          </span>
                        </div>
                      </div>
                      {task.completed ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-400"
                          disabled
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={completingTasks.has(task.id)}
                        >
                          {completingTasks.has(task.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ExternalLink className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Ad Banner */}
      <AdBanner position="earn_banner" />
    </div>
  );
}
