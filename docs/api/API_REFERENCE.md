# 🌐 API REST - Referencia Completa

Documentación completa de todos los endpoints disponibles en SmartFloors Backend.

**Base URL**: `http://localhost:3000`  
**Versión API**: `v1`  
**Total de endpoints**: 23

---

## 📋 Índice

- [Health Check](#health-check)
- [Pisos](#pisos)
- [Alertas](#alertas)
- [Exportación CSV](#exportación-csv)
- [Códigos de Respuesta](#códigos-de-respuesta)
- [Autenticación](#autenticación)
- [Rate Limiting](#rate-limiting)

---

## Health Check

### Verificar Estado del Servidor

```http
GET /health
```

**Descripción**: Verifica que el servidor esté funcionando correctamente.

**Respuesta exitosa** (200):
```json
{
  "status": "OK",
  "uptime": 3600,
  "timestamp": "2025-11-12T10:30:00.000Z",
  "environment": "development"
}
```

**Ejemplo**:
```bash
curl http://localhost:3000/health
```

---

## Pisos

### 1. Obtener Todos los Pisos

```http
GET /api/v1/floors
```

**Descripción**: Obtiene los datos actuales de todos los pisos del edificio.

**Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": [
    {
      "floorId": 1,
      "name": "Piso 1",
      "occupancy": 75,
      "temperature": 25.5,
      "humidity": 65,
      "powerConsumption": 150.5,
      "timestamp": "2025-11-12T10:30:00.000Z"
    }
    // ... más pisos
  ],
  "count": 5,
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

**Ejemplo**:
```bash
curl http://localhost:3000/api/v1/floors
```

---

### 2. Obtener Piso Específico

```http
GET /api/v1/floors/:id
```

**Parámetros de Ruta**:
| Parámetro | Tipo | Descripción | Validación |
|-----------|------|-------------|------------|
| `id` | integer | ID del piso | 1-100 |

**Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "floorId": 1,
    "name": "Piso 1",
    "occupancy": 75,
    "temperature": 25.5,
    "humidity": 65,
    "powerConsumption": 150.5,
    "timestamp": "2025-11-12T10:30:00.000Z"
  },
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

**Errores posibles**:
- `400` - ID inválido (no es número o fuera de rango)
- `404` - Piso no encontrado

**Ejemplo**:
```bash
curl http://localhost:3000/api/v1/floors/1
```

---

### 3. Obtener Estadísticas Generales

```http
GET /api/v1/floors/stats
```

**Descripción**: Obtiene estadísticas agregadas de todos los pisos.

**Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "totalFloors": 5,
    "totalOccupancy": 375,
    "averageOccupancy": 75,
    "averageTemperature": 25.5,
    "averageHumidity": 65,
    "totalPowerConsumption": 752.5,
    "alerts": {
      "total": 3,
      "critical": 1,
      "warning": 2,
      "info": 0
    }
  },
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

**Ejemplo**:
```bash
curl http://localhost:3000/api/v1/floors/stats
```

---

### 4. Obtener Historial de un Piso

```http
GET /api/v1/floors/:id/history?limit=60
```

**Parámetros de Ruta**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID del piso (1-100) |

**Parámetros de Query**:
| Parámetro | Tipo | Descripción | Default | Rango |
|-----------|------|-------------|---------|-------|
| `limit` | integer | Número de registros | 60 | 1-1440 |

**Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
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
      // ... más registros históricos
    ],
    "count": 60
  },
  "timestamp": "2025-11-12T10:31:00.000Z"
}
```

**Ejemplo**:
```bash
# Últimos 60 registros (1 hora)
curl "http://localhost:3000/api/v1/floors/1/history?limit=60"

# Últimas 24 horas (máximo)
curl "http://localhost:3000/api/v1/floors/1/history?limit=1440"
```

---

### 5. Obtener Predicciones de un Piso

```http
GET /api/v1/floors/:id/predictions?minutesAhead=60
```

**Parámetros de Ruta**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID del piso (1-100) |

**Parámetros de Query**:
| Parámetro | Tipo | Descripción | Default | Rango |
|-----------|------|-------------|---------|-------|
| `minutesAhead` | integer | Minutos a predecir | 60 | 10-180 |

**Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
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
          },
          {
            "minutesAhead": 20,
            "occupancy": 77.1,
            "timestamp": "2025-11-12T10:50:00.000Z"
          }
          // ... 6 puntos total
        ],
        "trend": "increasing",
        "confidence": "medium"
      },
      "temperature": { /* similar estructura */ },
      "humidity": { /* similar estructura */ },
      "powerConsumption": { /* similar estructura */ }
    },
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

**Algoritmo**: Híbrido MA (60%) + LR (40%)

**Ejemplo**:
```bash
# Predicción a 60 minutos
curl "http://localhost:3000/api/v1/floors/1/predictions?minutesAhead=60"

# Predicción a 3 horas
curl "http://localhost:3000/api/v1/floors/1/predictions?minutesAhead=180"
```

---

## Alertas

### 1. Obtener Todas las Alertas

```http
GET /api/v1/alerts
```

**Parámetros de Query** (todos opcionales):
| Parámetro | Tipo | Descripción | Valores |
|-----------|------|-------------|---------|
| `severity` | string | Filtrar por severidad | `critical`, `warning`, `info` |
| `floorId` | integer | Filtrar por piso | 1-100 |
| `type` | string | Filtrar por tipo | Ver tipos abajo |
| `limit` | integer | Máximo de resultados | 1-100 (default: 50) |

**Tipos de anomalía válidos**:
- `occupancy` - Ocupación anormal
- `temperature` - Temperatura fuera de rango
- `humidity` - Humedad fuera de rango
- `power` - Consumo energético alto
- `thermal_overload` - Sobrecarga térmica
- `sudden_change` - Cambio repentino
- `predictive_temperature` - Predicción de temperatura
- `predictive_humidity` - Predicción de humedad
- `predictive_power` - Predicción de energía
- `predictive_thermal_overload` - Predicción de sobrecarga

**Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
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
            "message": "ALERTA CRÍTICA PREVENTIVA: Predicción indica que el Piso 1 superará 30°C en 30 minutos con consumo alto de 216.5 kWh",
            "recommendation": "ACCIÓN INMEDIATA PREVENTIVA: Reducir carga térmica del Piso 1 AHORA...",
            "timestamp": "2025-11-12T10:30:00.000Z",
            "predictedTime": "2025-11-12T11:00:00.000Z"
          }
        ],
        "timestamp": "2025-11-12T10:30:00.000Z"
      }
    ],
    "count": 1,
    "filters": {
      "severity": null,
      "floorId": null,
      "type": null,
      "limit": 50
    }
  },
  "timestamp": "2025-11-12T10:31:00.000Z"
}
```

**Ejemplos**:
```bash
# Todas las alertas
curl http://localhost:3000/api/v1/alerts

# Solo alertas críticas
curl "http://localhost:3000/api/v1/alerts?severity=critical"

# Alertas del piso 3
curl "http://localhost:3000/api/v1/alerts?floorId=3"

# Sobrecarga térmica
curl "http://localhost:3000/api/v1/alerts?type=thermal_overload"

# Alertas preventivas críticas del piso 1
curl "http://localhost:3000/api/v1/alerts?severity=critical&floorId=1&type=predictive_thermal_overload"
```

---

## Exportación CSV

### 1. Obtener Estadísticas de Exportación

```http
GET /api/v1/export/stats
```

**Descripción**: Obtiene estadísticas de datos disponibles para exportar.

**Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "alerts": {
      "total": 32,
      "byType": {
        "current": 22,
        "predictive": 10
      },
      "bySeverity": {
        "critical": 8,
        "warning": 15,
        "info": 9
      },
      "oldestAlert": "2025-11-12T06:00:00Z",
      "newestAlert": "2025-11-12T10:30:00Z"
    },
    "history": {
      "total": 1440,
      "byFloor": {
        "1": 288,
        "2": 288,
        "3": 288,
        "4": 288,
        "5": 288
      },
      "oldestRecord": "2025-11-11T10:30:00Z",
      "newestRecord": "2025-11-12T10:30:00Z"
    }
  },
  "timestamp": "2025-11-12T10:31:00.000Z"
}
```

**Ejemplo**:
```bash
curl http://localhost:3000/api/v1/export/stats
```

---

### 2. Exportar Alertas a CSV

```http
GET /api/v1/export/alerts/csv
```

**Parámetros de Query** (todos opcionales):
| Parámetro | Tipo | Descripción | Valores |
|-----------|------|-------------|---------|
| `startDate` | ISO 8601 | Fecha de inicio | `2025-11-12T00:00:00Z` |
| `endDate` | ISO 8601 | Fecha de fin | `2025-11-12T23:59:59Z` |
| `severity` | string | Severidad | `critical`, `warning`, `info` |
| `floorId` | integer | ID del piso | 1-100 |
| `type` | string | Tipo de anomalía | Ver tipos en Alertas |
| `isPredictive` | boolean | Solo preventivas | `true`, `false` |

**Respuesta exitosa** (200):
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="smartfloors-alerts-2025-11-12.csv"

﻿timestamp,floorId,floorName,severity,type,metric,value,message,recommendation,isPredictive,minutesAhead,predictedTime
2025-11-12T10:30:00Z,1,Piso 1,critical,thermal_overload,Sobrecarga Térmica,"{""temperature"":30.5,""powerConsumption"":185}",Sobrecarga térmica detectada,Reducir carga inmediatamente,No,,
```

**Ejemplos**:
```bash
# Todas las alertas
curl "http://localhost:3000/api/v1/export/alerts/csv" -o alertas.csv

# Solo críticas
curl "http://localhost:3000/api/v1/export/alerts/csv?severity=critical" -o criticas.csv

# Preventivas del día
curl "http://localhost:3000/api/v1/export/alerts/csv?isPredictive=true&startDate=2025-11-12T00:00:00Z&endDate=2025-11-12T23:59:59Z" -o preventivas_hoy.csv
```

---

### 3. Exportar Historial a CSV

```http
GET /api/v1/export/history/csv
```

**Parámetros de Query** (todos opcionales):
| Parámetro | Tipo | Descripción | Valores |
|-----------|------|-------------|---------|
| `startDate` | ISO 8601 | Fecha de inicio | `2025-11-12T00:00:00Z` |
| `endDate` | ISO 8601 | Fecha de fin | `2025-11-12T23:59:59Z` |
| `floorId` | integer | ID del piso | 1-100 |
| `limit` | integer | Máximo registros | 1-10000 |

**Respuesta exitosa** (200):
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="smartfloors-history-2025-11-12.csv"

﻿timestamp,floorId,floorName,temperature,humidity,occupancy,powerConsumption
2025-11-12T10:30:00Z,1,Piso 1,25.5,65,75,150.5
2025-11-12T10:31:00Z,1,Piso 1,25.8,64,78,152.3
```

**Ejemplos**:
```bash
# Todo el historial
curl "http://localhost:3000/api/v1/export/history/csv" -o historial.csv

# Piso 1 - últimas 24h
curl "http://localhost:3000/api/v1/export/history/csv?floorId=1&limit=1440" -o piso1_24h.csv

# Rango de fechas
curl "http://localhost:3000/api/v1/export/history/csv?startDate=2025-11-12T06:00:00Z&endDate=2025-11-12T12:00:00Z" -o manana.csv
```

---

## Códigos de Respuesta

### Códigos de Éxito

| Código | Mensaje | Descripción |
|--------|---------|-------------|
| `200` | OK | Solicitud exitosa |
| `201` | Created | Recurso creado exitosamente |

### Códigos de Error

| Código | Mensaje | Descripción | Ejemplo |
|--------|---------|-------------|---------|
| `400` | Bad Request | Parámetros inválidos | ID fuera de rango, fecha mal formada |
| `404` | Not Found | Recurso no encontrado | Piso no existe, sin datos |
| `503` | Service Unavailable | Servicios no inicializados | Servidor reiniciando |
| `500` | Internal Server Error | Error del servidor | Error no controlado |

### Formato de Error

**Error de Validación (400)**:
```json
{
  "error": {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "El ID debe ser un número entero mayor o igual a 1"
  }
}
```

**Error de Servicio (503)**:
```json
{
  "success": false,
  "message": "Simulador no inicializado",
  "error": "Service not ready"
}
```

---

## Autenticación

**Versión actual**: Sin autenticación

En producción, considera implementar:
- JWT tokens
- API Keys
- OAuth 2.0

---

## Rate Limiting

**Versión actual**: Sin límite de rate

Recomendaciones para producción:
- 100 requests/minuto por IP
- 1000 requests/hora por API key

---

## Versionado de API

**Versión actual**: `v1`

URL base: `/api/v1/`

Cambios breaking se manejarán con nuevas versiones (`v2`, `v3`).

---

## CORS

**Configurado en** `.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

Por defecto acepta requests de cualquier origen en desarrollo.

---

## Headers Recomendados

### Request
```http
Content-Type: application/json
Accept: application/json
```

### Response
```http
Content-Type: application/json; charset=utf-8
X-Response-Time: 15ms
```

---

## Ejemplos con JavaScript

### Fetch API

```javascript
// Obtener todos los pisos
async function getFloors() {
  const response = await fetch('http://localhost:3000/api/v1/floors');
  const data = await response.json();
  return data.data;
}

// Obtener predicciones
async function getPredictions(floorId, minutes) {
  const response = await fetch(
    `http://localhost:3000/api/v1/floors/${floorId}/predictions?minutesAhead=${minutes}`
  );
  return await response.json();
}

// Obtener alertas críticas
async function getCriticalAlerts() {
  const response = await fetch(
    'http://localhost:3000/api/v1/alerts?severity=critical'
  );
  return await response.json();
}
```

### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 5000
});

// Obtener piso específico
const floor = await api.get('/floors/1');

// Obtener historial
const history = await api.get('/floors/1/history', {
  params: { limit: 60 }
});

// Exportar alertas
const response = await api.get('/export/alerts/csv', {
  params: { severity: 'critical', isPredictive: true },
  responseType: 'blob'
});
```

---

## Mejores Prácticas

### 1. Manejo de Errores

```javascript
async function fetchFloor(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/floors/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error desconocido');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching floor:', error);
    throw error;
  }
}
```

### 2. Validación de Parámetros

```javascript
function validateFloorId(id) {
  const floorId = parseInt(id);
  if (isNaN(floorId) || floorId < 1 || floorId > 100) {
    throw new Error('ID de piso inválido (debe ser 1-100)');
  }
  return floorId;
}
```

### 3. Caché de Datos

```javascript
const cache = new Map();

async function getFloorsWithCache() {
  const cacheKey = 'floors';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.data;
  }
  
  const response = await fetch('http://localhost:3000/api/v1/floors');
  const data = await response.json();
  
  cache.set(cacheKey, {
    data: data.data,
    timestamp: Date.now()
  });
  
  return data.data;
}
```

---

## Changelog

### v1.0.0 (2025-11-12)
- ✅ Endpoints de pisos (5)
- ✅ Endpoints de alertas (1)
- ✅ Endpoints de exportación (3)
- ✅ Validación con Joi
- ✅ Manejo de errores con Boom
- ✅ Soporte para filtros avanzados
- ✅ Exportación CSV con UTF-8 BOM

---

## Recursos Adicionales

- **[WebSocket Guide](WEBSOCKET_GUIDE.md)** - Eventos en tiempo real
- **[Colección Postman](../../postman/)** - 35 requests pre-configurados
- **[Ejemplos de Integración](../guides/EXAMPLES.md)** - Código real
- **[Troubleshooting](../development/TROUBLESHOOTING.md)** - Solución de problemas

---

<div align="center">

**¿Encontraste un error en la documentación?**  
[Abre un Issue](https://github.com/Kevinparra535/hackaton.smartfloors.backend/issues)

[⬆ Volver arriba](#-api-rest---referencia-completa)

</div>
