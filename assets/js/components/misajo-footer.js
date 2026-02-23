class MisajoFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const currentYear = new Date().getFullYear();
        this.innerHTML = `
            <footer itemscope itemtype="https://schema.org/WPFooter">
                <nav aria-label="Navegación del pie de página" style="margin-bottom: 1rem; font-size: 0.9rem; display: flex; flex-wrap: wrap; justify-content: center; gap: 0.3rem 0.8rem; row-gap: 0.5rem;">
                    <a href="/" style="color: inherit; white-space: nowrap;">Inicio</a>
                    <span style="opacity: 0.4;">|</span>
                    <a href="/catalogo.html" style="color: inherit; white-space: nowrap;">Catálogo</a>
                    <span style="opacity: 0.4;">|</span>
                    <a href="/galletas-artesanales-cali.html" style="color: inherit; white-space: nowrap;">Artesanales</a>
                    <span style="opacity: 0.4;">|</span>
                    <a href="/domicilios-cali.html" style="color: inherit; white-space: nowrap;">Domicilios en Cali</a>
                    <span style="opacity: 0.4;">|</span>
                    <a href="/contacto.html" style="color: inherit; white-space: nowrap;">Contacto</a>
                    <span style="opacity: 0.4;">|</span>
                    <a href="/nosotros.html" style="color: inherit; white-space: nowrap;">Nosotros</a>
                </nav>
                <p>&copy; ${currentYear} <span itemprop="name">MisajoCookies</span>. Todos los derechos reservados. Hecho con ❤️ en <span
                        itemprop="address" itemscope itemtype="https://schema.org/PostalAddress"><span
                            itemprop="addressLocality">Cali</span>, <span itemprop="addressCountry">Colombia</span></span>.</p>
                <p style="margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.7;">
                    <strong>NAP:</strong> MisajoCookies | Cali, Valle del Cauca, Colombia | WhatsApp: +57 315 903 8449
                </p>
            </footer>
        `;
    }
}

customElements.define('misajo-footer', MisajoFooter);
