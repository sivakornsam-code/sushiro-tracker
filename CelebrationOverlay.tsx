import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { MILESTONES } from '../constants';

interface CelebrationOverlayProps {
  milestone: typeof MILESTONES[0] | null;
  onComplete: () => void;
}

export default function CelebrationOverlay({ milestone, onComplete }: CelebrationOverlayProps) {
  useEffect(() => {
    if (milestone?.value === 1000) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [milestone]);

  useEffect(() => {
    if (milestone) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [milestone, onComplete]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-6"
        >
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          
          <motion.div
            initial={{ scale: 0.5, y: 50, rotate: -10 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white p-8 rounded-3xl shadow-2xl relative border-4 border-yellow-400 max-w-sm w-full text-center"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-black text-gray-800 mb-2 leading-tight">
              {milestone.value} BAHT!
            </h2>
            <p className="text-lg text-red-500 font-bold italic">
              {milestone.message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
