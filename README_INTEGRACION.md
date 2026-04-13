# ✅ Integración Completa: Frontend + Backend + Base de Datos

## 🎯 ¿Qué tiene ahora tu aplicación?

✅ **Base de datos SQLite** con productos, pedidos y sincronización  
✅ **API REST completa** para gestionar todo  
✅ **Productos dinámicos** (adiós datos estáticos)  
✅ **Sincronización con Mercagarage** (precios en tiempo real)  
✅ **Stock actualizado automáticamente** al comprar  
✅ **Registro completo de pedidos** con PayPal

---

## 🚀 Quick Start (3 pasos)

### 1. Instala la dependencia de base de datos

```bash
cd server
npm install better-sqlite3
```

### 2. Inicia el servidor

```bash
cd server
node index.js
```

Verás:
```
✅ Base de datos inicializada
Payments API running on :4000
```

### 3. Prueba que funciona

```bash
# Desde la raíz del proyecto
node test-database.js
```

Si todo está bien, verás:
```
🎉 ¡Todo funcionando correctamente!
```

---

## 📖 Cómo Usar en tu App

### Reemplazar productos estáticos por dinámicos

**ANTES (estático):**
```jsx
import { PRODUCTS_DATA } from '../data/products';

function ProductList() {
  return PRODUCTS_DATA.map(p => <ProductCard product={p} />);
}
```

**AHORA (dinámico):**
```jsx
import { useProducts } from '../hooks/useProducts';

function ProductList() {
  const { products, loading } = useProducts();

  if (loading) return <p>Cargando...</p>;

  return products.map(p => <ProductCard product={p} />);
}
```

### Usar el componente de ejemplo

```jsx
import DynamicProductList from './Components/DynamicProductList';

function App() {
  return (
    <div>
      <h1>Productos Leggox</h1>
      <DynamicProductList onProductClick={(product) => {
        console.log('Producto clickeado:', product);
      }} />
    </div>
  );
}
```

El componente incluye:
- ✅ Búsqueda de productos
- ✅ Filtros (categoría, stock)
- ✅ Botón de sincronización con Mercagarage
- ✅ Visualización de stock en tiempo real

---

## 🔄 Sincronizar con Mercagarage

### Desde el frontend

```jsx
import { useProducts } from '../hooks/useProducts';

function AdminPanel() {
  const { syncProducts } = useProducts();

  const handleSync = async () => {
    await syncProducts([
      "1788", "28405", "60858", "87803", "87804"
    ]);
    alert('¡Sincronizado!');
  };

  return <button onClick={handleSync}>Sincronizar</button>;
}
```

### Desde la API

```bash
curl -X POST http://localhost:4000/api/products/sync \
  -H "Content-Type: application/json" \
  -d '{"productIds":["1788","28405","60858"]}'
```

---

## 🛒 Flujo de Compra

```
1. Usuario llena formulario → 
2. Click en PayPal → 
3. SE CREA PEDIDO EN BD (status: pending) → 
4. Usuario paga → 
5. PEDIDO SE MARCA COMO COMPLETADO → 
6. STOCK SE REDUCE AUTOMÁTICAMENTE
```

**No necesitas hacer nada extra**, el componente `CheckoutFormPayPal` ya está integrado.

---

## 📊 Endpoints de la API

| Método | Endpoint | Qué hace |
|--------|----------|----------|
| `GET` | `/api/products` | Lista todos los productos |
| `GET` | `/api/products/:id` | Un producto específico |
| `POST` | `/api/products/sync` | Sincroniza con Mercagarage |
| `GET` | `/api/orders` | Lista todos los pedidos |
| `GET` | `/api/orders/:id` | Un pedido específico |
| `POST` | `/api/orders` | Crea un nuevo pedido |
| `GET` | `/api/stats` | Estadísticas generales |

---

## 📁 Archivos Importantes

### Backend
- `server/index.js` - API REST con todos los endpoints
- `server/database.js` - Gestión de base de datos
- `server/leggox.db` - Base de datos SQLite (auto-generada)

### Frontend
- `src/hooks/useProducts.js` - Hook para productos dinámicos
- `src/Components/DynamicProductList.jsx` - Componente de ejemplo
- `src/Components/PayPalCheckout.jsx` - Integrado con BD
- `src/Components/CheckoutFormPayPal.jsx` - Integrado con BD

### Documentación
- `GUIA_COMPLETA_BD.md` - Guía técnica completa
- `README_INTEGRACION.md` - Este archivo (resumen)
- `test-database.js` - Script de pruebas

---

## 🧪 Comandos de Prueba

```bash
# Test básico
node test-database.js

# Test con sincronización
node test-database.js --sync

# Test con creación de pedido
node test-database.js --create-order

# Test completo
node test-database.js --sync --create-order
```

---

## 💡 Ejemplos Comunes

### 1. Mostrar solo productos en stock

```jsx
const { products } = useProducts({ inStock: true });
```

### 2. Buscar productos

```jsx
const { products } = useProducts({ search: 'manguito' });
```

### 3. Filtrar por categoría

```jsx
const { products } = useProducts({ category: 'radiador' });
```

### 4. Ver estadísticas

```jsx
import { useStats } from '../hooks/useProducts';

function Dashboard() {
  const { stats } = useStats();

  return (
    <div>
      <p>Productos: {stats.products.total}</p>
      <p>Pedidos: {stats.orders.completed}</p>
      <p>Ingresos: €{stats.revenue.total}</p>
    </div>
  );
}
```

---

## ⚡ Ventajas de Esta Integración

| Antes | Ahora |
|-------|-------|
| Productos en archivo estático | Productos en base de datos |
| Precios desactualizados | Sincronizados con Mercagarage |
| Sin control de stock | Stock se actualiza al comprar |
| Pedidos solo en PayPal | Pedidos registrados en tu BD |
| Sin estadísticas | Dashboard con métricas |

---

## 🎓 Próximos Pasos

1. **Lee** `GUIA_COMPLETA_BD.md` para detalles técnicos
2. **Prueba** el componente `DynamicProductList`
3. **Reemplaza** tus componentes estáticos con `useProducts()`
4. **Sincroniza** tus productos de Mercagarage
5. **Explora** la base de datos con:
   ```bash
   sqlite3 server/leggox.db
   ```

---

## 🐛 Problemas Comunes

**"Cannot find module 'better-sqlite3'"**
```bash
cd server && npm install better-sqlite3
```

**"fetch failed" al hacer requests**
```bash
# Asegúrate de que el servidor esté corriendo
cd server && node index.js
```

**"No hay productos"**
```bash
# Sincroniza desde Mercagarage
node test-database.js --sync
```

**"Database is locked"**
- Cierra cualquier programa que acceda a `leggox.db`

---

## 📞 ¿Necesitas Ayuda?

1. Revisa `GUIA_COMPLETA_BD.md` (documentación técnica completa)
2. Mira ejemplos en `src/Components/DynamicProductList.jsx`
3. Ejecuta `node test-database.js` para diagnosticar

---

**🎉 ¡Todo listo!** Tu app ahora tiene una base de datos completa y se sincroniza con Mercagarage.
