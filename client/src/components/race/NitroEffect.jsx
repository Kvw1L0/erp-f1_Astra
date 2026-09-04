'use client';

import React from 'react';
import { Zap, Flame } from 'lucide-react';

export default function NitroEffect({ showText = true }) {
  return (
    <div className="absolute left-0 -top-8 flex items-center gap-1 pointer-events-none z-30 select-none">
      {/* Fuego y propulsión Nitro detrás del auto */}
      <div className="relative flex items-center">
        <div className="w-12 h-6 bg-gradient-to-r from-f1-cyan via-blue-500 to-transparent rounded-full blur-sm animate-pulse opacity-90" />
        <div className="absolute -left-2 w-6 h-3 bg-white rounded-full blur-[1px] animate-ping" />
      </div>

      {showText && (
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-f1-cyan to-blue-600 border border-white text-[10px] font-mono font-black text-black tracking-wider shadow-[0_0_15px_#00F0FF] animate-bounce whitespace-nowrap">
          <Zap className="w-3 h-3 fill-yellow-300 text-yellow-300" />
          <span>NITRO BOOST +20%</span>
        </div>
      )}
    </div>
  );
}
