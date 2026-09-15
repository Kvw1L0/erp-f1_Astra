'use client';

import React from 'react';
import { motion } from 'framer-motion';
import F1CarSvg from './F1CarSvg';
import NitroEffect from './NitroEffect';
import SkidSparks from './SkidSparks';
import TireSmoke from './TireSmoke';
import { Trophy, Zap, Clock, CheckCircle, ArrowUp, ArrowDown, Minus, ShieldCheck, Wind } from 'lucide-react';

export default function TrackLane({
  laneNumber,
  team,
  result,
  telemetry,
  isRevealed,
  isCarsAdvancing = false,
  isNitroActive,
  isCloseBattle = false
}) {
  const currentPos = telemetry?.currentPosition || laneNumber;
  const posDelta = telemetry?.positionDelta || 0;
  const isLeader = currentPos === 1;
  const isBoosted = telemetry?.isFastestPerfect || result?.isFastestPerfect;
  const isDRS = telemetry?.isDRSActive || result?.isDRSActive;

  const previousDist = telemetry?.previousDistance ?? 0;
  const targetDist = telemetry?.currentDistance ?? 0;

  // Si los autos no han recibido la señal verde de avance (espera de video y pausa de 2s), mantener en posición previa
  const displayPercent = isRevealed
    ? (isCarsAdvancing ? targetDist : previousDist)
    : targetDist;

  // Mapeo seguro al carril visual (dejamos margen para el auto)
  // 0% -> 1%, 100% -> 91%
  const visualLeftPercent = Math.max(1, Math.min(91, (displayPercent / 100) * 90));

  return (
    <div className={`relative flex items-center h-16 md:h-18 my-1 bg-f1-card/90 border-y transition-all overflow-hidden ${
      isCloseBattle
        ? 'border-yellow-400/60 bg-yellow-400/5 shadow-inner'
        : 'border-f1-border/40 hover:bg-f1-cardHover'
    }`}>
      {/* Columna Izquierda: Puesto, Delta de Adelantamiento y Escudería */}
      <div className="w-52 md:w-60 flex-shrink-0 flex items-center gap-2.5 px-3 border-r border-f1-border/60 z-20 bg-f1-card/95 h-full">
        {/* Badge de Puesto Oficial */}
        <div
          className={`w-7 h-7 rounded-lg font-mono text-xs font-black flex items-center justify-center flex-shrink-0 shadow-sm transition-transform ${
            isLeader
              ? 'bg-yellow-400 text-black shadow-yellow-400/40 scale-105'
              : currentPos === 2
              ? 'bg-slate-300 text-black'
              : currentPos === 3
              ? 'bg-amber-700 text-white'
              : 'bg-f1-dark text-slate-400 border border-f1-border'
          }`}
        >
          P{currentPos}
        </div>

        {/* Indicador de Adelantamiento (Delta de posición) */}
        <div className="w-8 flex justify-center">
          {posDelta > 0 ? (
            <span className="flex items-center text-[10px] font-mono font-bold text-f1-green animate-bounce">
              <ArrowUp className="w-3 h-3" />+{posDelta}
            </span>
          ) : posDelta < 0 ? (
            <span className="flex items-center text-[10px] font-mono font-bold text-f1-red">
              <ArrowDown className="w-3 h-3" />{posDelta}
            </span>
          ) : (
            <span className="text-slate-600 font-mono text-xs">
              <Minus className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Barra de color de escudería */}
        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: team.color || '#E10600' }} />

        {/* Nombre de Equipo y Subnombre */}
        <div className="truncate flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs md:text-sm font-bold text-white block truncate leading-tight">
              {team.shortName || `EQ ${laneNumber}`}
            </span>
            {isCloseBattle && (
              <span className="px-1 py-0.2 rounded bg-yellow-400 text-black font-mono font-black text-[9px] uppercase animate-pulse">
                BATTLE
              </span>
            )}
            {telemetry?.isSuperBoostActive && (
              <span className="px-1 py-0.2 rounded bg-purple-500 text-white font-mono font-black text-[9px] uppercase animate-pulse">
                BOOST
              </span>
            )}
          </div>
          {(telemetry?.subname || team.subname) ? (
            <span className="text-[10px] font-bold text-f1-yellow truncate block leading-tight">
              {telemetry?.subname || team.subname}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-400 truncate block">
              {telemetry?.cumulativeScore || 0} pts acumulados
            </span>
          )}
        </div>
      </div>

      {/* Carril de Pista Central Horizontal con Sectores */}
      <div className="flex-1 relative h-full flex items-center px-2 overflow-hidden f1-track-bg">
        {/* Líneas de Sectores S1 a S10 en el fondo */}
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20 text-[9px] font-mono text-slate-400 px-4 items-center">
          <span>0%</span>
          <span>S1</span>
          <span>S2</span>
          <span>S3</span>
          <span>S4</span>
          <span>S5</span>
          <span>S6</span>
          <span>S7</span>
          <span>S8</span>
          <span>S9</span>
          <span className="text-f1-red font-bold">🏁 META</span>
        </div>

        {/* Línea de Meta Cuadriculada */}
        <div className="absolute right-8 top-0 bottom-0 w-3 f1-kerb opacity-80 pointer-events-none" />

        {/* Monoplaza animado progresivamente con Framer Motion */}
        <motion.div
          className="absolute z-10 flex items-center"
          initial={{ left: `${Math.max(1, (previousDist / 100) * 90)}%` }}
          animate={{
            left: `${visualLeftPercent}%`,
            transition: {
              duration: isBoosted && isNitroActive ? 1.2 : isDRS ? 1.6 : 2.5,
              ease: isBoosted && isNitroActive ? 'easeOut' : [0.25, 1, 0.5, 1]
            }
          }}
        >
          {/* Fuego Nitro si ganó el Pole Position Boost */}
          {isBoosted && isNitroActive && <NitroEffect />}

          {/* Chispas de titanio en aceleración */}
          {isRevealed && <SkidSparks count={isBoosted ? 12 : 6} />}

          {/* Humo de neumáticos al salir */}
          {isRevealed && <TireSmoke />}

          {/* Badge Flotante DRS si está activo */}
          {isDRS && (
            <div className="absolute -top-6 left-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-black font-mono font-black text-[9px] uppercase shadow-[0_0_10px_#10B981] animate-pulse">
              <Wind className="w-3 h-3" />
              <span>DRS +10%</span>
            </div>
          )}

          {/* Badge Flotante Super Boost si está activo */}
          {telemetry?.isSuperBoostActive && (
            <div className="absolute -top-6 right-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-600 text-white font-mono font-black text-[9px] uppercase shadow-[0_0_15px_#A855F7] animate-pulse">
              <Zap className="w-3 h-3 fill-yellow-300 text-yellow-300" />
              <span>BOOST +15%</span>
            </div>
          )}

          <F1CarSvg
            color={team.color || '#E10600'}
            number={laneNumber}
            isBoosted={isBoosted && isNitroActive}
          />
        </motion.div>
      </div>

      {/* Columna Derecha: Telemetría de Distancia Acumulada */}
      <div className="w-36 md:w-44 flex-shrink-0 flex items-center justify-end gap-3 px-4 border-l border-f1-border/60 z-20 bg-f1-card/95 h-full font-mono text-xs">
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 font-bold text-white text-sm">
            {isBoosted && <Zap className="w-3.5 h-3.5 text-f1-cyan fill-f1-cyan animate-pulse" />}
            {isDRS && <Wind className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
            <span className={isLeader ? 'text-yellow-400' : isDRS ? 'text-emerald-400' : 'text-f1-cyan'}>
              {displayPercent}%
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            {result?.durationFormatted ? result.durationFormatted : `Avance: +${telemetry?.lastSectorAdvance || 0}%`}
          </div>
        </div>
      </div>
    </div>
  );
}
