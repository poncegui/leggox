import {
  canLoadCheckoutPaymentScripts,
  loadExternalScript,
} from "../Components/CookieConsent";

/**
 * Carga el SDK de PayPal solo cuando el usuario selecciona ese método de pago.
 * Se ejecuta en checkout cuando es necesario.
 */
export async function loadPayPalSdk(clientId) {
  if (!canLoadCheckoutPaymentScripts()) {
    console.warn("No se puede cargar PayPal: usuario no en checkout");
    return;
  }

  try {
    await loadExternalScript({
      id: "paypal-sdk",
      src: `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&intent=capture`,
    });
    console.log("✓ PayPal SDK cargado correctamente");
  } catch (error) {
    console.error("✗ Error cargando PayPal SDK:", error);
  }
}

/**
 * Carga el widget de Aplazame solo cuando el usuario selecciona ese método.
 * Se ejecuta en checkout cuando es necesario.
 */
export async function loadAplazameWidget() {
  if (!canLoadCheckoutPaymentScripts()) {
    console.warn("No se puede cargar Aplazame: usuario no en checkout");
    return;
  }

  try {
    await loadExternalScript({
      id: "aplazame-widget",
      src: "https://cdn.aplazame.com/widgets/aplazame.js",
    });
    console.log("✓ Aplazame Widget cargado correctamente");
  } catch (error) {
    console.error("✗ Error cargando Aplazame Widget:", error);
  }
}

/**
 * Ejemplo: renderizar los botones de PayPal después de cargado el SDK.
 * Usa esto en tu componente de pago.
 */
export function renderPayPalButtons(containerId, options = {}) {
  if (!window.paypal) {
    console.error("PayPal SDK no está cargado");
    return;
  }

  const container = document.getElementById(containerId);
  if (!container || container.children.length > 0) return;

  window.paypal
    .Buttons({
      createOrder: async (data, actions) => {
        try {
          const response = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(options.orderData || {}),
          });
          const order = await response.json();
          return order.orderId;
        } catch (error) {
          console.error("Error creando orden PayPal:", error);
        }
      },
      onApprove: async (data, actions) => {
        try {
          const response = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderID }),
          });
          const result = await response.json();
          if (options.onSuccess) options.onSuccess(result);
        } catch (error) {
          console.error("Error capturando orden PayPal:", error);
          if (options.onError) options.onError(error);
        }
      },
      onError: (err) => {
        console.error("Error en PayPal:", err);
        if (options.onError) options.onError(err);
      },
    })
    .render(`#${containerId}`);
}

/**
 * Inicializa Aplazame con opciones personalizadas.
 * Llama a esto después de que sea cargado el widget.
 */
export function initAplazame(options = {}) {
  if (!window.Aplazame) {
    console.error("Aplazame no está cargado");
    return;
  }

  try {
    // Aplazame se inicializa automáticamente en el DOM
    // Pero aquí puedes agregar configuración adicional si lo requiere
    console.log("✓ Aplazame inicializado");
  } catch (error) {
    console.error("✗ Error inicializando Aplazame:", error);
  }
}
