# 📋 INSTRUCCIONES: Cómo Renombrar tus Imágenes

## Paso a Paso para Preparar las Imágenes

### 🔄 Proceso de Renombrado

Tienes 10 archivos que debes renombrar según esta tabla:

| Nombre Actual | Nuevo Nombre | Ubicación Final |
|---------------|--------------|-----------------|
| `00_MISAJO_PUB2_01.jpg` | `galletas-mantequilla.jpg` | `images/` |
| `00_MISAJO_PUB2_02.jpg` | `galletas-chocochips.jpg` | `images/` |
| `00_MISAJO_PUB2_03.jpg` | `galletas-fiesta.jpg` | `images/` |
| `00_MISAJO_PUB2_04.jpg` | `alfajores.jpg` | `images/` |
| `00_MISAJO_PUB2_05.jpg` | `alfajores-corazon.jpg` | `images/` |
| `00_MISAJO_PUB2_06.jpg` | `galletas-bigote.jpg` | `images/` |
| `WhatsApp_Image_2026-02-16_at_4_59_45_PM__1_.jpeg` | `combo-premium.jpg` | `images/` |
| `WhatsApp_Image_2026-02-16_at_4_59_45_PM.jpeg` | `combo-dulce.jpg` | `images/` |
| `MISAJO_PUB2_LOGO.jpg` | `about-misaj-cookie.jpg` | `images/` |

### 📸 Imágenes Hero (Elige 3 para el banner principal)

Para las imágenes flotantes del hero, **elige 3** de tus mejores fotos:

**Opción Recomendada:**
- `hero-cookie-1.jpg` ← Copia de `galletas-chocochips.jpg` (más popular)
- `hero-cookie-2.jpg` ← Copia de `galletas-fiesta.jpg` (colorida, llamativa)
- `hero-cookie-3.jpg` ← Copia de `alfajores-corazon.jpg` (romántica)

**Opción Alternativa:**
- `hero-cookie-1.jpg` ← Copia de `galletas-mantequilla.jpg`
- `hero-cookie-2.jpg` ← Copia de `galletas-bigote.jpg`
- `hero-cookie-3.jpg` ← Copia de `alfajores.jpg`

---

## 🖥️ Métodos para Renombrar

### **Opción 1: Manualmente (Windows/Mac)**

1. Abre la carpeta donde tienes las imágenes
2. Click derecho en el archivo
3. Selecciona "Renombrar" / "Rename"
4. Escribe el nuevo nombre exactamente como se indica

### **Opción 2: Script Automático (Windows)**

Crea un archivo `renombrar.bat` en la carpeta de imágenes con este contenido:

```batch
@echo off
ren "00_MISAJO_PUB2_01.jpg" "galletas-mantequilla.jpg"
ren "00_MISAJO_PUB2_02.jpg" "galletas-chocochips.jpg"
ren "00_MISAJO_PUB2_03.jpg" "galletas-fiesta.jpg"
ren "00_MISAJO_PUB2_04.jpg" "alfajores.jpg"
ren "00_MISAJO_PUB2_05.jpg" "alfajores-corazon.jpg"
ren "00_MISAJO_PUB2_06.jpg" "galletas-bigote.jpg"
ren "WhatsApp_Image_2026-02-16_at_4_59_45_PM__1_.jpeg" "combo-premium.jpg"
ren "WhatsApp_Image_2026-02-16_at_4_59_45_PM.jpeg" "combo-dulce.jpg"
ren "MISAJO_PUB2_LOGO.jpg" "about-misaj-cookie.jpg"

:: Duplicar imágenes para hero
copy "galletas-chocochips.jpg" "hero-cookie-1.jpg"
copy "galletas-fiesta.jpg" "hero-cookie-2.jpg"
copy "alfajores-corazon.jpg" "hero-cookie-3.jpg"

echo ¡Listo! Todas las imágenes han sido renombradas.
pause
```

Luego, doble click en `renombrar.bat` y se ejecutará automáticamente.

### **Opción 3: Script Automático (Mac/Linux)**

Crea un archivo `renombrar.sh` con este contenido:

```bash
#!/bin/bash

mv "00_MISAJO_PUB2_01.jpg" "galletas-mantequilla.jpg"
mv "00_MISAJO_PUB2_02.jpg" "galletas-chocochips.jpg"
mv "00_MISAJO_PUB2_03.jpg" "galletas-fiesta.jpg"
mv "00_MISAJO_PUB2_04.jpg" "alfajores.jpg"
mv "00_MISAJO_PUB2_05.jpg" "alfajores-corazon.jpg"
mv "00_MISAJO_PUB2_06.jpg" "galletas-bigote.jpg"
mv "WhatsApp_Image_2026-02-16_at_4_59_45_PM__1_.jpeg" "combo-premium.jpg"
mv "WhatsApp_Image_2026-02-16_at_4_59_45_PM.jpeg" "combo-dulce.jpg"
mv "MISAJO_PUB2_LOGO.jpg" "about-misaj-cookie.jpg"

# Duplicar imágenes para hero
cp "galletas-chocochips.jpg" "hero-cookie-1.jpg"
cp "galletas-fiesta.jpg" "hero-cookie-2.jpg"
cp "alfajores-corazon.jpg" "hero-cookie-3.jpg"

echo "¡Listo! Todas las imágenes han sido renombradas."
```

Dale permisos de ejecución y ejecútalo:

```bash
chmod +x renombrar.sh
./renombrar.sh
```

---

## 📦 Optimización de Imágenes (Recomendado)

Para que tu sitio cargue más rápido, optimiza las imágenes:

### **Herramientas Online Gratis:**

1. **TinyPNG** → https://tinypng.com/
   - Arrastra todas las imágenes
   - Descarga las versiones optimizadas
   
2. **Squoosh** → https://squoosh.app/
   - Más control sobre la compresión
   - Ideal para ajustar calidad vs peso

3. **ImageOptim** (Mac) → https://imageoptim.com/
   - Aplicación gratuita de escritorio

### **Tamaños Recomendados:**

- **Productos e Hero:** 800x600px (paisaje) o 600x800px (retrato)
- **Combos:** 1000x750px
- **About:** 800x800px (cuadrado)
- **Peso:** Máximo 300-500KB por imagen

---

## ✅ Checklist Final

- [ ] 6 imágenes de productos renombradas ✓
- [ ] 2 imágenes de combos renombradas ✓
- [ ] 1 imagen de "Sobre nosotros" renombrada ✓
- [ ] 3 imágenes hero creadas (pueden ser copias) ✓
- [ ] Todas en la carpeta `images/` ✓
- [ ] Imágenes optimizadas (opcional pero recomendado) ✓
- [ ] Todas en formato `.jpg` ✓

---

## 🎯 Resultado Final

Tu carpeta `images/` debe tener exactamente **12 archivos**:

```
images/
├── alfajores-corazon.jpg
├── alfajores.jpg
├── about-misaj-cookie.jpg
├── combo-dulce.jpg
├── combo-premium.jpg
├── galletas-bigote.jpg
├── galletas-chocochips.jpg
├── galletas-fiesta.jpg
├── galletas-mantequilla.jpg
├── hero-cookie-1.jpg
├── hero-cookie-2.jpg
└── hero-cookie-3.jpg
```

---

## 🆘 Problemas Comunes

### "La imagen no se ve en la página"

✅ **Solución:**
- Verifica que el nombre sea **exactamente** igual (mayúsculas/minúsculas importan)
- Asegúrate de que esté en la carpeta `images/`
- Revisa que la extensión sea `.jpg` (no `.jpeg`)

### "El sitio se ve raro"

✅ **Solución:**
- Asegúrate de tener las 3 carpetas: `css/`, `js/`, `images/`
- Verifica que `index.html` esté en la raíz del proyecto
- Limpia caché del navegador (Ctrl + F5)

---

**¡Ya estás listo para tener todas las imágenes correctamente configuradas! 🎉**
