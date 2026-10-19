/* Herramientas para definir libros (cursos) de la academia de forma compacta. */
(function () {
  'use strict';
  var BK = window.BK = { list: [], paths: [
    ['base', 'Fundamentos', 'Empieza aquí'], ['tarot', 'Tarot y oráculos', 'Lee las cartas con profundidad'], ['cielo', 'Cielo y números', 'Astrología, luna y numerología'],
    ['trad', 'Tradiciones del mundo', 'Historia, mitos y magias'], ['practica', 'Práctica mágica', 'Rituales, cristales, hierbas y energía'], ['sombra', 'Sombra y maestría', 'El trabajo interior más profundo']
  ] };
  BK.L = function (title, body, anim) { return { t: 'learn', title: title, body: body, anim: anim }; };
  BK.Q = function (q, opts, a, why) { return { t: 'quiz', q: q, opts: opts, a: a, why: why }; };
  // Capítulo: BK.C('🌙', 'Título', paso, paso, …)
  BK.C = function (emoji, title) { return { emoji: emoji, title: title, steps: Array.prototype.slice.call(arguments, 2) }; };
  // Libro: id, emoji, título, subtítulo, camino, color, descripción, capítulos[]
  BK.book = function (id, emoji, title, sub, path, hue, desc, chapters) {
    chapters.forEach(function (c, i) { c.id = id + 'c' + (i + 1); });
    BK.list.push({ id: id, emoji: emoji, title: title, sub: sub, path: path, hue: hue, desc: desc, chapters: chapters });
  };
  // Libros iniciales (unidades antiguas de la academia): conservan los ids para no perder progreso
  BK.fromUnits = function () {
    var meta = { u1: ['base', '#8b6cff'], u2: ['tarot', '#e6c97a'], u3: ['practica', '#ff9f43'], u4: ['cielo', '#7aa7ff'], u5: ['practica', '#ff7eb6'], u6: ['cielo', '#5ad0c0'], u7: ['cielo', '#c58bff'], u8: ['tarot', '#6fe3a0'] };
    ACADEMY.UNITS.forEach(function (u) {
      BK.list.push({ id: u.id, emoji: u.emoji, title: u.title, sub: u.sub, path: meta[u.id][0], hue: meta[u.id][1], desc: u.sub + '.', chapters: u.lessons.map(function (l) { return { id: l.id, emoji: l.emoji, title: l.title, steps: l.steps }; }) });
    });
  };
  BK.fromUnits();
})();
