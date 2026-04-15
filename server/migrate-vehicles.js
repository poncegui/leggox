/**
 * Script de migración para extraer vehículos de productos existentes
 *
 * Este script:
 * 1. Lee todos los productos de la BD
 * 2. Extrae modelos de vehículos de title y subtitle usando el parser
 * 3. Crea registros en la tabla vehicles
 * 4. Crea las relaciones en product_vehicles
 */

import {
  getAllProducts,
  upsertVehicle,
  linkProductToVehicle,
  clearProductVehicles,
} from './database.js';

import {
  extractVehicleModels,
  buildVehicleId,
  buildVehicleName,
} from './vehicle-parser.js';

console.log('🚗 Iniciando migración de vehículos...\n');
console.log('='.repeat(70));

async function migrateVehicles() {
  const products = getAllProducts();
  console.log(`\n📦 Total de productos a procesar: ${products.length}\n`);

  let vehiclesCreated = 0;
  let linksCreated = 0;
  let productsProcessed = 0;
  let productsWithVehicles = 0;

  const vehiclesSet = new Set(); // Para contar vehículos únicos

  for (const product of products) {
    try {
      // Combinar title y subtitle para mejor detección
      const textToParse = [
        product.title,
        product.subtitle,
        product.description,
      ]
        .filter(Boolean)
        .join(' ');

      // Extraer modelos
      const models = extractVehicleModels(textToParse);

      if (models.length === 0) {
        console.log(`⚠️  Sin vehículos detectados: ${product.title}`);
        productsProcessed++;
        continue;
      }

      // Limpiar asociaciones anteriores
      clearProductVehicles(product.id);

      // Crear vehículos y asociaciones
      for (const model of models) {
        const brand = 'SEAT'; // Por ahora solo SEAT
        const vehicleId = buildVehicleId(brand, model);
        const fullName = buildVehicleName(brand, model);

        // Crear o actualizar vehículo
        if (!vehiclesSet.has(vehicleId)) {
          upsertVehicle({
            id: vehicleId,
            brand,
            model,
            fullName,
          });
          vehiclesCreated++;
          vehiclesSet.add(vehicleId);
        }

        // Asociar producto con vehículo
        linkProductToVehicle(product.id, vehicleId);
        linksCreated++;
      }

      productsWithVehicles++;
      console.log(
        `✅ ${product.title.substring(0, 50)}... → [${models.join(', ')}]`
      );

      productsProcessed++;
    } catch (error) {
      console.error(`❌ Error procesando producto ${product.id}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RESUMEN DE MIGRACIÓN');
  console.log('='.repeat(70));
  console.log(`✨ Productos procesados: ${productsProcessed}`);
  console.log(`🚗 Vehículos únicos creados: ${vehiclesCreated}`);
  console.log(`🔗 Relaciones producto-vehículo creadas: ${linksCreated}`);
  console.log(`📦 Productos con vehículos asociados: ${productsWithVehicles}`);
  console.log(`⚠️  Productos sin vehículos: ${productsProcessed - productsWithVehicles}`);
  console.log('='.repeat(70));

  // Mostrar lista de vehículos únicos encontrados
  console.log('\n🚗 VEHÍCULOS ÚNICOS ENCONTRADOS:');
  console.log('='.repeat(70));
  const uniqueVehicles = Array.from(vehiclesSet).sort();
  uniqueVehicles.forEach(v => {
    const parts = v.split('-');
    const model = parts.slice(1).join(' ').toUpperCase();
    console.log(`  • SEAT ${model}`);
  });
  console.log('='.repeat(70));
}

// Ejecutar migración
migrateVehicles()
  .then(() => {
    console.log('\n✨ ¡Migración completada con éxito!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error en la migración:', error);
    process.exit(1);
  });
