/**
 * MisajoCookies — Lista de barrios con distancia desde Junín, Cali.
 * Fuente única de verdad para cálculo de domicilio.
 *
 * costo_domicilio = distanceKm × $1.000 (si aplica)
 * distanceKm ===  0 → Junín, domicilio siempre gratis
 * distanceKm === -1 → Barrio en Cali sin precio fijo → "A coordinar", beneficio $40k SÍ aplica
 * distanceKm === -2 → Fuera de Cali → "A coordinar", beneficio $40k NO aplica, $60k SÍ aplica
 */
const BARRIOS_CALI = [
  { name: 'Junín',                   distanceKm: 0  },
  { name: 'El Centro',               distanceKm: 1  },
  { name: 'San Antonio',             distanceKm: 2  },
  { name: 'Granada',                 distanceKm: 2  },
  { name: 'Centenario',              distanceKm: 2  },
  { name: 'El Peñón',                distanceKm: 3  },
  { name: 'Versalles',               distanceKm: 3  },
  { name: 'Alameda',                 distanceKm: 4  },
  { name: 'Tequendama',              distanceKm: 4  },
  { name: 'Chapinero',               distanceKm: 4  },
  { name: 'Santa Mónica',            distanceKm: 5  },
  { name: 'La Flora',                distanceKm: 5  },
  { name: 'Alfonso López',           distanceKm: 5  },
  { name: 'Unicentro (zona)',         distanceKm: 5  },
  { name: 'Ciudad Jardín',           distanceKm: 6  },
  { name: 'Siloé',                   distanceKm: 6  },
  { name: 'Meléndez',                distanceKm: 7  },
  { name: 'Floralia',                distanceKm: 7  },
  { name: 'El Ingenio',              distanceKm: 8  },
  { name: 'Aguablanca',              distanceKm: 9  },
  { name: 'Valle del Lili',          distanceKm: 9  },
  { name: 'Pance',                   distanceKm: 10 },
  { name: 'Mi barrio no está aquí',  distanceKm: -1 },
  { name: 'Fuera de Cali',           distanceKm: -2 },
];
