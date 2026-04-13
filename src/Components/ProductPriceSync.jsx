import React from 'react';
import { useMercagarageProducts, findProductPrice } from '../hooks/useMercagarageProducts';

/**
 * Componente que muestra el precio sincronizado de Mercagarage
 * Puede envolver cualquier producto para mostrar su precio actualizado
 */
export default function ProductPriceSync({ productId, children, fallbackPrice }) {
  const { products, loading, error } = useMercagarageProducts([productId], {
    enabled: !!productId,
    cacheTime: 30, // 30 minutos de caché
  });

  const priceData = findProductPrice(products, productId);

  // Si está cargando o hay error, usar precio fallback
  if (loading || error || !priceData) {
    return children({ price: fallbackPrice, loading, error, synced: false });
  }

  return children({
    price: priceData.price,
    originalPrice: priceData.originalPrice,
    hasDiscount: priceData.hasDiscount,
    inStock: priceData.inStock,
    loading: false,
    error: null,
    synced: true,
  });
}

/**
 * Hook simplificado para obtener el precio de un solo producto
 */
export function useProductPrice(productId, fallbackPrice) {
  const { products, loading, error } = useMercagarageProducts(
    productId ? [productId] : [],
    { enabled: !!productId }
  );

  const priceData = findProductPrice(products, productId);

  return {
    price: priceData?.price ?? fallbackPrice,
    originalPrice: priceData?.originalPrice,
    hasDiscount: priceData?.hasDiscount ?? false,
    inStock: priceData?.inStock ?? true,
    loading,
    error,
    synced: !!priceData,
  };
}

/**
 * Componente de ejemplo: Indicador de sincronización de precios
 */
export function PriceSyncIndicator({ synced, loading, error, compact = false }) {
  if (loading) {
    return (
      <span
        style={{
          fontSize: compact ? 10 : 11,
          color: '#6B7280',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {compact ? '⏳' : '⏳ Actualizando...'}
      </span>
    );
  }

  if (error) {
    return (
      <span
        style={{
          fontSize: compact ? 10 : 11,
          color: '#EF4444',
          fontFamily: 'ui-monospace, monospace',
        }}
        title={error}
      >
        {compact ? '⚠️' : '⚠️ Error de sincronización'}
      </span>
    );
  }

  if (synced) {
    return (
      <span
        style={{
          fontSize: compact ? 10 : 11,
          color: '#10B981',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {compact ? '✓' : '✓ Precio actualizado'}
      </span>
    );
  }

  return null;
}
