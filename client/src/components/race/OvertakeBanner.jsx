'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Zap, Flag } from 'lucide-react';
import { sounds } from '../../lib/soundEffects';

export default function OvertakeBanner({ overtakes = [] }) {
  const [currentOvertake, setCurrentOvertake] = useState(null);

  useEffect(() => {
    if (!overtakes || overtakes.length === 0) return;

    // Mostrar el sobrepaso más destacado (o el de mayor posición)
    const topOvertake = overtakes[0];
    setCurrentOvertake(topOvertake);
    sounds.playOvertakeWhoosh();

    const timer = setTimeout(() => {
      setCurrentOvertake(null);
    }, 4500);

    return () => clearTimeout(timer);
  }, [overtakes]);

  return (
    <AnimatePresence>
      {currentOvertake && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed top-20 right-6 z-40 max-w-sm w-full select-none"
        >
          <div className="bg-gradient-to-r from-f1-card via-slate-900 to-f1-card p-3.5 rounded-2xl border-2 border-f1-cyan/70 shadow-2xl shadow-f1-cyan/20 backdrop-blur-md flex items-center gap-3">
            {/* Badge de TV F1 */}
            <div className="px-2.5 py-1 rounded-lg bg-f1-red text-white font-mono font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-md shadow-f1-red/30">
              <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
              <span>OVERTAKE</span>
            </div>

            <div className="flex-1 truncate">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: currentOvertake.color || '#00F0FF' }}
                />
                <span className="text-xs font-black text-white uppercase italic truncate">
                  {currentOvertake.teamName}
                </span>
              </div>
              <p className="text-[11px] font-mono text-f1-cyan mt-0.5">
                Avanza a <strong className="text-white">P{currentOvertake.newPos}</strong> (+{currentOvertake.delta} {currentOvertake.delta === 1 ? 'posición' : 'posiciones'})
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
