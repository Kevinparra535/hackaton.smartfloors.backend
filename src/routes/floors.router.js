/**
 * Rutas de API para pisos
 */

const express = require('express');
const router = express.Router();

const {
  getAllFloors,
  getFloorById,
  getFloorHistory,
  getFloorPredictions,
  getAllAlerts,
  getStats,
} = require('../controllers/floors.controller');

const validatorHandler = require('../middlewares/validator.handler');
const {
  floorParamsSchema,
  getFloorHistorySchema,
  getFloorPredictionsSchema,
} = require('../schemas/validator.schema');
const { getAlertsFiltersSchema } = require('../schemas/alerts.schema');

// GET /api/v1/floors - Obtener todos los pisos
router.get('/floors', getAllFloors);

// GET /api/v1/floors/stats - Estadísticas generales
router.get('/floors/stats', getStats);

// GET /api/v1/floors/:id - Obtener un piso específico
router.get(
  '/floors/:id',
  validatorHandler(floorParamsSchema, 'params'),
  getFloorById
);

// GET /api/v1/floors/:id/history - Obtener historial de un piso
router.get(
  '/floors/:id/history',
  validatorHandler(floorParamsSchema, 'params'),
  validatorHandler(getFloorHistorySchema, 'query'),
  getFloorHistory
);

// GET /api/v1/floors/:id/predictions - Obtener predicciones de un piso
router.get(
  '/floors/:id/predictions',
  validatorHandler(floorParamsSchema, 'params'),
  validatorHandler(getFloorPredictionsSchema, 'query'),
  getFloorPredictions
);

// GET /api/v1/alerts - Obtener todas las alertas con filtros opcionales
// Filtros: ?severity=critical&floorId=3&type=temperature&limit=10
router.get('/alerts', validatorHandler(getAlertsFiltersSchema, 'query'), getAllAlerts);

module.exports = router;
