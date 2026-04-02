/**
 * OrderUseCase - Caso de Uso de Pedidos
 * 
 * Orquesta las operaciones relacionadas con la gestión de pedidos.
 * Esta capa no depende de implementaciones concretas, solo de interfaces.
 */

import { Order } from '../../domain/entities/Order.js';
import { OrderItem } from '../../domain/entities/OrderItem.js';
import { DeliveryInfo } from '../../domain/value-objects/DeliveryInfo.js';
import { PricingService } from '../../domain/services/PricingService.js';
import { PromotionService } from '../../domain/services/PromotionService.js';

export class OrderUseCase {
    /**
     * @param {CatalogRepository} catalogRepository - Repositorio de catálogo
     * @param {DeliveryRepository} deliveryRepository - Repositorio de domicilios
     */
    constructor(catalogRepository, deliveryRepository) {
        this.catalogRepository = catalogRepository;
        this.deliveryRepository = deliveryRepository;
        this.pricingService = new PricingService();
        this.promotionService = new PromotionService();
    }

    /**
     * Crea un nuevo pedido vacío
     * @returns {Order} Nuevo pedido vacío
     */
    createEmptyOrder() {
        return new Order();
    }

    /**
     * Agrega un producto al pedido
     * @param {Order} order - Pedido actual
     * @param {string} productId - ID del producto
     * @param {number} quantity - Cantidad a agregar
     * @param {Object} options - Opciones adicionales (ej: dipFlavor)
     * @returns {Promise<Order>} Pedido actualizado
     */
    async addProductToOrder(order, productId, quantity, options = {}) {
        const product = await this.catalogRepository.getProductById(productId);
        
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        const item = new OrderItem({
            id: product.id,
            type: options.type || 'package',
            name: product.name,
            quantity,
            unitPriceCents: product.priceCents,
            options: options.dipFlavor ? { dipFlavor: options.dipFlavor } : null
        });

        order.addItem(item);
        return order;
    }

    /**
     * Agrega un combo al pedido
     * @param {Order} order - Pedido actual
     * @param {string} comboId - ID del combo
     * @param {number} quantity - Cantidad a agregar
     * @returns {Promise<Order>} Pedido actualizado
     */
    async addComboToOrder(order, comboId, quantity) {
        const combo = await this.catalogRepository.getComboById(comboId);
        
        if (!combo) {
            throw new Error(`Combo ${comboId} not found`);
        }

        const item = new OrderItem({
            id: combo.id,
            type: 'combo',
            name: combo.name,
            quantity,
            unitPriceCents: combo.priceCents
        });

        order.addItem(item);
        return order;
    }

    /**
     * Establece la información de domicilio del pedido
     * @param {Order} order - Pedido actual
     * @param {string} neighborhoodName - Nombre del barrio
     * @param {string} address - Dirección completa
     * @returns {Promise<Order>} Pedido actualizado
     */
    async setOrderDelivery(order, neighborhoodName, address) {
        const neighborhood = await this.deliveryRepository.getNeighborhoodByName(neighborhoodName);
        
        if (!neighborhood) {
            throw new Error(`Neighborhood ${neighborhoodName} not found`);
        }

        const deliveryInfo = DeliveryInfo.fromBarrioData(neighborhood, address);
        order.setDeliveryInfo(deliveryInfo);
        
        return order;
    }

    /**
     * Calcula el resumen del pedido (subtotal, domicilio, total)
     * @param {Order} order - Pedido actual
     * @returns {{subtotal: string, delivery: string, total: string, qualifiesForFreeDelivery: boolean, qualifiesForFreePackage: boolean}} Resumen formateado
     */
    calculateOrderSummary(order) {
        const totals = order.calculateTotal();
        const subtotal = totals.subtotal;
        
        const deliveryResult = order.calculateDeliveryCost(subtotal);
        
        return {
            subtotal: PricingService.formatMoney(subtotal),
            delivery: deliveryResult.cost ? PricingService.formatMoney(deliveryResult.cost.cents) : deliveryResult.label,
            total: totals.total !== null ? PricingService.formatMoney(totals.total) : 'A coordinar',
            qualifiesForFreeDelivery: order.qualifiesForFreeDelivery(),
            qualifiesForFreePackage: order.qualifiesForFreePackage()
        };
    }

    /**
     * Obtiene el progreso de promociones del pedido
     * @param {Order} order - Pedido actual
     * @returns {{message: string, percentage: number, achieved: Array<string>}} Progreso de promociones
     */
    getOrderPromotions(order) {
        const subtotal = order.calculateSubtotal();
        
        return {
            message: this.promotionService.getProgressMessage(subtotal),
            percentage: this.promotionService.getProgressPercentage(subtotal),
            achieved: this.promotionService.getProgress(subtotal).achieved
        };
    }

    /**
     * Genera el mensaje de WhatsApp para el pedido
     * @param {Order} order - Pedido actual
     * @returns {string} Mensaje codificado para WhatsApp
     */
    generateWhatsAppMessage(order) {
        return order.generateWhatsAppMessage();
    }

    /**
     * Valida si el pedido está completo y listo para enviar
     * @param {Order} order - Pedido actual
     * @returns {{valid: boolean, errors: Array<string>}} Resultado de validación
     */
    validateOrder(order) {
        const errors = [];

        // Verificar que haya al menos un ítem
        if (order.getActiveItems().length === 0) {
            errors.push('El pedido debe tener al menos un producto');
        }

        // Verificar que tenga información de domicilio si es requerido
        if (order.deliveryInfo.requiresCoordination() && !order.deliveryInfo.address) {
            errors.push('Debe proporcionar una dirección para coordinar el domicilio');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
