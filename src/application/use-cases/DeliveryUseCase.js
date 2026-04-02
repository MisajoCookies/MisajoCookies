/**
 * DeliveryUseCase - Caso de Uso de Domicilios
 * 
 * Orquesta las operaciones relacionadas con domicilios.
 * Esta capa no depende de implementaciones concretas, solo de interfaces.
 */

import { PricingService } from '../../domain/services/PricingService.js';

export class DeliveryUseCase {
    /**
     * @param {DeliveryRepository} deliveryRepository - Repositorio de domicilios
     */
    constructor(deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    /**
     * Obtiene todos los barrios disponibles ordenados por distancia
     * @returns {Promise<Array>} Lista de barrios ordenados
     */
    async getAllNeighborhoods() {
        const neighborhoods = await this.deliveryRepository.getAllNeighborhoods();
        
        // Ordenar: Junín primero, luego por distancia, finalmente "A coordinar" y "Fuera de Cali"
        return neighborhoods.sort((a, b) => {
            // Junín (0) siempre primero
            if (a.distanceKm === 0) return -1;
            if (b.distanceKm === 0) return 1;
            
            // Negativos (coordination) al final
            if (a.distanceKm < 0 && b.distanceKm >= 0) return 1;
            if (b.distanceKm < 0 && a.distanceKm >= 0) return -1;
            
            // Ordenar por distancia ascendente
            return Math.abs(a.distanceKm) - Math.abs(b.distanceKm);
        });
    }

    /**
     * Busca un barrio por nombre (búsqueda insensible a mayúsculas)
     * @param {string} name - Nombre del barrio a buscar
     * @returns {Promise<Object|null>} Barrio encontrado o null
     */
    async searchNeighborhood(name) {
        if (!name || typeof name !== 'string') {
            return null;
        }

        const neighborhoods = await this.getAllNeighborhoods();
        const searchTerm = name.toLowerCase().trim();
        
        return neighborhoods.find(n => 
            n.name.toLowerCase().includes(searchTerm)
        ) || null;
    }

    /**
     * Calcula el costo de domicilio para una ubicación específica
     * @param {string} neighborhoodName - Nombre del barrio
     * @param {number} subtotalCents - Subtotal del pedido en centavos
     * @returns {Promise<{cost: number|null, label: string, free: boolean}>} Costo y etiqueta
     */
    async calculateDeliveryCost(neighborhoodName, subtotalCents) {
        const neighborhood = await this.searchNeighborhood(neighborhoodName);
        
        if (!neighborhood) {
            return {
                cost: null,
                label: 'Barrio no encontrado',
                free: false
            };
        }

        const isOutsideCali = neighborhood.distanceKm === -2;
        return PricingService.calculateDeliveryCost(
            neighborhood.distanceKm,
            isOutsideCali,
            subtotalCents
        );
    }

    /**
     * Verifica si una dirección está dentro del área de cobertura
     * @param {string} neighborhoodName - Nombre del barrio
     * @returns {Promise<boolean>} True si está en área de cobertura
     */
    async isWithinCoverageArea(neighborhoodName) {
        const neighborhood = await this.searchNeighborhood(neighborhoodName);
        return neighborhood !== null && neighborhood.distanceKm >= 0;
    }

    /**
     * Obtiene el mensaje informativo para el cálculo de domicilio
     * @param {string} neighborhoodName - Nombre del barrio
     * @param {number} subtotalCents - Subtotal del pedido en centavos
     * @returns {Promise<string>} Mensaje informativo
     */
    async getDeliveryMessage(neighborhoodName, subtotalCents) {
        const result = await this.calculateDeliveryCost(neighborhoodName, subtotalCents);
        
        if (result.free) {
            return `✅ ${result.label}`;
        }
        
        if (result.cost === null) {
            return `⚠️ ${result.label}`;
        }
        
        return `📍 ${result.label}`;
    }
}
