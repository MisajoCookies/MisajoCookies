/**
 * MisajoCookies — Gestor de Consentimiento de Cookies
 * Implementa banner de consentimiento conforme a Ley 1581 de 2012 (Colombia)
 * y estándares GDPR
 */

(function() {
  'use strict';

  // ─── Configuración ──────────────────────────────────────────────────────────
  const CONFIG = {
    consentKey: 'misajo_cookie_consent',
    preferencesKey: 'misajo_cookie_preferences',
    expiryDays: 365,
    scriptSelector: '[data-cookie-category]',
    categories: {
      ESSENTIAL: 'essential',
      PREFERENCES: 'preferences',
      ANALYTICS: 'analytics',
      MARKETING: 'marketing'
    }
  };

  // ─── Estado ─────────────────────────────────────────────────────────────────
  let consentStatus = null;
  let cookiePreferences = {};

  // ─── Funciones Principales ──────────────────────────────────────────────────

  /**
   * Verifica si el usuario ya dio consentimiento
   */
  function hasConsent() {
    const stored = localStorage.getItem(CONFIG.consentKey);
    return stored === 'accepted' || stored === 'partial';
  }

  /**
   * Obtiene el estado actual del consentimiento
   */
  function getConsentStatus() {
    return localStorage.getItem(CONFIG.consentKey);
  }

  /**
   * Obtiene preferencias específicas por categoría
   */
  function getCookiePreferences() {
    const stored = localStorage.getItem(CONFIG.preferencesKey);
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Guarda el consentimiento del usuario
   */
  function saveConsent(status, preferences = {}) {
    localStorage.setItem(CONFIG.consentKey, status);
    
    if (status === 'partial') {
      const defaultPrefs = {
        [CONFIG.categories.ESSENTIAL]: true,
        [CONFIG.categories.PREFERENCES]: false,
        [CONFIG.categories.ANALYTICS]: false,
        [CONFIG.categories.MARKETING]: false
      };
      
      cookiePreferences = { ...defaultPrefs, ...preferences };
      localStorage.setItem(CONFIG.preferencesKey, JSON.stringify(cookiePreferences));
    } else {
      cookiePreferences = {
        [CONFIG.categories.ESSENTIAL]: true,
        [CONFIG.categories.PREFERENCES]: status === 'accepted',
        [CONFIG.categories.ANALYTICS]: status === 'accepted',
        [CONFIG.categories.MARKETING]: status === 'accepted'
      };
      localStorage.setItem(CONFIG.preferencesKey, JSON.stringify(cookiePreferences));
    }

    // Aplicar preferencias inmediatamente
    applyCookiePreferences();
    
    // Ocultar banner
    hideBanner();
    
    // Registrar evento para analytics (si está permitido)
    if (cookiePreferences[CONFIG.categories.ANALYTICS]) {
      console.log('[Cookies] Consentimiento registrado:', status, preferences);
    }
  }

  /**
   * Aplica las preferencias de cookies (bloquea/permite scripts)
   */
  function applyCookiePreferences() {
    // Scripts que esperan carga
    document.querySelectorAll('script[data-cookie-category][data-src]').forEach(script => {
      const category = script.getAttribute('data-cookie-category');
      
      if (cookiePreferences[category]) {
        // Cargar script permitido
        const src = script.getAttribute('data-src');
        script.src = src;
        script.removeAttribute('data-src');
      }
    });

    // Ejecutar callbacks registrados
    window.dispatchEvent(new CustomEvent('cookies:applied', { 
      detail: { preferences: cookiePreferences } 
    }));
  }

  /**
   * Bloquea scripts no esenciales hasta obtener consentimiento
   */
  function blockNonEssentialScripts() {
    document.querySelectorAll('script[type="text/plain"][data-cookie-category]').forEach(script => {
      const category = script.getAttribute('data-cookie-category');
      
      if (!cookiePreferences[category] && category !== CONFIG.categories.ESSENTIAL) {
        // Convertir a tipo seguro y almacenar src original
        if (script.src) {
          script.setAttribute('data-src', script.src);
          script.removeAttribute('src');
        }
        script.type = 'text/plain';
      }
    });
  }

  /**
   * Muestra el banner de consentimiento
   */
  function showBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.hidden = false;
      banner.style.display = 'block';
      document.body.style.overflow = 'hidden'; // Prevenir scroll
    }
  }

  /**
   * Oculta el banner de consentimiento
   */
  function hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.hidden = true;
      banner.style.display = 'none';
      document.body.style.overflow = ''; // Restaurar scroll
    }
  }

  /**
   * Inicializa el gestor de cookies
   */
  function init() {
    // Cargar estado previo
    consentStatus = getConsentStatus();
    cookiePreferences = getCookiePreferences();

    // Si ya hay consentimiento, aplicar preferencias
    if (hasConsent()) {
      applyCookiePreferences();
      return;
    }

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createAndShowBanner);
    } else {
      createAndShowBanner();
    }
  }

  /**
   * Crea y muestra el banner de consentimiento
   */
  function createAndShowBanner() {
    // Verificar si ya existe el banner en el HTML
    let banner = document.getElementById('cookie-consent-banner');
    
    if (!banner) {
      banner = createBannerHTML();
      document.body.appendChild(banner);
    }

    // Configurar event listeners
    setupBannerListeners(banner);
    
    // Mostrar banner
    showBanner();
  }

  /**
   * Crea el HTML del banner
   */
  function createBannerHTML() {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.hidden = true;
    banner.innerHTML = `
      <style>
        #cookie-consent-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
          color: #FFFFFF;
          padding: 1.5rem;
          z-index: 9999;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .cookie-banner-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .cookie-banner-text h3 {
          font-size: 1.3rem;
          margin-bottom: 0.75rem;
          color: #D4A574;
        }
        
        .cookie-banner-text p {
          font-size: 0.95rem;
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }
        
        .cookie-banner-text a {
          color: #D4A574;
          text-decoration: underline;
        }
        
        .cookie-banner-text a:hover {
          color: #F5E6D3;
        }
        
        .cookie-categories {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        
        .cookie-category-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        
        .cookie-category-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #D4A574;
        }
        
        .cookie-category-item label {
          cursor: pointer;
          opacity: 0.9;
        }
        
        .cookie-category-item input:disabled + label {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .cookie-banner-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: flex-end;
        }
        
        .cookie-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .cookie-btn-primary {
          background: #D4A574;
          color: #2C2C2C;
        }
        
        .cookie-btn-primary:hover {
          background: #F5E6D3;
        }
        
        .cookie-btn-secondary {
          background: transparent;
          color: #FFFFFF;
          border: 2px solid #FFFFFF;
        }
        
        .cookie-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .cookie-btn-link {
          background: transparent;
          color: #D4A574;
          text-decoration: underline;
          padding: 0.75rem 1rem;
        }
        
        .cookie-btn-link:hover {
          color: #F5E6D3;
        }
        
        @media (max-width: 768px) {
          .cookie-banner-content {
            padding: 0;
          }
          
          .cookie-banner-actions {
            flex-direction: column;
          }
          
          .cookie-btn {
            width: 100%;
            text-align: center;
          }
          
          .cookie-categories {
            grid-template-columns: 1fr;
          }
        }
      </style>
      
      <div class="cookie-banner-content">
        <div class="cookie-banner-text">
          <h3>🍪 Tu privacidad es importante</h3>
          <p>
            En MisajoCookies usamos cookies para mejorar tu experiencia. 
            Algunas son esenciales para el funcionamiento del sitio, mientras que otras 
            nos ayudan a entender cómo lo usas. Puedes aceptar todas, rechazar las no 
            esenciales o configurar tus preferencias.
          </p>
          <p>
            Para más información, consulta nuestra 
            <a href="/politica-privacidad.html" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.
          </p>
        </div>
        
        <div class="cookie-categories">
          <div class="cookie-category-item">
            <input type="checkbox" id="cookie-essential" checked disabled>
            <label for="cookie-essential">Esenciales (requeridas)</label>
          </div>
          <div class="cookie-category-item">
            <input type="checkbox" id="cookie-preferences" data-category="preferences">
            <label for="cookie-preferences">Preferencias</label>
          </div>
          <div class="cookie-category-item">
            <input type="checkbox" id="cookie-analytics" data-category="analytics">
            <label for="cookie-analytics">Analíticas</label>
          </div>
          <div class="cookie-category-item">
            <input type="checkbox" id="cookie-marketing" data-category="marketing">
            <label for="cookie-marketing">Marketing</label>
          </div>
        </div>
        
        <div class="cookie-banner-actions">
          <button type="button" class="cookie-btn cookie-btn-link" id="cookie-read-more">
            Más información
          </button>
          <button type="button" class="cookie-btn cookie-btn-secondary" id="cookie-reject-all">
            Rechazar no esenciales
          </button>
          <button type="button" class="cookie-btn cookie-btn-primary" id="cookie-accept-custom">
            Guardar selección
          </button>
          <button type="button" class="cookie-btn cookie-btn-primary" id="cookie-accept-all">
            Aceptar todas
          </button>
        </div>
      </div>
    `;
    
    return banner;
  }

  /**
   * Configura los listeners del banner
   */
  function setupBannerListeners(banner) {
    // Aceptar todas
    banner.querySelector('#cookie-accept-all').addEventListener('click', () => {
      saveConsent('accepted');
    });

    // Rechazar no esenciales
    banner.querySelector('#cookie-reject-all').addEventListener('click', () => {
      saveConsent('rejected', {});
    });

    // Guardar selección personalizada
    banner.querySelector('#cookie-accept-custom').addEventListener('click', () => {
      const preferences = {
        preferences: banner.querySelector('#cookie-preferences').checked,
        analytics: banner.querySelector('#cookie-analytics').checked,
        marketing: banner.querySelector('#cookie-marketing').checked
      };
      saveConsent('partial', preferences);
    });

    // Más información (redirigir a política de privacidad)
    banner.querySelector('#cookie-read-more').addEventListener('click', () => {
      window.location.href = '/politica-privacidad.html#cookies';
    });
  }

  /**
   * Verifica si se permite una categoría específica de cookies
   */
  function isCategoryAllowed(category) {
    if (!hasConsent()) return false;
    
    const prefs = getCookiePreferences();
    return prefs[category] === true;
  }

  // ─── API Pública ────────────────────────────────────────────────────────────
  
  window.MisajoCookies = window.MisajoCookies || {};
  window.MisajoCookies.CookieConsent = {
    hasConsent: hasConsent,
    getConsentStatus: getConsentStatus,
    getPreferences: getCookiePreferences,
    isCategoryAllowed: isCategoryAllowed,
    showBanner: showBanner,
    hideBanner: hideBanner,
    saveConsent: saveConsent,
    revokeConsent: function() {
      localStorage.removeItem(CONFIG.consentKey);
      localStorage.removeItem(CONFIG.preferencesKey);
      location.reload();
    }
  };

  // ─── Inicialización ─────────────────────────────────────────────────────────
  init();

})();
