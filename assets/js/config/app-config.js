/**
 * MisajoCookies — Configuración de la Aplicación
 * Variables de entorno y configuración global
 * 
 * INSTRUCCIONES PARA CONFIGURAR:
 * 1. Para desarrollo local: modificar los valores directamente en este archivo
 * 2. Para producción en GitHub Pages: usar GitHub Actions secrets o 
 *    crear un archivo .env.local (no commitear a Git)
 * 3. Para mayor seguridad: usar Cloudflare Workers como proxy
 */

(function() {
  'use strict';

  // ─── Configuración de Endpoints ─────────────────────────────────────────────
  // ⚠️ IMPORTANTE: En producción, este valor debe venir de variable de entorno
  
  /**
   * URL del Google Apps Script Web App para recibir pedidos
   * 
   * SEGURIDAD: Esta URL contiene credenciales sensibles.
   * Opciones para protegerla:
   * 
   * OPCIÓN 1 - Variable de entorno en GitHub Pages (recomendado):
   *   window.MISAJO_CONFIG = {
   *     SHEETS_ENDPOINT: process.env.SHEETS_ENDPOINT || ''
   *   };
   * 
   * OPCIÓN 2 - Proxy con Cloudflare Worker (más seguro):
   *   Crear un worker que oculte la URL real:
   *   https://api.misajocookies.com/pedidos -> redirige al endpoint real
   * 
   * OPCIÓN 3 - Backend intermedio (Node.js/Python):
   *   window.MISAJO_CONFIG = {
   *     SHEETS_ENDPOINT: '/api/pedidos' // Tu propio backend
   *   };
   */
  
  const DEFAULT_CONFIG = {
    // Endpoint de Google Sheets (DEBE configurarse antes de usar)
    SHEETS_ENDPOINT: '', // ← Pega aquí tu URL de Google Apps Script Web App
    
    // Número de WhatsApp para pedidos
    WA_NUMBER: '573159038449',
    
    // Configuración de precios
    PRICING: {
      PACKAGE: 4000,           // Precio caja básica
      DIP_STD: 2000,           // Dip de arequipe estándar
      DIP_CHOCO: 3000,         // Dip de chocolate negro
      CAFE_HATSU: 5000,        // Café Hatsun
      VELA: 3000,              // Vela artesanal
      CAJA: 2000,              // Caja adicional
      DIP_UPGRADE_SURCHARGE: 1800,  // Recargo por upgrade de dip
      
      // Umbrales para promociones
      FREE_DELIVERY_THRESHOLD: 40000,  // Envío gratis desde $40,000
      FREE_PACKAGE_THRESHOLD: 60001    // Paquete gratis desde $60,001
    },
    
    // Horario de atención (hora Colombia)
    BUSINESS_HOURS: {
      START: 13,  // 1:00 PM
      END: 19     // 7:00 PM
    },
    
    // Configuración de cookies
    COOKIES: {
      CONSENT_KEY: 'misajo_cookie_consent',
      EXPIRY_DAYS: 365,
      CATEGORIES: {
        ESSENTIAL: 'essential',
        PREFERENCES: 'preferences',
        ANALYTICS: 'analytics',
        MARKETING: 'marketing'
      }
    },
    
    // URLs legales
    LEGAL: {
      PRIVACY_POLICY: '/politica-privacidad.html',
      TERMS_OF_SERVICE: '/terminos-condiciones.html',
      COOKIE_POLICY: '/politica-cookies.html'
    }
  };

  // Exponer configuración globalmente
  window.MISAJO_CONFIG = DEFAULT_CONFIG;

  // Función helper para obtener configuración
  window.getMisajoConfig = function(key, defaultValue) {
    const keys = key.split('.');
    let value = window.MISAJO_CONFIG;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue !== undefined ? defaultValue : null;
      }
    }
    
    return value;
  };

  // Función para validar si el endpoint está configurado
  window.isSheetsEndpointConfigured = function() {
    const endpoint = window.getMisajoConfig('SHEETS_ENDPOINT');
    return endpoint && endpoint.trim() !== '' && endpoint.startsWith('https://');
  };

  console.log('[MisajoCookies] Configuración cargada:', {
    sheetsEndpointConfigured: window.isSheetsEndpointConfigured(),
    waNumber: window.getMisajoConfig('WA_NUMBER')
  });

})();
