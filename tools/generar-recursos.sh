#!/usr/bin/env bash
# ------------------------------------------------------------------------------
# Regenera los archivos descargables de la landing a partir de las fuentes.
#
#   assets/js/data.js       → fuente de verdad de la guía (genera el CSV)
#   tools/kit-src/*.txt     → textos del paquete (editables a mano)
#   tools/kit-src/*.txt     → especificaciones que acompañan al CSV
#
# Uso:  bash tools/generar-recursos.sh      (desde la raíz del proyecto)
# ------------------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

OUT="assets/downloads"
BUILD="$(mktemp -d)"
trap 'rm -rf "$BUILD"' EXIT

echo "→ Generando CSV desde assets/js/data.js"
node -e '
  global.window = {};
  require("./assets/js/data.js");
  const d = window.SW_DATA, fs = require("fs");
  const cols = d.columnas.map(c => c.label);
  const esc = v => `"${String(v == null ? "" : v).replace(/"/g, `""`)}"`;
  const lines = [cols.map(esc).join(",")];
  d.hojas.forEach(h => {
    lines.push(esc(h.banda) + ",".repeat(cols.length - 1));
    d.artes.filter(a => a.hoja === h.id).forEach((a, i) => {
      lines.push([i + 1, a.archivo, a.posicion, a.ancho, a.alto, a.rebase,
                  a.material, a.cantidad, a.notas, a.img, a.ubicacion].map(esc).join(","));
    });
  });
  lines.push("", esc(d.documento.nota));
  fs.writeFileSync(process.argv[1], "﻿" + lines.join("\r\n"), "utf8");
' "$BUILD/Guia_Artes_Swarovski.csv"

echo "→ Copiando textos y artes originales"
cp tools/kit-src/*.txt "$BUILD/"
mkdir -p "$BUILD/artes"
cp -R tools/kit-src/artes/. "$BUILD/artes/"

# El paquete que descarga el usuario es swarovski-impresos/all-resources.7z,
# que se mantiene a mano. Aquí solo se refrescan el CSV y las especificaciones.
mkdir -p "$OUT"
cp "$BUILD/Guia_Artes_Swarovski.csv" "$OUT/"
cp tools/kit-src/Especificaciones_Tecnicas.txt "$OUT/"

echo "✓ Listo:"
ls -lh "$OUT" | tail -n +2 | awk '{printf "  %-44s %s\n", $9, $5}'
