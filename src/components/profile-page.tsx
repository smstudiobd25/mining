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
    if (navigator.share) { navigator.share({ title: 'Nexora Network', text }); }
    else { copyToClipboard(text, 'link'); }
  };

  const referralCode = user?.referralCode || '';
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=${referralCode}` : '';
  const roleIcon = user?.role?.icon || '🧭';
  const roleName = user?.role?.name || 'Explorer';
  const roleColor = user?.role?.color || '#64748B';
  const nextRole = referralData?.nextRole;
  const referralsNeeded = referralData?.referralsNeeded || 0;
  const referralCount = referralData?.referralCount || 0;

  return (
    <div className="pb-20 px-4 pt-5 space-y-4 max-w-lg mx-auto">
      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 hyper-card-glow">
        <div className="relative z-10 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl font-black text-white"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
              boxShadow: '0 0 30px rgba(59,130,246,0.25), 0 0 60px rgba(139,92,246,0.1)',
            }}
          >
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-white mt-3">{user?.name || 'User'}</h2>
          <p className="text-xs text-muted-foreground/50 mt-0.5">{user?.email}</p>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border mt-3 badge-glow"
            style={{ borderColor: `${roleColor}30`, backgroundColor: `${roleColor}10` }}
          >
            <span className="text-sm">{roleIcon}</span>
            <span className="text-xs font-bold" style={{ color: roleColor }}>{roleName}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid grid-cols-2 gap-2.5">
        {[
          { icon: Calendar, color: '#3B82F6', value: user?.miningDays ?? 0, label: 'Mining Days' },
          { icon: CheckCircle, color: '#22C55E', value: user?.tasksCompleted ?? 0, label: 'Tasks Done' },
          { icon: Users, color: '#8B5CF6', value: referralCount, label: 'Referrals' },
          { icon: Flame, color: '#F97316', value: user?.streak ?? 0, label: 'Streak' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4 stat-card">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
              <span className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Referral Section */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="rounded-2xl p-5 hyper-card">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Users className="w-4 h-4 text-[#3B82F6]" />Referral Program
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider">Your Code</label>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 rounded-lg px-3.5 py-2.5 text-white font-mono text-sm font-bold"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)' }}
              >
                {referralCode}
              </div>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(referralCode, 'code')}
                className="border-[rgba(59,130,246,0.1)] hover:border-[rgba(59,130,246,0.2)]">
                <Copy className="w-4 h-4" />
                {copied === 'code' && <span className="text-green-500 text-xs ml-1">✓</span>}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider">Referral Link</label>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 rounded-lg px-3.5 py-2.5 text-white text-xs truncate"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)' }}
              >
                {referralLink}
              </div>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(referralLink, 'link')}
                className="border-[rgba(59,130,246,0.1)] hover:border-[rgba(59,130,246,0.2)]">
                <Copy className="w-4 h-4" />
                {copied === 'link' && <span className="text-green-500 text-xs ml-1">✓</span>}
              </Button>
            </div>
          </div>
          <Button onClick={shareReferral} className="w-full btn-hyper text-white font-bold rounded-xl">
            <Share2 className="w-4 h-4 mr-2" />Share Referral
          </Button>
        </div>
      </motion.div>

      {/* Role Progress */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="rounded-2xl p-5 hyper-card">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
          <Shield className="w-4 h-4 text-[#F59E0B]" />Role Progress
        </h3>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${roleColor}15` }}>
            {roleIcon}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">{roleName}</p>
            <p className="text-[10px] text-muted-foreground/50">{referralCount} referrals</p>
          </div>
          {nextRole && (
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: nextRole.color }}>{nextRole.icon} {nextRole.name}</p>
              <p className="text-[10px] text-muted-foreground/50">{referralsNeeded} more needed</p>
            </div>
          )}
        </div>
        {nextRole && (
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(59,130,246,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((referralCount / nextRole.minReferrals) * 100, 100)}%`,
                background: `linear-gradient(90deg, ${roleColor}, ${nextRole.color})`,
                boxShadow: `0 0 10px ${nextRole.color}40`,
              }}
            />
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
        <Button onClick={onOpenLeaderboard} variant="outline"
          className="w-full border-[rgba(59,130,246,0.08)] text-white hover:bg-[rgba(59,130,246,0.05)] justify-start rounded-xl font-semibold">
          <Trophy className="w-4 h-4 mr-2 text-[#F59E0B]" />Leaderboard
        </Button>
        {user?.isAdmin && (
          <Button onClick={onOpenAdmin} variant="outline"
            className="w-full border-[rgba(59,130,246,0.08)] text-white hover:bg-[rgba(59,130,246,0.05)] justify-start rounded-xl font-semibold">
            <Settings className="w-4 h-4 mr-2 text-[#3B82F6]" />Admin Panel
          </Button>
        )}
        <Button onClick={logout} variant="outline"
          className="w-full border-[rgba(239,68,68,0.15)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.05)] justify-start rounded-xl font-semibold">
          <LogOut className="w-4 h-4 mr-2" />Logout
        </Button>
      </motion.div>

      <AdBanner position="profile_banner" />
    </div>
  );
}
