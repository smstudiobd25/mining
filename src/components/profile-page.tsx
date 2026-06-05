'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useReferrals } from '@/hooks/use-app-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AdBanner } from './ad-banner';
import { LeaderboardModal } from './leaderboard-modal';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { User, Copy, Trophy, LogOut, Flame, Pickaxe, Target, Users, Shield, ChevronRight } from 'lucide-react';

export function ProfilePage({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const { user, logout, refreshUser } = useAuth();
  const { data: referralData } = useReferrals();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { toast } = useToast();

  if (!user) return null;

  const referralCode = user.referralCode;
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=${referralCode}` : '';
  const referralCount = (referralData as Record<string, unknown>)?.referralCount as number || 0;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({ title: 'Copied!', description: 'Referral link copied to clipboard' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out', description: 'See you next time!' });
  };

  const stats = [
    { icon: Pickaxe, label: 'Mining Days', value: user.miningDays },
    { icon: Target, label: 'Tasks Done', value: user.tasksCompleted },
    { icon: Users, label: 'Referrals', value: referralCount },
    { icon: Flame, label: 'Streak', value: user.streak },
  ];

  return (
    <div className="pb-4 space-y-4">
      <LeaderboardModal open={showLeaderboard} onClose={() => setShowLeaderboard(false)} />

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1"
                  style={{
                    backgroundColor: `${user.role?.color || '#2563EB'}15`,
                    color: user.role?.color || '#2563EB',
                  }}
                >
                  <Shield className="w-3 h-3" />
                  {user.role?.name || 'Explorer'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Referral Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Referral Program</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Share your code and earn 25 NXR for each referral!
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm font-mono text-foreground">
                  {referralCode}
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={handleCopyCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-xs text-muted-foreground truncate">
                  {referralLink}
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {referralCount} referral{referralCount !== 1 ? 's' : ''} • Next role: {(referralData as Record<string, unknown>)?.nextRole ? ((referralData as Record<string, unknown>)?.nextRole as Record<string, unknown>)?.name as string : 'Keep referring!'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leaderboard Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card
          className="bg-card border-border/50 cursor-pointer hover:bg-card/80 transition-colors"
          onClick={() => setShowLeaderboard(true)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">Leaderboard</p>
              <p className="text-xs text-muted-foreground">See top miners</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Admin Access */}
      {user.isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card
            className="bg-card border-primary/20 cursor-pointer hover:bg-primary/5 transition-colors"
            onClick={onOpenAdmin}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Admin Panel</p>
                <p className="text-xs text-muted-foreground">Manage your network</p>
              </div>
              <ChevronRight className="w-4 h-4 text-primary" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Ad Banner */}
      <AdBanner position="profile_banner" />

      <Separator className="bg-border/30" />

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full border-destructive/20 text-destructive hover:bg-destructive/10"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
