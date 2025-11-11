/* eslint-disable no-console */
require('dotenv').config();
const { server } = require('./src/app');

// Puerto
const port = process.env.PORT || 3000;

// Le decimos que escuche en el puerto especificado
server.listen(port, () => {
  console.log('🚀 ========================================');
  console.log(`🚀 SmartFloors Backend iniciado en puerto ${port}`);
  console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Health check: http://localhost:${port}/health`);
  console.log(`🚀 API REST: http://localhost:${port}/api/v1/`);
  console.log(`🚀 WebSocket: ws://localhost:${port}`);
  console.log('🚀 ========================================');
});
