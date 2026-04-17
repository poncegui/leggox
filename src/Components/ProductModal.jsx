import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../utils/imageUtils';

const COLORS = {
  bg: '#FFFFFF',
  red: '#E01E37',
  darkRed: '#DC143C',
  black: '#000000',
  gray: '#1A1A1A',
};

// Función para limpiar el título de menciones de vehículos
// (Sincronizada con server/title-cleaner.js)
function cleanProductTitle(title) {
  if (!title) return title;

  let cleaned = title;

  // Paso 1: Remover patrones específicos de SEAT con modelos
  const seatPatterns = [
    /\bSEAT\s+\d{3,4}(?:\s*[\/,y]\s*\d{3,4})*/gi,
    /\bSEAT\s+(?:Panda|PANDA|Marbella|MARBELLA|Fura|FURA|Sport|SPORT)\b/gi,
    /\bSEAT\s+\d{3,4}\s+Sport\b/gi,
    /\bSEAT\s+FL(?:\/\d{3,4})?\b/gi,
  ];

  seatPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Paso 2: Remover nombres de modelos standalone
  const modelNames = [
    /\bBocanegra\b/gi,
    /\bBOCANEGRA\b/g,
    /\bMirafiori\b/gi,
    /\bSupermirafiori\b/gi,
    /\bSport\s+(?=-)/gi,
    /\bSPORT\s+(?=-)/g,
    /\bSport\b(?!\s+(-|Doble))/gi,
    /\bSPORT\b(?!\s+(-|Doble))/g,
    /\bFL\b/g,
  ];

  modelNames.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Paso 3: Remover números de modelos standalone con separadores
  const numberPatterns = [
    /\b\d{3,4}\s*[\/,]\s*\d{3,4}(?:\s*[\/,]\s*\d{3,4})*/g,
    /\b\d{3,4}\s+y\s+\d{3,4}\b/g,
    /\s+(?:Sport|SPORT|Especial|ESPECIAL|Normal|NORMAL)\s*$/gi,
  ];

  numberPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Paso 4: Remover texto común que aparece con vehículos
  const commonPhrases = [
    /\s+para\s+SEAT\s+.*$/gi,
    /\s+en\s+SEAT\s+.*$/gi,
    /\s+compatible\s+con\s+SEAT\s+.*$/gi,
    /\s+válido\s+para\s+SEAT\s+.*$/gi,
  ];

  commonPhrases.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Paso 5: Limpiar conectores huérfanos y espacios múltiples
  cleaned = cleaned
    .replace(/\s*[,\/y]\s*$/gi, '')
    .replace(/^\s*[,\/y]\s*/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*$/, '')
    .replace(/\(\s*\)/g, '')
    .trim();

  // Paso 6: Validación
  if (cleaned.length < 10) {
    return title;
  }

  return cleaned;
}

function generateMercagarageUrl(productId, productTitle) {
  const numericId = String(productId).match(/\d+/)?.[0] || productId;

  const slug = (productTitle || 'producto')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return `https://mercagarage.com/inicio/${numericId}-${slug}.html`;
}

export default function ProductModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  // Obtener galería de imágenes
  const imageGallery = product.imageGallery || product.images || [];
  const hasMultipleImages = Array.isArray(imageGallery) && imageGallery.length > 1;
  const hasImages = Array.isArray(imageGallery) && imageGallery.length > 0;
  const currentImage = hasImages
    ? resolveImageUrl(imageGallery[currentImageIndex]?.url) || resolveImageUrl(product.imageSrc)
    : resolveImageUrl(product.imageSrc);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageGallery.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    window.open(
      generateMercagarageUrl(product.id, product.title),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          style={{
            width: '100vw',
            maxWidth: '900px',
            height: 'auto',
            maxHeight: '90vh',
            background: '#FFFFFF',
            borderRadius: 18,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 18px 60px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            margin: 0,
            animation: 'slideUp 0.3s ease-out',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              padding: 18,
              borderBottom: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 12,
                  letterSpacing: '1.5px',
                  color: COLORS.red,
                  fontWeight: 800,
                }}
              >
                {product.brand || 'SEAT'} ·{' '}
                {(product.type || 'producto').toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 22,
                  fontWeight: 800,
                  color: COLORS.black,
                  marginTop: 6,
                  lineHeight: 1.2,
                }}
              >
                {cleanProductTitle(product.title)}
              </div>
              {product.subtitle && (
                <div
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    color: COLORS.gray,
                    marginTop: 6,
                  }}
                >
                  {product.subtitle}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ficha"
              style={{
                border: '1px solid rgba(0,0,0,0.12)',
                background: '#FFFFFF',
                borderRadius: 12,
                padding: '10px 12px',
                cursor: 'pointer',
                fontWeight: 900,
                fontFamily: 'ui-monospace, monospace',
                fontSize: 18,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#F8F9FA';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                window.innerWidth < 768 ? '1fr' : '1.2fr 0.8fr',
              gap: 16,
              padding: 18,
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 200px)',
            }}
          >
            {/* Imagen y Descripción */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Imagen con galería */}
              <div
                style={{
                  borderRadius: 14,
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: 'rgba(0,0,0,0.02)',
                  padding: 12,
                  minHeight: 260,
                  display: 'grid',
                  placeItems: 'center',
                  position: 'relative',
                }}
              >
                {currentImage ? (
                  <>
                    <img
                      src={currentImage}
                      alt={`Imagen ${currentImageIndex + 1} de ${product.title}`}
                      style={{
                        width: '100%',
                        height: 360,
                        objectFit: 'contain',
                        display: 'block',
                        cursor: 'zoom-in',
                        transition: 'transform 0.2s',
                        transform: imageZoomed ? 'scale(1)' : 'scale(1)',
                      }}
                      onClick={() => setImageZoomed(true)}
                    />

                    {/* Botones de navegación si hay múltiples imágenes */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          aria-label="Imagen anterior"
                          style={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            color: '#FFFFFF',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 18,
                            fontWeight: 'bold',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                        >
                          ‹
                        </button>

                        <button
                          onClick={handleNextImage}
                          aria-label="Siguiente imagen"
                          style={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            color: '#FFFFFF',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 18,
                            fontWeight: 'bold',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                        >
                          ›
                        </button>

                        {/* Indicador de imagen actual */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.7)',
                            color: '#FFFFFF',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontFamily: 'ui-monospace, monospace',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {currentImageIndex + 1} / {imageGallery.length}
                        </div>
                      </>
                    )}

                    {/* Badge SIN STOCK */}
                    {!product.inStock && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: 'rgba(239, 68, 68, 0.95)',
                          color: '#FFFFFF',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontFamily: 'ui-monospace, monospace',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                        }}
                      >
                        SIN STOCK
                      </div>
                    )}

                    <div
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#FFFFFF',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '1px',
                        pointerEvents: 'none',
                      }}
                    >
                      🔍 CLICK PARA ZOOM
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 64, color: '#CCC' }}>📦</div>
                )}{' '}
              </div>

              {/* Especificaciones Técnicas */}
              {product.technical && Object.keys(product.technical).length > 0 && (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: 'rgba(224,30,55,0.08)',
                    border: '1px solid rgba(224,30,55,0.2)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 10,
                      letterSpacing: '1.5px',
                      color: COLORS.red,
                      fontWeight: 800,
                      marginBottom: 10,
                    }}
                  >
                    ESPECIFICACIONES TÉCNICAS
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 13,
                      color: COLORS.black,
                    }}
                  >
                    {product.technical.material && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 80 }}>
                          Material:
                        </span>
                        <span>{product.technical.material}</span>
                      </div>
                    )}

                    {product.technical.engineSize && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 80 }}>
                          Motor:
                        </span>
                        <span>{product.technical.engineSize}</span>
                      </div>
                    )}

                    {product.technical.cores && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 80 }}>
                          Núcleos:
                        </span>
                        <span>{product.technical.cores}</span>
                      </div>
                    )}

                    {product.technical.layers && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 80 }}>
                          Capas:
                        </span>
                        <span>{product.technical.layers}</span>
                      </div>
                    )}

                    {product.technical.type && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 80 }}>
                          Tipo:
                        </span>
                        <span>{product.technical.type}</span>
                      </div>
                    )}

                    {product.technical.diameter && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 80 }}>
                          Diámetro:
                        </span>
                        <span>{product.technical.diameter}</span>
                      </div>
                    )}

                    {product.technical.measurements && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 80 }}>
                          Medidas:
                        </span>
                        <span>{product.technical.measurements}</span>
                      </div>
                    )}

                    {product.technical.color && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 80 }}>
                          Color:
                        </span>
                        <span>{product.technical.color}</span>
                      </div>
                    )}

                    {product.technical.isOEM && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 80 }}>
                          Calidad:
                        </span>
                        <span style={{ color: COLORS.red, fontWeight: 700 }}>
                          OEM Original
                        </span>
                      </div>
                    )}

                    {product.technical.notes && (
                      <div
                        style={{
                          marginTop: 6,
                          paddingTop: 8,
                          borderTop: '1px solid rgba(0,0,0,0.1)',
                          fontSize: 12,
                          color: COLORS.gray,
                          fontStyle: 'italic',
                        }}
                      >
                        {product.technical.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Descripción del producto - solo si es diferente del título */}
              {product.description &&
                product.description.trim() !== product.title.trim() &&
                product.description.trim().length > 10 && (
                  <div
                    style={{
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 14,
                      padding: 12,
                      backgroundColor: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 11,
                        letterSpacing: '2px',
                        color: COLORS.red,
                        fontWeight: 800,
                        marginBottom: 8,
                      }}
                    >
                      DESCRIPCIÓN
                    </div>
                    <div
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 13,
                        color: COLORS.black,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {product.description}
                    </div>
                  </div>
                )}
            </div>

            {/* Info lateral */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Precio y compra */}
              <div
                style={{
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 14,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 11,
                        letterSpacing: '2px',
                        color: COLORS.gray,
                        fontWeight: 800,
                      }}
                    >
                      PRECIO
                    </div>
                    <div
                      style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 20,
                        fontWeight: 800,
                        color: COLORS.black,
                        marginTop: 4,
                      }}
                    >
                      {product.price
                        ? `${product.price.toFixed(2)} €`
                        : 'Consultar'}
                      <span
                        style={{
                          display: 'block',
                          fontFamily: 'ui-monospace, monospace',
                          fontSize: 12,
                          color: COLORS.gray,
                          marginTop: 6,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        i. incluidos
                      </span>
                    </div>
                  </div>

                  {/* Cantidad */}
                  {product.inStock && (
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        style={{
                          width: 32,
                          height: 32,
                          border: '1px solid #DDD',
                          borderRadius: 6,
                          background: '#FFF',
                          cursor: 'pointer',
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 16,
                          fontWeight: 700,
                          minWidth: 24,
                          textAlign: 'center',
                        }}
                      >
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        style={{
                          width: 32,
                          height: 32,
                          border: '1px solid #DDD',
                          borderRadius: 6,
                          background: '#FFF',
                          cursor: 'pointer',
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                {/* Botones de compra */}
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {product.inStock && (
                    <button
                      onClick={handleAddToCart}
                      style={{
                        padding: '1rem 2rem',
                        backgroundColor: addedToCart ? '#10B981' : COLORS.red,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 8,
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: '0.3s',
                      }}
                    >
                      {addedToCart
                        ? '✓ AGREGADO AL CARRITO'
                        : 'AGREGAR AL CARRITO +'}
                    </button>
                  )}

                  <button
                    onClick={handleBuyNow}
                    style={{
                      padding: '1rem 2rem',
                      backgroundColor: product.inStock
                        ? COLORS.black
                        : '#6C757D',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      transition: '0.3s',
                    }}
                  >
                    {product.inStock
                      ? 'COMPRAR EN MERCAGARAGE ↗'
                      : 'ENCARGAR ↗'}
                  </button>
                </div>
              </div>

              {/* Info técnica */}
              <div
                style={{
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 14,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 11,
                    letterSpacing: '2px',
                    color: COLORS.red,
                    fontWeight: 800,
                    marginBottom: 4,
                  }}
                >
                  INFORMACIÓN TÉCNICA
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 13,
                    color: COLORS.black,
                  }}
                >
                  {product.reference && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>Referencia:</span>
                      <span style={{ color: COLORS.gray, textAlign: 'right' }}>
                        {product.reference}
                      </span>
                    </div>
                  )}
                  {product.model && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>Modelo:</span>
                      <span style={{ color: COLORS.gray, textAlign: 'right' }}>
                        {product.brand} {product.model}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>Stock:</span>
                    <span
                      style={{
                        color: product.inStock ? '#10B981' : '#EF4444',
                        fontWeight: 700,
                      }}
                    >
                      {product.inStock ? '✓ Disponible' : '✗ Agotado'}
                    </span>
                  </div>

                  {/* Datos técnicos adicionales del objeto technical */}
                  {product.technical && (
                    <>
                      {product.technical.material && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 8,
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>Material:</span>
                          <span
                            style={{ color: COLORS.gray, textAlign: 'right' }}
                          >
                            {product.technical.material}
                          </span>
                        </div>
                      )}
                      {product.technical.color && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 8,
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>Color:</span>
                          <span
                            style={{ color: COLORS.gray, textAlign: 'right' }}
                          >
                            {product.technical.color}
                          </span>
                        </div>
                      )}
                      {product.technical.thermostat && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 8,
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>Termostat:</span>
                          <span
                            style={{ color: COLORS.gray, textAlign: 'right' }}
                          >
                            {product.technical.thermostat}
                          </span>
                        </div>
                      )}
                      {product.technical.measurements && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 8,
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>Dimensiones:</span>
                          <span
                            style={{ color: COLORS.gray, textAlign: 'right' }}
                          >
                            {product.technical.measurements}
                          </span>
                        </div>
                      )}
                      {/* Kit Contents */}
                      {product.technical.kitContents &&
                        Array.isArray(product.technical.kitContents) &&
                        product.technical.kitContents.length > 0 && (
                          <div
                            style={{
                              borderTop: '1px solid rgba(0,0,0,0.1)',
                              paddingTop: 8,
                              marginTop: 4,
                            }}
                          >
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>
                              Contenido del kit:
                            </div>
                            <ul
                              style={{
                                margin: 0,
                                paddingLeft: 16,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                                fontSize: 12,
                              }}
                            >
                              {product.technical.kitContents.map(
                                (item, idx) => (
                                  <li key={idx} style={{ color: COLORS.gray }}>
                                    {item.qty}x {item.name}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      {product.technical.notes && (
                        <div
                          style={{
                            borderTop: '1px solid rgba(0,0,0,0.1)',
                            paddingTop: 8,
                            marginTop: 4,
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>
                            Notas:
                          </div>
                          <div
                            style={{
                              color: COLORS.gray,
                              fontSize: 12,
                              lineHeight: 1.4,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {product.technical.notes}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zoom overlay */}
        {imageZoomed && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              cursor: 'zoom-out',
            }}
            onClick={() => setImageZoomed(false)}
          >
            <img
              src={currentImage}
              alt={`${product.title} - Imagen ${currentImageIndex + 1}`}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </>
  );
}
