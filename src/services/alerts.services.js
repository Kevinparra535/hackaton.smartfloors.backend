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
		const floorId = currentData.floorId || 0;

		// Detectar ocupación anormal
		const occupancyAnomaly = this.checkOccupancy(
			currentData.occupancy,
			history,
			floorId,
		);
		if (occupancyAnomaly) anomalies.push(occupancyAnomaly);

		// Detectar temperatura anormal
		const temperatureAnomaly = this.checkTemperature(
			currentData.temperature,
			currentData.occupancy,
			floorId,
		);
		if (temperatureAnomaly) anomalies.push(temperatureAnomaly);

		// Detectar humedad anormal
		const humidityAnomaly = this.checkHumidity(currentData.humidity, floorId);
		if (humidityAnomaly) anomalies.push(humidityAnomaly);

		// Detectar consumo energético anormal y riesgo de sobrecarga térmica
		const powerAnomaly = this.checkPowerConsumption(
			currentData.powerConsumption,
			currentData.occupancy,
			floorId,
			currentData.temperature,
		);
		if (powerAnomaly) anomalies.push(powerAnomaly);

		// Detectar cambios bruscos
		if (history && history.length > 0) {
			const suddenChangeAnomaly = this.checkSuddenChanges(currentData, history, floorId);
			if (suddenChangeAnomaly) anomalies.push(suddenChangeAnomaly);
		}

		return anomalies;
	}

	/**
	 * Verifica anomalías en ocupación
	 * @param {Number} occupancy - Ocupación actual
	 * @param {Array} history - Historial del piso
	 * @param {Number} floorId - ID del piso
	 */
	checkOccupancy(occupancy, history, floorId = 0) {
		const hour = new Date().getHours();

		// Ocupación muy alta
		if (occupancy >= this.thresholds.occupancy.veryHigh) {
			const targetFloor = floorId > 1 ? floorId - 1 : floorId + 1;
			return {
				type: 'occupancy',
				severity: 'critical',
				metric: 'Ocupación',
				value: occupancy,
				message: `Ocupación crítica: ${occupancy} personas`,
				recommendation: `CRÍTICO: Activar ventilación adicional en Piso ${floorId} de inmediato. Redistribuir ${Math.round((occupancy - 85) / 2)} personas al Piso ${targetFloor} en los próximos 15 min. Monitorear capacidad máxima.`,
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
				recommendation: `Preparar sistemas de ventilación en Piso ${floorId}. Ajustar setpoint a 23°C en los próximos 20 min y monitorear confort térmico.`,
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
					recommendation: `Verificar si hay un evento programado en Piso ${floorId}. Ajustar climatización preventivamente a 23°C en los próximos 15 min.`,
					timestamp: new Date().toISOString(),
				};
			}
		}

		return null;
	}

	/**
	 * Verifica anomalías en temperatura
	 * @param {Number} temperature - Temperatura actual
	 * @param {Number} occupancy - Ocupación actual
	 * @param {Number} floorId - ID del piso
	 */
	checkTemperature(temperature, occupancy, floorId = 0) {
		if (temperature >= this.thresholds.temperature.veryHigh) {
			const targetTemp = Math.max(22, temperature - 3);
			return {
				type: 'temperature',
				severity: 'critical',
				metric: 'Temperatura',
				value: temperature,
				message: `Temperatura muy alta: ${temperature}°C`,
				recommendation: `Ajustar setpoint del Piso ${floorId} a ${targetTemp}°C de inmediato. Activar aire acondicionado al máximo y reducir ocupación si es posible.`,
				timestamp: new Date().toISOString(),
			};
		}

		if (temperature >= this.thresholds.temperature.high) {
			const targetTemp = 24;
			return {
				type: 'temperature',
				severity: 'warning',
				metric: 'Temperatura',
				value: temperature,
				message: `Temperatura elevada: ${temperature}°C`,
				recommendation: `Ajustar setpoint del Piso ${floorId} a ${targetTemp}°C en los próximos 15 min. Incrementar ventilación del Piso ${floorId}; revisar puertas/celosías.`,
				timestamp: new Date().toISOString(),
			};
		}

		if (temperature <= this.thresholds.temperature.low) {
			const targetTemp = 21;
			return {
				type: 'temperature',
				severity: 'warning',
				metric: 'Temperatura',
				value: temperature,
				message: `Temperatura baja: ${temperature}°C`,
				recommendation: `Ajustar setpoint del Piso ${floorId} a ${targetTemp}°C. Activar calefacción y revisar aislamiento térmico.`,
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
				recommendation: `Programar revisión de sellos térmicos en Piso ${floorId}. Verificar sistema de climatización por posible sobre-enfriamiento.`,
				timestamp: new Date().toISOString(),
			};
		}

		return null;
	}

	/**
	 * Verifica anomalías en humedad
	 * @param {Number} humidity - Humedad actual
	 * @param {Number} floorId - ID del piso
	 */
	checkHumidity(humidity, floorId = 0) {
		if (humidity >= this.thresholds.humidity.veryHigh) {
			return {
				type: 'humidity',
				severity: 'critical',
				metric: 'Humedad',
				value: humidity,
				message: `Humedad muy alta: ${humidity}%`,
				recommendation: `Activar deshumidificadores en Piso ${floorId} de inmediato. Incrementar ventilación; revisar puertas/celosías. Alta humedad puede afectar confort y equipos.`,
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
				recommendation: `Incrementar ventilación del Piso ${floorId} en los próximos 20 min. Revisar filtros de aire acondicionado y ventanas.`,
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
				recommendation: `Activar humidificadores en Piso ${floorId}. Ambiente muy seco puede afectar salud y confort.`,
				timestamp: new Date().toISOString(),
			};
		}

		return null;
	}

	/**
	 * Verifica anomalías en consumo energético
	 * @param {Number} powerConsumption - Consumo actual en kW
	 * @param {Number} occupancy - Ocupación actual
	 * @param {Number} floorId - ID del piso
	 * @param {Number} temperature - Temperatura actual
	 */
	checkPowerConsumption(powerConsumption, occupancy, floorId = 0, temperature = 22) {
		// Detectar riesgo de sobrecarga térmica
		const thermalRisk = this.checkThermalOverloadRisk(powerConsumption, temperature, occupancy);
		if (thermalRisk) {
			thermalRisk.floorId = floorId;
			return thermalRisk;
		}

		if (powerConsumption >= this.thresholds.powerConsumption.veryHigh) {
			// Determinar piso destino para redistribución (pisos con IDs menores o mayores)
			const targetFloor = floorId > 1 ? floorId - 1 : floorId + 1;

			return {
				type: 'power',
				severity: 'critical',
				metric: 'Consumo Energético',
				value: powerConsumption,
				message: `Consumo energético muy alto: ${powerConsumption} kWh`,
				recommendation: `CRÍTICO: Redistribuir carga eléctrica del Piso ${floorId} al Piso ${targetFloor} en la próxima hora. Revisar sistemas eléctricos por posible mal funcionamiento o desperdicio energético.`,
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
				recommendation: `Optimizar uso de equipos en Piso ${floorId} en los próximos 30 min. Apagar luces y dispositivos innecesarios. Revisar configuración de climatización.`,
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
				message: `Consumo elevado con baja ocupación en Piso ${floorId}`,
				recommendation: `Verificar equipos encendidos innecesariamente en Piso ${floorId}. Posible ahorro energético de hasta ${Math.round((powerConsumption - 50) * 0.3)} kWh. Programar apagado automático de luces.`,
				timestamp: new Date().toISOString(),
			};
		}

		return null;
	}

	/**
	 * Detecta riesgo de sobrecarga térmica usando energía como contexto
	 * @param {Number} powerConsumption - Consumo energético en kW
	 * @param {Number} temperature - Temperatura actual
	 * @param {Number} occupancy - Ocupación actual
	 * @returns {Object|null} Alerta de sobrecarga térmica o null
	 */
	checkThermalOverloadRisk(powerConsumption, temperature, occupancy) {
		// Riesgo crítico: Alta temperatura + Alto consumo energético
		if (temperature >= 26 && powerConsumption >= 180) {
			return {
				type: 'thermal_overload',
				severity: 'critical',
				metric: 'Riesgo de Sobrecarga Térmica',
				value: { temperature, powerConsumption },
				message: `RIESGO CRÍTICO: Temperatura ${temperature}°C + Consumo ${powerConsumption} kWh`,
				recommendation: `ACCIÓN INMEDIATA: Sistema en riesgo de sobrecarga térmica. Reducir carga eléctrica de inmediato, ajustar setpoint a 23°C, y activar ventilación máxima. Redistribuir personas si es posible.`,
				timestamp: new Date().toISOString(),
			};
		}

		// Riesgo moderado: Temperatura elevada + Consumo alto
		if (temperature >= 25 && powerConsumption >= 150) {
			return {
				type: 'thermal_overload',
				severity: 'warning',
				metric: 'Riesgo de Sobrecarga Térmica',
				value: { temperature, powerConsumption },
				message: `Riesgo moderado: Temperatura ${temperature}°C + Consumo ${powerConsumption} kWh`,
				recommendation: `Monitorear de cerca en los próximos 30 min. Ajustar setpoint a 24°C, reducir equipos no esenciales, y mejorar circulación de aire. Evaluar redistribución de carga.`,
				timestamp: new Date().toISOString(),
			};
		}

		// Condiciones fuera de rango óptimo
		if (temperature >= 24 && powerConsumption >= 140 && occupancy > 80) {
			return {
				type: 'thermal_overload',
				severity: 'info',
				metric: 'Condiciones Fuera de Rango Óptimo',
				value: { temperature, powerConsumption, occupancy },
				message: `Condiciones subóptimas: Temp ${temperature}°C, Consumo ${powerConsumption} kWh, Ocupación ${occupancy}`,
				recommendation: `Optimizar condiciones en los próximos 45 min: ajustar climatización, revisar ventilación, y considerar redistribuir 10-15 personas a otros pisos para mejorar eficiencia energética.`,
				timestamp: new Date().toISOString(),
			};
		}

		return null;
	}

	/**
	 * Detecta cambios bruscos en métricas
	 * @param {Object} currentData - Datos actuales
	 * @param {Array} history - Historial del piso
	 * @param {Number} floorId - ID del piso
	 */
	checkSuddenChanges(currentData, history, floorId = 0) {
		if (history.length < 3) return null;

		const previous = history[history.length - 1];

		// Cambio brusco en ocupación
		const occupancyChange = Math.abs(
			currentData.occupancy - previous.occupancy,
		);
		if (occupancyChange > 30) {
			const direction = currentData.occupancy > previous.occupancy ? 'incremento' : 'reducción';
			const action = currentData.occupancy > previous.occupancy
				? `Ajustar climatización a 23°C y activar ventilación adicional en los próximos 10 min`
				: `Reducir ventilación y ajustar setpoint a 24°C para optimizar energía`;

			return {
				type: 'sudden_change',
				severity: 'info',
				metric: 'Cambio Brusco en Ocupación',
				value: occupancyChange,
				message: `${direction === 'incremento' ? 'Incremento' : 'Reducción'} repentino en ocupación del Piso ${floorId}: ${occupancyChange > 0 ? '+' : ''}${currentData.occupancy - previous.occupancy} personas`,
				recommendation: `Monitorear situación en Piso ${floorId}. ${action}. Verificar si corresponde a evento programado.`,
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
				message: `Temperatura cambió ${tempChange.toFixed(1)}°C en 1 minuto en Piso ${floorId}`,
				recommendation: `Verificar sistema de climatización del Piso ${floorId} de inmediato. Cambio inusualmente rápido puede indicar falla de equipo. Programar revisión técnica en las próximas 2 horas.`,
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
