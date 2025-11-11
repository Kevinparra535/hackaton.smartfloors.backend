/* eslint-disable no-console */

/**
 * Configuración de Socket.IO
 * Maneja comunicación en tiempo real con el frontend
 */

const FloorSimulator = require('../services/simulator.services');
const PredictionService = require('../services/prediction.services');
const AlertService = require('../services/alerts.services');

let simulator;
let predictionService;
let alertService;
let simulationInterval;

/**
 * Inicializa Socket.IO y los servicios
 */
function initializeSockets(io) {
  // Inicializar servicios
  const numberOfFloors = parseInt(process.env.NUMBER_OF_FLOORS) || 5;
  simulator = new FloorSimulator(numberOfFloors);
  predictionService = new PredictionService();
  alertService = new AlertService();

  console.log(`✅ Servicios inicializados para ${numberOfFloors} pisos`);

  // Eventos de conexión
  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // Enviar datos iniciales al conectarse
    socket.emit('initial-data', {
      floors: simulator.getCurrentData(),
      timestamp: new Date().toISOString(),
    });

    // Solicitar datos históricos
    socket.on('request-history', (data) => {
      const { floorId, limit } = data;
      const history = simulator.getFloorHistory(floorId, limit || 60);

      socket.emit('history-data', {
        floorId,
        history,
        timestamp: new Date().toISOString(),
      });
    });

    // Solicitar predicciones
    socket.on('request-prediction', (data) => {
      const { floorId, minutesAhead } = data;
      const history = simulator.getFloorHistory(floorId, 30);
      const predictions = predictionService.predictFloor(history, minutesAhead || 60);

      socket.emit('prediction-data', {
        floorId,
        predictions,
        timestamp: new Date().toISOString(),
      });
    });

    // Solicitar alertas
    socket.on('request-alerts', () => {
      const alerts = alertService.getAlerts();

      socket.emit('alerts-data', {
        alerts,
        timestamp: new Date().toISOString(),
      });
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  // Iniciar simulación
  startSimulation(io);

  console.log('🚀 Socket.IO configurado correctamente');
}

/**
 * Inicia la simulación de datos
 */
function startSimulation(io) {
  const interval = parseInt(process.env.SIMULATION_INTERVAL) || 60000; // 60 segundos por defecto

  console.log(`⏱️  Iniciando simulación cada ${interval / 1000} segundos`);

  // Generar datos inmediatamente
  generateAndEmitData(io);

  // Generar datos periódicamente
  simulationInterval = setInterval(() => {
    generateAndEmitData(io);
  }, interval);
}

/**
 * Genera datos y los emite a todos los clientes
 */
function generateAndEmitData(io) {
  // Generar nuevos datos
  const newData = simulator.generateData();

  // Detectar anomalías y generar alertas
  const alerts = [];
  newData.forEach((floorData) => {
    const history = simulator.getFloorHistory(floorData.floorId, 10);
    const alert = alertService.generateAlert(floorData.floorId, floorData, history);

    if (alert) {
      alerts.push(alert);
    }
  });

  // Generar predicciones para cada piso
  const predictions = newData.map((floorData) => {
    const history = simulator.getFloorHistory(floorData.floorId, 30);
    return {
      floorId: floorData.floorId,
      predictions: predictionService.predictFloor(history, 60),
    };
  });

  // Emitir datos a todos los clientes conectados
  io.emit('floor-data', {
    floors: newData,
    timestamp: new Date().toISOString(),
  });

  // Emitir alertas si hay
  if (alerts.length > 0) {
    io.emit('new-alerts', {
      alerts,
      timestamp: new Date().toISOString(),
    });
  }

  // Emitir predicciones
  io.emit('predictions', {
    predictions,
    timestamp: new Date().toISOString(),
  });

  console.log(`📊 Datos generados y emitidos | Alertas: ${alerts.length}`);

  // Limpiar alertas antiguas cada hora
  const now = new Date();
  if (now.getMinutes() === 0) {
    alertService.cleanOldAlerts();
  }
}

/**
 * Detiene la simulación
 */
function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    console.log('⏹️  Simulación detenida');
  }
}

/**
 * Obtiene instancia del simulador (para uso en rutas)
 */
function getSimulator() {
  return simulator;
}

/**
 * Obtiene instancia del servicio de predicciones
 */
function getPredictionService() {
  return predictionService;
}

/**
 * Obtiene instancia del servicio de alertas
 */
function getAlertService() {
  return alertService;
}

module.exports = initializeSockets;
module.exports.stopSimulation = stopSimulation;
module.exports.getSimulator = getSimulator;
module.exports.getPredictionService = getPredictionService;
module.exports.getAlertService = getAlertService;
