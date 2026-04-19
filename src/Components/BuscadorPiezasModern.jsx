import React, { useEffect, useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useVehicles } from '../hooks/useVehicles';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';

// Importar imágenes de coches
import seat600 from '../Assets/images/coches/seat-600.png';
import seat127 from '../Assets/images/coches/seat-128.png';
import seat128 from '../Assets/images/coches/seat-128.png';
import seat131 from '../Assets/images/coches/seat-131.png';
import seat124 from '../Assets/images/coches/seat-124-biarbol.png';
import seat124Sport from '../Assets/images/coches/seat-124-sport.png';
import seat133 from '../Assets/images/coches/seat-133.png';
import seat1200 from '../Assets/images/coches/seat-1200.png';
import seat850 from '../Assets/images/coches/seat-850.png';
import seatPanda from '../Assets/images/coches/seat-panda.png';
import seatMarbella from '../Assets/images/coches/seat-marbella.png';
import SEAT1430 from '../Assets/images/coches/seat-131-biarbol.png';
import SEAT1430FU from '../Assets/images/coches/seat-1430-fu.png';
import seatBocanegra from '../Assets/images/coches/seat-bocanegra.png';
import seatRanchera from '../Assets/images/coches/seat-ranchera.png';
import otros from '../Assets/images/coches/otros.png';

const COLORS = {
  red: '#E01E37',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#1A1A1A',
  lightGray: '#F5F5F5',
  border: '#E5E5E5',
};

const MODEL_IMAGES = {
  'seat-600': seat600,
  'seat-127': seat127,
  'seat-128': seat128,
  'seat-131': seat131,
  'seat-124': seat124,
  'seat-124-fl': seat124,
  'seat-124-sport': seat124Sport,
  'seat-133': seat133,
  'seat-850': seat850,
  'seat-1200': seat1200,
  'seat-panda': seatPanda,
  'seat-marbella': seatMarbella,
  'seat-1430': SEAT1430,
  'seat-1430-fu': SEAT1430FU,
  'seat-fura': seatRanchera,
  'SEAT 600': seat600,
  'SEAT 127': seat127,
  'SEAT 128': seat128,
  'SEAT 131': seat131,
  'SEAT 124': seat124,
  'SEAT 124 FL': seat124,
  'SEAT 124 Sport': seat124Sport,
  'SEAT 133': seat133,
  'SEAT 850': seat850,
  'SEAT 1200': seat1200,
  'SEAT Panda': seatPanda,
  'SEAT Marbella': seatMarbella,
  'SEAT 1430': SEAT1430,
  'SEAT 1430 FU': SEAT1430FU,
  'SEAT Fura': seatRanchera,
  SEAT: otros,
  Otros: otros,
  otros: otros,
};

// Iconos SVG
function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
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

function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

// Hook personalizado para transformar productos
function useTransformedProducts() {
  const { products: apiProducts, loading, error } = useProducts();
  const { vehicles: apiVehicles, loading: loadingVehicles } = useVehicles();

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

  const transformedData = useMemo(() => {
    if (!apiProducts || !Array.isArray(apiProducts) || apiProducts.length === 0) {
      return { products: [], vehicles: [] };
    }

    const products = apiProducts.map((p) => ({
      ...p,
      imageSrc: resolveImageUrl(p.imageSrc),
      imageLargeSrc: resolveImageUrl(p.imageLargeSrc),
      images: p.images || (p.imageSrc ? [{ url: resolveImageUrl(p.imageSrc), alt: p.title }] : []),
      imageGallery:
        p.imageGallery || p.images || (p.imageSrc ? [{ url: resolveImageUrl(p.imageSrc), alt: p.title }] : []),
    }));

    const vehicles = (apiVehicles || []).map((vehicle) => ({
      id: vehicle.id,
      title: vehicle.full_name,
      subtitle: `Piezas compatibles con ${vehicle.full_name}`,
      full_name: vehicle.full_name,
      brand: vehicle.brand,
      model: vehicle.model,
      image: MODEL_IMAGES[vehicle.full_name] || MODEL_IMAGES[vehicle.id] || otros,
    }));

    return { products, vehicles };
  }, [apiProducts, apiVehicles]);

  return { ...transformedData, loading: loading || loadingVehicles, error };
}

// Componente de tarjeta de vehículo
function VehicleCard({ vehicle, onSelect, isSelected }) {
  return (
    <button
      onClick={() => onSelect(vehicle)}
      style={{
        position: 'relative',
        width: '100%',
        border: isSelected ? `3px solid ${COLORS.red}` : `1px solid ${COLORS.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
        cursor: 'pointer',
        transition: 'all 0.2s',
        padding: 0,
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: COLORS.red,
            color: COLORS.white,
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(224,30,55,0.4)',
          }}
        >
          <IconCheck />
        </div>
      )}
      <div
        style={{
          aspectRatio: '16/10',
          backgroundColor: COLORS.lightGray,
          overflow: 'hidden',
        }}
      >
        <img
          src={vehicle.image}
          alt={vehicle.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            e.target.src = otros;
          }}
        />
      </div>
      <div style={{ padding: 16 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: 'APERCU, sans-serif',
            fontSize: 16,
            fontWeight: 800,
            color: COLORS.black,
            marginBottom: 4,
          }}
        >
          {vehicle.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontFamily: 'APERCU, sans-serif',
            fontSize: 13,
            color: COLORS.gray,
            opacity: 0.7,
          }}
        >
          {vehicle.subtitle}
        </p>
      </div>
    </button>
  );
}

// Componente de tarjeta de producto MEJORADA
function ProductCard({ product, onClick }) {
  const [imageError, setImageError] = useState(false);

  // Parsear datos técnicos
  let technical = {};
  try {
    technical =
      typeof product.technical === 'string' ? JSON.parse(product.technical) : product.technical || {};
  } catch (e) {
    console.error('Error parseando technical:', e);
  }

  return (
    <article
      onClick={onClick}
      style={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
        cursor: 'pointer',
        transition: 'all 0.2s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)';
        e.currentTarget.style.borderColor = COLORS.red;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = COLORS.border;
      }}
    >
      {/* Imagen */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '4/3',
          backgroundColor: COLORS.lightGray,
          overflow: 'hidden',
        }}
      >
        {product.imageSrc && !imageError ? (
          <img
            src={product.imageSrc}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: 12,
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
              opacity: 0.3,
            }}
          >
            📦
          </div>
        )}

        {/* Badges */}
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
          {product.onSale && (
            <div
              style={{
                backgroundColor: COLORS.red,
                color: COLORS.white,
                padding: '6px 12px',
                borderRadius: 20,
                fontFamily: 'ui-monospace, monospace',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '1px',
              }}
            >
              OFERTA
            </div>
          )}
          {!product.inStock && (
            <div
              style={{
                backgroundColor: '#EF4444',
                color: COLORS.white,
                padding: '6px 12px',
                borderRadius: 20,
                fontFamily: 'ui-monospace, monospace',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '1px',
              }}
            >
              AGOTADO
            </div>
          )}
          {product.featured && product.inStock && !product.onSale && (
            <div
              style={{
                backgroundColor: '#10B981',
                color: COLORS.white,
                padding: '6px 12px',
                borderRadius: 20,
                fontFamily: 'ui-monospace, monospace',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '1px',
              }}
            >
              DESTACADO
            </div>
          )}
        </div>

        {/* Rating (si existe) */}
        {product.rating && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              backgroundColor: 'rgba(0,0,0,0.75)',
              color: '#FFB800',
              padding: '6px 10px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <IconStar />
            <span
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.white,
              }}
            >
              {product.rating}
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Categoría */}
        <div
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '1.5px',
            color: COLORS.red,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          {(product.type || 'PRODUCTO').toUpperCase()}
        </div>

        {/* Título */}
        <h3
          style={{
            margin: 0,
            fontFamily: 'APERCU, sans-serif',
            fontSize: 15,
            fontWeight: 800,
            color: COLORS.black,
            lineHeight: 1.3,
            marginBottom: 8,
            minHeight: 40,
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
              fontSize: 12,
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

        {/* Características técnicas (si existen) */}
        {(technical.material || technical.color || technical.diameter) && (
          <div
            style={{
              marginBottom: 12,
              padding: 10,
              backgroundColor: COLORS.lightGray,
              borderRadius: 8,
              fontSize: 11,
              fontFamily: 'APERCU, sans-serif',
            }}
          >
            {technical.material && (
              <div style={{ marginBottom: 4, color: COLORS.gray }}>
                <span style={{ fontWeight: 700 }}>Material:</span> {technical.material}
              </div>
            )}
            {technical.color && (
              <div style={{ marginBottom: 4, color: COLORS.gray }}>
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
                fontSize: 10,
                color: COLORS.gray,
                marginBottom: 12,
                opacity: 0.6,
              }}
            >
              REF: {product.reference}
            </div>
          )}

          {/* Precio */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            {product.price ? (
              <>
                <span
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 24,
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
                      fontSize: 16,
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
                  fontSize: 16,
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
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '1px',
              cursor: product.inStock ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (product.inStock) {
                e.currentTarget.style.backgroundColor = '#C01830';
              }
            }}
            onMouseLeave={(e) => {
              if (product.inStock) {
                e.currentTarget.style.backgroundColor = COLORS.red;
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
export default function BuscadorPiezasModern({ onComplete }) {
  const { products, vehicles, loading, error } = useTransformedProducts();

  // Verificar que useCart esté disponible
  let addToCart = () => console.log('Cart not available');
  try {
    const cartContext = useCart();
    if (cartContext && cartContext.addToCart) {
      addToCart = cartContext.addToCart;
    }
  } catch (e) {
    console.warn('Cart context not available:', e);
  }

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all'); // all, manguito, radiador
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllVehicles, setShowAllVehicles] = useState(false);

  // Filtrar productos por vehículo seleccionado
  const filteredByVehicle = useMemo(() => {
    if (!selectedVehicle) return products.filter((p) => p.featured);

    return products.filter((product) => {
      if (!product.vehicles || !Array.isArray(product.vehicles)) return false;
      return product.vehicles.some((v) =>
        [selectedVehicle.full_name, selectedVehicle.title].includes(v)
      );
    });
  }, [products, selectedVehicle]);

  // Filtrar por tipo
  const filteredByType = useMemo(() => {
    if (typeFilter === 'all') return filteredByVehicle;
    return filteredByVehicle.filter((p) => p.type === typeFilter);
  }, [filteredByVehicle, typeFilter]);

  // Filtrar por búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return filteredByType;

    const query = searchQuery.toLowerCase().trim();
    return filteredByType.filter(
      (product) =>
        product.title?.toLowerCase().includes(query) ||
        product.subtitle?.toLowerCase().includes(query) ||
        product.reference?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
    );
  }, [filteredByType, searchQuery]);

  // Contadores
  const counts = useMemo(() => {
    const total = filteredByVehicle.length;
    const manguitos = filteredByVehicle.filter((p) => p.type === 'manguito').length;
    const radiadores = filteredByVehicle.filter((p) => p.type === 'radiador').length;
    return { total, manguitos, radiadores };
  }, [filteredByVehicle]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: COLORS.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
          <p style={{ fontFamily: 'APERCU, sans-serif', color: COLORS.gray, fontSize: 16 }}>
            Cargando catálogo...
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
          minHeight: '100vh',
          backgroundColor: COLORS.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ fontFamily: 'APERCU, sans-serif', color: COLORS.red, fontSize: 18, marginBottom: 12 }}>
            Error cargando catálogo
          </p>
          <p style={{ fontFamily: 'APERCU, sans-serif', color: COLORS.gray }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.white,
        padding: '60px 20px',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '2px',
              color: COLORS.red,
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            CATÁLOGO LEGGOX
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'APERCU, sans-serif',
              fontSize: window.innerWidth < 768 ? 32 : 48,
              fontWeight: 800,
              color: COLORS.black,
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Encuentra las piezas para tu clásico
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: 'APERCU, sans-serif',
              fontSize: 18,
              color: COLORS.gray,
              maxWidth: 600,
            }}
          >
            Manguitos, radiadores y más para vehículos SEAT clásicos
          </p>
        </div>

        {/* Selector de vehículo */}
        {!selectedVehicle ? (
          <div style={{ marginBottom: 60 }}>
            <h2
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 24,
                fontWeight: 800,
                color: COLORS.black,
                marginBottom: 24,
              }}
            >
              Selecciona tu vehículo
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  window.innerWidth < 768
                    ? 'repeat(2, 1fr)'
                    : window.innerWidth < 1024
                    ? 'repeat(3, 1fr)'
                    : 'repeat(4, 1fr)',
                gap: 20,
              }}
            >
              {(showAllVehicles ? vehicles : vehicles.slice(0, 8)).map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onSelect={setSelectedVehicle}
                  isSelected={false}
                />
              ))}
            </div>
            {vehicles.length > 8 && !showAllVehicles && (
              <button
                onClick={() => setShowAllVehicles(true)}
                style={{
                  marginTop: 24,
                  backgroundColor: COLORS.black,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: 12,
                  padding: '16px 32px',
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.gray)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.black)}
              >
                Ver todos los vehículos ({vehicles.length - 8} más)
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Vehículo seleccionado + Filtros */}
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
                  alignItems: 'start',
                  gap: 20,
                  flexWrap: 'wrap',
                  marginBottom: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 11,
                      letterSpacing: '1.5px',
                      color: COLORS.gray,
                      marginBottom: 8,
                    }}
                  >
                    VEHÍCULO SELECCIONADO
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 28,
                      fontWeight: 800,
                      color: COLORS.black,
                      marginBottom: 8,
                    }}
                  >
                    {selectedVehicle.title}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 14,
                      color: COLORS.gray,
                    }}
                  >
                    {counts.total} piezas disponibles · {counts.manguitos} manguitos · {counts.radiadores}{' '}
                    radiadores
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedVehicle(null);
                    setSearchQuery('');
                    setTypeFilter('all');
                  }}
                  style={{
                    backgroundColor: COLORS.white,
                    color: COLORS.black,
                    border: `2px solid ${COLORS.border}`,
                    borderRadius: 10,
                    padding: '12px 24px',
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.red;
                    e.currentTarget.style.color = COLORS.red;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.color = COLORS.black;
                  }}
                >
                  ← Cambiar vehículo
                </button>
              </div>

              {/* Barra de búsqueda */}
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: COLORS.gray,
                    opacity: 0.5,
                  }}
                >
                  <IconSearch />
                </div>
                <input
                  type="search"
                  placeholder="Buscar por nombre, referencia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px 16px 50px',
                    border: `2px solid ${COLORS.border}`,
                    borderRadius: 12,
                    fontSize: 15,
                    fontFamily: 'APERCU, sans-serif',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = COLORS.red)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
                />
              </div>

              {/* Filtros de tipo */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'Todas', count: counts.total },
                  { id: 'manguito', label: 'Manguitos', count: counts.manguitos },
                  { id: 'radiador', label: 'Radiadores', count: counts.radiadores },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setTypeFilter(filter.id)}
                    style={{
                      backgroundColor: typeFilter === filter.id ? COLORS.black : COLORS.white,
                      color: typeFilter === filter.id ? COLORS.white : COLORS.black,
                      border: `2px solid ${typeFilter === filter.id ? COLORS.black : COLORS.border}`,
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
                        e.currentTarget.style.borderColor = COLORS.black;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (typeFilter !== filter.id) {
                        e.currentTarget.style.borderColor = COLORS.border;
                      }
                    }}
                  >
                    <span>{filter.label}</span>
                    <span
                      style={{
                        backgroundColor: typeFilter === filter.id ? 'rgba(255,255,255,0.2)' : COLORS.lightGray,
                        color: typeFilter === filter.id ? COLORS.white : COLORS.gray,
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
            </div>

            {/* Grid de productos */}
            {filteredProducts.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
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
                  No se encontraron productos
                </h3>
                <p style={{ fontFamily: 'APERCU, sans-serif', fontSize: 16, color: COLORS.gray }}>
                  Intenta con otros filtros o términos de búsqueda
                </p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 24 }}>
                  <p
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 16,
                      color: COLORS.gray,
                      margin: 0,
                    }}
                  >
                    Mostrando <strong>{filteredProducts.length}</strong> producto
                    {filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      window.innerWidth < 768
                        ? '1fr'
                        : window.innerWidth < 1024
                        ? 'repeat(2, 1fr)'
                        : 'repeat(3, 1fr)',
                    gap: 24,
                  }}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modal de producto */}
      <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
