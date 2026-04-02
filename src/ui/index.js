/**
 * MisajoCookies - UI Layer
 * 
 * Controladores y puntos de entrada del sistema.
 * Esta capa maneja la interacción con el usuario y coordina los casos de uso.
 */

// Re-exportar controladores
export { CatalogController } from './controllers/CatalogController.js';
export { OrderController } from './controllers/OrderController.js';
export { DeliveryController } from './controllers/DeliveryController.js';

// Re-exportar componentes
export { ProductCardRenderer } from './components/ProductCardRenderer.js';
export { CartRenderer } from './components/CartRenderer.js';
