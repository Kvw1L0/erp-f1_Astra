'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Zap, Clock, X, Flag, CheckCircle2, ChevronRight } from 'lucide-react';

export default function PodiumModal({ results, onClose }) {
  const ranking = results?.ranking || [];
  const p1 = ranking[0];
  const p2 = ranking[1];
  const p3 = ranking[2];
  const boostedTeam = ranking.find(r => r.isFastestPerfect);

  useEffect(() => {
    // Lanzar confeti estilo podio F1
    try {
      const end = Date.now() + 3000;
      const colors = ['#E10600', '#00F0FF', '#FFB800', '#FFFFFF'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch (e) {
      console.log('Confetti error', e);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl w-full bg-f1-card border border-f1-border rounded-3xl p-6 md:p-8 shadow-2xl relative my-auto">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-f1-dark border border-f1-border text-slate-400 hover:text-white hover:border-slate-400 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header del Podio */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold mb-3 uppercase">
            <Trophy className="w-4 h-4" />
            <span>CEREMONIA DE PODIO OFICIAL • PITS GP</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase italic">
            Clasificación <span className="text-f1-red">Final</span>
          </h2>
          <p className="text-sm text-slate-400 font-mono mt-1">
            {results?.caseTitle}
          </p>
        </div>

        {/* Banner de Pole Position Boost si existe */}
        {boostedTeam && (
          <div className="mb-8 p-4 bg-gradient-to-r from-f1-cyan/15 via-blue-900/30 to-f1-cyan/15 border border-f1-cyan/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-f1-cyan/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-f1-cyan text-black flex items-center justify-center font-bold shadow-lg shadow-f1-cyan/30 flex-shrink-0">
                <Zap className="w-7 h-7 fill-black" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-f1-cyan uppercase tracking-wider block">
                  POLE POSITION BOOST GANADOR (+20% BONIFICACIÓN)
                </span>
                <h4 className="text-lg font-bold text-white">
                  {boostedTeam.teamName}
                </h4>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-300">
              <div className="text-sm font-bold text-f1-cyan">{boostedTeam.score} PTS (100% PERFECTO)</div>
              <div className="text-slate-400">TIEMPO RÉCORD: {boostedTeam.durationFormatted}</div>
            </div>
          </div>
        )}

        {/* Los 3 Escalones del Podio */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 items-end mb-8 pt-4">
          {/* P2: Segundo Lugar */}
          {p2 && (
            <div className="bg-f1-dark/80 p-4 md:p-6 rounded-2xl border border-slate-700 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-300 text-black font-mono font-black text-base flex items-center justify-center mb-3 shadow-md">
                P2
              </div>
              <span className="text-xs md:text-sm font-bold text-white block truncate max-w-full">
                {p2.shortName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1">
                {p2.score} PTS • {p2.durationFormatted}
              </span>
            </div>
          )}

          {/* P1: Ganador de Carrera */}
          {p1 && (
            <div className="bg-gradient-to-b from-yellow-500/20 to-f1-dark p-5 md:p-8 rounded-2xl border-2 border-yellow-400 text-center flex flex-col items-center shadow-xl shadow-yellow-400/10 -translate-y-2">
              <div className="w-14 h-14 rounded-full bg-yellow-400 text-black font-mono font-black text-xl flex items-center justify-center mb-3 shadow-lg shadow-yellow-400/40">
                P1
              </div>
              <span className="text-sm md:text-base font-black text-white block truncate max-w-full">
                {p1.shortName}
              </span>
              <span className="text-xs text-yellow-400 font-mono font-bold mt-1">
                {p1.score} PTS
              </span>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                {p1.durationFormatted}
              </span>
            </div>
          )}

          {/* P3: Tercer Lugar */}
          {p3 && (
            <div className="bg-f1-dark/80 p-4 md:p-6 rounded-2xl border border-amber-800/80 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-amber-700 text-white font-mono font-black text-base flex items-center justify-center mb-3 shadow-md">
                P3
              </div>
              <span className="text-xs md:text-sm font-bold text-white block truncate max-w-full">
                {p3.shortName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1">
                {p3.score} PTS • {p3.durationFormatted}
              </span>
            </div>
          )}
        </div>

        {/* Tabla Completa de las 10 Escuderías */}
        <div className="bg-f1-dark/90 rounded-2xl border border-f1-border overflow-hidden">
          <div className="px-4 py-2.5 bg-f1-card border-b border-f1-border text-[11px] font-mono text-slate-400 flex justify-between">
            <span>POS / ESCUDERÍA</span>
            <span>TELEMETRÍA (TIEMPO / PTS)</span>
          </div>
          <div className="divide-y divide-f1-border/40 max-h-60 overflow-y-auto">
            {ranking.map((item) => (
              <div
                key={item.teamId}
                className="px-4 py-2.5 flex items-center justify-between text-xs font-mono hover:bg-f1-card/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-400 w-6">P{item.position}</span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white font-semibold">{item.teamName}</span>
                  {item.isFastestPerfect && (
                    <span className="px-2 py-0.5 rounded bg-f1-cyan/20 text-f1-cyan text-[10px] font-bold">
                      POLE BOOST
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-slate-400">{item.durationFormatted}</span>
                  <span className="text-white font-bold w-16">{item.score} PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón inferior */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-f1-red hover:bg-red-600 text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md shadow-f1-red/20"
          >
            VOLVER A LA PISTA
          </button>
        </div>
      </div>
    </div>
  );
}
