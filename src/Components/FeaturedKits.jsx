import React, { useEffect, useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';

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
  bg: '#FFFFFF',
  red: '#E01E37',
  darkRed: '#DC143C',
  black: '#000000',
  gray: '#1A1A1A',
};

export default function FeaturedKits({
  titleTop = 'KITS COMPLETOS',
  subtitle = 'Todo lo que necesitas para tu clásico SEAT · Kits de restauración profesional',
  autoPlay = false,
  autoPlayInterval = 5000,
}) {
  const { products: apiProducts, loading, error } = useProducts();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmall = windowWidth < 480;

  // Filtrar productos que son KITS o destacados
  const kitItems = useMemo(() => {
    return apiProducts
      .filter(p => {
        // Productos que tienen "KIT" en el título
        const isKit = p.title && p.title.toUpperCase().includes('KIT');
        // O productos destacados con stock
        const isFeatured = p.featured && p.inStock;
        return isKit || isFeatured;
      })
      .slice(0, 12); // Máximo 12 kits
  }, [apiProducts]);

  const itemsPerPage = isMobile ? 1 : 2;
  const totalPages = Math.ceil(kitItems.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleItems = kitItems.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = page => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (!autoPlay || kitItems.length <= itemsPerPage) return;

    const interval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % totalPages);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, kitItems.length, itemsPerPage, totalPages]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontSize: 18, color: COLORS.gray }}>Cargando kits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontSize: 18, color: COLORS.red }}>Error al cargar kits</p>
      </div>
    );
  }

  if (kitItems.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <p style={{ fontSize: 18, color: COLORS.gray }}>
          No hay kits disponibles
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '3rem 1.5rem' : '5rem 3rem',
        position: 'relative',
      }}
    >
      {/* Título */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: 900 }}>
        <h2
          style={{
            fontFamily: 'APERCU, sans-serif',
            fontSize: isMobile ? 32 : 48,
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '0.5rem',
          }}
        >
          {titleTop}
        </h2>
        <p
          style={{
            fontFamily: 'APERCU, sans-serif',
            fontSize: isMobile ? 14 : 16,
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Carrusel */}
      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          position: 'relative',
        }}
      >
        {/* Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {visibleItems.map((kit, idx) => (
            <KitCard
              key={`${kit.id}-${idx}`}
              kit={kit}
              isMobile={isMobile}
              onViewDetails={product => {
                setSelectedProduct(product);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>

        {/* Controles de navegación */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              marginTop: '2rem',
            }}
          >
            <button
              onClick={goToPrevPage}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: `2px solid ${COLORS.red}`,
                backgroundColor: 'transparent',
                color: COLORS.red,
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = COLORS.red;
                e.currentTarget.style.color = '#FFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.red;
              }}
            >
              ‹
            </button>

            {/* Indicadores */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToPage(idx)}
                  style={{
                    width: idx === currentPage ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: 'none',
                    backgroundColor: idx === currentPage ? COLORS.red : '#DDD',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  aria-label={`Ir a página ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNextPage}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: `2px solid ${COLORS.red}`,
                backgroundColor: 'transparent',
                color: COLORS.red,
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = COLORS.red;
                e.currentTarget.style.color = '#FFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.red;
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Contador */}
      <div
        style={{
          marginTop: '2rem',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.6)',
          letterSpacing: '1px',
        }}
      >
        {kitItems.length} KITS DISPONIBLES
      </div>

      {/* Modal de producto */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

function KitCard({ kit, isMobile, onViewDetails }) {
  const [imageError, setImageError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(kit, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #E9ECEF',
        transition: 'all 0.3s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Imagen */}
      <div
        style={{
          width: '100%',
          height: isMobile ? 200 : 280,
          backgroundColor: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {kit.imageSrc && !imageError ? (
          <img
            src={kit.imageSrc}
            alt={kit.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '1rem',
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{ fontSize: 48, color: '#CCC' }}>📦</div>
        )}

        {/* Badge sin stock */}
        {!kit.inStock && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              padding: '6px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              color: '#FFF',
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
      </div>

      {/* Info */}
      <div style={{ padding: isMobile ? '1.25rem' : '1.5rem' }}>
        {/* Modelo */}
        <div
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 11,
            color: COLORS.red,
            fontWeight: 700,
            letterSpacing: '1px',
            marginBottom: '0.5rem',
          }}
        >
          {kit.model || kit.brand || 'SEAT CLÁSICO'}
        </div>

        {/* Título */}
        <h3
          style={{
            fontFamily: 'APERCU, sans-serif',
            fontSize: isMobile ? 16 : 18,
            fontWeight: 700,
            color: COLORS.black,
            marginBottom: '0.5rem',
            lineHeight: 1.3,
          }}
        >
          {cleanProductTitle(kit.title)}
        </h3>

        {/* Subtítulo */}
        {kit.subtitle && (
          <p
            style={{
              fontFamily: 'APERCU, sans-serif',
              fontSize: 14,
              color: '#666',
              marginBottom: '1rem',
            }}
          >
            {kit.subtitle}
          </p>
        )}

        {/* Precio */}
        <div
          style={{
            fontFamily: 'APERCU, sans-serif',
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.black,
            marginTop: '1rem',
          }}
        >
          {kit.price ? `${kit.price.toFixed(2)}€` : 'Consultar'}
        </div>

        {/* Botones */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem',
          }}
        >
          <button
            onClick={() => onViewDetails(kit)}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#FFFFFF',
              color: COLORS.black,
              border: `2px solid ${COLORS.black}`,
              borderRadius: 8,
              fontFamily: 'APERCU, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = COLORS.black;
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = COLORS.black;
            }}
          >
            VER FICHA
          </button>

          {kit.inStock && (
            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: addedToCart ? '#10B981' : COLORS.red,
                color: '#FFF',
                border: 'none',
                borderRadius: 8,
                fontFamily: 'APERCU, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => {
                if (!addedToCart) {
                  e.currentTarget.style.backgroundColor = COLORS.darkRed;
                }
              }}
              onMouseLeave={e => {
                if (!addedToCart) {
                  e.currentTarget.style.backgroundColor = COLORS.red;
                }
              }}
            >
              {addedToCart ? '✓ AÑADIDO' : 'AÑADIR +'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
