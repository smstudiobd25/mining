'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Shield, LogOut, Trophy, Settings, Calendar, CheckCircle, Users, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useReferrals } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { AdBanner } from './ad-banner';

interface ProfilePageProps {
  onOpenLeaderboard: () => void;
  onOpenAdmin: () => void;
}

export function ProfilePage({ onOpenLeaderboard, onOpenAdmin }: ProfilePageProps) {
  const { user, logout } = useAuth();
  const { data: referralData } = useReferrals();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const shareReferral = () => {
    const text = `Join Nexora Network and earn NXR tokens! Use my referral code: ${user?.referralCode}`;
    if (navigator.share) {
      navigator.share({ title: 'Nexora Network', text });
    } else {
      copyToClipboard(text, 'link');
    }
  };

  const referralCode = user?.referralCode || '';
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=${referralCode}` : '';

  const roleIcon = user?.role?.icon || '🧭';
  const roleName = user?.role?.name || 'Explorer';
  const roleColor = user?.role?.color || '#94A3B8';

  const nextRole = referralData?.nextRole;
  const referralsNeeded = referralData?.referralsNeeded || 0;
  const referralCount = referralData?.referralCount || 0;

  return (
    <div className="pb-20 px-4 pt-4 space-y-4 max-w-lg mx-auto">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 bg-card border border-border text-center"
      >
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-lg shadow-[#2563EB]/20">
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>

        <h2 className="text-xl font-bold text-white mt-3">{user?.name || 'User'}</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>

        {/* Role Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border mt-3"
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

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="rounded-xl p-4 bg-card border border-border card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[#2563EB]" />
            <span className="text-xs text-muted-foreground">Mining Days</span>
          </div>
          <p className="text-2xl font-bold text-white">{user?.miningDays ?? 0}</p>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border card-hover">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Tasks Done</span>
          </div>
          <p className="text-2xl font-bold text-white">{user?.tasksCompleted ?? 0}</p>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-xs text-muted-foreground">Referrals</span>
          </div>
          <p className="text-2xl font-bold text-white">{referralCount}</p>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl font-bold text-white">{user?.streak ?? 0}</p>
        </div>
      </motion.div>

      {/* Referral Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-5 bg-card border border-border"
      >
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#2563EB]" />
          Referral Program
        </h3>

        {/* Referral Code */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Your Referral Code</label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-secondary rounded-lg px-3 py-2.5 text-white font-mono text-sm">
                {referralCode}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(referralCode, 'code')}
                className="border-border"
              >
                <Copy className="w-4 h-4" />
                {copied === 'code' && <span className="text-green-500 text-xs ml-1">✓</span>}
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <label className="text-xs text-muted-foreground">Referral Link</label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-secondary rounded-lg px-3 py-2.5 text-white text-xs truncate">
                {referralLink}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(referralLink, 'link')}
                className="border-border"
              >
                <Copy className="w-4 h-4" />
                {copied === 'link' && <span className="text-green-500 text-xs ml-1">✓</span>}
              </Button>
            </div>
          </div>

          <Button
            onClick={shareReferral}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Referral
          </Button>
        </div>
      </motion.div>

      {/* Role Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-5 bg-card border border-border"
      >
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#F59E0B]" />
          Role Progress
        </h3>

        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: `${roleColor}20` }}
          >
            {roleIcon}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">{roleName}</p>
            <p className="text-xs text-muted-foreground">{referralCount} referrals</p>
          </div>
          {nextRole && (
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: nextRole.color }}>
                {nextRole.icon} {nextRole.name}
              </p>
              <p className="text-xs text-muted-foreground">{referralsNeeded} more needed</p>
            </div>
          )}
        </div>

        {nextRole && (
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((referralCount / nextRole.minReferrals) * 100, 100)}%`,
                backgroundColor: nextRole.color,
              }}
            />
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-2"
      >
        <Button
          onClick={onOpenLeaderboard}
          variant="outline"
          className="w-full border-border text-white hover:bg-secondary justify-start"
        >
          <Trophy className="w-4 h-4 mr-2 text-[#F59E0B]" />
          Leaderboard
        </Button>

        {user?.isAdmin && (
          <Button
            onClick={onOpenAdmin}
            variant="outline"
            className="w-full border-border text-white hover:bg-secondary justify-start"
          >
            <Settings className="w-4 h-4 mr-2 text-[#2563EB]" />
            Admin Panel
          </Button>
        )}

        <Button
          onClick={logout}
          variant="outline"
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </motion.div>

      {/* Ad Banner */}
      <AdBanner position="profile_banner" />
    </div>
  );
}
