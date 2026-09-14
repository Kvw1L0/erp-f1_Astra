'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import PinLogin from '../../components/participant/PinLogin';
import CountdownBar from '../../components/participant/CountdownBar';
import CaseFlow from '../../components/participant/CaseFlow';
import PitsBlocked from '../../components/participant/PitsBlocked';
import SuperBoostMinigame from '../../components/participant/SuperBoostMinigame';
import { Flag, Activity, Wifi, WifiOff, Clock, Compass, Zap, ShieldAlert, Radio, AlertOctagon, CloudRain, Users, CheckCircle2 } from 'lucide-react';
import { sounds, triggerHaptic } from '../../lib/soundEffects';

export default function ParticipantPage() {
  const { socket, isConnected, gameState, cloudActions } = useSocket();
  const [team, setTeam] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionTimeFormatted, setSubmissionTimeFormatted] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showSuperBoostModal, setShowSuperBoostModal] = useState(false);
  const [superBoostUnlocked, setSuperBoostUnlocked] = useState(false);
  const [hasAcknowledgedSummon, setHasAcknowledgedSummon] = useState(false);
  const lastSummonTimestampRef = useRef(null);

  // 1. Cargar equipo de sessionStorage
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

  // 2. Blindaje Hard Reset: si el servidor emite HARD_RESET, expulsar a foja cero inmediatamente
  useEffect(() => {
    if (gameState?.status === 'HARD_RESET') {
      console.warn('🔥 HARD RESET RECIBIDO: Expulsando terminal y borrando sesión');
      sessionStorage.removeItem('f1_participant_team');
      localStorage.removeItem('f1_draft_answers');
      setTeam(null);
      setHasSubmitted(false);
      setSubmissionTimeFormatted(null);
      setShowSuperBoostModal(false);
      setSuperBoostUnlocked(false);
      setHasAcknowledgedSummon(false);
      triggerHaptic([100, 50, 100]);
    }
  }, [gameState?.status, gameState?.hardResetTimestamp]);

  // 3. Sincronizar unión al socket
  useEffect(() => {
    if (socket && isConnected && team) {
      socket.emit('join_participant', { teamId: team.id, pin: team.pin || team.id }, (res) => {
        if (res && res.success) {
          console.log('✅ Unido a sala de participantes:', res.team);
        }
      });
    }
  }, [socket, isConnected, team]);

  // 4. Convocatoria a escenario: detectar si este equipo fue llamado
  const isSummoned = gameState?.stageSummon?.active && Number(gameState?.stageSummon?.teamId) === Number(team?.id);

  useEffect(() => {
    if (isSummoned && gameState?.stageSummon?.timestamp !== lastSummonTimestampRef.current) {
      lastSummonTimestampRef.current = gameState?.stageSummon?.timestamp;
      setHasAcknowledgedSummon(false);
      sounds.playStageSummon();
      triggerHaptic([300, 100, 300, 100, 500]);
    }
  }, [isSummoned, gameState?.stageSummon?.timestamp]);

  // 5. Escuchar eventos de socket
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

    socket.on('hard_reset', () => {
      sessionStorage.removeItem('f1_participant_team');
      setTeam(null);
      setHasSubmitted(false);
    });

    return () => {
      socket.off('submission_locked');
      socket.off('case_locked');
      socket.off('lobby_reset');
      socket.off('hard_reset');
    };
  }, [socket]);

  // 6. Login exitoso con subnombre y nómina
  const handleLoginSuccess = async (teamData, pin, subname, participants) => {
    const fullTeam = {
      ...teamData,
      pin,
      subname: subname || teamData.subname,
      participants: participants || teamData.participants || []
    };
    setTeam(fullTeam);
    sessionStorage.setItem('f1_participant_team', JSON.stringify(fullTeam));

    if (socket) {
      socket.emit('join_participant', { teamId: fullTeam.id, pin });
    }

    // Sincronizar en Firebase o Cloud State
    await cloudActions.updateTeamProfile(fullTeam.id, fullTeam.subname, fullTeam.participants);
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

  const handleSuperBoostSuccess = async (timeMs) => {
    setShowSuperBoostModal(false);
    setSuperBoostUnlocked(false);
    sounds.playNitroBoost();
    await cloudActions.activateSuperBoost(team.id, true);
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
  const isRedFlag = !!gameState?.isRedFlagActive;
  const isWetRace = !!gameState?.isWetRaceActive;

  return (
    <div className="min-h-screen bg-carbon flex flex-col justify-between pt-16 pb-6 px-4 md:px-8 relative selection:bg-f1-red selection:text-white">
      {/* 🚨 OVERLAY DE CONVOCATORIA AL ESCENARIO */}
      {isSummoned && !hasAcknowledgedSummon && (
        <div className="fixed inset-0 z-50 bg-red-950/95 backdrop-blur-lg flex items-center justify-center p-6 select-none animate-pulse">
          <div className="max-w-md w-full bg-black/90 border-2 border-red-500 rounded-3xl p-6 md:p-8 text-center shadow-[0_0_50px_rgba(255,0,0,0.6)] space-y-4">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-red-600/50 animate-bounce">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-mono text-xs font-black uppercase tracking-wider inline-block">
              LLAMADO OFICIAL DE DIRECCIÓN DE CARRERA
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase leading-tight">
              ¡ATENCIÓN ESCUDERÍA {team.name}!
            </h2>
            {team.subname && (
              <p className="text-sm font-bold text-yellow-400 font-mono">
                &ldquo;{team.subname}&rdquo;
              </p>
            )}
            <div className="p-4 bg-red-900/30 rounded-2xl border border-red-500/40 text-left space-y-2">
              <p className="text-xs text-white font-sans leading-relaxed">
                Todo el equipo ha sido convocado a presentarse <span className="font-bold underline">INMEDIATAMENTE EN EL ESCENARIO</span> para cumplir una dinámica presencial.
              </p>
              {gameState?.stageSummon?.reason && (
                <p className="text-[11px] font-mono text-amber-300">
                  MOTIVO: {gameState.stageSummon.reason}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setHasAcknowledgedSummon(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 text-white font-mono font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-all"
            >
              ¡ENTERADOS, VAMOS AL ESCENARIO!
            </button>
          </div>
        </div>
      )}

      {/* 🚨 BANNER DE BANDERA ROJA */}
      {isRedFlag && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-red-600 text-white py-2.5 px-4 font-mono font-black text-xs uppercase flex items-center justify-center gap-2 shadow-2xl animate-pulse">
          <AlertOctagon className="w-4 h-4 fill-white text-red-600 flex-shrink-0" />
          <span>🚨 BANDERA ROJA EN PISTA: CARRERA DETENIDA POR DIRECCIÓN DE CARRERA • ESPERA INDICACIONES</span>
        </div>
      )}

      {/* 📢 BANNER DE COMUNICADO DE RADIO */}
      {gameState?.radioMessage?.message && (
        <div className="fixed top-11 left-4 right-4 z-40 max-w-lg mx-auto bg-amber-500/90 text-black py-2 px-4 rounded-xl font-mono font-bold text-xs uppercase flex items-center gap-2 shadow-xl animate-fade-in">
          <Radio className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">RADIO PITS: {gameState.radioMessage.message}</span>
        </div>
      )}

      {/* Barra de tiempo fija */}
      {isCaseActive && !hasSubmitted && !isRedFlag && (
        <CountdownBar
          startTime={gameState.startTime}
          durationSeconds={gameState.durationLimitSeconds || 60}
          onTimeExpired={() => setHasSubmitted(true)}
        />
      )}

      {/* Header del Participante con Subnombre y Pilotos */}
      <header className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-f1-border">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-white shadow-xl flex-shrink-0"
            style={{ backgroundColor: team.color || '#E10600' }}
          >
            {team.shortName || `E${team.id}`}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-white leading-tight">
                {team.name}
              </h1>
              {team.subname && (
                <span className="px-2.5 py-0.5 rounded-full bg-f1-yellow/15 border border-f1-yellow/40 text-f1-yellow font-mono text-[11px] font-bold">
                  {team.subname}
                </span>
              )}
              {isWetRace && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold flex items-center gap-1">
                  <CloudRain className="w-3 h-3" /> PISTA MOJADA
                </span>
              )}
            </div>

            {/* Nómina de Pilotos */}
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <span className="text-[10px] font-mono text-slate-500">PILOTOS:</span>
              {(team.participants && team.participants.length > 0 ? team.participants : [`Piloto ${team.id}`]).map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-f1-dark border border-f1-border text-slate-300 text-[10px] font-mono"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Estado y Botón de Super Boost */}
        <div className="flex items-center gap-2.5 self-end md:self-auto font-mono text-xs">
          {/* Botón Minijuego Super Boost */}
          <button
            type="button"
            onClick={() => setShowSuperBoostModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 text-white font-mono font-black text-xs uppercase flex items-center gap-1.5 shadow-lg shadow-purple-600/30 active:scale-95 transition-all border border-purple-400/40"
            title="Activa el minijuego de reflejos para ganar +15% de aceleración extra"
          >
            <Zap className="w-4 h-4 fill-current animate-pulse text-yellow-300" />
            <span>SUPER BOOST (+15%)</span>
          </button>

          <div className="px-3 py-2 bg-f1-dark rounded-xl border border-f1-border text-slate-400">
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-f1-green font-bold text-[11px]">
                <Wifi className="w-3.5 h-3.5" /> <span className="hidden sm:inline">ONLINE</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-f1-red font-bold text-[11px]">
                <WifiOff className="w-3.5 h-3.5" /> <span className="hidden sm:inline">RECONECTANDO</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Minijuego de Super Boost */}
      {showSuperBoostModal && (
        <SuperBoostMinigame
          team={team}
          onSuccess={handleSuperBoostSuccess}
          onCancel={() => setShowSuperBoostModal(false)}
        />
      )}

      {/* Cuerpo Principal */}
      <main className="my-auto py-6 max-w-4xl mx-auto w-full flex flex-col justify-center">
        {hasSubmitted ? (
          <PitsBlocked
            team={team}
            durationFormatted={submissionTimeFormatted}
            currentPosition={currentPosition}
            sectorIndex={sectorIndex}
            totalSectors={totalSectors}
          />
        ) : isCaseActive && !isRedFlag ? (
          <CaseFlow
            currentCase={gameState.currentCase}
            onSubmitAnswers={handleSubmitAnswers}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="max-w-md mx-auto w-full bg-f1-card p-8 rounded-3xl border border-f1-border text-center shadow-xl">
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
              Tu monoplaza está listo en Pits. En cuanto Dirección de Carrera inicie la ronda, se transmitirá la cinemática y se habilitará tu formulario de resolución.
            </p>
            <div className="p-3 bg-f1-dark/80 rounded-xl border border-f1-border text-xs font-mono text-slate-300 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-f1-cyan animate-ping" />
              <span>TERMINAL SINCRONIZADA • PITS LISTOS</span>
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
