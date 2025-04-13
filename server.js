// server.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const rutas = require('./routes'); // index.js centralizado

const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

const PORT = process.env.PORT || 3001;

// --- 1. MIDDLEWARES GLOBALES ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// --- 2. RUTAS GENERALES ---
app.use(rutas);

// --- 3. MANEJO DE ERRORES GLOBALES ---
app.use((err, req, res, next) => {
  console.error('💥 Error no controlado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// --- 4. INICIAR SERVIDOR ---
http.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// --- 5. SOCKET.IO ---
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado: ' + socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado: ' + socket.id);
  });
});

module.exports = { io }; // Exportar io para usar en rutas
