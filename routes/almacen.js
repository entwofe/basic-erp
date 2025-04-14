// routes/almacen.js

const express = require('express');
const db = require('../db/db');
const QRCode = require('qrcode');
const { tienePermiso } = require('../middlewares/authMiddleware');
const { io } = require('../server');

const router = express.Router();

/**
 * Obtener todos los artículos
 */
router.get('/', tienePermiso('almacen', 'leer'), async (req, res) => {
  try {
    const [articulos] = await db.query(`
      SELECT id, nombre, tipo, unidad, stock, precio
      FROM articulos
      ORDER BY nombre ASC
    `);
    res.json(articulos);
  } catch (error) {
    console.error('❌ Error al obtener artículos:', error);
    res.status(500).json({ error: 'Error al obtener artículos' });
  }
});

/**
 * Obtener un artículo por ID
 */
router.get('/:id', tienePermiso('almacen', 'leer'), async (req, res) => {
  try {
    const { id } = req.params;
    const [resultados] = await db.query('SELECT * FROM articulos WHERE id = ?', [id]);

    if (resultados.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    res.json(resultados[0]);
  } catch (error) {
    console.error('❌ Error al obtener artículo:', error);
    res.status(500).json({ error: 'Error al obtener artículo' });
  }
});

/**
 * Crear un nuevo artículo
 */
router.post('/', tienePermiso('almacen', 'crear'), async (req, res) => {
  try {
    const { nombre, tipo, unidad, stock, stock_minimo, ubicacion, proveedor } = req.body;

    const [resultado] = await db.query(
      `INSERT INTO articulos (nombre, tipo, unidad, stock, stock_minimo, ubicacion, proveedor)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, tipo, unidad, stock, stock_minimo, ubicacion, proveedor]
    );

    const id = resultado.insertId;
    const qrTexto = `articulo/${id}`;
    const qrDataUrl = await QRCode.toDataURL(qrTexto);

    await db.query(
      'UPDATE articulos SET codigo_qr = ? WHERE id = ?',
      [qrDataUrl, id]
    );

    io.emit('almacenActualizado'); // ✨ Notificar a todos

    res.status(201).json({ mensaje: 'Artículo creado correctamente', id });
  } catch (error) {
    console.error('❌ Error al crear artículo:', error);
    res.status(500).json({ error: 'Error al crear artículo' });
  }
});

/**
 * Editar un artículo existente
 */
router.put('/:id', tienePermiso('almacen', 'editar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, unidad, stock, stock_minimo, ubicacion, proveedor } = req.body;

    await db.query(
      `UPDATE articulos
       SET nombre = ?, tipo = ?, unidad = ?, stock = ?, stock_minimo = ?, ubicacion = ?, proveedor = ?
       WHERE id = ?`,
      [nombre, tipo, unidad, stock, stock_minimo, ubicacion, proveedor, id]
    );

    io.emit('almacenActualizado'); // ✨ Notificar a todos

    res.json({ mensaje: 'Artículo actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar artículo:', error);
    res.status(500).json({ error: 'Error al actualizar artículo' });
  }
});

/**
 * Eliminar un artículo
 */
router.delete('/:id', tienePermiso('almacen', 'eliminar'), async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM articulos WHERE id = ?', [id]);

    io.emit('almacenActualizado'); // ✨ Notificar a todos

    res.json({ mensaje: 'Artículo eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar artículo:', error);
    res.status(500).json({ error: 'Error al eliminar artículo' });
  }
});

module.exports = router;