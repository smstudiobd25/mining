'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endsAt: string;
  onComplete: () => void;
}

export function CountdownTimer({ endsAt, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const endTime = new Date(endsAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setIsComplete(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        onComplete();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endsAt, onComplete]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (isComplete) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 font-semibold text-sm">Claim Ready!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <TimeBlock value={pad(timeLeft.hours)} label="HRS" />
      <span className="text-primary text-xl font-bold mt-[-16px]">:</span>
      <TimeBlock value={pad(timeLeft.minutes)} label="MIN" />
      <span className="text-primary text-xl font-bold mt-[-16px]">:</span>
      <TimeBlock value={pad(timeLeft.seconds)} label="SEC" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-14 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center">
        <span className="text-2xl font-bold text-foreground font-mono">{value}</span>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
    </div>
  );
}
