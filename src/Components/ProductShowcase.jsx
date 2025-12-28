import React from 'react';
import { PRODUCTS_DATA } from '../data/products';

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

const PRODUCTS = PRODUCTS_DATA;

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
  // Extraer solo números si el ID contiene texto (ej: "kit-123" -> "123")
  // Si el ID ya es numérico, lo usa directamente
  const numericId = String(productId).match(/\d+/)?.[0] || productId;

  // Crear slug del título: minúsculas, sin acentos, espacios -> guiones
  const slug = productTitle
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Quitar caracteres especiales excepto espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Espacios -> guiones
    .replace(/-+/g, '-'); // Multiple guiones -> uno solo

  return `https://mercagarage.com/inicio/${numericId}-${slug}.html`;
}

export default function ProductShowcase() {
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // ✅ NUEVO: filtros + buscador
  const [filterId, setFilterId] = React.useState('manguitos');
  const [q, setQ] = React.useState('');

  // ✅ El “seleccionado” sigue siendo un índice, pero ahora sobre una lista filtrada
  const [selectedProduct, setSelectedProduct] = React.useState(0);
  // ✅ NUEVO: paginación
  const [currentPage, setCurrentPage] = React.useState(0);
  const ITEMS_PER_PAGE = 3;
  // ✅ NUEVO: modal
  const [openModal, setOpenModal] = React.useState(false);
  const [imageZoomed, setImageZoomed] = React.useState(false);
  const closeBtnRef = React.useRef(null);

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

  // ✅ Conteo de productos por tipo
  const productCounts = React.useMemo(() => {
    const base = PRODUCTS.filter(p => p.featured);
    return {
      manguito: base.filter(p => p.type === 'manguito').length,
      radiador: base.filter(p => p.type === 'radiador').length,
    };
  }, []);
  // ✅ Lista de “destacados” (featured) con filtro + búsqueda
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
  }, [activeType, q]);

  // ✅ Si cambia filtro/búsqueda y el índice se queda fuera, lo reseteamos
  React.useEffect(() => {
    if (selectedProduct >= featuredList.length) {
      setSelectedProduct(0);
    }
    setCurrentPage(0);
  }, [featuredList.length, selectedProduct]);

  const currentProduct = featuredList[selectedProduct] || featuredList[0];

  // ✅ Paginación: productos visibles en página actual
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const visibleProducts = featuredList.slice(startIndex, endIndex);
  const totalPages = Math.ceil(featuredList.length / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  // ✅ A11y modal: focus al abrir + ESC para cerrar
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

  if (!currentProduct) {
    return null;
  }

  const priceText = formatEUR(currentProduct.price);

  return (
    <section
      style={{
        ...styles.container,
        flexDirection: 'column',
        gap: isMobile ? '2rem' : '3rem',
        padding: isMobile ? '3rem 1.5rem' : '5rem 8%',
      }}
    >
      {/* Título principal de la sección */}
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
          MANGUITOS Y RADIADORES
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

      {/* Contenedor principal con dos columnas */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '2rem' : '4rem',
          width: '100%',
        }}
      >
        {/* Left Side - Product Info */}
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
              {currentProduct.brand}
            </p>

            <h2
              style={{
                ...styles.productName,
                fontSize: isSmall ? 32 : isMobile ? 40 : isTablet ? 48 : 56,
              }}
            >
              {currentProduct.title}
            </h2>

            {(currentProduct.variant ||
              currentProduct.engine ||
              currentProduct.subtitle) && (
              <p
                style={{
                  ...styles.subtitle,
                  fontSize: isSmall ? 16 : isMobile ? 18 : 20,
                }}
              >
                {currentProduct.subtitle || currentProduct.variant || ''}
                {currentProduct.engine ? ` • ${currentProduct.engine}` : ''}
              </p>
            )}
          </div>

          <div style={styles.materialSection}>
            <span style={styles.materialLabel}>
              {currentProduct.type.toUpperCase()}
            </span>
            <p style={styles.materialText}>{currentProduct.model || '—'}</p>
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

          {/* ✅ (1) MINI IMAGEN EN EL HUECO EN BLANCO (zona aspa roja) */}
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
            {currentProduct.imageSrc ? (
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
                    src={currentProduct.imageSrc}
                    alt={
                      currentProduct.alt || `Imagen de ${currentProduct.title}`
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
                        src={currentProduct.imageSrc}
                        alt={
                          currentProduct.alt ||
                          `Imagen ampliada de ${currentProduct.title}`
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
            {/* (Opcional) precio si existe */}
            {priceText ? (
              <div style={styles.priceContainer}>
                <span style={styles.priceLabel}>PRECIO</span>
                <div style={styles.priceRow}>
                  <span style={styles.priceAmount}>
                    {Number(currentProduct.price).toFixed(2).replace('.', ',')}
                  </span>
                  <span style={styles.priceCurrency}>€</span>
                </div>
              </div>
            ) : null}

            {/* ✅ (2) Botón VER DETALLES => abre modal */}
            <button
              type="button"
              style={styles.ctaButton}
              onClick={() => setOpenModal(true)}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = COLORS.darkRed;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = COLORS.red;
              }}
              aria-label={`Ver detalles de ${currentProduct.title}`}
            >
              VER DETALLES
            </button>
          </div>
        </div>

        {/* Right Side - Featured Selector + Filters */}
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

          {/* ✅ (3) Buscador + botones de filtro */}
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

          {/* ✅ Navegación de paginación */}
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
                  if (hasPrevPage) {
                    e.currentTarget.style.background = 'rgba(224,30,55,0.10)';
                  }
                }}
                onMouseLeave={e => {
                  if (hasPrevPage) {
                    e.currentTarget.style.background = '#FFFFFF';
                  }
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
                  if (hasNextPage) {
                    e.currentTarget.style.background = 'rgba(224,30,55,0.10)';
                  }
                }}
                onMouseLeave={e => {
                  if (hasNextPage) {
                    e.currentTarget.style.background = '#FFFFFF';
                  }
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
                            ? 'MANGUITO'
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

      {/* ✅ MODAL: ficha completa + link compra */}
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
            overflowY: 'auto',
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
              overflow: 'auto',
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
                  {currentProduct.brand} · {currentProduct.type.toUpperCase()}
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
                  {currentProduct.title}
                </div>
                {currentProduct.subtitle ? (
                  <div
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 14,
                      color: COLORS.gray,
                      marginTop: 6,
                    }}
                  >
                    {currentProduct.subtitle}
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
                  src={currentProduct.imageLargeSrc || currentProduct.imageSrc}
                  alt={
                    currentProduct.alt || `Imagen de ${currentProduct.title}`
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

              {/* Overlay de zoom */}
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
                      currentProduct.imageLargeSrc || currentProduct.imageSrc
                    }
                    alt={
                      currentProduct.alt ||
                      `Imagen ampliada de ${currentProduct.title}`
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
                <div
                  style={{
                    borderLeft: `4px solid ${COLORS.red}`,
                    paddingLeft: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 11,
                      letterSpacing: '2px',
                      color: COLORS.red,
                      fontWeight: 800,
                    }}
                  >
                    COMPATIBILIDAD
                  </div>
                  <div
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      color: COLORS.black,
                      fontSize: 14,
                      marginTop: 6,
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {(currentProduct.vehicles || []).slice(0, 8).join(' · ') ||
                      '—'}
                  </div>
                </div>

                <div
                  style={{
                    border: '1px solid rgba(0,0,0,0.10)',
                    borderRadius: 14,
                    padding: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
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
                    </div>
                  </div>

                  <a
                    href={generateMercagarageUrl(
                      currentProduct.id,
                      currentProduct.title
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
                    }}
                    aria-label={`Comprar ${currentProduct.title} en Mercagarage (se abre en una pestaña nueva)`}
                  >
                    COMPRAR ↗
                  </a>
                </div>

                {/* Información adicional del producto */}
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
                        {currentProduct.reference || currentProduct.id || '—'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontWeight: 700, minWidth: 80 }}>
                        Modelo compatible:
                      </span>
                      <span style={{ color: COLORS.gray }}>
                        {currentProduct.vehicles &&
                        currentProduct.vehicles.length > 0
                          ? currentProduct.vehicles.join(', ')
                          : currentProduct.model || '—'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontWeight: 700, minWidth: 80 }}>
                        Stock:
                      </span>
                      <span
                        style={{
                          color: currentProduct.inStock ? '#10B981' : '#EF4444',
                          fontWeight: 700,
                        }}
                      >
                        {currentProduct.inStock ? '✓ Disponible' : '✗ Agotado'}
                      </span>
                    </div>

                    {currentProduct.tags && currentProduct.tags.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                          marginTop: 4,
                        }}
                      >
                        <span style={{ fontWeight: 700, minWidth: 80 }}>
                          Etiquetas:
                        </span>
                        <div
                          style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
                        >
                          {currentProduct.tags.slice(0, 5).map((tag, i) => (
                            <span
                              key={i}
                              style={{
                                background: 'rgba(224,30,55,0.10)',
                                color: COLORS.red,
                                padding: '2px 8px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                fontFamily: 'ui-monospace, monospace',
                                letterSpacing: '0.5px',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div
              style={{
                padding: 18,
                borderTop: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 12,
                  color: COLORS.gray,
                }}
              >
                LEGGOX · Ingenius Parts powered by Mercagarage
              </span>

              <button
                type="button"
                onClick={() => setOpenModal(false)}
                style={{
                  border: '1px solid rgba(0,0,0,0.12)',
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                CERRAR
              </button>
            </div>
          </div>
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
