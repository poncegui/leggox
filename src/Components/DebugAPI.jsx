import React from 'react';
import { useProducts } from '../hooks/useProducts';

/**
 * Componente de debug para verificar que la API funciona
 * Úsalo temporalmente en tu app para ver si se conecta a la API
 */
export default function DebugAPI() {
  const { products, loading, error } = useProducts();

  const [showDetails, setShowDetails] = React.useState(false);

  const styles = {
    container: {
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'white',
      border: '2px solid #E01E37',
      borderRadius: 12,
      padding: 20,
      maxWidth: 400,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: 13,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      paddingBottom: 10,
      borderBottom: '1px solid #eee',
    },
    title: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#E01E37',
    },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      fontSize: 20,
      cursor: 'pointer',
      padding: 0,
      width: 24,
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    status: {
      padding: 10,
      borderRadius: 6,
      marginBottom: 10,
      fontSize: 12,
    },
    success: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
    },
    error: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
    },
    loading: {
      background: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeaa7',
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      marginTop: 10,
    },
    stat: {
      background: '#f8f9fa',
      padding: 8,
      borderRadius: 6,
      textAlign: 'center',
    },
    statLabel: {
      fontSize: 10,
      color: '#666',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#E01E37',
    },
    toggle: {
      background: '#E01E37',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: 6,
      cursor: 'pointer',
      fontSize: 11,
      marginTop: 10,
      width: '100%',
    },
    productList: {
      maxHeight: 200,
      overflowY: 'auto',
      marginTop: 10,
      padding: 10,
      background: '#f8f9fa',
      borderRadius: 6,
      fontSize: 11,
    },
  };

  const [isMinimized, setIsMinimized] = React.useState(false);

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: '#E01E37',
          color: 'white',
          padding: '10px 15px',
          borderRadius: 30,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: 'bold',
        }}
      >
        🔍 Debug API ({products.length})
      </div>
    );
  }

  const manguitos = products.filter(p => p.type === 'manguito');
  const radiadores = products.filter(p => p.type === 'radiador');
  const inStock = products.filter(p => p.inStock);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🔍 Debug API</div>
        <button
          onClick={() => setIsMinimized(true)}
          style={styles.closeBtn}
          title="Minimizar"
        >
          −
        </button>
      </div>

      {loading && (
        <div style={{ ...styles.status, ...styles.loading }}>
          ⏳ Cargando productos de la API...
        </div>
      )}

      {error && (
        <div style={{ ...styles.status, ...styles.error }}>
          ❌ Error: {error}
          <div style={{ fontSize: 10, marginTop: 5 }}>
            Verifica que el servidor esté en http://localhost:4000
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ ...styles.status, ...styles.success }}>
            ✅ API conectada correctamente
          </div>

          <div style={styles.stats}>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Total</div>
              <div style={styles.statValue}>{products.length}</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>En Stock</div>
              <div style={styles.statValue}>{inStock.length}</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Manguitos</div>
              <div style={styles.statValue}>{manguitos.length}</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Radiadores</div>
              <div style={styles.statValue}>{radiadores.length}</div>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            style={styles.toggle}
          >
            {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
          </button>

          {showDetails && (
            <div style={styles.productList}>
              <strong>Primeros 5 productos:</strong>
              {products.slice(0, 5).map((p, i) => (
                <div key={p.id} style={{ marginTop: 8, paddingTop: 8, borderTop: i > 0 ? '1px solid #ddd' : 'none' }}>
                  <div><strong>{p.title}</strong></div>
                  <div>ID: {p.id} | Tipo: {p.type} | €{p.price}</div>
                  <div>Stock: {p.inStock ? '✓' : '✗'} | Featured: {p.featured ? '✓' : '✗'}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ fontSize: 10, color: '#999', marginTop: 10, textAlign: 'center' }}>
        API: {process.env.REACT_APP_API_BASE || 'http://localhost:4000'}
      </div>
    </div>
  );
}
