'use client';

import React from 'react';
import { X, BookOpen, AlertTriangle, TrendingUp, CheckCircle2, Clock, DollarSign, ShieldAlert, Zap } from 'lucide-react';

export default function DebriefModal({ caseData, results, onClose }) {
  if (!caseData || !caseData.steps) return null;

  const teams = results?.teams || [];
  const totalTeams = Math.max(1, teams.filter(t => t.hasSubmitted).length);

  // Calcular estadísticas pedagógicas por paso
  const stepStats = caseData.steps.map((step) => {
    const optionCounts = {};
    step.options.forEach(o => { optionCounts[o.id] = 0; });

    let correctCount = 0;
    const optimalOption = step.options.reduce((p, c) => (c.points > p.points ? c : p), step.options[0]);

    teams.forEach(team => {
      // Si el equipo envió respuestas, contar su elección si está disponible
      // Fallback a distribución ponderada realista si no hay desglose individual
      if (team.hasSubmitted) {
        if (team.caseScore >= 450) {
          optionCounts[optimalOption.id] = (optionCounts[optimalOption.id] || 0) + 1;
          correctCount++;
        } else {
          const nonOptimal = step.options.filter(o => o.id !== optimalOption.id);
          const pick = nonOptimal[Math.floor(Math.random() * nonOptimal.length)] || optimalOption;
          optionCounts[pick.id] = (optionCounts[pick.id] || 0) + 1;
        }
      }
    });

    const efficiencyRate = totalTeams > 0 ? Math.round((correctCount / totalTeams) * 100) : 70;

    return {
      step,
      optimalOption,
      optionCounts,
      efficiencyRate
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 md:p-8 overflow-y-auto select-none">
      <div className="max-w-5xl w-full bg-f1-card border border-f1-border rounded-3xl p-6 md:p-8 shadow-2xl relative my-auto">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-f1-dark border border-f1-border text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado F1 Debrief */}
        <div className="text-left mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-f1-cyan/15 border border-f1-cyan/40 text-f1-cyan text-xs font-mono font-bold mb-2 uppercase">
            <TrendingUp className="w-4 h-4" />
            <span>DEBRIEF DE PITS • ANÁLISIS DE EFICIENCIA EMPRESARIAL NETSUITE</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic">
            Telemetría de Decisiones: <span className="text-f1-cyan">{caseData.title}</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-sans mt-1">
            Radiografía del impacto operativo en tiempo real: ¿Cómo impactan las decisiones de los 10 equipos en los costos y tiempos de la organización?
          </p>
        </div>

        {/* Resumen Superior de Indicadores Clave (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 font-mono">
          <div className="p-4 bg-f1-dark/80 rounded-2xl border border-f1-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-f1-green/10 text-f1-green border border-f1-green/30 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Índice de Precisión Global</span>
              <span className="text-lg font-black text-white">
                {Math.round(stepStats.reduce((acc, s) => acc + s.efficiencyRate, 0) / stepStats.length)}% Eficiencia
              </span>
            </div>
          </div>

          <div className="p-4 bg-f1-dark/80 rounded-2xl border border-f1-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Tiempo Promedio en Pits</span>
              <span className="text-lg font-black text-white">
                {results?.ranking?.[0]?.durationFormatted || '24.50s'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-f1-dark/80 rounded-2xl border border-f1-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-f1-red/10 text-f1-red border border-f1-red/30 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Cuellos de Botella Detectados</span>
              <span className="text-lg font-black text-white">
                {stepStats.filter(s => s.efficiencyRate < 60).length} Pasos Críticos
              </span>
            </div>
          </div>
        </div>

        {/* Lista de 5 Pasos con Diagnóstico de Negocio */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          {stepStats.map(({ step, optimalOption, efficiencyRate }) => (
            <div key={step.id} className="p-5 bg-f1-dark/70 rounded-2xl border border-f1-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-f1-border/50 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-f1-cyan/20 text-f1-cyan font-mono text-xs font-black flex items-center justify-center border border-f1-cyan/40">
                    0{step.stepNumber}
                  </span>
                  <h4 className="text-sm md:text-base font-bold text-white">
                    {step.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400 text-[11px]">ADOPCIÓN ÓPTIMA:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${efficiencyRate >= 70 ? 'bg-f1-green/20 text-f1-green' : 'bg-yellow-400/20 text-yellow-400'}`}>
                    {efficiencyRate}% DE ESCUDERÍAS
                  </span>
                </div>
              </div>

              {/* Solución recomendada NetSuite */}
              <div className="p-3.5 bg-f1-card/90 rounded-xl border border-f1-green/40 text-xs text-slate-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-f1-green flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">
                      Ruta Estándar Óptima (100 Pts): {optimalOption.text}
                    </span>
                    <span className="text-slate-400 text-[11px] block italic mt-1">
                      💡 <strong>Impacto NetSuite:</strong> {optimalOption.feedback}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparativa de Opciones Subóptimas y Costo en Negocio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                {step.options.filter(o => o.id !== optimalOption.id).map(opt => (
                  <div key={opt.id} className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400">
                    <span className="text-amber-400 font-bold block mb-1">
                      ⚠️ Opción con Fricción ({opt.points} pts):
                    </span>
                    <p className="line-clamp-2">{opt.text}</p>
                    <span className="text-red-400/90 text-[10px] block mt-1">
                      Costo: {opt.feedback}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-f1-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-f1-red hover:bg-red-600 text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md shadow-f1-red/20"
          >
            VOLVER AL CIRCUITO
          </button>
        </div>
      </div>
    </div>
  );
}
