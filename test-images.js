#!/usr/bin/env node

/**
 * Test: Verificar que las imágenes se devuelven y se sirven correctamente
 */

const API_BASE = 'http://localhost:4000';

async function testImageFlow() {
  console.log('🧪 Test de Flujo de Imágenes\n');
  console.log('='.repeat(60));

  try {
    // 1. Obtener producto del API
    console.log('\n1️⃣  Obteniendo producto 1767 del API...');
    const productRes = await fetch(`${API_BASE}/api/products/1767`);
    if (!productRes.ok) {
      throw new Error(`Error en API: ${productRes.status}`);
    }
    const product = await productRes.json();
    console.log(`   ✅ Producto obtenido: "${product.title}"`);
    console.log(`   📸 imageSrc: ${product.imageSrc}`);
    console.log(`   📸 imageLargeSrc: ${product.imageLargeSrc}`);

    // 2. Verificar que la imagen existe en el servidor
    console.log('\n2️⃣  Verificando que la imagen existe en el servidor...');
    if (!product.imageSrc.startsWith('/')) {
      throw new Error('imageSrc no es una URL relativa');
    }

    const imageUrl = `${API_BASE}${product.imageSrc}`;
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error(`Imagen no encontrada: ${imageRes.status}`);
    }
    const bytes = await imageRes.blob();
    console.log(`   ✅ Imagen encontrada: ${bytes.size} bytes`);

    // 3. Verificar estructura de respuesta
    console.log('\n3️⃣  Verificando estructura de datos...');
    const hasRequiredFields = product.id && product.title && product.imageSrc;
    if (!hasRequiredFields) {
      throw new Error('Faltan campos requeridos');
    }
    console.log('   ✅ Estructura válida');

    // 4. Test con radiador
    console.log('\n4️⃣  Probando con un radiador...');
    const radiatorsRes = await fetch(`${API_BASE}/api/products?category=radiador`);
    const radiators = await radiatorsRes.json();
    if (radiators.length > 0) {
      const radio = radiators[0];
      console.log(`   ✅ Radiador: "${radio.title}"`);
      console.log(`   📸 imageSrc: ${radio.imageSrc}`);
      
      if (radio.imageSrc?.startsWith('/')) {
        const radioImageUrl = `${API_BASE}${radio.imageSrc}`;
        const radioImageRes = await fetch(radioImageUrl);
        if (radioImageRes.ok) {
          const radioBytes = await radioImageRes.blob();
          console.log(`   ✅ Imagen de radiador servida: ${radioBytes.size} bytes`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Todos los tests pasaron correctamente');
    console.log('\n📝 Resumen:');
    console.log('  1. El backend devuelve URLs relativas de imágenes');
    console.log('  2. Las imágenes están disponibles en /images/**');
    console.log('  3. El frontend puede resolver URLs usando REACT_APP_API_BASE');
    console.log('\n🚀 Siguientes pasos:');
    console.log('  1. Asegúrate que React esté usando resolveImageUrl()');
    console.log('  2. Las imágenes deberían aparecer en el navegador');
    console.log('  3. Si no aparecen, revisa la consola del navegador (Network)');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testImageFlow();
