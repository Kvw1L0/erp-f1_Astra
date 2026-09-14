/**
 * Motor de Generación y Exportación Ejecutiva de Reportes CSV / Excel
 * Diseñado para Capacitación Corporativa NetSuite ERP Formula 1
 * Incluye UTF-8 BOM (\uFEFF) para visualización nativa sin corrupción de caracteres en Excel.
 */

import { TEAMS_LIST } from './firebaseRaceEngine';

export function exportTrainingReportCsv({ gameState = {}, telemetry = {}, teamsProfiles = {}, history = {} }) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
  const filename = `Reporte_ERP_Formula_1_${dateStr}_${timeStr}.csv`;

  const rows = [];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // ─────────────────────────────────────────────────────────────
  // ENCABEZADO DEL EVENTO
  // ─────────────────────────────────────────────────────────────
  rows.push([escapeCsv('GRAN PREMIO DE LA EFICIENCIA - ERP FORMULA 1')]);
  rows.push([escapeCsv(`FECHA DE EMISIÓN: ${now.toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`)]);
  rows.push([escapeCsv(`SECTOR FINAL ALCANZADO: Sector ${gameState?.currentSectorIndex || 1} de ${gameState?.totalSectors || 10}`)]);
  rows.push([escapeCsv(`SISTEMA: NetSuite ERP Gamified Training Platform • Veltis Racing`)]);
  rows.push([]);

  // ─────────────────────────────────────────────────────────────
  // 1. CLASIFICACIÓN GENERAL Y PODIO DE ESCUDERÍAS
  // ─────────────────────────────────────────────────────────────
  rows.push([escapeCsv('=== 1. CLASIFICACIÓN GENERAL Y PODIO DE ESCUDERÍAS ===')]);
  rows.push([
    escapeCsv('POSICIÓN'),
    escapeCsv('ESCUDERÍA OFICIAL'),
    escapeCsv('SUBNOMBRE DE EQUIPO'),
    escapeCsv('NÓMINA DE PILOTOS (INTEGRANTES)'),
    escapeCsv('PUNTAJE ACUMULADO (PTS)'),
    escapeCsv('% CIRCUITO COMPLETADO'),
    escapeCsv('DELTA DE POSICIONES'),
    escapeCsv('ESTADO FINAL')
  ]);

  // Ordenar los 10 equipos por distancia o puntaje
  const sortedTeams = TEAMS_LIST.map(team => {
    const telem = telemetry[team.id] || {};
    const profile = teamsProfiles[team.id] || {};
    return {
      id: team.id,
      name: team.name,
      subname: profile.subname || team.subname || 'Sin subnombre',
      participants: Array.isArray(profile.participants) && profile.participants.length > 0
        ? profile.participants.join(', ')
        : (team.participants?.join(', ') || `Mesa ${team.id}`),
      score: telem.cumulativeScore || 0,
      distance: telem.currentDistance || 0,
      position: telem.currentPosition || team.id,
      positionDelta: telem.positionDelta || 0
    };
  }).sort((a, b) => {
    if (b.distance !== a.distance) return b.distance - a.distance;
    return b.score - a.score;
  });

  sortedTeams.forEach((t, idx) => {
    const pos = idx + 1;
    const medal = pos === 1 ? '🥇 1º Puesto (Campeón)' : pos === 2 ? '🥈 2º Puesto (Subcampeón)' : pos === 3 ? '🥉 3º Puesto (Podio)' : `${pos}º Puesto`;
    rows.push([
      escapeCsv(medal),
      escapeCsv(t.name),
      escapeCsv(t.subname),
      escapeCsv(t.participants),
      escapeCsv(t.score),
      escapeCsv(`${t.distance.toFixed(1)}%`),
      escapeCsv(t.positionDelta > 0 ? `+${t.positionDelta} ▲` : t.positionDelta < 0 ? `${t.positionDelta} ▼` : '0 ='),
      escapeCsv(t.distance >= 100 ? 'Bandera a Cuadros' : 'En Circuito')
    ]);
  });

  rows.push([]);

  // ─────────────────────────────────────────────────────────────
  // 2. DETALLE DE DESEMPEÑO POR SECTOR / CASO NETSUITE
  // ─────────────────────────────────────────────────────────────
  rows.push([escapeCsv('=== 2. DETALLE DE TELEMETRÍA POR SECTOR / CASO NETSUITE ===')]);
  rows.push([
    escapeCsv('SECTOR'),
    escapeCsv('CASO ERP NETSUITE'),
    escapeCsv('ESCUDERÍA'),
    escapeCsv('SUBNOMBRE'),
    escapeCsv('PUNTAJE OBTENIDO (PTS)'),
    escapeCsv('TIEMPO EN PITS (SEGUNDOS)'),
    escapeCsv('¿ACIERTO MÁXIMO (POLE)?'),
    escapeCsv('ESTADO DE PARADA')
  ]);

  const historyEntries = Object.keys(history || {}).sort();

  if (historyEntries.length > 0) {
    historyEntries.forEach(key => {
      const round = history[key];
      const sectorNum = round.sectorIndex || key.replace('sector_', '');
      const caseTitle = round.caseTitle || `Caso Sector ${sectorNum}`;
      const teams = round.teams || [];

      teams.forEach(t => {
        const profile = teamsProfiles[t.teamId] || {};
        rows.push([
          escapeCsv(`Sector ${sectorNum}`),
          escapeCsv(caseTitle),
          escapeCsv(t.teamName),
          escapeCsv(profile.subname || t.shortName),
          escapeCsv(t.caseScore || 0),
          escapeCsv(t.durationFormatted || (t.durationMs ? (t.durationMs / 1000).toFixed(2) + 's' : '--')),
          escapeCsv(t.isPerfect ? 'SÍ (100% Precisión)' : 'NO'),
          escapeCsv(t.isFastestPerfect ? 'POLE POSITION BOOST (+20%)' : t.isDRSActive ? 'DRS RECUPERACIÓN (+10%)' : 'PARADA ESTÁNDAR')
        ]);
      });
    });
  } else if (gameState?.calculatedResults?.teams) {
    // Si no hay historial acumulado, exportar ronda actual
    const curRound = gameState.calculatedResults;
    const sectorNum = curRound.sectorIndex || 1;
    const caseTitle = curRound.caseTitle || `Caso Sector ${sectorNum}`;
    curRound.teams.forEach(t => {
      const profile = teamsProfiles[t.teamId] || {};
      rows.push([
        escapeCsv(`Sector ${sectorNum}`),
        escapeCsv(caseTitle),
        escapeCsv(t.teamName),
        escapeCsv(profile.subname || t.shortName),
        escapeCsv(t.caseScore || 0),
        escapeCsv(t.durationFormatted || '--'),
        escapeCsv(t.isPerfect ? 'SÍ (100% Precisión)' : 'NO'),
        escapeCsv(t.isFastestPerfect ? 'POLE POSITION BOOST (+20%)' : t.isDRSActive ? 'DRS (+10%)' : 'NORMAL')
      ]);
    });
  } else {
    rows.push([
      escapeCsv('Sector 1'),
      escapeCsv(gameState?.currentCase?.title || 'Sector en Preparación'),
      escapeCsv('Todos los equipos'),
      escapeCsv('--'),
      escapeCsv('0'),
      escapeCsv('--'),
      escapeCsv('Pendiente'),
      escapeCsv('Ronda sin finalizar')
    ]);
  }

  rows.push([]);

  // ─────────────────────────────────────────────────────────────
  // 3. ANÁLISIS DE BRECHAS PEDAGÓGICAS NETSUITE ERP
  // ─────────────────────────────────────────────────────────────
  rows.push([escapeCsv('=== 3. ANÁLISIS DE BRECHAS DE APRENDIZAJE NETSUITE ERP (PARA RRHH Y FACILITADOR) ===')]);
  rows.push([
    escapeCsv('MÉTRICA EJECUTIVA'),
    escapeCsv('VALOR REGISTRADO'),
    escapeCsv('DIAGNÓSTICO PEDAGÓGICO / RECOMENDACIÓN')
  ]);

  const totalPointsAwarded = sortedTeams.reduce((acc, t) => acc + t.score, 0);
  const avgTeamScore = (totalPointsAwarded / (sortedTeams.length || 1)).toFixed(1);
  const winner = sortedTeams[0];

  rows.push([
    escapeCsv('Escudería Ganadora del Gran Premio'),
    escapeCsv(`${winner.name} ("${winner.subname}")`),
    escapeCsv('Liderazgo destacado en velocidad y precisión de procesos ERP.')
  ]);
  rows.push([
    escapeCsv('Promedio General de Puntaje por Equipo'),
    escapeCsv(`${avgTeamScore} Puntos`),
    escapeCsv(avgTeamScore >= 400 ? 'Nivel Alto de Dominio: El grupo demostró excelente comprensión de NetSuite.' : 'Nivel Intermedio: Se recomienda sesión de refuerzo en los módulos con menor puntaje.')
  ]);
  rows.push([
    escapeCsv('Total de Participantes Capacitados'),
    escapeCsv('100 Participantes (10 Mesas de Trabajo)'),
    escapeCsv('Cobertura total del evento con gamificación en tiempo real.')
  ]);

  // Convertir a texto CSV con UTF-8 BOM
  const csvContent = '\uFEFF' + rows.map(r => r.join(';')).join('\r\n');

  // Disparar descarga en el navegador
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return { success: true, filename };
}
