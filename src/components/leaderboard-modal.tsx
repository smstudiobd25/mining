'use client';

import { useState } from 'react';
import { useLeaderboard } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  nxrBalance: number;
  role: { name: string; color: string };
  isCurrentUser: boolean;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
}

export function LeaderboardModal({ open, onClose }: LeaderboardModalProps) {
  const { user } = useAuth();
  const [period, setPeriod] = useState('all');
  const { data, isLoading } = useLeaderboard(period);

  const leaderboard = (data?.leaderboard || []) as LeaderboardEntry[];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50 max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Leaderboard
          </DialogTitle>
        </DialogHeader>

        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No data yet
              </div>
            ) : (
              <ScrollArea className="max-h-[50vh]">
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        entry.isCurrentUser
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-secondary/30'
                      }`}
                    >
                      <RankIcon rank={entry.rank} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${entry.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                          {entry.name} {entry.isCurrentUser && '(You)'}
                        </p>
                        <div
                          className="text-[10px] px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                          style={{
                            backgroundColor: `${entry.role.color}15`,
                            color: entry.role.color,
                          }}
                        >
                          {entry.role.name}
                        </div>
                      </div>
                      <p className="font-semibold text-sm text-foreground">
                        {entry.nxrBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} NXR
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
