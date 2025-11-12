/* eslint-disable no-console */

/**
 * Configuración de Socket.IO
 * Maneja comunicación en tiempo real con el frontend
 */

const FloorSimulator = require('../services/simulator.services');
const PredictionService = require('../services/prediction.services');
const AlertService = require('../services/alerts.services');
const EmailService = require('../services/email.services');

let simulator;
let predictionService;
let alertService;
let emailService;
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
  emailService = new EmailService();

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
 * Envía emails para alertas críticas y de alto impacto
 */
async function sendEmailsForCriticalAlerts(alerts) {
  // Filtrar solo alertas críticas o preventivas críticas
  const criticalAlerts = alerts.filter(alert =>
    alert.severity === 'critical' ||
    (alert.type === 'predictive' && alert.severity === 'critical')
  );

  if (criticalAlerts.length === 0) {
    return; // No hay alertas críticas
  }

  // Enviar email por cada alerta crítica
  for (const alert of criticalAlerts) {
    try {
      const emailData = {
        floorId: alert.floorId,
        floorName: alert.floorName,
        buildingName: process.env.BUILDING_NAME || 'Edificio Principal',
        severity: alert.severity,
        anomalies: alert.anomalies,
        timestamp: alert.timestamp,
      };

      const result = await emailService.sendAlert(emailData);

      if (result.sent) {
        console.log(`📧 Email enviado para alerta ${alert.severity.toUpperCase()} - ${alert.floorName}`);
      } else {
        console.log(`⚠️  Email no enviado: ${result.reason || 'razón desconocida'}`);
      }
    } catch (error) {
      console.error(`❌ Error al enviar email para ${alert.floorName}:`, error.message);
    }
  }
}

/**
 * Genera datos y los emite a todos los clientes
 */
function generateAndEmitData(io) {
  // Generar nuevos datos
  const newData = simulator.generateData();

  // Detectar anomalías y generar alertas actuales
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

  // Generar alertas preventivas basadas en predicciones
  const predictiveAlerts = [];
  predictions.forEach((predData) => {
    const floorData = newData.find((f) => f.floorId === predData.floorId);
    if (floorData) {
      const predictiveAlert = alertService.generatePredictiveAlert(
        predData.floorId,
        floorData.name,
        predData.predictions,
        floorData.powerConsumption,
      );

      if (predictiveAlert) {
        predictiveAlerts.push(predictiveAlert);
      }
    }
  });

  // Emitir datos a todos los clientes conectados
  io.emit('floor-data', {
    floors: newData,
    timestamp: new Date().toISOString(),
  });

  // Emitir alertas si hay (actuales + preventivas)
  const allAlerts = [...alerts, ...predictiveAlerts];
  if (allAlerts.length > 0) {
    io.emit('new-alerts', {
      alerts: allAlerts,
      timestamp: new Date().toISOString(),
    });

    // 📧 ENVIAR EMAILS PARA ALERTAS CRÍTICAS
    sendEmailsForCriticalAlerts(allAlerts);
  }

  // Emitir predicciones
  io.emit('predictions', {
    predictions,
    timestamp: new Date().toISOString(),
  });

  const alertSummary = alerts.length > 0 || predictiveAlerts.length > 0
    ? `Actuales: ${alerts.length}, Preventivas: ${predictiveAlerts.length}`
    : '0';
  console.log(`📊 Datos generados y emitidos | Alertas: ${alertSummary}`);

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

/**
 * Obtiene instancia del servicio de email
 */
function getEmailService() {
  return emailService;
}

module.exports = initializeSockets;
module.exports.stopSimulation = stopSimulation;
module.exports.getSimulator = getSimulator;
module.exports.getPredictionService = getPredictionService;
module.exports.getAlertService = getAlertService;
module.exports.getEmailService = getEmailService;
