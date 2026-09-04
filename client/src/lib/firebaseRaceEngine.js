import { database, isFirebaseConfigured } from './firebase';
import { ref, set, get, onValue, update, serverTimestamp } from 'firebase/database';

export const TEAMS_LIST = [
  { id: 1, name: "Escudería 1 - Red Bull Racing", color: "#3671C6", shortName: "EQ 01", pin: "1" },
  { id: 2, name: "Escudería 2 - Scuderia Ferrari", color: "#E80020", shortName: "EQ 02", pin: "2" },
  { id: 3, name: "Escudería 3 - Mercedes-AMG Petronas", color: "#27F4D2", shortName: "EQ 03", pin: "3" },
  { id: 4, name: "Escudería 4 - McLaren F1 Team", color: "#FF8000", shortName: "EQ 04", pin: "4" },
  { id: 5, name: "Escudería 5 - Aston Martin Aramco", color: "#229971", shortName: "EQ 05", pin: "5" },
  { id: 6, name: "Escudería 6 - Alpine F1 Team", color: "#0093CC", shortName: "EQ 06", pin: "6" },
  { id: 7, name: "Escudería 7 - Williams Racing", color: "#64C4FF", shortName: "EQ 07", pin: "7" },
  { id: 8, name: "Escudería 8 - Visa Cash App RB", color: "#6692FF", shortName: "EQ 08", pin: "8" },
  { id: 9, name: "Escudería 9 - Stake F1 Kick Sauber", color: "#52E252", shortName: "EQ 09", pin: "9" },
  { id: 10, name: "Escudería 10 - Haas F1 Team", color: "#B6BABD", shortName: "EQ 10", pin: "10" }
];

export class FirebaseRaceEngine {
  constructor() {
    this.db = database;
  }

  // 1. Escuchar cambios de estado global de la carrera
  onStateChange(callback) {
    if (!this.db) return () => {};
    const stateRef = ref(this.db, 'f1_race/state');
    return onValue(stateRef, (snapshot) => {
      const val = snapshot.val();
      if (val) callback(val);
    });
  }

  // 2. Escuchar telemetría acumulada de los 10 equipos
  onTelemetryChange(callback) {
    if (!this.db) return () => {};
    const telemetryRef = ref(this.db, 'f1_race/telemetry');
    return onValue(telemetryRef, (snapshot) => {
      const val = snapshot.val();
      if (val) callback(val);
    });
  }

  // 3. Iniciar un caso en la nube de Firebase
  async startCase(caseData, sectorIndex = 1, totalSectors = 10) {
    if (!this.db) return;
    const now = Date.now();

    // Resetear envíos para esta ronda
    await set(ref(this.db, 'f1_race/submissions'), {});

    // Actualizar estado activo
    await update(ref(this.db, 'f1_race/state'), {
      status: 'ACTIVE_CASE',
      currentCase: caseData,
      currentSectorIndex: Number(sectorIndex) || 1,
      totalSectors: Number(totalSectors) || 10,
      startTime: now,
      durationLimitSeconds: caseData.timeLimitSeconds || 60,
      submissionsCount: 0,
      calculatedResults: null
    });
  }

  // 4. Enviar respuestas de un equipo en la nube
  async submitAnswers(teamId, answers, startTime, currentCase) {
    if (!this.db) return;
    const numTeamId = Number(teamId);
    const now = Date.now();
    const durationMs = Math.max(100, now - (startTime || now));
    const team = TEAMS_LIST.find(t => t.id === numTeamId);

    // Calcular puntaje
    let totalScore = 0;
    const stepBreakdown = [];
    const steps = currentCase?.steps || [];

    steps.forEach(step => {
      const selectedOptId = answers[step.id] || answers[step.stepNumber];
      const matchedOpt = step.options?.find(o => o.id === selectedOptId);
      const points = matchedOpt ? (Number(matchedOpt.points) || 0) : 0;
      totalScore += points;

      stepBreakdown.push({
        stepId: step.id,
        stepNumber: step.stepNumber,
        stepTitle: step.title,
        selectedOptionId: selectedOptId,
        pointsEarned: points,
        feedback: matchedOpt?.feedback || ''
      });
    });

    const submissionData = {
      teamId: numTeamId,
      teamName: team?.name || `Equipo ${numTeamId}`,
      shortName: team?.shortName || `EQ ${numTeamId}`,
      color: team?.color || '#E10600',
      score: totalScore,
      durationMs,
      durationSeconds: (durationMs / 1000).toFixed(2),
      submittedAt: now,
      stepBreakdown
    };

    // Guardar en Firebase
    await set(ref(this.db, `f1_race/submissions/${numTeamId}`), submissionData);

    // Actualizar contador
    const subsSnap = await get(ref(this.db, 'f1_race/submissions'));
    const allSubs = subsSnap.val() || {};
    await update(ref(this.db, 'f1_race/state'), {
      submissionsCount: Object.keys(allSubs).length
    });

    return submissionData;
  }

  // 5. Finalizar automáticamente y calcular resultados (Botón Auto)
  async autoFinish(currentCase, currentSectorIndex = 1, totalSectors = 10) {
    if (!this.db) return;
    const steps = currentCase?.steps || [];
    const subsSnap = await get(ref(this.db, 'f1_race/submissions'));
    const currentSubs = subsSnap.val() || {};

    // Rellenar respuestas para los equipos que no enviaron
    for (const team of TEAMS_LIST) {
      if (!currentSubs[team.id]) {
        const simAnswers = {};
        const isPerfect = team.id === 2 || Math.random() > 0.45;
        const durationMs = Math.round((6 + Math.random() * 18) * 1000);

        steps.forEach(s => {
          if (isPerfect) {
            const bestOpt = s.options.reduce((p, c) => (c.points > p.points ? c : p), s.options[0]);
            simAnswers[s.id] = bestOpt.id;
          } else {
            const rndOpt = s.options[Math.floor(Math.random() * s.options.length)];
            simAnswers[s.id] = rndOpt.id;
          }
        });

        await this.submitAnswers(team.id, simAnswers, Date.now() - durationMs, currentCase);
      }
    }

    // Calcular y revelar resultados
    return await this.calculateAndRevealResults(currentCase, currentSectorIndex, totalSectors);
  }

  // 6. Calcular resultados de la ronda y actualizar telemetría acumulada
  async calculateAndRevealResults(currentCase, currentSectorIndex = 1, totalSectors = 10) {
    if (!this.db) return;

    const subsSnap = await get(ref(this.db, 'f1_race/submissions'));
    const telemSnap = await get(ref(this.db, 'f1_race/telemetry'));

    const submissions = subsSnap.val() || {};
    const previousTelemetry = telemSnap.val() || {};

    const steps = currentCase?.steps || [];
    let maxPossibleScore = 0;
    steps.forEach(s => {
      maxPossibleScore += Math.max(...s.options.map(o => Number(o.points) || 0), 0);
    });
    if (maxPossibleScore === 0) maxPossibleScore = 500;

    const sectorWeightPercent = 100 / (Number(totalSectors) || 10);

    // Procesar los 10 equipos
    const roundResults = TEAMS_LIST.map(team => {
      const sub = submissions[team.id];
      const prevTelem = previousTelemetry[team.id] || {
        currentDistance: 0,
        cumulativeScore: 0,
        currentPosition: team.id
      };

      if (sub) {
        return {
          teamId: team.id,
          teamName: team.name,
          shortName: team.shortName,
          color: team.color,
          hasSubmitted: true,
          caseScore: sub.score,
          durationMs: sub.durationMs,
          durationFormatted: (sub.durationMs / 1000).toFixed(2) + 's',
          isPerfect: sub.score === maxPossibleScore,
          isFastestPerfect: false,
          previousDistance: prevTelem.currentDistance || 0,
          sectorAdvancePercent: 0,
          newCumulativeDistance: prevTelem.currentDistance || 0,
          cumulativeScore: (prevTelem.cumulativeScore || 0) + sub.score,
          previousPosition: prevTelem.currentPosition || team.id
        };
      } else {
        return {
          teamId: team.id,
          teamName: team.name,
          shortName: team.shortName,
          color: team.color,
          hasSubmitted: false,
          caseScore: 0,
          durationMs: 999999999,
          durationFormatted: 'DNF',
          isPerfect: false,
          isFastestPerfect: false,
          previousDistance: prevTelem.currentDistance || 0,
          sectorAdvancePercent: 0,
          newCumulativeDistance: prevTelem.currentDistance || 0,
          cumulativeScore: prevTelem.cumulativeScore || 0,
          previousPosition: prevTelem.currentPosition || team.id
        };
      }
    });

    // Identificar ganador del Pole Position Boost en este sector
    const perfectSubs = roundResults.filter(t => t.hasSubmitted && t.isPerfect);
    let fastestPerfectTeamId = null;
    if (perfectSubs.length > 0) {
      perfectSubs.sort((a, b) => a.durationMs - b.durationMs);
      fastestPerfectTeamId = perfectSubs[0].teamId;
    }

    roundResults.forEach(item => {
      const accuracyRatio = item.caseScore / maxPossibleScore;
      if (fastestPerfectTeamId && item.teamId === fastestPerfectTeamId) {
        item.isFastestPerfect = true;
        item.sectorAdvancePercent = parseFloat((sectorWeightPercent * 1.20).toFixed(2));
      } else {
        item.isFastestPerfect = false;
        item.sectorAdvancePercent = parseFloat((accuracyRatio * sectorWeightPercent).toFixed(2));
      }

      item.newCumulativeDistance = Math.min(100, parseFloat((item.previousDistance + item.sectorAdvancePercent).toFixed(2)));
    });

    // Ordenar ranking
    const ranking = [...roundResults].sort((a, b) => {
      if (b.newCumulativeDistance !== a.newCumulativeDistance) {
        return b.newCumulativeDistance - a.newCumulativeDistance;
      }
      return a.durationMs - b.durationMs;
    });

    ranking.forEach((r, idx) => {
      r.currentPosition = idx + 1;
      r.positionDelta = r.previousPosition - r.currentPosition;
    });

    // Actualizar telemetría global
    const newTelemetry = {};
    roundResults.forEach(item => {
      const rankItem = ranking.find(rk => rk.teamId === item.teamId);
      item.currentPosition = rankItem.currentPosition;
      item.positionDelta = rankItem.positionDelta;

      newTelemetry[item.teamId] = {
        teamId: item.teamId,
        teamName: item.teamName,
        shortName: item.shortName,
        color: item.color,
        cumulativeScore: item.cumulativeScore,
        previousDistance: item.previousDistance,
        currentDistance: item.newCumulativeDistance,
        previousPosition: item.previousPosition,
        currentPosition: item.currentPosition,
        positionDelta: item.positionDelta,
        lastSectorAdvance: item.sectorAdvancePercent,
        isFastestPerfect: item.isFastestPerfect
      };
    });

    const calculatedResults = {
      caseId: currentCase?.id,
      caseTitle: currentCase?.title,
      sectorIndex: currentSectorIndex,
      totalSectors,
      maxPossibleScore,
      fastestPerfectTeamId,
      teams: roundResults,
      ranking,
      calculatedAt: Date.now()
    };

    // Guardar en Firebase
    await set(ref(this.db, 'f1_race/telemetry'), newTelemetry);
    await update(ref(this.db, 'f1_race/state'), {
      status: 'REVEALED',
      calculatedResults
    });

    return calculatedResults;
  }

  // 7. Siguiente Sector
  async nextSector(nextSectorIndex, totalSectors = 10) {
    if (!this.db) return;

    // Actualizar previousDistance = currentDistance en la telemetría
    const telemSnap = await get(ref(this.db, 'f1_race/telemetry'));
    const telem = telemSnap.val() || {};

    Object.keys(telem).forEach(teamId => {
      telem[teamId].previousDistance = telem[teamId].currentDistance;
      telem[teamId].previousPosition = telem[teamId].currentPosition;
    });

    await set(ref(this.db, 'f1_race/telemetry'), telem);
    await set(ref(this.db, 'f1_race/submissions'), {});
    await update(ref(this.db, 'f1_race/state'), {
      status: 'LOBBY',
      currentCase: null,
      currentSectorIndex: Number(nextSectorIndex),
      totalSectors: Number(totalSectors),
      startTime: null,
      submissionsCount: 0,
      calculatedResults: null
    });
  }

  // 8. Reiniciar Campeonato en la Nube (0%)
  async resetChampionship() {
    if (!this.db) return;

    const initialTelemetry = {};
    TEAMS_LIST.forEach((t, idx) => {
      initialTelemetry[t.id] = {
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName,
        color: t.color,
        cumulativeScore: 0,
        previousDistance: 0,
        currentDistance: 0,
        previousPosition: idx + 1,
        currentPosition: idx + 1,
        positionDelta: 0,
        lastSectorAdvance: 0,
        isFastestPerfect: false
      };
    });

    await set(ref(this.db, 'f1_race/telemetry'), initialTelemetry);
    await set(ref(this.db, 'f1_race/submissions'), {});
    await set(ref(this.db, 'f1_race/state'), {
      status: 'LOBBY',
      currentCase: null,
      currentSectorIndex: 1,
      totalSectors: 10,
      startTime: null,
      durationLimitSeconds: 60,
      submissionsCount: 0,
      calculatedResults: null
    });
  }
}

export const firebaseRaceEngine = new FirebaseRaceEngine();
