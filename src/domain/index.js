/**
 * MisajoCookies - Domain Layer
 * 
 * Entidades de negocio y reglas puras (sin dependencias externas).
 * Esta capa contiene el núcleo del dominio del negocio.
 */

// Re-exportar todas las entidades del dominio
export { Product } from './entities/Product.js';
export { Combo } from './entities/Combo.js';
export { Order } from './entities/Order.js';
export { OrderItem } from './entities/OrderItem.js';

// Re-exportar objetos de valor
export { Money } from './value-objects/Money.js';
export { DeliveryInfo } from './value-objects/DeliveryInfo.js';

// Re-exportar servicios de dominio
export { PricingService } from './services/PricingService.js';
export { PromotionService } from './services/PromotionService.js';

// Re-exportar puertos (interfaces)
export { CatalogRepository } from './ports/CatalogRepository.js';
export { OrderRepository } from './ports/OrderRepository.js';
export { DeliveryRepository } from './ports/DeliveryRepository.js';
