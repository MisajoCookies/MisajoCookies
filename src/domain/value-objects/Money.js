/**
 * Money - Objeto de Valor
 * 
 * Representa una cantidad monetaria en pesos colombianos.
 * Utiliza centavos internamente para evitar problemas de punto flotante.
 */

export class Money {
    /**
     * @param {number} cents - Cantidad en centavos
     */
    constructor(cents) {
        this.cents = Math.round(cents);
    }

    /**
     * Crea una instancia de Money desde pesos (ej: 4000 -> $4.000)
     * @param {number} pesos - Cantidad en pesos
     * @returns {Money} Nueva instancia de Money
     */
    static fromPesos(pesos) {
        return new Money(pesos * 100);
    }

    /**
     * Crea una instancia de Money desde un string formateado (ej: "$4.000")
     * @param {string} formatted - Precio formateado
     * @returns {Money} Nueva instancia de Money
     */
    static fromFormatted(formatted) {
        if (!formatted || typeof formatted !== 'string') {
            return new Money(0);
        }
        const numericValue = parseInt(formatted.replace(/[^0-9]/g, ''), 10);
        return new Money(numericValue * 100);
    }

    /**
     * Suma otra cantidad monetaria
     * @param {Money} other - Otra cantidad monetaria
     * @returns {Money} Nueva instancia con la suma
     */
    add(other) {
        if (!(other instanceof Money)) {
            throw new Error('Can only add Money instances');
        }
        return new Money(this.cents + other.cents);
    }

    /**
     * Multiplica por un escalar
     * @param {number} scalar - Factor de multiplicación
     * @returns {Money} Nueva instancia multiplicada
     */
    multiply(scalar) {
        return new Money(this.cents * scalar);
    }

    /**
     * Compara si es mayor o igual que otra cantidad
     * @param {Money} other - Otra cantidad monetaria
     * @returns {boolean} True si esta cantidad es >= other
     */
    isGreaterOrEqual(other) {
        if (!(other instanceof Money)) {
            throw new Error('Can only compare with Money instances');
        }
        return this.cents >= other.cents;
    }

    /**
     * Obtiene el valor en pesos (como número entero)
     * @returns {number} Valor en pesos
     */
    toPesos() {
        return Math.round(this.cents / 100);
    }

    /**
     * Obtiene el valor formateado como string (ej: "$4.000")
     * @returns {string} Valor formateado
     */
    toString() {
        return '$' + this.toPesos().toLocaleString('es-CO');
    }

    /**
     * Verifica si es cero
     * @returns {boolean} True si cents === 0
     */
    isZero() {
        return this.cents === 0;
    }
}
