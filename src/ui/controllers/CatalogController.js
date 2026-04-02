/**
 * CatalogController - Controlador de Catálogo
 * 
 * Maneja las operaciones de presentación relacionadas con el catálogo.
 * Coordina entre la UI y los casos de uso.
 */

import { CatalogOutputPort } from '../../application/ports/CatalogOutputPort.js';

export class CatalogController {
    /**
     * @param {CatalogUseCase} catalogUseCase - Caso de uso de catálogo
     * @param {HTMLElement} containerElement - Elemento contenedor en el DOM
     */
    constructor(catalogUseCase, containerElement) {
        this.catalogUseCase = catalogUseCase;
        this.containerElement = containerElement;
        this.outputPort = new CatalogOutputPort();
        this.basePath = this.calculateBasePath();
    }

    /**
     * Calcula la ruta base desde la ubicación del script
     * @returns {string} Ruta base
     */
    calculateBasePath() {
        const script = document.currentScript;
        if (!script) return '/';
        
        const src = script.src;
        const match = src.match(/assets\/js\/.*$/);
        if (match) {
            return src.substring(0, match.index);
        }
        return '/';
    }

    /**
     * Renderiza el catálogo basado en atributos data-* del contenedor
     */
    async render() {
        if (!this.containerElement) return;

        const type = this.containerElement.dataset.catalog || 'products';
        const action = this.containerElement.dataset.action || 'order';
        const heading = this.containerElement.dataset.heading || 'h3';
        const idsAttr = this.containerElement.dataset.ids;
        const limitAttr = this.containerElement.dataset.limit;

        let items = [];
        
        if (type === 'combos') {
            items = idsAttr 
                ? await this.catalogUseCase.getCombosByIds(idsAttr.split(','))
                : await this.catalogUseCase.getAllCombos();
            
            if (limitAttr) {
                items = items.slice(0, parseInt(limitAttr, 10));
            }
            
            this.renderCombos(items, heading);
        } else {
            items = idsAttr 
                ? await this.catalogUseCase.getProductsByIds(idsAttr.split(','))
                : await this.catalogUseCase.getAllProducts();
            
            if (limitAttr) {
                items = items.slice(0, parseInt(limitAttr, 10));
            }
            
            this.renderProducts(items, action, heading);
        }
    }

    /**
     * Renderiza una lista de productos
     * @param {Array<Product>} products - Lista de productos
     * @param {string} action - Tipo de acción (order|detail)
     * @param {string} heading - Nivel de encabezado (h2|h3|h4)
     */
    renderProducts(products, action, heading) {
        const html = products.map(product => {
            const uiData = this.outputPort.formatProductForUI(product, this.basePath);
            return this.buildProductCardHTML(uiData, action, heading);
        }).join('');
        
        this.containerElement.innerHTML = html;
    }

    /**
     * Renderiza una lista de combos
     * @param {Array<Combo>} combos - Lista de combos
     * @param {string} heading - Nivel de encabezado (h2|h3|h4)
     */
    renderCombos(combos, heading) {
        const html = combos.map(combo => {
            const uiData = this.outputPort.formatComboForUI(combo, this.basePath);
            return this.buildComboCardHTML(uiData, heading);
        }).join('');
        
        this.containerElement.innerHTML = html;
    }

    /**
     * Construye el HTML para una tarjeta de producto
     * @param {Object} product - Datos del producto formateados para UI
     * @param {string} action - Tipo de acción
     * @param {string} heading - Nivel de encabezado
     * @returns {string} HTML de la tarjeta
     */
    buildProductCardHTML(product, action, heading) {
        const imgBlock = product.hasMultipleImages
            ? this.buildSliderHTML(product.images)
            : this.buildImageHTML(product.images[0]);

        const btn = action === 'detail'
            ? `<a href="${product.url}" class="btn btn-primary btn-small">Ver Detalles</a>`
            : `<a href="${product.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-small">Pedir Ahora</a>`;

        const priceDetail = product.presentation
            ? `<div class="price-detail">${product.presentation}</div>`
            : '';

        return `
            <div class="product-card">
                ${imgBlock}
                <div class="product-info">
                    <${heading} class="product-name">${product.name}</${heading}>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">
                        <div>
                            <div class="price-tag">${product.price}</div>
                            ${priceDetail}
                        </div>
                        ${btn}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Construye el HTML para una tarjeta de combo
     * @param {Object} combo - Datos del combo formateados para UI
     * @param {string} heading - Nivel de encabezado
     * @returns {string} HTML de la tarjeta
     */
    buildComboCardHTML(combo, heading) {
        const imgBlock = combo.hasMultipleImages
            ? this.buildSliderHTML(combo.images)
            : this.buildImageHTML(combo.images[0]);

        return `
            <div class="product-card combo-card" id="${combo.id}">
                ${imgBlock}
                <div class="product-info">
                    <${heading} class="product-name">${combo.name}</${heading}>
                    <p class="product-description">${combo.description}</p>
                    <div class="product-price">
                        <div class="price-tag">${combo.price}</div>
                        <a href="${combo.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-small">Pedir Ahora</a>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Construye el HTML para un slider de imágenes
     * @param {Array<Object>} images - Lista de imágenes
     * @returns {string} HTML del slider
     */
    buildSliderHTML(images) {
        const SVG_PREV = '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>';
        const SVG_NEXT = '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>';

        const slides = images.map((img, i) => `
            <div class="slide${i === 0 ? ' active' : ''}">
                <img class="slide-image" src="${img.src}" alt="${img.alt}" 
                     width="${img.width}" height="${img.height}" loading="lazy">
                <div class="overlay"></div>
            </div>
        `).join('');

        return `
            <div class="slider-container">
                ${slides}
                <button class="nav-btn prev" aria-label="Anterior">${SVG_PREV}</button>
                <button class="nav-btn next" aria-label="Siguiente">${SVG_NEXT}</button>
                <div class="dots-container"></div>
            </div>
        `;
    }

    /**
     * Construye el HTML para una imagen individual
     * @param {Object} img - Datos de la imagen
     * @returns {string} HTML de la imagen
     */
    buildImageHTML(img) {
        return `
            <img src="${img.src}" alt="${img.alt}" 
                 class="product-image" width="${img.width}" height="${img.height}" 
                 loading="lazy">
        `;
    }
}
