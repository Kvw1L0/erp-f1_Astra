'use client';

import React from 'react';
import Link from 'next/link';
import { useSocket } from '../context/SocketContext';
import { Smartphone, Tv, ShieldCheck, Zap, Flag, Activity, Trophy } from 'lucide-react';

export default function HomePage() {
  const { isConnected, gameState } = useSocket();

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Glow de fondo F1 */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-f1-red/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-f1-cyan/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-f1-border/60 pb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-f1-red rounded-xl flex items-center justify-center shadow-lg shadow-f1-red/30">
            <Flag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase italic">
              El Gran Premio <span className="text-f1-red">de la Eficiencia</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Cultura Pits & Gamificación ERP NetSuite en Tiempo Real
            </p>
          </div>
        </div>

        {/* Badge de conexión */}
        <div className="flex items-center gap-2 bg-f1-card px-4 py-2 rounded-full border border-f1-border">
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-f1-green animate-pulse' : 'bg-f1-red'}`} />
          <span className="text-xs font-mono font-medium text-slate-300">
            {isConnected ? 'TELEMETRÍA PITS: EN LÍNEA' : 'CONECTANDO AL SERVIDOR...'}
          </span>
        </div>
      </header>

      {/* Hero & Selector de Vistas */}
      <main className="my-auto py-12 relative z-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-f1-card border border-f1-border text-xs font-mono text-f1-cyan mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>SISTEMA DE CAPACITACIÓN GAMIFICADA • 10 EQUIPOS / 100 PARTICIPANTES</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Selecciona la Interfaz de Operación
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Cada equipo opera desde su tablet en Pits, mientras la pantalla gigante proyecta la carrera y el Director de Carrera controla los casos en tiempo real.
          </p>
        </div>

        {/* 3 Cartas de Vistas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* VISTA A: PARTICIPANTE */}
          <Link
            href="/participant"
            className="group relative bg-f1-card hover:bg-f1-cardHover p-8 rounded-2xl border border-f1-border hover:border-f1-cyan/60 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-f1-cyan/10 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-f1-cyan/5 rounded-bl-full pointer-events-none group-hover:bg-f1-cyan/10 transition-colors" />
            <div>
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 text-f1-cyan group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-f1-cyan font-semibold">
                VISTA A • TABLETS / MOBILE
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-3 group-hover:text-f1-cyan transition-colors">
                Terminal de Escudería
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Login ágil por PIN de Equipo (1-10). Visualización minimalista del caso de 5 pasos, barra de tiempo inmersiva y bloqueo automático de telemetría.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-f1-border/60 flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-white">
              <span>ACCEDER COMO EQUIPO</span>
              <span className="text-f1-cyan">→</span>
            </div>
          </Link>

          {/* VISTA B: PANTALLA GIGANTE */}
          <Link
            href="/race-screen"
            className="group relative bg-f1-card hover:bg-f1-cardHover p-8 rounded-2xl border border-f1-border hover:border-f1-red/60 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-f1-red/10 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-f1-red/5 rounded-bl-full pointer-events-none group-hover:bg-f1-red/10 transition-colors" />
            <div>
              <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-f1-red group-hover:scale-110 transition-transform">
                <Tv className="w-7 h-7" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-f1-red font-semibold">
                VISTA B • PROYECTOR / 4K
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-3 group-hover:text-f1-red transition-colors">
                Pista Principal F1
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pista con 10 autos de F1 en carriles horizontales, animaciones fluidas con Framer Motion, efecto WOW de Nitro (+20%) y podio de ganadores.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-f1-border/60 flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-white">
              <span>ABRIR EN PANTALLA GIGANTE</span>
              <span className="text-f1-red">→</span>
            </div>
          </Link>

          {/* VISTA C: PANEL DE ADMINISTRACIÓN */}
          <Link
            href="/admin"
            className="group relative bg-f1-card hover:bg-f1-cardHover p-8 rounded-2xl border border-f1-border hover:border-f1-yellow/60 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-f1-yellow/10 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-f1-yellow/5 rounded-bl-full pointer-events-none group-hover:bg-f1-yellow/10 transition-colors" />
            <div>
              <div className="w-14 h-14 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-6 text-f1-yellow group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-f1-yellow font-semibold">
                VISTA C • BACKOFFICE
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-3 group-hover:text-f1-yellow transition-colors">
                Dirección de Carrera
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                CRUD completo de casos y puntajes por opción. Consola de control para iniciar casos, monitorear telemetría de los 10 equipos en vivo y revelar resultados.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-f1-border/60 flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-white">
              <span>PANEL DE MODERADOR</span>
              <span className="text-f1-yellow">→</span>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-f1-border/60 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500 relative z-10">
        <div className="flex items-center gap-4">
          <span>SISTEMA DE TELEMETRÍA VELTIS ERP</span>
          <span>•</span>
          <span>ESTADO: {gameState?.status || 'LOBBY'}</span>
        </div>
        <div>
          <span>REGLA POLE POSITION BOOST: 100% PUNTAJE + MENOR TIEMPO SERVIDOR = +20% DISTANCIA</span>
        </div>
      </footer>
    </div>
  );
}
