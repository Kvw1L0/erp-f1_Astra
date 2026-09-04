'use client';

import React from 'react';
import { Tv, Radio, CheckCircle2, Trophy, Compass } from 'lucide-react';

export default function PitsBlocked({ team, durationFormatted, currentPosition, sectorIndex = 1, totalSectors = 10 }) {
  return (
    <div className="max-w-xl mx-auto w-full bg-f1-card p-8 md:p-10 rounded-3xl border border-f1-cyan/40 shadow-2xl shadow-f1-cyan/10 text-center relative overflow-hidden my-auto">
      {/* Luz de fondo animada */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-f1-cyan/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-f1-red/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Radar de Telemetría Animado */}
      <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-f1-cyan/30 animate-ping opacity-75" />
        <div className="absolute inset-2 rounded-full border-2 border-f1-cyan/60 animate-pulse" />
        <div className="w-16 h-16 bg-f1-dark rounded-full border border-f1-cyan flex items-center justify-center shadow-lg shadow-f1-cyan/30">
          <Radio className="w-8 h-8 text-f1-cyan animate-pulse" />
        </div>
      </div>

      {/* Badge del Equipo y Sector */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-f1-dark border border-f1-border text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team?.color || '#E10600' }} />
          <span className="text-slate-200 font-bold">{team?.name || `Equipo ${team?.id}`}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-f1-yellow/10 border border-f1-yellow/30 text-xs font-mono text-f1-yellow font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>SECTOR {sectorIndex} DE {totalSectors}</span>
        </div>
      </div>

      {/* MENSAJE OBLIGATORIO DE BLOQUEO */}
      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic mb-3">
        Procesando telemetría <span className="text-f1-cyan">en Pits...</span>
      </h2>

      <div className="p-4 bg-f1-dark/90 rounded-2xl border border-f1-cyan/30 mb-6 space-y-2">
        <div className="flex items-center justify-center gap-2 text-f1-cyan font-mono text-base md:text-lg font-extrabold uppercase">
          <Tv className="w-5 h-5 animate-bounce" />
          <span>¡Mira la pantalla central!</span>
        </div>
        <p className="text-xs text-slate-400 font-sans">
          Tu tiempo y respuestas han sido transmitidos al servidor. Los autos están acelerando en la pista del circuito.
        </p>
      </div>

      {/* Telemetría registrada */}
      <div className="grid grid-cols-2 gap-3 text-left font-mono text-xs">
        <div className="p-3 bg-f1-dark/60 rounded-xl border border-f1-border">
          <span className="text-slate-500 block text-[10px] uppercase">TIEMPO EN ESTE SECTOR</span>
          <span className="text-sm font-bold text-f1-green">
            {durationFormatted || 'En proceso...'}
          </span>
        </div>
        <div className="p-3 bg-f1-dark/60 rounded-xl border border-f1-border">
          <span className="text-slate-500 block text-[10px] uppercase">ESTADO DE MONOPLAZA</span>
          <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> BLOQUEADO EN PITS
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-f1-border/60 text-[11px] font-mono text-slate-500">
        🛡️ TRANSMISIÓN DE TELEMETRÍA ENCRIPTADA • VELTIS RACING
      </div>
    </div>
  );
}
