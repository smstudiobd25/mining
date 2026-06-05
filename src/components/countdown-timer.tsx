'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endsAt: string; // ISO date string
  onComplete: () => void;
}

export function CountdownTimer({ endsAt, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const end = new Date(endsAt).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setIsComplete(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (isComplete) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/30 mb-3">
          <span className="text-[#2563EB] text-sm font-medium">✨ Ready to Claim!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <TimeBlock value={pad(timeLeft.hours)} label="HRS" />
      <span className="text-2xl font-bold text-muted-foreground mb-4">:</span>
      <TimeBlock value={pad(timeLeft.minutes)} label="MIN" />
      <span className="text-2xl font-bold text-muted-foreground mb-4">:</span>
      <TimeBlock value={pad(timeLeft.seconds)} label="SEC" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-secondary border border-border rounded-xl px-3 py-2 min-w-[56px]">
        <span className="text-2xl font-bold text-white font-mono">{value}</span>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 font-medium">{label}</span>
    </div>
  );
}
