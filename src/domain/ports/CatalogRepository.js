/**
 * CatalogRepository - Puerto (Interfaz) del Dominio
 * 
 * Define el contrato para acceder al catálogo de productos y combos.
 * Esta es una interfaz abstracta - la implementación concreta va en Infrastructure.
 */

export class CatalogRepository {
    /**
     * Obtiene todos los productos del catálogo
     * @returns {Promise<Array>} Lista de productos
     */
    async getAllProducts() {
        throw new Error('Method getAllProducts() must be implemented');
    }

    /**
     * Obtiene un producto por su ID
     * @param {string} productId - ID del producto
     * @returns {Promise<Object|null>} Producto o null si no existe
     */
    async getProductById(productId) {
        throw new Error('Method getProductById() must be implemented');
    }

    /**
     * Obtiene todos los combos del catálogo
     * @returns {Promise<Array>} Lista de combos
     */
    async getAllCombos() {
        throw new Error('Method getAllCombos() must be implemented');
    }

    /**
     * Obtiene un combo por su ID
     * @param {string} comboId - ID del combo
     * @returns {Promise<Object|null>} Combo o null si no existe
     */
    async getComboById(comboId) {
        throw new Error('Method getComboById() must be implemented');
    }

    /**
     * Obtiene productos filtrados por IDs específicos
     * @param {Array<string>} productIds - Lista de IDs de productos
     * @returns {Promise<Array>} Lista de productos filtrados
     */
    async getProductsByIds(productIds) {
        throw new Error('Method getProductsByIds() must be implemented');
    }

    /**
     * Obtiene combos filtrados por IDs específicos
     * @param {Array<string>} comboIds - Lista de IDs de combos
     * @returns {Promise<Array>} Lista de combos filtrados
     */
    async getCombosByIds(comboIds) {
        throw new Error('Method getCombosByIds() must be implemented');
    }

    /**
     * Obtiene productos limitados por cantidad
     * @param {number} limit - Cantidad máxima de productos
     * @returns {Promise<Array>} Lista de productos limitada
     */
    async getLimitedProducts(limit) {
        throw new Error('Method getLimitedProducts() must be implemented');
    }
}
