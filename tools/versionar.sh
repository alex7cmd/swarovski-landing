#!/usr/bin/env bash
# ------------------------------------------------------------------------------
# Sella index.html y data.js con la huella de cada archivo, para romper la caché
# solo cuando el contenido cambia de verdad.
#
#   assets/css/styles.css  →  assets/css/styles.css?v=a1b2c3d4
#
# Es idempotente: se puede correr mil veces y el resultado es el mismo mientras
# los archivos no cambien. Lo ejecuta el deploy automáticamente; no hace falta
# llamarlo a mano.
#
# Uso:  bash tools/versionar.sh [carpeta]      (por defecto, la del proyecto)
# ------------------------------------------------------------------------------
set -euo pipefail

RAIZ="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

python3 - "$RAIZ" <<'PY'
import hashlib, io, os, re, sys

raiz = sys.argv[1]

def huella(ruta_rel):
    """Hash corto del contenido de un archivo."""
    p = os.path.join(raiz, ruta_rel)
    if not os.path.isfile(p):
        return None
    h = hashlib.md5()
    with open(p, "rb") as f:
        for bloque in iter(lambda: f.read(65536), b""):
            h.update(bloque)
    return h.hexdigest()[:8]

def huella_carpeta(rel):
    """Hash de una carpeta completa: cambia si cambia cualquier archivo."""
    base = os.path.join(raiz, rel)
    if not os.path.isdir(base):
        return "0"
    h = hashlib.md5()
    for dirpath, _, nombres in sorted(os.walk(base)):
        for n in sorted(nombres):
            if n.startswith("."):
                continue
            p = os.path.join(dirpath, n)
            h.update(os.path.relpath(p, base).encode())
            with open(p, "rb") as f:
                for bloque in iter(lambda: f.read(65536), b""):
                    h.update(bloque)
    return h.hexdigest()[:8]

cambios = []

# --- 1. Las imágenes de los artes las inserta el JS, así que su versión vive
#        en data.js. Se sella primero para que el hash de data.js ya la incluya.
data_js = os.path.join(raiz, "assets/js/data.js")
if os.path.isfile(data_js):
    v_img = huella_carpeta("assets/img/artes")
    s = io.open(data_js, encoding="utf-8").read()
    nuevo, n = re.subn(r'(versionAssets:\s*")[^"]*(")', r'\g<1>%s\g<2>' % v_img, s)
    if n and nuevo != s:
        io.open(data_js, "w", encoding="utf-8").write(nuevo)
        cambios.append(("assets/img/artes/ (vía data.js)", v_img))
    elif n:
        cambios.append(("assets/img/artes/ (sin cambios)", v_img))

# --- 2. Referencias a assets dentro de index.html -----------------------------
html = os.path.join(raiz, "index.html")
s = io.open(html, encoding="utf-8").read()

patron = re.compile(r'(?P<attr>href|src)="(?P<ruta>assets/[^"?#]+)(?:\?v=[0-9a-f]+)?"')

def reemplazo(m):
    ruta = m.group("ruta")
    v = huella(ruta)
    if not v:
        return m.group(0)
    cambios.append((ruta, v))
    return '%s="%s?v=%s"' % (m.group("attr"), ruta, v)

nuevo = patron.sub(reemplazo, s)
if nuevo != s:
    io.open(html, "w", encoding="utf-8").write(nuevo)

if cambios:
    for ruta, v in cambios:
        print("  %-46s ?v=%s" % (ruta, v))
else:
    print("  (sin referencias que sellar)")
PY
