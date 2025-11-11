const boom = require('@hapi/boom');

// Esta funcion se encarga de validar los datos via la api de joi

// El esquema es el formato que se espera de los datos
// La propiedad de la peticion es el nombre de la propiedad que se espera
function validatorHandler(schema, property) {
  // Creamos un middleware dinamico con un closure
  return function (req, res, next) {
    // req puede ser query, params, body etc...

    const data = req[property];
    const { error } = schema.validate(data);

    if (error) {
      // Si hay un error en la validacion, se arroja un error de bad request
      next(boom.badRequest(error)); // Esto es para que el middleware se encarge
    }

    next();
  };
}

module.exports = validatorHandler;
