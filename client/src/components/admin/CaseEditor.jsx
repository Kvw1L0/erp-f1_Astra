'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Wrench, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';

export default function CaseEditor({ cases, onSaveCase, onDeleteCase, onCancel }) {
  const [selectedCase, setSelectedCase] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimitSeconds: 60,
    battleVideoUrl: '/videos/sector-01-battle.mp4',
    battleTitle: 'Curva 1: Frenada Extrema a 340 km/h y Adelantamiento por el Vértice',
    battleDescription: 'Cámaras on-board a ras de asfalto: las escuderías con cierre impecable ganan tracción.',
    steps: []
  });

  const handleStartNew = () => {
    setSelectedCase(null);
    setFormData({
      title: 'Nuevo Gran Premio de Configuración ERP',
      description: 'Describe el escenario de negocio o desafío en Pits...',
      timeLimitSeconds: 60,
      battleVideoUrl: '/videos/sector-01-battle.mp4',
      battleTitle: 'Curva 1: Frenada Extrema a 340 km/h y Adelantamiento',
      battleDescription: 'Cámaras on-board a ras de asfalto: telemetría en tiempo real calculando sobrepasos.',
      steps: [
        {
          id: `step-${Date.now()}-1`,
          stepNumber: 1,
          title: 'Paso 1: Diagnóstico de Proceso',
          description: '¿Cuál es la primera acción requerida en NetSuite?',
          options: [
            { id: `opt-${Date.now()}-1`, text: 'Opción Óptima automatizada en 1 clic', points: 100, feedback: '¡Excelente decisión técnica!' },
            { id: `opt-${Date.now()}-2`, text: 'Opción Válida manual intermedia', points: 50, feedback: 'Funciona pero consume más tiempo.' },
            { id: `opt-${Date.now()}-3`, text: 'Opción Ineficiente fuera del sistema', points: 10, feedback: 'Riesgo de error y retrabajo.' }
          ]
        }
      ]
    });
    setIsEditing(true);
  };

  const handleSelectToEdit = (caseItem) => {
    setSelectedCase(caseItem);
    setFormData({
      battleVideoUrl: '/videos/sector-01-battle.mp4',
      battleTitle: '',
      battleDescription: '',
      ...JSON.parse(JSON.stringify(caseItem))
    });
    setIsEditing(true);
  };

  const handleAddStep = () => {
    const nextStepNum = (formData.steps?.length || 0) + 1;
    const newStep = {
      id: `step-${Date.now()}-${nextStepNum}`,
      stepNumber: nextStepNum,
      title: `Paso ${nextStepNum}: Configuración de Pits`,
      description: 'Descripción del paso...',
      options: [
        { id: `opt-${Date.now()}-a`, text: 'Acción Óptima', points: 100, feedback: 'Telemetría perfecta' },
        { id: `opt-${Date.now()}-b`, text: 'Acción Alternativa', points: 50, feedback: 'Aceptable' },
        { id: `opt-${Date.now()}-c`, text: 'Acción Ineficiente', points: 10, feedback: 'Retraso en pits' }
      ]
    };
    setFormData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));
  };

  const handleRemoveStep = (stepIdx) => {
    const updated = formData.steps.filter((_, idx) => idx !== stepIdx);
    // Renumerar
    updated.forEach((s, idx) => {
      s.stepNumber = idx + 1;
    });
    setFormData(prev => ({ ...prev, steps: updated }));
  };

  const handleStepTitleChange = (stepIdx, val) => {
    const updated = [...formData.steps];
    updated[stepIdx].title = val;
    setFormData(prev => ({ ...prev, steps: updated }));
  };

  const handleStepDescChange = (stepIdx, val) => {
    const updated = [...formData.steps];
    updated[stepIdx].description = val;
    setFormData(prev => ({ ...prev, steps: updated }));
  };

  const handleOptionChange = (stepIdx, optIdx, field, val) => {
    const updated = [...formData.steps];
    updated[stepIdx].options[optIdx][field] = field === 'points' ? Number(val) || 0 : val;
    setFormData(prev => ({ ...prev, steps: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.steps || formData.steps.length === 0) {
      alert('El caso debe tener título y al menos un paso.');
      return;
    }
    onSaveCase(formData, selectedCase?.id);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <div className="bg-f1-card p-6 rounded-2xl border border-f1-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white uppercase italic">
                Catálogo de Casos <span className="text-f1-yellow">ERP NetSuite</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ADMINISTRA LOS CASOS, PASOS Y PUNTAJES POR OPCIÓN
              </p>
            </div>
            <button
              onClick={handleStartNew}
              className="px-4 py-2.5 bg-f1-yellow hover:bg-yellow-400 text-black font-mono font-bold text-xs uppercase rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>CREAR NUEVO CASO</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((c) => (
              <div
                key={c.id}
                className="p-5 bg-f1-dark/80 rounded-xl border border-f1-border hover:border-slate-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-f1-card border border-f1-border text-f1-cyan">
                      {c.timeLimitSeconds}s LÍMITE • {c.steps?.length || 0} PASOS
                    </span>
                    <span className="text-xs font-mono text-slate-500">ID: {c.id}</span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{c.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 font-sans">{c.description}</p>
                  {c.battleTitle && (
                    <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-black/50 border border-f1-cyan/20 flex items-center gap-2 text-[10px] font-mono text-f1-cyan">
                      <span className="text-xs">🎬</span>
                      <span className="truncate text-slate-300 font-semibold">{c.battleTitle}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-f1-border/60">
                  <button
                    onClick={() => handleSelectToEdit(c)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>EDITAR</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el caso "${c.title}"?`)) {
                        onDeleteCase(c.id);
                      }
                    }}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Eliminar Caso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* FORMULARIO DE EDICIÓN/CREACIÓN DE CASO */
        <form onSubmit={handleSubmit} className="bg-f1-card p-6 rounded-2xl border border-f1-border space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-f1-border">
            <div>
              <h3 className="text-lg font-bold text-white uppercase italic">
                {selectedCase ? 'Editar Caso ERP' : 'Nuevo Caso de Pits'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                CONFIGURACIÓN DE PASOS, OPCIONES Y PUNTOS (100 / 50 / 10)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-xl bg-f1-dark text-slate-400 hover:text-white border border-f1-border"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metadatos del Caso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                TÍTULO DEL CASO
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-f1-dark border border-f1-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-f1-yellow focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                TIEMPO LÍMITE (SEGUNDOS)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={formData.timeLimitSeconds}
                onChange={(e) => setFormData({ ...formData, timeLimitSeconds: Number(e.target.value) || 60 })}
                className="w-full bg-f1-dark border border-f1-border rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:border-f1-yellow focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              DESCRIPCIÓN DEL CASO / CONTEXTO NETSUITE
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-f1-dark border border-f1-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-f1-yellow focus:outline-none"
            />
          </div>

          {/* Configuración de Video Cinemático de Batalla */}
          <div className="bg-f1-dark/60 p-4 rounded-xl border border-f1-border space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-f1-yellow uppercase tracking-wider">
                🎬 CONFIGURACIÓN DEL VIDEO DE BATALLA (AL FINALIZAR LA RONDA)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  ARCHIVO DE VIDEO (.MP4)
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.battleVideoUrl?.startsWith('/videos/sector-') ? formData.battleVideoUrl : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        setFormData({ ...formData, battleVideoUrl: e.target.value });
                      }
                    }}
                    className="bg-f1-card border border-f1-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-f1-yellow focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => {
                      const padded = String(s).padStart(2, '0');
                      return (
                        <option key={s} value={`/videos/sector-${padded}-battle.mp4`}>
                          Sector {s}: sector-{padded}-battle.mp4
                        </option>
                      );
                    })}
                    <option value="custom">Ruta Personalizada...</option>
                  </select>
                  <input
                    type="text"
                    value={formData.battleVideoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, battleVideoUrl: e.target.value })}
                    placeholder="/videos/sector-01-battle.mp4"
                    className="flex-1 bg-f1-card border border-f1-border rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:border-f1-yellow focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  TÍTULO DE LA BATALLA EN PISTA
                </label>
                <input
                  type="text"
                  value={formData.battleTitle || ''}
                  onChange={(e) => setFormData({ ...formData, battleTitle: e.target.value })}
                  placeholder="Ej: Curva 1: Frenada Extrema a 340 km/h"
                  className="w-full bg-f1-card border border-f1-border rounded-xl px-3 py-2 text-xs text-white focus:border-f1-yellow focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                DESCRIPCIÓN DE TELEMETRÍA / CÁMARAS DISRUPTIVAS
              </label>
              <input
                type="text"
                value={formData.battleDescription || ''}
                onChange={(e) => setFormData({ ...formData, battleDescription: e.target.value })}
                placeholder="Ej: Cámaras on-board a ras de asfalto: telemetría en tiempo real calculando sobrepasos..."
                className="w-full bg-f1-card border border-f1-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-f1-yellow focus:outline-none"
              />
            </div>
          </div>

          {/* LISTA DE PASOS */}
          <div className="space-y-6 pt-4 border-t border-f1-border">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-white font-mono uppercase">
                Pasos del Caso ({formData.steps.length})
              </h4>
              <button
                type="button"
                onClick={handleAddStep}
                className="px-3 py-1.5 bg-f1-cyan/10 border border-f1-cyan/30 text-f1-cyan hover:bg-f1-cyan/20 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>AÑADIR PASO</span>
              </button>
            </div>

            {formData.steps.map((step, stepIdx) => (
              <div key={step.id || stepIdx} className="p-5 bg-f1-dark/90 rounded-xl border border-f1-border space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-f1-card text-f1-cyan font-mono text-xs font-bold flex items-center justify-center border border-f1-border">
                      {step.stepNumber}
                    </span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleStepTitleChange(stepIdx, e.target.value)}
                      placeholder="Título del Paso..."
                      className="flex-1 bg-f1-card border border-f1-border rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-f1-cyan"
                    />
                  </div>
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(stepIdx)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={step.description || ''}
                  onChange={(e) => handleStepDescChange(stepIdx, e.target.value)}
                  placeholder="Pregunta o instrucción del paso..."
                  className="w-full bg-f1-card border border-f1-border rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                />

                {/* 3 Opciones con asignación de puntos */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[11px] font-mono text-slate-400 uppercase">
                    3 OPCIONES Y ASIGNACIÓN DE PUNTOS:
                  </label>
                  {step.options?.map((opt, optIdx) => (
                    <div key={opt.id || optIdx} className="grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-1 text-center font-mono text-xs font-bold text-slate-400">
                        {['A', 'B', 'C'][optIdx] || optIdx + 1}
                      </span>
                      <div className="col-span-8">
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionChange(stepIdx, optIdx, 'text', e.target.value)}
                          placeholder={`Texto de opción ${optIdx + 1}...`}
                          className="w-full bg-f1-card border border-f1-border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-3 flex items-center gap-1">
                        <input
                          type="number"
                          value={opt.points}
                          onChange={(e) => handleOptionChange(stepIdx, optIdx, 'points', e.target.value)}
                          className="w-full bg-f1-card border border-f1-border rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-yellow-400 text-center focus:outline-none"
                        />
                        <span className="text-[10px] font-mono text-slate-500">PTS</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-f1-border">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs font-bold uppercase hover:bg-slate-700"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-f1-yellow hover:bg-yellow-400 text-black font-mono font-bold text-xs uppercase rounded-xl flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>GUARDAR CASO</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
