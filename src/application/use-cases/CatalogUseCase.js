/**
 * CatalogUseCase - Caso de Uso de Catálogo
 * 
 * Orquesta las operaciones relacionadas con el catálogo de productos.
 * Esta capa no depende de implementaciones concretas, solo de interfaces.
 */

import { Product } from '../../domain/entities/Product.js';
import { Combo } from '../../domain/entities/Combo.js';

export class CatalogUseCase {
    /**
     * @param {CatalogRepository} catalogRepository - Implementación del repositorio de catálogo
     */
    constructor(catalogRepository) {
        this.catalogRepository = catalogRepository;
    }

    /**
     * Obtiene todos los productos del catálogo como entidades de dominio
     * @returns {Promise<Array<Product>>} Lista de productos
     */
    async getAllProducts() {
        const productsData = await this.catalogRepository.getAllProducts();
        return productsData.map(data => Product.fromLegacy(data));
    }

    /**
     * Obtiene todos los combos del catálogo como entidades de dominio
     * @returns {Promise<Array<Combo>>} Lista de combos
     */
    async getAllCombos() {
        const combosData = await this.catalogRepository.getAllCombos();
        return combosData.map(data => Combo.fromLegacy(data));
    }

    /**
     * Obtiene productos filtrados por IDs específicos
     * @param {Array<string>} productIds - Lista de IDs de productos
     * @returns {Promise<Array<Product>>} Lista de productos filtrados
     */
    async getProductsByIds(productIds) {
        if (!productIds || productIds.length === 0) {
            return [];
        }

        const allProducts = await this.getAllProducts();
        return allProducts.filter(p => productIds.includes(p.id));
    }

    /**
     * Obtiene combos filtrados por IDs específicos
     * @param {Array<string>} comboIds - Lista de IDs de combos
     * @returns {Promise<Array<Combo>>} Lista de combos filtrados
     */
    async getCombosByIds(comboIds) {
        if (!comboIds || comboIds.length === 0) {
            return [];
        }

        const allCombos = await this.getAllCombos();
        return allCombos.filter(c => comboIds.includes(c.id));
    }

    /**
     * Obtiene un producto específico por ID
     * @param {string} productId - ID del producto
     * @returns {Promise<Product|null>} Producto o null
     */
    async getProductById(productId) {
        const products = await this.getProductsByIds([productId]);
        return products.length > 0 ? products[0] : null;
    }

    /**
     * Obtiene un combo específico por ID
     * @param {string} comboId - ID del combo
     * @returns {Promise<Combo|null>} Combo o null
     */
    async getComboById(comboId) {
        const combos = await this.getCombosByIds([comboId]);
        return combos.length > 0 ? combos[0] : null;
    }

    /**
     * Obtiene productos limitados por cantidad (para featured products)
     * @param {number} limit - Cantidad máxima de productos
     * @returns {Promise<Array<Product>>} Lista de productos limitada
     */
    async getFeaturedProducts(limit = 3) {
        const allProducts = await this.getAllProducts();
        return allProducts.slice(0, limit);
    }

    /**
     * Obtiene el catálogo completo (productos y combos)
     * @returns {Promise<{products: Array<Product>, combos: Array<Combo>}>} Catálogo completo
     */
    async getFullCatalog() {
        const [products, combos] = await Promise.all([
            this.getAllProducts(),
            this.getAllCombos()
        ]);
        return { products, combos };
    }
}
