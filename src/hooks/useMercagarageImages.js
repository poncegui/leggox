import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para obtener URLs de imágenes de productos desde Mercagarage
 * @param {string} productId - ID del producto
 * @param {object} options - Opciones de configuración
 * @param {boolean} options.enabled - Si debe hacer la petición automáticamente (default: true)
 */
export function useMercagarageImages(productId, options = {}) {
  const { enabled = true } = options;

  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiBase =
    process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');

  const fetchImages = useCallback(async (id = productId) => {
    if (!id) {
      console.warn('useMercagarageImages: No product ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/api/products/${id}/images`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setImages(result.images);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, productId]);

  useEffect(() => {
    if (!enabled || !productId) return;
    fetchImages();
  }, [productId, enabled, fetchImages]);

  return {
    images,
    loading,
    error,
    refetch: fetchImages,
    imageSrc: images?.imageSrc,
    imageLargeSrc: images?.imageLargeSrc,
  };
}
