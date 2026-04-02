/**
 * DeliveryRepository - Puerto (Interfaz) del Dominio
 * 
 * Define el contrato para acceder a información de domicilios.
 * Esta es una interfaz abstracta - la implementación concreta va en Infrastructure.
 */

export class DeliveryRepository {
    /**
     * Obtiene todos los barrios disponibles
     * @returns {Promise<Array>} Lista de barrios con distancias
     */
    async getAllNeighborhoods() {
        throw new Error('Method getAllNeighborhoods() must be implemented');
    }

    /**
     * Busca un barrio por nombre
     * @param {string} name - Nombre del barrio
     * @returns {Promise<Object|null>} Barrio o null si no existe
     */
    async getNeighborhoodByName(name) {
        throw new Error('Method getNeighborhoodByName() must be implemented');
    }

    /**
     * Calcula la distancia entre dos puntos
     * @param {number} lat1 - Latitud de origen
     * @param {number} lon1 - Longitud de origen
     * @param {number} lat2 - Latitud de destino
     * @param {number} lon2 - Longitud de destino
     * @returns {Promise<number>} Distancia en km
     */
    async calculateDistance(lat1, lon1, lat2, lon2) {
        throw new Error('Method calculateDistance() must be implemented');
    }

    /**
     * Verifica si una dirección está dentro de Cali
     * @param {string} address - Dirección completa
     * @returns {Promise<boolean>} True si está dentro de Cali
     */
    async isInsideCali(address) {
        throw new Error('Method isInsideCali() must be implemented');
    }
}
