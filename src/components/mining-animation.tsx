'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MiningAnimationProps {
  onComplete: () => void;
}

export function MiningAnimation({ onComplete }: MiningAnimationProps) {
  const [phase, setPhase] = useState(0);

  React.useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 300);
    const timer2 = setTimeout(() => setPhase(2), 800);
    const timer3 = setTimeout(() => setPhase(3), 1500);
    const timer4 = setTimeout(() => onComplete(), 3000);

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
        className="fixed inset-0 z-[100] bg-[#0A0F1C] flex items-center justify-center"
      >
        {/* Background glow */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: phase >= 1 ? [0, 2] : 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute w-64 h-64 bg-[#2563EB]/20 rounded-full blur-3xl"
        />

        {/* Pulse rings */}
        {phase >= 2 && (
          <>
            <motion.div
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute w-32 h-32 border-2 border-[#2563EB]/40 rounded-full"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5, delay: 0.3 }}
              className="absolute w-32 h-32 border-2 border-[#2563EB]/30 rounded-full"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0.4 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5, delay: 0.6 }}
              className="absolute w-32 h-32 border border-[#2563EB]/20 rounded-full"
            />
          </>
        )}

        {/* Center logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: phase >= 1 ? 1 : 0, rotate: phase >= 1 ? 0 : -180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shadow-2xl shadow-[#2563EB]/50"
        >
          <span className="text-5xl font-bold text-white">N</span>

          {/* Glow around logo */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(37, 99, 235, 0.3)',
                '0 0 60px rgba(37, 99, 235, 0.5)',
                '0 0 20px rgba(37, 99, 235, 0.3)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl"
          />
        </motion.div>

        {/* Floating particles */}
        {phase >= 2 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: (Math.random() - 0.5) * 200,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  y: -150 - Math.random() * 100,
                  opacity: 0,
                  scale: 0.3,
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  repeatDelay: Math.random() * 0.5,
                  delay: Math.random() * 0.5,
                }}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-[#2563EB]"
                style={{ marginLeft: `${(Math.random() - 0.5) * 200}px` }}
              />
            ))}
          </div>
        )}

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-1/3 text-center"
        >
          <h2 className="text-2xl font-bold text-white">Mining Activated!</h2>
          <p className="text-muted-foreground mt-1">Next claim in 24 hours</p>
        </motion.div>

        {/* Final message */}
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-1/4"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/30">
              <span className="text-[#2563EB]">⚡</span>
              <span className="text-[#2563EB] text-sm font-medium">Mining in progress...</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
