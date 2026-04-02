/**
 * OrderItem - Entidad de Dominio
 * 
 * Representa un ítem dentro de un pedido.
 * Esta es una entidad pura sin dependencias externas.
 */

export class OrderItem {
    /**
     * @param {Object} data - Datos del ítem
     * @param {string} data.id - Identificador único del producto/combo
     * @param {string} data.type - Tipo de ítem: 'package', 'premium', 'combo', 'extra'
     * @param {string} data.name - Nombre del producto/combo
     * @param {number} data.quantity - Cantidad
     * @param {number} data.unitPriceCents - Precio unitario en centavos
     * @param {Object|null} data.options - Opciones adicionales (ej: dipFlavor)
     */
    constructor(data) {
        if (!data.id || !data.type || !data.name) {
            throw new Error('OrderItem must have id, type, and name');
        }

        this.id = data.id;
        this.type = data.type; // 'package', 'premium', 'combo', 'extra'
        this.name = data.name;
        this.quantity = Math.max(0, data.quantity || 0);
        this.unitPriceCents = data.unitPriceCents || 0;
        this.options = data.options || null;
    }

    /**
     * Obtiene el precio total del ítem (cantidad × precio unitario + opciones)
     * @returns {number} Precio total en centavos
     */
    getTotalPrice() {
        let total = this.quantity * this.unitPriceCents;
        
        // Agregar recargos por opciones (ej: dip de chocolate blanco)
        if (this.options && this.options.dipFlavor) {
            const surcharge = this.getDipSurcharge();
            total += this.quantity * surcharge;
        }
        
        return total;
    }

    /**
     * Obtiene el recargo por sabor de dip en centavos
     * @returns {number} Recargo en centavos
     */
    getDipSurcharge() {
        const DIP_PRICES = {
            'arequipe': 0,
            'chocolate-negro': 0,
            'chocolate-blanco': 180000 // $1.800 en centavos
        };
        return DIP_PRICES[this.options?.dipFlavor] || 0;
    }

    /**
     * Verifica si el ítem tiene cantidad mayor a cero
     * @returns {boolean} True si quantity > 0
     */
    hasQuantity() {
        return this.quantity > 0;
    }

    /**
     * Incrementa la cantidad en uno
     */
    increment() {
        this.quantity++;
    }

    /**
     * Decrementa la cantidad en uno (mínimo cero)
     */
    decrement() {
        this.quantity = Math.max(0, this.quantity - 1);
    }

    /**
     * Establece una nueva cantidad
     * @param {number} qty - Nueva cantidad
     */
    setQuantity(qty) {
        this.quantity = Math.max(0, qty);
    }

    /**
     * Convierte la entidad a objeto plano para serialización
     * @returns {Object} Objeto plano con los datos del ítem
     */
    toPlainObject() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            quantity: this.quantity,
            unitPriceCents: this.unitPriceCents,
            options: this.options
        };
    }
}
