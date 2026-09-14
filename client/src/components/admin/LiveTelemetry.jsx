'use client';

import React from 'react';
import { Activity, Zap, CheckCircle2, Clock, Wifi, AlertTriangle } from 'lucide-react';

export default function LiveTelemetry({ connectedTeams = {}, submissions = {}, teamsList = [] }) {
  return (
    <div className="bg-f1-card p-6 rounded-2xl border border-f1-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white uppercase italic flex items-center gap-2">
            <Activity className="w-5 h-5 text-f1-cyan" />
            <span>Telemetría de los 10 Equipos en Vivo</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            ESTADO DE CONEXIÓN, TIEMPOS OFICIALES Y RESPUESTAS
          </p>
        </div>
        <div className="text-xs font-mono px-3 py-1 bg-f1-dark rounded-lg border border-f1-border text-slate-300">
          RESPUESTAS: <span className="text-f1-green font-bold">{Object.keys(submissions).length}</span> / 10
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {teamsList.map((team) => {
          const isConnected = !!connectedTeams[team.id];
          const submission = submissions[team.id];
          const hasSubmitted = !!submission;

          let statusBadge = (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              DESCONECTADO
            </span>
          );

          if (hasSubmitted) {
            statusBadge = (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-f1-green/20 text-f1-green border border-f1-green/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ENVIADO
              </span>
            );
          } else if (isConnected) {
            statusBadge = (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-f1-cyan/20 text-f1-cyan border border-f1-cyan/40 flex items-center gap-1 animate-pulse">
                <Wifi className="w-3 h-3" /> RESPONDIENDO
              </span>
            );
          }

          return (
            <div
              key={team.id}
              className={`p-4 rounded-xl border transition-all ${
                hasSubmitted
                  ? 'bg-f1-dark/95 border-f1-green/50 shadow-md shadow-f1-green/5'
                  : isConnected
                  ? 'bg-f1-dark/80 border-f1-cyan/40'
                  : 'bg-f1-dark/40 border-f1-border/40 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: team.color || '#E10600' }}
                  />
                  <span className="font-mono text-xs font-bold text-white">
                    {team.shortName || `EQ ${team.id}`}
                  </span>
                </div>
                {statusBadge}
              </div>

              <div className="text-xs font-bold text-slate-200 truncate">
                {team.name}
              </div>
              {team.subname && (
                <div className="text-[11px] font-bold text-f1-yellow truncate italic mb-1.5">
                  &ldquo;{team.subname}&rdquo;
                </div>
              )}

              {/* Nómina de Pilotos */}
              {team.participants && team.participants.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {team.participants.map((p, i) => (
                    <span key={i} className="px-1.5 py-0.2 rounded bg-white/10 text-slate-300 text-[9px] font-mono truncate max-w-[80px]">
                      {p}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-f1-border/50 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>TIEMPO:</span>
                  <span className="text-white font-bold">
                    {submission ? `${submission.durationSeconds}s` : '--'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>PUNTAJE:</span>
                  <span className={submission?.score ? 'text-yellow-400 font-bold' : 'text-slate-500'}>
                    {submission ? `${submission.score} pts` : '--'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
