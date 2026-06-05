'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endsAt: string;
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
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/25">
          <span className="text-gradient-blue text-sm font-bold">Ready to Claim!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2.5">
      <TimeBlock value={pad(timeLeft.hours)} label="HRS" />
      <span className="text-xl font-bold text-[#3B82F6]/40 mb-5 animate-pulse">:</span>
      <TimeBlock value={pad(timeLeft.minutes)} label="MIN" />
      <span className="text-xl font-bold text-[#3B82F6]/40 mb-5 animate-pulse">:</span>
      <TimeBlock value={pad(timeLeft.seconds)} label="SEC" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="countdown-digit rounded-xl px-3.5 py-2.5 min-w-[58px]">
        <span className="text-2xl font-bold text-white font-mono tracking-wider">{value}</span>
      </div>
      <span className="text-[9px] text-muted-foreground/60 mt-1.5 font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}
