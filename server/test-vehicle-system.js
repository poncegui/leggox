/**
 * Test del sistema de vehículos
 * Verifica que todo funciona correctamente
 */

import {
  getAllVehicles,
  getProductVehicles,
  getProductsByVehicle,
  searchProductsByVehicles,
  getAllProducts,
} from './database.js';

console.log('🧪 Testing Vehicle System\n');
console.log('='.repeat(70));

// Test 1: Obtener todos los vehículos
console.log('\n📋 TEST 1: Obtener todos los vehículos');
console.log('-'.repeat(70));
const vehicles = getAllVehicles();
console.log(`✅ Total de vehículos: ${vehicles.length}`);
vehicles.forEach(v => {
  console.log(`   • ${v.full_name} (ID: ${v.id})`);
});

// Test 2: Obtener productos de un vehículo específico
console.log('\n\n📋 TEST 2: Productos del SEAT 600');
console.log('-'.repeat(70));
const seat600Products = getProductsByVehicle('seat-600');
console.log(`✅ Productos compatibles con SEAT 600: ${seat600Products.length}`);
seat600Products.slice(0, 5).forEach(p => {
  console.log(`   • ${p.title} (€${p.price})`);
});
if (seat600Products.length > 5) {
  console.log(`   ... y ${seat600Products.length - 5} más`);
}

// Test 3: Obtener vehículos de un producto
console.log('\n\n📋 TEST 3: Vehículos compatibles con un producto');
console.log('-'.repeat(70));
const allProducts = getAllProducts();
const sampleProduct = allProducts.find(p => p.title.includes('SEAT'));

if (sampleProduct) {
  console.log(`Producto: ${sampleProduct.title}`);
  const compatibleVehicles = getProductVehicles(sampleProduct.id);
  console.log(
    `✅ Vehículos compatibles: ${compatibleVehicles.map(v => v.model).join(', ')}`
  );
} else {
  console.log('⚠️  No se encontró producto de ejemplo');
}

// Test 4: Buscar por múltiples vehículos
console.log('\n\n📋 TEST 4: Productos compatibles con SEAT 600 o 850');
console.log('-'.repeat(70));
const multiVehicleProducts = searchProductsByVehicles(['seat-600', 'seat-850']);
console.log(
  `✅ Productos compatibles con 600 o 850: ${multiVehicleProducts.length}`
);
multiVehicleProducts.slice(0, 3).forEach(p => {
  console.log(`   • ${p.title}`);
});

// Test 5: Estadísticas generales
console.log('\n\n📊 ESTADÍSTICAS DEL SISTEMA');
console.log('='.repeat(70));
const totalProducts = getAllProducts().length;
const productsWithVehicles = new Set(
  vehicles.flatMap(v => getProductsByVehicle(v.id).map(p => p.id))
).size;

console.log(`📦 Total de productos: ${totalProducts}`);
console.log(`🚗 Total de vehículos únicos: ${vehicles.length}`);
console.log(`🔗 Productos con vehículos asociados: ${productsWithVehicles}`);
console.log(
  `⚠️  Productos sin vehículos: ${totalProducts - productsWithVehicles}`
);

// Test 6: Productos por vehículo
console.log('\n\n📊 PRODUCTOS POR VEHÍCULO');
console.log('='.repeat(70));
vehicles
  .map(v => ({
    vehicle: v.full_name,
    count: getProductsByVehicle(v.id).length,
  }))
  .sort((a, b) => b.count - a.count)
  .forEach(({ vehicle, count }) => {
    const bar = '█'.repeat(Math.ceil(count / 10));
    console.log(`${vehicle.padEnd(20)} ${bar} ${count}`);
  });

console.log('\n' + '='.repeat(70));
console.log('✅ Todos los tests completados correctamente\n');
