/**
 * PaymentController - Controlador de Pagos para la Capa UI
 * 
 * Maneja la interacción del usuario con el sistema de pagos.
 * Este controlador orquesta la comunicación entre la UI y los casos de uso.
 * 
 * @memberof UI.Controllers
 * @see {@link PaymentUseCase} Caso de uso para procesamiento de pagos
 */
export class PaymentController {
    /**
     * @param {PaymentUseCase} paymentUseCase - Caso de uso para pagos
     */
    constructor(paymentUseCase) {
        this.paymentUseCase = paymentUseCase;
    }

    /**
     * Inicia el proceso de pago desde la interfaz de checkout
     * @param {Object} orderData - Datos del pedido actual
     * @param {Object} customerData - Datos del cliente
     * @returns {Promise<void>}
     */
    async initiateCheckout(orderData, customerData) {
        try {
            // Mostrar estado de carga
            this._showLoadingState();

            // Validar datos del formulario
            const validation = this._validateCustomerData(customerData);
            if (!validation.isValid) {
                this._showError(validation.errors.join(', '));
                return;
            }

            // Procesar pago mediante caso de uso
            const result = await this.paymentUseCase.processOrderPayment(orderData, customerData);

            if (result.success) {
                // Redirigir a pasarela de pago externa
                this._redirectToPaymentGateway(result.paymentUrl);
            } else {
                this._showError(result.message);
            }
        } catch (error) {
            console.error('[PaymentController] Error initiating checkout:', error);
            this._showError('Error al iniciar el pago. Por favor intente nuevamente.');
        }
    }

    /**
     * Verifica el estado de un pago después de la redirección
     * @param {string} transactionId - ID de la transacción
     * @returns {Promise<Object>} Estado del pago
     */
    async verifyPaymentStatus(transactionId) {
        try {
            this._showLoadingState();

            const result = await this.paymentUseCase.checkTransactionStatus(transactionId);

            if (result.success) {
                this._renderPaymentStatus(result);
                return result;
            } else {
                this._showError(result.message);
                return null;
            }
        } catch (error) {
            console.error('[PaymentController] Error verifying payment:', error);
            this._showError('Error al verificar el estado del pago.');
            return null;
        }
    }

    /**
     * Procesa notificaciones webhook en tiempo real
     * @param {Object} webhookData - Datos del webhook
     * @returns {Promise<void>}
     */
    async handleWebhookNotification(webhookData) {
        try {
            const result = await this.paymentUseCase.processWebhookNotification(webhookData);

            if (result.success) {
                // Actualizar UI según acciones requeridas
                result.actions.forEach(action => {
                    this._executeAction(action);
                });
            }
        } catch (error) {
            console.error('[PaymentController] Error handling webhook:', error);
        }
    }

    /**
     * Renderiza el botón embebido de Wompi en el DOM
     * @param {string} containerSelector - Selector del contenedor HTML
     * @param {number} amountCents - Monto en centavos
     * @param {string} reference - Referencia del pedido
     * @param {string} publicKey - Llave pública de Wompi
     */
    renderEmbeddedButton(containerSelector, amountCents, reference, publicKey) {
        const container = document.querySelector(containerSelector);
        
        if (!container) {
            console.error('[PaymentController] Container not found:', containerSelector);
            return;
        }

        // Crear elemento del botón embebido
        const buttonDiv = document.createElement('div');
        buttonDiv.id = `wompi-button-${Date.now()}`;
        buttonDiv.setAttribute('data-public-key', publicKey);
        buttonDiv.setAttribute('data-amount-in-cents', amountCents.toString());
        buttonDiv.setAttribute('data-reference', reference);
        buttonDiv.setAttribute('data-currency', 'COP');
        buttonDiv.setAttribute('data-redirect-url', `${window.location.origin}/pedidos/confirmacion.html`);

        container.innerHTML = '';
        container.appendChild(buttonDiv);

        // Cargar script de Wompi si no está cargado
        if (!document.querySelector('script[src="https://checkout.wompi.co/g.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://checkout.wompi.co/g.js';
            script.defer = true;
            document.body.appendChild(script);
        }
    }

    /**
     * Valida los datos del cliente antes de procesar el pago
     * @private
     * @param {Object} customerData - Datos del cliente
     * @returns {{isValid: boolean, errors: Array<string>}} Resultado de validación
     */
    _validateCustomerData(customerData) {
        const errors = [];
        const { email, name, phone } = customerData;

        if (!email || !email.includes('@')) {
            errors.push('Email inválido');
        }

        if (!name || name.trim().length < 3) {
            errors.push('Nombre completo requerido');
        }

        if (phone && phone.replace(/\D/g, '').length < 10) {
            errors.push('Teléfono inválido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Muestra estado de carga en la UI
     * @private
     */
    _showLoadingState() {
        const loadingElement = document.getElementById('payment-loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
    }

    /**
     * Oculta estado de carga en la UI
     * @private
     */
    _hideLoadingState() {
        const loadingElement = document.getElementById('payment-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * Muestra mensaje de error en la UI
     * @private
     * @param {string} message - Mensaje de error
     */
    _showError(message) {
        this._hideLoadingState();
        
        const errorElement = document.getElementById('payment-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }

    /**
     * Redirige a la pasarela de pago externa
     * @private
     * @param {string} paymentUrl - URL de la pasarela de pago
     */
    _redirectToPaymentGateway(paymentUrl) {
        if (paymentUrl) {
            window.location.href = paymentUrl;
        }
    }

    /**
     * Renderiza el estado del pago en la UI
     * @private
     * @param {Object} result - Resultado de la verificación del pago
     */
    _renderPaymentStatus(result) {
        this._hideLoadingState();

        const statusContainer = document.getElementById('payment-status');
        if (!statusContainer) return;

        const statusMessages = {
            'APPROVED': {
                icon: '✅',
                title: '¡Pago Aprobado!',
                message: 'Tu pedido ha sido confirmado. Recibirás un correo de confirmación.'
            },
            'DECLINED': {
                icon: '❌',
                title: 'Pago Rechazado',
                message: 'El pago fue rechazado. Por favor intenta con otro método de pago.'
            },
            'PENDING': {
                icon: '⏳',
                title: 'Pago Pendiente',
                message: 'Estamos esperando la confirmación de tu pago.'
            },
            'ERROR': {
                icon: '⚠️',
                title: 'Error en el Pago',
                message: 'Ocurrió un error. Por favor contacta a soporte.'
            }
        };

        const statusInfo = statusMessages[result.status] || statusMessages.ERROR;

        statusContainer.innerHTML = `
            <div class="payment-status ${result.status.toLowerCase()}">
                <div class="status-icon">${statusInfo.icon}</div>
                <h2>${statusInfo.title}</h2>
                <p>${statusInfo.message}</p>
                <div class="transaction-details">
                    <p><strong>ID Transacción:</strong> ${result.transactionId}</p>
                    <p><strong>Monto:</strong> $${(result.amountCents / 100).toLocaleString('es-CO')}</p>
                    ${result.paymentMethod ? `<p><strong>Método:</strong> ${result.paymentMethod}</p>` : ''}
                </div>
            </div>
        `;

        statusContainer.style.display = 'block';
    }

    /**
     * Ejecuta acciones basadas en el resultado del webhook
     * @private
     * @param {string} action - Acción a ejecutar
     */
    _executeAction(action) {
        switch (action) {
            case 'SEND_CONFIRMATION_EMAIL':
                console.log('[PaymentController] Sending confirmation email...');
                break;
            case 'UPDATE_ORDER_STATUS_TO_PAID':
                this._updateOrderStatus('PAID');
                break;
            case 'NOTIFY_KITCHEN_TEAM':
                console.log('[PaymentController] Notifying kitchen team...');
                break;
            case 'SEND_PAYMENT_DECLINED_NOTIFICATION':
                console.log('[PaymentController] Sending declined notification...');
                break;
            default:
                console.log(`[PaymentController] Unknown action: ${action}`);
        }
    }

    /**
     * Actualiza el estado del pedido en la UI
     * @private
     * @param {string} status - Nuevo estado del pedido
     */
    _updateOrderStatus(status) {
        const statusElement = document.getElementById('order-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.classList.add(`status-${status.toLowerCase()}`);
        }
    }
}
