/**
 * DeliveryInfo - Objeto de Valor
 * 
 * Representa la información de domicilio de un pedido.
 */

export class DeliveryInfo {
    /**
     * @param {Object} data - Datos de domicilio
     * @param {string} data.neighborhood - Nombre del barrio
     * @param {string} data.address - Dirección completa
     * @param {number} data.distanceKm - Distancia en km desde Junín
     * @param {boolean} data.isOutsideCali - True si está fuera de Cali
     * @param {boolean} data.isToCoordinate - True si es "A coordinar"
     */
    constructor(data = {}) {
        this.neighborhood = data.neighborhood || '';
        this.address = data.address || '';
        this.distanceKm = typeof data.distanceKm === 'number' ? data.distanceKm : 0;
        this.isOutsideCali = data.isOutsideCali || false;
        this.isToCoordinate = data.isToCoordinate || false;
    }

    /**
     * Verifica si el domicilio es gratis (Junín)
     * @returns {boolean} True si distanceKm === 0
     */
    isFreeDelivery() {
        return this.distanceKm === 0;
    }

    /**
     * Verifica si el domicilio requiere coordinación
     * @returns {boolean} True si es fuera de Cali o "Mi barrio no está aquí"
     */
    requiresCoordination() {
        return this.isToCoordinate || this.isOutsideCali;
    }

    /**
     * Calcula el costo base del domicilio (sin descuentos)
     * @returns {number} Costo en centavos ($1.000 por km)
     */
    calculateBaseCost() {
        if (this.isFreeDelivery()) {
            return 0;
        }
        if (this.requiresCoordination()) {
            return -1; // Indica que debe coordinarse
        }
        return this.distanceKm * 100000; // $1.000 por km en centavos
    }

    /**
     * Crea una instancia desde datos de barrio legacy
     * @param {Object} barrioData - Datos del barrio (name, distanceKm)
     * @param {string} address - Dirección completa
     * @returns {DeliveryInfo} Nueva instancia de DeliveryInfo
     */
    static fromBarrioData(barrioData, address = '') {
        const distanceKm = barrioData.distanceKm || 0;
        
        return new DeliveryInfo({
            neighborhood: barrioData.name || '',
            address: address,
            distanceKm: distanceKm,
            isOutsideCali: distanceKm === -2,
            isToCoordinate: distanceKm === -1 || distanceKm === -2
        });
    }

    /**
     * Convierte a objeto plano para serialización
     * @returns {Object} Objeto plano con los datos
     */
    toPlainObject() {
        return {
            neighborhood: this.neighborhood,
            address: this.address,
            distanceKm: this.distanceKm,
            isOutsideCali: this.isOutsideCali,
            isToCoordinate: this.isToCoordinate
        };
    }
}
