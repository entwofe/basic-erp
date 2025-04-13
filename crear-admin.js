const bcrypt = require('bcrypt');
const db = require('./db/db');

const crearAdmin = async () => {
  const nombre = 'Administrador';
  const email = 'admin@taller.com';
  const contraseñaPlano = 'admin123'; // Puedes cambiarla
  const rol = 'admin';
  const avatar = 'default.png'; // O puedes poner una imagen real

  try {
    // Encriptar la contraseña
    const hash = await bcrypt.hash(contraseñaPlano, 10);

    // Insertar en la base de datos
    db.query(
      'INSERT INTO usuarios (nombre, email, contraseña, rol, avatar) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, hash, rol, avatar],
      (err, result) => {
        if (err) {
          console.error('❌ Error al insertar el usuario:', err);
        } else {
          console.log('✅ Usuario administrador creado con éxito. ID:', result.insertId);
        }
        process.exit(); // Finalizar script
      }
    );
  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit();
  }
};

crearAdmin();
