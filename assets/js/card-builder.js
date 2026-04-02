/**
 * MisajoCookies — Card Builder Module
 * Módulo genérico para construcción de tarjetas de productos
 * Cumple con SRP y DRY - Una sola responsabilidad: renderizar cards
 */

(function() {
  'use strict';

  /**
   * Construye el HTML de una tarjeta de producto genérica
   * @param {Object} options - Configuración de la tarjeta
   * @returns {string} HTML de la tarjeta
   */
  function buildGenericCard(options) {
    const {
      id,
      name,
      price,
      priceLabel = '',
      images = [],
      type = 'default',
      showQtyControls = true,
      extraContent = '',
      premiumBadge = false,
      comboBadge = false
    } = options;

    const cardClass = `pedido-card${premiumBadge ? ' pedido-card--premium' : ''}${comboBadge ? ' pedido-card--combo' : ''}`;
    const imgHTML = buildImageHTML(images);
    const qtyControlsHTML = showQtyControls ? buildQtyControls(id, type, name) : '';

    return `
      ${imgHTML}
      <div class="pedido-card__body">
        <h3 class="pedido-card__name">${name}</h3>
        <p class="pedido-card__price">${price} <small>${priceLabel}</small></p>
        ${extraContent}
      </div>
      ${qtyControlsHTML}
    `;
  }

  /**
   * Construye controles de cantidad (+/-)
   * @param {string} id - ID del producto
   * @param {string} type - Tipo de producto (package, premium, combo)
   * @param {string} name - Nombre del producto para accessibility
   * @returns {string} HTML de los controles
   */
  function buildQtyControls(id, type, name) {
    return `
      <div class="qty-control" role="group" aria-label="Cantidad ${name}">
        <button class="qty-btn" aria-label="Quitar" data-action="dec" data-id="${id}" data-type="${type}">−</button>
        <span class="qty-display" id="qty-${id}">0</span>
        <button class="qty-btn" aria-label="Agregar" data-action="inc" data-id="${id}" data-type="${type}">+</button>
      </div>
    `;
  }

  /**
   * Construye selector de dip para productos premium
   * @param {string} productId - ID del producto
   * @param {Array} dipOptions - Opciones de dip disponibles
   * @returns {string} HTML del selector
   */
  function buildDipSelector(productId, dipOptions) {
    if (!dipOptions || dipOptions.length === 0) return '';

    const formatCOP = (amount) => '$' + amount.toLocaleString('es-CO');
    
    const optionsHTML = dipOptions.map(d => {
      const surchargeText = d.surcharge > 0 
        ? ` (+${formatCOP(d.surcharge)}/ud)` 
        : ' (incluido)';
      return `<option value="${d.value}">${d.label}${surchargeText}</option>`;
    }).join('');

    return `
      <label class="dip-selector-label" for="dip-${productId}">Dip:</label>
      <select class="dip-selector" id="dip-${productId}" data-id="${productId}" aria-label="Sabor del dip incluido">
        ${optionsHTML}
      </select>
    `;
  }

  /**
   * Renderiza una tarjeta de paquete de galletas
   * @param {Object} product - Producto del catálogo
   * @param {number} unitPrice - Precio unitario
   * @param {HTMLElement} container - Contenedor DOM
   */
  function renderPackageCard(product, unitPrice, container) {
    if (!container) return;

    const cardHTML = buildGenericCard({
      id: product.id,
      name: product.name,
      price: product.price,
      priceLabel: '/ paquete',
      images: product.images,
      type: 'package'
    });

    const card = document.createElement('div');
    card.className = 'pedido-card';
    card.innerHTML = cardHTML;
    container.appendChild(card);
  }

  /**
   * Renderiza una tarjeta de producto premium con selector de dip
   * @param {Object} product - Producto del catálogo
   * @param {number} unitPrice - Precio unitario
   * @param {Array} dipOptions - Opciones de dip
   * @param {HTMLElement} container - Contenedor DOM
   * @param {Function} onDipChange - Callback cuando cambia el dip
   */
  function renderPremiumCard(product, unitPrice, dipOptions, container, onDipChange) {
    if (!container) return;

    const dipSelectorHTML = buildDipSelector(product.id, dipOptions);
    
    const cardHTML = buildGenericCard({
      id: product.id,
      name: product.name,
      price: product.price,
      priceLabel: '· incluye dip',
      images: product.images,
      type: 'premium',
      extraContent: dipSelectorHTML,
      premiumBadge: true
    });

    const card = document.createElement('div');
    card.className = 'pedido-card pedido-card--premium';
    card.innerHTML = cardHTML;
    container.appendChild(card);

    // Attach dip change listener
    if (onDipChange && typeof onDipChange === 'function') {
      const select = card.querySelector(`#dip-${product.id}`);
      if (select) {
        select.addEventListener('change', (e) => onDipChange(product.id, e.target.value));
      }
    }
  }

  /**
   * Renderiza una tarjeta de combo
   * @param {Object} combo - Combo del catálogo
   * @param {number} unitPrice - Precio unitario
   * @param {HTMLElement} container - Contenedor DOM
   */
  function renderComboCard(combo, unitPrice, container) {
    if (!container) return;

    const cardHTML = buildGenericCard({
      id: combo.id,
      name: combo.name,
      price: combo.price,
      priceLabel: '',
      images: combo.images,
      type: 'combo',
      comboBadge: true
    });

    const card = document.createElement('div');
    card.className = 'pedido-card pedido-card--combo';
    card.innerHTML = cardHTML;
    container.appendChild(card);
  }

  /**
   * Renderiza opciones de producto gratis
   * @param {Array} products - Productos elegibles
   * @param {HTMLElement} container - Contenedor DOM
   * @param {Function} onSelect - Callback cuando se selecciona un producto
   */
  function renderFreePackageOptions(products, container, onSelect) {
    if (!container) return;

    products.forEach(product => {
      const label = document.createElement('label');
      label.className = 'free-option';
      label.innerHTML = `<input type="radio" name="free-package" value="${product.id}"><span>${product.name}</span>`;
      
      const input = label.querySelector('input');
      if (onSelect && typeof onSelect === 'function') {
        input.addEventListener('change', () => onSelect(product.id));
      }
      
      container.appendChild(label);
    });
  }

  /**
   * Exportar funciones públicas
   */
  window.MisajoCardBuilder = {
    buildGenericCard,
    buildQtyControls,
    buildDipSelector,
    renderPackageCard,
    renderPremiumCard,
    renderComboCard,
    renderFreePackageOptions
  };

})();
