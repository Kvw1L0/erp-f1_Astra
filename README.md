# 🏎️ El Gran Premio de la Eficiencia (F1 / NetSuite ERP Gamification)

Aplicación web interactiva en tiempo real para eventos corporativos (100 personas divididas en 10 equipos) diseñada para gamificar la capacitación del sistema ERP (NetSuite) bajo la temática de **"Cultura Pits / Fórmula 1"**.

---

## 🏁 Características Principales

### 1. 📱 Vista de Participante (`/participant`) - Tablets / Móviles
- **Login Privado y Ágil:** Acceso exclusivo mediante **PIN de Equipo (1 al 10)**. No se solicitan teléfonos, nombres ni datos personales bajo ninguna circunstancia.
- **Interfaz Minimalista:** Estética Dark Carbon con paleta corporativa y controles táctiles limpios.
- **Flujo de Caso de 5 Pasos:** Visualización del título, contexto y 5 pasos interactivos con 3 opciones de respuesta cada uno.
- **Barra de Tiempo Inmersiva:** Barra superior sincronizada con el reloj del servidor que transiciona de cian/verde $\rightarrow$ amarillo ámbar $\rightarrow$ rojo de alerta con ticker en milisegundos.
- **Bloqueo Inmediato de Telemetría:** Al enviar la resolución, la pantalla se bloquea al instante con el mensaje oficial: *"Procesando telemetría en Pits... ¡Mira la pantalla central!"*.

### 2. 📺 Vista Principal (`/race-screen`) - Pantalla Gigante / Proyector 4K
- **Pista de 10 Carriles F1:** 10 monoplazas con colores oficiales de escuderías y físicas fluidas con Framer Motion.
- **Animación WOW de Carrera:** Los autos avanzan proporcionalmente al puntaje obtenido (0 a 100% de la pista).
- **Efecto Nitro Boost (+20%):** Pausa dramática de 2 segundos, tras la cual el auto con el *Pole Position Boost* activa un efecto visual de fuego/nitro, sonido de propulsión y avanza un 20% extra (120% visual).
- **Podio Oficial y Confeti:** Ceremonia con 1er, 2do y 3er puesto, desglose de tiempos oficiales y confeti en pantalla.

### 3. 🏎️ Panel de Administración (`/admin`) - Dirección de Carrera
- **Consola de Carrera en Vivo:**
  - Botón **"Iniciar Caso X"**: Sella el `startTime` en el servidor y habilita las tablets con cuenta regresiva.
  - Botón **"Bloquear Respuestas"**: Cierra la sesión de Pits y consolida resultados.
  - Botón **"Revelar Resultados"**: Dispara la animación de carrera y Nitro en la pantalla gigante.
  - Botón **"Lobby / Siguiente Caso"** y **"Reiniciar Campeonato"**.
  - Monitor en tiempo real de los 10 equipos (conectados, respondiendo, enviados, tiempo y puntos).
- **CRUD de Casos:** Formulario interactivo para crear, editar y eliminar casos. Permite configurar título, tiempo límite, número de pasos y asignar puntajes exactos (100, 50, 10 pts) a cada una de las 3 opciones.

---

## ⏱️ Reglas Críticas de Lógica y Servidor

1. **Sello de Tiempo en Servidor (Timestamp Authority):**
   - El reloj del cliente **nunca** define el tiempo de respuesta.
   - El servidor registra el `startTime` al emitir el caso y el `endTime` exacto en milisegundos al recibir el payload. `durationMs = endTime - startTime`.
2. **Lógica del "Pole Position Boost":**
   - De todos los equipos que logren **EXACTAMENTE EL PUNTAJE MÁXIMO** (ej. 500/500 pts), el servidor identifica al que tenga el menor `durationMs`.
   - Solo a ese equipo se le otorga `isFastestPerfect = true`, bonificación del +20% y efecto visual Nitro.
   - Si un equipo fue el más rápido de todos pero erró un paso (ej. 450 pts), **NO** recibe el boost.

---

## 🚀 Guía de Instalación y Ejecución

### Prerrequisitos
- Node.js v18+ o v20+ / npm

### Paso 1: Instalar Dependencias
```bash
# Servidor
cd server
npm install

# Cliente
cd ../client
npm install
```

### Paso 2: Ejecutar el Proyecto

**Opción A: Iniciar ambos servicios por separado**
```bash
# Terminal 1 (Backend WebSocket & REST - Puerto 4000)
cd server
npm start

# Terminal 2 (Frontend Next.js - Puerto 3000)
cd client
npm run dev
```

**Opción B: Probar la simulación unitaria del motor de carrera**
```bash
cd server
npm run test:simulation
```

---

## 🌐 URLs de Acceso

| Interfaz | URL | Propósito |
|---|---|---|
| **Portal Principal** | `http://localhost:3000/` | Selector de interfaces |
| **Vista Participante** | `http://localhost:3000/participant` | Tablets de los 10 Equipos (PIN 1 al 10) |
| **Pantalla Gigante** | `http://localhost:3000/race-screen` | Proyector / TV 4K de la carrera |
| **Dirección de Carrera** | `http://localhost:3000/admin` | Panel de control del moderador |
| **API Backend** | `http://localhost:4000/api/cases` | Endpoints REST y Socket.io |
