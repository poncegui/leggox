import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import TopBar from '../Components/TopBar';

const COLORS = {
  red: '#E01E37',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#1A1A1A',
  lightGray: '#F5F5F5',
  border: '#E5E5E5',
  yellow: '#FFB800',
};

// Iconos
function IconStar({ filled = true }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function ProductDetailView() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { product: apiProduct, loading, error } = useProduct(productId);
  const { products: allProducts } = useProducts();
  const { addToCart } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Scroll al inicio cuando se carga el producto
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  // Resolver URL de imagen
  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      const apiBase = process.env.REACT_APP_API_BASE ||
        (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');
      return `${apiBase}${url}`;
    }
    return url;
  };

  // Cargar imágenes del producto
  useEffect(() => {
    if (!apiProduct) return;

    // Usar directamente las URLs del producto (son las correctas de Mercagarage)
    const images = [];

    if (apiProduct.imageLargeSrc) {
      images.push(resolveImageUrl(apiProduct.imageLargeSrc));
    }

    if (apiProduct.imageSrc && apiProduct.imageSrc !== apiProduct.imageLargeSrc) {
      images.push(resolveImageUrl(apiProduct.imageSrc));
    }

    if (apiProduct.image_url && !images.includes(apiProduct.image_url)) {
      images.push(resolveImageUrl(apiProduct.image_url));
    }

    // Si el producto tiene más imágenes en el array imageGallery
    if (apiProduct.imageGallery && Array.isArray(apiProduct.imageGallery)) {
      apiProduct.imageGallery.forEach(img => {
        const url = resolveImageUrl(img.url || img);
        if (url && !images.includes(url)) {
          images.push(url);
        }
      });
    }

    setProductImages(images.length > 0 ? images : []);
  }, [apiProduct, productId]);

  // Encontrar productos relacionados del mismo modelo
  useEffect(() => {
    if (!apiProduct || !allProducts) return;

    let technical = {};
    try {
      technical = typeof apiProduct.technical === 'string'
        ? JSON.parse(apiProduct.technical)
        : apiProduct.technical || {};
    } catch (e) {
      technical = {};
    }

    const vehicleModel = technical.model || apiProduct.subtitle;

    if (vehicleModel) {
      const related = allProducts
        .filter(p => {
          if (p.id === apiProduct.id) return false;

          let pTechnical = {};
          try {
            pTechnical = typeof p.technical === 'string'
              ? JSON.parse(p.technical)
              : p.technical || {};
          } catch (e) {
            pTechnical = {};
          }

          return pTechnical.model === vehicleModel || p.subtitle === vehicleModel;
        })
        .slice(0, 4);

      setRelatedProducts(related);
    }
  }, [apiProduct, allProducts]);

  if (loading) {
    return (
      <>
        <TopBar />
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.white,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 60,
              height: 60,
              border: `4px solid ${COLORS.lightGray}`,
              borderTop: `4px solid ${COLORS.red}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }} />
            <p style={{
              fontFamily: 'APERCU, sans-serif',
              color: COLORS.gray,
              fontSize: 16,
            }}>
              Cargando producto...
            </p>
          </div>
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      </>
    );
  }

  if (error || !apiProduct) {
    return (
      <>
        <TopBar />
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.white,
        }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <p style={{
              fontFamily: 'APERCU, sans-serif',
              color: COLORS.red,
              fontSize: 18,
              marginBottom: 12,
            }}>
              Producto no encontrado
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                backgroundColor: COLORS.red,
                color: COLORS.white,
                border: 'none',
                borderRadius: 12,
                padding: '14px 28px',
                fontFamily: 'ui-monospace, monospace',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              VOLVER AL INICIO
            </button>
          </div>
        </div>
      </>
    );
  }

  // Parsear datos técnicos
  let technical = {};
  try {
    technical = typeof apiProduct.technical === 'string'
      ? JSON.parse(apiProduct.technical)
      : apiProduct.technical || {};
  } catch (e) {
    technical = {};
  }

  const handleAddToCart = () => {
    addToCart(apiProduct);
  };

  const handleBackToCatalog = () => {
    // Restaurar la posición del scroll guardada
    const savedScrollPosition = sessionStorage.getItem('catalogScrollPosition');
    navigate('/', { state: { scrollTo: savedScrollPosition ? parseInt(savedScrollPosition, 10) : 0 } });
  };

  const breadcrumb = `INICIO / ${(apiProduct.type || 'PRODUCTO').toUpperCase()} / ${(technical.brand || 'LEGGOX').toUpperCase()}`;

  return (
    <>
      <TopBar />

      <div style={{
        backgroundColor: COLORS.white,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Botón volver - Fixed top */}
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
          padding: '16px 20px',
          borderBottom: `1px solid ${COLORS.lightGray}`,
        }}>
          <button
            onClick={handleBackToCatalog}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'transparent',
              border: `2px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: '8px 16px',
              fontFamily: 'APERCU, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.black,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.red;
              e.currentTarget.style.color = COLORS.red;
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.color = COLORS.black;
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Volver al item</span>
          </button>
        </div>

        {/* Contenido principal */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
          padding: '20px',
        }}>

          {/* Grid principal */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '50% 50%',
            gap: 30,
            alignItems: 'start',
            height: '100%',
          }}>
            {/* Columna izquierda - Galería */}
            <div style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}>
              {/* Imagen principal */}
              <div style={{
                backgroundColor: COLORS.lightGray,
                borderRadius: 12,
                padding: 20,
                marginBottom: 12,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src={productImages[selectedImageIndex] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23F5F5F5" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="40"%3EProducto%3C/text%3E%3C/svg%3E'}
                  alt={apiProduct.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.3s',
                  }}
                />
              </div>

              {/* Miniaturas */}
              {productImages.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'center',
                }}>
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      style={{
                        width: 60,
                        height: 60,
                        padding: 4,
                        border: `2px solid ${selectedImageIndex === idx ? COLORS.red : 'transparent'}`,
                        borderRadius: 8,
                        backgroundColor: COLORS.lightGray,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: selectedImageIndex === idx ? 1 : 0.5,
                        transform: selectedImageIndex === idx ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      <img
                        src={img}
                        alt={`Vista ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Columna derecha - Detalles con scroll interno */}
            <div style={{
              paddingTop: 0,
              height: '100%',
              overflowY: 'auto',
              paddingRight: 10,
            }}>
              {/* Breadcrumb */}
              <div style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 9,
                letterSpacing: '1.2px',
                color: COLORS.gray,
                marginBottom: 8,
                opacity: 0.5,
              }}>
                {breadcrumb}
              </div>

              {/* Título */}
              <h1 style={{
                fontFamily: 'APERCU, sans-serif',
                fontSize: window.innerWidth < 768 ? 22 : 26,
                fontWeight: 800,
                color: COLORS.black,
                lineHeight: 1.2,
                marginBottom: 6,
              }}>
                {apiProduct.title}
              </h1>

              {/* Subtítulo */}
              {apiProduct.subtitle && (
                <p style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 14,
                  color: COLORS.gray,
                  marginBottom: 12,
                }}>
                  {apiProduct.subtitle}
                </p>
              )}

              {/* Rating */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} style={{ color: star <= 4 ? COLORS.yellow : COLORS.border, width: 16, height: 16 }}>
                      <IconStar filled={star <= 4} />
                    </div>
                  ))}
                </div>
                <span style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 12,
                  color: COLORS.gray,
                }}>
                  4.5 (128)
                </span>
              </div>

              {/* Precio */}
              <div style={{
                backgroundColor: COLORS.lightGray,
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
              }}>
                <div style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 9,
                  letterSpacing: '1.5px',
                  color: COLORS.red,
                  fontWeight: 800,
                  marginBottom: 4,
                }}>
                  {apiProduct.onSale ? 'PRECIO ESPECIAL' : 'PRECIO'}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                }}>
                  <span style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: window.innerWidth < 768 ? 28 : 32,
                    fontWeight: 900,
                    color: COLORS.red,
                  }}>
                    {apiProduct.price ? `${apiProduct.price.toFixed(2)} €` : 'Consultar precio'}
                  </span>
                  {apiProduct.oldPrice && (
                    <span style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 18,
                      fontWeight: 600,
                      color: COLORS.gray,
                      textDecoration: 'line-through',
                      opacity: 0.5,
                    }}>
                      {apiProduct.oldPrice.toFixed(2)} €
                    </span>
                  )}
                </div>
                <div style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 10,
                  color: COLORS.gray,
                  marginTop: 4,
                }}>
                  IVA incluido • Envío gratis +50€
                </div>
              </div>

              {/* Botones de acción */}
              <div style={{
                display: 'flex',
                gap: 8,
                marginBottom: 20,
              }}>
                <button
                  onClick={handleAddToCart}
                  disabled={!apiProduct.inStock}
                  style={{
                    flex: 1,
                    backgroundColor: apiProduct.inStock ? COLORS.red : '#CCCCCC',
                    color: COLORS.white,
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 20px',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '1.2px',
                    cursor: apiProduct.inStock ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (apiProduct.inStock) {
                      e.currentTarget.style.backgroundColor = '#C01830';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (apiProduct.inStock) {
                      e.currentTarget.style.backgroundColor = COLORS.red;
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {apiProduct.inStock ? 'AÑADIR AL CARRITO' : 'NO DISPONIBLE'}
                </button>
                <button style={{
                  backgroundColor: COLORS.black,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.red;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.black;
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
                  <IconHeart />
                </button>
              </div>

              {/* Benefits cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                marginBottom: 20,
              }}>
                <div style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  padding: 10,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  backgroundColor: COLORS.white,
                }}>
                  <div style={{
                    color: COLORS.red,
                    marginBottom: 6,
                    display: 'flex',
                    justifyContent: 'center',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 11,
                    fontWeight: 700,
                    color: COLORS.black,
                    marginBottom: 2,
                  }}>
                    Garantía
                  </div>
                  <div style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 9,
                    color: COLORS.gray,
                  }}>
                    2 años
                  </div>
                </div>

                <div style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  padding: 10,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  backgroundColor: COLORS.white,
                }}>
                  <div style={{
                    color: COLORS.red,
                    marginBottom: 6,
                    display: 'flex',
                    justifyContent: 'center',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                  <div style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 11,
                    fontWeight: 700,
                    color: COLORS.black,
                    marginBottom: 2,
                  }}>
                    Envío
                  </div>
                  <div style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 9,
                    color: COLORS.gray,
                  }}>
                    24-48h
                  </div>
                </div>

                <div style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  padding: 10,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  backgroundColor: COLORS.white,
                }}>
                  <div style={{
                    color: COLORS.red,
                    marginBottom: 6,
                    display: 'flex',
                    justifyContent: 'center',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 11,
                    fontWeight: 700,
                    color: COLORS.black,
                    marginBottom: 2,
                  }}>
                    Calidad
                  </div>
                  <div style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 9,
                    color: COLORS.gray,
                  }}>
                    Premium
                  </div>
                </div>
              </div>

              {/* Características */}
              <div style={{
                backgroundColor: COLORS.lightGray,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}>
                <h3 style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 9,
                  letterSpacing: '1.5px',
                  color: COLORS.red,
                  fontWeight: 800,
                  marginBottom: 12,
                }}>
                  CARACTERÍSTICAS
                </h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gap: 8,
                }}>
                  {technical.material && (
                    <li style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 11,
                      color: COLORS.black,
                      display: 'flex',
                      alignItems: 'start',
                      gap: 8,
                    }}>
                      <span style={{ color: COLORS.red, flexShrink: 0, fontSize: 10 }}>✓</span>
                      <span>Material: {technical.material}</span>
                    </li>
                  )}
                  {technical.color && (
                    <li style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 11,
                      color: COLORS.black,
                      display: 'flex',
                      alignItems: 'start',
                      gap: 8,
                    }}>
                      <span style={{ color: COLORS.red, flexShrink: 0, fontSize: 10 }}>✓</span>
                      <span>Color: {technical.color}</span>
                    </li>
                  )}
                  {technical.diameter && (
                    <li style={{
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 11,
                      color: COLORS.black,
                      display: 'flex',
                      alignItems: 'start',
                      gap: 8,
                    }}>
                      <span style={{ color: COLORS.red, flexShrink: 0, fontSize: 10 }}>✓</span>
                      <span>Diámetro: {technical.diameter}</span>
                    </li>
                  )}
                  <li style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 11,
                    color: COLORS.black,
                    display: 'flex',
                    alignItems: 'start',
                    gap: 8,
                  }}>
                    <span style={{ color: COLORS.red, flexShrink: 0, fontSize: 10 }}>✓</span>
                    <span>{apiProduct.inStock ? 'En stock' : 'Agotado'}</span>
                  </li>
                </ul>
              </div>

              {/* Especificaciones técnicas */}
              <div style={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: 16,
              }}>
                <h3 style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 9,
                  letterSpacing: '1.5px',
                  color: COLORS.red,
                  fontWeight: 800,
                  marginBottom: 12,
                }}>
                  FICHA TÉCNICA
                </h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {Object.entries(technical).map(([key, value], idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 8,
                        borderBottom: idx < Object.entries(technical).length - 1 || apiProduct.reference ? `1px solid ${COLORS.lightGray}` : 'none',
                      }}
                    >
                      <span style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 11,
                        fontWeight: 700,
                        color: COLORS.gray,
                        textTransform: 'capitalize',
                      }}>
                        {key}
                      </span>
                      <span style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 11,
                        color: COLORS.black,
                        textAlign: 'right',
                      }}>
                        {value}
                      </span>
                    </div>
                  ))}
                  {apiProduct.reference && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 4,
                    }}>
                      <span style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 11,
                        fontWeight: 700,
                        color: COLORS.gray,
                      }}>
                        Ref.
                      </span>
                      <span style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 11,
                        color: COLORS.black,
                        textAlign: 'right',
                      }}>
                        {apiProduct.reference}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Productos relacionados - Fuera del contenedor principal */}
      {relatedProducts.length > 0 && (
        <div style={{
          backgroundColor: COLORS.lightGray,
          padding: '40px 20px',
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'APERCU, sans-serif',
              fontSize: 24,
              fontWeight: 800,
              color: COLORS.black,
              marginBottom: 8,
            }}>
              Productos relacionados
            </h2>
            <div style={{
              height: 3,
              width: 80,
              backgroundColor: COLORS.red,
              marginBottom: 20,
            }} />
            <p style={{
              fontFamily: 'APERCU, sans-serif',
              fontSize: 14,
              color: COLORS.gray,
              marginBottom: 24,
            }}>
              Más productos para {technical.model || technical.brand || 'tu vehículo'}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : window.innerWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 16,
            }}>
              {relatedProducts.map((product) => {
                const productImageUrl = resolveImageUrl(product.imageSrc || product.imageLargeSrc || product.image_url);

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'instant' });
                      navigate(`/product/${product.id}`);
                    }}
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor: COLORS.white,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                      e.currentTarget.style.borderColor = COLORS.red;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                      e.currentTarget.style.borderColor = COLORS.border;
                    }}
                  >
                    <div style={{
                      aspectRatio: '1/1',
                      backgroundColor: COLORS.lightGray,
                      padding: 12,
                    }}>
                      {productImageUrl ? (
                        <img
                          src={productImageUrl}
                          alt={product.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 32,
                          opacity: 0.2,
                        }}>
                          📦
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 12 }}>
                      <div style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 8,
                        letterSpacing: '1.2px',
                        color: COLORS.red,
                        fontWeight: 800,
                        marginBottom: 4,
                        textTransform: 'uppercase',
                      }}>
                        {(product.type || 'PRODUCTO').toUpperCase()}
                      </div>
                      <h3 style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 12,
                        fontWeight: 800,
                        color: COLORS.black,
                        marginBottom: 6,
                        minHeight: 32,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {product.title}
                      </h3>
                      <div style={{
                        fontFamily: 'APERCU, sans-serif',
                        fontSize: 16,
                        fontWeight: 900,
                        color: COLORS.red,
                      }}>
                        {product.price ? `${product.price.toFixed(2)} €` : 'Consultar'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
