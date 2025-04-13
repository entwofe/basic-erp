console.log('✅ Rutas de autenticación cargadas');

const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const db = require('../db/db');

const router = express.Router();


// LOGIN
router.post('/login', (req, res) => {
  console.log('📩 Intento de login:', req.body);

  const { email, contraseña } = req.body;

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    console.log('🔎 Usuario encontrado:', results);

    if (err) return res.status(500).json({ error: 'Error en el servidor' });
    if (results.length === 0) return res.status(401).json({ error: 'Email no registrado' });

    const usuario = results[0];
    const coincide = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!coincide) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

        // Verifica si está activo y no bloqueado
    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    if (usuario.bloqueado) {
      return res.status(403).json({ error: 'Usuario bloqueado' });
    }


    // Guardar usuario en sesión
    req.session.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      avatar: usuario.avatar,
    };

    // Actualizar último login
db.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [usuario.id]);


    res.json({ mensaje: 'Login exitoso', usuario: req.session.usuario });
  });
});

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ mensaje: 'Sesión cerrada' });
  });
});

// COMPROBAR SESIÓN ACTUAL
router.get('/usuario', (req, res) => {
  if (req.session.usuario) {
    res.json(req.session.usuario);
  } else {
    res.status(401).json({ error: 'No autenticado' });
  }
});

module.exports = router;
