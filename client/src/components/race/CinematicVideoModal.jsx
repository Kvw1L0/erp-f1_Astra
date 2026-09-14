'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Volume2, VolumeX, Zap, Gauge, Radio, Sparkles } from 'lucide-react';
import { sounds } from '../../lib/soundEffects';

export const DEFAULT_BATTLE_THEMES = {
  1: {
    title: "Curva 1: Frenada Extrema a 340 km/h y Adelantamiento por el Vértice",
    desc: "Cámaras on-board a ras de asfalto: las escuderías con cierre contable impecable ganan tracción en la primera curva."
  },
  2: {
    title: "Chicane de Alta Velocidad: Duelo Rueda a Rueda al Milímetro",
    desc: "Telemetría lateral de cascos: sobrepaso milimétrico en la frenada sin bloqueo de neumáticos."
  },
  3: {
    title: "Eau Rouge & Raidillon: Subida a Fondo a 315 km/h Sin Levantar",
    desc: "Cámara de halo en compresión brutal: stock sincronizado permite aceleración máxima en la recta Kemmel."
  },
  4: {
    title: "Tren de DRS en Recta Principal: Doble Rebase a 355 km/h",
    desc: "Alerón trasero abierto y succión aerodinámica brutal en plena recta de meta."
  },
  5: {
    title: "Horquilla de 180°: Frenada Tardía y Tijera Perfecta (Switchback)",
    desc: "Frenada al límite en la horquilla: cruce de trazada y tracción inmediata en la salida."
  },
  6: {
    title: "Curva Peraltada Extrema: Adelantamiento por Arriba Rozando el Muro",
    desc: "Giro con 70° de inclinación: chispas de titanio del fondo plano iluminando la pista."
  },
  7: {
    title: "Batalla Bajo Lluvia Intensa: Spray de Agua y Adelantamiento a Ciegas",
    desc: "Visibilidad cero por el spray de agua: adelantamiento milagroso guiado por telemetría pura."
  },
  8: {
    title: "Túnel a 300 km/h: Aullido del Motor V6 y Rebase en Penumbra",
    desc: "Resplandor de frenos al rojo vivo en la penumbra del túnel con eco ensordecedor del motor."
  },
  9: {
    title: "Chicanes Enlazadas: Cambios Bruscos de Dirección y Toque de Neumáticos",
    desc: "Transferencia violenta de pesos de izquierda a derecha volando sobre los pianos de la chicane."
  },
  10: {
    title: "Última Vuelta: Foto-Finish Paralelo por Milésimas de Segundo",
    desc: "Llegada rueda a rueda a la línea de meta: bandera a cuadros ondeando y trompos de victoria con chispas."
  }
};

export default function CinematicVideoModal({
  videoType = 'START', // 'START' (Video 1 Arranque) | 'RACE_BATTLE' (Video 2 Batalla de Sector)
  sectorIndex = 1,
  totalSectors = 10,
  videoUrl = null,
  battleTitle = null,
  battleDescription = null,
  onFinish
}) {
  const isStart = videoType === 'START';
  const defaultDuration = isStart ? 6 : 7;
  const [secondsLeft, setSecondsLeft] = useState(defaultDuration);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [lightsCount, setLightsCount] = useState(0);
  const [liveSpeed, setLiveSpeed] = useState(312);
  const [liveRpmRatio, setLiveRpmRatio] = useState(0.85);
  const videoRef = useRef(null);

  const sectorKey = Math.min(Math.max(Number(sectorIndex) || 1, 1), 10);
  const sectorTheme = DEFAULT_BATTLE_THEMES[sectorKey] || DEFAULT_BATTLE_THEMES[1];
  const activeTitle = battleTitle || (isStart ? "Secuencia Oficial de Salida GP" : sectorTheme.title);
  const activeDesc = battleDescription || (isStart ? "Semáforo FIA: 5 luces rojas encendiéndose. Al apagarse se inicia la ronda." : sectorTheme.desc);

  // Determinar ruta de video inicial con padding '01'..'10'
  const sectorPadded = String(sectorKey).padStart(2, '0');
  const initialSource = isStart
    ? '/videos/video-1-start.mp4'
    : (videoUrl || `/videos/sector-${sectorPadded}-battle.mp4`);

  const [currentVideoSrc, setCurrentVideoSrc] = useState(initialSource);

  // Actualizar cuando cambien props
  useEffect(() => {
    setCurrentVideoSrc(
      isStart
        ? '/videos/video-1-start.mp4'
        : (videoUrl || `/videos/sector-${sectorPadded}-battle.mp4`)
    );
    setVideoError(false);
    setSecondsLeft(defaultDuration);
  }, [isStart, videoUrl, sectorKey, defaultDuration, sectorPadded]);

  // Manejo de fallbacks escalonados en caso de error de carga
  const handleVideoError = () => {
    if (currentVideoSrc !== '/videos/video-2-battle.mp4' && currentVideoSrc !== '/videos/f1-race-action.mp4') {
      setCurrentVideoSrc('/videos/video-2-battle.mp4');
    } else if (currentVideoSrc === '/videos/video-2-battle.mp4') {
      setCurrentVideoSrc('/videos/f1-race-action.mp4');
    } else {
      setVideoError(true);
    }
  };

  // Sonido de inicio y cuenta regresiva de semáforos si es START, o Doppler si es BATTLE
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

  // Telemetría animada en vivo de velocidad y RPM durante el video de batalla
  useEffect(() => {
    if (isStart) return;
    const telemTimer = setInterval(() => {
      setLiveSpeed(prev => Math.min(358, Math.max(305, prev + Math.floor(Math.random() * 7) - 2)));
      setLiveRpmRatio(prev => Math.min(0.98, Math.max(0.70, prev + (Math.random() * 0.1 - 0.04))));
    }, 250);

    return () => clearInterval(telemTimer);
  }, [isStart]);

  // Cronómetro de cierre automático
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
            key={currentVideoSrc}
            src={currentVideoSrc}
            autoPlay
            playsInline
            muted={isMuted}
            onError={handleVideoError}
            onEnded={onFinish}
            className="w-full h-full object-cover opacity-90"
          >
            <source src={currentVideoSrc} type="video/mp4" />
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
              /* Animación de Batalla en Pista Generativa */
              <div className="z-10 flex flex-col items-center gap-4 p-8 bg-black/85 rounded-3xl border border-f1-cyan/40 shadow-[0_0_90px_rgba(0,240,255,0.35)] max-w-2xl text-center">
                <div className="w-20 h-20 rounded-3xl bg-f1-cyan/20 border-2 border-f1-cyan flex items-center justify-center text-f1-cyan shadow-xl shadow-f1-cyan/30 animate-pulse">
                  <Zap className="w-10 h-10" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-f1-cyan/10 border border-f1-cyan/30 text-f1-cyan font-mono text-xs uppercase tracking-widest">
                  <span>TELEMETRÍA EN DISPUTA DIRECTA • SECTOR {sectorKey}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-wide">
                  {activeTitle}
                </h2>
                <p className="text-sm font-sans text-slate-300">
                  {activeDesc}
                </p>

                {/* Gráfico de Telemetría Dinámica */}
                <div className="w-full bg-black/60 p-4 rounded-2xl border border-white/10 flex items-center justify-around gap-4 mt-2 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">VELOCIDAD PUNTA</span>
                    <span className="text-2xl font-black text-f1-cyan">{liveSpeed} <span className="text-xs text-slate-400">KM/H</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">MARCHA</span>
                    <span className="text-2xl font-black text-white">8ª <span className="text-xs text-f1-green font-bold">DRS</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">FUERZA G</span>
                    <span className="text-2xl font-black text-yellow-400">4.3 G</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Overlay Cinemático TV F1 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />

        {/* HUD F1 Superior */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className={`px-3.5 py-1.5 rounded-xl text-white font-mono font-black text-xs uppercase flex items-center gap-2 shadow-lg animate-pulse ${
              isStart ? 'bg-f1-red shadow-f1-red/40' : 'bg-f1-cyan text-black shadow-f1-cyan/40'
            }`}>
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{isStart ? 'VIDEO 1 • RACE START SEQUENCE' : `VIDEO SECTOR ${sectorPadded} • ON-BOARD BATTLE`}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-xs font-mono text-white">
              SECTOR {sectorKey} DE {totalSectors} • GRAN PREMIO DE LA EFICIENCIA
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

        {/* HUD F1 Inferior: Lower Third Televisivo Oficial */}
        <div className="absolute bottom-8 left-8 right-8 flex flex-col lg:flex-row items-end lg:items-center justify-between gap-4 z-20">
          <div className="bg-black/85 backdrop-blur-md p-5 rounded-2xl border border-white/15 max-w-2xl shadow-2xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-f1-red text-white text-[10px] font-mono font-black uppercase tracking-wider">
                {isStart ? 'LARGADA GP' : `SECTOR ${sectorKey} EN DISPUTA`}
              </span>
              <span className="text-[11px] font-mono text-f1-cyan font-bold uppercase tracking-wider">
                {isStart ? 'PREPARANDO LARGADA OFICIAL' : 'ON-BOARD CAM • VELOCIDAD VERTIGINOSA'}
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white italic uppercase leading-tight">
              {activeTitle}
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-sans">
              {activeDesc}
            </p>
          </div>

          {/* Widget de Telemetría Dinámica en Tiempo Real (Velocidad, RPM, DRS) */}
          <div className="bg-black/85 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-5 font-mono shadow-2xl">
            {!isStart && (
              <div className="flex items-center gap-4">
                {/* Speedometer */}
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">VELOCIDAD</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white tracking-tight">{liveSpeed}</span>
                    <span className="text-[10px] text-f1-cyan font-bold">KM/H</span>
                  </div>
                </div>

                {/* Shift Lights & Gear */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">GEAR</span>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-black text-f1-yellow">8</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-4 rounded-sm transition-all ${
                            liveRpmRatio > i * 0.18
                              ? i > 3 ? 'bg-f1-red shadow-[0_0_8px_#ff0000]' : 'bg-f1-green'
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* DRS Status */}
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>DRS OPEN</span>
                </div>
              </div>
            )}

            {/* Barra de Progreso de Cinemática */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] text-slate-400 font-mono">
                {secondsLeft}s RESTANTES
              </span>
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden border border-white/20">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${isStart ? 'bg-f1-red' : 'bg-f1-cyan'}`}
                  style={{ width: `${Math.max(5, (secondsLeft / defaultDuration) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
