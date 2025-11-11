/* eslint-disable no-console */

/**
 * Controlador de notificaciones por email
 * Maneja las solicitudes REST relacionadas con el envío de emails
 */

const EmailService = require('../services/email.services');

// Instancia del servicio de email
let emailService = null;

/**
 * Inicializa el servicio de email
 */
const initializeEmailService = () => {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
};

/**
 * Obtiene la instancia del servicio (útil para otros módulos)
 */
const getEmailService = () => {
  if (!emailService) {
    return initializeEmailService();
  }
  return emailService;
};

/**
 * GET /api/v1/email/status
 * Obtiene el estado de configuración del servicio de email
 */
const getEmailStatus = (req, res) => {
  try {
    const service = getEmailService();
    const config = service.checkConfiguration();
    const stats = service.getStats();

    res.json({
      success: true,
      data: {
        ...config,
        stats,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en getEmailStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado del servicio de email',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/email/test
 * Envía un email de prueba
 * Body: { email: "test@example.com" }
 *
 * TODO: IMPLEMENTAR LÓGICA DE ENVÍO
 */
const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El campo email es requerido',
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido',
      });
    }

    const service = getEmailService();

    // TODO: Descomentar cuando se implemente el método sendTestEmail
    // const result = await service.sendTestEmail(email);

    // Placeholder temporal
    const result = {
      sent: false,
      reason: 'Método sendTestEmail() no implementado. Ver TODO en email.services.js',
    };

    if (result.sent) {
      res.json({
        success: true,
        message: 'Email de prueba enviado correctamente',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'No se pudo enviar el email de prueba',
        reason: result.reason || result.error,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('Error en sendTestEmail:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar email de prueba',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/email/alert
 * Envía una alerta por email manualmente
 * Body: { alert: {...} } (objeto de alerta completo)
 *
 * TODO: IMPLEMENTAR LÓGICA DE ENVÍO
 */
const sendAlertEmail = async (req, res) => {
  try {
    const { alert } = req.body;

    if (!alert) {
      return res.status(400).json({
        success: false,
        message: 'El campo alert es requerido',
      });
    }

    // Validar estructura mínima de la alerta
    if (!alert.floorId || !alert.severity || !alert.anomalies) {
      return res.status(400).json({
        success: false,
        message: 'La alerta debe contener: floorId, severity, anomalies',
      });
    }

    const service = getEmailService();

    // TODO: Descomentar cuando se implemente el método sendAlert
    // const result = await service.sendAlert(alert);

    // Placeholder temporal
    const result = {
      sent: false,
      reason: 'Método sendAlert() no implementado. Ver TODO en email.services.js',
    };

    if (result.sent) {
      res.json({
        success: true,
        message: 'Alerta enviada por email correctamente',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'No se pudo enviar la alerta por email',
        reason: result.reason || result.error,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('Error en sendAlertEmail:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar alerta por email',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/email/summary
 * Envía resumen diario de alertas
 * Body: { summary: {...} }
 *
 * TODO: IMPLEMENTAR LÓGICA DE ENVÍO
 */
const sendDailySummary = async (req, res) => {
  try {
    const { summary } = req.body;

    if (!summary) {
      return res.status(400).json({
        success: false,
        message: 'El campo summary es requerido',
      });
    }

    const service = getEmailService();

    // TODO: Descomentar cuando se implemente el método sendDailySummary
    // const result = await service.sendDailySummary(summary);

    // Placeholder temporal
    const result = {
      sent: false,
      reason: 'Método sendDailySummary() no implementado. Ver TODO en email.services.js',
    };

    if (result.sent) {
      res.json({
        success: true,
        message: 'Resumen diario enviado correctamente',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'No se pudo enviar el resumen diario',
        reason: result.reason || result.error,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('Error en sendDailySummary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar resumen diario',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/email/clear-cooldowns
 * Limpia los cooldowns activos (útil para testing)
 */
const clearCooldowns = (req, res) => {
  try {
    const service = getEmailService();
    service.clearCooldowns();
    service.clearRateLimiting();

    res.json({
      success: true,
      message: 'Cooldowns y rate limiting limpiados',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en clearCooldowns:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar cooldowns',
      error: error.message,
    });
  }
};

module.exports = {
  initializeEmailService,
  getEmailService,
  getEmailStatus,
  sendTestEmail,
  sendAlertEmail,
  sendDailySummary,
  clearCooldowns,
};
