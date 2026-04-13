# 📚 Ejemplos Prácticos de Integración de Cookies

## 1. ✅ Ejemplo: ProductShowcase.jsx (Rastrear vista de productos)

```jsx
import React, { useEffect } from 'react';
import { trackViewProduct } from '../utils/analytics';

export default function ProductShowcase({ product }) {
  useEffect(() => {
    // Rastrear cuando el usuario ve un producto
    if (product) {
      trackViewProduct({
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
      });
    }
  }, [product?.id]); // Solo cuando cambia el producto

  const handleAddToCart = () => {
    // ... tu lógica actual ...

    // Rastrear adición al carrito
    trackAddToCart(product, quantity);
  };

  return <div>{/* Tu contenido actual */}</div>;
}
```

---

## 2. ✅ Ejemplo: ShoppingCart.jsx (PayPal con carga condicional)

```jsx
import React, { useState, useEffect } from 'react';
import { loadPayPalSdk, renderPayPalButtons } from '../utils/paymentScripts';
import { trackBeginCheckout, trackPurchase } from '../utils/analytics';

export default function ShoppingCart() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [paypalReady, setPaypalReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar PayPal solo cuando el usuario lo selecciona
  useEffect(() => {
    async function initPayPal() {
      if (selectedPaymentMethod !== 'paypal') return;

      try {
        setLoading(true);
        // Rastrear que comenzó checkout
        trackBeginCheckout({
          items: cart,
          total: getTotalPrice(),
        });

        // Cargar SDK de PayPal (solo primer uso, después usa caché)
        await loadPayPalSdk('AQfI8C_yDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        setPaypalReady(true);

        // Renderizar botones
        setTimeout(() => {
          renderPayPalButtons('paypal-button-container', {
            orderData: {
              cartItems: cart,
              total: getTotalPrice(),
            },
            onSuccess: async result => {
              console.log('✓ Pago completado en PayPal:', result);

              // Rastrear compra completada
              trackPurchase({
                orderId: result.id,
                total: getTotalPrice(),
                items: cart,
              });

              // Guardar orden en tu BD
              await saveOrder(result);
            },
            onError: error => {
              console.error('✗ Error en PayPal:', error);
              alert('Hubo un error con el pago. Intenta nuevamente.');
            },
          });
        }, 100);
      } catch (error) {
        console.error('Error cargando PayPal:', error);
        alert('No se pudo cargar PayPal. Intenta con otro método.');
      } finally {
        setLoading(false);
      }
    }

    initPayPal();
  }, [selectedPaymentMethod, cart]);

  return (
    <div>
      {/* Botones de método de pago */}
      <div>
        <label>
          <input
            type="radio"
            name="payment"
            value="card"
            checked={selectedPaymentMethod === 'card'}
            onChange={e => setSelectedPaymentMethod(e.target.value)}
          />
          💳 Tarjeta / Bizum / Santander
        </label>

        <label>
          <input
            type="radio"
            name="payment"
            value="paypal"
            checked={selectedPaymentMethod === 'paypal'}
            onChange={e => setSelectedPaymentMethod(e.target.value)}
          />
          🅿️ PayPal
        </label>
      </div>

      {/* Mostrar PayPal solo cuando está listo */}
      {selectedPaymentMethod === 'paypal' && (
        <div style={{ marginTop: 16 }}>
          {loading && <p>⏳ Cargando PayPal...</p>}
          {paypalReady && !loading && <div id="paypal-button-container" />}
        </div>
      )}

      {/* Resto de tu formulario de pago */}
    </div>
  );
}
```

---

## 3. ✅ Ejemplo: ShoppingCart.jsx (Aplazame con carga condicional)

```jsx
import React, { useState, useEffect } from 'react';
import { loadAplazameWidget, initAplazame } from '../utils/paymentScripts';

export default function ShoppingCart() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [aplazameReady, setAplazameReady] = useState(false);

  // Cargar Aplazame solo cuando el usuario lo selecciona
  useEffect(() => {
    async function initAplazameWidget() {
      if (selectedPaymentMethod !== 'aplazame') {
        setAplazameReady(false);
        return;
      }

      try {
        console.log('⏳ Cargando widget de Aplazame...');

        // Cargar el widget
        await loadAplazameWidget();

        // Inicializar (si necesita config adicional)
        initAplazame();

        setAplazameReady(true);
        console.log('✓ Aplazame widget cargado');
      } catch (error) {
        console.error('✗ Error cargando Aplazame:', error);
      }
    }

    initAplazameWidget();
  }, [selectedPaymentMethod]);

  return (
    <div>
      {/* Opción de pago Aplazame */}
      <label>
        <input
          type="radio"
          name="payment"
          value="aplazame"
          checked={selectedPaymentMethod === 'aplazame'}
          onChange={e => setSelectedPaymentMethod(e.target.value)}
        />
        📅 Aplazame - Comprar ahora, pagar después
      </label>

      {/* Widget de Aplazame */}
      {selectedPaymentMethod === 'aplazame' && (
        <div
          id="aplazame-widget-container"
          style={{
            marginTop: 16,
            padding: 16,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
          }}
        >
          {aplazameReady ? (
            <p>Widget de Aplazame cargado ✓</p>
          ) : (
            <p>⏳ Cargando opciones de financiación...</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 4. ✅ Ejemplo: BuscadorPiezas.jsx (Rastrear búsquedas)

```jsx
import React, { useState } from 'react';
import { canUseAnalytics } from '../Components/CookieConsent';

export default function BuscadorPiezas() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = term => {
    setSearchTerm(term);

    // Rastrear búsqueda (si analytics está permitido)
    if (canUseAnalytics() && window.gtag) {
      window.gtag('event', 'search', {
        search_term: term,
      });
    }

    // ... tu lógica de búsqueda actual ...
  };

  return (
    <input
      type="text"
      placeholder="Buscar piezas..."
      value={searchTerm}
      onChange={e => handleSearch(e.target.value)}
    />
  );
}
```

---

## 5. ✅ Ejemplo: Footer.jsx (Enlace a Política de Cookies)

```jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.content}>
        <div style={styles.section}>
          <h4>Legal</h4>
          <ul>
            <li>
              <a href="/politica-privacidad">Política de Privacidad</a>
            </li>
            <li>
              <a href="/politica-cookies">Política de Cookies</a>
            </li>
            <li>
              <a href="/terminos-condiciones">Términos y Condiciones</a>
            </li>
          </ul>
        </div>

        <div style={styles.section}>
          <h4>Preferencias</h4>
          <button
            onClick={() => {
              // Abre el modal de cookies nuevamente
              const event = new CustomEvent('open-cookie-settings');
              window.dispatchEvent(event);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            🍪 Gestionar cookies
          </button>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { paddingTop: 40, borderTop: '1px solid #e5e7eb' },
  content: { display: 'flex', gap: 40 },
  section: { flex: 1 },
};
```

---

## 6. ✅ Ejemplo: App.jsx (Completo con Analytics)

```jsx
import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import LandingView from './Views/LandingView';
import { CartProvider } from './context/CartContext';
import ShoppingCart from './Components/ShoppingCart';
import CookieConsent from './Components/CookieConsent';
import { initGoogleAnalytics } from './utils/analytics';

const ACTIVE_LANDING = LandingView;

function App() {
  useEffect(() => {
    // Inicializar analytics con tu Google Analytics ID
    // Reemplaza G-XXXXXXXXXX con tu ID real
    initGoogleAnalytics('G-XXXXXXXXXX');
  }, []);

  return (
    <CartProvider>
      <CookieConsent />
      <Routes>
        <Route path="/" element={<ACTIVE_LANDING />} />
      </Routes>
      <ShoppingCart />
    </CartProvider>
  );
}

export default App;
```

---

## 7. ✅ Ejemplo: Verificar Consentimiento Antes de Cargar Script

```jsx
import React, { useEffect } from 'react';
import { canUseAnalytics, canUseMarketing } from '../Components/CookieConsent';

export default function HotjarIntegration() {
  useEffect(() => {
    // Solo cargar Hotjar si el usuario aceptó analytics
    if (!canUseAnalytics()) {
      console.log('Hotjar desactivado: usuario no aceptó analytics');
      return;
    }

    // Cargar Hotjar
    const hj = (window.hj =
      window.hj ||
      function () {
        (hj.q = hj.q || []).push(arguments);
      });

    hj('identify', {
      userId: 'user-123', // Tu user ID
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://static.hotjar.com/c/hotjar-XXXXX.js';
    document.head.appendChild(script);
  }, []);

  return null; // Este componente no renderiza nada
}
```

---

## 8. ✅ Ejemplo: Componente con Listener de Cambios

```jsx
import React, { useEffect, useState } from 'react';
import { getConsent } from '../Components/CookieConsent';

export default function CookieStatus() {
  const [consent, setConsent] = useState(getConsent());

  useEffect(() => {
    const handleConsentChange = event => {
      setConsent(event.detail);
      console.log('🍪 Preferencias actualizadas:', event.detail);
    };

    window.addEventListener('cookie-consent-changed', handleConsentChange);

    return () => {
      window.removeEventListener('cookie-consent-changed', handleConsentChange);
    };
  }, []);

  return (
    <div style={{ padding: 16, background: '#f3f4f6', borderRadius: 8 }}>
      <h4>Estado de Cookies:</h4>
      <ul>
        <li>Necesarias: {consent.necessary ? '✓' : '✗'}</li>
        <li>Analytics: {consent.analytics ? '✓' : '✗'}</li>
        <li>Personalización: {consent.personalization ? '✓' : '✗'}</li>
        <li>Publicidad: {consent.marketing ? '✓' : '✗'}</li>
      </ul>
    </div>
  );
}
```

---

## 🔗 Integración con Rutas

Si tienes una ruta para la política de cookies:

```jsx
// En App.js o tu Router

import PolicyCookies from './pages/PolicyCookies';

<Route path="/politica-cookies" element={<PolicyCookies />} />;
```

**Contenido de `pages/PolicyCookies.jsx`:**

```jsx
import React from 'react';

export default function PolicyCookies() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      {/* Aquí renderiza el contenido de POLITICA_COOKIES.md */}
      <h1>🍪 Política de Cookies</h1>
      {/* ... resto del contenido ... */}
    </div>
  );
}
```

---

## 📝 Checklist de Implementación

- [ ] ` CookieConsent` está en `App.jsx`
- [ ] PayPal se carga solo en checkout (no globalmente)
- [ ] Aplazame se carga solo cuando se selecciona
- [ ] Google Analytics se inicializa condicionalmente
- [ ] Los eventos de analytics se llaman en lugares correctos
- [ ] El footer tiene enlace a política de cookies
- [ ] Testeaste en modo incógnito (sin localStorage)
- [ ] Verificaste que los botones del banner funcionan
- [ ] Configuraste tus IDs reales (PayPal, GA, etc.)

---

**¡Ahora tu tienda de piezas de coche es completamente compliant con RGPD! 🚀**
