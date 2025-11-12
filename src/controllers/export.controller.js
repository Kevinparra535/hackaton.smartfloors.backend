const { getSimulator, getAlertService } = require('../sockets/index');
const { alertsToCSV, historyToCSV } = require('../utils/csv.helpers');

/**
 * GET /api/v1/export/alerts/csv
 * Exporta alertas a formato CSV
 * Query params: startDate, endDate, severity, floorId, type, isPredictive
 */
const exportAlerts = (req, res) => {
  try {
    const alertService = getAlertService();

    if (!alertService) {
      return res.status(503).json({
        success: false,
        message: 'Servicio de alertas no inicializado',
      });
    }

    // Obtener todas las alertas
    let alerts = alertService.getAlerts();

    // Aplicar filtros
    const { startDate, endDate, severity, floorId, type, isPredictive } = req.query;

    // Filtrar por rango de fechas
    if (startDate) {
      const start = new Date(startDate);
      alerts = alerts.filter((alert) => new Date(alert.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      alerts = alerts.filter((alert) => new Date(alert.timestamp) <= end);
    }

    // Filtrar por severidad
    if (severity) {
      alerts = alerts.filter((alert) => alert.severity === severity);
    }

    // Filtrar por piso
    if (floorId) {
      alerts = alerts.filter((alert) => alert.floorId === parseInt(floorId));
    }

    // Filtrar por tipo de alerta
    if (type) {
      alerts = alerts.filter((alert) => {
        // Buscar en las anomalías si tienen el tipo especificado
        if (alert.anomalies && alert.anomalies.length > 0) {
          return alert.anomalies.some((anomaly) => anomaly.type === type);
        }
        return alert.type === type;
      });
    }

    // Filtrar por alertas predictivas/actuales
    if (isPredictive !== undefined) {
      const isPred = isPredictive === 'true' || isPredictive === true;
      alerts = alerts.filter((alert) => {
        if (isPred) {
          return alert.type === 'predictive';
        } else {
          return alert.type !== 'predictive';
        }
      });
    }

    // Convertir a CSV
    const csv = alertsToCSV(alerts);

    if (!csv) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron alertas con los filtros especificados',
      });
    }

    // Configurar headers para descarga
    const filename = `smartfloors-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Agregar BOM para soporte UTF-8 en Excel
    res.write('\uFEFF');
    res.send(csv);
  } catch (error) {
    console.error('Error al exportar alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar alertas',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/export/history/csv
 * Exporta historial de datos del simulador a CSV
 * Query params: startDate, endDate, floorId, limit
 */
const exportHistory = (req, res) => {
  try {
    const simulator = getSimulator();

    if (!simulator) {
      return res.status(503).json({
        success: false,
        message: 'Simulador no inicializado',
      });
    }

    // Obtener parámetros de filtro
    const { startDate, endDate, floorId, limit } = req.query;

    let history = [];

    // Si se especifica un piso, obtener solo su historial
    if (floorId) {
      const floorHistory = simulator.getFloorHistory(parseInt(floorId), parseInt(limit) || 1440);
      history = floorHistory;
    } else {
      // Obtener historial completo de todos los pisos
      history = simulator.history || [];

      // Aplicar límite si se especifica
      if (limit) {
        history = history.slice(-parseInt(limit));
      }
    }

    // Aplicar filtros de fecha
    if (startDate) {
      const start = new Date(startDate);
      history = history.filter((record) => new Date(record.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      history = history.filter((record) => new Date(record.timestamp) <= end);
    }

    // Convertir a CSV
    const csv = historyToCSV(history);

    if (!csv) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron datos históricos con los filtros especificados',
      });
    }

    // Configurar headers para descarga
    const filename = `smartfloors-history-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Agregar BOM para soporte UTF-8 en Excel
    res.write('\uFEFF');
    res.send(csv);
  } catch (error) {
    console.error('Error al exportar historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar historial',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/export/stats
 * Obtiene estadísticas de datos disponibles para exportar
 */
const getExportStats = (req, res) => {
  try {
    const alertService = getAlertService();
    const simulator = getSimulator();

    if (!alertService || !simulator) {
      return res.status(503).json({
        success: false,
        message: 'Servicios no inicializados',
      });
    }

    const alerts = alertService.getAlerts();
    const history = simulator.history || [];

    // Calcular estadísticas
    const stats = {
      alerts: {
        total: alerts.length,
        byType: {
          current: alerts.filter((a) => a.type !== 'predictive').length,
          predictive: alerts.filter((a) => a.type === 'predictive').length,
        },
        bySeverity: {
          critical: alerts.filter((a) => a.severity === 'critical').length,
          warning: alerts.filter((a) => a.severity === 'warning').length,
          info: alerts.filter((a) => a.severity === 'info').length,
        },
        oldestAlert: alerts.length > 0 ? alerts[0].timestamp : null,
        newestAlert: alerts.length > 0 ? alerts[alerts.length - 1].timestamp : null,
      },
      history: {
        total: history.length,
        byFloor: {},
        oldestRecord: history.length > 0 ? history[0].timestamp : null,
        newestRecord: history.length > 0 ? history[history.length - 1].timestamp : null,
      },
    };

    // Contar registros por piso
    history.forEach((record) => {
      const floorId = record.floorId;
      if (!stats.history.byFloor[floorId]) {
        stats.history.byFloor[floorId] = 0;
      }
      stats.history.byFloor[floorId]++;
    });

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message,
    });
  }
};

module.exports = {
  exportAlerts,
  exportHistory,
  getExportStats,
};
