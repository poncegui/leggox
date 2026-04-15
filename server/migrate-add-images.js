/**
 * Migración: Agregar campo 'images' a la tabla products para soportar múltiples imágenes
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'leggox.db'));

console.log('🔄 Agregando campo images a la tabla products...\n');

try {
  // 1. Agregar columna images (JSON array)
  db.exec(`
    ALTER TABLE products
    ADD COLUMN images TEXT DEFAULT NULL
  `);

  console.log('✅ Campo images agregado exitosamente\n');

  // 2. Migrar image_url existente a images array
  const products = db.prepare('SELECT id, image_url FROM products WHERE image_url IS NOT NULL').all();

  console.log(`📦 Migrando ${products.length} productos con imagen existente...\n`);

  const updateStmt = db.prepare('UPDATE products SET images = ? WHERE id = ?');

  let migrated = 0;
  for (const product of products) {
    if (product.image_url) {
      // Crear array con la imagen existente
      const imagesArray = [{ url: product.image_url, alt: '' }];
      updateStmt.run(JSON.stringify(imagesArray), product.id);
      migrated++;
    }
  }

  console.log(`✅ ${migrated} productos migrados con imagen en formato array\n`);
  console.log('🎉 Migración completada exitosamente!');

} catch (error) {
  console.error('❌ Error durante la migración:', error.message);
  process.exit(1);
} finally {
  db.close();
}
