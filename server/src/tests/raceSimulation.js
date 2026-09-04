import { raceController } from '../controllers/raceController.js';
import { db } from '../config/database.js';

console.log('🧪 Iniciando prueba automatizada del Motor de Carrera y Pole Position Boost...\n');

// 1. Obtener caso
const cases = db.getCases();
if (!cases || cases.length === 0) {
  console.error('❌ Error: No hay casos disponibles en la base de datos');
  process.exit(1);
}

const testCase = cases[0];
console.log(`📌 Caso de prueba seleccionado: "${testCase.title}"`);
console.log(`⏱️ Tiempo límite: ${testCase.timeLimitSeconds}s | Pasos: ${testCase.steps.length}\n`);

// 2. Iniciar caso
raceController.startCase(testCase.id);
const startTime = raceController.state.startTime;
console.log(`🏁 Caso iniciado a las ${new Date(startTime).toISOString()}`);

// 3. Simular envíos con diferentes tiempos y combinaciones de respuestas
// Escenario de prueba:
// - Equipo 2: Puntaje perfecto (500 pts) en 8,200 ms -> DEBE GANAR BOOST
// - Equipo 1: Puntaje perfecto (500 pts) en 14,500 ms -> NO gana boost (más lento)
// - Equipo 4: Puntaje imperfecto (450 pts) en 5,100 ms -> NO gana boost (aunque fue el más rápido, erró un paso)
// - Equipo 3: Puntaje 300 pts en 20,000 ms
// - Equipo 5 a 10: Varios

const perfectAnswers = {};
testCase.steps.forEach(s => {
  // Elegir la opción óptima de 100 pts
  const bestOpt = s.options.reduce((max, opt) => opt.points > max.points ? opt : max, s.options[0]);
  perfectAnswers[s.id] = bestOpt.id;
});

const imperfectAnswers = { ...perfectAnswers };
// Alterar el paso 1 para que dé 50 puntos
imperfectAnswers[testCase.steps[0].id] = testCase.steps[0].options.find(o => o.points === 50)?.id || testCase.steps[0].options[1].id;

// Simular Equipo 4 (Rápido pero imperfecto: 450 pts, 5100 ms)
raceController.state.startTime = Date.now() - 5100;
raceController.submitAnswers(4, imperfectAnswers);

// Simular Equipo 2 (Perfecto y más rápido entre perfectos: 500 pts, 8200 ms)
raceController.state.startTime = Date.now() - 8200;
raceController.submitAnswers(2, perfectAnswers);

// Simular Equipo 1 (Perfecto pero más lento: 500 pts, 14500 ms)
raceController.state.startTime = Date.now() - 14500;
raceController.submitAnswers(1, perfectAnswers);

// Simular Equipo 3 (300 pts, 20000 ms)
const mixedAnswers = {};
testCase.steps.forEach((s, idx) => {
  mixedAnswers[s.id] = s.options[idx % 3].id;
});
raceController.state.startTime = Date.now() - 20000;
raceController.submitAnswers(3, mixedAnswers);

// 4. Calcular resultados
const results = raceController.calculateResults();

console.log('\n📊 === TABLA DE TELEMETRÍA Y RESULTADOS CALCULADOS ===');
console.table(results.ranking.map(r => ({
  Puesto: r.position,
  Equipo: r.shortName,
  Puntaje: `${r.score}/${results.maxPossibleScore}`,
  Tiempo: r.durationFormatted,
  '¿Perfecto?': r.isPerfect ? 'SÍ' : 'NO',
  '¿Pole Boost?': r.isFastestPerfect ? '🚀 NITRO (+20%)' : '-',
  'Distancia Pista': `${r.finalTrackDistancePercent}%`
})));

// 5. Aserciones de validación
let testsPassed = true;

// Test 1: El equipo con Pole Boost debe ser exactamente el Equipo 2
if (results.fastestPerfectTeamId === 2) {
  console.log('✅ ASERCIÓN 1 PASÓ: Equipo 2 obtuvo correctamente el Pole Position Boost (500 pts en 8.2s)');
} else {
  console.error(`❌ ASERCIÓN 1 FALLÓ: Se esperaba equipo 2 pero fue ${results.fastestPerfectTeamId}`);
  testsPassed = false;
}

// Test 2: Equipo 4 (el más rápido de todos en tiempo bruto, pero con 450 pts) NO debe tener Boost
const team4Result = results.teams.find(t => t.teamId === 4);
if (team4Result && !team4Result.isFastestPerfect && team4Result.boostMultiplier === 1.0) {
  console.log('✅ ASERCIÓN 2 PASÓ: Equipo 4 fue más rápido en tiempo bruto pero al tener 450 pts NO recibió Boost.');
} else {
  console.error('❌ ASERCIÓN 2 FALLÓ: Equipo 4 recibió boost indebidamente.');
  testsPassed = false;
}

// Test 3: Equipo 2 debe tener avance visual del 120%
const team2Result = results.teams.find(t => t.teamId === 2);
if (team2Result && team2Result.finalTrackDistancePercent === 120) {
  console.log('✅ ASERCIÓN 3 PASÓ: Equipo 2 tiene multiplicador 1.20 y avance de pista del 120%.');
} else {
  console.error('❌ ASERCIÓN 3 FALLÓ: El avance visual de pista no fue 120%');
  testsPassed = false;
}

if (testsPassed) {
  console.log('\n🎉 ¡TODAS LAS PRUEBAS UNITARIAS DE LÓGICA Y TELEMETRÍA PASARON EXITOSAMENTE!\n');
} else {
  process.exit(1);
}
