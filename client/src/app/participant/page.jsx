'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import PinLogin from '../../components/participant/PinLogin';
import CountdownBar from '../../components/participant/CountdownBar';
import CaseFlow from '../../components/participant/CaseFlow';
import PitsBlocked from '../../components/participant/PitsBlocked';
import { Flag, Activity, Wifi, WifiOff, Clock, Compass } from 'lucide-react';

export default function ParticipantPage() {
  const { socket, isConnected, gameState } = useSocket();
  const [team, setTeam] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionTimeFormatted, setSubmissionTimeFormatted] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('f1_participant_team');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTeam(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (socket && isConnected && team) {
      socket.emit('join_participant', { teamId: team.id, pin: team.pin || team.id }, (res) => {
        if (res && res.success) {
          console.log('✅ Unido a sala de participantes:', res.team);
        }
      });
    }
  }, [socket, isConnected, team]);

  useEffect(() => {
    if (!socket) return;

    socket.on('submission_locked', (data) => {
      setHasSubmitted(true);
      if (data?.durationFormatted) {
        setSubmissionTimeFormatted(data.durationFormatted);
      }
      if (data?.currentPosition) {
        setCurrentPosition(data.currentPosition);
      }
    });

    socket.on('case_locked', () => {
      setHasSubmitted(true);
    });

    socket.on('lobby_reset', () => {
      setHasSubmitted(false);
      setSubmissionTimeFormatted(null);
    });

    return () => {
      socket.off('submission_locked');
      socket.off('case_locked');
      socket.off('lobby_reset');
    };
  }, [socket]);

  const handleLoginSuccess = (teamData, pin) => {
    const fullTeam = { ...teamData, pin };
    setTeam(fullTeam);
    sessionStorage.setItem('f1_participant_team', JSON.stringify(fullTeam));

    if (socket) {
      socket.emit('join_participant', { teamId: fullTeam.id, pin });
    }
  };

  const handleSubmitAnswers = (answers) => {
    if (!socket || !team) return;

    setIsSubmitting(true);
    socket.emit('participant_submit', { teamId: team.id, answers }, (response) => {
      setIsSubmitting(false);
      if (response && response.success) {
        setHasSubmitted(true);
        if (response.durationFormatted) {
          setSubmissionTimeFormatted(response.durationFormatted);
        }
      }
    });
  };

  if (!team) {
    return (
      <div className="min-h-screen bg-carbon flex flex-col justify-center items-center p-4">
        <PinLogin onLoginSuccess={handleLoginSuccess} isConnecting={!isConnected} />
      </div>
    );
  }

  const isCaseActive = gameState?.status === 'ACTIVE_CASE' && gameState?.currentCase;
  const sectorIndex = gameState?.currentSectorIndex || 1;
  const totalSectors = gameState?.totalSectors || 10;

  return (
    <div className="min-h-screen bg-carbon flex flex-col justify-between pt-16 pb-6 px-4 md:px-8 relative selection:bg-f1-red selection:text-white">
      {/* Barra de tiempo fija */}
      {isCaseActive && !hasSubmitted && (
        <CountdownBar
          startTime={gameState.startTime}
          durationSeconds={gameState.durationLimitSeconds || 60}
          onTimeExpired={() => setHasSubmitted(true)}
        />
      )}

      {/* Header del Participante */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-f1-border">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-white shadow-lg"
            style={{ backgroundColor: team.color || '#E10600' }}
          >
            {team.shortName || `E${team.id}`}
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">
              {team.name}
            </h1>
            <span className="text-xs font-mono text-slate-400">
              TERMINAL PITS #{team.id} • SECTOR {sectorIndex} DE {totalSectors}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-f1-green">
              <Wifi className="w-3.5 h-3.5" /> <span className="hidden sm:inline">CONECTADO</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-f1-red">
              <WifiOff className="w-3.5 h-3.5" /> <span className="hidden sm:inline">RECONECTANDO...</span>
            </span>
          )}
        </div>
      </header>

      {/* Cuerpo Principal */}
      <main className="my-auto py-8 max-w-4xl mx-auto w-full flex flex-col justify-center">
        {hasSubmitted ? (
          <PitsBlocked
            team={team}
            durationFormatted={submissionTimeFormatted}
            currentPosition={currentPosition}
            sectorIndex={sectorIndex}
            totalSectors={totalSectors}
          />
        ) : isCaseActive ? (
          <CaseFlow
            currentCase={gameState.currentCase}
            onSubmitAnswers={handleSubmitAnswers}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="max-w-md mx-auto w-full bg-f1-card p-8 rounded-2xl border border-f1-border text-center shadow-xl">
            <div className="w-16 h-16 bg-f1-dark border border-f1-border rounded-2xl flex items-center justify-center mx-auto mb-6 text-f1-cyan animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-f1-yellow/10 border border-f1-yellow/30 text-xs font-mono text-f1-yellow font-bold mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>PREPARANDO SECTOR {sectorIndex} / {totalSectors}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Esperando Inicio de Sector
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-sans mb-6">
              Tu monoplaza está en posición de Pits. La Dirección de Carrera transmitirá el siguiente caso en breves momentos.
            </p>
            <div className="p-3 bg-f1-dark/80 rounded-xl border border-f1-border text-xs font-mono text-slate-300 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-f1-cyan animate-ping" />
              <span>LISTO PARA RECIBIR TELEMETRÍA</span>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto w-full text-center text-[11px] font-mono text-slate-500 pt-4 border-t border-f1-border/40">
        VELTIS RACING ERP • CAPACITACIÓN GAMIFICADA EN TIEMPO REAL
      </footer>
    </div>
  );
}
