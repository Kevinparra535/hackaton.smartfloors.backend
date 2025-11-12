# 🚀 Instrucciones de Instalación y Configuración

## SmartFloors Backend - Guía Completa

### 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v16.x o superior ([Descargar](https://nodejs.org/))
- **npm** v8.x o superior (incluido con Node.js)
- **Git** ([Descargar](https://git-scm.com/))
- **Postman** (opcional, para testing) ([Descargar](https://www.postman.com/downloads/))

### 📥 Paso 1: Clonar el repositorio

```bash
# Clonar el repositorio
git clone https://github.com/Kevinparra535/hackaton.smartfloors.backend.git

# Navegar al directorio del proyecto
cd hackaton.smartfloors.backend
```

### 📦 Paso 2: Instalar dependencias

```bash
# Instalar todas las dependencias del proyecto
npm install
```

**Dependencias principales instaladas:**
- `express` - Framework web
- `socket.io` - WebSockets en tiempo real
- `joi` - Validación de schemas
- `@hapi/boom` - Manejo de errores HTTP
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Variables de entorno

**Dependencias de desarrollo:**
- `nodemon` - Auto-restart del servidor
- `eslint` - Linter de código
- `prettier` - Formateador de código

### ⚙️ Paso 3: Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env (usar tu editor favorito)
nano .env
# o
code .env
# o
vim .env
```

**Configuración recomendada para desarrollo:**

```env
# Puerto del servidor
PORT=3000

# Ambiente
NODE_ENV=development

# CORS - URL del frontend
CORS_ORIGIN=http://localhost:5173

# Intervalo de simulación (milisegundos)
# 60000 = 1 minuto
SIMULATION_INTERVAL=60000

# Número de pisos a simular
NUMBER_OF_FLOORS=5
```

**Para producción:**

```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://tu-dominio-frontend.com
SIMULATION_INTERVAL=60000
NUMBER_OF_FLOORS=5
```

### ▶️ Paso 4: Ejecutar el servidor

#### Modo desarrollo (recomendado)

```bash
npm run dev
```

El servidor se reiniciará automáticamente cuando detecte cambios en los archivos.

#### Modo producción

```bash
npm start
```

### ✅ Paso 5: Verificar que funciona

Una vez que el servidor esté corriendo, deberías ver:

```
🚀 ========================================
🚀 SmartFloors Backend iniciado en puerto 3000
🚀 Ambiente: development
🚀 Health check: http://localhost:3000/health
🚀 API REST: http://localhost:3000/api/v1/
🚀 WebSocket: ws://localhost:3000
🚀 ========================================
```

#### Prueba rápida con cURL

```bash
# Health check
curl http://localhost:3000/health

# Obtener todos los pisos
curl http://localhost:3000/api/v1/floors

# Obtener un piso específico
curl http://localhost:3000/api/v1/floors/1
```

Si recibes respuestas JSON, ¡todo está funcionando correctamente! ✅

### 📮 Paso 6: Importar colección de Postman (Opcional)

1. Abrir Postman
2. Click en "Import"
3. Seleccionar el archivo `SmartFloors.postman_collection.json`
4. La colección aparecerá en tu workspace

La colección incluye:
- ✅ Todos los endpoints documentados
- ✅ Tests automáticos
- ✅ Variables de entorno configuradas
- ✅ Ejemplos de validaciones

### 🧪 Paso 7: Ejecutar tests (Opcional)

#### Linting

```bash
npm run lint
```

#### Formateo de código

```bash
npm run format
```

#### Tests de validación

```bash
chmod +x test-validation.sh
./test-validation.sh
```

### 🔧 Troubleshooting

#### El puerto 3000 está en uso

```bash
# Opción 1: Cambiar el puerto en .env
PORT=3001

# Opción 2: Matar el proceso en el puerto 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Opción 3: Matar el proceso en el puerto 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Error de módulos no encontrados

```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

#### Error de permisos (macOS/Linux)

```bash
# Dar permisos de ejecución a scripts
chmod +x test-validation.sh

# O ejecutar con sudo (no recomendado)
sudo npm start
```

### 📊 Endpoints Disponibles

Una vez corriendo, puedes acceder a:

| Endpoint | Descripción |
|----------|-------------|
| `http://localhost:3000/health` | Health check |
| `http://localhost:3000/api/v1/floors` | Todos los pisos |
| `http://localhost:3000/api/v1/floors/:id` | Piso específico |
| `http://localhost:3000/api/v1/floors/:id/history` | Historial |
| `http://localhost:3000/api/v1/floors/:id/predictions` | Predicciones |
| `http://localhost:3000/api/v1/floors/stats` | Estadísticas |
| `http://localhost:3000/api/v1/alerts` | Alertas |

### 🌐 WebSocket

Conectar desde el frontend:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Conectado al servidor');
});

socket.on('floor-data', (data) => {
  console.log('Datos actualizados:', data);
});
```

### 📚 Próximos Pasos

1. **Leer la documentación completa**: `README.md`
2. **Revisar validaciones**: `VALIDATION.md`
3. **Probar con Postman**: Usar la colección incluida
4. **Integrar con frontend**: Conectar Socket.IO
5. **Personalizar**: Ajustar número de pisos, intervalos, etc.

### 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs en la consola
2. Verifica que todas las dependencias estén instaladas
3. Comprueba que el archivo `.env` esté configurado correctamente
4. Revisa la documentación en `README.md`

### 📝 Notas Importantes

- Los datos se simulan en **memoria**, no persisten al reiniciar
- El historial guarda las **últimas 24 horas** por piso
- Las alertas se limpian automáticamente cada hora
- Todas las validaciones están en español
- El servidor usa **Socket.IO** para tiempo real

---

## ✅ Checklist de Instalación

- [ ] Node.js y npm instalados
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Health check verificado (`curl http://localhost:3000/health`)
- [ ] Colección de Postman importada (opcional)
- [ ] Endpoints probados

¡Listo para desarrollar! 🚀
