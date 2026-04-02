/**
 * Combo - Entidad de Dominio
 * 
 * Representa un combo promocional de MisajoCookies.
 * Esta es una entidad pura sin dependencias externas.
 */

export class Combo {
    /**
     * @param {Object} data - Datos del combo
     * @param {string} data.id - Identificador único
     * @param {string} data.name - Nombre del combo
     * @param {string} data.description - Descripción detallada
     * @param {number} data.priceCents - Precio en centavos
     * @param {Array<{src: string, alt: string, width: number, height: number}>} data.images - Imágenes del combo
     * @param {string} data.whatsappMessage - Mensaje pre-codificado para WhatsApp
     */
    constructor(data) {
        if (!data.id || !data.name) {
            throw new Error('Combo must have id and name');
        }

        this.id = data.id;
        this.name = data.name;
        this.description = data.description || '';
        this.priceCents = data.priceCents || 0;
        this.images = data.images || [];
        this.whatsappMessage = data.whatsappMessage || '';
    }

    /**
     * Obtiene el precio formateado en pesos colombianos
     * @returns {string} Precio formateado (ej: "$17.000")
     */
    get formattedPrice() {
        return '$' + Math.round(this.priceCents / 100).toLocaleString('es-CO');
    }

    /**
     * Obtiene el precio unitario en centavos
     * @returns {number} Precio en centavos
     */
    getUnitPrice() {
        return this.priceCents;
    }

    /**
     * Verifica si el combo tiene múltiples imágenes
     * @returns {boolean} True si tiene más de una imagen
     */
    hasMultipleImages() {
        return this.images.length > 1;
    }

    /**
     * Obtiene la URL completa de WhatsApp para este combo
     * @param {string} phone_number - Número de teléfono base
     * @returns {string} URL completa de WhatsApp
     */
    getWhatsAppUrl(phone_number = '573159038449') {
        const baseUrl = `https://wa.me/${phone_number}?text=`;
        return baseUrl + this.whatsappMessage;
    }

    /**
     * Crea una instancia de Combo desde datos legacy (formato antiguo)
     * @param {Object} legacyData - Datos en formato legacy
     * @returns {Combo} Nueva instancia de Combo
     */
    static fromLegacy(legacyData) {
        // Convertir precio string a centavos (ej: "$17.000" -> 1700000)
        let priceCents = 0;
        if (legacyData.price && typeof legacyData.price === 'string') {
            const numericValue = parseInt(legacyData.price.replace(/[^0-9]/g, ''), 10);
            priceCents = numericValue * 100; // Convertir a centavos
        }

        return new Combo({
            id: legacyData.id,
            name: legacyData.name,
            description: legacyData.description,
            priceCents: priceCents,
            images: legacyData.images || [],
            whatsappMessage: legacyData.whatsapp
        });
    }

    /**
     * Convierte la entidad a objeto plano para serialización
     * @returns {Object} Objeto plano con los datos del combo
     */
    toPlainObject() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            priceCents: this.priceCents,
            images: this.images,
            whatsappMessage: this.whatsappMessage
        };
    }
}
