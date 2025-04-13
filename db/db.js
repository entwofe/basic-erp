// db/db.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// Creamos el pool de conexiones usando valores de .env
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 10000,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000,
});

// Probar conexión al arrancar
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a la base de datos MySQL con Pool');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error);
  }
})();

module.exports = pool;
