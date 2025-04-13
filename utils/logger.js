const db = require('../db/db');

exports.registrarAccion = (usuario, modulo, accion, detalle = '') => {
  if (!usuario || !usuario.id) return;

  db.query(
    'INSERT INTO log_acciones (usuario_id, modulo, accion, detalle) VALUES (?, ?, ?, ?)',
    [usuario.id, modulo, accion, detalle],
    (err) => {
      if (err) console.error('❌ Error al registrar acción:', err);
    }
  );
};
