'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { sounds } from '../../lib/soundEffects';

export default function SafetyCarOverlay({ isActive = false, onDismiss }) {
  useEffect(() => {
    if (isActive) {
      sounds.playSafetyCarSiren();
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none select-none">
      {/* Banner Superior Estilo F1 FIA */}
      <motion.div
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        exit={{ y: -60 }}
        transition={{ duration: 0.3 }}
        className="bg-yellow-400 text-black px-6 py-2.5 shadow-2xl flex items-center justify-between pointer-events-auto border-b-4 border-yellow-500 font-mono"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black text-yellow-400 rounded-lg font-black text-xs tracking-wider animate-pulse">
            <AlertTriangle className="w-4 h-4 fill-yellow-400 text-black" />
            <span>VSC • VIRTUAL SAFETY CAR</span>
          </div>
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-tight">
            BANDERA AMARILLA EN TODO EL CIRCUITO • VELOCIDAD CONTROLADA • PAUSA DE TELEMETRÍA
          </span>
        </div>

        <div className="text-xs font-bold text-black/80 hidden sm:flex items-center gap-2">
          <span>DIRECCIÓN DE CARRERA EN SESIÓN PEDAGÓGICA</span>
        </div>
      </motion.div>

      {/* Auto de Seguridad Animado en Pista */}
      <motion.div
        initial={{ left: '-15%' }}
        animate={{ left: '105%' }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute top-28 z-40 flex items-center gap-2 pointer-events-none"
      >
        {/* Gráfico Vectorial Safety Car */}
        <div className="relative bg-slate-900 border-2 border-yellow-400 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2 backdrop-blur-md">
          {/* Luces estroboscópicas de techo */}
          <div className="flex gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <span className="text-[11px] font-black text-yellow-400 font-mono tracking-wider">
            SAFETY CAR
          </span>
        </div>
      </motion.div>
    </div>
  );
}
