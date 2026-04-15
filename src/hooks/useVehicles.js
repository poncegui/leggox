import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

/**
 * Hook para obtener todos los vehículos únicos disponibles
 */
export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/vehicles`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setVehicles(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError(err.message);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  return { vehicles, loading, error };
}

/**
 * Hook para obtener productos compatibles con un vehículo específico
 */
export function useProductsByVehicle(vehicleId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vehicleId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE}/api/vehicles/${vehicleId}/products`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products by vehicle:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [vehicleId]);

  return { products, loading, error };
}

/**
 * Hook para buscar productos por múltiples vehículos
 */
export function useProductsByVehicles(vehicleIds) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vehicleIds || vehicleIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    async function fetchProducts() {
      try {
        setLoading(true);
        const vehiclesParam = vehicleIds.join(',');
        const response = await fetch(
          `${API_BASE}/api/search/by-vehicles?vehicles=${vehiclesParam}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products by vehicles:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [vehicleIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { products, loading, error };
}

/**
 * Hook para obtener los vehículos compatibles con un producto
 */
export function useVehiclesByProduct(productId) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    async function fetchVehicles() {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE}/api/products/${productId}/vehicles`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setVehicles(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicles by product:', err);
        setError(err.message);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, [productId]);

  return { vehicles, loading, error };
}
