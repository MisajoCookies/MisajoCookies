/**
 * WompiPaymentAdapter - Adaptador de Infraestructura para Pasarela Wompi
 * 
 * Implementación concreta del PaymentRepository utilizando la API de Wompi.
 * Este adaptador maneja toda la comunicación con el servicio externo de pagos.
 * 
 * @implements {PaymentRepository}
 * @memberof Infrastructure.Adapters.External
 * 
 * @see {@link https://docs.wompi.co/} Documentación oficial de Wompi
 */
export class WompiPaymentAdapter {
    /**
     * Configuración del adaptador Wompi
     * @param {Object} config - Configuración de Wompi
     * @param {string} config.publicKey - Llave pública de Wompi (frontend)
     * @param {string} config.privateKey - Llave privada de Wompi (backend/webhooks)
     * @param {boolean} config.sandbox - Modo sandbox (true) o producción (false)
     */
    constructor(config) {
        this.publicKey = config.publicKey;
        this.privateKey = config.privateKey;
        this.baseUrl = config.sandbox 
            ? 'https://sandbox.wompi.co' 
            : 'https://production.wompi.co';
        
        // Validar configuración requerida
        if (!this.publicKey || !this.privateKey) {
            throw new Error('Wompi configuration requires publicKey and privateKey');
        }
    }

    /**
     * @inheritdoc
     * @description Inicia una transacción en Wompi mediante su API
     */
    async initiateTransaction(paymentData) {
        const { orderId, amountCents, customerEmail, customerName, customerPhone } = paymentData;

        // Validar datos requeridos
        if (!orderId || !amountCents || !customerEmail) {
            throw new Error('Missing required payment data: orderId, amountCents, customerEmail');
        }

        try {
            // Preparar payload según documentación de Wompi
            const requestBody = {
                currency: 'COP',
                amount_in_cents: amountCents,
                reference: `ORDER-${orderId}-${Date.now()}`,
                customer_data: {
                    full_name: customerName,
                    email: customerEmail,
                    phone_number: customerPhone || ''
                },
                redirect_url: `${window.location.origin}/pedidos/confirmacion.html`,
                metadata: {
                    order_id: orderId,
                    source: 'misajocookies_web',
                    timestamp: new Date().toISOString()
                }
            };

            // Realizar petición a la API de Wompi
            const response = await fetch(`${this.baseUrl}/v1/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.privateKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Wompi API Error: ${errorData.message || response.statusText}`);
            }

            const transactionData = await response.json();
            
            return {
                transactionId: transactionData.data.id,
                status: transactionData.data.status,
                paymentUrl: transactionData.data.payment_url,
                reference: transactionData.data.reference,
                amountCents: transactionData.data.amount_in_cents,
                createdAt: transactionData.data.created_at
            };
        } catch (error) {
            console.error('[WompiAdapter] Error initiating transaction:', error);
            throw error;
        }
    }

    /**
     * @inheritdoc
     * @description Consulta el estado de una transacción en Wompi
     */
    async getTransactionStatus(transactionId) {
        if (!transactionId) {
            throw new Error('Transaction ID is required');
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/v1/transactions/${transactionId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.privateKey}`
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Wompi API Error: ${errorData.message || response.statusText}`);
            }

            const transactionData = await response.json();
            
            return {
                transactionId: transactionData.data.id,
                status: this._mapWompiStatus(transactionData.data.status),
                amountCents: transactionData.data.amount_in_cents,
                currency: transactionData.data.currency,
                reference: transactionData.data.reference,
                paymentMethod: transactionData.data.payment_method?.type || null,
                createdAt: transactionData.data.created_at,
                updatedAt: transactionData.data.updated_at
            };
        } catch (error) {
            console.error('[WompiAdapter] Error getting transaction status:', error);
            throw error;
        }
    }

    /**
     * @inheritdoc
     * @description Procesa webhook de Wompi para actualizar estados
     */
    async updateTransactionStatus(transactionId, status, metadata = {}) {
        // En implementación real, esto persistiría en base de datos
        // Aquí simulamos la actualización para el adapter pattern
        console.log('[WompiAdapter] Updating transaction status:', {
            transactionId,
            status,
            metadata
        });

        return true;
    }

    /**
     * @inheritdoc
     * @description Wompi no soporta reembolsos directos desde API pública
     * Este método es placeholder para integración futura vía dashboard
     */
    async processRefund(transactionId, refundAmountCents = null, reason = '') {
        console.warn('[WompiAdapter] Refunds must be processed via Wompi Dashboard');
        throw new Error('Refunds are not supported via public API. Use Wompi Dashboard.');
    }

    /**
     * @inheritdoc
     * @description Obtiene transacciones por orden (requiere implementación custom)
     */
    async getOrderTransactions(orderId) {
        // Wompi no tiene endpoint directo para buscar por metadata
        // Se requiere implementar cache local o base de datos
        console.log('[WompiAdapter] Getting transactions for order:', orderId);
        return [];
    }

    /**
     * Mapea estados de Wompi a estados internos del sistema
     * @private
     * @param {string} wompiStatus - Estado reportado por Wompi
     * @returns {string} Estado interno mapeado
     */
    _mapWompiStatus(wompiStatus) {
        const statusMap = {
            'PENDING': 'PENDING',
            'APPROVED': 'APPROVED',
            'DECLINED': 'DECLINED',
            'ERROR': 'ERROR',
            'VOIDED': 'CANCELLED',
            'REFUNDED': 'REFUNDED'
        };
        return statusMap[wompiStatus] || 'ERROR';
    }

    /**
     * Genera el botón de pago embebido de Wompi
     * @param {Object} options - Opciones del botón
     * @param {string} options.containerId - ID del contenedor HTML
     * @param {number} options.amountCents - Monto en centavos
     * @param {string} options.reference - Referencia del pago
     * @returns {string} HTML del botón embebido
     */
    generateEmbeddedButton(options) {
        const { containerId, amountCents, reference } = options;
        
        return `
            <div id="${containerId}" 
                 data-public-key="${this.publicKey}"
                 data-amount-in-cents="${amountCents}"
                 data-reference="${reference}"
                 data-currency="COP"
                 data-redirect-url="${window.location.origin}/pedidos/confirmacion.html">
            </div>
            <script src="https://checkout.wompi.co/g.js" defer></script>
        `;
    }
}
