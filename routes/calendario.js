// routes/calendario.js

const express = require('express');
const router = express.Router();
const db = require('../db/db'); // ← Ajusta según tu conexión a MySQL

// Obtener eventos (con filtro de fechas opcional)
router.get('/', (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: 'Faltan parámetros de fecha (start/end)' });
  }

  const sql = `
    SELECT id, titulo, descripcion, fecha_inicio AS start, fecha_fin AS end, color, tipo_etiqueta
    FROM eventos_calendario
    WHERE fecha_inicio BETWEEN ? AND ?
  `;

  db.query(sql, [start, end], (err, resultados) => {
    if (err) {
      console.error('Error al obtener eventos:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json(resultados);
  });
});

// Crear nuevo evento
router.post('/', (req, res) => {
  const { titulo, descripcion, fecha_inicio, fecha_fin, tipo_etiqueta, color } = req.body;

  const sql = `
    INSERT INTO eventos_calendario (titulo, descripcion, fecha_inicio, fecha_fin, tipo_etiqueta, color)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [titulo, descripcion, fecha_inicio, fecha_fin, tipo_etiqueta, color], (err, resultado) => {
    if (err) {
      console.error('Error al crear evento:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.status(201).json({ id: resultado.insertId });
  });
});

// Actualizar fechas (drag and drop)
// Actualizar evento completo
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const {
    titulo, descripcion, fecha_inicio, fecha_fin,
    tipo_etiqueta, color
  } = req.body;

  const sql = `
    UPDATE eventos_calendario
    SET titulo = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, tipo_etiqueta = ?, color = ?
    WHERE id = ?
  `;

  db.query(sql, [titulo, descripcion, fecha_inicio, fecha_fin, tipo_etiqueta, color, id], (err) => {
    if (err) {
      console.error('Error al actualizar evento:', err);
      return res.status(500).json({ error: 'Error al actualizar evento' });
    }
    res.json({ mensaje: 'Evento actualizado correctamente' });
  });
});

// Obtener un evento por ID
router.get('/:id', (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT id, titulo, descripcion, fecha_inicio, fecha_fin, tipo_etiqueta, color
    FROM eventos_calendario
    WHERE id = ?
  `;

  db.query(sql, [id], (err, resultados) => {
    if (err) {
      console.error('Error al obtener evento por ID:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(resultados[0]);
  });
});

// Solo mover fechas (drag and drop)
router.put('/mover/:id', (req, res) => {
  const id = req.params.id;
  const { fecha_inicio, fecha_fin } = req.body;

  const sql = `
    UPDATE eventos_calendario
    SET fecha_inicio = ?, fecha_fin = ?
    WHERE id = ?
  `;

  db.query(sql, [fecha_inicio, fecha_fin, id], (err) => {
    if (err) {
      console.error('Error al mover evento:', err);
      return res.status(500).json({ error: 'Error al mover evento' });
    }
    res.json({ mensaje: 'Evento movido correctamente' });
  });
});

// Eliminar evento
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  const sql = `DELETE FROM eventos_calendario WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Error al eliminar evento:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json({ mensaje: 'Evento eliminado correctamente' });
  });
});




module.exports = router;
