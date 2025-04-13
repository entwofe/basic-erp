const express = require('express');
const db = require('../db/db');
const { tienePermiso } = require('../middlewares/authMiddleware');

const router = express.Router();

// Obtener todos los eventos
router.get('/', tienePermiso('calendario', 'leer'), (req, res) => {
  const sql = 'SELECT * FROM eventos_calendario ORDER BY fecha_inicio ASC';
  db.query(sql, (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al obtener eventos' });

    const eventos = resultados.map(e => ({
      id: e.id,
      title: e.titulo,
      start: e.fecha_inicio,
      end: e.fecha_fin,
      backgroundColor: e.color,
      borderColor: e.color,
      descripcion: e.descripcion,
      tipo_etiqueta: e.tipo_etiqueta,
      personal_asignado: e.personal_asignado,
      orden_trabajo_id: e.orden_trabajo_id,
    }));

    res.json(eventos);
  });
});

// Crear nuevo evento
router.post('/', tienePermiso('calendario', 'crear'), (req, res) => {
  const { titulo, descripcion, fecha_inicio, fecha_fin, tipo_etiqueta, color, personal_asignado, orden_trabajo_id } = req.body;

  const sql = `
    INSERT INTO eventos_calendario (titulo, descripcion, fecha_inicio, fecha_fin, tipo_etiqueta, color, personal_asignado, orden_trabajo_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [titulo, descripcion, fecha_inicio, fecha_fin, tipo_etiqueta, color, personal_asignado, orden_trabajo_id], (err, resultado) => {
    if (err) return res.status(500).json({ error: 'Error al crear evento' });
    res.status(201).json({ mensaje: 'Evento creado', id: resultado.insertId });
  });
});

// Actualizar un evento
router.put('/:id', tienePermiso('calendario', 'editar'), (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha_inicio, fecha_fin, tipo_etiqueta, color, personal_asignado, orden_trabajo_id } = req.body;

  const sql = `
    UPDATE eventos_calendario
    SET titulo = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, tipo_etiqueta = ?, color = ?, personal_asignado = ?, orden_trabajo_id = ?
    WHERE id = ?
  `;
  db.query(sql, [titulo, descripcion, fecha_inicio, fecha_fin, tipo_etiqueta, color, personal_asignado, orden_trabajo_id, id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar evento' });
    res.json({ mensaje: 'Evento actualizado' });
  });
});

// Eliminar un evento
router.delete('/:id', tienePermiso('calendario', 'eliminar'), (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM eventos_calendario WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar evento' });
    res.json({ mensaje: 'Evento eliminado' });
  });
});

module.exports = router;
