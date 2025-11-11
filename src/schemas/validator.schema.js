const Joi = require('joi');

/**
 * Schemas de validación para los endpoints de pisos
 */

// Schema para validar el ID del piso en params
const getFloorByIdSchema = Joi.object({
  id: Joi.number().integer().min(1).max(100).required().messages({
    'number.base': 'El ID debe ser un número',
    'number.integer': 'El ID debe ser un número entero',
    'number.min': 'El ID debe ser mayor o igual a 1',
    'number.max': 'El ID debe ser menor o igual a 100',
    'any.required': 'El ID es requerido',
  }),
});

// Schema para validar query params de historial
const getFloorHistorySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(1440).optional().messages({
    'number.base': 'El límite debe ser un número',
    'number.integer': 'El límite debe ser un número entero',
    'number.min': 'El límite debe ser al menos 1',
    'number.max': 'El límite no puede exceder 1440 (24 horas)',
  }),
});

// Schema para validar query params de predicciones
const getFloorPredictionsSchema = Joi.object({
  minutesAhead: Joi.number().integer().min(10).max(180).optional().messages({
    'number.base': 'Los minutos deben ser un número',
    'number.integer': 'Los minutos deben ser un número entero',
    'number.min': 'Los minutos deben ser al menos 10',
    'number.max': 'Los minutos no pueden exceder 180 (3 horas)',
  }),
});

// Schema combinado para rutas que usan params e ID
const floorParamsSchema = Joi.object({
  id: Joi.number().integer().min(1).max(100).required().messages({
    'number.base': 'El ID debe ser un número',
    'number.integer': 'El ID debe ser un número entero',
    'number.min': 'El ID debe ser mayor o igual a 1',
    'number.max': 'El ID debe ser menor o igual a 100',
    'any.required': 'El ID es requerido',
  }),
});

module.exports = {
  getFloorByIdSchema,
  getFloorHistorySchema,
  getFloorPredictionsSchema,
  floorParamsSchema,
};
