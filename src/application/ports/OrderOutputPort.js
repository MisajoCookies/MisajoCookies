/**
 * OrderOutputPort - Puerto de Salida para Pedidos
 * 
 * Define el contrato para la salida de datos de pedidos hacia la UI.
 */

export class OrderOutputPort {
    /**
     * Formatea un pedido para mostrar en la UI
     * @param {Order} order - Entidad de dominio Order
     * @returns {Object} Datos formateados para la UI
     */
    formatOrderForUI(order) {
        return {
            items: order.getActiveItems().map(item => ({
                id: item.id,
                type: item.type,
                name: item.name,
                quantity: item.quantity,
                totalPrice: this.formatMoney(item.getTotalPrice())
            })),
            summary: {
                subtotal: this.formatMoney(order.calculateSubtotal()),
                itemCount: order.getActiveItems().length
            },
            promotions: {
                qualifiesForFreeDelivery: order.qualifiesForFreeDelivery(),
                qualifiesForFreePackage: order.qualifiesForFreePackage()
            }
        };
    }

    /**
     * Formatea dinero para mostrar en la UI
     * @param {number} cents - Cantidad en centavos
     * @returns {string} Dinero formateado
     */
    formatMoney(cents) {
        return '$' + Math.round(cents / 100).toLocaleString('es-CO');
    }
}
