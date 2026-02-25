#!/bin/bash
# ============================================================
# Script de compresión de imágenes WebP - MisajoCookies
# Ahorro estimado: ~9.4 MB (según auditoría PageSpeed)
#
# REQUISITOS (instalar uno de los dos):
#   Opción A - cwebp (Google libwebp):
#     Windows: https://storage.googleapis.com/downloads.webmasters/tools/cwebp-1.3.2-windows-x64.zip
#     Mac:     brew install webp
#     Linux:   apt install webp
#
#   Opción B - Squoosh CLI (Node.js):
#     npm install -g @squoosh/cli
#     Reemplaza "cwebp" por "squoosh-cli --webp '{quality:75}'"
#
# USO: bash compress-images.sh
# ============================================================

IMG="assets/images"
QUALITY=75  # Reducir a 70 para mayor compresión (sacrifica algo de calidad)

compress() {
  local src="$1"
  local tmp="${src%.webp}.tmp.webp"

  # Decodificar a PNG temporal, luego recomprimir con calidad menor
  if dwebp "$src" -o "$tmp.png" -quiet && \
     cwebp -q $QUALITY "$tmp.png" -o "$tmp" -quiet; then

    local orig=$(stat -c%s "$src" 2>/dev/null || stat -f%z "$src")
    local new=$(stat -c%s "$tmp" 2>/dev/null || stat -f%z "$tmp")

    if [ "$new" -lt "$orig" ]; then
      mv "$tmp" "$src"
      echo "✓ $(basename $src): ${orig}B → ${new}B (ahorro: $(( (orig-new)/1024 ))KB)"
    else
      echo "- $(basename $src): ya está optimizado"
      rm -f "$tmp"
    fi
    rm -f "$tmp.png"
  else
    echo "✗ Error procesando $(basename $src)"
    rm -f "$tmp" "$tmp.png"
  fi
}

echo "Comprimiendo imágenes con calidad $QUALITY%..."
compress "$IMG/hero-cookie-1.webp"    # 2486 KB → estimado ~200 KB
compress "$IMG/hero-cookie-2.webp"    #  579 KB → estimado ~100 KB
compress "$IMG/hero-cookie-3.webp"    # 1234 KB → estimado ~120 KB
compress "$IMG/about-misaj-cookie.webp" # 1006 KB → estimado ~180 KB
compress "$IMG/combo-premium1.webp"   #  763 KB → estimado ~300 KB
compress "$IMG/combo-premium2.webp"   #  771 KB → estimado ~310 KB
compress "$IMG/galletas-toping1.webp" #  640 KB → estimado ~270 KB
compress "$IMG/galletas-toping2.webp" #  718 KB → estimado ~290 KB
compress "$IMG/combo-dulce.webp"      #  689 KB → estimado ~275 KB
compress "$IMG/alfajores.webp"        #  638 KB → estimado ~255 KB
compress "$IMG/galletas-mantequilla.webp" # 435 KB → estimado ~175 KB
echo "¡Listo!"
