'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import TrackLane from '../../components/race/TrackLane';
import PodiumModal from '../../components/race/PodiumModal';
import CinematicVideoModal from '../../components/race/CinematicVideoModal';
import CaseSolutionModal from '../../components/race/CaseSolutionModal';
import { sounds } from '../../lib/soundEffects';
import { Flag, Zap, Volume2, VolumeX, Maximize, Trophy, Clock, Users, Compass, BookOpen, Film } from 'lucide-react';

const TEAMS_LIST = [
  { id: 1, name: "Escudería 1 - Red Bull Racing", color: "#3671C6", shortName: "EQ 01" },
  { id: 2, name: "Escudería 2 - Scuderia Ferrari", color: "#E80020", shortName: "EQ 02" },
  { id: 3, name: "Escudería 3 - Mercedes-AMG Petronas", color: "#27F4D2", shortName: "EQ 03" },
  { id: 4, name: "Escudería 4 - McLaren F1 Team", color: "#FF8000", shortName: "EQ 04" },
  { id: 5, name: "Escudería 5 - Aston Martin Aramco", color: "#229971", shortName: "EQ 05" },
  { id: 6, name: "Escudería 6 - Alpine F1 Team", color: "#0093CC", shortName: "EQ 06" },
  { id: 7, name: "Escudería 7 - Williams Racing", color: "#64C4FF", shortName: "EQ 07" },
  { id: 8, name: "Escudería 8 - Visa Cash App RB", color: "#6692FF", shortName: "EQ 08" },
  { id: 9, name: "Escudería 9 - Stake F1 Kick Sauber", color: "#52E252", shortName: "EQ 09" },
  { id: 10, name: "Escudería 10 - Haas F1 Team", color: "#B6BABD", shortName: "EQ 10" }
];

export default function RaceScreenPage() {
  const { socket, isConnected, gameState } = useSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [showCinematic, setShowCinematic] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [enableCinematic, setEnableCinematic] = useState(true);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('join_race_screen');
    }
  }, [socket, isConnected]);

  // Manejar revelación de resultados con secuencia de Cinemática -> Pista -> Nitro -> Podio
  useEffect(() => {
    if (!socket) return;

    socket.on('results_revealed', (results) => {
      setResultsData(results);
      setIsNitroActive(false);
      setShowPodium(false);

      if (enableCinematic) {
        // 1. Mostrar cinemática de video
        setShowCinematic(true);
      } else {
        // Si la cinemática está desactivada, ir directo a la animación de pista
        triggerTrackAnimation(results);
      }
    });

    socket.on('lobby_reset', () => {
      setResultsData(null);
      setIsNitroActive(false);
      setShowCinematic(false);
      setShowPodium(false);
      setShowSolution(false);
    });

    return () => {
      socket.off('results_revealed');
      socket.off('lobby_reset');
    };
  }, [socket, enableCinematic]);

  const triggerTrackAnimation = (results) => {
    setShowCinematic(false);
    sounds.playRaceStart();

    // Pausa dramática de 2 segundos antes del Nitro Boost
    const nitroTimer = setTimeout(() => {
      if (results?.fastestPerfectTeamId) {
        setIsNitroActive(true);
        sounds.playNitroBoost();
      }

      const podiumTimer = setTimeout(() => {
        setShowPodium(true);
      }, 3000);

      return () => clearTimeout(podiumTimer);
    }, 2000);

    return () => clearTimeout(nitroTimer);
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sounds.setMuted(nextState);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  const isRevealed = gameState?.status === 'REVEALED' && resultsData !== null;
  const isCaseActive = gameState?.status === 'ACTIVE_CASE';
  const sectorIndex = gameState?.currentSectorIndex || 1;
  const totalSectors = gameState?.totalSectors || 10;
  const teamTelemetry = gameState?.teamTelemetry || {};

  return (
    <div className="min-h-screen bg-f1-dark text-slate-100 flex flex-col justify-between p-3 md:p-6 overflow-hidden select-none relative">
      {/* 1. CINEMÁTICA DE VIDEO INTERCALADA */}
      {showCinematic && (
        <CinematicVideoModal
          sectorIndex={sectorIndex}
          totalSectors={totalSectors}
          onFinish={() => triggerTrackAnimation(resultsData)}
        />
      )}

      {/* Header Oficial */}
      <header className="flex items-center justify-between bg-f1-card px-4 py-3 rounded-2xl border border-f1-border shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-f1-red rounded-xl flex items-center justify-center text-white shadow-md shadow-f1-red/30">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
              <span>GRAN PREMIO DE LA EFICIENCIA</span>
              <span className="text-f1-red text-xs md:text-sm font-mono font-bold bg-f1-red/10 border border-f1-red/30 px-2.5 py-0.5 rounded-full not-italic">
                SECTOR {sectorIndex} / {totalSectors}
              </span>
            </h1>
            <p className="text-xs font-mono text-slate-400">
              {gameState?.currentCase?.title ? `TRAMO ACTUAL: ${gameState.currentCase.title}` : 'CIRCUITO LINEAL EN PROCESO'}
            </p>
          </div>
        </div>

        {/* Indicadores y Controles */}
        <div className="flex items-center gap-3">
          {isCaseActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-f1-dark rounded-xl border border-f1-border font-mono text-xs text-slate-300">
              <Users className="w-4 h-4 text-f1-cyan" />
              <span>ENVÍOS: {gameState.submissionsCount || 0} / 10 EQUIPOS</span>
            </div>
          )}

          {/* Toggle Cinemática */}
          <button
            onClick={() => setEnableCinematic(!enableCinematic)}
            className={`p-2 rounded-xl border font-mono text-xs flex items-center gap-1.5 transition-colors ${
              enableCinematic
                ? 'bg-f1-cyan/10 border-f1-cyan/40 text-f1-cyan'
                : 'bg-f1-dark border-f1-border text-slate-500'
            }`}
            title="Activar/Desactivar Cinemática de Video al revelar"
          >
            <Film className="w-4 h-4" />
            <span className="hidden lg:inline">{enableCinematic ? 'CINEMÁTICA ON' : 'CINEMÁTICA OFF'}</span>
          </button>

          {/* Mute */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-f1-dark border border-f1-border text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-f1-green" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-f1-dark border border-f1-border text-slate-400 hover:text-white transition-colors"
          >
            <Maximize className="w-5 h-5" />
          </button>

          {/* Solución Óptima ERP */}
          {gameState?.currentCase && (
            <button
              onClick={() => setShowSolution(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-f1-dark hover:bg-slate-800 text-slate-200 border border-f1-border font-mono font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <BookOpen className="w-4 h-4 text-f1-cyan" />
              <span className="hidden sm:inline">SOLUCIÓN ERP</span>
            </button>
          )}

          {/* Podio / Clasificación */}
          {isRevealed && (
            <button
              onClick={() => setShowPodium(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Trophy className="w-4 h-4" />
              <span>CLASIFICACIÓN</span>
            </button>
          )}
        </div>
      </header>

      {/* PISTA DE CARRERAS: 10 CARRILES */}
      <main className="flex-1 my-3 flex flex-col justify-center bg-f1-card/60 rounded-2xl border border-f1-border p-2 md:p-3 overflow-hidden shadow-2xl relative">
        {TEAMS_LIST.map((team, index) => {
          const laneNum = index + 1;
          const result = resultsData?.teams?.find(t => t.teamId === laneNum);
          const telemetry = teamTelemetry[laneNum] || {
            currentPosition: laneNum,
            currentDistance: 0,
            previousDistance: 0,
            positionDelta: 0
          };

          return (
            <TrackLane
              key={team.id}
              laneNumber={laneNum}
              team={team}
              result={result}
              telemetry={telemetry}
              isRevealed={isRevealed}
              isNitroActive={isNitroActive}
            />
          );
        })}
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between bg-f1-card px-4 py-2 rounded-xl border border-f1-border text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-f1-cyan" /> CIRCUITO DE 10 SECTORES • AVANCE PROGRESIVO Y ADELANTAMIENTOS EN VIVO
          </span>
        </div>
        <div>
          <span>VELTIS RACING ERP TELEMETRY</span>
        </div>
      </footer>

      {/* Modales */}
      {showPodium && resultsData && (
        <PodiumModal
          results={resultsData}
          onClose={() => setShowPodium(false)}
        />
      )}

      {showSolution && gameState?.currentCase && (
        <CaseSolutionModal
          caseData={gameState.currentCase}
          onClose={() => setShowSolution(false)}
        />
      )}
    </div>
  );
}
