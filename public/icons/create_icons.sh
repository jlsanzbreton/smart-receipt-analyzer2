#!/bin/bash

echo "Creando iconos para la PWA..."

# Crear icono básico con texto (usando caracteres ASCII art)
# Este es un enfoque simple, pero funcionará para probar la PWA
cat > icon.svg << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0D9488" />
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">SRA</text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="30" fill="white" text-anchor="middle" dominant-baseline="middle">Receipt Analyzer</text>
</svg>
EOF

# Convertir a PNG si se tiene disponible ImageMagick
if command -v convert &> /dev/null; then
  convert -background none icon.svg icon-512x512.png
  convert -resize 192x192 icon-512x512.png icon-192x192.png
  echo "Iconos creados con ImageMagick"
else
  # Alternativa: copiar el SVG como ambos iconos si no está disponible ImageMagick
  cp icon.svg icon-512x512.png
  cp icon.svg icon-192x192.png
  echo "ImageMagick no está instalado. Se han copiado los archivos SVG como PNG."
  echo "Para mejores resultados, instala ImageMagick o reemplaza manualmente los iconos."
fi

echo "Iconos creados en la carpeta actual."
