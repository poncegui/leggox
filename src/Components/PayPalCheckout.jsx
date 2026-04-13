import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function PayPalCheckout({
  cart,
  customer,
  onBeforePayment,
  onSuccess,
  onError,
}) {
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  const apiBase =
    process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');

  const [sdkReady, setSdkReady] = React.useState(false);
  const [currentOrderId, setCurrentOrderId] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.paypal) {
        if (mounted) setSdkReady(true);
        clearInterval(interval);
        return;
      }
      if (Date.now() - start > 5000) {
        // timeout after 5s
        clearInterval(interval);
      }
    }, 200);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fallback: if SDK didn't load after a timeout, inject script manually
  React.useEffect(() => {
    if (sdkReady) return;
    const timeout = setTimeout(() => {
      // if still not loaded, append script
      if (window.paypal) {
        setSdkReady(true);
        return;
      }

      const client = clientId || '';
      const currency = cart?.currency || 'EUR';
      const src = `https://www.paypal.com/sdk/js?client-id=${client}&currency=${currency}&intent=capture`;
      console.warn('PayPal SDK not detected — injecting script fallback:', src);

      const existing = document.querySelector(
        `script[src^="https://www.paypal.com/sdk/js"]`,
      );
      if (existing) return;

      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => {
        console.info('Fallback PayPal SDK loaded');
        if (window.paypal) setSdkReady(true);
      };
      s.onerror = e => console.error('Fallback PayPal SDK failed to load', e);
      document.head.appendChild(s);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [sdkReady, clientId, cart]);

  const scriptSrc = React.useMemo(() => {
    const client = clientId || '';
    const currency = cart?.currency || 'EUR';
    return `https://www.paypal.com/sdk/js?client-id=${client}&currency=${currency}&intent=capture`;
  }, [clientId, cart]);

  const injectNow = () => {
    if (document.querySelector(`script[src^="https://www.paypal.com/sdk/js"]`))
      return;
    const s = document.createElement('script');
    s.src = scriptSrc;
    s.async = true;
    s.onload = () => {
      console.info('Manual PayPal SDK loaded');
      if (window.paypal) setSdkReady(true);
    };
    s.onerror = e => console.error('Manual PayPal SDK failed to load', e);
    document.head.appendChild(s);
  };

  if (!clientId) {
    return (
      <div
        style={{
          padding: '14px 12px',
          border: '1.5px solid rgba(255,0,64,0.4)',
          borderRadius: 14,
          background:
            'linear-gradient(135deg, rgba(255,0,64,0.08) 0%, rgba(255,0,64,0.04) 100%)',
          fontFamily: 'APERCU, sans-serif',
          fontSize: 13,
          lineHeight: 1.5,
          color: 'rgba(255,255,255,0.85)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 16, minWidth: 20 }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            Configuración incompleta
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Falta <strong>REACT_APP_PAYPAL_CLIENT_ID</strong> en el{' '}
            <code
              style={{
                fontSize: 11,
                opacity: 0.7,
                background: 'rgba(0,0,0,0.3)',
                padding: '2px 4px',
                borderRadius: 4,
              }}
            >
              .env
            </code>{' '}
            del frontend.
          </div>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId,
        currency: cart?.currency || 'EUR',
        intent: 'capture',
      }}
    >
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            marginBottom: 8,
            fontSize: 12,
            color: sdkReady ? '#10B981' : '#EF4444',
          }}
        >
          <div>
            SDK PayPal: {sdkReady ? 'cargado' : 'no cargado (esperando...)'}
          </div>
          {!sdkReady && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
                Intentando SDK URL:
              </div>
              <div
                style={{
                  wordBreak: 'break-all',
                  fontSize: 11,
                  color: '#374151',
                }}
              >
                {scriptSrc}
              </div>
              <button
                type="button"
                onClick={injectNow}
                style={{
                  marginTop: 8,
                  padding: '6px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Reintentar SDK
              </button>
            </div>
          )}
        </div>
      )}
      <PayPalButtons
        style={{ layout: 'vertical', shape: 'pill' }}
        createOrder={async () => {
          try {
            const r = await fetch(`${apiBase}/api/paypal/order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cart }),
            });

            const data = await r.json();
            if (!r.ok) {
              console.error('Create order failed', r.status, data);
              throw new Error(data?.message || data?.error || 'Order error');
            }

            // Crear pedido en nuestra base de datos
            if (onBeforePayment) {
              const orderId = await onBeforePayment(data.id);
              setCurrentOrderId(orderId);
            }

            return data.id;
          } catch (err) {
            console.error('createOrder error', err);
            throw err;
          }
        }}
        onApprove={async data => {
          try {
            const r = await fetch(
              `${apiBase}/api/paypal/order/${data.orderID}/capture`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: currentOrderId }),
              },
            );

            const details = await r.json();
            if (!r.ok) {
              console.error('Capture failed', r.status, details);
              throw new Error(
                details?.message || details?.error || 'Capture error',
              );
            }
            onSuccess?.(details);
          } catch (err) {
            console.error('onApprove error', err);
            onError?.(err);
          }
        }}
        onError={err => onError?.(err)}
      />
    </PayPalScriptProvider>
  );
}
