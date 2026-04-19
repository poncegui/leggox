import React, { useEffect, useState } from 'react';

const COLORS = {
  red: '#E01E37',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#1A1A1A',
  lightGray: '#F5F5F5',
  border: '#E5E5E5',
};

// Iconos
function IconCheck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="12" cy="12" r="10" fill={COLORS.red} stroke="none" />
      <polyline points="8 12 11 15 16 9" stroke={COLORS.white} strokeWidth="2.5" />
    </svg>
  );
}

function IconShoppingBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function AddToCartModal({
  isOpen,
  onClose,
  product,
  cartCount,
  cartTotal,
  onProceedToCheckout
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Auto-cerrar después de 8 segundos si no hace nada
      const timeout = setTimeout(() => {
        handleClose();
      }, 8000);
      return () => clearTimeout(timeout);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleProceedClick = () => {
    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else {
      handleClose();
    }
  };

  if (!isVisible) return null;

  // Resolver URL de imagen
  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      const apiBase =
        process.env.REACT_APP_API_BASE ||
        (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');
      return `${apiBase}${url}`;
    }
    return url;
  };

  const imageUrl = product
    ? resolveImageUrl(product.imageSrc || product.imageLargeSrc || product.image_url)
    : null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 20,
          maxWidth: 500,
          width: '100%',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Header con check animado */}
        <div
          style={{
            backgroundColor: COLORS.lightGray,
            padding: '30px 30px 20px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              marginBottom: 16,
              animation: 'bounce 0.6s ease-out',
            }}
          >
            <IconCheck />
          </div>
          <h2
            style={{
              fontFamily: 'APERCU, sans-serif',
              fontSize: 24,
              fontWeight: 800,
              color: COLORS.black,
              margin: 0,
              marginBottom: 8,
            }}
          >
            ¡Añadido al carrito!
          </h2>
          <p
            style={{
              fontFamily: 'APERCU, sans-serif',
              fontSize: 14,
              color: COLORS.gray,
              margin: 0,
              opacity: 0.7,
            }}
          >
            Tu producto ha sido agregado correctamente
          </p>
        </div>

        {/* Producto añadido */}
        {product && (
          <div
            style={{
              padding: '20px 30px',
              borderBottom: `1px solid ${COLORS.lightGray}`,
            }}
          >
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              {/* Imagen del producto */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: COLORS.lightGray,
                  borderRadius: 12,
                  padding: 8,
                  flexShrink: 0,
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      opacity: 0.3,
                    }}
                  >
                    📦
                  </div>
                )}
              </div>

              {/* Info del producto */}
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 15,
                    fontWeight: 700,
                    color: COLORS.black,
                    margin: 0,
                    marginBottom: 4,
                    lineHeight: 1.3,
                  }}
                >
                  {product.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 13,
                    color: COLORS.gray,
                    margin: 0,
                    marginBottom: 8,
                    opacity: 0.7,
                  }}
                >
                  {product.subtitle || product.type}
                </p>
                <div
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 18,
                    fontWeight: 900,
                    color: COLORS.red,
                  }}
                >
                  {product.price ? `${product.price.toFixed(2)} €` : 'Precio no disponible'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumen del carrito */}
        <div
          style={{
            padding: '16px 30px',
            backgroundColor: COLORS.lightGray,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconShoppingBag />
              <span
                style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.gray,
                }}
              >
                {cartCount} {cartCount === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <div
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 18,
                fontWeight: 900,
                color: COLORS.black,
              }}
            >
              {cartTotal.toFixed(2)} €
            </div>
          </div>

          {/* Aviso de envío gratis */}
          {cartTotal < 50 && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(224, 30, 55, 0.1)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 12,
                  color: COLORS.red,
                  fontWeight: 600,
                }}
              >
                ¡Añade {(50 - cartTotal).toFixed(2)} € más para envío gratis!
              </span>
            </div>
          )}

          {cartTotal >= 50 && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 16 }}>✓</span>
              <span
                style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 12,
                  color: '#059669',
                  fontWeight: 600,
                }}
              >
                ¡Envío gratis en este pedido!
              </span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div
          style={{
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Proceder al pago */}
          <button
            onClick={handleProceedClick}
            style={{
              backgroundColor: COLORS.red,
              color: COLORS.white,
              border: 'none',
              borderRadius: 12,
              padding: '16px 24px',
              fontFamily: 'APERCU, sans-serif',
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transform: 'scale(1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C01830';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.red;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>VER CARRITO Y PAGAR</span>
            <IconArrowRight />
          </button>

          {/* Seguir comprando */}
          <button
            onClick={handleClose}
            style={{
              backgroundColor: 'transparent',
              color: COLORS.black,
              border: `2px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: '14px 24px',
              fontFamily: 'APERCU, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.black;
              e.currentTarget.style.backgroundColor = COLORS.black;
              e.currentTarget.style.color = COLORS.white;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = COLORS.black;
            }}
          >
            Seguir comprando
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </div>
  );
}
