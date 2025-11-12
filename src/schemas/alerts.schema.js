const Joi = require('joi');

/**
 * Schemas de validación para filtros de alertas
 */

// Schema para filtrar alertas
const getAlertsFiltersSchema = Joi.object({
  severity: Joi.string().valid('critical', 'warning', 'info').optional().messages({
    'any.only': 'La severidad debe ser: critical, warning o info',
  }),
  floorId: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'El ID del piso debe ser un número',
    'number.integer': 'El ID del piso debe ser un número entero',
    'number.min': 'El ID del piso debe ser mayor o igual a 1',
    'number.max': 'El ID del piso debe ser menor o igual a 100',
  }),
  type: Joi.string().valid(
    'occupancy',
    'temperature',
    'humidity',
    'power',
    'thermal_overload',
    'sudden_change'
  ).optional().messages({
    'any.only': 'El tipo debe ser: occupancy, temperature, humidity, power, thermal_overload o sudden_change',
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'El límite debe ser un número',
    'number.integer': 'El límite debe ser un número entero',
    'number.min': 'El límite debe ser al menos 1',
    'number.max': 'El límite no puede exceder 100',
  }),
});

module.exports = {
  getAlertsFiltersSchema,
};
