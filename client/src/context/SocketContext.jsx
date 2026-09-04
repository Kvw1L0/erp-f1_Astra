'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { isFirebaseConfigured } from '../lib/firebase';
import { firebaseRaceEngine, TEAMS_LIST } from '../lib/firebaseRaceEngine';

const SocketContext = createContext(null);

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCloudFirebase, setIsCloudFirebase] = useState(false);
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
    teamTelemetry: {}
  });

  useEffect(() => {
    // 1. Si Firebase está configurado en las variables de entorno (.env.local / Vercel)
    if (isFirebaseConfigured()) {
      console.log('🔥 Inicializando motor en tiempo real en la NUBE con Google Firebase...');
      setIsCloudFirebase(true);
      setIsConnected(true);

      // Escuchar cambios de estado en Firebase
      const unsubState = firebaseRaceEngine.onStateChange((state) => {
        if (state) {
          setGameState(prev => ({
            ...prev,
            ...state,
            teamTelemetry: prev.teamTelemetry
          }));
        }
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

      return () => {
        if (unsubState) unsubState();
        if (unsubTelemetry) unsubTelemetry();
      };
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
      if (isCloudFirebase) {
        await firebaseRaceEngine.startCase(caseData, sectorIndex, totalSectors);
        return { success: true };
      }
      return new Promise((resolve) => {
        socket?.emit('admin_start_case', { caseId: caseData.id, sectorIndex }, resolve);
      });
    },

    submitAnswers: async (teamId, answers, startTime, currentCase) => {
      if (isCloudFirebase) {
        const sub = await firebaseRaceEngine.submitAnswers(teamId, answers, startTime, currentCase);
        return { success: true, ...sub };
      }
      return new Promise((resolve) => {
        socket?.emit('participant_submit', { teamId, answers }, resolve);
      });
    },

    autoFinishCase: async (currentCase, sectorIndex, totalSectors) => {
      if (isCloudFirebase) {
        const results = await firebaseRaceEngine.autoFinish(currentCase, sectorIndex, totalSectors);
        return { success: true, results };
      }
      return new Promise((resolve) => {
        socket?.emit('admin_auto_finish_case', resolve);
      });
    },

    nextSector: async (nextSectorIdx, totalSectors) => {
      if (isCloudFirebase) {
        await firebaseRaceEngine.nextSector(nextSectorIdx, totalSectors);
        return { success: true };
      }
      return new Promise((resolve) => {
        socket?.emit('admin_next_sector', resolve);
      });
    },

    resetChampionship: async () => {
      if (isCloudFirebase) {
        await firebaseRaceEngine.resetChampionship();
        return { success: true };
      }
      return new Promise((resolve) => {
        socket?.emit('admin_reset_championship', resolve);
      });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      isCloudFirebase,
      gameState,
      setGameState,
      cloudActions
    }}>
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
