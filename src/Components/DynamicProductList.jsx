import React from 'react';
import { useProducts } from '../hooks/useProducts';

/**
 * Componente que muestra productos dinámicos desde la base de datos
 * Reemplaza el uso de PRODUCTS_DATA estático
 */
export default function DynamicProductList({ onProductClick }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [showInStockOnly, setShowInStockOnly] = React.useState(false);

  const { products, loading, error, syncing, syncProducts } = useProducts({
    search: searchTerm,
    category: selectedCategory,
    inStock: showInStockOnly,
  });

  // IDs de productos Leggox para sincronizar
  const LEGGOX_IDS = [
    "1788", "28405", "60858", "71178", "71182", "232263", "232264",
    "232622", "87803", "87804", "87805", "87806", "87807", "87808",
    "87809", "87810", "87811", "87812", "87813", "87854", "87855",
    "87856", "87857", "87858"
  ];

  const handleSync = async () => {
    try {
      await syncProducts(LEGGOX_IDS);
      alert('✅ Productos sincronizados con Mercagarage');
    } catch (err) {
      alert('❌ Error al sincronizar: ' + err.message);
    }
  };

  if (error) {
    return (
      <div style={{
        padding: 20,
        background: '#FEE2E2',
        borderRadius: 12,
        margin: 20,
      }}>
        <h3 style={{ color: '#DC2626', marginBottom: 10 }}>Error al cargar productos</h3>
        <p style={{ color: '#991B1B' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 10,
            padding: '8px 16px',
            background: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Header con controles */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #D1D5DB',
            fontSize: 14,
          }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #D1D5DB',
            fontSize: 14,
          }}
        >
          <option value="">Todas las categorías</option>
          <option value="manguito">Manguitos</option>
          <option value="radiador">Radiadores</option>
          <option value="accesorio">Accesorios</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showInStockOnly}
            onChange={(e) => setShowInStockOnly(e.target.checked)}
          />
          <span style={{ fontSize: 14 }}>Solo en stock</span>
        </label>

        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: '10px 16px',
            background: syncing ? '#9CA3AF' : '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: syncing ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {syncing ? '🔄 Sincronizando...' : '🔄 Sincronizar con Mercagarage'}
        </button>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div style={{
          padding: 20,
          textAlign: 'center',
          color: '#6B7280',
        }}>
          Cargando productos...
        </div>
      )}

      {/* Lista de productos */}
      {!loading && products.length === 0 && (
        <div style={{
          padding: 40,
          textAlign: 'center',
          background: '#F3F4F6',
          borderRadius: 12,
        }}>
          <p style={{ color: '#6B7280', marginBottom: 12 }}>
            No hay productos en la base de datos
          </p>
          <button
            onClick={handleSync}
            style={{
              padding: '10px 20px',
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Sincronizar desde Mercagarage
          </button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick?.(product)}
              />
            ))}
          </div>

          <div style={{
            marginTop: 20,
            padding: 12,
            background: '#F3F4F6',
            borderRadius: 8,
            fontSize: 13,
            color: '#6B7280',
            textAlign: 'center',
          }}>
            Mostrando {products.length} producto{products.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Tarjeta de producto individual
 */
function ProductCard({ product, onClick }) {
  const inStock = product.stock > 0;
  const hasDiscount = product.has_discount === 1;

  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: 16,
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: 'white',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#3B82F6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#E5E7EB';
      }}
    >
      {/* Imagen placeholder */}
      <div style={{
        width: '100%',
        height: 160,
        background: product.image_url ? `url(${product.image_url})` : '#F3F4F6',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 8,
        marginBottom: 12,
      }} />

      {/* Título */}
      <h3 style={{
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 4,
        color: '#111827',
        lineHeight: 1.4,
      }}>
        {product.title}
      </h3>

      {/* Subtítulo */}
      {product.subtitle && (
        <p style={{
          fontSize: 12,
          color: '#6B7280',
          marginBottom: 8,
        }}>
          {product.subtitle}
        </p>
      )}

      {/* Referencia */}
      {product.reference && (
        <p style={{
          fontSize: 11,
          color: '#9CA3AF',
          fontFamily: 'monospace',
          marginBottom: 12,
        }}>
          REF: {product.reference}
        </p>
      )}

      {/* Precio */}
      <div style={{ marginBottom: 12 }}>
        {hasDiscount && (
          <span style={{
            fontSize: 13,
            color: '#9CA3AF',
            textDecoration: 'line-through',
            marginRight: 8,
          }}>
            €{product.original_price?.toFixed(2)}
          </span>
        )}
        <span style={{
          fontSize: 18,
          fontWeight: 700,
          color: hasDiscount ? '#DC2626' : '#111827',
        }}>
          €{product.price.toFixed(2)}
        </span>
        {hasDiscount && (
          <span style={{
            marginLeft: 8,
            fontSize: 12,
            padding: '2px 6px',
            background: '#FEE2E2',
            color: '#DC2626',
            borderRadius: 4,
            fontWeight: 600,
          }}>
            OFERTA
          </span>
        )}
      </div>

      {/* Stock */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
      }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: inStock ? '#10B981' : '#EF4444',
        }} />
        <span style={{ color: inStock ? '#059669' : '#DC2626', fontWeight: 600 }}>
          {inStock ? `${product.stock} en stock` : 'Agotado'}
        </span>
      </div>

      {/* Sincronización */}
      {product.mercagarage_synced === 1 && (
        <div style={{
          marginTop: 8,
          fontSize: 11,
          color: '#10B981',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <span>✓</span>
          <span>Sincronizado con Mercagarage</span>
        </div>
      )}
    </div>
  );
}
