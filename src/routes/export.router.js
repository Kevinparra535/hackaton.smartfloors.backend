const express = require('express');
const { exportAlerts, exportHistory, getExportStats } = require('../controllers/export.controller');
const validatorHandler = require('../middlewares/validator.handler');
const { exportAlertsSchema, exportHistorySchema } = require('../schemas/export.schema');

const router = express.Router();

/**
 * GET /api/v1/export/stats
 * Obtiene estadísticas de datos disponibles para exportar
 */
router.get('/stats', getExportStats);

/**
 * GET /api/v1/export/alerts/csv
 * Exporta alertas a formato CSV
 * Query params: startDate, endDate, severity, floorId, type, isPredictive
 */
router.get(
  '/alerts/csv',
  validatorHandler(exportAlertsSchema, 'query'),
  exportAlerts,
);

/**
 * GET /api/v1/export/history/csv
 * Exporta historial de datos del simulador a CSV
 * Query params: startDate, endDate, floorId, limit
 */
router.get(
  '/history/csv',
  validatorHandler(exportHistorySchema, 'query'),
  exportHistory,
);

module.exports = router;
