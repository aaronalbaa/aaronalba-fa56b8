/* Oráculos: lecturas con cualquier mazo, I Ching y oráculos rápidos (péndulo, bola, moneda, sí/no, dados). */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, $$ = ARC.$$, esc = ARC.esc, S = ARC.settings, P = ARC.profile, rnd = ARC.rnd;

  /* ---------- tiradas ---------- */
  var SPREADS = {
    una: { name: 'Una carta', emoji: '🌅', desc: 'El mensaje del momento', pos: ['Mensaje'], layout: [[1]] },
    ppf: { name: 'Pasado · Presente · Futuro', emoji: '⏳', desc: 'La línea del tiempo clásica', pos: ['Pasado', 'Presente', 'Futuro'], layout: [[1, 2, 3]] },
    sit: { name: 'Situación y consejo', emoji: '🧭', desc: 'Qué pasa, qué pesa y qué hacer', pos: ['Situación', 'Desafío', 'Consejo'], layout: [[1, 2, 3]] },
    amor: { name: 'Amor y vínculos', emoji: '💞', desc: 'Tú, la conexión y la otra persona', pos: ['Tú', 'La conexión', 'La otra persona'], layout: [[1, 2, 3]] },
    herr: { name: 'Herradura', emoji: '🧲', desc: 'Siete cartas en arco', pos: ['Pasado', 'Presente', 'Futuro cercano', 'Tú', 'Tu entorno', 'Obstáculos', 'Resultado'],
      layout: [[0, 0, 0, 4, 0, 0, 0], [0, 0, 3, 0, 5, 0, 0], [0, 2, 0, 0, 0, 6, 0], [1, 0, 0, 0, 0, 0, 7]] },
    celta: { name: 'Cruz Celta', emoji: '☘️', desc: 'La lectura profunda de diez cartas',
      pos: ['Presente', 'Desafío', 'Base', 'Pasado', 'Meta o corona', 'Futuro cercano', 'Tú', 'Entorno', 'Esperanzas y miedos', 'Resultado'],
      layout: [[0, 5, 0, 10], [4, [1, 2], 6, 9], [0, 3, 0, 8], [0, 0, 0, 7]] },
    linea5: { name: 'Línea de cinco', emoji: '➖', desc: 'Una historia en cinco pasos', pos: ['Pasado lejano', 'Pasado reciente', 'Presente', 'Futuro cercano', 'Resultado'], layout: [[1, 2, 3, 4, 5]] },
    nornas: { name: 'Las Nornas', emoji: '🧵', desc: 'Urd, Verdandi y Skuld', pos: ['Urd · lo que fue', 'Verdandi · lo que es', 'Skuld · lo que será'], layout: [[1, 2, 3]] },
    cruz5: { name: 'Cruz rúnica', emoji: '✚', desc: 'Cinco runas en cruz', pos: ['Situación', 'Raíz', 'Consejo', 'Reto', 'Resultado'], layout: [[0, 1, 0], [2, 3, 4], [0, 5, 0]] }
  };

  var SUITMSG = {
    bastos: 'dominan los Bastos 🔥: la clave está en la acción y la motivación',
    copas: 'dominan las Copas 🏆: lo emocional y los vínculos llevan la voz',
    espadas: 'dominan las Espadas ⚔️: pesan los pensamientos, las palabras y las decisiones',
    oros: 'dominan los Oros 🪙: el terreno material, el trabajo y el cuerpo tienen protagonismo'
  };

  function fresh(keep) {
    return {
      stage: 'hub', deck: keep ? keep.deck : 'tarot', mode: keep ? keep.mode : 'virtual', spread: keep ? keep.spread : 'ppf',
      question: keep ? keep.question : '', cards: [], revealed: [], dealt: false, shuffling: false, ai: '', aiState: 'idle', aiError: '',
      quick: null, ich: null
    };
  }
  var R = ARC.R = fresh();
  var timers = [];
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function D() { return DECKS.get(R.deck, P.tarotStyle); }
  function sp() { return SPREADS[R.spread]; }
  function owned(id) { return (P.owned || []).indexOf(id) > -1; }

  /* ---------- carta ---------- */
  function tcard(c, o) {
    o = o || {};
    var dk = o.deck || D(), d = c ? dk.cards[c.id] : null, face = '<div class="face"></div>';
    if (d) {
      var cls = d.suit ? 's-' + d.suit : (d.arcana === 'mayor' ? 's-mayor' : (d.group && d.group !== 'all' ? 's-' + d.group : 's-otro'));
      face = '<div class="face ' + cls + (c.rev ? ' rev' : '') + '"><span class="top">' + esc(d.num) + '</span><span class="em' + (d.glyph ? ' glyph' : '') + '">' + d.emoji + '</span>' +
        '<span class="nm">' + esc(d.name) + '</span></div>';
    }
    return '<div class="tcard' + (o.flipped ? ' flipped' : '') + (o.cls ? ' ' + o.cls : '') + '" ' + (o.attrs || '') + (o.style ? ' style="' + o.style + '"' : '') +
      '><div class="in">' + face + '<div class="back"><span>✦</span></div></div>' + (o.num ? '<i class="badge">' + o.num + '</i>' : '') + '</div>';
  }

  /* ---------- hub ---------- */
  var QUICK = [['pendulo', '🔮', 'Péndulo'], ['bola', '🎱', 'Bola de cristal'], ['carta', '🃏', 'Sí/No con carta'], ['moneda', '🪙', 'Moneda'], ['dados', '🎲', 'Dados astrales'], ['una', '✨', 'Una carta']];

  function hubHTML() {
    var tiles = DECKS.list.map(function (d) {
      return '<button class="tile' + (owned(d.id) ? ' own' : '') + '" data-a="method" data-v="' + d.id + '"><b>' + d.emoji + '</b><span>' + esc(d.id === 'tarot' ? 'Tarot' : d.name) + '</span><small>' + esc(d.desc) + '</small>' +
        (owned(d.id) ? '<em>tuyo</em>' : '') + '</button>';
    }).join('') +
      '<button class="tile" data-a="method" data-v="iching"><b>☯️</b><span>I Ching</span><small>64 hexagramas con monedas</small></button>' +
      '<button class="tile" data-a="goSky" data-v="numeros"><b>🔢</b><span>Numerología</span><small>Camino de vida y año personal</small></button>';
    return '<section class="page"><header class="hero"><h1>Oráculos <span>🔮</span></h1><p>Elige tu método y pregunta con el corazón</p></header>' +
      '<div class="panel"><div class="lbl">Pregunta suelta</div>' +
      '<textarea id="q" rows="2" maxlength="300" placeholder="Escribe lo que quieres preguntar…">' + esc(R.question) + '</textarea>' +
      '<div class="chips wrap">' + QUICK.map(function (q) { return '<button data-a="quick" data-v="' + q[0] + '">' + q[1] + ' ' + q[2] + '</button>'; }).join('') + '</div></div>' +
      '<div class="lbl pad">Todos los métodos</div><div class="tiles">' + tiles + '</div>' +
      '<p class="fine">Estas herramientas sirven para la reflexión personal y el entretenimiento. No predicen el futuro.</p></section>';
  }

  /* ---------- preparación de la lectura ---------- */
  function setupHTML() {
    var d = D(), s = sp();
    var styles = R.deck === 'tarot' ? '<div class="lbl">Estilo de tu baraja</div><div class="seg three">' +
      Object.keys(DECKS.STYLES).map(function (k) { return '<button data-a="tstyle" data-v="' + k + '" class="' + (P.tarotStyle === k ? 'on' : '') + '">' + esc(DECKS.STYLES[k].name.replace('Tarot de ', '')) + '</button>'; }).join('') + '</div>' : '';
    return '<section class="page"><button class="btn link left" data-a="hub">← Todos los métodos</button>' +
      '<header class="hero"><h1>' + d.emoji + ' ' + esc(d.name) + '</h1><p>' + esc(d.desc) + '</p></header>' +
      '<div class="panel">' + styles +
      '<div class="lbl">Tu pregunta</div><textarea id="q" rows="3" maxlength="300" placeholder="Ej.: ¿Qué necesito entender sobre mi trabajo ahora?">' + esc(R.question) + '</textarea>' +
      '<div class="lbl">¿Quién echa las cartas?</div><div class="seg">' +
      '<button data-a="mode" data-v="virtual" class="' + (R.mode === 'virtual' ? 'on' : '') + '">🎴 La baraja</button>' +
      '<button data-a="mode" data-v="fisica" class="' + (R.mode === 'fisica' ? 'on' : '') + '">🖐️ Mis cartas</button></div>' +
      '<p class="hint">' + (R.mode === 'virtual' ? 'Barajamos y repartimos por ti. Tú giras las cartas.' : 'Echa tus cartas físicas y dinos cuáles salieron: las interpretamos.') + '</p>' +
      '<div class="lbl">Tirada</div><div class="spreads">' + d.spreads.map(function (id) {
        var x = SPREADS[id];
        return '<button class="spread' + (id === R.spread ? ' on' : '') + '" data-a="spread" data-v="' + id + '"><b>' + x.emoji + '</b><span>' + esc(x.name) + '</span><small>' + x.pos.length + (x.pos.length === 1 ? ' carta' : ' cartas') + '</small></button>';
      }).join('') + '</div><p class="hint">' + esc(s.desc) + '</p>' +
      '<button class="btn primary big" data-a="start">Continuar ✨</button></div></section>';
  }

  function slotHTML(p) {
    var c = R.cards[p], num = p + 1;
    if (R.stage === 'reading') return tcard(c, { flipped: true, num: num, attrs: 'data-a="detail" data-p="' + p + '"' });
    if (R.mode === 'fisica') {
      if (!c) return '<button class="slot" data-a="pick" data-p="' + p + '" aria-label="Elegir carta ' + num + '"><span>+</span><i class="badge">' + num + '</i></button>';
      return tcard(c, { flipped: true, num: num, attrs: 'data-a="pick" data-p="' + p + '"' });
    }
    return tcard(c, { flipped: !!R.revealed[p], num: num, cls: 'deal', style: 'animation-delay:' + (p * 90) + 'ms',
      attrs: (R.revealed[p] ? 'data-a="detail"' : 'data-a="flip"') + ' data-p="' + p + '"' });
  }

  function gridHTML() {
    var s = sp(), cols = s.layout[0].length, dense = cols >= 7;
    var h = '<div class="grid' + (dense ? ' dense' : '') + ' g-' + R.spread + '" style="--cols:' + cols + '">';
    s.layout.forEach(function (row) {
      row.forEach(function (cell) {
        if (!cell) { h += '<div class="cell empty"></div>'; return; }
        var base = Array.isArray(cell) ? cell[0] : cell, over = Array.isArray(cell) ? cell[1] : 0;
        h += '<div class="cell">' + slotHTML(base - 1);
        if (over) h += '<div class="overlay">' + slotHTML(over - 1) + '</div>';
        if (!dense) h += '<div class="plabel">' + esc(s.pos[base - 1]) + (over ? ' + ' + esc(s.pos[over - 1]) : '') + '</div>';
        h += '</div>';
      });
    });
    return h + '</div>';
  }

  function allReady() {
    var n = sp().pos.length;
    if (R.mode === 'fisica') return R.cards.filter(Boolean).length === n;
    return R.dealt && R.revealed.filter(Boolean).length === n;
  }
  function actionsHTML() {
    var n = sp().pos.length, h = '';
    if (R.mode === 'fisica') {
      var k = R.cards.filter(Boolean).length;
      if (k < n) h += '<p class="hint c">Toca cada hueco y elige la carta que te salió (' + k + '/' + n + ')</p>';
    } else if (R.dealt && !allReady()) {
      h += '<p class="hint c">Toca cada carta para girarla</p><button class="btn ghost" data-a="revealAll">Revelar todas</button>';
    }
    if (allReady()) h += '<button class="btn primary big" data-a="reading">Ver lectura ✨</button>';
    return h + '<button class="btn link" data-a="back">← Cambiar tirada</button>';
  }

  function qHeader() {
    var s = sp(), d = D();
    return '<header class="qh"><small>' + s.emoji + ' ' + esc(s.name) + ' · ' + esc(d.name) + '</small>' +
      (R.question ? '<h2>“' + esc(R.question) + '”</h2>' : '<h2>Lectura general</h2>') + '</header>';
  }

  function tableHTML() {
    var body;
    if (R.mode === 'virtual' && !R.dealt) {
      body = '<div class="deck-wrap"><div class="deck' + (R.shuffling ? ' shuffling' : '') + '">' +
        '<div class="tcard"><div class="in"><div class="back"><span>✦</span></div></div></div>'.repeat(5) + '</div>' +
        '<button class="btn primary big" data-a="shuffle"' + (R.shuffling ? ' disabled' : '') + '>' + (R.shuffling ? 'Barajando…' : '🔀 Barajar y repartir') + '</button>' +
        '<p class="hint c">Piensa en tu pregunta mientras barajas</p></div><button class="btn link" data-a="back">← Cambiar tirada</button>';
    } else {
      body = gridHTML() + '<div id="actions" class="actions">' + actionsHTML() + '</div>';
    }
    return '<section class="page">' + qHeader() + body + '</section>';
  }

  /* ---------- lectura base ---------- */
  function baseReading() {
    var s = sp(), d = D();
    var items = s.pos.map(function (name, i) {
      var c = R.cards[i], card = d.cards[c.id];
      return { pos: name, n: i + 1, card: card, rev: c.rev, text: c.rev ? card.rev : card.up, kw: c.rev ? card.kwRev : card.kwUp };
    });
    var n = items.length, parts = [];
    var majors = items.filter(function (x) { return x.card.arcana === 'mayor'; }).length;
    var revs = items.filter(function (x) { return x.rev; }).length;
    var counts = {};
    items.forEach(function (x) { if (x.card.suit) counts[x.card.suit] = (counts[x.card.suit] || 0) + 1; });
    var ranked = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    if (n >= 3 && R.deck === 'tarot' && majors >= Math.ceil(n / 2)) parts.push('Predominan los Arcanos Mayores: es un tema de peso, con aprendizaje profundo detrás.');
    if (ranked.length && counts[ranked[0]] >= 2 && (ranked.length === 1 || counts[ranked[0]] > counts[ranked[1]])) parts.push('En esta tirada ' + SUITMSG[ranked[0]] + '.');
    if (d.reversible && n >= 2 && revs >= Math.ceil(n / 2)) parts.push('Varias cartas salen invertidas: hay procesos internos o bloqueos que conviene revisar con calma.');
    else if (d.reversible && revs === 0 && n >= 3) parts.push('Todas salen derechas: la energía fluye con claridad.');
    if (!parts.length) parts.push('Las cartas se complementan entre sí: léelas como una pequeña historia, de la primera a la última.');
    parts.push('Recuerda: este oráculo refleja posibilidades, no sentencias. Tú decides el siguiente paso. 🌿');
    return { items: items, summary: parts.join(' ') };
  }

  function aiHTML() {
    if (R.aiState === 'loading') return '<div class="ai load"><div class="orb-s"></div><p>Las cartas se están alineando…</p></div>';
    if (R.aiState === 'done') return '<div class="ai">' + ARC.fmt(R.ai) + '</div><button class="btn link" data-a="ai">↻ Otra interpretación</button>';
    var h = R.aiState === 'error' ? '<p class="err">' + esc(R.aiError) + '</p>' : '';
    h += '<button class="btn primary big" data-a="ai">✨ Interpretar con IA</button><p class="hint c">Con ' + esc(ARC.ai.PROVIDERS[S.provider].name) + ' · <a href="#" data-a="tab" data-tab="me">cambiar</a></p>';
    return h;
  }
  function updateAI() { var el = $('#ai'); if (el) el.innerHTML = aiHTML(); }

  function readingHTML() {
    var b = baseReading();
    var list = b.items.map(function (x) {
      return '<article class="rd"><div class="rd-h"><i>' + x.n + '</i><div><small>' + esc(x.pos) + '</small><b>' + (x.card.glyph ? '' : x.card.emoji + ' ') + esc(x.card.name) + '</b></div>' +
        (x.rev ? '<span class="tag">↺ Invertida</span>' : '') + '</div><p class="kw">' + esc(x.kw) + '</p><p>' + esc(x.text) + '</p></article>';
    }).join('');
    return '<section class="page">' + qHeader() + gridHTML() + '<h3 class="sec">Lectura base</h3>' + list +
      '<article class="rd sum"><div class="rd-h"><div><small>Síntesis</small><b>🌙 Qué te cuentan juntas</b></div></div><p>' +
      (R.question ? 'Sobre tu pregunta, «' + esc(R.question) + '»: ' : '') + esc(b.summary) + '</p></article>' +
      '<h3 class="sec">Interpretación con IA</h3><div id="ai">' + aiHTML() + '</div>' +
      '<div class="actions"><button class="btn ghost" data-a="saveReading">📓 Guardar en mi diario</button><button class="btn link" data-a="hub">Nueva lectura</button></div></section>';
  }

  var SYSTEM_BASE = 'Eres una guía de oráculos cálida, serena y respetuosa que escribe en español. Interpretas la tirada que recibes ' +
    'conectando cada carta con su posición y con la pregunta de la persona. Reglas: tono empático y claro; ' +
    'no hagas predicciones absolutas ni afirmes certezas sobre el futuro; presenta el oráculo como una herramienta de reflexión; ' +
    'no des diagnósticos médicos, legales ni financieros (si el tema los toca, recomienda con suavidad consultar a un profesional); ' +
    'si hay señales de crisis emocional, responde con cuidado y sugiere buscar apoyo (en España, 024 o 112). ' +
    'Formato: una breve introducción, una interpretación de cada carta (en negrita el nombre y la posición), ' +
    'una síntesis que una las cartas y una pregunta final de introspección. Máximo unas 400 palabras y algunos emojis sutiles. ' + ARC.PERSONALIZE;

  var SYSTEM = SYSTEM_BASE;
  function userContext() { return 'CONTEXTO\n' + ARC.ctx(); }

  function aiInterpret() {
    ARC.ai.guard(function () {
      var s = sp(), d = D();
      var lines = s.pos.map(function (name, i) {
        var c = R.cards[i], card = d.cards[c.id];
        return (i + 1) + '. ' + name + ': ' + card.name + (c.rev ? ' (invertida)' : '') + ' — ' + (c.rev ? card.kwRev : card.kwUp);
      });
      var user = userContext() + '\nPregunta: ' + (R.question || '(sin pregunta concreta; lectura general)') + '\nOráculo: ' + d.name + '\nTirada: ' + s.name + '\nCartas:\n' + lines.join('\n');
      R.aiState = 'loading'; updateAI();
      ARC.ai.ask({ system: SYSTEM, messages: [{ role: 'user', content: user }], max: 1000 }).then(function (t) {
        R.ai = t; R.aiState = 'done'; updateAI();
      }).catch(function (e) { R.aiState = 'error'; R.aiError = e.message; updateAI(); });
    });
  }

  /* ---------- selector de cartas físicas ---------- */
  var pk = { slot: -1, q: '', f: 'all', rev: false };
  function pickerList() {
    var q = ARC.norm(pk.q.trim());
    var h = D().cards.filter(function (c) {
      if (pk.f !== 'all' && c.group !== pk.f) return false;
      return !q || ARC.norm(c.name).indexOf(q) > -1;
    }).map(function (c) {
      return '<button class="pk" data-a="choose" data-id="' + c.id + '"><span' + (c.glyph ? ' class="gl"' : '') + '>' + c.emoji + '</span>' + esc(c.name) + '</button>';
    }).join('');
    return h || '<p class="hint c">Sin resultados</p>';
  }
  function pickerModal(slot) {
    pk.slot = slot; pk.q = ''; pk.f = 'all'; pk.rev = false;
    var d = D();
    var chips = d.groups ? '<div class="chips" id="pkf">' + d.groups.map(function (g) { return '<button data-a="pkfilter" data-v="' + g[0] + '" class="' + (g[0] === 'all' ? 'on' : '') + '">' + g[1] + '</button>'; }).join('') + '</div>' : '';
    var rev = d.reversible && S.reversed ? '<label class="toggle"><input type="checkbox" id="pkrev"><span>↺ Salió invertida</span></label>' : '';
    ARC.openModal('<h3>Carta ' + (slot + 1) + ' · ' + esc(sp().pos[slot]) + '</h3><input id="pkq" type="search" placeholder="Buscar…" autocomplete="off">' + chips + rev +
      '<div class="pklist" id="pklist">' + pickerList() + '</div>', 'tall');
  }

  function detailModal(c, pos) {
    var d = D().cards[c.id];
    ARC.openModal('<div class="det">' + tcard(c, { flipped: true, cls: 'big' }) + '<div class="det-t">' + (pos ? '<small>' + esc(pos) + '</small>' : '') +
      '<h3>' + (d.glyph ? '' : d.emoji + ' ') + esc(d.name) + '</h3>' + (c.rev ? '<span class="tag">↺ Invertida</span>' : '') +
      '<p class="kw">' + esc(c.rev ? d.kwRev : d.kwUp) + '</p><p>' + esc(c.rev ? d.rev : d.up) + '</p>' +
      (D().reversible && !d.norev ? '<details><summary>Ver el significado ' + (c.rev ? 'derecho' : 'invertido') + '</summary><p class="kw">' + esc(c.rev ? d.kwUp : d.kwRev) + '</p><p>' + esc(c.rev ? d.up : d.rev) + '</p></details>' : '') +
      '</div></div>');
  }

  /* ---------- I Ching ---------- */
  function hexFigure(bits, lines, big) {
    var h = '<div class="hex' + (big ? ' big' : '') + '">';
    for (var i = 5; i >= 0; i--) {
      var mv = lines && (lines[i] === 6 || lines[i] === 9);
      h += '<div class="hl ' + (bits[i] ? 'yang' : 'yin') + (mv ? ' mv' : '') + '">' + (bits[i] ? '<i></i>' : '<i></i><i></i>') + '</div>';
    }
    return h + '</div>';
  }
  function ichSetup() {
    return '<section class="page"><button class="btn link left" data-a="hub">← Todos los métodos</button><header class="hero"><h1>☯️ I Ching</h1><p>El libro de las mutaciones: seis líneas, un hexagrama</p></header>' +
      '<div class="panel"><div class="lbl">Tu pregunta</div><textarea id="q" rows="3" maxlength="300" placeholder="Formula una pregunta abierta: ¿qué debo comprender de…?">' + esc(R.question) + '</textarea>' +
      '<p class="hint">Se lanzan tres monedas seis veces (de abajo arriba). Cada lanzamiento forma una línea.</p>' +
      '<button class="btn primary big" data-a="cast">🪙 Lanzar las monedas</button></div></section>';
  }
  function ichText(r) {
    var H = ICHING.H, a = H[r.num];
    var t = 'Hexagrama ' + r.num + ' · ' + a[1] + ' (' + a[0] + '). ' + a[2];
    t += ' Trigramas: ' + r.upper.n + ' (arriba) sobre ' + r.lower.n + ' (abajo).';
    if (r.rel) { var b = H[r.rel]; t += ' Líneas móviles en posición ' + r.moving.join(', ') + ': la situación evoluciona hacia el hexagrama ' + r.rel + ' · ' + b[1] + '. ' + b[2]; }
    else t += ' No hay líneas móviles: el mensaje es estable, tómalo tal cual.';
    return t;
  }
  function ichView() {
    var I = R.ich;
    if (!I || !I.lines) return ichSetup();
    var shown = I.shown, partial = I.lines.slice(0, shown);
    var h = '<section class="page"><header class="qh"><small>☯️ I Ching</small>' + (R.question ? '<h2>“' + esc(R.question) + '”</h2>' : '<h2>Lectura general</h2>') + '</header>';
    var bits = [0, 0, 0, 0, 0, 0].map(function (_, i) { return i < shown ? (partial[i] === 7 || partial[i] === 9 ? 1 : 0) : -1; });
    if (!I.res) h += '<div id="hexbox" class="hexbox">' + castFigure(partial) + '</div>';
    if (I.res) {
      var r = I.res, H = ICHING.H;
      h += '<div class="hexpair">' + '<div>' + hexFigure(r.bits, r.lines, true) + '<small>Hexagrama ' + r.num + '</small></div>' +
        (r.rel ? '<div class="arrow">→</div><div>' + hexFigure(ICHING.resolve(r.lines.map(function (v) { return v === 6 ? 7 : v === 9 ? 8 : v; })).bits, null, true) + '<small>Hexagrama ' + r.rel + '</small></div>' : '') + '</div>';
      h += '<article class="rd sum"><div class="rd-h"><div><small>Hexagrama ' + r.num + '</small><b>' + esc(H[r.num][1]) + '</b></div></div><p class="kw">' + esc(H[r.num][0]) + ' · ' + r.upper.e + ' ' + r.upper.n + ' sobre ' + r.lower.e + ' ' + r.lower.n + '</p><p>' + esc(H[r.num][2]) + '</p></article>';
      if (r.rel) h += '<article class="rd"><div class="rd-h"><div><small>Líneas móviles: ' + r.moving.join(', ') + '</small><b>Evoluciona hacia: ' + esc(H[r.rel][1]) + '</b></div></div><p>' + esc(H[r.rel][2]) + '</p></article>';
      h += '<h3 class="sec">Interpretación con IA</h3><div id="ai">' + aiHTML() + '</div>' +
        '<div class="actions"><button class="btn ghost" data-a="saveReading">📓 Guardar en mi diario</button><button class="btn link" data-a="hub">Nueva lectura</button></div>';
    }
    return h + '</section>';
  }
  function castFigure(partial) {
    var rows = '';
    for (var i = 5; i >= 0; i--) {
      if (i < partial.length) rows += '<div class="hl ' + (partial[i] === 7 || partial[i] === 9 ? 'yang' : 'yin') + (partial[i] === 6 || partial[i] === 9 ? ' mv' : '') + ' pop">' + (partial[i] === 7 || partial[i] === 9 ? '<i></i>' : '<i></i><i></i>') + '</div>';
      else rows += '<div class="hl empty"></div>';
    }
    return '<div class="hex big">' + rows + '</div><p class="hint c">' + (partial.length < 6 ? 'Línea ' + (partial.length + 1) + ' de 6…' : '') + '</p>';
  }
  function ichCast() {
    clearTimers();
    R.ich = { lines: ICHING.cast(rnd), shown: 0, res: null };
    ARC.render();
    for (var i = 1; i <= 6; i++) (function (n) {
      later(function () {
        if (!R.ich || ARC.tab !== 'oracle') return;
        R.ich.shown = n;
        if (n === 6) { R.ich.res = ICHING.resolve(R.ich.lines); ARC.render(); }
        else { var b = $('#hexbox'); if (b) b.innerHTML = castFigure(R.ich.lines.slice(0, n)); }
      }, n * 750);
    })(i);
  }

  /* ---------- oráculos rápidos ---------- */
  var BOLA = ['Sí, sin duda.', 'Todo apunta a que sí.', 'Las señales son favorables.', 'Confía: es probable.', 'Sí, pero con paciencia.',
    'Es posible, mira los detalles.', 'Aún está nublado: vuelve a preguntar.', 'Concéntrate y pregunta de nuevo.', 'Mejor no decirlo ahora.', 'No cuentes con ello todavía.',
    'Lo veo difícil.', 'Las señales dicen que no.', 'Mi respuesta es no.', 'Escucha a tu intuición: ya sabes la respuesta.', 'Depende de lo que tú decidas.',
    'Sí, si das el primer paso.', 'Más adelante será más claro.', 'Espera: no es el momento.', 'Hazlo con cuidado y sí.', 'Pregúntate si de verdad lo quieres.'];
  var PEND = {
    si: ['Sí', 'El péndulo oscila hacia delante y atrás: la respuesta tiende al sí.'],
    no: ['No', 'El péndulo oscila de lado a lado: la respuesta tiende al no.'],
    quiza: ['Quizá', 'El péndulo gira en círculos: la respuesta aún no está clara. Reformula la pregunta.']
  };
  var YES_MAJ = [0, 1, 3, 4, 6, 7, 8, 10, 14, 17, 19, 21], NO_MAJ = [12, 13, 15, 16];
  var DICE_P = [['Sol', 'la vitalidad y la identidad'], ['Luna', 'las emociones y necesidades'], ['Mercurio', 'la mente y la comunicación'], ['Venus', 'el afecto y los valores'],
    ['Marte', 'la acción y el deseo'], ['Júpiter', 'la expansión y la confianza'], ['Saturno', 'la estructura y la responsabilidad'], ['Urano', 'el cambio y la libertad'],
    ['Neptuno', 'los sueños y la intuición'], ['Plutón', 'la transformación profunda'], ['Nodo Norte', 'el rumbo de crecimiento'], ['Quirón', 'la herida y la sanación']];

  function yesNoCard(c, card) {
    if (card.arcana === 'mayor') return YES_MAJ.indexOf(card.id) > -1 ? 'si' : NO_MAJ.indexOf(card.id) > -1 ? 'no' : 'quiza';
    var base = card.suit === 'espadas' ? 'no' : 'si';
    if (card.num === '5') base = 'quiza';
    if (c.rev) base = base === 'si' ? 'no' : (base === 'no' ? 'si' : 'quiza');
    return base;
  }
  function computeQuick(type) {
    var q = { type: type, q: R.question.trim(), done: false };
    if (type === 'pendulo') { var r = rnd(10); q.res = r < 4 ? 'si' : r < 8 ? 'no' : 'quiza'; }
    else if (type === 'bola') q.res = BOLA[rnd(BOLA.length)];
    else if (type === 'moneda') q.res = rnd(2) ? 'cara' : 'cruz';
    else if (type === 'carta') {
      var cards = DECKS.get('tarot', P.tarotStyle).cards, idx = rnd(cards.length), rev = S.reversed && rnd(100) < 30;
      q.card = { id: idx, rev: rev }; q.cardData = cards[idx]; q.res = yesNoCard(q.card, cards[idx]);
    } else if (type === 'dados') {
      var pl = DICE_P[rnd(12)], sg = rnd(12), hs = 1 + rnd(12);
      q.dice = { p: pl, s: sg, h: hs };
    }
    return q;
  }

  function quickHTML() {
    var Q = R.quick, h = '<section class="page"><header class="qh"><small>Oráculo rápido</small>' + (Q.q ? '<h2>“' + esc(Q.q) + '”</h2>' : '<h2>Pregunta al universo</h2>') + '</header>';
    var stage = '', text = '';
    if (Q.type === 'pendulo') {
      stage = '<div class="pend ' + (Q.res === 'si' ? 'yes' : Q.res === 'no' ? 'no' : 'maybe') + '"><span class="guide"></span><i class="bob">🔮</i></div>';
      if (Q.done) text = '<div class="answer"><b>' + PEND[Q.res][0] + '</b><p>' + PEND[Q.res][1] + '</p></div>';
    } else if (Q.type === 'bola') {
      stage = '<div class="ball' + (Q.done ? ' ok' : ' shake') + '"><div class="win">' + (Q.done ? esc(Q.res) : '8') + '</div></div>';
      if (Q.done) text = '<div class="answer"><p>La bola responde con una pista, no con una sentencia.</p></div>';
    } else if (Q.type === 'moneda') {
      stage = '<div class="coin' + (Q.done ? ' land ' + Q.res : ' flip') + '"><span>' + (Q.done ? (Q.res === 'cara' ? '☀️' : '🌙') : '✦') + '</span></div>';
      if (Q.done) text = '<div class="answer"><b>' + (Q.res === 'cara' ? 'Cara · Sí' : 'Cruz · No') + '</b><p>Si sentiste decepción o alivio al verla, esa emoción también es una respuesta.</p></div>';
    } else if (Q.type === 'carta') {
      stage = '<div class="onecard">' + tcardFor(Q.card, Q.cardData, Q.done) + '</div>';
      if (Q.done) text = '<div class="answer"><b>' + (Q.res === 'si' ? 'Sí' : Q.res === 'no' ? 'No' : 'Quizá') + '</b><p>' + esc(Q.cardData.name) + (Q.card.rev ? ' (invertida)' : '') + ': ' + esc(Q.card.rev ? Q.cardData.rev : Q.cardData.up) + '</p></div>';
    } else if (Q.type === 'dados') {
      stage = '<div class="dice">' + ['🪐', '♈', '🏠'].map(function (e, i) { return '<div class="die' + (Q.done ? '' : ' roll') + '" style="animation-delay:' + i * 120 + 'ms"><b>' + (Q.done ? (i === 0 ? Q.dice.p[0].slice(0, 3) : i === 1 ? ASTRO.SIGNS[Q.dice.s].g : Q.dice.h) : e) + '</b></div>'; }).join('') + '</div>';
      if (Q.done) {
        text = '<div class="answer"><b>' + Q.dice.p[0] + ' en ' + ASTRO.SIGNS[Q.dice.s].n + ' · casa ' + Q.dice.h + '</b><p>' +
          esc(Q.dice.p[1].charAt(0).toUpperCase() + Q.dice.p[1].slice(1)) + ' se viven ' + esc(SKYTXT.STYLE[Q.dice.s]) + ' en el terreno de ' + esc(SKYTXT.HOUSE[Q.dice.h]) + '. ¿Qué te dice eso sobre tu pregunta?</p></div>';
      }
    }
    h += '<div class="stage">' + stage + '</div>' + (Q.done ? text : '<p class="hint c">Concéntrate en tu pregunta…</p>');
    if (Q.done) h += '<div class="actions"><button class="btn ghost" data-a="quick" data-v="' + Q.type + '">↻ Preguntar otra vez</button><button class="btn link" data-a="hub">← Volver a oráculos</button></div>';
    return h + '</section>';
  }
  function tcardFor(c, d, flipped) {
    var cls = d.suit ? 's-' + d.suit : 's-mayor';
    var face = '<div class="face ' + cls + (c.rev ? ' rev' : '') + '"><span class="top">' + esc(d.num) + '</span><span class="em">' + d.emoji + '</span><span class="nm">' + esc(d.name) + '</span></div>';
    return '<div class="tcard' + (flipped ? ' flipped' : '') + '"><div class="in">' + face + '<div class="back"><span>✦</span></div></div></div>';
  }

  /* ---------- vista principal ---------- */
  ARC.views.oracle = function () {
    switch (R.stage) {
      case 'setup': return setupHTML();
      case 'table': return tableHTML();
      case 'reading': return readingHTML();
      case 'ich': return ichView();
      case 'quick': return quickHTML();
      default: return hubHTML();
    }
  };

  /* ---------- acciones ---------- */
  var A = ARC.act;
  function setDefaults() {
    var d = D();
    if (d.spreads.indexOf(R.spread) < 0) R.spread = d.spreads[Math.min(1, d.spreads.length - 1)];
    R.mode = owned(R.deck) ? 'fisica' : 'virtual';
  }
  A.hub = function () { clearTimers(); var q = R.question; R = ARC.R = fresh(R); R.question = q; R.stage = 'hub'; ARC.tab = 'oracle'; ARC.closeModal(); ARC.render(); };
  A.method = function (el) {
    ARC.tab = 'oracle';
    if (el.dataset.v === 'iching') { R.stage = 'ich'; R.ich = null; ARC.render(); return; }
    R.deck = el.dataset.v; setDefaults(); R.stage = 'setup'; ARC.render();
  };
  A.goSky = function (el) { ARC.sky && ARC.sky.setSub(el.dataset.v); ARC.go('sky'); };
  A.quick = function (el) {
    var t = el.dataset.v;
    if (t === 'una') { R.deck = ARC.primaryDeck(); R.spread = 'una'; setDefaults(); R.stage = 'setup'; ARC.tab = 'oracle'; ARC.render(); return; }
    clearTimers(); R.stage = 'quick'; ARC.tab = 'oracle'; R.quick = computeQuick(t); ARC.render();
    later(function () { if (R.quick && R.stage === 'quick' && ARC.tab === 'oracle') { R.quick.done = true; ARC.render(true); } }, t === 'bola' ? 1700 : 2200);
  };
  A.tstyle = function (el) { P.tarotStyle = el.dataset.v; ARC.save('profile'); ARC.render(true); };
  A.mode = function (el) { R.mode = el.dataset.v; ARC.render(true); };
  A.spread = function (el) { R.spread = el.dataset.v; ARC.render(true); };
  A.start = function () {
    var n = sp().pos.length;
    R.stage = 'table'; R.dealt = false; R.shuffling = false;
    R.cards = R.mode === 'fisica' ? new Array(n).fill(null) : [];
    R.revealed = new Array(n).fill(false); R.ai = ''; R.aiState = 'idle';
    ARC.render();
  };
  A.back = function () { R.stage = 'setup'; ARC.render(); };
  A.shuffle = function () {
    if (R.shuffling) return;
    R.shuffling = true;
    var d = $('.deck'); if (d) d.classList.add('shuffling');
    var b = $('[data-a=shuffle]'); if (b) { b.disabled = true; b.textContent = 'Barajando…'; }
    var n = sp().pos.length, dk = D();
    later(function () {
      var order = ARC.shuffle(dk.cards.length);
      R.cards = order.slice(0, n).map(function (i) {
        var c = dk.cards[i];
        return { id: c.id, rev: !!(S.reversed && dk.reversible && !c.norev && rnd(100) < 30) };
      });
      R.revealed = new Array(n).fill(false); R.dealt = true; R.shuffling = false;
      ARC.render();
    }, 1400);
  };
  A.flip = function (el) {
    var p = Number(el.dataset.p); if (R.revealed[p]) return;
    R.revealed[p] = true; el.classList.add('flipped'); el.dataset.a = 'detail';
    var a = $('#actions'); if (a) a.innerHTML = actionsHTML();
  };
  A.revealAll = function () {
    $$('.grid .tcard').forEach(function (c, i) { later(function () { c.classList.add('flipped'); c.dataset.a = 'detail'; }, i * 140); });
    R.revealed = R.revealed.map(function () { return true; });
    var a = $('#actions'); if (a) a.innerHTML = actionsHTML();
  };
  A.pick = function (el) { pickerModal(Number(el.dataset.p)); };
  A.pkfilter = function (el) { pk.f = el.dataset.v; $$('#pkf button').forEach(function (b) { b.classList.toggle('on', b === el); }); $('#pklist').innerHTML = pickerList(); };
  A.choose = function (el) {
    var c = D().cards[Number(el.dataset.id)];
    R.cards[pk.slot] = { id: c.id, rev: !!(S.reversed && D().reversible && !c.norev && pk.rev) };
    ARC.closeModal(); ARC.render(true);
  };
  A.reading = function () { R.stage = 'reading'; ARC.render(); };
  A.detail = function (el) { var p = Number(el.dataset.p); if (R.cards[p]) detailModal(R.cards[p], sp().pos[p]); };
  A.ai = function () { if (R.stage === 'ich') ichAI(); else aiInterpret(); };
  A.cast = function () { ichCast(); };

  function ichAI() {
    ARC.ai.guard(function () {
      var r = R.ich.res, H = ICHING.H;
      var user = userContext() + '\nPregunta: ' + (R.question || '(lectura general)') + '\nI Ching: hexagrama ' + r.num + ' ' + H[r.num][1] + ' (' + H[r.num][0] + '), trigrama superior ' + r.upper.n + ', inferior ' + r.lower.n + '.' +
        (r.rel ? ' Líneas móviles: ' + r.moving.join(', ') + '. Hexagrama resultante: ' + r.rel + ' ' + H[r.rel][1] + '.' : ' Sin líneas móviles.');
      R.aiState = 'loading'; updateAI();
      ARC.ai.ask({ system: SYSTEM.replace('cada carta con su posición', 'el hexagrama con sus trigramas y líneas móviles'), messages: [{ role: 'user', content: user }], max: 900 })
        .then(function (t) { R.ai = t; R.aiState = 'done'; updateAI(); })
        .catch(function (e) { R.aiState = 'error'; R.aiError = e.message; updateAI(); });
    });
  }

  A.saveReading = function () {
    var title, items;
    if (R.stage === 'ich') { var r = R.ich.res; title = 'I Ching · ' + ICHING.H[r.num][1]; items = ['Hexagrama ' + r.num + (r.rel ? ' → ' + r.rel : '')]; }
    else { var d = D(); title = sp().name + ' · ' + d.name; items = sp().pos.map(function (n, i) { var c = R.cards[i]; return n + ': ' + d.cards[c.id].name + (c.rev ? ' (invertida)' : ''); }); }
    var prompts = ['¿Qué parte de esta lectura resuena conmigo?', '¿Qué me sorprendió o me incomodó?', '¿Qué pequeño paso puedo dar a partir de esto?'];
    ARC.draft = { type: 'lectura', title: title, question: R.question, items: items, ai: R.aiState === 'done' ? R.ai.slice(0, 600) : '' };
    ARC.openModal('<h3>📓 Guardar en mi diario</h3><p class="hint">' + esc(title) + '</p><div class="chips wrap">' +
      prompts.map(function (p) { return '<button data-a="addPrompt" data-t="' + esc(p) + '">' + esc(p) + '</button>'; }).join('') + '</div>' +
      '<textarea id="jnote" rows="5" placeholder="Escribe lo que quieras recordar o sentir…"></textarea><button class="btn primary big" data-a="journalSave">Guardar</button>');
  };
  A.addPrompt = function (el) { var t = $('#jnote'); t.value += (t.value ? '\n\n' : '') + el.dataset.t + '\n'; t.focus(); };
  A.journalSave = function () {
    var e = Object.assign({ id: Date.now(), ts: Date.now(), note: $('#jnote').value.trim() }, ARC.draft || {});
    ARC.journal.unshift(e); ARC.save('journal'); ARC.draft = null; ARC.closeModal(); ARC.toast('Guardado en tu diario 📓');
  };

  ARC.inputs.q = function (v) { R.question = v; };
  ARC.inputs.pkq = function (v) { pk.q = v; $('#pklist').innerHTML = pickerList(); };
  ARC.changes.pkrev = function (v) { pk.rev = v; };
  ARC.after.oracle = function () {
    if (R.stage === 'ich' && R.ich && R.ich.shown < 6) { var b = $('#hexbox'); if (b) b.innerHTML = castFigure(R.ich.lines.slice(0, R.ich.shown)); }
  };

  var baseTab = A.tab;
  A.tab = function (el) {
    if (el.dataset.tab === 'oracle' && ARC.tab === 'oracle' && R.stage !== 'hub') { A.hub(); return; }
    baseTab(el);
  };

  ARC.read = { SPREADS: SPREADS, userContext: userContext, tcard: tcard };
})();
