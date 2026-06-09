import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // 🔥 mejoras de estabilidad
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// ✔ conexión inicial (solo para validar)
pool.connect()
  .then((client) => {
    console.log('✅ PostgreSQL conectado correctamente');
    client.release(); // IMPORTANTE: evita fugas de conexión
  })
  .catch((error) => {
    console.error('❌ Error al conectar PostgreSQL:', error.message);
  });

// ✔ manejo global de errores del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL pool:', err);
});