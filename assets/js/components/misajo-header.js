class MisajoHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const path = window.location.pathname;
        const isSubPage = path.includes('/productos/') || path.includes('/blog/') || path.includes('/combos/');
        const rootPath = isSubPage ? '../' : './';

        const homeHref = isSubPage ? `${rootPath}index.html` : 'index.html';
        const catalogoHref = `${rootPath}catalogo.html#productos`;
        // const combosHref = `${rootPath}catalogo.html#combos`; // Removed specific combos link
        const nosotrosHref = isSubPage ? `${rootPath}index.html#nosotros` : '#nosotros';
        const contactoHref = isSubPage ? `${rootPath}index.html#contacto` : '#contacto';

        this.innerHTML = `
            <header id="header">
                <nav>
                    <div class="logo-container">
                        <a href="${homeHref}" class="logo-link">
                            <img src="${rootPath}assets/images/logo.webp" alt="Misajo Cookies" class="logo-img">
                        </a>
                    </div>
                    
                    <!-- Desktop Navigation -->
                    <ul class="nav-links desktop-nav">
                        <li><a href="${homeHref}">Inicio</a></li>
                        <li><a href="${catalogoHref}">Catálogo</a></li>
                        <li><a href="${nosotrosHref}">Nosotros</a></li>
                        <li><a href="${contactoHref}">Contacto</a></li>
                    </ul>

                    <!-- Mobile Menu Button -->
                    <button class="mobile-menu-btn" aria-label="Abrir menú">
                        <div class="hamburger-box">
                            <span class="hamburger-inner"></span>
                        </div>
                    </button>
                </nav>
            </header>

            <!-- Mobile Overlay Menu -->
            <div class="mobile-menu-overlay">
                <div class="mobile-menu-container">
                    <ul class="mobile-nav-links">
                        <li style="--i:1"><a href="${homeHref}">Inicio</a></li>
                        <li style="--i:2"><a href="${catalogoHref}">Catálogo</a></li>
                        <li style="--i:3"><a href="${nosotrosHref}">Nosotros</a></li>
                        <li style="--i:4"><a href="${contactoHref}">Contacto</a></li>
                    </ul>
                    <div class="mobile-socials" style="--i:5">
                        <a href="https://instagram.com/misajocookie" target="_blank">Instagram</a>
                        <a href="https://wa.me/573159038449" target="_blank">WhatsApp</a>
                    </div>
                </div>
            </div>
        `;

        // Logic
        const mobileBtn = this.querySelector('.mobile-menu-btn');
        const overlay = this.querySelector('.mobile-menu-overlay');
        const body = document.body;
        const mobileLinks = this.querySelectorAll('.mobile-nav-links a');

        function toggleMenu() {
            mobileBtn.classList.toggle('active');
            overlay.classList.toggle('active');
            body.classList.toggle('menu-open');
        }

        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close when clicking a link
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu();
            });
        });

        // Close when clicking outside content (backdrop)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                toggleMenu();
            }
        });

        // Highlight active link
        const currentFilename = path.split('/').pop() || 'index.html';
        const allLinks = this.querySelectorAll('a');

        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            let isActive = false;

            // Logic updated for catalog
            if (href.includes('catalogo.html') && path.includes('catalogo.html')) isActive = true;
            else if ((href === currentFilename) || (currentFilename === '' && href === 'index.html')) isActive = true;
            // Removed specific checks for /productos/ as they are now consolidated, 
            // but if user lands on subpage, catalog link should probably not be active unless we want it to.
            // Leaving simple check for now.

            if (isActive) link.classList.add('active');
        });

        // Scroll Effect
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const header = this.querySelector('header');
                    if (header) {
                        header.classList.toggle('scrolled', window.scrollY > 50);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}

customElements.define('misajo-header', MisajoHeader);
