/**
 * OrderRepository - Puerto (Interfaz) del Dominio
 * 
 * Define el contrato para persistir y recuperar pedidos.
 * Esta es una interfaz abstracta - la implementación concreta va en Infrastructure.
 */

export class OrderRepository {
    /**
     * Guarda un nuevo pedido
     * @param {Object} orderData - Datos del pedido
     * @returns {Promise<string>} ID del pedido creado
     */
    async save(orderData) {
        throw new Error('Method save() must be implemented');
    }

    /**
     * Obtiene un pedido por su ID
     * @param {string} orderId - ID del pedido
     * @returns {Promise<Object|null>} Pedido o null si no existe
     */
    async getById(orderId) {
        throw new Error('Method getById() must be implemented');
    }

    /**
     * Obtiene todos los pedidos de un cliente
     * @param {string} customerId - ID del cliente
     * @returns {Promise<Array>} Lista de pedidos
     */
    async getByCustomer(customerId) {
        throw new Error('Method getByCustomer() must be implemented');
    }

    /**
     * Actualiza el estado de un pedido
     * @param {string} orderId - ID del pedido
     * @param {string} status - Nuevo estado
     * @returns {Promise<boolean>} True si se actualizó correctamente
     */
    async updateStatus(orderId, status) {
        throw new Error('Method updateStatus() must be implemented');
    }
}
