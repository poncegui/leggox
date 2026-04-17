/**
 * Resuelve URLs de imágenes relativas a URLs absolutas
 * @param {string} url - URL de la imagen (puede ser relativa o absoluta)
 * @returns {string|null} - URL absoluta o null si no hay URL
 */
export function resolveImageUrl(url) {
  if (!url) return null;

  // Si ya es una URL absoluta (http/https), devolverla tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Si es una URL relativa que comienza con /, agregar el base del API
  if (url.startsWith('/')) {
    const apiBase = process.env.REACT_APP_API_BASE ||
      (process.env.NODE_ENV === 'development'
        ? 'http://localhost:4000'
        : '');
    return `${apiBase}${url}`;
  }

  return url;
}

/**
 * Resuelve múltiples URLs de imágenes
 * @param {Array<string>} urls - Array de URLs
 * @returns {Array<string>} - Array de URLs resueltas
 */
export function resolveImageUrls(urls) {
  if (!Array.isArray(urls)) return [];
  return urls.map(resolveImageUrl).filter(Boolean);
}
