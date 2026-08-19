/**
 * data.js — Fuente única de verdad de la guía de artes.
 * Se expone en window.SW_DATA para que main.js renderice la hoja de cálculo.
 * Al editar este archivo se actualizan solos: la tabla, los totales, el filtro
 * de materiales, la barra de estado y el CSV exportable.
 */
(function (window) {
  "use strict";

  /** Columnas de la hoja (el orden define las letras A, B, C…). */
  var COLUMNAS = [
    { key: "no",        label: "No.",                titulo: "No.",                tipo: "num",  ancho: "48px"  },
    { key: "archivo",   label: "Nombre del archivo", titulo: "Nombre del archivo", tipo: "text", ancho: "240px" },
    { key: "posicion",  label: "Posición",           titulo: "Posición",           tipo: "text", ancho: "150px" },
    { key: "ancho",     label: "Ancho",              titulo: "Medidas",            tipo: "num",  ancho: "78px", grupo: 2 },
    { key: "alto",      label: "Alto",               titulo: "",                   tipo: "num",  ancho: "78px"  },
    { key: "rebase",    label: "Rebase",             titulo: "Rebase",             tipo: "text", ancho: "72px"  },
    { key: "material",  label: "Material",           titulo: "Material",           tipo: "text", ancho: "150px" },
    { key: "cantidad",  label: "Cantidad",           titulo: "Cantidad",           tipo: "num",  ancho: "76px"  },
    { key: "notas",     label: "Notas",              titulo: "Notas",              tipo: "text", ancho: "90px" },
    { key: "img",       label: "Imagen",             titulo: "Imagen",             tipo: "img",  ancho: "96px" },
    { key: "ubicacion", label: "Ubicación",          titulo: "Ubicación",          tipo: "text", ancho: "120px" }
  ];

  /** Hojas (pestañas inferiores). Hoy solo existe "Artes". */
  var HOJAS = [
    { id: "artes", nombre: "Artes", banda: "GUÍA DE ARTES · SWAROVSKI" }
  ];

  /**
   * Artes de impresión.
   *
   * `img` es el nombre del archivo que se mostrará en la miniatura y en el pop-up.
   * Basta con colocar la imagen real en `assets/img/artes/` con ese mismo nombre:
   * mientras no exista, se muestra el marco "pendiente" y todo sigue funcionando.
   */
  var ARTES = [
    { hoja: "artes",
      archivo: "swarovski-impreso-maquina-cisne.ai", posicion: "PARTE TRASERA",
      ancho: "45 CM", alto: "57 CM", rebase: "—",
      material: "RECORTE DE VINIL", tipo: "vinil", cantidad: 1, notas: "—",
      img: "01-maquina-garra-trasera.jpg", alt: "Parte trasera de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "swarovski-impreso-maquina-cisne.ai", posicion: "LATERALES",
      ancho: "32 CM", alto: "40 CM", rebase: "—",
      material: "RECORTE DE VINIL", tipo: "vinil", cantidad: 2, notas: "—",
      img: "02-maquina-garra-laterales.jpg", alt: "Laterales de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "swarovski-corte-laser.ai", posicion: "FRONTAL / CABECERA",
      ancho: "37 CM", alto: "5 CM", rebase: "—",
      material: "CORTE LASER", tipo: "laser", cantidad: 1, notas: "—",
      img: "03-maquina-garra-frontal.jpg", alt: "Frontal y cabecera de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "Swarovski-corte-laser-logo.ai", posicion: "FRONTAL",
      ancho: "45 CM", alto: "6 CM", rebase: "—",
      material: "CORTE LASER", tipo: "laser", cantidad: 1, notas: "—",
      img: "04-mesa-escritorio-frontal.jpg", alt: "Frontal de la mesa de escritorio",
      ubicacion: "MESA DE ESCRITORIO" },

    { hoja: "artes",
      archivo: "swarovski-corte-laser-mesa-cisne", posicion: "LATERALES",
      ancho: "24 CM", alto: "30 CM", rebase: "—",
      material: "CORTE LASER", tipo: "laser", cantidad: 2, notas: "—",
      img: "05-mesa-escritorio-laterales.jpg", alt: "Laterales de la mesa de escritorio",
      ubicacion: "MESA DE ESCRITORIO" },

    { hoja: "artes",
      archivo: "swarovski-espejo-impreso", posicion: "PARTE TRASERA DEL ESPEJO",
      ancho: "24 CM", alto: "36 CM", rebase: "—",
      material: "IMPRESO", tipo: "impreso", cantidad: 1, notas: "—",
      img: "06-espejo-trasera.jpg", alt: "Parte trasera del espejo",
      ubicacion: "ESPEJO" }
  ];

  window.SW_DATA = {
    columnas: COLUMNAS,
    hojas: HOJAS,
    artes: ARTES,
    rutaImagenes: "assets/img/artes/",
    documento: {
      titulo: "Guía de artes · Swarovski",
      archivo: "Guia_Artes_Impresion_Swarovski_V1.xlsx",
      version: "V1.0",
      nota: "NOTA IMPORTANTE: TODAS LAS MEDIDAS CONTENIDAS EN ESTE DOCUMENTO CONTIENEN REBASE, " +
            "ES DECIR SON MEDIDAS FINALES DE ARTES. ADEMÁS DEBE CONSIDERARSE UNA ZONA DE PROTECCIÓN EN CADA ARTE."
    }
  };
})(window);
