import React, { createContext, useContext } from 'react';
import { useMercagarageProducts } from '../hooks/useMercagarageProducts';

// IDs de productos de Leggox a sincronizar
const LEGGOX_PRODUCT_IDS = [
  "1788", "28405", "60858", "71178", "71182", "232263", "232264",
  "232622", "87803", "87804", "87805", "87806", "87807", "87808",
  "87809", "87810", "87811", "87812", "87813", "87854", "87855",
  "87856", "87857", "87858"
];

const MercagarageContext = createContext(null);

/**
 * Provider que sincroniza automáticamente los precios de Mercagarage
 * Envuelve tu app o sección para tener acceso global a los precios
 */
export function MercagarageProvider({ children, productIds = LEGGOX_PRODUCT_IDS }) {
  const mercagarageData = useMercagarageProducts(productIds, {
    enabled: true,
    cacheTime: 30, // 30 minutos de caché
  });

  return (
    <MercagarageContext.Provider value={mercagarageData}>
      {children}
    </MercagarageContext.Provider>
  );
}

/**
 * Hook para acceder a los datos de Mercagarage desde cualquier componente
 */
export function useMercagarage() {
  const context = useContext(MercagarageContext);

  if (!context) {
    console.warn(
      'useMercagarage debe usarse dentro de MercagarageProvider. Retornando valores por defecto.'
    );
    return {
      products: [],
      loading: false,
      error: null,
      lastFetch: null,
      refetch: () => {},
      getProductPrice: () => null,
    };
  }

  const { products, loading, error, lastFetch, refetch } = context;

  // Función helper para obtener el precio de un producto específico
  const getProductPrice = (productId) => {
    const product = products.find((p) => p.id === String(productId));
    if (!product) return null;

    return {
      id: product.id,
      price: product.price?.value || null,
      originalPrice: product.price?.originalValue || null,
      hasDiscount: product.price?.hasDiscount || false,
      priceWithoutTax: product.price?.taxAlternativeValue || null,
      hasTax: product.price?.hasTax || false,
      inStock: (product.availability?.minimumQuantity || 0) > 0,
      minimumQuantity: product.availability?.minimumQuantity || 0,
    };
  };

  return {
    products,
    loading,
    error,
    lastFetch,
    refetch,
    getProductPrice,
  };
}

/**
 * Componente que muestra el estado de la sincronización
 */
export function SyncStatus({ detailed = false }) {
  const { loading, error, lastFetch, refetch } = useMercagarage();

  if (!detailed) {
    // Versión compacta
    if (loading) return <span title="Sincronizando precios...">🔄</span>;
    if (error) return <span title={`Error: ${error}`}>⚠️</span>;
    if (lastFetch) return <span title={`Última actualización: ${lastFetch.toLocaleTimeString()}`}>✓</span>;
    return null;
  }

  // Versión detallada
  return (
    <div
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 12,
        fontFamily: 'APERCU, sans-serif',
        background: error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        border: `1px solid ${error ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ flex: 1 }}>
        {loading && '🔄 Sincronizando precios de Mercagarage...'}
        {error && `⚠️ Error de sincronización: ${error}`}
        {!loading && !error && lastFetch && (
          <>
            ✓ Precios actualizados
            <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>
              Última actualización: {lastFetch.toLocaleString()}
            </div>
          </>
        )}
      </div>
      {!loading && (
        <button
          onClick={() => refetch()}
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid rgba(0,0,0,0.1)',
            background: 'white',
            cursor: 'pointer',
            fontSize: 11,
          }}
        >
          Actualizar
        </button>
      )}
    </div>
  );
}

/**
 * Hook para mesclar productos locales con precios de Mercagarage
 * Útil para actualizar PRODUCTS_DATA con precios en tiempo real
 */
export function useMergedProducts(localProducts) {
  const { products: mercagarageProducts, loading } = useMercagarage();

  const mergedProducts = React.useMemo(() => {
    if (!localProducts || localProducts.length === 0) return [];
    if (loading || !mercagarageProducts || mercagarageProducts.length === 0) {
      return localProducts;
    }

    return localProducts.map((localProduct) => {
      const mercagarageProduct = mercagarageProducts.find(
        (p) => p.id === String(localProduct.id)
      );

      if (!mercagarageProduct) {
        return localProduct;
      }

      // Merge: precios de Mercagarage + resto de datos locales
      return {
        ...localProduct,
        price: mercagarageProduct.price?.value ?? localProduct.price,
        priceEUR: mercagarageProduct.price?.value ?? localProduct.priceEUR,
        originalPrice: mercagarageProduct.price?.originalValue,
        hasDiscount: mercagarageProduct.price?.hasDiscount || false,
        priceWithoutTax: mercagarageProduct.price?.taxAlternativeValue,
        inStock: (mercagarageProduct.availability?.minimumQuantity || 0) > 0,
        mercagarage: {
          synced: true,
          lastUpdate: new Date().toISOString(),
        },
      };
    });
  }, [localProducts, mercagarageProducts, loading]);

  return {
    products: mergedProducts,
    loading,
  };
}
