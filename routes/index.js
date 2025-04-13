// routes/index.js
const express = require('express');
const router = express.Router();

// Importar subrutas
const authRoutes = require('./auth');
const usuarioRoutes = require('./usuarios');
const tareasRoutes = require('./tareas');
const historialRoutes = require('./historial');
const almacenRoutes = require('./almacen');
const calendarioRoutes = require('./calendario'); // <-- Añadimos esta línea nueva

// const produccionRoutes = require('./produccion'); // próximamente

// Montar rutas en sus caminos correspondientes
router.use('/auth', authRoutes);
router.use('/api/usuarios', usuarioRoutes);
router.use('/api/tareas', tareasRoutes);
router.use('/api/historial', historialRoutes);
router.use('/api/almacen', almacenRoutes);
router.use('/api/calendario', calendarioRoutes); // <-- Añadimos esta línea nueva
// router.use('/api/produccion', produccionRoutes);

module.exports = router;
