<?php
/**
 * Punto de entrada de la guía de artes.
 *
 * Es .php y no .html a propósito: el hosting sirve los archivos estáticos
 * directamente desde NGINX, saltándose el .htaccess y cacheándolos 180 días.
 * Al pasar por PHP, la página se revalida en cada visita y una publicación
 * se ve al instante. Los assets sí se sirven estáticos (rápido) porque
 * llevan ?v=<hash> en la URL y no necesitan revalidarse.
 */
header('Cache-Control: no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');
?>
<!DOCTYPE html>
<html lang="es" data-theme="dark" data-theme-pref="auto">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Swarovski · Guía de artes de impresión</title>

  <meta name="description" content="Guía de artes de impresión Swarovski: medidas, materiales, cantidades y ubicación de cada pieza, con descarga del paquete de artes.">
  <meta name="theme-color" content="#070A12" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#F4F7FB" media="(prefers-color-scheme: light)">
  <meta name="color-scheme" content="dark light">
  <meta name="robots" content="noindex, nofollow">

  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_MX">
  <meta property="og:title" content="Swarovski · Guía de artes de impresión">
  <meta property="og:description" content="Medidas, materiales y ubicación de cada pieza gráfica.">
  <meta property="og:url" content="https://www.commandigital.biz/share/swarovski/">

  <link rel="canonical" href="https://www.commandigital.biz/share/swarovski/">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpolygon points='16,2 27,12 16,30 5,12' fill='%237EE0FF'/%3E%3C/svg%3E">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Inter:wght@200;300;400;500;600;700;800&display=swap">

  <link rel="preload" href="assets/css/styles.css?v=056de980" as="style">
  <link rel="stylesheet" href="assets/css/styles.css?v=056de980">

  <!-- Tema antes del primer pintado: automático según la hora, como iOS/macOS -->
  <script>
    (function () {
      var pref = "auto";
      try { pref = localStorage.getItem("sw-theme") || "auto"; } catch (e) { /* modo privado */ }
      var h = new Date().getHours();
      var porHora = (h >= 19 || h < 7) ? "dark" : "light";
      var efectivo = (pref === "light" || pref === "dark") ? pref : porHora;
      document.documentElement.setAttribute("data-theme", efectivo);
      document.documentElement.setAttribute("data-theme-pref", pref);
    })();
  </script>
</head>

<body>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <div class="progress-bar" id="progressBar" role="presentation"></div>

  <!-- Sprite de iconos SVG -->
  <svg class="visually-hidden" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <symbol id="i-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 21h16"/>
    </symbol>
    <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/>
    </symbol>
    <symbol id="i-table" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M9 10v10"/>
    </symbol>
    <symbol id="i-print" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9V3h12v6"/><path d="M6 18H4a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/>
    </symbol>
    <symbol id="i-refresh" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>
    </symbol>
    <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m20 6-11 11-5-5"/>
    </symbol>
    <symbol id="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>
    </symbol>
    <symbol id="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/>
    </symbol>
    <symbol id="i-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none"/>
    </symbol>
    <symbol id="i-arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
    </symbol>
    <symbol id="i-file" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>
    </symbol>
    <symbol id="i-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </symbol>
    <symbol id="i-ruler" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 15 15 3l6 6L9 21Z"/><path d="m7.5 10.5 1.5 1.5"/><path d="M10.5 7.5 12 9"/><path d="M13.5 4.5 15 6"/>
    </symbol>
    <symbol id="i-droplet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2.7 6.4 8.3a8 8 0 1 0 11.3 0Z"/>
    </symbol>
    <symbol id="i-layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>
    </symbol>
    <symbol id="i-scissors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9"/><path d="m8.1 8.1 11.9 11.9"/>
    </symbol>
    <symbol id="i-image" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.6-4.6a2 2 0 0 0-2.8 0L4 20"/>
    </symbol>
    <symbol id="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </symbol>
    <symbol id="i-send" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 3 10.5 13.5"/><path d="M21 3 14.5 21l-4-8-8-4Z"/>
    </symbol>
    <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>
    </symbol>
    <symbol id="i-package" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="m21 8-9-5-9 5v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v9"/>
    </symbol>
  </svg>

  <!-- =====================================================================
       HEADER — solo marca, tema y descarga
       ===================================================================== -->
  <header class="site-header" id="siteHeader">
    <div class="header__inner">
      <a class="brand" href="#inicio" aria-label="Swarovski · inicio">
        <svg class="brand__mark" viewBox="0 0 26 30" aria-hidden="true">
          <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#FF9AD5"/><stop offset=".35" stop-color="#A78BFA"/>
              <stop offset=".7" stop-color="#6EE7F9"/><stop offset="1" stop-color="#FDE68A"/>
            </linearGradient>
          </defs>
          <polygon points="13,1 25,10 13,29 1,10" fill="url(#brandGrad)"/>
          <polygon points="13,1 25,10 13,12" fill="#fff" opacity=".55"/>
          <polygon points="13,1 1,10 13,12" fill="#fff" opacity=".25"/>
        </svg>
        <span class="brand__name">Swarovski</span>
      </a>

      <div class="header__actions">
        <button type="button" class="theme-toggle" id="themeToggle" aria-label="Tema automático (según la hora)">
          <svg class="icon-auto" aria-hidden="true"><use href="#i-auto"></use></svg>
          <svg class="icon-sun" aria-hidden="true"><use href="#i-sun"></use></svg>
          <svg class="icon-moon" aria-hidden="true"><use href="#i-moon"></use></svg>
        </button>

        <a class="btn btn--primary" href="assets/downloads/Artes_Swarovski.zip?v=b6ccee02"
           data-download data-filename="Artes_Swarovski.zip" data-label="Paquete de artes">
          <svg class="btn__icon" aria-hidden="true"><use href="#i-download"></use></svg>
          <span class="btn__label">Descargar recursos</span>
        </a>
      </div>
    </div>
  </header>

  <main id="contenido">
    <!-- ===================================================================
         HERO
         =================================================================== -->
    <section class="hero" id="inicio">
      <div class="container">
        <div class="hero__grid">
          <div class="hero__content">
            <p class="eyebrow">Guía de producción gráfica</p>

            <div class="hero__actions">
              <a class="btn btn--primary" href="assets/downloads/Artes_Swarovski.zip?v=b6ccee02"
                 data-download data-filename="Artes_Swarovski.zip" data-label="Paquete de artes">
                <svg class="btn__icon" aria-hidden="true"><use href="#i-download"></use></svg>
                <span class="btn__label">Descargar recursos</span>
              </a>
              <a class="btn btn--ghost" href="#guia">
                <svg class="btn__icon" aria-hidden="true"><use href="#i-table"></use></svg>
                <span class="btn__label">Ver guía de artes</span>
              </a>
            </div>

            <div class="hero__meta">
              <span class="badge"><i class="badge__dot"></i> Artes disponibles indefinidamente</span>
            </div>

            <div class="stats">
              <div class="stat">
                <p class="stat__value"><span data-count="6">0</span></p>
                <p class="stat__label">Artes</p>
              </div>
            </div>
          </div>

          <div class="hero__visual" aria-hidden="true">
            <span class="hero__ring"></span>
            <span class="hero__ring hero__ring--2"></span>

            <svg class="crystal" viewBox="0 0 300 340">
              <defs>
                <linearGradient id="cg1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#FF9AD5"/><stop offset=".33" stop-color="#A78BFA"/>
                  <stop offset=".66" stop-color="#6EE7F9"/><stop offset="1" stop-color="#FDE68A"/>
                </linearGradient>
                <linearGradient id="cg2" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stop-color="#6EE7F9"/><stop offset="1" stop-color="#FFFFFF"/>
                </linearGradient>
              </defs>
              <g class="crystal__body">
                <polygon points="150,14 268,116 150,326 32,116" fill="url(#cg1)" opacity=".92"/>
                <polygon class="crystal__facet" points="150,14 268,116 150,150" fill="#fff" opacity=".55"/>
                <polygon class="crystal__facet" points="150,14 32,116 150,150" fill="#fff" opacity=".28"/>
                <polygon class="crystal__facet" points="150,150 268,116 150,326" fill="url(#cg2)" opacity=".35"/>
                <polygon class="crystal__facet" points="150,150 32,116 150,326" fill="#04121A" opacity=".18"/>
                <polygon points="150,14 268,116 150,326 32,116" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2"/>
                <path d="M32 116h236" stroke="#fff" stroke-opacity=".45" stroke-width="1.5"/>
                <path d="M150 14v312" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>
              </g>
              <g fill="#fff">
                <path class="crystal__spark" d="M258 44c1 12 4 15 16 16-12 1-15 4-16 16-1-12-4-15-16-16 12-1 15-4 16-16Z"/>
                <path class="crystal__spark" d="M44 236c.8 9 3 11 12 12-9 .8-11 3-12 12-.8-9-3-11-12-12 9-.8 11-3 12-12Z"/>
                <path class="crystal__spark" d="M246 268c.6 7 2.4 8.8 9.6 9.6-7.2.6-9 2.4-9.6 9.6-.6-7.2-2.4-9-9.6-9.6 7.2-.8 9-2.6 9.6-9.6Z"/>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true">
      <div class="marquee__track">
        <span class="marquee__item">Recorte de vinil</span>
        <span class="marquee__item">Corte láser</span>
        <span class="marquee__item">Impreso</span>
        <span class="marquee__item">Archivos .ai en vectores</span>
        <span class="marquee__item">Textos en trazos</span>
        <span class="marquee__item">Medidas finales</span>
      </div>
      <div class="marquee__track">
        <span class="marquee__item">Recorte de vinil</span>
        <span class="marquee__item">Corte láser</span>
        <span class="marquee__item">Impreso</span>
        <span class="marquee__item">Archivos .ai en vectores</span>
        <span class="marquee__item">Textos en trazos</span>
        <span class="marquee__item">Medidas finales</span>
      </div>
    </div>

    <!-- ===================================================================
         ESPECIFICACIONES  ·  OCULTA POR AHORA
         --------------------------------------------------------------------
         Para volver a mostrarla: borra el atributo `hidden` de la etiqueta
         <section> de abajo. El contenido y los estilos siguen intactos.
         =================================================================== -->
    <section class="section section--alt" id="especificaciones" hidden>
      <div class="container">
        <div class="section-head reveal">
          <div>
            <p class="eyebrow">Antes de enviar</p>
            <h2 class="section-title">Especificaciones <strong>técnicas</strong></h2>
            <p class="section-lead">
              Cuatro reglas que evitan el 90 % de los reprocesos en producción.
              Si tu arte cumple con esto, entra directo a impresión.
            </p>
          </div>
          <button type="button" class="btn btn--ghost btn--sm" id="btnCopySpecs">
            <svg class="btn__icon" aria-hidden="true"><use href="#i-copy"></use></svg>
            <span class="btn__label">Copiar especificaciones</span>
          </button>
        </div>

        <div class="specs" id="specsText">
          <article class="spec-card reveal">
            <span class="spec-card__icon"><svg aria-hidden="true"><use href="#i-layers"></use></svg></span>
            <h3 class="spec-card__title">Formato de entrega</h3>
            <p class="spec-card__text">
              Archivo abierto en .AI más un PDF de referencia. Textos convertidos a trazos
              e imágenes empaquetadas o incrustadas.
            </p>
            <p class="spec-card__value">.AI + PDF · vectores</p>
          </article>

          <article class="spec-card reveal">
            <span class="spec-card__icon"><svg aria-hidden="true"><use href="#i-ruler"></use></svg></span>
            <h3 class="spec-card__title">Medidas</h3>
            <p class="spec-card__text">
              Las medidas de la guía son finales e incluyen rebase. Deja siempre una zona
              de protección para que nada quede al filo del corte.
            </p>
            <p class="spec-card__value">Medidas finales · con rebase</p>
          </article>

          <article class="spec-card reveal">
            <span class="spec-card__icon"><svg aria-hidden="true"><use href="#i-scissors"></use></svg></span>
            <h3 class="spec-card__title">Corte láser</h3>
            <p class="spec-card__text">
              Trazos cerrados en una capa aparte llamada «CORTE», sin relleno y con línea
              de 0.1 pt. Nada de trazos duplicados encimados.
            </p>
            <p class="spec-card__value">Capa CORTE · 0.1 pt</p>
          </article>

          <article class="spec-card reveal">
            <span class="spec-card__icon"><svg aria-hidden="true"><use href="#i-droplet"></use></svg></span>
            <h3 class="spec-card__title">Color</h3>
            <p class="spec-card__text">
              Impresión en CMYK con perfil ISO Coated v2. Los recortes de vinil se
              especifican por color de material, no por tinta.
            </p>
            <p class="spec-card__value">CMYK · FOGRA39</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ===================================================================
         GUÍA DE ARTES
         =================================================================== -->
    <section class="section" id="guia">
      <div class="container--wide">
        <div class="section-head reveal">
          <div>
            <p class="eyebrow">Documento vivo</p>
            <h2 class="section-title">Guía de <strong>artes</strong></h2>
            <p class="section-lead">
              Busca, filtra por material, ordena por cualquier columna y exporta a CSV.
              Da clic en la miniatura para ver el arte en grande.
            </p>
          </div>
        </div>

        <div class="sheet-app reveal reveal--zoom" id="sheetApp">
          <div class="sheet-titlebar">
            <span class="sheet-dots" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="sheet-filename">
              <svg aria-hidden="true"><use href="#i-table"></use></svg>
              <b>Guia_Artes_Impresion_Swarovski_V1.xlsx</b>
            </span>
          </div>

          <div class="sheet-toolbar">
            <div class="sheet-search">
              <svg aria-hidden="true"><use href="#i-search"></use></svg>
              <label class="visually-hidden" for="sheetSearch">Buscar en la guía</label>
              <input type="search" class="field" id="sheetSearch" placeholder="Buscar arte, material o ubicación…" autocomplete="off">
            </div>

            <label class="visually-hidden" for="filterMaterial">Filtrar por material</label>
            <select class="field field--select" id="filterMaterial"></select>

            <span class="sheet-toolbar__spacer"></span>

            <button type="button" class="tool-btn" id="btnClear">
              <svg aria-hidden="true"><use href="#i-refresh"></use></svg> Limpiar
            </button>
            <button type="button" class="tool-btn" id="btnCsv">
              <svg aria-hidden="true"><use href="#i-file"></use></svg> Exportar CSV
            </button>
            <button type="button" class="tool-btn" id="btnPrint">
              <svg aria-hidden="true"><use href="#i-print"></use></svg> Imprimir
            </button>
          </div>

          <div class="sheet-formula">
            <span class="sheet-formula__name" id="formulaName">A1</span>
            <span class="sheet-formula__fx" aria-hidden="true">fx</span>
            <span class="sheet-formula__value" id="formulaValue">Selecciona una celda para ver su contenido</span>
          </div>

          <div class="sheet-scroll" tabindex="0" role="region" aria-label="Guía de artes, desplazable">
            <table class="sheet" id="sheetTable">
              <caption class="visually-hidden">
                Guía de artes de impresión Swarovski: nombre del archivo, posición,
                medidas, material, cantidad y ubicación de cada pieza.
              </caption>
              <thead></thead>
              <tbody></tbody>
              <tfoot></tfoot>
            </table>
          </div>

          <p class="sheet-empty" id="sheetEmpty">
            No hay artes que coincidan con la búsqueda. Prueba con otro término o limpia los filtros.
          </p>

          <p class="sheet-note">
            Nota importante: todas las medidas de este documento contienen rebase, es decir,
            son medidas finales de artes. Además debe considerarse una zona de protección en cada arte.
          </p>

          <div class="sheet-tabs" id="sheetTabs" role="tablist" aria-label="Hojas del documento"></div>

          <div class="sheet-status">
            <span class="sheet-status__item">Hoja: <b id="statHoja">—</b></span>
            <span class="sheet-status__item">Artes: <b id="statRows">0</b></span>
            <span class="sheet-status__spacer"></span>
            <span class="sheet-status__item">Clic en una celda · flechas para navegar</span>
          </div>
        </div>

        <noscript>
          <p class="sheet-note">
            Esta guía se construye con JavaScript. Actívalo o descarga el
            <a href="assets/downloads/Guia_Artes_Swarovski.csv?v=d590f90d">CSV de la guía</a>.
          </p>
        </noscript>
      </div>
    </section>

    <!-- ===================================================================
         COMENTARIOS
         =================================================================== -->
    <section class="section section--alt" id="comentarios">
      <div class="container">
        <div class="contact-card reveal">
          <div class="contact-card__intro">
            <p class="eyebrow">Documento vivo</p>
            <h2 class="section-title">¿Algo que ajustar en <strong>un arte?</strong></h2>
            <p class="section-lead">
              Esta es la guía interna de producción gráfica: cualquier cambio de medidas o
              materiales se publica aquí y se refleja en el paquete descargable.
              Si detectas algo, dínoslo y lo actualizamos.
            </p>
          </div>

          <form class="contact-form" id="formComentarios" novalidate>
            <label class="contact-form__label" for="comentario">
              Mándanos tus comentarios o cambios de algún archivo en especial
            </label>

            <textarea class="field field--area" id="comentario" name="mensaje" rows="4"
                      placeholder="Ej.: el arte swarovski-corte-laser.ai debe medir 40 cm de ancho, no 37."
                      required minlength="5"></textarea>

            <!-- Trampa antispam: invisible para personas -->
            <div class="hp" aria-hidden="true">
              <label for="website">No llenar</label>
              <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
            </div>

            <div class="contact-form__foot">
              <button type="submit" class="btn btn--primary">
                <svg class="btn__icon" aria-hidden="true"><use href="#i-send"></use></svg>
                <span class="btn__label">Enviar comentario</span>
              </button>
              <p class="contact-form__note">Llega directo a hola@commandigital.biz</p>
            </div>

            <p class="form-estado" id="formEstado" role="status" aria-live="polite"></p>
          </form>
        </div>
      </div>
    </section>
  </main>

  <!-- =====================================================================
       FOOTER
       ===================================================================== -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer__bottom">
        <p>© <span id="year">2026</span> · Guía de artes Swarovski. Documento interno de producción.</p>
        <p class="footer__mail">
          <svg aria-hidden="true"><use href="#i-mail"></use></svg>
          <a href="mailto:hola@commandigital.biz">hola@commandigital.biz</a>
        </p>
      </div>
    </div>
  </footer>

  <button type="button" class="to-top" id="toTop" aria-label="Volver arriba">
    <svg aria-hidden="true"><use href="#i-arrow-up"></use></svg>
  </button>

  <!-- Pop-up de imagen -->
  <div class="lightbox" id="lightbox" hidden>
    <div class="lightbox__backdrop" data-close></div>
    <div class="lightbox__dialog" role="dialog" aria-modal="true" aria-labelledby="lightboxTitle">
      <header class="lightbox__head">
        <div>
          <p class="lightbox__title" id="lightboxTitle">Arte</p>
          <p class="lightbox__meta" id="lightboxMeta"></p>
        </div>
        <button type="button" class="lightbox__close" data-close aria-label="Cerrar">
          <svg aria-hidden="true"><use href="#i-close"></use></svg>
        </button>
      </header>
      <div class="lightbox__frame" id="lightboxFrame"></div>
    </div>
  </div>

  <div class="toast-stack" id="toastStack" aria-live="polite" aria-atomic="false"></div>

  <!-- jQuery desde CDN con verificación SRI y respaldo local -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"
          integrity="sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs"
          crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script>
    window.jQuery || document.write(
      '<script src="assets/vendor/jquery-3.7.1.min.js?v=2c872dbe"><\/script>'
    );
  </script>
  <script src="assets/js/data.js?v=23f4faed"></script>
  <script src="assets/js/main.js?v=28a7c5c4"></script>
</body>
</html>
