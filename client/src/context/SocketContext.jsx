'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { isFirebaseConfigured, ensureRaceSession, watchRaceConnection } from '../lib/firebase';
import { firebaseRaceEngine, TEAMS_LIST } from '../lib/firebaseRaceEngine';

const SocketContext = createContext(null);

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [hasSynced, setHasSynced] = useState(false);
  const [isCloudFirebase, setIsCloudFirebase] = useState(isFirebaseConfigured());
  const [gameState, setGameState] = useState({
    status: 'LOBBY',
    currentSectorIndex: 1,
    totalSectors: 10,
    currentCase: null,
    startTime: null,
    durationLimitSeconds: 60,
    connectedTeamsCount: 0,
    submissionsCount: 0,
    calculatedResults: null,
    teamTelemetry: {},
    teamsProfiles: {},
    stageSummon: null,
    radioMessage: null,
    isSafetyCarActive: false,
    isRedFlagActive: false,
    isWetRaceActive: false,
    hardResetTimestamp: null
  });

  useEffect(() => {
    // 1. Si Firebase está configurado en las variables de entorno (.env.local / Vercel)
    if (isFirebaseConfigured()) {
      console.log('🔥 Inicializando motor en tiempo real en la NUBE con Google Firebase...');
      setIsCloudFirebase(true);
      setIsConnected(false);

      let cancelled = false;
      let stop = () => {};
      ensureRaceSession().then(() => {
      if (cancelled) return;
      const stopConnection = watchRaceConnection(setIsConnected);
      const stopRadio = firebaseRaceEngine.onRadioChange(radioMessage => setGameState(prev => ({...prev, radioMessage})));
      // Escuchar cambios de estado en Firebase
      const unsubState = firebaseRaceEngine.onStateChange((state) => {
        setHasSynced(true);
        setConnectionError('');
        if (state) {
          setGameState(prev => ({
            ...prev,
            ...state,
            teamTelemetry: prev.teamTelemetry
          }));
        }
      }, (error) => {
        setIsConnected(false);
        setConnectionError('No se pudo acceder a la carrera. Comprueba la conexión o contacta al moderador.');
        console.error('Firebase:', error.code);
      });

      // Escuchar telemetría en Firebase
      const unsubTelemetry = firebaseRaceEngine.onTelemetryChange((telemetry) => {
        if (telemetry) {
          setGameState(prev => ({
            ...prev,
            teamTelemetry: telemetry
          }));
        }
      });

      // Escuchar perfiles de equipos (subnombres y participantes)
      const unsubTeams = firebaseRaceEngine.onTeamsChange((teams) => {
        setGameState(prev => ({
          ...prev,
          teamsProfiles: teams || {}
        }));
      });

      // Escuchar convocatorias a escenario
      const unsubSummon = firebaseRaceEngine.onStageSummonChange((summon) => {
        setGameState(prev => ({
          ...prev,
          stageSummon: summon
        }));
      });

      // Escuchar envíos de respuestas en vivo
      const unsubSubmissions = firebaseRaceEngine.onSubmissionsChange((submissions) => {
        setGameState(prev => ({
          ...prev,
          submissions: submissions || {},
          submissionsCount: Object.keys(submissions || {}).length
        }));
      });

      stop = () => {
        stopConnection();
        stopRadio();
        if (unsubState) unsubState();
        if (unsubTelemetry) unsubTelemetry();
        if (unsubTeams) unsubTeams();
        if (unsubSummon) unsubSummon();
        if (unsubSubmissions) unsubSubmissions();
      };
      }).catch(error => { if (!cancelled) setConnectionError('No se pudo iniciar la sesión de carrera. Recarga para intentar nuevamente.'); console.error(error.code); });
      return () => { cancelled = true; stop(); };
    }

    // 2. Fallback local mediante Socket.io (Node.js backend)
    console.log('⚡ Conectando al Gateway local Socket.io:', SOCKET_SERVER_URL);
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('🟢 Conectado a WebSocket local:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔴 Desconectado de WebSocket local');
      setIsConnected(false);
    });

    newSocket.on('state_sync', (state) => {
      setGameState(state);
      setHasSynced(true);
    });

    newSocket.on('case_started', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'ACTIVE_CASE',
        currentCase: data.case,
        currentSectorIndex: data.currentSectorIndex || prev.currentSectorIndex,
        totalSectors: data.totalSectors || prev.totalSectors,
        startTime: data.startTime,
        durationLimitSeconds: data.durationLimitSeconds,
        teamTelemetry: data.teamTelemetry || prev.teamTelemetry,
        calculatedResults: null
      }));
    });

    newSocket.on('case_locked', () => {
      setGameState(prev => ({ ...prev, status: 'LOCKED' }));
    });

    newSocket.on('results_revealed', (results) => {
      setGameState(prev => ({
        ...prev,
        status: 'REVEALED',
        calculatedResults: results
      }));
    });

    newSocket.on('lobby_reset', (state) => {
      setGameState(state);
    });

    newSocket.on('championship_reset', (state) => {
      setGameState(state);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Métodos unificados para clientes y admin (compatibles con Firebase y Socket.io)
  const cloudActions = {
    startCase: async (caseData, sectorIndex, totalSectors) => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.startCase(caseData, sectorIndex, totalSectors);
        return { success: true };
      }
      return new Promise((resolve) => {
        socket?.emit('admin_start_case', { caseId: caseData.id, sectorIndex }, resolve);
      });
    },

    submitAnswers: async (teamId, answers, startTime, currentCase) => {
      if (isFirebaseConfigured()) {
        const sub = await firebaseRaceEngine.submitAnswers(teamId, answers, startTime, currentCase);
        return { success: true, ...sub };
      }
      return new Promise((resolve) => {
        socket?.emit('participant_submit', { teamId, answers }, resolve);
      });
    },

    autoFinishCase: async (currentCase, sectorIndex, totalSectors) => {
      if (isFirebaseConfigured()) {
        const results = await firebaseRaceEngine.autoFinish(currentCase, sectorIndex, totalSectors);
        return { success: true, results };
      }
      return new Promise((resolve) => {
        socket?.emit('admin_auto_finish_case', resolve);
      });
    },

    nextSector: async (nextSectorIdx, totalSectors) => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.nextSector(nextSectorIdx, totalSectors);
        return { success: true };
      }
      return new Promise((resolve) => {
        socket?.emit('admin_next_sector', resolve);
      });
    },

    resetChampionship: async () => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.resetChampionship();
        return { success: true };
      }
      return new Promise((resolve) => {
        socket?.emit('admin_reset_championship', resolve);
      });
    },

    toggleSafetyCar: async (active) => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.toggleSafetyCar(active);
        return { success: true };
      }
      setGameState(prev => ({ ...prev, isSafetyCarActive: active }));
      socket?.emit('admin_toggle_safety_car', { active });
      return { success: true };
    },

    simulate10Teams: async (currentCase, sectorIndex, totalSectors) => {
      if (isFirebaseConfigured()) {
        const results = await firebaseRaceEngine.simulate10Teams(currentCase, sectorIndex, totalSectors);
        return { success: true, results };
      }
      const results = await firebaseRaceEngine.simulate10Teams(currentCase, sectorIndex, totalSectors);
      setGameState(prev => ({
        ...prev,
        status: 'REVEALED',
        calculatedResults: results
      }));
      socket?.emit('admin_simulate_10_teams', { results });
      return { success: true, results };
    },

    updateTeamProfile: async (teamId, subname, participants) => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.updateTeamProfile(teamId, subname, participants);
        return { success: true };
      }
      setGameState(prev => ({
        ...prev,
        teamsProfiles: {
          ...prev.teamsProfiles,
          [teamId]: { teamId, subname, participants, updatedAt: Date.now() }
        }
      }));
      socket?.emit('update_team_profile', { teamId, subname, participants });
      return { success: true };
    },

    hardReset: async () => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.hardReset();
        return { success: true };
      }
      setGameState(prev => ({
        ...prev,
        status: 'HARD_RESET',
        hardResetTimestamp: Date.now(),
        currentCase: null,
        currentSectorIndex: 1,
        startTime: null,
        calculatedResults: null,
        teamsProfiles: {},
        stageSummon: null,
        isSafetyCarActive: false,
        isRedFlagActive: false,
        isWetRaceActive: false
      }));
      socket?.emit('admin_hard_reset');
      return { success: true };
    },

    triggerStageSummon: async (teamId, reason, active = true) => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.triggerStageSummon(teamId, reason, active);
        return { success: true };
      }
      const summon = active ? { teamId, reason, active: true, timestamp: Date.now() } : null;
      setGameState(prev => ({ ...prev, stageSummon: summon }));
      socket?.emit('admin_stage_summon', { teamId, reason, active });
      return { success: true };
    },

    extendTimer: async (extraSeconds = 30) => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.extendTimer(extraSeconds);
        return { success: true };
      }
      setGameState(prev => ({
        ...prev,
        durationLimitSeconds: (prev.durationLimitSeconds || 60) + extraSeconds
      }));
      socket?.emit('admin_extend_timer', { extraSeconds });
      return { success: true };
    },

    setRedFlag: async (active) => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.setRedFlag(active);
        return { success: true };
      }
      setGameState(prev => ({ ...prev, isRedFlagActive: !!active }));
      socket?.emit('admin_red_flag', { active });
      return { success: true };
    },

    setWetRace: async (active) => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.setWetRace(active);
        return { success: true };
      }
      setGameState(prev => ({ ...prev, isWetRaceActive: !!active }));
      socket?.emit('admin_wet_race', { active });
      return { success: true };
    },

    sendPitRadioMessage: async (message) => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.sendPitRadioMessage(message);
        return { success: true };
      }
      const msgObj = { message, timestamp: Date.now() };
      setGameState(prev => ({ ...prev, radioMessage: msgObj }));
      socket?.emit('admin_radio_message', msgObj);
      return { success: true };
    },

    activateSuperBoost: async (teamId, success = true) => {
      if (isFirebaseConfigured()) {
        await firebaseRaceEngine.activateSuperBoost(teamId, success);
        return { success: true };
      }
      setGameState(prev => ({
        ...prev,
        teamTelemetry: {
          ...prev.teamTelemetry,
          [teamId]: {
            ...prev.teamTelemetry[teamId],
            isSuperBoostActive: success
          }
        }
      }));
      socket?.emit('participant_super_boost', { teamId, success });
      return { success: true };
    },

    getChampionshipHistory: async () => {
      if (isFirebaseConfigured()) {
        return await firebaseRaceEngine.getChampionshipHistory();
      }
      return {};
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      connectionError,
      hasSynced,
      isCloudFirebase,
      gameState,
      setGameState,
      cloudActions
    }}>
      {connectionError && <div role="alert" className="fixed top-0 inset-x-0 z-[100] bg-red-950 text-white p-3 text-center">{connectionError}</div>}
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe utilizarse dentro de un SocketProvider');
  }
  return context;
}
