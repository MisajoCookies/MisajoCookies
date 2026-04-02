/**
 * PaymentRepository - Puerto (Interfaz) del Dominio para Pagos
 * 
 * Define el contrato para procesar pagos y gestionar transacciones.
 * Esta es una interfaz abstracta - la implementación concreta va en Infrastructure.
 * 
 * @interface
 * @memberof Domain.Ports
 */
export class PaymentRepository {
    /**
     * Inicia una nueva transacción de pago
     * @param {Object} paymentData - Datos de la transacción
     * @param {string} paymentData.orderId - ID del pedido asociado
     * @param {number} paymentData.amountCents - Monto en centavos de COP
     * @param {string} paymentData.customerEmail - Email del cliente
     * @param {string} paymentData.customerName - Nombre del cliente
     * @returns {Promise<Object>} Datos de la transacción iniciada
     * @throws {Error} Si falla la inicialización del pago
     */
    async initiateTransaction(paymentData) {
        throw new Error('Method initiateTransaction() must be implemented');
    }

    /**
     * Consulta el estado de una transacción por su ID
     * @param {string} transactionId - ID de la transacción
     * @returns {Promise<Object|null>} Estado de la transacción o null si no existe
     * @throws {Error} Si falla la consulta
     */
    async getTransactionStatus(transactionId) {
        throw new Error('Method getTransactionStatus() must be implemented');
    }

    /**
     * Actualiza el estado de una transacción basado en webhook
     * @param {string} transactionId - ID de la transacción
     * @param {string} status - Nuevo estado de la transacción
     * @param {Object} metadata - Metadatos adicionales del pago
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si falla la actualización
     */
    async updateTransactionStatus(transactionId, status, metadata = {}) {
        throw new Error('Method updateTransactionStatus() must be implemented');
    }

    /**
     * Procesa un reembolso parcial o total
     * @param {string} transactionId - ID de la transacción original
     * @param {number} refundAmountCents - Monto a reembolsar en centavos (null para total)
     * @param {string} reason - Razón del reembolso
     * @returns {Promise<Object>} Datos del reembolso procesado
     * @throws {Error} Si falla el reembolso
     */
    async processRefund(transactionId, refundAmountCents = null, reason = '') {
        throw new Error('Method processRefund() must be implemented');
    }

    /**
     * Obtiene el historial de transacciones de un pedido
     * @param {string} orderId - ID del pedido
     * @returns {Promise<Array>} Lista de transacciones asociadas
     * @throws {Error} Si falla la consulta
     */
    async getOrderTransactions(orderId) {
        throw new Error('Method getOrderTransactions() must be implemented');
    }
}

/**
 * Estados posibles de una transacción de pago
 * @readonly
 * @enum {string}
 */
export const PaymentStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    DECLINED: 'DECLINED',
    ERROR: 'ERROR',
    REFUNDED: 'REFUNDED',
    PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
    CANCELLED: 'CANCELLED'
};

/**
 * Tipos de método de pago soportados
 * @readonly
 * @enum {string}
 */
export const PaymentMethod = {
    CREDIT_CARD: 'CREDIT_CARD',
    DEBIT_CARD: 'DEBIT_CARD',
    BANK_TRANSFER: 'BANK_TRANSFER',
    PSE: 'PSE',
    WALLET: 'WALLET',
    CASH_ON_DELIVERY: 'CASH_ON_DELIVERY'
};
