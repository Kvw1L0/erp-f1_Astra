'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import LiveTelemetry from '../../components/admin/LiveTelemetry';
import CaseEditor from '../../components/admin/CaseEditor';
import DebriefModal from '../../components/race/DebriefModal';
import RouletteModal from '../../components/admin/RouletteModal';
import {
  Flag, Play, Lock, Eye, RotateCcw, ShieldCheck, Trophy, Sparkles,
  FastForward, Zap, Compass, Flame, AlertOctagon, Users, BarChart3,
  Radio, Clock, AlertTriangle, CloudRain, ShieldAlert, CheckCircle2,
  Volume2, ArrowRightLeft, Send, Trash2
} from 'lucide-react';
import { OFFICIAL_TEAMS } from '../../components/participant/PinLogin';

const DEFAULT_CASES = [
  {
    id: "case-01",
    title: "Gran Premio de Facturación y Cierre Contable Express",
    description: "El equipo de Finanzas entra a Pits durante el cierre mensual. Los pedidos aprobados deben convertirse en facturas y conciliarse en NetSuite.",
    timeLimitSeconds: 60,
    steps: [
      {
        id: "step-1",
        stepNumber: 1,
        title: "Validación de Pedidos de Venta (Sales Orders)",
        description: "¿Cuál es el procedimiento más óptimo en NetSuite para procesar 300 pedidos?",
        options: [
          { id: "opt-1a", text: "Ejecutar la tarea programada 'Bill Sales Orders' en procesamiento masivo automático con filtros de estado.", points: 100, feedback: "¡Telemetría Perfecta! Procesamiento asincrónico por lotes." },
          { id: "opt-1b", text: "Abrir cada Sales Order individualmente y hacer clic en 'Bill' uno por uno.", points: 10, feedback: "Pit stop ineficiente: Alto consumo de tiempo y riesgo de error." },
          { id: "opt-1c", text: "Exportar a Excel, verificar y volver a importar con CSV Import.", points: 50, feedback: "Ruta alternativa válida pero duplica pasos." }
        ]
      },
      {
        id: "step-2",
        stepNumber: 2,
        title: "Asignación de Centros de Costos y Segmentación",
        description: "Se detectan transacciones sin línea de departamento y clase contable. ¿Cómo corregirlo?",
        options: [
          { id: "opt-2a", text: "Crear una regla de SuiteAnalytics / Workflow para heredar automáticamente los segmentos desde el registro del cliente.", points: 100, feedback: "¡Pole Position! Automatización nativa." },
          { id: "opt-2b", text: "Solicitar que editen manualmente los asientos contables generados.", points: 10, feedback: "Rompe la trazabilidad contable." },
          { id: "opt-2c", text: "Configurar un Saved Search con alerta por correo para revisar al final del día.", points: 50, feedback: "Alerta útil pero reactiva." }
        ]
      },
      {
        id: "step-3",
        stepNumber: 3,
        title: "Conciliación Bancaria y Recaudación",
        description: "Llegan los extractos de transferencias bancarias de múltiples clientes. ¿Cómo registrar los cobros?",
        options: [
          { id: "opt-3a", text: "Utilizar el módulo de 'Bank Feeds SuiteApp' con reglas automatizadas de Match Bank Data.", points: 100, feedback: "¡Vuelta Rápida! Conciliación inteligente en segundos." },
          { id: "opt-3b", text: "Crear registros de 'Customer Payment' manuales buscando cada número de factura.", points: 50, feedback: "Válido para bajo volumen." },
          { id: "opt-3c", text: "Registrar todo como depósito directo en cuenta puente sin asociar a facturas.", points: 10, feedback: "Deja cuentas por cobrar abiertas." }
        ]
      },
      {
        id: "step-4",
        stepNumber: 4,
        title: "Gestión de Inventario y Reabastecimiento Pits",
        description: "El stock de neumáticos y repuestos críticos en bodega Pits bajó del umbral de seguridad.",
        options: [
          { id: "opt-4a", text: "Consultar 'Order Items' en NetSuite con cálculo automático de punto de reorden y demanda proyectada.", points: 100, feedback: "¡Estrategia Óptima! Genera órdenes consolidadas." },
          { id: "opt-4b", text: "Enviar correos electrónicos a los proveedores solicitando cotizaciones de emergencia.", points: 10, feedback: "Retraso crítico en Pits." },
          { id: "opt-4c", text: "Generar órdenes de compra manuales ingresando los ítems uno por uno.", points: 50, feedback: "Cumple el objetivo pero no aprovecha la previsión." }
        ]
      },
      {
        id: "step-5",
        stepNumber: 5,
        title: "Auditoría Final y Telemetría de Cierre",
        description: "Antes de la bandera a cuadros, asegurar que los periodos contables se cierren sin discrepancias.",
        options: [
          { id: "opt-5a", text: "Completar la lista de verificación guiada de 'Manage Accounting Periods' con bloqueo por rol.", points: 100, feedback: "¡Bandera a Cuadros! Cierre seguro y auditable." },
          { id: "opt-5b", text: "Cambiar manualmente el estado del periodo a Cerrado sin ejecutar las tareas de bloqueo.", points: 10, feedback: "Permite modificaciones retroactivas." },
          { id: "opt-5c", text: "Dejar el periodo abierto y solicitar al equipo por chat que nadie registre movimientos.", points: 10, feedback: "Cero control sistemático." }
        ]
      }
    ]
  },
  {
    id: "case-02",
    title: "Sprint de Compras y Aprobación de Órdenes de Compra",
    description: "Adquisición urgente de suministros para la siguiente parada de pits. Flujo de aprobación multicriterio en NetSuite.",
    timeLimitSeconds: 45,
    steps: [
      {
        id: "c2-step-1",
        stepNumber: 1,
        title: "Ingreso de Purchase Request",
        description: "¿Cuál es la mejor práctica en NetSuite para solicitar repuestos?",
        options: [
          { id: "c2-1a", text: "Ingresar una Requisition en el Employee Center asignando el centro de costo del equipo.", points: 100, feedback: "¡Perfecto! Inicia el workflow sin consumir licencias completas." },
          { id: "c2-1b", text: "Llamar al Director de Compras para que cree una Purchase Order directa.", points: 10, feedback: "Rompe la segregación de funciones." },
          { id: "c2-1c", text: "Crear un Purchase Contract genérico sin detalle de ítems.", points: 50, feedback: "Aprobación ambigua." }
        ]
      },
      {
        id: "c2-step-2",
        stepNumber: 2,
        title: "Matriz de Aprobación por Límites Financieros",
        description: "El monto supera los $10,000 USD. ¿Cómo debe enrutarse?",
        options: [
          { id: "c2-2a", text: "SuiteFlow automático basado en Approval Limits por jerarquía de supervisor.", points: 100, feedback: "¡Rápido y Seguro! Aprobación móvil en 1 clic." },
          { id: "c2-2b", text: "Enviar un PDF por Slack solicitando confirmación escrita.", points: 50, feedback: "Aprobación informal sin registro nativo." },
          { id: "c2-2c", text: "Dividir la orden en dos de $5,000 USD para eludir el control.", points: 10, feedback: "Infracción grave de compliance." }
        ]
      },
      {
        id: "c2-step-3",
        stepNumber: 3,
        title: "Recepción de Mercancía en Pits (Item Receipt)",
        description: "¿Cómo certificar la recepción física vs orden de compra?",
        options: [
          { id: "c2-3a", text: "Registrar 'Item Receipt' con escaneo de código de barras desde NetSuite WMS Mobile.", points: 100, feedback: "¡Parada de 2.0 segundos! Stock disponible al instante." },
          { id: "c2-3b", text: "Firmar la guía física de despacho y guardarla en una carpeta de Pits.", points: 10, feedback: "Inventario 'fantasma' no disponible en el sistema." },
          { id: "c2-3c", text: "Ingresar la recepción en el sistema al final del turno nocturno.", points: 50, feedback: "Demora el uso de los repuestos." }
        ]
      },
      {
        id: "c2-step-4",
        stepNumber: 4,
        title: "3-Way Matching (Factura vs OC vs Recepción)",
        description: "¿Cómo se autoriza el pago al proveedor?",
        options: [
          { id: "c2-4a", text: "Validación automática de 3-Way Match (Cantidad, Precio y Recepción) en NetSuite.", points: 100, feedback: "¡Precisión milimétrica! Evita sobrepagos." },
          { id: "c2-4b", text: "Aprobar el pago si el monto coincide con la cotización inicial.", points: 50, feedback: "Riesgoso: No valida si todo fue recibido." },
          { id: "c2-4c", text: "Pagar directamente y conciliar las discrepancias en el trimestre siguiente.", points: 10, feedback: "Pérdida de control de flujo de caja." }
        ]
      },
      {
        id: "c2-step-5",
        stepNumber: 5,
        title: "Evaluación de Desempeño del Proveedor",
        description: "Se necesita medir la puntualidad y exactitud del proveedor.",
        options: [
          { id: "c2-5a", text: "Generar reporte de Vendor Scorecard con métricas de On-Time Delivery y Fill Rate nativas.", points: 100, feedback: "¡Estrategia de Campeonato! Datos objetivos." },
          { id: "c2-5b", text: "Preguntar la opinión general de los mecánicos al terminar el evento.", points: 50, feedback: "Subjetivo y no trazable." },
          { id: "c2-5c", text: "No realizar seguimiento si los repuestos funcionaron bien.", points: 10, feedback: "Descuentos por volumen desperdiciados." }
        ]
      }
    ]
  }
];

export default function AdminPage() {
  const { socket, isConnected, isCloudFirebase, gameState, cloudActions } = useSocket();
  const [activeTab, setActiveTab] = useState('race');
  const [cases, setCases] = useState(DEFAULT_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState('case-01');
  const [adminState, setAdminState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [showDebrief, setShowDebrief] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [summonTeamId, setSummonTeamId] = useState('1');
  const [summonReason, setSummonReason] = useState('Dinámica en Escenario');
  const [radioText, setRadioText] = useState('');

  const isVSCActive = gameState?.isSafetyCarActive || false;
  const isRedFlagActive = !!gameState?.isRedFlagActive;
  const isWetRaceActive = !!gameState?.isWetRaceActive;
  const currentSector = gameState?.currentSectorIndex || 1;
  const totalSectors = gameState?.totalSectors || 10;
  const currentStatus = gameState?.status || 'LOBBY';

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const teamsProfiles = gameState?.teamsProfiles || {};

  const handleStartCase = async () => {
    setIsLoading(true);
    const res = await cloudActions.startCase(selectedCase, currentSector, totalSectors);
    setIsLoading(false);
    if (res?.success) {
      setNotification(`🚀 Sector ${currentSector} iniciado con éxito.`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleAutoFinishCase = async () => {
    setIsLoading(true);
    const res = await cloudActions.autoFinishCase(selectedCase, currentSector, totalSectors);
    setIsLoading(false);
    if (res?.success) {
      setNotification('⚡ Ronda finalizada: Video 2 activado en pantalla y cálculo de avances en curso.');
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const handleNextSector = async () => {
    const nextIdx = Math.min(totalSectors, currentSector + 1);
    const res = await cloudActions.nextSector(nextIdx, totalSectors);
    if (res?.success) {
      setNotification(`⏩ Preparado para el Sector ${nextIdx}. Kilometraje de autos conservado.`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleToggleVSC = async () => {
    setIsLoading(true);
    const newStatus = !isVSCActive;
    await cloudActions.toggleSafetyCar(newStatus);
    setIsLoading(false);
    setNotification(newStatus ? '⚠️ Virtual Safety Car DESPLEGADO (Brechas comprimidas al 50%).' : '🟢 Virtual Safety Car FINALIZADO.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleToggleRedFlag = async () => {
    const newStatus = !isRedFlagActive;
    await cloudActions.setRedFlag(newStatus);
    setNotification(newStatus ? '🚨 BANDERA ROJA ACTIVADA: Carrera detenida en todas las pantallas.' : '🟢 Bandera Roja levantada. Carrera reanudada.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleExtendTimer = async () => {
    await cloudActions.extendTimer(30);
    setNotification('⏱️ +30 Segundos añadidos en tiempo real al cronómetro.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleToggleWetRace = async () => {
    const newStatus = !isWetRaceActive;
    await cloudActions.setWetRace(newStatus);
    setNotification(newStatus ? '🌧️ PISTA MOJADA: Modo lluvia activo en pantalla gigante.' : '☀️ Pista Seca restaurada.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleSendRadio = async (e) => {
    if (e) e.preventDefault();
    if (!radioText.trim()) return;
    await cloudActions.sendPitRadioMessage(radioText);
    setRadioText('');
    setNotification('📢 Comunicado de radio transmitido a todas las tablets.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleTriggerSummon = async () => {
    await cloudActions.triggerStageSummon(summonTeamId, summonReason, true);
    setNotification(`📣 Escudería #${summonTeamId} convocada al escenario.`);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleCancelSummon = async () => {
    await cloudActions.triggerStageSummon(summonTeamId, '', false);
    setNotification(`Alerta de convocatoria cancelada.`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSimulate10Teams = async () => {
    setIsLoading(true);
    const res = await cloudActions.simulate10Teams(selectedCase, currentSector, totalSectors);
    setIsLoading(false);
    if (res?.success) {
      setNotification('🏎️ Simulación de 10 Escuderías en vivo ejecutada.');
      setTimeout(() => setNotification(''), 4000);
    }
  };

  // Hard Reset de máxima seguridad (Foja Cero)
  const handleHardReset = async () => {
    const confirmed = confirm('⚠️ ¿ESTÁS SEGURO DE EJECUTAR UN RESET TOTAL?\n\nEsta acción:\n- EXPULSARÁ a TODAS las tablets conectadas a la pantalla inicial de PIN.\n- BORRARÁ las sesiones de los participantes y nóminas.\n- REINICIARÁ el campeonato y los 10 monoplazas al 0% (foja cero).\n- Limpiará todas las alertas de carrera.');
    if (!confirmed) return;

    const secondCheck = confirm('Última confirmación: ¿Proceder con el HARD RESET TOTAL?');
    if (!secondCheck) return;

    setIsLoading(true);
    await cloudActions.hardReset();
    setIsLoading(false);
    setNotification('🔥 RESET TOTAL COMPLETADO: Todos los dispositivos expulsados y campeonato en foja cero.');
    setTimeout(() => setNotification(''), 5000);
  };

  const handleSaveCase = (caseData, existingId) => {
    if (existingId) {
      setCases(prev => prev.map(c => c.id === existingId ? { ...caseData, id: existingId } : c));
    } else {
      setCases(prev => [...prev, { ...caseData, id: `case-${Date.now()}` }]);
    }
    setNotification('✅ Caso guardado en el catálogo.');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDeleteCase = (caseId) => {
    setCases(prev => prev.filter(c => c.id !== caseId));
    setNotification('🗑️ Caso eliminado.');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="min-h-screen bg-carbon text-slate-100 p-4 md:p-8 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-f1-card p-6 rounded-2xl border border-f1-border shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-f1-yellow rounded-xl flex items-center justify-center text-black shadow-lg shadow-f1-yellow/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">
                  Dirección de Carrera <span className="text-f1-yellow">F1 Pits</span>
                </h1>
                {isCloudFirebase && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> FIREBASE CLOUD
                  </span>
                )}
                {isRedFlagActive && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
                    🚨 BANDERA ROJA ACTIVA
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400">
                SISTEMA PROGRESIVO DE 10 SECTORES • ERP NETSUITE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-f1-dark p-1 rounded-xl border border-f1-border">
            <button
              onClick={() => setActiveTab('race')}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                activeTab === 'race' ? 'bg-f1-yellow text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Consola de Carrera
            </button>
            <button
              onClick={() => setActiveTab('crud')}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                activeTab === 'crud' ? 'bg-f1-yellow text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gestión de Casos (CRUD)
            </button>
          </div>
        </header>

        {/* Notificación */}
        {notification && (
          <div className="p-4 bg-f1-cyan/15 border border-f1-cyan/40 rounded-xl text-f1-cyan text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {activeTab === 'race' && (
          <div className="space-y-6">
            {/* 1. Panel de Control de Carrera */}
            <div className="bg-f1-card p-6 rounded-2xl border border-f1-border space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-f1-border">
                <div className="flex items-center gap-4">
                  <div className="px-3.5 py-1.5 rounded-xl bg-f1-dark border border-f1-border font-mono text-xs">
                    <span className="text-slate-400 block text-[10px]">TRAMO ACTUAL:</span>
                    <span className="text-f1-yellow font-black text-sm">SECTOR {currentSector} / {totalSectors}</span>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl bg-f1-dark border border-f1-border font-mono text-xs">
                    <span className="text-slate-400 block text-[10px]">ESTADO:</span>
                    <span className="text-f1-cyan font-black text-sm">{currentStatus}</span>
                  </div>
                </div>

                <div className="w-full sm:w-80">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    CASO ERP ASOCIADO A ESTE SECTOR:
                  </label>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    disabled={currentStatus === 'ACTIVE_CASE'}
                    className="w-full bg-f1-dark border border-f1-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-f1-yellow focus:outline-none"
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.timeLimitSeconds}s)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 1: Botones de Operación de Carrera */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  1. OPERACIÓN DE RONDA (FLUJO PRINCIPAL):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Iniciar Caso con Video 1 */}
                  <button
                    type="button"
                    onClick={handleStartCase}
                    disabled={isLoading || currentStatus === 'ACTIVE_CASE'}
                    className={`p-4 rounded-xl font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1.5 transition-all shadow-lg ${
                      currentStatus === 'ACTIVE_CASE'
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-f1-green to-emerald-600 hover:from-emerald-500 text-black shadow-f1-green/20 active:scale-95'
                    }`}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>1. INICIAR RONDA</span>
                    <span className="text-[9px] opacity-85 font-normal">Video 1 Arranque & Habilita tablets</span>
                  </button>

                  {/* 2. Finalizar Automáticamente con Video 2 */}
                  <button
                    type="button"
                    onClick={handleAutoFinishCase}
                    disabled={isLoading}
                    className="p-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 border border-cyan-400/40"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    <span>2. FINALIZAR RONDA</span>
                    <span className="text-[9px] opacity-90 font-normal">Video 2 Batalla + 2s + Avance</span>
                  </button>

                  {/* 3. Siguiente Sector */}
                  <button
                    type="button"
                    onClick={handleNextSector}
                    disabled={isLoading}
                    className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-f1-border font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <FastForward className="w-5 h-5 text-f1-yellow" />
                    <span>3. SIGUIENTE SECTOR</span>
                    <span className="text-[9px] opacity-60 font-normal">Conserva kilometraje acumulado</span>
                  </button>

                  {/* 4. Simulación 10 Escuderías */}
                  <button
                    type="button"
                    onClick={handleSimulate10Teams}
                    disabled={isLoading}
                    className="p-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 text-white font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-600/25 active:scale-95 border border-purple-400/30"
                  >
                    <Users className="w-5 h-5 fill-current" />
                    <span>🏎️ SIMULAR 10 EQUIPOS</span>
                    <span className="text-[9px] opacity-85 font-normal">Demo instantánea de carrera</span>
                  </button>
                </div>
              </div>

              {/* Fila 2: Controles Tácticos de Dirección de Carrera */}
              <div className="pt-2 border-t border-f1-border/40">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  2. CONTROLES TÁCTICOS EN VIVO:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {/* Ruleta de Pilotos */}
                  <button
                    type="button"
                    onClick={() => setShowRoulette(true)}
                    className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <span className="text-base">🎡</span>
                    <span>Ruleta Pilotos</span>
                  </button>

                  {/* Virtual Safety Car Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleVSC}
                    disabled={isLoading}
                    className={`p-3 rounded-xl font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border ${
                      isVSCActive
                        ? 'bg-amber-500 text-black border-amber-300 animate-pulse shadow-amber-500/40'
                        : 'bg-slate-800 text-amber-300 border-amber-500/30 hover:bg-amber-500/10'
                    }`}
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>{isVSCActive ? 'Desactivar VSC' : 'Safety Car'}</span>
                  </button>

                  {/* Bandera Roja Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleRedFlag}
                    className={`p-3 rounded-xl font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border ${
                      isRedFlagActive
                        ? 'bg-red-600 text-white border-red-300 animate-pulse'
                        : 'bg-slate-800 text-red-400 border-red-500/30 hover:bg-red-500/10'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isRedFlagActive ? 'Reanudar Carrera' : 'Bandera Roja'}</span>
                  </button>

                  {/* Prórroga +30s */}
                  <button
                    type="button"
                    onClick={handleExtendTimer}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <Clock className="w-4 h-4" />
                    <span>+30s Prórroga</span>
                  </button>

                  {/* Modo Lluvia */}
                  <button
                    type="button"
                    onClick={handleToggleWetRace}
                    className={`p-3 rounded-xl font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border ${
                      isWetRaceActive
                        ? 'bg-cyan-500 text-black border-cyan-300 animate-pulse'
                        : 'bg-slate-800 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10'
                    }`}
                  >
                    <CloudRain className="w-4 h-4" />
                    <span>{isWetRaceActive ? 'Pista Seca' : 'Modo Lluvia'}</span>
                  </button>

                  {/* Debrief NetSuite */}
                  <button
                    type="button"
                    onClick={() => setShowDebrief(true)}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-f1-cyan border border-f1-cyan/40 font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Debrief Pits</span>
                  </button>
                </div>
              </div>

              {/* Fila 3: Convocatoria a Escenario & Comunicado de Radio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-f1-border/40">
                {/* Convocatoria al Escenario */}
                <div className="bg-f1-dark/80 p-4 rounded-xl border border-f1-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-f1-yellow font-bold uppercase flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Convocatoria al Escenario (En Vivo)</span>
                    </span>
                    {gameState?.stageSummon?.active && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold animate-pulse">
                        LLAMADO ACTIVO: #{gameState.stageSummon.teamId}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={summonTeamId}
                      onChange={(e) => setSummonTeamId(e.target.value)}
                      className="bg-f1-card border border-f1-border rounded-xl px-3 py-2 text-xs font-mono text-white flex-1 focus:outline-none"
                    >
                      {OFFICIAL_TEAMS.map(t => {
                        const prof = teamsProfiles[t.id] || {};
                        const sub = prof.subname ? ` ("${prof.subname}")` : '';
                        const partsCount = (prof.participants || []).length;
                        return (
                          <option key={t.id} value={t.id}>
                            #{t.id} {t.name}{sub} {partsCount > 0 ? `• ${partsCount} pilotos` : ''}
                          </option>
                        );
                      })}
                    </select>

                    <button
                      type="button"
                      onClick={handleTriggerSummon}
                      className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase transition-all flex items-center gap-1 shadow-md shadow-red-600/30"
                    >
                      <span>Llamar</span>
                    </button>

                    {gameState?.stageSummon?.active && (
                      <button
                        type="button"
                        onClick={handleCancelSummon}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs uppercase"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                {/* Comunicado de Radio */}
                <form onSubmit={handleSendRadio} className="bg-f1-dark/80 p-4 rounded-xl border border-f1-border space-y-3">
                  <span className="text-xs font-mono text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                    <Radio className="w-4 h-4" />
                    <span>Comunicado de Radio Pits a las Tablets</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={radioText}
                      onChange={(e) => setRadioText(e.target.value)}
                      placeholder="Ej: Atención con el 3-way matching en el Paso 3..."
                      className="bg-f1-card border border-f1-border rounded-xl px-3 py-2 text-xs font-mono text-white flex-1 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      disabled={!radioText.trim()}
                      className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono font-bold text-xs uppercase flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmitir</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Fila 4: Zona de Peligro / Foja Cero */}
              <div className="pt-4 border-t border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-red-950/20 p-4 rounded-xl border border-red-900/40">
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-mono font-black text-red-400 uppercase block">
                      ZONA DE REINICIO TOTAL • FOJA CERO
                    </span>
                    <span className="text-[11px] text-slate-400 font-sans">
                      Expulsa a todos los dispositivos, borra sesiones de tablets y vuelve los autos a la largada (0%).
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleHardReset}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase transition-all shadow-lg shadow-red-600/30 active:scale-95 flex items-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  <span>RESET TOTAL (FOJA CERO)</span>
                </button>
              </div>
            </div>

            {/* Monitor de Telemetría con Nómina de Integrantes */}
            <LiveTelemetry
              connectedTeams={adminState?.connectedTeams || {}}
              submissions={adminState?.submissions || {}}
              teamsList={OFFICIAL_TEAMS.map(t => ({
                id: t.id,
                name: t.name,
                shortName: t.shortName,
                color: t.color,
                subname: teamsProfiles[t.id]?.subname || '',
                participants: teamsProfiles[t.id]?.participants || []
              }))}
            />
          </div>
        )}

        {activeTab === 'crud' && (
          <CaseEditor
            cases={cases}
            onSaveCase={handleSaveCase}
            onDeleteCase={handleDeleteCase}
          />
        )}
      </div>

      {/* Modal de Debrief NetSuite */}
      {showDebrief && (
        <DebriefModal
          caseData={selectedCase}
          results={gameState?.calculatedResults}
          onClose={() => setShowDebrief(false)}
        />
      )}

      {/* Modal de Ruleta de Pilotos */}
      {showRoulette && (
        <RouletteModal
          teamsProfiles={teamsProfiles}
          onClose={() => setShowRoulette(false)}
        />
      )}

      <footer className="mt-8 text-center text-xs font-mono text-slate-500">
        VELTIS F1 TELEMETRY SYSTEM • DIRECCIÓN DE CARRERA BACKOFFICE
      </footer>
    </div>
  );
}
