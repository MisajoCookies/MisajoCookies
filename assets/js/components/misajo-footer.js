class MisajoFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const currentYear = new Date().getFullYear();
        this.innerHTML = `
            <footer itemscope itemtype="https://schema.org/WPFooter">
                <nav aria-label="Navegación del pie de página" style="margin-bottom: 1rem; font-size: 0.9rem;">
                    <a href="/" style="color: inherit; margin: 0 0.5rem;">Inicio</a> |
                    <a href="/catalogo.html" style="color: inherit; margin: 0 0.5rem;">Catálogo</a> |
                    <a href="/galletas-artesanales-cali.html" style="color: inherit; margin: 0 0.5rem;">Galletas Artesanales en Cali</a> |
                    <a href="/domicilios-cali.html" style="color: inherit; margin: 0 0.5rem;">Domicilios</a> |
                    <a href="/contacto.html" style="color: inherit; margin: 0 0.5rem;">Contacto</a> |
                    <a href="/nosotros.html" style="color: inherit; margin: 0 0.5rem;">Nosotros</a>
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
