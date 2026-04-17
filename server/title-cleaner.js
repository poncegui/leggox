/**
 * Limpiador de títulos de productos
 * Remueve menciones de modelos de vehículos del título
 * ya que estos aparecen por separado en badges/subtítulos
 */

/**
 * Limpia un título removiendo menciones de vehículos
 *
 * Ejemplo:
 * "Manguito SILICONA Superior Radiador SEAT 1200/1430 Sport Bocanegra y SEAT 128"
 * → "Manguito SILICONA Superior Radiador"
 */
export function cleanProductTitle(title) {
  if (!title) return title;

  let cleaned = title;

  // Paso 1: Remover patrones específicos de SEAT con modelos
  const seatPatterns = [
    // "SEAT 600", "SEAT 127", etc. con posibles múltiples modelos
    /\bSEAT\s+\d{3,4}(?:\s*[\/,y]\s*\d{3,4})*/gi,

    // "SEAT Panda", "SEAT Marbella", "SEAT Fura", "SEAT Sport"
    /\bSEAT\s+(?:Panda|PANDA|Marbella|MARBELLA|Fura|FURA|Sport|SPORT)\b/gi,

    // "SEAT 124 Sport", "SEAT 1430 Sport"
    /\bSEAT\s+\d{3,4}\s+Sport\b/gi,

    // "SEAT FL", "SEAT FL/1430"
    /\bSEAT\s+FL(?:\/\d{3,4})?\b/gi,
  ];

  seatPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Paso 2: Remover nombres de modelos standalone
  const modelNames = [
    /\bBocanegra\b/gi,
    /\bBOCANEGRA\b/g,
    /\bMirafiori\b/gi,
    /\bSupermirafiori\b/gi,
    /\bPanda\b/gi,      // Panda standalone
    /\bPANDA\b/g,       // PANDA standalone
    /\bMarbella\b/gi,   // Marbella standalone
    /\bMARBELLA\b/g,    // MARBELLA standalone
    /\bSport\s+(?=-)/gi, // "Sport -" (antes de guión)
    /\bSPORT\s+(?=-)/g,  // "SPORT -" (antes de guión)
    /\bSport\b(?!\s+(-|Doble))/gi, // Sport pero no si va seguido de guión o "Doble"
    /\bSPORT\b(?!\s+(-|Doble))/g,
    /\bFL\b/g, // FL standalone
  ];

  modelNames.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Paso 3: Remover números de modelos standalone con separadores
  // Ej: "1200/1430 / 128", "124 y 133"
  const numberPatterns = [
    // Múltiples números con separadores
    /\b\d{3,4}\s*[\/,]\s*\d{3,4}(?:\s*[\/,]\s*\d{3,4})*/g,

    // "124 y 133", "600 y 850"
    /\b\d{3,4}\s+y\s+\d{3,4}\b/g,

    // Números standalone al final (ej: "... 128" o "... Sport")
    /\s+(?:Sport|SPORT|Especial|ESPECIAL|Normal|NORMAL)\s*$/gi,
  ];

  numberPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Paso 4: Remover texto común que aparece con vehículos
  const commonPhrases = [
    /\s+para\s+SEAT\s+.*$/gi,
    /\s+en\s+SEAT\s+.*$/gi,
    /\s+compatible\s+con\s+SEAT\s+.*$/gi,
    /\s+válido\s+para\s+SEAT\s+.*$/gi,
  ];

  commonPhrases.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Paso 5: Limpiar conectores huérfanos y espacios múltiples
  cleaned = cleaned
    // Limpiar espacios múltiples primero
    .replace(/\s+/g, ' ')
    // Remover "y" o "," o "/" al final (incluyendo posibles espacios)
    .replace(/\s*[,\/y]\s*$/gi, '')
    // Remover "y" o "," al inicio
    .replace(/^\s*[,\/y]\s*/gi, '')
    // Limpiar guiones y paréntesis vacíos
    .replace(/\s*-\s*$/, '')
    .replace(/\(\s*\)/g, '')
    // Limpiar comas antes de puntos
    .replace(/\s*,\s*\./g, '.')
    // Trim final
    .trim()
    // Remover conectores al final una vez más después del trim
    .replace(/[,\/y]$/gi, '');

  // Paso 6: Validación - Si el título quedó muy corto, devolver el original
  if (cleaned.length < 10) {
    return title;
  }

  return cleaned;
}

/**
 * Extrae los modelos de vehículos que fueron removidos del título
 * Útil para debugging o para mostrar por separado
 */
export function extractModelsFromTitle(title) {
  if (!title) return [];

  const models = [];

  // Buscar modelos SEAT con números
  const seatNumberPattern = /SEAT\s+(\d{3,4})/gi;
  let match;

  while ((match = seatNumberPattern.exec(title)) !== null) {
    models.push(match[1]);
  }

  // Buscar modelos con nombres
  const namedModels = ['Panda', 'Marbella', 'Fura', 'Bocanegra', 'Sport'];
  namedModels.forEach(model => {
    const regex = new RegExp(`\\b${model}\\b`, 'i');
    if (regex.test(title)) {
      models.push(model);
    }
  });

  // Remover duplicados
  return [...new Set(models)];
}

// ============================================================================
// TESTS
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Title Cleaner\n');
  console.log('='.repeat(70));

  const testCases = [
    {
      input: "Manguito SILICONA Superior Radiador SEAT 1200/1430 Sport Bocanegra y SEAT 128",
      expected: "Manguito SILICONA Superior Radiador",
    },
    {
      input: "KIT Manguitos Silicona SEAT 600",
      expected: "KIT Manguitos Silicona",
    },
    {
      input: "Radiador Aluminio Doble núcleo FL BI-ÁRBOL",
      expected: "Radiador Aluminio Doble núcleo BI-ÁRBOL",
    },
    {
      input: "Manguito Silicona Llenado SEAT 124/1430 \"RANCHERA\"",
      expected: "Manguito Silicona Llenado \"RANCHERA\"",
    },
    {
      input: "Radiador SEAT 124 SPORT - Doble núcleo",
      expected: "Radiador - Doble núcleo",
    },
    {
      input: "Piloto trasero derecho Seat 127 2ª serie",
      expected: "Piloto trasero derecho 2ª serie",
    },
    {
      input: "KIT Tapizados Polipiel SEAT 600 E y L \"NEGROS\"",
      expected: "KIT Tapizados Polipiel E y L \"NEGROS\"",
    },
    {
      input: "Manguito Superior Tipo Fuelle SEAT 600 - AZUL",
      expected: "Manguito Superior Tipo Fuelle - AZUL",
    },
  ];

  testCases.forEach(({ input, expected }, i) => {
    const result = cleanProductTitle(input);
    const models = extractModelsFromTitle(input);
    const passed = result === expected;

    console.log(`\n📝 TEST ${i + 1}: ${passed ? '✅' : '❌'}`);
    console.log(`   Input:    "${input}"`);
    console.log(`   Expected: "${expected}"`);
    console.log(`   Result:   "${result}"`);
    if (models.length > 0) {
      console.log(`   Models:   [${models.join(', ')}]`);
    }
    if (!passed) {
      console.log(`   ⚠️  MISMATCH`);
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('✅ Tests completados\n');
}
