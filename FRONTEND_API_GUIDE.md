# 📱 Guía de API para Frontend - SmartFloors

Documentación completa de todos los endpoints y eventos WebSocket disponibles para implementar el dashboard del frontend.

---

## 🎯 Requisitos del Dashboard

### ✅ 1. Estado por Piso
### ✅ 2. Tendencias de Variables
### ✅ 3. Tabla de Alertas con Filtros

---

## 🔌 Configuración Inicial

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1';
const WEBSOCKET_URL = 'ws://localhost:3000';
```

### WebSocket Connection (Socket.IO)
```javascript
import io from 'socket.io-client';

const socket = io(WEBSOCKET_URL, {
  transports: ['websocket'],
  reconnection: true,
});

socket.on('connect', () => {
  console.log('✅ Conectado al servidor');
});
```

---

## 📊 1. ESTADO POR PISO

### REST API

#### **Obtener Todos los Pisos**
```http
GET /api/v1/floors
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "buildingId": 1,
      "buildingName": "Edificio Principal",
      "floorId": 1,
      "name": "Piso 1",
      "occupancy": 75,
      "temperature": 23.5,
      "humidity": 45,
      "powerConsumption": 125.40,
      "timestamp": "2025-11-12T15:30:00.000Z"
    }
  ],
  "timestamp": "2025-11-12T15:30:00.000Z"
}
```

**Uso en React:**
```javascript
const [floors, setFloors] = useState([]);

useEffect(() => {
  fetch(`${API_BASE_URL}/floors`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setFloors(data.data);
      }
    });
}, []);

// Renderizar tarjetas de pisos
{floors.map(floor => (
  <FloorCard key={floor.floorId} floor={floor} />
))}
```

#### **Obtener Piso Específico**
```http
GET /api/v1/floors/:id
```

**Ejemplo:**
```javascript
fetch(`${API_BASE_URL}/floors/3`)
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log(data.data); // Datos del Piso 3
    }
  });
```

#### **Estadísticas Generales**
```http
GET /api/v1/floors/stats
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalFloors": 5,
    "totalOccupancy": 375,
    "averageOccupancy": 75,
    "averageTemperature": 23.5,
    "totalPowerConsumption": 627.5
  }
}
```

**Componente de Estadísticas:**
```jsx
function StatsPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/floors/stats`)
      .then(res => res.json())
      .then(data => setStats(data.data));
  }, []);

  return (
    <div className="stats-grid">
      <StatCard title="Pisos" value={stats?.totalFloors} />
      <StatCard title="Ocupación Total" value={stats?.totalOccupancy} />
      <StatCard title="Temp. Promedio" value={`${stats?.averageTemperature}°C`} />
      <StatCard title="Consumo Total" value={`${stats?.totalPowerConsumption} kWh`} />
    </div>
  );
}
```

### WebSocket (Tiempo Real)

#### **Datos Iniciales al Conectar**
```javascript
socket.on('initial-data', (data) => {
  console.log('📊 Datos iniciales:', data);
  setFloors(data.floors);
});
```

#### **Actualización Automática cada Minuto**
```javascript
socket.on('floor-data', (data) => {
  console.log('🔄 Actualización:', data);
  setFloors(data.floors);
  // El dashboard se actualiza automáticamente
});
```

**Ejemplo Completo:**
```javascript
function Dashboard() {
  const [floors, setFloors] = useState([]);

  useEffect(() => {
    // Conexión WebSocket
    const socket = io(WEBSOCKET_URL);

    socket.on('initial-data', (data) => {
      setFloors(data.floors);
    });

    socket.on('floor-data', (data) => {
      setFloors(data.floors);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="dashboard">
      {floors.map(floor => (
        <FloorCard key={floor.floorId} floor={floor} />
      ))}
    </div>
  );
}
```

---

## 📈 2. TENDENCIAS DE VARIABLES (Gráficas)

### Historial para Gráficas

#### **Obtener Historial de un Piso**
```http
GET /api/v1/floors/:id/history?limit=60
```

**Parámetros:**
- `limit` (opcional): 1-1440 registros (default: 60)
  - `60` = última hora
  - `1440` = últimas 24 horas

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "floorId": 1,
    "history": [
      {
        "floorId": 1,
        "occupancy": 72,
        "temperature": 23.2,
        "humidity": 44,
        "powerConsumption": 123.5,
        "timestamp": "2025-11-12T15:00:00Z"
      }
    ],
    "count": 60
  }
}
```

#### **Implementación con Chart.js**
```javascript
import { Line } from 'react-chartjs-2';

function FloorChart({ floorId }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/floors/${floorId}/history?limit=60`)
      .then(res => res.json())
      .then(data => {
        const history = data.data.history;
        
        setChartData({
          labels: history.map(h => new Date(h.timestamp).toLocaleTimeString()),
          datasets: [
            {
              label: 'Temperatura (°C)',
              data: history.map(h => h.temperature),
              borderColor: 'rgb(255, 99, 132)',
            },
            {
              label: 'Ocupación',
              data: history.map(h => h.occupancy),
              borderColor: 'rgb(54, 162, 235)',
            },
            {
              label: 'Humedad (%)',
              data: history.map(h => h.humidity),
              borderColor: 'rgb(75, 192, 192)',
            },
          ],
        });
      });
  }, [floorId]);

  return chartData ? <Line data={chartData} /> : <p>Cargando...</p>;
}
```

#### **Implementación con Recharts**
```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function FloorTrends({ floorId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/floors/${floorId}/history?limit=60`)
      .then(res => res.json())
      .then(result => {
        const formatted = result.data.history.map(h => ({
          time: new Date(h.timestamp).toLocaleTimeString(),
          temperatura: h.temperature,
          ocupacion: h.occupancy,
          humedad: h.humidity,
          energia: h.powerConsumption,
        }));
        setData(formatted);
      });
  }, [floorId]);

  return (
    <LineChart width={800} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="temperatura" stroke="#FF6384" />
      <Line type="monotone" dataKey="ocupacion" stroke="#36A2EB" />
      <Line type="monotone" dataKey="humedad" stroke="#4BC0C0" />
    </LineChart>
  );
}
```

### Predicciones Futuras

#### **Obtener Predicciones**
```http
GET /api/v1/floors/:id/predictions?minutesAhead=60
```

**Parámetros:**
- `minutesAhead` (opcional): 10-180 minutos (default: 60)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "floorId": 1,
    "predictions": {
      "occupancy": {
        "predictions": [
          { "minutesAhead": 10, "occupancy": 76, "timestamp": "..." },
          { "minutesAhead": 20, "occupancy": 78, "timestamp": "..." }
        ],
        "confidence": 0.87
      },
      "temperature": {
        "predictions": [
          { "minutesAhead": 10, "temperature": 23.7, "timestamp": "..." }
        ],
        "confidence": 0.92
      }
    },
    "minutesAhead": 60
  }
}
```

**Gráfica con Predicciones:**
```javascript
function PredictionChart({ floorId }) {
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    // Obtener historial
    fetch(`${API_BASE_URL}/floors/${floorId}/history?limit=30`)
      .then(res => res.json())
      .then(data => setHistory(data.data.history));

    // Obtener predicciones
    fetch(`${API_BASE_URL}/floors/${floorId}/predictions?minutesAhead=60`)
      .then(res => res.json())
      .then(data => setPredictions(data.data.predictions));
  }, [floorId]);

  const chartData = {
    labels: [
      ...history.map(h => new Date(h.timestamp).toLocaleTimeString()),
      ...predictions?.temperature.predictions.map(p => 
        new Date(p.timestamp).toLocaleTimeString()
      ) || []
    ],
    datasets: [
      {
        label: 'Temperatura Real',
        data: history.map(h => h.temperature),
        borderColor: 'rgb(75, 192, 192)',
        borderDash: [],
      },
      {
        label: 'Temperatura Predicha',
        data: [
          ...Array(history.length).fill(null),
          ...predictions?.temperature.predictions.map(p => p.temperature) || []
        ],
        borderColor: 'rgb(255, 159, 64)',
        borderDash: [5, 5],
      },
    ],
  };

  return <Line data={chartData} />;
}
```

### WebSocket para Tendencias

#### **Solicitar Historial**
```javascript
socket.emit('request-history', { floorId: 1, limit: 60 });

socket.on('history-data', (data) => {
  console.log('📊 Historial:', data.history);
  updateChart(data.history);
});
```

#### **Predicciones Automáticas**
```javascript
socket.on('predictions', (data) => {
  console.log('🔮 Predicciones:', data.predictions);
  // data.predictions = [{ floorId: 1, predictions: {...} }, ...]
});
```

---

## 🚨 3. TABLA DE ALERTAS CON FILTROS

### REST API con Filtros

#### **Obtener Todas las Alertas**
```http
GET /api/v1/alerts
```

#### **Filtrar por Severidad**
```http
GET /api/v1/alerts?severity=critical
```
Valores: `critical`, `warning`, `info`

#### **Filtrar por Piso**
```http
GET /api/v1/alerts?floorId=3
```

#### **Filtrar por Tipo de Anomalía**
```http
GET /api/v1/alerts?type=temperature
```
Valores: `occupancy`, `temperature`, `humidity`, `power`, `thermal_overload`, `sudden_change`

#### **Limitar Resultados**
```http
GET /api/v1/alerts?limit=10
```

#### **Combinación de Filtros**
```http
GET /api/v1/alerts?severity=critical&floorId=3&limit=5
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "floorId": 3,
        "floorName": "Piso 3",
        "anomalies": [
          {
            "type": "occupancy",
            "severity": "critical",
            "metric": "Ocupación",
            "value": 98,
            "message": "Ocupación crítica: 98 personas",
            "recommendation": "CRÍTICO: Activar ventilación adicional...",
            "timestamp": "2025-11-12T15:30:00Z"
          }
        ],
        "timestamp": "2025-11-12T15:30:00Z",
        "severity": "critical"
      }
    ],
    "count": 1,
    "filters": {
      "severity": "critical",
      "floorId": 3,
      "type": null,
      "limit": 5
    }
  }
}
```

### Implementación de Tabla con Filtros

#### **Componente Completo**
```javascript
function AlertsTable() {
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({
    severity: '',
    floorId: '',
    type: '',
  });

  const fetchAlerts = () => {
    const params = new URLSearchParams();
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.floorId) params.append('floorId', filters.floorId);
    if (filters.type) params.append('type', filters.type);

    fetch(`${API_BASE_URL}/alerts?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAlerts(data.data.alerts);
        }
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  return (
    <div className="alerts-section">
      {/* Filtros */}
      <div className="filters">
        <select 
          value={filters.severity} 
          onChange={e => setFilters({...filters, severity: e.target.value})}
        >
          <option value="">Todas las severidades</option>
          <option value="critical">Críticas</option>
          <option value="warning">Advertencias</option>
          <option value="info">Información</option>
        </select>

        <select 
          value={filters.floorId} 
          onChange={e => setFilters({...filters, floorId: e.target.value})}
        >
          <option value="">Todos los pisos</option>
          <option value="1">Piso 1</option>
          <option value="2">Piso 2</option>
          <option value="3">Piso 3</option>
          <option value="4">Piso 4</option>
          <option value="5">Piso 5</option>
        </select>

        <select 
          value={filters.type} 
          onChange={e => setFilters({...filters, type: e.target.value})}
        >
          <option value="">Todos los tipos</option>
          <option value="occupancy">Ocupación</option>
          <option value="temperature">Temperatura</option>
          <option value="humidity">Humedad</option>
          <option value="power">Consumo Energético</option>
          <option value="thermal_overload">Sobrecarga Térmica</option>
        </select>
      </div>

      {/* Tabla */}
      <table className="alerts-table">
        <thead>
          <tr>
            <th>Piso</th>
            <th>Severidad</th>
            <th>Tipo</th>
            <th>Mensaje</th>
            <th>Recomendación</th>
            <th>Hora</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert, idx) => (
            alert.anomalies.map((anomaly, anomIdx) => (
              <tr key={`${idx}-${anomIdx}`} className={`severity-${alert.severity}`}>
                <td>{alert.floorName}</td>
                <td>
                  <span className={`badge badge-${alert.severity}`}>
                    {alert.severity}
                  </span>
                </td>
                <td>{anomaly.metric}</td>
                <td>{anomaly.message}</td>
                <td className="recommendation">{anomaly.recommendation}</td>
                <td>{new Date(anomaly.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))
          ))}
        </tbody>
      </table>

      {alerts.length === 0 && (
        <p className="no-alerts">✅ No hay alertas con los filtros seleccionados</p>
      )}
    </div>
  );
}
```

#### **Estilos CSS**
```css
.alerts-table {
  width: 100%;
  border-collapse: collapse;
}

.alerts-table th,
.alerts-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.severity-critical {
  background-color: #fee;
}

.severity-warning {
  background-color: #fef9e7;
}

.severity-info {
  background-color: #e8f4f8;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.badge-critical {
  background-color: #dc2626;
  color: white;
}

.badge-warning {
  background-color: #f59e0b;
  color: white;
}

.badge-info {
  background-color: #3b82f6;
  color: white;
}

.recommendation {
  max-width: 400px;
  font-size: 14px;
  color: #555;
}
```

### WebSocket para Alertas en Tiempo Real

#### **Nuevas Alertas (Notificaciones)**
```javascript
socket.on('new-alerts', (data) => {
  console.log('🚨 Nueva alerta:', data.alerts);
  
  // Mostrar notificación
  data.alerts.forEach(alert => {
    if (alert.severity === 'critical') {
      showNotification({
        title: `¡ALERTA CRÍTICA! - ${alert.floorName}`,
        message: alert.anomalies[0].message,
        type: 'error',
      });
    }
  });

  // Actualizar tabla
  setAlerts(prev => [...data.alerts, ...prev]);
});
```

#### **Solicitar Alertas**
```javascript
socket.emit('request-alerts');

socket.on('alerts-data', (data) => {
  setAlerts(data.alerts);
});
```

---

## 🎨 Ejemplo Completo de Dashboard

```javascript
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3000/api/v1';
const WEBSOCKET_URL = 'ws://localhost:3000';

function SmartFloorsDashboard() {
  const [floors, setFloors] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);

  useEffect(() => {
    // Inicializar datos
    fetchInitialData();

    // WebSocket
    const socket = io(WEBSOCKET_URL);

    socket.on('initial-data', (data) => {
      setFloors(data.floors);
    });

    socket.on('floor-data', (data) => {
      setFloors(data.floors);
    });

    socket.on('new-alerts', (data) => {
      setAlerts(prev => [...data.alerts, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  const fetchInitialData = async () => {
    // Estadísticas
    const statsRes = await fetch(`${API_BASE_URL}/floors/stats`);
    const statsData = await statsRes.json();
    setStats(statsData.data);

    // Alertas
    const alertsRes = await fetch(`${API_BASE_URL}/alerts?limit=20`);
    const alertsData = await alertsRes.json();
    setAlerts(alertsData.data.alerts);
  };

  return (
    <div className="dashboard">
      <header>
        <h1>🏢 SmartFloors Dashboard</h1>
      </header>

      {/* Estadísticas Generales */}
      <section className="stats-section">
        <StatCard title="Pisos" value={stats?.totalFloors} />
        <StatCard title="Ocupación Total" value={stats?.totalOccupancy} />
        <StatCard title="Temp. Promedio" value={`${stats?.averageTemperature}°C`} />
        <StatCard title="Consumo Total" value={`${stats?.totalPowerConsumption} kWh`} />
      </section>

      {/* Estado de Pisos */}
      <section className="floors-section">
        <h2>Estado por Piso</h2>
        <div className="floors-grid">
          {floors.map(floor => (
            <FloorCard 
              key={floor.floorId} 
              floor={floor} 
              onClick={() => setSelectedFloor(floor.floorId)}
            />
          ))}
        </div>
      </section>

      {/* Gráficas de Tendencias */}
      {selectedFloor && (
        <section className="trends-section">
          <h2>Tendencias - Piso {selectedFloor}</h2>
          <FloorTrends floorId={selectedFloor} />
          <PredictionChart floorId={selectedFloor} />
        </section>
      )}

      {/* Tabla de Alertas */}
      <section className="alerts-section">
        <h2>🚨 Alertas Activas</h2>
        <AlertsTable alerts={alerts} />
      </section>
    </div>
  );
}

export default SmartFloorsDashboard;
```

---

## 📝 Resumen de Endpoints

| Endpoint | Método | Descripción | Filtros |
|----------|--------|-------------|---------|
| `/floors` | GET | Todos los pisos | - |
| `/floors/stats` | GET | Estadísticas generales | - |
| `/floors/:id` | GET | Piso específico | - |
| `/floors/:id/history` | GET | Historial para gráficas | `limit` |
| `/floors/:id/predictions` | GET | Predicciones futuras | `minutesAhead` |
| `/alerts` | GET | Alertas con filtros | `severity`, `floorId`, `type`, `limit` |

## 🔄 Eventos WebSocket

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `initial-data` | Server → Client | Datos iniciales al conectar |
| `floor-data` | Server → Client | Actualización cada minuto |
| `new-alerts` | Server → Client | Nuevas alertas detectadas |
| `predictions` | Server → Client | Predicciones cada minuto |
| `request-history` | Client → Server | Solicitar historial |
| `history-data` | Server → Client | Respuesta con historial |
| `request-alerts` | Client → Server | Solicitar alertas |
| `alerts-data` | Server → Client | Respuesta con alertas |

---

## ✅ Checklist de Implementación Frontend

- [ ] Conexión WebSocket configurada
- [ ] Dashboard de estado por piso (tarjetas/grid)
- [ ] Gráficas de tendencias con historial
- [ ] Gráficas de predicciones
- [ ] Tabla de alertas con filtros
- [ ] Notificaciones de alertas críticas
- [ ] Actualización en tiempo real
- [ ] Responsive design
- [ ] Manejo de errores y estados de carga

---

**¡Todo listo para que el frontend consuma la API!** 🚀
