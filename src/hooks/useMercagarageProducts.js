import { useState, useEffect } from 'react';

/**
 * Hook para obtener precios actualizados de Mercagarage
 * @param {string[]} productIds - Array de IDs de productos a consultar
 * @param {object} options - Opciones de configuración
 * @param {boolean} options.enabled - Si debe hacer la petición automáticamente (default: true)
 * @param {number} options.cacheTime - Tiempo de caché en minutos (default: 30)
 */
export function useMercagarageProducts(productIds = [], options = {}) {
  const { enabled = true, cacheTime = 30 } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const apiBase =
    process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');

  const fetchPrices = async (ids = productIds) => {
    if (!ids || ids.length === 0) {
      console.warn('useMercagarageProducts: No product IDs provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/api/mercagarage/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds: ids }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setLastFetch(new Date());

      // Guardar en localStorage para caché
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(
          'mercagarage_products_cache',
          JSON.stringify({
            data: result,
            timestamp: Date.now(),
          })
        );
      }
    } catch (err) {
      console.error('Error fetching Mercagarage prices:', err);
      setError(err.message);

      // Intentar cargar desde caché si hay error
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem('mercagarage_products_cache');
        if (cached) {
          try {
            const { data: cachedData, timestamp } = JSON.parse(cached);
            const age = (Date.now() - timestamp) / 1000 / 60; // minutos
            if (age < cacheTime * 2) {
              // Permitir caché más antiguo en caso de error
              console.info('Using cached Mercagarage data due to fetch error');
              setData(cachedData);
            }
          } catch (e) {
            console.error('Error parsing cached data:', e);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled || !productIds || productIds.length === 0) return;

    // Intentar cargar desde caché primero
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem('mercagarage_products_cache');
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const age = (Date.now() - timestamp) / 1000 / 60; // minutos
          if (age < cacheTime) {
            console.info(`Using cached Mercagarage data (${age.toFixed(1)}m old)`);
            setData(cachedData);
            setLastFetch(new Date(timestamp));
            return;
          }
        } catch (e) {
          console.error('Error parsing cached data:', e);
        }
      }
    }

    // Si no hay caché válido, hacer fetch
    fetchPrices(productIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, JSON.stringify(productIds)]);

  return {
    products: data,
    loading,
    error,
    lastFetch,
    refetch: fetchPrices,
  };
}

/**
 * Busca el precio de un producto específico por ID
 * @param {Array} products - Array de productos de Mercagarage
 * @param {string} productId - ID del producto a buscar
 * @returns {object|null} Objeto con price y availability, o null si no se encuentra
 */
export function findProductPrice(products, productId) {
  if (!products || !Array.isArray(products)) return null;

  const product = products.find((p) => p.id === String(productId));
  if (!product) return null;

  return {
    price: product.price?.value || null,
    originalPrice: product.price?.originalValue || null,
    hasDiscount: product.price?.hasDiscount || false,
    taxAlternativeValue: product.price?.taxAlternativeValue || null,
    hasTax: product.price?.hasTax || false,
    inStock: product.availability?.minimumQuantity > 0,
    minimumQuantity: product.availability?.minimumQuantity || 0,
  };
}
