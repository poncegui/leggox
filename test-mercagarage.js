/**
 * Script de prueba para verificar la integración con Mercagarage
 *
 * Uso:
 *   node test-mercagarage.js
 */

const API_URL = process.env.API_URL || 'http://localhost:4000';
const MERCAGARAGE_URL = 'https://mercagarage.com/module/motive/front?action=shopperPrices';

// IDs de productos Leggox para probar
const TEST_PRODUCT_IDS = [
  "1788", "28405", "60858", "71178", "71182",
  "87803", "87804", "87805"
];

console.log('🧪 Test de Integración Mercagarage\n');
console.log('='.repeat(50));

// Test 1: Probar API de Mercagarage directamente
async function testMercagarageAPI() {
  console.log('\n📡 Test 1: API de Mercagarage (directo)');
  console.log('-'.repeat(50));

  try {
    const response = await fetch(MERCAGARAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_PRODUCT_IDS),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Error: ${text}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Respuesta recibida: ${data.length} productos`);

    if (data.length > 0) {
      console.log('\n📦 Ejemplo de producto:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️  No se recibieron productos. Posible problema:');
      console.log('   - Los IDs no existen en Mercagarage');
      console.log('   - La API requiere autenticación');
      console.log('   - Formato de request incorrecto');
    }

    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

// Test 2: Probar endpoint local del servidor
async function testLocalAPI() {
  console.log('\n🖥️  Test 2: Servidor local (/api/mercagarage/prices)');
  console.log('-'.repeat(50));

  try {
    const response = await fetch(`${API_URL}/api/mercagarage/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds: TEST_PRODUCT_IDS }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Error: ${text}`);
      console.log('\n⚠️  Asegúrate de que el servidor esté corriendo:');
      console.log('   cd server && node index.js');
      return false;
    }

    const data = await response.json();
    console.log(`✅ Respuesta recibida: ${data.length} productos`);

    if (data.length > 0) {
      console.log('\n📦 Primer producto:');
      console.log(JSON.stringify(data[0], null, 2));

      // Análisis de datos
      const withPrices = data.filter(p => p.price?.value > 0).length;
      const inStock = data.filter(p => p.availability?.minimumQuantity > 0).length;
      const withDiscount = data.filter(p => p.price?.hasDiscount).length;

      console.log('\n📊 Estadísticas:');
      console.log(`   Total productos: ${data.length}`);
      console.log(`   Con precio: ${withPrices}`);
      console.log(`   En stock: ${inStock}`);
      console.log(`   Con descuento: ${withDiscount}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n⚠️  Posibles causas:');
    console.log('   - El servidor no está corriendo en', API_URL);
    console.log('   - CORS no configurado correctamente');
    return false;
  }
}

// Test 3: Verificar estructura de respuesta
async function testResponseStructure() {
  console.log('\n🔍 Test 3: Validación de estructura de datos');
  console.log('-'.repeat(50));

  try {
    const response = await fetch(`${API_URL}/api/mercagarage/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds: ["60858"] }), // Un solo producto
    });

    if (!response.ok) {
      console.log('⚠️  Saltando test (servidor no disponible)');
      return false;
    }

    const data = await response.json();

    if (data.length === 0) {
      console.log('⚠️  No hay datos para validar');
      return false;
    }

    const product = data[0];

    // Verificar campos requeridos
    const checks = [
      { field: 'id', exists: !!product.id },
      { field: 'price', exists: !!product.price },
      { field: 'price.value', exists: !!product.price?.value },
      { field: 'price.originalValue', exists: product.price?.originalValue !== undefined },
      { field: 'price.hasDiscount', exists: product.price?.hasDiscount !== undefined },
      { field: 'price.hasTax', exists: product.price?.hasTax !== undefined },
      { field: 'availability', exists: !!product.availability },
      { field: 'availability.minimumQuantity', exists: product.availability?.minimumQuantity !== undefined },
    ];

    console.log('Validación de campos:');
    checks.forEach(check => {
      console.log(`   ${check.exists ? '✅' : '❌'} ${check.field}`);
    });

    const allValid = checks.every(c => c.exists);

    if (allValid) {
      console.log('\n✅ Estructura válida');
    } else {
      console.log('\n⚠️  Algunos campos faltan o tienen estructura diferente');
    }

    return allValid;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Test 4: Benchmark de performance
async function testPerformance() {
  console.log('\n⚡ Test 4: Performance');
  console.log('-'.repeat(50));

  try {
    const start = Date.now();

    const response = await fetch(`${API_URL}/api/mercagarage/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds: TEST_PRODUCT_IDS }),
    });

    const data = await response.json();
    const end = Date.now();
    const duration = end - start;

    console.log(`⏱️  Tiempo de respuesta: ${duration}ms`);

    if (duration < 500) {
      console.log('✅ Excelente (<500ms)');
    } else if (duration < 1000) {
      console.log('✅ Bueno (500-1000ms)');
    } else if (duration < 2000) {
      console.log('⚠️  Aceptable (1-2s)');
    } else {
      console.log('❌ Lento (>2s) - considera implementar caché');
    }

    console.log(`📦 Productos recibidos: ${data.length}`);
    console.log(`📊 Throughput: ${(data.length / (duration / 1000)).toFixed(2)} productos/segundo`);

    return true;
  } catch (error) {
    console.log('⚠️  Saltando test (servidor no disponible)');
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  const results = {
    mercagarageAPI: await testMercagarageAPI(),
    localAPI: await testLocalAPI(),
    structure: await testResponseStructure(),
    performance: await testPerformance(),
  };

  console.log('\n' + '='.repeat(50));
  console.log('📋 RESUMEN DE TESTS');
  console.log('='.repeat(50));

  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });

  const allPassed = Object.values(results).every(Boolean);

  if (allPassed) {
    console.log('\n🎉 ¡Todos los tests pasaron! La integración está lista.');
    console.log('\n📚 Siguiente paso:');
    console.log('   1. Lee MERCAGARAGE_INTEGRATION.md para ver ejemplos de uso');
    console.log('   2. Envuelve tu App con <MercagarageProvider>');
    console.log('   3. Usa useMercagarage() en tus componentes');
  } else {
    console.log('\n⚠️  Algunos tests fallaron. Revisa los errores arriba.');
    console.log('\n🔧 Pasos para solucionar:');
    console.log('   1. Asegúrate de que el servidor esté corriendo: cd server && node index.js');
    console.log('   2. Verifica que API_URL sea correcta:', API_URL);
    console.log('   3. Revisa los logs del servidor para más detalles');
  }

  console.log('\n');
}

// Ejecutar
runAllTests().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
