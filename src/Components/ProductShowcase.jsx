import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import PayPalCheckout from './PayPalCheckout';

// ✅ Icono SVG de Zoom
function IconZoomIn({ size = 16, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

// ✅ SVG SEAT Triste
function SeatTriste({ size = 200 }) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 200 120"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
    >
      {/* Cuerpo del coche */}
      <g style={{ animation: 'bounce 2s ease-in-out infinite' }}>
        {/* Carrocería principal */}
        <ellipse cx="100" cy="85" rx="65" ry="25" fill="#E01E37" opacity="0.3" />
        <rect x="40" y="60" width="120" height="35" rx="8" fill="#E01E37" />
        <path
          d="M 50 60 Q 70 35, 100 35 Q 130 35, 150 60"
          fill="#DC143C"
          stroke="#B01020"
          strokeWidth="2"
        />

        {/* Ventanas */}
        <path
          d="M 60 58 Q 75 42, 90 42 L 90 58 Z"
          fill="#87CEEB"
          opacity="0.6"
        />
        <path
          d="M 110 58 Q 125 42, 140 58 Z"
          fill="#87CEEB"
          opacity="0.6"
        />

        {/* Parachoques */}
        <rect x="35" y="92" width="10" height="4" rx="2" fill="#333" />
        <rect x="155" y="92" width="10" height="4" rx="2" fill="#333" />

        {/* Ruedas */}
        <g>
          <circle cx="60" cy="95" r="12" fill="#333" />
          <circle cx="60" cy="95" r="7" fill="#555" />
          <circle cx="140" cy="95" r="12" fill="#333" />
          <circle cx="140" cy="95" r="7" fill="#555" />
        </g>

        {/* Carita triste */}
        <g transform="translate(85, 65)">
          {/* Ojos tristes */}
          <circle cx="0" cy="0" r="3" fill="#000" />
          <circle cx="30" cy="0" r="3" fill="#000" />
          {/* Lágrimas */}
          <ellipse cx="0" cy="8" rx="1.5" ry="3" fill="#87CEEB" opacity="0.7">
            <animate
              attributeName="opacity"
              values="0.3;0.7;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="30" cy="8" rx="1.5" ry="3" fill="#87CEEB" opacity="0.7">
            <animate
              attributeName="opacity"
              values="0.7;0.3;0.7"
              dur="2s"
              repeatCount="indefinite"
            />
          </ellipse>
          {/* Boca triste */}
          <path
            d="M 5 15 Q 15 12, 25 15"
            stroke="#000"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </g>

      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        `}
      </style>
    </svg>
  );
}

const COLORS = {
  bg: '#FFFFFF',
  red: '#E01E37',
  darkRed: '#DC143C',
  black: '#000000',
  gray: '#1A1A1A',
};

const FILTERS = [
  { id: 'manguitos', label: 'Manguitos', type: 'manguito' },
  { id: 'radiadores', label: 'Radiadores', type: 'radiador' },
];

function norm(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function formatEUR(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(value).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function generateMercagarageUrl(productId, productTitle) {
  const numericId = String(productId).match(/\d+/)?.[0] || productId;

  const slug = productTitle
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return `https://mercagarage.com/inicio/${numericId}-${slug}.html`;
}

// Intentar extraer una cadena de medidas desde campos comunes (tags, title, subtitle)
function extractMeasurements(p) {
  if (!p) return null;
  if (p.measurements) return p.measurements;
  if (p.dimensions) return p.dimensions;

  const candidates = [];
  const pushFrom = v => {
    if (!v) return;
    if (Array.isArray(v)) v.forEach(x => x && candidates.push(String(x)));
    else candidates.push(String(v));
  };

  pushFrom(p.tags);
  pushFrom(p.title);
  pushFrom(p.subtitle);
  pushFrom(p.model);

  const re =
    /\b\d+(?:[.,]\d+)?\s?(?:mm|cm|m|kg|g)\b|\b\d+(?:x|×)\d+(?:x\d+)?\b/gi;

  for (const c of candidates) {
    const m = c.match(re);
    if (m && m.length) return m.join(' · ');
  }
  return null;
}

export default function ProductShowcase() {
  // ✅ Consumir productos dinámicos de la API
  const { products: apiProducts, loading, error } = useProducts();
  const { addToCart } = useCart();

  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );

  const [filterId, setFilterId] = React.useState('manguitos');
  const [q, setQ] = React.useState('');

  const [selectedProduct, setSelectedProduct] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const ITEMS_PER_PAGE = 3;

  const [openModal, setOpenModal] = React.useState(false);
  const [imageZoomed, setImageZoomed] = React.useState(false);
  const closeBtnRef = React.useRef(null);

  // ✅ NUEVO: modo compra en modal + estado de pago
  const [buyMode, setBuyMode] = React.useState('mercagarage'); // 'mercagarage' | 'paypal'
  const [payStatus, setPayStatus] = React.useState(null); // null | 'ok' | 'error'

  // ✅ Modal de "no hay resultados"
  const [showNoResultsModal, setShowNoResultsModal] = React.useState(false);

  // ✅ Estado para carrito
  const [addedToCart, setAddedToCart] = React.useState(false);

  // ✅ Los productos ya vienen transformados del backend
  const PRODUCTS = apiProducts;

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = windowWidth < 768;
  const isSmall = windowWidth < 440;

  const activeType = React.useMemo(() => {
    return FILTERS.find(f => f.id === filterId)?.type || 'modelo';
  }, [filterId]);

  const productCounts = React.useMemo(() => {
    const base = PRODUCTS.filter(p => p.featured);
    return {
      manguito: base.filter(p => p.type === 'manguito').length,
      radiador: base.filter(p => p.type === 'radiador').length,
    };
  }, [PRODUCTS]);

  const featuredList = React.useMemo(() => {
    const nq = norm(q);
    const base = PRODUCTS.filter(p => p.featured);
    const byType = base.filter(p => p.type === activeType);

    if (!nq) return byType;

    return byType.filter(p => {
      const hay = [
        p.brand,
        p.model,
        p.variant,
        p.engine,
        p.title,
        p.subtitle,
        ...(p.vehicles || []),
      ]
        .filter(Boolean)
        .map(norm)
        .join(' ');
      return hay.includes(nq);
    });
  }, [PRODUCTS, activeType, q]);

  React.useEffect(() => {
    if (selectedProduct >= featuredList.length) {
      setSelectedProduct(0);
      setCurrentPage(0);
      return;
    }
    const page = Math.floor(selectedProduct / ITEMS_PER_PAGE) || 0;
    setCurrentPage(page);
  }, [featuredList.length, selectedProduct]);

  const currentProduct = featuredList[selectedProduct] || featuredList[0];

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const visibleProducts = featuredList.slice(startIndex, endIndex);
  const totalPages = Math.ceil(featuredList.length / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  // ✅ Mostrar modal cuando no hay productos
  React.useEffect(() => {
    if (!currentProduct && featuredList.length === 0) {
      setShowNoResultsModal(true);
    } else {
      setShowNoResultsModal(false);
    }
  }, [currentProduct, featuredList.length]);

  React.useEffect(() => {
    if (!openModal) {
      setImageZoomed(false);
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setTimeout(() => closeBtnRef.current?.focus?.(), 0);

    const onKeyDown = e => {
      if (e.key === 'Escape') setOpenModal(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openModal]);

  // ✅ Estados de carga y error
  if (loading) {
    return (
      <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: COLORS.gray }}>Cargando productos...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: COLORS.red, marginBottom: 16 }}>
          Error al cargar productos: {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            background: COLORS.red,
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Reintentar
        </button>
      </section>
    );
  }

  // ✅ Si no hay productos, mostrar datos placeholder para evitar errores
  const safeCurrentProduct = currentProduct || {
    title: '',
    subtitle: '',
    price: 0,
    imageSrc: null,
    inStock: false,
    type: activeType || 'producto',
    brand: '',
    model: '',
    variant: '',
    engine: '',
    alt: '',
    technical: null,
  };

  const priceText = formatEUR(safeCurrentProduct.price);
  const measurements = extractMeasurements(safeCurrentProduct);
  const tech = safeCurrentProduct.technical || null;

  return (
    <section
      style={{
        ...styles.container,
        flexDirection: 'column',
        gap: isMobile ? '2rem' : '3rem',
        padding: isMobile ? '3rem 1.5rem' : '5rem 8%',
      }}
    >
      {/* Título principal */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <p
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.8px',
            color: 'rgba(0,0,0,0.50)',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          CATÁLOGO DE PRODUCTOS
        </p>
        <h2
          style={{
            fontFamily: 'APERCU, sans-serif',
            fontSize: isSmall ? 28 : isMobile ? 36 : 48,
            fontWeight: 400,
            letterSpacing: -1.0,
            lineHeight: 1.05,
            color: COLORS.black,
            margin: 0,
          }}
        >
          Manguitos y radiadores
        </h2>
        <div
          style={{
            height: 3,
            width: 360,
            maxWidth: '70vw',
            backgroundColor: COLORS.red,
          }}
        />
      </div>

      {/* Contenedor principal */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '2rem' : '4rem',
          width: '100%',
        }}
      >
        {/* Left Side */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '1.5rem' : '2rem',
            justifyContent: 'center',
          }}
        >
          <div>
            <p
              style={{
                ...styles.modelTag,
                fontSize: isSmall ? 11 : 12,
              }}
            >
              {safeCurrentProduct.brand}
            </p>

            <h2
              style={{
                ...styles.productName,
                fontSize: isSmall ? 32 : isMobile ? 40 : isTablet ? 48 : 56,
              }}
            >
              {safeCurrentProduct.title}
            </h2>

            {(safeCurrentProduct.variant ||
              safeCurrentProduct.engine ||
              safeCurrentProduct.subtitle) && (
              <p
                style={{
                  ...styles.subtitle,
                  fontSize: isSmall ? 16 : isMobile ? 18 : 20,
                }}
              >
                {safeCurrentProduct.subtitle || safeCurrentProduct.variant || ''}
                {safeCurrentProduct.engine ? ` • ${safeCurrentProduct.engine}` : ''}
              </p>
            )}
          </div>

          <div style={styles.materialSection}>
            <span style={styles.materialLabel}>
              {safeCurrentProduct.type.toUpperCase()}
            </span>
            <p style={styles.materialText}>{safeCurrentProduct.model || '—'}</p>
          </div>

          <div style={styles.specsGrid}>
            <div style={styles.specItem}>
              <div style={styles.checkIcon}>✓</div>
              <span style={styles.specText}>Réplicas originales</span>
            </div>
            <div style={styles.specItem}>
              <div style={styles.checkIcon}>✓</div>
              <span style={styles.specText}>Calidad OEM</span>
            </div>
            <div style={styles.specItem}>
              <div style={styles.checkIcon}>✓</div>
              <span style={styles.specText}>Envío Rápido</span>
            </div>
          </div>

          {/* Mini imagen */}
          <div
            style={{
              width: '100%',
              maxWidth: isMobile ? '100%' : 520,
              borderRadius: 18,
              border: '1px solid rgba(0,0,0,0.08)',
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))',
              padding: isMobile ? 12 : 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Vista previa del producto"
          >
            {safeCurrentProduct.imageSrc ? (
              <>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    cursor: 'zoom-in',
                  }}
                  onClick={() => setImageZoomed(true)}
                >
                  <img
                    src={safeCurrentProduct.imageSrc}
                    alt={
                      safeCurrentProduct.alt || `Imagen de ${safeCurrentProduct.title}`
                    }
                    style={{
                      width: '100%',
                      height: '100%',
                      maxHeight: isMobile ? 180 : 220,
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    loading="lazy"
                  />

                  {/* Badge SIN STOCK */}
                  {!safeCurrentProduct.inStock && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: 'rgba(239, 68, 68, 0.95)',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        pointerEvents: 'none',
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
                      backgroundColor: 'rgba(0,0,0,0.75)',
                      color: 'white',
                      padding: '6px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      pointerEvents: 'none',
                    }}
                  >
                    <IconZoomIn size={14} color="#FFFFFF" />
                    <span>Ampliar</span>
                  </div>
                </div>

                {imageZoomed && (
                  <div
                    style={{
                      position: 'fixed',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.92)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10000,
                      padding: 20,
                      cursor: 'zoom-out',
                    }}
                    onClick={() => setImageZoomed(false)}
                  >
                    <div
                      style={{
                        position: 'relative',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setImageZoomed(false)}
                        style={{
                          position: 'absolute',
                          top: -40,
                          right: 0,
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.3)',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                        aria-label="Cerrar zoom"
                      >
                        ✕ Cerrar
                      </button>
                      <img
                        src={safeCurrentProduct.imageSrc}
                        alt={
                          safeCurrentProduct.alt ||
                          `Imagen ampliada de ${safeCurrentProduct.title}`
                        }
                        style={{
                          maxWidth: '90vw',
                          maxHeight: '90vh',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  color: '#777',
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                Sin imagen
              </div>
            )}
          </div>

          <div style={styles.priceSection}>
            {priceText ? (
              <div style={styles.priceContainer}>
                <span style={styles.priceLabel}>PRECIO</span>
                <div style={styles.priceRow}>
                  <span style={styles.priceAmount}>
                    {Number(safeCurrentProduct.price).toFixed(2).replace('.', ',')}
                  </span>
                  <span style={styles.priceCurrency}>€</span>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              style={styles.ctaButton}
              onClick={() => {
                setBuyMode('mercagarage');
                setPayStatus(null);
                setOpenModal(true);
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = COLORS.darkRed;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = COLORS.red;
              }}
              aria-label={`Ver detalles de ${safeCurrentProduct.title}`}
            >
              VER DETALLES
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '1rem' : '1.5rem',
            justifyContent: 'center',
          }}
        >
          <h3
            style={{
              ...styles.selectorTitle,
              fontSize: isSmall ? 18 : 24,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '3px solid #E01E37',
            }}
          >
            PRODUCTOS DESTACADOS
          </h3>

          {/* Buscador + filtros */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginBottom: 4,
            }}
          >
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {FILTERS.map(f => {
                const active = f.id === filterId;
                const count = productCounts[f.type] || 0;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setFilterId(f.id);
                      setQ('');
                      setSelectedProduct(0);
                    }}
                    aria-pressed={active}
                    style={{
                      padding: '12px 18px',
                      borderRadius: 999,
                      border: active
                        ? `2px solid ${COLORS.red}`
                        : '1px solid #E0E0E0',
                      background: active ? 'rgba(224,30,55,0.10)' : '#FFFFFF',
                      color: COLORS.black,
                      cursor: 'pointer',
                      fontFamily: 'ui-monospace, monospace',
                      fontWeight: 800,
                      letterSpacing: '1px',
                      fontSize: isSmall ? 13 : 14,
                    }}
                  >
                    {f.label} ({count})
                  </button>
                );
              })}
            </div>

            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por modelo, referencia, SEAT 127, 600, etc…"
              aria-label="Buscar productos destacados"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid #E0E0E0',
                outline: 'none',
                fontFamily: 'APERCU, sans-serif',
                fontSize: 14,
              }}
            />
          </div>

          {/* Paginación */}
          {featuredList.length > ITEMS_PER_PAGE && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 4px',
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                disabled={!hasPrevPage}
                onClick={() => setCurrentPage(p => p - 1)}
                aria-label="Página anterior"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: hasPrevPage
                    ? `1px solid ${COLORS.red}`
                    : '1px solid #E0E0E0',
                  background: hasPrevPage ? '#FFFFFF' : '#F5F5F5',
                  color: hasPrevPage ? COLORS.red : '#CCCCCC',
                  cursor: hasPrevPage ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (hasPrevPage)
                    e.currentTarget.style.background = 'rgba(224,30,55,0.10)';
                }}
                onMouseLeave={e => {
                  if (hasPrevPage) e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                ←
              </button>

              <span
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.gray,
                  letterSpacing: '1px',
                }}
              >
                {currentPage + 1} / {totalPages}
              </span>

              <button
                type="button"
                disabled={!hasNextPage}
                onClick={() => setCurrentPage(p => p + 1)}
                aria-label="Página siguiente"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: hasNextPage
                    ? `1px solid ${COLORS.red}`
                    : '1px solid #E0E0E0',
                  background: hasNextPage ? '#FFFFFF' : '#F5F5F5',
                  color: hasNextPage ? COLORS.red : '#CCCCCC',
                  cursor: hasNextPage ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (hasNextPage)
                    e.currentTarget.style.background = 'rgba(224,30,55,0.10)';
                }}
                onMouseLeave={e => {
                  if (hasNextPage) e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                →
              </button>
            </div>
          )}

          <div
            style={styles.productGrid}
            role="list"
            aria-label="Lista de productos destacados"
          >
            {featuredList.length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #E0E0E0',
                  borderRadius: 12,
                  fontFamily: 'APERCU, sans-serif',
                  color: COLORS.gray,
                }}
              >
                No hay resultados con ese filtro/búsqueda.
              </div>
            ) : (
              visibleProducts.map(p => {
                const idx = featuredList.indexOf(p);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(idx)}
                    style={{
                      ...styles.productCard,
                      transform:
                        selectedProduct === idx ? 'scale(1.02)' : 'scale(1)',
                      borderColor: selectedProduct === idx ? COLORS.red : '#E0E0E0',
                      borderWidth: selectedProduct === idx ? '2px' : '1px',
                      backgroundColor: selectedProduct === idx ? 'rgba(224, 30, 55, 0.1)' : '#FFFFFF',
                    }}
                    onMouseEnter={e => {
                      if (selectedProduct !== idx) {
                        e.currentTarget.style.borderColor = COLORS.red;
                        e.currentTarget.style.borderWidth = '2px';
                      }
                    }}
                    onMouseLeave={e => {
                      if (selectedProduct !== idx) {
                        e.currentTarget.style.borderColor = '#E0E0E0';
                        e.currentTarget.style.borderWidth = '1px';
                      }
                    }}
                    aria-label={`Seleccionar ${p.title}`}
                    role="listitem"
                  >
                    <div style={styles.cardHeader}>
                      <span style={styles.cardModel}>{p.brand}</span>
                      <span
                        style={{
                          ...styles.cardPrice,
                          color:
                            selectedProduct === idx ? COLORS.red : COLORS.black,
                        }}
                      >
                        {p.model ||
                          (p.type === 'manguito'
                            ? 'Manguito'
                            : p.type === 'radiador'
                              ? 'RADIADOR'
                              : 'MODELO')}
                      </span>
                    </div>
                    <h4 style={styles.cardName}>{p.title}</h4>
                    {(p.variant || p.subtitle) && (
                      <p style={styles.cardSubtitle}>
                        {p.subtitle || p.variant}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ficha de producto"
          onClick={() => setOpenModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'grid',
            placeItems: 'center',
            padding: isMobile ? 0 : 16,
            zIndex: 9999,
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: isMobile || isTablet ? '100vw' : 'min(920px, 96vw)',
              maxWidth: isMobile || isTablet ? '100vw' : '920px',
              height: isMobile ? '100vh' : 'auto',
              maxHeight: isMobile ? '100vh' : '90vh',
              background: '#FFFFFF',
              borderRadius: 18,
              border: '1px solid rgba(0,0,0,0.10)',
              boxShadow: '0 18px 60px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              margin: isMobile || isTablet ? 0 : undefined,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header modal */}
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
                  {safeCurrentProduct.brand} · {safeCurrentProduct.type.toUpperCase()}
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
                  {safeCurrentProduct.title}
                </div>
                {safeCurrentProduct.subtitle ? (
                  <div
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 14,
                      color: COLORS.gray,
                      marginTop: 6,
                    }}
                  >
                    {safeCurrentProduct.subtitle}
                  </div>
                ) : null}
              </div>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setOpenModal(false)}
                aria-label="Cerrar ficha"
                style={{
                  border: '1px solid rgba(0,0,0,0.12)',
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: isMobile ? '14px 16px' : '10px 12px',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: isMobile ? 22 : 18,
                  position: isMobile ? 'absolute' : 'static',
                  top: isMobile ? 10 : undefined,
                  right: isMobile ? 10 : undefined,
                  zIndex: 10,
                }}
              >
                ✕
              </button>
            </div>

            {/* Body modal */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr',
                gap: 16,
                padding: 18,
              }}
            >
              <div
                style={{
                  borderRadius: 14,
                  border: '1px solid rgba(0,0,0,0.10)',
                  background: 'rgba(0,0,0,0.02)',
                  padding: 12,
                  minHeight: 260,
                  display: 'grid',
                  placeItems: 'center',
                  position: 'relative',
                }}
              >
                <img
                  src={safeCurrentProduct.imageLargeSrc || safeCurrentProduct.imageSrc}
                  alt={
                    safeCurrentProduct.alt || `Imagen de ${safeCurrentProduct.title}`
                  }
                  onClick={() => setImageZoomed(true)}
                  style={{
                    width: '100%',
                    height: isMobile ? 260 : 360,
                    objectFit: 'contain',
                    display: 'block',
                    cursor: 'zoom-in',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
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
              </div>

              {/* Overlay zoom */}
              {imageZoomed && (
                <div
                  onClick={() => setImageZoomed(false)}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.92)',
                    display: 'grid',
                    placeItems: 'center',
                    padding: 20,
                    zIndex: 10000,
                    cursor: 'zoom-out',
                  }}
                >
                  <img
                    src={
                      safeCurrentProduct.imageLargeSrc || safeCurrentProduct.imageSrc
                    }
                    alt={
                      safeCurrentProduct.alt ||
                      `Imagen ampliada de ${safeCurrentProduct.title}`
                    }
                    onClick={e => e.stopPropagation()}
                    style={{
                      maxWidth: '95vw',
                      maxHeight: '95vh',
                      objectFit: 'contain',
                      cursor: 'zoom-out',
                    }}
                  />
                  <button
                    onClick={() => setImageZoomed(false)}
                    style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      background: '#FFFFFF',
                      border: 'none',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                      fontSize: 20,
                      fontWeight: 900,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                    aria-label="Cerrar zoom"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {/* ✅ BLOQUE COMPRA + PAYPAL */}
                <div
                  style={{
                    border: '1px solid rgba(0,0,0,0.10)',
                    borderRadius: 14,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {/* selector */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setBuyMode('mercagarage');
                        setPayStatus(null);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 999,
                        border:
                          buyMode === 'mercagarage'
                            ? `2px solid ${COLORS.red}`
                            : '1px solid rgba(0,0,0,0.12)',
                        background:
                          buyMode === 'mercagarage'
                            ? 'rgba(224,30,55,0.10)'
                            : '#FFF',
                        cursor: 'pointer',
                        fontFamily: 'ui-monospace, monospace',
                        fontWeight: 800,
                        letterSpacing: '0.8px',
                      }}
                    >
                      Mercagarage
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBuyMode('paypal');
                        setPayStatus(null);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 999,
                        border:
                          buyMode === 'paypal'
                            ? `2px solid ${COLORS.red}`
                            : '1px solid rgba(0,0,0,0.12)',
                        background:
                          buyMode === 'paypal'
                            ? 'rgba(224,30,55,0.10)'
                            : '#FFF',
                        cursor: 'pointer',
                        fontFamily: 'ui-monospace, monospace',
                        fontWeight: 800,
                        letterSpacing: '0.8px',
                      }}
                    >
                      Pagar aquí (PayPal)
                    </button>
                  </div>

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
                        {priceText || 'Consultar'}
                        {priceText ? (
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
                        ) : null}
                      </div>
                    </div>

                    {buyMode === 'mercagarage' && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        {/* Botón añadir al carrito - solo si hay stock */}
                        {safeCurrentProduct.inStock && (
                          <button
                            onClick={() => {
                              addToCart(safeCurrentProduct, 1);
                              setAddedToCart(true);
                              setTimeout(() => setAddedToCart(false), 2000);
                            }}
                            style={{
                              ...styles.ctaButton,
                              backgroundColor: addedToCart ? '#10B981' : COLORS.red,
                              border: 'none',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {addedToCart ? '✓ AÑADIDO AL CARRITO' : 'AÑADIR AL CARRITO +'}
                          </button>
                        )}

                        {/* Botón comprar en Mercagarage */}
                        <a
                          href={generateMercagarageUrl(
                            safeCurrentProduct.id,
                            safeCurrentProduct.title,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            ...styles.ctaButton,
                            textDecoration: 'none',
                            alignSelf: 'auto',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                            backgroundColor: safeCurrentProduct.inStock ? COLORS.black : '#6C757D',
                          }}
                          aria-label={`${safeCurrentProduct.inStock ? 'Comprar' : 'Encargar'} ${safeCurrentProduct.title} en Mercagarage (se abre en una pestaña nueva)`}
                        >
                          {safeCurrentProduct.inStock ? 'COMPRAR EN MERCAGARAGE ↗' : 'ENCARGAR ↗'}
                        </a>
                      </div>
                    )}
                  </div>

                  {buyMode === 'paypal' && (
                    <div
                      style={{
                        marginTop: 6,
                        paddingTop: 12,
                        borderTop: '1px solid rgba(0,0,0,0.10)',
                      }}
                    >
                      {payStatus === 'ok' ? (
                        <div
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: 'rgba(16,185,129,0.12)',
                            border: '1px solid rgba(16,185,129,0.25)',
                            fontFamily: 'APERCU, sans-serif',
                            fontWeight: 800,
                          }}
                        >
                          ✅ Pago completado. ¡Gracias!
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              fontFamily: 'ui-monospace, monospace',
                              fontSize: 11,
                              letterSpacing: '2px',
                              color: COLORS.red,
                              fontWeight: 800,
                              marginBottom: 10,
                            }}
                          >
                            PAGO SEGURO
                          </div>

                          <PayPalCheckout
                            cart={{
                              items: [
                                {
                                  id: safeCurrentProduct.id,
                                  title: safeCurrentProduct.title,
                                  qty: 1,
                                  unitPrice: Number(safeCurrentProduct.price || 0),
                                },
                              ],
                              total: Number(safeCurrentProduct.price || 0).toFixed(
                                2,
                              ),
                              currency: 'EUR',
                            }}
                            onSuccess={() => {
                              setPayStatus('ok');
                              setTimeout(() => setOpenModal(false), 1200);
                            }}
                            onError={() => setPayStatus('error')}
                          />

                          {payStatus === 'error' ? (
                            <div
                              style={{
                                marginTop: 10,
                                padding: 10,
                                borderRadius: 12,
                                background: 'rgba(239,68,68,0.10)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                fontFamily: 'APERCU, sans-serif',
                                fontWeight: 800,
                              }}
                            >
                              ❌ Error en el pago. Prueba de nuevo.
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Información técnica */}
                <div
                  style={{
                    border: '1px solid rgba(0,0,0,0.10)',
                    borderRadius: 14,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
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
                      gap: 6,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 13,
                      color: COLORS.black,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontWeight: 700, minWidth: 80 }}>
                        Referencia:
                      </span>
                      <span style={{ color: COLORS.gray }}>
                        {safeCurrentProduct.reference || safeCurrentProduct.id || '—'}
                      </span>
                    </div>

                    {measurements && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 80 }}>
                          Medidas:
                        </span>
                        <span style={{ color: COLORS.gray }}>
                          {measurements}
                        </span>
                      </div>
                    )}

                    {tech && (
                      <>
                        {tech.originalReference && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontWeight: 700, minWidth: 120 }}>
                              Ref. original:
                            </span>
                            <span style={{ color: COLORS.gray }}>
                              {tech.originalReference}
                            </span>
                          </div>
                        )}

                        {tech.material && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontWeight: 700, minWidth: 80 }}>
                              Material:
                            </span>
                            <span style={{ color: COLORS.gray }}>
                              {tech.material}
                            </span>
                          </div>
                        )}

                        {tech.color && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontWeight: 700, minWidth: 80 }}>
                              Color:
                            </span>
                            <span style={{ color: COLORS.gray }}>
                              {tech.color}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontWeight: 700, minWidth: 120 }}>
                        Modelo compatible:
                      </span>
                      <span style={{ color: COLORS.gray }}>
                        {safeCurrentProduct.vehicles &&
                        safeCurrentProduct.vehicles.length > 0
                          ? safeCurrentProduct.vehicles.join(', ')
                          : safeCurrentProduct.model || '—'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontWeight: 700, minWidth: 80 }}>
                        Stock:
                      </span>
                      <span
                        style={{
                          color: safeCurrentProduct.inStock ? '#10B981' : '#EF4444',
                          fontWeight: 700,
                        }}
                      >
                        {safeCurrentProduct.inStock ? '✓ Disponible' : '✗ Agotado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer eliminado */}
          </div>
        </div>
      )}

      {/* ✅ Modal de "No hay resultados" con SEAT Triste */}
      {showNoResultsModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out',
          }}
          onClick={() => setShowNoResultsModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
              maxWidth: 500,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              animation: 'slideUp 0.3s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setShowNoResultsModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#F8F9FA',
                color: '#6C757D',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#E9ECEF';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#F8F9FA';
                e.currentTarget.style.color = '#6C757D';
              }}
              aria-label="Cerrar"
            >
              ×
            </button>

            {/* SEAT Triste */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <SeatTriste size={isMobile ? 160 : 200} />
            </div>

            {/* Mensaje */}
            <h3
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: isMobile ? 18 : 22,
                fontWeight: 700,
                color: COLORS.gray,
                marginBottom: '0.75rem',
                textAlign: 'center',
              }}
            >
              ¡Vaya, no hay nada aquí!
            </h3>

            <p
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: isMobile ? 14 : 16,
                color: '#6C757D',
                marginBottom: '1.5rem',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              {PRODUCTS.length === 0
                ? 'No hay productos en el catálogo'
                : `No hay ${activeType}s disponibles${q ? ` que coincidan con "${q}"` : ''}`}
            </p>

            {/* Contador de productos */}
            {PRODUCTS.length > 0 && (
              <p
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 11,
                  color: '#ADB5BD',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  letterSpacing: '0.5px',
                }}
              >
                TOTAL EN CATÁLOGO: <strong>{PRODUCTS.length} PRODUCTOS</strong>
              </p>
            )}

            {/* Botones */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              {q && (
                <button
                  onClick={() => {
                    setQ('');
                    setShowNoResultsModal(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.875rem 1.5rem',
                    backgroundColor: COLORS.red,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = COLORS.darkRed)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = COLORS.red)}
                >
                  Limpiar búsqueda
                </button>
              )}
              <button
                onClick={() => setShowNoResultsModal(false)}
                style={{
                  flex: 1,
                  padding: '0.875rem 1.5rem',
                  backgroundColor: '#F8F9FA',
                  color: COLORS.gray,
                  border: '1px solid #DEE2E6',
                  borderRadius: 8,
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#E9ECEF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#F8F9FA';
                }}
              >
                Cerrar
              </button>
            </div>
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
        </div>
      )}
    </section>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    position: 'relative',
  },
  modelTag: {
    fontFamily: 'ui-monospace, monospace',
    color: COLORS.red,
    fontWeight: 700,
    letterSpacing: '2px',
    marginBottom: '0.5rem',
  },
  productName: {
    fontFamily: 'APERCU, sans-serif',
    fontWeight: 700,
    color: COLORS.black,
    letterSpacing: '-2px',
    lineHeight: 1.1,
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontFamily: 'APERCU, sans-serif',
    color: COLORS.gray,
    fontWeight: 400,
    margin: 0,
  },
  materialSection: {
    borderLeft: `4px solid ${COLORS.red}`,
    paddingLeft: '1rem',
  },
  materialLabel: {
    fontFamily: 'ui-monospace, monospace',
    fontSize: '11px',
    color: COLORS.red,
    fontWeight: 700,
    letterSpacing: '2px',
  },
  materialText: {
    fontFamily: 'APERCU, sans-serif',
    fontSize: '16px',
    color: COLORS.black,
    margin: '0.5rem 0 0 0',
    fontWeight: 500,
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.75rem',
  },
  specItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  checkIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: COLORS.red,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  specText: {
    fontFamily: 'ui-monospace, monospace',
    fontSize: '13px',
    color: COLORS.black,
  },
  priceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  priceLabel: {
    fontFamily: 'ui-monospace, monospace',
    fontSize: '11px',
    color: COLORS.red,
    fontWeight: 700,
    letterSpacing: '2px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
  },
  priceAmount: {
    fontFamily: 'APERCU, sans-serif',
    fontSize: '48px',
    fontWeight: 700,
    color: COLORS.black,
    letterSpacing: '-2px',
  },
  priceCurrency: {
    fontFamily: 'APERCU, sans-serif',
    fontSize: '24px',
    fontWeight: 700,
    color: COLORS.red,
  },
  ctaButton: {
    padding: '1rem 2rem',
    backgroundColor: COLORS.red,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontFamily: 'APERCU, sans-serif',
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    alignSelf: 'flex-start',
  },
  selectorTitle: {
    fontFamily: 'ui-monospace, monospace',
    color: COLORS.black,
    fontWeight: 700,
    letterSpacing: '2px',
    margin: 0,
  },
  productGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  productCard: {
    padding: '1.5rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #E0E0E0',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  cardModel: {
    fontFamily: 'ui-monospace, monospace',
    fontSize: '10px',
    color: COLORS.gray,
    fontWeight: 700,
    letterSpacing: '1.5px',
  },
  cardPrice: {
    fontFamily: 'APERCU, sans-serif',
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '-1px',
  },
  cardName: {
    fontFamily: 'APERCU, sans-serif',
    fontSize: '18px',
    fontWeight: 700,
    color: COLORS.black,
    margin: '0 0 0.25rem 0',
    letterSpacing: '-0.5px',
  },
  cardSubtitle: {
    fontFamily: 'APERCU, sans-serif',
    fontSize: '14px',
    color: COLORS.gray,
    margin: 0,
  },
};
