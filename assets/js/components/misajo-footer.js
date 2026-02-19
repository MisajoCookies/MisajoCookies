class MisajoFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const currentYear = new Date().getFullYear();
        this.innerHTML = `
            <footer itemscope itemtype="https://schema.org/WPFooter">
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
