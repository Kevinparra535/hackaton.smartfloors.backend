# GitHub Copilot Instructions - SmartFloors Backend

## Context & Architecture

**SmartFloors** is a real-time floor monitoring system built for a hackathon. It simulates building sensor data, generates ML predictions, and detects anomalies using WebSocket for real-time updates and REST for queries.

**Key Architectural Pattern**: The system uses **singleton services** initialized in `src/sockets/index.js` that are shared across Socket.IO events and REST endpoints via exported getter functions (`getSimulator()`, `getPredictionService()`, `getAlertService()`).

**Stack**: Node.js 16+, Express 4.x, Socket.IO 4.x, Joi 18.x, @hapi/boom 10.x

## Critical Workflow: Service Initialization

Services MUST be accessed via getters from `src/sockets/index.js`, never instantiated directly:

```javascript
// ✅ CORRECT - Controllers
const { getSimulator, getPredictionService } = require('../sockets/index');
const simulator = getSimulator(); // Singleton instance

// ❌ WRONG
const FloorSimulator = require('../services/simulator.services');
const simulator = new FloorSimulator(); // Creates duplicate instance
```

**Why**: Services maintain in-memory state (history, alerts). Multiple instances cause data inconsistency. Controllers check `if (!simulator)` and return 503 if not initialized.

## Validation Pipeline

**ALL routes must validate inputs using Joi + validatorHandler middleware**:

```javascript
// src/routes/floors.router.js pattern
router.get(
  '/floors/:id',
  validatorHandler(floorParamsSchema, 'params'),      // Validate :id
  validatorHandler(getFloorHistorySchema, 'query'),   // Validate ?limit
  getFloorById                                         // Then controller
);
```

The `validatorHandler` is a **closure factory** that validates `req[property]` and throws `boom.badRequest()` on failure:

```javascript
// src/middlewares/validator.handler.js
function validatorHandler(schema, property) {
  return function (req, res, next) {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (error) next(boom.badRequest(error.message));
    else next();
  };
}
```

**Validation ranges** (in `src/schemas/validator.schema.js`):
- Floor ID: 1-100 (integer)
- History limit: 1-1440 (24 hours of minute data)
- Prediction minutes: 10-180 (10 min to 3 hours)

## Response Format Contract

**All endpoints follow this structure** (controllers must maintain consistency):

```javascript
// Success (200/201)
{
  "success": true,
  "data": { ... },           // Single object or array
  "timestamp": "2025-11-11T..."
}

// Boom validation error (400) - auto-formatted
{
  "error": {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "El ID debe ser un número"  // Spanish required
  }
}

// Service error (500) - manual in controllers
{
  "success": false,
  "message": "Error al obtener recurso",
  "error": "Details"
}
```

## Error Handling Chain

Three middleware in sequence (see `src/app.js`):

```javascript
app.use(logErrors);          // 1. Console logs
app.use(boomErrorHandler);   // 2. Format Boom errors (isBoom check)
app.use(errorHandler);       // 3. Catch-all for other errors
```

**Controllers must**:
- Wrap logic in try-catch
- Check service initialization: `if (!simulator) return res.status(503)...`
- Use boom for HTTP errors: `boom.notFound()`, `boom.badRequest()`
- Return consistent format (see Response Format Contract above)

## Socket.IO Event Flow

**Server initialization** (in `src/sockets/index.js`):
1. Creates singleton services (simulator, prediction, alert)
2. Starts interval timer (default 60s, configurable via `SIMULATION_INTERVAL`)
3. On each tick: generates data → detects anomalies → emits to all clients

**Key events**:

```javascript
// Server → Client (broadcast)
io.emit('floor-data', { floors, timestamp });     // Every minute
io.emit('new-alerts', { alerts, timestamp });     // When detected
io.emit('predictions', { predictions });          // Every minute

// Client → Server (request-response via socket)
socket.on('request-history', (data) => {
  // { floorId, limit } → socket.emit('history-data', ...)
});
socket.on('request-prediction', (data) => {
  // { floorId, minutesAhead } → socket.emit('prediction-data', ...)
});
```

**Connection lifecycle**:
- On connect: client receives `initial-data` with current floor states
- During session: receives broadcasts every minute
- Can request historical data or predictions on-demand

## In-Memory State Management

**Critical**: All data is volatile (lost on restart):

- **FloorSimulator** maintains:
  - `currentData`: Array of latest floor states
  - `history`: Array capped at 1440 entries per floor (24h * 60min)
  
- **AlertService** maintains:
  - Active alerts with 24h auto-cleanup (checked hourly in socket loop)
  
- **No database**: This is by design for hackathon simplicity

**History pruning logic** in `simulator.services.js`:
```javascript
// After adding to history, remove oldest entries if > 1440 per floor
const floorHistory = this.history.filter(h => h.floorId === floor.floorId);
if (floorHistory.length > 1440) { /* remove oldest */ }
```

## Development Commands

```bash
npm run dev        # Starts with nodemon (auto-reload)
npm start          # Production mode
npm run lint       # ESLint check
npm run format     # Prettier format

# Testing (bash scripts - for PowerShell, run manually)
bash test-validation.sh    # Validates all endpoints
bash test-mejoras.sh       # Tests enhancements

# PowerShell equivalents
npm run dev                # Same as bash
curl http://localhost:3000/health  # Quick health check
```

**Server startup sequence**:
1. `index.js` loads env → imports `server` from `src/app.js`
2. `src/app.js` creates Express + Socket.IO → imports routes + socket initializer
3. `src/sockets/index.js` creates services → starts simulation interval
4. Server listens on port (default 3000)

## Code Patterns & Conventions

**Naming** (strictly enforced in existing code):
- Files: `name.type.js` (e.g., `floors.controller.js`)
- Variables/functions: camelCase
- Classes: PascalCase
- **Language**: All comments, logs, and error messages in Spanish

**Controller template**:
```javascript
const { getSimulator } = require('../sockets/index');

const getResource = (req, res) => {
  try {
    const simulator = getSimulator();
    if (!simulator) {
      return res.status(503).json({
        success: false,
        message: 'Simulador no inicializado',
      });
    }
    
    // Logic here
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error en getResource:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recurso',
      error: error.message,
    });
  }
};
```

**Joi schema template** (always include Spanish messages):
```javascript
const schema = Joi.object({
  id: Joi.number().integer().min(1).max(100).required().messages({
    'number.base': 'El ID debe ser un número',
    'number.integer': 'El ID debe ser un número entero',
    'any.required': 'El ID es requerido',
  }),
});
```

## Email Service (Partial Implementation)

`src/services/email.services.js` is a **skeleton** with TODO comments:
- Framework is built (rate limiting, cooldowns, recipient routing)
- Actual EmailJS integration is NOT implemented (requires `npm install @emailjs/nodejs`)
- Methods `sendAlert()`, `sendTestEmail()`, `sendDailySummary()` are placeholders
- See `EMAIL_SETUP.md` for full implementation guide

**If extending**: Uncomment line 18, implement TODOs, add env variables per `EMAIL_SETUP.md`

## CSV Export Pattern

**CSV generation uses helper utilities** in `src/utils/csv.helpers.js`:

```javascript
// Export controllers use these helpers
const { alertsToCSV, historyToCSV } = require('../utils/csv.helpers');

// Flatten complex alert structures for CSV
const csvContent = alertsToCSV(filteredAlerts);

// Set proper headers for download
res.setHeader('Content-Type', 'text/csv; charset=utf-8');
res.setHeader('Content-Disposition', 'attachment; filename="alerts.csv"');
res.send(csvContent);
```

**Key features** (in `csv.helpers.js`):
- `alertsToCSV()`: Flattens nested alert anomalies into rows (one row per anomaly)
- `historyToCSV()`: Converts floor history to tabular format
- `jsonToCSV()`: Generic converter with automatic escaping for commas/quotes
- Handles null/undefined values gracefully
- Converts objects/arrays to JSON strings within cells

**Export filtering** (see `src/schemas/export.schema.js`):
- Alerts: Filter by date range, severity, floorId, type, isPredictive
- History: Filter by date range, floorId, limit (max 100,000 records)
- All filters validated via Joi before controller execution

## Key Environment Variables

```env
PORT=3000                          # Server port
NODE_ENV=development               # Environment
CORS_ORIGIN=http://localhost:5173  # Frontend URL
SIMULATION_INTERVAL=60000          # Data gen interval (ms)
NUMBER_OF_FLOORS=5                 # Floor count
BUILDING_NAME=Edificio Principal   # Building name

# Email (optional - see EMAIL_SETUP.md)
EMAIL_NOTIFICATIONS_ENABLED=false  # Set true after setup
EMAILJS_SERVICE_ID=                # From EmailJS dashboard
EMAILJS_PUBLIC_KEY=                # From EmailJS dashboard
EMAILJS_PRIVATE_KEY=               # From EmailJS dashboard
```

## API Endpoints

```
GET  /health                           # Health check
GET  /api/v1/floors                    # All current floor data
GET  /api/v1/floors/stats              # Building statistics
GET  /api/v1/floors/:id                # Single floor (id: 1-100)
GET  /api/v1/floors/:id/history        # History (query: limit 1-1440)
GET  /api/v1/floors/:id/predictions    # Predictions (query: minutesAhead 10-180)
GET  /api/v1/alerts                    # All active alerts

# Export endpoints (CSV generation)
GET  /api/v1/export/stats              # Statistics of exportable data
GET  /api/v1/export/alerts/csv         # Export alerts (filters: startDate, endDate, severity, floorId, type, isPredictive)
GET  /api/v1/export/history/csv        # Export history (filters: startDate, endDate, floorId, limit)

# Email endpoints (if implemented)
GET  /api/v1/email/status              # Email service status
POST /api/v1/email/test                # Send test email
POST /api/v1/email/alert               # Send alert email
```

## Common Pitfalls

1. **Don't instantiate services directly** - Always use getters from `src/sockets/index.js`
2. **Don't forget validation** - Every route needs `validatorHandler` middleware
3. **Check service initialization** - Controllers must handle null services (503 response)
4. **Respect validation ranges** - ID 1-100, history 1-1440, predictions 10-180
5. **Use Spanish** - All user-facing text must be in Spanish
6. **Consistent responses** - Always include `success`, `data`, `timestamp` fields

## Testing Strategy

**Postman collection**: `postman/SmartFloors.postman_collection.json` (13 requests with automated tests)

**Quick smoke test**:
```bash
# Start server
npm run dev

# In another terminal
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/floors
```

**WebSocket testing**: Use Socket.IO client or browser dev tools. Connect to `ws://localhost:3000` and listen for `floor-data` events.

## When Adding Features

1. **New endpoint**: Add route → schema → validator → controller → update Postman collection
2. **New service**: Create in `services/` → initialize in `src/sockets/index.js` → export getter
3. **New validation**: Define in `schemas/validator.schema.js` → apply in route
4. **New socket event**: Add listener in `src/sockets/index.js` → document in README
5. **New router module**: Create in `routes/` → import in `src/routes/index.js` → mount with `app.use()`

**Router mounting pattern** (in `src/routes/index.js`):
```javascript
const newRoutes = require('./new.router');

function routerApi(app) {
  app.use('/api/v1/', homeRoutes);
  app.use('/api/v1/', floorsRoutes);
  app.use('/api/v1/new', newRoutes);  // Mount new router
}
```

## Documentation References

- `README.md` - Full project overview
- `INSTALLATION.md` - Setup guide
- `EMAIL_SETUP.md` - EmailJS implementation (incomplete feature)
- `POSTMAN_GUIDE.md` - API testing guide
- `QUICK_START.md` - Quick reference

**Documentation is organized in `docs/` directory**:
- `docs/guides/` - User-focused guides (installation, quick start, integration)
- `docs/api/` - API reference and WebSocket guide
- `docs/development/` - Developer documentation (architecture, configuration, troubleshooting)
- `docs/archive/` - Historical implementation notes and verification reports

---

**Project Philosophy**: This is a hackathon demo prioritizing clarity and functionality over optimization. Code should be self-documenting, errors explicit (Spanish), and patterns consistent.
