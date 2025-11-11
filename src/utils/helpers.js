/**
 * Utilidades y funciones helper
 */

/**
 * Formatea timestamp a string legible
 */
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Calcula estadísticas básicas de un array de números
 */
const calculateStats = (values) => {
  if (!values || values.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((acc, val) => acc + val, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / values.length,
    median: sorted[Math.floor(sorted.length / 2)],
  };
};

/**
 * Valida que un objeto tenga las propiedades requeridas
 */
const validateObject = (obj, requiredProps) => {
  if (!obj || typeof obj !== 'object') return false;

  return requiredProps.every((prop) => {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  });
};

/**
 * Genera un ID único
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Redondea un número a N decimales
 */
const roundTo = (num, decimals = 2) => {
  return parseFloat(num.toFixed(decimals));
};

/**
 * Obtiene el rango de horas del día
 */
const getTimeOfDay = () => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

/**
 * Calcula el porcentaje de cambio entre dos valores
 */
const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Agrupa datos por intervalo de tiempo
 */
const groupByTimeInterval = (data, intervalMinutes = 10) => {
  const grouped = {};

  data.forEach((item) => {
    const timestamp = new Date(item.timestamp);
    const minutes = timestamp.getMinutes();
    const roundedMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes;

    timestamp.setMinutes(roundedMinutes, 0, 0);
    const key = timestamp.toISOString();

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(item);
  });

  return grouped;
};

/**
 * Obtiene el color según severidad
 */
const getSeverityColor = (severity) => {
  const colors = {
    critical: '#dc2626',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  return colors[severity] || '#6b7280';
};

/**
 * Pausa la ejecución por N milisegundos
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = {
  formatTimestamp,
  calculateStats,
  validateObject,
  generateId,
  roundTo,
  getTimeOfDay,
  calculatePercentageChange,
  groupByTimeInterval,
  getSeverityColor,
  sleep,
};
