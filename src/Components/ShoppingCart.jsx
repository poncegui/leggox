import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PayPalCheckout from './PayPalCheckout';
import seatTristeImg from '../Assets/seat-triste.png';
import { resolveImageUrl } from '../utils/imageUtils';

// Función para limpiar el título de menciones de vehículos
function cleanProductTitle(title) {
  if (!title) return title;
  let cleaned = title;
  const seatPatterns = [
    /\bSEAT\s+\d{3,4}(?:\s*[\/,y]\s*\d{3,4})*/gi,
    /\bSEAT\s+(?:Panda|PANDA|Marbella|MARBELLA|Fura|FURA|Sport|SPORT)\b/gi,
    /\bSEAT\s+\d{3,4}\s+Sport\b/gi,
    /\bSEAT\s+FL(?:\/\d{3,4})?\b/gi,
  ];
  seatPatterns.forEach(pattern => { cleaned = cleaned.replace(pattern, ''); });
  const modelNames = [
    /\bBocanegra\b/gi, /\bBOCANEGRA\b/g, /\bMirafiori\b/gi, /\bSupermirafiori\b/gi,
    /\bSport\s+(?=-)/gi, /\bSPORT\s+(?=-)/g, /\bSport\b(?!\s+(-|Doble))/gi,
    /\bSPORT\b(?!\s+(-|Doble))/g, /\bFL\b/g,
  ];
  modelNames.forEach(pattern => { cleaned = cleaned.replace(pattern, ''); });
  const numberPatterns = [
    /\b\d{3,4}\s*[\/,]\s*\d{3,4}(?:\s*[\/,]\s*\d{3,4})*/g,
    /\b\d{3,4}\s+y\s+\d{3,4}\b/g,
    /\s+(?:Sport|SPORT|Especial|ESPECIAL|Normal|NORMAL)\s*$/gi,
  ];
  numberPatterns.forEach(pattern => { cleaned = cleaned.replace(pattern, ''); });
  const commonPhrases = [
    /\s+para\s+SEAT\s+.*$/gi, /\s+en\s+SEAT\s+.*$/gi,
    /\s+compatible\s+con\s+SEAT\s+.*$/gi, /\s+válido\s+para\s+SEAT\s+.*$/gi,
  ];
  commonPhrases.forEach(pattern => { cleaned = cleaned.replace(pattern, ''); });
  cleaned = cleaned
    .replace(/\s*[,\/y]\s*$/gi, '').replace(/^\s*[,\/y]\s*/gi, '')
    .replace(/\s+/g, ' ').replace(/\s*-\s*$/, '').replace(/\(\s*\)/g, '').trim();
  if (cleaned.length < 10) return title;
  return cleaned;
}

const COLORS = {
  red: '#E01E37',
  darkRed: '#DC143C',
  black: '#000000',
  gray: '#1A1A1A',
};

export default function ShoppingCart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotal,
    getItemCount,
    isCartOpen,
    setIsCartOpen,
    clearCart,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [paymentMethod, setPaymentMethod] = React.useState('card'); // 'card' | 'transfer' | 'paypal' | 'aplazame'
  const [showPaymentMethods, setShowPaymentMethods] = React.useState(false);
  const [shippingMethod, setShippingMethod] = React.useState('pickup'); // 'pickup' | 'delivery'
  const [showShippingMethods, setShowShippingMethods] = React.useState(false);
  const [showShippingForm, setShowShippingForm] = React.useState(false);
  const [formStep, setFormStep] = React.useState('billing'); // 'billing' | 'shipping_check' | 'shipping_form'
  const [sameBillingShipping, setSameBillingShipping] = React.useState(true);

  // Estado del formulario de facturación
  const [billingData, setBillingData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Spain',
  });

  // Estado del formulario de envío (si es diferente a facturación)
  const [shippingData, setShippingData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Spain',
  });

  // Controlar scroll del body cuando métodos están abiertos
  React.useEffect(() => {
    if (showPaymentMethods || showShippingMethods || showShippingForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPaymentMethods, showShippingMethods, showShippingForm]);

  // Auto-completar formulario si el usuario está autenticado
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setBillingData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || 'Spain',
      });
      setShippingData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || 'Spain',
      });
    }
  }, [isAuthenticated, user]);

  const handleBillingChange = e => {
    const { name, value } = e.target;
    setBillingData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShippingChange = e => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cuando se abre el drawer, resetear el paso al de facturación
  React.useEffect(() => {
    if (showShippingForm) {
      setFormStep('billing');
    }
  }, [showShippingForm]);

  if (!isCartOpen) return null;

  // Calcular costo de envío basado en método seleccionado
  let shippingCost = 0;
  if (shippingMethod === 'delivery') {
    // Envío a domicilio: gratis si el total es >= 100€, sino 6.50€
    shippingCost = getTotal() >= 100 ? 0 : 6.5;
  }
  // Si es 'pickup' (recogida en tienda), shippingCost = 0

  const finalTotal = getTotal() + shippingCost;

  const handleCheckout = () => {
    alert(
      'Redirigiendo a proceso de pago...\n\nEsta funcionalidad se implementará próximamente.',
    );
  };

  const handlePayPalSuccess = details => {
    console.log('Pago completado:', details);
    alert('¡Pago completado con éxito!\n\nGracias por tu compra.');
    clearCart();
    setIsCartOpen(false);
  };

  const handlePayPalError = error => {
    console.error('Error en pago PayPal:', error);
    alert('Error al procesar el pago.\n\nPor favor, inténtalo de nuevo.');
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 650,
          backgroundColor: '#FFFFFF',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #E9ECEF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.black,
                margin: 0,
              }}
            >
              🛒 Carrito
            </h2>
            <p
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 12,
                color: '#6C757D',
                margin: '4px 0 0 0',
                letterSpacing: '0.5px',
              }}
            >
              {getItemCount()} {getItemCount() === 1 ? 'ARTÍCULO' : 'ARTÍCULOS'}
            </p>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid #E9ECEF',
              background: '#FFF',
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#F8F9FA';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#FFF';
            }}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '1rem',
          }}
        >
          {cartItems.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: '1.5rem',
              }}
            >
              <img
                src={seatTristeImg}
                alt="Carrito vacío"
                style={{
                  width: 180,
                  height: 'auto',
                  opacity: 0.7,
                  filter: 'grayscale(30%)',
                }}
              />
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 18,
                    fontWeight: 700,
                    color: COLORS.black,
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  Tu carrito está vacío
                </p>
                <p
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 13,
                    color: '#6C757D',
                    margin: 0,
                  }}
                >
                  Explora nuestros productos y agrega algo especial
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={() => removeFromCart(item.id)}
                  onUpdateQuantity={qty => updateQuantity(item.id, qty)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div
            style={{
              borderTop: '1px solid #E9ECEF',
              padding: '1.5rem',
              backgroundColor: '#F8F9FA',
              overflowY: 'auto',
              maxHeight: '50vh',
            }}
          >
            {/* Desglose de totales */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              {/* Subtotal */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    color: '#6C757D',
                  }}
                >
                  Subtotal
                </span>
                <span
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.black,
                  }}
                >
                  {(getTotal() / 1.21).toFixed(2)} €
                </span>
              </div>

              {/* IVA */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    color: '#6C757D',
                  }}
                >
                  IVA (21%)
                </span>
                <span
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.black,
                  }}
                >
                  {(getTotal() - getTotal() / 1.21).toFixed(2)} €
                </span>
              </div>

              {/* Envío */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    color: '#6C757D',
                  }}
                >
                  Envío
                </span>
                <span
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: shippingCost === 0 ? '#10B981' : COLORS.black,
                  }}
                >
                  {shippingCost === 0
                    ? 'GRATIS'
                    : `${shippingCost.toFixed(2)} €`}
                </span>
              </div>

              {/* Línea separadora */}
              <div
                style={{
                  height: '1px',
                  backgroundColor: '#E9ECEF',
                  margin: '0.5rem 0',
                }}
              />

              {/* Total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: COLORS.gray,
                  }}
                >
                  TOTAL
                </span>
                <span
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 28,
                    fontWeight: 700,
                    color: COLORS.black,
                  }}
                >
                  {finalTotal.toFixed(2)} €
                </span>
              </div>
            </div>

            {/* Título de métodos de envío - Colapsable */}
            <button
              onClick={() => setShowShippingMethods(!showShippingMethods)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#078D92',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                marginTop: '0.5rem',
                marginBottom: '0.75rem',
                transition: 'all 0.2s ease',
                fontFamily: 'APERCU, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: '#FFFFFF',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#066268';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(7, 141, 146, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#078D92';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>
                {showShippingMethods ? '✕ CERRAR' : '✓ VER'} MÉTODOS DE ENVÍO
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: 'transform 0.2s ease',
                  transform: showShippingMethods
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Lista de métodos de envío - Solo se muestra si está expandido */}
            {showShippingMethods && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {/* Opción 1: Recogida en tienda */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    border: `2px solid ${shippingMethod === 'pickup' ? '#078D92' : '#E9ECEF'}`,
                    borderRadius: 8,
                    backgroundColor:
                      shippingMethod === 'pickup' ? '#F0FDFB' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="shipping_method"
                    value="pickup"
                    checked={shippingMethod === 'pickup'}
                    onChange={e => setShippingMethod(e.target.value)}
                    style={{
                      width: 18,
                      height: 18,
                      marginTop: 2,
                      cursor: 'pointer',
                      accentColor: '#078D92',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 14,
                        fontWeight: 700,
                        color: COLORS.black,
                        marginBottom: 4,
                      }}
                    >
                      🏪 RECOGIDA EN TIENDA
                    </div>
                    <div
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 13,
                        color: '#078D92',
                        fontWeight: 600,
                      }}
                    >
                      ✓ GRATIS
                    </div>
                  </div>
                </label>

                {/* Opción 2: Envío a domicilio */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    border: `2px solid ${shippingMethod === 'delivery' ? '#078D92' : '#E9ECEF'}`,
                    borderRadius: 8,
                    backgroundColor:
                      shippingMethod === 'delivery' ? '#F0FDFB' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="shipping_method"
                    value="delivery"
                    checked={shippingMethod === 'delivery'}
                    onChange={e => setShippingMethod(e.target.value)}
                    style={{
                      width: 18,
                      height: 18,
                      marginTop: 2,
                      cursor: 'pointer',
                      accentColor: '#078D92',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 14,
                        fontWeight: 700,
                        color: COLORS.black,
                        marginBottom: 4,
                      }}
                    >
                      🚚 ENVÍO A DOMICILIO
                    </div>
                    <div
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 13,
                        color: '#666',
                      }}
                    >
                      {getTotal() >= 100 ? (
                        <span style={{ color: '#10B981', fontWeight: 600 }}>
                          ✓ GRATIS en pedidos superiores a 100€
                        </span>
                      ) : (
                        <span>6,50€ (Gratis desde 100€)</span>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Título de métodos de pago - Colapsable */}
            <button
              onClick={() => setShowPaymentMethods(!showPaymentMethods)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: COLORS.red,
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                marginTop: '0.5rem',
                marginBottom: '0.75rem',
                transition: 'all 0.2s ease',
                fontFamily: 'APERCU, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: '#FFFFFF',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = COLORS.darkRed;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(224, 30, 55, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = COLORS.red;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>
                {showPaymentMethods ? '✕ CERRAR' : '✓ VER'} MÉTODOS DE PAGO
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: 'transform 0.2s ease',
                  transform: showPaymentMethods
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Lista de métodos de pago - Solo se muestra si está expandido */}
            {showPaymentMethods && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {/* Opción 1: TPV (Tarjeta/Bizum) */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    border: `2px solid ${paymentMethod === 'card' ? COLORS.red : '#E9ECEF'}`,
                    borderRadius: 8,
                    backgroundColor:
                      paymentMethod === 'card' ? '#FFF5F5' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={e => setPaymentMethod(e.target.value)}
                    style={{
                      width: 18,
                      height: 18,
                      marginTop: 2,
                      cursor: 'pointer',
                      accentColor: COLORS.red,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 14,
                        fontWeight: 700,
                        color: COLORS.black,
                        marginBottom: 4,
                      }}
                    >
                      💳 TPV (PAGO TARJETA o BIZUM)
                    </div>
                    {paymentMethod === 'card' && (
                      <button
                        onClick={handleCheckout}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: COLORS.red,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 6,
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginTop: '0.5rem',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor =
                            COLORS.darkRed;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = COLORS.red;
                        }}
                      >
                        PROCEDER AL PAGO
                      </button>
                    )}
                  </div>
                </label>

                {/* Opción 2: Transferencia bancaria */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    border: `2px solid ${paymentMethod === 'transfer' ? COLORS.red : '#E9ECEF'}`,
                    borderRadius: 8,
                    backgroundColor:
                      paymentMethod === 'transfer' ? '#FFF5F5' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={e => setPaymentMethod(e.target.value)}
                    style={{
                      width: 18,
                      height: 18,
                      marginTop: 2,
                      cursor: 'pointer',
                      accentColor: COLORS.red,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 14,
                        fontWeight: 700,
                        color: COLORS.black,
                        marginBottom: 4,
                      }}
                    >
                      🏦 Pago por transferencia bancaria
                    </div>
                    {paymentMethod === 'transfer' && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.75rem',
                          backgroundColor: '#F8F9FA',
                          borderRadius: 6,
                          fontSize: 12,
                          lineHeight: 1.6,
                          color: '#6C757D',
                        }}
                      >
                        <p
                          style={{
                            margin: '0 0 0.5rem 0',
                            fontFamily: 'APERCU, sans-serif',
                          }}
                        >
                          Por favor, transfiera el importe de la factura a
                          nuestra cuenta bancaria.
                        </p>
                        <div
                          style={{
                            fontFamily: 'ui-monospace, monospace',
                            fontSize: 11,
                          }}
                        >
                          <strong>BANCO SANTANDER</strong>
                          <br />
                          ES59 0049 4405 5224 1004 7553
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* Opción 3: PayPal */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    border: `2px solid ${paymentMethod === 'paypal' ? '#0070BA' : '#E9ECEF'}`,
                    borderRadius: 8,
                    backgroundColor:
                      paymentMethod === 'paypal' ? '#F0F7FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={e => setPaymentMethod(e.target.value)}
                    style={{
                      width: 18,
                      height: 18,
                      marginTop: 2,
                      cursor: 'pointer',
                      accentColor: '#0070BA',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 14,
                        fontWeight: 700,
                        color: COLORS.black,
                        marginBottom: 4,
                      }}
                    >
                      <svg
                        width="80"
                        height="20"
                        viewBox="0 0 101 32"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ verticalAlign: 'middle', marginRight: 8 }}
                      >
                        <path
                          fill="#003087"
                          d="M 12.237 2.8 L 4.437 2.8 C 3.937 2.8 3.437 3.2 3.337 3.7 L 0.237 23.7 C 0.137 24.1 0.437 24.4 0.837 24.4 L 4.537 24.4 C 5.037 24.4 5.537 24 5.637 23.5 L 6.437 18.1 C 6.537 17.6 6.937 17.2 7.537 17.2 L 10.037 17.2 C 15.137 17.2 18.137 14.7 18.937 9.8 C 19.237 7.7 18.937 6 17.937 4.8 C 16.837 3.5 14.837 2.8 12.237 2.8 Z M 13.137 10.1 C 12.737 12.9 10.537 12.9 8.537 12.9 L 7.337 12.9 L 8.137 7.7 C 8.137 7.4 8.437 7.2 8.737 7.2 L 9.237 7.2 C 10.637 7.2 11.937 7.2 12.637 8 C 13.137 8.4 13.337 9.1 13.137 10.1 Z"
                        ></path>
                        <path
                          fill="#003087"
                          d="M 35.437 10 L 31.737 10 C 31.437 10 31.137 10.2 31.137 10.5 L 30.937 11.5 L 30.637 11.1 C 29.837 9.9 28.037 9.5 26.237 9.5 C 22.137 9.5 18.637 12.6 17.937 17 C 17.537 19.2 18.037 21.3 19.337 22.7 C 20.437 24 22.137 24.6 24.037 24.6 C 27.337 24.6 29.237 22.5 29.237 22.5 L 29.037 23.5 C 28.937 23.9 29.237 24.3 29.637 24.3 L 33.037 24.3 C 33.537 24.3 34.037 23.9 34.137 23.4 L 36.137 10.6 C 36.237 10.4 35.837 10 35.437 10 Z M 30.337 17.2 C 29.937 19.3 28.337 20.8 26.137 20.8 C 25.037 20.8 24.237 20.5 23.637 19.8 C 23.037 19.1 22.837 18.2 23.037 17.2 C 23.337 15.1 25.137 13.6 27.237 13.6 C 28.337 13.6 29.137 14 29.737 14.6 C 30.237 15.3 30.437 16.2 30.337 17.2 Z"
                        ></path>
                        <path
                          fill="#009cde"
                          d="M 55.337 10 L 51.637 10 C 51.237 10 50.937 10.2 50.737 10.5 L 45.537 18.1 L 43.337 10.8 C 43.237 10.3 42.737 10 42.337 10 L 38.637 10 C 38.237 10 37.837 10.4 38.037 10.9 L 42.137 23 L 38.237 28.4 C 37.937 28.8 38.237 29.4 38.737 29.4 L 42.437 29.4 C 42.837 29.4 43.137 29.2 43.337 28.9 L 55.837 10.9 C 56.137 10.6 55.837 10 55.337 10 Z"
                        ></path>
                        <path
                          fill="#003087"
                          d="M 67.737 2.8 L 59.937 2.8 C 59.437 2.8 58.937 3.2 58.837 3.7 L 55.737 23.6 C 55.637 24 55.937 24.3 56.337 24.3 L 60.337 24.3 C 60.737 24.3 61.037 24 61.037 23.7 L 61.937 18.1 C 62.037 17.6 62.437 17.2 63.037 17.2 L 65.537 17.2 C 70.637 17.2 73.637 14.7 74.437 9.8 C 74.737 7.7 74.437 6 73.437 4.8 C 72.237 3.5 70.337 2.8 67.737 2.8 Z M 68.637 10.1 C 68.237 12.9 66.037 12.9 64.037 12.9 L 62.837 12.9 L 63.637 7.7 C 63.637 7.4 63.937 7.2 64.237 7.2 L 64.737 7.2 C 66.137 7.2 67.437 7.2 68.137 8 C 68.637 8.4 68.737 9.1 68.637 10.1 Z"
                        ></path>
                        <path
                          fill="#009cde"
                          d="M 90.937 10 L 87.237 10 C 86.937 10 86.637 10.2 86.637 10.5 L 86.437 11.5 L 86.137 11.1 C 85.337 9.9 83.537 9.5 81.737 9.5 C 77.637 9.5 74.137 12.6 73.437 17 C 73.037 19.2 73.537 21.3 74.837 22.7 C 75.937 24 77.637 24.6 79.537 24.6 C 82.837 24.6 84.737 22.5 84.737 22.5 L 84.537 23.5 C 84.437 23.9 84.737 24.3 85.137 24.3 L 88.537 24.3 C 89.037 24.3 89.537 23.9 89.637 23.4 L 91.637 10.6 C 91.637 10.4 91.337 10 90.937 10 Z M 85.737 17.2 C 85.337 19.3 83.737 20.8 81.537 20.8 C 80.437 20.8 79.637 20.5 79.037 19.8 C 78.437 19.1 78.237 18.2 78.437 17.2 C 78.737 15.1 80.537 13.6 82.637 13.6 C 83.737 13.6 84.537 14 85.137 14.6 C 85.737 15.3 85.937 16.2 85.737 17.2 Z"
                        ></path>
                        <path
                          fill="#009cde"
                          d="M 95.337 3.3 L 92.137 23.6 C 92.037 24 92.337 24.3 92.737 24.3 L 95.937 24.3 C 96.437 24.3 96.937 23.9 97.037 23.4 L 100.237 3.5 C 100.337 3.1 100.037 2.8 99.637 2.8 L 96.037 2.8 C 95.637 2.8 95.437 3 95.337 3.3 Z"
                        ></path>
                      </svg>
                    </div>
                    {paymentMethod === 'paypal' && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <PayPalCheckout
                          cart={{
                            items: cartItems.map(item => ({
                              id: item.id,
                              name: item.title,
                              quantity: item.quantity,
                              price: item.price,
                            })),
                            total: finalTotal,
                            currency: 'EUR',
                          }}
                          customer={null}
                          onBeforePayment={async paypalOrderId => {
                            console.log(
                              'Preparando pago PayPal:',
                              paypalOrderId,
                            );
                            return paypalOrderId;
                          }}
                          onSuccess={handlePayPalSuccess}
                          onError={handlePayPalError}
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* Opción 4: Aplazame (Pago a plazos) */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    border: `2px solid ${paymentMethod === 'aplazame' ? '#334BFF' : '#E9ECEF'}`,
                    borderRadius: 8,
                    backgroundColor:
                      paymentMethod === 'aplazame' ? '#F5F6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="aplazame"
                    checked={paymentMethod === 'aplazame'}
                    onChange={e => setPaymentMethod(e.target.value)}
                    style={{
                      width: 18,
                      height: 18,
                      marginTop: 2,
                      cursor: 'pointer',
                      accentColor: '#334BFF',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 14,
                        fontWeight: 700,
                        color: COLORS.black,
                        marginBottom: 4,
                      }}
                    >
                      💳 Pago a Plazos (Aplazame)
                    </div>
                    {paymentMethod === 'aplazame' && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem',
                          backgroundColor: '#FFFFFF',
                          borderRadius: 6,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: `
                          <div widget-wrapper="" data-v-app="">
                            <div>
                              <div widget-v4="" class="apz-widget-v4-wrapper apz-position__horizontal">
                                <div class="apz-widget_border" style="border-color: rgb(51, 75, 255);">
                                  <div class="apz-widget_title">Calcula tu financiación</div>
                                  <div class="apz-widget_sub-title">Instantánea y sin documentos</div>
                                  <div class="apz-widget_content">
                                    <div class="apz-widget_price-wrapper">
                                      <div class="apz-widget_resume-label apz-visible-cart">Pagarás</div>
                                      <div class="apz-widget_resume-value apz-visible-cart">${(finalTotal / 12).toFixed(2)}&nbsp;€ /mes</div>
                                      <div class="apz-widget_price-label apz-hidden-cart">Precio del producto</div>
                                      <div class="apz-widget_price-value apz-hidden-cart">${finalTotal.toFixed(0)}&nbsp;€</div>
                                    </div>
                                    <div class="apz-widget_actions-wrapper" style="border-color: rgb(51, 75, 255);">
                                      <div class="apz-widget_actions">
                                        <div class="apz-widget_actions-bg" style="background: rgba(51, 75, 255, 0.1);">
                                          <button class="apz-widget_actions-minus" style="background-color: rgb(51, 75, 255);">
                                            <svg viewBox="0 0 30 30" fill="none">
                                              <path fill-rule="evenodd" clip-rule="evenodd" d="M28.2 13.8V16.2H1.80002V13.8H28.2Z" fill="white"></path>
                                            </svg>
                                          </button>
                                          <span class="apz-widget_actions-value">12</span>
                                          <button class="apz-widget_actions-more" style="background-color: rgb(51, 75, 255);">
                                            <svg viewBox="0 0 30 30" fill="none">
                                              <path fill-rule="evenodd" clip-rule="evenodd" d="M16.2 13.8V1.8H13.8V13.8H1.8V16.2H13.8V28.2H16.2V16.2H28.2V13.8H16.2Z" fill="white"></path>
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                      <div class="apz-widget_actions_resume-wrapper">
                                        <div class="resume-wrapper_amount">
                                          <div class="apz-widget_resume-label apz-hidden-cart">Pagarás</div>
                                          <div class="apz-widget_resume-value apz-hidden-cart">${(finalTotal / 12).toFixed(2)}&nbsp;€ /mes</div>
                                        </div>
                                        <div class="apz-visible-cart">
                                          <div class="apz-widget_TAE-value">Total Intereses <span class="apz-no-break">${(finalTotal * 0.11).toFixed(2)}&nbsp;€</span> <span class="apz-point-decorator">·</span></div>
                                          <div class="apz-widget_TAE-percent"><span>TAE 23,85%</span></div>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="apz-widget_total-wrapper">
                                      <div class="flex-column">
                                        <div class="apz-widget_total-label">Total a pagar</div>
                                        <div class="apz-widget_total-value">${(finalTotal * 1.11).toFixed(2)}&nbsp;€</div>
                                      </div>
                                      <div class="apz-hidden-cart">
                                        <div class="apz-widget_TAE-value">Total Intereses <span class="apz-no-break">${(finalTotal * 0.11).toFixed(2)}&nbsp;€</span> <span class="apz-point-decorator">·</span></div>
                                        <div class="apz-widget_TAE-percent"><span>TAE 23,85%</span></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="apz-widget_logo">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="79pt" height="16pt" viewBox="0 0 79 16">
                                      <g>
                                        <path d="M 19.007812 3.429688 C 20.21875 3.429688 21.179688 3.855469 21.886719 4.707031 C 22.597656 5.554688 22.953125 6.625 22.953125 7.914062 C 22.953125 9.199219 22.597656 10.269531 21.886719 11.121094 C 21.179688 11.972656 20.21875 12.398438 19.007812 12.398438 C 18.441406 12.398438 17.9375 12.289062 17.492188 12.078125 C 17.050781 11.863281 16.710938 11.601562 16.472656 11.285156 L 16.472656 15.605469 L 14.148438 15.605469 L 14.148438 3.625 L 16.292969 3.625 L 16.292969 4.671875 C 16.859375 3.84375 17.765625 3.429688 19.007812 3.429688 Z M 31.609375 3.429688 C 32.851562 3.429688 33.757812 3.84375 34.324219 4.671875 L 34.324219 3.625 L 36.46875 3.625 L 36.46875 12.199219 L 34.324219 12.199219 L 34.324219 11.152344 C 33.757812 11.980469 32.851562 12.398438 31.609375 12.398438 C 30.398438 12.398438 29.4375 11.972656 28.726562 11.121094 C 28.019531 10.269531 27.664062 9.199219 27.664062 7.914062 C 27.664062 6.625 28.019531 5.554688 28.726562 4.703125 C 29.4375 3.855469 30.398438 3.429688 31.609375 3.429688 Z M 49.675781 3.429688 C 50.917969 3.429688 51.824219 3.84375 52.390625 4.671875 L 52.390625 3.625 L 54.535156 3.625 L 54.535156 12.199219 L 52.390625 12.199219 L 52.390625 11.152344 C 51.824219 11.980469 50.917969 12.398438 49.675781 12.398438 C 48.464844 12.398438 47.503906 11.972656 46.796875 11.121094 C 46.085938 10.269531 45.730469 9.199219 45.730469 7.914062 C 45.730469 6.625 46.085938 5.554688 46.792969 4.703125 C 47.503906 3.855469 48.464844 3.429688 49.675781 3.429688 Z M 74.746094 3.429688 C 76 3.429688 77.023438 3.851562 77.8125 4.699219 C 78.605469 5.542969 79 6.609375 79 7.898438 L 78.96875 8.585938 L 72.75 8.585938 C 72.824219 9.171875 73.042969 9.621094 73.402344 9.933594 C 73.761719 10.246094 74.238281 10.402344 74.828125 10.402344 C 75.199219 10.402344 75.535156 10.320312 75.832031 10.164062 C 76.132812 10.003906 76.347656 9.773438 76.480469 9.46875 L 78.820312 9.46875 C 78.570312 10.339844 78.074219 11.046875 77.339844 11.585938 C 76.601562 12.128906 75.742188 12.398438 74.761719 12.398438 C 73.496094 12.398438 72.460938 11.976562 71.652344 11.136719 C 70.84375 10.296875 70.441406 9.21875 70.441406 7.898438 C 70.441406 6.621094 70.84375 5.554688 71.652344 4.707031 C 72.460938 3.855469 73.492188 3.429688 74.746094 3.429688 Z M 9.808594 0.292969 L 13 12.199219 L 10.457031 12.199219 L 9.753906 9.457031 L 5.054688 9.457031 L 4.351562 12.199219 L 1.808594 12.199219 L 2.542969 9.457031 L 0 9.457031 L 0.539062 7.449219 L 9.238281 7.449219 L 7.402344 0.292969 Z M 26.46875 0.292969 L 26.46875 12.199219 L 24.148438 12.199219 L 24.148438 0.292969 Z M 66.21875 3.429688 C 67.222656 3.429688 67.992188 3.738281 68.527344 4.363281 C 69.0625 4.984375 69.328125 5.8125 69.328125 6.847656 L 69.328125 12.199219 L 67.003906 12.199219 L 67.003906 7.109375 C 67.003906 5.988281 66.546875 5.425781 65.628906 5.425781 C 65.085938 5.425781 64.671875 5.59375 64.386719 5.925781 C 64.101562 6.257812 63.960938 6.722656 63.960938 7.324219 L 63.960938 12.199219 L 61.636719 12.199219 L 61.636719 7.109375 C 61.636719 5.988281 61.179688 5.425781 60.261719 5.425781 C 59.726562 5.425781 59.316406 5.589844 59.027344 5.917969 C 58.738281 6.242188 58.59375 6.695312 58.59375 7.273438 L 58.59375 12.199219 L 56.269531 12.199219 L 56.269531 3.625 L 58.414062 3.625 L 58.414062 4.671875 C 58.859375 3.84375 59.683594 3.429688 60.882812 3.429688 C 62.019531 3.429688 62.847656 3.832031 63.371094 4.640625 C 64.101562 3.832031 65.050781 3.429688 66.21875 3.429688 Z M 45.160156 3.625 L 45.160156 5.527344 L 40.84375 10.1875 L 45.210938 10.1875 L 45.210938 12.199219 L 37.960938 12.199219 L 37.960938 10.289062 L 42.246094 5.636719 L 38.023438 5.636719 L 38.023438 3.625 Z M 18.515625 5.472656 C 17.882812 5.472656 17.375 5.703125 16.988281 6.160156 C 16.597656 6.621094 16.40625 7.203125 16.40625 7.914062 C 16.40625 8.621094 16.597656 9.207031 16.988281 9.664062 C 17.375 10.121094 17.882812 10.351562 18.515625 10.351562 C 19.148438 10.351562 19.660156 10.121094 20.046875 9.664062 C 20.433594 9.207031 20.628906 8.621094 20.628906 7.914062 C 20.628906 7.203125 20.433594 6.621094 20.046875 6.160156 C 19.660156 5.703125 19.148438 5.472656 18.515625 5.472656 Z M 32.097656 5.472656 C 31.464844 5.472656 30.957031 5.703125 30.570312 6.160156 C 30.183594 6.621094 29.988281 7.203125 29.988281 7.914062 C 29.988281 8.621094 30.183594 9.207031 30.570312 9.664062 C 30.957031 10.121094 31.464844 10.351562 32.097656 10.351562 C 32.730469 10.351562 33.242188 10.121094 33.628906 9.664062 C 34.015625 9.207031 34.210938 8.621094 34.210938 7.914062 C 34.210938 7.203125 34.015625 6.621094 33.628906 6.160156 C 33.242188 5.703125 32.730469 5.472656 32.097656 5.472656 Z M 50.164062 5.472656 C 49.53125 5.472656 49.023438 5.703125 48.636719 6.160156 C 48.25 6.621094 48.054688 7.203125 48.054688 7.914062 C 48.054688 8.621094 48.25 9.207031 48.636719 9.664062 C 49.023438 10.121094 49.53125 10.351562 50.164062 10.351562 C 50.796875 10.351562 51.308594 10.121094 51.695312 9.664062 C 52.082031 9.207031 52.277344 8.621094 52.277344 7.914062 C 52.277344 7.203125 52.082031 6.621094 51.695312 6.160156 C 51.308594 5.703125 50.796875 5.472656 50.164062 5.472656 Z M 74.730469 5.292969 C 74.203125 5.292969 73.773438 5.441406 73.4375 5.726562 C 73.097656 6.015625 72.878906 6.414062 72.78125 6.914062 L 76.675781 6.914062 C 76.589844 6.425781 76.375 6.03125 76.039062 5.738281 C 75.699219 5.441406 75.261719 5.292969 74.730469 5.292969 Z M 7.402344 0.292969 L 5.800781 6.542969 L 3.324219 6.542969 L 5 0.292969 Z M 7.402344 0.292969" style="stroke: none; fill-rule: evenodd; fill: rgb(51, 75, 255); fill-opacity: 1;"></path>
                                      </g>
                                    </svg>
                                  </div>
                                  <div class="apz-widget_legal-advice">
                                    <div class="apz-collapsed apz-widget_legal-advice_text">
                                      <span style="font-size: 7px;">Ejemplo de financiación con APLAZAME para una cesta de ${finalTotal.toFixed(0)}&nbsp;€ a 12 meses. TIN: 21,58% TAE: 23,85%. Importe total adeudado: ${(finalTotal * 1.11).toFixed(2)}&nbsp;€. Sujeto a la aprobación por parte de APLAZAME (Wizink Bank S.A.U.).</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <style>
                                :root{--primary-color:#0053ff;--secondary-color:#333a3e;--tertiary-color:#EAF8BF}*{box-sizing:border-box}:host{font-size:16px;line-height:1;font-family:RM Neue,sans-serif,Arial}input[type=number],input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{font-weight:700;border-radius:0;margin:0;-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}.apz-widget_actions-minus,.apz-widget_actions-more,input[type=number]{border-radius:0;-moz-appearance:textfield}.apz-widget_actions-minus:focus,.apz-widget_actions-more:focus,input[type=number]:focus{border-radius:0;box-shadow:none}.apz-no-break{white-space:nowrap}.apz-point-decorator{margin-right:.25rem}.edit-instalments-wrapper{width:60%;margin-bottom:4px;margin-top:4px;display:flex;flex-direction:row;align-items:center}.edit-instalments-wrapper label{margin-left:8px;margin-right:4px}.edit-instalments-wrapper span{font-size:12px;word-break:keep-all;white-space:nowrap;margin-left:.25em}.apz-widget-v4-wrapper{max-width:400px;min-width:170px;margin:0 auto;color:#00042b;text-align:center;letter-spacing:0;font-weight:400;font-family:RM Neue,sans-serif,Arial}.apz-widget-v4-wrapper.apz-layout__align-left{margin-left:0}.apz-widget-v4-wrapper.apz-layout__align-right{margin-right:0}.apz-widget_border{background:#fff;border-radius:0;border:3px solid rgb(51,75,255);padding-top:1px;padding-bottom:1px}.apz-widget_border.no-border{border:none}.apz-widget_badge{display:inline-block;position:absolute;padding:2.5px;border-radius:50%;background:#2bcab9;right:-5px;margin-top:2px}.apz-widget_banner{display:inline-block;font-weight:700;padding:4px 5px;font-size:10px;line-height:11px;margin-bottom:-4px;margin-top:16px;background-color:#d4b4f4}.apz-widget_title{margin-top:4px;font-size:15px;font-weight:700;line-height:25px}.apz-widget_sub-title{color:#595959;font-weight:400;padding:0 8px;font-size:10px;line-height:11px;margin-bottom:10px;margin-top:-3px}.apz-widget_content{margin:auto}.apz-widget_price-label{color:#00092a;font-size:10px;font-weight:300;line-height:11px}.apz-widget_price-value{color:#00042b;font-size:15px;font-weight:700;line-height:25px}.apz-widget_actions-wrapper{width:160px;margin:auto auto 4px;padding:0 7px;border-bottom:1px solid rgb(51,75,255)}.apz-widget_editable-input{border:2px solid rgb(51,75,255);outline:none;max-width:100%;height:100%;text-align:center;appearance:none;-webkit-appearance:none;-moz-appearance:textfield;margin:0}.apz-widget_actions{margin:auto auto 4px}.apz-widget_actions-bg{display:flex;align-items:center;justify-content:center;padding:2.5px;border-radius:0}.apz-widget_actions-bg.is-edit-instalments{max-width:112px;gap:8px;margin-left:auto;margin-right:auto}.apz-widget_actions-value{position:relative;min-width:21px;height:25px;margin:auto;color:#00092a;font-size:15px;font-weight:700;line-height:25px;text-align:center}.apz-widget_actions-input{position:relative;font-size:15px;min-width:21px;max-width:50px;text-align:center;height:25px;margin:auto}.apz-widget_actions-minus,.apz-widget_actions-more{display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;-webkit-appearance:none;-moz-appearance:none;appearance:none;-webkit-user-select:none;user-select:none;margin:auto;background:#334bff;border-radius:0;height:25px;width:25px;color:#fff;font-size:15px}.apz-widget_actions-minus:disabled,.apz-widget_actions-more:disabled{opacity:.5;cursor:auto}.apz-widget_actions-minus svg,.apz-widget_actions-more svg{min-width:13px}.apz-widget_actions-minus{margin-left:0}.apz-widget_actions-more{margin-right:0}.apz-widget_actions_resume-wrapper{display:flex;flex-direction:column;margin-bottom:4px}.apz-widget_resume-value,.apz-widget_resume-label{margin:auto;color:#00092a;font-size:10px;font-weight:300;line-height:11px}.apz-widget_resume-label{margin-left:0}.apz-widget_resume-value{margin-right:0;color:#00042b;font-size:15px;font-weight:400;line-height:25px}.apz-widget_total-wrapper{min-height:42px;margin-bottom:12px}.apz-widget_total-label,.apz-widget_total-value{display:inline-block;color:#00042b;font-size:15px;line-height:25px}.apz-widget_total-value{min-width:60px;margin-left:4px;font-weight:700}.apz-widget_TAE-value,.apz-widget_TAE-percent{display:inline-block;color:#00092a;font-size:10px;font-weight:300;line-height:9px}.apz-widget_TAE_campaign-container{display:block;background-color:#2bcab9;transform:skew(-10deg);margin-left:.5rem}.apz-widget_TAE_campaign{display:inline-block;padding:2px 6px;font-size:9px;font-weight:700;line-height:11px;height:15px;color:#fff;text-align:center;white-space:nowrap;vertical-align:baseline;transform:skew(10deg)}.apz-widget_logo{margin:12px auto}.apz-widget_legal-advice{position:relative;margin:11px 5%;color:#56728e;font-family:Gotham-Book,Arial,RM Neue,sans-serif,Arial;font-size:8.5px;font-weight:300;line-height:10px;text-align:center}.apz-widget_legal-advice_text{overflow:hidden;text-overflow:ellipsis}.apz-widget_legal-advice_text.apz-collapsed{height:20px}.apz-widget_legal-advice_text.apz-collapsed .apz-widget_link__collapse{display:none}.apz-widget_legal-advice_text.apz-collapsed .apz-widget_link__expand{display:inline;position:absolute;bottom:0;right:0}.apz-widget_legal-advice .apz-widget_link{cursor:pointer;background-color:#fff;padding-left:4px}.apz-widget_legal-advice .apz-widget_link__expand{display:none}.apz-widget_link{cursor:pointer;color:#334bff;background:none;border:none;font-size:inherit}.apz-widget-v4-wrapper.apz-position__horizontal{max-width:400px}.apz-widget-v4-wrapper.apz-position__horizontal .edit-instalments-wrapper{width:58%}.apz-widget-v4-wrapper.apz-position__horizontal .apz-widget_content{display:flex;flex-direction:row}.apz-widget-v4-wrapper.apz-position__horizontal .apz-widget_content>div{flex:1 1 0;margin:auto;width:30%}.apz-widget-v4-wrapper.apz-position__horizontal .apz-widget_content .max-amount-desired-container{width:70%}.apz-widget-v4-wrapper.apz-position__horizontal .apz-widget_content .apz-widget_total-wrapper{margin-top:0;min-width:53px}.apz-widget-v4-wrapper.apz-position__horizontal .apz-widget_actions-wrapper{min-width:135px;border-bottom:0;border-left:1px solid rgb(51,75,255);border-right:1px solid rgb(51,75,255)}.apz-widget-v4-wrapper.apz-position__horizontal .apz-widget_total-label{display:inline-block;color:#00092a;font-size:10px;font-weight:300;line-height:11px}.apz-widget-v4-wrapper.apz-position__horizontal .apz-widget_TAE-value{display:block}.apz-widget-v4-wrapper.apz-position__horizontal .apz-widget_resume-value{font-size:13px;line-height:16px}.apz-widget-v4-wrapper.apz-position__horizontal .apz-point-decorator{display:none}.apz-widget-v4-wrapper.apz-position__horizontal .resume-wrapper_downpayment{margin-bottom:2px;margin-top:2px}.apz-visible-cart{display:none}.apz-widget-v4-wrapper.apz-layout__cart .apz-widget_border{border:none}.apz-widget-v4-wrapper.apz-layout__cart .apz-widget_price-wrapper{display:none}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal{min-width:368px}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .edit-instalments-wrapper{width:215px}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-visible-cart.resume-wrapper_downpayment{display:flex}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-visible-cart.resume-wrapper_downpayment .apz-widget_resume-label{margin-right:4px;margin-left:auto}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-visible-cart.resume-wrapper_downpayment .apz-widget_resume-value{margin-left:4px;margin-right:auto}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_title,.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_sub-title{padding-left:4px}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-visible-cart{display:block}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-hidden-cart,.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_price-wrapper{display:none}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_actions-wrapper{border:none;min-width:172px}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_sub-title{display:block}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_content>div{flex-grow:1;flex-shrink:1;flex-basis:auto;margin:unset;max-width:96px}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_content .apz-widget_total-wrapper{min-width:74px;text-align:left;margin-left:4px;margin-top:0}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_content .apz-widget_total-wrapper .flex-column{display:flex;flex-direction:column}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_content .apz-widget_price-wrapper{min-width:96px;display:block;text-align:right;margin-right:4px;margin-top:0}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_resume-label,.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_price-label,.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_total-label{font-size:9px;font-weight:300;line-height:13px}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_TAE-value{display:inline-block;margin-right:.25rem}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_resume-value{font-size:15px;line-height:21px;margin:0;font-weight:700;white-space:nowrap}.apz-widget-v4-wrapper.apz-layout__cart.apz-position__horizontal .apz-widget_total-value{font-size:15px;line-height:21px;margin:0}@media (hover: none) and (pointer: coarse){.apz-widget_actions-bg{padding:0}}@-moz-document url-prefix(){.apz-widget_TAE_campaign{height:15px;line-height:13px}}.resume-wrapper_downpayment,.resume-wrapper_amount{display:flex}.resume-wrapper_downpayment{margin-bottom:-3px}.apz-widget_max-instalments{color:#00092a;font-size:10px;font-weight:400;line-height:11px;padding-bottom:5px;padding-top:3px}.fade-in-animation{opacity:0;animation:fadeIn .2s ease-in both}.apz-layout__max-amount-desired.apz-position__horizontal .apz-widget_max_desired_input{margin-bottom:6px}.apz-layout__max-amount-desired.apz-position__horizontal .apz-widget_content .apz-widget_total-wrapper{margin-top:auto}label.apz-widget_actions-input .apz-widget_badge{right:6px;margin-top:5px;z-index:2}.inline-error-downpayment,.inline-error{color:#d60900;font-size:10px;font-style:normal;font-weight:400;line-height:11px;margin-bottom:4px}.inline-error-downpayment{margin-top:4px;margin-bottom:4px}.error input[type=number]{border:2px solid #D60900}input[type=number]:disabled{background-color:#dcdcdc;cursor:not-allowed;opacity:.5}
                              </style>
                            </div>
                          </div>
                        `,
                        }}
                      />
                    )}
                  </div>
                </label>
              </div>
            )}

            <p
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 12,
                color: '#6C757D',
                textAlign: 'center',
                marginTop: '0.75rem',
                marginBottom: 0,
              }}
            >
              {getTotal() < 100 && 'Envío gratis en pedidos superiores a 100€'}
              {getTotal() >= 100 && '✓ Envío gratis aplicado'}
            </p>

            {/* Botón Datos de Envío */}
            <button
              onClick={() => setShowShippingForm(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#6C63FF',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                marginTop: '1rem',
                transition: 'all 0.2s ease',
                fontFamily: 'APERCU, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: '#FFFFFF',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#5A52D5';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(108, 99, 255, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#6C63FF';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              📋 DATOS DE ENVÍO
            </button>
          </div>
        )}
      </div>

      {/* Drawer Datos de Envío */}
      {showShippingForm && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9997,
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={() => setShowShippingForm(false)}
          />

          {/* Datos Drawer */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: 500,
              backgroundColor: '#FFFFFF',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
              zIndex: 9998,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.3s ease-out',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid #E9ECEF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                backgroundColor: '#FFFFFF',
                zIndex: 10,
              }}
            >
              <h2
                style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 20,
                  fontWeight: 700,
                  color: COLORS.black,
                  margin: 0,
                }}
              >
                📋 {formStep === 'billing' ? 'Facturación' : 'Envío'}
                {formStep === 'shipping_check' ? ' → ' : ''}
                {formStep === 'shipping_check' &&
                  `${shippingMethod === 'pickup' ? '🏪' : '🚚'}`}
              </h2>
              <button
                onClick={() => setShowShippingForm(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '1px solid #E9ECEF',
                  background: '#FFF',
                  cursor: 'pointer',
                  fontSize: 18,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = '#F8F9FA')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = '#FFF')
                }
              >
                ✕
              </button>
            </div>

            {/* Contenido del Formulario */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
              {formStep === 'billing' ? (
                // PASO 1: Datos de Facturación
                <>
                  <p
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 13,
                      color: '#6C757D',
                      margin: '0 0 1rem 0',
                    }}
                  >
                    📍 Datos de facturación para tu pedido
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      {/* Nombre */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 12,
                            fontWeight: 700,
                            color: COLORS.gray,
                            marginBottom: '0.5rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          NOMBRE *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={billingData.firstName}
                          onChange={handleBillingChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #E9ECEF',
                            borderRadius: 6,
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                          placeholder="Juan"
                        />
                      </div>

                      {/* Apellido */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 12,
                            fontWeight: 700,
                            color: COLORS.gray,
                            marginBottom: '0.5rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          APELLIDO *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={billingData.lastName}
                          onChange={handleBillingChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #E9ECEF',
                            borderRadius: 6,
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                          placeholder="Pérez"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 12,
                          fontWeight: 700,
                          color: COLORS.gray,
                          marginBottom: '0.5rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        EMAIL *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={billingData.email}
                        onChange={handleBillingChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E9ECEF',
                          borderRadius: 6,
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 14,
                          boxSizing: 'border-box',
                        }}
                        placeholder="juan@example.com"
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 12,
                          fontWeight: 700,
                          color: COLORS.gray,
                          marginBottom: '0.5rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        TELÉFONO *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={billingData.phone}
                        onChange={handleBillingChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E9ECEF',
                          borderRadius: 6,
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 14,
                          boxSizing: 'border-box',
                        }}
                        placeholder="+34 912 345 678"
                      />
                    </div>

                    {/* Dirección */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 12,
                          fontWeight: 700,
                          color: COLORS.gray,
                          marginBottom: '0.5rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        DIRECCIÓN *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={billingData.address}
                        onChange={handleBillingChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E9ECEF',
                          borderRadius: 6,
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 14,
                          boxSizing: 'border-box',
                        }}
                        placeholder="Calle Principal, 123"
                      />
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      {/* Ciudad */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 12,
                            fontWeight: 700,
                            color: COLORS.gray,
                            marginBottom: '0.5rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          CIUDAD *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={billingData.city}
                          onChange={handleBillingChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #E9ECEF',
                            borderRadius: 6,
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                          placeholder="Madrid"
                        />
                      </div>

                      {/* Código Postal */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 12,
                            fontWeight: 700,
                            color: COLORS.gray,
                            marginBottom: '0.5rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          CP *
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={billingData.postalCode}
                          onChange={handleBillingChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #E9ECEF',
                            borderRadius: 6,
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                          placeholder="28001"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : formStep === 'shipping_check' ? (
                // PASO 2: Verificar si datos de envío son iguales
                <>
                  <p
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 13,
                      color: '#6C757D',
                      margin: '0 0 1.5rem 0',
                    }}
                  >
                    {shippingMethod === 'pickup'
                      ? '🏪 Recogida en tienda'
                      : '🚚 Envío a domicilio'}
                  </p>

                  {/* Resumen de datos de facturación */}
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#F8F9FA',
                      borderRadius: 8,
                      marginBottom: '1.5rem',
                      border: '1px solid #E9ECEF',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 12,
                        fontWeight: 700,
                        color: COLORS.gray,
                        marginTop: 0,
                        marginBottom: '0.75rem',
                        letterSpacing: '0.5px',
                      }}
                    >
                      📋 DATOS DE FACTURACIÓN
                    </p>
                    <p
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 13,
                        color: '#1A1A1A',
                        margin: '0.5rem 0',
                      }}
                    >
                      {billingData.firstName} {billingData.lastName}
                    </p>
                    <p
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 13,
                        color: '#1A1A1A',
                        margin: '0.5rem 0',
                      }}
                    >
                      {billingData.address}
                    </p>
                    <p
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 13,
                        color: '#1A1A1A',
                        margin: '0.5rem 0',
                      }}
                    >
                      {billingData.postalCode} {billingData.city}
                    </p>
                  </div>

                  {/* Checkbox: Mismos datos o diferentes */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      border:
                        '2px solid ' +
                        (sameBillingShipping ? COLORS.red : '#E9ECEF'),
                      borderRadius: 8,
                      backgroundColor: sameBillingShipping
                        ? 'rgba(224, 30, 55, 0.05)'
                        : '#FFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setSameBillingShipping(!sameBillingShipping)}
                  >
                    <input
                      type="checkbox"
                      checked={sameBillingShipping}
                      onChange={() =>
                        setSameBillingShipping(!sameBillingShipping)
                      }
                      style={{
                        width: 20,
                        height: 20,
                        cursor: 'pointer',
                        accentColor: COLORS.red,
                        marginTop: '0.25rem',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 14,
                          fontWeight: 700,
                          color: COLORS.black,
                          margin: '0 0 0.25rem 0',
                        }}
                      >
                        ✓ Los datos de envío son los mismos
                      </p>
                      <p
                        style={{
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 12,
                          color: '#6C757D',
                          margin: 0,
                        }}
                      >
                        Usaremos los mismos datos para enviar tu pedido
                      </p>
                    </div>
                  </div>

                  {/* Opción: Datos diferentes */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      marginTop: '0.75rem',
                      border:
                        '2px solid ' +
                        (!sameBillingShipping ? '#078D92' : '#E9ECEF'),
                      borderRadius: 8,
                      backgroundColor: !sameBillingShipping
                        ? 'rgba(7, 141, 146, 0.05)'
                        : '#FFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setSameBillingShipping(!sameBillingShipping)}
                  >
                    <input
                      type="checkbox"
                      checked={!sameBillingShipping}
                      onChange={() =>
                        setSameBillingShipping(!sameBillingShipping)
                      }
                      style={{
                        width: 20,
                        height: 20,
                        cursor: 'pointer',
                        accentColor: '#078D92',
                        marginTop: '0.25rem',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 14,
                          fontWeight: 700,
                          color: COLORS.black,
                          margin: '0 0 0.25rem 0',
                        }}
                      >
                        📭 Datos de envío diferentes
                      </p>
                      <p
                        style={{
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 12,
                          color: '#6C757D',
                          margin: 0,
                        }}
                      >
                        Quiero indicar otra dirección para el envío
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                // PASO 3: Formulario de datos de envío (si son diferentes)
                <>
                  <p
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 13,
                      color: '#6C757D',
                      margin: '0 0 1rem 0',
                    }}
                  >
                    📍 Datos de envío (diferente a facturación)
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      {/* Nombre */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 12,
                            fontWeight: 700,
                            color: COLORS.gray,
                            marginBottom: '0.5rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          NOMBRE *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={shippingData.firstName}
                          onChange={handleShippingChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #E9ECEF',
                            borderRadius: 6,
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                          placeholder="Juan"
                        />
                      </div>

                      {/* Apellido */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 12,
                            fontWeight: 700,
                            color: COLORS.gray,
                            marginBottom: '0.5rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          APELLIDO *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={shippingData.lastName}
                          onChange={handleShippingChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #E9ECEF',
                            borderRadius: 6,
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                          placeholder="Pérez"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 12,
                          fontWeight: 700,
                          color: COLORS.gray,
                          marginBottom: '0.5rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        EMAIL *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingData.email}
                        onChange={handleShippingChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E9ECEF',
                          borderRadius: 6,
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 14,
                          boxSizing: 'border-box',
                        }}
                        placeholder="juan@example.com"
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 12,
                          fontWeight: 700,
                          color: COLORS.gray,
                          marginBottom: '0.5rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        TELÉFONO *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingData.phone}
                        onChange={handleShippingChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E9ECEF',
                          borderRadius: 6,
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 14,
                          boxSizing: 'border-box',
                        }}
                        placeholder="+34 912 345 678"
                      />
                    </div>

                    {/* Dirección */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 12,
                          fontWeight: 700,
                          color: COLORS.gray,
                          marginBottom: '0.5rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        DIRECCIÓN *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={shippingData.address}
                        onChange={handleShippingChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E9ECEF',
                          borderRadius: 6,
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 14,
                          boxSizing: 'border-box',
                        }}
                        placeholder="Calle Principal, 123"
                      />
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      {/* Ciudad */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 12,
                            fontWeight: 700,
                            color: COLORS.gray,
                            marginBottom: '0.5rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          CIUDAD *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={shippingData.city}
                          onChange={handleShippingChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #E9ECEF',
                            borderRadius: 6,
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                          placeholder="Madrid"
                        />
                      </div>

                      {/* Código Postal */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 12,
                            fontWeight: 700,
                            color: COLORS.gray,
                            marginBottom: '0.5rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          CP *
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={shippingData.postalCode}
                          onChange={handleShippingChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #E9ECEF',
                            borderRadius: 6,
                            fontFamily: 'APERCU, sans-serif',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                          placeholder="28001"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                padding: '1.5rem',
                borderTop: '1px solid #E9ECEF',
                display: 'flex',
                gap: '1rem',
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#F8F9FA',
              }}
            >
              {formStep !== 'billing' && (
                <button
                  onClick={() => {
                    if (formStep === 'shipping_form') {
                      setFormStep('shipping_check');
                    } else {
                      setFormStep('billing');
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    color: COLORS.gray,
                    border: '1px solid #E9ECEF',
                    borderRadius: 6,
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ← ATRÁS
                </button>
              )}

              <button
                onClick={() => {
                  if (formStep === 'billing') {
                    setFormStep('shipping_check');
                  } else if (formStep === 'shipping_check') {
                    if (sameBillingShipping) {
                      // Usar datos de facturación para envío
                      console.log('Datos finales:', {
                        billing: billingData,
                        shipping: billingData,
                        shippingMethod,
                      });
                      alert('✓ Datos guardados correctamente');
                      setShowShippingForm(false);
                    } else {
                      // Ir al formulario de envío
                      setFormStep('shipping_form');
                    }
                  } else if (formStep === 'shipping_form') {
                    // Guardar datos finales
                    console.log('Datos finales:', {
                      billing: billingData,
                      shipping: shippingData,
                      shippingMethod,
                    });
                    alert('✓ Datos guardados correctamente');
                    setShowShippingForm(false);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#078D92',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 6,
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#056B71';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#078D92';
                }}
              >
                {formStep === 'billing'
                  ? 'SIGUIENTE →'
                  : formStep === 'shipping_check'
                    ? sameBillingShipping
                      ? '✓ GUARDAR'
                      : '→ DATOS ENVÍO'
                    : '✓ GUARDAR'}
              </button>
            </div>
          </div>
        </>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}
      </style>
    </>
  );
}

function CartItem({ item, onRemove, onUpdateQuantity }) {
  const [imageError, setImageError] = useState(false);

  // Intentar obtener la imagen de diferentes propiedades posibles
  const imageUrl =
    item.imageSrc ||
    item.image_url ||
    item.image ||
    item.imageLargeSrc ||
    item.images?.real ||
    item.images?.sketch;

  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E9ECEF',
      }}
    >
      {/* Imagen */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          backgroundColor: '#F8F9FA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {imageUrl && !imageError ? (
          <img
            src={resolveImageUrl(imageUrl)}
            alt={item.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: 4,
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{ fontSize: 24 }}>📦</div>
        )}
      </div>

      {/* Info */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div>
          {/* Modelo/Marca */}
          {(item.model || item.brand) && (
            <p
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 10,
                color: COLORS.red,
                fontWeight: 700,
                letterSpacing: '0.5px',
                margin: '0 0 4px 0',
              }}
            >
              {item.brand || 'SEAT'} {item.model || ''}
            </p>
          )}

          {/* Título */}
          <h3
            style={{
              fontFamily: 'APERCU, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.black,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {cleanProductTitle(item.title)}
          </h3>

          {/* Subtítulo */}
          {item.subtitle && (
            <p
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 12,
                color: '#6C757D',
                margin: '2px 0 0 0',
                lineHeight: 1.2,
              }}
            >
              {item.subtitle}
            </p>
          )}

          {/* Referencia */}
          {item.reference && (
            <p
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 11,
                color: '#6C757D',
                margin: '4px 0 0 0',
              }}
            >
              Ref: {item.reference}
            </p>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
          }}
        >
          {/* Cantidad */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              style={{
                width: 28,
                height: 28,
                border: '2px solid #000000',
                borderRadius: 6,
                background: '#FFFFFF',
                color: '#000000',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#000000';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#000000';
              }}
            >
              −
            </button>
            <span
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                minWidth: 32,
                textAlign: 'center',
                color: '#000000',
              }}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              style={{
                width: 28,
                height: 28,
                border: '2px solid #000000',
                borderRadius: 6,
                background: '#FFFFFF',
                color: '#000000',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#000000';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#000000';
              }}
            >
              +
            </button>
          </div>

          {/* Precio */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.black,
              }}
            >
              {(item.price * item.quantity).toFixed(2)} €
            </div>
            <button
              onClick={onRemove}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.red,
                fontFamily: 'ui-monospace, monospace',
                fontSize: 11,
                cursor: 'pointer',
                marginTop: 4,
                textDecoration: 'underline',
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
