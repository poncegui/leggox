import {
  canUseAnalytics,
  loadExternalScript,
} from "../Components/CookieConsent";

/**
 * Inicializa Google Analytics solo si el usuario ha aceptado cookies de análisis.
 * Debe llamarse desde App.jsx o un hook global.
 */
export async function initGoogleAnalytics(measurementId) {
  if (!canUseAnalytics()) {
    console.log("Analytics desactivado: usuario no lo aceptó");
    return;
  }

  try {
    await loadExternalScript({
      id: "google-analytics-script",
      src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
    });

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", measurementId);

    window.gtag = gtag;
    console.log("✓ Google Analytics inicializado");
  } catch (error) {
    console.error("✗ Error cargando Google Analytics:", error);
  }
}

/**
 * Inicializa Meta Pixel / Facebook Pixel solo si el usuario lo aceptó.
 */
export async function initMetaPixel(pixelId) {
  if (!canUseAnalytics()) {
    console.log("Meta Pixel desactivado: usuario no lo aceptó");
    return;
  }

  try {
    window.fbq =
      window.fbq ||
      function () {
        (window.fbq.q = window.fbq.q || []).push(arguments);
      };
    window.fbq.push = window.fbq.push || window.fbq;
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");

    await loadExternalScript({
      src: "https://connect.facebook.net/en_US/fbevents.js",
    });

    console.log("✓ Meta Pixel inicializado");
  } catch (error) {
    console.error("✗ Error cargando Meta Pixel:", error);
  }
}

/**
 * Registra un evento de compra cuando se completa un pedido.
 */
export function trackPurchase(orderData) {
  if (!canUseAnalytics()) return;

  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: orderData.orderId,
      value: orderData.total,
      currency: "EUR",
      items: orderData.items || [],
    });
  }

  if (window.fbq) {
    window.fbq("track", "Purchase", {
      value: orderData.total,
      currency: "EUR",
    });
  }
}

/**
 * Registra un evento cuando el usuario ve un producto.
 */
export function trackViewProduct(product) {
  if (!canUseAnalytics()) return;

  if (window.gtag) {
    window.gtag("event", "view_item", {
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          price: product.price,
          category: product.category,
        },
      ],
    });
  }

  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_ids: [product.id],
      content_name: product.title,
      value: product.price,
      currency: "EUR",
    });
  }
}

/**
 * Registra un evento cuando el usuario agrega algo al carrito.
 */
export function trackAddToCart(product, quantity = 1) {
  if (!canUseAnalytics()) return;

  if (window.gtag) {
    window.gtag("event", "add_to_cart", {
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          price: product.price,
          quantity: quantity,
        },
      ],
    });
  }

  if (window.fbq) {
    window.fbq("track", "AddToCart", {
      content_ids: [product.id],
      content_name: product.title,
      value: product.price * quantity,
      currency: "EUR",
    });
  }
}

/**
 * Registra un evento de inicio de checkout.
 */
export function trackBeginCheckout(cartData) {
  if (!canUseAnalytics()) return;

  if (window.gtag) {
    window.gtag("event", "begin_checkout", {
      items: cartData.items || [],
      value: cartData.total,
      currency: "EUR",
    });
  }

  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: cartData.total,
      currency: "EUR",
    });
  }
}
