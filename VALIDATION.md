# Validación de Schemas - SmartFloors Backend

## Schemas implementados

Se han creado schemas de validación utilizando **Joi** para garantizar que las peticiones a la API sean correctas.

## Schemas disponibles

### 1. `floorParamsSchema`
Valida el parámetro `id` en las rutas que requieren especificar un piso.

**Reglas:**
- Debe ser un número entero
- Valor mínimo: 1
- Valor máximo: 100
- Requerido

**Ejemplo de uso:**
```javascript
GET /api/v1/floors/1
GET /api/v1/floors/5
```

**Errores:**
```bash
# ID no numérico
GET /api/v1/floors/abc
# Respuesta: 400 - "El ID debe ser un número"

# ID fuera de rango
GET /api/v1/floors/0
# Respuesta: 400 - "El ID debe ser mayor o igual a 1"

GET /api/v1/floors/101
# Respuesta: 400 - "El ID debe ser menor o igual a 100"
```

### 2. `getFloorHistorySchema`
Valida el query parameter `limit` para obtener el historial de un piso.

**Reglas:**
- Debe ser un número entero
- Valor mínimo: 1
- Valor máximo: 1440 (24 horas de registros)
- Opcional (por defecto: 60)

**Ejemplo de uso:**
```bash
# Sin límite (usa default: 60)
GET /api/v1/floors/1/history

# Con límite específico
GET /api/v1/floors/1/history?limit=100

# Máximo permitido (24 horas)
GET /api/v1/floors/1/history?limit=1440
```

**Errores:**
```bash
# Límite negativo
GET /api/v1/floors/1/history?limit=-10
# Respuesta: 400 - "El límite debe ser al menos 1"

# Límite muy alto
GET /api/v1/floors/1/history?limit=2000
# Respuesta: 400 - "El límite no puede exceder 1440 (24 horas)"

# Límite no numérico
GET /api/v1/floors/1/history?limit=abc
# Respuesta: 400 - "El límite debe ser un número"
```

### 3. `getFloorPredictionsSchema`
Valida el query parameter `minutesAhead` para obtener predicciones.

**Reglas:**
- Debe ser un número entero
- Valor mínimo: 10 minutos
- Valor máximo: 180 minutos (3 horas)
- Opcional (por defecto: 60)

**Ejemplo de uso:**
```bash
# Sin especificar (usa default: 60 min)
GET /api/v1/floors/1/predictions

# Predicción a 30 minutos
GET /api/v1/floors/1/predictions?minutesAhead=30

# Predicción a 3 horas
GET /api/v1/floors/1/predictions?minutesAhead=180
```

**Errores:**
```bash
# Menos del mínimo
GET /api/v1/floors/1/predictions?minutesAhead=5
# Respuesta: 400 - "Los minutos deben ser al menos 10"

# Más del máximo
GET /api/v1/floors/1/predictions?minutesAhead=200
# Respuesta: 400 - "Los minutos no pueden exceder 180 (3 horas)"
```

## Rutas protegidas con validación

### ✅ Con validación de params

```javascript
GET /api/v1/floors/:id
- Valida: floorParamsSchema en params

GET /api/v1/floors/:id/history
- Valida: floorParamsSchema en params
- Valida: getFloorHistorySchema en query

GET /api/v1/floors/:id/predictions
- Valida: floorParamsSchema en params
- Valida: getFloorPredictionsSchema en query
```

### ⚪ Sin validación

```javascript
GET /api/v1/floors
GET /api/v1/floors/stats
GET /api/v1/alerts
GET /health
```

## Formato de respuestas de error

Cuando hay un error de validación, el servidor responde con:

```json
{
  "error": {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "El ID debe ser un número entero. El límite debe ser al menos 1"
  }
}
```

## Cómo funciona

1. **Definición del schema** (`src/schemas/validator.schema.js`):
   ```javascript
   const floorParamsSchema = Joi.object({
     id: Joi.number().integer().min(1).max(100).required()
   });
   ```

2. **Aplicación en la ruta** (`src/routes/floors.router.js`):
   ```javascript
   router.get(
     '/floors/:id',
     validatorHandler(floorParamsSchema, 'params'),
     getFloorById
   );
   ```

3. **Middleware validador** (`src/middlewares/validator.handler.js`):
   - Recibe el schema y la propiedad a validar (params, query, body)
   - Ejecuta la validación con Joi
   - Si hay error, envía boom.badRequest al siguiente middleware
   - Si todo está bien, pasa al siguiente middleware (controlador)

4. **Manejo de errores** (`src/middlewares/errors.handler.js`):
   - `boomErrorHandler` captura los errores de Boom
   - Devuelve respuesta formateada con el código de estado correcto

## Ejemplo de prueba

```bash
# ✅ Válido
curl http://localhost:3000/api/v1/floors/1/history?limit=50

# ❌ Inválido - ID no numérico
curl http://localhost:3000/api/v1/floors/abc/history

# ❌ Inválido - Límite fuera de rango
curl http://localhost:3000/api/v1/floors/1/history?limit=5000

# ❌ Inválido - Múltiples errores
curl http://localhost:3000/api/v1/floors/999/predictions?minutesAhead=500
```

## Beneficios

✅ **Seguridad**: Previene datos malformados o maliciosos  
✅ **Consistencia**: Garantiza que todos los endpoints reciban datos válidos  
✅ **Mensajes claros**: Errores específicos y comprensibles para el cliente  
✅ **Mantenibilidad**: Validaciones centralizadas y reutilizables  
✅ **Documentación**: Los schemas sirven como documentación del API
