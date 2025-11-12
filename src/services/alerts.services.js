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
			// Temperatura en °C
			// Informativa: 26-27.9, Media: 28-29.4, Crítica: ≥29.5
			temperature: {
				info: 26,        // Nivel informativo: 26-27.9°C
				warning: 28,     // Nivel medio: 28-29.4°C
				critical: 29.5,  // Nivel crítico: ≥29.5°C
				low: 18,         // Temperatura baja
			},
			// Humedad relativa en %
			// Informativa: <25 o >70, Media: <22 o >75, Crítica: <20 o >80
			humidity: {
				high_info: 70,      // Nivel informativo alto: >70%
				high_warning: 75,   // Nivel medio alto: >75%
				high_critical: 80,  // Nivel crítico alto: >80%
				low_info: 25,       // Nivel informativo bajo: <25%
				low_warning: 22,    // Nivel medio bajo: <22%
				low_critical: 20,   // Nivel crítico bajo: <20%
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
	 * Umbrales: Informativa 26-27.9°C, Media 28-29.4°C, Crítica ≥29.5°C
	 * @param {Number} temperature - Temperatura actual
	 * @param {Number} occupancy - Ocupación actual
	 * @param {Number} floorId - ID del piso
	 */
	checkTemperature(temperature, occupancy, floorId = 0) {
		// Crítica: ≥29.5°C
		if (temperature >= this.thresholds.temperature.critical) {
			const targetTemp = Math.max(22, temperature - 4);
			return {
				type: 'temperature',
				severity: 'critical',
				metric: 'Temperatura',
				value: temperature,
				message: `Temperatura crítica: ${temperature}°C`,
				recommendation: `CRÍTICO: Ajustar setpoint del Piso ${floorId} a ${targetTemp}°C de inmediato. Activar aire acondicionado al máximo y reducir ocupación si es posible.`,
				timestamp: new Date().toISOString(),
			};
		}

		// Media: 28-29.4°C
		if (temperature >= this.thresholds.temperature.warning) {
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

		// Informativa: 26-27.9°C
		if (temperature >= this.thresholds.temperature.info) {
			return {
				type: 'temperature',
				severity: 'info',
				metric: 'Temperatura',
				value: temperature,
				message: `Temperatura por encima del rango óptimo: ${temperature}°C`,
				recommendation: `Monitorear temperatura en Piso ${floorId}. Considerar ajustar setpoint a 24°C en los próximos 20 min si continúa aumentando.`,
				timestamp: new Date().toISOString(),
			};
		}

		// Temperatura baja
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
	 * Umbrales: Informativa (<25 o >70), Media (<22 o >75), Crítica (<20 o >80)
	 * @param {Number} humidity - Humedad actual
	 * @param {Number} floorId - ID del piso
	 */
	checkHumidity(humidity, floorId = 0) {
		// Crítica alta: >80%
		if (humidity > this.thresholds.humidity.high_critical) {
			return {
				type: 'humidity',
				severity: 'critical',
				metric: 'Humedad',
				value: humidity,
				message: `Humedad crítica: ${humidity}%`,
				recommendation: `CRÍTICO: Activar deshumidificadores en Piso ${floorId} de inmediato. Incrementar ventilación al máximo; revisar puertas/celosías. Alta humedad puede afectar confort y equipos.`,
				timestamp: new Date().toISOString(),
			};
		}

		// Media alta: >75%
		if (humidity > this.thresholds.humidity.high_warning) {
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

		// Informativa alta: >70%
		if (humidity > this.thresholds.humidity.high_info) {
			return {
				type: 'humidity',
				severity: 'info',
				metric: 'Humedad',
				value: humidity,
				message: `Humedad por encima del rango óptimo: ${humidity}%`,
				recommendation: `Monitorear humedad en Piso ${floorId}. Considerar activar deshumidificación si continúa aumentando en los próximos 30 min.`,
				timestamp: new Date().toISOString(),
			};
		}

		// Crítica baja: <20%
		if (humidity < this.thresholds.humidity.low_critical) {
			return {
				type: 'humidity',
				severity: 'critical',
				metric: 'Humedad',
				value: humidity,
				message: `Humedad crítica baja: ${humidity}%`,
				recommendation: `CRÍTICO: Activar humidificadores en Piso ${floorId} de inmediato. Ambiente extremadamente seco puede afectar salud y confort.`,
				timestamp: new Date().toISOString(),
			};
		}

		// Media baja: <22%
		if (humidity < this.thresholds.humidity.low_warning) {
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

		// Informativa baja: <25%
		if (humidity < this.thresholds.humidity.low_info) {
			return {
				type: 'humidity',
				severity: 'info',
				metric: 'Humedad',
				value: humidity,
				message: `Humedad por debajo del rango óptimo: ${humidity}%`,
				recommendation: `Monitorear humedad en Piso ${floorId}. Considerar activar humidificación si continúa disminuyendo.`,
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

	/**
	 * Genera alertas preventivas basadas en predicciones
	 * @param {Number} floorId - ID del piso
	 * @param {String} floorName - Nombre del piso
	 * @param {Object} predictions - Predicciones generadas por PredictionService
	 * @param {Number} currentPower - Consumo energético actual
	 * @returns {Object|null} Alerta preventiva o null
	 */
	generatePredictiveAlert(floorId, floorName, predictions, currentPower = 0) {
		const preventiveAnomalies = [];

		// Verificar predicciones de temperatura
		if (predictions.temperature && predictions.temperature.predictions) {
			predictions.temperature.predictions.forEach((pred) => {
				// Crítica: ≥29.5°C
				if (pred.temperature >= this.thresholds.temperature.critical) {
					preventiveAnomalies.push({
						type: 'predictive_temperature',
						severity: 'critical',
						metric: 'Predicción de Temperatura',
						value: pred.temperature,
						minutesAhead: pred.minutesAhead,
						message: `ALERTA PREVENTIVA: Se predice temperatura crítica de ${pred.temperature}°C en ${pred.minutesAhead} minutos`,
						recommendation: `ACCIÓN PREVENTIVA: Ajustar setpoint del Piso ${floorId} a 22°C de inmediato. Activar enfriamiento preventivo antes de que se alcance temperatura crítica.`,
						timestamp: new Date().toISOString(),
						predictedTime: pred.timestamp,
					});
					return; // Solo una alerta por métrica
				}
				// Warning: ≥28°C
				else if (pred.temperature >= this.thresholds.temperature.warning) {
					preventiveAnomalies.push({
						type: 'predictive_temperature',
						severity: 'warning',
						metric: 'Predicción de Temperatura',
						value: pred.temperature,
						minutesAhead: pred.minutesAhead,
						message: `Alerta preventiva: Se predice temperatura elevada de ${pred.temperature}°C en ${pred.minutesAhead} minutos`,
						recommendation: `Preparar ajuste de climatización en Piso ${floorId}. Considerar reducir setpoint a 23°C en los próximos ${Math.max(10, pred.minutesAhead - 10)} minutos.`,
						timestamp: new Date().toISOString(),
						predictedTime: pred.timestamp,
					});
					return;
				}
			});
		}

		// Verificar predicciones de humedad
		if (predictions.humidity && predictions.humidity.predictions) {
			predictions.humidity.predictions.forEach((pred) => {
				// Crítica alta: >80%
				if (pred.humidity > this.thresholds.humidity.high_critical) {
					preventiveAnomalies.push({
						type: 'predictive_humidity',
						severity: 'critical',
						metric: 'Predicción de Humedad',
						value: pred.humidity,
						minutesAhead: pred.minutesAhead,
						message: `ALERTA PREVENTIVA: Se predice humedad crítica de ${pred.humidity}% en ${pred.minutesAhead} minutos`,
						recommendation: `ACCIÓN PREVENTIVA: Activar deshumidificadores en Piso ${floorId} ahora. Incrementar ventilación de forma preventiva.`,
						timestamp: new Date().toISOString(),
						predictedTime: pred.timestamp,
					});
					return;
				}
				// Crítica baja: <20%
				else if (pred.humidity < this.thresholds.humidity.low_critical) {
					preventiveAnomalies.push({
						type: 'predictive_humidity',
						severity: 'critical',
						metric: 'Predicción de Humedad',
						value: pred.humidity,
						minutesAhead: pred.minutesAhead,
						message: `ALERTA PREVENTIVA: Se predice humedad crítica baja de ${pred.humidity}% en ${pred.minutesAhead} minutos`,
						recommendation: `ACCIÓN PREVENTIVA: Activar humidificadores en Piso ${floorId} ahora. Preparar sistemas para evitar ambiente extremadamente seco.`,
						timestamp: new Date().toISOString(),
						predictedTime: pred.timestamp,
					});
					return;
				}
			});
		}

		// Verificar predicciones de energía
		if (predictions.powerConsumption && predictions.powerConsumption.predictions) {
			predictions.powerConsumption.predictions.forEach((pred) => {
				// Consumo muy alto: ≥200 kWh
				if (pred.powerConsumption >= this.thresholds.powerConsumption.veryHigh) {
					preventiveAnomalies.push({
						type: 'predictive_power',
						severity: 'critical',
						metric: 'Predicción de Consumo Energético',
						value: pred.powerConsumption,
						minutesAhead: pred.minutesAhead,
						message: `ALERTA PREVENTIVA: Se predice consumo crítico de ${pred.powerConsumption} kWh en ${pred.minutesAhead} minutos`,
						recommendation: `ACCIÓN PREVENTIVA: Redistribuir carga eléctrica del Piso ${floorId} ahora. Apagar equipos no esenciales antes de alcanzar sobrecarga.`,
						timestamp: new Date().toISOString(),
						predictedTime: pred.timestamp,
					});
					return;
				}
			});
		}

		// Detectar riesgo de sobrecarga térmica predictiva
		const thermalRisk = this.checkPredictiveThermalRisk(
			floorId,
			predictions.temperature,
			predictions.powerConsumption,
			currentPower,
		);
		if (thermalRisk) {
			preventiveAnomalies.push(thermalRisk);
		}

		// Si hay anomalías preventivas, generar alerta
		if (preventiveAnomalies.length === 0) return null;

		const alert = {
			floorId,
			floorName,
			anomalies: preventiveAnomalies,
			timestamp: new Date().toISOString(),
			severity: this.getHighestSeverity(preventiveAnomalies),
			type: 'predictive', // Marca especial para alertas preventivas
		};

		this.alerts.push(alert);
		return alert;
	}

	/**
	 * Detecta riesgo predictivo de sobrecarga térmica
	 * Combina predicciones de temperatura + energía
	 */
	checkPredictiveThermalRisk(floorId, tempPredictions, powerPredictions) {
		if (!tempPredictions?.predictions || !powerPredictions?.predictions) return null;

		// Buscar momento donde coincidan temperatura alta + energía alta
		for (let i = 0; i < tempPredictions.predictions.length; i++) {
			const tempPred = tempPredictions.predictions[i];
			const powerPred = powerPredictions.predictions[i];

			// Riesgo crítico: Temp ≥29.5°C + Consumo ≥180 kWh
			if (tempPred.temperature >= 29.5 && powerPred.powerConsumption >= 180) {
				return {
					type: 'predictive_thermal_overload',
					severity: 'critical',
					metric: 'Predicción de Sobrecarga Térmica',
					value: {
						temperature: tempPred.temperature,
						powerConsumption: powerPred.powerConsumption,
					},
					minutesAhead: tempPred.minutesAhead,
					message: `ALERTA CRÍTICA PREVENTIVA: Predicción indica que el Piso ${floorId} superará ${tempPred.temperature}°C en ${tempPred.minutesAhead} minutos con consumo alto de ${powerPred.powerConsumption} kWh`,
					recommendation: `ACCIÓN INMEDIATA PREVENTIVA: Reducir carga térmica del Piso ${floorId} AHORA. Ajustar setpoint a 21°C, activar ventilación máxima, y redistribuir equipos de alto consumo a otros pisos. Evitar sobrecarga antes de que ocurra.`,
					timestamp: new Date().toISOString(),
					predictedTime: tempPred.timestamp,
				};
			}

			// Riesgo moderado: Temp ≥28°C + Consumo ≥150 kWh
			if (tempPred.temperature >= 28 && powerPred.powerConsumption >= 150) {
				return {
					type: 'predictive_thermal_overload',
					severity: 'warning',
					metric: 'Predicción de Riesgo Térmico',
					value: {
						temperature: tempPred.temperature,
						powerConsumption: powerPred.powerConsumption,
					},
					minutesAhead: tempPred.minutesAhead,
					message: `Alerta preventiva: Se predice riesgo térmico en Piso ${floorId} (${tempPred.temperature}°C + ${powerPred.powerConsumption} kWh) en ${tempPred.minutesAhead} minutos`,
					recommendation: `Preparar medidas preventivas en Piso ${floorId}: ajustar climatización a 23°C, revisar equipos de alto consumo, y optimizar ventilación en los próximos ${Math.max(10, tempPred.minutesAhead - 10)} minutos.`,
					timestamp: new Date().toISOString(),
					predictedTime: tempPred.timestamp,
				};
			}
		}

		return null;
	}
}

module.exports = AlertService;
