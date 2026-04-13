/**
 * Script para insertar productos de oferta en la base de datos
 *
 * ⚠️ DESACTIVADO - Ahora se usan solo productos reales de Mercagarage API
 * Los productos se sincronizan con: node server/sync-motive.js
 */

import { upsertProduct } from './database.js';

console.log('⚠️  Este script está desactivado. Usa: node server/sync-motive.js\n');
process.exit(0);

// CÓDIGO DESACTIVADO ABAJO:
/*
console.log('📦 Insertando productos de oferta...\n');

const OFFER_PRODUCTS = [
  {
    id: "1767",
    reference: "MOR-847MS-K",
    title: "KIT Manguitos Silicona SEAT 600",
    subtitle: "SEAT 600 · Kit completo",
    description: "Kit completo de manguitos de silicona triple capa para SEAT 600",
    price: 59.90,
    originalPrice: 79.90,
    currency: "EUR",
    hasDiscount: 1,
    priceWithoutTax: 49.50,
    stock: 15,
    minimumQuantity: 1,
    imageUrl: "https://mercagarage.com/1542385-home_default/kit-manguitos-silicona-seat-600.jpg",
    category: "manguito",
    brand: "SEAT",
    model: "600",
    mercagarageSynced: 1,
    lastSyncAt: new Date().toISOString(),
  },
  {
    id: "manguito-llenado-seat-124-1430",
    reference: "MOR-124-LL",
    title: "Manguito Inferior Radiador SEAT 127",
    subtitle: "SEAT 127 · Manguito inferior",
    description: "Manguito inferior del radiador en silicona para SEAT 127",
    price: 19.90,
    originalPrice: 29.90,
    currency: "EUR",
    hasDiscount: 1,
    priceWithoutTax: 16.45,
    stock: 25,
    minimumQuantity: 1,
    imageUrl: "/images/manguitos/manguito-inferior-de-radiador-seat-127.jpg",
    category: "manguito",
    brand: "SEAT",
    model: "127",
    mercagarageSynced: 0,
    lastSyncAt: null,
  },
  {
    id: "radiador-aluminio-seat-127",
    reference: "RAD-127-ALU",
    title: "Radiador Aluminio SEAT 127 / FURA",
    subtitle: "SEAT 127 / FURA · Aluminio de alto rendimiento",
    description: "Radiador de aluminio de alto rendimiento para SEAT 127 y FURA",
    price: 189.00,
    originalPrice: 249.00,
    currency: "EUR",
    hasDiscount: 1,
    priceWithoutTax: 156.20,
    stock: 8,
    minimumQuantity: 1,
    imageUrl: "/images/radiadores/radiador-aluminio-seat-127-fura-cl-1010.jpg",
    category: "radiador",
    brand: "SEAT",
    model: "127",
    mercagarageSynced: 0,
    lastSyncAt: null,
  },
  {
    id: "kit-manguitos-seat-127",
    reference: "MOR-127-KIT",
    title: "KIT Manguitos Silicona SEAT 127",
    subtitle: "SEAT 127 · Kit completo",
    description: "Kit completo de manguitos de silicona para SEAT 127",
    price: 74.90,
    originalPrice: 99.90,
    currency: "EUR",
    hasDiscount: 1,
    priceWithoutTax: 61.90,
    stock: 12,
    minimumQuantity: 1,
    imageUrl: "/images/manguitos/kit-manguitos-silicona-seat-127.jpg",
    category: "manguito",
    brand: "SEAT",
    model: "127",
    mercagarageSynced: 0,
    lastSyncAt: null,
  },
  {
    id: "radiador-seat-600",
    reference: "RAD-600-ALU",
    title: "Radiador Aluminio Doble Núcleo SEAT 600",
    subtitle: "SEAT 600 · Doble núcleo alto rendimiento",
    description: "Radiador de aluminio doble núcleo de alto rendimiento para SEAT 600",
    price: 169.00,
    originalPrice: 219.00,
    currency: "EUR",
    hasDiscount: 1,
    priceWithoutTax: 139.67,
    stock: 6,
    minimumQuantity: 1,
    imageUrl: "/images/radiadores/radiador-aluminio-doble-nucleo-seat-600.jpg",
    category: "radiador",
    brand: "SEAT",
    model: "600",
    mercagarageSynced: 0,
    lastSyncAt: null,
  },
  {
    id: "manguito-calefaccion-seat-127",
    reference: "MOR-127-CAL",
    title: "Manguito Calefacción a Motor SEAT 127",
    subtitle: "SEAT 127 · Calefacción",
    description: "Manguito recto largo de calefacción a motor para SEAT 127",
    price: 15.90,
    originalPrice: 22.90,
    currency: "EUR",
    hasDiscount: 1,
    priceWithoutTax: 13.14,
    stock: 30,
    minimumQuantity: 1,
    imageUrl: "/images/manguitos/manguito-calefaccion-a-motor-recto-largo-seat-127.jpg",
    category: "manguito",
    brand: "SEAT",
    model: "127",
    mercagarageSynced: 0,
    lastSyncAt: null,
  },
  // Algunos productos SIN oferta para variedad
  {
    id: "radiador-seat-124",
    reference: "RAD-124-ALU",
    title: "Kit Radiador Aluminio Doble Núcleo SEAT 124",
    subtitle: "SEAT 124 · Kit completo con electroventilador",
    description: "Kit radiador de aluminio doble núcleo para SEAT 124",
    price: 299.00,
    originalPrice: null,
    currency: "EUR",
    hasDiscount: 0,
    priceWithoutTax: 247.11,
    stock: 5,
    minimumQuantity: 1,
    imageUrl: "/images/radiadores/kit-radiador-aluminio-doble-nucleo-seat-124.jpg",
    category: "radiador",
    brand: "SEAT",
    model: "124",
    mercagarageSynced: 0,
    lastSyncAt: null,
  },
  {
    id: "radiador-seat-1430",
    reference: "RAD-1430-STD",
    title: "Radiador Aluminio Doble Núcleo SEAT 1430 FU",
    subtitle: "SEAT 1430 FU · 1600/1800cc",
    description: "Radiador de aluminio doble núcleo para SEAT 1430 FU (1600/1800cc)",
    price: 269.00,
    originalPrice: null,
    currency: "EUR",
    hasDiscount: 0,
    priceWithoutTax: 222.31,
    stock: 7,
    minimumQuantity: 1,
    imageUrl: "/images/radiadores/radiador-aluminio-doble-nucleo-para-seat-1430-fu-1600-1800cc.jpg",
    category: "radiador",
    brand: "SEAT",
    model: "1430",
    mercagarageSynced: 0,
    lastSyncAt: null,
  },
];

let imported = 0;
let errors = 0;

for (const product of OFFER_PRODUCTS) {
  try {
    upsertProduct(product);
    imported++;
    const status = product.hasDiscount ? '🔥 OFERTA' : '  ';
    console.log(`${status} ✅ ${product.title} - €${product.price}${product.originalPrice ? ` (antes €${product.originalPrice})` : ''}`);
  } catch (err) {
    console.error(`❌ Error importando ${product.id}:`, err.message);
    errors++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN');
console.log('='.repeat(60));
console.log(`✅ Productos insertados: ${imported}`);
console.log(`🔥 Productos en oferta: ${OFFER_PRODUCTS.filter(p => p.hasDiscount).length}`);
console.log(`❌ Errores: ${errors}`);
console.log('='.repeat(60));

console.log('\n✨ ¡Listo! Ahora puedes ver las ofertas en http://localhost:3000');
*/
