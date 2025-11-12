/* eslint-disable no-console */

/**
 * Controlador de pisos
 * Maneja las solicitudes REST relacionadas con los datos de los pisos
 */

const {
	getSimulator,
	getPredictionService,
	getAlertService,
} = require('../sockets/index');

/**
 * Obtiene datos actuales de todos los pisos
 */
const getAllFloors = (req, res) => {
	try {
		const simulator = getSimulator();

		if (!simulator) {
			return res.status(503).json({
				success: false,
				message: 'Simulador no inicializado',
			});
		}

		const floors = simulator.getCurrentData();

		res.json({
			success: true,
			data: floors,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error en getAllFloors:', error);
		res.status(500).json({
			success: false,
			message: 'Error al obtener datos de pisos',
			error: error.message,
		});
	}
};

/**
 * Obtiene datos de un piso específico
 */
const getFloorById = (req, res) => {
	try {
		const simulator = getSimulator();
		const floorId = parseInt(req.params.id);

		if (!simulator) {
			return res.status(503).json({
				success: false,
				message: 'Simulador no inicializado',
			});
		}

		const floors = simulator.getCurrentData();
		const floor = floors.find((f) => f.floorId === floorId);

		if (!floor) {
			return res.status(404).json({
				success: false,
				message: `Piso ${floorId} no encontrado`,
			});
		}

		res.json({
			success: true,
			data: floor,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error en getFloorById:', error);
		res.status(500).json({
			success: false,
			message: 'Error al obtener datos del piso',
			error: error.message,
		});
	}
};

/**
 * Obtiene historial de un piso
 */
const getFloorHistory = (req, res) => {
	try {
		const simulator = getSimulator();
		const floorId = parseInt(req.params.id);
		const limit = parseInt(req.query.limit) || 60;

		if (!simulator) {
			return res.status(503).json({
				success: false,
				message: 'Simulador no inicializado',
			});
		}

		const history = simulator.getFloorHistory(floorId, limit);

		res.json({
			success: true,
			data: {
				floorId,
				history,
				count: history.length,
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error en getFloorHistory:', error);
		res.status(500).json({
			success: false,
			message: 'Error al obtener historial',
			error: error.message,
		});
	}
};

/**
 * Obtiene predicciones para un piso
 */
const getFloorPredictions = (req, res) => {
	try {
		const simulator = getSimulator();
		const predictionService = getPredictionService();
		const floorId = parseInt(req.params.id);
		const minutesAhead = parseInt(req.query.minutesAhead) || 60;

		if (!simulator || !predictionService) {
			return res.status(503).json({
				success: false,
				message: 'Servicios no inicializados',
			});
		}

		const history = simulator.getFloorHistory(floorId, 30);
		const predictions = predictionService.predictFloor(history, minutesAhead);

		res.json({
			success: true,
			data: {
				floorId,
				predictions,
				minutesAhead,
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error en getFloorPredictions:', error);
		res.status(500).json({
			success: false,
			message: 'Error al generar predicciones',
			error: error.message,
		});
	}
};

/**
 * Obtiene todas las alertas activas con filtros opcionales
 */
const getAllAlerts = (req, res) => {
	try {
		const alertService = getAlertService();

		if (!alertService) {
			return res.status(503).json({
				success: false,
				message: 'Servicio de alertas no inicializado',
			});
		}

		let alerts = alertService.getAlerts();

		// Aplicar filtros si existen
		const { severity, floorId, type, limit } = req.query;

		// Filtrar por severidad
		if (severity) {
			alerts = alerts.filter((alert) => alert.severity === severity);
		}

		// Filtrar por piso
		if (floorId) {
			const floorIdNum = parseInt(floorId);
			alerts = alerts.filter((alert) => alert.floorId === floorIdNum);
		}

		// Filtrar por tipo de anomalía
		if (type) {
			alerts = alerts.filter((alert) =>
				alert.anomalies.some((anomaly) => anomaly.type === type)
			);
		}

		// Ordenar por timestamp descendente (más recientes primero)
		alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

		// Aplicar límite
		if (limit) {
			const limitNum = parseInt(limit);
			alerts = alerts.slice(0, limitNum);
		}

		res.json({
			success: true,
			data: {
				alerts,
				count: alerts.length,
				filters: {
					severity: severity || null,
					floorId: floorId ? parseInt(floorId) : null,
					type: type || null,
					limit: limit ? parseInt(limit) : null,
				},
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error en getAllAlerts:', error);
		res.status(500).json({
			success: false,
			message: 'Error al obtener alertas',
			error: error.message,
		});
	}
};

/**
 * Obtiene estadísticas generales
 */
const getStats = (req, res) => {
	try {
		const simulator = getSimulator();

		if (!simulator) {
			return res.status(503).json({
				success: false,
				message: 'Simulador no inicializado',
			});
		}

		const floors = simulator.getCurrentData();
		const totalOccupancy = floors.reduce(
			(sum, floor) => sum + floor.occupancy,
			0,
		);
		const avgTemperature =
			floors.reduce((sum, floor) => sum + floor.temperature, 0) / floors.length;
		const totalPower = floors.reduce(
			(sum, floor) => sum + floor.powerConsumption,
			0,
		);

		res.json({
			success: true,
			data: {
				totalFloors: floors.length,
				totalOccupancy,
				averageOccupancy: Math.round(totalOccupancy / floors.length),
				averageTemperature: parseFloat(avgTemperature.toFixed(1)),
				totalPowerConsumption: parseFloat(totalPower.toFixed(2)),
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error en getStats:', error);
		res.status(500).json({
			success: false,
			message: 'Error al obtener estadísticas',
			error: error.message,
		});
	}
};

module.exports = {
	getAllFloors,
	getFloorById,
	getFloorHistory,
	getFloorPredictions,
	getAllAlerts,
	getStats,
};
