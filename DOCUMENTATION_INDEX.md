# 📦 SmartFloors Backend - Resumen de Documentación

## 📚 Archivos de Documentación Disponibles

### 1. **README.md** - Documentación Principal
- Descripción general del proyecto
- Características principales
- Stack tecnológico
- Estructura del proyecto
- Guía rápida de instalación
- API REST endpoints
- WebSocket events
- Sistema de predicciones
- Sistema de alertas

### 2. **INSTALLATION.md** - Guía de Instalación Completa
- Requisitos previos detallados
- Pasos de instalación paso a paso
- Configuración de variables de entorno
- Troubleshooting común
- Checklist de instalación
- Próximos pasos

### 3. **VALIDATION.md** - Documentación de Validaciones
- Schemas implementados con Joi
- Reglas de validación
- Ejemplos de uso
- Ejemplos de errores
- Formato de respuestas
- Pruebas de validación

### 4. **API_TESTS.md** - Ejemplos de Pruebas
- Comandos cURL para cada endpoint
- Cliente Socket.IO en JavaScript
- Variables de entorno
- Scripts disponibles

### 5. **SCHEMAS_IMPLEMENTED.md** - Resumen de Implementación
- Schemas creados
- Rutas con validación
- Pruebas realizadas
- Reglas de validación
- Flujo de validación
- Beneficios

### 6. **SmartFloors.postman_collection.json** - Colección de Postman
- Todos los endpoints documentados
- Tests automáticos incluidos
- Variables de entorno configuradas
- Ejemplos de validaciones
- Casos de error

---

## 🚀 Quick Start

```bash
# 1. Clonar
git clone https://github.com/Kevinparra535/hackaton.smartfloors.backend.git
cd hackaton.smartfloors.backend

# 2. Instalar
npm install

# 3. Configurar
cp .env.example .env

# 4. Ejecutar
npm run dev

# 5. Probar
curl http://localhost:3000/health
```

---

## 📡 API Endpoints Summary

| Endpoint | Método | Descripción | Validación |
|----------|--------|-------------|------------|
| `/health` | GET | Health check | - |
| `/api/v1/floors` | GET | Todos los pisos | - |
| `/api/v1/floors/stats` | GET | Estadísticas | - |
| `/api/v1/floors/:id` | GET | Piso específico | ✅ ID: 1-100 |
| `/api/v1/floors/:id/history` | GET | Historial | ✅ ID: 1-100<br>✅ limit: 1-1440 |
| `/api/v1/floors/:id/predictions` | GET | Predicciones | ✅ ID: 1-100<br>✅ min: 10-180 |
| `/api/v1/alerts` | GET | Alertas activas | - |

---

## 🧪 Testing con Postman

### Importar Colección

1. Abrir Postman
2. Click en "Import"
3. Seleccionar `SmartFloors.postman_collection.json`
4. ¡Listo! Todos los endpoints disponibles

### Tests Incluidos

La colección incluye **tests automáticos** para:
- ✅ Verificar códigos de estado
- ✅ Validar estructura de respuestas
- ✅ Comprobar propiedades requeridas
- ✅ Verificar mensajes de error
- ✅ Validar rangos de valores

---

## 🔌 WebSocket Integration

### Conectar desde el Frontend

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Eventos del servidor
socket.on('connect', () => console.log('Conectado'));
socket.on('initial-data', (data) => console.log('Datos iniciales:', data));
socket.on('floor-data', (data) => console.log('Datos en tiempo real:', data));
socket.on('predictions', (data) => console.log('Predicciones:', data));
socket.on('new-alerts', (data) => console.log('Nuevas alertas:', data));

// Peticiones al servidor
socket.emit('request-history', { floorId: 1, limit: 60 });
socket.emit('request-prediction', { floorId: 1, minutesAhead: 60 });
socket.emit('request-alerts');
```

---

## 📊 Estructura de Respuestas

### Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    "floorId": 1,
    "name": "Piso 1",
    "occupancy": 65,
    "temperature": 23.5,
    "humidity": 45,
    "powerConsumption": 132.5,
    "timestamp": "2025-11-11T10:30:00.000Z"
  },
  "timestamp": "2025-11-11T10:30:00.000Z"
}
```

### Respuesta con Error (Validación)

```json
{
  "error": {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "El ID debe ser un número entero"
  }
}
```

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo (auto-restart)
npm run dev

# Producción
npm start

# Linting
npm run lint

# Formatear código
npm run format
```

---

## 📝 Variables de Entorno

```env
# Servidor
PORT=3000                               # Puerto del servidor
NODE_ENV=development                    # Ambiente (development/production)

# CORS
CORS_ORIGIN=http://localhost:5173      # URL del frontend

# Simulación
SIMULATION_INTERVAL=60000               # Intervalo en ms (60000 = 1 min)
NUMBER_OF_FLOORS=5                      # Número de pisos a simular
```

---

## 🎯 Características Principales

### 1. Simulación de Datos
- 1 registro por minuto por piso
- Datos realistas basados en patrones horarios
- Ocupación: 0-100 personas
- Temperatura: 18-30°C
- Humedad: 30-70%
- Consumo energético calculado

### 2. Predicciones (ML)
- Algoritmo híbrido: Promedio móvil + Regresión lineal
- Predicciones de 10 a 180 minutos
- Nivel de confianza calculado
- Predicciones para ocupación, temperatura y consumo

### 3. Detección de Anomalías
- 3 niveles: critical, warning, info
- Tipos: ocupación, temperatura, humedad, consumo, cambios bruscos
- Recomendaciones automáticas en español
- Limpieza automática de alertas antiguas

### 4. Validaciones
- Joi para schemas
- Validación de params y query strings
- Mensajes de error personalizados en español
- @hapi/boom para errores HTTP

### 5. Tiempo Real
- Socket.IO para comunicación bidireccional
- Eventos automáticos cada minuto
- Peticiones bajo demanda
- Historial de 24 horas en memoria

---

## 🔧 Dependencias

### Producción
```json
{
  "express": "^4.21.2",
  "socket.io": "^4.8.1",
  "joi": "^18.0.1",
  "@hapi/boom": "^10.0.1",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3"
}
```

### Desarrollo
```json
{
  "nodemon": "^3.0.1",
  "eslint": "^8.50.0",
  "eslint-config-prettier": "^9.0.0",
  "eslint-plugin-prettier": "^5.0.0",
  "prettier": "^3.0.3"
}
```

---

## 📖 Recursos Adicionales

### Documentación Oficial
- [Express.js](https://expressjs.com/)
- [Socket.IO](https://socket.io/docs/)
- [Joi Validation](https://joi.dev/)
- [@hapi/boom](https://hapi.dev/module/boom/)

### Tutoriales Relacionados
- WebSockets en Node.js
- Validación con Joi
- Manejo de errores con Boom
- Machine Learning básico en JavaScript

---

## 🤝 Contribución

¿Quieres contribuir? ¡Genial!

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

ISC License - SmartFloors Team 2025

---

## 👥 Equipo

**SmartFloors Team** - Hackathon 2025

---

## 📞 Soporte

¿Necesitas ayuda?

1. 📖 Lee la documentación completa
2. 🔍 Revisa los ejemplos en Postman
3. 🧪 Ejecuta las pruebas de validación
4. 💬 Crea un issue en GitHub

---

**¡Gracias por usar SmartFloors Backend!** 🚀
