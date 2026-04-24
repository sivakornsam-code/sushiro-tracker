import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlateType } from '../lib/types';
import { cn } from '../lib/utils';

interface SushiPlateProps {
  plate: PlateType;
  onClick: () => void;
  onRemove: () => void;
  count: number;
  key?: number;
}

export default function SushiPlate({ plate, onClick, onRemove, count }: SushiPlateProps) {
  const [taps, setTaps] = useState<{ id: number; price: number; type: 'add' | 'sub' }[]>([]);

  const handleClick = () => {
    const id = Date.now();
    setTaps(prev => [...prev, { id, price: plate.price, type: 'add' }]);
    onClick();
    setTimeout(() => {
      setTaps(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (count <= 0) return;
    const id = Date.now();
    setTaps(prev => [...prev, { id, price: plate.price, type: 'sub' }]);
    onRemove();
    setTimeout(() => {
      setTaps(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        whileTap={{ scale: 0.95, y: 4 }}
        onClick={handleClick}
        className={cn(
          "w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[6px] flex items-center justify-center text-2xl plate-shadow relative transition-all",
          plate.bgClass
        )}
      >
        <span className={cn("font-black tracking-tighter", plate.textClass)}>
          {plate.price}
        </span>
        
        {count > 0 && (
          <div className="absolute -top-1 -right-1 bg-sushi-text text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-sushi-text/10">
            {count}
          </div>
        )}
        
        {/* Remove Button */}
        {count > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={handleRemove}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-2 border-sushi-border rounded-full flex items-center justify-center shadow-lg active:scale-90 z-20"
          >
            <span className="text-sushi-text font-black text-xs">−</span>
          </motion.div>
        )}
      </motion.button>
      
      <span className="mt-3 text-[10px] font-black text-sushi-sub uppercase tracking-[0.2em]">{plate.label}</span>

      <AnimatePresence>
        {taps.map(tap => (
          <motion.div
            key={tap.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: tap.type === 'add' ? -80 : 40, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute pointer-events-none font-black text-xl whitespace-nowrap z-50",
              tap.type === 'add' ? "text-sushi-red" : "text-gray-400"
            )}
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            {tap.type === 'add' ? `+${tap.price}` : `−${tap.price}`}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
