/* eslint-disable no-console */

/**
 * Generador de datos simulados por piso
 * Genera 1 registro por minuto con métricas realistas
 */

class FloorSimulator {
  constructor(numberOfFloors = 5) {
    this.numberOfFloors = numberOfFloors;
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
   */
  getRandomOccupancy() {
    const hour = new Date().getHours();
    let baseOccupancy;

    // Patrones de ocupación según hora
    if (hour >= 9 && hour <= 12) {
      baseOccupancy = 60 + Math.random() * 30; // 60-90 personas (mañana alta)
    } else if (hour >= 13 && hour <= 14) {
      baseOccupancy = 30 + Math.random() * 20; // 30-50 personas (almuerzo)
    } else if (hour >= 15 && hour <= 18) {
      baseOccupancy = 50 + Math.random() * 30; // 50-80 personas (tarde)
    } else if (hour >= 19 || hour <= 6) {
      baseOccupancy = 5 + Math.random() * 15; // 5-20 personas (noche)
    } else {
      baseOccupancy = 20 + Math.random() * 30; // 20-50 personas (otras horas)
    }

    return Math.round(baseOccupancy);
  }

  /**
   * Genera temperatura aleatoria (18-26°C)
   * La temperatura aumenta con la ocupación
   */
  getRandomTemperature(occupancy = 50) {
    const baseTemp = 20 + Math.random() * 3; // 20-23°C base
    const occupancyEffect = (occupancy / 100) * 2; // +0 a +2°C según ocupación
    return parseFloat((baseTemp + occupancyEffect).toFixed(1));
  }

  /**
   * Genera humedad aleatoria (30-70%)
   */
  getRandomHumidity() {
    return Math.round(30 + Math.random() * 40);
  }

  /**
   * Calcula consumo energético basado en ocupación y temperatura
   * Fórmula: base + (ocupación * 0.5) + (temperatura * 2)
   */
  calculatePowerConsumption(occupancy, temperature) {
    const basePower = 50; // kWh base
    const occupancyPower = occupancy * 0.5;
    const temperaturePower = temperature * 2;
    return parseFloat((basePower + occupancyPower + temperaturePower).toFixed(2));
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
