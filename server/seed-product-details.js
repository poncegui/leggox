/**
 * Script para agregar descripciones y datos técnicos a productos
 * 
 * Uso: node seed-product-details.js
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'leggox.db'));

// Datos detallados por referencia
const PRODUCT_DETAILS = [
  {
    reference: 'RNE-045-T',
    title: 'Radiador Aluminio SEAT 127 / FURA "ALUMINIO" OEM',
    description: `Radiador de aluminio para SEAT127 en Aluminio respetando medidas y anclajes según OEM.

Producto en doble núcleo OEM para llegar y montar.`,
    technical: {
      material: 'Aluminio doble núcleo',
      color: 'Plateado',
      thermostat: 'SI',
      measurements: 'OEM SEAT 127',
      notes: 'Últimas unidades en stock',
    },
    price: 179.00,
    stock: 5,
  },
  {
    reference: 'MOR-847MS-K',
    title: 'KIT Manguitos Silicona SEAT 600',
    description: `Kit completo de manguitos de silicona de triple capa para SEAT 600.

Manguitos de agua y toma de aire para carburador starter.`,
    technical: {
      material: 'Silicona triple capa',
      color: 'Negro',
      kitContents: [
        { qty: 3, name: 'Manguito de Agua' },
        { qty: 1, name: 'Manguito de toma de aire para carburador STARTER' },
      ],
      notes: 'Producto preparado para llegar y montar',
    },
    price: 69.90,
    stock: 15,
  },
  {
    reference: 'MOR-857MS-K',
    title: 'KIT Manguitos Silicona SEAT 127',
    description: `Kit completo de manguitos de silicona de triple capa para SEAT 127.

Manguitos profesionales hecho con silicona resistente a altas temperaturas.`,
    technical: {
      material: 'Silicona triple capa',
      color: 'Negro',
      notes: 'Compatibles con SEAT 127 original',
    },
    price: 164.90,
    stock: 10,
  },
  {
    reference: 'G-001S-R',
    title: 'Manguito Silicona Llenado SEAT 124/1430 "RANCHERA"',
    description: `Manguito de silicona para llenado radiador compatible con SEAT 124 y SEAT 1430 en versión Ranchera.

Silicona triple capa resistente a temperaturas extremas.`,
    technical: {
      material: 'Silicona triple capa',
      color: 'Negro',
      notes: 'Manguito llenado SEAT 124 y 1430 en versión Ranchera',
    },
    price: 24.90,
    stock: 25,
  },
];

console.log('📝 Actualizando detalles de productos...\n');

let updated = 0;
let errors = 0;

for (const details of PRODUCT_DETAILS) {
  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET 
        title = ?,
        description = ?,
        technical = ?,
        price = ?,
        stock = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE reference = ? OR title = ?
    `);

    const result = stmt.run(
      details.title,
      details.description,
      JSON.stringify(details.technical),
      details.price,
      details.stock,
      details.reference,
      details.title
    );

    if (result.changes > 0) {
      console.log(`✅ Actualizado: ${details.title} (${details.reference})`);
      updated++;
    } else {
      console.log(`⚠️  No encontrado: ${details.reference}`);
    }
  } catch (err) {
    console.error(`❌ Error actualizando ${details.reference}:`, err.message);
    errors++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE ACTUALIZACIÓN');
console.log('='.repeat(60));
console.log(`✅ Productos actualizados: ${updated}`);
console.log(`❌ Errores: ${errors}`);
console.log('='.repeat(60));

db.close();
