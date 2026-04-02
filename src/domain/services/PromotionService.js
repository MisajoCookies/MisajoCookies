/**
 * PromotionService - Servicio de Dominio
 * 
 * Contiene la lógica de negocio para promociones y beneficios.
 * Esta es una clase pura sin dependencias externas.
 */

export class PromotionService {
    // Umbrales de promoción (en centavos)
    static FREE_DELIVERY_THRESHOLD = 4000000; // $40.000
    static FREE_PACKAGE_THRESHOLD = 6001000;  // $60.001

    /**
     * Verifica si un pedido califica para domicilio gratis
     * @param {number} subtotalCents - Subtotal en centavos
     * @param {boolean} isInsideCali - True si el domicilio es dentro de Cali
     * @returns {boolean} True si califica para domicilio gratis
     */
    qualifiesForFreeDelivery(subtotalCents, isInsideCali) {
        return isInsideCali && subtotalCents >= PromotionService.FREE_DELIVERY_THRESHOLD;
    }

    /**
     * Verifica si un pedido califica para paquete gratis
     * @param {number} subtotalCents - Subtotal en centavos
     * @returns {boolean} True si califica para paquete gratis
     */
    qualifiesForFreePackage(subtotalCents) {
        return subtotalCents >= PromotionService.FREE_PACKAGE_THRESHOLD;
    }

    /**
     * Obtiene el progreso actual hacia el próximo beneficio
     * @param {number} subtotalCents - Subtotal actual en centavos
     * @returns {{current: number, nextThreshold: number, nextBenefit: string, remaining: number}}
     */
    getProgress(subtotalCents) {
        if (subtotalCents >= PromotionService.FREE_PACKAGE_THRESHOLD) {
            return {
                current: subtotalCents,
                nextThreshold: PromotionService.FREE_PACKAGE_THRESHOLD,
                nextBenefit: 'package_and_delivery',
                remaining: 0,
                achieved: ['delivery', 'package']
            };
        }

        if (subtotalCents >= PromotionService.FREE_DELIVERY_THRESHOLD) {
            return {
                current: subtotalCents,
                nextThreshold: PromotionService.FREE_PACKAGE_THRESHOLD,
                nextBenefit: 'package',
                remaining: PromotionService.FREE_PACKAGE_THRESHOLD - subtotalCents,
                achieved: ['delivery']
            };
        }

        return {
            current: subtotalCents,
            nextThreshold: PromotionService.FREE_DELIVERY_THRESHOLD,
            nextBenefit: 'delivery',
            remaining: PromotionService.FREE_DELIVERY_THRESHOLD - subtotalCents,
            achieved: []
        };
    }

    /**
     * Genera un mensaje de progreso para mostrar al usuario
     * @param {number} subtotalCents - Subtotal actual en centavos
     * @returns {string} Mensaje de progreso
     */
    getProgressMessage(subtotalCents) {
        const progress = this.getProgress(subtotalCents);

        if (progress.achieved.includes('package')) {
            return '¡Tienes paquete gratis y domicilio gratis en Cali! 🎉';
        }

        if (progress.achieved.includes('delivery')) {
            const remainingPesos = Math.round(progress.remaining / 100);
            return `Te faltan $${remainingPesos.toLocaleString('es-CO')} para paquete gratis`;
        }

        const remainingPesos = Math.round(progress.remaining / 100);
        return `Te faltan $${remainingPesos.toLocaleString('es-CO')} para domicilio gratis`;
    }

    /**
     * Calcula el porcentaje de progreso hacia el próximo beneficio
     * @param {number} subtotalCents - Subtotal actual en centavos
     * @returns {number} Porcentaje (0-100)
     */
    getProgressPercentage(subtotalCents) {
        const progress = this.getProgress(subtotalCents);
        
        if (progress.remaining === 0) {
            return 100;
        }

        // Calcular porcentaje basado en el threshold actual
        let baseThreshold;
        if (progress.nextBenefit === 'package') {
            baseThreshold = PromotionService.FREE_DELIVERY_THRESHOLD;
        } else {
            baseThreshold = 0;
        }

        const range = progress.nextThreshold - baseThreshold;
        const current = subtotalCents - baseThreshold;
        
        return Math.min(100, Math.round((current / range) * 100));
    }
}
