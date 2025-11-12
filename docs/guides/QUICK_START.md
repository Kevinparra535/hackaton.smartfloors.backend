# 🎯 README - INICIO RÁPIDO

## SmartFloors Backend API

> Sistema de monitoreo inteligente de pisos con predicciones ML y detección de anomalías

---

## ⚡ Quick Start (3 minutos)

### 1️⃣ Instalar y ejecutar

```bash
# Clonar repositorio
git clone https://github.com/Kevinparra535/hackaton.smartfloors.backend.git
cd hackaton.smartfloors.backend

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env

# Ejecutar servidor
npm run dev
```

### 2️⃣ Verificar

```bash
# Health check
curl http://localhost:3000/health

# Obtener pisos
curl http://localhost:3000/api/v1/floors
```

### 3️⃣ Probar con Postman

1. Abrir Postman
2. Import → `SmartFloors.postman_collection.json`
3. Enviar requests ✨

---

## 📚 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| **[README.md](README.md)** | 📖 Documentación principal completa |
| **[INSTALLATION.md](INSTALLATION.md)** | 🚀 Guía de instalación paso a paso |
| **[POSTMAN_GUIDE.md](POSTMAN_GUIDE.md)** | 📮 Cómo usar Postman |
| **[VALIDATION.md](VALIDATION.md)** | ✅ Validaciones y schemas |
| **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** | 📚 Índice completo |

---

## 🎯 Características Principales

✅ **Simulación en tiempo real** - 1 registro/minuto por piso  
✅ **API REST completa** - 7 endpoints documentados  
✅ **WebSocket** - Datos en tiempo real con Socket.IO  
✅ **Predicciones ML** - Promedio móvil + Regresión lineal  
✅ **Detección de anomalías** - Alertas inteligentes  
✅ **Validaciones** - Joi schemas en todas las rutas  
✅ **Tests incluidos** - Colección de Postman con 60+ tests  

---

## 📡 Endpoints

```
GET  /health                          # Health check
GET  /api/v1/floors                   # Todos los pisos
GET  /api/v1/floors/:id               # Piso específico
GET  /api/v1/floors/:id/history       # Historial
GET  /api/v1/floors/:id/predictions   # Predicciones
GET  /api/v1/floors/stats             # Estadísticas
GET  /api/v1/alerts                   # Alertas
```

---

## 🧪 Testing

### Con cURL
```bash
curl http://localhost:3000/api/v1/floors/1
```

### Con Postman
```
1. Import SmartFloors.postman_collection.json
2. Click "Send" en cualquier request
3. Ver tests automáticos ✅
```

### Con WebSocket
```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
socket.on('floor-data', console.log);
```

---

## 🛠️ Stack

- **Express.js** - Framework web
- **Socket.IO** - WebSockets
- **Joi** - Validación
- **@hapi/boom** - Errores HTTP
- **Node.js** - Runtime

---

## 📦 Estructura

```
src/
├── controllers/     # Lógica de negocio
├── routes/         # Definición de rutas
├── middlewares/    # Validación y errores
├── schemas/        # Schemas Joi
├── services/       # Simulación, predicción, alertas
├── sockets/        # WebSocket config
└── utils/          # Helpers
```

---

## 🚨 Troubleshooting

**Puerto en uso:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Reinstalar dependencias:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Ver documentación detallada:**
- [INSTALLATION.md](INSTALLATION.md)

---

## 📞 Ayuda

1. 📖 Leer [README.md](README.md)
2. 🔍 Consultar [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
3. 💬 Crear issue en GitHub

---

## ⭐ Features Destacados

### Predicciones ML
```json
{
  "occupancy": {
    "predictions": [...],
    "confidence": 0.87,
    "method": "hybrid"
  }
}
```

### Alertas Inteligentes
```json
{
  "severity": "warning",
  "message": "Temperatura elevada: 25.5°C",
  "recommendation": "Incrementar ventilación..."
}
```

### Validaciones Automáticas
```json
{
  "error": {
    "statusCode": 400,
    "message": "El ID debe ser un número entero"
  }
}
```

---

## 📝 Variables de Entorno

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
SIMULATION_INTERVAL=60000
NUMBER_OF_FLOORS=5
```

---

## 🎯 Casos de Uso

1. **Dashboard en tiempo real** → Socket.IO
2. **Análisis histórico** → `/history` endpoint
3. **Predicción de ocupación** → `/predictions` endpoint
4. **Sistema de alertas** → `/alerts` endpoint

---

## 🏆 Listo para el Hackathon

✅ Backend completo y funcional  
✅ Documentación extensiva  
✅ Tests automáticos  
✅ Colección de Postman  
✅ WebSocket configurado  
✅ Validaciones implementadas  

---

**🚀 ¡A programar!**

SmartFloors Team - Hackathon 2025
