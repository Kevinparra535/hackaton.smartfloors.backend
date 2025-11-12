# 🔌 WebSocket - Guía de Tiempo Real

Documentación completa del sistema de comunicación en tiempo real con Socket.IO.

**URL de conexión**: `ws://localhost:3000`  
**Biblioteca**: Socket.IO 4.x  
**Protocolo**: WebSocket con fallback a HTTP long-polling

---

## 📋 Índice

- [Introducción](#introducción)
- [Conexión al Servidor](#conexión-al-servidor)
- [Eventos del Servidor](#eventos-del-servidor)
- [Eventos del Cliente](#eventos-del-cliente)
- [Formato de Datos](#formato-de-datos)
- [Manejo de Errores](#manejo-de-errores)
- [Ejemplos por Tecnología](#ejemplos-por-tecnología)
- [Mejores Prácticas](#mejores-prácticas)

---

## Introducción

SmartFloors usa **Socket.IO** para transmitir datos de sensores en tiempo real. El servidor emite actualizaciones cada 60 segundos (configurable).

### ¿Por qué WebSocket?

- ✅ **Baja latencia**: Datos instantáneos sin polling
- ✅ **Eficiencia**: Conexión persistente, menos overhead
- ✅ **Bidireccional**: Cliente y servidor pueden iniciar comunicación
- ✅ **Escalable**: Broadcast a múltiples clientes simultáneamente

---

## Conexión al Servidor

### JavaScript (Browser)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <script>
    // Conectar al servidor
    const socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Evento de conexión
    socket.on('connect', () => {
      console.log('✅ Conectado al servidor');
      console.log('ID de sesión:', socket.id);
    });

    // Evento de desconexión
    socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado:', reason);
    });

    // Evento de error
    socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error.message);
    });
  </script>
</body>
</html>
```

### Node.js (Backend)

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

socket.on('connect', () => {
  console.log('✅ Conectado:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Desconectado:', reason);
});
```

### React

```jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function SmartFloorsApp() {
  const [socket, setSocket] = useState(null);
  const [floors, setFloors] = useState([]);

  useEffect(() => {
    // Conectar al servidor
    const newSocket = io('http://localhost:3000');

    newSocket.on('connect', () => {
      console.log('✅ Conectado');
    });

    newSocket.on('floor-data', (data) => {
      setFloors(data.floors);
    });

    setSocket(newSocket);

    // Cleanup al desmontar
    return () => newSocket.close();
  }, []);

  return (
    <div>
      {floors.map(floor => (
        <div key={floor.floorId}>
          {floor.name}: {floor.temperature}°C
        </div>
      ))}
    </div>
  );
}
```

### Vue 3

```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import io from 'socket.io-client';

export default {
  setup() {
    const floors = ref([]);
    let socket = null;

    onMounted(() => {
      socket = io('http://localhost:3000');

      socket.on('connect', () => {
        console.log('✅ Conectado');
      });

      socket.on('floor-data', (data) => {
        floors.value = data.floors;
      });
    });

    onUnmounted(() => {
      if (socket) socket.close();
    });

    return { floors };
  }
};
```

---

## Eventos del Servidor

### 1. `initial-data`

**Emisión**: Cuando un cliente se conecta  
**Frecuencia**: Una vez por conexión

**Datos**:

```json
{
  "floors": [
    {
      "floorId": 1,
      "name": "Piso 1",
      "occupancy": 75,
      "temperature": 25.5,
      "humidity": 65,
      "powerConsumption": 150.5,
      "timestamp": "2025-11-12T10:30:00.000Z"
    }
  ],
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

**Ejemplo**:

```javascript
socket.on('initial-data', (data) => {
  console.log('📊 Datos iniciales recibidos');
  console.log('Número de pisos:', data.floors.length);
  initializeUI(data.floors);
});
```

---

### 2. `floor-data`

**Emisión**: Cada 60 segundos (configurable)  
**Frecuencia**: Continua mientras la conexión esté activa

**Datos**:

```json
{
  "floors": [
    {
      "floorId": 1,
      "name": "Piso 1",
      "occupancy": 75,
      "temperature": 25.5,
      "humidity": 65,
      "powerConsumption": 150.5,
      "timestamp": "2025-11-12T10:31:00.000Z"
    }
  ],
  "timestamp": "2025-11-12T10:31:00.000Z"
}
```

**Ejemplo**:

```javascript
socket.on('floor-data', (data) => {
  console.log('🔄 Datos actualizados:', data.timestamp);
  
  data.floors.forEach(floor => {
    updateFloorUI(floor.floorId, floor);
  });
});
```

---

### 3. `new-alerts`

**Emisión**: Cuando se detectan anomalías  
**Frecuencia**: Variable (solo cuando hay alertas)

**Datos**:

```json
{
  "alerts": [
    {
      "floorId": 1,
      "floorName": "Piso 1",
      "severity": "critical",
      "type": "predictive",
      "anomalies": [
        {
          "type": "predictive_thermal_overload",
          "severity": "critical",
          "metric": "Predicción de Sobrecarga Térmica",
          "value": {
            "temperature": 30.5,
            "powerConsumption": 216.5
          },
          "minutesAhead": 30,
          "message": "ALERTA CRÍTICA PREVENTIVA: Predicción indica que el Piso 1 superará 30°C en 30 minutos",
          "recommendation": "ACCIÓN INMEDIATA PREVENTIVA: Reducir carga térmica AHORA",
          "timestamp": "2025-11-12T10:30:00.000Z",
          "predictedTime": "2025-11-12T11:00:00.000Z"
        }
      ],
      "timestamp": "2025-11-12T10:30:00.000Z"
    }
  ],
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

**Ejemplo**:

```javascript
socket.on('new-alerts', (data) => {
  console.log('🚨 Nuevas alertas detectadas');
  
  data.alerts.forEach(alert => {
    if (alert.severity === 'critical') {
      showCriticalNotification(alert);
      playAlertSound();
    }
    
    addAlertToUI(alert);
  });
});
```

---

### 4. `predictions`

**Emisión**: Cada 60 segundos (junto con floor-data)  
**Frecuencia**: Continua

**Datos**:

```json
{
  "predictions": [
    {
      "floorId": 1,
      "currentData": {
        "occupancy": 75,
        "temperature": 25.5,
        "humidity": 65,
        "powerConsumption": 150.5
      },
      "predictions": {
        "occupancy": {
          "predictions": [
            {
              "minutesAhead": 10,
              "occupancy": 76.2,
              "timestamp": "2025-11-12T10:40:00.000Z"
            }
          ],
          "trend": "increasing",
          "confidence": "medium"
        }
      }
    }
  ],
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

**Ejemplo**:

```javascript
socket.on('predictions', (data) => {
  console.log('🔮 Predicciones actualizadas');
  
  data.predictions.forEach(pred => {
    updatePredictionChart(pred.floorId, pred.predictions);
    
    if (pred.predictions.temperature.trend === 'increasing') {
      showTrendWarning(pred.floorId, 'temperature');
    }
  });
});
```

---

## Eventos del Cliente

### 1. `request-history`

**Solicitar historial de un piso**

**Emisión**:

```javascript
socket.emit('request-history', {
  floorId: 1,
  limit: 60  // Opcional: 1-1440 (default: 60)
});
```

**Respuesta** (`history-data`):

```json
{
  "floorId": 1,
  "history": [
    {
      "floorId": 1,
      "name": "Piso 1",
      "occupancy": 75,
      "temperature": 25.5,
      "humidity": 65,
      "powerConsumption": 150.5,
      "timestamp": "2025-11-12T10:30:00.000Z"
    }
  ],
  "count": 60
}
```

**Ejemplo completo**:

```javascript
// Solicitar historial
socket.emit('request-history', { floorId: 1, limit: 120 });

// Escuchar respuesta
socket.on('history-data', (data) => {
  console.log(`📈 Historial del piso ${data.floorId}`);
  console.log(`${data.count} registros recibidos`);
  
  renderHistoryChart(data.history);
});
```

---

### 2. `request-prediction`

**Solicitar predicciones de un piso**

**Emisión**:

```javascript
socket.emit('request-prediction', {
  floorId: 1,
  minutesAhead: 60  // Opcional: 10-180 (default: 60)
});
```

**Respuesta** (`prediction-data`):

```json
{
  "floorId": 1,
  "currentData": { /* ... */ },
  "predictions": { /* ... */ }
}
```

**Ejemplo completo**:

```javascript
// Solicitar predicción a 2 horas
socket.emit('request-prediction', { 
  floorId: 3, 
  minutesAhead: 120 
});

// Escuchar respuesta
socket.on('prediction-data', (data) => {
  console.log(`🔮 Predicción para piso ${data.floorId}`);
  
  renderPredictionGraph(data.predictions);
  
  // Detectar tendencias
  const tempTrend = data.predictions.temperature.trend;
  if (tempTrend === 'increasing') {
    showWarning('Temperatura en aumento');
  }
});
```

---

## Formato de Datos

### Floor Data

```typescript
interface FloorData {
  floorId: number;           // 1-100
  name: string;              // "Piso 1"
  occupancy: number;         // 0-100 (%)
  temperature: number;       // °C (decimales)
  humidity: number;          // 0-100 (%)
  powerConsumption: number;  // kWh (decimales)
  timestamp: string;         // ISO 8601
}
```

### Alert Data

```typescript
interface Alert {
  floorId: number;
  floorName: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'current' | 'predictive';
  anomalies: Anomaly[];
  timestamp: string;
}

interface Anomaly {
  type: string;              // 'thermal_overload', 'predictive_temperature', etc.
  severity: 'critical' | 'warning' | 'info';
  metric: string;            // Nombre legible
  value: any;                // Valor o objeto con valores
  minutesAhead?: number;     // Solo para predictive
  message: string;           // Descripción
  recommendation: string;    // Acción sugerida
  timestamp: string;
  predictedTime?: string;    // Solo para predictive
}
```

### Prediction Data

```typescript
interface PredictionData {
  floorId: number;
  currentData: {
    occupancy: number;
    temperature: number;
    humidity: number;
    powerConsumption: number;
  };
  predictions: {
    [metric: string]: {
      predictions: PredictionPoint[];
      trend: 'increasing' | 'decreasing' | 'stable';
      confidence: 'high' | 'medium' | 'low';
    };
  };
}

interface PredictionPoint {
  minutesAhead: number;
  [metric: string]: number | string;  // occupancy, temperature, etc.
  timestamp: string;
}
```

---

## Manejo de Errores

### Reconexión Automática

```javascript
const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionDelay: 1000,        // Esperar 1s antes de reintentar
  reconnectionDelayMax: 5000,     // Máximo 5s entre reintentos
  reconnectionAttempts: 5         // Intentar 5 veces
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`🔄 Reintento de conexión #${attemptNumber}`);
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`✅ Reconectado después de ${attemptNumber} intentos`);
});

socket.on('reconnect_failed', () => {
  console.error('❌ Falló la reconexión');
  showErrorMessage('No se pudo conectar al servidor');
});
```

### Validación de Datos

```javascript
socket.on('floor-data', (data) => {
  // Validar estructura
  if (!data || !Array.isArray(data.floors)) {
    console.error('Datos inválidos recibidos');
    return;
  }

  // Validar cada piso
  data.floors.forEach(floor => {
    if (typeof floor.temperature !== 'number' || 
        isNaN(floor.temperature)) {
      console.warn(`Temperatura inválida en piso ${floor.floorId}`);
      return;
    }

    updateFloor(floor);
  });
});
```

### Timeout para Requests

```javascript
function requestHistoryWithTimeout(floorId, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timeout: No se recibió respuesta'));
    }, timeout);

    socket.emit('request-history', { floorId });

    socket.once('history-data', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

// Uso
try {
  const history = await requestHistoryWithTimeout(1);
  console.log('Historial recibido:', history);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## Ejemplos por Tecnología

### React Dashboard Completo

```jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function FloorMonitor() {
  const [floors, setFloors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('initial-data', (data) => {
      setFloors(data.floors);
    });

    socket.on('floor-data', (data) => {
      setFloors(data.floors);
    });

    socket.on('new-alerts', (data) => {
      setAlerts(prev => [...data.alerts, ...prev].slice(0, 50));
      
      // Notificación de alertas críticas
      data.alerts.forEach(alert => {
        if (alert.severity === 'critical') {
          new Notification('⚠️ Alerta Crítica', {
            body: alert.anomalies[0].message
          });
        }
      });
    });

    return () => socket.close();
  }, []);

  return (
    <div>
      <div>Estado: {connected ? '✅ Conectado' : '❌ Desconectado'}</div>
      
      <h2>Pisos ({floors.length})</h2>
      {floors.map(floor => (
        <div key={floor.floorId} className="floor-card">
          <h3>{floor.name}</h3>
          <p>🌡️ {floor.temperature}°C</p>
          <p>💧 {floor.humidity}%</p>
          <p>👥 {floor.occupancy}%</p>
          <p>⚡ {floor.powerConsumption} kWh</p>
        </div>
      ))}

      <h2>Alertas Recientes</h2>
      {alerts.map((alert, i) => (
        <div key={i} className={`alert-${alert.severity}`}>
          <strong>{alert.floorName}</strong>
          <p>{alert.anomalies[0].message}</p>
        </div>
      ))}
    </div>
  );
}
```

### Python Cliente

```python
import socketio

sio = socketio.Client()

@sio.event
def connect():
    print('✅ Conectado al servidor')

@sio.event
def disconnect():
    print('❌ Desconectado')

@sio.on('floor-data')
def on_floor_data(data):
    print(f'📊 Datos actualizados: {len(data["floors"])} pisos')
    
    for floor in data['floors']:
        print(f'  Piso {floor["floorId"]}: {floor["temperature"]}°C')

@sio.on('new-alerts')
def on_alerts(data):
    for alert in data['alerts']:
        if alert['severity'] == 'critical':
            print(f'🚨 CRÍTICO: {alert["floorName"]}')
            print(f'   {alert["anomalies"][0]["message"]}')

# Conectar
sio.connect('http://localhost:3000')

# Solicitar historial
sio.emit('request-history', {'floorId': 1, 'limit': 60})

@sio.on('history-data')
def on_history(data):
    print(f'📈 Historial recibido: {data["count"]} registros')

# Mantener conexión
sio.wait()
```

### Angular Service

```typescript
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  onFloorData(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('floor-data', (data) => {
        observer.next(data);
      });
    });
  }

  onNewAlerts(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('new-alerts', (data) => {
        observer.next(data);
      });
    });
  }

  requestHistory(floorId: number, limit: number = 60): void {
    this.socket.emit('request-history', { floorId, limit });
  }

  onHistoryData(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('history-data', (data) => {
        observer.next(data);
      });
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
```

---

## Mejores Prácticas

### 1. Desconectar al Desmontar

```javascript
// ❌ MAL: Conexión persistente sin cleanup
const socket = io('http://localhost:3000');

// ✅ BIEN: Desconectar al desmontar componente
useEffect(() => {
  const socket = io('http://localhost:3000');
  
  return () => {
    socket.close();
  };
}, []);
```

### 2. Evitar Múltiples Conexiones

```javascript
// ❌ MAL: Crear socket en cada render
function Component() {
  const socket = io('http://localhost:3000');  // ¡Nueva conexión cada render!
  
  return <div>...</div>;
}

// ✅ BIEN: Singleton o context
const socket = io('http://localhost:3000');  // Una vez fuera del componente

// O usar Context
const SocketContext = createContext();

function SocketProvider({ children }) {
  const [socket] = useState(() => io('http://localhost:3000'));
  
  useEffect(() => {
    return () => socket.close();
  }, [socket]);
  
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
```

### 3. Batching de Actualizaciones

```javascript
// ❌ MAL: Actualizar estado en cada dato
socket.on('floor-data', (data) => {
  data.floors.forEach(floor => {
    setFloor(floor);  // ¡Múltiples renders!
  });
});

// ✅ BIEN: Una actualización por lote
socket.on('floor-data', (data) => {
  setFloors(data.floors);  // Un solo render
});
```

### 4. Debouncing de Eventos Rápidos

```javascript
import { debounce } from 'lodash';

const updateUI = debounce((data) => {
  setFloors(data.floors);
}, 500);

socket.on('floor-data', updateUI);
```

### 5. Logging Selectivo

```javascript
const DEBUG = process.env.NODE_ENV === 'development';

socket.on('floor-data', (data) => {
  if (DEBUG) {
    console.log('📊 Floor data:', data);
  }
  updateFloors(data.floors);
});
```

---

## Configuración del Servidor

Variables de entorno relacionadas:

```env
# Intervalo de emisión (milisegundos)
SIMULATION_INTERVAL=60000    # 1 minuto

# Número de pisos
NUMBER_OF_FLOORS=5

# CORS permitido
CORS_ORIGIN=http://localhost:5173
```

---

## Troubleshooting

### Conexión Falla

**Problema**: `connect_error: xhr poll error`

**Solución**:
```javascript
// Asegúrate de incluir ambos transportes
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
});
```

### Eventos No se Reciben

**Problema**: Listeners no responden

**Solución**:
```javascript
// Verificar que el socket esté conectado
socket.on('connect', () => {
  console.log('Conectado, listeners activos');
});

// Verificar nombre del evento (case-sensitive)
socket.on('floor-data', ...);  // ✅ CORRECTO
socket.on('Floor-Data', ...);  // ❌ INCORRECTO
```

### Memory Leaks

**Problema**: Múltiples listeners duplicados

**Solución**:
```javascript
// ❌ MAL: Agregar listener en cada render
useEffect(() => {
  socket.on('floor-data', handler);  // Se acumulan listeners
});

// ✅ BIEN: Remover listener al limpiar
useEffect(() => {
  socket.on('floor-data', handler);
  
  return () => {
    socket.off('floor-data', handler);
  };
}, []);
```

---

## Recursos Adicionales

- **[API REST](API_REFERENCE.md)** - Endpoints HTTP
- **[Socket.IO Docs](https://socket.io/docs/v4/)** - Documentación oficial
- **[Ejemplos Completos](../guides/EXAMPLES.md)** - Integraciones reales

---

<div align="center">

**¿Problemas con WebSocket?**  
[Ver Troubleshooting](../development/TROUBLESHOOTING.md)

[⬆ Volver arriba](#-websocket---guía-de-tiempo-real)

</div>
