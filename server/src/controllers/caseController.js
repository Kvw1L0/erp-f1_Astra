import { db } from '../config/database.js';

export const caseController = {
  getAllCases(req, res) {
    try {
      const cases = db.getCases();
      return res.json({ success: true, data: cases });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getCaseById(req, res) {
    try {
      const { id } = req.params;
      const caseItem = db.getCaseById(id);
      if (!caseItem) {
        return res.status(404).json({ success: false, message: 'Caso no encontrado' });
      }
      return res.json({ success: true, data: caseItem });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  createCase(req, res) {
    try {
      const caseData = req.body;
      if (!caseData.title || !caseData.steps || !Array.isArray(caseData.steps)) {
        return res.status(400).json({ success: false, message: 'El caso debe tener título y lista de pasos válidos' });
      }
      const newCase = db.createCase(caseData);
      return res.status(201).json({ success: true, data: newCase });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  updateCase(req, res) {
    try {
      const { id } = req.params;
      const caseData = req.body;
      const updatedCase = db.updateCase(id, caseData);
      if (!updatedCase) {
        return res.status(404).json({ success: false, message: 'Caso no encontrado' });
      }
      return res.json({ success: true, data: updatedCase });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteCase(req, res) {
    try {
      const { id } = req.params;
      const deleted = db.deleteCase(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Caso no encontrado' });
      }
      return res.json({ success: true, message: 'Caso eliminado exitosamente' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getTeams(req, res) {
    try {
      const teams = db.getTeams();
      return res.json({ success: true, data: teams });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  verifyPin(req, res) {
    try {
      const { pin } = req.body;
      if (!pin) {
        return res.status(400).json({ success: false, message: 'PIN requerido' });
      }
      const team = db.getTeamByPin(pin);
      if (!team) {
        return res.status(401).json({ success: false, message: 'PIN inválido. Ingrese un número de equipo del 1 al 10.' });
      }
      return res.json({
        success: true,
        data: {
          id: team.id,
          name: team.name,
          shortName: team.shortName,
          color: team.color
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
