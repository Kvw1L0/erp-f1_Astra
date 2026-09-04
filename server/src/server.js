import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { caseController } from './controllers/caseController.js';
import { raceController } from './controllers/raceController.js';
import { setupRaceSockets } from './sockets/raceSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configuración de CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Servidor Socket.io para sincronización en tiempo real
const io = new SocketIOServer(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST']
  },
  pingTimeout: 10000,
  pingInterval: 5000
});

// Configurar sockets
setupRaceSockets(io);

// --- RUTAS REST API ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    engine: 'El Gran Premio de la Eficiencia v1.0.0'
  });
});

// Casos CRUD
app.get('/api/cases', caseController.getAllCases);
app.get('/api/cases/:id', caseController.getCaseById);
app.post('/api/cases', caseController.createCase);
app.put('/api/cases/:id', caseController.updateCase);
app.delete('/api/cases/:id', caseController.deleteCase);

// Equipos y autenticación por PIN
app.get('/api/teams', caseController.getTeams);
app.post('/api/teams/verify-pin', caseController.verifyPin);

// Estado de la carrera
app.get('/api/race/state', (req, res) => {
  res.json({ success: true, data: raceController.getPublicState() });
});

app.get('/api/race/admin-state', (req, res) => {
  res.json({ success: true, data: raceController.getAdminState() });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log('=====================================================');
  console.log('🏎️  EL GRAN PREMIO DE LA EFICIENCIA - SERVIDOR PITS');
  console.log(`⚡  Servidor Backend escuchando en http://localhost:${PORT}`);
  console.log(`🏁  WebSocket Gateway listo en ws://localhost:${PORT}`);
  console.log('=====================================================');
});
