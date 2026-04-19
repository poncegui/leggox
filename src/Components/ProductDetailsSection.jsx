import React, { useState, useEffect } from 'react';
import { useProduct } from '../hooks/useProducts';

const COLORS = {
  red: '#E01E37',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#1A1A1A',
  lightGray: '#F5F5F5',
};

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');

// Iconos SVG para características
function IconTruck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function ProductDetailsSection({ productId = '1767' }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Cargar producto desde la API
  const { product: apiProduct, loading, error } = useProduct(productId);

  // Cargar imágenes del producto
  useEffect(() => {
    if (!productId || !apiProduct) return;

    // Usar directamente las URLs del producto (son las correctas de Mercagarage)
    const images = [];

    if (apiProduct.imageLargeSrc) {
      images.push(apiProduct.imageLargeSrc);
    }

    if (apiProduct.imageSrc && apiProduct.imageSrc !== apiProduct.imageLargeSrc) {
      images.push(apiProduct.imageSrc);
    }

    if (apiProduct.image_url && !images.includes(apiProduct.image_url)) {
      images.push(apiProduct.image_url);
    }

    // Si el producto tiene más imágenes en el array imageGallery
    if (apiProduct.imageGallery && Array.isArray(apiProduct.imageGallery)) {
      apiProduct.imageGallery.forEach(img => {
        const url = img.url || img;
        if (url && !images.includes(url)) {
          images.push(url);
        }
      });
    }

    setProductImages(images.length > 0 ? images : []);
  }, [productId, apiProduct]);

  // Producto de ejemplo si no se pasa ninguno (fallback)
  const defaultProduct = {
    title: 'Kit manguitos radiador SEAT 600',
    subtitle: 'Manguitos alta calidad + abrazaderas reforzadas',
    price: 89.99,
    oldPrice: 120.0,
    rating: 4.5,
    reviews: 128,
    images: [
      '/images/manguitos/manguito1.jpg',
      '/images/manguitos/manguito2.jpg',
      '/images/manguitos/manguito3.jpg',
    ],
    features: [
      'Material: Silicona reforzada de alta resistencia',
      'Temperatura: Soporta hasta 200°C',
      'Presión: Hasta 3 bar',
      'Incluye: 5 manguitos + 10 abrazaderas',
      'Garantía: 2 años',
      'Instalación: Fácil, incluye instrucciones',
    ],
    benefits: [
      {
        icon: <IconShield />,
        title: 'Calidad garantizada',
        description: '2 años de garantía',
      },
      {
        icon: <IconTruck />,
        title: 'Envío rápido',
        description: '24-48h península',
      },
      {
        icon: <IconCheck />,
        title: 'Ajuste perfecto',
        description: 'Diseño específico SEAT',
      },
    ],
    technical: {
      'Material': 'Silicona reforzada',
      'Diámetro interior': '28-35mm',
      'Espesor': '4mm',
      'Temperatura máx.': '200°C',
      'Presión máx.': '3 bar',
      'Color': 'Negro',
    },
    description:
      'Kit completo de manguitos de radiador específicamente diseñado para SEAT 600. Fabricados en silicona reforzada de alta calidad que garantiza máxima durabilidad y resistencia a altas temperaturas. Incluye todas las abrazaderas necesarias para una instalación perfecta.',
  };

  // Mapear producto de la API al formato del componente
  const mapApiProduct = (apiProd) => {
    if (!apiProd) return null;

    // Parsear technical si es string JSON
    let technical = {};
    try {
      technical =
        typeof apiProd.technical === 'string'
          ? JSON.parse(apiProd.technical)
          : apiProd.technical || {};
    } catch (e) {
      console.error('Error parseando technical:', e);
    }

    // Construir objeto de especificaciones técnicas
    const technicalSpecs = {};
    if (technical.material) technicalSpecs['Material'] = technical.material;
    if (technical.measurements) technicalSpecs['Medidas'] = technical.measurements;
    if (technical.diameter) technicalSpecs['Diámetro'] = technical.diameter;
    if (technical.color) technicalSpecs['Color'] = technical.color;
    if (technical.reference) technicalSpecs['Referencia'] = technical.reference;
    if (apiProd.reference) technicalSpecs['Ref. LEGGOX'] = apiProd.reference;
    if (apiProd.brand) technicalSpecs['Marca'] = apiProd.brand;
    if (apiProd.model) technicalSpecs['Modelo'] = apiProd.model;

    // Construir lista de características
    const features = [];
    if (technical.material) features.push(`Material: ${technical.material}`);
    if (technical.measurements) features.push(`Medidas: ${technical.measurements}`);
    if (technical.diameter) features.push(`Diámetro: ${technical.diameter}`);
    if (apiProd.stock > 0) features.push('En stock y listo para enviar');
    if (technical.kitContents && technical.kitContents.length > 0) {
      features.push(
        `Incluye: ${technical.kitContents.map((item) => `${item.qty}x ${item.name}`).join(', ')}`
      );
    }
    if (technical.notes) features.push(technical.notes);

    // Determinar imágenes
    const images = productImages.length > 0 ? productImages : [
      apiProd.imageSrc || apiProd.imageLargeSrc || apiProd.image_url || defaultProduct.images[0],
    ];

    return {
      title: apiProd.title || defaultProduct.title,
      subtitle: apiProd.subtitle || `${apiProd.brand || 'SEAT'} ${apiProd.model || '600'}`,
      price: apiProd.price || defaultProduct.price,
      oldPrice: apiProd.original_price && apiProd.has_discount ? apiProd.original_price : null,
      rating: 4.5, // Por ahora fijo, podrías agregar sistema de reviews
      reviews: 128,
      images,
      features: features.length > 0 ? features : defaultProduct.features,
      benefits: [
        {
          icon: <IconShield />,
          title: 'Calidad garantizada',
          description: technical.isOEM ? 'Calidad OEM' : '2 años de garantía',
        },
        {
          icon: <IconTruck />,
          title: 'Envío rápido',
          description: '24-48h península',
        },
        {
          icon: <IconCheck />,
          title: 'Ajuste perfecto',
          description: `Diseño específico ${apiProd.brand || 'SEAT'}`,
        },
      ],
      technical: technicalSpecs,
      description: apiProd.description || technical.notes || defaultProduct.description,
      inStock: apiProd.stock > 0,
    };
  };

  // Usar producto de la API si está disponible, sino usar el default
  const displayProduct = apiProduct ? mapApiProduct(apiProduct) : defaultProduct;

  // Loading state
  if (loading || loadingImages) {
    return (
      <section
        style={{
          backgroundColor: COLORS.white,
          padding: '80px 20px',
          minHeight: '100vh',
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
          <p
            style={{
              fontFamily: 'APERCU, sans-serif',
              color: COLORS.gray,
              fontSize: 16,
            }}
          >
            Cargando producto...
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
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section
        style={{
          backgroundColor: COLORS.white,
          padding: '80px 20px',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            Error cargando producto
          </p>
          <p style={{ fontFamily: 'APERCU, sans-serif', color: COLORS.gray }}>
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        backgroundColor: COLORS.white,
        padding: '80px 20px',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        {/* Grid principal */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 968 ? '1fr' : '1fr 1fr',
            gap: 60,
            alignItems: 'start',
          }}
        >
          {/* Columna izquierda: Imágenes */}
          <div style={{ position: 'sticky', top: 100 }}>
            {/* Imagen principal */}
            <div
              style={{
                backgroundColor: COLORS.lightGray,
                borderRadius: 20,
                padding: 40,
                marginBottom: 20,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <img
                src={displayProduct.images[selectedImage]}
                alt={displayProduct.title}
                style={{
                  width: '100%',
                  height: 500,
                  objectFit: 'contain',
                  transition: 'transform 0.3s',
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23F5F5F5" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="40"%3EProducto%3C/text%3E%3C/svg%3E';
                }}
              />

              {/* Badge de descuento */}
              {displayProduct.oldPrice && displayProduct.inStock && (
                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    backgroundColor: COLORS.red,
                    color: COLORS.white,
                    padding: '10px 20px',
                    borderRadius: 30,
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: '1px',
                  }}
                >
                  -
                  {Math.round(
                    ((displayProduct.oldPrice - displayProduct.price) /
                      displayProduct.oldPrice) *
                      100
                  )}
                  %
                </div>
              )}

              {/* Badge SIN STOCK */}
              {!displayProduct.inStock && (
                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    backgroundColor: '#EF4444',
                    color: COLORS.white,
                    padding: '10px 20px',
                    borderRadius: 30,
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: '1px',
                  }}
                >
                  SIN STOCK
                </div>
              )}
            </div>

            {/* Miniaturas */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
              }}
            >
              {displayProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: 80,
                    height: 80,
                    padding: 8,
                    border:
                      selectedImage === idx
                        ? `3px solid ${COLORS.red}`
                        : '3px solid transparent',
                    borderRadius: 12,
                    backgroundColor: COLORS.lightGray,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: selectedImage === idx ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.opacity =
                      selectedImage === idx ? '1' : '0.6')
                  }
                >
                  <img
                    src={img}
                    alt={`Vista ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23E5E5E5" width="80" height="80"/%3E%3C/svg%3E';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Columna derecha: Información */}
          <div style={{ paddingTop: 20 }}>
            {/* Breadcrumb */}
            <div
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 11,
                letterSpacing: '1.5px',
                color: COLORS.gray,
                marginBottom: 16,
                opacity: 0.6,
              }}
            >
              INICIO /{' '}
              {(apiProduct?.category || 'MANGUITOS').toUpperCase()} /{' '}
              {(apiProduct?.brand || 'SEAT').toUpperCase()}
            </div>

            {/* Título */}
            <h1
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 36,
                fontWeight: 800,
                color: COLORS.black,
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              {displayProduct.title}
            </h1>

            {/* Subtítulo */}
            <p
              style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: 18,
                color: COLORS.gray,
                marginBottom: 24,
              }}
            >
              {displayProduct.subtitle}
            </p>

            {/* Rating */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 32,
              }}
            >
              <div style={{ display: 'flex', gap: 4 }}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      color:
                        i < Math.floor(displayProduct.rating)
                          ? '#FFB800'
                          : '#E5E5E5',
                    }}
                  >
                    <IconStar />
                  </div>
                ))}
              </div>
              <span
                style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 14,
                  color: COLORS.gray,
                }}
              >
                {displayProduct.rating} ({displayProduct.reviews} valoraciones)
              </span>
            </div>

            {/* Precio */}
            <div
              style={{
                backgroundColor: COLORS.lightGray,
                padding: 24,
                borderRadius: 16,
                marginBottom: 32,
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
                PRECIO ESPECIAL
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <span
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 42,
                    fontWeight: 900,
                    color: COLORS.red,
                  }}
                >
                  {displayProduct.price.toFixed(2)} €
                </span>
                {displayProduct.oldPrice && (
                  <span
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 24,
                      fontWeight: 600,
                      color: COLORS.gray,
                      textDecoration: 'line-through',
                      opacity: 0.5,
                    }}
                  >
                    {displayProduct.oldPrice.toFixed(2)} €
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 12,
                  color: COLORS.gray,
                  marginTop: 8,
                }}
              >
                IVA incluido • Envío gratis en pedidos +50€
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
              <button
                disabled={!displayProduct.inStock}
                style={{
                  flex: 1,
                  backgroundColor: displayProduct.inStock
                    ? COLORS.red
                    : '#CCCCCC',
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: 12,
                  padding: '18px 32px',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  cursor: displayProduct.inStock ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  opacity: displayProduct.inStock ? 1 : 0.6,
                }}
                onMouseEnter={(e) => {
                  if (displayProduct.inStock) {
                    e.currentTarget.style.backgroundColor = '#C01830';
                  }
                }}
                onMouseLeave={(e) => {
                  if (displayProduct.inStock) {
                    e.currentTarget.style.backgroundColor = COLORS.red;
                  }
                }}
              >
                {displayProduct.inStock
                  ? 'AÑADIR AL CARRITO'
                  : 'PRODUCTO AGOTADO'}
              </button>
              <button
                style={{
                  backgroundColor: COLORS.black,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: 12,
                  padding: '18px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = COLORS.gray)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = COLORS.black)
                }
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Beneficios */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 40,
              }}
            >
              {displayProduct.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${COLORS.lightGray}`,
                    borderRadius: 12,
                    padding: 20,
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.red;
                    e.currentTarget.style.backgroundColor = COLORS.lightGray;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.lightGray;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div
                    style={{
                      color: COLORS.red,
                      marginBottom: 12,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {benefit.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 14,
                      fontWeight: 700,
                      color: COLORS.black,
                      marginBottom: 4,
                    }}
                  >
                    {benefit.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 12,
                      color: COLORS.gray,
                    }}
                  >
                    {benefit.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Características */}
            <div
              style={{
                backgroundColor: COLORS.lightGray,
                borderRadius: 16,
                padding: 24,
                marginBottom: 32,
              }}
            >
              <h3
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 11,
                  letterSpacing: '2px',
                  color: COLORS.red,
                  fontWeight: 800,
                  marginBottom: 20,
                }}
              >
                CARACTERÍSTICAS
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gap: 12,
                }}
              >
                {displayProduct.features.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 14,
                      color: COLORS.black,
                      display: 'flex',
                      alignItems: 'start',
                      gap: 12,
                    }}
                  >
                    <span style={{ color: COLORS.red, flexShrink: 0 }}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Especificaciones técnicas */}
            <div
              style={{
                border: `1px solid ${COLORS.lightGray}`,
                borderRadius: 16,
                padding: 24,
              }}
            >
              <h3
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 11,
                  letterSpacing: '2px',
                  color: COLORS.red,
                  fontWeight: 800,
                  marginBottom: 20,
                }}
              >
                ESPECIFICACIONES TÉCNICAS
              </h3>
              <div style={{ display: 'grid', gap: 16 }}>
                {Object.entries(displayProduct.technical).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 16,
                        borderBottom: `1px solid ${COLORS.lightGray}`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 14,
                          fontWeight: 700,
                          color: COLORS.gray,
                        }}
                      >
                        {key}
                      </span>
                      <span
                        style={{
                          fontFamily: 'APERCU, sans-serif',
                          fontSize: 14,
                          color: COLORS.black,
                          textAlign: 'right',
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Descripción */}
            <div style={{ marginTop: 32 }}>
              <h3
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 11,
                  letterSpacing: '2px',
                  color: COLORS.red,
                  fontWeight: 800,
                  marginBottom: 16,
                }}
              >
                DESCRIPCIÓN
              </h3>
              <p
                style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: COLORS.gray,
                }}
              >
                {displayProduct.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
