'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Medal } from 'lucide-react';
import { useLeaderboard } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const periods = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'all', label: 'All Time' },
];

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [period, setPeriod] = useState('all');
  const { data, isLoading } = useLeaderboard(period);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30', text: 'text-[#F59E0B]', icon: '🥇' };
      case 2: return { bg: 'bg-gray-400/10', border: 'border-gray-400/30', text: 'text-gray-300', icon: '🥈' };
      case 3: return { bg: 'bg-orange-700/10', border: 'border-orange-700/30', text: 'text-orange-600', icon: '🥉' };
      default: return { bg: 'bg-card', border: 'border-border', text: 'text-white', icon: '' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-[#0A0F1C] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F59E0B]" />
              Leaderboard
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Period tabs */}
          <div className="flex bg-secondary mx-4 mt-4 rounded-xl p-1">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  period === p.id
                    ? 'bg-[#2563EB] text-white'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Leaderboard list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
              </div>
            ) : data?.leaderboard?.length === 0 ? (
              <div className="text-center py-12">
                <Medal className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No data for this period</p>
              </div>
            ) : (
              data?.leaderboard?.map((entry: {
                rank: number;
                id: string;
                name: string;
                nxrBalance: number;
                role: { icon: string; name: string; color: string } | null;
                miningDays: number;
                isCurrentUser: boolean;
              }) => {
                const style = getRankStyle(entry.rank);
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      style.bg
                    } ${style.border} ${
                      entry.isCurrentUser ? 'ring-1 ring-[#2563EB]/50' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${style.text}`}>
                      {style.icon || entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-white truncate">
                          {entry.name}
                          {entry.isCurrentUser && <span className="text-[#2563EB]"> (You)</span>}
                        </p>
                        {entry.role && (
                          <span className="text-xs">{entry.role.icon}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.miningDays} mining days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{entry.nxrBalance.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">NXR</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
