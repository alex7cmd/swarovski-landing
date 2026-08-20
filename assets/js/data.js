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
    { key: "archivo",   label: "Nombre del archivo", titulo: "Nombre del archivo", tipo: "text", ancho: "220px" },
    { key: "posicion",  label: "Posición",           titulo: "Posición",           tipo: "text", ancho: "140px" },
    { key: "ancho",     label: "Ancho",              titulo: "Medidas",            tipo: "num",  ancho: "78px", grupo: 2 },
    { key: "alto",      label: "Alto",               titulo: "",                   tipo: "num",  ancho: "78px"  },
    { key: "rebase",    label: "Rebase",             titulo: "Rebase",             tipo: "text", ancho: "64px"  },
    { key: "material",  label: "Material",           titulo: "Material",           tipo: "text", ancho: "230px" },
    { key: "cantidad",  label: "Cantidad",           titulo: "Cantidad",           tipo: "num",  ancho: "70px"  },
    { key: "notas",     label: "Notas",              titulo: "Notas",              tipo: "text", ancho: "56px" },
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
      archivo: "swarovski-vinil-maquina-cisne-atras.ai", posicion: "PARTE TRASERA",
      ancho: "45 CM", alto: "57 CM", rebase: "—",
      material: "VINIL AUTOADHERIBLE BLANCO IMPRESO + LAMINADO SATINADO + CORTE A CONTORNO", tipo: "vinil", cantidad: 1, notas: "—",
      img: "swarovski-vinil-maquina-cisne-atras.webp", alt: "Parte trasera de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "swarovski-vinil-maquina-cisne-laterales.ai", posicion: "LATERALES",
      ancho: "32 CM", alto: "40 CM", rebase: "—",
      material: "VINIL AUTOADHERIBLE BLANCO IMPRESO + LAMINADO SATINADO + CORTE A CONTORNO", tipo: "vinil", cantidad: 2, notas: "—",
      img: "swarovski-vinil-maquina-cisne-laterales.webp", alt: "Laterales de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "swarovski-corte-laser.ai", posicion: "FRONTAL / CABECERA",
      ancho: "37 CM", alto: "5 CM", rebase: "—",
      material: "CORTE LASER", tipo: "laser", cantidad: 1, notas: "—",
      img: "swarovski-corte-laser-maquina-frontal.webp", alt: "Frontal y cabecera de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "swarovski-corte-laser-mesa-frontal.ai", posicion: "FRONTAL",
      ancho: "45 CM", alto: "6 CM", rebase: "—",
      material: "CORTE LASER", tipo: "laser", cantidad: 1, notas: "—",
      img: "swarovski-corte-laser-mesa-frontal.webp", alt: "Frontal de la mesa de escritorio",
      ubicacion: "MESA DE ESCRITORIO" },

    { hoja: "artes",
      archivo: "swarovski-corte-laser-mesa-cisne-laterales.ai", posicion: "LATERALES",
      ancho: "24 CM", alto: "30 CM", rebase: "—",
      material: "CORTE LASER", tipo: "laser", cantidad: 2, notas: "—",
      img: "swarovski-corte-laser-mesa-cisne-laterales.webp", alt: "Laterales de la mesa de escritorio",
      ubicacion: "MESA DE ESCRITORIO" },

    { hoja: "artes",
      archivo: "swarovski-espejo-impreso-atras.ai", posicion: "PARTE TRASERA DEL ESPEJO",
      ancho: "24 CM", alto: "36 CM", rebase: "—",
      material: "VINIL AUTOADHERIBLE BLANCO IMPRESO + LAMINADO SATINADO + CORTE A CONTORNO", tipo: "vinil", cantidad: 1, notas: "—",
      img: "swarovski-espejo-impreso-atras.webp", alt: "Parte trasera del espejo",
      ubicacion: "ESPEJO" },

    { hoja: "artes",
      archivo: "mesa_SpotColorPANTONE1767U.ai", posicion: "PARTE FRONTAL Y TRASERA",
      ancho: "107 CM", alto: "71.1 CM", rebase: "—",
      material: "VINIL AUTOADHERIBLE BLANCO IMPRESO + LAMINADO SATINADO", tipo: "vinil", cantidad: 2, notas: "—",
      img: "swarovski-corte-laser-mesa-cisne-laterales.webp", alt: "Mesa de escritorio, frente y trasera",
      ubicacion: "MESA DE ESCRITORIO" },

    { hoja: "artes",
      archivo: "mesa_lateralSpotColorPANTONE1767U.ai", posicion: "LATERALES",
      ancho: "40 CM", alto: "60 CM", rebase: "—",
      material: "VINIL AUTOADHERIBLE BLANCO IMPRESO + LAMINADO SATINADO", tipo: "vinil", cantidad: 2, notas: "—",
      img: "swarovski-corte-laser-mesa-cisne-laterales.webp", alt: "Laterales de la mesa de escritorio",
      ubicacion: "MESA DE ESCRITORIO" },

    { hoja: "artes",
      archivo: "maquina-lateral-plasta.ai", posicion: "LATERALES",
      ancho: "75 CM", alto: "193 CM", rebase: "—",
      material: "VINIL AUTOADHERIBLE BLANCO IMPRESO + LAMINADO SATINADO", tipo: "vinil", cantidad: 2, notas: "—",
      img: "maquina-garra-lateral.webp", alt: "Lateral de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "maquina-lateral-plasta-opacidad.ai", posicion: "LATERALES",
      ancho: "59 CM", alto: "152 CM", rebase: "—",
      material: "VINIL TRANSPARENTE IMPRESO", tipo: "transparente", cantidad: 2, notas: "—",
      img: "maquina-garra-lateral.webp", alt: "Lateral de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "maquina-trasera-opacidad.ai", posicion: "PARTE TRASERA",
      ancho: "64 CM", alto: "152 CM", rebase: "—",
      material: "VINIL TRANSPARENTE IMPRESO", tipo: "transparente", cantidad: 1, notas: "—",
      img: "swarovski-vinil-maquina-cisne-atras.webp", alt: "Parte trasera de la máquina garra en vinil transparente",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "maquina-trasera-plasta.ai", posicion: "PARTE TRASERA",
      ancho: "80 CM", alto: "193 CM", rebase: "—",
      material: "VINIL AUTOADHERIBLE BLANCO IMPRESO + LAMINADO SATINADO", tipo: "vinil", cantidad: 1, notas: "—",
      img: "swarovski-vinil-maquina-cisne-atras.webp", alt: "Parte trasera de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "maquina-frontal-cabecera-plasta.ai", posicion: "PARTE FRONTAL",
      ancho: "80 CM", alto: "28 CM", rebase: "—",
      material: "VINIL AUTOADHERIBLE BLANCO IMPRESO + LAMINADO SATINADO", tipo: "vinil", cantidad: 1, notas: "—",
      img: "maquina-garra-frontal.webp", alt: "Frente de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "maquina-frontal-cristalSuperior-opacidad.ai", posicion: "PARTE FRONTAL",
      ancho: "80 CM", alto: "78 CM", rebase: "—",
      material: "VINIL TRANSPARENTE IMPRESO", tipo: "transparente", cantidad: 1, notas: "—",
      img: "maquina-garra-frontal.webp", alt: "Frente de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "maquina-frontal-tableroFranja.ai", posicion: "PARTE FRONTAL",
      ancho: "80 CM", alto: "10 CM", rebase: "—",
      material: "VINIL AUTOADHERIBLE BLANCO IMPRESO + LAMINADO SATINADO", tipo: "vinil", cantidad: 1, notas: "—",
      img: "maquina-garra-frontal.webp", alt: "Frente de la máquina garra",
      ubicacion: "MAQUINA GARRA" },

    { hoja: "artes",
      archivo: "maquina-frontal-inferior-opacidad.ai", posicion: "PARTE FRONTAL",
      ancho: "80 CM", alto: "58 CM", rebase: "—",
      material: "VINIL TRANSPARENTE IMPRESO", tipo: "transparente", cantidad: 1, notas: "—",
      img: "maquina-garra-frontal.webp", alt: "Frente de la máquina garra",
      ubicacion: "MAQUINA GARRA" }
  ];

  window.SW_DATA = {
    columnas: COLUMNAS,
    hojas: HOJAS,
    artes: ARTES,
    rutaImagenes: "assets/img/",
    rutaMiniaturas: "assets/img/thumbs/",
    // La sella tools/versionar.sh en cada publicación: al cambiar una
    // imagen cambia este valor y el navegador la vuelve a pedir.
    versionAssets: "7173cd57",
    documento: {
      titulo: "Guía de artes · Swarovski",
      archivo: "Guia_Artes_Impresion_Swarovski_V1.xlsx",
      version: "V1.0",
      nota: "NOTA IMPORTANTE: TODAS LAS MEDIDAS CONTENIDAS EN ESTE DOCUMENTO CONTIENEN REBASE, " +
            "ES DECIR SON MEDIDAS FINALES DE ARTES. ADEMÁS DEBE CONSIDERARSE UNA ZONA DE PROTECCIÓN EN CADA ARTE."
    }
  };
})(window);
