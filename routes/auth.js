console.log('✅ Rutas de autenticación cargadas');

const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const db = require('../db/db');

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('📩 Intento de login:', { email, password });

  try {
    const [results] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (results.length === 0) {
      console.log('🔎 Usuario no encontrado:', email);
      return res.status(401).json({ error: 'Email no registrado' });
    }

    const usuario = results[0];
    console.log('🛠️ Usuario encontrado:', usuario.email);

    const coincide = await bcrypt.compare(password, usuario.password);
    console.log('🛠️ Resultado bcrypt.compare:', coincide);

    if (!coincide) {
      console.log('🔒 Contraseña incorrecta para:', usuario.email);
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    if (!usuario.activo) {
      console.log('⛔ Usuario inactivo:', usuario.email);
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    if (usuario.bloqueado) {
      console.log('⛔ Usuario bloqueado:', usuario.email);
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
    await db.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [usuario.id]);

    console.log('✅ Login exitoso:', usuario.email);
    res.json({ mensaje: 'Login exitoso', usuario: req.session.usuario });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Error cerrando sesión:', err);
      return res.status(500).json({ error: 'Error cerrando sesión' });
    }
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
