/**
 * Parser inteligente para extraer modelos de vehículos de títulos de productos
 *
 * Maneja casos como:
 * - "SEAT 124 y 133" → [124, 133]
 * - "SEAT 1200/1430 / 128" → [1200, 1430, 128]
 * - "SEAT 600-D/E" → [600]
 * - "Manguito SEAT FL/1430" → [1430]
 */

// Modelos conocidos de SEAT
const KNOWN_MODELS = [
  '600', '127', '128', '131', '133', '124', '850', '1200', '1430',
  'FURA', 'Fura', 'PANDA', 'Panda', 'MARBELLA', 'Marbella',
  'Sport', 'FL'
];

/**
 * Normaliza el nombre de un modelo
 */
function normalizeModel(model) {
  const m = model.trim().toUpperCase();

  // Casos especiales
  if (m === 'FL' || m === '1430') return '1430';
  if (m === 'SPORT') return '124 Sport';
  if (m.includes('PANDA')) return 'Panda';
  if (m.includes('MARBELLA')) return 'Marbella';
  if (m.includes('FURA')) return 'Fura';

  return m;
}

/**
 * Extrae todos los modelos de vehículos de un texto (título, subtitle, etc)
 *
 * @param {string} text - Texto a parsear
 * @returns {string[]} - Array de modelos únicos normalizados
 */
export function extractVehicleModels(text) {
  if (!text) return [];

  const models = new Set();
  const upperText = text.toUpperCase();

  // Patrón 1: "SEAT XXX y YYY" o "SEAT XXX / YYY"
  // Ejemplos: "SEAT 124 y 133", "SEAT 1200 / 1430"
  const pattern1 = /SEAT\s+([\d]+)(?:\s*[/,y]\s*([\d]+))+/gi;
  let match;

  while ((match = pattern1.exec(text)) !== null) {
    // Capturar el primer número
    models.add(normalizeModel(match[1]));

    // Buscar todos los números después de separadores
    const remaining = text.substring(match.index);
    const numbers = remaining.match(/\d{3,4}/g);
    if (numbers) {
      numbers.forEach(num => {
        if (KNOWN_MODELS.includes(num)) {
          models.add(normalizeModel(num));
        }
      });
    }
  }

  // Patrón 2: Números separados por / o y
  // Ejemplo: "1200/1430 / 128"
  const numbersPattern = /(\d{3,4})(?:\s*[/y]\s*(\d{3,4}))+/g;
  while ((match = numbersPattern.exec(text)) !== null) {
    const allNumbers = match[0].match(/\d{3,4}/g);
    if (allNumbers) {
      allNumbers.forEach(num => {
        if (KNOWN_MODELS.includes(num)) {
          models.add(normalizeModel(num));
        }
      });
    }
  }

  // Patrón 3: "SEAT XXX" simple
  const pattern3 = /SEAT\s+(\d{3,4})/gi;
  while ((match = pattern3.exec(text)) !== null) {
    if (KNOWN_MODELS.includes(match[1])) {
      models.add(normalizeModel(match[1]));
    }
  }

  // Patrón 4: Modelos con nombre (FURA, Panda, Marbella)
  if (upperText.includes('PANDA')) models.add('Panda');
  if (upperText.includes('MARBELLA')) models.add('Marbella');
  if (upperText.includes('FURA')) models.add('Fura');
  if (upperText.includes('SPORT') && upperText.includes('124')) models.add('124 Sport');

  // Patrón 5: FL/1430 → 1430
  if (upperText.includes('FL') && (upperText.includes('1430') || upperText.includes('FL/'))) {
    models.add('1430');
  }

  // Patrón 6: Buscar modelos standalone en el texto
  KNOWN_MODELS.forEach(model => {
    // Crear regex para buscar el modelo como palabra completa
    const regex = new RegExp(`\\b${model}\\b`, 'i');
    if (regex.test(text)) {
      models.add(normalizeModel(model));
    }
  });

  return Array.from(models).sort();
}

/**
 * Extrae marca y modelos de un texto
 *
 * @param {string} text - Texto a parsear
 * @returns {Object} - { brand: string, models: string[] }
 */
export function extractVehicleInfo(text) {
  const brand = text?.toUpperCase().includes('SEAT') ? 'SEAT' : null;
  const models = extractVehicleModels(text);

  return {
    brand: brand || 'SEAT', // Por defecto SEAT
    models,
  };
}

/**
 * Construye un identificador único para un vehículo
 *
 * @param {string} brand - Marca del vehículo
 * @param {string} model - Modelo del vehículo
 * @returns {string} - ID único (ej: "seat-600", "seat-panda")
 */
export function buildVehicleId(brand, model) {
  return `${brand}-${model}`.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Construye el nombre completo del vehículo
 *
 * @param {string} brand - Marca
 * @param {string} model - Modelo
 * @returns {string} - Nombre completo (ej: "SEAT 600")
 */
export function buildVehicleName(brand, model) {
  return `${brand} ${model}`;
}

// ============================================================================
// TESTS (puedes ejecutar con node vehicle-parser.js)
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Vehicle Parser\n');
  console.log('='.repeat(70));

  const testCases = [
    "SEAT 124 y 133",
    "SEAT 1200/1430 / 128",
    "Manguito radiador SEAT 600",
    "Radiador SEAT FL/1430",
    "SEAT 127 / 128 kit completo",
    "SEAT Panda manguito superior",
    "SEAT 124 Sport",
    "Kit SEAT 600-D",
    "Manguito SEAT 1200 / 1430 / 128",
    "SEAT Fura radiador",
    "SEAT 131 y 124",
    "Universal SEAT 600/850/133",
  ];

  testCases.forEach(testCase => {
    const result = extractVehicleModels(testCase);
    console.log(`\n📝 Input:  "${testCase}"`);
    console.log(`✅ Output: [${result.join(', ')}]`);
  });

  console.log('\n' + '='.repeat(70));
}
