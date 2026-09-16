'use client';

import React, { useEffect, useState, useRef } from 'react';
import { raceNow } from '../../lib/firebase';
import { Clock, AlertTriangle } from 'lucide-react';

export default function CountdownBar({ startTime, durationSeconds = 60, onTimeExpired }) {
  const [timeLeftMs, setTimeLeftMs] = useState(durationSeconds * 1000);
  const totalMs = durationSeconds * 1000;
  const lastVibratedSecond = useRef(-1);

  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (!startTime) return;
    hasExpiredRef.current = false;

    const interval = setInterval(() => {
      const now = raceNow();
      const elapsed = Math.max(0, now - startTime);
      const remaining = Math.max(0, totalMs - elapsed);

      setTimeLeftMs(remaining);

      // Feedback háptico en los últimos 5 segundos
      const currentSec = Math.ceil(remaining / 1000);
      if (currentSec <= 5 && currentSec > 0 && currentSec !== lastVibratedSecond.current) {
        lastVibratedSecond.current = currentSec;
        if (typeof window !== 'undefined' && window.navigator?.vibrate) {
          window.navigator.vibrate(50);
        }
      }

      if (remaining <= 0) {
        clearInterval(interval);
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true;
          if (onTimeExpired) onTimeExpired();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, durationSeconds, totalMs, onTimeExpired]);

  const percentage = Math.max(0, Math.min(100, (timeLeftMs / totalMs) * 100));
  const secondsLeft = (timeLeftMs / 1000).toFixed(1);

  // Determinar color de la barra según porcentaje
  let barColor = 'bg-f1-cyan shadow-[0_0_12px_rgba(0,240,255,0.7)]';
  let badgeColor = 'text-f1-cyan border-f1-cyan/30 bg-f1-cyan/10';

  if (percentage < 18) {
    barColor = 'bg-f1-red shadow-[0_0_15px_rgba(225,6,0,0.9)] animate-pulse';
    badgeColor = 'text-f1-red border-f1-red/40 bg-f1-red/20 animate-pulse';
  } else if (percentage < 40) {
    barColor = 'bg-f1-yellow shadow-[0_0_12px_rgba(255,184,0,0.7)]';
    badgeColor = 'text-f1-yellow border-f1-yellow/30 bg-f1-yellow/10';
  }

  return (
    <div className="w-full fixed top-0 left-0 z-50 bg-f1-dark/95 backdrop-blur-md border-b border-f1-border">
      {/* Contenedor de la barra delgada horizontal */}
      <div className="w-full h-1.5 bg-slate-800/80 overflow-hidden relative">
        <div
          className={`h-full transition-all duration-75 ease-linear ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Ticker informativo debajo de la barra */}
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-f1-cyan" />
          <span className="hidden sm:inline">CRONÓMETRO DE PITS:</span>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold ${badgeColor}`}>
          {percentage < 20 && <AlertTriangle className="w-3 h-3" />}
          <span>{secondsLeft}s RESTANTES</span>
        </div>
      </div>
    </div>
  );
}
