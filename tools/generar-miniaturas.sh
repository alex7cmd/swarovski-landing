#!/usr/bin/env bash
# ------------------------------------------------------------------------------
# Genera las miniaturas de la tabla a partir de las imágenes originales.
#
#   assets/img/*.webp        →  originales (se abren en el pop-up)
#   assets/img/thumbs/*.jpg  →  400 px de ancho (se ven en la tabla)
#
# ¿Por qué? Las fotos vienen a 2000×1500 y pesan ~1 MB entre todas. La tabla
# las muestra a 84 px, así que descargar el original sería tirar el ancho de
# banda: la página completa pesa 66 KB. Las miniaturas suman ~85 KB y la foto
# grande solo se descarga cuando alguien abre el pop-up.
#
# Usa sips, que viene con macOS: no hay que instalar nada.
#
# Uso:  bash tools/generar-miniaturas.sh [carpeta]
# ------------------------------------------------------------------------------
set -euo pipefail

RAIZ="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
ORIGEN="$RAIZ/assets/img"
DESTINO="$ORIGEN/thumbs"
ANCHO=400

mkdir -p "$DESTINO"

if ! command -v sips >/dev/null 2>&1; then
  echo "✗ sips no está disponible (¿no estás en macOS?)." >&2
  echo "  Genera las miniaturas a mano: 400 px de ancho, JPEG, en assets/img/thumbs/" >&2
  exit 1
fi

generadas=0
for origen in "$ORIGEN"/*.webp "$ORIGEN"/*.jpg "$ORIGEN"/*.jpeg "$ORIGEN"/*.png; do
  [ -e "$origen" ] || continue
  nombre="$(basename "$origen")"
  destino="$DESTINO/${nombre%.*}.jpg"

  # Solo regenera si la original es más nueva que la miniatura
  if [ -f "$destino" ] && [ "$destino" -nt "$origen" ]; then
    continue
  fi

  sips -s format jpeg -s formatOptions 72 -Z "$ANCHO" "$origen" --out "$destino" >/dev/null 2>&1
  printf "  %-52s %5s KB\n" "thumbs/${nombre%.*}.jpg" "$(( $(stat -f%z "$destino") / 1024 ))"
  generadas=$((generadas + 1))
done

# Limpia miniaturas cuya original ya no existe
for m in "$DESTINO"/*.jpg; do
  [ -e "$m" ] || continue
  base="$(basename "$m" .jpg)"
  if ! ls "$ORIGEN/$base".* >/dev/null 2>&1; then
    rm -f "$m"
    echo "  (borrada $base.jpg: ya no existe su original)"
  fi
done

if [ "$generadas" -eq 0 ]; then
  echo "  todas las miniaturas están al día"
else
  echo "  ─────────────────────────────────────────────────────────"
  printf "  %-52s %5s KB\n" "TOTAL miniaturas" "$(( $(du -k "$DESTINO" | cut -f1) ))"
fi
