# MisajoCookies — Sitio Web Oficial

> Sitio web estático para una pastelería artesanal de galletas en Cali, Colombia.
> Publicado en [www.misajocookies.com](https://www.misajocookies.com) vía GitHub Pages.

---

## Resumen Ejecutivo

MisajoCookies es un negocio de galletas artesanales con sede en Cali, Colombia. Este repositorio contiene el **sitio web completo**: una aplicación web estática (sin backend) que funciona como vitrina digital, catálogo de productos y canal de ventas directo vía WhatsApp.

El sitio está diseñado con tres prioridades en mente:

1. **Conversión** — Cada página lleva al visitante a contactar por WhatsApp o ver el catálogo.
2. **SEO local** — Optimizado para búsquedas como "galletas artesanales Cali" con schema markup, sitemap y metaetiquetas geo.
3. **Rendimiento** — Imágenes comprimidas en WebP, CSS crítico inlinado y carga asíncrona de recursos.

---

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Markup | HTML5 semántico | Estructura de todas las páginas |
| Estilos | CSS3 (variables, grid, flexbox) | Diseño responsivo, sin framework |
| Lógica | JavaScript ES6+ (vanilla) | Interactividad, catálogo dinámico |
| Componentes | Web Components (Custom Elements v1) | Header y footer reutilizables |
| Datos | `catalog-data.js` (JSON-like) | Fuente única de verdad del catálogo |
| Fuentes | Google Fonts (Corben + Montserrat) | Tipografía de marca |
| Iconos | SVG inline | Sin dependencias de FontAwesome |
| Hosting | GitHub Pages + CNAME | Deploy automático desde rama `main` |
| CI/CD | GitHub Actions | Compresión automática de imágenes |
| SEO | Schema.org, Open Graph, Twitter Card | Enriquecimiento en buscadores y redes |

---

## Estructura del Repositorio

```
MisajoCookies/
├── index.html                      # Página principal (Home)
├── catalogo.html                   # Catálogo completo (productos + combos)
├── nosotros.html                   # Historia y valores de la marca
├── contacto.html                   # Canales de contacto
├── domicilios-cali.html            # Landing page de domicilios en Cali
├── galletas-artesanales-cali.html  # Página pilar SEO
│
├── productos/
│   ├── index.html                  # Listado de productos
│   ├── alfajores.html
│   ├── alfajores-corazon.html
│   ├── cookie-dip-premium.html
│   ├── cookie-shaker-supreme.html
│   ├── galletas-bigote.html
│   ├── galletas-chocochips.html
│   ├── galletas-fiesta.html
│   └── galletas-mantequilla.html
│
├── combos/
│   └── index.html                  # Listado de combos regalo
│
├── blog/
│   ├── regalos-originales-cali.html
│   └── post-seo.html
│
├── tarjetas/                       # Tarjetas digitales de presentación
│   ├── misajocookies.html
│   ├── alejandra-chavez.html
│   └── miguel-angel-zapata.html
│
├── assets/
│   ├── css/
│   │   ├── styles.css              # Hoja de estilos principal (1,100+ líneas)
│   │   └── slider.css              # Estilos del carrusel de imágenes
│   ├── js/
│   │   ├── catalog-data.js         # Base de datos del catálogo (productos + combos)
│   │   ├── catalog-render.js       # Motor de renderizado del catálogo
│   │   ├── main.js                 # Lógica general (animaciones, scroll, slider)
│   │   └── components/
│   │       ├── misajo-header.js    # Web Component: cabecera global
│   │       └── misajo-footer.js    # Web Component: pie de página global
│   └── images/
│       ├── favicon/                # Set completo de favicons (ICO, SVG, PNG, Manifest)
│       ├── hero-cookie-1.webp      # Imagen hero rotatoria
│       ├── hero-cookie-2.webp
│       ├── hero-cookie-3.webp
│       ├── logo.webp               # Logo de la marca
│       ├── mascota.webp            # Mascota MisajoCookies
│       ├── about-misaj-cookie.webp # Imagen sección "Nosotros"
│       ├── [producto].webp         # Imágenes individuales de productos
│       └── [combo].webp            # Imágenes de combos (algunos con variantes)
│
├── sitemap.xml                     # Mapa del sitio para Google (20 URLs)
├── robots.txt                      # Directivas para crawlers
├── CNAME                           # Dominio personalizado: www.misajocookies.com
├── compress-images.sh              # Script manual de compresión de imágenes
└── .github/
    └── workflows/
        └── compress-images.yml     # CI: compresión automática de WebP en cada push
```

---

## Instalación y Configuración Local

Este proyecto **no requiere instalación de dependencias**. Es HTML/CSS/JS puro.

### Requisitos
- Cualquier editor de código (VS Code recomendado)
- Un navegador moderno (Chrome, Firefox, Edge)
- Git (para clonar el repositorio)

### Pasos

**1. Clonar el repositorio**
```bash
git clone https://github.com/MisajoCookies/MisajoCookies.git
cd MisajoCookies
```

**2. Abrir el sitio localmente**

Opción A — Extensión Live Server en VS Code (recomendada):
```
1. Instalar extensión "Live Server" en VS Code
2. Click derecho en index.html → "Open with Live Server"
3. El sitio abre en http://127.0.0.1:5500/
```

Opción B — Servidor HTTP con Python:
```bash
python -m http.server 8080
# Abrir: http://localhost:8080
```

> **Importante:** No abrir `index.html` directamente como archivo (`file://`). Los Web Components y las rutas absolutas (`/assets/...`) requieren un servidor HTTP.

**3. Editar contenido**

Los cambios más comunes se hacen en estos archivos:

| Qué cambiar | Dónde |
|-------------|-------|
| Agregar/editar producto | `assets/js/catalog-data.js` |
| Cambiar navegación global | `assets/js/components/misajo-header.js` |
| Cambiar footer o datos NAP | `assets/js/components/misajo-footer.js` |
| Estilos globales | `assets/css/styles.css` |
| Contenido del Home | `index.html` |

---

## Deploy a Producción

El sitio se despliega automáticamente en GitHub Pages con cada `push` a la rama `main`.

```bash
git add .
git commit -m "descripción del cambio"
git push origin main
# El sitio se actualiza en ~1-2 minutos en www.misajocookies.com
```

### Pipeline de CI/CD

Además del deploy, GitHub Actions ejecuta automáticamente la compresión de imágenes:

```
Push con nuevas imágenes WebP
        ↓
compress-images.yml se activa
        ↓
Decodifica WebP → Recomprime a calidad 75% con cwebp
        ↓
Auto-commit: "perf: comprimir imágenes WebP (calidad 75%) [skip ci]"
        ↓
Push automático a main
```

---

## Catálogo de Productos

El catálogo está centralizado en `assets/js/catalog-data.js` y es la **única fuente de verdad**.

### Productos Individuales (precio unitario: $4.000 COP)

| ID | Nombre | Presentación |
|----|--------|-------------|
| `galletas-mantequilla` | Galletas de Mantequilla | Paquete x 5 unidades, 50gr |
| `galletas-topping` | Galletas con Topping | Múltiples variantes visuales |
| `alfajores` | Alfajores Clásicos | Dulce de leche + coco |
| `alfajores-corazon` | Alfajores Corazón | Edición especial |
| `galletas-bigote` | Galletas Bigote | Decoración artesanal |
| `cookie-dip-premium` | Cookie Dip Premium | $12.000 COP |
| `cookie-shaker-supreme` | Cookie Shaker Supreme | $10.000 COP |

### Combos Regalo

| ID | Nombre | Precio | Incluye |
|----|--------|--------|---------|
| `combo-deleite` | Combo Deleite | $17.000 COP | Galletas + Juan Valdez o Hatsu |
| `combo-dulce` | Combo Dulce | $15.000 COP | Galletas + vela aromática |
| `combo-premium` | Combo Premium | $25.000 COP | Galletas + licor (Jack Daniel's o Jägermeister) |

---

## SEO y Posicionamiento

El sitio implementa una estrategia SEO completa:

- **Schema.org**: `Bakery`, `LocalBusiness`, `Product`, `BlogPosting`, `BreadcrumbList`
- **Open Graph** y **Twitter Cards** en todas las páginas
- **Geo-meta tags**: coordenadas de Cali, Colombia
- **Canonical URLs**: apuntan a `www.misajocookies.com`
- **Sitemap**: 20 URLs con prioridades y frecuencias de cambio
- **Página pilar**: `galletas-artesanales-cali.html` (SEO priority: 0.9)
- **NAP consistente**: Nombre, dirección y teléfono idénticos en footer y schema

---

## Contacto y Canales de Venta

- **WhatsApp**: +57 315 903 8449
- **Instagram**: [@misajocookies](https://instagram.com/misajocookies)
- **Facebook**: [MisajoCookies](https://facebook.com/misajocookies)
- **Web**: [www.misajocookies.com](https://www.misajocookies.com)

---

## Licencia

© 2026 MisajoCookies. Todos los derechos reservados.
