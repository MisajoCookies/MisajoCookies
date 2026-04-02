/**
 * CatalogOutputPort - Puerto de Salida para Catálogo
 * 
 * Define el contrato para la salida de datos del catálogo hacia la UI.
 */

export class CatalogOutputPort {
    /**
     * Formatea un producto para mostrar en la UI
     * @param {Product} product - Entidad de dominio Product
     * @param {string} baseImagePath - Ruta base para las imágenes
     * @returns {Object} Datos formateados para la UI
     */
    formatProductForUI(product, baseImagePath = '/') {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.formattedPrice,
            presentation: product.presentation,
            images: product.images.map(img => ({
                ...img,
                src: this.resolveImagePath(img.src, baseImagePath)
            })),
            whatsappUrl: product.getWhatsAppUrl(),
            url: product.url,
            hasMultipleImages: product.hasMultipleImages()
        };
    }

    /**
     * Formatea un combo para mostrar en la UI
     * @param {Combo} combo - Entidad de dominio Combo
     * @param {string} baseImagePath - Ruta base para las imágenes
     * @returns {Object} Datos formateados para la UI
     */
    formatComboForUI(combo, baseImagePath = '/') {
        return {
            id: combo.id,
            name: combo.name,
            description: combo.description,
            price: combo.formattedPrice,
            images: combo.images.map(img => ({
                ...img,
                src: this.resolveImagePath(img.src, baseImagePath)
            })),
            whatsappUrl: combo.getWhatsAppUrl(),
            hasMultipleImages: combo.hasMultipleImages()
        };
    }

    /**
     * Resuelve la ruta completa de una imagen
     * @param {string} imagePath - Ruta relativa de la imagen
     * @param {string} basePath - Ruta base
     * @returns {string} Ruta completa de la imagen
     */
    resolveImagePath(imagePath, basePath) {
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
            return imagePath;
        }
        return basePath.replace(/\/$/, '') + '/' + imagePath;
    }

    /**
     * Formatea una lista de productos para la UI
     * @param {Array<Product>} products - Lista de productos
     * @param {string} baseImagePath - Ruta base para las imágenes
     * @returns {Array<Object>} Lista formateada para la UI
     */
    formatProductsListForUI(products, baseImagePath = '/') {
        return products.map(p => this.formatProductForUI(p, baseImagePath));
    }

    /**
     * Formatea una lista de combos para la UI
     * @param {Array<Combo>} combos - Lista de combos
     * @param {string} baseImagePath - Ruta base para las imágenes
     * @returns {Array<Object>} Lista formateada para la UI
     */
    formatCombosListForUI(combos, baseImagePath = '/') {
        return combos.map(c => this.formatComboForUI(c, baseImagePath));
    }
}
