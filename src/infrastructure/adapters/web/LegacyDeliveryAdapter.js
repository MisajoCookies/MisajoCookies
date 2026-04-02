/**
 * LegacyDeliveryAdapter - Adaptador de Domicilios Legacy
 * 
 * Implementación concreta del DeliveryRepository que se conecta
 * a los datos legacy (BARRIOS_CALI) existentes en el navegador.
 */

import { DeliveryRepository } from '../../../domain/ports/DeliveryRepository.js';

export class LegacyDeliveryAdapter extends DeliveryRepository {
    /**
     * @param {Array} barriosData - Datos de barrios global (BARRIOS_CALI)
     */
    constructor(barriosData) {
        super();
        this.barriosData = barriosData;
    }

    /**
     * Obtiene todos los barrios disponibles
     * @returns {Promise<Array>} Lista de barrios con distancias
     */
    async getAllNeighborhoods() {
        return Promise.resolve(this.barriosData || []);
    }

    /**
     * Busca un barrio por nombre
     * @param {string} name - Nombre del barrio
     * @returns {Promise<Object|null>} Barrio o null si no existe
     */
    async getNeighborhoodByName(name) {
        if (!name || typeof name !== 'string') {
            return Promise.resolve(null);
        }

        const neighborhoods = await this.getAllNeighborhoods();
        const searchTerm = name.toLowerCase().trim();
        
        const result = neighborhoods.find(n => 
            n.name.toLowerCase() === searchTerm
        );
        
        return Promise.resolve(result || null);
    }

    /**
     * Calcula la distancia entre dos puntos (no implementado en legacy)
     * @param {number} lat1 - Latitud de origen
     * @param {number} lon1 - Longitud de origen
     * @param {number} lat2 - Latitud de destino
     * @param {number} lon2 - Longitud de destino
     * @returns {Promise<number>} Distancia en km
     */
    async calculateDistance(lat1, lon1, lat2, lon2) {
        // Implementación futura con API de mapas
        return Promise.reject(new Error('Not implemented in legacy adapter'));
    }

    /**
     * Verifica si una dirección está dentro de Cali (basado en barrio)
     * @param {string} address - Dirección completa
     * @returns {Promise<boolean>} True si está dentro de Cali
     */
    async isInsideCali(address) {
        // Implementación simple basada en palabras clave
        const caliKeywords = ['cali', 'valle del cauca'];
        const lowerAddress = (address || '').toLowerCase();
        
        return Promise.resolve(
            caliKeywords.some(keyword => lowerAddress.includes(keyword))
        );
    }
}
