// routes/index.js

const express = require('express');
const router = express.Router();

// --- Importar subrutas ---
const authRoutes = require('./auth');
const usuarioRoutes = require('./usuarios');
const tareasRoutes = require('./tareas');
const historialRoutes = require('./historial');
const almacenRoutes = require('./almacen');
const calendarioRoutes = require('./calendario');
// const produccionRoutes = require('./produccion'); // TODO: próximamente

// --- Montar rutas ---
router.use('/auth', authRoutes);
router.use('/api/usuarios', usuarioRoutes);
router.use('/api/tareas', tareasRoutes);
router.use('/api/historial', historialRoutes);
router.use('/api/almacen', almacenRoutes);
router.use('/api/calendario', calendarioRoutes);
// router.use('/api/produccion', produccionRoutes); // 🚧 En desarrollo

// --- Exportar ---
module.exports = router;
