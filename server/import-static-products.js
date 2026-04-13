/**
 * Script para importar productos desde src/data/products.js a la base de datos
 *
 * Uso: node import-static-products.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { upsertProduct } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📦 Importando productos desde products.js...\n');

// Leer el archivo products.js
const productsPath = join(__dirname, '../src/data/products.js');
let productsContent = readFileSync(productsPath, 'utf8');

// Extraer el array PRODUCTS_DATA
// Buscar entre export const PRODUCTS_DATA = [ ... ];
const match = productsContent.match(/export const PRODUCTS_DATA\s*=\s*\[([\s\S]*)\];/);

if (!match) {
  console.error('❌ No se pudo encontrar PRODUCTS_DATA en products.js');
  process.exit(1);
}

// Evaluar el código para obtener los productos
// Necesitamos manejar los require() de imágenes
const mockRequire = (path) => `image_${path.split('/').pop().replace(/\.(jpg|png|jpeg|webp)/, '')}`;

try {
  // Crear una función que evalúe el array
  const arrayContent = match[1];

  // Reemplazar require() con strings
  const cleanedContent = arrayContent.replace(/require\([^)]+\)/g, (match) => {
    const path = match.match(/require\(['"]([^'"]+)['"]\)/)?.[1];
    return `"${mockRequire(path || 'unknown')}"`;
  });

  // Evaluar como JSON (con algunas correcciones)
  const PRODUCTS_DATA = eval(`[${cleanedContent}]`);

  console.log(`✅ Encontrados ${PRODUCTS_DATA.length} productos en products.js\n`);

  let imported = 0;
  let errors = 0;

  for (const product of PRODUCTS_DATA) {
    try {
      const result = upsertProduct({
        id: product.id || `product-${imported}`,
        reference: product.reference || null,
        title: product.title || 'Sin título',
        subtitle: product.subtitle || null,
        description: product.description || null,
        price: parseFloat(product.price || product.priceEUR || 0),
        originalPrice: parseFloat(product.originalPrice || product.oldPrice || null) || null,
        currency: 'EUR',
        hasDiscount: product.onSale ? 1 : 0,
        priceWithoutTax: null,
        stock: product.inStock ? 100 : 0, // Stock por defecto: 100 si inStock, 0 si no
        minimumQuantity: 1,
        imageUrl: null, // Las imágenes son paths locales, no URLs
        category: product.type || 'general',
        brand: product.brand || null,
        model: product.model || null,
        mercagarageSynced: 0,
        lastSyncAt: null,
      });

      imported++;

      if (imported % 10 === 0) {
        console.log(`   Importados ${imported} productos...`);
      }
    } catch (err) {
      console.error(`❌ Error importando producto ${product.id}:`, err.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(60));
  console.log(`✅ Productos importados: ${imported}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📦 Total en archivo: ${PRODUCTS_DATA.length}`);
  console.log('='.repeat(60));

  if (imported > 0) {
    console.log('\n✨ ¡Productos importados correctamente!');
    console.log('\n📝 Siguiente paso:');
    console.log('   curl http://localhost:4000/api/products | jq ". | length"');
    console.log('   → Deberías ver:', imported);
  }

} catch (error) {
  console.error('❌ Error al procesar products.js:', error.message);
  console.error('\nPista: Puede haber sintaxis no soportada en el archivo.');
  console.error('Intenta simplificar el formato o crea un archivo JSON separado.');
  process.exit(1);
}
