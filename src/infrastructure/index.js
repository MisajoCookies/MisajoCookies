/**
 * MisajoCookies - Infrastructure Layer
 * 
 * Adaptadores (Base de datos, APIs externas, Frameworks) e implementación de Puertos.
 * Esta capa contiene las implementaciones concretas que dependen de tecnologías específicas.
 */

// Re-exportar adaptadores web
export { LegacyCatalogAdapter } from './adapters/web/LegacyCatalogAdapter.js';
export { LegacyDeliveryAdapter } from './adapters/web/LegacyDeliveryAdapter.js';

// Re-exportar configuración
export { AppConfig } from './config/AppConfig.js';
