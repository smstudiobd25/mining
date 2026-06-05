'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar, CheckCircle, Flame, Gift, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUserData, useMiningStatus, useStartMining, useClaimMining } from '@/hooks/use-app-data';
import { CountdownTimer } from './countdown-timer';
import { MiningAnimation } from './mining-animation';
import { AdBanner } from './ad-banner';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  onOpenLeaderboard: () => void;
}

export function HomePage({ onOpenLeaderboard }: HomePageProps) {
  const { user, updateUser } = useAuth();
  const { data: userData } = useUserData();
  const { data: miningData, isLoading: miningLoading } = useMiningStatus();
  const startMining = useStartMining();
  const claimMining = useClaimMining();
  const [showMiningAnimation, setShowMiningAnimation] = React.useState(false);

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
    } catch (err) { /* handled */ }
  };

  const handleClaimReward = async () => {
    try {
      await claimMining.mutateAsync();
    } catch (err) { /* handled */ }
  };

  const displayName = user?.name || 'User';
  const roleIcon = user?.role?.icon || '🧭';
  const roleName = user?.role?.name || 'Explorer';
  const roleColor = user?.role?.color || '#64748B';

  return (
    <div className="pb-20 px-4 pt-5 space-y-4 max-w-lg mx-auto">
      {showMiningAnimation && (
        <MiningAnimation onComplete={() => setShowMiningAnimation(false)} />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-muted-foreground font-medium">Welcome back,</p>
          <h2 className="text-xl font-bold text-white">{displayName}</h2>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border badge-glow"
          style={{
            borderColor: `${roleColor}35`,
            backgroundColor: `${roleColor}12`,
          }}
        >
          <span className="text-sm">{roleIcon}</span>
          <span className="text-xs font-bold" style={{ color: roleColor }}>{roleName}</span>
        </div>
      </motion.div>

      {/* NXR Balance Card - PREMIUM */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="relative rounded-2xl p-6 balance-card"
      >
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs text-blue-300/60 font-semibold uppercase tracking-wider">NXR Balance</p>
            <p className="text-4xl font-black text-white mt-1.5 tracking-tight">
              {(user?.nxrBalance ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1">Nexora Network Token</p>
          </div>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.2))',
              boxShadow: '0 0 30px rgba(59,130,246,0.15)',
            }}
          >
            <Zap className="w-7 h-7 text-[#60A5FA]" />
          </div>
        </div>
      </motion.div>

      {/* Reward Vault */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-2xl p-4 hyper-card"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground/70 font-semibold uppercase tracking-wider">Reward Vault</p>
            <p className="text-2xl font-bold text-white mt-1">
              <span className="text-gradient-gold">${(user?.vaultBalance ?? 0).toFixed(2)}</span>
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5">Distribution details announced in the future</p>
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.15))' }}
          >
            <Gift className="w-5 h-5 text-[#F59E0B]" />
          </div>
        </div>
      </motion.div>

      {/* Mining Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="rounded-2xl p-5 hyper-card-glow"
      >
        <div className="relative z-10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-[#3B82F6]" />
            Mining
          </h3>

          {miningLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#3B82F6]/20 border-t-[#3B82F6] rounded-full animate-spin" />
            </div>
          ) : miningData?.canClaim ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <p className="text-white font-bold text-lg">Mining Complete!</p>
              <Button
                onClick={handleClaimReward}
                disabled={claimMining.isPending}
                className="btn-hyper text-white px-10 py-6 text-base font-bold claim-glow rounded-xl"
              >
                {claimMining.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Claim Reward'}
              </Button>
              {claimMining.isSuccess && claimMining.data && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gradient-blue font-bold text-lg"
                >
                  +{claimMining.data.reward} NXR earned!
                </motion.p>
              )}
            </div>
          ) : miningData?.isMining ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                <span className="text-[#60A5FA] font-semibold">Mining in progress</span>
              </div>
              <CountdownTimer endsAt={miningData.activeSession.endsAt} onComplete={() => {}} />
              <Button disabled className="bg-secondary/50 text-muted-foreground/50 cursor-not-allowed rounded-xl">
                Mining Active...
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground/60 text-sm">Start mining to earn NXR tokens</p>
              <Button
                onClick={handleStartMining}
                disabled={startMining.isPending}
                className="btn-hyper text-white px-10 py-6 text-base font-bold mining-glow rounded-xl"
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
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-2.5"
      >
        {[
          { icon: Calendar, color: '#3B82F6', value: user?.miningDays ?? 0, label: 'Days' },
          { icon: CheckCircle, color: '#22C55E', value: user?.tasksCompleted ?? 0, label: 'Tasks' },
          { icon: Flame, color: '#F97316', value: user?.streak ?? 0, label: 'Streak' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-3.5 stat-card text-center">
            <stat.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: stat.color }} />
            <p className="text-xl font-black text-white">{stat.value}</p>
            <p className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Streak banner */}
      {(user?.streak ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="rounded-xl p-3.5 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(239,68,68,0.06))',
            border: '1px solid rgba(249,115,22,0.15)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)' }}>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-white font-bold text-sm">
              🔥 {user?.streak} Day Streak
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/50 font-medium">
            Best: {user?.bestStreak}
          </span>
        </motion.div>
      )}

      {/* Ad Banner */}
      <AdBanner position="home_banner" />

      {/* Referral CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="rounded-2xl p-4 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))',
          border: '1px solid rgba(59,130,246,0.12)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))' }}
          >
            <Users className="w-5 h-5 text-[#60A5FA]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Invite friends to earn more NXR</p>
            <p className="text-muted-foreground/50 text-xs">Share your referral code & earn bonuses</p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#3B82F6]" />
        </div>
      </motion.div>
    </div>
  );
}
