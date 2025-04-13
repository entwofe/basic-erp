const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/db');
const router = express.Router();
const { soloAdmin } = require('../middlewares/authMiddleware');
const { registrarAccion } = require('../utils/logger');
const { tienePermiso } = require('../middlewares/authMiddleware');




// Listar usuarios (solo para admins)
router.get('/', soloAdmin, (req, res) => {

  db.query('SELECT id, nombre, email, rol FROM usuarios', (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
    res.json(resultados);
  });
});

// Crear nuevo usuario
router.post('/', soloAdmin, async (req, res) => {

  const { nombre, email, contraseña, rol } = req.body;
  const hash = await bcrypt.hash(contraseña, 10);

  db.query(
    'INSERT INTO usuarios (nombre, email, contraseña, rol, creado_por) VALUES (?, ?, ?, ?, ?)',
    [nombre, email, hash, rol, req.session.usuario.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear usuario' });
      res.json({ mensaje: 'Usuario creado', id: result.insertId });
    }
  );
  registrarAccion(req.session.usuario, 'usuarios', 'crear', `Usuario: ${email}`);
});

module.exports = router;
