/**
 * Utilidades para conversión de datos a formato CSV
 */

/**
 * Convierte un array de objetos a formato CSV
 * @param {Array} data - Array de objetos a convertir
 * @param {Array} headers - Array de headers (opcional)
 * @returns {String} String en formato CSV
 */
function jsonToCSV(data, headers = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // Si no se proporcionan headers, extraerlos del primer objeto
  const csvHeaders = headers || Object.keys(data[0]);

  // Crear línea de headers
  const headerLine = csvHeaders.join(',');

  // Crear líneas de datos
  const dataLines = data.map((row) => {
    return csvHeaders
      .map((header) => {
        let value = row[header];

        // Manejar valores null/undefined
        if (value === null || value === undefined) {
          return '';
        }

        // Convertir objetos y arrays a JSON string
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }

        // Escapar comillas y agregar comillas si contiene comas, saltos de línea o comillas
        value = String(value);
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }

        return value;
      })
      .join(',');
  });

  // Combinar headers y datos
  return [headerLine, ...dataLines].join('\n');
}

/**
 * Convierte alertas a formato CSV plano (una fila por anomalía)
 * @param {Array} alerts - Array de alertas
 * @returns {String} CSV string
 */
function alertsToCSV(alerts) {
  const flattenedAlerts = [];

  alerts.forEach((alert) => {
    // Si la alerta tiene anomalías, crear una fila por cada anomalía
    if (alert.anomalies && alert.anomalies.length > 0) {
      alert.anomalies.forEach((anomaly) => {
        flattenedAlerts.push({
          timestamp: alert.timestamp,
          floorId: alert.floorId,
          floorName: alert.floorName || `Piso ${alert.floorId}`,
          severity: alert.severity,
          type: anomaly.type || alert.type || 'unknown',
          metric: anomaly.metric || '',
          value: anomaly.value !== undefined ? anomaly.value : '',
          message: anomaly.message || '',
          recommendation: anomaly.recommendation || '',
          isPredictive: alert.type === 'predictive' ? 'Si' : 'No',
          minutesAhead: anomaly.minutesAhead || '',
          predictedTime: anomaly.predictedTime || '',
        });
      });
    } else {
      // Si no tiene anomalías, crear una fila con la alerta general
      flattenedAlerts.push({
        timestamp: alert.timestamp,
        floorId: alert.floorId,
        floorName: alert.floorName || `Piso ${alert.floorId}`,
        severity: alert.severity,
        type: alert.type || 'unknown',
        metric: '',
        value: '',
        message: 'Alerta sin anomalías específicas',
        recommendation: '',
        isPredictive: alert.type === 'predictive' ? 'Si' : 'No',
        minutesAhead: '',
        predictedTime: '',
      });
    }
  });

  // Headers personalizados para mejor legibilidad
  const headers = [
    'timestamp',
    'floorId',
    'floorName',
    'severity',
    'type',
    'metric',
    'value',
    'message',
    'recommendation',
    'isPredictive',
    'minutesAhead',
    'predictedTime',
  ];

  return jsonToCSV(flattenedAlerts, headers);
}

/**
 * Convierte historial de datos del simulador a CSV
 * @param {Array} history - Array de registros históricos
 * @returns {String} CSV string
 */
function historyToCSV(history) {
  const formattedHistory = history.map((record) => ({
    timestamp: record.timestamp,
    floorId: record.floorId,
    floorName: record.name || `Piso ${record.floorId}`,
    temperature: record.temperature || '',
    humidity: record.humidity || '',
    occupancy: record.occupancy || '',
    powerConsumption: record.powerConsumption || '',
  }));

  const headers = [
    'timestamp',
    'floorId',
    'floorName',
    'temperature',
    'humidity',
    'occupancy',
    'powerConsumption',
  ];

  return jsonToCSV(formattedHistory, headers);
}

module.exports = {
  jsonToCSV,
  alertsToCSV,
  historyToCSV,
};
