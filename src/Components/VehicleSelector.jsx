/**
 * VehicleSelector - Componente para seleccionar vehículo y filtrar productos
 *
 * Usa el nuevo sistema de vehículos normalizado que extrae modelos
 * de los títulos de productos y los muestra únicos (sin duplicados)
 */

import React, { useState } from 'react';
import { useVehicles, useProductsByVehicle } from '../hooks/useVehicles';

// Importar imágenes de coches (ajusta las rutas según tu proyecto)
import seat600 from '../Assets/images/coches/seat-600.png';
import seat127 from '../Assets/images/coches/seat-128.png';
import seat128 from '../Assets/images/coches/seat-128.png';
import seat131 from '../Assets/images/coches/seat-131.png';
import seat124 from '../Assets/images/coches/seat-124-biarbol.png';
import seat133 from '../Assets/images/coches/seat-133.png';
import seat1200 from '../Assets/images/coches/seat-1200.png';
import seat850 from '../Assets/images/coches/seat-850.png';
import seatPanda from '../Assets/images/coches/seat-panda.png';
import seatMarbella from '../Assets/images/coches/seat-marbella.png';
import SEAT1430 from '../Assets/images/coches/seat-131-biarbol.png';
import seatBocanegra from '../Assets/images/coches/seat-bocanegra.png';
import seatRanchera from '../Assets/images/coches/seat-ranchera.png';
import otros from '../Assets/images/coches/otros.png';

// Mapeo de modelos a imágenes
const MODEL_IMAGES = {
  'seat-600': seat600,
  'seat-127': seat127,
  'seat-128': seat128,
  'seat-131': seat131,
  'seat-124': seat124,
  'seat-124-sport': seatBocanegra,
  'seat-133': seat133,
  'seat-850': seat850,
  'seat-1200': seat1200,
  'seat-panda': seatPanda,
  'seat-marbella': seatMarbella,
  'seat-1430': SEAT1430,
  'seat-fura': seatRanchera,
};

const COLORS = {
  bg: '#000000',
  ink: '#FFFFFF',
  ink70: 'rgba(255,255,255,0.70)',
  ink40: 'rgba(255,255,255,0.40)',
  ink20: 'rgba(255,255,255,0.20)',
  ink10: 'rgba(255,255,255,0.10)',
  panel: 'rgba(224,30,55,0.12)',
  red: '#E01E37',
};

function VehicleSelector() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // ✅ Obtener todos los vehículos únicos desde la API
  const { vehicles, loading: loadingVehicles, error: errorVehicles } =
    useVehicles();

  // ✅ Obtener productos del vehículo seleccionado
  const {
    products,
    loading: loadingProducts,
    error: errorProducts,
  } = useProductsByVehicle(selectedVehicle);

  if (loadingVehicles) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Cargando vehículos...</div>
      </div>
    );
  }

  if (errorVehicles) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Error: {errorVehicles}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>BUSCA POR MODELO DE VEHÍCULO</h1>
      <p style={styles.subtitle}>
        Selecciona tu modelo y encuentra todos los productos compatibles
      </p>

      {/* Grid de vehículos */}
      <div style={styles.vehicleGrid}>
        {vehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            selected={selectedVehicle === vehicle.id}
            onClick={() => setSelectedVehicle(vehicle.id)}
          />
        ))}
      </div>

      {/* Productos del vehículo seleccionado */}
      {selectedVehicle && (
        <div style={styles.productsSection}>
          <h2 style={styles.productsTitle}>
            Productos compatibles con{' '}
            {vehicles.find(v => v.id === selectedVehicle)?.full_name}
          </h2>

          {loadingProducts && (
            <div style={styles.loading}>Cargando productos...</div>
          )}

          {errorProducts && (
            <div style={styles.error}>Error: {errorProducts}</div>
          )}

          {!loadingProducts && products.length === 0 && (
            <div style={styles.emptyState}>
              No hay productos disponibles para este vehículo
            </div>
          )}

          <div style={styles.productGrid}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para cada tarjeta de vehículo
function VehicleCard({ vehicle, selected, onClick }) {
  const image = MODEL_IMAGES[vehicle.id] || otros;

  return (
    <div
      style={{
        ...styles.vehicleCard,
        border: selected
          ? `3px solid ${COLORS.red}`
          : `1px solid ${COLORS.ink20}`,
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        backgroundColor: selected ? COLORS.panel : 'transparent',
      }}
      onClick={onClick}
    >
      <img src={image} alt={vehicle.full_name} style={styles.vehicleImage} />
      <div style={styles.vehicleName}>{vehicle.model}</div>
    </div>
  );
}

// Componente para cada tarjeta de producto
function ProductCard({ product }) {
  return (
    <div style={styles.productCard}>
      {product.imageSrc && (
        <img
          src={product.imageSrc}
          alt={product.title}
          style={styles.productImage}
        />
      )}
      <div style={styles.productInfo}>
        <h3 style={styles.productTitle}>{product.title}</h3>
        {product.subtitle && (
          <p style={styles.productSubtitle}>{product.subtitle}</p>
        )}
        <div style={styles.productPrice}>
          {product.onSale && product.oldPrice && (
            <span style={styles.oldPrice}>€{product.oldPrice}</span>
          )}
          <span style={styles.price}>€{product.price}</span>
        </div>
        {product.inStock ? (
          <div style={styles.inStock}>✅ En stock</div>
        ) : (
          <div style={styles.outOfStock}>❌ Sin stock</div>
        )}
      </div>
    </div>
  );
}

// Estilos
const styles = {
  container: {
    padding: '40px 20px',
    backgroundColor: COLORS.bg,
    minHeight: '100vh',
    color: COLORS.ink,
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: 12,
    color: COLORS.ink,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: COLORS.ink70,
  },
  vehicleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 20,
    marginBottom: 60,
  },
  vehicleCard: {
    padding: 20,
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  vehicleImage: {
    width: '100%',
    height: 'auto',
    maxHeight: 120,
    objectFit: 'contain',
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    color: COLORS.ink,
  },
  productsSection: {
    marginTop: 60,
    paddingTop: 40,
    borderTop: `1px solid ${COLORS.ink20}`,
  },
  productsTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 30,
    color: COLORS.ink,
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 24,
  },
  productCard: {
    padding: 20,
    borderRadius: 12,
    border: `1px solid ${COLORS.ink20}`,
    backgroundColor: COLORS.panel,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'all 0.3s ease',
  },
  productImage: {
    width: '100%',
    height: 200,
    objectFit: 'contain',
    backgroundColor: COLORS.ink10,
    borderRadius: 8,
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
    color: COLORS.ink,
  },
  productSubtitle: {
    fontSize: 13,
    margin: 0,
    color: COLORS.ink70,
  },
  productPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 800,
    color: COLORS.red,
  },
  oldPrice: {
    fontSize: 16,
    textDecoration: 'line-through',
    color: COLORS.ink40,
  },
  inStock: {
    fontSize: 13,
    color: '#00D26A',
  },
  outOfStock: {
    fontSize: 13,
    color: COLORS.ink40,
  },
  loading: {
    textAlign: 'center',
    padding: 40,
    color: COLORS.ink70,
    fontSize: 16,
  },
  error: {
    textAlign: 'center',
    padding: 40,
    color: COLORS.red,
    fontSize: 16,
  },
  emptyState: {
    textAlign: 'center',
    padding: 60,
    color: COLORS.ink40,
    fontSize: 16,
  },
};

export default VehicleSelector;
