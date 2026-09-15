'use client';

import React, { useState } from 'react';
import { Flag, Shield, KeyRound, AlertCircle, Users, Sparkles, Check, ChevronRight, Plus, Trash2, User, Loader2 } from 'lucide-react';
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
  const [drivers, setDrivers] = useState([
    { id: 1, name: '', role: 'Piloto 1' },
    { id: 2, name: '', role: 'Piloto 2' },
    { id: 3, name: '', role: 'Piloto 3' }
  ]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setError('');
    sounds.playSelect();
    triggerHaptic([30]);
  };

  const handleAddDriver = () => {
    if (drivers.length >= 10) return;
    const nextIdx = drivers.length + 1;
    setDrivers(prev => [
      ...prev,
      { id: nextIdx, name: '', role: `Piloto ${nextIdx}` }
    ]);
    sounds.playSelect();
    triggerHaptic([20]);
  };

  const handleRemoveDriver = (idxToRemove) => {
    if (drivers.length <= 1) return;
    setDrivers(prev =>
      prev
        .filter((_, idx) => idx !== idxToRemove)
        .map((d, i) => ({ ...d, id: i + 1, role: `Piloto ${i + 1}` }))
    );
    triggerHaptic([20]);
  };

  const handleDriverChange = (index, value) => {
    setDrivers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name: value };
      return copy;
    });
  };

  const handleConfirmLogin = async (e) => {
    if (e) e.preventDefault();

    if (!selectedTeam) {
      setError('Por favor selecciona tu escudería.');
      return;
    }

    const finalSubname = subname.trim() || selectedTeam.placeholder;
    const participantsList = drivers
      .map(d => d.name.trim())
      .filter(Boolean);

    setIsLoading(true);
    setError('');
    try {
      sounds.playSelect();
      triggerHaptic([50, 40, 50]);
      const teamPayload = {
        id: selectedTeam.id,
        name: selectedTeam.name,
        shortName: selectedTeam.shortName,
        color: selectedTeam.color,
        subname: finalSubname,
        participants: participantsList.length > 0 ? participantsList : [`Piloto ${selectedTeam.id}`]
      };

      await onLoginSuccess(teamPayload, selectedTeam.pin, finalSubname, teamPayload.participants);
    } catch (err) {
      console.error('Error en login de participante:', err);
      setError('Error al conectar la terminal de Pits. Intenta de nuevo.');
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
          SELECCIÓN DE ESCUDERÍA, SUBNOMBRE & NÓMINA INDIVIDUAL DE PILOTOS
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
            Personaliza el nombre de tu escudería en la pantalla gigante y el podio.
          </p>
        </div>

        {/* 3. Nómina Fila por Fila de Pilotos / Sujetos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-slate-300 uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-f1-green" />
              <span>3. Pilotos de la Escudería (Nómina por Fila):</span>
            </label>
            <span className="text-[10px] font-mono text-slate-400">
              {drivers.length} / 10 Pilotos
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {drivers.map((driver, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-f1-dark/90 p-2 rounded-xl border border-f1-border/70 hover:border-slate-600 transition-all"
              >
                {/* Badge de Número de Fila / ID */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs text-white flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: selectedTeam.color || '#E10600' }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {/* Input de Nombre individual */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    maxLength={35}
                    value={driver.name}
                    onChange={(e) => handleDriverChange(idx, e.target.value)}
                    placeholder={`Nombre y Apellido del Piloto ${idx + 1}`}
                    className="w-full bg-black/40 border border-transparent focus:border-f1-green rounded-lg px-3 py-2 text-white text-xs font-sans placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>

                {/* Botón Eliminar Fila */}
                {drivers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDriver(idx)}
                    className="w-8 h-8 rounded-lg bg-red-950/30 hover:bg-red-900/60 text-red-400 border border-red-500/20 flex items-center justify-center transition-all flex-shrink-0 active:scale-95"
                    title="Eliminar este piloto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Botón Agregar Fila */}
          {drivers.length < 10 && (
            <button
              type="button"
              onClick={handleAddDriver}
              className="mt-2 w-full py-2 px-3 rounded-xl border border-dashed border-f1-border hover:border-f1-green/60 bg-f1-dark/40 hover:bg-f1-dark text-slate-300 hover:text-f1-green font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Agregar Otro Piloto a la Escudería</span>
            </button>
          )}

          <p className="text-[10px] text-slate-500 font-mono mt-1.5">
            Cada fila identifica a un integrante para la ruleta en vivo y dinámicas de escenario.
          </p>
        </div>

        {/* Botón de Confirmación */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 bg-gradient-to-r from-f1-red via-red-600 to-rose-700 hover:from-red-600 hover:to-rose-800 disabled:opacity-40 text-white font-mono font-black py-3.5 px-6 rounded-xl transition-all shadow-xl shadow-f1-red/30 active:scale-[0.98] uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <span className="animate-pulse flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              CONECTANDO A PITS...
            </span>
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
