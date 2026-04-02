/**
 * DeliveryController - Controlador de Domicilios
 * 
 * Maneja las operaciones de presentación relacionadas con domicilios.
 * Coordina entre la UI y los casos de uso.
 */

export class DeliveryController {
    /**
     * @param {DeliveryUseCase} deliveryUseCase - Caso de uso de domicilios
     */
    constructor(deliveryUseCase) {
        this.deliveryUseCase = deliveryUseCase;
    }

    /**
     * Inicializa el controlador y carga los barrios en el select
     */
    async initialize() {
        await this.populateNeighborhoodSelect();
        this.attachEventListeners();
    }

    /**
     * Carga los barrios en el elemento select del DOM
     */
    async populateNeighborhoodSelect() {
        const select = document.getElementById('neighborhood-select');
        if (!select) return;

        try {
            const neighborhoods = await this.deliveryUseCase.getAllNeighborhoods();
            
            select.innerHTML = '<option value="">Selecciona tu barrio...</option>' +
                neighborhoods.map(n => `
                    <option value="${n.name}" data-distance="${n.distanceKm}">
                        ${n.name}${n.distanceKm === 0 ? ' (Domicilio gratis)' : ''}
                        ${n.distanceKm < 0 ? ' (A coordinar)' : ''}
                    </option>
                `).join('');
        } catch (error) {
            console.error('Error loading neighborhoods:', error);
            select.innerHTML = '<option value="">Error cargando barrios</option>';
        }
    }

    /**
     * Adjunta event listeners para interacciones del usuario
     */
    attachEventListeners() {
        // Búsqueda de barrios
        const searchInput = document.getElementById('neighborhood-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Campo de dirección
        const addressInput = document.getElementById('delivery-address');
        if (addressInput) {
            addressInput.addEventListener('blur', () => {
                this.handleAddressChange();
            });
        }
    }

    /**
     * Maneja la búsqueda de barrios
     * @param {string} searchTerm - Término de búsqueda
     */
    async handleSearch(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            this.clearSearchHighlight();
            return;
        }

        const neighborhood = await this.deliveryUseCase.searchNeighborhood(searchTerm);
        
        if (neighborhood) {
            const select = document.getElementById('neighborhood-select');
            if (select) {
                select.value = neighborhood.name;
                select.dispatchEvent(new Event('change'));
            }
            this.highlightSearchResult(neighborhood);
        } else {
            this.showNoResultsMessage();
        }
    }

    /**
     * Maneja el cambio de dirección
     */
    handleAddressChange() {
        // Trigger recalculation of delivery if needed
        const neighborhoodSelect = document.getElementById('neighborhood-select');
        if (neighborhoodSelect && neighborhoodSelect.value) {
            neighborhoodSelect.dispatchEvent(new Event('change'));
        }
    }

    /**
     * Resalta el resultado de búsqueda en el select
     * @param {Object} neighborhood - Barrio encontrado
     */
    highlightSearchResult(neighborhood) {
        const options = document.querySelectorAll('#neighborhood-select option');
        options.forEach(opt => {
            if (opt.value === neighborhood.name) {
                opt.style.fontWeight = 'bold';
                opt.style.backgroundColor = '#fff3cd';
            } else {
                opt.style.fontWeight = 'normal';
                opt.style.backgroundColor = '';
            }
        });
    }

    /**
     * Limpia el resaltado de búsqueda
     */
    clearSearchHighlight() {
        const options = document.querySelectorAll('#neighborhood-select option');
        options.forEach(opt => {
            opt.style.fontWeight = 'normal';
            opt.style.backgroundColor = '';
        });
    }

    /**
     * Muestra mensaje de no hay resultados
     */
    showNoResultsMessage() {
        const messageEl = document.getElementById('neighborhood-search-result');
        if (messageEl) {
            messageEl.textContent = 'Barrio no encontrado. Selecciona "Mi barrio no está aquí" o "Fuera de Cali"';
            messageEl.style.color = '#dc3545';
            setTimeout(() => {
                messageEl.textContent = '';
            }, 3000);
        }
    }

    /**
     * Obtiene información de domicilio formateada
     * @param {string} neighborhoodName - Nombre del barrio
     * @param {number} subtotalCents - Subtotal del pedido
     * @returns {Promise<string>} Información formateada
     */
    async getDeliveryInfo(neighborhoodName, subtotalCents) {
        return await this.deliveryUseCase.getDeliveryMessage(neighborhoodName, subtotalCents);
    }

    /**
     * Verifica si un barrio está dentro del área de cobertura
     * @param {string} neighborhoodName - Nombre del barrio
     * @returns {Promise<boolean>} True si está en cobertura
     */
    async isWithinCoverage(neighborhoodName) {
        return await this.deliveryUseCase.isWithinCoverageArea(neighborhoodName);
    }
}
