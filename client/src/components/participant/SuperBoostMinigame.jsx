'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Sparkles, Trophy, AlertTriangle, Play, CheckCircle, X, ShieldAlert, Users } from 'lucide-react';
import { sounds, triggerHaptic } from '../../lib/soundEffects';

export default function SuperBoostMinigame({ team, onSuccess, onCancel }) {
  const [gameState, setGameState] = useState('INTRO'); // INTRO, LIGHTS, WAITING_FOR_LIGHTS_OUT, READY_TO_TAP, SUCCESS, FALSE_START
  const [lightsCount, setLightsCount] = useState(0);
  const [reactionTime, setReactionTime] = useState(null);
  const [mode, setMode] = useState('DIGITAL'); // DIGITAL | PHYSICAL

  const lightsOutTimeRef = useRef(null);
  const timerRef = useRef(null);

  // Iniciar secuencia de luces rojas F1
  const startReactionTest = () => {
    setGameState('LIGHTS');
    setLightsCount(0);
    setReactionTime(null);
    sounds.playSelect();
    triggerHaptic([30]);

    // Encender 5 luces secuenciales (cada 800ms)
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setLightsCount(count);
      sounds.playCountdownTick();
      triggerHaptic([40]);

      if (count === 5) {
        clearInterval(interval);
        setGameState('WAITING_FOR_LIGHTS_OUT');

        // Retardo aleatorio de 1.5 a 3.5 segundos antes de apagar las luces
        const randomDelay = Math.floor(1500 + Math.random() * 2000);
        timerRef.current = setTimeout(() => {
          setGameState('READY_TO_TAP');
          setLightsCount(0);
          lightsOutTimeRef.current = performance.now();
          sounds.playRaceStart();
          triggerHaptic([80, 50, 80]);
        }, randomDelay);
      }
    }, 800);
  };

  // Reacción al pulsar la pantalla
  const handleTap = () => {
    if (gameState === 'LIGHTS' || gameState === 'WAITING_FOR_LIGHTS_OUT') {
      // Falsa largada (Jump Start)
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('FALSE_START');
      sounds.playVSCAlert();
      triggerHaptic([200, 100, 200]);
    } else if (gameState === 'READY_TO_TAP') {
      const now = performance.now();
      const timeMs = Math.round(now - lightsOutTimeRef.current);
      setReactionTime(timeMs);

      // Si reacciona en menos de 450ms, gana el Super Boost
      if (timeMs <= 450) {
        setGameState('SUCCESS');
        sounds.playNitroBoost();
        triggerHaptic([100, 50, 100, 50, 200]);
        setTimeout(() => {
          if (onSuccess) onSuccess(timeMs);
        }, 2200);
      } else {
        setGameState('SLOW');
        sounds.playTireScreech();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="max-w-md w-full bg-f1-card border border-f1-border rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
        {/* Botón cerrar */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-f1-dark border border-f1-border text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-400 font-mono font-bold text-xs uppercase mb-3">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>MINIJUEGO DE TELEMETRÍA • SUPER BOOST (+15%)</span>
        </div>

        <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">
          {mode === 'DIGITAL' ? 'Semáforo de Reflejos F1' : 'Reto Presencial de Pits'}
        </h3>

        {/* Selector de modo */}
        <div className="flex bg-f1-dark p-1 rounded-xl border border-f1-border mb-5 max-w-xs mx-auto">
          <button
            onClick={() => { setMode('DIGITAL'); setGameState('INTRO'); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
              mode === 'DIGITAL' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reflejo Táctil
          </button>
          <button
            onClick={() => { setMode('PHYSICAL'); setGameState('PHYSICAL_INFO'); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
              mode === 'PHYSICAL' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reto en Escenario
          </button>
        </div>

        {mode === 'DIGITAL' && (
          <div>
            {/* Pantalla de Semáforos F1 */}
            <div className="bg-black/80 rounded-2xl p-6 border border-f1-border mb-6">
              <div className="flex justify-center items-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const isOn = lightsCount >= idx;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          isOn
                            ? 'bg-red-600 border-red-400 shadow-[0_0_20px_#ff0000]'
                            : 'bg-red-950/40 border-red-900/60'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Estado y retroalimentación */}
              {gameState === 'INTRO' && (
                <p className="text-xs font-mono text-slate-300">
                  Pulsa INICIAR. Las 5 luces rojas se encenderán una a una. En cuanto se <span className="text-f1-cyan font-bold">APAGUEN TODAS</span>, ¡toca la pantalla de inmediato!
                </p>
              )}

              {(gameState === 'LIGHTS' || gameState === 'WAITING_FOR_LIGHTS_OUT') && (
                <div className="text-yellow-400 font-mono font-bold text-xs animate-pulse">
                  ¡PREPARADO! ATENTO AL APAGADO... NO TE ANTICIPES
                </div>
              )}

              {gameState === 'READY_TO_TAP' && (
                <div className="text-emerald-400 font-mono font-black text-sm tracking-wider animate-bounce">
                  ¡¡¡TOCA LA PANTALLA YA!!!
                </div>
              )}

              {gameState === 'FALSE_START' && (
                <div className="text-red-400 font-mono font-bold text-xs flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>¡FALSA LARGADA! Te anticipaste. Vuelve a intentarlo.</span>
                </div>
              )}

              {gameState === 'SLOW' && (
                <div className="text-amber-400 font-mono font-bold text-xs">
                  Tiempo: <span className="text-white font-black">{reactionTime} ms</span> (Objetivo: &le; 450 ms). ¡Vuelve a intentar!
                </div>
              )}

              {gameState === 'SUCCESS' && (
                <div className="text-emerald-400 font-mono font-black text-sm flex flex-col items-center gap-1">
                  <CheckCircle className="w-6 h-6 text-emerald-400 animate-scale-in" />
                  <span>¡TIEMPO RÉCORD: {reactionTime} MS!</span>
                  <span className="text-xs text-slate-300 font-normal">¡SUPER BOOST APROBADO (+15% DE AVANCE)!</span>
                </div>
              )}
            </div>

            {/* Zona táctil de interacción */}
            {gameState === 'INTRO' || gameState === 'FALSE_START' || gameState === 'SLOW' ? (
              <button
                type="button"
                onClick={startReactionTest}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>INICIAR DESAFÍO DE REFLEJOS</span>
              </button>
            ) : gameState === 'SUCCESS' ? (
              <div className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>BONIFICACIÓN APLICADA A TU ESCUDERÍA</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTap}
                className="w-full py-8 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white font-mono font-black text-lg uppercase tracking-wider shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>¡PULSA AQUÍ AHORA!</span>
              </button>
            )}
          </div>
        )}

        {mode === 'PHYSICAL' && (
          <div className="space-y-4">
            <div className="bg-f1-dark p-5 rounded-2xl border border-f1-border text-left space-y-3">
              <div className="flex items-center gap-2 text-f1-yellow font-mono font-bold text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>DINÁMICA PRESENCIAL CON EL FACILITADOR</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Acércate con tu equipo a la mesa de Dirección de Carrera. El facilitador les asignará un reto rápido (demostración de velocidad, puzzle de NetSuite o pregunta sorpresa).
              </p>
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 text-xs font-mono">
                Cuando completen el reto, el facilitador activará tu bonificación desde el panel principal.
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-f1-border font-mono font-bold text-xs uppercase transition-all"
            >
              ENTENDIDO • VOLVER A LA CARRERA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
