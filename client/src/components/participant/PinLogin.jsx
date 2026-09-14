'use client';

import React, { useState } from 'react';
import { Flag, Shield, KeyRound, AlertCircle, Users, Sparkles, Check, ChevronRight } from 'lucide-react';
import { sounds, triggerHaptic } from '../../lib/soundEffects';

export const OFFICIAL_TEAMS = [
  { pin: '1', id: 1, label: '01', name: 'Red Bull Racing', shortName: 'RBR', color: '#3671C6', placeholder: 'Los Toros Asombrosos' },
  { pin: '2', id: 2, label: '02', name: 'Scuderia Ferrari', shortName: 'FER', color: '#E80020', placeholder: 'Los Intrépidos de Maranello' },
  { pin: '3', id: 3, label: '03', name: 'Mercedes-AMG', shortName: 'MER', color: '#27F4D2', placeholder: 'Flechas de Plata ERP' },
  { pin: '4', id: 4, label: '04', name: 'McLaren F1', shortName: 'MCL', color: '#FF8000', placeholder: 'Los Manglaren Ultrarrápidos' },
  { pin: '5', id: 5, label: '05', name: 'Aston Martin', shortName: 'AST', color: '#229971', placeholder: 'Los Espías de la Eficiencia' },
  { pin: '6', id: 6, label: '06', name: 'Alpine F1', shortName: 'ALP', color: '#0093CC', placeholder: 'Fuerza Azul NetSuite' },
  { pin: '7', id: 7, label: '07', name: 'Williams Racing', shortName: 'WIL', color: '#64C4FF', placeholder: 'Tradición y Velocidad' },
  { pin: '8', id: 8, label: '08', name: 'Visa Cash App RB', shortName: 'RBF', color: '#6692FF', placeholder: 'Toros Jóvenes Imparables' },
  { pin: '9', id: 9, label: '09', name: 'Kick Sauber', shortName: 'SAU', color: '#52E252', placeholder: 'Verde Neón Relámpago' },
  { pin: '10', id: 10, label: '10', name: 'Haas F1 Team', shortName: 'HAA', color: '#B6BABD', placeholder: 'Estrategas de Acero' }
];

export default function PinLogin({ onLoginSuccess, isConnecting }) {
  const [selectedTeam, setSelectedTeam] = useState(OFFICIAL_TEAMS[0]);
  const [subname, setSubname] = useState('');
  const [participantsText, setParticipantsText] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setError('');
    sounds.playSelect();
    triggerHaptic([30]);
  };

  const handleConfirmLogin = async (e) => {
    if (e) e.preventDefault();

    if (!selectedTeam) {
      setError('Por favor selecciona tu escudería.');
      return;
    }

    const finalSubname = subname.trim() || selectedTeam.placeholder;
    const participantsList = participantsText
      .split(/[,;\n]+/)
      .map(p => p.trim())
      .filter(Boolean);

    setIsLoading(true);
    setError('');
    sounds.playSelect();
    triggerHaptic([50, 40, 50]);

    try {
      const teamPayload = {
        id: selectedTeam.id,
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
        color: selectedTeam.color,
        subname: finalSubname,
        participants: participantsList.length > 0 ? participantsList : [`Piloto ${selectedTeam.id}`]
      };

      onLoginSuccess(teamPayload, selectedTeam.pin, finalSubname, teamPayload.participants);
    } catch (err) {
      setError('Error al conectar la terminal de Pits.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto bg-f1-card p-6 md:p-8 rounded-3xl border border-f1-border shadow-2xl relative text-left">
      {/* Header del Login */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-f1-red/10 border border-f1-red/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-f1-red shadow-lg shadow-f1-red/10">
          <Flag className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">
          Terminal <span className="text-f1-red">de Pits</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          SELECCIÓN DE ESCUDERÍA, SUBNOMBRE & NÓMINA DE PILOTOS
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Selector de Escudería 1 al 10 */}
      <div className="mb-5">
        <label className="block text-xs font-mono text-slate-400 uppercase mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-f1-cyan" />
            <span>1. Elige tu Escudería Oficial (1 - 10):</span>
          </span>
          <span className="text-f1-cyan font-bold font-mono text-[11px]">
            {selectedTeam.name}
          </span>
        </label>
        
        <div className="grid grid-cols-5 gap-2">
          {OFFICIAL_TEAMS.map((team) => {
            const isSelected = selectedTeam.id === team.id;
            return (
              <button
                key={team.pin}
                type="button"
                onClick={() => handleSelectTeam(team)}
                className={`py-2 px-1 rounded-xl font-mono text-xs font-bold transition-all flex flex-col items-center justify-center border relative ${
                  isSelected
                    ? 'border-white text-white shadow-lg scale-105 z-10'
                    : 'bg-f1-dark/80 border-f1-border text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
                style={{
                  backgroundColor: isSelected ? team.color : undefined,
                  boxShadow: isSelected ? `0 0 15px ${team.color}80` : undefined
                }}
              >
                <span className="text-[10px] opacity-80">{team.label}</span>
                <span className="font-black text-xs">{team.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Subnombre del Equipo */}
      <form onSubmit={handleConfirmLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-f1-yellow" />
            <span>2. Subnombre / Lema Propio del Equipo:</span>
          </label>
          <input
            type="text"
            maxLength={45}
            value={subname}
            onChange={(e) => setSubname(e.target.value)}
            placeholder={`Ej: ${selectedTeam.placeholder}`}
            className="w-full bg-f1-dark border border-f1-border focus:border-f1-yellow rounded-xl px-4 py-3 text-white text-sm font-sans placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-f1-yellow transition-all"
          />
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            Personaliza el nombre de tu escudería en la pista gigante y el podio.
          </p>
        </div>

        {/* 3. Nómina de Participantes */}
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-f1-green" />
            <span>3. Pilotos de la Escudería (Nómina de Integrantes):</span>
          </label>
          <textarea
            rows={2}
            value={participantsText}
            onChange={(e) => setParticipantsText(e.target.value)}
            placeholder="Escribe los nombres separados por coma (ej. Camila, Roberto, Martín, Sofía)"
            className="w-full bg-f1-dark border border-f1-border focus:border-f1-green rounded-xl px-4 py-2.5 text-white text-sm font-sans placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-f1-green transition-all resize-none"
          />
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            Se utilizará para dinámicas de ruleta, traspaso de pilotos y desafíos del moderador.
          </p>
        </div>

        {/* Botón de Confirmación */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-gradient-to-r from-f1-red via-red-600 to-rose-700 hover:from-red-600 hover:to-rose-800 disabled:opacity-40 text-white font-mono font-black py-3.5 px-6 rounded-xl transition-all shadow-xl shadow-f1-red/30 active:scale-[0.98] uppercase tracking-wider text-sm flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="animate-pulse">SINCRONIZANDO TELEMETRÍA...</span>
          ) : (
            <>
              <span>INGRESAR A PITS & BLOQUEAR ESCUDERÍA</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Nota de confidencialidad */}
      <div className="mt-5 text-center">
        <p className="text-[11px] text-slate-500 font-mono">
          🔒 Acceso anónimo corporativo. No se solicitan correos, teléfonos ni contraseñas.
        </p>
      </div>
    </div>
  );
}
