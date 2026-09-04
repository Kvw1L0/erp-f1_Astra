'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import LiveTelemetry from '../../components/admin/LiveTelemetry';
import CaseEditor from '../../components/admin/CaseEditor';
import { Flag, Play, Lock, Eye, RotateCcw, ShieldCheck, Trophy, Sparkles, FastForward, Zap, Compass, Flame } from 'lucide-react';

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    // Intentar cargar casos desde API REST local si está disponible
    fetch(`${API_URL}/cases`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setCases(data.data);
          setSelectedCaseId(data.data[0].id);
        }
      })
      .catch(() => {
        // Usar casos por defecto
      });
  }, [API_URL]);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('join_admin');
      socket.on('admin_state_sync', setAdminState);
      socket.on('admin_telemetry_update', setAdminState);

      return () => {
        socket.off('admin_state_sync');
        socket.off('admin_telemetry_update');
      };
    }
  }, [socket, isConnected]);

  const currentSector = gameState?.currentSectorIndex || 1;
  const totalSectors = gameState?.totalSectors || 10;
  const currentStatus = gameState?.status || 'LOBBY';

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

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
      setNotification('⚡ Caso finalizado automáticamente con telemetría y animación en la nube.');
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

  const handleResetChampionship = async () => {
    if (confirm('¿Deseas reiniciar TODOS los sectores y volver los autos a la línea de largada (0%)?')) {
      const res = await cloudActions.resetChampionship();
      if (res?.success) {
        setNotification('🏆 Campeonato reiniciado a la largada (0%).');
        setTimeout(() => setNotification(''), 3000);
      }
    }
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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">
                  Dirección de Carrera <span className="text-f1-yellow">F1 Pits</span>
                </h1>
                {isCloudFirebase && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> FIREBASE CLOUD
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
            {/* Controles de Carrera */}
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

              {/* Botones de Control */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Iniciar Caso */}
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
                  <span>1. INICIAR CASO</span>
                  <span className="text-[9px] opacity-75 font-normal">Habilita tablets</span>
                </button>

                {/* 2. Finalizar Automáticamente */}
                <button
                  type="button"
                  onClick={handleAutoFinishCase}
                  disabled={isLoading}
                  className="p-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 border border-cyan-400/40"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span>⚡ FINALIZAR AUTO</span>
                  <span className="text-[9px] opacity-90 font-normal">Simula y revela en 1 clic</span>
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
                  <span className="text-[9px] opacity-60 font-normal">Conserva kilometraje</span>
                </button>

                {/* 4. Reiniciar Campeonato */}
                <button
                  type="button"
                  onClick={handleResetChampionship}
                  disabled={isLoading}
                  className="p-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 font-mono font-bold text-xs uppercase flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Trophy className="w-5 h-5 text-red-400" />
                  <span>4. REINICIAR (0%)</span>
                  <span className="text-[9px] opacity-60 font-normal">Vuelve a la largada</span>
                </button>
              </div>

              <div className="pt-4 border-t border-f1-border/60 flex flex-wrap justify-between items-center gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-f1-cyan" />
                  <span>10 SECTORES • 10% BASE POR TRAMO • +12% CON POLE POSITION BOOST</span>
                </div>
                <div>
                  ⚡ Sincronización en tiempo real activa
                </div>
              </div>
            </div>

            {/* Monitor de Telemetría */}
            <LiveTelemetry
              connectedTeams={adminState?.connectedTeams || {}}
              submissions={adminState?.submissions || {}}
              teamsList={Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Escudería ${i + 1}`, shortName: `EQ 0${i + 1}`, color: '#E10600' }))}
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

      <footer className="mt-8 text-center text-xs font-mono text-slate-500">
        VELTIS F1 TELEMETRY SYSTEM • DIRECCIÓN DE CARRERA BACKOFFICE
      </footer>
    </div>
  );
}
