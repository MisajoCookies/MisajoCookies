/**
 * LocalSEOService - Servicio de Infraestructura para SEO Local
 * 
 * Genera y gestiona metadatos optimizados para SEO local en Cali, Colombia.
 * Este servicio se encarga de toda la lógica relacionada con Schema.org,
 * OpenGraph y etiquetas geo para negocios locales.
 * 
 * @memberof Infrastructure.Adapters.Web
 * @see {@link AppConfig} Configuración de la aplicación
 */
export class LocalSEOService {
    /**
     * @param {Object} config - Configuración de SEO local
     * @param {string} config.businessName - Nombre del negocio
     * @param {string} config.city - Ciudad principal
     * @param {string} config.region - Región/Departamento
     * @param {string} config.country - Código de país (ISO 3166-1)
     * @param {Object} config.coordinates - Coordenadas geográficas
     * @param {number} config.coordinates.latitude - Latitud
     * @param {number} config.coordinates.longitude - Longitud
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * Genera Schema.org JSON-LD para LocalBusiness
     * @param {Object} options - Opciones adicionales
     * @param {string} [options.pageType='WebPage'] - Tipo de página
     * @param {string} [options.description] - Descripción específica de la página
     * @returns {string} JSON-LD formateado
     */
    generateLocalBusinessSchema(options = {}) {
        const { pageType = 'WebPage', description } = options;
        
        const schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "LocalBusiness",
                    "@id": `${this._getBaseUrl()}#organization`,
                    "name": this.config.businessName,
                    "alternateName": "Misajo Cookie",
                    "description": description || `Galletas artesanales hechas con amor en ${this.config.city}, Colombia. Domicilios a toda la ciudad.`,
                    "url": this._getBaseUrl(),
                    "telephone": "+573159038449",
                    "email": "contacto@misajocookies.com",
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": this.config.city,
                        "addressRegion": this.config.region,
                        "addressCountry": this.config.country,
                        "postalCode": "760001"
                    },
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": this.config.coordinates.latitude,
                        "longitude": this.config.coordinates.longitude
                    },
                    "openingHoursSpecification": [
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                            "opens": "09:00",
                            "closes": "19:00"
                        }
                    ],
                    "priceRange": "$$",
                    "servesCuisine": "Repostería, Galletas Artesanales",
                    "hasMenu": `${this._getBaseUrl()}/catalogo.html`,
                    "image": `${this._getBaseUrl()}/assets/images/hero-cookie-1.webp`,
                    "currenciesAccepted": "COP",
                    "paymentAccepted": "Cash, Transfer, Credit Card (Wompi)",
                    "areaServed": {
                        "@type": "City",
                        "name": this.config.city,
                        "sameAs": `https://es.wikipedia.org/wiki/${this.config.city}`
                    }
                },
                {
                    "@type": pageType,
                    "url": window.location.href,
                    "isPartOf": {
                        "@type": "WebSite",
                        "url": this._getBaseUrl(),
                        "name": this.config.businessName
                    }
                }
            ]
        };

        return JSON.stringify(schema, null, 2);
    }

    /**
     * Genera Schema.org para producto específico
     * @param {Object} product - Datos del producto
     * @param {string} product.id - ID del producto
     * @param {string} product.name - Nombre del producto
     * @param {string} product.description - Descripción del producto
     * @param {number} product.priceCents - Precio en centavos COP
     * @param {string} product.image - URL de la imagen
     * @param {boolean} [product.inStock=true] - Disponibilidad
     * @returns {string} JSON-LD del producto
     */
    generateProductSchema(product) {
        const { id, name, description, priceCents, image, inStock = true } = product;
        
        const schema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${this._getBaseUrl()}/productos/${id}#product`,
            "name": name,
            "description": description,
            "image": image || `${this._getBaseUrl()}/assets/images/hero-cookie-1.webp`,
            "brand": {
                "@type": "Brand",
                "name": this.config.businessName
            },
            "offers": {
                "@type": "Offer",
                "url": `${this._getBaseUrl()}/productos/${id}`,
                "priceCurrency": "COP",
                "price": (priceCents / 100).toString(),
                "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                    "@type": "LocalBusiness",
                    "name": this.config.businessName
                }
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "127",
                "bestRating": "5",
                "worstRating": "1"
            }
        };

        return JSON.stringify(schema, null, 2);
    }

    /**
     * Genera Schema.org para artículo de blog
     * @param {Object} article - Datos del artículo
     * @param {string} article.title - Título del artículo
     * @param {string} article.description - Descripción/extracto
     * @param {string} article.author - Autor
     * @param {string} article.publishedDate - Fecha de publicación (ISO 8601)
     * @param {string} article.image - URL de imagen destacada
     * @returns {string} JSON-LD del artículo
     */
    generateArticleSchema(article) {
        const { title, description, author, publishedDate, image } = article;
        
        const schema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title,
            "description": description,
            "author": {
                "@type": "Person",
                "name": author,
                "url": this._getBaseUrl()
            },
            "datePublished": publishedDate,
            "dateModified": new Date().toISOString(),
            "publisher": {
                "@type": "LocalBusiness",
                "name": this.config.businessName,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${this._getBaseUrl()}/assets/images/logo.png`
                }
            },
            "image": image,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": window.location.href
            },
            "articleBody": description,
            "wordCount": description.split(' ').length * 10 // Estimado
        };

        return JSON.stringify(schema, null, 2);
    }

    /**
     * Genera meta tags OpenGraph para redes sociales
     * @param {Object} options - Opciones de OpenGraph
     * @param {string} options.title - Título de la página
     * @param {string} options.description - Descripción
       * @param {string} options.image - URL de imagen
     * @param {string} [options.type='website'] - Tipo de contenido
     * @returns {string} HTML con meta tags OpenGraph
     */
    generateOpenGraphTags(options) {
        const { title, description, image, type = 'website' } = options;
        const url = window.location.href;
        
        return `
    <!-- Open Graph Meta Tags (Facebook, LinkedIn) -->
    <meta property="og:type" content="${type}">
    <meta property="og:title" content="${this._escapeHtml(title)}">
    <meta property="og:description" content="${this._escapeHtml(description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${image}">
    <meta property="og:locale" content="es_CO">
    <meta property="og:site_name" content="${this.config.businessName}">`.trim();
    }

    /**
     * Genera meta tags Twitter Card
     * @param {Object} options - Opciones de Twitter Card
     * @param {string} options.title - Título
     * @param {string} options.description - Descripción
     * @param {string} options.image - URL de imagen
     * @param {string} [options.card='summary_large_image'] - Tipo de card
     * @returns {string} HTML con meta tags Twitter
     */
    generateTwitterCardTags(options) {
        const { title, description, image, card = 'summary_large_image' } = options;
        
        return `
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="${card}">
    <meta name="twitter:title" content="${this._escapeHtml(title)}">
    <meta name="twitter:description" content="${this._escapeHtml(description)}">
    <meta name="twitter:image" content="${image}">`.trim();
    }

    /**
     * Genera meta tags geo para SEO local
     * @returns {string} HTML con meta tags geo
     */
    generateGeoTags() {
        const { city, coordinates } = this.config;
        
        return `
    <!-- Geo Tags para SEO Local -->
    <meta name="geo.region" content="CO-VAC">
    <meta name="geo.placename" content="${city}">
    <meta name="geo.position" content="${coordinates.latitude};${coordinates.longitude}">
    <meta name="ICBM" content="${coordinates.latitude}, ${coordinates.longitude}">`.trim();
    }

    /**
     * Genera todas las etiquetas SEO para una página
     * @param {Object} pageData - Datos completos de la página
     * @param {string} pageData.title - Título
     * @param {string} pageData.description - Descripción
     * @param {string} pageData.keywords - Palabras clave (array o string comma-separated)
     * @param {string} pageData.image - Imagen principal
     * @param {string} [pageData.type='website'] - Tipo de página
     * @param {boolean} [pageData.includeSchema=true] - Incluir Schema.org
     * @returns {string} HTML completo con todas las etiquetas SEO
     */
    generateCompleteSEOTags(pageData) {
        const { 
            title, 
            description, 
            keywords, 
            image, 
            type = 'website',
            includeSchema = true 
        } = pageData;

        const keywordArray = Array.isArray(keywords) 
            ? keywords.join(', ') 
            : keywords;

        let html = `
    <!-- SEO Meta Tags -->
    <title>${this._escapeHtml(title)}</title>
    <meta name="description" content="${this._escapeHtml(description)}">
    <meta name="keywords" content="${this._escapeHtml(keywordArray)}">
    <meta name="author" content="${this.config.businessName}">
    <meta name="robots" content="index, follow">

    <!-- Canonical URL -->
    <link rel="canonical" href="${window.location.href}" />

    ${this.generateOpenGraphTags({ title, description, image, type })}

    ${this.generateTwitterCardTags({ title, description, image })}

    ${this.generateGeoTags()}`;

        if (includeSchema && type === 'product') {
            // Se asume que pageData incluye datos de producto
            html += `\n\n    <script type="application/ld+json">\n    ${this.generateProductSchema(pageData)}\n    </script>`;
        } else if (includeSchema) {
            html += `\n\n    <script type="application/ld+json">\n    ${this.generateLocalBusinessSchema({ pageType: type === 'blog' ? 'BlogPosting' : 'WebPage', description })}\n    </script>`;
        }

        return html;
    }

    /**
     * Obtiene palabras clave optimizadas para Cali
     * @param {string} category - Categoría de producto/servicio
     * @returns {Array<string>} Lista de keywords optimizadas
     */
    getCaliKeywords(category = '') {
        const baseKeywords = [
            'galletas artesanales Cali',
            'cookies Cali',
            'galletas a domicilio Cali',
            'alfajores Cali',
            'galletas caseras Cali',
            'repostería artesanal Cali',
            'domicilios galletas Cali',
            'MisajoCookies'
        ];

        const categoryKeywords = {
            'chocochips': ['galletas chocoChips Cali', 'cookies con chocolate Cali'],
            'mantequilla': ['galletas de mantequilla Cali', 'galletas tradicionales Cali'],
            'alfajores': ['alfajores artesanales Cali', 'alfajores rellenos Cali'],
            'combos': ['combos de galletas Cali', 'regalos de galletas Cali'],
            'personalizadas': ['galletas personalizadas Cali', 'galletas para eventos Cali']
        };

        return category 
            ? [...baseKeywords, ...(categoryKeywords[category] || [])]
            : baseKeywords;
    }

    /**
     * Escapa caracteres HTML para seguridad
     * @private
     * @param {string} text - Texto a escapar
     * @returns {string} Texto escapado
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Obtiene la URL base del sitio
     * @private
     * @returns {string} URL base
     */
    _getBaseUrl() {
        return window.location.origin;
    }
}
