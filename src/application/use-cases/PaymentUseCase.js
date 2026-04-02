/**
 * PaymentUseCase - Caso de Uso para Gestión de Pagos
 * 
 * Orquesta las operaciones relacionadas con el procesamiento de pagos.
 * Esta capa solo depende de interfaces (PaymentRepository), no de implementaciones concretas.
 * 
 * @memberof Application.UseCases
 * @see {@link PaymentRepository} Puerto del dominio para pagos
 */
export class PaymentUseCase {
    /**
     * @param {PaymentRepository} paymentRepository - Implementación del repositorio de pagos
     */
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * Procesa un pago para un pedido existente
     * @param {Object} orderData - Datos del pedido a pagar
     * @param {string} orderData.id - ID único del pedido
     * @param {number} orderData.totalCents - Monto total en centavos de COP
     * @param {Object} customerData - Datos del cliente
     * @param {string} customerData.email - Email del cliente
     * @param {string} customerData.name - Nombre completo del cliente
     * @param {string} [customerData.phone] - Teléfono del cliente (opcional)
     * @returns {Promise<Object>} Resultado del proceso de pago
     * @throws {Error} Si falla el procesamiento del pago
     */
    async processOrderPayment(orderData, customerData) {
        const { id: orderId, totalCents } = orderData;
        const { email, name, phone } = customerData;

        // Validar datos requeridos
        if (!orderId || !totalCents || !email || !name) {
            throw new Error('Missing required data for payment processing');
        }

        // Validar monto positivo
        if (totalCents <= 0) {
            throw new Error('Payment amount must be greater than zero');
        }

        try {
            // Iniciar transacción mediante el repositorio (puerto)
            const transactionResult = await this.paymentRepository.initiateTransaction({
                orderId,
                amountCents: totalCents,
                customerEmail: email,
                customerName: name,
                customerPhone: phone
            });

            return {
                success: true,
                transactionId: transactionResult.transactionId,
                status: transactionResult.status,
                paymentUrl: transactionResult.paymentUrl,
                reference: transactionResult.reference,
                message: 'Transacción iniciada exitosamente'
            };
        } catch (error) {
            console.error('[PaymentUseCase] Error processing payment:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error al procesar el pago. Por favor intente nuevamente.'
            };
        }
    }

    /**
     * Verifica el estado actual de una transacción
     * @param {string} transactionId - ID de la transacción a verificar
     * @returns {Promise<Object>} Estado actualizado de la transacción
     * @throws {Error} Si falla la consulta del estado
     */
    async checkTransactionStatus(transactionId) {
        if (!transactionId) {
            throw new Error('Transaction ID is required');
        }

        try {
            const status = await this.paymentRepository.getTransactionStatus(transactionId);
            
            return {
                success: true,
                transactionId: status.transactionId,
                status: status.status,
                amountCents: status.amountCents,
                paymentMethod: status.paymentMethod,
                updatedAt: status.updatedAt
            };
        } catch (error) {
            console.error('[PaymentUseCase] Error checking transaction status:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error al consultar el estado del pago.'
            };
        }
    }

    /**
     * Procesa una notificación webhook de cambio de estado
     * @param {Object} webhookData - Datos del webhook recibido
     * @param {string} webhookData.transactionId - ID de la transacción
     * @param {string} webhookData.status - Nuevo estado de la transacción
     * @param {Object} [webhookData.metadata] - Metadatos adicionales
     * @returns {Promise<Object>} Resultado del procesamiento del webhook
     */
    async processWebhookNotification(webhookData) {
        const { transactionId, status, metadata = {} } = webhookData;

        if (!transactionId || !status) {
            throw new Error('Webhook data missing transactionId or status');
        }

        try {
            // Actualizar estado en el repositorio
            await this.paymentRepository.updateTransactionStatus(
                transactionId,
                status,
                metadata
            );

            // Determinar acciones basadas en el estado
            const actions = this._determineActionsByStatus(status, metadata);

            return {
                success: true,
                transactionId,
                status,
                actions,
                message: 'Webhook procesado exitosamente'
            };
        } catch (error) {
            console.error('[PaymentUseCase] Error processing webhook:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error al procesar la notificación de pago.'
            };
        }
    }

    /**
     * Determina las acciones a tomar según el estado del pago
     * @private
     * @param {string} status - Estado actual del pago
     * @param {Object} metadata - Metadatos del pago
     * @returns {Array<string>} Lista de acciones a ejecutar
     */
    _determineActionsByStatus(status, metadata) {
        const actions = [];

        switch (status) {
            case 'APPROVED':
                actions.push('SEND_CONFIRMATION_EMAIL');
                actions.push('UPDATE_ORDER_STATUS_TO_PAID');
                actions.push('NOTIFY_KITCHEN_TEAM');
                break;
            case 'DECLINED':
                actions.push('SEND_PAYMENT_DECLINED_NOTIFICATION');
                actions.push('KEEP_ORDER_PENDING');
                break;
            case 'PENDING':
                actions.push('WAIT_FOR_PAYMENT_CONFIRMATION');
                break;
            case 'ERROR':
                actions.push('LOG_ERROR_FOR_REVIEW');
                actions.push('NOTIFY_SUPPORT_TEAM');
                break;
            default:
                actions.push('LOG_UNKNOWN_STATUS');
        }

        return actions;
    }

    /**
     * Obtiene el historial de pagos de un pedido
     * @param {string} orderId - ID del pedido
     * @returns {Promise<Object>} Historial de transacciones del pedido
     */
    async getOrderPaymentHistory(orderId) {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        try {
            const transactions = await this.paymentRepository.getOrderTransactions(orderId);
            
            return {
                success: true,
                orderId,
                transactions,
                totalTransactions: transactions.length
            };
        } catch (error) {
            console.error('[PaymentUseCase] Error getting payment history:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error al consultar el historial de pagos.'
            };
        }
    }

    /**
     * Valida si un pago cumple con los requisitos de seguridad
     * @param {Object} transactionData - Datos de la transacción
     * @returns {Object} Resultado de la validación de seguridad
     */
    validateSecurity(transactionData) {
        const { amountCents, customerEmail, reference } = transactionData;
        const errors = [];

        // Validar monto razonable
        if (amountCents <= 0) {
            errors.push('Invalid payment amount');
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            errors.push('Invalid email format');
        }

        // Validar referencia única
        if (!reference || reference.trim() === '') {
            errors.push('Missing payment reference');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
