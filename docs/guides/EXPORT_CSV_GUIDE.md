# 📊 Guía de Exportación CSV - SmartFloors

## 🎯 Descripción

Sistema de exportación de alertas e historial a formato CSV compatible con Excel y herramientas de análisis de datos.

## 📡 Endpoints Disponibles

### 1. Estadísticas de Exportación

```http
GET /api/v1/export/stats
```

**Descripción:** Obtiene estadísticas de datos disponibles para exportar.

**Respuesta:**
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
      "newestAlert": "2025-11-12T07:30:00Z"
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
      "oldestRecord": "2025-11-11T07:30:00Z",
      "newestRecord": "2025-11-12T07:30:00Z"
    }
  }
}
```

---

### 2. Exportar Alertas a CSV

```http
GET /api/v1/export/alerts/csv?[filtros]
```

**Parámetros de consulta (todos opcionales):**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `startDate` | ISO 8601 | Fecha de inicio | `2025-11-12T00:00:00Z` |
| `endDate` | ISO 8601 | Fecha de fin | `2025-11-12T23:59:59Z` |
| `severity` | string | Severidad (critical, warning, info) | `critical` |
| `floorId` | number | ID del piso (1-100) | `3` |
| `type` | string | Tipo de anomalía | `thermal_overload` |
| `isPredictive` | boolean | Solo alertas preventivas | `true` |

**Tipos de anomalía válidos:**
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

**Formato CSV generado:**

```csv
timestamp,floorId,floorName,severity,type,metric,value,message,recommendation,isPredictive,minutesAhead,predictedTime
2025-11-12T10:30:00Z,1,Piso 1,critical,thermal_overload,Sobrecarga Térmica,"{""temperature"":30.5,""powerConsumption"":185}",Sobrecarga térmica detectada,Reducir carga inmediatamente,No,,
2025-11-12T10:30:00Z,1,Piso 1,critical,predictive_thermal_overload,Predicción de Sobrecarga,"{""temperature"":31.2,""powerConsumption"":216}",Predicción indica sobrecarga en 30 min,Acción preventiva ahora,Si,30,2025-11-12T11:00:00Z
```

---

### 3. Exportar Historial a CSV

```http
GET /api/v1/export/history/csv?[filtros]
```

**Parámetros de consulta (todos opcionales):**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `startDate` | ISO 8601 | Fecha de inicio | `2025-11-12T00:00:00Z` |
| `endDate` | ISO 8601 | Fecha de fin | `2025-11-12T23:59:59Z` |
| `floorId` | number | ID del piso (1-100) | `1` |
| `limit` | number | Máximo de registros (1-10000) | `1000` |

**Formato CSV generado:**

```csv
timestamp,floorId,floorName,temperature,humidity,occupancy,powerConsumption
2025-11-12T10:30:00Z,1,Piso 1,25.5,65,75,150.5
2025-11-12T10:31:00Z,1,Piso 1,25.8,64,78,152.3
2025-11-12T10:32:00Z,1,Piso 1,26.1,63,80,154.1
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Exportar todas las alertas

```bash
curl http://localhost:3000/api/v1/export/alerts/csv -o todas_las_alertas.csv
```

### Ejemplo 2: Exportar solo alertas críticas

```bash
curl "http://localhost:3000/api/v1/export/alerts/csv?severity=critical" -o alertas_criticas.csv
```

### Ejemplo 3: Exportar alertas preventivas del día

```bash
curl "http://localhost:3000/api/v1/export/alerts/csv?isPredictive=true&startDate=2025-11-12T00:00:00Z&endDate=2025-11-12T23:59:59Z" -o preventivas_hoy.csv
```

### Ejemplo 4: Exportar sobrecarga térmica del Piso 3

```bash
curl "http://localhost:3000/api/v1/export/alerts/csv?type=thermal_overload&floorId=3" -o sobrecarga_piso3.csv
```

### Ejemplo 5: Exportar historial completo del Piso 1

```bash
curl "http://localhost:3000/api/v1/export/history/csv?floorId=1&limit=1440" -o historial_piso1.csv
```

### Ejemplo 6: Exportar historial de las últimas 2 horas

```bash
curl "http://localhost:3000/api/v1/export/history/csv?limit=120" -o ultimas_2_horas.csv
```

### Ejemplo 7: Exportar historial con rango de fechas

```bash
curl "http://localhost:3000/api/v1/export/history/csv?startDate=2025-11-12T06:00:00Z&endDate=2025-11-12T12:00:00Z" -o historial_manana.csv
```

---

## 📦 Usando PowerShell

### Exportar alertas

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/export/alerts/csv" -OutFile "alertas.csv"
```

### Exportar con filtros múltiples

```powershell
$url = "http://localhost:3000/api/v1/export/alerts/csv?severity=critical&floorId=1&isPredictive=true"
Invoke-WebRequest -Uri $url -OutFile "alertas_filtradas.csv"
```

### Exportar historial

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/export/history/csv?floorId=1&limit=100" -OutFile "historial.csv"
```

---

## 🧪 Pruebas con Postman

La colección de Postman incluye 10 requests pre-configurados para exportación:

1. **Get Export Statistics** - Ver datos disponibles
2. **Export All Alerts to CSV** - Exportar todas las alertas
3. **Export Critical Alerts to CSV** - Solo alertas críticas
4. **Export Alerts by Floor to CSV** - Por piso
5. **Export Predictive Alerts to CSV** - Solo preventivas
6. **Export Thermal Overload Alerts to CSV** - Sobrecarga térmica
7. **Export Alerts with Date Range** - Con rango de fechas
8. **Export All History to CSV** - Todo el historial
9. **Export Floor History to CSV** - Historial de un piso
10. **Export History with Date Filter** - Con filtro de fecha

### Importar colección

1. Abrir Postman
2. Click en "Import"
3. Seleccionar archivo: `postman/SmartFloors.postman_collection.json`
4. Navegar a la carpeta "Exportación CSV"
5. Ejecutar cualquier request

---

## 🔍 Validaciones

El sistema valida automáticamente:

- ✅ Formato de fechas (ISO 8601)
- ✅ Rangos de IDs de piso (1-100)
- ✅ Valores de severidad (critical, warning, info)
- ✅ Tipos de anomalía válidos
- ✅ Límites de registros (1-10000)
- ✅ Fecha de fin posterior a fecha de inicio

**Errores retornan status 400 con mensaje descriptivo en español.**

---

## 📊 Análisis de Datos

Los archivos CSV exportados pueden ser:

1. **Abiertos en Excel** - Compatible con UTF-8 BOM
2. **Importados a Power BI** - Para dashboards
3. **Procesados con Python** - pandas, numpy, matplotlib
4. **Analizados con R** - ggplot2, dplyr
5. **Cargados a bases de datos** - PostgreSQL, MySQL

### Ejemplo con Python (pandas)

```python
import pandas as pd

# Leer alertas
df_alerts = pd.read_csv('alertas.csv')

# Analizar por severidad
print(df_alerts.groupby('severity').size())

# Filtrar críticas
critical = df_alerts[df_alerts['severity'] == 'critical']

# Leer historial
df_history = pd.read_csv('historial.csv')

# Graficar temperatura
df_history.plot(x='timestamp', y='temperature', kind='line')
```

---

## ⚡ Características Técnicas

- **Codificación:** UTF-8 con BOM (compatible con Excel)
- **Separador:** Coma (`,`)
- **Escape:** Comillas dobles (`""`) para valores con comas
- **Headers:** Primera fila con nombres de columnas
- **Formato de descarga:** `attachment; filename="smartfloors-*.csv"`
- **Timestamp:** ISO 8601 con zona horaria UTC

---

## 🆘 Troubleshooting

### El archivo CSV está vacío
**Causa:** No hay datos que cumplan los filtros especificados  
**Solución:** Usar `GET /api/v1/export/stats` para ver datos disponibles

### Error 400: formato de fecha inválido
**Causa:** La fecha no está en formato ISO 8601  
**Solución:** Use formato: `YYYY-MM-DDTHH:mm:ssZ` (ej: `2025-11-12T10:30:00Z`)

### Excel no muestra acentos correctamente
**Causa:** Configuración de encoding  
**Solución:** El BOM UTF-8 está incluido. Si persiste, en Excel: Datos → Desde texto → UTF-8

### Servidor retorna 503
**Causa:** Servicios no inicializados  
**Solución:** Reiniciar el servidor con `npm run dev`

---

## 📝 Notas

- Los datos son **volátiles** (se pierden al reiniciar servidor)
- Historial limitado a **1440 registros** por piso (24 horas)
- Alertas se limpian automáticamente después de **24 horas**
- Formato CSV optimizado para **análisis y reproducción** de datos

---

## 🔗 Endpoints Relacionados

- `GET /api/v1/alerts` - Ver alertas en formato JSON
- `GET /api/v1/floors/:id/history` - Ver historial en formato JSON
- `GET /api/v1/floors/stats` - Estadísticas generales

---

**Última actualización:** 12 de noviembre de 2025  
**Versión API:** v1
