# 🍪 Misaj Cookie - Website

## Estructura del Proyecto

```
misajo-website/
│
├── index.html                 # Página principal
├── css/
│   └── styles.css            # Estilos CSS
├── js/
│   └── main.js               # JavaScript
├── images/                   # 📸 AQUÍ VAN TODAS LAS IMÁGENES
│   ├── hero-cookie-1.jpg
│   ├── hero-cookie-2.jpg
│   ├── hero-cookie-3.jpg
│   ├── galletas-mantequilla.jpg
│   ├── galletas-chocochips.jpg
│   ├── galletas-fiesta.jpg
│   ├── alfajores.jpg
│   ├── alfajores-corazon.jpg
│   ├── galletas-bigote.jpg
│   ├── combo-premium.jpg
│   ├── combo-dulce.jpg
│   └── about-misaj-cookie.jpg
└── README.md                 # Este archivo
```

---

## 📸 Guía de Imágenes

### **Carpeta: `images/`**

Coloca las siguientes imágenes en la carpeta `images/`. Los nombres deben ser **exactamente** como se indica:

### **1. Sección Hero (3 imágenes flotantes)**

| Archivo | Descripción | Foto Original Recomendada |
|---------|-------------|---------------------------|
| `hero-cookie-1.jpg` | Galleta principal destacada | Usa una foto atractiva de ChocoChips o Mantequilla |
| `hero-cookie-2.jpg` | Segunda galleta flotante | Usa Galletas Fiesta o Alfajores |
| `hero-cookie-3.jpg` | Tercera galleta flotante | Usa Bigote o Corazón |

**Consejo:** Estas imágenes deben ser llamativas y en alta calidad, son lo primero que verán los visitantes.

---

### **2. Productos (6 imágenes)**

| Archivo | Descripción | Foto Original a Usar |
|---------|-------------|----------------------|
| `galletas-mantequilla.jpg` | Galletas de Mantequilla | `00_MISAJO_PUB2_01.jpg` |
| `galletas-chocochips.jpg` | Galletas con Chips de Chocolate | `00_MISAJO_PUB2_02.jpg` |
| `galletas-fiesta.jpg` | Galletas con Grageas de Colores | `00_MISAJO_PUB2_03.jpg` |
| `alfajores.jpg` | Alfajores Tradicionales | `00_MISAJO_PUB2_04.jpg` |
| `alfajores-corazon.jpg` | Alfajores en forma de Corazón | `00_MISAJO_PUB2_05.jpg` |
| `galletas-bigote.jpg` | Galletas Bigote | `00_MISAJO_PUB2_06.jpg` |

**Formato recomendado:**
- Tamaño: Al menos 800x600 px
- Formato: JPG o PNG
- Peso: Optimizado (menos de 500KB cada una)

---

### **3. Combos Navideños (2 imágenes)**

| Archivo | Descripción | Foto Original a Usar |
|---------|-------------|----------------------|
| `combo-premium.jpg` | Combo Premium (Galletas + Licor + Caja) | `WhatsApp_Image_2026-02-16_at_4_59_45_PM__1_.jpeg` |
| `combo-dulce.jpg` | Combo Dulce (Galletas + Vela + Caja) | `WhatsApp_Image_2026-02-16_at_4_59_45_PM.jpeg` |

---

### **4. Sección "Sobre Nosotros" (1 imagen)**

| Archivo | Descripción | Sugerencia |
|---------|-------------|------------|
| `about-misaj-cookie.jpg` | Imagen institucional o del proceso | Puedes usar: <br>• Logo ampliado (`MISAJO_PUB2_LOGO.jpg`)<br>• Foto del proceso de elaboración<br>• Composición de varias galletas<br>• Foto de la cocina o workspace |

---

## 🎨 Logo (Opcional)

Si quieres usar el logo en el header en lugar del texto:

1. Exporta el logo del PDF como PNG con fondo transparente
2. Guárdalo como `images/logo-misaj-cookie.png`
3. En `index.html`, reemplaza la sección del logo:

```html
<!-- Reemplaza esto: -->
<div class="logo-text">
    Misaj <span class="cookie">COOKIE</span>
</div>

<!-- Por esto: -->
<img src="images/logo-misaj-cookie.png" alt="Misaj Cookie" style="height: 60px;">
```

---

## 🚀 Cómo Subir a GitHub Pages

### **Paso 1: Crear Repositorio en GitHub**

1. Ve a [GitHub.com](https://github.com)
2. Click en **"New repository"**
3. Nombre del repositorio: `misajo-cookie` (o el que prefieras)
4. Marca como **Public**
5. Click en **"Create repository"**

### **Paso 2: Subir Archivos**

**Opción A: Desde la Web de GitHub**

1. En tu nuevo repositorio, click en **"Add file"** → **"Upload files"**
2. Arrastra todas las carpetas y archivos del proyecto
3. Escribe un mensaje: "Primera versión del sitio web"
4. Click en **"Commit changes"**

**Opción B: Usando Git desde Terminal**

```bash
# Navega a la carpeta del proyecto
cd misajo-website

# Inicializa Git
git init

# Añade todos los archivos
git add .

# Haz el primer commit
git commit -m "Primera versión del sitio web"

# Conecta con GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/misajo-cookie.git

# Sube los archivos
git branch -M main
git push -u origin main
```

### **Paso 3: Activar GitHub Pages**

1. Ve a tu repositorio en GitHub
2. Click en **"Settings"** (Configuración)
3. En el menú lateral, click en **"Pages"**
4. En **"Source"**, selecciona **"main"** branch
5. Click en **"Save"**
6. ¡Listo! Tu sitio estará en: `https://TU-USUARIO.github.io/misajo-cookie/`

---

## ✅ Checklist Antes de Subir

- [ ] Todas las 12 imágenes están en la carpeta `images/`
- [ ] Los nombres de las imágenes coinciden exactamente con los del código
- [ ] Las imágenes están optimizadas (menos de 500KB cada una)
- [ ] Has probado el sitio localmente abriendo `index.html`
- [ ] Los enlaces de WhatsApp funcionan correctamente
- [ ] Has actualizado los enlaces de Facebook e Instagram con los reales

---

## 📱 Actualizar Redes Sociales

En el archivo `index.html`, busca esta sección y actualiza con tus enlaces reales:

```html
<!-- Línea ~280-290 aproximadamente -->
<a href="https://facebook.com/misajcookie" target="_blank" class="social-btn facebook">
<!-- Cambia "misajcookie" por tu usuario real de Facebook -->

<a href="https://instagram.com/misajcookie" target="_blank" class="social-btn instagram">
<!-- Cambia "misajcookie" por tu usuario real de Instagram -->
```

---

## 🎯 Próximos Pasos (Opcional)

### **Mejoras Futuras:**

1. **Añadir Google Analytics** para ver visitantes
2. **Optimizar SEO** con meta tags
3. **Agregar Favicon** (icono en la pestaña del navegador)
4. **Crear formulario de contacto**
5. **Agregar más productos** según los vayas creando

---

## 🆘 Soporte

Si tienes problemas:

1. Verifica que todos los nombres de archivos sean correctos (sensibles a mayúsculas/minúsculas)
2. Revisa la consola del navegador (F12) para ver errores
3. Asegúrate de que las imágenes estén en formato `.jpg` o `.png`

---

## 📄 Licencia

© 2026 Misaj Cookie. Todos los derechos reservados.

---

**¡Disfruta tu nuevo sitio web! 🍪✨**
