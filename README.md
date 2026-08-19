# Swarovski · Guía de artes de impresión

Landing estática que publica la guía de artes de producción gráfica: tabla
interactiva tipo hoja de cálculo, pop-up con la imagen de cada arte, formulario
de comentarios y descarga del paquete de archivos.

**Producción:** https://www.commandigital.biz/share/swarovski/index.html

---

## Publicar cambios (flujo actual)

Todo va directo a producción, sin ramas ni staging.

```bash
git add -A && git commit -m "lo que cambiaste" && bash deploy.sh
```

En VS Code también está como tarea: `Cmd+Shift+P` → **Tasks: Run Task** →
*Publicar a producción* (o `Cmd+Shift+B`, que la ejecuta directo).

Para ver qué subiría sin tocar el servidor:

```bash
bash deploy.sh --dry-run
```

`deploy.sh` sincroniza por `rsync` sobre SSH y **no sube** `tools/`, `.vscode/`,
`.github/`, `README.md` ni `deploy.sh`: en el servidor solo queda lo que el
navegador necesita.

### Conexión SSH

El alias `commandigital` ya está en `~/.ssh/config`:

```
Host commandigital
  HostName ssh.commandigital.biz
  User u2645-1val7vrtblk8
  Port 18765
  IdentityFile ~/.ssh/commandigital_siteground
```

La llave pública debe estar importada en SiteGround → Site Tools → Devs →
SSH Keys Manager → IMPORT:

```bash
cat ~/.ssh/commandigital_siteground.pub
```

### Si más adelante se usa GitHub

`.github/workflows/deploy.yml` ya está listo: al hacer push a `main` publica
solo. Solo hay que cargar los secrets que el propio archivo documenta.

---

## Ver en local

```bash
python3 -m http.server 4321
```

`http://localhost:4321`. Nota: el formulario necesita PHP, así que en local
cae al respaldo `mailto:`; en el servidor sí envía el correo.

---

## Estructura

```
swarovski-landing/
├── index.html               Marcado + sprite SVG de iconos
├── enviar.php               Endpoint del formulario (PHP mail → hola@commandigital.biz)
├── deploy.sh                Publicación por SSH/rsync
├── assets/
│   ├── css/styles.css       Tokens en :root, Grid, Flexbox, animaciones, responsive
│   ├── js/
│   │   ├── data.js          ← FUENTE DE VERDAD: las artes y las columnas
│   │   └── main.js          Tema, hoja de cálculo, pop-up, formulario, descargas
│   ├── img/artes/           Imágenes de cada arte (ver su LEEME.txt)
│   ├── vendor/              Respaldo local de jQuery
│   └── downloads/           ZIP y CSV que descarga el usuario
└── tools/
    ├── generar-recursos.sh  Regenera ZIP y CSV
    └── kit-src/             Contenido del ZIP (textos + carpeta artes/)
```

---

## Tareas frecuentes

### Cambiar una medida, material o cantidad

Se edita **solo** `assets/js/data.js`. La tabla, el filtro de materiales, los
totales, la barra de estado y el CSV se recalculan solos.

```bash
bash tools/generar-recursos.sh   # actualiza el ZIP y el CSV descargables
bash deploy.sh
```

### Subir la imagen de un arte

Deja el archivo en `assets/img/artes/` con el nombre exacto que indica
`assets/img/artes/LEEME.txt` (p. ej. `01-maquina-garra-trasera.jpg`).
La miniatura y el pop-up lo toman solos, sin tocar código.

### Agregar los archivos .ai al paquete descargable

Cópialos en `tools/kit-src/artes/` y ejecuta `bash tools/generar-recursos.sh`.

---

## Detalles de implementación

| Tema | Dónde |
|---|---|
| Tokens de diseño | `:root` en `styles.css`; el tema claro se hace sobreescribiendo tokens |
| Tema automático | `Theme` en `main.js`: sigue la hora local (claro 7:00–19:00) y se revisa cada minuto. El botón cicla auto → claro → oscuro |
| jQuery | 3.7.1 por CDN con `integrity` + respaldo local |
| Responsive | `clamp()` y breakpoints en 1100 / 860 / 560 px; en móvil la tabla se vuelve tarjetas |
| Formulario | `enviar.php` con honeypot y anti-flood; si no hay PHP, respaldo `mailto:` |
