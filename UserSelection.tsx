import React, { useState } from 'react';
import { User } from '../lib/types';
import { PREDEFINED_USERS } from '../constants';
import { Plus, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface UserSelectionProps {
  onSelect: (name: string) => void;
  existingUsers: User[];
}

export default function UserSelection({ onSelect, existingUsers }: UserSelectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const handleAddNew = () => {
    if (!newName.trim()) return;
    
    const exists = existingUsers.some(u => u.name.toLowerCase() === newName.trim().toLowerCase());
    if (exists) {
      setError('User already exists!');
      return;
    }

    onSelect(newName.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-sushi-bg w-full max-w-md mx-auto sushi-pattern">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center mb-12"
      >
        <span className="text-8xl mb-6 block drop-shadow-xl">🍣</span>
        <h1 className="text-5xl font-black text-sushi-text mb-2 tracking-tighter uppercase italic">Sushiro Spender</h1>
        <p className="text-sushi-sub font-black uppercase tracking-[0.2em] text-[10px]">Pick your seat to start</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        {PREDEFINED_USERS.map((name) => (
          <motion.button
            key={name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(name)}
            className="flex flex-col items-center justify-center p-6 bg-sushi-card rounded-3xl border-2 border-sushi-border text-sushi-text hover:border-sushi-red transition-all shadow-lg active:shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-sushi-bg flex items-center justify-center mb-2 font-black text-sushi-sub">
              {name[0]}
            </div>
            <span className="font-black uppercase tracking-widest text-[10px]">{name}</span>
          </motion.button>
        ))}
        
        {/* custom users who already exist in DB but not in predefined */}
        {existingUsers.filter(u => !PREDEFINED_USERS.includes(u.name)).map(u => (
          <motion.button
            key={u.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(u.name)}
            className="flex flex-col items-center justify-center p-6 bg-sushi-card rounded-3xl border-2 border-sushi-border text-sushi-text hover:border-sushi-red transition-all shadow-lg"
          >
            <div className="w-10 h-10 rounded-full bg-sushi-bg flex items-center justify-center mb-2 font-black text-sushi-sub">
              {u.name[0]}
            </div>
            <span className="font-black uppercase tracking-widest text-[10px]">{u.name}</span>
          </motion.button>
        ))}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="flex flex-col items-center justify-center p-6 bg-sushi-text rounded-3xl border-2 border-sushi-text text-white shadow-lg active:shadow-sm"
        >
          <Plus className="w-6 h-6 mb-2" />
          <span className="font-black uppercase tracking-widest text-[10px]">Add New</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-sushi-text/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-sushi-card p-10 rounded-[48px] shadow-2xl w-full max-w-sm border-[8px] border-sushi-text"
            >
              <h2 className="text-3xl font-black text-sushi-text mb-6 uppercase italic italic">Who are you?</h2>
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError('');
                }}
                className={cn(
                  "w-full p-5 bg-sushi-bg rounded-2xl border-4 focus:outline-none transition-all font-black text-lg",
                  error ? "border-sushi-red text-sushi-red" : "border-sushi-border focus:border-sushi-text text-sushi-text"
                )}
                placeholder="Enter Name"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
              />
              {error && <p className="text-sushi-red text-[10px] uppercase font-black tracking-widest mt-3 ml-1">{error}</p>}
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 p-5 bg-sushi-border/40 rounded-2xl font-black text-sushi-sub uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddNew}
                  className="flex-1 p-5 bg-sushi-red border-b-4 border-black/20 rounded-2xl font-black text-white shadow-xl shadow-sushi-red/20 uppercase text-xs tracking-widest"
                >
                  Join
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
