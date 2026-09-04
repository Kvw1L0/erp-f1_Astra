'use client';

import React from 'react';
import { X, CheckCircle2, Award, BookOpen, ChevronRight, Zap } from 'lucide-react';

export default function CaseSolutionModal({ caseData, onClose }) {
  if (!caseData || !caseData.steps) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl w-full bg-f1-card border border-f1-border rounded-3xl p-6 md:p-8 shadow-2xl relative my-auto">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-f1-dark border border-f1-border text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-f1-cyan/10 border border-f1-cyan/30 text-f1-cyan text-xs font-mono font-bold mb-2 uppercase">
            <BookOpen className="w-4 h-4" />
            <span>SOLUCIÓN TÉCNICA ÓPTIMA • NETSUITE ERP</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic">
            {caseData.title}
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Revisión de mejores prácticas y telemetría de eficiencia para los 100 participantes.
          </p>
        </div>

        {/* Pasos y Respuestas Óptimas (100 Pts) */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {caseData.steps.map((step, idx) => {
            const optimalOption = step.options?.reduce((max, opt) => (opt.points > max.points ? opt : max), step.options[0]);

            return (
              <div key={step.id || idx} className="p-4 bg-f1-dark/80 rounded-2xl border border-f1-border space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-f1-green/20 text-f1-green border border-f1-green/40 font-mono text-xs font-bold flex items-center justify-center">
                      0{step.stepNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {step.title}
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-f1-green/10 border border-f1-green/30 text-f1-green text-xs font-mono font-bold">
                    +100 PTS (ÓPTIMO)
                  </span>
                </div>

                <div className="p-3 bg-f1-card rounded-xl border border-f1-green/40 text-xs text-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-f1-green flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">
                      {optimalOption?.text}
                    </span>
                    {optimalOption?.feedback && (
                      <span className="text-slate-400 text-[11px] block italic">
                        💡 {optimalOption.feedback}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-f1-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-f1-cyan hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md shadow-f1-cyan/20"
          >
            CONTINUAR A LA PISTA
          </button>
        </div>
      </div>
    </div>
  );
}
