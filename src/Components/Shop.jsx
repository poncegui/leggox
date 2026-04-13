import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { CartProvider, useCart } from './CartContext.jsx';

const styles = {
  container: { display: 'flex', gap: 24, alignItems: 'flex-start' },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12,
    flex: 1,
  },
  card: {
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 8,
    padding: 12,
    background: '#fff',
  },
  img: { width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 },
  cart: {
    width: 320,
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 8,
    padding: 12,
    position: 'sticky',
    top: 20,
    background: '#fff',
  },
  btn: {
    background: '#E01E37',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },
};

function ProductCard({ p }) {
  const { addToCart } = useCart();
  return (
    <div style={styles.card}>
      {p.imageSrc ? (
        <img src={p.imageSrc} alt={p.title} style={styles.img} />
      ) : null}
      <h4 style={{ margin: '8px 0 6px' }}>{p.title}</h4>
      <div style={{ color: '#666', fontSize: 13 }}>{p.subtitle}</div>
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <strong>{p.price} €</strong>
        <button style={styles.btn} onClick={() => addToCart(p, 1)}>
          Añadir
        </button>
      </div>
    </div>
  );
}

function CartPanel() {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();
  return (
    <aside style={styles.cart} aria-label="Cesta de compra">
      <h3 style={{ marginTop: 0 }}>Cesta</h3>
      {cart.length === 0 ? (
        <div>Sin artículos</div>
      ) : (
        <div>
          {cart.map(it => (
            <div
              key={it.reference}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{it.title}</div>
                <div style={{ color: '#666', fontSize: 13 }}>
                  {it.reference}
                </div>
                <div style={{ marginTop: 6 }}>
                  <button
                    onClick={() =>
                      updateQty(it.reference, Math.max(1, (it.qty || 1) - 1))
                    }
                  >
                    -
                  </button>
                  <span style={{ margin: '0 8px' }}>{it.qty}</span>
                  <button
                    onClick={() => updateQty(it.reference, (it.qty || 1) + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>{(it.price * it.qty).toFixed(2)} €</div>
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => removeFromCart(it.reference)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div
            style={{
              borderTop: '1px solid rgba(0,0,0,0.06)',
              paddingTop: 10,
              marginTop: 8,
            }}
          >
            Total: <strong>{total.toFixed(2)} €</strong>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button
              style={styles.btn}
              onClick={() => alert('Pasarela de pago no implementada')}
            >
              Pagar
            </button>
            <button onClick={clearCart}>Vaciar</button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default function Shop() {
  // Consumir productos dinámicos de la API
  const { products: allProducts, loading, error } = useProducts();

  // Filtrar productos featured
  const products = React.useMemo(() => {
    return allProducts
      .filter(p => p.stock > 0) // Solo productos en stock
      .slice(0, 24);
  }, [allProducts]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#DC2626' }}>
        <p>Error al cargar productos: {error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <CartProvider>
      <div style={styles.container}>
        <div style={styles.list}>
          {products.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', gridColumn: '1 / -1' }}>
              <p>No hay productos disponibles</p>
            </div>
          ) : (
            products.map(p => (
              <ProductCard key={p.id} p={p} />
            ))
          )}
        </div>
        <CartPanel />
      </div>
    </CartProvider>
  );
}
