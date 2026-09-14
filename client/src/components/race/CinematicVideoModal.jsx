'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Film, Flag, Volume2, VolumeX, Sparkles, Play, Zap } from 'lucide-react';
import { sounds } from '../../lib/soundEffects';

export default function CinematicVideoModal({
  videoType = 'START', // 'START' (Video 1 Arranque) | 'RACE_BATTLE' (Video 2 Carrera)
  sectorIndex = 1,
  totalSectors = 10,
  onFinish
}) {
  const isStart = videoType === 'START';
  const defaultDuration = isStart ? 6 : 7;
  const [secondsLeft, setSecondsLeft] = useState(defaultDuration);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [lightsCount, setLightsCount] = useState(0);
  const videoRef = useRef(null);

  const videoSrc = isStart
    ? '/videos/video-1-start.mp4'
    : '/videos/f1-race-action.mp4.mp4';

  // Sonido de inicio y cuenta regresiva de semáforos si es START
  useEffect(() => {
    if (isStart) {
      let count = 0;
      const lightInterval = setInterval(() => {
        count++;
        setLightsCount(count);
        sounds.playCountdownTick();
        if (count >= 5) {
          clearInterval(lightInterval);
          setTimeout(() => {
            setLightsCount(0);
            sounds.playRaceStart();
          }, 1200);
        }
      }, 700);

      return () => clearInterval(lightInterval);
    } else {
      sounds.playDopplerOvertake();
    }
  }, [isStart]);

  useEffect(() => {
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
      {/* Video de Fondo o Fallback Cinemático */}
      <div className="relative w-full h-full flex items-center justify-center">
        {!videoError ? (
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            playsInline
            muted={isMuted}
            onError={() => setVideoError(true)}
            onEnded={onFinish}
            className="w-full h-full object-cover opacity-90"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          /* Fallback visual cinemático con Canvas/CSS F1 */
          <div className="w-full h-full bg-gradient-to-b from-slate-950 via-carbon to-black flex flex-col items-center justify-center relative overflow-hidden">
            {/* Luces de velocidad de fondo */}
            <div className="absolute inset-0 bg-[radial-gradient(#E10600_1px,transparent_1px)] [background-size:24px_24px] opacity-25 animate-pulse" />

            {/* Semáforo oficial de 5 luces F1 */}
            {isStart ? (
              <div className="z-10 flex flex-col items-center gap-6 p-8 bg-black/80 rounded-3xl border border-white/20 shadow-[0_0_80px_rgba(225,6,0,0.5)]">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                  SECUENCIA OFICIAL DE LARGADA • FIA F1 PITS
                </span>
                <div className="flex gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const active = lightsCount >= num;
                    return (
                      <div key={num} className="flex flex-col items-center gap-2">
                        <div
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-4 transition-all duration-200 ${
                            active
                              ? 'bg-red-600 border-red-400 shadow-[0_0_35px_#ff0000]'
                              : 'bg-red-950/30 border-red-900/50'
                          }`}
                        />
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                      </div>
                    );
                  })}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-wider">
                  {lightsCount === 0 && secondsLeft <= 3 ? '¡¡¡LIGHTS OUT AND AWAY WE GO!!!' : 'ARRANQUE DE CARRERA EN BREVES SEGUNDOS'}
                </h2>
              </div>
            ) : (
              /* Animación de Batalla en Pista */
              <div className="z-10 flex flex-col items-center gap-4 p-8 bg-black/80 rounded-3xl border border-white/20 shadow-[0_0_80px_rgba(0,240,255,0.4)]">
                <div className="w-20 h-20 rounded-3xl bg-f1-cyan/20 border-2 border-f1-cyan flex items-center justify-center text-f1-cyan shadow-xl shadow-f1-cyan/30 animate-pulse">
                  <Zap className="w-10 h-10" />
                </div>
                <span className="text-xs font-mono text-f1-cyan uppercase tracking-widest">
                  TELEMETRÍA EN DISPUTA DIRECTA
                </span>
                <h2 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-wide">
                  BATALLA EN PISTA POR LA POSICIÓN
                </h2>
                <p className="text-sm font-mono text-slate-300 max-w-md text-center">
                  Calculando aceleración, adelantamientos y activaciones de Nitro Boost...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Overlay Cinemático con Efecto TV F1 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />

        {/* HUD F1 Superior */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className={`px-3.5 py-1.5 rounded-xl text-white font-mono font-black text-xs uppercase flex items-center gap-2 shadow-lg animate-pulse ${
              isStart ? 'bg-f1-red shadow-f1-red/40' : 'bg-f1-cyan text-black shadow-f1-cyan/40'
            }`}>
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{isStart ? 'VIDEO 1 • RACE START SEQUENCE' : 'VIDEO 2 • ON-BOARD BATTLE'}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-xs font-mono text-white">
              SECTOR {sectorIndex} DE {totalSectors} • GRAN PREMIO DE LA EFICIENCIA
            </div>
          </div>

          {/* Controles de Sonido y Salto */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onFinish}
              className="px-5 py-2.5 rounded-xl bg-white/95 hover:bg-white text-black font-mono font-black text-xs uppercase flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              <span>SALTAR VIDEO ({secondsLeft}s)</span>
              <FastForward className="w-4 h-4 fill-black" />
            </button>
          </div>
        </div>

        {/* HUD F1 Inferior */}
        <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
          <div className="bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/15 max-w-lg">
            <span className="text-[10px] font-mono text-f1-cyan uppercase tracking-wider block font-bold">
              {isStart ? 'PREPARANDO LARGADA OFICIAL' : 'TELEMETRÍA DE PITS PROCESADA'}
            </span>
            <h3 className="text-lg md:text-xl font-black text-white italic uppercase">
              {isStart ? '¡Todos los monoplazas listos en la grilla!' : '¡Disputa por los puntos y sobrepasos en vivo!'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-sans">
              {isStart
                ? 'Al concluir la cinemática, se abrirá el caso en las tablets de los participantes.'
                : 'Al concluir la cinemática, tras 2 segundos se desplegarán los avances en la pista.'}
            </p>
          </div>

          {/* Barra de progreso de la cinemática */}
          <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden border border-white/20">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${isStart ? 'bg-f1-red' : 'bg-f1-cyan'}`}
              style={{ width: `${Math.max(5, (secondsLeft / defaultDuration) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
