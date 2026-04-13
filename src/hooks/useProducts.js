import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');

/**
 * Hook para obtener productos desde la API (base de datos)
 */
export function useProducts(options = {}) {
  const {
    search = '',
    category = '',
    brand = '',
    inStock = false,
    autoSync = false, // Si debe sincronizar con Mercagarage automáticamente
  } = options;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (brand) params.append('brand', brand);
      if (inStock) params.append('inStock', 'true');

      const url = `${API_BASE}/api/products${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category, brand, inStock]);

  const syncProducts = useCallback(async (productIds) => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/products/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Sincronizados ${result.synced} productos`);
        setProducts(result.products || []);
        return result;
      }
    } catch (err) {
      console.error('Error syncing products:', err);
      setError(err.message);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    syncing,
    refetch: fetchProducts,
    syncProducts,
  };
}

/**
 * Hook para obtener un solo producto por ID
 */
export function useProduct(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/products/${productId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setProduct(null);
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}

/**
 * Hook para crear un pedido
 */
export function useCreateOrder() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = useCallback(async (orderData) => {
    setCreating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  return { createOrder, creating, error };
}

/**
 * Hook para obtener estadísticas
 */
export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/stats`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
