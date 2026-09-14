'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import LiveTelemetry from '../../components/admin/LiveTelemetry';
import CaseEditor from '../../components/admin/CaseEditor';
import DebriefModal from '../../components/race/DebriefModal';
import RouletteModal from '../../components/admin/RouletteModal';
import QrConnectModal from '../../components/common/QrConnectModal';
import { exportTrainingReportCsv } from '../../lib/reportExporter';
import {
  Flag, Play, Lock, Eye, RotateCcw, ShieldCheck, Trophy, Sparkles,
  FastForward, Zap, Compass, Flame, AlertOctagon, Users, BarChart3,
  Radio, Clock, AlertTriangle, CloudRain, ShieldAlert, CheckCircle2,
  Volume2, ArrowRightLeft, Send, Trash2, QrCode, FileSpreadsheet
} from 'lucide-react';
import { OFFICIAL_TEAMS } from '../../components/participant/PinLogin';

const DEFAULT_CASES = [
  {
    id: "case-01",
    sector: 1,
    title: "Gran Premio de Facturación y Cierre Contable Express",
    description: "El equipo de Finanzas entra a Pits durante el cierre mensual. Los pedidos aprobados deben convertirse en facturas y conciliarse en NetSuite.",
    timeLimitSeconds: 60,
    battleVideoUrl: "/videos/sector-01-battle.mp4",
    battleTitle: "Curva 1: Frenada Extrema a 340 km/h y Adelantamiento por el Vértice Interior",
    battleDescription: "Cámaras on-board a ras de asfalto: las escuderías con cierre contable impecable ganan tracción en la primera curva.",
    steps: [
      {
        id: "c1-step-1",
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
        id: "c1-step-2",
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
        id: "c1-step-3",
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
        id: "c1-step-4",
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
        id: "c1-step-5",
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
    sector: 2,
    title: "Sprint de Compras y Aprobación de Órdenes de Compra",
    description: "Adquisición urgente de suministros para la siguiente parada de pits. Flujo de aprobación multicriterio en NetSuite.",
    timeLimitSeconds: 50,
    battleVideoUrl: "/videos/sector-02-battle.mp4",
    battleTitle: "Chicane de Alta Velocidad: Duelo Rueda a Rueda al Milímetro",
    battleDescription: "Telemetría lateral de cascos: sobrepaso milimétrico en la frenada sin bloqueo de neumáticos.",
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
  },
  {
    id: "case-03",
    sector: 3,
    title: "Cadena de Suministro Pits y Logística Just-In-Time",
    description: "Reabastecimiento urgente de compuestos de neumáticos y alerones de recambio entre la fábrica central y el box del circuito.",
    timeLimitSeconds: 60,
    battleVideoUrl: "/videos/sector-03-battle.mp4",
    battleTitle: "Eau Rouge & Raidillon: Subida a Fondo a 315 km/h Sin Levantar",
    battleDescription: "Cámara de halo en compresión brutal: stock sincronizado permite aceleración máxima en la recta Kemmel.",
    steps: [
      {
        id: "c3-step-1",
        stepNumber: 1,
        title: "Transferencia de Repuestos Multialmacén",
        description: "¿Cómo mover 20 juegos de neumáticos blandos desde el centro de distribución a los Pits?",
        options: [
          { id: "c3-1a", text: "Crear una 'Transfer Order' con etapas de Item Fulfillment (despacho) e Item Receipt (recepción).", points: 100, feedback: "¡Trazabilidad Total! Mantiene el inventario en tránsito valorizado." },
          { id: "c3-1b", text: "Hacer un Inventory Adjustment directo restando en central y sumando en Pits.", points: 10, feedback: "Mala práctica: Distorsiona costos y pierde el rastreo de transporte." },
          { id: "c3-1c", text: "Usar un Inventory Transfer simple de un solo paso sin confirmación de recepción.", points: 50, feedback: "Válido solo si ambos depósitos están en el mismo recinto físico." }
        ]
      },
      {
        id: "c3-step-2",
        stepNumber: 2,
        title: "Trazabilidad de Compuestos por Lote y Serie",
        description: "La FIA exige certificar la fecha de vulcanizado de cada neumático. ¿Cómo registrarlo?",
        options: [
          { id: "c3-2a", text: "Configurar el artículo como 'Lot Numbered Inventory Item' con asignación estricta FEFO.", points: 100, feedback: "¡Cumplimiento Reglamentario! Control por lote y caducidad milimétrica." },
          { id: "c3-2b", text: "Anotar el número de lote en el campo de notas generales de la orden.", points: 10, feedback: "No permite búsquedas ni auditorías automatizadas." },
          { id: "c3-2c", text: "Crear un código de artículo nuevo para cada lote recibido.", points: 50, feedback: "Sobrecarga inútil del catálogo maestro de artículos." }
        ]
      },
      {
        id: "c3-step-3",
        stepNumber: 3,
        title: "Conteo Cíclico en Bodega Pits (Cycle Counting)",
        description: "¿Cómo garantizar la exactitud del stock sin paralizar las operaciones de carrera?",
        options: [
          { id: "c3-3a", text: "Configurar planes de 'Cycle Counting' clasificados por valor ABC en NetSuite WMS.", points: 100, feedback: "¡Eficiencia Continua! Cuenta artículos críticos con alta frecuencia." },
          { id: "c3-3b", text: "Detener la preparación del auto durante 4 horas para hacer inventario general.", points: 10, feedback: "Pérdida crítica de tiempo en pista." },
          { id: "c3-3c", text: "Contar visualmente las estanterías solo cuando un mecánico avisa que falta una pieza.", points: 10, feedback: "Gestión reactiva de alto riesgo de paro en boxes." }
        ]
      },
      {
        id: "c3-step-4",
        stepNumber: 4,
        title: "Picking y Preparación Guiada en Pits",
        description: "Se necesita ensamblar un nuevo kit aerodinámico en menos de 5 minutos.",
        options: [
          { id: "c3-4a", text: "Utilizar Wave Picking con rutas optimizadas por ubicaciones de tolva (Bins) en NetSuite WMS.", points: 100, feedback: "¡Parada Récord! Rápido recorrido guiado por radiofrecuencia." },
          { id: "c3-4b", text: "Imprimir la orden en papel y repartirla entre varios mecánicos para buscar.", points: 50, feedback: "Riesgo de colisiones y duplicación de piezas recogidas." },
          { id: "c3-4c", text: "Dejar las piezas dispersas en el suelo del garaje para tomarlas a mano.", points: 10, feedback: "Riesgo de daño en componentes de fibra de carbono." }
        ]
      },
      {
        id: "c3-step-5",
        stepNumber: 5,
        title: "Rotación y Prevención de Obsolescencia",
        description: "Finaliza la temporada europea. ¿Cómo identificar piezas que no volverán a usarse?",
        options: [
          { id: "c3-5a", text: "Generar el informe de 'Inventory Turnover & Aging' filtrado por fecha de última actividad.", points: 100, feedback: "¡Estrategia Financiera! Permite provisionar o liquidar a tiempo." },
          { id: "c3-5b", text: "Esperar a la auditoría anual de fin de año para revisar qué quedó acumulado.", points: 10, feedback: "Costos ocultos de almacenaje y capital inmovilizado." },
          { id: "c3-5c", text: "Descartar aleatoriamente las piezas que ocupan más volumen en la bodega.", points: 10, feedback: "Pérdida de activos sin sustento contable." }
        ]
      }
    ]
  },
  {
    id: "case-04",
    sector: 4,
    title: "Estrategia de Precios, Márgenes y Cotizaciones Multimoneda",
    description: "Negociación de contratos de patrocinio y venta de telemetría a escuderías cliente en euros, dólares y libras.",
    timeLimitSeconds: 60,
    battleVideoUrl: "/videos/sector-04-battle.mp4",
    battleTitle: "Tren de DRS en Recta Principal: Doble Rebase a 355 km/h",
    battleDescription: "Alerón trasero abierto y succión aerodinámica brutal en plena recta de meta.",
    steps: [
      {
        id: "c4-step-1",
        stepNumber: 1,
        title: "Estructuración de Listas de Precios",
        description: "¿Cómo configurar precios diferenciados para Escuderías Premium vs Clientes Estándar?",
        options: [
          { id: "c4-1a", text: "Definir múltiples 'Price Levels' y matrices de descuento por volumen asignadas al registro del cliente.", points: 100, feedback: "¡Precios Dinámicos! Automatiza tarifas sin error humano." },
          { id: "c4-1b", text: "Crear un artículo duplicado con distinto precio para cada cliente.", points: 10, feedback: "Multiplica el catálogo de artículos innecesariamente." },
          { id: "c4-1c", text: "Permitir que el vendedor digite libremente el precio unitario en cada cotización.", points: 50, feedback: "Peligroso: No protege los márgenes mínimos de ganancia." }
        ]
      },
      {
        id: "c4-step-2",
        stepNumber: 2,
        title: "Protección de Margen Mínimo Bruto",
        description: "Se ingresa un descuento agresivo. ¿Cómo evitar ventas bajo el costo de fabricación?",
        options: [
          { id: "c4-2a", text: "Implementar regla de SuiteScript / Workflow que bloquee transacciones con margen bruto inferior al 25%.", points: 100, feedback: "¡Control Blindado! Requiere aprobación del Director Financiero." },
          { id: "c4-2b", text: "Revisar los márgenes al final de mes en el estado de resultados consolidado.", points: 10, feedback: "Acción tardía: El dinero ya se perdió." },
          { id: "c4-2c", text: "Prohibir todo tipo de descuentos sin importar el volumen de compra.", points: 50, feedback: "Rígido: Puede hacer perder contratos millonarios." }
        ]
      },
      {
        id: "c4-step-3",
        stepNumber: 3,
        title: "Cotizaciones Multimoneda con Tipo de Cambio",
        description: "El contrato se cotiza en Euros pero el costo del motor se paga en Libras Esterlinas.",
        options: [
          { id: "c4-3a", text: "Activar Multi-Currency con actualización automática de Currency Exchange Rates provista por NetSuite.", points: 100, feedback: "¡Cobertura Cambiaria! Conversión transparente en tiempo real." },
          { id: "c4-3b", text: "Calcular la conversión con una calculadora y tipear el monto final en dólares.", points: 10, feedback: "Riesgo extremo de descalce cambiario." },
          { id: "c4-3c", text: "Fijar una tasa de cambio manual estática que no se actualiza durante el año.", points: 50, feedback: "Vulnerable a devaluaciones bruscas de mercado." }
        ]
      },
      {
        id: "c4-step-4",
        stepNumber: 4,
        title: "Workflow de Aprobación Comercial",
        description: "¿Cómo agilizar la aprobación de cotizaciones mayores a $500,000 USD?",
        options: [
          { id: "c4-4a", text: "SuiteFlow jerárquico con notificación push a la app móvil de los directores para aprobación en 1 toque.", points: 100, feedback: "¡Velocidad de Pits! Cierra negocios en minutos desde el paddock." },
          { id: "c4-4b", text: "Esperar a la reunión semanal de directorio para revisar propuestas impresas.", points: 10, feedback: "Pérdida de la oportunidad comercial frente a competidores." },
          { id: "c4-4c", text: "Aprobar por mensaje informal de WhatsApp sin dejar registro en el ERP.", points: 10, feedback: "Cero validez legal y de auditoría interna." }
        ]
      },
      {
        id: "c4-step-5",
        stepNumber: 5,
        title: "Conversión de Cotización a Pedido Firme",
        description: "El patrocinador acepta la propuesta. ¿Cuál es el siguiente paso?",
        options: [
          { id: "c4-5a", text: "Hacer clic en 'Generate Sales Order' desde la Estimate para heredar líneas, precios y términos de pago.", points: 100, feedback: "¡Flujo Continuo! Preserva la trazabilidad completa del ciclo Lead-to-Order." },
          { id: "c4-5b", text: "Crear una Sales Order desde cero reescribiendo todos los datos.", points: 50, feedback: "Trabajo duplicado propenso a equivocaciones de digitación." },
          { id: "c4-5c", text: "Facturar directamente sin generar una orden de venta previa.", points: 10, feedback: "Impide validar entregas parciales y reservas de stock." }
        ]
      }
    ]
  },
  {
    id: "case-05",
    sector: 5,
    title: "Tesorería Avanzada, Flujo de Caja y Diferencias de Cambio",
    description: "Administración de liquidez, pagos internacionales a proveedores de motores y control de volatilidad de divisas.",
    timeLimitSeconds: 60,
    battleVideoUrl: "/videos/sector-05-battle.mp4",
    battleTitle: "Horquilla de 180°: Frenada Tardía y Tijera Perfecta (Switchback)",
    battleDescription: "Frenada al límite en la horquilla: cruce de trazada y tracción inmediata en la salida.",
    steps: [
      {
        id: "c5-step-1",
        stepNumber: 1,
        title: "Previsión de Flujo de Caja (Cash Flow)",
        description: "¿Cómo proyectar la disponibilidad de fondos para los próximos 3 Grandes Premios?",
        options: [
          { id: "c5-1a", text: "Utilizar el informe nativo de 'Cash Position & Cash Flow Forecast' integrando AP, AR y órdenes abiertas.", points: 100, feedback: "¡Visión Panorámica! Proyecta saldo bancario futuro con datos reales." },
          { id: "c5-1b", text: "Revisar el saldo actual en la página web del banco cada mañana.", points: 10, feedback: "Foto estática del pasado: no contempla pagos ni cobros comprometidos." },
          { id: "c5-1c", text: "Calcular una media histórica en una hoja de cálculo paralela.", points: 50, feedback: "Aproximado pero propenso a desactualización." }
        ]
      },
      {
        id: "c5-step-2",
        stepNumber: 2,
        title: "Pagos Masivos a Proveedores Internacionales",
        description: "Se deben liquidar 45 facturas a constructores de chasis en Alemania y Reino Unido.",
        options: [
          { id: "c5-2a", text: "Generar lotes de pago con 'Electronic Bank Payments' (EBP) exportando archivos bancarios SEPA/BACS.", points: 100, feedback: "¡Automatización Bancaria! Conciliación automática y cero digitación bancaria." },
          { id: "c5-2b", text: "Ingresar transferencia por transferencia en el portal bancario individualmente.", points: 10, feedback: "Lento, costoso y con alto riesgo de error en códigos IBAN." },
          { id: "c5-2c", text: "Pagar con tarjeta de crédito corporativa acumulando intereses.", points: 50, feedback: "Costos financieros excesivos e innecesarios." }
        ]
      },
      {
        id: "c5-step-3",
        stepNumber: 3,
        title: "Revaluación de Moneda Extranjera FX",
        description: "El dólar se apreció 8% respecto al cierre anterior. ¿Cómo reflejar el impacto en los balances?",
        options: [
          { id: "c5-3a", text: "Ejecutar la tarea automática de 'Revalue Open Currency Balances' al cierre del periodo.", points: 100, feedback: "¡NIIF / GAAP Compliant! Genera asientos automáticos de ganancia/pérdida no realizada." },
          { id: "c5-3b", text: "Crear un asiento manual ajustando las cuentas a criterio del contador.", points: 10, feedback: "Rompe los balances de subdiarios y auditorías externas." },
          { id: "c5-3c", text: "Ignorar la fluctuación hasta que las facturas sean efectivamente cobradas.", points: 10, feedback: "Incumple el principio contable de devengo." }
        ]
      },
      {
        id: "c5-step-4",
        stepNumber: 4,
        title: "Fondos de Caja Chica en Circuito (Petty Cash)",
        description: "Gastos menores imprevistos durante el fin de semana de carrera (herramientas, viáticos).",
        options: [
          { id: "c5-4a", text: "Registrar cuentas de Petty Cash asignadas a custodios responsables con rendición de gastos 'Expense Reports'.", points: 100, feedback: "¡Rendición en Pista! Adjunta boletas desde el smartphone al instante." },
          { id: "c5-4b", text: "Entregar efectivo en sobres sin exigir comprobantes de respaldo.", points: 10, feedback: "Desvío de fondos y gastos no deducibles tributariamente." },
          { id: "c5-4c", text: "Reembolsar todo contra liquidación de sueldos tres meses después.", points: 50, feedback: "Genera descontento y desorden administrativo en el equipo técnico." }
        ]
      },
      {
        id: "c5-step-5",
        stepNumber: 5,
        title: "Conciliación de Cuentas Puente y Bancos",
        description: "El extracto bancario muestra 1,200 movimientos del mes de patrocinio y premios de carrera.",
        options: [
          { id: "c5-5a", text: "Aplicar reglas de coincidencia automática en 'Match Bank Data' por fecha, referencia y monto.", points: 100, feedback: "¡Vuelta Rápida! Concilia más del 95% de transacciones en segundos." },
          { id: "c5-5b", text: "Tildar los movimientos uno por uno con lápiz en el extracto físico en papel.", points: 10, feedback: "Pit stop interminable: toma días y genera retrasos contables." },
          { id: "c5-5c", text: "Forzar la conciliación ajustando una diferencia global como gasto diverso.", points: 10, feedback: "Infracción grave de compliance tributario." }
        ]
      }
    ]
  },
  {
    id: "case-06",
    sector: 6,
    title: "Manufactura y Ensamble de Monoplaza (Work Orders & BOM)",
    description: "Construcción del alerón delantero de fibra de carbono. Gestión de listas de materiales, rutas de ensamble y costeo real.",
    timeLimitSeconds: 60,
    battleVideoUrl: "/videos/sector-06-battle.mp4",
    battleTitle: "Curva Peraltada Extrema: Adelantamiento por Arriba Rozando el Muro",
    battleDescription: "Giro con 70° de inclinación: chispas de titanio del fondo plano iluminando la pista.",
    steps: [
      {
        id: "c6-step-1",
        stepNumber: 1,
        title: "Definición de Lista de Materiales (BOM)",
        description: "El alerón requiere resina epóxica, fibra de carbono preimpregnada y soportes de titanio.",
        options: [
          { id: "c6-1a", text: "Crear un 'Assembly Item' con Bill of Materials (BOM) multinivel y revisión de ingeniería activa.", points: 100, feedback: "¡Ingeniería de Precisión! Permite costeo detallado y control de versiones." },
          { id: "c6-1b", text: "Crear un artículo de inventario simple e ir sumando costos manualmente.", points: 10, feedback: "Inviable: No descuenta componentes consumidos de bodega." },
          { id: "c6-1c", text: "Usar un 'Kit Item' sin control de proceso de manufactura.", points: 50, feedback: "Insuficiente: Un Kit solo agrupa para la venta, no manufactura." }
        ]
      },
      {
        id: "c6-step-2",
        stepNumber: 2,
        title: "Planificación de Órdenes de Trabajo (Work Orders)",
        description: "¿Cómo lanzar la producción del paquete aerodinámico a tiempo para la calificación?",
        options: [
          { id: "c6-2a", text: "Generar 'Work Order' con reserva automática de componentes y fecha de terminación comprometida.", points: 100, feedback: "¡Lanzamiento Óptimo! Reserva stock y asigna carga a los puestos de trabajo." },
          { id: "c6-2b", text: "Avisar verbalmente al jefe de taller para que empiece a armar las piezas.", points: 10, feedback: "Sin trazabilidad, sin reserva de materiales y con riesgo de quiebre." },
          { id: "c6-2c", text: "Crear una orden de compra hacia un proveedor externo para que lo ensamble.", points: 50, feedback: "Solución de subcontratación válida pero más costosa y lenta." }
        ]
      },
      {
        id: "c6-step-3",
        stepNumber: 3,
        title: "Consumo de Componentes (Backflushing)",
        description: "Se finalizaron 3 alerones. ¿Cómo rebajar los materiales del inventario?",
        options: [
          { id: "c6-3a", text: "Registrar 'Work Order Completion' con Backflush para descontar insumos según la BOM estándar.", points: 100, feedback: "¡Parada Eficiente! Descuenta insumos e ingresa el producto terminado al instante." },
          { id: "c6-3b", text: "Hacer un ajuste manual de inventario negativo para cada tornillo y metro de fibra.", points: 50, feedback: "Lento y propenso a discrepancias de cálculo." },
          { id: "c6-3c", text: "No rebajar los materiales hasta el inventario físico anual.", points: 10, feedback: "Distorsiona el costo de ventas y el valor real de existencias." }
        ]
      },
      {
        id: "c6-step-4",
        stepNumber: 4,
        title: "Control de Merma y Desecho (Scrap)",
        description: "Durante el curado en autoclave, se dañó una pieza de resina por exceso de calor.",
        options: [
          { id: "c6-4a", text: "Ingresar la cantidad defectuosa como 'Scrap' con código de motivo para imputarlo a costos de merma.", points: 100, feedback: "¡Calidad Total! Permite análisis Six Sigma y no enmascara defectos." },
          { id: "c6-4b", text: "Tirar la pieza dañada a la basura sin dejar ningún registro en el ERP.", points: 10, feedback: "Diferencia de inventario fantasma y falta de control de calidad." },
          { id: "c6-4c", text: "Sumar el costo del desecho al precio final del cliente sin avisar.", points: 10, feedback: "Resta competitividad comercial." }
        ]
      },
      {
        id: "c6-step-5",
        stepNumber: 5,
        title: "Análisis de Variaciones de Costo (Variance Analysis)",
        description: "El costo real superó en 15% el estándar. ¿Dónde encontrar la desviación?",
        options: [
          { id: "c6-5a", text: "Analizar el reporte de 'Production Cost Variances' desagregando variaciones de precio de material y tiempo de mano de obra.", points: 100, feedback: "¡Telemetría Financiera! Identifica con exactitud el cuello de botella productivo." },
          { id: "c6-5b", text: "Asumir que todo fue culpa del aumento de salarios sin verificar datos.", points: 10, feedback: "Diagnóstico a ciegas sin rigor analítico." },
          { id: "c6-5c", text: "Modificar el costo estándar retroactivamente para ocultar la variación.", points: 10, feedback: "Práctica fraudulenta que vulnera principios contables." }
        ]
      }
    ]
  },
  {
    id: "case-07",
    sector: 7,
    title: "CRM Pits, Casos de Soporte y Acuerdos de Nivel SLA",
    description: "Atención técnica a escuderías asociadas y resolución de incidencias en telemetría satelital durante las pruebas libres.",
    timeLimitSeconds: 60,
    battleVideoUrl: "/videos/sector-07-battle.mp4",
    battleTitle: "Batalla Bajo Lluvia Intensa: Spray de Agua y Adelantamiento a Ciegas",
    battleDescription: "Visibilidad cero por el spray de agua: adelantamiento milagroso guiado por telemetría pura.",
    steps: [
      {
        id: "c7-step-1",
        stepNumber: 1,
        title: "Captura y Enrutamiento de Incidencias",
        description: "Un cliente reporta desconexión de telemetría a 10 minutos de la Q3. ¿Cómo registrar el caso?",
        options: [
          { id: "c7-1a", text: "Crear un Support Case con captura omnicanal (correo/portal) y enrutamiento automático a la cola de Pits.", points: 100, feedback: "¡Respuesta Inmediata! Asigna al ingeniero disponible con mayor especialización." },
          { id: "c7-1b", text: "Anotar el problema en un bloc de notas y buscar a un técnico por el paddock.", points: 10, feedback: "Riesgo de descarte de la incidencia crítica." },
          { id: "c7-1c", text: "Pedirle al cliente que vuelva a llamar después de que termine la sesión de pista.", points: 10, feedback: "Incumplimiento grave de SLA con pérdida de clientes clave." }
        ]
      },
      {
        id: "c7-step-2",
        stepNumber: 2,
        title: "Escalamiento Automático por SLA Crítico",
        description: "La falla es Severidad 1 (Auto detenido). El tiempo de respuesta comprometido es de 15 minutos.",
        options: [
          { id: "c7-2a", text: "SuiteFlow de escalamiento por tiempo que notifica al Ingeniero Jefe si no hay avance en 5 minutos.", points: 100, feedback: "¡Bandera Verde! Asegura cumplimiento contractual de SLA al 100%." },
          { id: "c7-2b", text: "Poner una alarma en el teléfono del analista de soporte.", points: 50, feedback: "Depende de la memoria humana y no escala en equipo." },
          { id: "c7-2c", text: "Rebajar la severidad del caso en el sistema para que no salte la alarma.", points: 10, feedback: "Manipulación de métricas de servicio inaceptable." }
        ]
      },
      {
        id: "c7-step-3",
        stepNumber: 3,
        title: "Base de Conocimiento y Soluciones en 1 Clic",
        description: "El mismo problema ocurrió en el GP anterior. ¿Cómo resolverlo de inmediato?",
        options: [
          { id: "c7-3a", text: "Vincular el 'Solution Record' existente de la base de conocimiento para aplicar el procedimiento probado.", points: 100, feedback: "¡Parada Rápida! Reutiliza conocimiento validado sin reinventar la rueda." },
          { id: "c7-3b", text: "Escribir una solución nueva desde cero probando configuraciones al azar.", points: 50, feedback: "Consume minutos valiosos antes de la salida a pista." },
          { id: "c7-3c", text: "Reiniciar todos los servidores sin diagnosticar la causa raíz.", points: 10, feedback: "Solución riesgosa que puede afectar a otros monoplazas." }
        ]
      },
      {
        id: "c7-step-4",
        stepNumber: 4,
        title: "Medición de Satisfacción del Cliente (CSAT)",
        description: "El caso fue resuelto exitosamente antes de que el monoplaza saliera del box.",
        options: [
          { id: "c7-4a", text: "Disparo automático de encuesta CSAT / Net Promoter Score al cambiar el estado a 'Closed'.", points: 100, feedback: "¡Feedback en Tiempo Real! Mide la percepción inmediata del usuario." },
          { id: "c7-4b", text: "Enviar una encuesta trimestral de 40 preguntas por correo tradicional.", points: 10, feedback: "Baja tasa de respuesta y feedback tardío." },
          { id: "c7-4c", text: "No encuestar al cliente para no incomodarlo.", points: 10, feedback: "Ceguera operativa frente a posibles puntos de mejora." }
        ]
      },
      {
        id: "c7-step-5",
        stepNumber: 5,
        title: "Dashboard de Rendimiento First Contact Resolution (FCR)",
        description: "¿Cómo evaluar la eficacia de la mesa de ayuda técnica de la escudería?",
        options: [
          { id: "c7-5a", text: "Monitorear en tiempo real el KPI de 'First Contact Resolution' (FCR) y tiempo medio de resolución (MTTR).", points: 100, feedback: "¡Estrategia de Campeonato! Métricas objetivas para premiar al equipo." },
          { id: "c7-5b", text: "Contar cuántos correos envió cada técnico sin importar si resolvió el problema.", points: 10, feedback: "Métrica engañosa de volumen sin foco en calidad." },
          { id: "c7-5c", text: "Revisar los casos solo cuando un cliente presenta una queja formal.", points: 10, feedback: "Gestión puramente reactiva." }
        ]
      }
    ]
  },
  {
    id: "case-08",
    sector: 8,
    title: "Suscripciones, Facturación Recurrente y RevRec ASC 606",
    description: "Servicios de suscripción de telemetría en la nube y reconocimiento de ingresos conforme a la norma contable NIIF 15 / ASC 606.",
    timeLimitSeconds: 60,
    battleVideoUrl: "/videos/sector-08-battle.mp4",
    battleTitle: "Túnel a 300 km/h: Aullido del Motor V6 y Rebase en Penumbra",
    battleDescription: "Resplandor de frenos al rojo vivo en la penumbra del túnel con eco ensordecedor del motor.",
    steps: [
      {
        id: "c8-step-1",
        stepNumber: 1,
        title: "Modelado de Suscripción con SuiteBilling",
        description: "Contrato anual de $120,000 con cobro mensual recurrente y consumo de datos variable.",
        options: [
          { id: "c8-1a", text: "Configurar un 'Subscription Plan' en SuiteBilling combinando cuota fija mensual más cobro por uso medido (Usage).", points: 100, feedback: "¡Modelo SaaS Perfecto! Facturación automática cada mes sin intervención manual." },
          { id: "c8-1b", text: "Crear un recordatorio en el calendario para emitir una factura manual cada fin de mes.", points: 10, feedback: "Riesgo de olvidos, retrasos de cobro y cero automatización." },
          { id: "c8-1c", text: "Facturar los 12 meses por adelantado y reconocer el 100% del ingreso el primer día.", points: 10, feedback: "Infracción grave de la norma ASC 606 (reconocimiento anticipado indebido)." }
        ]
      },
      {
        id: "c8-step-2",
        stepNumber: 2,
        title: "Reconocimiento de Ingresos por Hitos (RevRec)",
        description: "El cliente paga $100,000 por implementación de sensores y soporte de 1 año. ¿Cómo reconocer el ingreso?",
        options: [
          { id: "c8-2a", text: "Generar un 'Revenue Arrangement' desagregando obligaciones de desempeño (POB) con planes basados en hitos y tiempo.", points: 100, feedback: "¡Auditoría Impecable! Separa hardware entregado del servicio diferido en el tiempo." },
          { id: "c8-2b", text: "Reconocer todo el ingreso según el flujo de cobranza que entra a la cuenta bancaria.", points: 10, feedback: "Confunde flujo de caja con devengo contable." },
          { id: "c8-2c", text: "Reconocer el ingreso al azar según la necesidad de utilidades del trimestre.", points: 10, feedback: "Fraude contable explícito." }
        ]
      },
      {
        id: "c8-step-3",
        stepNumber: 3,
        title: "Modificación de Contrato a Mitad de Temporada",
        description: "En la carrera 5, el cliente amplía el servicio añadiendo 10 licencias adicionales.",
        options: [
          { id: "c8-3a", text: "Aplicar una 'Subscription Change Order' que reasigna automáticamente el valor residual en los Revenue Arrangements.", points: 100, feedback: "¡Flexibilidad Comercial! Recalcula el plan diferido sin descuadrar periodos previos cerrados." },
          { id: "c8-3b", text: "Cancelar el contrato completo y empezar uno nuevo desde cero perdiendo el historial.", points: 50, feedback: "Complejo e innecesario: destruye la analítica de retención (Churn/Expansion)." },
          { id: "c8-3c", text: "No cobrar las licencias adicionales hasta la renovación del año siguiente.", points: 10, feedback: "Fuga de ingresos directos para la compañía." }
        ]
      },
      {
        id: "c8-step-4",
        stepNumber: 4,
        title: "Amortización de Comisiones de Venta (ASC 340)",
        description: "Se pagó una comisión de $12,000 al agente comercial por el contrato a 3 años.",
        options: [
          { id: "c8-4a", text: "Activar 'Expense Amortization Schedules' para amortizar el costo de adquisición a lo largo de los 36 meses del contrato.", points: 100, feedback: "¡Compliance ASC 340! Empareja costos con ingresos en el mismo horizonte temporal." },
          { id: "c8-4b", text: "Gastar los $12,000 en el primer mes de golpe reduciendo artificialmente el margen.", points: 50, feedback: "Aceptable bajo normas locales simplificadas, pero no en US GAAP." },
          { id: "c8-4c", text: "No registrar la comisión como gasto de la empresa.", points: 10, feedback: "Ocultamiento de pasivos." }
        ]
      },
      {
        id: "c8-step-5",
        stepNumber: 5,
        title: "Reporte de Ingresos Diferidos vs Devengados",
        description: "El auditor externo solicita el desglose del pasivo por ingresos diferidos a fin de año.",
        options: [
          { id: "c8-5a", text: "Generar el informe 'Deferred Revenue Rollforward' mostrando saldos iniciales, adiciones, ingresos reconocidos y saldo final.", points: 100, feedback: "¡Bandera a Cuadros! Conciliación perfecta con el balance general en 1 clic." },
          { id: "c8-5b", text: "Construir una estimación sumando facturas en una planilla de cálculo manual.", points: 10, feedback: "Observación de auditoría por falta de control interno sistemático." },
          { id: "c8-5c", text: "Indicar al auditor que no es posible conocer el saldo exacto de ingresos diferidos.", points: 10, feedback: "Riesgo de opinión con salvedades o dictamen adverso." }
        ]
      }
    ]
  },
  {
    id: "case-09",
    sector: 9,
    title: "Consolidación Global OneWorld y Multi-Subsidiaria",
    description: "Operaciones del consorcio de carreras con entidades legales en Reino Unido (GBP), Italia (EUR), Estados Unidos (USD) y Japón (JPY).",
    timeLimitSeconds: 60,
    battleVideoUrl: "/videos/sector-09-battle.mp4",
    battleTitle: "Chicanes Enlazadas: Cambios Bruscos de Dirección y Toque de Neumáticos",
    battleDescription: "Transferencia violenta de pesos de izquierda a derecha volando sobre los pianos de la chicane.",
    steps: [
      {
        id: "c9-step-1",
        stepNumber: 1,
        title: "Estructura del Árbol de Subsidiarias",
        description: "¿Cómo organizar la jerarquía corporativa en NetSuite OneWorld?",
        options: [
          { id: "c9-1a", text: "Configurar una subsidiaria matriz (Holding) con subsidiarias operativas hijas y entidades de eliminación automáticas.", points: 100, feedback: "¡Arquitectura OneWorld Perfecta! Permite ver balances individuales y consolidación multinivel." },
          { id: "c9-1b", text: "Crear una base de datos de NetSuite separada e inconexa para cada país.", points: 10, feedback: "Costos de licencias quadruplicados y cero visibilidad consolidada." },
          { id: "c9-1c", text: "Mezclar todos los países dentro de una sola empresa usando solo departamentos.", points: 10, feedback: "Imposible cumplir normativas fiscales y tributarias locales de cada nación." }
        ]
      },
      {
        id: "c9-step-2",
        stepNumber: 2,
        title: "Transacciones Intercompañía (Arm's Length)",
        description: "La fábrica en UK vende motores a la escudería de carreras en Italia. ¿Cómo facturarlo?",
        options: [
          { id: "c9-2a", text: "Utilizar 'Intercompany Sales Order' que genera automáticamente la 'Intercompany Purchase Order' sincronizada.", points: 100, feedback: "¡Espejo Automático! Mantiene precios de transferencia y elimina discrepancias entre empresas." },
          { id: "c9-2b", text: "Emitir una factura en UK y que Italia la reciba como gasto manual por correo.", points: 50, feedback: "Riesgo de descuadre entre cuentas por cobrar y por pagar intercompañía." },
          { id: "c9-2c", text: "No registrar la transacción por ser empresas del mismo dueño.", points: 10, feedback: "Infracción tributaria grave de precios de transferencia y contrabando de bienes." }
        ]
      },
      {
        id: "c9-step-3",
        stepNumber: 3,
        title: "Eliminación Contable Automática en el Cierre",
        description: "En el balance consolidado no se pueden mostrar ventas ni deudas hacia uno mismo.",
        options: [
          { id: "c9-3a", text: "Ejecutar la tarea de 'Intercompany Elimination' en el cierre del periodo para balancear transacciones recíprocas.", points: 100, feedback: "¡Consolidación Limpia! Elimina ingresos, costos y saldos intercompañía en la subsidiaria de eliminación." },
          { id: "c9-3b", text: "Hacer asientos de ajuste manuales en la subsidiaria operativa de Italia.", points: 10, feedback: "Distorsiona la contabilidad legal y fiscal de la subsidiaria local." },
          { id: "c9-3c", text: "Dejar las ventas intercompañía en el balance consolidado inflando los ingresos del grupo.", points: 10, feedback: "Presentación engañosa y rechazo por organismos reguladores." }
        ]
      },
      {
        id: "c9-step-4",
        stepNumber: 4,
        title: "Conversión de Monedas para Estados Financieros",
        description: "La subsidiaria japonesa tiene activos en Yenes (JPY) y el grupo consolida en Dólares (USD).",
        options: [
          { id: "c9-4a", text: "Configurar tipos de cambio automáticos: tipo de cambio actual para balance y promedio ponderado para estado de resultados (CTA).", points: 100, feedback: "¡Alineado con NIC 21 / ASC 830! Registra la diferencia de conversión en el patrimonio neto." },
          { id: "c9-4b", text: "Convertir todos los rubros al tipo de cambio del 1 de enero de forma invariable.", points: 10, feedback: "Ignora la realidad económica y la devaluación monetaria." },
          { id: "c9-4c", text: "Forzar a Japón a llevar sus libros contables exclusivamente en Dólares.", points: 10, feedback: "Ilegal bajo la normativa tributaria japonesa." }
        ]
      },
      {
        id: "c9-step-5",
        stepNumber: 5,
        title: "Reportes Consolidados al Directorio",
        description: "El Director General pide ver el P&L comparativo de todas las escuderías en tiempo real.",
        options: [
          { id: "c9-5a", text: "Abrir el 'Financial Report Builder' con dimensión de columna por 'Subsidiary (Context)' en moneda consolidada.", points: 100, feedback: "¡Visión de Campeonato! Análisis matricial instantáneo con desglose por subsidiaria y total." },
          { id: "c9-5b", text: "Exportar 4 balances a Excel y consolidar mediante tablas dinámicas durante 3 días.", points: 50, feedback: "Lento, manual y obsoleto al momento de presentarse." },
          { id: "c9-5c", text: "Presentar solo el reporte de la casa matriz ignorando las operaciones en el extranjero.", points: 10, feedback: "Falta de información crítica para la toma de decisiones estratégicas." }
        ]
      }
    ]
  },
  {
    id: "case-10",
    sector: 10,
    title: "Auditoría de Roles, Segregación SoD y Bandera a Cuadros",
    description: "Gran Premio de Abu Dhabi: Cierre del campeonato mundial, auditoría SOX de roles, bloqueo de libros contables y podio final.",
    timeLimitSeconds: 60,
    battleVideoUrl: "/videos/sector-10-battle.mp4",
    battleTitle: "Última Vuelta: Foto-Finish Paralelo por Milésimas de Segundo",
    battleDescription: "Llegada rueda a rueda a la línea de meta: bandera a cuadros ondeando y trompos de victoria con chispas.",
    steps: [
      {
        id: "c10-step-1",
        stepNumber: 1,
        title: "Matriz de Segregación de Funciones (SoD)",
        description: "¿Cómo evitar que un mismo mecánico cree una orden de compra, reciba la pieza y autorice el pago?",
        options: [
          { id: "c10-1a", text: "Configurar Custom Roles con permisos restringidos de Segregación de Funciones (SoD) auditados en NetSuite.", points: 100, feedback: "¡Blindaje Antifraude! Separa creación, recepción y autorización de pagos obligatoriamente." },
          { id: "c10-1b", text: "Darle permisos de Administrador del Sistema a todos los mecánicos para que no tengan trabas.", points: 10, feedback: "Riesgo catastrófico de seguridad y fallo total de auditoría SOX." },
          { id: "c10-1c", text: "Pedir que firmen un compromiso ético en papel sin restringir el sistema informático.", points: 10, feedback: "Control ilusorio sin efectividad operativa." }
        ]
      },
      {
        id: "c10-step-2",
        stepNumber: 2,
        title: "Trazabilidad con System Notes Inmutables",
        description: "Se detectó un cambio misterioso en el número de cuenta bancaria de un proveedor de telemetría.",
        options: [
          { id: "c10-2a", text: "Consultar las 'System Notes' del registro del proveedor para auditar usuario exacto, fecha, valor anterior y nuevo valor.", points: 100, feedback: "¡Caja Negra Forense! Registro inalterable que identifica al responsable en segundos." },
          { id: "c10-2b", text: "Preguntar a todo el personal por correo quién modificó la cuenta.", points: 10, feedback: "Inútil: Nadie admitirá un cambio erróneo o malintencionado." },
          { id: "c10-2c", text: "Restaurar una copia de seguridad y perder todo el trabajo de la semana.", points: 10, feedback: "Pérdida de continuidad operativa." }
        ]
      },
      {
        id: "c10-step-3",
        stepNumber: 3,
        title: "Doble Factor de Autenticación (2FA)",
        description: "Protección de accesos remotos al ERP desde las tablets de los boxes y aeropuertos.",
        options: [
          { id: "c10-3a", text: "Imponer obligatoriedad estricta de Two-Factor Authentication (2FA) mediante aplicación autenticadora para roles financieros.", points: 100, feedback: "¡Acceso Blindado! Bloquea el 99.9% de intentos de phishing o robo de credenciales." },
          { id: "c10-3b", text: "Permitir contraseñas simples de 4 números para que entren rápido.", points: 10, feedback: "Vulnerabilidad extrema a ataques de fuerza bruta." },
          { id: "c10-3c", text: "Compartir un solo usuario genérico entre los 10 miembros del equipo de boxes.", points: 10, feedback: "Destruye la trazabilidad individual de acciones en el sistema." }
        ]
      },
      {
        id: "c10-step-4",
        stepNumber: 4,
        title: "Bloqueo Definitivo de Periodos Fiscales (Hard Close)",
        description: "Finaliza el año fiscal y el campeonato de F1. ¿Cómo garantizar que nadie modifique los saldos finales?",
        options: [
          { id: "c10-4a", text: "Completar la lista de cierre de 'Manage Accounting Periods', bloquear AP/AR/GL y aplicar 'Lock All' de fin de año.", points: 100, feedback: "¡Bandera a Cuadros! Cierra definitivamente el ejercicio contable haciéndolo inmutable." },
          { id: "c10-4b", text: "Dejar el periodo abierto por si algún proveedor envía una factura atrasada dentro de 6 meses.", points: 10, feedback: "Mala práctica contable que invalida los reportes auditados." },
          { id: "c10-4c", text: "Borrar los datos contables antiguos para liberar espacio en disco.", points: 10, feedback: "Destrucción ilícita de libros contables de respaldo." }
        ]
      },
      {
        id: "c10-step-5",
        stepNumber: 5,
        title: "Certificación Final y Coronación de Campeones",
        description: "Extracción del informe de cumplimiento y auditoría de campeonato para proclamar a la escudería ganadora.",
        options: [
          { id: "c10-5a", text: "Generar el informe ejecutivo de auditoría y telemetría de eficiencia ERP NetSuite para coronar a la escudería campeona.", points: 100, feedback: "¡CAMPEONES DEL MUNDO! Máxima eficiencia, cero fallas y podio de honor en Abu Dhabi." },
          { id: "c10-5b", text: "Elegir al ganador por sorteo manual sin considerar los puntos acumulados en los 10 sectores.", points: 10, feedback: "Injusticia que desmotiva el esfuerzo técnico del equipo." },
          { id: "c10-5c", text: "No proclamar a ningún ganador y reiniciar sin ceremonia de premiación.", points: 10, feedback: "Anticlímax total que arruina el efecto WOW del evento." }
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
  const [showQrModal, setShowQrModal] = useState(false);
  const [summonTeamId, setSummonTeamId] = useState('1');
  const [summonReason, setSummonReason] = useState('Dinámica en Escenario');
  const [radioText, setRadioText] = useState('');

  const handleExportCsv = async () => {
    let historyData = {};
    if (cloudActions?.getChampionshipHistory) {
      historyData = await cloudActions.getChampionshipHistory();
    }
    const res = exportTrainingReportCsv({
      gameState,
      telemetry: gameState?.teamTelemetry || {},
      teamsProfiles: gameState?.teamsProfiles || {},
      history: historyData
    });
    if (res?.success) {
      setNotification(`📊 Reporte Excel descargado: ${res.filename}`);
      setTimeout(() => setNotification(''), 4000);
    }
  };

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
      setNotification(`⚡ Ronda finalizada: Video Batalla (${selectedCase.battleTitle || 'Sector ' + currentSector}) activado y cálculo de avances.`);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const handleNextSector = async () => {
    const nextIdx = Math.min(totalSectors, currentSector + 1);
    const res = await cloudActions.nextSector(nextIdx, totalSectors);
    if (res?.success) {
      const nextCasePadded = `case-${String(nextIdx).padStart(2, '0')}`;
      const foundCase = cases.find(c => c.id === nextCasePadded);
      if (foundCase) {
        setSelectedCaseId(nextCasePadded);
      }
      setNotification(`⏩ Preparado para el Sector ${nextIdx}. Caso y Video de Batalla alineados.`);
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold uppercase flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Abrir Código QR para conexión instantánea de tablets"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Conectar Tablets</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold uppercase flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Descargar reporte completo de capacitación en formato CSV / Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar Excel</span>
            </button>

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

                <div className="w-full sm:w-96">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">
                      CASO ERP ASOCIADO A ESTE SECTOR:
                    </label>
                    {selectedCase?.battleVideoUrl && (
                      <span className="text-[10px] font-mono text-f1-cyan flex items-center gap-1 font-bold">
                        🎬 {selectedCase.battleVideoUrl.replace('/videos/', '')}
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    disabled={currentStatus === 'ACTIVE_CASE'}
                    className="w-full bg-f1-dark border border-f1-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-f1-yellow focus:outline-none"
                  >
                    {cases.map((c, idx) => (
                      <option key={c.id} value={c.id}>
                        {c.sector ? `Sector ${c.sector}: ` : `Sector ${idx + 1}: `}{c.title} ({c.timeLimitSeconds}s)
                      </option>
                    ))}
                  </select>
                  {selectedCase?.battleTitle && (
                    <div className="mt-1 text-[10px] font-mono text-slate-400 truncate">
                      <span className="text-f1-yellow font-bold">Batalla:</span> {selectedCase.battleTitle}
                    </div>
                  )}
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

      {/* Modal de Conexión QR Tablets */}
      {showQrModal && (
        <QrConnectModal onClose={() => setShowQrModal(false)} />
      )}

      <footer className="mt-8 text-center text-xs font-mono text-slate-500">
        VELTIS F1 TELEMETRY SYSTEM • DIRECCIÓN DE CARRERA BACKOFFICE
      </footer>
    </div>
  );
}
