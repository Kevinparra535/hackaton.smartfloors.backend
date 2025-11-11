/* eslint-disable no-unused-vars */
// Detector de errores globales

// Middleware para capturar errores globales
function logErrors(err, req, res, next) {
  console.log('errors')
  console.error(err);

  // Si se envia el parametro error le decimos que es un Middleware tipo error
  next(err); // Envia el error al siguiente middleware
}

// Middleware para formatear los errores
// Siempre debe tener los 4 parametros
function errorHandler(err, req, res, next) {
  console.log('errors handler')
  res.status(500).json({
    error: err.message,
    stack: err.stack // En donde ocurrio el error
  });
  res.render('error', { error: err });
}

module.exports = { logErrors, errorHandler };
