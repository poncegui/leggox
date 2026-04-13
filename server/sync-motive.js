/**
 * Script para sincronizar productos de Leggox desde la API de Motive (Mercagarage)
 */

import { upsertProduct } from './database.js';

const MOTIVE_API_URL = 'https://search.api.motive.co/search';
const ENGINE_ID = 'cc422676-4596-49aa-a7f0-655cc7b0789a';

console.log('🔄 Sincronizando productos de Leggox desde Motive API...\n');

/**
 * Fetch products from Motive API with pagination
 */
async function fetchFromAPI(query, start = 0, rows = 96) {
  try {
    const url = `${MOTIVE_API_URL}?query=${encodeURIComponent(query)}&start=${start}&rows=${rows}&origin=search_box%3Anone`;
    const response = await fetch(url, {
      headers: {
        'X-Engine-Id': ENGINE_ID,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching from Motive API:', error.message);
    throw error;
  }
}

/**
 * Fetch all Leggox products (identified by MOR- reference codes)
 */
async function fetchLeggoxProducts() {
  try {
    const allProducts = [];
    const seatModels = ['SEAT 600', 'SEAT 127', 'SEAT 124', 'SEAT 1430', 'SEAT 131', 'SEAT FURA', 'SEAT Panda', 'radiador', 'manguito'];

    console.log('🔍 Buscando productos de Leggox (ref: MOR-)...');

    for (const model of seatModels) {
      const data = await fetchFromAPI(model, 0, 96);
      const docs = data.hits?.docs || [];

      // Filter for products with Leggox reference codes
      // Prefijos conocidos: MOR-, R-, ZH, RNE-, REF-, MNG-
      const leggoxProducts = docs.filter(doc => {
        const ref = doc.code?.reference;
        if (!ref) return false;

        const leggoxPrefixes = ['MOR-', 'R-', 'ZH', 'RNE-', 'REF-', 'MNG-'];
        return leggoxPrefixes.some(prefix => ref.startsWith(prefix));
      });

      if (leggoxProducts.length > 0) {
        console.log(`   ✓ ${model}: ${leggoxProducts.length} productos Leggox`);
        allProducts.push(...leggoxProducts);
      }
    }

    // Remove duplicates by ID
    const uniqueProducts = Array.from(
      new Map(allProducts.map(p => [p.id, p])).values()
    );

    console.log(`\n✅ Total productos únicos de Leggox: ${uniqueProducts.length}\n`);
    return uniqueProducts;

  } catch (error) {
    console.error('❌ Error fetching Leggox products:', error.message);
    throw error;
  }
}

/**
 * Transform Motive API product to our database format
 */
function transformMotiveProduct(doc) {
  const images = doc.images || [];
  const mainImage = images.length > 0 ? images[0].url : null;

  // Extract model from f5 field (e.g., "SEAT 600") or name
  const name = doc.name || '';
  const f5Models = doc.f5 || [];
  let model = '';

  // Try to get model from f5 field first
  if (f5Models.length > 0) {
    const modelMatch = f5Models[0].match(/SEAT\s+(\d+|FURA|Panda|Marbella|Sport)/i);
    if (modelMatch) {
      model = modelMatch[1];
    }
  }

  // Fallback: extract from name
  if (!model) {
    const seatModels = ['600', '127', '128', '131', '124', '1430', 'FURA', 'Panda', 'Marbella'];
    for (const m of seatModels) {
      if (name.toUpperCase().includes(m)) {
        model = m;
        break;
      }
    }
  }

  // Determine category from name
  let category = 'general';
  const nameLower = name.toLowerCase();
  if (nameLower.includes('manguito')) category = 'manguito';
  else if (nameLower.includes('radiador')) category = 'radiador';
  else if (nameLower.includes('deposito')) category = 'deposito';
  else if (nameLower.includes('depósito')) category = 'deposito';
  else if (nameLower.includes('tubo')) category = 'tubo';
  else if (nameLower.includes('kit')) category = 'kit';

  // Check if has discount
  const regularPrice = doc.price?.regular || 0;
  const salePrice = doc.price?.sale;
  const hasDiscount = salePrice && salePrice < regularPrice;
  const finalPrice = hasDiscount ? salePrice : regularPrice;

  // Create subtitle from f5 or model
  let subtitle = '';
  if (f5Models.length > 0) {
    subtitle = f5Models.join(' · ');
  } else if (model) {
    subtitle = `SEAT ${model}`;
  }

  return {
    id: String(doc.id),
    reference: doc.code?.reference || null,
    title: name || `Producto ${doc.id}`,
    subtitle: subtitle || '',
    description: name, // API doesn't provide separate description
    price: parseFloat(finalPrice.toFixed(2)),
    originalPrice: hasDiscount ? parseFloat(regularPrice.toFixed(2)) : null,
    currency: 'EUR',
    hasDiscount: hasDiscount ? 1 : 0,
    priceWithoutTax: parseFloat((finalPrice / 1.21).toFixed(2)), // Calculate without 21% IVA
    stock: Math.floor(doc.availability?.stock || 0),
    minimumQuantity: doc.availability?.allow_order ? 1 : 0,
    imageUrl: mainImage,
    category: category,
    brand: 'SEAT',
    model: model || null,
    mercagarageSynced: 1,
    lastSyncAt: new Date().toISOString(),
  };
}

/**
 * Main sync function
 */
async function syncProducts() {
  let imported = 0;
  let updated = 0;
  let errors = 0;

  try {
    console.log('📥 Obteniendo productos de Motive API...');
    const products = await fetchLeggoxProducts();

    console.log(`✅ Se encontraron ${products.length} productos de Leggox\n`);
    console.log('=' .repeat(70));

    for (const motiveProduct of products) {
      try {
        const product = transformMotiveProduct(motiveProduct);

        // Check if product exists
        const { getProductById } = await import('./database.js');
        const existing = getProductById(product.id);

        upsertProduct(product);

        if (existing) {
          updated++;
          console.log(`🔄 ACTUALIZADO: ${product.title}`);
        } else {
          imported++;
          console.log(`✨ NUEVO: ${product.title}`);
        }

        // Show price and stock info
        const priceInfo = product.hasDiscount
          ? `€${product.price} (antes €${product.originalPrice}) 🔥`
          : `€${product.price}`;
        const stockInfo = product.stock > 0 ? `✅ Stock: ${product.stock}` : '❌ Sin stock';
        console.log(`   ${priceInfo} | ${stockInfo}`);
        console.log(`   📸 ${product.imageUrl || 'Sin imagen'}`);
        console.log('   ' + '-'.repeat(66));

      } catch (err) {
        console.error(`❌ Error importando ${motiveProduct.id}:`, err.message);
        errors++;
      }
    }

    console.log('=' .repeat(70));
    console.log('\n📊 RESUMEN DE SINCRONIZACIÓN');
    console.log('=' .repeat(70));
    console.log(`✨ Productos nuevos: ${imported}`);
    console.log(`🔄 Productos actualizados: ${updated}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📦 Total procesado: ${products.length}`);
    console.log('=' .repeat(70));

    // Show products with discount
    const withDiscount = products.filter(p => {
      const sale = p.price?.sale;
      const regular = p.price?.regular;
      return sale && sale < regular;
    });
    console.log(`\n🔥 Productos en oferta: ${withDiscount.length}`);

  } catch (error) {
    console.error('\n💥 Error fatal en la sincronización:', error);
    process.exit(1);
  }
}

// Run sync
syncProducts()
  .then(() => {
    console.log('\n✨ ¡Sincronización completada!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });
