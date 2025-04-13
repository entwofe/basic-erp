const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Obtener todas las tareas
router.get('/', (req, res) => {
  db.query('SELECT * FROM tareas', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Crear una nueva tarea
router.post('/', (req, res) => {
  const { titulo, descripcion } = req.body;
  db.query(
    'INSERT INTO tareas (titulo, descripcion) VALUES (?, ?)',
    [titulo, descripcion],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId, titulo, descripcion, completado: false });
    }
  );
});

// Actualizar una tarea
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, completado } = req.body;
  db.query(
    'UPDATE tareas SET titulo = ?, descripcion = ?, completado = ? WHERE id = ?',
    [titulo, descripcion, completado, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(200);
    }
  );
});

// Eliminar una tarea
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tareas WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

module.exports = router;
