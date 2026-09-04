/**
 * main.js — SWAROVSKI · Guía de artes de impresión
 *
 * Módulos: tema automático por hora, navegación, animaciones al hacer scroll,
 * hoja de cálculo interactiva, pop-up de imágenes y formulario de comentarios.
 *
 * Patrón: IIFE + módulos con API pública mínima. jQuery se recibe por parámetro
 * para poder convivir con otras librerías que usen `$` (noConflict-safe).
 */
(function ($, window, document) {
  "use strict";

  if (!$) { return; }

  /* ==========================================================================
     0. Utilidades
     ========================================================================== */
  var Util = {
    /** Escapa texto antes de inyectarlo como HTML. */
    esc: function (value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    },
    /** Normaliza para búsquedas: minúsculas y sin acentos. */
    norm: function (value) {
      return String(value == null ? "" : value)
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },
    /** Limita la frecuencia de ejecución (scroll, resize). */
    throttle: function (fn, wait) {
      var last = 0, timer = null;
      return function () {
        var ctx = this, args = arguments, now = Date.now(), remaining = wait - (now - last);
        if (remaining <= 0) {
          if (timer) { window.clearTimeout(timer); timer = null; }
          last = now; fn.apply(ctx, args);
        } else if (!timer) {
          timer = window.setTimeout(function () {
            last = Date.now(); timer = null; fn.apply(ctx, args);
          }, remaining);
        }
      };
    },
    /** Retrasa la ejecución hasta que dejan de llegar eventos (búsqueda). */
    debounce: function (fn, wait) {
      var timer = null;
      return function () {
        var ctx = this, args = arguments;
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { fn.apply(ctx, args); }, wait);
      };
    },
    /** Letra de columna de hoja de cálculo: 0 → A, 25 → Z, 26 → AA. */
    colLetter: function (index) {
      var out = "", n = index;
      do { out = String.fromCharCode(65 + (n % 26)) + out; n = Math.floor(n / 26) - 1; } while (n >= 0);
      return out;
    },
    fmt: function (n, dec) {
      return Number(n || 0).toLocaleString("es-MX", {
        minimumFractionDigits: dec == null ? 0 : dec,
        maximumFractionDigits: dec == null ? 0 : dec
      });
    },
    prefersReducedMotion: function () {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  };

  /* ==========================================================================
     1. Toasts (notificaciones)
     ========================================================================== */
  var Toast = {
    $stack: null,
    init: function () { this.$stack = $("#toastStack"); },
    show: function (title, text, variant) {
      if (!this.$stack || !this.$stack.length) { return; }
      var $t = $(
        '<output class="toast ' + (variant ? "toast--" + variant : "") + '" role="status">' +
          "<div>" +
            '<p class="toast__title">' + Util.esc(title) + "</p>" +
            (text ? '<p class="toast__text">' + Util.esc(text) + "</p>" : "") +
          "</div>" +
        "</output>"
      );
      this.$stack.append($t);
      window.setTimeout(function () {
        $t.fadeOut(220, function () { $(this).remove(); });
      }, 4600);
    }
  };

  /* ==========================================================================
     2. Tema — automático por hora (como iOS/macOS), con anulación manual
     --------------------------------------------------------------------------
     Preferencia guardada: "auto" | "light" | "dark".
     En "auto" el tema se calcula con la hora local y se revisa cada minuto,
     así el cambio ocurre solo aunque la pestaña lleve horas abierta.
     ========================================================================== */
  var Theme = {
    KEY: "sw-theme",
    ORDEN: ["auto", "light", "dark"],
    ETIQUETAS: { auto: "Tema automático (según la hora)", light: "Tema claro", dark: "Tema oscuro" },
    HORA_AMANECER: 7,   // a partir de esta hora → claro
    HORA_ANOCHECER: 19, // a partir de esta hora → oscuro

    /** Tema que corresponde a la hora local actual. */
    porHora: function () {
      var h = new Date().getHours();
      return (h >= this.HORA_ANOCHECER || h < this.HORA_AMANECER) ? "dark" : "light";
    },

    leer: function () {
      try {
        var v = window.localStorage.getItem(this.KEY);
        return $.inArray(v, this.ORDEN) !== -1 ? v : "auto";
      } catch (e) { return "auto"; }
    },

    guardar: function (pref) {
      try { window.localStorage.setItem(this.KEY, pref); } catch (e) { /* modo privado */ }
    },

    aplicar: function (pref) {
      var efectivo = pref === "auto" ? this.porHora() : pref;
      $("html").attr({ "data-theme": efectivo, "data-theme-pref": pref });
      $("#themeToggle")
        .attr("aria-label", this.ETIQUETAS[pref])
        .attr("title", this.ETIQUETAS[pref] + (pref === "auto" ? " · ahora " + (efectivo === "dark" ? "oscuro" : "claro") : ""));
    },

    init: function () {
      var self = this, pref = this.leer();
      this.aplicar(pref);

      $("#themeToggle").on("click", function () {
        var actual = self.leer(),
            siguiente = self.ORDEN[($.inArray(actual, self.ORDEN) + 1) % self.ORDEN.length];
        self.guardar(siguiente);
        self.aplicar(siguiente);
        // Sin aviso: el cambio de tema ya se ve solo, y al ciclar entre los
        // tres estados los avisos se apilaban en pantalla.
      });

      // Revisión periódica: solo actúa si la preferencia sigue en "auto"
      window.setInterval(function () {
        if (self.leer() === "auto") { self.aplicar("auto"); }
      }, 60000);
    }
  };

  /* ==========================================================================
     3. Header, progreso y scroll suave
     ========================================================================== */
  var Nav = {
    init: function () {
      var $header = $("#siteHeader"),
          $progress = $("#progressBar"),
          $toTop = $("#toTop");

      $(document).on("click", 'a[href^="#"]:not([href="#"])', function (e) {
        var target = $(this.getAttribute("href"));
        if (!target.length) { return; }
        e.preventDefault();
        var top = target.offset().top - ($header.outerHeight() || 0) - 12;
        if (Util.prefersReducedMotion()) { window.scrollTo(0, top); }
        else { $("html, body").stop(true).animate({ scrollTop: top }, 620, "swing"); }
        window.history.replaceState(null, "", this.getAttribute("href"));
      });

      var onScroll = Util.throttle(function () {
        var y = $(window).scrollTop(),
            doc = $(document).height() - $(window).height();
        $header.toggleClass("is-scrolled", y > 8);
        $progress.css("transform", "scaleX(" + (doc > 0 ? Math.min(y / doc, 1) : 0) + ")");
        $toTop.toggleClass("is-shown", y > 600);
      }, 100);

      $(window).on("scroll resize", onScroll);
      onScroll();

      $toTop.on("click", function () {
        if (Util.prefersReducedMotion()) { window.scrollTo(0, 0); }
        else { $("html, body").stop(true).animate({ scrollTop: 0 }, 520); }
      });
    }
  };

  /* ==========================================================================
     4. Animaciones de entrada al hacer scroll
     ========================================================================== */
  var Reveal = {
    init: function () {
      var $items = $(".reveal");
      if (!$items.length) { return; }
      if (Util.prefersReducedMotion()) { $items.addClass("is-visible"); return; }

      $items.each(function (i) {
        var $el = $(this);
        if (!$el.data("delay-set")) {
          $el.css("--reveal-delay", (i % 6) * 70 + "ms").data("delay-set", true);
        }
      });

      // El umbral va en 0: basta con que asome un pixel. Con un porcentaje,
      // un bloque más alto que la pantalla nunca llega a cumplirlo y se queda
      // invisible para siempre — que es justo lo que pasó cuando la tabla
      // creció y pasó a medir más de 10 000 px en móvil.
      if ("IntersectionObserver" in window) {
        var io = new window.IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
        $items.each(function () { io.observe(this); });
      }

      // Red de seguridad: se ejecuta siempre, no solo si falta el observador.
      // Nada en esta página puede quedarse invisible por un fallo de animación.
      var revisar = Util.throttle(function () {
        var limite = $(window).scrollTop() + $(window).height();
        $items.not(".is-visible").each(function () {
          if ($(this).offset().top < limite) { $(this).addClass("is-visible"); }
        });
      }, 150);
      $(window).on("scroll resize", revisar);
      revisar();

      // Último seguro, y el que de verdad garantiza que nada quede invisible:
      // en vez de esperar un evento, se revisan las posiciones cada tanto.
      // Si el observador o el scroll fallan —cosa que ya pasó—, esto lo cubre.
      // Se apaga solo en cuanto todo está visible, así que no cuesta nada.
      var vigilante = window.setInterval(function () {
        revisar();
        if (!$items.not(".is-visible").length) { window.clearInterval(vigilante); }
      }, 700);

      // Y si tras un minuto siguiera habiendo algo oculto dentro de la pantalla,
      // se apaga el efecto entero: perder la animación es un detalle, dejar la
      // página en blanco no lo es.
      window.setTimeout(function () {
        window.clearInterval(vigilante);
        var falla = false;
        $items.not(".is-visible").each(function () {
          var r = this.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight && r.height > 0) { falla = true; return false; }
        });
        if (falla) { $("html").removeClass("con-js"); }
      }, 60000);
    }
  };

  /* ==========================================================================
     4b. Marquesina — se detiene cuando sale de pantalla
     --------------------------------------------------------------------------
     Una animación infinita consume batería aunque nadie la vea. Se pausa
     cuando la franja no está visible y se reanuda al volver.
     ========================================================================== */
  var Marquee = {
    init: function () {
      var $m = $(".marquee");
      if (!$m.length || !("IntersectionObserver" in window)) { return; }

      var io = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("is-paused", !entry.isIntersecting);
        });
      }, { threshold: 0 });

      $m.each(function () { io.observe(this); });

      // También al cambiar de pestaña
      $(document).on("visibilitychange", function () {
        $m.toggleClass("is-paused", document.hidden);
      });
    }
  };

  /* ==========================================================================
     5. Contadores animados
     ========================================================================== */
  var Counters = {
    init: function () {
      // Las cifras marcadas con data-fuente se leen de los datos, para que no
      // haya que actualizarlas a mano cada vez que cambia la guía.
      if (window.SW_DATA) {
        $("[data-fuente='artes']").attr("data-count", window.SW_DATA.artes.length);
        $("[data-fuente='piezas']").attr("data-count", $.map(window.SW_DATA.artes, function (a) {
          return a.cantidad;
        }).reduce(function (t, n) { return t + n; }, 0));
      }

      var $counters = $("[data-count]");
      if (!$counters.length) { return; }

      var run = function ($el) {
        var target = parseFloat($el.data("count")) || 0,
            dec = parseInt($el.data("decimals"), 10) || 0;

        if (Util.prefersReducedMotion()) { $el.text(Util.fmt(target, dec)); return; }
        $({ v: 0 }).animate({ v: target }, {
          duration: 1200, easing: "swing",
          step: function () { $el.text(Util.fmt(this.v, dec)); },
          complete: function () { $el.text(Util.fmt(target, dec)); }
        });
      };

      if ("IntersectionObserver" in window) {
        var io = new window.IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { run($(entry.target)); io.unobserve(entry.target); }
          });
        }, { threshold: 0.4 });
        $counters.each(function () { io.observe(this); });
      } else {
        $counters.each(function () { run($(this)); });
      }
    }
  };

  /* ==========================================================================
     6. Pop-up de imágenes (lightbox)
     --------------------------------------------------------------------------
     Mientras la imagen real no exista en assets/img/, el marco muestra
     el nombre exacto que debe tener el archivo. Al subirla aparece sola.
     ========================================================================== */
  var Lightbox = {
    init: function () {
      var self = this;
      this.$box = $("#lightbox");
      this.$frame = $("#lightboxFrame");
      this.$title = $("#lightboxTitle");
      this.$meta = $("#lightboxMeta");

      $(document).on("click", "[data-lightbox]", function () { self.abrir($(this)); });
      this.$box.on("click", "[data-close]", function () { self.cerrar(); });
      $(document).on("keydown", function (e) {
        if (e.key === "Escape" && self.$box.hasClass("is-open")) { self.cerrar(); }
      });
    },

    abrir: function ($btn) {
      var src = $btn.data("img"), self = this;

      this.$title.text($btn.data("titulo") || "Arte");
      this.$meta.text($btn.data("meta") || "");
      this.$frame.html('<p class="lightbox__loading">Cargando imagen…</p>');

      $("<img>", { alt: $btn.data("titulo") || "" })
        .on("load", function () { self.$frame.empty().append(this); })
        .on("error", function () {
          self.$frame.html(
            '<div class="lightbox__placeholder">' +
              '<svg aria-hidden="true"><use href="#i-image"></use></svg>' +
              "<p><b>Espacio reservado para la imagen</b></p>" +
              "<p>Coloca el archivo en <code>" + Util.esc(src) + "</code> y aparecerá aquí automáticamente.</p>" +
            "</div>"
          );
        })
        .attr("src", src);

      this.$box.attr("hidden", false).addClass("is-open");
      $("body").addClass("is-locked");
      this.$box.find(".lightbox__close").trigger("focus");
    },

    cerrar: function () {
      var self = this;
      this.$box.removeClass("is-open");
      $("body").removeClass("is-locked");
      window.setTimeout(function () { self.$box.attr("hidden", true); self.$frame.empty(); }, 220);
    }
  };

  /* ==========================================================================
     7. Hoja de cálculo interactiva
     ========================================================================== */
  var Sheet = {
    data: null,
    state: { hoja: "artes", texto: "", material: "", sortKey: null, sortDir: 1 },

    init: function () {
      this.data = window.SW_DATA;
      if (!this.data) { return; }

      this.$table = $("#sheetTable");
      this.$body = this.$table.find("tbody");
      this.$empty = $("#sheetEmpty");
      this.state.hoja = this.data.hojas[0].id;

      this.render();
      this.bind();
      this.apply();
    },

    render: function () {
      var cols = this.data.columnas, self = this;

      var colgroup = '<col style="width:40px">';
      $.each(cols, function (i, c) { colgroup += '<col style="width:' + c.ancho + '">'; });
      this.$table.prepend("<colgroup>" + colgroup + "</colgroup>");

      // Fila de letras A, B, C…
      var letras = '<tr class="sheet-cols"><th class="corner" scope="col"><span class="visually-hidden">Fila</span></th>';
      $.each(cols, function (i) { letras += '<th scope="col">' + Util.colLetter(i) + "</th>"; });
      letras += "</tr>";

      // Encabezados ordenables ("Medidas" agrupa dos columnas)
      var head = '<tr class="sheet-head"><th class="rownum" scope="col">1</th>', skip = 0;
      $.each(cols, function (i, c) {
        if (skip > 0) { skip--; return; }
        var span = c.grupo || 1;
        skip = span - 1;
        head += '<th scope="col" data-key="' + c.key + '" data-type="' + c.tipo + '"' +
                (span > 1 ? ' colspan="' + span + '"' : "") +
                ' tabindex="0" role="columnheader" aria-sort="none" title="Ordenar por ' + Util.esc(c.titulo || c.label) + '">' +
                Util.esc(c.titulo || c.label) + ' <span class="sort-ind" aria-hidden="true"></span></th>';
      });
      head += "</tr>";
      this.$table.find("thead").html(letras + head);

      // Cuerpo
      var html = "";
      $.each(this.data.hojas, function (i, hoja) {
        html += '<tr class="sheet-band-row" data-hoja="' + hoja.id + '">' +
                  '<th class="rownum" scope="row"></th>' +
                  '<td colspan="' + cols.length + '">' + Util.esc(hoja.banda) + "</td>" +
                "</tr>";
        $.each(self.data.artes, function (j, arte) {
          if (arte.hoja === hoja.id) { html += self.rowHtml(arte); }
        });
      });
      this.$body.html(html);

      var contadores = {};
      this.$body.find(".sheet-row").each(function () {
        var h = $(this).data("hoja");
        contadores[h] = (contadores[h] || 0) + 1;
        $(this).find(".cell-no").text(contadores[h]).end().attr("data-no", contadores[h]);
      });

      // Pie de totales: A–G etiqueta · H cantidad · I–K detalle
      this.$table.find("tfoot").html(
        "<tr>" +
          '<td class="rownum"></td>' +
          '<td class="is-left" colspan="7">TOTALES VISIBLES</td>' +
          '<td class="is-num" id="totalPiezas">0</td>' +
          '<td colspan="3" class="is-left" id="totalDetalle"></td>' +
        "</tr>"
      );

      // Filtro de materiales
      var materiales = [];
      $.each(this.data.artes, function (i, a) {
        if ($.inArray(a.material, materiales) === -1) { materiales.push(a.material); }
      });
      materiales.sort();
      var opts = '<option value="">Todos los materiales</option>';
      $.each(materiales, function (i, m) {
        opts += '<option value="' + Util.esc(m) + '">' + Util.esc(m) + "</option>";
      });
      $("#filterMaterial").html(opts);

      // Pestañas
      var tabs = "";
      $.each(this.data.hojas, function (i, h) {
        tabs += '<button type="button" class="sheet-tab' + (i === 0 ? " is-active" : "") + '"' +
                ' role="tab" aria-selected="' + (i === 0) + '" data-hoja="' + h.id + '">' +
                Util.esc(h.nombre) + "</button>";
      });
      $("#sheetTabs").html(tabs);
    },

    /** HTML de una fila de arte. */
    rowHtml: function (a) {
      // Las versiones rompen la caché cuando se reemplaza una imagen o paquete.
      var v = this.data.versionAssets ? "?v=" + this.data.versionAssets : "",
          vd = this.data.versionDownloads ? "?v=" + this.data.versionDownloads : "",
          // La tabla carga la miniatura (~15 KB); la foto completa solo se
          // descarga si alguien abre el pop-up.
          mini = a.mini
            ? (this.data.rutaImagenes || "") + a.mini + v
            : (this.data.rutaMiniaturas || "") + a.img.replace(/\.[^.]+$/, ".jpg") + v,
          src = (this.data.rutaImagenes || "") + a.img + v,
          meta = a.posicion + " · " + a.ancho + " × " + a.alto + " · " + a.material,
          nombrePaquete = a.descarga ? a.descarga.split("/").pop() : "",
          archivoHtml = a.descarga
            ? '<a class="file-download" href="' + Util.esc(a.descarga + vd) + '"' +
                ' download="' + Util.esc(nombrePaquete) + '" data-download' +
                ' data-filename="' + Util.esc(nombrePaquete) + '" data-label="Archivo individual"' +
                ' aria-label="Descargar ' + Util.esc(a.archivo) + '" title="Descargar archivo individual">' +
                '<span class="file-download__name">' + Util.esc(a.archivo) + '</span>' +
                '<span class="file-download__icon" aria-hidden="true">' +
                  '<svg><use href="#i-download"></use></svg>' +
                '</span>' +
              '</a>'
            : Util.esc(a.archivo);

      return '<tr class="sheet-row" data-hoja="' + a.hoja + '" data-material="' + Util.esc(a.material) + '"' +
                ' data-tipo="' + a.tipo + '" data-cantidad="' + a.cantidad + '"' +
                ' data-archivo="' + Util.esc(a.archivo) + '">' +
        '<th class="rownum" scope="row"></th>' +
        '<td class="is-num cell-no" data-label="No."></td>' +
        '<td class="is-left cell-file" data-label="Archivo">' + archivoHtml + "</td>" +
        '<td class="is-left" data-label="Posición">' + Util.esc(a.posicion) + "</td>" +
        '<td class="is-num" data-label="Ancho">' + Util.esc(a.ancho) + "</td>" +
        '<td class="is-num" data-label="Alto">' + Util.esc(a.alto) + "</td>" +
        '<td data-label="Rebase">' + Util.esc(a.rebase) + "</td>" +
        '<td data-label="Material"><span class="chip chip--' + a.tipo + '">' + Util.esc(a.material) + "</span></td>" +
        '<td class="is-num cell-qty" data-label="Cantidad">' + a.cantidad + "</td>" +
        '<td class="is-left cell-note" data-label="Notas">' + Util.esc(a.notas) + "</td>" +
        '<td class="cell-thumb" data-label="Imagen">' +
          '<button type="button" class="thumb" data-lightbox' +
            ' data-img="' + Util.esc(src) + '"' +
            ' data-titulo="' + Util.esc(a.archivo) + '"' +
            ' data-meta="' + Util.esc(meta) + '">' +
            '<img class="thumb__img" src="' + Util.esc(mini) + '" alt="' + Util.esc(a.alt) + '" loading="eager" decoding="async">' +
            '<span class="thumb__ph"><svg aria-hidden="true"><use href="#i-image"></use></svg>Ver imagen</span>' +
          "</button>" +
        "</td>" +
        '<td class="is-left" data-label="Ubicación">' + Util.esc(a.ubicacion) + "</td>" +
      "</tr>";
    },

    bind: function () {
      var self = this;

      // Miniaturas: si la imagen real existe, sustituye al marcador
      this.$body.find(".thumb__img").on("load", function () {
        $(this).closest(".thumb").addClass("is-loaded");
      }).each(function () {
        if (this.complete && this.naturalWidth > 0) { $(this).trigger("load"); }
      });

      $("#sheetSearch").on("input", Util.debounce(function () {
        self.state.texto = Util.norm($(this).val());
        self.apply();
      }, 180));

      $("#filterMaterial").on("change", function () {
        self.state.material = $(this).val();
        self.apply();
      });

      $("#sheetTabs").on("click", ".sheet-tab", function () {
        var $t = $(this);
        $t.addClass("is-active").attr("aria-selected", "true")
          .siblings().removeClass("is-active").attr("aria-selected", "false");
        self.state.hoja = $t.data("hoja");
        self.apply();
      });

      this.$table.on("click keydown", "thead .sheet-head th[data-key]", function (e) {
        if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") { return; }
        e.preventDefault();
        self.sort($(this).data("key"), $(this).data("type"), $(this));
      });

      this.$body.on("click", "td", function (e) {
        if ($(e.target).closest(".thumb, .file-download").length) { return; }
        self.selectCell($(this));
      });

      $(document).on("keydown", function (e) {
        if (!self.$selected || !self.$selected.length) { return; }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.key) === -1) { return; }
        if ($(e.target).is("input, select, textarea")) { return; }

        var $cell = self.$selected, $row = $cell.closest("tr"), idx = $cell.index(), $next = null;
        if (e.key === "ArrowLeft")  { $next = $cell.prev("td"); }
        if (e.key === "ArrowRight") { $next = $cell.next("td"); }
        if (e.key === "ArrowUp")    { $next = $row.prevAll(".sheet-row:not(.is-hidden)").first().children().eq(idx); }
        if (e.key === "ArrowDown")  { $next = $row.nextAll(".sheet-row:not(.is-hidden)").first().children().eq(idx); }

        if ($next && $next.length && $next.is("td")) {
          e.preventDefault();
          self.selectCell($next);
          if ($next[0].scrollIntoView) { $next[0].scrollIntoView({ block: "nearest", inline: "nearest" }); }
        }
      });

      $("#btnCsv").on("click", function () { self.exportCsv(); });
      $("#btnPrint").on("click", function () { window.print(); });
      $("#btnClear").on("click", function () {
        $("#sheetSearch").val("");
        $("#filterMaterial").val("");
        self.state.texto = ""; self.state.material = ""; self.state.sortKey = null;
        self.$table.find("th[data-key]").attr("aria-sort", "none");
        self.restoreOrder();
        self.apply();
        Toast.show("Filtros restablecidos", "Se muestra la guía completa.", "ok");
      });
    },

    apply: function () {
      var s = this.state, visibles = 0, piezas = 0, self = this;

      this.$body.find(".sheet-row").each(function () {
        var $r = $(this),
            okHoja = $r.data("hoja") === s.hoja,
            okMat = !s.material || $r.data("material") === s.material,
            okTxt = !s.texto || Util.norm($r.text()).indexOf(s.texto) !== -1,
            visible = okHoja && okMat && okTxt;

        $r.toggleClass("is-hidden", !visible);
        if (visible) { visibles++; piezas += parseInt($r.data("cantidad"), 10) || 0; }
      });

      this.$body.find(".sheet-band-row").each(function () {
        $(this).toggleClass("is-hidden", $(this).data("hoja") !== s.hoja || visibles === 0);
      });

      var n = 2;
      this.$body.children("tr").not(".is-hidden").each(function () {
        $(this).children(".rownum").first().text(n++);
      });

      this.$body.find(".sheet-row").removeClass("is-alt")
        .not(".is-hidden").each(function (i) { $(this).toggleClass("is-alt", i % 2 === 1); });

      $("#totalPiezas").text(piezas);
      $("#totalDetalle").text(visibles + (visibles === 1 ? " arte listada" : " artes listadas"));
      $("#statRows").text(visibles);
      $("#statHoja").text($("#sheetTabs .is-active").text() || "—");

      this.$empty.toggleClass("is-shown", visibles === 0);
      this.$table.toggleClass("is-empty", visibles === 0);

      self.clearSelection();
    },

    sort: function (key, tipo, $th) {
      var s = this.state, self = this;
      s.sortDir = (s.sortKey === key) ? -s.sortDir : 1;
      s.sortKey = key;

      this.$table.find("th[data-key]").attr("aria-sort", "none");
      $th.attr("aria-sort", s.sortDir === 1 ? "ascending" : "descending");

      var index = 0;
      $.each(this.data.columnas, function (i, c) { if (c.key === key) { index = i; } });

      var $rows = this.$body.find(".sheet-row").get();
      $rows.sort(function (a, b) {
        var va = self.cellValue($(a), index, key, tipo),
            vb = self.cellValue($(b), index, key, tipo);
        if (va < vb) { return -1 * s.sortDir; }
        if (va > vb) { return 1 * s.sortDir; }
        return 0;
      });

      $.each(this.data.hojas, function (i, hoja) {
        var $band = self.$body.find('.sheet-band-row[data-hoja="' + hoja.id + '"]'), $prev = $band;
        $.each($rows, function (j, row) {
          var $row = $(row);
          if ($row.data("hoja") === hoja.id) { $prev.after($row); $prev = $row; }
        });
      });

      this.apply();
    },

    cellValue: function ($row, index, key, tipo) {
      if (key === "cantidad") { return parseInt($row.data("cantidad"), 10) || 0; }
      if (key === "no") { return parseInt($row.attr("data-no"), 10) || 0; }
      var text = $.trim($row.children("td").eq(index).text());
      if (tipo === "num") { return parseFloat(text.replace(/[^\d.-]/g, "")) || 0; }
      return Util.norm(text);
    },

    restoreOrder: function () {
      var self = this;
      $.each(this.data.hojas, function (i, hoja) {
        var $band = self.$body.find('.sheet-band-row[data-hoja="' + hoja.id + '"]'), $prev = $band;
        self.$body.find('.sheet-row[data-hoja="' + hoja.id + '"]').sort(function (a, b) {
          return (parseInt($(a).attr("data-no"), 10) || 0) - (parseInt($(b).attr("data-no"), 10) || 0);
        }).each(function () { $prev.after(this); $prev = $(this); });
      });
    },

    selectCell: function ($cell) {
      this.$body.find("td.is-selected").removeClass("is-selected");
      $cell.addClass("is-selected");
      this.$selected = $cell;

      var col = Util.colLetter($cell.index() - 1),
          fila = $.trim($cell.closest("tr").children(".rownum").first().text()),
          valor = $.trim($cell.text()) || "(celda vacía)";

      $("#formulaName").text(col + fila);
      $("#formulaValue").text(valor).attr("title", valor);
    },

    clearSelection: function () {
      this.$body.find("td.is-selected").removeClass("is-selected");
      this.$selected = null;
      $("#formulaName").text("A1");
      $("#formulaValue").text("Selecciona una celda para ver su contenido");
    },

    exportCsv: function () {
      var rows = [], headers = [];
      $.each(this.data.columnas, function (i, c) { headers.push(c.label); });
      rows.push(headers);

      this.$body.find(".sheet-row").not(".is-hidden").each(function () {
        var row = [];
        $(this).children("td").each(function () {
          var $td = $(this);
          if ($td.hasClass("cell-thumb")) { row.push($td.find(".thumb").data("img") || ""); }
          else { row.push($.trim($td.text())); }
        });
        rows.push(row);
      });

      if (rows.length < 2) {
        Toast.show("Nada que exportar", "No hay filas visibles con los filtros actuales.", "error");
        return;
      }

      var csv = rows.map(function (r) {
        return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
      }).join("\r\n");

      var blob = new window.Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }),
          url = window.URL.createObjectURL(blob),
          name = "Guia_Artes_Swarovski.csv";

      Downloads.trigger(url, name);
      window.setTimeout(function () { window.URL.revokeObjectURL(url); }, 1500);
      Toast.show("CSV generado", name + " · " + (rows.length - 1) + " filas exportadas.", "ok");
    }
  };

  /* ==========================================================================
     8. Descargas
     ========================================================================== */
  var Downloads = {
    trigger: function (href, filename) {
      var a = document.createElement("a");
      a.href = href;
      if (filename) { a.download = filename; }
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },

    init: function () {
      var self = this;
      $(document).on("click", "[data-download]", function (e) {
        e.preventDefault();
        var $btn = $(this),
            href = $btn.attr("href") || $btn.data("download"),
            name = $btn.data("filename") || "",
            label = $btn.data("label") || "recursos";

        if ($btn.hasClass("is-busy")) { return; }
        var $label = $btn.find(".btn__label"), original = $label.text();
        $btn.addClass("is-busy");
        if ($label.length) { $label.text("Preparando…"); }

        window.setTimeout(function () {
          self.trigger(href, name);
          $btn.removeClass("is-busy");
          if ($label.length) { $label.text(original); }
          Toast.show("Descarga iniciada", name || label, "ok");
        }, 380);
      });

      $("#btnCopySpecs").on("click", function () {
        var texto = $("#specsText").text().replace(/\s+/g, " ").trim();
        var done = function () { Toast.show("Copiado", "Especificaciones técnicas en el portapapeles.", "ok"); };
        if (window.navigator.clipboard && window.isSecureContext) {
          window.navigator.clipboard.writeText(texto).then(done, function () {
            Toast.show("No se pudo copiar", "Copia manualmente el bloque.", "error");
          });
        } else {
          var $tmp = $("<textarea>").val(texto).css({ position: "fixed", opacity: 0 }).appendTo("body");
          $tmp[0].select();
          try { document.execCommand("copy"); done(); }
          catch (err) { Toast.show("No se pudo copiar", "Copia manualmente el bloque.", "error"); }
          $tmp.remove();
        }
      });
    }
  };

  /* ==========================================================================
     9. Formulario de comentarios
     --------------------------------------------------------------------------
     Envía a enviar.php (PHP mail del hosting). Si el endpoint no existe
     —por ejemplo abriendo el archivo en local— cae a un mailto con el texto ya
     escrito, para que el mensaje nunca se pierda.
     ========================================================================== */
  var Formulario = {
    DESTINO: "hola@commandigital.biz",

    init: function () {
      var self = this, $form = $("#formComentarios");
      if (!$form.length) { return; }

      $form.on("submit", function (e) {
        e.preventDefault();

        var $btn = $form.find("button[type=submit]"),
            $campo = $("#comentario"),
            mensaje = $.trim($campo.val()),
            $estado = $("#formEstado");

        if (mensaje.length < 5) {
          $estado.attr("data-tipo", "error").text("Escribe tu comentario antes de enviarlo.");
          $campo.trigger("focus");
          return;
        }
        if ($.trim($("#website").val())) { return; } // trampa antispam

        var $label = $btn.find(".btn__label"), original = $label.text();
        $btn.addClass("is-busy"); $label.text("Enviando…");
        $estado.attr("data-tipo", "").text("");

        $.ajax({
          url: "enviar.php",
          method: "POST",
          dataType: "json",
          data: { mensaje: mensaje, website: "", origen: window.location.href }
        }).done(function (res) {
          if (res && res.ok) {
            $form[0].reset();
            $estado.attr("data-tipo", "ok").text("¡Gracias! Tu comentario ya va en camino.");
            Toast.show("Comentario enviado", "Lo recibimos en " + self.DESTINO, "ok");
          } else {
            self.fallback(mensaje, $estado, (res && res.error) || null);
          }
        }).fail(function () {
          self.fallback(mensaje, $estado, null);
        }).always(function () {
          $btn.removeClass("is-busy"); $label.text(original);
        });
      });
    },

    /** Sin PHP disponible: abrimos el correo con el mensaje ya redactado. */
    fallback: function (mensaje, $estado, motivo) {
      var url = "mailto:" + this.DESTINO +
                "?subject=" + window.encodeURIComponent("Comentarios · Guía de artes Swarovski") +
                "&body=" + window.encodeURIComponent(mensaje);
      window.location.href = url;
      $estado.attr("data-tipo", "warn")
        .text("Abrimos tu app de correo para completar el envío" + (motivo ? " (" + motivo + ")" : "") + ".");
    }
  };

  /* ==========================================================================
     10. Arranque
     ========================================================================== */
  $(function () {
    $("#year").text(new Date().getFullYear());

    Toast.init();
    Theme.init();
    Nav.init();
    Reveal.init();
    Marquee.init();
    Counters.init();
    Lightbox.init();
    Sheet.init();
    Downloads.init();
    Formulario.init();

    $("body").addClass("is-ready");
  });

  // API pública mínima (útil para depurar desde la consola)
  window.SW = { Util: Util, Sheet: Sheet, Toast: Toast, Theme: Theme, Lightbox: Lightbox };

})(window.jQuery, window, document);
