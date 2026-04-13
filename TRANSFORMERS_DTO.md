# 🔄 Capa de Transformación (DTOs)

## Problema Resuelto

Los componentes React esperaban un formato específico de datos, pero la base de datos devolvía otro formato diferente. Esto rompía todo el UI.

### Antes (❌ Roto)

**Base de Datos devolvía:**
```json
{
  "id": "1767",
  "category": "manguito",      ← Problema
  "stock": 100,                ← Problema
  "image_url": null,           ← Problema
  "brand": "SEAT",
  "model": "600"
}
```

**Componentes esperaban:**
```json
{
  "id": "1767",
  "type": "manguito",          ← Diferente
  "inStock": true,             ← Diferente
  "imageSrc": null,            ← Diferente
  "vehicles": ["SEAT 600"],    ← No existía
  "tags": ["manguito"],        ← No existía
  "buyUrl": "https://..."      ← No existía
}
```

### Ahora (✅ Funciona)

**API devuelve formato correcto automáticamente:**
```json
{
  "id": "1767",
  "type": "manguito",
  "inStock": true,
  "imageSrc": null,
  "vehicles": ["SEAT 600"],
  "tags": ["manguito", "silicona", "kit"],
  "buyUrl": "https://mercagarage.com/inicio/1767-kit-manguitos-silicona-seat-600.html"
}
```

---

## 🏗️ Arquitectura

```
Base de Datos (SQLite)
        ↓
database.js (queries)
        ↓
transformers.js (DTOs) ← ✨ NUEVA CAPA
        ↓
API REST (JSON)
        ↓
React Hooks
        ↓
Componentes React ✅
```

---

## 📁 Archivos Involucrados

### `server/transformers.js`
Contiene las funciones de transformación:

```javascript
export function transformProductToFrontend(dbProduct) {
  return {
    // Mapeo de campos
    id: dbProduct.id,
    type: dbProduct.category,           // category → type
    inStock: dbProduct.stock > 0,       // stock → inStock (boolean)
    imageSrc: dbProduct.image_url,      // image_url → imageSrc
    
    // Generación automática
    vehicles: parseVehicles(dbProduct.model, dbProduct.brand),
    tags: parseTags(dbProduct.title, dbProduct.subtitle, dbProduct.category),
    buyUrl: generateBuyUrl(dbProduct.id, dbProduct.reference, dbProduct.title),
    
    // ... más campos
  };
}
```

### `server/index.js`
Usa los transformers en todos los endpoints:

```javascript
import { transformProductsToFrontend } from './transformers.js';

app.get("/api/products", async (req, res) => {
  const products = getAllProducts();
  
  // ✅ Transformar antes de enviar
  const transformed = transformProductsToFrontend(products);
  
  return res.json(transformed);
});
```

### Componentes React
Ya NO necesitan transformar:

```javascript
// ❌ ANTES (transformaban los datos)
const PRODUCTS = apiProducts.map(p => ({
  type: p.category,
  inStock: p.stock > 0,
  // ... más transformaciones
}));

// ✅ AHORA (directamente)
const PRODUCTS = apiProducts;
```

---

## 🔧 Funciones del Transformer

### `transformProductToFrontend(dbProduct)`
Transforma un producto de BD al formato frontend.

**Campos mapeados:**
- `category` → `type`
- `stock` → `inStock` (boolean)
- `image_url` → `imageSrc` y `imageLargeSrc`
- `has_discount` → `onSale` y `hasDiscount`
- `original_price` → `oldPrice`

**Campos generados:**
- `vehicles` - Extraído de `brand` y `model`
- `tags` - Extraído de `title`, `subtitle`, `category`
- `buyUrl` - Generado para Mercagarage
- `images` - Objeto con `sketch` y `real`

### `parseVehicles(model, brand)`
Genera el array de vehículos compatibles.

```javascript
parseVehicles("600", "SEAT")
// → ["SEAT 600"]
```

### `parseTags(title, subtitle, category)`
Extrae palabras clave relevantes.

```javascript
parseTags("KIT Manguitos Silicona SEAT 600", "", "manguito")
// → ["manguito", "silicona", "kit"]
```

### `generateBuyUrl(id, reference, title)`
Genera URL de compra en Mercagarage.

```javascript
generateBuyUrl("1767", "REF-123", "KIT Manguitos Silicona SEAT 600")
// → "https://mercagarage.com/inicio/1767-kit-manguitos-silicona-seat-600.html"
```

---

## 🎯 Ventajas

### 1. Separación de Responsabilidades
- Backend: Almacena datos en formato óptimo para BD
- Frontend: Recibe datos en formato óptimo para UI
- Transformers: Adaptador entre ambos

### 2. Un Solo Lugar de Transformación
- Antes: Cada componente transformaba
- Ahora: Solo `transformers.js`
- Más fácil de mantener

### 3. Compatibilidad con Componentes Existentes
- No hay que modificar lógica de UI
- Los componentes siguen funcionando igual
- Solo cambia de dónde vienen los datos

### 4. Extensible
Fácil añadir nuevos campos:

```javascript
export function transformProductToFrontend(dbProduct) {
  return {
    // ... campos existentes
    
    // ✨ Añadir nuevo campo
    newField: computeNewField(dbProduct),
  };
}
```

---

## 📊 Ejemplo Completo

### Base de Datos
```sql
SELECT * FROM products WHERE id = '1767';
```

```
id: 1767
category: manguito
title: KIT Manguitos Silicona SEAT 600
price: 69.9
stock: 100
brand: SEAT
model: 600
image_url: null
```

### Transformer Aplica
```javascript
transformProductToFrontend({
  id: "1767",
  category: "manguito",
  title: "KIT Manguitos Silicona SEAT 600",
  price: 69.9,
  stock: 100,
  brand: "SEAT",
  model: "600",
  image_url: null,
})
```

### API Devuelve
```json
{
  "id": "1767",
  "reference": null,
  "sku": null,
  "slug": null,
  "type": "manguito",
  "title": "KIT Manguitos Silicona SEAT 600",
  "subtitle": "",
  "price": 69.9,
  "priceEUR": 69.9,
  "oldPrice": null,
  "onSale": false,
  "inStock": true,
  "stock": 100,
  "featured": true,
  "imageSrc": null,
  "imageLargeSrc": null,
  "images": {
    "sketch": null,
    "real": null
  },
  "buyUrl": "https://mercagarage.com/inicio/1767-kit-manguitos-silicona-seat-600.html",
  "brand": "SEAT",
  "model": "600",
  "vehicles": ["SEAT 600"],
  "tags": ["manguito", "silicona", "kit"]
}
```

### React Componente Usa
```jsx
function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.title}</h3>
      <p>Tipo: {product.type}</p>
      <p>Precio: €{product.price}</p>
      <p>Stock: {product.inStock ? 'Disponible' : 'Agotado'}</p>
      <p>Modelos: {product.vehicles.join(', ')}</p>
      <a href={product.buyUrl}>Comprar</a>
    </div>
  );
}
```

---

## 🔄 Flujo de Datos Completo

```
1. Usuario → GET /api/products
              ↓
2. Express → getAllProducts()
              ↓
3. Database.js → SELECT * FROM products
              ↓
4. SQLite → [productos en formato BD]
              ↓
5. Transformers.js → transformProductsToFrontend()
              ↓
6. API → [productos en formato frontend]
              ↓
7. React → useProducts() hook
              ↓
8. Componente → Renderiza UI ✅
```

---

## 🐛 Troubleshooting

### "Property 'type' is undefined"
→ El transformer no se está aplicando. Verifica que el endpoint use `transformProductsToFrontend()`

### "Vehicles array is empty"
→ No hay `brand` o `model` en la BD. Agrega manualmente:
```sql
UPDATE products SET brand = 'SEAT', model = '600' WHERE id = '1767';
```

### "Tags array is empty"
→ El `title` no contiene palabras clave. El transformer las extrae automáticamente.

---

## ✅ Checklist de Integración

- [x] `server/transformers.js` creado
- [x] `server/index.js` actualizado con transformers
- [x] Componentes simplificados (sin transformaciones)
- [x] API devuelve formato correcto
- [x] Frontend funciona sin errores

---

**🎉 ¡Tu UI ya no está roto!**

Todos los componentes ahora reciben el formato exacto que esperan.
