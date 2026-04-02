/**
 * LegacyCatalogAdapter - Adaptador de Catálogo Legacy
 * 
 * Implementación concreta del CatalogRepository que se conecta
 * a los datos legacy (MISAJO_CATALOG) existentes en el navegador.
 */

import { CatalogRepository } from '../../../domain/ports/CatalogRepository.js';

export class LegacyCatalogAdapter extends CatalogRepository {
    /**
     * @param {Object} catalogData - Datos del catálogo global (MISAJO_CATALOG)
     */
    constructor(catalogData) {
        super();
        this.catalogData = catalogData;
    }

    /**
     * Obtiene todos los productos del catálogo
     * @returns {Promise<Array>} Lista de productos en formato legacy
     */
    async getAllProducts() {
        return Promise.resolve(this.catalogData?.products || []);
    }

    /**
     * Obtiene un producto por su ID
     * @param {string} productId - ID del producto
     * @returns {Promise<Object|null>} Producto o null si no existe
     */
    async getProductById(productId) {
        const products = await this.getAllProducts();
        const product = products.find(p => p.id === productId);
        return Promise.resolve(product || null);
    }

    /**
     * Obtiene todos los combos del catálogo
     * @returns {Promise<Array>} Lista de combos en formato legacy
     */
    async getAllCombos() {
        return Promise.resolve(this.catalogData?.combos || []);
    }

    /**
     * Obtiene un combo por su ID
     * @param {string} comboId - ID del combo
     * @returns {Promise<Object|null>} Combo o null si no existe
     */
    async getComboById(comboId) {
        const combos = await this.getAllCombos();
        const combo = combos.find(c => c.id === comboId);
        return Promise.resolve(combo || null);
    }

    /**
     * Obtiene productos filtrados por IDs específicos
     * @param {Array<string>} productIds - Lista de IDs de productos
     * @returns {Promise<Array>} Lista de productos filtrados
     */
    async getProductsByIds(productIds) {
        if (!productIds || productIds.length === 0) {
            return Promise.resolve([]);
        }

        const products = await this.getAllProducts();
        return Promise.resolve(
            products.filter(p => productIds.includes(p.id))
        );
    }

    /**
     * Obtiene combos filtrados por IDs específicos
     * @param {Array<string>} comboIds - Lista de IDs de combos
     * @returns {Promise<Array>} Lista de combos filtrados
     */
    async getCombosByIds(comboIds) {
        if (!comboIds || comboIds.length === 0) {
            return Promise.resolve([]);
        }

        const combos = await this.getAllCombos();
        return Promise.resolve(
            combos.filter(c => comboIds.includes(c.id))
        );
    }

    /**
     * Obtiene productos limitados por cantidad
     * @param {number} limit - Cantidad máxima de productos
     * @returns {Promise<Array>} Lista de productos limitada
     */
    async getLimitedProducts(limit) {
        const products = await this.getAllProducts();
        return Promise.resolve(products.slice(0, limit));
    }
}
