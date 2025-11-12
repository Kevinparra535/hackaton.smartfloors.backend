const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');

/**
 * @route   GET /api/v1/email/status
 * @desc    Obtiene el estado de configuración del servicio
 * @access  Public
 */
router.get('/status', emailController.getEmailStatus);

/**
 * @route   POST /api/v1/email/test
 * @desc    Envía un email de prueba
 * @access  Public
 * @body    { email: "test@example.com" }
 */
router.post('/test', emailController.sendTestEmail);

/**
 * @route   POST /api/v1/email/alert
 * @desc    Envía una alerta por email
 * @access  Public
 * @body    { alert: {...} }
 */
router.post('/alert', emailController.sendAlertEmail);

/**
 * @route   POST /api/v1/email/summary
 * @desc    Envía resumen diario de alertas
 * @access  Public
 * @body    { summary: {...} }
 */
router.post('/summary', emailController.sendDailySummary);

/**
 * @route   POST /api/v1/email/clear-cooldowns
 * @desc    Limpia cooldowns y rate limiting (testing)
 * @access  Public
 */
router.post('/clear-cooldowns', emailController.clearCooldowns);

module.exports = router;