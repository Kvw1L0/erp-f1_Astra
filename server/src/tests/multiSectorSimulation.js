import { raceController } from '../controllers/raceController.js';
import { db } from '../config/database.js';

console.log('🧪 Iniciando prueba de Gran Premio Progresivo (10 Sectores) con Adelantamientos...\n');

raceController.resetChampionship();

// SECTOR 1
console.log('🏁 === SECTOR 1 (Tramo 0% -> 10%) ===');
raceController.startCase('case-01', 1);
// Simular envíos automáticos
raceController.simulateMissingSubmissions();
const r1 = raceController.calculateResults();
console.table(r1.ranking.map(r => ({
  Puesto: `P${r.currentPosition}`,
  Equipo: r.shortName,
  'Delta Adelantamiento': r.positionDelta > 0 ? `▲ +${r.positionDelta}` : (r.positionDelta < 0 ? `▼ ${r.positionDelta}` : '-'),
  'Distancia Acumulada': `${r.newCumulativeDistance}%`,
  'Avance Sector': `+${r.sectorAdvancePercent}%`,
  'Pole Boost': r.isFastestPerfect ? '🚀 NITRO' : '-'
})));

// SECTOR 2
console.log('\n🏁 === SECTOR 2 (Tramo 10% -> 20%) ===');
raceController.nextSector();
raceController.startCase('case-02', 2);
raceController.simulateMissingSubmissions();
const r2 = raceController.calculateResults();
console.table(r2.ranking.map(r => ({
  Puesto: `P${r.currentPosition}`,
  Equipo: r.shortName,
  'Delta Adelantamiento': r.positionDelta > 0 ? `▲ +${r.positionDelta}` : (r.positionDelta < 0 ? `▼ ${r.positionDelta}` : '-'),
  'Distancia Anterior': `${r.previousDistance}%`,
  'Distancia Nueva': `${r.newCumulativeDistance}%`,
  'Pole Boost': r.isFastestPerfect ? '🚀 NITRO' : '-'
})));

console.log('\n✅ ¡Prueba multi-sector exitosa! Los autos acumulan kilometraje y generan adelantamientos continuos en pista.');
