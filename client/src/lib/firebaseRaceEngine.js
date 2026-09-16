import { ref, set, get, update, onValue, serverTimestamp, runTransaction } from 'firebase/database';
import { getFirebaseDb, ensureRaceSession } from './firebase';

export const TEAMS_LIST = [
  { id: 1, name: "Escudería 1 - Red Bull Racing", color: "#3671C6", shortName: "EQ 01" },
  { id: 2, name: "Escudería 2 - Scuderia Ferrari", color: "#E80020", shortName: "EQ 02" },
  { id: 3, name: "Escudería 3 - Mercedes-AMG Petronas", color: "#27F4D2", shortName: "EQ 03" },
  { id: 4, name: "Escudería 4 - McLaren F1 Team", color: "#FF8000", shortName: "EQ 04" },
  { id: 5, name: "Escudería 5 - Aston Martin Aramco", color: "#229971", shortName: "EQ 05" },
  { id: 6, name: "Escudería 6 - Alpine F1 Team", color: "#0093CC", shortName: "EQ 06" },
  { id: 7, name: "Escudería 7 - Williams Racing", color: "#64C4FF", shortName: "EQ 07" },
  { id: 8, name: "Escudería 8 - Visa Cash App RB", color: "#6692FF", shortName: "EQ 08" },
  { id: 9, name: "Escudería 9 - Stake F1 Kick Sauber", color: "#52E252", shortName: "EQ 09" },
  { id: 10, name: "Escudería 10 - Haas F1 Team", color: "#B6BABD", shortName: "EQ 10" }
];

class FirebaseRaceEngine {
  constructor() {
    this.db = null;
  }

  init() {
    if (!this.db) {
      this.db = getFirebaseDb();
    }
    return this.db;
  }

  // 1. Escuchar cambios de estado global de la carrera
  onStateChange(callback, onError) {
    this.init();
    if (!this.db) return () => {};

    const stateRef = ref(this.db, 'f1_race/state');
    return onValue(stateRef, (snapshot) => {
      const val = snapshot.val();
      callback(val);
    }, onError);
  }

  // 2. Escuchar cambios de telemetría de los 10 equipos
  onTelemetryChange(callback) {
    this.init();
    if (!this.db) return () => {};

    const telemRef = ref(this.db, 'f1_race/telemetry');
    return onValue(telemRef, (snapshot) => {
      const val = snapshot.val();
      callback(val);
    });
  }

  // 2b. Escuchar perfiles de equipos (subnombres y nómina de integrantes)
  onTeamsChange(callback) {
    this.init();
    if (!this.db) return () => {};

    const teamsRef = ref(this.db, 'f1_race/teams');
    return onValue(teamsRef, (snapshot) => {
      const val = snapshot.val();
      callback(val || {});
    });
  }

  // 2c. Escuchar convocatorias a escenario y eventos en vivo
  onStageSummonChange(callback) {
    this.init();
    if (!this.db) return () => {};

    const summonRef = ref(this.db, 'f1_race/stage_summon');
    return onValue(summonRef, (snapshot) => {
      const val = snapshot.val();
      callback(val);
    });
  }

  // 2d. Escuchar envíos de respuestas en vivo de los participantes
  onSubmissionsChange(callback) {
    this.init();
    if (!this.db) return () => {};

    const subRef = ref(this.db, 'f1_race/submissions');
    return onValue(subRef, (snapshot) => {
      const val = snapshot.val();
      callback(val || {});
    });
  }

  onRadioChange(callback) {
    this.init();
    return onValue(ref(this.db, 'f1_race/radio_message'), snap => callback(snap.val()));
  }
  onCatalogChange(callback) {
    this.init();
    return onValue(ref(this.db, 'f1_race/catalog'), snap => callback(snap.val()));
  }
  async saveCatalog(cases) {
    this.init();
    await set(ref(this.db, 'f1_race/catalog'), {cases});
  }

  // 3. Iniciar un caso / Sector
  async startCase(caseData, sectorIndex = 1, totalSectors = 10) {
    this.init();
    if (!this.db) return;

    const startTime = serverTimestamp();

    await update(ref(this.db, 'f1_race'), {
      submissions: null,
      state: {
        status: 'ACTIVE_CASE', currentCase: caseData,
        currentSectorIndex: Number(sectorIndex), totalSectors: Number(totalSectors),
        startTime, durationLimitSeconds: caseData.timeLimitSeconds || 60,
        submissionsCount: 0, calculatedResults: null, isSafetyCarActive: false
      }
    });
  }

  // 4. Enviar respuestas de un participante
  async submitAnswers(teamId, answers, startTime, currentCase) {
    this.init();
    if (!this.db) return;

    const user = await ensureRaceSession();
    const state = (await get(ref(this.db, 'f1_race/state'))).val();
    if (!state || state.status !== 'ACTIVE_CASE') throw new Error('La ronda está cerrada');
    const validAnswers = {};
    for (const step of Object.values(state.currentCase.steps || {})) {
      const choice = answers[step.id];
      if (!Object.values(step.options || {}).some(option => option.id === choice)) throw new Error('Completa todos los pasos');
      validAnswers[step.id] = choice;
    }
    const path = ref(this.db, `f1_race/submissions/${Number(teamId)}`);
    await runTransaction(path, existing => existing || {
      teamId: Number(teamId), ownerUid: user.uid, answers: validAnswers,
      roundStartTime: state.startTime, submittedAt: serverTimestamp()
    }, {applyLocally: false});
    const stored = (await get(path)).val();
    if (!stored || stored.ownerUid !== user.uid) throw new Error('No se pudo confirmar el envío');
    return {...stored, durationSeconds: ((stored.submittedAt-state.startTime)/1000).toFixed(2)};
  }

  // Evaluate actual submissions only. A missing team receives DNF, never fabricated answers.
  async autoFinish(currentCase, currentSectorIndex = 1, totalSectors = 10) {
    this.init();
    if (!this.db) throw new Error('No hay conexión con la carrera');
    const initialState = (await get(ref(this.db, 'f1_race/state'))).val();
    const lock = await runTransaction(ref(this.db, 'f1_race/state'), state => {
      state = state || initialState;
      if (!state?.currentCase) return;
      if (state.status === 'ACTIVE_CASE') return {...state, status: 'LOCKED'};
      return state;
    }, {applyLocally: false});
    const state = lock.snapshot.val();
    if (state?.status === 'REVEALED') return state.calculatedResults;
    if (state?.status !== 'LOCKED') throw new Error('Inicia un caso antes de evaluar');
    return this.calculateAndRevealResults(state.currentCase, state.currentSectorIndex, state.totalSectors);
  }

  // 6. Calcular resultados de la ronda, Pole Position Boost (+20%) y DRS (+10% en P8-P10)
  async calculateAndRevealResults(currentCase, currentSectorIndex = 1, totalSectors = 10) {
    this.init();
    if (!this.db) return;

    const initialRace = (await get(ref(this.db, 'f1_race'))).val();
    const transaction = await runTransaction(ref(this.db, 'f1_race'), race => {
    race = race || initialRace;
    if (!race?.state) return;
    if (race.state.status === 'REVEALED') return race;
    if (race.state.status !== 'LOCKED') return;
    currentCase = race.state.currentCase;
    currentSectorIndex = race.state.currentSectorIndex;
    totalSectors = race.state.totalSectors;
    const submissions = Object.fromEntries(Object.entries(race.submissions || {}).map(([id, sub]) => [id, {...sub}]));
    const previousTelemetry = race.telemetry || {};
    for (const sub of Object.values(submissions)) {
      sub.score = Object.values(currentCase.steps || {}).reduce((sum, step) => {
        const option = Object.values(step.options || {}).find(o => o.id === sub.answers?.[step.id]);
        return sum + (Number(option?.points) || 0);
      }, 0);
      sub.durationMs = Math.max(0, Number(sub.submittedAt) - Number(race.state.startTime));
    }
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
          isDRSActive: false,
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
          isDRSActive: false,
          previousDistance: prevTelem.currentDistance || 0,
          sectorAdvancePercent: 0,
          newCumulativeDistance: prevTelem.currentDistance || 0,
          cumulativeScore: prevTelem.cumulativeScore || 0,
          previousPosition: prevTelem.currentPosition || team.id
        };
      }
    });

    // Identificar ganador del Pole Position Boost (+20%) en este sector
    const perfectSubs = roundResults.filter(t => t.hasSubmitted && t.isPerfect);
    let fastestPerfectTeamId = null;
    if (perfectSubs.length > 0) {
      perfectSubs.sort((a, b) => a.durationMs - b.durationMs);
      fastestPerfectTeamId = perfectSubs[0].teamId;
    }

    // Aplicar cálculos de avance, Pole Boost y DRS Boost
    roundResults.forEach(item => {
      const accuracyRatio = item.caseScore / maxPossibleScore;
      const isEligibleForDRS = item.previousPosition >= 8 && item.isPerfect && item.teamId !== fastestPerfectTeamId;

      if (fastestPerfectTeamId && item.teamId === fastestPerfectTeamId) {
        item.isFastestPerfect = true;
        item.isDRSActive = false;
        // Bonificación de +20%
        item.sectorAdvancePercent = parseFloat((sectorWeightPercent * 1.20).toFixed(2));
      } else if (isEligibleForDRS) {
        item.isFastestPerfect = false;
        item.isDRSActive = true;
        // Bonificación DRS de +10% para equipos rezagados
        item.sectorAdvancePercent = parseFloat((sectorWeightPercent * 1.10).toFixed(2));
      } else {
        item.isFastestPerfect = false;
        item.isDRSActive = false;
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
        isFastestPerfect: item.isFastestPerfect,
        isDRSActive: item.isDRSActive
      };
    });

    const calculatedResults = {
      caseId: currentCase?.id,
      caseTitle: currentCase?.title,
      battleVideoUrl: currentCase?.battleVideoUrl || `/videos/sector-${String(currentSectorIndex).padStart(2, '0')}-battle.mp4`,
      battleTitle: currentCase?.battleTitle || `Batalla en Pista - Sector ${currentSectorIndex}`,
      battleDescription: currentCase?.battleDescription || 'Cámaras on-board a 340 km/h: calculando telemetría y sobrepasos.',
      sectorIndex: currentSectorIndex,
      totalSectors,
      maxPossibleScore,
      fastestPerfectTeamId,
      teams: roundResults,
      ranking,
      calculatedAt: Date.now()
    };

    return {...race, telemetry: newTelemetry,
      state: {...race.state, status: 'REVEALED', calculatedResults},
      history: {...race.history, [`sector_${currentSectorIndex}`]: calculatedResults}};
    }, {applyLocally: false});
    const result = transaction.snapshot.val()?.state?.calculatedResults;
    if (!result) throw new Error('No se pudo evaluar la ronda');
    return result;
  }

  async simulate10Teams(currentCase, sectorIndex, totalSectors) {
    this.init();
    const existing = (await get(ref(this.db, 'f1_race/submissions'))).val();
    if (existing && Object.keys(existing).length) throw new Error('La simulación requiere una ronda sin respuestas.');
    await this.startCase(currentCase, sectorIndex, totalSectors);
    const state = (await get(ref(this.db, 'f1_race/state'))).val();
    const user = await ensureRaceSession();
    const simulated = {};
    for (const team of TEAMS_LIST) {
      const answers = {};
      for (const step of currentCase.steps) answers[step.id] = step.options[(team.id - 1) % step.options.length].id;
      simulated[team.id] = {teamId:team.id,ownerUid:user.uid,answers,roundStartTime:state.startTime,submittedAt:serverTimestamp()};
    }
    await set(ref(this.db, 'f1_race/submissions'), simulated);
    return this.autoFinish();
  }

  // 7. Activar o desactivar Virtual Safety Car (VSC)
  async toggleSafetyCar(isActive) {
    this.init();
    if (!this.db) return;

    if (isActive) {
      // Comprimir brechas entre autos al 50%
      const telemSnap = await get(ref(this.db, 'f1_race/telemetry'));
      const telem = telemSnap.val() || {};
      const teamIds = Object.keys(telem);
      if (teamIds.length > 0) {
        const distances = teamIds.map(id => telem[id].currentDistance || 0);
        const maxDist = Math.max(...distances);
        teamIds.forEach(id => {
          const d = telem[id].currentDistance || 0;
          telem[id].currentDistance = parseFloat((maxDist - (maxDist - d) * 0.5).toFixed(2));
        });
        await set(ref(this.db, 'f1_race/telemetry'), telem);
      }
    }

    await update(ref(this.db, 'f1_race/state'), {
      isSafetyCarActive: !!isActive
    });
  }

  // 8. Siguiente Sector
  async nextSector(nextSectorIndex, totalSectors = 10) {
    this.init();
    if (!this.db) return;

    // Actualizar previousDistance = currentDistance en la telemetría
    const telemSnap = await get(ref(this.db, 'f1_race/telemetry'));
    const telem = telemSnap.val() || {};

    Object.keys(telem).forEach(teamId => {
      telem[teamId].previousDistance = telem[teamId].currentDistance;
      telem[teamId].previousPosition = telem[teamId].currentPosition;
      telem[teamId].isDRSActive = false;
      telem[teamId].isFastestPerfect = false;
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
      calculatedResults: null,
      isSafetyCarActive: false
    });
  }

  // 9. Reiniciar Campeonato en la Nube (0%)
  async resetChampionship() {
    this.init();
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
        isFastestPerfect: false,
        isDRSActive: false
      };
    });

    await set(ref(this.db, 'f1_race/telemetry'), initialTelemetry);
    await set(ref(this.db, 'f1_race/submissions'), {});
    await set(ref(this.db, 'f1_race/history'), {});
    await set(ref(this.db, 'f1_race/state'), {
      status: 'LOBBY',
      currentCase: null,
      currentSectorIndex: 1,
      totalSectors: 10,
      startTime: null,
      durationLimitSeconds: 60,
      submissionsCount: 0,
      calculatedResults: null,
      isSafetyCarActive: false
    });
  }

  // 11. Hard Reset (Foja Cero / Expulsión total de dispositivos)
  async hardReset() {
    this.init();
    if (!this.db) return;

    const initialTelemetry = {};
    TEAMS_LIST.forEach((t, idx) => {
      initialTelemetry[t.id] = {
        teamId: t.id,
        teamName: t.name,
        subname: '',
        participants: [],
        shortName: t.shortName,
        color: t.color,
        cumulativeScore: 0,
        previousDistance: 0,
        currentDistance: 0,
        previousPosition: idx + 1,
        currentPosition: idx + 1,
        positionDelta: 0,
        lastSectorAdvance: 0,
        isFastestPerfect: false,
        isDRSActive: false,
        isSuperBoostActive: false
      };
    });

    // Limpiar equipos, envíos y convocatorias
    await set(ref(this.db, 'f1_race/teams'), {});
    await set(ref(this.db, 'f1_race/submissions'), {});
    await set(ref(this.db, 'f1_race/history'), {});
    await set(ref(this.db, 'f1_race/stage_summon'), null);
    await set(ref(this.db, 'f1_race/radio_message'), null);
    await set(ref(this.db, 'f1_race/telemetry'), initialTelemetry);

    // Publicar evento HARD_RESET para que los clientes se auto-expulsen
    await set(ref(this.db, 'f1_race/state'), {
      status: 'HARD_RESET',
      hardResetTimestamp: Date.now(),
      currentCase: null,
      currentSectorIndex: 1,
      totalSectors: 10,
      startTime: null,
      durationLimitSeconds: 60,
      submissionsCount: 0,
      calculatedResults: null,
      isSafetyCarActive: false,
      isRedFlagActive: false,
      isWetRaceActive: false
    });

    // Tras 1.5s, volver a LOBBY limpio
    setTimeout(async () => {
      try {
        await update(ref(this.db, 'f1_race/state'), { status: 'LOBBY' });
      } catch (e) {}
    }, 1500);
  }

  // 11b. Actualizar perfil de equipo (subnombre y participantes/pilotos)
  async updateTeamProfile(teamId, subname, participants) {
    this.init();
    if (!this.db) return;

    const user = await ensureRaceSession();
    const numId = Number(teamId);
    if (!TEAMS_LIST.some(t => t.id === numId)) throw new Error('Escudería inválida');
    await set(ref(this.db, `f1_race/teams/${numId}`), {
      teamId: numId,
      ownerUid: user.uid,
      subname: String(subname || '').trim().slice(0, 80),
      participants: Array.isArray(participants) ? participants.slice(0, 15) : [],
      updatedAt: serverTimestamp()
    });
  }

  // 12. Convocatoria a Escenario (Disparador de Eventos)
  async triggerStageSummon(teamId, reason = 'Dinámica en Escenario', active = true) {
    this.init();
    if (!this.db) return;

    if (!active) {
      await set(ref(this.db, 'f1_race/stage_summon'), null);
      return;
    }

    const numId = Number(teamId);
    const team = TEAMS_LIST.find(t => t.id === numId);
    const teamSnap = await get(ref(this.db, `f1_race/teams/${numId}`));
    const profile = teamSnap.val() || {};

    const summonData = {
      teamId: numId,
      teamName: team?.name || `Escudería ${numId}`,
      subname: profile.subname || '',
      participants: profile.participants || [],
      reason,
      active: true,
      timestamp: Date.now()
    };

    await set(ref(this.db, 'f1_race/stage_summon'), summonData);
    return summonData;
  }

  // 13. Prórroga de Tiempo (+30s)
  async extendTimer(extraSeconds = 30) {
    this.init();
    if (!this.db) return;

    const stateSnap = await get(ref(this.db, 'f1_race/state'));
    const curr = stateSnap.val() || {};
    const newLimit = (Number(curr.durationLimitSeconds) || 60) + Number(extraSeconds);

    await update(ref(this.db, 'f1_race/state'), {
      durationLimitSeconds: newLimit,
      timerExtendedAt: Date.now()
    });
  }

  // 14. Bandera Roja (Red Flag / Pausa Total)
  async setRedFlag(isActive) {
    this.init();
    if (!this.db) return;

    await update(ref(this.db, 'f1_race/state'), {
      isRedFlagActive: !!isActive
    });
  }

  // 15. Modo Lluvia (Wet Race)
  async setWetRace(isActive) {
    this.init();
    if (!this.db) return;

    await update(ref(this.db, 'f1_race/state'), {
      isWetRaceActive: !!isActive
    });
  }

  // 16. Comunicado de Radio de Pits
  async sendPitRadioMessage(message) {
    this.init();
    if (!this.db) return;

    await set(ref(this.db, 'f1_race/radio_message'), {
      message: String(message).trim(),
      timestamp: Date.now()
    });
  }

  // 17. Activar Super Boost (+15% de aceleración extra)
  async activateSuperBoost(teamId, success = true) {
    this.init();
    if (!this.db) return;

    const numId = Number(teamId);
    if (success) {
      await update(ref(this.db, `f1_race/telemetry/${numId}`), {
        isSuperBoostActive: true
      });
    }
  }

  // 18. Obtener Historial Completo del Campeonato para Exportación
  async getChampionshipHistory() {
    this.init();
    if (!this.db) return {};
    const snap = await get(ref(this.db, 'f1_race/history'));
    return snap.val() || {};
  }
}

export const firebaseRaceEngine = new FirebaseRaceEngine();
