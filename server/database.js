import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear/abrir base de datos
const db = new Database(join(__dirname, 'leggox.db'));

// Habilitar WAL mode para mejor concurrencia
db.pragma('journal_mode = WAL');

// ============================================================================
// ESQUEMA DE LA BASE DE DATOS
// ============================================================================

function initDatabase() {
  // Tabla de productos
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      reference TEXT,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      price REAL NOT NULL DEFAULT 0,
      original_price REAL,
      currency TEXT DEFAULT 'EUR',
      has_discount INTEGER DEFAULT 0,
      price_without_tax REAL,
      stock INTEGER DEFAULT 0,
      minimum_quantity INTEGER DEFAULT 0,
      image_url TEXT,
      category TEXT,
      brand TEXT,
      model TEXT,
      technical TEXT,
      mercagarage_synced INTEGER DEFAULT 0,
      last_sync_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de vehículos (normalizada)
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      full_name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(brand, model)
    )
  `);

  // Tabla de relación productos-vehículos (muchos a muchos)
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      vehicle_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
      UNIQUE(product_id, vehicle_id)
    )
  `);

  // Tabla de pedidos
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      paypal_order_id TEXT,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      shipping_address TEXT,
      total REAL NOT NULL,
      currency TEXT DEFAULT 'EUR',
      status TEXT DEFAULT 'pending',
      payment_method TEXT DEFAULT 'paypal',
      payment_details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    )
  `);

  // Tabla de items del pedido
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      product_title TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Tabla de historial de sincronización
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      products_synced INTEGER DEFAULT 0,
      products_updated INTEGER DEFAULT 0,
      products_added INTEGER DEFAULT 0,
      status TEXT DEFAULT 'success',
      error_message TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Índices para mejor performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand);
    CREATE INDEX IF NOT EXISTS idx_vehicles_model ON vehicles(model);
    CREATE INDEX IF NOT EXISTS idx_product_vehicles_product ON product_vehicles(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_vehicles_vehicle ON product_vehicles(vehicle_id);
  `);

  console.log('✅ Base de datos inicializada');
}

// ============================================================================
// FUNCIONES DE PRODUCTOS
// ============================================================================

// Obtener todos los productos
export function getAllProducts() {
  const stmt = db.prepare('SELECT * FROM products ORDER BY created_at DESC');
  return stmt.all();
}

// Obtener producto por ID
export function getProductById(id) {
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  return stmt.get(id);
}

// Buscar productos
export function searchProducts(query, filters = {}) {
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (query) {
    sql += ' AND (title LIKE ? OR reference LIKE ? OR description LIKE ?)';
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  if (filters.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters.brand) {
    sql += ' AND brand = ?';
    params.push(filters.brand);
  }

  if (filters.inStock) {
    sql += ' AND stock > 0';
  }

  sql += ' ORDER BY title ASC';

  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

// Insertar o actualizar producto
export function upsertProduct(product) {
  const stmt = db.prepare(`
    INSERT INTO products (
      id, reference, title, subtitle, description,
      price, original_price, currency, has_discount, price_without_tax,
      stock, minimum_quantity, image_url, images, category, brand, model, technical,
      mercagarage_synced, last_sync_at, updated_at
    ) VALUES (
      @id, @reference, @title, @subtitle, @description,
      @price, @originalPrice, @currency, @hasDiscount, @priceWithoutTax,
      @stock, @minimumQuantity, @imageUrl, @images, @category, @brand, @model, @technical,
      @mercagarageSynced, @lastSyncAt, CURRENT_TIMESTAMP
    )
    ON CONFLICT(id) DO UPDATE SET
      title = @title,
      subtitle = @subtitle,
      description = @description,
      price = @price,
      original_price = @originalPrice,
      has_discount = @hasDiscount,
      price_without_tax = @priceWithoutTax,
      stock = @stock,
      minimum_quantity = @minimumQuantity,
      image_url = @imageUrl,
      images = @images,
      category = @category,
      brand = @brand,
      model = @model,
      technical = @technical,
      mercagarage_synced = @mercagarageSynced,
      last_sync_at = @lastSyncAt,
      updated_at = CURRENT_TIMESTAMP
  `);

  return stmt.run(product);
}

// Actualizar stock de un producto
export function updateProductStock(productId, quantity) {
  const stmt = db.prepare(`
    UPDATE products
    SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  return stmt.run(quantity, productId);
}

// Sincronizar productos desde Mercagarage
export function syncProductsFromMercagarage(mercagarageProducts) {
  const sync = db.transaction((products) => {
    let added = 0;
    let updated = 0;

    for (const p of products) {
      const existing = getProductById(p.id);

      upsertProduct({
        id: p.id,
        reference: p.reference || null,
        title: p.title || `Producto ${p.id}`,
        subtitle: p.subtitle || null,
        description: p.description || null,
        price: p.price?.value || 0,
        originalPrice: p.price?.originalValue || null,
        currency: 'EUR',
        hasDiscount: p.price?.hasDiscount ? 1 : 0,
        priceWithoutTax: p.price?.taxAlternativeValue || null,
        stock: p.availability?.minimumQuantity || 0,
        minimumQuantity: p.availability?.minimumQuantity || 0,
        imageUrl: p.imageUrl || null,
        category: p.category || 'general',
        brand: p.brand || null,
        model: p.model || null,
        mercagarageSynced: 1,
        lastSyncAt: new Date().toISOString(),
      });

      if (existing) {
        updated++;
      } else {
        added++;
      }
    }

    // Registrar en historial
    const histStmt = db.prepare(`
      INSERT INTO sync_history (source, products_synced, products_updated, products_added, status)
      VALUES ('mercagarage', ?, ?, ?, 'success')
    `);
    histStmt.run(products.length, updated, added);

    return { synced: products.length, added, updated };
  });

  return sync(mercagarageProducts);
}

// ============================================================================
// FUNCIONES DE PEDIDOS
// ============================================================================

// Crear pedido
export function createOrder(orderData) {
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      order_id, paypal_order_id, customer_name, customer_email, customer_phone,
      shipping_address, total, currency, status, payment_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_title, quantity, unit_price, total)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((data) => {
    // Insertar orden
    const result = insertOrder.run(
      data.orderId,
      data.paypalOrderId || null,
      data.customerName,
      data.customerEmail,
      data.customerPhone || null,
      JSON.stringify(data.shippingAddress),
      data.total,
      data.currency || 'EUR',
      data.status || 'pending',
      data.paymentMethod || 'paypal'
    );

    const orderId = result.lastInsertRowid;

    // Insertar items
    for (const item of data.items) {
      insertItem.run(
        orderId,
        item.productId,
        item.productTitle,
        item.quantity,
        item.unitPrice,
        item.quantity * item.unitPrice
      );

      // Reducir stock
      updateProductStock(item.productId, -item.quantity);
    }

    return orderId;
  });

  return transaction(orderData);
}

// Completar pedido
export function completeOrder(orderId, paymentDetails) {
  const stmt = db.prepare(`
    UPDATE orders
    SET status = 'completed',
        payment_details = ?,
        completed_at = CURRENT_TIMESTAMP
    WHERE order_id = ?
  `);

  return stmt.run(JSON.stringify(paymentDetails), orderId);
}

// Obtener pedido por ID
export function getOrderById(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);

  if (!order) return null;

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

  return {
    ...order,
    shipping_address: JSON.parse(order.shipping_address || '{}'),
    payment_details: order.payment_details ? JSON.parse(order.payment_details) : null,
    items,
  };
}

// Obtener todos los pedidos
export function getAllOrders(limit = 100) {
  const stmt = db.prepare(`
    SELECT * FROM orders
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}

// ============================================================================
// FUNCIONES DE VEHÍCULOS
// ============================================================================

/**
 * Inserta o obtiene un vehículo
 */
export function upsertVehicle(vehicleData) {
  const stmt = db.prepare(`
    INSERT INTO vehicles (id, brand, model, full_name)
    VALUES (@id, @brand, @model, @fullName)
    ON CONFLICT(id) DO UPDATE SET
      full_name = @fullName
  `);

  return stmt.run(vehicleData);
}

/**
 * Asocia un producto con un vehículo
 */
export function linkProductToVehicle(productId, vehicleId) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO product_vehicles (product_id, vehicle_id)
    VALUES (?, ?)
  `);

  return stmt.run(productId, vehicleId);
}

/**
 * Limpia las asociaciones de vehículos de un producto
 */
export function clearProductVehicles(productId) {
  const stmt = db.prepare('DELETE FROM product_vehicles WHERE product_id = ?');
  return stmt.run(productId);
}

/**
 * Obtiene todos los vehículos únicos que tienen productos válidos
 * Filtra vehículos mal formateados (sin modelo o con modelo = marca)
 */
export function getAllVehicles() {
  const stmt = db.prepare(`
    SELECT DISTINCT v.*
    FROM vehicles v
    INNER JOIN product_vehicles pv ON v.id = pv.vehicle_id
    INNER JOIN products p ON pv.product_id = p.id
    WHERE p.category IN ('manguito', 'radiador')
      AND v.model != ''
      AND v.model IS NOT NULL
      AND v.model != v.brand
    ORDER BY v.brand, v.model
  `);
  return stmt.all();
}

/**
 * Obtiene los vehículos de un producto específico
 */
export function getProductVehicles(productId) {
  const stmt = db.prepare(`
    SELECT v.*
    FROM vehicles v
    INNER JOIN product_vehicles pv ON v.id = pv.vehicle_id
    WHERE pv.product_id = ?
    ORDER BY v.brand, v.model
  `);
  return stmt.all(productId);
}

/**
 * Obtiene los productos que son compatibles con un vehículo
 */
export function getProductsByVehicle(vehicleId) {
  const stmt = db.prepare(`
    SELECT p.*
    FROM products p
    INNER JOIN product_vehicles pv ON p.id = pv.product_id
    WHERE pv.vehicle_id = ?
    ORDER BY p.title
  `);
  return stmt.all(vehicleId);
}

/**
 * Busca productos por múltiples vehículos
 */
export function searchProductsByVehicles(vehicleIds) {
  if (!vehicleIds || vehicleIds.length === 0) return [];

  const placeholders = vehicleIds.map(() => '?').join(',');
  const stmt = db.prepare(`
    SELECT DISTINCT p.*
    FROM products p
    INNER JOIN product_vehicles pv ON p.id = pv.product_id
    WHERE pv.vehicle_id IN (${placeholders})
    ORDER BY p.title
  `);

  return stmt.all(...vehicleIds);
}

// ============================================================================
// ESTADÍSTICAS
// ============================================================================

export function getStats() {
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const inStock = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock > 0').get().count;
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const completedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'").get().count;
  const totalRevenue = db.prepare("SELECT SUM(total) as sum FROM orders WHERE status = 'completed'").get().sum || 0;
  const totalVehicles = db.prepare('SELECT COUNT(*) as count FROM vehicles').get().count;

  return {
    products: {
      total: totalProducts,
      inStock,
      outOfStock: totalProducts - inStock,
    },
    orders: {
      total: totalOrders,
      completed: completedOrders,
      pending: totalOrders - completedOrders,
    },
    revenue: {
      total: totalRevenue,
    },
    vehicles: {
      total: totalVehicles,
    },
  };
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

initDatabase();

export default db;
