/**
 * Product - Entidad de Dominio
 * 
 * Representa un producto del catálogo de MisajoCookies.
 * Esta es una entidad pura sin dependencias externas.
 */

export class Product {
    /**
     * @param {Object} data - Datos del producto
     * @param {string} data.id - Identificador único
     * @param {string} data.name - Nombre del producto
     * @param {string} data.description - Descripción detallada
     * @param {number} data.priceCents - Precio en centavos (para evitar problemas de punto flotante)
     * @param {string|null} data.presentation - Presentación del producto (ej: "Paquete x 50gr")
     * @param {Array<{src: string, alt: string, width: number, height: number}>} data.images - Imágenes del producto
     * @param {string} data.whatsappMessage - Mensaje pre-codificado para WhatsApp
     * @param {string} data.url - Ruta de la página de detalle
     */
    constructor(data) {
        if (!data.id || !data.name) {
            throw new Error('Product must have id and name');
        }

        this.id = data.id;
        this.name = data.name;
        this.description = data.description || '';
        this.priceCents = data.priceCents || 0;
        this.presentation = data.presentation || null;
        this.images = data.images || [];
        this.whatsappMessage = data.whatsappMessage || '';
        this.url = data.url || '';
    }

    /**
     * Obtiene el precio formateado en pesos colombianos
     * @returns {string} Precio formateado (ej: "$4.000")
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
     * Verifica si el producto tiene múltiples imágenes
     * @returns {boolean} True si tiene más de una imagen
     */
    hasMultipleImages() {
        return this.images.length > 1;
    }

    /**
     * Obtiene la URL completa de WhatsApp para este producto
     * @param {string} phone_number - Número de teléfono base
     * @returns {string} URL completa de WhatsApp
     */
    getWhatsAppUrl(phone_number = '573159038449') {
        const baseUrl = `https://wa.me/${phone_number}?text=`;
        return baseUrl + this.whatsappMessage;
    }

    /**
     * Crea una instancia de Product desde datos legacy (formato antiguo)
     * @param {Object} legacyData - Datos en formato legacy
     * @returns {Product} Nueva instancia de Product
     */
    static fromLegacy(legacyData) {
        // Convertir precio string a centavos (ej: "$4.000" -> 400000)
        let priceCents = 0;
        if (legacyData.price && typeof legacyData.price === 'string') {
            const numericValue = parseInt(legacyData.price.replace(/[^0-9]/g, ''), 10);
            priceCents = numericValue * 100; // Convertir a centavos
        }

        return new Product({
            id: legacyData.id,
            name: legacyData.name,
            description: legacyData.description,
            priceCents: priceCents,
            presentation: legacyData.presentation,
            images: legacyData.images || [],
            whatsappMessage: legacyData.whatsapp,
            url: legacyData.url
        });
    }

    /**
     * Convierte la entidad a objeto plano para serialización
     * @returns {Object} Objeto plano con los datos del producto
     */
    toPlainObject() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            priceCents: this.priceCents,
            presentation: this.presentation,
            images: this.images,
            whatsappMessage: this.whatsappMessage,
            url: this.url
        };
    }
}
