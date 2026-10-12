/* Numerología a fondo: mapa personal, Pitágoras, ciclos, nombres, patrones, sincronicidades, compatibilidad y diccionario. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, P = ARC.profile, A = ARC.act, D = NUMDATA;

  /* ---------- motor ---------- */
  function digSum(n) { return String(Math.abs(n)).split('').reduce(function (s, c) { return s + Number(c); }, 0); }
  function red(n, master) { n = Math.abs(n); while (n > 9) { if (master && (n === 11 || n === 22 || n === 33)) return n; n = digSum(n); } return n; }
  function single(n) { return n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : n; }
  function chain(n) { var c = [n]; while (n > 9) { n = digSum(n); c.push(n); } return c; }

  function clean(name) { return String(name || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase(); }
  function nameParts(name) {
    var words = clean(name).split(/[^A-Z]+/).filter(Boolean), v = [], c = [], all = [];
    words.forEach(function (w) {
      var hasV = /[AEIOU]/.test(w);
      w.split('').forEach(function (ch) {
        var val = D.LETTERS[ch]; if (!val) return;
        all.push(val);
        if ('AEIOU'.indexOf(ch) > -1 || (ch === 'Y' && !hasV)) v.push(val); else c.push(val);
      });
    });
    return { all: all, v: v, c: c };
  }
  function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  function karmicOf(raw) { return D.KARMIC[raw] ? { raw: raw, key: D.KARMIC[raw][0], txt: D.KARMIC[raw][1] } : null; }

  function calc(birth, fullName) {
    if (!birth) return null;
    var y = birth.y, m = birth.m, d = birth.d, now = new Date(), cy = now.getFullYear();
    var out = {};
    var rawLP = digSum(y) + digSum(m) + digSum(d);
    out.lp = { n: red(red(m, true) + red(d, true) + red(y, true), true), raw: rawLP, chain: chain(rawLP), karmic: karmicOf(rawLP) };
    out.day = { n: red(d, true), karmic: karmicOf(d) };
    out.attitude = red(d + m);
    if (fullName && clean(fullName).replace(/[^A-Z]/g, '').length) {
      var p = nameParts(fullName);
      var te = sum(p.all), ts = sum(p.v), tp = sum(p.c);
      out.expr = { n: red(te, true), raw: te, karmic: karmicOf(te) };
      out.soul = { n: red(ts, true), raw: ts, karmic: karmicOf(ts) };
      out.pers = { n: red(tp, true), raw: tp, karmic: karmicOf(tp) };
      out.maturity = red(single(out.lp.n) + single(out.expr.n), true);
      var counts = {}; p.all.forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
      out.counts = counts;
      out.lessons = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (k) { return !counts[k]; });
      var mx = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; }));
      out.passion = Object.keys(counts).filter(function (k) { return counts[k] === mx; }).map(Number);
      out.planes = {}; Object.keys(D.PLANES).forEach(function (k) { out.planes[k] = D.PLANES[k].reduce(function (s, n) { return s + (counts[n] || 0); }, 0); });
    }
    // ciclos
    out.universal = red(cy);
    out.py = red(red(m) + red(d) + red(cy));
    out.pm = red(out.py + (now.getMonth() + 1));
    out.pd = red(out.pm + now.getDate());
    out.cycle = [];
    for (var i = 0; i < 9; i++) { var yy = cy - 2 + i; out.cycle.push({ y: yy, n: red(red(m) + red(d) + red(yy)) }); }
    // pináculos y desafíos
    var ml = red(m), dl = red(d), yl = red(y);
    var p1 = red(ml + dl, true), p2 = red(dl + yl, true), p3 = red(single(p1) + single(p2), true), p4 = red(ml + yl, true);
    var end1 = 36 - single(out.lp.n), end2 = end1 + 9, end3 = end2 + 9;
    out.pin = [{ n: p1, from: 0, to: end1 }, { n: p2, from: end1, to: end2 }, { n: p3, from: end2, to: end3 }, { n: p4, from: end3, to: null }];
    var c1 = Math.abs(ml - dl), c2 = Math.abs(dl - yl), c3 = Math.abs(c1 - c2), c4 = Math.abs(ml - yl);
    out.chal = [c1, c2, c3, c4];
    // cuadrado de Pitágoras
    var ds = String(y) + ARC.pad(m) + ARC.pad(d), digits = ds.split('').map(Number);
    var n1 = sum(digits), n2 = digSum(n1), first = Number((String(d).replace(/0/g, '')[0]) || 0), n3 = Math.abs(n1 - 2 * first), n4 = digSum(n3);
    var all = digits.concat(String(n1).split('').map(Number), String(n2).split('').map(Number), String(n3).split('').map(Number), String(n4).split('').map(Number));
    var sq = {}; all.forEach(function (x) { if (x > 0) sq[x] = (sq[x] || 0) + 1; });
    out.square = sq; out.work = [n1, n2, n3, n4];
    return out;
  }

  /* ---------- detector de patrones ---------- */
  function analyzeToken(s) {
    var r = { s: s, notes: [] };
    if (s.length > 1 && /^(\d)\1+$/.test(s)) r.notes.push('Dígito repetido (' + s[0] + '): énfasis de la energía del ' + s[0] + '.');
    if (s.length >= 3) {
      for (var i = 0; i + 2 < s.length; i++) {
        var a = +s[i], b = +s[i + 1], c = +s[i + 2];
        if (b === a + 1 && c === b + 1) { r.notes.push('Secuencia ascendente ' + s.substr(i, 3) + ': progreso paso a paso.'); break; }
        if (b === a - 1 && c === b - 1) { r.notes.push('Secuencia descendente ' + s.substr(i, 3) + ': cuenta atrás, simplifica o cierra.'); break; }
      }
    }
    if (s.length >= 3 && s === s.split('').reverse().join('') && !/^(\d)\1+$/.test(s)) r.notes.push('Palíndromo: lo que ocurre vuelve sobre sí mismo, simetría y reflejo.');
    for (var L = 2; L <= s.length / 2; L++) { if (s.length % L === 0 && new Array(s.length / L + 1).join(s.substr(0, L)) === s && !/^(\d)\1+$/.test(s)) { r.notes.push('Bloque repetido «' + s.substr(0, L) + '»: ese mensaje se refuerza.'); break; } }
    Object.keys(D.ANGEL).sort(function (a, b) { return b.length - a.length; }).some(function (k) {
      if (k.length >= 3 && s.indexOf(k) > -1) { r.notes.push('Contiene ' + k + ': ' + D.ANGEL[k]); return true; }
      return false;
    });
    [11, 22, 33].forEach(function (mn) { if (s.indexOf(String(mn)) > -1 && s.length > 2 && !r.notes.some(function (n) { return n.indexOf('Contiene') === 0; })) r.notes.push('Incluye el número maestro ' + mn + ': ' + D.N[mn].kw.toLowerCase() + '.'); });
    r.root = red(+s.slice(0, 15) || 0, true); r.chain = chain(sum(s.split('').map(Number)));
    return r;
  }
  function detect(text) {
    var tokens = (String(text).match(/\d[\d:.\-\/]*/g) || []).map(function (t) { return t.replace(/\D/g, ''); }).filter(function (t) { return t.length > 0 && t.length <= 18; }).slice(0, 40);
    var freq = {}; tokens.join('').split('').forEach(function (c) { freq[c] = (freq[c] || 0) + 1; });
    var top = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 3);
    return { tokens: tokens.map(analyzeToken), freq: freq, top: top, total: tokens.join('').length };
  }

  /* ---------- sincronicidades ---------- */
  var syncs = ARC.store.get('arcana.sync', []);
  function saveSync() { ARC.store.set('arcana.sync', syncs.slice(0, 400)); }

  /* ---------- diccionario ---------- */
  function tarotName(n) {
    var t = n; while (t > 22) t = digSum(t);
    var c = DECKS.get('tarot', 'rws').cards[t === 22 ? 0 : t];
    return c ? c.emoji + ' ' + c.name : '';
  }
  function dictEntry(raw) {
    var n = parseInt(raw, 10); if (isNaN(n) || n < 0 || n > 9999) return null;
    var s = String(n), e = { n: n, base: null, parts: [], chain: chain(n) };
    var r = red(n, true);
    e.base = D.N[r] || D.N[single(r)];
    e.red = r;
    if (D.ANGEL[s] || D.ANGEL[ARC.pad(n)]) e.angel = D.ANGEL[s] || D.ANGEL[ARC.pad(n)];
    if (D.KARMIC[n]) e.karmic = D.KARMIC[n];
    if (s.length > 1) e.parts = s.split('').map(function (c) { var x = D.N[+c]; return { d: +c, n: x.n, kw: x.kw }; });
    e.tarot = tarotName(n);
    return e;
  }

  /* ---------- compatibilidad ---------- */
  function compat(a, b) {
    var sa = single(a), sb = single(b), fa = D.COMPAT_FAM[sa], fb = D.COMPAT_FAM[sb], score, txt;
    if (a === b) { score = 90; txt = 'Sois espejo: os entendéis rápido y también os veis los defectos con claridad. El reto es no competir ni aburriros.'; }
    else if (fa === fb) { score = 80; txt = 'Misma familia numérica: ritmos y valores parecidos. Hay complicidad natural; cuidad la rutina.'; }
    else if ((fa === 'A' && fb === 'C') || (fa === 'C' && fb === 'A')) { score = 72; txt = 'Libertad + expresión: mucha chispa, creatividad y movimiento. Necesitáis acuerdos claros para no dispersaros.'; }
    else if ((fa === 'B' && fb === 'C') || (fa === 'C' && fb === 'B')) { score = 74; txt = 'Estabilidad + calidez: uno aporta estructura y otro afecto. Funciona si se valoran las diferencias.'; }
    else { score = 60; txt = 'Libertad vs. estructura: complementarios pero con fricción. Negociad espacio y compromiso desde el respeto.'; }
    return { score: score, txt: txt };
  }

  /* ---------- vista ---------- */
  var NM = { sub: 'mapa', sel: null, text: '', dict: '', date2: '', name2: '' };
  var SUBS = [['mapa', '🗺️ Mi mapa'], ['pita', '🔲 Pitágoras'], ['ciclos', '🔄 Ciclos'], ['nombre', '🔤 Nombre'], ['patrones', '🔎 Patrones'], ['sinc', '✨ Sincronías'], ['compat', '💞 Compatibilidad'], ['dic', '📖 Diccionario']];

  function needBirth() {
    return '<div class="panel"><div class="lbl">Tu fecha de nacimiento</div><div class="datebar"><input type="date" id="nbirth"><button class="btn primary sm" data-a="numBirth">Guardar</button></div><p class="hint">Se guarda solo en tu dispositivo.</p></div>';
  }
  function fullNameBox() {
    return '<div class="panel"><div class="lbl">Nombre completo de nacimiento</div><input id="fullname" type="text" maxlength="80" placeholder="Tal como aparece en tu partida de nacimiento" value="' + esc(P.fullName || '') + '">' +
      '<p class="hint">La numerología de nombre usa todas las letras del nombre y apellidos de nacimiento (sin acentos).</p></div>';
  }
  function numCard(lbl, n, sub, k) {
    var x = D.N[n] || D.N[single(n)];
    return '<button class="numc" data-a="numOpen" data-k="' + k + '" data-n="' + n + '"><span class="nbig" data-count="' + n + '">' + n + '</span><span class="nt"><small>' + esc(lbl) + '</small><b>' + esc(x.n) + '</b><em>' + esc(sub || x.kw) + '</em></span></button>';
  }
  function detailNum(n, extra) {
    var x = D.N[n] || D.N[single(n)], card = tarotName(n);
    return '<h3>' + n + ' · ' + esc(x.n) + '</h3><p class="kw">' + esc(x.kw) + '</p>' +
      '<div class="facts"><div><small>Planeta</small><b>' + esc(x.pl) + '</b></div><div><small>Elemento</small><b>' + esc(x.el) + '</b></div><div><small>Color</small><b>' + esc(x.col) + '</b></div><div><small>Piedra</small><b>' + esc(x.st) + '</b></div>' +
      '<div><small>Letra hebrea</small><b>' + esc(x.he) + '</b></div><div><small>Arcano</small><b>' + esc(card) + '</b></div></div>' +
      '<p><b>✨ Luz:</b> ' + esc(x.luz) + '</p><p><b>🌑 Sombra:</b> ' + esc(x.sombra) + '</p><p><b>💞 Amor:</b> ' + esc(x.amor) + '</p><p><b>💼 Trabajo:</b> ' + esc(x.trabajo) + '</p><p><b>🫀 Cuerpo:</b> ' + esc(x.cuerpo) + '</p>' +
      '<div class="area tip"><div class="ah"><b>🕯️ Práctica</b></div><p>' + esc(x.prac) + '</p></div>' + (extra || '');
  }
  function karmicBox(r) {
    var list = [];
    ['lp:Camino de vida', 'day:Día de nacimiento', 'expr:Expresión', 'soul:Alma', 'pers:Personalidad'].forEach(function (s) {
      var k = s.split(':')[0], o = r[k]; if (o && o.karmic) list.push('<p><b>' + o.karmic.key + ' · ' + s.split(':')[1] + ':</b> ' + esc(o.karmic.txt) + '</p>');
    });
    return list.length ? '<article class="rd"><div class="rd-h"><div><small>Deuda kármica</small><b>⚖️ Lecciones pendientes</b></div></div>' + list.join('') + '<p class="hint">La deuda kármica no es un castigo: señala un aprendizaje intensivo.</p></article>' : '';
  }

  function mapaHTML(r) {
    var h = '<div class="numgrid">' + numCard('Camino de vida', r.lp.n, 'Tu misión y el rumbo de tu vida', 'lp') + numCard('Día de nacimiento', r.day.n, 'Un talento natural que traes', 'day') +
      numCard('Actitud', r.attitude, 'Cómo reaccionas ante la vida', 'att');
    if (r.expr) h += numCard('Expresión', r.expr.n, 'Tus talentos y cómo los muestras', 'expr') + numCard('Deseo del alma', r.soul.n, 'Lo que de verdad anhelas', 'soul') + numCard('Personalidad', r.pers.n, 'La imagen que proyectas', 'pers') + numCard('Madurez', r.maturity, 'Hacia dónde evolucionas (desde ~35 años)', 'mat');
    h += '</div>';
    if (!r.expr) h += fullNameBox();
    h += karmicBox(r);
    if (r.expr) {
      h += '<article class="rd"><div class="rd-h"><div><small>Tu nombre</small><b>🧩 Lecciones y pasión oculta</b></div></div>' +
        '<p><b>Lecciones kármicas (números que faltan):</b> ' + (r.lessons.length ? r.lessons.map(function (n) { return n + ' (' + esc(D.N[n].n.replace('El ', '')) + ')'; }).join(', ') : 'ninguna: tu nombre contiene todos los números.') + '</p>' +
        '<p><b>Pasión oculta:</b> ' + r.passion.map(function (n) { return n + ' ' + esc(D.N[n].n); }).join(', ') + '. Es la energía que más se repite en tu nombre y que vives con intensidad.</p>' +
        '<p><b>Planos de expresión:</b></p>' + Object.keys(r.planes).map(function (k) { return '<div class="bar2"><span>' + k + '</span><i style="width:' + Math.min(100, r.planes[k] * 12) + '%"></i><b>' + r.planes[k] + '</b></div>'; }).join('') +
        '<p class="hint">El plano con más letras es tu forma natural de actuar. ' + esc((function () { var best = Object.keys(r.planes).sort(function (a, b) { return r.planes[b] - r.planes[a]; })[0]; return best + ': ' + D.PLANE_TXT[best]; })()) + '</p></article>';
    }
    return h;
  }

  function pitaHTML(r) {
    var layout = [[1, 4, 7], [2, 5, 8], [3, 6, 9]], sq = r.square;
    var grid = '<div class="psq">' + layout.map(function (row) { return row.map(function (c) {
      var k = sq[c] || 0;
      return '<div class="pc c' + Math.min(k, 4) + '"><small>' + D.CELL[c][0] + '</small><b>' + (k ? new Array(k + 1).join(String(c)) : '·') + '</b></div>';
    }).join(''); }).join('') + '</div>';
    var lines = D.LINES.map(function (l) {
      var cnt = l[1].reduce(function (s, c) { return s + (sq[c] || 0); }, 0), lv = cnt === 0 ? 'vacía' : cnt <= 2 ? 'suave' : cnt <= 5 ? 'equilibrada' : 'muy fuerte';
      var tx = cnt === 0 ? 'Área por desarrollar con intención.' : cnt <= 2 ? 'Presente pero discreta; se activa con práctica.' : cnt <= 5 ? 'Bien integrada en tu vida.' : 'Muy marcada: gran fuerza, cuida el exceso.';
      return '<div class="lnrow"><b>' + esc(l[0]) + '</b><span>' + l[1].join('·') + '</span><i class="lv ' + (cnt === 0 ? 'z' : cnt <= 2 ? 'l' : cnt <= 5 ? 'm' : 'h') + '">' + lv + '</i><p>' + tx + '</p></div>';
    }).join('');
    var cells = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (c) {
      var k = sq[c] || 0, t = k === 0 ? D.CELL[c][1] : k < 3 ? D.CELL[c][2] : D.CELL[c][3];
      return '<div class="cellrow"><b>' + c + ' · ' + esc(D.CELL[c][0]) + ' <em>(' + k + ')</em></b><p>' + esc(t) + '</p></div>';
    }).join('');
    return '<article class="rd sum"><div class="rd-h"><div><small>Cuadrado de Pitágoras</small><b>🔲 Tu psicomatriz</b></div></div>' + grid +
      '<p class="hint">Números de trabajo: ' + r.work.join(' · ') + '. Cada celda cuenta cuántas veces aparece ese dígito en tu fecha y en los números de trabajo.</p></article>' +
      '<h3 class="sec">Líneas</h3><div class="lines">' + lines + '</div><h3 class="sec">Celda por celda</h3>' + cells +
      '<p class="fine">Interpretación tradicional de la escuela pitagórica; los nombres de las líneas varían entre autores. Úsalo como espejo, no como sentencia.</p>';
  }

  function ciclosHTML(r) {
    var py = D.N[r.py], pm = D.N[r.pm], pd = D.N[r.pd], ages = new Date().getFullYear() - ARC.profile.birth.y;
    var cyc = '<div class="cycle">' + r.cycle.map(function (c) { return '<div class="' + (c.y === new Date().getFullYear() ? 'on' : '') + '"><small>' + c.y + '</small><b>' + c.n + '</b></div>'; }).join('') + '</div>';
    var pins = r.pin.map(function (p, i) {
      var cur = ages >= p.from && (p.to === null || ages < p.to);
      return '<article class="rd' + (cur ? ' sum' : '') + '"><div class="rd-h"><i>' + p.n + '</i><div><small>Pináculo ' + (i + 1) + ' · edad ' + p.from + (p.to === null ? ' en adelante' : '–' + p.to) + (cur ? ' · ahora' : '') + '</small><b>' + esc((D.N[p.n] || D.N[single(p.n)]).n) + '</b></div></div><p>' + esc(D.PINNACLE_TXT[p.n] || '') + '</p>' +
        '<p class="kw">Desafío: ' + r.chal[i] + ' — ' + esc(D.CHALLENGE_TXT[r.chal[i]]) + '</p></article>';
    }).join('');
    return '<div class="numgrid">' + numCard('Año personal ' + new Date().getFullYear(), r.py, esc(SKYTXT.YEAR[r.py]), 'py') + numCard('Mes personal', r.pm, 'La energía de este mes', 'pm') + numCard('Día personal', r.pd, 'La energía de hoy', 'pd') + '</div>' +
      '<article class="rd"><div class="rd-h"><div><small>Tu ciclo de 9 años</small><b>🔄 Año personal por año</b></div></div>' + cyc + '<p class="hint">El año personal va de 1 a 9: 1 siembra, 5 cambia, 9 cierra. El año universal ' + new Date().getFullYear() + ' es ' + r.universal + ' (' + esc(D.N[r.universal].n) + ').</p></article>' +
      '<h3 class="sec">Pináculos y desafíos</h3>' + pins +
      '<p class="fine">Los pináculos son cuatro grandes etapas de tu vida; el desafío indica la lección que las acompaña.</p>';
  }

  function nombreHTML(r) {
    var h = fullNameBox();
    if (!r.expr) return h;
    var p = nameParts(P.fullName);
    var freq = {}; p.all.forEach(function (v) { freq[v] = (freq[v] || 0) + 1; });
    var bars = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<div class="fbar"><i style="height:' + ((freq[n] || 0) * 14 + 4) + 'px"></i><b>' + n + '</b><small>' + (freq[n] || 0) + '</small></div>'; }).join('');
    return h + '<article class="rd"><div class="rd-h"><div><small>Frecuencia de números en tu nombre</small><b>📊 Tu huella numérica</b></div></div><div class="fbars">' + bars + '</div></article>' +
      '<div class="numgrid">' + numCard('Expresión', r.expr.n, 'Cómo manifiestas tus talentos', 'expr') + numCard('Deseo del alma', r.soul.n, 'Tus vocales: lo que anhelas', 'soul') + numCard('Personalidad', r.pers.n, 'Tus consonantes: lo que muestras', 'pers') + '</div>' + karmicBox(r);
  }

  function patronesHTML() {
    var res = NM.text ? detect(NM.text) : null, h = '<div class="panel"><div class="lbl">Detector de patrones</div><p class="hint">Escribe o pega números que te rodean: horas que ves (11:11), matrículas, teléfonos, fechas, importes… Buscamos repeticiones, secuencias, números maestros y mensajes angélicos.</p>' +
      '<textarea id="pattext" rows="3" placeholder="Ej.: 11:11, 1234, 20/02/2022, 3 3 3…">' + esc(NM.text) + '</textarea><button class="btn primary big" data-a="patRun">Analizar</button></div>';
    if (!res) return h;
    if (!res.tokens.length) return h + '<p class="hint">No encuentro números en el texto.</p>';
    h += '<h3 class="sec">Resultado</h3>';
    h += '<article class="rd sum"><div class="rd-h"><div><small>Resumen</small><b>' + res.tokens.length + ' número(s) · ' + res.total + ' dígitos</b></div></div>' +
      '<p>Dígitos dominantes: ' + res.top.map(function (d) { return '<b>' + d + '</b> (' + res.freq[d] + '×, ' + esc(D.N[+d] ? D.N[+d].n : '') + ')'; }).join(', ') + '.</p>' +
      (res.top.length ? '<p class="kw">' + esc(D.N[+res.top[0]] ? D.N[+res.top[0]].kw : '') + '</p>' : '') + '</article>';
    h += res.tokens.map(function (t) {
      return '<article class="rd"><div class="rd-h"><i>' + (t.s.length > 3 ? '#' : t.s.length) + '</i><div><small>Reducción ' + t.chain.join(' → ') + '</small><b>' + esc(t.s) + '</b></div></div>' +
        (t.notes.length ? t.notes.map(function (n) { return '<p>• ' + esc(n) + '</p>'; }).join('') : '<p class="hint">Sin patrón especial; su raíz es ' + t.chain[t.chain.length - 1] + ': ' + esc(D.N[t.chain[t.chain.length - 1]].kw) + '.</p>') + '</article>';
    }).join('');
    return h;
  }

  function sincHTML() {
    var counts = {}, hours = {};
    syncs.forEach(function (s) { counts[s.n] = (counts[s.n] || 0) + 1; var h = new Date(s.ts).getHours(); hours[h] = (hours[h] || 0) + 1; });
    var top = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 5);
    var h = '<div class="panel"><div class="lbl">Diario de sincronicidades</div><p class="hint">Cada vez que un número se repita en tu día, anótalo. Con el tiempo, la app detecta tus patrones.</p>' +
      '<div class="datebar"><input id="syncn" type="text" inputmode="numeric" placeholder="Número visto (ej. 11:11)"><button class="btn primary sm" data-a="syncAdd">Anotar</button></div>' +
      '<input id="syncnote" type="text" placeholder="Qué pasaba o qué pensabas (opcional)"></div>';
    if (syncs.length >= 3) {
      h += '<article class="rd sum"><div class="rd-h"><div><small>Tus patrones</small><b>📈 Lo que se repite</b></div></div><p>' +
        top.map(function (k) { var e = dictEntry(k.replace(/\D/g, '')); return '<b>' + esc(k) + '</b> × ' + counts[k] + (e && e.angel ? ' — ' + esc(e.angel) : ''); }).join('<br>') + '</p>' +
        (Object.keys(hours).length ? '<p class="hint">Hora en la que más los ves: ' + Object.keys(hours).sort(function (a, b) { return hours[b] - hours[a]; })[0] + ':00.</p>' : '') + '</article>';
    }
    h += syncs.length ? syncs.slice(0, 30).map(function (s, i) {
      return '<div class="entry sy"><small>' + new Date(s.ts).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</small><b>' + esc(s.n) + '</b>' + (s.note ? '<p>' + esc(s.note) + '</p>' : '') + '<button class="x3" data-a="syncDel" data-i="' + i + '" aria-label="Borrar">✕</button></div>';
    }).join('') : '<div class="empty"><b>✨</b><p class="hint">Aún no has anotado ninguna sincronicidad.</p></div>';
    return h;
  }

  function compatHTML(r) {
    var h = '<div class="panel"><div class="lbl">Compatibilidad numerológica</div><p class="hint">Compara tu camino de vida con el de otra persona.</p><input type="date" id="date2" value="' + esc(NM.date2) + '"><button class="btn primary big" data-a="compatRun">Comparar</button></div>';
    if (NM.date2) {
      var p = NM.date2.split('-'), b2 = { y: +p[0], m: +p[1], d: +p[2] }, r2 = calc(b2, null), c = compat(r.lp.n, r2.lp.n);
      h += '<article class="rd sum"><div class="rd-h"><div><small>Tu ' + r.lp.n + ' y su ' + r2.lp.n + '</small><b>💞 ' + c.score + '% de afinidad</b></div></div><div class="meter"><i style="width:' + c.score + '%"></i></div><p>' + esc(c.txt) + '</p>' +
        '<p class="hint">Caminos de vida: ' + esc(D.N[r.lp.n].n) + ' + ' + esc(D.N[r2.lp.n].n) + '. Es una guía orientativa: las relaciones dependen sobre todo de las personas.</p></article>';
    }
    return h;
  }

  function dicHTML() {
    var e = NM.dict ? dictEntry(NM.dict) : null;
    var quick = [11, 22, 33, 111, 222, 333, 444, 555, 777, 888, 999, 1111, 1212, 1234, 13, 14, 16, 19].map(function (n) { return '<button data-a="dicGo" data-n="' + n + '">' + n + '</button>'; }).join('');
    var h = '<div class="panel"><div class="lbl">Diccionario de números (0–9999)</div><input id="dicin" type="text" inputmode="numeric" maxlength="4" placeholder="Escribe un número" value="' + esc(NM.dict) + '"><div class="chips wrap">' + quick + '</div></div>';
    if (!e) return h + (NM.dict ? '<p class="hint">Escribe un número entre 0 y 9999.</p>' : '');
    h += '<article class="rd sum"><div class="rd-h"><i>' + (String(e.n).length > 3 ? '#' : e.n) + '</i><div><small>Reducción ' + e.chain.join(' → ') + '</small><b>' + e.n + ' · ' + esc(e.base.n) + '</b></div></div>' +
      (e.angel ? '<p><b>👼 Número angélico:</b> ' + esc(e.angel) + '</p>' : '') + (e.karmic ? '<p><b>⚖️ Deuda kármica ' + e.karmic[0] + ':</b> ' + esc(e.karmic[1]) + '</p>' : '') +
      (e.parts.length ? '<p><b>Dígitos:</b> ' + e.parts.map(function (p) { return p.d + ' (' + esc(p.n.replace('El ', '').toLowerCase()) + ')'; }).join(' + ') + '</p>' : '') +
      '<p class="kw">' + esc(e.base.kw) + '</p>' + (e.tarot ? '<p><b>🃏 Arcano:</b> ' + esc(e.tarot) + '</p>' : '') + '</article>' + '<article class="rd">' + detailNum(e.red) + '</article>';
    return h;
  }

  function html() {
    var tabs = '<div class="chips sub">' + SUBS.map(function (s) { return '<button data-a="numSub" data-v="' + s[0] + '" class="' + (NM.sub === s[0] ? 'on' : '') + '">' + s[1] + '</button>'; }).join('') + '</div>';
    if (NM.sub === 'patrones') return tabs + patronesHTML();
    if (NM.sub === 'sinc') return tabs + sincHTML();
    if (NM.sub === 'dic') return tabs + dicHTML();
    if (!P.birth) return tabs + needBirth();
    var r = calc(P.birth, P.fullName);
    if (NM.sub === 'pita') return tabs + pitaHTML(r);
    if (NM.sub === 'ciclos') return tabs + ciclosHTML(r);
    if (NM.sub === 'nombre') return tabs + nombreHTML(r);
    if (NM.sub === 'compat') return tabs + compatHTML(r);
    return tabs + mapaHTML(r);
  }

  /* ---------- acciones ---------- */
  A.numSub = function (el) { NM.sub = el.dataset.v; ARC.render(true); };
  A.numBirth = function () {
    var v = $('#nbirth').value; if (!v) { ARC.toast('Elige una fecha'); return; }
    var p = v.split('-'); P.birth = { y: +p[0], m: +p[1], d: +p[2] }; ARC.save('profile'); ARC.render(true);
  };
  A.numOpen = function (el) {
    var n = Number(el.dataset.n), r = calc(P.birth, P.fullName), extra = '';
    if (el.dataset.k === 'lp' && r.lp.karmic) extra = '<p><b>⚖️ ' + r.lp.karmic.key + ':</b> ' + esc(r.lp.karmic.txt) + '</p>';
    ARC.openModal(detailNum(n, extra), 'tall');
  };
  A.patRun = function () { NM.text = $('#pattext').value; ARC.render(true); };
  A.syncAdd = function () {
    var n = $('#syncn').value.trim(); if (!n) { ARC.toast('Escribe el número que viste'); return; }
    syncs.unshift({ ts: Date.now(), n: n, note: $('#syncnote').value.trim() }); saveSync(); ARC.render(true); ARC.toast('Anotado ✨');
  };
  A.syncDel = function (el) { syncs.splice(Number(el.dataset.i), 1); saveSync(); ARC.render(true); };
  A.compatRun = function () { NM.date2 = $('#date2').value; ARC.render(true); };
  A.dicGo = function (el) { NM.dict = el.dataset.n; ARC.render(true); };
  ARC.inputs.fullname = function (v) { P.fullName = v; ARC.save('profile'); };
  ARC.changes.fullname = function () { ARC.render(true); };
  ARC.inputs.dicin = function (v) { NM.dict = v.replace(/\D/g, '').slice(0, 4); clearTimeout(NM.t); NM.t = setTimeout(function () { ARC.render(true); var i = $('#dicin'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 450); };

  /* resumen compacto para la IA */
  function summary() {
    if (!P.birth) return '';
    var r = calc(P.birth, P.fullName), s = 'Numerología: camino de vida ' + r.lp.n + (r.lp.karmic ? ' (deuda kármica ' + r.lp.karmic.key + ')' : '') + ', día ' + r.day.n + ', año personal ' + r.py + ' (' + new Date().getFullYear() + '), mes ' + r.pm + '.';
    if (r.expr) s += ' Expresión ' + r.expr.n + ', alma ' + r.soul.n + ', personalidad ' + r.pers.n + '; lecciones kármicas: ' + (r.lessons.join(', ') || 'ninguna') + '.';
    return s;
  }

  ARC.num = { html: html, calc: calc, red: red, summary: summary, dictEntry: dictEntry, detect: detect };
})();
