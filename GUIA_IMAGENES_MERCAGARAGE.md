# 📸 Cómo usar el endpoint de imágenes de Mercagarage

## Endpoint creado

```
GET /api/products/:id/images
```

**Respuesta:**

```json
{
  "id": "1157064",
  "productTitle": "KIT Radiador Aluminio Doble Núcleo FL BI-ÁRBOL",
  "images": {
    "imageSrc": "https://mercagarage.com/1157064-home_default/radiador-aluminio-doble-nucleo-fl-bi-arbol.jpg",
    "imageLargeSrc": "https://mercagarage.com/1157064-thickbox_default/radiador-aluminio-doble-nucleo-fl-bi-arbol.jpg",
    "small": "https://mercagarage.com/1157064-small_default/radiador-aluminio-doble-nucleo-fl-bi-arbol.jpg",
    "home": "https://mercagarage.com/1157064-home_default/radiador-aluminio-doble-nucleo-fl-bi-arbol.jpg",
    "cart": "https://mercagarage.com/1157064-cart_default/radiador-aluminio-doble-nucleo-fl-bi-arbol.jpg",
    "medium": "https://mercagarage.com/1157064-medium_default/radiador-aluminio-doble-nucleo-fl-bi-arbol.jpg",
    "large": "https://mercagarage.com/1157064-large_default/radiador-aluminio-doble-nucleo-fl-bi-arbol.jpg",
    "thickbox": "https://mercagarage.com/1157064-thickbox_default/radiador-aluminio-doble-nucleo-fl-bi-arbol.jpg"
  }
}
```

---

## 🎯 Ejemplo 1: Usar el hook en componentes

```jsx
import { useMercagarageImages } from '../hooks/useMercagarageImages';

function ProductImage({ productId }) {
  const { imageSrc, imageLargeSrc, loading, error } =
    useMercagarageImages(productId);

  if (loading) return <div>Cargando imagen...</div>;
  if (error) return <div>Error al cargar imagen</div>;

  return (
    <img
      src={imageSrc}
      alt="Producto"
      onClick={() => window.open(imageLargeSrc, '_blank')}
    />
  );
}
```

---

## 🎯 Ejemplo 2: Usar en BuscadorPiezas.jsx

```jsx
import { useMercagarageImages } from '../hooks/useMercagarageImages';

function BuscadorPiezas() {
  const [selected, setSelected] = useState(null);
  const { images, loading } = useMercagarageImages(selected?.id);

  return (
    <div>
      {/* Búsqueda y selector */}
      {selected && images && !loading && (
        <img src={images.imageSrc} alt={selected.title} />
      )}
    </div>
  );
}
```

---

## 🎯 Ejemplo 3: Obtener imágenes directamente (sin hook)

```jsx
async function getProductImages(productId) {
  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000';
  const response = await fetch(`${apiBase}/api/products/${productId}/images`);
  const data = await response.json();
  return data.images;
}

// Uso:
const images = await getProductImages('1157064');
console.log(images.imageSrc); // URL para mostrar
console.log(images.imageLargeSrc); // URL para zoom
```

---

## 📝 Tipos de imágenes disponibles

| Tipo       | Tamaño aprox | Uso                  |
| ---------- | ------------ | -------------------- |
| `small`    | 96x96        | Miniaturas en listas |
| `home`     | 236x305      | Página principal     |
| `cart`     | 125x162      | Carrito de compra    |
| `medium`   | 452x584      | Ficha de producto    |
| `large`    | 381x492      | Galería              |
| `thickbox` | 1100x1422    | Zoom/ampliación      |

---

## ✅ Cuándo usar cada tipo

- **imageSrc (home_default)**: Mostrar en listas de productos, búsqueda
- **imageLargeSrc (thickbox_default)**: Modal de zoom, detalles ampliados
- **small**: Iconos o miniaturas
- **cart**: Carrito de compra

---

## 🧪 Probar el endpoint

```bash
# Con curl
curl http://localhost:4000/api/products/1157064/images

# Con fetch
fetch('http://localhost:4000/api/products/1157064/images')
  .then(r => r.json())
  .then(data => console.log(data.images.imageSrc))
```

---

## ⚙️ Variables de entorno necesarias

En tu `.env` (cliente):

```
REACT_APP_API_BASE=http://localhost:4000
```

O en servidor en `.env`:

```
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```
