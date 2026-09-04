# Guía de artes Swarovski

Landing estática que publica la guía de artes de impresión de un evento: tabla
interactiva tipo hoja de cálculo, pop-up con la foto de cada arte, notas de
producción, formulario de comentarios y descarga del paquete de archivos.

**Producción:** https://www.commandigital.biz/share/swarovski/
**Repo:** git@github.com:alex7cmd/swarovski-landing.git (privado)

El idioma de trabajo es español: comentarios de código, commits y respuestas.

---

## Cómo se publica

Todo va **directo a producción**. No hay ramas, ni staging, ni entorno de
desarrollo — así lo pidió el cliente.

```bash
git add -A && git commit -m "lo que cambiaste" && git push
```

GitHub Actions publica en ~10 s. El workflow vive en `.github/workflows/deploy.yml`
y necesita un solo secret, `SSH_PRIVATE_KEY`; el resto de datos de conexión van
como `env` en el propio archivo porque no son sensibles (el servidor solo acepta
autenticación por llave).

### Plan B

```bash
bash deploy.sh          # publica en 2 s
bash deploy.sh --dry-run
```

**Actions es intermitente**: de ~19 ejecuciones, varias no publicaron. El fallo
no deja mensaje propio, dura 9 s y es un rechazo inmediato de la conexión.
Sospecha principal: SiteGround bloquea algunas IPs de los runners de GitHub.
Ya se agregaron reintentos (3 intentos con 15 s de espera) y errores legibles
como anotación, para que la próxima falla diga su motivo en la pestaña Actions.

### Comprobar qué está vivo

```
https://www.commandigital.biz/share/swarovski/version.txt
```

Dice el commit publicado y **quién lo publicó**: `GitHub Actions (run #N)` o
`deploy.sh (manual)`. Esa firma existe porque sin ella un despliegue manual se
confundía con uno automático al diagnosticar.

### Servidor

Alias SSH ya configurado en `~/.ssh/config`:

```
Host commandigital
  HostName ssh.commandigital.biz
  User u2645-1val7vrtblk8
  Port 18765
  IdentityFile ~/.ssh/commandigital_siteground
```

Ruta remota: `www/commandigital.biz/public_html/share/swarovski`.
PHP 8.3 (probado compatible de 8.1 a 8.6). En todo el dominio solo hay **un
archivo PHP**: `enviar.php`. No hay WordPress.

---

## Estructura

```
swarovski-landing/
├── index.html               ← se edita este
├── enviar.php               Formulario → hola@commandigital.biz
├── .htaccess                Política de caché
├── deploy.sh                Publicación manual
├── assets/
│   ├── css/styles.css       Tokens en :root, Grid, Flexbox, animaciones
│   ├── js/
│   │   ├── data.js          ← FUENTE DE VERDAD de la guía
│   │   └── main.js          Módulos: tema, hoja, pop-up, formulario
│   ├── img/                 Fotos originales + /thumbs generadas
│   ├── vendor/              Respaldo local de jQuery 3.7.1
│   └── downloads/           swarovski-impresos/all-resources.7z + CSV
└── tools/
    ├── versionar.sh         Sella assets con ?v=<hash>
    ├── generar-index-php.sh Envuelve index.html en PHP al publicar
    ├── generar-miniaturas.sh Crea /thumbs con sips
    └── generar-recursos.sh  Regenera el CSV
```

`index.php` y `version.txt` **se generan al publicar** y están en `.gitignore`.

---

## Decisiones que no son obvias

Cada una resuelve un problema concreto. Conviene entenderlas antes de cambiarlas.

### La portada se sirve como PHP

SiteGround tiene **NGINX Direct Delivery**: sirve los archivos estáticos sin
pasar por Apache y les impone 180 días de caché, ignorando el `.htaccess`. Una
publicación tardaba meses en verse.

Los archivos dinámicos sí respetan el `.htaccess`, así que al publicar se genera
`index.php` a partir de `index.html`. El `.html` se excluye del rsync y un
`RewriteRule` mantiene viva la liga con `/index.html` que ya se compartió.

`index.html` sigue siendo el archivo que se edita, para que la vista previa local
funcione con cualquier servidor estático.

### Los assets llevan su huella en la URL

`tools/versionar.sh` reescribe cada referencia como `styles.css?v=056de980`,
donde el hash sale del contenido. Al cambiar el archivo cambia la URL, así que
se pueden cachear un año sin riesgo.

**No renombrar archivos para "romper la caché"** — el versionado ya lo resuelve,
y renombrar deja en 404 a quien tenga el enlace guardado.

Las imágenes de la tabla las inserta el JS, así que su versión vive en el campo
`versionAssets` de `data.js`, que el mismo script sella con el hash de la carpeta.

### Miniaturas aparte

Las fotos vienen a 2000×1500 (~1 MB entre todas) y la tabla las muestra a 84 px.
`tools/generar-miniaturas.sh` crea JPEG de 400 px (~15 KB) con `sips`, que viene
con macOS. La tabla carga ~160 KB en vez de 1 MB; la foto completa solo se baja
al abrir el pop-up.

### El umbral de la animación de entrada va en 0

Iba en `threshold: 0.08` (8% del bloque visible). Al crecer la tabla,
en móvil el bloque midió más de 10 000 px y en una pantalla de 844 px el máximo
alcanzable es 7%: **el contenido quedó invisible en todos los teléfonos**.

Hoy hay tres capas: umbral 0, un vigilante que revisa posiciones cada 700 ms sin
depender de eventos, y un seguro que apaga el efecto si tras un minuto algo
sigue oculto dentro de la pantalla. El CSS además solo oculta cuando hay
JavaScript (clase `con-js`), de modo que un fallo del script no deja la página
en blanco.

### Tipografía: la hoja tiene su propia escala

`--fs-sheet` existe aparte de `--fs-xs` porque en escritorio la tabla es una
rejilla densa y en móvil se convierte en tarjetas que deben leerse. Antes ambos
casos compartían valor y ganaba el escritorio: el cuerpo iba en 15 px y las
etiquetas en 9.6 px.

**Los campos de formulario van en 16 px en móvil.** Por debajo de ese umbral
Safari en iOS hace zoom solo al enfocarlos.

### Tema automático por hora

Tres estados: `auto` (claro 7:00–19:00, oscuro el resto, revisado cada minuto),
`light` y `dark`. El botón cicla entre ellos. No muestra aviso al cambiar: se
apilaban en pantalla y el cambio ya es evidente.

El cisne y el logotipo van **incrustados** en el HTML con `fill="currentColor"`,
no enlazados: los SVG originales traen el color fijo en `#231f20` y enlazados
habrían quedado invisibles en tema oscuro. Si cambian, hay que actualizar el
bloque `.brand` del HTML, no basta con reemplazar el archivo.

---

## Tareas frecuentes

### Cambiar medidas, materiales o cantidades

Se edita **solo** `assets/js/data.js`. La tabla, el filtro de materiales, los
totales, la cifra del hero y el CSV se recalculan solos.

```bash
bash tools/generar-recursos.sh   # actualiza el CSV descargable
git add -A && git commit -m "..." && git push
```

### Subir la foto de un arte

Déjala en `assets/img/` con el nombre que indica el campo `img` de `data.js`,
luego:

```bash
bash tools/generar-miniaturas.sh
```

### Actualizar el paquete descargable

Reemplaza `assets/downloads/swarovski-impresos/all-resources.7z` conservando el nombre. El
versionado se encarga de la caché.

---

## Estado actual

- 17 artes, 23 piezas, 5 materiales, una sola hoja llamada «Artes».
- Faltan fotos propias para las dos filas de **parte trasera** de la máquina
  garra (11 y 12); usan la foto anterior mientras tanto.
- La sección de especificaciones técnicas está **oculta** con el atributo
  `hidden` en el HTML; el cliente la quiere para más adelante.
- El formulario está probado y llega el correo.
