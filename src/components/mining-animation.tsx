'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MiningAnimationProps {
  isAnimating: boolean;
  onComplete: () => void;
}

export function MiningAnimation({ isAnimating, onComplete }: MiningAnimationProps) {
  if (!isAnimating) return null;

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
          onClick={onComplete}
        >
          {/* Pulse rings */}
          <motion.div
            className="absolute"
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          >
            <div className="w-32 h-32 rounded-full border-2 border-primary/40" />
          </motion.div>

          <motion.div
            className="absolute"
            initial={{ scale: 0.5, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          >
            <div className="w-32 h-32 rounded-full border-2 border-primary/30" />
          </motion.div>

          <motion.div
            className="absolute"
            initial={{ scale: 0.5, opacity: 0.4 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
          >
            <div className="w-32 h-32 rounded-full border-2 border-primary/20" />
          </motion.div>

          {/* Center logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mining-glow">
              <span className="text-4xl font-bold text-primary">N</span>
            </div>
          </motion.div>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: Math.cos((i * Math.PI * 2) / 8) * 40,
                y: Math.sin((i * Math.PI * 2) / 8) * 40,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                y: [0, -80 - Math.random() * 40],
                opacity: [1, 0],
                scale: [1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
            >
              <div className="w-3 h-3 rounded-full bg-primary/60 blur-[1px]" />
            </motion.div>
          ))}

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-1/3 text-center"
          >
            <p className="text-xl font-bold text-primary">Mining Activated!</p>
            <p className="text-sm text-muted-foreground mt-1">Next claim in 24 hours</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
