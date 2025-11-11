/**
 * Servicio de detección de anomalías y generación de alertas
 * Detecta patrones anormales y genera recomendaciones
 */

class AlertService {
	constructor() {
		this.alerts = [];
		this.thresholds = {
			occupancy: {
				high: 85,
				veryHigh: 95,
				low: 5,
			},
			temperature: {
				high: 25,
				veryHigh: 27,
				low: 18,
			},
			humidity: {
				high: 65,
				veryHigh: 70,
				low: 30,
			},
			powerConsumption: {
				high: 150,
				veryHigh: 200,
			},
		};
	}

	/**
	 * Detecta anomalías en los datos actuales
	 * @param {Object} currentData - Datos actuales del piso
	 * @param {Array} history - Historial del piso
	 */
	detectAnomalies(currentData, history) {
		const anomalies = [];

		// Detectar ocupación anormal
		const occupancyAnomaly = this.checkOccupancy(
			currentData.occupancy,
			history,
		);
		if (occupancyAnomaly) anomalies.push(occupancyAnomaly);

		// Detectar temperatura anormal
		const temperatureAnomaly = this.checkTemperature(
			currentData.temperature,
			currentData.occupancy,
		);
		if (temperatureAnomaly) anomalies.push(temperatureAnomaly);

		// Detectar humedad anormal
		const humidityAnomaly = this.checkHumidity(currentData.humidity);
		if (humidityAnomaly) anomalies.push(humidityAnomaly);

		// Detectar consumo energético anormal
		const powerAnomaly = this.checkPowerConsumption(
			currentData.powerConsumption,
			currentData.occupancy,
		);
		if (powerAnomaly) anomalies.push(powerAnomaly);

		// Detectar cambios bruscos
		if (history && history.length > 0) {
			const suddenChangeAnomaly = this.checkSuddenChanges(currentData, history);
			if (suddenChangeAnomaly) anomalies.push(suddenChangeAnomaly);
		}

		return anomalies;
	}

	/**
	 * Verifica anomalías en ocupación
	 */
	checkOccupancy(occupancy, history) {
		const hour = new Date().getHours();

		// Ocupación muy alta
		if (occupancy >= this.thresholds.occupancy.veryHigh) {
			return {
				type: 'occupancy',
				severity: 'critical',
				metric: 'Ocupación',
				value: occupancy,
				message: `Ocupación crítica: ${occupancy} personas`,
				recommendation:
					'Activar ventilación adicional y monitorear capacidad máxima. Considerar redistribuir personas a otros pisos.',
				timestamp: new Date().toISOString(),
			};
		}

		if (occupancy >= this.thresholds.occupancy.high) {
			return {
				type: 'occupancy',
				severity: 'warning',
				metric: 'Ocupación',
				value: occupancy,
				message: `Ocupación alta: ${occupancy} personas`,
				recommendation:
					'Preparar sistemas de ventilación y monitorear confort térmico.',
				timestamp: new Date().toISOString(),
			};
		}

		// Ocupación anormal para la hora
		if (history && history.length >= 7) {
			const recentAvg = this.calculateAverage(
				history.slice(-7).map((h) => h.occupancy),
			);
			const deviation = Math.abs(occupancy - recentAvg);

			if (deviation > 30 && occupancy > recentAvg) {
				return {
					type: 'occupancy',
					severity: 'info',
					metric: 'Ocupación',
					value: occupancy,
					message: `Incremento inusual de ocupación (${Math.round(deviation)} personas más que el promedio)`,
					recommendation:
						'Verificar si hay un evento programado. Ajustar climatización preventivamente.',
					timestamp: new Date().toISOString(),
				};
			}
		}

		return null;
	}

	/**
	 * Verifica anomalías en temperatura
	 */
	checkTemperature(temperature, occupancy) {
		if (temperature >= this.thresholds.temperature.veryHigh) {
			return {
				type: 'temperature',
				severity: 'critical',
				metric: 'Temperatura',
				value: temperature,
				message: `Temperatura muy alta: ${temperature}°C`,
				recommendation:
					'Activar aire acondicionado de inmediato. Reducir ocupación si es posible.',
				timestamp: new Date().toISOString(),
			};
		}

		if (temperature >= this.thresholds.temperature.high) {
			return {
				type: 'temperature',
				severity: 'warning',
				metric: 'Temperatura',
				value: temperature,
				message: `Temperatura elevada: ${temperature}°C`,
				recommendation: 'Incrementar ventilación o activar climatización.',
				timestamp: new Date().toISOString(),
			};
		}

		if (temperature <= this.thresholds.temperature.low) {
			return {
				type: 'temperature',
				severity: 'warning',
				metric: 'Temperatura',
				value: temperature,
				message: `Temperatura baja: ${temperature}°C`,
				recommendation: 'Activar calefacción o ajustar termostato.',
				timestamp: new Date().toISOString(),
			};
		}

		// Temperatura no correlacionada con ocupación
		if (occupancy > 70 && temperature < 21) {
			return {
				type: 'temperature',
				severity: 'info',
				metric: 'Temperatura',
				value: temperature,
				message: `Temperatura inusualmente baja para alta ocupación`,
				recommendation:
					'Verificar sistema de climatización. Posible sobre-enfriamiento.',
				timestamp: new Date().toISOString(),
			};
		}

		return null;
	}

	/**
	 * Verifica anomalías en humedad
	 */
	checkHumidity(humidity) {
		if (humidity >= this.thresholds.humidity.veryHigh) {
			return {
				type: 'humidity',
				severity: 'critical',
				metric: 'Humedad',
				value: humidity,
				message: `Humedad muy alta: ${humidity}%`,
				recommendation:
					'Activar deshumidificadores. Alta humedad puede afectar confort y equipos.',
				timestamp: new Date().toISOString(),
			};
		}

		if (humidity >= this.thresholds.humidity.high) {
			return {
				type: 'humidity',
				severity: 'warning',
				metric: 'Humedad',
				value: humidity,
				message: `Humedad elevada: ${humidity}%`,
				recommendation: 'Incrementar ventilación para reducir humedad.',
				timestamp: new Date().toISOString(),
			};
		}

		if (humidity <= this.thresholds.humidity.low) {
			return {
				type: 'humidity',
				severity: 'warning',
				metric: 'Humedad',
				value: humidity,
				message: `Humedad baja: ${humidity}%`,
				recommendation: 'Ambiente muy seco. Considerar humidificación.',
				timestamp: new Date().toISOString(),
			};
		}

		return null;
	}

	/**
	 * Verifica anomalías en consumo energético
	 */
	checkPowerConsumption(powerConsumption, occupancy) {
		if (powerConsumption >= this.thresholds.powerConsumption.veryHigh) {
			return {
				type: 'power',
				severity: 'critical',
				metric: 'Consumo Energético',
				value: powerConsumption,
				message: `Consumo energético muy alto: ${powerConsumption} kWh`,
				recommendation:
					'Revisar sistemas eléctricos. Posible mal funcionamiento o desperdicio energético.',
				timestamp: new Date().toISOString(),
			};
		}

		if (powerConsumption >= this.thresholds.powerConsumption.high) {
			return {
				type: 'power',
				severity: 'warning',
				metric: 'Consumo Energético',
				value: powerConsumption,
				message: `Consumo energético elevado: ${powerConsumption} kWh`,
				recommendation:
					'Optimizar uso de equipos. Apagar luces y dispositivos innecesarios.',
				timestamp: new Date().toISOString(),
			};
		}

		// Consumo alto con baja ocupación
		if (occupancy < 20 && powerConsumption > 100) {
			return {
				type: 'power',
				severity: 'warning',
				metric: 'Consumo Energético',
				value: powerConsumption,
				message: `Consumo elevado con baja ocupación`,
				recommendation:
					'Verificar equipos encendidos innecesariamente. Posible ahorro energético.',
				timestamp: new Date().toISOString(),
			};
		}

		return null;
	}

	/**
	 * Detecta cambios bruscos en métricas
	 */
	checkSuddenChanges(currentData, history) {
		if (history.length < 3) return null;

		const previous = history[history.length - 1];

		// Cambio brusco en ocupación
		const occupancyChange = Math.abs(
			currentData.occupancy - previous.occupancy,
		);
		if (occupancyChange > 30) {
			return {
				type: 'sudden_change',
				severity: 'info',
				metric: 'Cambio Brusco',
				value: occupancyChange,
				message: `Cambio repentino en ocupación: ${occupancyChange > 0 ? '+' : ''}${currentData.occupancy - previous.occupancy} personas`,
				recommendation:
					'Monitorear situación. Verificar si corresponde a evento programado.',
				timestamp: new Date().toISOString(),
			};
		}

		// Cambio brusco en temperatura
		const tempChange = Math.abs(currentData.temperature - previous.temperature);
		if (tempChange > 3) {
			return {
				type: 'sudden_change',
				severity: 'warning',
				metric: 'Cambio Brusco de Temperatura',
				value: tempChange,
				message: `Temperatura cambió ${tempChange.toFixed(1)}°C en 1 minuto`,
				recommendation:
					'Verificar sistema de climatización. Cambio inusualmente rápido.',
				timestamp: new Date().toISOString(),
			};
		}

		return null;
	}

	/**
	 * Calcula promedio de un array
	 */
	calculateAverage(values) {
		if (!values || values.length === 0) return 0;
		return values.reduce((a, b) => a + b, 0) / values.length;
	}

	/**
	 * Genera alerta completa para un piso
	 */
	generateAlert(floorId, currentData, history) {
		const anomalies = this.detectAnomalies(currentData, history);

		if (anomalies.length === 0) return null;

		const alert = {
			floorId,
			floorName: currentData.name,
			anomalies,
			timestamp: new Date().toISOString(),
			severity: this.getHighestSeverity(anomalies),
		};

		this.alerts.push(alert);
		return alert;
	}

	/**
	 * Obtiene la severidad más alta de un conjunto de anomalías
	 */
	getHighestSeverity(anomalies) {
		const severityOrder = { critical: 3, warning: 2, info: 1 };
		let highest = 'info';

		anomalies.forEach((anomaly) => {
			if (severityOrder[anomaly.severity] > severityOrder[highest]) {
				highest = anomaly.severity;
			}
		});

		return highest;
	}

	/**
	 * Obtiene todas las alertas
	 */
	getAlerts() {
		return this.alerts;
	}

	/**
	 * Limpia alertas antiguas (más de 24 horas)
	 */
	cleanOldAlerts() {
		const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
		this.alerts = this.alerts.filter((alert) => {
			return new Date(alert.timestamp).getTime() > oneDayAgo;
		});
	}
}

module.exports = AlertService;
