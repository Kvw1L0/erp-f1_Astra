'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, Smartphone, Wifi, ExternalLink, ShieldCheck } from 'lucide-react';
import { TEAMS_LIST } from '../../lib/firebaseRaceEngine';

export default function QrConnectModal({ onClose, defaultTeamId = null }) {
  const [copied, setCopied] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(defaultTeamId || '');
  const [originUrl, setOriginUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }
  }, []);

  const connectUrl = originUrl
    ? `${originUrl}/participant${selectedTeam ? `?team=${selectedTeam}` : ''}`
    : '/participant';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(connectUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 select-none overflow-y-auto animate-fade-in">
      <div className="max-w-md w-full bg-f1-card border border-f1-border rounded-3xl p-6 md:p-8 shadow-2xl relative my-auto text-center space-y-5">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-f1-dark border border-f1-border text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-f1-cyan/15 border border-f1-cyan/30 text-f1-cyan font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>ACCESO INSTANTÁNEO TABLETS</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white italic uppercase">
            Conectar Dispositivos
          </h3>
          <p className="text-xs text-slate-300 font-sans mt-1">
            Escanea el código con la cámara de la tablet para ingresar a Pits en 3 segundos.
          </p>
        </div>

        {/* Código QR de Alto Contraste */}
        <div className="bg-white p-4 rounded-2xl shadow-xl inline-block mx-auto border-4 border-slate-900">
          {originUrl ? (
            <QRCodeSVG
              value={connectUrl}
              size={220}
              level="H"
              includeMargin={false}
            />
          ) : (
            <div className="w-[220px] h-[220px] flex items-center justify-center text-slate-400 font-mono text-xs">
              Generando QR...
            </div>
          )}
        </div>

        {/* Selector de Escudería Opcional */}
        <div className="space-y-1.5 text-left">
          <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">
            PRE-SELECCIONAR ESCUDERÍA (OPCIONAL):
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full bg-f1-dark border border-f1-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-f1-cyan focus:outline-none"
          >
            <option value="">Cualquier Escudería (El equipo elige en la tablet)</option>
            {TEAMS_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                Escudería #{t.id}: {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Enlace y Botón Copiar */}
        <div className="flex items-center gap-2 bg-f1-dark p-2.5 rounded-xl border border-f1-border text-left">
          <input
            type="text"
            readOnly
            value={connectUrl}
            className="bg-transparent text-xs font-mono text-slate-300 flex-1 outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-f1-cyan/20 hover:bg-f1-cyan/30 text-f1-cyan border border-f1-cyan/40 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-f1-green" />
                <span className="text-f1-green">¡COPIADO!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPIAR</span>
              </>
            )}
          </button>
        </div>

        {/* Guía Rápida de Conexión */}
        <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 text-left font-mono text-[11px] text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 text-white font-bold">
            <Smartphone className="w-3.5 h-3.5 text-f1-yellow" />
            <span>PASO A PASO EN SALA:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Abre la cámara del iPad o tablet Android.</li>
            <li>Apunta hacia este código QR en pantalla.</li>
            <li>Toca el enlace emergente y ¡listos para correr!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
