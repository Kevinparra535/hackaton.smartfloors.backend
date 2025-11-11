/* eslint-disable no-console */
const express = require('express');

// Creamos una nueva aplicacion de express
const app = express();

// Puerto
const port = 3000;

// Le pasamos una ruta
app.get('/', (req, res) => {
  res.send('Hello world!'); // Respuesta
});

// Le decimos que escuche en el puerto 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
