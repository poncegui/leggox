/**
 * Script de migración para extraer información técnica de productos existentes
 *
 * Este script:
 * 1. Lee todos los productos de la BD
 * 2. Extrae información técnica de title, subtitle y description
 * 3. Actualiza el campo technical en formato JSON
 */

import db, { getAllProducts } from './database.js';
import {
  extractTechnicalInfo,
  generateTechnicalDescription,
} from './technical-parser.js';

console.log('🔧 Iniciando migración de información técnica...\n');
console.log('='.repeat(70));

async function migrateTechnical() {
  const products = getAllProducts();
  console.log(`\n📦 Total de productos a procesar: ${products.length}\n`);

  let technicalExtracted = 0;
  let productsUpdated = 0;
  let productsWithoutTechnical = 0;

  const updateStmt = db.prepare(`
    UPDATE products
    SET technical = ?
    WHERE id = ?
  `);

  for (const product of products) {
    try {
      // Extraer información técnica
      const technical = extractTechnicalInfo({
        title: product.title,
        subtitle: product.subtitle,
        description: product.description,
      });

      if (technical && Object.keys(technical).length > 0) {
        // Actualizar en BD
        const technicalJson = JSON.stringify(technical);
        updateStmt.run(technicalJson, product.id);

        // Generar descripción técnica
        const techDesc = generateTechnicalDescription(technical);

        console.log(`✅ ${product.title.substring(0, 50)}...`);
        console.log(`   📋 ${techDesc || 'Sin descripción'}`);

        technicalExtracted++;
        productsUpdated++;
      } else {
        console.log(`⚠️  Sin info técnica: ${product.title.substring(0, 60)}...`);
        productsWithoutTechnical++;
      }
    } catch (error) {
      console.error(`❌ Error procesando producto ${product.id}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RESUMEN DE MIGRACIÓN');
  console.log('='.repeat(70));
  console.log(`✨ Productos procesados: ${products.length}`);
  console.log(`🔧 Productos con información técnica: ${technicalExtracted}`);
  console.log(`✅ Productos actualizados: ${productsUpdated}`);
  console.log(`⚠️  Productos sin info técnica: ${productsWithoutTechnical}`);
  console.log('='.repeat(70));

  // Mostrar ejemplos de info técnica extraída
  console.log('\n📋 EJEMPLOS DE INFORMACIÓN TÉCNICA EXTRAÍDA:');
  console.log('='.repeat(70));

  const examples = getAllProducts()
    .filter(p => p.technical)
    .slice(0, 10);

  examples.forEach(p => {
    const tech = JSON.parse(p.technical);
    const desc = generateTechnicalDescription(tech);
    console.log(`\n🔹 ${p.title}`);
    console.log(`   ${desc}`);
  });

  console.log('\n' + '='.repeat(70));
}

// Ejecutar migración
migrateTechnical()
  .then(() => {
    console.log('\n✨ ¡Migración completada con éxito!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error en la migración:', error);
    process.exit(1);
  });
