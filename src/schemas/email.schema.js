/**
 * Schemas de validación para endpoints de email
 */

const Joi = require('joi');

/**
 * Schema para envío de email de prueba
 * POST /api/v1/email/test
 */
const sendTestEmailSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'El email debe ser un string',
      'string.email': 'El email debe tener un formato válido',
      'any.required': 'El email es requerido',
    }),
});

/**
 * Schema para envío de alerta por email
 * POST /api/v1/email/alert
 */
const sendAlertEmailSchema = Joi.object({
  alert: Joi.object({
    floorId: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.base': 'El floorId debe ser un número',
        'number.integer': 'El floorId debe ser un entero',
        'number.min': 'El floorId debe ser mayor o igual a 1',
        'any.required': 'El floorId es requerido',
      }),

    floorName: Joi.string()
      .optional()
      .messages({
        'string.base': 'El floorName debe ser un string',
      }),

    buildingName: Joi.string()
      .optional()
      .messages({
        'string.base': 'El buildingName debe ser un string',
      }),

    severity: Joi.string()
      .valid('critical', 'warning', 'info')
      .required()
      .messages({
        'string.base': 'La severidad debe ser un string',
        'any.only': 'La severidad debe ser: critical, warning o info',
        'any.required': 'La severidad es requerida',
      }),

    anomalies: Joi.array()
      .items(
        Joi.object({
          type: Joi.string().required(),
          severity: Joi.string().valid('critical', 'warning', 'info').required(),
          metric: Joi.string().required(),
          value: Joi.number().required(),
          message: Joi.string().required(),
          recommendation: Joi.string().required(),
          timestamp: Joi.string().optional(),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.base': 'Las anomalías deben ser un array',
        'array.min': 'Debe haber al menos una anomalía',
        'any.required': 'Las anomalías son requeridas',
      }),

    timestamp: Joi.string()
      .isoDate()
      .optional()
      .messages({
        'string.base': 'El timestamp debe ser un string',
        'string.isoDate': 'El timestamp debe ser una fecha ISO válida',
      }),
  }).required().messages({
    'object.base': 'El campo alert debe ser un objeto',
    'any.required': 'El campo alert es requerido',
  }),
});

/**
 * Schema para envío de resumen diario
 * POST /api/v1/email/summary
 */
const sendDailySummarySchema = Joi.object({
  summary: Joi.object({
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        'string.base': 'La fecha debe ser un string',
        'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD',
        'any.required': 'La fecha es requerida',
      }),

    totalAlerts: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.base': 'El total de alertas debe ser un número',
        'number.integer': 'El total de alertas debe ser un entero',
        'number.min': 'El total de alertas debe ser mayor o igual a 0',
        'any.required': 'El total de alertas es requerido',
      }),

    criticalAlerts: Joi.number()
      .integer()
      .min(0)
      .optional(),

    warningAlerts: Joi.number()
      .integer()
      .min(0)
      .optional(),

    infoAlerts: Joi.number()
      .integer()
      .min(0)
      .optional(),

    alertsByFloor: Joi.object()
      .optional()
      .messages({
        'object.base': 'alertsByFloor debe ser un objeto',
      }),

    topAnomalies: Joi.array()
      .optional()
      .messages({
        'array.base': 'topAnomalies debe ser un array',
      }),
  }).required().messages({
    'object.base': 'El campo summary debe ser un objeto',
    'any.required': 'El campo summary es requerido',
  }),
});

module.exports = {
  sendTestEmailSchema,
  sendAlertEmailSchema,
  sendDailySummarySchema,
};
