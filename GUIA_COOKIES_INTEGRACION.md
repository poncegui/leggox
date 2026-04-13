# 🍪 Guía de Integración del Sistema de Cookies - Leggox

## 📋 Archivos Creados

```
src/
  ├── Components/
  │   └── CookieConsent.jsx          ← Banner y modal de cookies
  └── utils/
      ├── paymentScripts.js          ← Carga condicional de PayPal/Aplazame
      └── analytics.js               ← Carga condicional de analytics
```

---

## ✅ Integración Rápida

El sistema ya está integrado en `App.js`. Solo necesitas:

### 1. Verificar que CookieConsent está en App.js

```jsx
import CookieConsent from './Components/CookieConsent';

function App() {
  return (
    <CartProvider>
      <CookieConsent /> ← ¡Ya está aquí!
      <Routes>...</Routes>
      <ShoppingCart />
    </CartProvider>
  );
}
```

### 2. (Opcional) Descomentar Analytics en App.js

Si tienes Google Analytics, descomenta en `App.js`:

```jsx
import { initGoogleAnalytics } from './utils/analytics';

useEffect(() => {
  // Reemplaza G-XXXXXXXXXX con tu ID real
  initGoogleAnalytics('G-XXXXXXXXXX');
}, []);
```

---

## 🎯 Funcionalidades del Banner

### Banner Inicial (Primera Visita)

- ✓ Muestra al usuario una explicación clara
- ✓ Botones: Aceptar, Rechazar, Configurar cookies

### Modo Preferencias

- ✓ Cookies necesarias: siempre activas (no se pueden desactivar)
- ✓ Cookies de análisis: opcional
- ✓ Cookies de personalización: opcional
- ✓ Cookies publicitarias: opcional
- ✓ Información sobre pagos (PayPal, Aplazame, Bizum, Santander)

### Botón Flotante

- ✓ Aparece después de decidir (esquina inferior derecha)
- ✓ Permite reabrir configuración en cualquier momento
- ✓ Desaparece si el usuario aclara los estilos

### Persistencia

- ✓ Guarda decisión en `localStorage` (clave: `carparts_cookie_consent_v2`)
- ✓ Dispara evento `cookie-consent-changed` cuando cambia

---

## 📦 PayPal - Carga Condicional

### En tu `ShoppingCart.jsx` (o donde muestres PayPal):

```jsx
import { loadPayPalSdk, renderPayPalButtons } from '../utils/paymentScripts';

export default function ShoppingCart() {
  const [paypalReady, setPaypalReady] = useState(false);

  useEffect(() => {
    async function loadPayPal() {
      if (selectedMethod === 'paypal') {
        // Carga el SDK solo cuando es necesario
        await loadPayPalSdk('TU_PAYPAL_CLIENT_ID_AQUI');
        setPaypalReady(true);
      }
    }

    loadPayPal();
  }, [selectedMethod]);

  return (
    <div>
      {selectedMethod === 'paypal' && paypalReady && (
        <div id="paypal-button-container">
          {/* Los botones se renderizarán aquí */}
        </div>
      )}
    </div>
  );
}
```

### Luego, cuando PayPal esté cargado:

```jsx
import { renderPayPalButtons } from '../utils/paymentScripts';

useEffect(() => {
  if (paypalReady) {
    renderPayPalButtons('paypal-button-container', {
      orderData: { cartItems: cart, total: totalPrice },
      onSuccess: result => {
        console.log('✓ Pago completado:', result);
        // Guardar pedido, limpiar carrito, etc.
      },
      onError: error => {
        console.error('✗ Error en PayPal:', error);
      },
    });
  }
}, [paypalReady]);
```

---

## 💰 Aplazame - Carga Condicional

### En tu `ShoppingCart.jsx`:

```jsx
import { loadAplazameWidget, initAplazame } from '../utils/paymentScripts';

export default function ShoppingCart() {
  const [aplazameReady, setAplazameReady] = useState(false);

  useEffect(() => {
    async function loadAplazame() {
      if (selectedMethod === 'aplazame') {
        // Carga el widget solo cuando es necesario
        await loadAplazameWidget();
        initAplazame();
        setAplazameReady(true);
      }
    }

    loadAplazame();
  }, [selectedMethod]);

  return (
    <div>
      {selectedMethod === 'aplazame' && aplazameReady && (
        <div id="aplazame-widget-container">
          {/* Aplazame se renderizará aquí */}
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Google Analytics - Carga Condicional

### Ya está preparado en `App.js`:

```jsx
import { initGoogleAnalytics } from './utils/analytics';

useEffect(() => {
  // Solo se carga si el usuario aceptó cookies de análisis
  initGoogleAnalytics('G-TU_MEASUREMENT_ID');
}, []);
```

### Rastrear eventos:

```jsx
import {
  trackPurchase,
  trackViewProduct,
  trackAddToCart,
} from '../utils/analytics';

// Cuando se ve un producto
useEffect(() => {
  trackViewProduct({
    id: product.id,
    title: product.title,
    price: product.price,
    category: product.category,
  });
}, [product]);

// Cuando se agrega al carrito
const handleAddToCart = product => {
  trackAddToCart(product, quantity);
  // ... resto del código
};

// Cuando se completa una compra
const handleOrderComplete = order => {
  trackPurchase({
    orderId: order.id,
    total: order.total,
    items: order.items,
  });
  // ... resto del código
};
```

---

## 🔐 Funciones Helper Disponibles

### CookieConsent (`src/Components/CookieConsent.jsx`)

```jsx
import {
  getConsent, // Obtiene decisión del usuario
  saveConsent, // Guarda decisión manualmente
  canUseAnalytics, // ¿Puede cargar analytics?
  canUsePersonalization, // ¿Puede cargar personalización?
  canUseMarketing, // ¿Puede cargar marketing?
  canLoadCheckoutPaymentScripts, // ¿Es checkout?
  loadExternalScript, // Cargar script externo
  revokeOptionalCookies, // Eliminar cookies opcionales
} from '../Components/CookieConsent';

// Uso:
if (canUseAnalytics()) {
  console.log('Analytics está permitido');
}

const consent = getConsent();
console.log(consent);
// Output:
// {
//   necessary: true,
//   analytics: true/false,
//   personalization: true/false,
//   marketing: true/false,
//   decided: true,
//   updatedAt: "2026-04-13T..."
// }
```

### Analytics (`src/utils/analytics.js`)

```jsx
import {
  initGoogleAnalytics, // Inicializar Google Analytics
  initMetaPixel, // Inicializar Meta Pixel
  trackPurchase, // Rastrear compra
  trackViewProduct, // Rastrear vista de producto
  trackAddToCart, // Rastrear adición al carrito
  trackBeginCheckout, // Rastrear inicio de checkout
} from '../utils/analytics';
```

### Payment Scripts (`src/utils/paymentScripts.js`)

```jsx
import {
  loadPayPalSdk, // Cargar SDK de PayPal
  loadAplazameWidget, // Cargar widget de Aplazame
  renderPayPalButtons, // Renderizar botones de PayPal
  initAplazame, // Inicializar Aplazame
} from '../utils/paymentScripts';
```

---

## 🎨 Personalización

### Cambiar colores del banner

En `CookieConsent.jsx`, modifica los estilos:

```jsx
// Botón principal (actualmente rojo)
const buttonPrimary = {
  background: "#E01E37",  // Cambia aquí el color
  // ...
};

// Toggle/interruptor (actualmente rojo)
style={{
  background: checked ? "#E01E37" : "#d1d5db",  // Cambia aquí
}}
```

### Cambiar textos del banner

En la función `CookieModal`, busca y edita los `<p>` tags.

### Cambiar idioma

Localiza los textos hardcodeados en `CookieConsent.jsx` y reemplázalos.

---

## 📱 Responsive

El banner es completamente responsive:

- Funciona en móvil (fullscreen en pantallas pequeñas)
- Tablet (centrado con max-width)
- Desktop (modal grande centrada)

---

## 🔄 Escuchar cambios de consentimiento

En cualquier componente puedes reaccionar a cambios:

```jsx
useEffect(() => {
  const handleConsentChange = event => {
    const newConsent = event.detail;
    console.log('Consentimiento actualizado:', newConsent);

    if (newConsent.analytics) {
      // Cargar analytics
    } else {
      // Descargar analytics
    }
  };

  window.addEventListener('cookie-consent-changed', handleConsentChange);

  return () => {
    window.removeEventListener('cookie-consent-changed', handleConsentChange);
  };
}, []);
```

---

## ⚖️ Cumplimiento Legal

### ✅ Lo que proporciona este sistema:

- ✓ Banner claro en primera visita
- ✓ Consentimiento explícito (opt-in para analytics/marketing)
- ✓ Opción de rechazar sin fricciones
- ✓ Configuración granular (por tipo de cookie)
- ✓ Información sobre terceros (PayPal, Aplazame, etc.)
- ✓ Persistencia de decisiones
- ✓ Carga condicional de scripts
- ✓ RGPD compliant (consentimiento informado y libre)

### 📄 Política de Cookies

Se incluye: `POLITICA_COOKIES.md` (lista y lista para usar en tu web)

---

## 🚀 Próximos Pasos

1. **Configura tus IDs reales:**
   - PayPal Client ID
   - Google Analytics ID (si usas)
   - Meta Pixel ID (si usas)

2. **Enlaza la política de cookies:**
   - Footer: añade link a `/politica-cookies` o `/cookies`
   - Banner: opcionalmente enlaza a la política completa

3. **Prueba en diferentes navegadores:**
   - Chrome, Firefox, Safari, Edge

4. **Prueba en incógnito:**
   - Verifica que el banner aparece (sin localStorage)

5. **Implementa backend:**
   - Guarda preferencias de usuario en BD (opcional)
   - Para usuarios registrados, guarda su consentimiento

---

## 🐛 Troubleshooting

### El banner no aparece

- Verifica que `CookieConsent` está en `App.js`
- Revisa la consola (F12) por errores de imports
- Borra localStorage: `localStorage.removeItem('carparts_cookie_consent_v2')`

### PayPal no carga

- Verifica que pasaste el `clientId` correcto
- Abre consola (F12) y busca errores de red
- Asegúrate de que estás en checkout (no en landing)

### Los eventos no se registran

- Verifica que `canUseAnalytics()` devuelve `true`
- En consola: `getConsent()` debe mostrar `analytics: true`
- Revisa en Google Analytics real que los eventos llegan

---

## 📞 Soporte

Si tienes dudas sobre:

- **Integración técnica:** revisar ejemplos en este archivo
- **Textos/idioma:** editar en `CookieConsent.jsx`
- **Diseño:** modificar `styles` al final de `CookieConsent.jsx`
- **Conformidad legal:** consultar `POLITICA_COOKIES.md`

---

**¡Listo para usar! 🚀 Tu sistema de cookies está completo y cumple con RGPD.**
