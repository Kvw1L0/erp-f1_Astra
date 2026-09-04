import { db } from '../config/database.js';

class RaceController {
  constructor() {
    this.totalSectors = 10; // 10 Casos / Sectores para el Gran Premio completo
    this.currentSectorIndex = 1;

    this.state = {
      status: 'LOBBY', // 'LOBBY' | 'ACTIVE_CASE' | 'LOCKED' | 'REVEALED'
      currentCase: null,
      currentSectorIndex: 1,
      totalSectors: 10,
      startTime: null,
      endTime: null,
      durationLimitSeconds: 60,
      connectedTeams: {}, // { [teamId]: { socketId, team, connectedAt, status } }
      submissions: {}, // { [teamId]: { answers, score, durationMs, stepBreakdown } }
      teamTelemetry: {}, // { [teamId]: { cumulativeScore, previousDistance, currentDistance, previousPosition, currentPosition, positionDelta } }
      calculatedResults: null,
      raceHistory: []
    };

    this.initTeamsTelemetry();
  }

  initTeamsTelemetry() {
    const teams = db.getTeams();
    this.state.teamTelemetry = {};
    teams.forEach((t, idx) => {
      this.state.teamTelemetry[t.id] = {
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName,
        color: t.color,
        cumulativeScore: 0,
        previousDistance: 0, // % anterior en la pista (0 - 100%)
        currentDistance: 0,  // % actual en la pista (0 - 100%)
        previousPosition: idx + 1,
        currentPosition: idx + 1,
        positionDelta: 0 // +2 (subió 2 puestos), -1 (bajó 1 puesto)
      };
    });
  }

  getPublicState() {
    return {
      status: this.state.status,
      currentSectorIndex: this.state.currentSectorIndex,
      totalSectors: this.state.totalSectors,
      currentCase: this.state.currentCase ? {
        id: this.state.currentCase.id,
        title: this.state.currentCase.title,
        description: this.state.currentCase.description,
        timeLimitSeconds: this.state.currentCase.timeLimitSeconds,
        stepsCount: this.state.currentCase.steps?.length || 0,
        steps: this.state.currentCase.steps?.map(s => ({
          id: s.id,
          stepNumber: s.stepNumber,
          title: s.title,
          description: s.description,
          options: s.options?.map(o => ({
            id: o.id,
            text: o.text
          }))
        }))
      } : null,
      startTime: this.state.startTime,
      durationLimitSeconds: this.state.durationLimitSeconds,
      connectedTeamsCount: Object.keys(this.state.connectedTeams).length,
      submissionsCount: Object.keys(this.state.submissions).length,
      calculatedResults: this.state.calculatedResults,
      teamTelemetry: this.state.teamTelemetry
    };
  }

  getAdminState() {
    return {
      ...this.getPublicState(),
      currentCaseFull: this.state.currentCase,
      connectedTeams: this.state.connectedTeams,
      submissions: this.state.submissions,
      rawState: this.state
    };
  }

  registerTeamConnection(teamId, socketId) {
    const team = db.getTeams().find(t => t.id === Number(teamId));
    if (!team) return null;

    this.state.connectedTeams[teamId] = {
      teamId: team.id,
      name: team.name,
      shortName: team.shortName,
      color: team.color,
      socketId,
      connectedAt: Date.now(),
      status: this.state.submissions[teamId] ? 'SUBMITTED' : (this.state.status === 'ACTIVE_CASE' ? 'ANSWERING' : 'READY')
    };

    return this.state.connectedTeams[teamId];
  }

  unregisterSocket(socketId) {
    for (const [teamId, data] of Object.entries(this.state.connectedTeams)) {
      if (data.socketId === socketId) {
        delete this.state.connectedTeams[teamId];
        break;
      }
    }
  }

  startCase(caseId, sectorIndex = null) {
    const selectedCase = db.getCaseById(caseId) || db.getCases()[0];
    if (!selectedCase) {
      throw new Error(`El caso no existe`);
    }

    const serverStartTime = Date.now();
    this.state.status = 'ACTIVE_CASE';
    this.state.currentCase = selectedCase;
    if (sectorIndex) {
      this.state.currentSectorIndex = Number(sectorIndex);
    }
    this.state.startTime = serverStartTime;
    this.state.endTime = null;
    this.state.durationLimitSeconds = selectedCase.timeLimitSeconds || 60;
    this.state.submissions = {};
    this.state.calculatedResults = null;

    // Actualizar estado de los equipos conectados
    Object.keys(this.state.connectedTeams).forEach(teamId => {
      this.state.connectedTeams[teamId].status = 'ANSWERING';
    });

    return {
      case: this.state.currentCase,
      startTime: this.state.startTime,
      currentSectorIndex: this.state.currentSectorIndex,
      totalSectors: this.state.totalSectors,
      durationLimitSeconds: this.state.durationLimitSeconds
    };
  }

  submitAnswers(teamId, answers) {
    const serverReceiveTime = Date.now();

    if (this.state.status !== 'ACTIVE_CASE') {
      throw new Error('No hay un caso activo en este momento');
    }

    if (!this.state.currentCase) {
      throw new Error('No hay caso cargado');
    }

    const numTeamId = Number(teamId);
    const team = db.getTeams().find(t => t.id === numTeamId);
    if (!team) {
      throw new Error(`Equipo ${teamId} no encontrado`);
    }

    const durationMs = serverReceiveTime - this.state.startTime;

    // Evaluar puntaje paso por paso
    let totalScore = 0;
    const stepBreakdown = [];
    const currentSteps = this.state.currentCase.steps || [];

    currentSteps.forEach(step => {
      const selectedOptionId = answers[step.id] || answers[step.stepNumber];
      const matchedOption = step.options.find(o => o.id === selectedOptionId);

      const pointsEarned = matchedOption ? (Number(matchedOption.points) || 0) : 0;
      totalScore += pointsEarned;

      stepBreakdown.push({
        stepId: step.id,
        stepNumber: step.stepNumber,
        stepTitle: step.title,
        selectedOptionId,
        selectedOptionText: matchedOption ? matchedOption.text : 'Sin respuesta',
        pointsEarned,
        feedback: matchedOption ? matchedOption.feedback : 'Opción no válida'
      });
    });

    const submissionData = {
      teamId: numTeamId,
      teamName: team.name,
      teamShortName: team.shortName,
      color: team.color,
      answers,
      score: totalScore,
      durationMs,
      durationSeconds: (durationMs / 1000).toFixed(2),
      submittedAt: serverReceiveTime,
      stepBreakdown,
      isFastestPerfect: false
    };

    this.state.submissions[numTeamId] = submissionData;

    if (this.state.connectedTeams[numTeamId]) {
      this.state.connectedTeams[numTeamId].status = 'SUBMITTED';
    }

    return submissionData;
  }

  /**
   * Simula automáticamente las respuestas de todos los equipos que no hayan respondido aún
   * Útil para demostraciones y para el botón de "Finalizar Caso Automáticamente"
   */
  simulateMissingSubmissions() {
    if (!this.state.currentCase) return;
    const allTeams = db.getTeams();
    const steps = this.state.currentCase.steps || [];

    allTeams.forEach(team => {
      if (!this.state.submissions[team.id]) {
        // Generar respuestas variadas realistas
        const simulatedAnswers = {};
        const isPerfectTeam = team.id === 2 || Math.random() > 0.4; // Variabilidad
        const randomSeconds = (5 + Math.random() * 20).toFixed(2);
        const durationMs = Math.round(randomSeconds * 1000);

        steps.forEach(step => {
          if (isPerfectTeam) {
            // Opción óptima (mayor puntaje)
            const bestOpt = step.options.reduce((prev, curr) => curr.points > prev.points ? curr : prev, step.options[0]);
            simulatedAnswers[step.id] = bestOpt.id;
          } else {
            // Opción aleatoria
            const randomOpt = step.options[Math.floor(Math.random() * step.options.length)];
            simulatedAnswers[step.id] = randomOpt.id;
          }
        });

        // Registrar envío simulado
        this.state.startTime = this.state.startTime || (Date.now() - durationMs);
        this.submitAnswers(team.id, simulatedAnswers);
      }
    });
  }

  lockCase() {
    this.state.status = 'LOCKED';
    this.state.endTime = Date.now();
    return this.calculateResults();
  }

  /**
   * Algoritmo de Consolidación Progresiva por Sectores y Pole Position Boost
   */
  calculateResults() {
    if (!this.state.currentCase) return null;

    const allTeams = db.getTeams();
    const currentSteps = this.state.currentCase.steps || [];
    const totalSectors = this.state.totalSectors || 10;
    const sectorWeightPercent = 100 / totalSectors; // Ej. 10% de pista por caso

    // 1. Puntaje máximo posible en este caso
    let maxPossibleScore = 0;
    currentSteps.forEach(step => {
      const stepMax = Math.max(...step.options.map(o => Number(o.points) || 0), 0);
      maxPossibleScore += stepMax;
    });
    if (maxPossibleScore === 0) maxPossibleScore = 500;

    // 2. Procesar respuestas
    const roundResults = allTeams.map(team => {
      const sub = this.state.submissions[team.id];
      const previousTelemetry = this.state.teamTelemetry[team.id] || {
        cumulativeScore: 0,
        currentDistance: 0,
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
          stepBreakdown: sub.stepBreakdown,
          isFastestPerfect: false,
          boostMultiplier: 1.0,
          previousDistance: previousTelemetry.currentDistance,
          sectorAdvancePercent: 0,
          newCumulativeDistance: previousTelemetry.currentDistance,
          cumulativeScore: previousTelemetry.cumulativeScore + sub.score,
          previousPosition: previousTelemetry.currentPosition
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
          stepBreakdown: [],
          isFastestPerfect: false,
          boostMultiplier: 1.0,
          previousDistance: previousTelemetry.currentDistance,
          sectorAdvancePercent: 0,
          newCumulativeDistance: previousTelemetry.currentDistance,
          cumulativeScore: previousTelemetry.cumulativeScore,
          previousPosition: previousTelemetry.currentPosition
        };
      }
    });

    // 3. Determinar el Pole Position Boost en este sector
    const perfectSubmissions = roundResults.filter(t => t.hasSubmitted && t.isPerfect);
    let fastestPerfectTeamId = null;
    if (perfectSubmissions.length > 0) {
      perfectSubmissions.sort((a, b) => a.durationMs - b.durationMs);
      fastestPerfectTeamId = perfectSubmissions[0].teamId;
    }

    // 4. Calcular avance del tramo y nueva distancia acumulada en pista
    roundResults.forEach(item => {
      const accuracyRatio = item.caseScore / maxPossibleScore; // 0.0 a 1.0

      if (fastestPerfectTeamId && item.teamId === fastestPerfectTeamId) {
        item.isFastestPerfect = true;
        item.boostMultiplier = 1.20;
        // Avance en este sector: Base del sector * 1.20 (ej. 10% * 1.20 = +12% de pista)
        item.sectorAdvancePercent = parseFloat((sectorWeightPercent * 1.20).toFixed(2));
      } else {
        item.isFastestPerfect = false;
        item.boostMultiplier = 1.0;
        // Avance proporcional al puntaje obtenido (ej. 80% de 10% = +8% de pista)
        item.sectorAdvancePercent = parseFloat((accuracyRatio * sectorWeightPercent).toFixed(2));
      }

      // Nueva distancia total acumulada (máximo 100% de la pista)
      item.newCumulativeDistance = Math.min(100, parseFloat((item.previousDistance + item.sectorAdvancePercent).toFixed(2)));
    });

    // 5. Calcular nuevo ranking del campeonato y adelantamientos (Deltas de posición)
    const ranking = [...roundResults].sort((a, b) => {
      if (b.newCumulativeDistance !== a.newCumulativeDistance) {
        return b.newCumulativeDistance - a.newCumulativeDistance;
      }
      if (b.cumulativeScore !== a.cumulativeScore) {
        return b.cumulativeScore - a.cumulativeScore;
      }
      return a.durationMs - b.durationMs;
    });

    ranking.forEach((r, idx) => {
      r.currentPosition = idx + 1;
      r.positionDelta = r.previousPosition - r.currentPosition; // Ej: P3 a P1 => 3 - 1 = +2 (Ganó 2 puestos)
    });

    // 6. Actualizar telemetría permanente
    roundResults.forEach(item => {
      const rankItem = ranking.find(rk => rk.teamId === item.teamId);
      item.currentPosition = rankItem.currentPosition;
      item.positionDelta = rankItem.positionDelta;

      this.state.teamTelemetry[item.teamId] = {
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

    const results = {
      caseId: this.state.currentCase.id,
      caseTitle: this.state.currentCase.title,
      sectorIndex: this.state.currentSectorIndex,
      totalSectors: this.state.totalSectors,
      maxPossibleScore,
      fastestPerfectTeamId,
      teams: roundResults,
      ranking,
      calculatedAt: Date.now()
    };

    this.state.calculatedResults = results;
    return results;
  }

  revealResults() {
    if (!this.state.calculatedResults) {
      this.calculateResults();
    }
    this.state.status = 'REVEALED';

    db.saveRaceResult({
      caseId: this.state.currentCase?.id,
      sectorIndex: this.state.currentSectorIndex,
      results: this.state.calculatedResults,
      telemetry: this.state.teamTelemetry
    });

    return this.state.calculatedResults;
  }

  nextSector() {
    this.state.currentSectorIndex = Math.min(this.state.totalSectors, this.state.currentSectorIndex + 1);
    this.state.status = 'LOBBY';
    this.state.currentCase = null;
    this.state.startTime = null;
    this.state.endTime = null;
    this.state.submissions = {};
    this.state.calculatedResults = null;

    // Actualizar previousDistance = currentDistance para la próxima animación
    Object.keys(this.state.teamTelemetry).forEach(teamId => {
      this.state.teamTelemetry[teamId].previousDistance = this.state.teamTelemetry[teamId].currentDistance;
      this.state.teamTelemetry[teamId].previousPosition = this.state.teamTelemetry[teamId].currentPosition;
    });

    Object.keys(this.state.connectedTeams).forEach(teamId => {
      this.state.connectedTeams[teamId].status = 'READY';
    });

    return this.getPublicState();
  }

  resetChampionship() {
    this.state.currentSectorIndex = 1;
    this.state.status = 'LOBBY';
    this.state.currentCase = null;
    this.state.startTime = null;
    this.state.endTime = null;
    this.state.submissions = {};
    this.state.calculatedResults = null;
    this.initTeamsTelemetry();

    Object.keys(this.state.connectedTeams).forEach(teamId => {
      this.state.connectedTeams[teamId].status = 'READY';
    });

    return this.getPublicState();
  }
}

export const raceController = new RaceController();
