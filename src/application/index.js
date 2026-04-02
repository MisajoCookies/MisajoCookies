/**
 * MisajoCookies - Application Layer
 * 
 * Casos de uso y definición de Puertos (Interfaces).
 * Esta capa orquesta el flujo de la aplicación.
 */

// Re-exportar casos de uso
export { CatalogUseCase } from './use-cases/CatalogUseCase.js';
export { OrderUseCase } from './use-cases/OrderUseCase.js';
export { DeliveryUseCase } from './use-cases/DeliveryUseCase.js';

// Re-exportar puertos de aplicación
export { OrderOutputPort } from './ports/OrderOutputPort.js';
export { CatalogOutputPort } from './ports/CatalogOutputPort.js';
