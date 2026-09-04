/**
 * Casos por defecto de Capacitación ERP NetSuite con temática de Cultura Pits F1
 * Cada caso tiene 5 pasos y cada paso tiene 3 opciones con puntuación asignada (100, 50, 10).
 */
export const defaultCases = [
  {
    id: "case-01",
    title: "Gran Premio de Facturación y Cierre Contable Express",
    description: "El equipo de Finanzas entra a Pits durante el cierre mensual. Los pedidos aprobados deben convertirse en facturas, contabilizar impuestos y conciliar pagos sin generar cuellos de botella.",
    timeLimitSeconds: 60,
    steps: [
      {
        id: "step-1",
        stepNumber: 1,
        title: "Validación de Pedidos de Venta (Sales Orders)",
        description: "¿Cuál es el procedimiento más óptimo en NetSuite para procesar 300 pedidos pendientes de facturación?",
        options: [
          {
            id: "opt-1a",
            text: "Ejecutar la tarea programada 'Bill Sales Orders' en procesamiento masivo automático con filtros de estado.",
            points: 100,
            feedback: "¡Telemetría Perfecta! Procesamiento asincrónico por lotes sin intervención manual."
          },
          {
            id: "opt-1b",
            text: "Abrir cada Sales Order individualmente y hacer clic en el botón 'Bill' uno por uno.",
            points: 10,
            feedback: "Pit stop ineficiente: Alto consumo de tiempo y riesgo de error humano."
          },
          {
            id: "opt-1c",
            text: "Exportar los pedidos a Excel, verificar totales y volver a importar con CSV Import Assistant.",
            points: 50,
            feedback: "Ruta alternativa válida pero duplica pasos de validación fuera del ERP."
          }
        ]
      },
      {
        id: "step-2",
        stepNumber: 2,
        title: "Asignación de Centros de Costos y Segmentación",
        description: "Se detectan transacciones sin línea de departamento y clase contable. ¿Cómo corregirlo?",
        options: [
          {
            id: "opt-2a",
            text: "Crear una regla de SuiteAnalytics / Workflow para heredar automáticamente los segmentos desde el registro del cliente.",
            points: 100,
            feedback: "¡Pole Position! Automatización nativa que previene inconsistencias en tiempo real."
          },
          {
            id: "opt-2b",
            text: "Solicitar al moderador del Pits que edite manualmente los asientos contables generados.",
            points: 10,
            feedback: "Parada no programada: Los ajustes manuales en asientos rompen la trazabilidad de origen."
          },
          {
            id: "opt-2c",
            text: "Configurar un Saved Search con alerta por correo para revisar las omisiones al final del día.",
            points: 50,
            feedback: "Alerta reactiva útil, pero requiere acción manual posterior."
          }
        ]
      },
      {
        id: "step-3",
        stepNumber: 3,
        title: "Conciliación Bancaria y Recaudación",
        description: "Llegan los extractos de transferencias bancarias de múltiples clientes. ¿Cómo registrar los cobros?",
        options: [
          {
            id: "opt-3a",
            text: "Utilizar el módulo de 'Bank Feeds SuiteApp' con reglas automatizadas de Match Bank Data.",
            points: 100,
            feedback: "¡Vuelta Rápida! Conciliación bancaria inteligente y conciliación de pagos en segundos."
          },
          {
            id: "opt-3b",
            text: "Crear registros de 'Customer Payment' manuales buscando cada número de factura bancaria.",
            points: 50,
            feedback: "Válido para bajo volumen, pero no escala a velocidad de carrera."
          },
          {
            id: "opt-3c",
            text: "Registrar todo como depósito directo en cuenta puente sin asociar a facturas.",
            points: 10,
            feedback: "Bandera Negra: Deja cuentas por cobrar abiertas y distorsiona la antigüedad de saldos."
          }
        ]
      },
      {
        id: "step-4",
        stepNumber: 4,
        title: "Gestión de Inventario y Reabastecimiento Pits",
        description: "El stock de neumáticos y repuestos críticos en bodega Pits bajó del umbral de seguridad.",
        options: [
          {
            id: "opt-4a",
            text: "Consultar 'Order Items' en NetSuite con cálculo automático de punto de reorden y demanda proyectada.",
            points: 100,
            feedback: "¡Estrategia de Neumáticos Óptima! Genera órdenes de compra consolidadas por proveedor al instante."
          },
          {
            id: "opt-4b",
            text: "Enviar correos electrónicos a los proveedores solicitando cotizaciones de emergencia.",
            points: 10,
            feedback: "Retraso crítico en Pits: Pérdida de precios de lista negociados y tiempo valioso."
          },
          {
            id: "opt-4c",
            text: "Generar órdenes de compra manuales ingresando los ítems uno por uno.",
            points: 50,
            feedback: "Cumple el objetivo pero no aprovecha la previsión automática de demanda."
          }
        ]
      },
      {
        id: "step-5",
        stepNumber: 5,
        title: "Auditoría Final y Telemetría de Cierre",
        description: "Antes de la bandera a cuadros, se requiere asegurar que los periodos contables se cierren sin discrepancias.",
        options: [
          {
            id: "opt-5a",
            text: "Completar la lista de verificación guiada de 'Manage Accounting Periods' con bloqueo por rol.",
            points: 100,
            feedback: "¡Bandera a Cuadros! Cierre seguro, secuencial y con auditoría total del sistema."
          },
          {
            id: "opt-5b",
            text: "Cambiar manualmente el estado del periodo a Cerrado sin ejecutar las tareas de bloqueo.",
            points: 10,
            feedback: "Accidente en pista: Permite modificaciones retroactivas sin control de auditoría."
          },
          {
            id: "opt-5c",
            text: "Dejar el periodo abierto y solicitar al equipo por chat que nadie registre más movimientos.",
            points: 10,
            feedback: "Peligro: Cero control sistemático sobre la integridad de datos."
          }
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
        description: "Un ingeniero de pista solicita repuestos especializados. ¿Cuál es la mejor práctica?",
        options: [
          {
            id: "c2-1a",
            text: "Ingresar una Requisition en el Employee Center asignando el centro de costo del equipo.",
            points: 100,
            feedback: "¡Perfecto! Inicia el workflow de compras sin consumir licencias completas."
          },
          {
            id: "c2-1b",
            text: "Llamar al Director de Compras para que cree una Purchase Order directa.",
            points: 10,
            feedback: "Salto de procedimientos: Rompe la segregación de funciones."
          },
          {
            id: "c2-1c",
            text: "Crear un Purchase Contract genérico sin detalle de ítems.",
            points: 50,
            feedback: "Aprobación ambigua que requerirá aclaraciones posteriores."
          }
        ]
      },
      {
        id: "c2-step-2",
        stepNumber: 2,
        title: "Matriz de Aprobación por Límites Financieros",
        description: "El monto supera los $10,000 USD. ¿Cómo debe enrutarse?",
        options: [
          {
            id: "c2-2a",
            text: "SuiteFlow automático basado en Approval Limits por jerarquía de supervisor.",
            points: 100,
            feedback: "¡Rápido y Seguro! Notificación automática y aprobación en 1 clic móvil."
          },
          {
            id: "c2-2b",
            text: "Enviar un PDF por Slack solicitando confirmación escrita.",
            points: 50,
            feedback: "Aprobación informal sin registro nativo en el historial del ERP."
          },
          {
            id: "c2-2c",
            text: "Dividir la orden en dos de $5,000 USD para eludir el control.",
            points: 10,
            feedback: "Infracción grave de compliance en auditoría."
          }
        ]
      },
      {
        id: "c2-step-3",
        stepNumber: 3,
        title: "Recepción de Mercancía en Pits (Item Receipt)",
        description: "Llega el cargamento a la pista. ¿Cómo certificar la recepción física vs orden de compra?",
        options: [
          {
            id: "c2-3a",
            text: "Registrar 'Item Receipt' con escaneo de código de barras desde NetSuite WMS Mobile.",
            points: 100,
            feedback: "¡Parada de 2.0 segundos! Actualización inmediata del stock disponible."
          },
          {
            id: "c2-3b",
            text: "Firmar la guía física de despacho y guardarla en una carpeta de Pits.",
            points: 10,
            feedback: "Inventario 'fantasma' no disponible en el sistema hasta que se digite."
          },
          {
            id: "c2-3c",
            text: "Ingresar la recepción en el sistema al final del turno nocturno.",
            points: 50,
            feedback: "Demora el uso de los repuestos durante la sesión de clasificación."
          }
        ]
      },
      {
        id: "c2-step-4",
        stepNumber: 4,
        title: "3-Way Matching (Factura vs OC vs Recepción)",
        description: "El proveedor envía su factura electrónica. ¿Cómo se autoriza el pago?",
        options: [
          {
            id: "c2-4a",
            text: "Validación automática de 3-Way Match (Cantidad, Precio y Recepción) en NetSuite.",
            points: 100,
            feedback: "¡Precisión milimétrica! Evita sobrepagos o pagos de bienes no recibidos."
          },
          {
            id: "c2-4b",
            text: "Aprobar el pago si el monto coincide con la cotización inicial.",
            points: 50,
            feedback: "Riesgoso: No valida si todos los artículos fueron efectivamente recibidos."
          },
          {
            id: "c2-4c",
            text: "Pagar directamente y conciliar las discrepancias en el trimestre siguiente.",
            points: 10,
            feedback: "Pérdida de control de flujo de caja y sobrecostos no recuperables."
          }
        ]
      },
      {
        id: "c2-step-5",
        stepNumber: 5,
        title: "Evaluación de Desempeño del Proveedor",
        description: "Se necesita medir la puntualidad y exactitud del proveedor para futuros Grandes Premios.",
        options: [
          {
            id: "c2-5a",
            text: "Generar reporte de Vendor Scorecard con métricas de On-Time Delivery y Fill Rate nativas.",
            points: 100,
            feedback: "¡Estrategia de Campeonato! Datos objetivos para negociación continua."
          },
          {
            id: "c2-5b",
            text: "Preguntar la opinión general de los mecánicos al terminar el evento.",
            points: 50,
            feedback: "Subjetivo y no trazable para decisiones corporativas."
          },
          {
            id: "c2-5c",
            text: "No realizar seguimiento si los repuestos funcionaron bien.",
            points: 10,
            feedback: "Oportunidades de mejora y descuentos por volumen desperdiciadas."
          }
        ]
      }
    ]
  }
];
