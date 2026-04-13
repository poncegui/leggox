/**
 * Script de prueba para verificar la base de datos y API
 *
 * Uso: node test-database.js
 */

const API_URL = 'http://localhost:4000';

console.log('🧪 Test de Base de Datos e Integración\n');
console.log('='.repeat(60));

async function testServerHealth() {
  console.log('\n📡 Test 1: Servidor corriendo');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      console.log('✅ Servidor respondiendo correctamente');
      return true;
    } else {
      console.log('❌ Servidor respondió con error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ No se puede conectar al servidor');
    console.log('   Asegúrate de iniciar: cd server && node index.js');
    return false;
  }
}

async function testGetProducts() {
  console.log('\n📦 Test 2: Obtener productos');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${API_URL}/api/products`);
    const products = await response.json();

    console.log(`✅ Productos en base de datos: ${products.length}`);

    if (products.length > 0) {
      console.log('\n📋 Primeros 3 productos:');
      products.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.title}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Precio: €${p.price}`);
        console.log(`   Stock: ${p.stock}`);
        console.log(`   Sincronizado: ${p.mercagarage_synced ? 'Sí' : 'No'}`);
      });
      return true;
    } else {
      console.log('\n⚠️  No hay productos en la base de datos');
      console.log('   Ejecuta el test de sincronización o importa productos');
      return false;
    }
  } catch (error) {
    console.log('❌ Error obteniendo productos:', error.message);
    return false;
  }
}

async function testProductSearch() {
  console.log('\n🔍 Test 3: Búsqueda de productos');
  console.log('-'.repeat(60));

  try {
    // Buscar por término
    const response = await fetch(`${API_URL}/api/products?search=manguito`);
    const results = await response.json();

    console.log(`✅ Búsqueda "manguito": ${results.length} resultados`);

    // Filtrar por stock
    const inStockResponse = await fetch(`${API_URL}/api/products?inStock=true`);
    const inStockResults = await inStockResponse.json();

    console.log(`✅ Productos en stock: ${inStockResults.length}`);

    return true;
  } catch (error) {
    console.log('❌ Error en búsqueda:', error.message);
    return false;
  }
}

async function testSyncProducts() {
  console.log('\n🔄 Test 4: Sincronización con Mercagarage');
  console.log('-'.repeat(60));
  console.log('⚠️  Este test creará/actualizará productos en la BD');

  try {
    const productIds = ["60858", "87803"];

    console.log(`Sincronizando IDs: ${productIds.join(', ')}`);

    const response = await fetch(`${API_URL}/api/products/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Sincronización exitosa');
      console.log(`   Sincronizados: ${result.synced}`);
      console.log(`   Nuevos: ${result.added}`);
      console.log(`   Actualizados: ${result.updated}`);
      console.log(`   Total en BD: ${result.products.length}`);
      return true;
    } else {
      console.log('❌ Sincronización falló:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Error en sincronización:', error.message);
    return false;
  }
}

async function testCreateOrder() {
  console.log('\n🛒 Test 5: Crear pedido');
  console.log('-'.repeat(60));
  console.log('⚠️  Este test creará un pedido de prueba en la BD');

  try {
    const orderData = {
      cart: {
        items: [
          {
            id: "87803",
            title: "Producto de Prueba",
            qty: 1,
            unitPrice: 9.90,
          },
        ],
        total: 9.90,
        currency: "EUR",
      },
      customer: {
        fullName: "Test User",
        email: "test@example.com",
        phone: "666123456",
        address1: "Calle Test 123",
        city: "Madrid",
        province: "Madrid",
        postalCode: "28001",
        country: "ES",
      },
    };

    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Pedido creado correctamente');
      console.log(`   Order ID: ${result.order.order_id}`);
      console.log(`   Total: €${result.order.total}`);
      console.log(`   Status: ${result.order.status}`);
      console.log(`   Cliente: ${result.order.customer_name}`);
      return true;
    } else {
      console.log('❌ Error creando pedido:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Error creando pedido:', error.message);
    return false;
  }
}

async function testGetStats() {
  console.log('\n📊 Test 6: Estadísticas');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${API_URL}/api/stats`);
    const stats = await response.json();

    console.log('✅ Estadísticas obtenidas:');
    console.log(`\n📦 Productos:`);
    console.log(`   Total: ${stats.products.total}`);
    console.log(`   En stock: ${stats.products.inStock}`);
    console.log(`   Agotados: ${stats.products.outOfStock}`);
    console.log(`\n🛒 Pedidos:`);
    console.log(`   Total: ${stats.orders.total}`);
    console.log(`   Completados: ${stats.orders.completed}`);
    console.log(`   Pendientes: ${stats.orders.pending}`);
    console.log(`\n💰 Ingresos:`);
    console.log(`   Total: €${stats.revenue.total.toFixed(2)}`);

    return true;
  } catch (error) {
    console.log('❌ Error obteniendo estadísticas:', error.message);
    return false;
  }
}

async function runAllTests() {
  const results = {
    serverHealth: await testServerHealth(),
    getProducts: false,
    productSearch: false,
    syncProducts: false,
    createOrder: false,
    getStats: false,
  };

  if (!results.serverHealth) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ SERVIDOR NO DISPONIBLE');
    console.log('='.repeat(60));
    console.log('\n💡 Inicia el servidor con:');
    console.log('   cd server && node index.js\n');
    return;
  }

  results.getProducts = await testGetProducts();
  results.productSearch = await testProductSearch();

  // Solo sincronizar si el usuario confirma
  if (process.argv.includes('--sync')) {
    results.syncProducts = await testSyncProducts();
  } else {
    console.log('\n🔄 Test 4: Sincronización (Saltado)');
    console.log('-'.repeat(60));
    console.log('⚠️  Usa --sync para probar la sincronización');
    console.log('   node test-database.js --sync');
  }

  if (process.argv.includes('--create-order')) {
    results.createOrder = await testCreateOrder();
  } else {
    console.log('\n🛒 Test 5: Crear pedido (Saltado)');
    console.log('-'.repeat(60));
    console.log('⚠️  Usa --create-order para crear un pedido de prueba');
    console.log('   node test-database.js --create-order');
  }

  results.getStats = await testGetStats();

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMEN DE TESTS');
  console.log('='.repeat(60));

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${test}`);
  });

  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 Resultado: ${totalPassed}/${totalTests} tests pasaron`);

  if (totalPassed === totalTests) {
    console.log('\n🎉 ¡Todo funcionando correctamente!');
    console.log('\n📚 Siguiente paso: Lee GUIA_COMPLETA_BD.md para integrar en tu app');
  } else {
    console.log('\n⚠️  Algunos tests fallaron. Revisa los errores arriba.');
  }

  console.log('\n💡 Comandos útiles:');
  console.log('   node test-database.js --sync          # Incluir test de sincronización');
  console.log('   node test-database.js --create-order  # Incluir test de crear pedido');
  console.log('   node test-database.js --sync --create-order  # Todos los tests');
  console.log('');
}

runAllTests().catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
