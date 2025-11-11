# 🏢 SmartFloors Backend

Backend para monitoreo inteligente de pisos en tiempo real con predicciones y detección de anomalías.

## 🎯 Características

- **Simulación de datos**: Genera datos realistas por piso (1 registro/minuto)
- **API REST**: Endpoints para consultar datos históricos y estadísticas
- **WebSocket (Socket.IO)**: Transmisión de datos en tiempo real al frontend
- **Predicciones**: Algoritmos de promedio móvil y regresión lineal para predecir a +60 minutos
- **Detección de anomalías**: Sistema inteligente de alertas con recomendaciones
- **Validación de datos**: Schemas con Joi para validar todas las peticiones
- **Manejo de errores**: Sistema centralizado con @hapi/boom

## 📊 Datos Simulados

Cada piso genera datos realistas cada minuto:

```json
{
  "buildingId": 1,
  "buildingName": "Edificio Principal",
  "floorId": 1,
  "name": "Piso 1",
  "occupancy": 75,
  "temperature": 23.5,
  "humidity": 45,
  "powerConsumption": 125.40,
  "timestamp": "2025-11-11T..."
}
```
