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

// GET /api/v1/floors - Obtener todos los pisos
router.get('/floors', getAllFloors);

// GET /api/v1/floors/stats - Estadísticas generales
router.get('/floors/stats', getStats);

// GET /api/v1/floors/:id - Obtener un piso específico
router.get('/floors/:id', getFloorById);

// GET /api/v1/floors/:id/history - Obtener historial de un piso
router.get('/floors/:id/history', getFloorHistory);

// GET /api/v1/floors/:id/predictions - Obtener predicciones de un piso
router.get('/floors/:id/predictions', getFloorPredictions);

// GET /api/v1/alerts - Obtener todas las alertas
router.get('/alerts', getAllAlerts);

module.exports = router;
