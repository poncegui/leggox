# Integración con Mercagarage API

Esta integración permite sincronizar automáticamente los precios e inventario desde la API de Mercagarage.

## 🚀 Configuración

### 1. Variables de entorno

Añade en tu `.env`:

```env
REACT_APP_API_BASE=http://localhost:4000
```

Para producción, ajusta la URL de tu servidor backend.

### 2. Iniciar el servidor

El servidor Express ya está configurado con el endpoint `/api/mercagarage/prices`.

```bash
cd server
node index.js
```

## 📦 Componentes y Hooks Disponibles

### `MercagarageProvider`

Envuelve tu aplicación para tener acceso global a los precios sincronizados.

```jsx
import { MercagarageProvider } from './Components/MercagarageSync';

function App() {
  return (
    <MercagarageProvider>
      <YourApp />
    </MercagarageProvider>
  );
}
```

### `useMercagarage()`

Hook para acceder a los datos desde cualquier componente.

```jsx
import { useMercagarage } from './Components/MercagarageSync';

function ProductCard({ productId }) {
  const { getProductPrice, loading } = useMercagarage();
  
  const priceData = getProductPrice(productId);
  
  if (loading) return <div>Cargando precio...</div>;
  
  return (
    <div>
      <h3>Producto {productId}</h3>
      <p>Precio: €{priceData?.price || 'Consultar'}</p>
      <p>En stock: {priceData?.inStock ? 'Sí' : 'No'}</p>
    </div>
  );
}
```

### `useMergedProducts()`

Combina productos locales con precios de Mercagarage.

```jsx
import { useMergedProducts } from './Components/MercagarageSync';
import { PRODUCTS_DATA } from './data/products';

function ProductList() {
  const { products, loading } = useMergedProducts(PRODUCTS_DATA);
  
  return (
    <div>
      {loading && <p>Actualizando precios...</p>}
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>€{product.price}</p>
          {product.mercagarage?.synced && <span>✓ Precio actualizado</span>}
        </div>
      ))}
    </div>
  );
}
```

### `useProductPrice()`

Hook simplificado para un solo producto.

```jsx
import { useProductPrice } from './Components/ProductPriceSync';

function PriceTag({ productId, fallbackPrice }) {
  const { price, loading, synced } = useProductPrice(productId, fallbackPrice);
  
  return (
    <div>
      <span>€{price}</span>
      {synced && <small>✓</small>}
    </div>
  );
}
```

### `SyncStatus`

Componente visual del estado de sincronización.

```jsx
import { SyncStatus } from './Components/MercagarageSync';

function Header() {
  return (
    <header>
      <h1>Mi Tienda</h1>
      <SyncStatus detailed={true} />
    </header>
  );
}
```

## 🎯 Ejemplos de Integración

### Ejemplo 1: Actualizar ProductShowcase

```jsx
import React from 'react';
import { useMercagarage } from './Components/MercagarageSync';

function ProductShowcase({ product }) {
  const { getProductPrice } = useMercagarage();
  const priceData = getProductPrice(product.id);
  
  // Usar precio de Mercagarage si está disponible, sino usar el local
  const displayPrice = priceData?.price ?? product.price;
  const inStock = priceData?.inStock ?? product.inStock;
  
  return (
    <div className="product-card">
      <h2>{product.title}</h2>
      <div className="price">
        {priceData?.hasDiscount && (
          <span className="original-price">€{priceData.originalPrice}</span>
        )}
        <span className="current-price">€{displayPrice}</span>
        {priceData && <small>✓ Actualizado</small>}
      </div>
      <div className="stock">
        {inStock ? '✓ En stock' : '⚠️ Agotado'}
      </div>
    </div>
  );
}
```

### Ejemplo 2: Integrar en BuscadorPiezas

```jsx
import React from 'react';
import { MercagarageProvider, useMergedProducts } from './Components/MercagarageSync';
import { PRODUCTS_DATA } from '../data/products';

function BuscadorPiezasInner() {
  const { products, loading } = useMergedProducts(PRODUCTS_DATA);
  
  return (
    <div>
      {loading && <div className="sync-indicator">Actualizando precios...</div>}
      
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function BuscadorPiezas() {
  return (
    <MercagarageProvider>
      <BuscadorPiezasInner />
    </MercagarageProvider>
  );
}
```

### Ejemplo 3: Sincronización manual

```jsx
import { useMercagarage } from './Components/MercagarageSync';

function AdminPanel() {
  const { products, loading, error, lastFetch, refetch } = useMercagarage();
  
  return (
    <div>
      <h2>Panel de Administración</h2>
      
      <div>
        <p>Productos sincronizados: {products.length}</p>
        <p>Última actualización: {lastFetch?.toLocaleString() || 'Nunca'}</p>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
      
      <button onClick={() => refetch()} disabled={loading}>
        {loading ? 'Actualizando...' : 'Actualizar Precios'}
      </button>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Precio</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>€{p.price?.value}</td>
              <td>{p.availability?.minimumQuantity > 0 ? 'Sí' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## 🔧 Características

- ✅ **Caché automático**: Los precios se guardan en localStorage por 30 minutos
- ✅ **Fallback**: Si falla la API, usa el caché o precios locales
- ✅ **Actualización manual**: Botón para refrescar precios bajo demanda
- ✅ **Indicadores visuales**: Componentes para mostrar estado de sincronización
- ✅ **TypeScript-ready**: Estructura de datos bien definida
- ✅ **Performance**: Solo hace fetch cuando es necesario

## 📊 Estructura de Datos

### Respuesta de Mercagarage API

```json
[
  {
    "id": "1788",
    "price": {
      "originalValue": 29.9,
      "value": 29.9,
      "hasDiscount": false,
      "hasTax": true,
      "taxAlternativeValue": 24.71
    },
    "availability": {
      "minimumQuantity": 1
    }
  }
]
```

### Producto Mezclado (local + Mercagarage)

```javascript
{
  // Datos locales de products.js
  id: "1788",
  title: "Manguito Silicona...",
  reference: "MOR-123",
  imageSrc: "...",
  // ... otros campos locales
  
  // Datos de Mercagarage (sobrescriben los locales)
  price: 29.9,
  priceEUR: 29.9,
  originalPrice: 29.9,
  hasDiscount: false,
  priceWithoutTax: 24.71,
  inStock: true,
  
  // Metadata de sincronización
  mercagarage: {
    synced: true,
    lastUpdate: "2026-04-11T10:30:00.000Z"
  }
}
```

## 🚦 Testing

### Probar el endpoint del servidor

```bash
curl -X POST http://localhost:4000/api/mercagarage/prices \
  -H "Content-Type: application/json" \
  -d '{"productIds":["1788","28405","60858"]}'
```

### Verificar caché

Abre la consola del navegador:

```javascript
// Ver caché actual
JSON.parse(localStorage.getItem('mercagarage_products_cache'))

// Limpiar caché
localStorage.removeItem('mercagarage_products_cache')
```

## ⚠️ Notas Importantes

1. **Seguridad**: El servidor hace de proxy para evitar exponer credenciales al cliente
2. **Rate Limiting**: El caché evita llamadas excesivas a la API de Mercagarage
3. **Precios de servidor**: En PayPal, recalcula el total en el servidor usando precios de Mercagarage
4. **IDs**: Asegúrate de que los IDs en `products.js` coincidan con los de Mercagarage

## 📝 TODO

- [ ] Añadir configuración de intervalos de actualización automática
- [ ] Implementar notificaciones cuando cambien precios
- [ ] Dashboard de administración para ver histórico de precios
- [ ] Sincronización de imágenes desde Mercagarage
- [ ] Validación de precios en PayPal usando datos de Mercagarage
