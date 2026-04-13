import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  getAllProducts,
  getProductById,
  searchProducts,
  syncProductsFromMercagarage,
  createOrder,
  completeOrder,
  getOrderById,
  getAllOrders,
  getStats,
} from "./database.js";
import {
  transformProductToFrontend,
  transformProductsToFrontend,
  transformOrderToFrontend,
  transformOrdersToFrontend,
} from "./transformers.js";

dotenv.config();

// Resolver rutas relativas para __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicPath = join(__dirname, '../public');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(publicPath));

const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";
const BASE = PAYPAL_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

function assertEnv() {
  const missing = [];
  if (!process.env.PAYPAL_CLIENT_ID) missing.push("PAYPAL_CLIENT_ID");
  if (!process.env.PAYPAL_CLIENT_SECRET) missing.push("PAYPAL_CLIENT_SECRET");
  if (missing.length) {
    throw new Error(`Faltan variables .env: ${missing.join(", ")}`);
  }
}

// ✅ Función auxiliar para generar URLs de imágenes
function enrichProductWithImages(product, id) {
  if (!product) return product;

  try {
    // Si ya tiene imageSrc válido (desde BD o transformador), devolverlo tal cual
    if (product.imageSrc && product.imageSrc !== null && product.imageSrc !== '') {
      return product;
    }

    // Mapping de IDs a imágenes locales (fallback)
    const LOCAL_IMAGES = {
      '1767': {
        imageSrc: 'https://mercagarage.com/1767-home_default/kit-manguitos-silicona-seat-600.jpg',
        imageLargeSrc: 'https://mercagarage.com/1767-thickbox_default/kit-manguitos-silicona-seat-600.jpg',
      },
      'manguito-llenado-seat-124-1430-ranchera': {
        imageSrc: 'https://mercagarage.com/1768-home_default/manguito-silicona-llenado-seat-124-1430.jpg',
        imageLargeSrc: 'https://mercagarage.com/1768-thickbox_default/manguito-silicona-llenado-seat-124-1430.jpg',
      },
    };

    // Intentar usar imagen local si existe
    if (LOCAL_IMAGES[id]) {
      product.imageSrc = LOCAL_IMAGES[id].imageSrc;
      product.imageLargeSrc = LOCAL_IMAGES[id].imageLargeSrc;
      product.images = {
        sketch: product.imageSrc,
        real: product.imageLargeSrc,
      };
      return product;
    }

    // Estrategia de fallback: intentar coincidir con nombre de archivo
    // Construir un nombre de archivo probable basado en el título
    const normalizeFilename = (str) => {
      return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    };

    const normalized = normalizeFilename(product.title);
    const productType = (product.type || 'manguitos').toLowerCase();
    const imageDir = productType === 'radiador' ? 'radiadores' : 'manguitos';
    
    // Intentar la imagen local primero
    let imageSrc = `/images/${imageDir}/${normalized}.jpg`;
    let imageLargeSrc = imageSrc;

    // Actualizar el producto
    product.imageSrc = imageSrc;
    product.imageLargeSrc = imageLargeSrc;
    product.images = {
      sketch: imageSrc,
      real: imageLargeSrc,
    };

    return product;
  } catch (err) {
    console.warn(`Error enriqueciendo imágenes para ${id}:`, err.message);
    return product;
  }
}

async function getAccessToken() {
  assertEnv();
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OAuth error: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return data.access_token;
}

// ============================================================================
// ENDPOINTS DE PRODUCTOS
// ============================================================================

// ✅ Obtener todos los productos
app.get("/api/products", async (req, res) => {
  try {
    const { search, category, brand, inStock } = req.query;

    let products;
    if (search || category || brand || inStock) {
      products = searchProducts(search, { category, brand, inStock: inStock === 'true' });
    } else {
      products = getAllProducts();
    }

    // ✅ Transformar y enriquecer con un solo map
    const transformedProducts = products
      .map(dbProduct => transformProductToFrontend(dbProduct))
      .filter(Boolean)
      .map((transformedProduct, idx, arr) => {
        // Usar el ID que ya viene en el producto transformado
        return enrichProductWithImages(transformedProduct, transformedProduct.id);
      });

    return res.json(transformedProducts);
  } catch (e) {
    console.error("Error fetching products:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ✅ Obtener producto por ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = getProductById(id);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // ✅ Transformar al formato esperado por el frontend
    let transformedProduct = transformProductToFrontend(product);

    // ✅ Enriquecer con imágenes de Mercagarage
    transformedProduct = enrichProductWithImages(transformedProduct, id);

    return res.json(transformedProduct);
  } catch (e) {
    console.error("Error fetching product:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ✅ Obtener imágenes de producto desde Mercagarage
app.get("/api/products/:id/images", async (req, res) => {
  try {
    const { id } = req.params;
    const product = getProductById(id);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Obtener el título para generar el slug
    let slug = (product.title || 'producto')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Extraer ID numérico si id es un string con caracteres
    const numericId = String(id).match(/\d+/)?.[0] || id;

    // Tipos de imágenes disponibles en Mercagarage
    const imageTypes = {
      small: 'small_default',
      home: 'home_default',
      cart: 'cart_default',
      medium: 'medium_default',
      large: 'large_default',
      thickbox: 'thickbox_default',
    };

    // Generar URLs de imágenes
    const images = {};
    Object.entries(imageTypes).forEach(([key, type]) => {
      images[key] = `https://mercagarage.com/${numericId}-${type}/${slug}.jpg`;
    });

    return res.json({
      id,
      productTitle: product.title,
      images: {
        imageSrc: images.home, // Para compatibilidad con la estructura anterior
        imageLargeSrc: images.thickbox,
        ...images,
      },
    });
  } catch (e) {
    console.error("Error fetching product images:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ✅ Sincronizar productos desde Mercagarage
app.post("/api/products/sync", async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "productIds debe ser un array con al menos un ID" });
    }

    // Fetch desde Mercagarage
    const response = await fetch(
      "https://mercagarage.com/module/motive/front?action=shopperPrices",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productIds),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Mercagarage API error:", response.status, text);
      return res.status(response.status).json({
        error: "Error al sincronizar con Mercagarage",
        details: text,
      });
    }

    const mercagarageProducts = await response.json();

    // Sincronizar con la base de datos
    const result = syncProductsFromMercagarage(mercagarageProducts);

    console.log(`✅ Sincronizados ${result.synced} productos (${result.added} nuevos, ${result.updated} actualizados)`);

    // ✅ Transformar productos al formato frontend
    const allProducts = getAllProducts();
    const transformedProducts = transformProductsToFrontend(allProducts);

    return res.json({
      success: true,
      ...result,
      products: transformedProducts,
    });
  } catch (e) {
    console.error("Error syncing products:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ============================================================================
// ENDPOINTS DE PEDIDOS
// ============================================================================

// ✅ Crear pedido en la base de datos
app.post("/api/orders", async (req, res) => {
  try {
    const { cart, customer, paypalOrderId } = req.body;

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    if (!customer || !customer.email || !customer.fullName) {
      return res.status(400).json({ error: "Datos del cliente incompletos" });
    }

    // Crear pedido en la base de datos
    const orderId = createOrder({
      orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      paypalOrderId,
      customerName: customer.fullName,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingAddress: {
        address1: customer.address1,
        address2: customer.address2,
        city: customer.city,
        province: customer.province,
        postalCode: customer.postalCode,
        country: customer.country,
        notes: customer.notes,
      },
      total: cart.total,
      currency: cart.currency || 'EUR',
      status: 'pending',
      items: cart.items.map(item => ({
        productId: item.id,
        productTitle: item.title,
        quantity: item.qty || 1,
        unitPrice: item.unitPrice,
      })),
    });

    const order = getOrderById(`ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    return res.json({
      success: true,
      orderId,
      order,
    });
  } catch (e) {
    console.error("Error creating order:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ✅ Obtener pedido por ID
app.get("/api/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // ✅ Transformar al formato frontend
    const transformedOrder = transformOrderToFrontend(order);

    return res.json(transformedOrder);
  } catch (e) {
    console.error("Error fetching order:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ✅ Obtener todos los pedidos
app.get("/api/orders", async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const orders = getAllOrders(parseInt(limit));

    // ✅ Transformar al formato frontend
    const transformedOrders = transformOrdersToFrontend(orders);

    return res.json(transformedOrders);
  } catch (e) {
    console.error("Error fetching orders:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ✅ Estadísticas
app.get("/api/stats", async (req, res) => {
  try {
    const stats = getStats();
    return res.json(stats);
  } catch (e) {
    console.error("Error fetching stats:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ============================================================================
// ENDPOINTS DE PAYPAL
// ============================================================================

// ✅ Crea una orden
app.post("/api/paypal/order", async (req, res) => {
  try {
    const { cart } = req.body || {};

    // TODO: aquí debes calcular total en servidor usando tus datos reales (PRODUCTS_DATA)
    // Nunca fíes del total que venga del cliente.
    const total = Number(cart?.total ?? 0).toFixed(2);

    if (!total || Number(total) <= 0) {
      return res.status(400).json({ error: "Total inválido" });
    }

    const accessToken = await getAccessToken();

    const orderBody = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: total
          }
        }
      ]
    };

    const r = await fetch(`${BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderBody)
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json(data);
    }

    return res.json({ id: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ✅ Captura una orden
app.post("/api/paypal/order/:id/capture", async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId } = req.body; // ID de nuestro pedido en la BD

    const accessToken = await getAccessToken();

    const r = await fetch(`${BASE}/v2/checkout/orders/${id}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    // ✅ Marcar pedido como completado en la base de datos
    if (orderId) {
      try {
        completeOrder(orderId, {
          paypalOrderId: id,
          paypalData: data,
          capturedAt: new Date().toISOString(),
        });
        console.log(`✅ Pedido ${orderId} marcado como completado`);
      } catch (dbError) {
        console.error("Error actualizando pedido en BD:", dbError);
        // No fallar el pago si hay error en BD
      }
    }

    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ✅ Obtiene precios de Mercagarage
app.post("/api/mercagarage/prices", async (req, res) => {
  try {
    const { productIds } = req.body || {};

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: "productIds debe ser un array" });
    }

    const response = await fetch(
      "https://mercagarage.com/module/motive/front?action=shopperPrices",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productIds)
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Mercagarage API error:", response.status, text);
      return res.status(response.status).json({
        error: "Error al obtener precios de Mercagarage",
        details: text
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (e) {
    console.error("Error fetching Mercagarage prices:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Payments API running on :${PORT}`));
