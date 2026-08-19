#!/usr/bin/env bash
# ------------------------------------------------------------------------------
# Genera index.php a partir de index.html, solo al momento de publicar.
#
# ¿Por qué? El hosting sirve los .html directamente desde NGINX, sin pasar por
# Apache, y les impone 180 días de caché: una publicación tardaría meses en
# verse. Los archivos dinámicos sí respetan el .htaccess, así que en producción
# la portada se sirve como PHP y se revalida en cada visita.
#
# index.html sigue siendo el archivo que se edita —y el que funciona con
# cualquier servidor local, incluido Live Server—; index.php es un envoltorio
# generado que no se versiona en git.
#
# Uso:  bash tools/generar-index-php.sh [carpeta]
# ------------------------------------------------------------------------------
set -euo pipefail

RAIZ="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

{
  cat <<'PHP'
<?php
/**
 * Envoltorio generado por tools/generar-index-php.sh — no editar a mano.
 * El archivo que se edita es index.html.
 */
header('Cache-Control: no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');
?>
PHP
  cat "$RAIZ/index.html"
} > "$RAIZ/index.php"

echo "  index.php generado ($(wc -c < "$RAIZ/index.php" | tr -d ' ') bytes)"
