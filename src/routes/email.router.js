/**
 * Rutas de API para notificaciones por email
 */

const express = require('express');
const router = express.Router();

const {
  getEmailStatus,
  sendTestEmail,
  sendAlertEmail,
  sendDailySummary,
  clearCooldowns,
} = require('../controllers/email.controller');

// Schemas de validación
const validatorHandler = require('../middlewares/validator.handler');
const {
  sendTestEmailSchema,
  sendAlertEmailSchema,
  sendDailySummarySchema,
} = require('../schemas/email.schema');

/**
 * GET /api/v1/email/status
 * Obtiene el estado de configuración del servicio de email
 *
 * Respuesta:
 * {
 *   success: true,
 *   data: {
 *     configured: true/false,
 *     enabled: true/false,
 *     missingConfig: [],
 *     hasRecipients: true/false,
 *     stats: { ... }
 *   }
 * }
 */
router.get('/status', getEmailStatus);

/**
 * POST /api/v1/email/test
 * Envía un email de prueba al destinatario especificado
 *
 * Body:
 * {
 *   "email": "test@example.com"
 * }
 *
 * TODO: Validación implementada, completar lógica de envío en controller
 */
router.post(
  '/test',
  validatorHandler(sendTestEmailSchema, 'body'),
  sendTestEmail
);

/**
 * POST /api/v1/email/alert
 * Envía una alerta por email manualmente
 *
 * Body:
 * {
 *   "alert": {
 *     "floorId": 1,
 *     "floorName": "Piso 1",
 *     "buildingName": "Edificio Principal",
 *     "severity": "critical",
 *     "anomalies": [
 *       {
 *         "type": "occupancy",
 *         "severity": "critical",
 *         "metric": "Ocupación",
 *         "value": 95,
 *         "message": "Ocupación crítica",
 *         "recommendation": "Activar ventilación adicional"
 *       }
 *     ],
 *     "timestamp": "2025-11-11T..."
 *   }
 * }
 *
 * TODO: Validación implementada, completar lógica de envío en controller
 */
router.post(
  '/alert',
  validatorHandler(sendAlertEmailSchema, 'body'),
  sendAlertEmail
);

/**
 * POST /api/v1/email/summary
 * Envía resumen diario de alertas
 *
 * Body:
 * {
 *   "summary": {
 *     "date": "2025-11-11",
 *     "totalAlerts": 15,
 *     "criticalAlerts": 2,
 *     "warningAlerts": 8,
 *     "infoAlerts": 5,
 *     "alertsByFloor": { ... },
 *     "topAnomalies": [ ... ]
 *   }
 * }
 *
 * TODO: Validación implementada, completar lógica de envío en controller
 */
router.post(
  '/summary',
  validatorHandler(sendDailySummarySchema, 'body'),
  sendDailySummary
);

/**
 * POST /api/v1/email/clear-cooldowns
 * Limpia los cooldowns activos (útil para testing)
 *
 * No requiere body
 */
router.post('/clear-cooldowns', clearCooldowns);

module.exports = router;
