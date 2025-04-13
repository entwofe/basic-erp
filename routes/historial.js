const express = require('express');
const db = require('../db/db');
const { soloAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', soloAdmin, (req, res) => {
  const sql = `
    SELECT l.*, u.nombre AS usuario
    FROM log_acciones l
    LEFT JOIN usuarios u ON l.usuario_id = u.id
    ORDER BY l.fecha DESC
    LIMIT 100
  `;

  db.query(sql, (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al obtener historial' });
    res.json(resultados);
  });
});

module.exports = router;
