/**
 * EJEMPLO DE INTEGRACIÓN DE MERCAGARAGE
 *
 * Este archivo muestra cómo integrar la sincronización de Mercagarage
 * en diferentes partes de tu aplicación.
 */

// ============================================================================
// EJEMPLO 1: Envolver App.js con MercagarageProvider
// ============================================================================

import { MercagarageProvider } from "./Components/MercagarageSync";
import { Route, Routes } from "react-router-dom";
import LandingView from "./Views/LandingView";

function AppWithMercagarage() {
  return (
    <MercagarageProvider>
      <Routes>
        <Route path="/" element={<LandingView />} />
      </Routes>
    </MercagarageProvider>
  );
}

// ============================================================================
// EJEMPLO 2: Modificar ProductShowcase para usar precios en tiempo real
// ============================================================================

import React from 'react';
import { useMercagarage } from './Components/MercagarageSync';
import { PRODUCTS_DATA } from './data/products';

function ProductShowcaseWithSync() {
  const { getProductPrice, loading } = useMercagarage();
  const [selectedProduct, setSelectedProduct] = React.useState(null);

  // Encuentra el producto y mezcla con precio de Mercagarage
  const getProductData = (productId) => {
    const localProduct = PRODUCTS_DATA.find(p => p.id === productId);
    if (!localProduct) return null;

    const priceData = getProductPrice(productId);

    return {
      ...localProduct,
      // Usar precio de Mercagarage si existe, sino usar local
      price: priceData?.price ?? localProduct.price,
      priceEUR: priceData?.price ?? localProduct.priceEUR,
      inStock: priceData?.inStock ?? localProduct.inStock,
      hasDiscount: priceData?.hasDiscount ?? false,
      originalPrice: priceData?.originalPrice,
      // Bandera para saber si está sincronizado
      isSynced: !!priceData,
    };
  };

  return (
    <div>
      {loading && (
        <div style={{
          padding: 8,
          background: '#FEF3C7',
          borderRadius: 8,
          fontSize: 12,
          marginBottom: 12
        }}>
          🔄 Actualizando precios de Mercagarage...
        </div>
      )}

      {/* Tu componente ProductShowcase normal */}
      <YourProductShowcaseComponent
        getProductData={getProductData}
      />
    </div>
  );
}

// ============================================================================
// EJEMPLO 3: Tarjeta de producto con precio sincronizado
// ============================================================================

import { useProductPrice } from './Components/ProductPriceSync';
import { PriceSyncIndicator } from './Components/ProductPriceSync';

function ProductCard({ product }) {
  const {
    price,
    hasDiscount,
    originalPrice,
    inStock,
    loading,
    synced
  } = useProductPrice(product.id, product.price);

  return (
    <div className="product-card">
      {/* Imagen */}
      <img src={product.imageSrc} alt={product.alt} />

      {/* Título */}
      <h3>{product.title}</h3>

      {/* Precio */}
      <div className="price-section">
        {hasDiscount && (
          <span className="original-price" style={{ textDecoration: 'line-through' }}>
            €{originalPrice}
          </span>
        )}
        <span className="current-price">
          €{price || 'Consultar'}
        </span>
        <PriceSyncIndicator synced={synced} loading={loading} compact />
      </div>

      {/* Stock */}
      <div className="stock-indicator">
        {inStock ? (
          <span style={{ color: '#10B981' }}>✓ En stock</span>
        ) : (
          <span style={{ color: '#EF4444' }}>⚠️ Agotado</span>
        )}
      </div>

      {/* Botón de compra */}
      <button
        disabled={!inStock}
        onClick={() => window.open(product.buyUrl, '_blank')}
      >
        {inStock ? 'Comprar en Mercagarage' : 'No disponible'}
      </button>
    </div>
  );
}

// ============================================================================
// EJEMPLO 4: Lista de productos con todos los precios sincronizados
// ============================================================================

import { useMergedProducts, SyncStatus } from './Components/MercagarageSync';

function ProductListWithSync() {
  const { products, loading } = useMergedProducts(PRODUCTS_DATA);

  // Filtrar solo productos de Leggox (87xxx, 71xxx, etc)
  const leggoxProducts = products.filter(p =>
    /^(87|71|232|28|60|1788)/.test(p.id)
  );

  return (
    <div>
      {/* Header con estado de sync */}
      <div style={{ marginBottom: 20 }}>
        <h2>Productos Leggox</h2>
        <SyncStatus detailed={false} />
      </div>

      {/* Grid de productos */}
      <div className="products-grid">
        {leggoxProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Info de sincronización */}
      {!loading && (
        <div style={{ marginTop: 20, fontSize: 12, color: '#6B7280' }}>
          <p>
            ✓ {leggoxProducts.filter(p => p.mercagarage?.synced).length} de{' '}
            {leggoxProducts.length} productos con precios actualizados de Mercagarage
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EJEMPLO 5: BuscadorPiezas integrado
// ============================================================================

import BuscadorPiezas from './Components/BuscadorPiezas';

function BuscadorPiezasPage() {
  return (
    <MercagarageProvider>
      <div className="buscador-page">
        <header>
          <h1>Buscador de Piezas</h1>
          <SyncStatus detailed={true} />
        </header>

        <BuscadorPiezas />
      </div>
    </MercagarageProvider>
  );
}

// ============================================================================
// EJEMPLO 6: Panel de administración con control manual
// ============================================================================

import { useMercagarage } from './Components/MercagarageSync';

function AdminDashboard() {
  const { products, loading, error, lastFetch, refetch } = useMercagarage();

  const stats = {
    total: products.length,
    inStock: products.filter(p => (p.availability?.minimumQuantity || 0) > 0).length,
    withDiscount: products.filter(p => p.price?.hasDiscount).length,
  };

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración - Mercagarage</h1>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Productos Totales</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>En Stock</h3>
          <p className="stat-number">{stats.inStock}</p>
        </div>
        <div className="stat-card">
          <h3>Con Descuento</h3>
          <p className="stat-number">{stats.withDiscount}</p>
        </div>
      </div>

      {/* Control de sincronización */}
      <div className="sync-control">
        <div>
          <p>
            <strong>Última actualización:</strong>{' '}
            {lastFetch ? lastFetch.toLocaleString() : 'Nunca'}
          </p>
          {error && (
            <p style={{ color: 'red' }}>
              <strong>Error:</strong> {error}
            </p>
          )}
        </div>

        <button
          onClick={() => refetch()}
          disabled={loading}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Actualizando...' : '🔄 Actualizar Precios'}
        </button>
      </div>

      {/* Tabla de productos */}
      <table className="products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Precio</th>
            <th>Precio Original</th>
            <th>Descuento</th>
            <th>Sin IVA</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>€{product.price?.value || '-'}</td>
              <td>€{product.price?.originalValue || '-'}</td>
              <td>{product.price?.hasDiscount ? '✓' : '-'}</td>
              <td>€{product.price?.taxAlternativeValue || '-'}</td>
              <td>
                {(product.availability?.minimumQuantity || 0) > 0 ? (
                  <span style={{ color: 'green' }}>✓</span>
                ) : (
                  <span style={{ color: 'red' }}>✗</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// EJEMPLO 7: Integración en PayPal con validación de precios
// ============================================================================

import PayPalCheckout from './Components/PayPalCheckout';
import { useMercagarage } from './Components/MercagarageSync';

function CheckoutWithPriceValidation({ product }) {
  const { getProductPrice } = useMercagarage();

  // Obtener precio actualizado de Mercagarage
  const priceData = getProductPrice(product.id);
  const validatedPrice = priceData?.price ?? product.price;

  // Verificar si el precio local difiere del de Mercagarage
  const priceChanged = priceData && priceData.price !== product.price;

  return (
    <div>
      {priceChanged && (
        <div style={{
          padding: 12,
          background: '#FEF3C7',
          borderRadius: 8,
          marginBottom: 12,
          fontSize: 14,
        }}>
          ⚠️ El precio ha sido actualizado de €{product.price} a €{validatedPrice}
        </div>
      )}

      {!priceData?.inStock && (
        <div style={{
          padding: 12,
          background: '#FEE2E2',
          borderRadius: 8,
          marginBottom: 12,
          fontSize: 14,
        }}>
          ⚠️ Este producto actualmente no está disponible en stock
        </div>
      )}

      <PayPalCheckout
        cart={{
          items: [{
            id: product.id,
            title: product.title,
            qty: 1,
            unitPrice: validatedPrice, // Usar precio validado
          }],
          total: validatedPrice.toFixed(2),
          currency: 'EUR',
        }}
        onSuccess={(details) => {
          console.log('Pago completado:', details);
        }}
        onError={(error) => {
          console.error('Error en el pago:', error);
        }}
      />
    </div>
  );
}

export {
  AppWithMercagarage,
  ProductShowcaseWithSync,
  ProductCard,
  ProductListWithSync,
  BuscadorPiezasPage,
  AdminDashboard,
  CheckoutWithPriceValidation,
};
