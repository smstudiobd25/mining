'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Clock, ExternalLink, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTasks, useCompleteTask, useWatchAdEarn, useAds } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { AdBanner } from './ad-banner';

export function EarnPage() {
  const { user, updateUser } = useAuth();
  const { data: tasksData, isLoading: tasksLoading } = useTasks();
  const completeTask = useCompleteTask();
  const watchAdEarn = useWatchAdEarn();
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adReward, setAdReward] = useState<number | null>(null);

  // Get daily ad limit from settings
  const dailyLimit = 2;
  const today = new Date().toISOString().split('T')[0];
  const adViewsToday = user?.lastAdViewDate === today ? (user?.adViewsToday ?? 0) : 0;
  const viewsRemaining = dailyLimit - adViewsToday;

  const handleWatchAd = useCallback(() => {
    if (viewsRemaining <= 0) return;
    setShowAdOverlay(true);
    setAdCountdown(5);
    setAdReward(null);

    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [viewsRemaining]);

  const handleAdComplete = useCallback(async () => {
    try {
      const result = await watchAdEarn.mutateAsync();
      setAdReward(result.reward);
      updateUser({
        nxrBalance: (user?.nxrBalance ?? 0) + result.reward,
        adViewsToday: adViewsToday + 1,
        lastAdViewDate: today,
      });
      setTimeout(() => {
        setShowAdOverlay(false);
        setAdReward(null);
      }, 1500);
    } catch {
      setShowAdOverlay(false);
    }
  }, [watchAdEarn, user, adViewsToday, today, updateUser]);

  React.useEffect(() => {
    if (adCountdown === 0 && showAdOverlay && adReward === null) {
      handleAdComplete();
    }
  }, [adCountdown, showAdOverlay, adReward, handleAdComplete]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask.mutateAsync(taskId);
    } catch {
      // handled by mutation
    }
  };

  return (
    <div className="pb-20 px-4 pt-4 space-y-4 max-w-lg mx-auto">
      {/* Ad overlay */}
      <AnimatePresence>
        {showAdOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0A0F1C] flex flex-col items-center justify-center p-6"
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-[#2563EB]/20 flex items-center justify-center mx-auto">
                <Eye className="w-10 h-10 text-[#2563EB]" />
              </div>

              {adReward !== null ? (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-2"
                >
                  <p className="text-2xl font-bold text-white">+{adReward} NXR</p>
                  <p className="text-muted-foreground">Reward earned!</p>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Watching Ad...</h3>
                    <p className="text-muted-foreground text-sm">Please wait to earn your reward</p>
                  </div>
                  <div className="text-5xl font-bold text-[#2563EB]">{adCountdown}</div>
                  <div className="w-48 h-1.5 bg-secondary rounded-full mx-auto overflow-hidden">
                    <motion.div
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                      className="h-full bg-[#2563EB] rounded-full"
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 1: Watch Ad & Earn */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 bg-card border border-border"
      >
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#F59E0B]" />
          Watch Ad & Earn
        </h3>

        <div className="text-center space-y-3">
          <Button
            onClick={handleWatchAd}
            disabled={viewsRemaining <= 0 || watchAdEarn.isPending}
            className="bg-gradient-to-r from-[#F59E0B] to-[#EF4444] hover:opacity-90 text-white px-6 py-5 text-base font-semibold"
          >
            {viewsRemaining <= 0 ? (
              'Daily Limit Reached'
            ) : (
              <>
                <Eye className="w-5 h-5 mr-2" />
                Watch Ad
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-[#F59E0B] font-medium">+5 NXR per view</span>
            <span className="text-muted-foreground">
              {adViewsToday}/{dailyLimit} views today
            </span>
          </div>
        </div>
      </motion.div>

      {/* Section 2: Social Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 bg-card border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#2563EB]" />
            Social Tasks
          </h3>
          {tasksData && (
            <span className="text-xs text-muted-foreground">
              {tasksData.completedCount}/{tasksData.totalCount} completed
            </span>
          )}
        </div>

        {tasksLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {tasksData?.tasks?.map((task: {
              id: string;
              title: string;
              description: string;
              url: string;
              nxrReward: number;
              vaultReward: number;
              completed: boolean;
            }) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-secondary/50 border-border card-hover'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-white'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#2563EB] font-medium">+{task.nxrReward} NXR</span>
                    <span className="text-xs text-[#F59E0B] font-medium">+${task.vaultReward.toFixed(2)} Vault</span>
                  </div>
                </div>
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {task.url && (
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={completeTask.isPending}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs px-3 h-8"
                    >
                      Go
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Ad Banner */}
      <AdBanner position="earn_banner" />
    </div>
  );
}
