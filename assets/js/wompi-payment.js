/**
 * MisajoCookies — Wompi Payment Integration Module
 * Integración completa con la pasarela de pagos Wompi (Bancolombia)
 * Documentación oficial: https://docs.wompi.co/
 */

(function() {
  'use strict';

  // Configuración desde window.MISAJO_CONFIG
  const WOMPI_PUBLIC_KEY = window.getMisajoConfig 
    ? window.getMisajoConfig('WOMPI_PUBLIC_KEY', '') 
    : '';
  
  const WOMPI_ENVIRONMENT = window.getMisajoConfig 
    ? window.getMisajoConfig('WOMPI_ENVIRONMENT', 'production') 
    : 'production'; // 'production' o 'sandbox'

  const BASE_URL = WOMPI_ENVIRONMENT === 'sandbox'
    ? 'https://checkout.sandbox.wompi.co'
    : 'https://checkout.wompi.co';

  const JS_WIDGET_URL = WOMPI_ENVIRONMENT === 'sandbox'
    ? 'https://js.sandbox.wompi.co/btn-widget-production/v1/wompi-btn-widgets.js'
    : 'https://js.wompi.co/btn-widget-production/v1/wompi-btn-widgets.js';

  // Estados del pago
  const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    APPROVED: 'APPROVED',
    DECLINED: 'DECLINED',
    ERROR: 'ERROR'
  };

  let currentPaymentState = PAYMENT_STATUS.PENDING;
  let wompiWidgetsLoaded = false;
  let onPaymentCallback = null;

  /**
   * Carga el script de Wompi dinámicamente
   * @returns {Promise<boolean>} True si se cargó exitosamente
   */
  function loadWompiScript() {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if (window.wompiBtnWidgets) {
        wompiWidgetsLoaded = true;
        resolve(true);
        return;
      }

      // Verificar si ya existe el script en el DOM
      const existingScript = document.querySelector(`script[src="${JS_WIDGET_URL}"]`);
      if (existingScript) {
        // Esperar a que cargue
        existingScript.addEventListener('load', () => {
          wompiWidgetsLoaded = true;
          resolve(true);
        });
        existingScript.addEventListener('error', () => reject(new Error('Error al cargar script de Wompi')));
        return;
      }

      // Crear nuevo script
      const script = document.createElement('script');
      script.src = JS_WIDGET_URL;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        wompiWidgetsLoaded = true;
        console.log('[Wompi] Script cargado exitosamente');
        resolve(true);
      };

      script.onerror = (error) => {
        console.error('[Wompi] Error al cargar script:', error);
        reject(new Error('No se pudo cargar el script de Wompi'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Valida que la configuración sea correcta
   * @returns {Object} Resultado de validación
   */
  function validateConfig() {
    const errors = [];
    
    if (!WOMPI_PUBLIC_KEY) {
      errors.push('Falta configurar WOMPI_PUBLIC_KEY en window.MISAJO_CONFIG');
    } else if (!WOMPI_PUBLIC_KEY.startsWith('pub_')) {
      errors.push('La llave pública debe comenzar con "pub_"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Genera una referencia única para el pedido
   * @param {string} prefix - Prefijo opcional
   * @returns {string} Referencia única
   */
  function generateReference(prefix = 'MISAJO') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Formatea el monto a centavos (requerido por Wompi)
   * @param {number} amount - Monto en pesos colombianos
   * @returns {number} Monto en centavos
   */
  function toCents(amount) {
    return Math.round(amount * 100);
  }

  /**
   * Inicializa el botón de pago de Wompi
   * @param {Object} options - Configuración del pago
   * @param {number} options.amount - Monto total en COP
   * @param {string} options.reference - Referencia del pedido
   * @param {string} options.customerEmail - Email del cliente (opcional)
   * @param {string} options.customerPhone - Teléfono del cliente (opcional)
   * @param {string} options.redirectUrl - URL de redirección después del pago
   * @param {string} options.containerId - ID del contenedor HTML
   * @param {Function} options.onPaymentComplete - Callback cuando se completa el pago
   */
  async function initPaymentButton(options) {
    const {
      amount,
      reference,
      customerEmail = '',
      customerPhone = '',
      redirectUrl = window.location.origin + '/pedidos/gracias.html',
      containerId = 'wompi-button-container',
      onPaymentComplete = null
    } = options;

    try {
      // Validar configuración
      const configValidation = validateConfig();
      if (!configValidation.isValid) {
        throw new Error(configValidation.errors.join(', '));
      }

      // Cargar script de Wompi
      await loadWompiScript();

      // Validar monto
      if (!amount || amount <= 0) {
        throw new Error('El monto debe ser mayor a cero');
      }

      // Guardar callback
      onPaymentCallback = onPaymentComplete;

      // Actualizar estado
      currentPaymentState = PAYMENT_STATUS.PENDING;

      // Limpiar contenedor
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Contenedor #${containerId} no encontrado`);
      }
      container.innerHTML = '';

      // Crear botón de Wompi
      window.wompiBtnWidgets.create({
        publicKey: WOMPI_PUBLIC_KEY,
        amountInCents: toCents(amount),
        currency: 'COP',
        reference: reference.substring(0, 50), // Máximo 50 caracteres
        redirectUrl: redirectUrl,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        metadata: {
          source: 'misajocookies.com',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      }, `#${containerId}`);

      // Escuchar eventos de Wompi
      setupEventListeners();

      console.log('[Wompi] Botón de pago inicializado:', {
        amount,
        reference,
        environment: WOMPI_ENVIRONMENT
      });

      return { success: true, reference };
    } catch (error) {
      console.error('[Wompi] Error al inicializar:', error);
      currentPaymentState = PAYMENT_STATUS.ERROR;
      
      // Mostrar error en el contenedor
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div class="wompi-error" style="padding: 20px; text-align: center; color: #d32f2f;">
            <p>⚠️ No se pudo cargar el botón de pago</p>
            <small>${error.message}</small>
            <button onclick="window.MisajoWompi.initPaymentButton(window.MisajoWompi.lastOptions)" 
                    style="margin-top: 10px; padding: 8px 16px; background: #2d5016; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Reintentar
            </button>
          </div>
        `;
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Configura los listeners para eventos de Wompi
   */
  function setupEventListeners() {
    if (!window.addEventListener) return;

    window.addEventListener('message', (event) => {
      // Verificar origen del mensaje
      const allowedOrigins = [
        'https://checkout.wompi.co',
        'https://checkout.sandbox.wompi.co'
      ];
      
      if (!allowedOrigins.includes(event.origin)) return;

      const data = event.data;
      
      // Manejar eventos de Wompi
      if (data?.type === 'wompi:payment:result') {
        handlePaymentResult(data.payload);
      }
    });
  }

  /**
   * Maneja el resultado del pago
   * @param {Object} payload - Datos del resultado
   */
  function handlePaymentResult(payload) {
    const { status, reference, transactionId, amount } = payload;

    console.log('[Wompi] Resultado del pago:', payload);

    switch (status) {
      case 'APPROVED':
        currentPaymentState = PAYMENT_STATUS.APPROVED;
        console.log('[Wompi] Pago aprobado:', { reference, transactionId });
        
        // Limpiar carrito después de pago exitoso
        if (window.MisajoCartPersistence) {
          window.MisajoCartPersistence.clearOrder();
        }
        
        // Llamar callback si existe
        if (onPaymentCallback && typeof onPaymentCallback === 'function') {
          onPaymentCallback({
            success: true,
            status: 'APPROVED',
            reference,
            transactionId,
            amount
          });
        }
        
        // Redirigir a página de gracias
        setTimeout(() => {
          window.location.href = `/pedidos/gracias.html?status=approved&ref=${reference}`;
        }, 1000);
        break;

      case 'DECLINED':
        currentPaymentState = PAYMENT_STATUS.DECLINED;
        console.warn('[Wompi] Pago declinado:', { reference, reason: payload.reason });
        
        if (onPaymentCallback && typeof onPaymentCallback === 'function') {
          onPaymentCallback({
            success: false,
            status: 'DECLINED',
            reference,
            reason: payload.reason
          });
        }
        
        showPaymentMessage('❌ Pago declinado. Por favor intenta con otro método de pago.', 'error');
        break;

      case 'PENDING':
        currentPaymentState = PAYMENT_STATUS.PENDING;
        console.log('[Wompi] Pago pendiente:', reference);
        showPaymentMessage('⏳ Procesando pago...', 'info');
        break;

      default:
        currentPaymentState = PAYMENT_STATUS.ERROR;
        console.error('[Wompi] Estado desconocido:', status);
        
        if (onPaymentCallback && typeof onPaymentCallback === 'function') {
          onPaymentCallback({
            success: false,
            status: 'ERROR',
            message: 'Estado de pago desconocido'
          });
        }
        break;
    }
  }

  /**
   * Muestra mensaje de estado del pago
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de mensaje ('info', 'success', 'error')
   */
  function showPaymentMessage(message, type = 'info') {
    const container = document.getElementById('wompi-button-container');
    if (!container) return;

    const colors = {
      info: '#1976d2',
      success: '#2e7d32',
      error: '#d32f2f'
    };

    container.innerHTML = `
      <div class="wompi-message" style="padding: 16px; text-align: center; color: ${colors[type]}; background: #f5f5f5; border-radius: 4px;">
        ${message}
      </div>
    `;
  }

  /**
   * Obtiene el estado actual del pago
   * @returns {string} Estado del pago
   */
  function getPaymentState() {
    return currentPaymentState;
  }

  /**
   * Verifica si Wompi está disponible y configurado
   * @returns {Object} Estado de disponibilidad
   */
  function checkAvailability() {
    const configValidation = validateConfig();
    
    return {
      available: configValidation.isValid && wompiWidgetsLoaded,
      scriptLoaded: wompiWidgetsLoaded,
      configValid: configValidation.isValid,
      environment: WOMPI_ENVIRONMENT,
      errors: configValidation.errors
    };
  }

  /**
   * Procesa un pedido completo con pago
   * @param {Object} orderData - Datos del pedido
   * @param {Object} orderState - Estado actual del carrito
   */
  async function processOrderWithPayment(orderData, orderState) {
    // Calcular total
    const subtotal = orderData.subtotal;
    const delivery = orderData.deliveryCost || 0;
    const total = subtotal + delivery;

    // Generar referencia
    const reference = generateReference();

    // Guardar opciones para reintentar
    const paymentOptions = {
      amount: total,
      reference,
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone || '',
      redirectUrl: window.location.origin + '/pedidos/gracias.html?ref=' + reference,
      containerId: 'wompi-payment-container',
      onPaymentComplete: (result) => {
        if (result.success) {
          console.log('[Wompi] Pago completado exitosamente:', result);
          // Aquí se puede enviar confirmación por email, etc.
        }
      }
    };

    // Guardar últimas opciones
    window.MisajoWompi.lastOptions = paymentOptions;

    // Iniciar pago
    return await initPaymentButton(paymentOptions);
  }

  /**
   * Exportar API pública
   */
  window.MisajoWompi = {
    initPaymentButton,
    processOrderWithPayment,
    getPaymentState,
    checkAvailability,
    loadWompiScript,
    generateReference,
    PAYMENT_STATUS,
    lastOptions: null
  };

  // Auto-verificar configuración al cargar
  console.log('[Wompi] Módulo cargado. Environment:', WOMPI_ENVIRONMENT);
  if (!WOMPI_PUBLIC_KEY) {
    console.warn('[Wompi] ⚠️ WOMPI_PUBLIC_KEY no configurada. El botón de pago no funcionará.');
    console.warn('[Wompi] Configura window.MISAJO_CONFIG.WOMPI_PUBLIC_KEY antes de inicializar.');
  }

})();
