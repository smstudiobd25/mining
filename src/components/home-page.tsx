'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar, CheckCircle, Flame, Gift, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUserData, useMiningStatus, useStartMining, useClaimMining, useAds } from '@/hooks/use-app-data';
import { CountdownTimer } from './countdown-timer';
import { MiningAnimation } from './mining-animation';
import { AdBanner } from './ad-banner';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  onOpenLeaderboard: () => void;
}

export function HomePage({ onOpenLeaderboard }: HomePageProps) {
  const { user, updateUser } = useAuth();
  const { data: userData, isLoading: userLoading } = useUserData();
  const { data: miningData, isLoading: miningLoading } = useMiningStatus();
  const startMining = useStartMining();
  const claimMining = useClaimMining();
  const [showMiningAnimation, setShowMiningAnimation] = React.useState(false);

  // Sync user data from query to store
  React.useEffect(() => {
    if (userData) {
      updateUser({
        nxrBalance: userData.nxrBalance,
        vaultBalance: userData.vaultBalance,
        miningDays: userData.miningDays,
        tasksCompleted: userData.tasksCompleted,
        streak: userData.streak,
        bestStreak: userData.bestStreak,
        role: userData.role,
      });
    }
  }, [userData, updateUser]);

  const handleStartMining = async () => {
    try {
      await startMining.mutateAsync();
      setShowMiningAnimation(true);
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleClaimReward = async () => {
    try {
      await claimMining.mutateAsync();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const displayName = user?.name || 'User';
  const roleIcon = user?.role?.icon || '🧭';
  const roleName = user?.role?.name || 'Explorer';
  const roleColor = user?.role?.color || '#94A3B8';

  return (
    <div className="pb-20 px-4 pt-4 space-y-4 max-w-lg mx-auto">
      {/* Mining Animation Overlay */}
      {showMiningAnimation && (
        <MiningAnimation onComplete={() => setShowMiningAnimation(false)} />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold text-white">Welcome back,</h2>
          <p className="text-xl font-bold text-white">{displayName}</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
          style={{
            borderColor: `${roleColor}40`,
            backgroundColor: `${roleColor}15`,
          }}
        >
          <span>{roleIcon}</span>
          <span className="text-sm font-medium" style={{ color: roleColor }}>
            {roleName}
          </span>
        </div>
      </motion.div>

      {/* NXR Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-2xl p-5 balance-card"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">NXR Balance</p>
            <p className="text-3xl font-bold text-white mt-1">
              {(user?.nxrBalance ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#2563EB]" />
          </div>
        </div>
      </motion.div>

      {/* Reward Vault Balance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-4 crypto-card"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Reward Vault</p>
            <p className="text-xl font-bold text-white mt-0.5">
              ${(user?.vaultBalance ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Rewards distributed during campaign events
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-[#F59E0B]" />
          </div>
        </div>
      </motion.div>

      {/* Mining Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-5 crypto-card-glow"
      >
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#2563EB]" />
          Mining
        </h3>

        {miningLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
          </div>
        ) : miningData?.canClaim ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">🎉</div>
            <p className="text-white font-medium">Mining Complete!</p>
            <Button
              onClick={handleClaimReward}
              disabled={claimMining.isPending}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-6 text-base font-semibold claim-glow"
            >
              {claimMining.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Claim Reward'
              )}
            </Button>
            {claimMining.isSuccess && claimMining.data && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#2563EB] font-semibold"
              >
                +{claimMining.data.reward} NXR earned!
              </motion.p>
            )}
          </div>
        ) : miningData?.isMining ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-[#2563EB]">
              <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              Mining in progress
            </div>
            <CountdownTimer
              endsAt={miningData.activeSession.endsAt}
              onComplete={() => {}}
            />
            <Button
              onClick={handleStartMining}
              disabled
              className="bg-secondary text-muted-foreground cursor-not-allowed"
            >
              Mining Active...
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">Start mining to earn NXR tokens</p>
            <Button
              onClick={handleStartMining}
              disabled={startMining.isPending}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-6 text-base font-semibold mining-glow"
            >
              {startMining.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Start Mining
                </>
              )}
            </Button>
            {startMining.isError && (
              <p className="text-destructive text-sm">{startMining.error?.message || 'Failed to start mining'}</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="rounded-xl p-3 crypto-card text-center">
          <Calendar className="w-5 h-5 text-[#2563EB] mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{user?.miningDays ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Days</p>
        </div>
        <div className="rounded-xl p-3 crypto-card text-center">
          <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{user?.tasksCompleted ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Tasks</p>
        </div>
        <div className="rounded-xl p-3 crypto-card text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{user?.streak ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Streak</p>
        </div>
      </motion.div>

      {/* Streak display */}
      {(user?.streak ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-white font-medium">
              🔥 {user?.streak} Day Streak
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Best: {user?.bestStreak} days
          </span>
        </motion.div>
      )}

      {/* Ad Banner */}
      <AdBanner position="home_banner" />

      {/* Referral CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl p-4 bg-gradient-to-r from-[#2563EB]/10 to-[#7C3AED]/10 border border-[#2563EB]/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm">Invite friends to earn more NXR</p>
            <p className="text-muted-foreground text-xs">Share your referral code & earn bonuses</p>
          </div>
          <div className="text-[#2563EB] text-lg">→</div>
        </div>
      </motion.div>
    </div>
  );
}
