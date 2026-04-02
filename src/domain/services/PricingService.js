/**
 * PricingService - Servicio de Dominio
 * 
 * Contiene la lógica de negocio para cálculos de precios.
 * Esta es una clase pura sin dependencias externas.
 */

import { Money } from '../value-objects/Money.js';

export class PricingService {
    // Constantes de precios (en centavos)
    static PRICE_CAJA = 200000;           // $2.000
    static PRICE_DIP_STD = 200000;        // $2.000
    static PRICE_DIP_CHOCO = 300000;      // $3.000
    static PRICE_CAFE_HATSU = 500000;     // $5.000
    static PRICE_VELA = 300000;           // $3.000
    static DIP_UPGRADE_SURCHARGE = 180000; // $1.800

    /**
     * Obtiene el recargo por sabor de dip
     * @param {string} dipFlavor - Sabor del dip
     * @returns {Money} Recargo en dinero
     */
    static getDipSurcharge(dipFlavor) {
        switch (dipFlavor) {
            case 'chocolate-blanco':
                return new Money(PricingService.DIP_UPGRADE_SURCHARGE);
            case 'arequipe':
            case 'chocolate-negro':
            default:
                return new Money(0);
        }
    }

    /**
     * Calcula el precio total de un producto premium con dip
     * @param {number} basePriceCents - Precio base en centavos
     * @param {string} dipFlavor - Sabor del dip
     * @param {number} quantity - Cantidad
     * @returns {Money} Precio total
     */
    static calculatePremiumTotal(basePriceCents, dipFlavor, quantity) {
        const basePrice = new Money(basePriceCents);
        const surcharge = this.getDipSurcharge(dipFlavor);
        const unitTotal = basePrice.add(surcharge);
        return unitTotal.multiply(quantity);
    }

    /**
     * Verifica si un pedido califica para domicilio gratis
     * @param {number} subtotalCents - Subtotal en centavos
     * @param {boolean} isInsideCali - True si el domicilio es dentro de Cali
     * @returns {boolean} True si califica para domicilio gratis
     */
    static qualifiesForFreeDelivery(subtotalCents, isInsideCali) {
        const FREE_DELIVERY_THRESHOLD = 4000000; // $40.000
        return isInsideCali && subtotalCents >= FREE_DELIVERY_THRESHOLD;
    }

    /**
     * Verifica si un pedido califica para paquete gratis
     * @param {number} subtotalCents - Subtotal en centavos
     * @returns {boolean} True si califica para paquete gratis
     */
    static qualifiesForFreePackage(subtotalCents) {
        const FREE_PACKAGE_THRESHOLD = 6001000; // $60.001
        return subtotalCents >= FREE_PACKAGE_THRESHOLD;
    }

    /**
     * Calcula el costo de domicilio basado en distancia
     * @param {number} distanceKm - Distancia en km
     * @param {boolean} isOutsideCali - True si está fuera de Cali
     * @param {number} subtotalCents - Subtotal en centavos
     * @returns {{cost: Money|null, label: string, free: boolean}} Costo y etiqueta
     */
    static calculateDeliveryCost(distanceKm, isOutsideCali, subtotalCents) {
        // Junín (distanceKm === 0)
        if (distanceKm === 0) {
            return {
                cost: new Money(0),
                label: 'Gratis (Junín)',
                free: true
            };
        }

        // Fuera de Cali o "A coordinar"
        if (distanceKm < 0 || isOutsideCali) {
            return {
                cost: null,
                label: 'A coordinar',
                free: false
            };
        }

        // Domicilio gratis por threshold
        if (this.qualifiesForFreeDelivery(subtotalCents, !isOutsideCali)) {
            return {
                cost: new Money(0),
                label: 'Gratis (compra ≥ $40.000 🎉)',
                free: true
            };
        }

        // Cálculo normal: $1.000 por km
        const cost = new Money(distanceKm * 100000);
        return {
            cost,
            label: cost.toString(),
            free: false
        };
    }

    /**
     * Formatea una cantidad en centavos a string legible
     * @param {number} cents - Cantidad en centavos
     * @returns {string} Cantidad formateada (ej: "$4.000")
     */
    static formatMoney(cents) {
        return new Money(cents).toString();
    }
}
