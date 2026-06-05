'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MiningAnimationProps {
  onComplete: () => void;
}

export function MiningAnimation({ onComplete }: MiningAnimationProps) {
  const [phase, setPhase] = useState(0);

  React.useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 200);
    const timer2 = setTimeout(() => setPhase(2), 700);
    const timer3 = setTimeout(() => setPhase(3), 1400);
    const timer4 = setTimeout(() => onComplete(), 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'radial-gradient(circle at center, #060A14 0%, #030508 100%)' }}
      >
        {/* Massive background glow */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: phase >= 1 ? [0, 3] : 0, opacity: phase >= 1 ? [0, 0.6] : 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)' }}
        />

        {/* Secondary purple glow */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: phase >= 2 ? [0, 2.5] : 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute w-60 h-60 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 60%)' }}
        />

        {/* Hyper pulse rings */}
        {phase >= 2 && (
          <>
            {[0, 0.4, 0.8].map((delay, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0.8 - i * 0.15 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.3, delay, ease: 'easeOut' }}
                className="absolute w-28 h-28 rounded-full"
                style={{
                  border: `2px solid rgba(59, 130, 246, ${0.5 - i * 0.12})`,
                  boxShadow: `0 0 20px rgba(59, 130, 246, ${0.2 - i * 0.05})`,
                }}
              />
            ))}
          </>
        )}

        {/* Center N logo */}
        <motion.div
          initial={{ scale: 0, rotate: -360 }}
          animate={{ scale: phase >= 1 ? 1 : 0, rotate: phase >= 1 ? 0 : -360 }}
          transition={{ type: 'spring', stiffness: 150, damping: 12 }}
          className="relative z-10"
        >
          <div
            className="w-32 h-32 rounded-[28px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 40%, #7C3AED 100%)',
              boxShadow: '0 0 60px rgba(59,130,246,0.5), 0 0 120px rgba(139,92,246,0.3), inset 0 2px 0 rgba(255,255,255,0.15)',
            }}
          >
            <span className="text-6xl font-black text-white drop-shadow-lg">N</span>
          </div>

          {/* Animated glow ring around logo */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 30px rgba(59,130,246,0.4), 0 0 60px rgba(139,92,246,0.2)',
                '0 0 80px rgba(59,130,246,0.7), 0 0 140px rgba(139,92,246,0.4)',
                '0 0 30px rgba(59,130,246,0.4), 0 0 60px rgba(139,92,246,0.2)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-[28px]"
          />
        </motion.div>

        {/* Floating NXR particles - MORE of them */}
        {phase >= 2 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: (Math.random() - 0.5) * 250,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  y: -180 - Math.random() * 120,
                  opacity: 0,
                  scale: 0.15,
                }}
                transition={{
                  duration: 1.8 + Math.random() * 0.8,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 0.4,
                  delay: Math.random() * 0.6,
                  ease: 'easeOut',
                }}
                className="absolute left-1/2 top-1/2"
                style={{ marginLeft: `${(Math.random() - 0.5) * 250}px` }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: i % 3 === 0
                      ? 'linear-gradient(135deg, #3B82F6, #60A5FA)'
                      : i % 3 === 1
                        ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
                        : 'linear-gradient(135deg, #06B6D4, #22D3EE)',
                    boxShadow: `0 0 8px ${i % 3 === 0 ? 'rgba(59,130,246,0.6)' : i % 3 === 1 ? 'rgba(139,92,246,0.6)' : 'rgba(6,182,212,0.6)'}`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Text - Mining Activated */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 30 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute bottom-[35%] text-center"
        >
          <h2 className="text-3xl font-black text-white tracking-tight">
            Mining <span className="text-gradient-blue">Activated</span>!
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">Next claim in 24 hours</p>
        </motion.div>

        {/* Final badge */}
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="absolute bottom-[25%]"
          >
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
                border: '1px solid rgba(59,130,246,0.25)',
                boxShadow: '0 0 20px rgba(59,130,246,0.1)',
              }}
            >
              <span className="text-[#3B82F6]">⚡</span>
              <span className="text-[#60A5FA] text-sm font-bold">Mining in progress...</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
