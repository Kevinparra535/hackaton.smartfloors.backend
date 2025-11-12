# 🔧 Troubleshooting

Guía de solución de problemas comunes y errores frecuentes.

---

## 📋 Índice

- [Problemas de Instalación](#problemas-de-instalación)
- [Errores de Conexión](#errores-de-conexión)
- [Problemas de WebSocket](#problemas-de-websocket)
- [Errores de API](#errores-de-api)
- [Problemas de Simulación](#problemas-de-simulación)
- [Errores de Configuración](#errores-de-configuración)
- [Problemas de Email](#problemas-de-email)
- [Problemas de Rendimiento](#problemas-de-rendimiento)

---

## Problemas de Instalación

### Error: `Cannot find module`

**Síntoma**:
```
Error: Cannot find module 'express'
    at Function.Module._resolveFilename
```

**Causa**: Dependencias no instaladas

**Solución**:
```bash
npm install
```

**Si persiste**:
```bash
# Limpiar y reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

### Error: `Node version not compatible`

**Síntoma**:
```
error engines Unsupported nodejs version
```

**Causa**: Node.js versión < 16.0.0

**Solución**:
```bash
# Verificar versión
node --version

# Si < 16.0.0, instalar versión compatible
# Windows: https://nodejs.org/en/download/
# macOS: brew install node@16
# Linux: nvm install 16
```

---

### Error: `Permission denied` (Linux/macOS)

**Síntoma**:
```
EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solución**:
```bash
# Opción 1: Usar nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 16

# Opción 2: Cambiar owner de carpeta npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

---

## Errores de Conexión

### Error: `EADDRINUSE: address already in use`

**Síntoma**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causa**: Puerto 3000 ya está ocupado

**Solución**:

**Opción 1: Cambiar puerto**
```env
# .env
PORT=3001
```

**Opción 2: Matar proceso** (PowerShell)
```powershell
# Encontrar proceso en puerto 3000
netstat -ano | findstr :3000

# Matar proceso (reemplazar PID)
taskkill /PID <PID> /F
```

**Linux/macOS**:
```bash
# Encontrar y matar
lsof -ti:3000 | xargs kill -9
```

---

### Error: `ECONNREFUSED`

**Síntoma**:
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Causa**: Servidor no está corriendo

**Solución**:
```bash
# Verificar que el servidor esté corriendo
npm run dev

# En otra terminal, verificar health
curl http://localhost:3000/health
```

---

### Error: CORS Policy

**Síntoma** (Browser Console):
```
Access to fetch at 'http://localhost:3000/api/v1/floors' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Causa**: Origen no permitido en CORS_ORIGIN

**Solución**:

**1. Verificar `.env`**:
```env
CORS_ORIGIN=http://localhost:5173
```

**2. Verificar protocolo (http vs https)**:
```env
# ✅ CORRECTO
CORS_ORIGIN=http://localhost:5173

# ❌ INCORRECTO
CORS_ORIGIN=localhost:5173  # Falta http://
CORS_ORIGIN=https://localhost:5173  # Protocolo equivocado
```

**3. Múltiples orígenes**:
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
```

**4. Permitir todos (solo desarrollo)**:
```env
CORS_ORIGIN=*
```

---

## Problemas de WebSocket

### Error: `WebSocket connection failed`

**Síntoma** (Browser Console):
```
WebSocket connection to 'ws://localhost:3000' failed
```

**Solución**:

**1. Verificar servidor**:
```bash
# Asegurar que el servidor esté corriendo
npm run dev
```

**2. Usar fallback a polling**:
```javascript
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']  // Agrega polling
});
```

**3. Verificar firewall**:
```powershell
# Windows: Permitir puerto 3000
netsh advfirewall firewall add rule name="SmartFloors" dir=in action=allow protocol=TCP localport=3000
```

---

### Eventos no se reciben

**Síntoma**: Listeners de Socket.IO no se ejecutan

**Solución**:

**1. Verificar nombres de eventos (case-sensitive)**:
```javascript
// ✅ CORRECTO
socket.on('floor-data', handler);

// ❌ INCORRECTO
socket.on('Floor-Data', handler);  // Capitalización incorrecta
socket.on('floorData', handler);   // Sin guión
```

**2. Verificar conexión**:
```javascript
socket.on('connect', () => {
  console.log('✅ Conectado');
});

socket.on('disconnect', (reason) => {
  console.log('❌ Desconectado:', reason);
});
```

**3. Revisar logs del servidor**:
```bash
# Habilitar debugging
DEBUG=socket.io* npm run dev
```

---

### Memory leak en React

**Síntoma**: Advertencia `Can't perform a React state update on an unmounted component`

**Causa**: Listeners no se limpian al desmontar componente

**Solución**:
```javascript
// ❌ MAL
useEffect(() => {
  socket.on('floor-data', handler);
});

// ✅ BIEN
useEffect(() => {
  socket.on('floor-data', handler);
  
  return () => {
    socket.off('floor-data', handler);  // Limpiar
  };
}, []);
```

---

## Errores de API

### Error: `400 Bad Request`

**Síntoma**:
```json
{
  "error": {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "\"id\" must be a number"
  }
}
```

**Causa**: Parámetros inválidos

**Solución**:

**1. Verificar tipos**:
```javascript
// ❌ INCORRECTO
fetch('/api/v1/floors/abc');  // 'abc' no es número

// ✅ CORRECTO
fetch('/api/v1/floors/1');
```

**2. Verificar rangos**:
```javascript
// ❌ INCORRECTO
fetch('/api/v1/floors/150');  // ID > 100

// ✅ CORRECTO
fetch('/api/v1/floors/1');    // ID 1-100
```

**3. Verificar query params**:
```javascript
// ❌ INCORRECTO
fetch('/api/v1/floors/1/history?limit=abc');

// ✅ CORRECTO
fetch('/api/v1/floors/1/history?limit=60');
```

---

### Error: `404 Not Found`

**Síntoma**:
```json
{
  "success": false,
  "message": "Piso no encontrado"
}
```

**Causa**: Recurso no existe

**Solución**:

**1. Verificar que el piso existe**:
```bash
# Listar todos los pisos
curl http://localhost:3000/api/v1/floors

# Verificar cantidad de pisos
echo $env:NUMBER_OF_FLOORS
```

**2. Verificar ruta correcta**:
```javascript
// ✅ CORRECTO
fetch('/api/v1/floors/1');

// ❌ INCORRECTO
fetch('/api/floors/1');        // Falta /v1
fetch('/api/v1/floor/1');      // Singular 'floor'
```

---

### Error: `503 Service Unavailable`

**Síntoma**:
```json
{
  "success": false,
  "message": "Simulador no inicializado"
}
```

**Causa**: Servicios singleton no inicializados

**Solución**:

**1. Esperar a que el servidor termine de iniciar**:
```bash
# Buscar en logs:
Servidor inicializado en puerto 3000
Simulación iniciada (intervalo: 60000ms)
```

**2. Verificar errores en startup**:
```bash
npm run dev
# Revisar si hay errores durante inicialización
```

**3. Reiniciar servidor**:
```bash
# Ctrl+C para detener
npm run dev
```

---

## Problemas de Simulación

### Datos no se generan

**Síntoma**: Endpoint `/api/v1/floors` retorna array vacío

**Solución**:

**1. Verificar `NUMBER_OF_FLOORS`**:
```env
NUMBER_OF_FLOORS=5  # Debe ser > 0
```

**2. Verificar logs**:
```bash
npm run dev
# Buscar: "Datos generados para 5 pisos"
```

**3. Verificar `SIMULATION_INTERVAL`**:
```env
SIMULATION_INTERVAL=60000  # No debe ser 0
```

---

### Historial está vacío

**Síntoma**: `/api/v1/floors/1/history` retorna `count: 0`

**Causa**: Servidor recién iniciado, sin datos históricos

**Solución**:

**1. Esperar 1-2 minutos** para que se generen datos

**2. Verificar intervalo de simulación**:
```env
# Reducir intervalo para testing
SIMULATION_INTERVAL=10000  # 10 segundos
```

**3. Generar datos manualmente** (desarrollo):
```javascript
// src/services/simulator.services.js
constructor() {
  // Generar datos iniciales
  for (let i = 0; i < 60; i++) {
    this.generateData();
  }
}
```

---

### Predicciones no son precisas

**Síntoma**: Predicciones muy diferentes de valores reales

**Causa**: Insuficiente historial o algoritmo limitado

**Solución**:

**1. Esperar acumulación de historial** (al menos 60 registros)

**2. Ajustar pesos del algoritmo**:
```javascript
// src/services/prediction.services.js
predictMetric(history, metric, minutesAhead) {
  const ma = this.movingAverage(history, metric);
  const lr = this.linearRegression(history, metric);
  
  // Ajustar pesos según necesidad
  return (ma * 0.7) + (lr * 0.3);  // Más énfasis en promedio
}
```

**3. Aumentar ventana de historial**:
```javascript
// Usar más datos para predicción
generatePredictions(floors) {
  const history = simulator.getHistory(floor.floorId, 120);  // Era 60
  // ...
}
```

---

## Errores de Configuración

### Error: `.env` no se carga

**Síntoma**: Variables de entorno son `undefined`

**Solución**:

**1. Verificar que existe `.env` en raíz**:
```bash
ls .env
```

**2. Verificar orden de carga en `index.js`**:
```javascript
// ✅ CORRECTO - PRIMERO
require('dotenv').config();
const server = require('./src/app');

// ❌ INCORRECTO
const server = require('./src/app');
require('dotenv').config();  // Tarde
```

**3. Verificar sintaxis de `.env`**:
```env
# ✅ CORRECTO
PORT=3000
NODE_ENV=development

# ❌ INCORRECTO
PORT = 3000          # Espacios alrededor de =
PORT="3000"          # Comillas innecesarias (solo para strings con espacios)
```

---

### Error: Valores de `.env` no cambian

**Síntoma**: Cambios en `.env` no se reflejan

**Causa**: Servidor no reiniciado o `.env` cacheado

**Solución**:

**1. Reiniciar servidor**:
```bash
# Ctrl+C para detener
npm run dev
```

**2. Limpiar cache de Node.js** (si persiste):
```bash
Remove-Item -Recurse -Force node_modules\.cache
npm run dev
```

---

## Problemas de Email

### Emails no se envían

**Síntoma**: Sin errores pero emails no llegan

**Solución**:

**1. Verificar configuración**:
```env
EMAIL_NOTIFICATIONS_ENABLED=true  # Debe ser true
EMAILJS_SERVICE_ID=service_abc123  # Configurado
EMAILJS_PUBLIC_KEY=user_xyz789
EMAILJS_PRIVATE_KEY=abc123xyz789
```

**2. Verificar implementación**:
```javascript
// src/services/email.services.js
// Buscar línea 18 - debe estar descomentada:
const emailjs = require('@emailjs/nodejs');
```

**3. Verificar rate limiting**:
```javascript
// Revisar logs
console.log('Emails enviados esta hora:', emailService.getSentCount());
// Si >= 10, esperar a que se resetee
```

**4. Probar endpoint de test**:
```bash
curl -X POST http://localhost:3000/api/v1/email/test
```

---

### Error: `EmailJS not configured`

**Síntoma**:
```json
{
  "success": false,
  "message": "EmailJS not configured"
}
```

**Causa**: Variables de EmailJS faltantes

**Solución**:
```env
# Agregar a .env
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_PUBLIC_KEY=user_xyz789
EMAILJS_PRIVATE_KEY=abc123xyz789
```

**Ver guía completa**: [EMAIL_SETUP.md](EMAIL_SETUP.md)

---

## Problemas de Rendimiento

### Alto uso de memoria

**Síntoma**: RAM > 500 MB para 5 pisos

**Causa**: Historial acumulado o memory leaks

**Solución**:

**1. Verificar límite de historial**:
```javascript
// src/services/simulator.services.js
addToHistory(data) {
  // Debe estar limitado a 1440/piso
  const floorHistory = this.history.filter(h => h.floorId === floor.floorId);
  if (floorHistory.length > 1440) {
    // Eliminar oldest
  }
}
```

**2. Reducir número de pisos**:
```env
NUMBER_OF_FLOORS=3  # Era 5
```

**3. Aumentar heap de Node.js**:
```bash
$env:NODE_OPTIONS="--max-old-space-size=2048"
npm start
```

---

### Respuestas lentas de API

**Síntoma**: Requests > 1 segundo

**Causa**: Cálculos costosos o historial grande

**Solución**:

**1. Limitar datos retornados**:
```javascript
// Limitar historial por defecto
GET /api/v1/floors/1/history?limit=60  # No 1440
```

**2. Cachear predicciones**:
```javascript
// src/services/prediction.services.js
constructor() {
  this.cache = new Map();
  this.cacheTTL = 60000;  // 1 minuto
}

generatePredictions(floors) {
  const cacheKey = `predictions_${Date.now() / 60000 | 0}`;
  
  if (this.cache.has(cacheKey)) {
    return this.cache.get(cacheKey);
  }
  
  const predictions = /* ... cálculo ... */;
  this.cache.set(cacheKey, predictions);
  
  return predictions;
}
```

**3. Usar compresión**:
```javascript
// src/app.js
const compression = require('compression');
app.use(compression());
```

---

### WebSocket desconexiones frecuentes

**Síntoma**: Cliente se desconecta cada 30 segundos

**Causa**: Timeout de conexión o red inestable

**Solución**:

**1. Ajustar timeouts de Socket.IO**:
```javascript
// src/app.js
const io = socketIO(server, {
  pingTimeout: 60000,    // 60 segundos
  pingInterval: 25000    // 25 segundos
});
```

**2. Habilitar reconexión automática** (cliente):
```javascript
const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

---

## Logs de Debugging

### Habilitar logs detallados

```env
# .env
DEBUG=true
LOG_LEVEL=debug
```

### Logs de Socket.IO

```bash
# PowerShell
$env:DEBUG="socket.io*"
npm run dev
```

### Logs de Express

```javascript
// src/app.js
const morgan = require('morgan');
app.use(morgan('dev'));
```

---

## Comandos de Diagnóstico

### Verificar estado del servidor

```bash
# Health check
curl http://localhost:3000/health

# Verificar pisos
curl http://localhost:3000/api/v1/floors

# Verificar stats
curl http://localhost:3000/api/v1/floors/stats
```

### Verificar procesos

```powershell
# Ver procesos de Node.js
Get-Process | Where-Object {$_.ProcessName -eq "node"}

# Ver puertos en uso
netstat -ano | findstr :3000
```

### Verificar logs en tiempo real

```bash
# PowerShell
npm run dev | Tee-Object -FilePath logs.txt

# Luego en otra terminal
Get-Content logs.txt -Wait
```

---

## Obtener Ayuda

### Recopilar información

Antes de abrir un issue, recopila:

```bash
# Versión de Node.js
node --version

# Versión de npm
npm --version

# Sistema operativo
$env:OS

# Logs del servidor
npm run dev > logs.txt 2>&1
```

### Plantilla de Issue

```markdown
**Descripción del problema**:
[Breve descripción]

**Pasos para reproducir**:
1. ...
2. ...

**Comportamiento esperado**:
[Qué debería pasar]

**Comportamiento actual**:
[Qué pasa realmente]

**Entorno**:
- OS: Windows 11
- Node.js: v16.14.0
- npm: 8.3.1

**Logs**:
```
[Pegar logs relevantes]
```

**Variables de entorno**:
```env
PORT=3000
NUMBER_OF_FLOORS=5
```
```

---

## Recursos Adicionales

- **[Configuración](CONFIGURATION.md)** - Variables de entorno
- **[Arquitectura](ARCHITECTURE.md)** - Diseño del sistema
- **[API Reference](../api/API_REFERENCE.md)** - Documentación de endpoints

---

<div align="center">

**¿No encuentras tu problema?**  
[Abrir Issue](https://github.com/Kevinparra535/hackaton.smartfloors.backend/issues)

[⬆ Volver arriba](#-troubleshooting)

</div>
