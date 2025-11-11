# SmartFloors Backend - Pruebas de API

## Endpoints disponibles

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Obtener todos los pisos
```bash
curl http://localhost:3000/api/v1/floors
```

### 3. Obtener un piso específico
```bash
curl http://localhost:3000/api/v1/floors/1
```

### 4. Obtener estadísticas generales
```bash
curl http://localhost:3000/api/v1/floors/stats
```

### 5. Obtener historial de un piso (últimos 60 registros)
```bash
curl http://localhost:3000/api/v1/floors/1/history?limit=60
```

### 6. Obtener predicciones de un piso (+60 minutos)
```bash
curl http://localhost:3000/api/v1/floors/1/predictions?minutesAhead=60
```

### 7. Obtener todas las alertas
```bash
curl http://localhost:3000/api/v1/alerts
```

## Cliente Socket.IO (JavaScript)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Escuchar conexión
socket.on('connect', () => {
  console.log('Conectado al servidor');
});

// Recibir datos iniciales
socket.on('initial-data', (data) => {
  console.log('Datos iniciales:', data);
});

// Recibir datos en tiempo real (cada minuto)
socket.on('floor-data', (data) => {
  console.log('Datos actualizados:', data);
});

// Recibir predicciones
socket.on('predictions', (data) => {
  console.log('Predicciones:', data);
});

// Recibir alertas
socket.on('new-alerts', (data) => {
  console.log('Nuevas alertas:', data);
});

// Solicitar historial de un piso
socket.emit('request-history', { floorId: 1, limit: 60 });

// Solicitar predicciones
socket.emit('request-prediction', { floorId: 1, minutesAhead: 60 });

// Solicitar alertas
socket.emit('request-alerts');
```

## Variables de entorno

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
SIMULATION_INTERVAL=60000
NUMBER_OF_FLOORS=5
```

## Scripts disponibles

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start

# Linting
npm run lint

# Formateo
npm run format
```
