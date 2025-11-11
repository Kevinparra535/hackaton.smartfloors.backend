/**
 * Servicio de predicción
 * Implementa predicciones a +60 minutos usando promedio móvil y regresión lineal simple
 */

class PredictionService {
  constructor() {
    this.predictionWindow = 60; // 60 minutos hacia adelante
  }

  /**
   * Calcula el promedio móvil simple
   * @param {Array} data - Array de valores numéricos
   * @param {Number} window - Ventana de tiempo (por defecto 10)
   */
  movingAverage(data, window = 10) {
    if (data.length < window) return data[data.length - 1] || 0;

    const recentData = data.slice(-window);
    const sum = recentData.reduce((acc, val) => acc + val, 0);
    return sum / window;
  }

  /**
   * Calcula regresión lineal simple: y = mx + b
   * @param {Array} dataPoints - Array de objetos {x, y}
   * @returns {Object} - {slope, intercept, predict}
   */
  linearRegression(dataPoints) {
    const n = dataPoints.length;
    if (n === 0) return { slope: 0, intercept: 0, predict: () => 0 };

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    dataPoints.forEach((point) => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumXX += point.x * point.x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return {
      slope,
      intercept,
      predict: (x) => slope * x + intercept,
    };
  }

  /**
   * Predice valores futuros de ocupación
   * @param {Array} history - Historial de datos del piso
   * @param {Number} minutesAhead - Minutos a predecir (por defecto 60)
   */
  predictOccupancy(history, minutesAhead = 60) {
    if (!history || history.length === 0) {
      return { predictions: [], method: 'none', confidence: 0 };
    }

    // Usar últimos 30 registros para la predicción
    const recentHistory = history.slice(-30);
    const values = recentHistory.map((h) => h.occupancy);

    // Método 1: Promedio móvil
    const maValue = this.movingAverage(values, 10);

    // Método 2: Regresión lineal
    const dataPoints = recentHistory.map((h, index) => ({
      x: index,
      y: h.occupancy,
    }));

    const regression = this.linearRegression(dataPoints);
    const futureIndex = recentHistory.length + minutesAhead;
    const lrValue = regression.predict(futureIndex);

    // Promedio de ambos métodos para mayor precisión
    const predictedValue = Math.round((maValue + lrValue) / 2);

    // Generar predicciones intermedias (cada 10 minutos)
    const predictions = [];
    for (let i = 10; i <= minutesAhead; i += 10) {
      const futureIdx = recentHistory.length + i;
      const lrVal = regression.predict(futureIdx);
      const prediction = Math.round((maValue * 0.6 + lrVal * 0.4));

      predictions.push({
        minutesAhead: i,
        occupancy: Math.max(0, Math.min(100, prediction)), // Limitar entre 0-100
        timestamp: new Date(Date.now() + i * 60000).toISOString(),
      });
    }

    return {
      predictions,
      method: 'hybrid',
      confidence: this.calculateConfidence(recentHistory),
      currentValue: values[values.length - 1],
      predictedValue,
    };
  }

  /**
   * Predice temperatura futura
   */
  predictTemperature(history, minutesAhead = 60) {
    if (!history || history.length === 0) {
      return { predictions: [], method: 'none', confidence: 0 };
    }

    const recentHistory = history.slice(-30);
    const values = recentHistory.map((h) => h.temperature);

    const maValue = this.movingAverage(values, 10);

    const dataPoints = recentHistory.map((h, index) => ({
      x: index,
      y: h.temperature,
    }));

    const regression = this.linearRegression(dataPoints);

    const predictions = [];
    for (let i = 10; i <= minutesAhead; i += 10) {
      const futureIdx = recentHistory.length + i;
      const lrVal = regression.predict(futureIdx);
      const prediction = (maValue * 0.6 + lrVal * 0.4);

      predictions.push({
        minutesAhead: i,
        temperature: parseFloat(Math.max(18, Math.min(30, prediction)).toFixed(1)),
        timestamp: new Date(Date.now() + i * 60000).toISOString(),
      });
    }

    return {
      predictions,
      method: 'hybrid',
      confidence: this.calculateConfidence(recentHistory),
      currentValue: values[values.length - 1],
    };
  }

  /**
   * Predice consumo energético
   */
  predictPowerConsumption(history, minutesAhead = 60) {
    if (!history || history.length === 0) {
      return { predictions: [], method: 'none', confidence: 0 };
    }

    const recentHistory = history.slice(-30);
    const values = recentHistory.map((h) => h.powerConsumption);

    const maValue = this.movingAverage(values, 10);

    const dataPoints = recentHistory.map((h, index) => ({
      x: index,
      y: h.powerConsumption,
    }));

    const regression = this.linearRegression(dataPoints);

    const predictions = [];
    for (let i = 10; i <= minutesAhead; i += 10) {
      const futureIdx = recentHistory.length + i;
      const lrVal = regression.predict(futureIdx);
      const prediction = (maValue * 0.5 + lrVal * 0.5);

      predictions.push({
        minutesAhead: i,
        powerConsumption: parseFloat(Math.max(0, prediction).toFixed(2)),
        timestamp: new Date(Date.now() + i * 60000).toISOString(),
      });
    }

    return {
      predictions,
      method: 'hybrid',
      confidence: this.calculateConfidence(recentHistory),
      currentValue: values[values.length - 1],
    };
  }

  /**
   * Calcula nivel de confianza basado en la varianza de los datos
   */
  calculateConfidence(history) {
    if (history.length < 5) return 0.5;

    const values = history.map((h) => h.occupancy);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Menor desviación estándar = mayor confianza
    // Normalizar entre 0.5 y 0.95
    const confidence = Math.max(0.5, Math.min(0.95, 1 - (stdDev / 100)));

    return parseFloat(confidence.toFixed(2));
  }

  /**
   * Genera predicciones completas para un piso
   */
  predictFloor(history, minutesAhead = 60) {
    return {
      occupancy: this.predictOccupancy(history, minutesAhead),
      temperature: this.predictTemperature(history, minutesAhead),
      powerConsumption: this.predictPowerConsumption(history, minutesAhead),
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = PredictionService;
