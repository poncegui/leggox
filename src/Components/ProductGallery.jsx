import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';

const COLORS = {
  red: '#E01E37',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#1A1A1A',
  lightGray: '#F5F5F5',
  border: '#E5E5E5',
};

// Iconos
function IconFilter() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconChevronLeft({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconChevronRight({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// Tarjeta de producto moderna
function ProductCard({ product, onClick }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Parsear datos técnicos
  let technical = {};
  try {
    technical =
      typeof product.technical === 'string' ? JSON.parse(product.technical) : product.technical || {};
  } catch (e) {
    technical = {};
  }

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

  const imageUrl = resolveImageUrl(product.imageSrc || product.imageLargeSrc || product.image_url);

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: `1px solid ${isHovered ? COLORS.red : COLORS.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 16px 32px rgba(0,0,0,0.16)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Imagen */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '1/1',
          backgroundColor: COLORS.lightGray,
          overflow: 'hidden',
        }}
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: 16,
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              color: COLORS.gray,
              opacity: 0.2,
            }}
          >
            📦
          </div>
        )}

        {/* Badges superiores - Solo AGOTADO y OFERTA */}
        {(product.onSale || !product.inStock) && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* AGOTADO - Prioridad máxima */}
            {!product.inStock && (
              <div
                style={{
                  backgroundColor: '#EF4444',
                  color: COLORS.white,
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '1px',
                }}
              >
                AGOTADO
              </div>
            )}
            {/* OFERTA - Solo si hay oferta y está en stock */}
            {product.onSale && product.inStock && (
              <div
                style={{
                  backgroundColor: COLORS.red,
                  color: COLORS.white,
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '1px',
                  boxShadow: '0 2px 8px rgba(224,30,55,0.4)',
                }}
              >
                OFERTA
              </div>
            )}
          </div>
        )}

        {/* Descuento badge */}
        {product.oldPrice && product.price && product.inStock && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: COLORS.black,
              color: COLORS.white,
              padding: '8px 12px',
              borderRadius: '50%',
              fontFamily: 'APERCU, sans-serif',
              fontSize: 14,
              fontWeight: 900,
              minWidth: 50,
              minHeight: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
          </div>
        )}
      </div>

      {/* Contenido */}
      <div
        style={{
          padding: 16,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Categoría */}
        <div
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 9,
            letterSpacing: '1.2px',
            color: COLORS.red,
            fontWeight: 800,
            marginBottom: 6,
            textTransform: 'uppercase',
          }}
        >
          {(product.type || 'PRODUCTO').toUpperCase()}
        </div>

        {/* Título */}
        <h3
          style={{
            margin: 0,
            fontFamily: 'APERCU, sans-serif',
            fontSize: 14,
            fontWeight: 800,
            color: COLORS.black,
            lineHeight: 1.3,
            marginBottom: 6,
            minHeight: 38,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.title}
        </h3>

        {/* Subtítulo */}
        {product.subtitle && (
          <p
            style={{
              margin: 0,
              fontFamily: 'APERCU, sans-serif',
              fontSize: 11,
              color: COLORS.gray,
              marginBottom: 12,
              opacity: 0.7,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.subtitle}
          </p>
        )}

        {/* Info técnica compacta */}
        {(technical.material || technical.color || technical.diameter) && (
          <div
            style={{
              marginBottom: 12,
              padding: 10,
              backgroundColor: COLORS.lightGray,
              borderRadius: 8,
              fontSize: 10,
              fontFamily: 'APERCU, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {technical.material && (
              <div style={{ color: COLORS.gray }}>
                <span style={{ fontWeight: 700 }}>Material:</span> {technical.material}
              </div>
            )}
            {technical.color && (
              <div style={{ color: COLORS.gray }}>
                <span style={{ fontWeight: 700 }}>Color:</span> {technical.color}
              </div>
            )}
            {technical.diameter && (
              <div style={{ color: COLORS.gray }}>
                <span style={{ fontWeight: 700 }}>Diámetro:</span> {technical.diameter}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          {/* Referencia */}
          {product.reference && (
            <div
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 9,
                color: COLORS.gray,
                marginBottom: 10,
                opacity: 0.6,
              }}
            >
              REF: {product.reference}
            </div>
          )}

          {/* Precio */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              marginBottom: 12,
              flexWrap: 'wrap',
            }}
          >
            {product.price ? (
              <>
                <span
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 22,
                    fontWeight: 900,
                    color: COLORS.red,
                  }}
                >
                  {product.price.toFixed(2)} €
                </span>
                {product.oldPrice && (
                  <span
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 15,
                      fontWeight: 600,
                      color: COLORS.gray,
                      textDecoration: 'line-through',
                      opacity: 0.5,
                    }}
                  >
                    {product.oldPrice.toFixed(2)} €
                  </span>
                )}
              </>
            ) : (
              <span
                style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: COLORS.gray,
                }}
              >
                Consultar precio
              </span>
            )}
          </div>

          {/* Botón */}
          <button
            style={{
              width: '100%',
              backgroundColor: product.inStock ? COLORS.red : '#CCCCCC',
              color: COLORS.white,
              border: 'none',
              borderRadius: 10,
              padding: '12px 16px',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.8px',
              cursor: product.inStock ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (product.inStock) {
                e.currentTarget.style.backgroundColor = '#C01830';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (product.inStock) {
                e.currentTarget.style.backgroundColor = COLORS.red;
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {product.inStock ? (
              <>
                <span>VER DETALLES</span>
                <span>→</span>
              </>
            ) : (
              'NO DISPONIBLE'
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

// Componente principal
export default function ProductGallery() {
  const { products, loading, error } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const [typeFilter, setTypeFilter] = useState('manguito'); // manguito, radiador
  const [sortBy, setSortBy] = useState('featured'); // featured, price-asc, price-desc, name
  const [highlightedProductId, setHighlightedProductId] = useState(null);
  const carouselRef = useRef(null);
  const productRefs = useRef({});

  // Filtrar productos destacados
  const featuredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter((p) => p.featured);
  }, [products]);

  // Aplicar filtros
  const filteredProducts = useMemo(() => {
    let filtered = featuredProducts;

    // Filtrar por tipo (ya no hay opción "all")
    filtered = filtered.filter((p) => p.type === typeFilter);

    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'featured':
        default:
          return 0;
      }
    });

    return filtered;
  }, [featuredProducts, typeFilter, sortBy]);

  // Funciones de navegación del carrusel
  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 300 : 400;
      const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  // Contadores
  const counts = useMemo(() => {
    const total = featuredProducts.length;
    const manguitos = featuredProducts.filter((p) => p.type === 'manguito').length;
    const radiadores = featuredProducts.filter((p) => p.type === 'radiador').length;
    return { total, manguitos, radiadores };
  }, [featuredProducts]);

  const handleProductClick = (product) => {
    // Guardar la posición actual del scroll y el ID del producto
    sessionStorage.setItem('catalogScrollPosition', window.scrollY.toString());
    sessionStorage.setItem('lastViewedProductId', product.id.toString());
    navigate(`/product/${product.id}`);
  };

  // Restaurar y destacar producto cuando volvemos
  useEffect(() => {
    if (location.state?.scrollTo !== undefined) {
      const lastProductId = sessionStorage.getItem('lastViewedProductId');
      if (lastProductId) {
        setHighlightedProductId(parseInt(lastProductId, 10));

        // Hacer scroll al producto después de un delay
        setTimeout(() => {
          const productElement = productRefs.current[lastProductId];
          if (productElement && carouselRef.current) {
            productElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });
          }
        }, 200);

        // Quitar el highlight después de 2 segundos
        setTimeout(() => {
          setHighlightedProductId(null);
        }, 2000);
      }
    }
  }, [location]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          backgroundColor: COLORS.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 60,
              height: 60,
              border: `4px solid ${COLORS.lightGray}`,
              borderTop: `4px solid ${COLORS.red}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }}
          />
          <p
            style={{
              fontFamily: 'APERCU, sans-serif',
              color: COLORS.gray,
              fontSize: 16,
            }}
          >
            Cargando productos...
          </p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '80vh',
          backgroundColor: COLORS.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p
            style={{
              fontFamily: 'APERCU, sans-serif',
              color: COLORS.red,
              fontSize: 18,
              marginBottom: 12,
            }}
          >
            Error cargando productos
          </p>
          <p style={{ fontFamily: 'APERCU, sans-serif', color: COLORS.gray }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      style={{
        minHeight: '80vh',
        backgroundColor: COLORS.white,
        padding: '80px 20px',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '2px',
              color: COLORS.gray,
              opacity: 0.6,
              marginBottom: 12,
            }}
          >
            CATÁLOGO LEGGOX
          </div>
          <h2
            style={{
              margin: 0,
              fontFamily: 'APERCU, sans-serif',
              fontSize: window.innerWidth < 768 ? 36 : 52,
              fontWeight: 800,
              color: COLORS.black,
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Manguitos y Radiadores
          </h2>
          <div
            style={{
              height: 4,
              width: 120,
              backgroundColor: COLORS.red,
              marginBottom: 24,
            }}
          />
          <p
            style={{
              margin: 0,
              fontFamily: 'APERCU, sans-serif',
              fontSize: 18,
              color: COLORS.gray,
              maxWidth: 600,
            }}
          >
            Encuentra las mejores piezas para tu vehículo clásico
          </p>
        </div>

        {/* Filtros y ordenación */}
        <div
          style={{
            backgroundColor: COLORS.lightGray,
            borderRadius: 16,
            padding: 24,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            {/* Filtros de tipo */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { id: 'manguito', label: 'Manguitos', count: counts.manguitos },
                { id: 'radiador', label: 'Radiadores', count: counts.radiadores },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setTypeFilter(filter.id)}
                  style={{
                    backgroundColor:
                      typeFilter === filter.id ? COLORS.black : COLORS.white,
                    color: typeFilter === filter.id ? COLORS.white : COLORS.black,
                    border: `2px solid ${
                      typeFilter === filter.id ? COLORS.black : COLORS.border
                    }`,
                    borderRadius: 25,
                    padding: '10px 20px',
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (typeFilter !== filter.id) {
                      e.currentTarget.style.backgroundColor = COLORS.lightGray;
                      e.currentTarget.style.borderColor = COLORS.black;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (typeFilter !== filter.id) {
                      e.currentTarget.style.backgroundColor = COLORS.white;
                      e.currentTarget.style.borderColor = COLORS.border;
                    }
                  }}
                >
                  <span>{filter.label}</span>
                  <span
                    style={{
                      backgroundColor:
                        typeFilter === filter.id
                          ? 'rgba(255,255,255,0.2)'
                          : COLORS.lightGray,
                      color:
                        typeFilter === filter.id ? COLORS.white : COLORS.gray,
                      borderRadius: 12,
                      padding: '2px 8px',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Ordenar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 14,
                  color: COLORS.gray,
                  fontWeight: 600,
                }}
              >
                Ordenar:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: `2px solid ${COLORS.border}`,
                  backgroundColor: COLORS.white,
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="featured">Destacados</option>
                <option value="name">Nombre A-Z</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div style={{ marginTop: 16 }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'APERCU, sans-serif',
                fontSize: 14,
                color: COLORS.gray,
              }}
            >
              Mostrando <strong>{filteredProducts.length}</strong> producto
              {filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Carrusel de productos */}
        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: COLORS.lightGray,
              borderRadius: 16,
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
            <h3
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 24,
                fontWeight: 800,
                color: COLORS.black,
                marginBottom: 12,
              }}
            >
              No hay productos disponibles
            </h3>
            <p
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 16,
                color: COLORS.gray,
              }}
            >
              Intenta con otros filtros
            </p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Botón izquierdo */}
            <button
              onClick={() => scroll('left')}
              style={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: COLORS.white,
                border: `2px solid ${COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.red;
                e.currentTarget.style.borderColor = COLORS.red;
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.white;
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <IconChevronLeft size={28} />
            </button>

            {/* Contenedor del carrusel */}
            <div
              ref={carouselRef}
              style={{
                display: 'flex',
                gap: 24,
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
                padding: '20px 0',
              }}
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  ref={el => productRefs.current[product.id] = el}
                  style={{
                    minWidth: window.innerWidth < 768 ? '240px' : '280px',
                    maxWidth: window.innerWidth < 768 ? '240px' : '280px',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'relative',
                    transition: 'all 0.3s',
                    ...(highlightedProductId === product.id && {
                      animation: 'pulse 1s ease-in-out 2',
                    })
                  }}>
                    <ProductCard
                      product={product}
                      onClick={() => handleProductClick(product)}
                    />
                    {highlightedProductId === product.id && (
                      <div style={{
                        position: 'absolute',
                        inset: -4,
                        border: `3px solid ${COLORS.red}`,
                        borderRadius: 18,
                        pointerEvents: 'none',
                        animation: 'pulse 1s ease-in-out 2',
                      }} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Botón derecho */}
            <button
              onClick={() => scroll('right')}
              style={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: COLORS.white,
                border: `2px solid ${COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.red;
                e.currentTarget.style.borderColor = COLORS.red;
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.white;
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <IconChevronRight size={28} />
            </button>

            {/* Ocultar scrollbar */}
            <style>
              {`
                div[style*="overflowX"]::-webkit-scrollbar {
                  display: none;
                }
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.7; }
                }
              `}
            </style>
          </div>
        )}
      </div>
    </section>
  );
}
