/**
 * OrderController - Controlador de Pedidos
 * 
 * Maneja las operaciones de presentación relacionadas con pedidos.
 * Coordina entre la UI y los casos de uso.
 */

import { PricingService } from '../../domain/services/PricingService.js';
import { PromotionService } from '../../domain/services/PromotionService.js';

export class OrderController {
    /**
     * @param {OrderUseCase} orderUseCase - Caso de uso de pedidos
     */
    constructor(orderUseCase) {
        this.orderUseCase = orderUseCase;
        this.currentOrder = orderUseCase.createEmptyOrder();
        this.promotionService = new PromotionService();
    }

    /**
     * Inicializa el controlador y configura listeners
     */
    initialize() {
        this.attachEventListeners();
        this.renderSummary();
    }

    /**
     * Adjunta los event listeners para interacciones del usuario
     */
    attachEventListeners() {
        // Listeners para botones de cantidad
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="inc"]')) {
                this.handleIncrement(e.target);
            } else if (e.target.matches('[data-action="dec"]')) {
                this.handleDecrement(e.target);
            } else if (e.target.matches('.cart-remove')) {
                this.handleRemove(e.target);
            }
        });

        // Listener para selección de barrio
        const neighborhoodSelect = document.getElementById('neighborhood-select');
        if (neighborhoodSelect) {
            neighborhoodSelect.addEventListener('change', (e) => {
                this.handleNeighborhoodChange(e.target.value);
            });
        }

        // Listener para notas del pedido
        const notesTextarea = document.getElementById('order-notes');
        if (notesTextarea) {
            notesTextarea.addEventListener('input', (e) => {
                this.currentOrder.notes = e.target.value;
            });
        }
    }

    /**
     * Maneja el incremento de cantidad
     * @param {HTMLElement} button - Botón clickeado
     */
    async handleIncrement(button) {
        const id = button.dataset.id;
        const type = button.dataset.type;

        if (type === 'package') {
            await this.orderUseCase.addProductToOrder(this.currentOrder, id, 1);
        } else if (type === 'premium') {
            const dipFlavor = document.getElementById(`dip-${id}`)?.value || 'arequipe';
            await this.orderUseCase.addProductToOrder(
                this.currentOrder, id, 1, { type: 'premium', dipFlavor }
            );
        } else if (type === 'combo') {
            await this.orderUseCase.addComboToOrder(this.currentOrder, id, 1);
        } else if (type === 'extra') {
            this.currentOrder.extras[id] = (this.currentOrder.extras[id] || 0) + 1;
        }

        this.updateQuantityDisplay(id, type);
        this.renderSummary();
    }

    /**
     * Maneja el decremento de cantidad
     * @param {HTMLElement} button - Botón clickeado
     */
    handleDecrement(button) {
        const id = button.dataset.id;
        const type = button.dataset.type;

        if (type === 'extra') {
            this.currentOrder.extras[id] = Math.max(0, (this.currentOrder.extras[id] || 0) - 1);
        } else {
            const item = this.currentOrder.items.find(i => i.id === id && i.type === type);
            if (item) {
                item.decrement();
            }
        }

        this.updateQuantityDisplay(id, type);
        this.renderSummary();
    }

    /**
     * Maneja la remoción de un ítem
     * @param {HTMLElement} button - Botón clickeado
     */
    handleRemove(button) {
        const id = button.dataset.removeId;
        const type = button.dataset.removeType;

        if (type === 'extra-bool') {
            this.currentOrder.extras.caja = false;
        } else {
            this.currentOrder.removeItem(id, type);
        }

        this.updateQuantityDisplay(id, type);
        this.renderSummary();
    }

    /**
     * Maneja el cambio de barrio
     * @param {string} neighborhoodName - Nombre del barrio seleccionado
     */
    async handleNeighborhoodChange(neighborhoodName) {
        const address = document.getElementById('delivery-address')?.value || '';
        await this.orderUseCase.setOrderDelivery(this.currentOrder, neighborhoodName, address);
        this.renderSummary();
    }

    /**
     * Actualiza la visualización de cantidad en el DOM
     * @param {string} id - ID del ítem
     * @param {string} type - Tipo del ítem
     */
    updateQuantityDisplay(id, type) {
        let display;
        if (type === 'extra') {
            display = document.getElementById(`qty-extra-${id}`);
            if (display) {
                display.textContent = this.currentOrder.extras[id] || 0;
            }
        } else {
            display = document.getElementById(`qty-${id}`);
            if (display) {
                const item = this.currentOrder.items.find(i => i.id === id && i.type === type);
                display.textContent = item ? item.quantity : 0;
            }
        }
    }

    /**
     * Renderiza el resumen del pedido
     */
    renderSummary() {
        const summary = this.orderUseCase.calculateOrderSummary(this.currentOrder);
        const promotions = this.orderUseCase.getOrderPromotions(this.currentOrder);

        // Actualizar elementos del DOM
        this.setTextContent('sum-subtotal', summary.subtotal);
        this.setTextContent('sum-delivery', summary.delivery);
        this.setTextContent('sum-total', summary.total);
        
        // Mobile
        this.setTextContent('sum-subtotal-mob', summary.subtotal);
        this.setTextContent('sum-delivery-mob', summary.delivery);
        this.setTextContent('sum-total-mob', summary.total);

        // Progress bar
        this.updateProgressBar(promotions.percentage, promotions.message);

        // Free package section
        const freeSection = document.getElementById('free-package-section');
        if (freeSection) {
            freeSection.hidden = !summary.qualifiesForFreePackage;
        }

        // Render cart items
        this.renderCartItems();
    }

    /**
     * Renderiza los ítems del carrito
     */
    renderCartItems() {
        const uiData = this.orderUseCase.calculateOrderSummary(this.currentOrder);
        const activeItems = this.currentOrder.getActiveItems();
        
        const html = activeItems.map(item => `
            <div class="cart-item">
                <div class="cart-item__top">
                    <span class="cart-item__name">${item.name}</span>
                    <button class="cart-remove" data-remove-id="${item.id}" data-remove-type="${item.type}">×</button>
                </div>
                <div class="cart-item__bottom">
                    <div class="cart-qty">
                        <button class="qty-btn qty-btn--sm" data-action="dec" data-id="${item.id}" data-type="${item.type}">−</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn qty-btn--sm" data-action="inc" data-id="${item.id}" data-type="${item.type}">+</button>
                    </div>
                    <span class="cart-item__total">${PricingService.formatMoney(item.getTotalPrice())}</span>
                </div>
            </div>
        `).join('');

        ['cart-items', 'cart-items-mobile'].forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = html || '<p id="cart-empty">Tu carrito está vacío</p>';
            }
        });

        // Update badge
        const badge = document.getElementById('cart-count-badge');
        if (badge) {
            badge.textContent = activeItems.length > 0 
                ? `${activeItems.length} ítem${activeItems.length > 1 ? 's' : ''}` 
                : '';
            badge.hidden = activeItems.length === 0;
        }
    }

    /**
     * Actualiza la barra de progreso de promociones
     * @param {number} percentage - Porcentaje de progreso
     * @param {string} message - Mensaje de progreso
     */
    updateProgressBar(percentage, message) {
        const bar40 = document.getElementById('progress-40k');
        const bar60 = document.getElementById('progress-60k');
        const msg = document.getElementById('progress-msg');

        if (bar40) bar40.style.width = Math.min(100, percentage) + '%';
        if (bar60) bar60.style.width = Math.min(100, percentage) + '%';
        if (msg) {
            msg.textContent = message;
            msg.className = 'progress-msg' + (percentage >= 100 ? ' achieved' : '');
        }
    }

    /**
     * Establece el contenido de texto de un elemento
     * @param {string} id - ID del elemento
     * @param {string} text - Texto a establecer
     */
    setTextContent(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    /**
     * Genera y abre el mensaje de WhatsApp para el pedido
     */
    sendOrderToWhatsApp() {
        const validation = this.orderUseCase.validateOrder(this.currentOrder);
        
        if (!validation.valid) {
            const errorEl = document.getElementById('form-error');
            if (errorEl) {
                errorEl.textContent = validation.errors.join('. ');
                errorEl.hidden = false;
            }
            return;
        }

        const message = this.orderUseCase.generateWhatsAppMessage(this.currentOrder);
        const phone = '573159038449';
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
    }
}
