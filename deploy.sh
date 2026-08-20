#!/usr/bin/env bash
# ------------------------------------------------------------------------------
# Publica la landing en producción (SiteGround) por SSH/rsync.
#
#   https://www.commandigital.biz/share/swarovski/index.html
#
# Uso:
#   bash deploy.sh              → sube los cambios
#   bash deploy.sh --dry-run    → muestra qué subiría, sin tocar el servidor
#
# Requisitos: la llave ~/.ssh/commandigital_siteground autorizada en
# SiteGround → Site Tools → Devs → SSH Keys Manager.
# ------------------------------------------------------------------------------
set -euo pipefail

HOST="${SW_HOST:-commandigital}"                     # alias de ~/.ssh/config
REMOTE="${SW_REMOTE:-www/commandigital.biz/public_html/share/swarovski}"
LOCAL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# rsync corre con --delete: si la ruta remota fuera la equivocada borraría
# lo que no es. Se valida antes de tocar nada.
case "$REMOTE" in
  /*)               echo "✗ SW_REMOTE debe ser relativo al home, sin / inicial." >&2; exit 1 ;;
  */share/swarovski) : ;;
  *)                echo "✗ SW_REMOTE debe terminar en share/swarovski." >&2; exit 1 ;;
esac

DRY=""
[ "${1:-}" = "--dry-run" ] && DRY="--dry-run"

echo "→ Verificando conexión con $HOST"
if ! ssh -o BatchMode=yes -o ConnectTimeout=15 "$HOST" 'exit' 2>/dev/null; then
  cat >&2 <<'MSG'
✗ No se pudo conectar por SSH.

  1. Copia la llave pública:      cat ~/.ssh/commandigital_siteground.pub
  2. SiteGround → Site Tools → Devs → SSH Keys Manager → IMPORT → pégala.
  3. Vuelve a ejecutar este script.
MSG
  exit 1
fi

echo "→ Comprobando la carpeta remota"
if ! ssh "$HOST" "[ -d \"\$HOME/$REMOTE\" ]"; then
  echo "  · No existe ~/$REMOTE — se creará"
  ssh "$HOST" "mkdir -p \"\$HOME/$REMOTE\""
fi

echo "→ Generando miniaturas"
bash "$LOCAL/tools/generar-miniaturas.sh"

echo "→ Sellando assets con su versión"
bash "$LOCAL/tools/versionar.sh" "$LOCAL"
bash "$LOCAL/tools/generar-index-php.sh" "$LOCAL"

{
  echo "Publicado el $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
  echo "Commit: $(git -C "$LOCAL" rev-parse --short HEAD 2>/dev/null || echo 'sin git')"
  echo "Origen: deploy.sh (manual)"
} > "$LOCAL/version.txt"

echo "→ Sincronizando${DRY:+ (simulación)}"
rsync -rlptzv --checksum $DRY \
  --delete \
  --exclude '.git/' \
  --exclude '.github/' \
  --exclude '.vscode/' \
  --exclude '.DS_Store' \
  --exclude 'node_modules/' \
  --exclude 'tools/' \
  --exclude 'deploy.sh' \
  --exclude '.gitignore' \
  --exclude 'README.md' \
  --exclude 'index.html' \
  "$LOCAL/" "$HOST:$REMOTE/"

echo
echo "✓ Publicado en https://www.commandigital.biz/share/swarovski/index.html"
