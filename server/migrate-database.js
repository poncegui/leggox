/**
 * Script para migrar la base de datos - Agregar columnas faltantes
 * 
 * Uso: node migrate-database.js
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'leggox.db'));

console.log('🔄 Ejecutando migraciones...\n');

try {
  // Agregar columna technical si no existe
  db.exec(`
    ALTER TABLE products ADD COLUMN technical TEXT;
  `);
  console.log('✅ Columna "technical" agregada (o ya existía)');
} catch (err) {
  if (err.message.includes('duplicate column')) {
    console.log('✅ Columna "technical" ya existe');
  } else {
    console.error('❌ Error:', err.message);
  }
}

try {
  // Crear índice si no existe
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_reference ON products(reference);
  `);
  console.log('✅ Índice de referencia creado');
} catch (err) {
  console.error('❌ Error creando índice:', err.message);
}

console.log('\n✨ Migraciones completadas');

db.close();
