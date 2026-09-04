# Swarovski · Guía de artes de impresión

Landing estática que publica la guía de artes de producción gráfica: tabla
interactiva tipo hoja de cálculo, pop-up con la imagen de cada arte, formulario
de comentarios y descarga del paquete de archivos.

**Producción:** https://www.commandigital.biz/share/swarovski/index.html

---

## Publicar cambios (flujo actual)

Todo va directo a producción, sin ramas ni staging. **Con hacer push basta:**

```bash
git add -A && git commit -m "lo que cambiaste" && git push
```

GitHub Actions publica solo en ~10 segundos. El avance se ve en la pestaña
**Actions** del repo, y `version.txt` en producción dice qué versión está viva:
https://www.commandigital.biz/share/swarovski/version.txt

### Plan B: publicar sin GitHub

Si Actions falla o necesitas subir algo urgente:

```bash
bash deploy.sh
```

En VS Code está como tarea: `Cmd+Shift+B`. Y `bash deploy.sh --dry-run` muestra
qué subiría sin tocar el servidor.

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

### Configuración de GitHub Actions

Ya está activa. El workflow vive en `.github/workflows/deploy.yml` y necesita
**un solo secret**:

| Secret | Qué es |
|---|---|
| `SSH_PRIVATE_KEY` | contenido de `~/.ssh/commandigital_siteground` |

El host, el usuario, el puerto y la ruta van como `env` en el propio workflow,
en texto plano a propósito: el servidor solo acepta autenticación por llave, así
que esos datos no abren nada por sí solos. Si el repo llegara a hacerse público,
conviene moverlos de vuelta a secrets.

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
├── .htaccess                Política de caché
├── tools/versionar.sh       Sella los assets con ?v=<hash>
├── deploy.sh                Publicación por SSH/rsync
├── assets/
│   ├── css/styles.css       Tokens en :root, Grid, Flexbox, animaciones, responsive
│   ├── js/
│   │   ├── data.js          ← FUENTE DE VERDAD: las artes y las columnas
│   │   └── main.js          Tema, hoja de cálculo, pop-up, formulario, descargas
│   ├── img/                 Imágenes originales y miniaturas de cada arte
│   ├── vendor/              Respaldo local de jQuery
│   └── downloads/           ZIP y CSV que descarga el usuario
└── tools/
    ├── generar-recursos.sh  Regenera CSV y especificaciones descargables
    └── kit-src/             Contenido del ZIP (textos + carpeta artes/)
```

---

## Tareas frecuentes

### Cambiar una medida, material o cantidad

Se edita **solo** `assets/js/data.js`. La tabla, el filtro de materiales, los
totales, la barra de estado y el CSV se recalculan solos.

```bash
bash tools/generar-recursos.sh   # actualiza el CSV descargable
bash deploy.sh
```

### Subir la imagen de un arte

Deja el original en `assets/img/` con el nombre indicado en `assets/js/data.js`.
Las miniaturas JPG de 400 px viven en `assets/img/thumbs/`; el despliegue las
regenera automáticamente cuando cambia una imagen original.

### Agregar los archivos .ai al paquete descargable

El paquete principal `assets/downloads/swarovski-impresos/all-resources.7z` se mantiene a
mano. Los descargables individuales también viven en `assets/downloads/` y se
enlazan desde el nombre del archivo en la tabla mediante `descarga` en
`assets/js/data.js`.

---

## Detalles de implementación

| Tema | Dónde |
|---|---|
| Tokens de diseño | `:root` en `styles.css`; el tema claro se hace sobreescribiendo tokens |
| Tema automático | `Theme` en `main.js`: sigue la hora local (claro 7:00–19:00) y se revisa cada minuto. El botón cicla auto → claro → oscuro |
| jQuery | 3.7.1 por CDN con `integrity` + respaldo local |
| Responsive | `clamp()` y breakpoints en 1100 / 860 / 560 px; en móvil la tabla se vuelve tarjetas |
| Formulario | `enviar.php` con honeypot y anti-flood; si no hay PHP, respaldo `mailto:` |

---

## Caché: por qué un cambio se ve al instante

El hosting sirve los archivos estáticos directamente desde NGINX, saltándose el
`.htaccess`, y les pone 180 días de caché. Eso significaba que una publicación
tardaba meses en verse. Se resolvió con dos piezas que trabajan juntas:

**1. La portada es `index.php`, no `index.html`.** Los archivos dinámicos sí
pasan por Apache, así que sí respetan el `.htaccess` y la página se revalida en
cada visita. Un `RewriteRule` mantiene viva la liga con `/index.html`.

**2. Los assets llevan su huella en la URL.** `tools/versionar.sh` reescribe
cada referencia como `assets/css/styles.css?v=056de980`, donde el hash sale del
contenido del archivo. Al cambiar el archivo cambia la URL, y el navegador la
pide de nuevo aunque tenga la vieja guardada un año.

El sellado corre solo dentro del deploy, en los dos caminos. No hay que
acordarse de nada ni bumpear versiones a mano.

**Un detalle a tener presente:** quien haya abierto la página antes del
19/08/2026 tiene una copia guardada con la política vieja y necesita un
recargado forzado (`Cmd+Shift+R`) una sola vez. De ahí en adelante, automático.

### Peso de la página

| | Transferido |
|---|---|
| Primera visita | ~66 KB (gzip) |
| Visitas siguientes | ~7 KB — solo el HTML |

jQuery es la mitad del peso inicial (33 KB). Si algún día se quiere bajar, ahí
está el margen.
