import mysql from 'mysql2/promise';

export const db = await mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'estoque_db',
  waitForConnections: true,
  // Trata DATETIME/DATE como UTC na escrita e leitura, evitando que o driver
  // reinterprete o valor gravado usando o fuso horário local do servidor.
  timezone: 'Z',
});
