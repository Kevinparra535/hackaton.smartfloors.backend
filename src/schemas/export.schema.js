const Joi = require('joi');

/**
 * Schemas de validación para exportación de datos
 */

// Schema para exportar alertas
const exportAlertsSchema = Joi.object({
  startDate: Joi.date().iso().optional().messages({
    'date.base': 'La fecha de inicio debe ser una fecha válida',
    'date.format': 'La fecha de inicio debe estar en formato ISO 8601',
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    'date.base': 'La fecha de fin debe ser una fecha válida',
    'date.format': 'La fecha de fin debe estar en formato ISO 8601',
    'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio',
  }),
  severity: Joi.string().valid('critical', 'warning', 'info').optional().messages({
    'any.only': 'La severidad debe ser: critical, warning o info',
  }),
  floorId: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'El ID del piso debe ser un número',
    'number.integer': 'El ID del piso debe ser un número entero',
    'number.min': 'El ID del piso debe ser mayor o igual a 1',
    'number.max': 'El ID del piso debe ser menor o igual a 100',
  }),
  type: Joi.string()
    .valid(
      'occupancy',
      'temperature',
      'humidity',
      'power',
      'thermal_overload',
      'sudden_change',
      'predictive_temperature',
      'predictive_humidity',
      'predictive_power',
      'predictive_thermal_overload',
    )
    .optional()
    .messages({
      'any.only':
        'El tipo debe ser: occupancy, temperature, humidity, power, thermal_overload, sudden_change, predictive_temperature, predictive_humidity, predictive_power o predictive_thermal_overload',
    }),
  isPredictive: Joi.boolean().optional().messages({
    'boolean.base': 'isPredictive debe ser true o false',
  }),
});

// Schema para exportar historial
const exportHistorySchema = Joi.object({
  startDate: Joi.date().iso().optional().messages({
    'date.base': 'La fecha de inicio debe ser una fecha válida',
    'date.format': 'La fecha de inicio debe estar en formato ISO 8601',
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    'date.base': 'La fecha de fin debe ser una fecha válida',
    'date.format': 'La fecha de fin debe estar en formato ISO 8601',
    'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio',
  }),
  floorId: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'El ID del piso debe ser un número',
    'number.integer': 'El ID del piso debe ser un número entero',
    'number.min': 'El ID del piso debe ser mayor o igual a 1',
    'number.max': 'El ID del piso debe ser menor o igual a 100',
  }),
  limit: Joi.number().integer().min(1).max(10000).optional().messages({
    'number.base': 'El límite debe ser un número',
    'number.integer': 'El límite debe ser un número entero',
    'number.min': 'El límite debe ser al menos 1',
    'number.max': 'El límite no puede exceder 10000',
  }),
});

module.exports = {
  exportAlertsSchema,
  exportHistorySchema,
};
