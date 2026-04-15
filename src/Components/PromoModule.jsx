import React, { useEffect, useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import PayPalCheckout from './PayPalCheckout';
import ProductModal from './ProductModal';

// ✅ Iconos SVG
function IconFlash({ size = 14, color = 'currentColor' }) {
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
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

function IconWhatsApp({ size = 16, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconExternalLink({ size = 16, color = 'currentColor' }) {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconZoomIn({ size = 20, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
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

function IconChevronLeft({ size = 24, color = 'currentColor' }) {
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconChevronRight({ size = 24, color = 'currentColor' }) {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconFileInfo({ size = 16, color = 'currentColor' }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="13" x2="12" y2="17" />
      <line x1="12" y1="13" x2="9" y2="13" />
    </svg>
  );
}

function IconShoppingCart({ size = 16, color = 'currentColor' }) {
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
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconPayPal({ size = 16, color = 'currentColor' }) {
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
      <path d="M7 8h2l1-6H5L4 8h3z" />
      <circle cx="15" cy="12" r="6" />
      <path d="M15 10v4M13 12h4" />
    </svg>
  );
}

/**
 * LEGGOX — PROMO MODULE (OFERTAS REALES)
 * - Usa el JSON de productos (manguitos + radiadores) y destaca SOLO los que estén en oferta.
 * - Cards con: badge OFERTA, precio antes tachado, precio ahora, ahorro €, stock, CTA a Mercagarage (_blank).
 * - Mantiene estética LEGGOX (negro/blanco/rojo) y es responsive + a11y.
 *
 * ✅ Cómo usar:
 * <PromoModule products={PRODUCTS_JSON} />
 *
 * ✅ Requisito del JSON (mínimo):
 * {
 *   id, title, type: 'manguito'|'radiador',
 *   vehicles: ['SEAT 127', ...] (opcional),
 *   price: 179,
 *   oldPrice: 199 (si está en oferta),
 *   onSale: true (o lo deduce si oldPrice > price),
 *   inStock: true|false,
 *   buyUrl: "https://mercagarage.com/recambios/....html",
 *   images: { sketch?: '...', real?: '...' }
 * }
 */

const COLORS = {
  black: '#000000',
  darkGray: '#1A1A1A',
  white: '#FFFFFF',
  red: '#E01E37',
  darkRed: '#DC143C',
  ink70: 'rgba(255,255,255,0.70)',
  ink40: 'rgba(255,255,255,0.40)',
  ink20: 'rgba(255,255,255,0.20)',
  panel: 'rgba(224,30,55,0.10)',
  card: 'rgba(255,255,255,0.06)',
};

function formatEUR(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount)))
    return '—';
  return Number(amount).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Col({ style, children, ...rest }) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
function Row({ style, children, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', ...style }} {...rest}>
      {children}
    </div>
  );
}
function Text({ as: Tag = 'div', style, children, ...rest }) {
  return (
    <Tag
      style={{
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
function Mono({ as: Tag = 'div', style, children, ...rest }) {
  return (
    <Tag
      style={{
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function SaleBadge({ children = '¡OFERTA!' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderRadius: 999,
        backgroundColor: COLORS.red,
        color: COLORS.white,
        fontWeight: 900,
        letterSpacing: '1px',
        fontSize: 11,
        textTransform: 'uppercase',
        boxShadow: '0 10px 30px rgba(224,30,55,0.35)',
        fontFamily: 'APERCU, sans-serif',
      }}
    >
      <IconFlash size={14} color="#FFFFFF" />
      {children}
    </span>
  );
}

function StockPill({ inStock }) {
  const label = inStock ? 'Disponible' : 'No disponible';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 999,
        border: `1px solid ${COLORS.ink20}`,
        color: inStock ? 'rgba(255,255,255,0.85)' : COLORS.ink70,
        backgroundColor: 'rgba(0,0,0,0.25)',
        fontSize: 12,
        fontWeight: 800,
        fontFamily: 'APERCU, sans-serif',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          backgroundColor: inStock ? '#2ECC71' : COLORS.red,
        }}
      />
      {label}
    </span>
  );
}

function PromoCard({ item, isMobile, onViewDetails }) {
  const {
    title,
    type,
    price,
    oldPrice,
    onSale,
    inStock,
    buyUrl,
    images,
    vehicles,
  } = item;

  const [imageZoomed, setImageZoomed] = React.useState(false);

  const cover = images?.sketch || images?.real;
  const inferredOnSale = Boolean(
    onSale || (oldPrice && price && oldPrice > price),
  );
  const safeOld = inferredOnSale ? oldPrice : null;

  const savings =
    inferredOnSale && safeOld && price
      ? Math.max(0, Number(safeOld) - Number(price))
      : 0;

  const savingsPct =
    inferredOnSale && safeOld && price
      ? clamp(
          Math.round(
            ((Number(safeOld) - Number(price)) / Number(safeOld)) * 100,
          ),
          1,
          95,
        )
      : 0;

  return (
    <article
      style={{
        borderRadius: 18,
        border: `1px solid ${COLORS.ink20}`,
        background: COLORS.white,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ padding: isMobile ? 14 : 16 }}>
        <Row
          style={{
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <Col style={{ gap: 8, minWidth: 0 }}>
            <Mono
              style={{
                color: COLORS.darkGray,
                fontSize: 11,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              {type?.toUpperCase() || 'PRODUCTO'}
            </Mono>

            <Text
              as="h3"
              style={{
                margin: 0,
                color: COLORS.black,
                fontWeight: 900,
                letterSpacing: -0.4,
                lineHeight: 1.15,
                fontSize: isMobile ? 16 : 18,
              }}
            >
              {title}
            </Text>

            {Array.isArray(vehicles) && vehicles.length > 0 && (
              <Text
                style={{
                  color: COLORS.darkGray,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isMobile ? '75vw' : '520px',
                }}
                title={vehicles.join(' · ')}
              >
                Compatibilidad: {vehicles.join(' · ')}
              </Text>
            )}
          </Col>

          {inferredOnSale ? <SaleBadge /> : null}
        </Row>

        {/* Image + Price */}
        <Row
          style={{
            marginTop: 14,
            gap: 14,
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          {/* Image */}
          <div
            style={{
              position: 'relative',
              borderRadius: 16,
              border: `1px solid ${COLORS.darkGray}`,
              backgroundColor: '#F5F5F5',
              overflow: 'hidden',
              width: isMobile ? '100%' : 220,
              aspectRatio: isMobile ? '16/9' : '4/3',
              display: 'grid',
              placeItems: 'center',
              cursor: cover ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
            }}
            aria-label={cover ? `Imagen de ${title}` : 'Sin imagen'}
            onClick={() => cover && setImageZoomed(true)}
            onMouseEnter={e => {
              if (cover) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={e => {
              if (cover) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {cover ? (
              <>
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
                {/* Icono de lupa */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 8,
                    padding: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'none',
                  }}
                >
                  <IconZoomIn size={16} color="#FFFFFF" />
                </div>

                {/* Zoom overlay */}
                {imageZoomed && (
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      setImageZoomed(false);
                    }}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      background: 'rgba(0,0,0,0.95)',
                      backdropFilter: 'blur(10px)',
                      zIndex: 999999,
                      display: 'grid',
                      placeItems: 'center',
                      padding: 20,
                      cursor: 'zoom-out',
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setImageZoomed(false);
                        }}
                        style={{
                          position: 'absolute',
                          top: -50,
                          right: 0,
                          background: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          color: 'white',
                          padding: '10px 16px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          fontWeight: 800,
                          fontSize: 14,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background =
                            'rgba(255,255,255,0.25)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background =
                            'rgba(255,255,255,0.15)';
                        }}
                      >
                        ✕ Cerrar
                      </button>
                      <img
                        src={cover}
                        alt={title}
                        style={{
                          maxWidth: '95vw',
                          maxHeight: '95vh',
                          objectFit: 'contain',
                          display: 'block',
                          borderRadius: 12,
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Mono style={{ color: COLORS.darkGray, fontSize: 12 }}>
                Sin imagen
              </Mono>
            )}
          </div>

          {/* Price block */}
          <Col style={{ flex: 1, gap: 10 }}>
            <Row
              style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <StockPill inStock={Boolean(inStock)} />
              {inferredOnSale ? (
                <Mono
                  style={{
                    color: 'rgba(224,30,55,0.9)',
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  Ahorro {formatEUR(savings)} · {savingsPct}% OFF
                </Mono>
              ) : null}
            </Row>

            <Row style={{ alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              {inferredOnSale && safeOld ? (
                <Text
                  style={{
                    color: '#999999',
                    fontWeight: 800,
                    textDecoration: 'line-through',
                    textDecorationThickness: 2,
                    fontSize: isMobile ? 14 : 15,
                  }}
                >
                  {formatEUR(safeOld)}
                </Text>
              ) : null}

              <Text
                style={{
                  color: COLORS.black,
                  fontWeight: 900,
                  letterSpacing: -0.8,
                  fontSize: isMobile ? 26 : 30,
                }}
              >
                {formatEUR(price)}
              </Text>
            </Row>

            <Row style={{ gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={onViewDetails}
                aria-label={`Ver ficha completa de ${title}`}
                style={{
                  flex: 1,
                  minWidth: isMobile ? '100%' : 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  backgroundColor: COLORS.red,
                  color: COLORS.white,
                  textDecoration: 'none',
                  fontWeight: 900,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  fontSize: 13,
                  border: `1px solid ${COLORS.red}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'APERCU, sans-serif',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = COLORS.darkRed;
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = COLORS.red;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <IconFileInfo size={16} color="#FFFFFF" />
                Ver ficha completa
              </button>

              {inStock ? (
                <a
                  href={buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Comprar ${title} en Mercagarage (se abre en una pestaña nueva)`}
                  style={{
                    flex: isMobile ? 1 : 0,
                    minWidth: isMobile ? '100%' : 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 12,
                    backgroundColor: '#1E90FF',
                    color: COLORS.white,
                    textDecoration: 'none',
                    fontWeight: 900,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    fontSize: 13,
                    border: '1px solid #1E90FF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'APERCU, sans-serif',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#1C7ED6';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#1E90FF';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <IconShoppingCart size={16} color="#FFFFFF" />
                  Comprar
                </a>
              ) : null}
            </Row>

            <Mono
              style={{ color: COLORS.darkGray, fontSize: 12, lineHeight: 1.5 }}
            >
              {inferredOnSale ? '🔥 ' : ''}Oferta limitada. Piezas premium para
              clásicos Leggox.
            </Mono>
          </Col>
        </Row>
      </div>
    </article>
  );
}

/**
 * Ya no usa FALLBACK_PRODUCTS - consume directamente de la API
 */

export default function PromoModule({
  titleTop = 'OFERTAS LEGGOX',
  subtitle = 'Solo por tiempo limitado · Radiadores y manguitos con descuento',
  ctaLabel = 'Ver todas las piezas',
  ctaHref = 'https://mercagarage.com/',
  autoPlay = false,
  autoPlayInterval = 5000,
}) {
  // ✅ Consumir productos de la API
  const { products: apiProducts, loading, error } = useProducts();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );

  // 🎠 Estado del carrusel
  const [currentPage, setCurrentPage] = useState(0);

  // 📋 Estado del modal de ficha
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 🔍 Estado de la vista de todas las ofertas
  const [showAllOffersView, setShowAllOffersView] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmall = windowWidth < 480;

  const all = apiProducts;

  // Solo ofertas: onSale===true O oldPrice>price
  const saleItems = useMemo(() => {
    return all
      .filter(p => {
        const onSale = Boolean(
          p.onSale || (p.oldPrice && p.price && p.oldPrice > p.price),
        );
        return onSale;
      })
      .sort((a, b) => {
        // mayor ahorro primero
        const sa = (a.oldPrice || 0) - (a.price || 0);
        const sb = (b.oldPrice || 0) - (b.price || 0);
        return sb - sa;
      });
  }, [all]);

  // 🎠 Lógica del carrusel
  const itemsPerPage = isMobile ? 1 : 2;
  const totalPages = Math.ceil(saleItems.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleItems = saleItems.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = page => {
    setCurrentPage(page);
  };

  // 🎠 Auto-play
  useEffect(() => {
    if (!autoPlay || saleItems.length <= itemsPerPage) return;

    const interval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % totalPages);
    }, autoPlayInterval);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, autoPlayInterval, saleItems.length, itemsPerPage, totalPages]);

  // 📋 Bloquear scroll cuando modal está abierto
  useEffect(() => {
    if (openModal) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [openModal]);

  const handleViewDetails = product => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  return (
    <section
      aria-label="Promoción Leggox: productos en oferta"
      style={{
        backgroundColor: COLORS.black,
        color: COLORS.white,
        width: '100%',
        padding: isMobile ? '3rem 1rem' : '4.5rem 6%',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Header */}
        <Row
          style={{
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 18,
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <Col style={{ gap: 10 }}>
            <Mono
              style={{
                color: 'rgba(224,30,55,0.95)',
                fontWeight: 900,
                letterSpacing: 2,
                fontSize: 12,
                textTransform: 'uppercase',
              }}
            >
              {titleTop}
            </Mono>

            <Text
              as="h2"
              style={{
                margin: 0,
                fontFamily: 'APERCU, sans-serif',
                fontWeight: 400,
                letterSpacing: isSmall ? -0.6 : -1.2,
                lineHeight: 1.05,
                fontSize: isSmall ? 34 : isMobile ? 40 : 56,
              }}
            >
              Productos en oferta
            </Text>

            <Text style={{ color: COLORS.ink70, fontSize: isMobile ? 14 : 16 }}>
              {subtitle}
            </Text>

            <div
              style={{
                height: 3,
                width: 320,
                maxWidth: '70vw',
                backgroundColor: COLORS.red,
              }}
            />
          </Col>

          <button
            onClick={() => setShowAllOffersView(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '12px 18px',
              borderRadius: 12,
              backgroundColor: COLORS.red,
              color: COLORS.white,
              border: `1px solid ${COLORS.red}`,
              fontWeight: 900,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              fontFamily:
                'ui-monospace, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = COLORS.darkRed;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = COLORS.red;
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Ver todas las ofertas"
          >
            VER TODAS LAS OFERTAS <span aria-hidden="true">→</span>
          </button>
        </Row>

        {/* Body */}
        <div style={{ marginTop: 24 }}>
          {loading ? (
            <div
              style={{
                borderRadius: 18,
                border: `1px solid ${COLORS.ink20}`,
                backgroundColor: COLORS.panel,
                padding: 18,
                textAlign: 'center',
              }}
            >
              <Text
                style={{ fontWeight: 900, fontSize: 16, color: COLORS.ink70 }}
              >
                ⏳ Cargando ofertas...
              </Text>
            </div>
          ) : error ? (
            <div
              style={{
                borderRadius: 18,
                border: `1px solid ${COLORS.red}`,
                backgroundColor: 'rgba(224,30,55,0.05)',
                padding: 18,
              }}
            >
              <Text
                style={{ fontWeight: 900, fontSize: 16, color: COLORS.red }}
              >
                ❌ Error al cargar ofertas
              </Text>
              <Text style={{ color: COLORS.ink70, marginTop: 6, fontSize: 13 }}>
                {error}
              </Text>
            </div>
          ) : saleItems.length === 0 ? (
            <div
              style={{
                borderRadius: 18,
                border: `1px solid ${COLORS.ink20}`,
                backgroundColor: COLORS.panel,
                padding: 18,
              }}
            >
              <Text style={{ fontWeight: 900, fontSize: 16 }}>
                Ahora mismo no hay ofertas activas.
              </Text>
              <Text style={{ color: COLORS.ink70, marginTop: 6, fontSize: 13 }}>
                Pronto habrá nuevas ofertas en radiadores y manguitos.
              </Text>
            </div>
          ) : (
            <>
              {/* 🎠 Carrusel de ofertas */}
              <div style={{ position: 'relative' }}>
                {/* Contenedor de items */}
                <div
                  role="list"
                  aria-label="Carrusel de productos en oferta"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: 14,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  {visibleItems.map(item => (
                    <div role="listitem" key={item.id}>
                      <PromoCard
                        item={item}
                        isMobile={isMobile}
                        onViewDetails={() => handleViewDetails(item)}
                      />
                    </div>
                  ))}
                </div>

                {/* Controles de navegación - Solo si hay más de 1 página */}
                {totalPages > 1 && (
                  <>
                    {/* Botón anterior */}
                    <button
                      onClick={goToPrevPage}
                      aria-label="Oferta anterior"
                      style={{
                        position: 'absolute',
                        left: isMobile ? -10 : -20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: COLORS.red,
                        color: COLORS.white,
                        border: 'none',
                        borderRadius: '50%',
                        width: isMobile ? 40 : 48,
                        height: isMobile ? 40 : 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(224,30,55,0.3)',
                        transition: 'all 0.2s ease',
                        zIndex: 10,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform =
                          'translateY(-50%) scale(1.1)';
                        e.currentTarget.style.boxShadow =
                          '0 6px 20px rgba(224,30,55,0.4)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform =
                          'translateY(-50%) scale(1)';
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px rgba(224,30,55,0.3)';
                      }}
                    >
                      <IconChevronLeft
                        size={isMobile ? 20 : 24}
                        color={COLORS.white}
                      />
                    </button>

                    {/* Botón siguiente */}
                    <button
                      onClick={goToNextPage}
                      aria-label="Siguiente oferta"
                      style={{
                        position: 'absolute',
                        right: isMobile ? -10 : -20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: COLORS.red,
                        color: COLORS.white,
                        border: 'none',
                        borderRadius: '50%',
                        width: isMobile ? 40 : 48,
                        height: isMobile ? 40 : 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(224,30,55,0.3)',
                        transition: 'all 0.2s ease',
                        zIndex: 10,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform =
                          'translateY(-50%) scale(1.1)';
                        e.currentTarget.style.boxShadow =
                          '0 6px 20px rgba(224,30,55,0.4)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform =
                          'translateY(-50%) scale(1)';
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px rgba(224,30,55,0.3)';
                      }}
                    >
                      <IconChevronRight
                        size={isMobile ? 20 : 24}
                        color={COLORS.white}
                      />
                    </button>
                  </>
                )}
              </div>

              {/* Indicadores de página */}
              {totalPages > 1 && (
                <Row
                  style={{
                    marginTop: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToPage(idx)}
                      aria-label={`Ir a página ${idx + 1}`}
                      aria-current={currentPage === idx ? 'true' : 'false'}
                      style={{
                        width: currentPage === idx ? 32 : 10,
                        height: 10,
                        borderRadius: 999,
                        backgroundColor:
                          currentPage === idx ? COLORS.red : COLORS.ink20,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={e => {
                        if (currentPage !== idx) {
                          e.currentTarget.style.backgroundColor = COLORS.ink40;
                        }
                      }}
                      onMouseLeave={e => {
                        if (currentPage !== idx) {
                          e.currentTarget.style.backgroundColor = COLORS.ink20;
                        }
                      }}
                    />
                  ))}
                </Row>
              )}
            </>
          )}
        </div>

        {/* Footer note */}
        {saleItems.length > 0 && (
          <Row
            style={{
              marginTop: 16,
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Mono style={{ fontSize: 12, color: COLORS.ink40 }}>
              {saleItems.length} oferta{saleItems.length === 1 ? '' : 's'}{' '}
              disponible{saleItems.length === 1 ? '' : 's'}
            </Mono>
            {totalPages > 1 && (
              <Mono style={{ fontSize: 12, color: COLORS.ink40 }}>
                Página {currentPage + 1} de {totalPages}
              </Mono>
            )}
          </Row>
        )}
      </div>

      {/* 📋 MODAL DE FICHA DE PRODUCTO */}
      <ProductModal
        product={selectedProduct}
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedProduct(null);
        }}
      />

      {/* 🎯 VISTA DE TODAS LAS OFERTAS */}
      {showAllOffersView && (
        <AllOffersView
          offers={saleItems}
          onClose={() => setShowAllOffersView(false)}
          onViewDetails={handleViewDetails}
          isMobile={isMobile}
        />
      )}
    </section>
  );
}

// 🎯 Componente de Vista Completa de Ofertas
function AllOffersView({ offers, onClose, onViewDetails, isMobile }) {
  const [filterType, setFilterType] = React.useState('all'); // 'all', 'manguito', 'radiador'
  const [filterModel, setFilterModel] = React.useState('all'); // 'all' o modelo específico
  const [sortBy, setSortBy] = React.useState('discount'); // 'discount', 'price', 'name'

  // Extraer modelos únicos de los productos
  const availableModels = React.useMemo(() => {
    const models = new Set();
    offers.forEach(offer => {
      if (offer.model) models.add(offer.model);
      if (Array.isArray(offer.vehicles)) {
        offer.vehicles.forEach(v => {
          // Extraer modelo del nombre del vehículo
          const match = v.match(/SEAT\s+(\d+|[A-Z]+)/i);
          if (match) models.add(match[1]);
        });
      }
    });
    return Array.from(models).sort();
  }, [offers]);

  // Filtrar ofertas
  const filteredOffers = React.useMemo(() => {
    let result = [...offers];

    // Filtrar por tipo
    if (filterType !== 'all') {
      result = result.filter(offer => offer.type === filterType);
    }

    // Filtrar por modelo
    if (filterModel !== 'all') {
      result = result.filter(offer => {
        const modelMatch = offer.model === filterModel;
        const vehicleMatch =
          Array.isArray(offer.vehicles) &&
          offer.vehicles.some(v => v.includes(filterModel));
        return modelMatch || vehicleMatch;
      });
    }

    // Ordenar
    if (sortBy === 'discount') {
      result.sort((a, b) => {
        const discountA = (a.oldPrice || 0) - (a.price || 0);
        const discountB = (b.oldPrice || 0) - (b.price || 0);
        return discountB - discountA;
      });
    } else if (sortBy === 'price') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }, [offers, filterType, filterModel, sortBy]);

  React.useEffect(() => {
    // Bloquear scroll del body cuando esta vista está abierta
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: COLORS.black,
        zIndex: 99998,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: COLORS.black,
          borderBottom: `2px solid ${COLORS.red}`,
          padding: isMobile ? '16px 20px' : '24px 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div>
            <Mono
              style={{
                color: COLORS.red,
                fontSize: 12,
                letterSpacing: '2px',
                fontWeight: 900,
              }}
            >
              LEGGOX CLASSICS
            </Mono>
            <Text
              as="h1"
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: isMobile ? 28 : 42,
                fontWeight: 900,
                color: COLORS.white,
                marginTop: 8,
                letterSpacing: '-1.5px',
              }}
            >
              Todas las ofertas
            </Text>
            <Text
              style={{
                color: COLORS.ink70,
                fontSize: isMobile ? 14 : 16,
                marginTop: 6,
              }}
            >
              {filteredOffers.length}{' '}
              {filteredOffers.length === 1
                ? 'oferta disponible'
                : 'ofertas disponibles'}
            </Text>
          </div>

          <button
            onClick={onClose}
            style={{
              background: COLORS.red,
              border: `1px solid ${COLORS.red}`,
              borderRadius: 12,
              padding: isMobile ? '12px 16px' : '12px 20px',
              color: COLORS.white,
              fontWeight: 900,
              fontSize: isMobile ? 14 : 16,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              fontFamily: 'ui-monospace, monospace',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = COLORS.darkRed;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = COLORS.red;
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Cerrar vista de ofertas"
          >
            {isMobile ? '✕' : '✕ CERRAR'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div
        style={{
          background: COLORS.darkGray,
          padding: isMobile ? '16px 20px' : '20px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 16,
            alignItems: isMobile ? 'stretch' : 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Filtro por tipo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Mono
              style={{
                color: COLORS.ink70,
                fontSize: 11,
                letterSpacing: '1.5px',
                fontWeight: 800,
              }}
            >
              TIPO DE PIEZA
            </Mono>
            <Row style={{ gap: 8 }}>
              {[
                { id: 'all', label: 'Todas' },
                { id: 'manguito', label: 'Manguitos' },
                { id: 'radiador', label: 'Radiadores' },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: `1px solid ${filterType === type.id ? COLORS.red : COLORS.ink20}`,
                    background:
                      filterType === type.id ? COLORS.red : 'transparent',
                    color: filterType === type.id ? COLORS.white : COLORS.ink70,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                  onMouseEnter={e => {
                    if (filterType !== type.id) {
                      e.currentTarget.style.borderColor = COLORS.red;
                      e.currentTarget.style.color = COLORS.white;
                    }
                  }}
                  onMouseLeave={e => {
                    if (filterType !== type.id) {
                      e.currentTarget.style.borderColor = COLORS.ink20;
                      e.currentTarget.style.color = COLORS.ink70;
                    }
                  }}
                >
                  {type.label}
                </button>
              ))}
            </Row>
          </div>

          {/* Filtro por modelo */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              flex: 1,
            }}
          >
            <Mono
              style={{
                color: COLORS.ink70,
                fontSize: 11,
                letterSpacing: '1.5px',
                fontWeight: 800,
              }}
            >
              MODELO
            </Mono>
            <select
              value={filterModel}
              onChange={e => setFilterModel(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${COLORS.ink20}`,
                background: COLORS.black,
                color: COLORS.white,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'ui-monospace, monospace',
                maxWidth: isMobile ? '100%' : 200,
              }}
            >
              <option value="all">Todos los modelos</option>
              {availableModels.map(model => (
                <option key={model} value={model}>
                  SEAT {model}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenar por */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Mono
              style={{
                color: COLORS.ink70,
                fontSize: 11,
                letterSpacing: '1.5px',
                fontWeight: 800,
              }}
            >
              ORDENAR POR
            </Mono>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${COLORS.ink20}`,
                background: COLORS.black,
                color: COLORS.white,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'ui-monospace, monospace',
                maxWidth: isMobile ? '100%' : 180,
              }}
            >
              <option value="discount">Mayor descuento</option>
              <option value="price">Precio: menor a mayor</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div
        style={{
          flex: 1,
          background: COLORS.black,
          padding: isMobile ? '20px' : '40px',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          {filteredOffers.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                border: `1px solid ${COLORS.ink20}`,
                borderRadius: 18,
                background: COLORS.darkGray,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: COLORS.white,
                  marginBottom: 12,
                }}
              >
                No se encontraron ofertas
              </Text>
              <Text style={{ color: COLORS.ink70, fontSize: 14 }}>
                Intenta cambiar los filtros para ver más productos
              </Text>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? '1fr'
                  : 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: 20,
              }}
            >
              {filteredOffers.map(offer => (
                <OfferCardFull
                  key={offer.id}
                  item={offer}
                  isMobile={isMobile}
                  onViewDetails={() => onViewDetails(offer)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 🎴 Card de oferta para la vista completa
function OfferCardFull({ item, isMobile, onViewDetails }) {
  const {
    title,
    type,
    price,
    oldPrice,
    onSale,
    inStock,
    buyUrl,
    images,
    vehicles,
    brand,
  } = item;

  const cover = images?.sketch || images?.real;
  const inferredOnSale = Boolean(
    onSale || (oldPrice && price && oldPrice > price),
  );
  const safeOld = inferredOnSale ? oldPrice : null;

  const savings =
    inferredOnSale && safeOld && price
      ? Math.max(0, Number(safeOld) - Number(price))
      : 0;

  const savingsPct =
    inferredOnSale && safeOld && price
      ? clamp(
          Math.round(
            ((Number(safeOld) - Number(price)) / Number(safeOld)) * 100,
          ),
          1,
          95,
        )
      : 0;

  return (
    <article
      style={{
        borderRadius: 18,
        border: `1px solid ${COLORS.ink20}`,
        background: COLORS.white,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onClick={onViewDetails}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(224,30,55,0.25)';
        e.currentTarget.style.borderColor = COLORS.red;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = COLORS.ink20;
      }}
    >
      {/* Imagen */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/10',
          background: 'linear-gradient(135deg, #F5F5F5 0%, #E8E8E8 100%)',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt={title}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: 16,
            }}
          />
        ) : (
          <Mono style={{ color: COLORS.darkGray, fontSize: 12 }}>
            Sin imagen
          </Mono>
        )}

        {/* Badge de oferta */}
        {inferredOnSale && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: COLORS.red,
              color: COLORS.white,
              padding: '8px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '1px',
              boxShadow: '0 4px 12px rgba(224,30,55,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <IconFlash size={12} color="#FFFFFF" />-{savingsPct}%
          </div>
        )}

        {/* Badge de stock */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
          }}
        >
          <StockPill inStock={Boolean(inStock)} />
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: 16 }}>
        <Row
          style={{
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
          }}
        >
          <Mono
            style={{
              color: COLORS.darkGray,
              fontSize: 11,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              fontWeight: 800,
            }}
          >
            {brand || 'SEAT'} · {type?.toUpperCase() || 'PRODUCTO'}
          </Mono>
        </Row>

        <Text
          as="h3"
          style={{
            margin: 0,
            color: COLORS.black,
            fontWeight: 900,
            letterSpacing: '-0.4px',
            lineHeight: 1.2,
            fontSize: 18,
            minHeight: 44,
          }}
        >
          {title}
        </Text>

        {Array.isArray(vehicles) && vehicles.length > 0 && (
          <Text
            style={{
              color: COLORS.darkGray,
              fontSize: 12,
              marginTop: 8,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={vehicles.join(' · ')}
          >
            {vehicles.slice(0, 2).join(' · ')}
          </Text>
        )}

        {/* Precio */}
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <Row style={{ alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            {inferredOnSale && safeOld && (
              <Text
                style={{
                  color: '#999999',
                  fontWeight: 700,
                  textDecoration: 'line-through',
                  fontSize: 14,
                }}
              >
                {formatEUR(safeOld)}
              </Text>
            )}
            <Text
              style={{
                color: COLORS.black,
                fontWeight: 900,
                letterSpacing: '-0.8px',
                fontSize: 26,
              }}
            >
              {formatEUR(price)}
            </Text>
          </Row>

          {inferredOnSale && savings > 0 && (
            <Mono
              style={{
                color: 'rgba(224,30,55,0.9)',
                fontWeight: 900,
                fontSize: 11,
              }}
            >
              Ahorras {formatEUR(savings)}
            </Mono>
          )}
        </div>

        {/* Botones de acción */}
        <div
          style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}
        >
          <button
            onClick={onViewDetails}
            aria-label={`Ver ficha completa de ${title}`}
            style={{
              flex: 1,
              minWidth: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 8,
              backgroundColor: COLORS.red,
              color: COLORS.white,
              textDecoration: 'none',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              fontSize: 12,
              border: `1px solid ${COLORS.red}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'APERCU, sans-serif',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = COLORS.darkRed;
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = COLORS.red;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <IconFileInfo size={14} color="#FFFFFF" />
            Ver detalles
          </button>

          {inStock ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Comprar ${title} en Mercagarage`}
              style={{
                flex: 1,
                minWidth: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: '#1E90FF',
                color: COLORS.white,
                textDecoration: 'none',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                fontSize: 12,
                border: '1px solid #1E90FF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'APERCU, sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#1C7ED6';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#1E90FF';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <IconShoppingCart size={14} color="#FFFFFF" />
              Comprar
            </a>
          ) : null}

          {inStock ? (
            <button
              aria-label={`Pagar ${title} con PayPal`}
              title="Pagar con PayPal"
              style={{
                flex: 1,
                minWidth: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: '#0070BA',
                color: COLORS.white,
                textDecoration: 'none',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                fontSize: 12,
                border: '1px solid #0070BA',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'APERCU, sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#005690';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#0070BA';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <IconPayPal size={14} color="#FFFFFF" />
              PayPal
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
