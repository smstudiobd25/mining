'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMiningStatus } from '@/hooks/use-app-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './countdown-timer';
import { MiningAnimation } from './mining-animation';
import { AdBanner } from './ad-banner';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Zap, Flame, Coins, TrendingUp, Loader2 } from 'lucide-react';

export function HomePage() {
  const { user, refreshUser } = useAuth();
  const { session, isLoading, refetch: refetchMining } = useMiningStatus();
  const [isClaiming, setIsClaiming] = useState(false);
  const [showMiningAnimation, setShowMiningAnimation] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const { toast } = useToast();

  const handleStartMining = async () => {
    if (!user) return;
    setIsStarting(true);
    try {
      const res = await fetch('/api/mining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        // If there's an unclaimed session, refetch
        if (data.session) {
          refetchMining();
        }
        toast({
          title: 'Cannot start mining',
          description: data.error,
          variant: 'destructive',
        });
        setIsStarting(false);
        return;
      }
      setShowMiningAnimation(true);
      refetchMining();
      setTimeout(() => {
        setShowMiningAnimation(false);
        setIsStarting(false);
      }, 3000);
    } catch {
      toast({ title: 'Error', description: 'Failed to start mining', variant: 'destructive' });
      setIsStarting(false);
    }
  };

  const handleClaim = async () => {
    if (!user || !session) return;
    setIsClaiming(true);
    try {
      const res = await fetch('/api/mining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim', userId: user.id, sessionId: session.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Claim Failed', description: data.error, variant: 'destructive' });
        setIsClaiming(false);
        return;
      }
      toast({
        title: '🎉 Reward Claimed!',
        description: `You earned ${data.reward.nxr.toFixed(1)} NXR and $${data.reward.vault.toFixed(2)} vault reward!`,
      });
      refetchMining();
      refreshUser();
    } catch {
      toast({ title: 'Error', description: 'Failed to claim reward', variant: 'destructive' });
    } finally {
      setIsClaiming(false);
    }
  };

  const onCountdownComplete = useCallback(() => {
    // Timer done - user can claim
  }, []);

  const hasActiveSession = session && !session.claimed && new Date(session.endsAt as string) > new Date();
  const hasClaimableSession = session && !session.claimed && new Date(session.endsAt as string) <= new Date();
  const miningBoost = user?.role?.miningBoost || 1.0;

  return (
    <div className="pb-4 space-y-4">
      <MiningAnimation
        isAnimating={showMiningAnimation}
        onComplete={() => setShowMiningAnimation(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Welcome back, {user?.name || 'Miner'}</h2>
          <p className="text-sm text-muted-foreground">Keep mining to earn more NXR</p>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-medium border"
          style={{
            backgroundColor: `${user?.role?.color || '#2563EB'}15`,
            borderColor: `${user?.role?.color || '#2563EB'}30`,
            color: user?.role?.color || '#2563EB',
          }}
        >
          {user?.role?.name || 'Explorer'}
        </div>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/10 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">NXR Balance</span>
              </div>
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.streak || 0} day streak</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {(user?.nxrBalance || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">
                  Vault: ${(user?.vaultBalance || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">
                  Boost: {miningBoost}x
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mining Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Mining</h3>
              {hasActiveSession && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Active
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : hasActiveSession ? (
              <div className="space-y-4">
                <CountdownTimer
                  endsAt={session.endsAt as string}
                  onComplete={onCountdownComplete}
                />
                <p className="text-center text-sm text-muted-foreground">
                  Reward: <span className="text-primary font-semibold">{(session.rewardAmount as number).toFixed(1)} NXR</span>
                </p>
              </div>
            ) : hasClaimableSession ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-400 mb-2">🎉 Mining Complete!</p>
                  <p className="text-sm text-muted-foreground">
                    Reward: <span className="text-primary font-semibold">{(session.rewardAmount as number).toFixed(1)} NXR</span>
                  </p>
                </div>
                <Button
                  onClick={handleClaim}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
                  disabled={isClaiming}
                >
                  {isClaiming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Claim Reward
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  Start mining to earn NXR rewards every 24 hours
                </p>
                <Button
                  onClick={handleStartMining}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-14 text-lg mining-glow"
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  Start Mining
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3"
      >
        <Card className="bg-card border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{user?.miningDays || 0}</p>
            <p className="text-xs text-muted-foreground">Mining Days</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{user?.tasksCompleted || 0}</p>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">{miningBoost}x Boost</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ad Banner */}
      <AdBanner position="home_banner" />
    </div>
  );
}
