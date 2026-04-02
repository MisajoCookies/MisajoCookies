/**
 * Order - Entidad de Dominio
 * 
 * Representa un pedido completo de MisajoCookies.
 * Esta es una entidad pura sin dependencias externas.
 */

import { OrderItem } from './OrderItem.js';
import { DeliveryInfo } from '../value-objects/DeliveryInfo.js';

export class Order {
    /**
     * @param {Object} data - Datos del pedido
     * @param {Array<OrderItem>} data.items - Ítems del pedido
     * @param {DeliveryInfo} data.deliveryInfo - Información de domicilio
     * @param {string} data.notes - Notas adicionales del cliente
     * @param {string|null} data.freePackageId - ID del paquete gratis (si aplica)
     */
    constructor(data = {}) {
        this.items = data.items || [];
        this.deliveryInfo = data.deliveryInfo || new DeliveryInfo();
        this.notes = data.notes || '';
        this.freePackageId = data.freePackageId || null;
        this.extras = data.extras || {
            cafeJuanValdez: 0,
            teHatsu: 0,
            vela: 0,
            dipArequipe: 0,
            dipChocoNegro: 0,
            dipChocoBlanco: 0,
            caja: false
        };
    }

    /**
     * Agrega o actualiza un ítem en el pedido
     * @param {OrderItem} item - Ítem a agregar
     */
    addItem(item) {
        if (!(item instanceof OrderItem)) {
            throw new Error('Item must be an instance of OrderItem');
        }

        const existingIndex = this.items.findIndex(
            i => i.id === item.id && i.type === item.type
        );

        if (existingIndex >= 0) {
            // Actualizar cantidad si ya existe
            this.items[existingIndex].setQuantity(item.quantity);
        } else {
            // Agregar nuevo ítem
            this.items.push(item);
        }
    }

    /**
     * Remueve un ítem del pedido (pone cantidad en 0)
     * @param {string} itemId - ID del ítem a remover
     * @param {string} itemType - Tipo del ítem a remover
     */
    removeItem(itemId, itemType) {
        const item = this.items.find(i => i.id === itemId && i.type === itemType);
        if (item) {
            item.setQuantity(0);
        }
    }

    /**
     * Obtiene todos los ítems con cantidad mayor a cero
     * @returns {Array<OrderItem>} Ítems activos
     */
    getActiveItems() {
        return this.items.filter(item => item.hasQuantity());
    }

    /**
     * Calcula el subtotal del pedido (sin domicilio)
     * @returns {number} Subtotal en centavos
     */
    calculateSubtotal() {
        let subtotal = 0;

        // Sumar ítems principales
        this.getActiveItems().forEach(item => {
            subtotal += item.getTotalPrice();
        });

        // Sumar extras
        subtotal += this.extras.cafeJuanValdez * 500000; // $5.000
        subtotal += this.extras.teHatsu * 500000; // $5.000
        subtotal += this.extras.vela * 300000; // $3.000
        subtotal += this.extras.dipArequipe * 200000; // $2.000
        subtotal += this.extras.dipChocoNegro * 200000; // $2.000
        subtotal += this.extras.dipChocoBlanco * 300000; // $3.000
        
        if (this.extras.caja) {
            subtotal += 200000; // $2.000
        }

        return subtotal;
    }

    /**
     * Verifica si el pedido califica para domicilio gratis
     * @param {number} thresholdCents - Umbral en centavos (default: $40.000)
     * @returns {boolean} True si califica para domicilio gratis
     */
    qualifiesForFreeDelivery(thresholdCents = 4000000) {
        return this.calculateSubtotal() >= thresholdCents;
    }

    /**
     * Verifica si el pedido califica para paquete gratis
     * @param {number} thresholdCents - Umbral en centavos (default: $60.001)
     * @returns {boolean} True si califica para paquete gratis
     */
    qualifiesForFreePackage(thresholdCents = 6001000) {
        return this.calculateSubtotal() >= thresholdCents;
    }

    /**
     * Establece la información de domicilio
     * @param {DeliveryInfo} deliveryInfo - Información de domicilio
     */
    setDeliveryInfo(deliveryInfo) {
        this.deliveryInfo = deliveryInfo;
    }

    /**
     * Calcula el costo de domicilio
     * @param {number} subtotalCents - Subtotal en centavos
     * @returns {{cost: number|null, label: string, free: boolean}} Costo y etiqueta
     */
    calculateDeliveryCost(subtotalCents) {
        const { distanceKm, isOutsideCali, isToCoordinate } = this.deliveryInfo;

        if (isToCoordinate) {
            return { cost: null, label: 'A coordinar', free: false };
        }

        if (distanceKm === 0) {
            return { cost: 0, label: 'Gratis (Junín)', free: true };
        }

        if (!isOutsideCali && subtotalCents >= 4000000) {
            return { cost: 0, label: 'Gratis (compra ≥ $40.000 🎉)', free: true };
        }

        if (distanceKm > 0) {
            const cost = distanceKm * 100000; // $1.000 por km en centavos
            return { cost, label: '$' + Math.round(cost / 100).toLocaleString('es-CO'), free: false };
        }

        return { cost: null, label: 'A coordinar', free: false };
    }

    /**
     * Calcula el total del pedido (subtotal + domicilio)
     * @returns {{subtotal: number, delivery: number|null, total: number|null}} Totales en centavos
     */
    calculateTotal() {
        const subtotal = this.calculateSubtotal();
        const deliveryResult = this.calculateDeliveryCost(subtotal);
        
        return {
            subtotal,
            delivery: deliveryResult.cost,
            total: deliveryResult.cost !== null ? subtotal + deliveryResult.cost : null
        };
    }

    /**
     * Convierte la entidad a objeto plano para serialización
     * @returns {Object} Objeto plano con los datos del pedido
     */
    toPlainObject() {
        return {
            items: this.items.map(item => item.toPlainObject()),
            deliveryInfo: this.deliveryInfo.toPlainObject(),
            notes: this.notes,
            freePackageId: this.freePackageId,
            extras: { ...this.extras }
        };
    }

    /**
     * Genera el mensaje de WhatsApp para el pedido
     * @returns {string} Mensaje formateado para WhatsApp
     */
    generateWhatsAppMessage() {
        const totals = this.calculateTotal();
        let message = '🍪 *Pedido MisajoCookies*\n\n';

        // Ítems del pedido
        this.getActiveItems().forEach(item => {
            message += `• ${item.name} x${item.quantity}`;
            if (item.options?.dipFlavor) {
                message += ` (${item.options.dipFlavor})`;
            }
            message += '\n';
        });

        // Extras
        if (this.extras.caja) message += '• Caja de presentación\n';
        if (this.extras.cafeJuanValdez > 0) message += `• Café Juan Valdez x${this.extras.cafeJuanValdez}\n`;
        if (this.extras.teHatsu > 0) message += `• Té Hatsu x${this.extras.teHatsu}\n`;
        if (this.extras.vela > 0) message += `• Vela aromática x${this.extras.vela}\n`;

        // Paquete gratis
        if (this.freePackageId) {
            message += `• 🎁 Paquete GRATIS\n`;
        }

        // Totales
        message += `\n*Subtotal:* $${Math.round(totals.subtotal / 100).toLocaleString('es-CO')}`;
        
        if (totals.delivery !== null) {
            message += `\n*Domicilio:* $${Math.round(totals.delivery / 100).toLocaleString('es-CO')}`;
            message += `\n*TOTAL:* $${Math.round(totals.total / 100).toLocaleString('es-CO')}`;
        } else {
            message += `\n*Domicilio:* A coordinar`;
        }

        if (this.notes) {
            message += `\n\n*Notas:* ${this.notes}`;
        }

        return encodeURIComponent(message);
    }
}
