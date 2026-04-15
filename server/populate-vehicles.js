/**
 * Script para llenar la tabla de vehículos basándose en los productos existentes
 * 
 * Uso: node populate-vehicles.js
 */

import { getAllProducts } from './database.js';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Abrir la BD
const db = new Database(join(__dirname, 'leggox.db'));

// Función para normalizar vehículos (igual que en transformers.js)
function normalizeVehicle(fullName) {
  // Convertir a minúsculas y reemplazar espacios con guiones
  const normalized = fullName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
  
  return normalized;
}

// Función para convertir nombre a ID
function vehicleToId(brand, model) {
  const modelStr = model
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
  
  return `${brand.toLowerCase()}-${modelStr}`;
}

// Función para parsear vehículos desde el modelo (igual que transformers.js)
function parseVehicles(model, brand, title = '') {
  const vehicles = [];
  const processedNumbers = new Set();

  // Si no hay brand, no procesamos nada
  if (!brand) {
    return vehicles;
  }

  if (model) {
    // Parsear múltiples modelos si existen (separados por "y", "-", ",", "/", etc)
    const modelParts = model
      .split(/\s*\/\s*|\s+y\s+|,\s*|-\s*|;\s*/i)
      .map(m => m.trim())
      .filter(m => m.length > 0);

    modelParts.forEach(m => {
      // Si es solo un número, convertir a "SEAT XXX"
      if (/^\d+$/.test(m)) {
        vehicles.push(`${brand} ${m}`);
        processedNumbers.add(m);
      } else if (!/^\d+$/.test(m)) {
        // Si no es un número puro, agregarlo con el brand
        vehicles.push(`${brand} ${m}`);
      }
    });
  } else {
    // Si no hay model, solo usar el brand
    vehicles.push(brand);
  }

  // Extraer números del título si no fueron procesados
  if (title && brand) {
    const titleNumbers = title.match(/\b(\d{3}|\d{2}|\d{1})\b/g) || [];
    titleNumbers.forEach(num => {
      // Filtrar números raros (evitar 0, 1, 2, etc)
      if (!processedNumbers.has(num) && /^\d{3}$/.test(num)) {
        vehicles.push(`${brand} ${num}`);
        processedNumbers.add(num);
      }
    });
  }

  return vehicles;
}

console.log('🚗 Poblando tabla de vehículos...\n');

try {
  // Obtener todos los productos
  const products = getAllProducts();
  console.log(`📦 Encontrados ${products.length} productos\n`);

  // Recopilar vehículos únicos
  const vehicleSet = new Set();
  const vehicleMap = new Map(); // Full name -> { brand, model, id }

  products.forEach(product => {
    const vehicles = parseVehicles(
      product.model,
      product.brand,
      product.title
    );

    vehicles.forEach(fullName => {
      if (!vehicleSet.has(fullName)) {
        vehicleSet.add(fullName);
        
        // Extraer brand y model de fullName
        const parts = fullName.split(/\s+/);
        const brand = parts[0]; // Ej: SEAT
        const model = parts.slice(1).join(' '); // Ej: 600, 133, etc

        const vehicleId = vehicleToId(brand, model);
        
        vehicleMap.set(fullName, {
          id: vehicleId,
          brand,
          model,
          full_name: fullName
        });
      }
    });
  });

  console.log(`🚙 Encontrados ${vehicleSet.size} vehículos únicos:\n`);

  // Insertar o actualizar vehículos
  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (id, brand, model, full_name)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `);

  const insertProductVehicle = db.prepare(`
    INSERT INTO product_vehicles (product_id, vehicle_id)
    VALUES (?, ?)
    ON CONFLICT(product_id, vehicle_id) DO NOTHING
  `);

  const transaction = db.transaction(() => {
    let insertedVehicles = 0;
    let insertedRelations = 0;

    // Insertar vehículos
    vehicleMap.forEach(vehicle => {
      const result = insertVehicle.run(
        vehicle.id,
        vehicle.brand,
        vehicle.model,
        vehicle.full_name
      );
      if (result.changes > 0) {
        insertedVehicles++;
        console.log(`  ✓ ${vehicle.full_name}`);
      }
    });

    console.log(`\n✅ Vehículos insertados: ${insertedVehicles}\n`);

    // Crear relaciones producto-vehículo
    console.log('🔗 Creando relaciones producto-vehículo...\n');

    products.forEach(product => {
      const vehicles = parseVehicles(
        product.model,
        product.brand,
        product.title
      );

      vehicles.forEach(fullName => {
        const vehicle = vehicleMap.get(fullName);
        if (vehicle) {
          const result = insertProductVehicle.run(product.id, vehicle.id);
          if (result.changes > 0) {
            insertedRelations++;
          }
        }
      });
    });

    return { insertedVehicles, insertedRelations };
  });

  const result = transaction();

  console.log(`✅ Relaciones creadas: ${result.insertedRelations}\n`);

  // Mostrar resumen
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));
  console.log(`Vehículos totales: ${vehicleSet.size}`);
  console.log(`Nuevos vehículos insertados: ${result.insertedVehicles}`);
  console.log(`Relaciones producto-vehículo: ${result.insertedRelations}`);
  console.log('='.repeat(50));

  // Mostrar vehículos
  const allVehicles = db.prepare('SELECT * FROM vehicles ORDER BY brand, model').all();
  console.log('\n🚗 Vehículos disponibles:');
  allVehicles.forEach(v => {
    const productCount = db.prepare(
      'SELECT COUNT(*) as count FROM product_vehicles WHERE vehicle_id = ?'
    ).get(v.id).count;
    console.log(`  • ${v.full_name} (${productCount} productos)`);
  });

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
