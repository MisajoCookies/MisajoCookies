/**
 * MisajoCookies — Cart Persistence Module
 * Persistencia del carrito de compras en localStorage
 * Evita pérdida de datos al recargar la página
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'misajo_order_state';
  const STORAGE_VERSION = '1.0';

  /**
   * Guarda el estado del pedido en localStorage
   * @param {Object} orderState - Estado actual del pedido
   */
  function persistOrder(orderState) {
    try {
      const dataToSave = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        state: sanitizeForStorage(orderState)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('[CartPersistence] Pedido guardado:', new Date().toISOString());
    } catch (error) {
      console.warn('[CartPersistence] Error al guardar:', error);
      // localStorage puede estar lleno o deshabilitado
      if (error.name === 'QuotaExceededError') {
        console.warn('[CartPersistence] localStorage lleno, limpiando entrada antigua...');
        localStorage.removeItem(STORAGE_KEY);
        try {
          persistOrder(orderState); // Reintentar una vez
        } catch (e) {
          console.error('[CartPersistence] No se pudo guardar después de limpiar');
        }
      }
    }
  }

  /**
   * Sanitiza el estado para almacenamiento (elimina datos no serializables)
   * @param {Object} state - Estado del pedido
   * @returns {Object} Estado sanitizado
   */
  function sanitizeForStorage(state) {
    return {
      cookiePackages: state.cookiePackages || [],
      premiumProducts: state.premiumProducts.map(p => ({
        id: p.id,
        name: p.name,
        qty: p.qty,
        unitPrice: p.unitPrice,
        dipFlavor: p.dipFlavor || 'arequipe'
      })),
      combos: state.combos || [],
      extras: { ...state.extras },
      freePackageId: state.freePackageId || null,
      delivery: {
        neighborhood: state.delivery?.neighborhood || '',
        address: state.delivery?.address || '',
        distanceKm: state.delivery?.distanceKm || null,
        isOutsideCali: state.delivery?.isOutsideCali || false,
        isToCoordinate: state.delivery?.isToCoordinate || false
      },
      notes: state.notes || ''
    };
  }

  /**
   * Recupera el estado del pedido desde localStorage
   * @returns {Object|null} Estado recuperado o null si no existe
   */
  function restoreOrder() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('[CartPersistence] No hay pedido guardado');
        return null;
      }

      const data = JSON.parse(stored);
      
      // Validar versión
      if (!data.version || data.version !== STORAGE_VERSION) {
        console.warn('[CartPersistence] Versión incompatible, descartando datos antiguos');
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Validar que no sea muy antiguo (opcional: 7 días)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días en ms
      const age = Date.now() - data.timestamp;
      if (age > maxAge) {
        console.warn('[CartPersistence] Pedido muy antiguo (>7 días), descartando');
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      console.log('[CartPersistence] Pedido restaurado exitosamente');
      return data.state;
    } catch (error) {
      console.warn('[CartPersistence] Error al restaurar:', error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  /**
   * Limpia el estado guardado en localStorage
   */
  function clearOrder() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[CartPersistence] Pedido eliminado');
    } catch (error) {
      console.warn('[CartPersistence] Error al eliminar:', error);
    }
  }

  /**
   * Verifica si hay un pedido guardado
   * @returns {boolean} True si existe un pedido guardado
   */
  function hasStoredOrder() {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene información sobre el pedido guardado
   * @returns {Object|null} Información del pedido o null
   */
  function getStoredOrderInfo() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);
      const state = data.state;
      
      // Calcular total aproximado
      let itemCount = 0;
      state.cookiePackages.forEach(p => itemCount += p.qty);
      state.premiumProducts.forEach(p => itemCount += p.qty);
      state.combos.forEach(c => itemCount += c.qty);
      Object.values(state.extras).forEach(qty => {
        if (typeof qty === 'number' && qty > 0) itemCount += qty;
        if (qty === true) itemCount += 1; // caja
      });

      return {
        timestamp: new Date(data.timestamp),
        itemCount,
        hasDelivery: !!state.delivery?.address,
        age: Date.now() - data.timestamp
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Restaura el estado en la UI
   * @param {Object} orderState - Estado del pedido a restaurar
   * @param {Function} renderCallback - Callback para re-renderizar la UI
   */
  function restoreOrderToUI(orderState, renderCallback) {
    if (!orderState) return;

    // Restaurar cantidades en los displays
    requestAnimationFrame(() => {
      // Packages
      orderState.cookiePackages.forEach(p => {
        if (p.qty > 0) {
          const display = document.getElementById(`qty-${p.id}`);
          if (display) display.textContent = p.qty;
        }
      });

      // Premium
      orderState.premiumProducts.forEach(p => {
        if (p.qty > 0) {
          const display = document.getElementById(`qty-${p.id}`);
          if (display) display.textContent = p.qty;
        }
        // Restaurar selección de dip
        if (p.dipFlavor) {
          const select = document.getElementById(`dip-${p.id}`);
          if (select) select.value = p.dipFlavor;
        }
      });

      // Combos
      orderState.combos.forEach(c => {
        if (c.qty > 0) {
          const display = document.getElementById(`qty-${c.id}`);
          if (display) display.textContent = c.qty;
        }
      });

      // Extras
      Object.entries(orderState.extras).forEach(([key, value]) => {
        if (typeof value === 'number' && value > 0) {
          const display = document.getElementById(`qty-extra-${key}`);
          if (display) display.textContent = value;
        }
        if (key === 'caja' && value === true) {
          const checkbox = document.getElementById('caja-check');
          if (checkbox) checkbox.checked = true;
        }
      });

      // Producto gratis
      if (orderState.freePackageId) {
        const radio = document.querySelector(`input[name="free-package"][value="${orderState.freePackageId}"]`);
        if (radio) radio.checked = true;
      }

      // Dirección y barrio
      if (orderState.delivery.neighborhood) {
        const select = document.getElementById('barrio-select');
        if (select) {
          const option = Array.from(select.options).find(
            opt => opt.dataset.name === orderState.delivery.neighborhood
          );
          if (option) {
            select.value = option.value;
            select.dispatchEvent(new Event('change'));
          }
        }
      }

      if (orderState.delivery.address) {
        const input = document.getElementById('address-input');
        if (input) input.value = orderState.delivery.address;
      }

      if (orderState.notes) {
        const textarea = document.getElementById('notes-input');
        if (textarea) textarea.value = orderState.notes;
      }

      // Re-renderizar resumen
      if (renderCallback && typeof renderCallback === 'function') {
        renderCallback();
      }

      // Mostrar notificación de recuperación
      showRestoreNotification(orderState);
    });
  }

  /**
   * Muestra notificación de que se restauró un pedido
   * @param {Object} orderState - Estado restaurado
   */
  function showRestoreNotification(orderState) {
    // Contar items
    let count = 0;
    orderState.cookiePackages.forEach(p => count += p.qty);
    orderState.premiumProducts.forEach(p => count += p.qty);
    orderState.combos.forEach(c => count += c.qty);
    Object.values(orderState.extras).forEach(qty => {
      if (typeof qty === 'number' && qty > 0) count += qty;
      if (qty === true) count += 1;
    });

    if (count === 0) return;

    // Crear notificación toast
    const toast = document.createElement('div');
    toast.className = 'cart-restore-toast';
    toast.innerHTML = `
      <span>🛒 Carrito restaurado: ${count} ítem${count > 1 ? 's' : ''}</span>
      <button class="toast-dismiss" aria-label="Cerrar">×</button>
    `;
    
    // Estilos inline para el toast
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #2d5016;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideUp 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // Auto-dismiss después de 5 segundos
    const timeout = setTimeout(() => dismissToast(toast), 5000);

    // Click en X para dismiss
    toast.querySelector('.toast-dismiss').addEventListener('click', () => {
      clearTimeout(timeout);
      dismissToast(toast);
    });
  }

  /**
   * Elimina la notificación toast
   * @param {HTMLElement} toast - Elemento toast
   */
  function dismissToast(toast) {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }

  /**
   * Inicializa el módulo de persistencia
   * @param {Object} orderState - Referencia al estado del pedido
   * @param {Function} renderCallback - Callback para re-renderizar
   * @returns {Object} API pública
   */
  function init(orderState, renderCallback) {
    // Intentar restaurar al inicializar
    const savedState = restoreOrder();
    if (savedState) {
      // Fusionar con el estado actual
      Object.assign(orderState, savedState);
      restoreOrderToUI(savedState, renderCallback);
    }

    // Guardar automáticamente antes de cerrar la pestaña
    window.addEventListener('beforeunload', () => {
      persistOrder(orderState);
    });

    // Guardar periódicamente cada 30 segundos
    setInterval(() => {
      persistOrder(orderState);
    }, 30000);

    return {
      persist: () => persistOrder(orderState),
      restore: () => restoreOrder(),
      clear: clearOrder,
      hasStored: hasStoredOrder,
      getInfo: getStoredOrderInfo
    };
  }

  /**
   * Exportar API pública
   */
  window.MisajoCartPersistence = {
    init,
    persistOrder,
    restoreOrder,
    clearOrder,
    hasStoredOrder,
    getStoredOrderInfo
  };

})();
