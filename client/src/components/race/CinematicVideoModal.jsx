'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Film, Flag, Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function CinematicVideoModal({
  videoUrl = '/videos/f1-race-action.mp4',
  sectorIndex = 1,
  totalSectors = 10,
  onFinish
}) {
  const [secondsLeft, setSecondsLeft] = useState(7);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Cuenta regresiva automática
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onFinish) onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden animate-fade-in">
      {/* Video de Fondo o Animación Cinemática */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          playsInline
          muted={isMuted}
          onEnded={onFinish}
          className="w-full h-full object-cover opacity-90"
        >
          {/* Fallback si el navegador no carga el video */}
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Overlay Cinemático con Efecto TV F1 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />

        {/* HUD F1 Superior */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-lg bg-f1-red text-white font-mono font-black text-xs uppercase flex items-center gap-1.5 shadow-lg shadow-f1-red/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE ON-BOARD BATTLE</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono text-white">
              SECTOR {sectorIndex} DE {totalSectors} • VELTIS GRAND PRIX
            </div>
          </div>

          {/* Botón Saltar Video */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onFinish}
              className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-black font-mono font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <span>SALTAR CINEMÁTICA ({secondsLeft}s)</span>
              <FastForward className="w-4 h-4 fill-black" />
            </button>
          </div>
        </div>

        {/* HUD F1 Inferior */}
        <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
          <div className="bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-lg">
            <span className="text-[10px] font-mono text-f1-cyan uppercase tracking-wider block font-bold">
              TELEMETRÍA DE PITS PROCESADA
            </span>
            <h3 className="text-lg md:text-xl font-black text-white italic uppercase">
              ¡Disputa por la posición en pista!
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-sans">
              Preparando cálculo de avance de monoplazas y activación de Pole Boost...
            </p>
          </div>

          {/* Barra de progreso de la cinemática */}
          <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-f1-cyan transition-all duration-1000 ease-linear"
              style={{ width: `${((7 - secondsLeft) / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
