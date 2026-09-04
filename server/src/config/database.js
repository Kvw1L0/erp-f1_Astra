import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultCases } from '../data/defaultCases.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/db.json');

// Equipos predefinidos (10 Equipos F1)
export const DEFAULT_TEAMS = [
  { id: 1, name: "Escudería 1 - Red Bull Racing", color: "#3671C6", carColor: "blue", shortName: "EQ 01", pin: "1" },
  { id: 2, name: "Escudería 2 - Scuderia Ferrari", color: "#E80020", carColor: "red", shortName: "EQ 02", pin: "2" },
  { id: 3, name: "Escudería 3 - Mercedes-AMG Petronas", color: "#27F4D2", carColor: "cyan", shortName: "EQ 03", pin: "3" },
  { id: 4, name: "Escudería 4 - McLaren F1 Team", color: "#FF8000", carColor: "orange", shortName: "EQ 04", pin: "4" },
  { id: 5, name: "Escudería 5 - Aston Martin Aramco", color: "#229971", carColor: "green", shortName: "EQ 05", pin: "5" },
  { id: 6, name: "Escudería 6 - Alpine F1 Team", color: "#0093CC", carColor: "blue", shortName: "EQ 06", pin: "6" },
  { id: 7, name: "Escudería 7 - Williams Racing", color: "#64C4FF", carColor: "cyan", shortName: "EQ 07", pin: "7" },
  { id: 8, name: "Escudería 8 - Visa Cash App RB", color: "#6692FF", carColor: "blue", shortName: "EQ 08", pin: "8" },
  { id: 9, name: "Escudería 9 - Stake F1 Kick Sauber", color: "#52E252", carColor: "green", shortName: "EQ 09", pin: "9" },
  { id: 10, name: "Escudería 10 - Haas F1 Team", color: "#B6BABD", carColor: "gray", shortName: "EQ 10", pin: "10" }
];

class Database {
  constructor() {
    this.data = {
      cases: [],
      teams: DEFAULT_TEAMS,
      raceHistory: []
    };
    this.init();
  }

  init() {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Asegurar que existan los casos por defecto si está vacío
        if (!this.data.cases || this.data.cases.length === 0) {
          this.data.cases = defaultCases;
          this.save();
        }
        if (!this.data.teams || this.data.teams.length === 0) {
          this.data.teams = DEFAULT_TEAMS;
          this.save();
        }
      } else {
        this.data.cases = defaultCases;
        this.data.teams = DEFAULT_TEAMS;
        this.data.raceHistory = [];
        this.save();
      }
    } catch (error) {
      console.error('Error al inicializar la base de datos local:', error);
      this.data.cases = defaultCases;
      this.data.teams = DEFAULT_TEAMS;
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error al guardar datos en disco:', error);
    }
  }

  // --- CRUD CASOS ---
  getCases() {
    return this.data.cases;
  }

  getCaseById(id) {
    return this.data.cases.find(c => c.id === id);
  }

  createCase(caseData) {
    const newCase = {
      ...caseData,
      id: caseData.id || `case-${Date.now()}`
    };
    this.data.cases.push(newCase);
    this.save();
    return newCase;
  }

  updateCase(id, caseData) {
    const index = this.data.cases.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.cases[index] = { ...this.data.cases[index], ...caseData, id };
    this.save();
    return this.data.cases[index];
  }

  deleteCase(id) {
    const index = this.data.cases.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.data.cases.splice(index, 1);
    this.save();
    return true;
  }

  // --- EQUIPOS ---
  getTeams() {
    return this.data.teams;
  }

  getTeamByPin(pin) {
    const cleanPin = String(pin).trim();
    return this.data.teams.find(t => String(t.pin) === cleanPin || String(t.id) === cleanPin);
  }

  // --- HISTORIAL DE CARRERA ---
  saveRaceResult(result) {
    if (!this.data.raceHistory) this.data.raceHistory = [];
    this.data.raceHistory.push({
      ...result,
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  getRaceHistory() {
    return this.data.raceHistory || [];
  }
}

export const db = new Database();
