/* eslint-disable no-console */

/**
 * Generador de datos simulados por piso
 * Genera 1 registro por minuto con métricas realistas
 */

class FloorSimulator {
  constructor(numberOfFloors = 5) {
    this.numberOfFloors = numberOfFloors;
    this.buildingId = 1; // ID del edificio
    this.buildingName = process.env.BUILDING_NAME || 'Edificio Principal';
    this.currentData = this.initializeFloors();
    this.history = [];
  }

  /**
   * Inicializa el estado de cada piso
   */
  initializeFloors() {
    const floors = [];
    for (let i = 1; i <= this.numberOfFloors; i++) {
      floors.push({
        buildingId: this.buildingId,
        buildingName: this.buildingName,
        floorId: i,
        name: `Piso ${i}`,
        occupancy: this.getRandomOccupancy(),
        temperature: this.getRandomTemperature(),
        humidity: this.getRandomHumidity(),
        powerConsumption: 0,
        timestamp: new Date().toISOString(),
      });
    }
    return floors;
  }

  /**
   * Genera ocupación aleatoria (0-100 personas)
   * Sigue patrones según la hora del día
   * Incluye casos críticos ocasionales (15% probabilidad)
   */
  getRandomOccupancy() {
    const hour = new Date().getHours();
    let baseOccupancy;

    // Patrones de ocupación según hora
    if (hour >= 9 && hour <= 12) {
      baseOccupancy = 60 + Math.random() * 35; // 60-95 personas (mañana alta)
    } else if (hour >= 13 && hour <= 14) {
      baseOccupancy = 30 + Math.random() * 25; // 30-55 personas (almuerzo)
    } else if (hour >= 15 && hour <= 18) {
      baseOccupancy = 50 + Math.random() * 40; // 50-90 personas (tarde)
    } else if (hour >= 19 || hour <= 6) {
      baseOccupancy = 5 + Math.random() * 20; // 5-25 personas (noche)
    } else {
      baseOccupancy = 20 + Math.random() * 35; // 20-55 personas (otras horas)
    }

    // 15% de probabilidad de generar ocupación crítica (95-100)
    if (Math.random() < 0.15 && hour >= 9 && hour <= 18) {
      baseOccupancy = 90 + Math.random() * 10; // 90-100 personas (CRÍTICO)
    }

    return Math.round(baseOccupancy);
  }

  /**
   * Genera temperatura aleatoria (18-32°C)
   * La temperatura aumenta con la ocupación
   * Incluye casos críticos ocasionales (10% probabilidad de ≥29.5°C)
   */
  getRandomTemperature(occupancy = 50) {
    const baseTemp = 20 + Math.random() * 4; // 20-24°C base
    const occupancyEffect = (occupancy / 100) * 3; // +0 a +3°C según ocupación
    let temperature = baseTemp + occupancyEffect;

    // 10% de probabilidad de generar temperatura crítica (29.5-32°C)
    if (Math.random() < 0.10) {
      temperature = 29.5 + Math.random() * 2.5; // 29.5-32°C (CRÍTICO)
    }
    // 8% de probabilidad de generar temperatura media (28-29.4°C)
    else if (Math.random() < 0.08) {
      temperature = 28 + Math.random() * 1.4; // 28-29.4°C (WARNING)
    }
    // 12% de probabilidad de generar temperatura informativa (26-27.9°C)
    else if (Math.random() < 0.12) {
      temperature = 26 + Math.random() * 1.9; // 26-27.9°C (INFO)
    }

    return parseFloat(Math.min(32, temperature).toFixed(1));
  }

  /**
   * Genera humedad aleatoria (15-85%)
   * Incluye casos críticos ocasionales para todos los niveles
   */
  getRandomHumidity() {
    const random = Math.random();

    // 8% de probabilidad de generar humedad crítica alta (>80%)
    if (random < 0.08) {
      return Math.round(81 + Math.random() * 4); // 81-85% (CRÍTICO ALTA)
    }
    // 7% de probabilidad de generar humedad media alta (>75%)
    if (random < 0.15) {
      return Math.round(76 + Math.random() * 4); // 76-80% (WARNING ALTA)
    }
    // 10% de probabilidad de generar humedad informativa alta (>70%)
    if (random < 0.25) {
      return Math.round(71 + Math.random() * 4); // 71-75% (INFO ALTA)
    }
    // 5% de probabilidad de generar humedad crítica baja (<20%)
    if (random < 0.30) {
      return Math.round(15 + Math.random() * 5); // 15-20% (CRÍTICO BAJA)
    }
    // 6% de probabilidad de generar humedad media baja (<22%)
    if (random < 0.36) {
      return Math.round(20 + Math.random() * 2); // 20-22% (WARNING BAJA)
    }
    // 8% de probabilidad de generar humedad informativa baja (<25%)
    if (random < 0.44) {
      return Math.round(22 + Math.random() * 3); // 22-25% (INFO BAJA)
    }

    // 56% restante: rango normal (30-70%)
    return Math.round(30 + Math.random() * 40);
  }

  /**
   * Calcula consumo energético basado en ocupación y temperatura
   * Fórmula mejorada para permitir valores críticos
   * Base: 60 kWh + (ocupación * 0.8) + (temperatura * 3)
   * Permite picos de hasta 230 kWh en condiciones críticas
   */
  calculatePowerConsumption(occupancy, temperature) {
    const basePower = 60; // kWh base (aumentado de 50)
    const occupancyPower = occupancy * 0.8; // Factor aumentado de 0.5 a 0.8
    const temperaturePower = temperature * 3; // Factor aumentado de 2 a 3
    let totalPower = basePower + occupancyPower + temperaturePower;

    // 12% de probabilidad de pico energético crítico
    if (Math.random() < 0.12) {
      totalPower *= 1.3; // Incremento del 30% (puede llegar a 200-230 kWh)
    }

    return parseFloat(totalPower.toFixed(2));
  }

  /**
   * Genera nuevos datos para todos los pisos
   */
  generateData() {
    const timestamp = new Date().toISOString();

    this.currentData = this.currentData.map((floor) => {
      const occupancy = this.getRandomOccupancy();
      const temperature = this.getRandomTemperature(occupancy);
      const humidity = this.getRandomHumidity();
      const powerConsumption = this.calculatePowerConsumption(occupancy, temperature);

      const newFloorData = {
        buildingId: this.buildingId,
        buildingName: this.buildingName,
        floorId: floor.floorId,
        name: floor.name,
        occupancy,
        temperature,
        humidity,
        powerConsumption,
        timestamp,
      };

      // Guardar en historial
      this.history.push(newFloorData);

      // Mantener solo las últimas 1440 entradas por piso (24 horas)
      const maxHistoryPerFloor = 1440;
      const floorHistory = this.history.filter((h) => h.floorId === floor.floorId);
      if (floorHistory.length > maxHistoryPerFloor) {
        const toRemove = floorHistory.length - maxHistoryPerFloor;
        this.history = this.history.filter((h) => {
          if (h.floorId === floor.floorId && floorHistory.indexOf(h) < toRemove) {
            return false;
          }
          return true;
        });
      }

      return newFloorData;
    });

    return this.currentData;
  }

  /**
   * Obtiene el historial completo
   */
  getHistory() {
    return this.history;
  }

  /**
   * Obtiene el historial de un piso específico
   */
  getFloorHistory(floorId, limit = 60) {
    return this.history
      .filter((data) => data.floorId === floorId)
      .slice(-limit);
  }

  /**
   * Obtiene datos actuales de todos los pisos
   */
  getCurrentData() {
    return this.currentData;
  }

  /**
   * Limpia el historial
   */
  clearHistory() {
    this.history = [];
  }
}

module.exports = FloorSimulator;
