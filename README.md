# Swarovski · Crystal Night 2026 — Landing de guía de artes

Landing page estática que reproduce una **guía de artes de impresión** (como la que
se comparte en Excel o Google Sheets) con una tabla interactiva, mockups de cada
pieza y descarga del kit de recursos.

> Maqueta de demostración con textos y mockups genéricos: no incluye material
> gráfico oficial de ninguna marca.

## Cómo verlo

Basta con abrir `index.html` en el navegador. Para que las descargas y el CSV se
comporten igual que en producción, conviene servirlo por HTTP:

```bash
python3 -m http.server 4321 --directory swarovski-landing
```

Después entra a `http://localhost:4321`.

## Estructura

```
swarovski-landing/
├── index.html                  Marcado semántico + sprite SVG de iconos
├── assets/
│   ├── css/styles.css          Tokens en :root, Grid, Flexbox, animaciones, responsive
│   ├── js/
│   │   ├── data.js             Fuente de verdad: columnas, hojas y artes
│   │   └── main.js             Módulos jQuery: tema, nav, reveal, hoja, descargas
│   ├── img/                    12 mockups en SVG (generados, sin dependencias)
│   ├── vendor/jquery-3.7.1.min.js   Respaldo local del CDN
│   └── downloads/              Archivos que descarga el usuario (ZIP, CSV, TXT)
└── tools/
    ├── generar-mockups.py      Regenera los SVG de assets/img
    ├── generar-recursos.sh     Regenera CSV y ZIP de assets/downloads
    └── kit-src/                Textos que van dentro del ZIP
```

## Qué se contempló

| Requisito | Dónde |
|---|---|
| Buenas prácticas | HTML semántico, ARIA, `alt`, `skip link`, foco visible, SRI en el CDN, JS en módulos con `"use strict"`, sin variables globales sueltas |
| `:root` | Bloque 01 de `styles.css`: color, tipografía fluida, espaciado, sombras, transiciones y capas como custom properties; tema claro por sobreescritura de tokens |
| jQuery | `assets/js/main.js` (3.7.1 vía CDN con `integrity` + respaldo local): filtros, orden, selección de celda, contadores, menú, tema y descargas |
| Responsive | Escala fluida con `clamp()`, breakpoints en 1100 / 860 / 560 px; la tabla se convierte en tarjetas apiladas en móvil |
| Flexbox | Header, barras de la hoja, listas de archivos, footer, botones |
| CSS Grid | Hero, tarjetas de especificaciones, estadísticas, descargas, footer y las celdas del modo tarjeta |
| Animaciones CSS | `@keyframes` de entrada, flotación del cristal, brillo del botón, marquesina, destellos, anillos y barra de progreso; todo anulado con `prefers-reduced-motion` |

## La hoja de cálculo

`assets/js/data.js` es el único lugar donde se editan las artes. Al cambiarlo se
actualizan solos la tabla, los totales, el filtro de materiales, las pestañas y el CSV.

Incluye letras de columna, numeración de filas, barra de fórmulas, encabezados
fijos, banda de sección, totales fijos al pie, pestañas de hoja y barra de estado.
Se puede buscar, filtrar por material, ordenar por cualquier columna, seleccionar
celdas (con navegación por flechas), exportar a CSV e imprimir.

Para regenerar los archivos descargables después de editar los datos:

```bash
bash tools/generar-recursos.sh
```

## Compatibilidad

Navegadores actuales (Chrome, Edge, Safari, Firefox). Sin proceso de build ni
dependencias de Node en tiempo de ejecución: es HTML, CSS y JavaScript servidos
tal cual. Los scripts de `tools/` solo se usan para regenerar assets.
