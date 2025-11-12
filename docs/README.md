# 📚 Documentación SmartFloors

Bienvenido a la documentación completa del proyecto SmartFloors.

---

## 🚀 Empezar

Si eres nuevo en SmartFloors, empieza aquí:

1. **[⚡ Guía de Inicio Rápido](guides/QUICK_START.md)** - 5 minutos para tener el sistema corriendo
2. **[📦 Instalación Completa](guides/INSTALLATION.md)** - Configuración paso a paso
3. **[🔌 Integración con Frontend](guides/FRONTEND_INTEGRATION.md)** - Conectar tu aplicación web

---

## 📖 Guías de Uso

### Para Usuarios

| Guía                                                  | Descripción                         | Nivel           |
| ----------------------------------------------------- | ----------------------------------- | --------------- |
| **[🌐 API REST](api/API_REFERENCE.md)**               | Referencia completa de 23 endpoints | ⭐ Básico       |
| **[⚡ WebSocket](api/WEBSOCKET_GUIDE.md)**            | Eventos en tiempo real              | ⭐⭐ Intermedio |
| **[📊 Exportación CSV](guides/EXPORT_CSV_GUIDE.md)**  | Exportar datos para análisis        | ⭐ Básico       |
| **[🧪 Testing con Postman](guides/POSTMAN_GUIDE.md)** | 35 requests pre-configurados        | ⭐ Básico       |
| **[💡 Ejemplos de Integración](guides/EXAMPLES.md)**  | Código real de uso                  | ⭐⭐ Intermedio |

### Para Desarrolladores

| Documento                                                      | Descripción               | Nivel           |
| -------------------------------------------------------------- | ------------------------- | --------------- |
| **[🏗️ Arquitectura del Sistema](development/ARCHITECTURE.md)** | Estructura y patrones     | ⭐⭐⭐ Avanzado |
| **[🔧 Configuración](development/CONFIGURATION.md)**           | Variables de entorno      | ⭐ Básico       |
| **[📧 Setup de Email](development/EMAIL_SETUP.md)**            | Notificaciones por correo | ⭐⭐ Intermedio |
| **[🐛 Troubleshooting](development/TROUBLESHOOTING.md)**       | Solución de problemas     | ⭐ Básico       |
| **[🤝 Contribuir](development/CONTRIBUTING.md)**               | Guía para contributors    | ⭐⭐ Intermedio |

---

## 📁 Estructura de la Documentación

```
docs/
├── README.md                    # Este archivo - índice principal
├── guides/                      # Guías para usuarios
│   ├── QUICK_START.md          # Inicio rápido
│   ├── INSTALLATION.md         # Instalación completa
│   ├── FRONTEND_INTEGRATION.md # Integrar frontend
│   ├── EXPORT_CSV_GUIDE.md     # Exportación de datos
│   ├── POSTMAN_GUIDE.md        # Testing con Postman
│   ├── EXAMPLES.md             # Ejemplos de código
│   └── FAQ.md                  # Preguntas frecuentes
├── api/                         # Documentación de API
│   ├── API_REFERENCE.md        # Referencia completa
│   └── WEBSOCKET_GUIDE.md      # Guía de WebSocket
└── development/                 # Para desarrolladores
    ├── ARCHITECTURE.md         # Arquitectura del sistema
    ├── CONFIGURATION.md        # Configuración avanzada
    ├── EMAIL_SETUP.md          # Setup de emails
    ├── EMAIL_README.md         # Info adicional de emails
    ├── TROUBLESHOOTING.md      # Solución de problemas
    └── CONTRIBUTING.md         # Guía de contribución
```

---

## 🎯 Rutas de Aprendizaje

### 👤 Soy nuevo - Solo quiero usar la API

1. Lee [Guía de Inicio Rápido](guides/QUICK_START.md)
2. Importa la [Colección de Postman](guides/POSTMAN_GUIDE.md)
3. Revisa la [Referencia de API](api/API_REFERENCE.md)
4. Explora los [Ejemplos](guides/EXAMPLES.md)

**Tiempo estimado**: 30 minutos

---

### 💻 Voy a integrar SmartFloors con mi frontend

1. [Instalación Completa](guides/INSTALLATION.md)
2. [Guía de WebSocket](api/WEBSOCKET_GUIDE.md)
3. [Integración con Frontend](guides/FRONTEND_INTEGRATION.md)
4. [Ejemplos de Integración](guides/EXAMPLES.md)

**Tiempo estimado**: 1 hora

---

### 🛠️ Voy a contribuir al proyecto

1. [Arquitectura del Sistema](development/ARCHITECTURE.md)
2. [Configuración Avanzada](development/CONFIGURATION.md)
3. [Guía de Contribución](development/CONTRIBUTING.md)
4. Lee el código en `/src`

**Tiempo estimado**: 2-3 horas

---

### 📊 Solo necesito exportar datos

1. [Guía de Exportación CSV](guides/EXPORT_CSV_GUIDE.md)
2. [API Reference - Sección Export](api/API_REFERENCE.md#exportación-csv)
3. Usa Postman para probar

**Tiempo estimado**: 15 minutos

---

## 🔍 Búsqueda Rápida

### ¿Cómo...?

| Quiero...                | Ir a...                                              |
| ------------------------ | ---------------------------------------------------- |
| Instalar el proyecto     | [INSTALLATION.md](guides/INSTALLATION.md)            |
| Conectar WebSocket       | [WEBSOCKET_GUIDE.md](api/WEBSOCKET_GUIDE.md)         |
| Ver todos los endpoints  | [API_REFERENCE.md](api/API_REFERENCE.md)             |
| Exportar alertas a CSV   | [EXPORT_CSV_GUIDE.md](guides/EXPORT_CSV_GUIDE.md)    |
| Configurar emails        | [EMAIL_SETUP.md](development/EMAIL_SETUP.md)         |
| Entender la arquitectura | [ARCHITECTURE.md](development/ARCHITECTURE.md)       |
| Resolver un error        | [TROUBLESHOOTING.md](development/TROUBLESHOOTING.md) |
| Contribuir código        | [CONTRIBUTING.md](development/CONTRIBUTING.md)       |

---

## 📦 Recursos Adicionales

### Herramientas

- **[Colección Postman](../postman/SmartFloors.postman_collection.json)** - 35 requests pre-configurados
- **[Scripts de Testing](../test-validation.sh)** - Pruebas automáticas
- **[Template .env](../.env.example)** - Variables de entorno

### Enlaces Externos

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Joi Validation](https://joi.dev/api/)

---

## 🆘 ¿Necesitas Ayuda?

1. **Revisa el [FAQ](guides/FAQ.md)** - Preguntas frecuentes
2. **Consulta [Troubleshooting](development/TROUBLESHOOTING.md)** - Problemas comunes
3. **Busca en la documentación** - Usa Ctrl+F
4. **Abre un Issue** - [GitHub Issues](https://github.com/Kevinparra535/hackaton.smartfloors.backend/issues)

---

## 📝 Convenciones de Documentación

### Iconos Usados

- 🚀 **Inicio rápido** - Para empezar
- 📖 **Guía** - Documentación tutorial
- 🌐 **API** - Endpoints y referencias
- 💻 **Código** - Ejemplos de código
- ⚙️ **Configuración** - Setup y config
- 🐛 **Debug** - Solución de problemas
- ⭐ **Importante** - Información crítica
- 💡 **Tip** - Consejo útil
- ⚠️ **Advertencia** - Precaución

### Niveles de Dificultad

- ⭐ **Básico** - No requiere conocimientos previos
- ⭐⭐ **Intermedio** - Requiere conocimientos de Node.js
- ⭐⭐⭐ **Avanzado** - Requiere experiencia en arquitectura de software

---

## 🔄 Actualizaciones

Esta documentación se actualiza constantemente. Última actualización: **12 de Noviembre, 2025**

**Versión de la documentación**: 2.0  
**Versión del proyecto**: 1.0.0

---

## 📄 Licencia

Toda la documentación está bajo la misma licencia ISC del proyecto principal.

---

<div align="center">

**¿No encuentras lo que buscas?**  
[Abre un Issue](https://github.com/Kevinparra535/hackaton.smartfloors.backend/issues) o revisa el [FAQ](guides/FAQ.md)

[⬆ Volver arriba](#-documentación-smartfloors)

</div>
