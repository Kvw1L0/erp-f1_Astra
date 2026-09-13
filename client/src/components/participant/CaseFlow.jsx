'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Send, AlertCircle, Wrench, ShieldCheck, HelpCircle, WifiOff, Radio, Users } from 'lucide-react';
import { sounds } from '../../lib/soundEffects';

export default function CaseFlow({ currentCase, onSubmitAnswers, isSubmitting, teamId = 1 }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [expandedStep, setExpandedStep] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [pitWallFeed, setPitWallFeed] = useState([
    '🟢 Sesión de Pits iniciada. Todos los monoplazas en garaje.'
  ]);

  const steps = currentCase?.steps || [];
  const totalSteps = steps.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isComplete = totalSteps > 0 && answeredCount === totalSteps;

  // Cargar borrador persistente de localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && currentCase?.id) {
      try {
        const saved = localStorage.getItem(`f1_draft_${currentCase.id}_team_${teamId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setSelectedAnswers(parsed);
        }
      } catch (e) {}
    }
  }, [currentCase?.id, teamId]);

  // Detector de conectividad de red
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulación dinámica de Muro de Pits en Vivo (Tensión de rivales sin revelar respuestas)
  useEffect(() => {
    const rivalTeams = [
      'Red Bull Racing', 'Scuderia Ferrari', 'Mercedes-AMG', 'McLaren F1',
      'Aston Martin', 'Alpine F1', 'Williams Racing', 'Haas F1'
    ];

    const interval = setInterval(() => {
      const randomRival = rivalTeams[Math.floor(Math.random() * rivalTeams.length)];
      const events = [
        `⚡ ${randomRival} ajustó parámetros en Pits...`,
        `⏱️ ${randomRival} completó paso y acelera en telemetría.`,
        `📡 Muro de Pits: Transmisiones en progreso...`
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];

      setPitWallFeed(prev => [randomEvent, ...prev.slice(0, 3)]);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectOption = (stepId, optionId, stepNumber) => {
    sounds.playSelect();

    // Feedback háptico en móvil/tablet
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(30);
    }

    setValidationError('');
    const updated = {
      ...selectedAnswers,
      [stepId]: optionId
    };

    setSelectedAnswers(updated);

    // Guardar copia de seguridad en memoria local
    if (typeof window !== 'undefined' && currentCase?.id) {
      try {
        localStorage.setItem(`f1_draft_${currentCase.id}_team_${teamId}`, JSON.stringify(updated));
      } catch (e) {}
    }

    // Abrir automáticamente el siguiente paso si está pendiente
    if (stepNumber < totalSteps) {
      setExpandedStep(stepNumber + 1);
    }
  };

  const handleSubmit = () => {
    if (!isComplete) {
      setValidationError(`Debes completar los ${totalSteps} pasos de la parada en Pits antes de enviar.`);
      return;
    }

    // Feedback háptico de aceleración / salida de Pits
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate([70, 40, 120]);
    }

    sounds.playPitStopConfirm();

    // Limpiar borrador local
    if (typeof window !== 'undefined' && currentCase?.id) {
      try {
        localStorage.removeItem(`f1_draft_${currentCase.id}_team_${teamId}`);
      } catch (e) {}
    }

    onSubmitAnswers(selectedAnswers);
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 pb-28 select-none">
      {/* Alerta de Red Offline */}
      {!isOnline && (
        <div className="p-3.5 bg-red-500/20 border border-red-500 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-mono shadow-lg animate-pulse">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>⚠️ SEÑAL DE PITS INESTABLE: Respuestas guardadas en memoria local. Se transmitirán automáticamente al recuperar cobertura.</span>
        </div>
      )}

      {/* Muro de Pits en Vivo (Live Pit Wall Feed) */}
      <div className="bg-f1-card/90 p-3 rounded-xl border border-f1-border/70 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-f1-cyan flex-shrink-0 font-bold">
          <Radio className="w-3.5 h-3.5 animate-pulse text-f1-cyan" />
          <span className="hidden sm:inline">MURO DE PITS:</span>
        </div>
        <div className="text-slate-300 truncate text-[11px]">
          {pitWallFeed[0]}
        </div>
      </div>

      {/* Tarjeta de Título del Caso ERP */}
      <div className="bg-f1-card p-6 rounded-2xl border border-f1-border relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-f1-red/10 rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-2 text-f1-red font-mono text-xs font-bold uppercase tracking-wider mb-2">
          <Wrench className="w-4 h-4" />
          <span>ORDEN DE TRABAJO EN PITS (ERP NETSUITE)</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
          {currentCase?.title}
        </h2>
        {currentCase?.description && (
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            {currentCase.description}
          </p>
        )}

        {/* Barra de progreso de completitud */}
        <div className="mt-5 pt-4 border-t border-f1-border flex items-center justify-between">
          <div className="text-xs font-mono text-slate-300">
            PASOS CONFIGURADOS: <span className="text-f1-cyan font-bold">{answeredCount}</span> / {totalSteps}
          </div>
          <div className="w-40 h-2 bg-f1-dark rounded-full overflow-hidden border border-f1-border">
            <div
              className="h-full bg-gradient-to-r from-f1-cyan to-f1-green transition-all duration-300"
              style={{ width: `${(answeredCount / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {validationError && (
        <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-3 text-red-400 text-sm font-mono">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Lista de 5 Pasos */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isAnswered = !!selectedAnswers[step.id];
          const isExpanded = expandedStep === step.stepNumber;
          const selectedOptionId = selectedAnswers[step.id];

          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-f1-card border-f1-cyan/60 shadow-lg shadow-f1-cyan/5'
                  : 'bg-f1-card/70 border-f1-border hover:border-slate-600'
              }`}
            >
              {/* Header del Paso (Clickeable) */}
              <button
                type="button"
                onClick={() => setExpandedStep(isExpanded ? null : step.stepNumber)}
                className="w-full p-4 md:p-5 flex items-center justify-between text-left gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl font-mono text-sm font-bold flex items-center justify-center transition-all ${
                      isAnswered
                        ? 'bg-f1-green text-black shadow-md shadow-f1-green/30'
                        : isExpanded
                        ? 'bg-f1-cyan text-black'
                        : 'bg-f1-dark text-slate-400 border border-f1-border'
                    }`}
                  >
                    {isAnswered ? <CheckCircle2 className="w-5 h-5" /> : `0${step.stepNumber}`}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      PASO {step.stepNumber} DE {totalSteps}
                    </span>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isAnswered && (
                    <span className="hidden sm:inline-block px-2.5 py-1 bg-f1-green/10 border border-f1-green/30 text-f1-green text-[11px] font-mono rounded-lg font-semibold">
                      CONFIGURADO
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-f1-cyan" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Contenido desplegable: Descripción y 3 Opciones */}
              {isExpanded && (
                <div className="px-4 pb-5 md:px-5 md:pb-6 pt-2 border-t border-f1-border/60 bg-f1-dark/40 space-y-4">
                  {step.description && (
                    <div className="p-3 bg-f1-dark/80 rounded-xl border border-f1-border/50 text-xs md:text-sm text-slate-300 font-sans flex items-start gap-2.5">
                      <HelpCircle className="w-4 h-4 text-f1-cyan flex-shrink-0 mt-0.5" />
                      <span>{step.description}</span>
                    </div>
                  )}

                  {/* 3 Opciones de Acción */}
                  <div className="space-y-2.5">
                    {step.options?.map((option, optIdx) => {
                      const isSelected = selectedOptionId === option.id;
                      const optLetters = ['A', 'B', 'C'];
                      const letter = optLetters[optIdx] || `${optIdx + 1}`;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelectOption(step.id, option.id, step.stepNumber)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${
                            isSelected
                              ? 'bg-f1-cyan/15 border-f1-cyan text-white shadow-md shadow-f1-cyan/10 ring-1 ring-f1-cyan'
                              : 'bg-f1-card/90 border-f1-border text-slate-300 hover:border-slate-500 hover:bg-f1-cardHover'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-f1-cyan text-black'
                                : 'bg-f1-dark text-slate-400 border border-f1-border group-hover:text-white'
                            }`}
                          >
                            {letter}
                          </div>
                          <span className="text-sm font-medium leading-relaxed flex-1">
                            {option.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón flotante inferior para "Enviar Resolución" */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-f1-dark/95 backdrop-blur-md border-t border-f1-border z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-400">
            {isComplete ? (
              <span className="text-f1-green flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-4 h-4" /> TODOS LOS PASOS CONFIGURADOS. LISTO PARA TRANSMITIR A PITS.
              </span>
            ) : (
              <span>FALTAN {totalSteps - answeredCount} PASOS POR CONFIGURAR</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg ${
              isComplete && !isSubmitting
                ? 'bg-gradient-to-r from-f1-green via-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-f1-green/20 active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="animate-pulse">TRANSMITIENDO TELEMETRÍA...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>ENVIAR RESOLUCIÓN</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
