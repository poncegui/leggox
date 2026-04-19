const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'products.db');
const db = new Database(dbPath);

console.log('🔧 Actualizando imagen del producto RANCHERA...');

// Actualizar el producto con la imagen correcta
const result = db.prepare(`
  UPDATE products
  SET imageSrc = '/images/manguitos/manguito-silicona-llenado-seat-124-1430-ranchera.jpg'
  WHERE id = 'manguito-llenado-seat-124-1430-ranchera'
`).run();

console.log('✅ Producto actualizado:', result.changes, 'filas afectadas');

// Verificar
const product = db.prepare(`
  SELECT id, title, imageSrc
  FROM products
  WHERE id = 'manguito-llenado-seat-124-1430-ranchera'
`).get();

console.log('📦 Producto después de actualizar:');
console.log(JSON.stringify(product, null, 2));

db.close();
console.log('✨ Listo! Recarga la página para ver la imagen.');
