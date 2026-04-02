/**
 * AppConfig - Configuración de la Aplicación MisajoCookies
 * 
 * Contiene las constantes y configuraciones globales de la aplicación.
 * Centraliza configuración de servicios externos (Wompi), parámetros de negocio,
 * SEO local y seguridad.
 * 
 * @memberof Infrastructure.Config
 */

export class AppConfig {
    // Información de contacto
    static WHATSPHONE_NUMBER = '573159038449';
    
    // Umbrales de promoción (en centavos)
    static FREE_DELIVERY_THRESHOLD = 4000000;  // $40.000
    static FREE_PACKAGE_THRESHOLD = 6001000;   // $60.001
    
    // Precios (en centavos)
    static PRICE_CAJA = 200000;           // $2.000
    static PRICE_DIP_STD = 200000;        // $2.000
    static PRICE_DIP_CHOCO = 300000;      // $3.000
    static PRICE_CAFE_HATSU = 500000;     // $5.000
    static PRICE_VELA = 300000;           // $3.000
    
    // Horarios de atención
    static BUSINESS_HOUR_START = 13; // 1pm Colombia
    static BUSINESS_HOUR_END = 19;   // 7pm Colombia
    
    // Rutas base
    static BASE_PATH = '/';
    static ASSETS_PATH = '/assets/';
    static IMAGES_PATH = '/assets/images/';
    
    // Configuración de Wompi (Pagos)
    static WOMPI_PUBLIC_KEY = import.meta.env?.VITE_WOMPI_PUBLIC_KEY || 'pub_test_12345';
    static WOMPI_PRIVATE_KEY = import.meta.env?.VITE_WOMPI_PRIVATE_KEY || 'prv_test_67890';
    static WOMPI_SANDBOX = import.meta.env?.VITE_WOMPI_SANDBOX !== 'false';
    
    // Configuración de SEO Local (Cali, Colombia)
    static SEO_CONFIG = {
        businessName: 'MisajoCookies',
        tagline: 'Galletas Artesanales en Cali',
        city: 'Cali',
        region: 'Valle del Cauca',
        country: 'CO',
        coordinates: {
            latitude: 3.4516,
            longitude: -76.5320
        }
    };
    
    /**
     * Obtiene la ruta completa para una imagen
     * @param {string} imageName - Nombre del archivo de imagen
     * @returns {string} Ruta completa de la imagen
     */
    static getImagePath(imageName) {
        return this.IMAGES_PATH + imageName;
    }
    
    /**
     * Obtiene la URL de WhatsApp con un mensaje
     * @param {string} message - Mensaje a enviar
     * @returns {string} URL completa de WhatsApp
     */
    static getWhatsAppUrl(message = '') {
        const baseUrl = `https://wa.me/${this.WHATSAPP_NUMBER}?text=`;
        return baseUrl + encodeURIComponent(message);
    }
    
    /**
     * Verifica si estamos dentro del horario de atención
     * @param {Date} date - Fecha a verificar (default: ahora)
     * @returns {boolean} True si está en horario de atención
     */
    static isBusinessHours(date = new Date()) {
        const hour = date.getHours();
        return hour >= this.BUSINESS_HOUR_START && hour < this.BUSINESS_HOUR_END;
    }
    
    /**
     * Obtiene el mensaje de estado del horario
     * @returns {string} Mensaje sobre el estado del horario
     */
    static getBusinessHoursMessage() {
        if (this.isBusinessHours()) {
            return '✅ Estamos atendiendo actualmente';
        }
        return `🕐 Atendemos todos los días de ${this.BUSINESS_HOUR_START}:00 a ${this.BUSINESS_HOUR_END}:00`;
    }

    /**
     * Obtiene la configuración de Wompi para pagos
     * @returns {Object} Configuración completa de Wompi
     */
    static getWompiConfig() {
        return {
            publicKey: this.WOMPI_PUBLIC_KEY,
            privateKey: this.WOMPI_PRIVATE_KEY,
            sandbox: this.WOMPI_SANDBOX,
            baseUrl: this.WOMPI_SANDBOX 
                ? 'https://sandbox.wompi.co' 
                : 'https://production.wompi.co'
        };
    }

    /**
     * Obtiene la configuración de SEO local para Cali
     * @returns {Object} Parámetros de SEO optimizados para Cali, Colombia
     */
    static getLocalSeoConfig() {
        return {
            ...this.SEO_CONFIG,
            keywords: [
                'galletas artesanales Cali',
                'cookies Cali',
                'galletas a domicilio Cali',
                'alfajores Cali',
                'galletas caseras Cali',
                'repostería artesanal Cali',
                'domicilios galletas Cali',
                'MisajoCookies'
            ],
            geoTags: {
                region: 'CO-VAC',
                placename: this.SEO_CONFIG.city,
                latitude: this.SEO_CONFIG.coordinates.latitude,
                longitude: this.SEO_CONFIG.coordinates.longitude
            }
        };
    }

    /**
     * Valida que la configuración de pagos esté correcta
     * @returns {{isValid: boolean, warnings: Array<string>}} Resultado de validación
     */
    static validatePaymentConfig() {
        const warnings = [];
        
        if (!this.WOMPI_PUBLIC_KEY || this.WOMPI_PUBLIC_KEY.includes('test')) {
            warnings.push('Wompi public key not configured or using test key');
        }
        
        if (!this.WOMPI_PRIVATE_KEY || this.WOMPI_PRIVATE_KEY.includes('test')) {
            warnings.push('Wompi private key not configured or using test key');
        }

        return {
            isValid: warnings.length === 0,
            warnings
        };
    }
}
