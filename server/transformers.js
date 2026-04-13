/**
 * Transformers / DTOs para convertir datos de BD al formato esperado por el frontend
 */

/**
 * Transforma un producto de la BD al formato esperado por los componentes React
 */
export function transformProductToFrontend(dbProduct) {
  if (!dbProduct) return null;

  return {
    // IDs y referencias
    id: dbProduct.id,
    reference: dbProduct.reference,
    sku: dbProduct.reference,
    slug: dbProduct.reference,

    // Información básica
    type: dbProduct.category || 'general',
    title: dbProduct.title,
    subtitle: dbProduct.subtitle || '',
    description: dbProduct.description || '',

    // Precios
    price: dbProduct.price,
    priceEUR: dbProduct.price,
    oldPrice: dbProduct.original_price,
    originalPrice: dbProduct.original_price,
    onSale: dbProduct.has_discount === 1,
    hasDiscount: dbProduct.has_discount === 1,
    currency: dbProduct.currency || 'EUR',

    // Stock
    inStock: dbProduct.stock > 0,
    stock: dbProduct.stock,

    // Estado
    featured: true, // Todos los productos en BD se consideran featured

    // Imágenes
    imageSrc: (dbProduct.image_url && dbProduct.image_url.trim()) || null,
    imageLargeSrc: (dbProduct.image_url && dbProduct.image_url.trim()) || null,
    images: {
      sketch: (dbProduct.image_url && dbProduct.image_url.trim()) || null,
      real: (dbProduct.image_url && dbProduct.image_url.trim()) || null,
    },

    // URLs
    buyUrl: generateBuyUrl(dbProduct.id, dbProduct.reference, dbProduct.title),
    href: generateProductUrl(dbProduct.id, dbProduct.title),

    // Metadata
    brand: dbProduct.brand || '',
    model: dbProduct.model || '',

    // Arrays (por ahora vacíos, se pueden mejorar)
    vehicles: parseVehicles(dbProduct.model, dbProduct.brand, dbProduct.title),
    tags: parseTags(dbProduct.title, dbProduct.subtitle, dbProduct.category),

    // Info técnica (si existe)
    technical: dbProduct.technical ? JSON.parse(dbProduct.technical) : null,

    // Metadata de sincronización
    mercagarage: {
      synced: dbProduct.mercagarage_synced === 1,
      lastSync: dbProduct.last_sync_at,
    },
  };
}

/**
 * Transforma múltiples productos
 */
export function transformProductsToFrontend(dbProducts) {
  if (!Array.isArray(dbProducts)) return [];
  return dbProducts.map(transformProductToFrontend).filter(Boolean);
}

/**
 * Genera URL de compra en Mercagarage
 */
function generateBuyUrl(id, reference, title) {
  if (!id) return 'https://mercagarage.com';

  // Intentar usar el ID numérico
  const numericId = String(id).match(/\d+/)?.[0] || id;

  // Crear slug del título
  const slug = (title || 'producto')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return `https://mercagarage.com/inicio/${numericId}-${slug}.html`;
}

/**
 * Genera URL interna del producto
 */
function generateProductUrl(id, title) {
  const slug = (title || 'producto')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  return `/producto/${id}/${slug}`;
}

/**
 * Genera imagen por defecto según categoría
 */
function generateDefaultImage(category) {
  // Retornar null para que los componentes manejen el fallback
  return null;
}

/**
 * Parsea vehículos desde el modelo y marca
 */
function parseVehicles(model, brand, title = '') {
  const vehicles = [];
  const processedNumbers = new Set();

  if (brand && model) {
    // Parsear múltiples modelos si existen (separados por "y", "-", ",", etc)
    const modelParts = model
      .split(/\s+y\s+|,\s*|-\s*|;\s*/i)
      .map(m => m.trim())
      .filter(m => m.length > 0);

    modelParts.forEach(m => {
      // Si es solo un número, convertir a "SEAT XXX"
      if (/^\d+$/.test(m)) {
        vehicles.push(`${brand} ${m}`);
        processedNumbers.add(m);
      } else if (!m.startsWith(brand)) {
        vehicles.push(`${brand} ${m}`);
      } else {
        vehicles.push(m);
      }
    });
  } else if (brand) {
    vehicles.push(brand);
  } else if (model) {
    // Parsear múltiples modelos si existen (separados por "y", "-", ",", etc)
    const modelParts = model
      .split(/\s+y\s+|,\s*|-\s*|;\s*/i)
      .map(m => m.trim())
      .filter(m => m.length > 0);

    modelParts.forEach(m => {
      // Si es solo un número, convertir a "SEAT XXX"
      if (/^\d+$/.test(m)) {
        vehicles.push(`SEAT ${m}`);
        processedNumbers.add(m);
      } else {
        vehicles.push(m);
      }
    });
  }

  // Extraer números del título si no fueron procesados
  if (title && brand) {
    const titleNumbers = title.match(/\b(\d{3})\b/g) || [];
    titleNumbers.forEach(num => {
      if (!processedNumbers.has(num)) {
        vehicles.push(`${brand} ${num}`);
        processedNumbers.add(num);
      }
    });
  }

  // Extraer modelos comunes del título si no hay modelo específico
  const commonModels = [
    'SEAT 600',
    'SEAT 127',
    'SEAT 128',
    'SEAT 131',
    'SEAT 124',
    'SEAT 124 Sport',
    'SEAT 133',
    'SEAT 850',
    'SEAT 1200',
    'SEAT Panda',
    'SEAT Marbella',
    'SEAT 1430',
    'SEAT FL/1430',
    'SEAT 124/1430',
    'SEAT Fura',
  ];

  return vehicles.length > 0 ? vehicles : [];
}

/**
 * Parsea tags desde título, subtítulo y categoría
 */
function parseTags(title, subtitle, category) {
  const tags = [];

  if (category) tags.push(category);

  // Extraer palabras clave comunes
  const text = `${title} ${subtitle}`.toLowerCase();

  if (text.includes('silicona')) tags.push('silicona');
  if (text.includes('aluminio')) tags.push('aluminio');
  if (text.includes('radiador')) tags.push('radiador');
  if (text.includes('manguito')) tags.push('manguito');
  if (text.includes('kit')) tags.push('kit');
  if (text.includes('doble')) tags.push('doble nucleo');

  // Eliminar duplicados
  return [...new Set(tags)];
}

/**
 * Transforma un pedido de la BD al formato frontend
 */
export function transformOrderToFrontend(dbOrder) {
  if (!dbOrder) return null;

  return {
    id: dbOrder.id,
    orderId: dbOrder.order_id,
    paypalOrderId: dbOrder.paypal_order_id,

    customer: {
      name: dbOrder.customer_name,
      email: dbOrder.customer_email,
      phone: dbOrder.customer_phone,
    },

    shipping: typeof dbOrder.shipping_address === 'string'
      ? JSON.parse(dbOrder.shipping_address)
      : dbOrder.shipping_address,

    total: dbOrder.total,
    currency: dbOrder.currency,
    status: dbOrder.status,
    paymentMethod: dbOrder.payment_method,

    items: dbOrder.items || [],

    createdAt: dbOrder.created_at,
    completedAt: dbOrder.completed_at,
  };
}

/**
 * Transforma múltiples pedidos
 */
export function transformOrdersToFrontend(dbOrders) {
  if (!Array.isArray(dbOrders)) return [];
  return dbOrders.map(transformOrderToFrontend).filter(Boolean);
}
