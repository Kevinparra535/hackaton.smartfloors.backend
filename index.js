/* eslint-disable no-console */
const express = require('express');

// Creamos una nueva aplicacion de express
const app = express();

// Puerto
const port = 3000;

// Sistema de rutas
const routerApi = require('./src/routes/index');

// Le decimos que escuche en el puerto 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

routerApi(app);
