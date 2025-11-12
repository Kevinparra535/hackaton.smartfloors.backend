# 📮 Guía Rápida de Postman - SmartFloors Backend

## 🚀 Cómo usar la colección de Postman

### Paso 1: Importar la colección

1. **Abrir Postman**
   - Si no lo tienes instalado, descárgalo desde [postman.com](https://www.postman.com/downloads/)

2. **Importar colección**
   - Click en el botón **"Import"** (esquina superior izquierda)
   - Selecciona el archivo `SmartFloors.postman_collection.json`
   - Click en **"Import"**

3. **Verificar importación**
   - La colección aparecerá en la barra lateral izquierda
   - Nombre: **"SmartFloors Backend API"**

### Paso 2: Configurar variables

Las variables ya están configuradas, pero puedes modificarlas:

1. Click derecho en la colección → **"Edit"**
2. Ir a la pestaña **"Variables"**
3. Modificar valores si es necesario:
   - `base_url`: `http://localhost:3000` (cambiar si usas otro puerto)
   - `api_version`: `v1`

### Paso 3: Ejecutar requests

#### 🏥 Health Check

1. Expandir carpeta **"Health Check"**
2. Click en **"Check Server Status"**
3. Click en **"Send"**
4. Verificar respuesta:
   ```json
   {
     "status": "OK",
     "timestamp": "2025-11-11T..."
   }
   ```

#### 🏢 Obtener Pisos

1. Expandir carpeta **"Pisos"**
2. Click en **"Get All Floors"**
3. Click en **"Send"**
4. Ver respuesta con datos de todos los pisos

#### 📊 Estadísticas

1. En carpeta **"Pisos"**
2. Click en **"Get Floor Statistics"**
3. Click en **"Send"**
4. Ver estadísticas generales

#### 📈 Predicciones

1. En carpeta **"Pisos"**
2. Click en **"Get Floor Predictions"**
3. Modificar query param `minutesAhead` si deseas (10-180)
4. Click en **"Send"**
5. Ver predicciones futuras

### Paso 4: Ver tests automáticos

Cada request tiene tests automáticos que se ejecutan después de enviar:

1. Envía un request
2. Click en la pestaña **"Test Results"** (debajo de la respuesta)
3. Verás checkmarks verdes ✅ si todo está bien
4. Verás errores rojos ❌ si algo falló

**Ejemplo de tests:**
```javascript
✅ Status code is 200
✅ Response is successful
✅ Response has data array
✅ Each floor has required properties
```

### Paso 5: Probar validaciones

La carpeta **"Validaciones (Errores esperados)"** contiene requests que **deben fallar**:

1. Expandir carpeta **"Validaciones"**
2. Click en **"Invalid Floor ID - Not a Number"**
3. Click en **"Send"**
4. Deberías recibir error 400:
   ```json
   {
     "error": {
       "statusCode": 400,
       "error": "Bad Request",
       "message": "El ID debe ser un número"
     }
   }
   ```
5. Los tests verificarán que el error sea el esperado ✅

---

## 📋 Estructura de la Colección

### 1️⃣ Health Check
- ✅ Check Server Status

### 2️⃣ Pisos
- ✅ Get All Floors
- ✅ Get Floor By ID
- ✅ Get Floor Statistics
- ✅ Get Floor History
- ✅ Get Floor Predictions

### 3️⃣ Alertas
- ✅ Get All Alerts

### 4️⃣ Validaciones (Errores esperados)
- ❌ Invalid Floor ID - Not a Number
- ❌ Invalid Floor ID - Out of Range (0)
- ❌ Invalid Floor ID - Out of Range (101)
- ❌ Invalid History Limit - Too High
- ❌ Invalid Predictions - Minutes Too Low
- ❌ Invalid Predictions - Minutes Too High

---

## 🎯 Tips y Trucos

### Ejecutar toda la colección

1. Click derecho en la colección
2. **"Run collection"**
3. Click en **"Run SmartFloors Backend API"**
4. Ver todos los tests ejecutándose automáticamente

### Guardar requests en favoritos

1. Click en el request
2. Hover sobre el nombre
3. Click en la estrella ⭐

### Modificar query parameters

En requests como **"Get Floor History"**:

1. Click en la pestaña **"Params"**
2. Modificar valores:
   - `limit`: Cambiar de 60 a otro valor (1-1440)
3. Click en **"Send"**

### Modificar path variables

En requests como **"Get Floor By ID"**:

1. En la URL, el `:id` es una variable
2. En la pestaña **"Params"**, sección **"Path Variables"**
3. Cambiar el valor del `id` (1-100)
4. Click en **"Send"**

### Ver código generado

Postman puede generar código para usar en tu app:

1. Click en el botón **"Code"** (</> ícono a la derecha)
2. Selecciona tu lenguaje:
   - JavaScript - Fetch
   - Node.js - Axios
   - cURL
   - Python - Requests
   - etc.
3. Copia y pega en tu código

**Ejemplo JavaScript Fetch:**
```javascript
fetch('http://localhost:3000/api/v1/floors/1', {
  method: 'GET',
})
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## 🧪 Ejemplos de Uso

### Ejemplo 1: Monitorear un piso específico

```
1. Get Floor By ID (id=1)
2. Get Floor History (id=1, limit=30)
3. Get Floor Predictions (id=1, minutesAhead=60)
```

### Ejemplo 2: Dashboard general

```
1. Get All Floors
2. Get Floor Statistics
3. Get All Alerts
```

### Ejemplo 3: Análisis de tendencias

```
1. Get Floor History (id=1, limit=1440) // Últimas 24h
2. Get Floor Predictions (id=1, minutesAhead=180) // 3h futuro
```

---

## ⚡ Atajos de Teclado

| Acción | Windows/Linux | macOS |
|--------|---------------|-------|
| Enviar request | `Ctrl + Enter` | `Cmd + Enter` |
| Guardar request | `Ctrl + S` | `Cmd + S` |
| Buscar | `Ctrl + K` | `Cmd + K` |
| Nueva pestaña | `Ctrl + T` | `Cmd + T` |
| Cerrar pestaña | `Ctrl + W` | `Cmd + W` |

---

## 🔍 Inspeccionar Respuestas

### Pestaña "Body"
- Ver respuesta JSON formateada
- Cambiar vista: Pretty / Raw / Preview

### Pestaña "Headers"
- Ver headers de respuesta
- Content-Type, Content-Length, etc.

### Pestaña "Test Results"
- Ver resultados de tests automáticos
- Identificar qué falló

### Pestaña "Timeline"
- Ver cuánto tardó cada fase
- DNS, TLS, Request, Response

---

## 📊 Monitorear Rendimiento

Postman muestra el tiempo de respuesta:

- **Verde** (<200ms): Excelente ✅
- **Amarillo** (200-500ms): Bueno ⚠️
- **Rojo** (>500ms): Lento ❌

---

## 🐛 Troubleshooting

### Error: "Could not get response"

✅ **Solución:**
1. Verificar que el servidor esté corriendo
2. Ejecutar `npm run dev` en el proyecto
3. Verificar el puerto en las variables

### Error: "Error: read ECONNRESET"

✅ **Solución:**
1. Reiniciar el servidor
2. Verificar firewall
3. Cambiar de HTTP a HTTPS (o viceversa)

### Tests fallando

✅ **Solución:**
1. Verificar que la respuesta tenga la estructura esperada
2. Ver la pestaña "Console" (abajo) para más detalles
3. Revisar el código del test en la pestaña "Tests"

---

## 🎓 Recursos Adicionales

- [Postman Learning Center](https://learning.postman.com/)
- [Documentación API REST](./README.md)
- [Validaciones](./VALIDATION.md)
- [Instalación](./INSTALLATION.md)

---

## ✅ Checklist de Uso

- [ ] Postman instalado
- [ ] Colección importada
- [ ] Variables configuradas
- [ ] Servidor backend corriendo
- [ ] Health check exitoso
- [ ] Requests de pisos funcionando
- [ ] Tests automáticos pasando
- [ ] Validaciones probadas

---

**¡Listo para probar todos los endpoints!** 🚀

¿Preguntas? Revisa la documentación completa en `DOCUMENTATION_INDEX.md`
