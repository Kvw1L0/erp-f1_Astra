'use client';

import React from 'react';
import { Zap, Flame } from 'lucide-react';

export default function NitroEffect({ showText = true }) {
  return (
    <div className="absolute left-[-60px] top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-30 select-none">
      {/* Estela de Plasma Supersónica (Tron Trail) */}
      <div className="relative flex items-center">
        {/* Haz de luz neón largo */}
        <div className="w-24 h-4 bg-gradient-to-l from-f1-cyan via-blue-500/70 to-transparent blur-[2px] rounded-full animate-pulse" />
        
        {/* Núcleo de propulsión incandescente */}
        <div className="absolute right-0 w-8 h-6 bg-gradient-to-r from-cyan-200 via-f1-cyan to-blue-600 rounded-full blur-[1px] shadow-[0_0_20px_#00F0FF]" />
        
        {/* Destellos de plasma */}
        <div className="absolute right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-90" />
      </div>

      {/* Badge Flotante Superior */}
      {showText && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-f1-cyan via-blue-500 to-indigo-600 border border-white text-[10px] font-mono font-black text-black tracking-wider shadow-[0_0_20px_#00F0FF] animate-bounce whitespace-nowrap">
          <Zap className="w-3 h-3 fill-yellow-300 text-yellow-300" />
          <span>POLE BOOST +20%</span>
        </div>
      )}
    </div>
  );
}
