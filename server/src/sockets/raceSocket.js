import { raceController } from '../controllers/raceController.js';
import { db } from '../config/database.js';

export function setupRaceSockets(io) {
  io.on('connection', (socket) => {
    // Sincronización inicial
    socket.emit('state_sync', raceController.getPublicState());

    // 1. PARTICIPANTE
    socket.on('join_participant', ({ teamId, pin }, callback) => {
      const team = db.getTeamByPin(pin || teamId);
      if (!team) {
        if (callback) callback({ success: false, message: 'PIN de equipo inválido' });
        return;
      }

      socket.teamId = team.id;
      socket.join(`team_${team.id}`);
      socket.join('participants');

      raceController.registerTeamConnection(team.id, socket.id);

      if (callback) {
        callback({
          success: true,
          team: {
            id: team.id,
            name: team.name,
            shortName: team.shortName,
            color: team.color
          },
          gameState: raceController.getPublicState()
        });
      }

      io.to('admin').emit('admin_telemetry_update', raceController.getAdminState());
      io.emit('team_presence_update', {
        teamId: team.id,
        connected: true,
        connectedCount: Object.keys(raceController.state.connectedTeams).length
      });
    });

    // 2. PANTALLA GIGANTE
    socket.on('join_race_screen', () => {
      socket.join('race_screen');
      socket.emit('state_sync', raceController.getPublicState());
    });

    // 3. ADMIN
    socket.on('join_admin', () => {
      socket.join('admin');
      socket.emit('admin_state_sync', raceController.getAdminState());
    });

    // 4. ADMIN: Iniciar un Caso / Sector
    socket.on('admin_start_case', ({ caseId, sectorIndex }, callback) => {
      try {
        const startData = raceController.startCase(caseId, sectorIndex);
        console.log(`[Race] Caso iniciado (Sector ${startData.currentSectorIndex}/${startData.totalSectors}): ${caseId}`);

        io.emit('case_started', {
          case: raceController.getPublicState().currentCase,
          startTime: startData.startTime,
          currentSectorIndex: startData.currentSectorIndex,
          totalSectors: startData.totalSectors,
          durationLimitSeconds: startData.durationLimitSeconds,
          teamTelemetry: raceController.state.teamTelemetry
        });

        io.to('admin').emit('admin_telemetry_update', raceController.getAdminState());
        if (callback) callback({ success: true, startData });
      } catch (error) {
        if (callback) callback({ success: false, message: error.message });
      }
    });

    // 5. PARTICIPANTE: Enviar respuestas
    socket.on('participant_submit', ({ teamId, answers }, callback) => {
      try {
        const id = teamId || socket.teamId;
        if (!id) throw new Error('Equipo no identificado');

        const submission = raceController.submitAnswers(id, answers);

        if (callback) {
          callback({
            success: true,
            message: 'Procesando telemetría en Pits... ¡Mira la pantalla central!',
            durationFormatted: submission.durationSeconds + 's'
          });
        }

        socket.emit('submission_locked', {
          teamId: id,
          submittedAt: submission.submittedAt,
          durationFormatted: submission.durationSeconds + 's',
          currentPosition: raceController.state.teamTelemetry[id]?.currentPosition || id
        });

        io.to('admin').emit('admin_telemetry_update', raceController.getAdminState());
        io.to('admin').emit('team_submitted_alert', {
          teamId: id,
          teamName: submission.teamName,
          durationFormatted: submission.durationSeconds + 's',
          score: submission.score
        });

        io.to('race_screen').emit('submission_count_update', {
          submissionsCount: Object.keys(raceController.state.submissions).length,
          totalTeams: 10
        });

      } catch (error) {
        if (callback) callback({ success: false, message: error.message });
      }
    });

    // 6. ADMIN: Bloquear caso
    socket.on('admin_lock_case', (callback) => {
      try {
        const results = raceController.lockCase();
        io.emit('case_locked', { message: 'Tiempo de Pits concluido.' });
        io.to('admin').emit('admin_telemetry_update', raceController.getAdminState());
        if (callback) callback({ success: true, results });
      } catch (error) {
        if (callback) callback({ success: false, message: error.message });
      }
    });

    // 7. ADMIN: Revelar Resultados
    socket.on('admin_reveal_results', (callback) => {
      try {
        const results = raceController.revealResults();
        io.emit('results_revealed', results);
        io.to('admin').emit('admin_telemetry_update', raceController.getAdminState());
        if (callback) callback({ success: true, results });
      } catch (error) {
        if (callback) callback({ success: false, message: error.message });
      }
    });

    // 8. ADMIN: SIMULAR Y FINALIZAR CASO AUTOMÁTICAMENTE (BOTÓN DE PRUEBA RÁPIDA)
    socket.on('admin_auto_finish_case', (callback) => {
      try {
        // Si no hay caso activo, iniciar el primero disponible
        if (raceController.state.status !== 'ACTIVE_CASE') {
          const firstCase = db.getCases()[0];
          raceController.startCase(firstCase?.id);
        }

        // Generar envíos simulados para todos los equipos pendientes
        raceController.simulateMissingSubmissions();

        // Bloquear y calcular
        raceController.lockCase();

        // Revelar resultados inmediatamente
        const results = raceController.revealResults();

        // Notificar a todos los clientes
        io.emit('results_revealed', results);
        io.to('admin').emit('admin_telemetry_update', raceController.getAdminState());

        if (callback) callback({ success: true, results });
      } catch (error) {
        console.error('Error en auto finish:', error);
        if (callback) callback({ success: false, message: error.message });
      }
    });

    // 9. ADMIN: Siguiente Sector / Caso
    socket.on('admin_next_sector', (callback) => {
      try {
        const state = raceController.nextSector();
        io.emit('lobby_reset', state);
        io.to('admin').emit('admin_telemetry_update', raceController.getAdminState());
        if (callback) callback({ success: true, state });
      } catch (error) {
        if (callback) callback({ success: false, message: error.message });
      }
    });

    // 10. ADMIN: Reiniciar Campeonato
    socket.on('admin_reset_championship', (callback) => {
      try {
        const state = raceController.resetChampionship();
        io.emit('championship_reset', state);
        io.to('admin').emit('admin_telemetry_update', raceController.getAdminState());
        if (callback) callback({ success: true });
      } catch (error) {
        if (callback) callback({ success: false, message: error.message });
      }
    });

    // Desconexión
    socket.on('disconnect', () => {
      raceController.unregisterSocket(socket.id);
      io.to('admin').emit('admin_telemetry_update', raceController.getAdminState());
    });
  });
}
