import React from 'react';
import { User } from '../lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, TrendingUp, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface LeaderboardProps {
  users: User[];
  currentUserId: string | null;
}

export default function Leaderboard({ users, currentUserId }: LeaderboardProps) {
  const sortedUsers = [...users].sort((a, b) => b.totalSpend - a.totalSpend);

  return (
    <div className="w-full bg-sushi-card rounded-[32px] p-8 shadow-xl border border-sushi-border mt-8 mb-20 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-sushi-text italic tracking-tighter underline decoration-sushi-red decoration-4">
          Leaderboard
        </h3>
        <span className="bg-sushi-text text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          Real-time
        </span>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {sortedUsers.map((user, index) => (
            <motion.div
              layout
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300",
                user.id === currentUserId 
                  ? "bg-sushi-bg border-sushi-text shadow-sm" 
                  : "bg-transparent border-transparent opacity-60"
              )}
            >
              <div className="w-8 text-center">
                {index === 0 ? (
                  <span className="text-2xl">👑</span>
                ) : (
                  <span className="font-black text-sushi-sub">#{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <p className="font-black text-sushi-text leading-none">
                  {user.name} {user.id === currentUserId && "(You)"}
                </p>
                <p className="text-[9px] uppercase tracking-widest font-black text-sushi-sub mt-1">
                  {Object.values(user.plateCounts || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)} Plates
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-black tabular-nums text-sushi-text">
                  {user.totalSpend.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-sushi-sub ml-1 uppercase">฿</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 opacity-20">
          <UserIcon className="w-12 h-12 mb-2" />
          <p className="text-xs uppercase tracking-widest font-black">No one's eating yet!</p>
        </div>
      )}
    </div>
  );
}
