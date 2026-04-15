/**
 * Parser de información técnica de productos
 *
 * Extrae datos técnicos de títulos y descripciones como:
 * - Material (Silicona, Aluminio, etc.)
 * - Cilindrada del motor (1430cc, 1600cc, etc.)
 * - Medidas y dimensiones
 * - Tipo de pieza (Superior, Inferior, etc.)
 * - Características especiales
 */

/**
 * Extrae información técnica de un producto
 * @param {Object} product - Producto con title, subtitle, description
 * @returns {Object} - Objeto technical con datos extraídos
 */
export function extractTechnicalInfo(product) {
  const text = [
    product.title,
    product.subtitle,
    product.description,
  ]
    .filter(Boolean)
    .join(' ');

  const technical = {};

  // 1. Extraer Material
  const material = extractMaterial(text);
  if (material) technical.material = material;

  // 2. Extraer Cilindrada del motor
  const engineSize = extractEngineSize(text);
  if (engineSize) technical.engineSize = engineSize;

  // 3. Extraer Color
  const color = extractColor(text);
  if (color) technical.color = color;

  // 4. Extraer Tipo/Ubicación
  const type = extractType(text);
  if (type) technical.type = type;

  // 5. Extraer Medidas/Dimensiones
  const measurements = extractMeasurements(text);
  if (measurements) technical.measurements = measurements;

  // 6. Extraer Capas (para manguitos de silicona)
  const layers = extractLayers(text);
  if (layers) technical.layers = layers;

  // 7. Extraer núcleos (para radiadores)
  const cores = extractCores(text);
  if (cores) technical.cores = cores;

  // 8. Extraer notas especiales
  const notes = extractNotes(text);
  if (notes) technical.notes = notes;

  // 9. Extraer si es OEM/Original
  const isOEM = extractOEM(text);
  if (isOEM) technical.isOEM = true;

  // 10. Extraer diámetro interior (para tubos)
  const diameter = extractDiameter(text);
  if (diameter) technical.diameter = diameter;

  return Object.keys(technical).length > 0 ? technical : null;
}

/**
 * Extrae el material del producto
 */
function extractMaterial(text) {
  const materials = {
    'silicona triple capa': 'Silicona Triple Capa',
    'silicona': 'Silicona',
    'aluminio': 'Aluminio',
    'goma': 'Goma',
    'poliuretano': 'Poliuretano',
    'polipiel': 'Polipiel',
    'inox': 'Acero Inoxidable',
    'acero inoxidable': 'Acero Inoxidable',
  };

  const textLower = text.toLowerCase();

  for (const [key, value] of Object.entries(materials)) {
    if (textLower.includes(key)) {
      return value;
    }
  }

  return null;
}

/**
 * Extrae cilindrada del motor (ej: 1430cc, 1600cc)
 */
function extractEngineSize(text) {
  const match = text.match(/(\d{3,4})\s*cc/i);
  if (match) {
    return `${match[1]}cc`;
  }

  // Buscar también referencias a motores sin "cc"
  const engineMatch = text.match(/motor\s+(\d{3,4})/i);
  if (engineMatch) {
    return `${engineMatch[1]}cc`;
  }

  return null;
}

/**
 * Extrae el color del producto
 */
function extractColor(text) {
  const colors = {
    'rojo': 'Rojo',
    'rojos': 'Rojo',
    'azul': 'Azul',
    'azules': 'Azul',
    'negro': 'Negro',
    'negros': 'Negro',
    'blanco': 'Blanco',
    'verde': 'Verde',
    'amarillo': 'Amarillo',
    'naranja': 'Naranja',
    'beige': 'Beige',
    'crema': 'Crema',
    'marrón': 'Marrón',
    'marrones': 'Marrón',
  };

  const textLower = text.toLowerCase();

  for (const [key, value] of Object.entries(colors)) {
    // Buscar como palabra completa o en contexto de color
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(textLower)) {
      return value;
    }
  }

  return null;
}

/**
 * Extrae tipo/ubicación de la pieza
 */
function extractType(text) {
  const types = {
    'superior': 'Superior',
    'inferior': 'Inferior',
    'delantero': 'Delantero',
    'delanteros': 'Delantero',
    'delantera': 'Delantera',
    'delanteras': 'Delanteras',
    'trasero': 'Trasero',
    'traseros': 'Trasero',
    'trasera': 'Trasera',
    'traseras': 'Traseras',
    'izquierdo': 'Izquierdo',
    'izquierda': 'Izquierda',
    'derecho': 'Derecho',
    'derecha': 'Derecha',
  };

  const textLower = text.toLowerCase();
  const found = [];

  for (const [key, value] of Object.entries(types)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(textLower)) {
      found.push(value);
    }
  }

  return found.length > 0 ? found.join(' ') : null;
}

/**
 * Extrae medidas y dimensiones
 */
function extractMeasurements(text) {
  // Patrón 1: "XXmm x YYmm"
  const pattern1 = text.match(/(\d+)\s*mm\s*[xX]\s*(\d+)\s*mm/);
  if (pattern1) {
    return `${pattern1[1]}mm x ${pattern1[2]}mm`;
  }

  // Patrón 2: "XXmm Interior" o "XXmm Interior/Exterior"
  const pattern2 = text.match(/(\d+)\s*mm\s+Interior/i);
  if (pattern2) {
    return `${pattern2[1]}mm Interior`;
  }

  // Patrón 3: Rango de medidas "32 a 50mm"
  const pattern3 = text.match(/(\d+)\s*a\s*(\d+)\s*mm/);
  if (pattern3) {
    return `${pattern3[1]}-${pattern3[2]}mm`;
  }

  return null;
}

/**
 * Extrae número de capas (para manguitos de silicona)
 */
function extractLayers(text) {
  const match = text.match(/triple\s+capa/i);
  if (match) {
    return '3 capas';
  }

  const match2 = text.match(/(\d+)\s+capas?/i);
  if (match2) {
    return `${match2[1]} capas`;
  }

  return null;
}

/**
 * Extrae número de núcleos (para radiadores)
 */
function extractCores(text) {
  const patterns = [
    /doble\s+n[uú]cleo/i,
    /triple\s+n[uú]cleo/i,
    /(\d+)\s+n[uú]cleos?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[0].toLowerCase().includes('doble')) return 'Doble núcleo';
      if (match[0].toLowerCase().includes('triple')) return 'Triple núcleo';
      if (match[1]) return `${match[1]} núcleos`;
    }
  }

  return null;
}

/**
 * Extrae notas especiales y características
 */
function extractNotes(text) {
  const notes = [];

  // Características comunes
  const features = [
    { pattern: /medidas\s+100%\s+[ií]d[eé]nticas?\s+al\s+original/i, note: 'Medidas 100% idénticas al original' },
    { pattern: /medidas\s+originales/i, note: 'Medidas originales' },
    { pattern: /oem/i, note: 'Calidad OEM' },
    { pattern: /potenciado/i, note: 'Versión potenciada' },
    { pattern: /reforzado/i, note: 'Reforzado' },
    { pattern: /adaptable/i, note: 'Adaptable' },
    { pattern: /universal/i, note: 'Universal' },
  ];

  for (const { pattern, note } of features) {
    if (pattern.test(text) && !notes.includes(note)) {
      notes.push(note);
    }
  }

  return notes.length > 0 ? notes.join('. ') + '.' : null;
}

/**
 * Detecta si es pieza OEM/Original
 */
function extractOEM(text) {
  return /\bOEM\b|original/i.test(text);
}

/**
 * Extrae diámetro interior (para tubos)
 */
function extractDiameter(text) {
  const match = text.match(/(\d+)\s*mm\s+Interior/i);
  if (match) {
    return `${match[1]}mm`;
  }
  return null;
}

/**
 * Genera una descripción técnica resumida para mostrar debajo de la imagen
 */
export function generateTechnicalDescription(technical) {
  if (!technical) return null;

  const parts = [];

  if (technical.material) parts.push(technical.material);
  if (technical.layers) parts.push(technical.layers);
  if (technical.cores) parts.push(technical.cores);
  if (technical.type) parts.push(technical.type);
  if (technical.engineSize) parts.push(`Motor ${technical.engineSize}`);
  if (technical.diameter) parts.push(`Ø ${technical.diameter}`);
  if (technical.measurements) parts.push(technical.measurements);
  if (technical.color) parts.push(`Color ${technical.color}`);
  if (technical.isOEM) parts.push('OEM');

  return parts.length > 0 ? parts.join(' · ') : null;
}

// ============================================================================
// TESTS
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Technical Parser\n');
  console.log('='.repeat(70));

  const testProducts = [
    {
      title: 'Manguito Silicona Triple capa Superior para Radiador de SEAT 1200 Sport 1430cc',
      description: 'Medidas 100% idénticas al original.',
    },
    {
      title: 'Radiador Aluminio Doble núcleo FL BI-ÁRBOL',
      subtitle: 'SEAT 124 / 1430',
    },
    {
      title: 'KIT Manguitos Silicona SEAT 127 - ROJOS',
    },
    {
      title: '1m Tubo Flexible Silicona Triple capa - 15mm Interior',
    },
    {
      title: 'Manguito Superior Tipo Fuelle SEAT 600 - AZUL',
    },
    {
      title: 'Radiador SEAT 124/1430 TRIPLE NÚCLEO en ALUMINIO',
    },
    {
      title: 'Termostato SEAT 131, 124, 1430, Sport - Motores BIARBOL 1600cc',
      description: 'Pieza OEM de alta calidad',
    },
  ];

  testProducts.forEach((product, i) => {
    console.log(`\n📦 PRODUCTO ${i + 1}:`);
    console.log(`   Título: ${product.title}`);
    if (product.subtitle) console.log(`   Subtitle: ${product.subtitle}`);
    if (product.description) console.log(`   Descripción: ${product.description}`);

    const technical = extractTechnicalInfo(product);
    console.log('\n   📋 DATOS TÉCNICOS EXTRAÍDOS:');

    if (technical) {
      Object.entries(technical).forEach(([key, value]) => {
        console.log(`      ${key}: ${value}`);
      });

      const desc = generateTechnicalDescription(technical);
      if (desc) {
        console.log(`\n   ✨ DESCRIPCIÓN TÉCNICA: ${desc}`);
      }
    } else {
      console.log('      (no se encontraron datos técnicos)');
    }

    console.log('\n' + '-'.repeat(70));
  });

  console.log('\n✅ Tests completados\n');
}
