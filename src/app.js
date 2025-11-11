/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());


// Routes
const routerApi = require('./routes/index');
routerApi(app);

// Socket.IO initialization
const initializeSockets = require('./sockets/index');
const { errorHandler, logErrors, boomErrorHandler } = require('./middlewares/errors.handler');
initializeSockets(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(logErrors);
app.use(boomErrorHandler);
app.use(errorHandler);

module.exports = { app, server, io };
