/* ========================================
   MISAJ COOKIE - JAVASCRIPT PRINCIPAL
   ======================================== */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {

    // ========================================
    // HEADER SCROLL EFFECT
    // ========================================
    const header = document.getElementById('header');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ========================================
    // SMOOTH SCROLL PARA NAVEGACIÓN
    // ========================================
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ========================================
    // ANIMATION ON SCROLL (OBSERVER)
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const scrollObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Aplicar animaciones a las tarjetas de productos y combos
    const animatedElements = document.querySelectorAll('.product-card');
    animatedElements.forEach(el => scrollObserver.observe(el));

    // ========================================
    // LAZY LOADING DE IMÁGENES
    // ========================================
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // ========================================
    // FUNCIONES AUXILIARES
    // ========================================

    /**
     * Función para abrir WhatsApp con mensaje predeterminado
     * @param {string} mensaje - El mensaje a enviar
     */
    function abrirWhatsApp(mensaje) {
        const telefono = '573044866497';
        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    /**
     * Función para tracking de eventos (útil para analytics)
     * @param {string} categoria - Categoría del evento
     * @param {string} accion - Acción realizada
     * @param {string} etiqueta - Etiqueta adicional
     */
    function trackEvent(categoria, accion, etiqueta) {
        console.log(`Evento: ${categoria} - ${accion} - ${etiqueta}`);
    }

    // ========================================
    // EVENT LISTENERS PARA BOTONES DE CONTACTO
    // ========================================

    // Tracking de clicks en botones de productos
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function () {
            const productName = this.querySelector('.product-name').textContent;
            trackEvent('Producto', 'Click', productName);
        });
    });

    // Tracking de clicks en combos
    const comboButtons = document.querySelectorAll('.combo-card .btn');
    comboButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const comboName = this.closest('.combo-card').querySelector('.product-name').textContent;
            trackEvent('Combo', 'Click', comboName);
        });
    });

    // Tracking de clicks en redes sociales
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function () {
            const socialNetwork = this.classList.contains('whatsapp') ? 'WhatsApp' :
                this.classList.contains('facebook') ? 'Facebook' : 'Instagram';
            trackEvent('Red Social', 'Click', socialNetwork);
        });
    });

    // ========================================
    // MENSAJES DE CONSOLA
    // ========================================
    console.log('%c¡Bienvenido a Misaj Cookie! 🍪', 'color: #8B5A3C; font-size: 20px; font-weight: bold;');
    console.log('%cSitio web desarrollado con ❤️ para endulzar tus momentos especiales', 'color: #D4A574; font-size: 14px;');

});

// ========================================
// FUNCIÓN PARA MOBILE MENU
// ========================================
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// ========================================
// PREVENCIÓN DE ERRORES EN IMÁGENES
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        img.addEventListener('error', function () {
            this.style.backgroundColor = '#D4A574';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            console.warn('Imagen no encontrada:', this.src);
        });
    });
});

// ========================================
// ROTACIÓN DE IMÁGENES HERO
// ========================================
class HeroImageRotator {
    constructor() {
        this.images = document.querySelectorAll('.hero-images .floating-cookie img');
        if (this.images.length === 0) return;

        // Store initial sources
        this.sourceList = Array.from(this.images).map(img => img.getAttribute('src'));

        // State: Index of image in the sourceList for each DOM element [0, 1, 2]
        this.state = this.sourceList.map((_, i) => i);

        this.interval = 6000; // 6 seconds per rotation
        this.startRotation();
    }

    startRotation() {
        setInterval(() => {
            this.rotateImages();
        }, this.interval);
    }

    rotateImages() {
        // 1. Shift state: last becomes first
        const last = this.state.pop();
        this.state.unshift(last);

        // 2. Apply change with animation
        this.images.forEach((img, index) => {
            // Add class to fade out/scale down
            img.classList.add('img-changing');

            // Wait for transition to complete before swapping src
            setTimeout(() => {
                // Update source based on new state
                const sourceIndex = this.state[index] % this.sourceList.length;
                img.src = this.sourceList[sourceIndex];

                // Remove class to fade in/scale up
                img.classList.remove('img-changing');
            }, 800); // 800ms matches CSS transition duration
        });
    }
}

// Initialize Hero Image Rotator
document.addEventListener('DOMContentLoaded', () => {
    new HeroImageRotator();
});

// ========================================
// SLIDER COMPONENT LOGIC
// ========================================

class ImageSlider {
    constructor(containerElement) {
        this.container = containerElement;
        this.slides = this.container.querySelectorAll('.slide');
        this.prevBtn = this.container.querySelector('.prev');
        this.nextBtn = this.container.querySelector('.next');
        this.dotsContainer = this.container.querySelector('.dots-container');

        this.currentIndex = 0;
        this.intervalTime = 4000; // 4 seconds
        this.slideInterval = null;

        if (this.slides.length > 1) {
            this.init();
        } else if (this.slides.length === 1) {
            // Single slide: Show it but hide controls
            this.slides[0].classList.add('active');
            if (this.prevBtn) this.prevBtn.style.display = 'none';
            if (this.nextBtn) this.nextBtn.style.display = 'none';
            if (this.dotsContainer) this.dotsContainer.style.display = 'none';
        }
    }

    init() {
        // Create dots
        if (this.dotsContainer) {
            this.dotsContainer.innerHTML = ''; // Clear existing
            this.slides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => this.goToSlide(index));
                this.dotsContainer.appendChild(dot);
            });
            this.dots = this.dotsContainer.querySelectorAll('.dot');
        }

        // Event listeners
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextSlide();
                this.resetTimer();
            });
        }

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.prevSlide();
                this.resetTimer();
            });
        }

        // Pause on hover
        this.container.addEventListener('mouseenter', () => {
            if (this.slideInterval) clearInterval(this.slideInterval);
        });
        this.container.addEventListener('mouseleave', () => {
            if (this.slides.length > 1) this.startTimer();
        });

        // Start auto-play
        this.startTimer();
    }

    updateSlider() {
        this.slides.forEach((slide, index) => {
            if (index === this.currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        if (this.dots) {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });
        }
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateSlider();
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateSlider();
    }

    goToSlide(index) {
        if (this.currentIndex === index) return;
        this.currentIndex = index;
        this.updateSlider();
        this.resetTimer();
    }

    resetTimer() {
        this.startTimer();
    }

    startTimer() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
        this.slideInterval = setInterval(() => this.nextSlide(), this.intervalTime);
    }
}

// Initialize all sliders
document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.slider-container');
    sliders.forEach(sliderContainer => {
        new ImageSlider(sliderContainer);
    });
});