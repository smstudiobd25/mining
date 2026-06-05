'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ExternalLink, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTasks, useCompleteTask, useWatchAdEarn, useUserData } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { AdBanner } from './ad-banner';

export function EarnPage() {
  const { user, updateUser } = useAuth();
  const { data: freshUserData } = useUserData();
  const { data: tasksData, isLoading: tasksLoading } = useTasks();
  const completeTask = useCompleteTask();
  const watchAdEarn = useWatchAdEarn();
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adReward, setAdReward] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use fresh data from API if available, fallback to auth store
  const currentUser = freshUserData || user;
  const dailyLimit = 2;
  const today = new Date().toISOString().split('T')[0];
  const adViewsToday = currentUser?.lastAdViewDate === today ? (currentUser?.adViewsToday ?? 0) : 0;
  const viewsRemaining = dailyLimit - adViewsToday;

  // Sync fresh data to auth store
  React.useEffect(() => {
    if (freshUserData) {
      updateUser({
        nxrBalance: freshUserData.nxrBalance,
        vaultBalance: freshUserData.vaultBalance,
        adViewsToday: freshUserData.adViewsToday,
        lastAdViewDate: freshUserData.lastAdViewDate,
      });
    }
  }, [freshUserData, updateUser]);

  const handleWatchAd = useCallback(() => {
    if (viewsRemaining <= 0) return;
    setShowAdOverlay(true);
    setAdCountdown(5);
    setAdReward(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
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
        nxrBalance: (currentUser?.nxrBalance ?? 0) + result.reward,
        adViewsToday: adViewsToday + 1,
        lastAdViewDate: today,
      });
      setTimeout(() => { setShowAdOverlay(false); setAdReward(null); }, 1500);
    } catch {
      setShowAdOverlay(false);
    }
  }, [watchAdEarn, currentUser, adViewsToday, today, updateUser]);

  React.useEffect(() => {
    if (adCountdown === 0 && showAdOverlay && adReward === null) handleAdComplete();
  }, [adCountdown, showAdOverlay, adReward, handleAdComplete]);

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    try { await completeTask.mutateAsync(taskId); } catch { /* handled */ }
  };

  return (
    <div className="pb-20 px-4 pt-5 space-y-4 max-w-lg mx-auto">
      {/* Ad overlay */}
      <AnimatePresence>
        {showAdOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
            style={{ background: 'radial-gradient(circle at center, #060A14, #030508)' }}
          >
            <div className="text-center space-y-6">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.15))',
                  boxShadow: '0 0 40px rgba(245,158,11,0.15)',
                }}
              >
                <Eye className="w-12 h-12 text-[#F59E0B]" />
              </div>
              {adReward !== null ? (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-2">
                  <p className="text-3xl font-black text-gradient-gold">+{adReward} NXR</p>
                  <p className="text-muted-foreground text-sm">Reward earned!</p>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">Watching Ad...</h3>
                    <p className="text-muted-foreground/60 text-sm">Please wait to earn your reward</p>
                  </div>
                  <div className="text-6xl font-black text-gradient-blue">{adCountdown}</div>
                  <div className="w-52 h-1.5 bg-secondary/50 rounded-full mx-auto overflow-hidden">
                    <motion.div
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }}
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watch Ad & Earn */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 hyper-card-glow"
      >
        <div className="relative z-10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-[#F59E0B]" />
            Watch Ad & Earn
          </h3>
          <div className="text-center space-y-3">
            <Button
              onClick={handleWatchAd}
              disabled={viewsRemaining <= 0 || watchAdEarn.isPending}
              className="px-8 py-5 text-base font-bold rounded-xl text-white"
              style={{
                background: viewsRemaining <= 0
                  ? 'rgba(100,116,139,0.2)'
                  : 'linear-gradient(135deg, #F59E0B, #EF4444)',
                boxShadow: viewsRemaining <= 0 ? 'none' : '0 4px 20px rgba(245,158,11,0.3)',
              }}
            >
              {viewsRemaining <= 0 ? 'Daily Limit Reached' : (<><Eye className="w-5 h-5 mr-2" />Watch Ad</>)}
            </Button>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-[#F59E0B] font-bold">+5 NXR per view</span>
              <span className="text-muted-foreground/50">{adViewsToday}/{dailyLimit} today</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Social Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl p-5 hyper-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-[#3B82F6]" />
            Social Tasks
          </h3>
          {tasksData && (
            <span className="text-[10px] text-muted-foreground/50 font-bold">
              {tasksData.completedCount}/{tasksData.totalCount}
            </span>
          )}
        </div>

        {tasksLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#3B82F6]/20 border-t-[#3B82F6] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasksData?.tasks?.map((task: {
              id: string; title: string; description: string; url: string;
              nxrReward: number; vaultReward: number; completed: boolean;
            }) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                  task.completed
                    ? 'opacity-50'
                    : ''
                }`}
                style={{
                  background: task.completed
                    ? 'rgba(34,197,94,0.03)'
                    : 'linear-gradient(145deg, rgba(8,12,24,0.6), rgba(15,27,54,0.4))',
                  borderColor: task.completed ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.08)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${task.completed ? 'text-muted-foreground line-through' : 'text-white'}`}>
                    {task.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 truncate">{task.description}</p>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA' }}
                    >
                      +{task.nxrReward} NXR
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}
                    >
                      +${task.vaultReward.toFixed(2)} Vault
                    </span>
                  </div>
                </div>
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500/60 flex-shrink-0" />
                ) : (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {task.url && (
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground/50 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={completeTask.isPending}
                      className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs px-3 h-8 font-bold rounded-lg"
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

      <AdBanner position="earn_banner" />
    </div>
  );
}
