/**
 * ProductCardRenderer - Componente de Renderizado de Tarjetas
 * 
 * Componente UI para renderizar tarjetas de producto reutilizables.
 */

export class ProductCardRenderer {
    /**
     * @param {string} basePath - Ruta base para imágenes y enlaces
     */
    constructor(basePath = '/') {
        this.basePath = basePath;
    }

    /**
     * Renderiza una tarjeta de producto
     * @param {Object} product - Datos del producto
     * @param {string} action - Tipo de acción (order|detail)
     * @param {string} heading - Nivel de encabezado
     * @returns {string} HTML de la tarjeta
     */
    render(product, action = 'order', heading = 'h3') {
        const imgBlock = this.renderImageBlock(product.images);
        const button = this.renderButton(product, action);
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
                        ${button}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza el bloque de imagen(s)
     * @param {Array<Object>} images - Lista de imágenes
     * @returns {string} HTML del bloque de imagen
     */
    renderImageBlock(images) {
        if (!images || images.length === 0) {
            return '<div class="product-image-placeholder">Sin imagen</div>';
        }

        if (images.length > 1) {
            return this.renderSlider(images);
        }

        return this.renderSingleImage(images[0]);
    }

    /**
     * Renderiza una imagen individual
     * @param {Object} img - Datos de la imagen
     * @returns {string} HTML de la imagen
     */
    renderSingleImage(img) {
        const src = this.resolvePath(img.src);
        return `
            <img src="${src}" alt="${img.alt}" 
                 class="product-image" 
                 width="${img.width}" 
                 height="${img.height}" 
                 loading="lazy">
        `;
    }

    /**
     * Renderiza un slider de imágenes
     * @param {Array<Object>} images - Lista de imágenes
     * @returns {string} HTML del slider
     */
    renderSlider(images) {
        const slides = images.map((img, i) => `
            <div class="slide${i === 0 ? ' active' : ''}">
                <img class="slide-image" src="${this.resolvePath(img.src)}" 
                     alt="${img.alt}" width="${img.width}" height="${img.height}" 
                     loading="lazy">
                <div class="overlay"></div>
            </div>
        `).join('');

        return `
            <div class="slider-container">
                ${slides}
                <button class="nav-btn prev" aria-label="Anterior">
                    <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button class="nav-btn next" aria-label="Siguiente">
                    <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                </button>
                <div class="dots-container"></div>
            </div>
        `;
    }

    /**
     * Renderiza el botón de acción
     * @param {Object} product - Datos del producto
     * @param {string} action - Tipo de acción
     * @returns {string} HTML del botón
     */
    renderButton(product, action) {
        if (action === 'detail' && product.url) {
            const url = this.resolvePath(product.url);
            return `<a href="${url}" class="btn btn-primary btn-small">Ver Detalles</a>`;
        }

        if (product.whatsappUrl) {
            return `<a href="${product.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-small">Pedir Ahora</a>`;
        }

        return '';
    }

    /**
     * Resuelve una ruta relativa a absoluta
     * @param {string} path - Ruta a resolver
     * @returns {string} Ruta resuelta
     */
    resolvePath(path) {
        if (!path || path.startsWith('http') || path.startsWith('/')) {
            return path;
        }
        return this.basePath.replace(/\/$/, '') + '/' + path;
    }
}
