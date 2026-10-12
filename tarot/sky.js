/* Cielo: Luna, planetas, horóscopo diario, zodiaco chino y numerología. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, $$ = ARC.$$, esc = ARC.esc, P = ARC.profile, A = ARC.act;
  var AS = ASTRO.SIGNS, TX = SKYTXT;

  var SK = { sub: 'luna', date: null, sign: null, dayOff: 0, cn: null, ai: '', aiState: 'idle', aiError: '' };
  var MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function now() { return SK.date || new Date(); }
  function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()]; }
  function fmtDT(d) { return fmtDate(d) + ', ' + ARC.pad(d.getHours()) + ':' + ARC.pad(d.getMinutes()); }
  function isoDate(d) { return d.getFullYear() + '-' + ARC.pad(d.getMonth() + 1) + '-' + ARC.pad(d.getDate()); }

  var uid = 0;
  function moonSVG(p, size) {
    var id = 'm' + (uid++), r = 50, cx = 60, cy = 60, c = Math.cos(2 * Math.PI * p), rx = (r * Math.abs(c)).toFixed(2), d;
    if (p < 0.5) d = 'M ' + cx + ' ' + (cy - r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + ' A ' + rx + ' ' + r + ' 0 0 ' + (c > 0 ? 0 : 1) + ' ' + cx + ' ' + (cy - r) + ' Z';
    else d = 'M ' + cx + ' ' + (cy - r) + ' A ' + r + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy + r) + ' A ' + rx + ' ' + r + ' 0 0 ' + (c > 0 ? 1 : 0) + ' ' + cx + ' ' + (cy - r) + ' Z';
    return '<svg class="moonsvg" viewBox="0 0 120 120" width="' + size + '" height="' + size + '" role="img" aria-label="Fase lunar">' +
      '<defs><radialGradient id="g' + id + '" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#fffbe8"/><stop offset=".7" stop-color="#f1e2ad"/><stop offset="1" stop-color="#d4bd7e"/></radialGradient>' +
      '<clipPath id="c' + id + '"><path d="' + d + '"/></clipPath></defs>' +
      '<circle cx="60" cy="60" r="50" fill="#272048" stroke="#4a4070" stroke-width="1"/>' +
      '<path d="' + d + '" fill="url(#g' + id + ')"/>' +
      '<g clip-path="url(#c' + id + ')" fill="#c7b072" opacity=".5"><circle cx="45" cy="42" r="8"/><circle cx="72" cy="62" r="10"/><circle cx="52" cy="76" r="6"/><circle cx="78" cy="38" r="5"/><circle cx="36" cy="64" r="4"/></g>' +
      '</svg>';
  }

  var TABS = [['luna', '🌙', 'Luna'], ['planetas', '🪐', 'Planetas'], ['natal', '🧿', 'Carta natal'], ['local', '📍', 'Mi cielo'], ['signo', '♈', 'Signo'], ['chino', '🐉', 'Chino'], ['numeros', '🔢', 'Números']];

  function head() {
    return '<header class="hero small"><h1>Cielo <span>🌌</span></h1></header><div class="chips sub">' +
      TABS.map(function (t) { return '<button data-a="skySub" data-v="' + t[0] + '" class="' + (SK.sub === t[0] ? 'on' : '') + '">' + t[1] + ' ' + t[2] + '</button>'; }).join('') + '</div>';
  }

  /* ---------- Luna ---------- */
  function lunaHTML() {
    var d = now(), mi = ASTRO.moonInfo(d), tx = TX.moonText(mi), j0 = mi.jd;
    var ing = ASTRO.nextMoonIngress(j0), nn = ASTRO.nextElong(j0, 0), nf = ASTRO.nextElong(j0, 180);
    var list = [];
    [[0, '🌑', 'Luna nueva'], [90, '🌓', 'Cuarto creciente'], [180, '🌕', 'Luna llena'], [270, '🌗', 'Cuarto menguante']].forEach(function (t) {
      var a = ASTRO.nextElong(j0, t[0]); if (a) { list.push({ jd: a, e: t[1], n: t[2] }); var b = ASTRO.nextElong(a + 20, t[0]); if (b) list.push({ jd: b, e: t[1], n: t[2] }); }
    });
    list.sort(function (x, y) { return x.jd - y.jd; });
    var ring = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
    var cur = Math.round(mi.phase * 8) % 8;
    var isNow = !SK.date;
    return '<div class="moonhero">' + moonSVG(mi.phase, 210) + '<h2>' + mi.emoji + ' ' + esc(mi.name) + '</h2>' +
      '<p class="big-sub">' + Math.round(mi.illum * 100) + '% iluminada · día ' + Math.floor(mi.age) + ' del ciclo · ' + (mi.waxing ? 'creciente' : 'menguante') + '</p></div>' +
      '<div class="datebar"><input type="date" id="moonDate" value="' + isoDate(d) + '"><button class="btn ghost sm" data-a="moonToday"' + (isNow ? ' disabled' : '') + '>Hoy</button></div>' +
      '<div class="facts"><div><small>Signo de la Luna</small><b>' + AS[mi.sign].g + ' ' + AS[mi.sign].n + ' ' + TX.fmtDeg(mi) + '</b></div>' +
      (ing ? '<div><small>Entra en ' + AS[ing.sign].n + '</small><b>' + fmtDT(ASTRO.fromJD(ing.jd)) + '</b></div>' : '') +
      (nn ? '<div><small>Próxima nueva</small><b>🌑 ' + fmtDate(ASTRO.fromJD(nn)) + '</b></div>' : '') +
      (nf ? '<div><small>Próxima llena</small><b>🌕 ' + fmtDate(ASTRO.fromJD(nf)) + '</b></div>' : '') + '</div>' +
      '<div class="ring">' + ring.map(function (e, i) { return '<span class="' + (i === cur ? 'on' : '') + '">' + e + '</span>'; }).join('') + '</div>' +
      '<article class="rd sum"><div class="rd-h"><div><small>Qué te pide esta luna</small><b>' + mi.emoji + ' ' + esc(mi.name) + ' en ' + AS[mi.sign].n + '</b></div></div><p>' + esc(tx[0]) + '</p><p class="kw">' + esc(TX.MOONMOOD[mi.sign]) + '</p></article>' +
      '<article class="rd"><div class="rd-h"><div><small>Para escribir o meditar</small><b>📓 Preguntas de esta fase</b></div></div>' +
      tx[1].map(function (q) { return '<p>• ' + esc(q) + '</p>'; }).join('') + '<button class="btn ghost sm" data-a="moonJournal">Escribir en mi diario</button></article>' +
      '<h3 class="sec">Próximas fases</h3><div class="phases">' + list.slice(0, 8).map(function (x) {
        var dd = ASTRO.fromJD(x.jd); return '<div><span>' + x.e + '</span><b>' + esc(x.n) + '</b><small>' + fmtDate(dd) + ' · ' + ARC.pad(dd.getHours()) + ':' + ARC.pad(dd.getMinutes()) + '</small></div>';
      }).join('') + '</div><p class="fine">Horas aproximadas, en tu hora local.</p>';
  }

  /* ---------- Planetas ---------- */
  function planetasHTML() {
    var d = now(), pl = ASTRO.planets(d), mi = ASTRO.moonInfo(d), asp = ASTRO.aspects(pl).slice(0, 4);
    var chip = { 'directo': 'ok', 'retrógrado': 'rx', 'estacionario': 'st' };
    var list = pl.map(function (p) {
      var meta = TX.PLANETS[p.id], note = TX.planetPhaseNote(p);
      return '<article class="pl"><div class="plh"><span class="pg">' + meta.g + '</span><div><b>' + esc(p.id) + '</b><small>' + AS[p.sign].g + ' ' + AS[p.sign].n + ' ' + TX.fmtDeg(p) + '</small></div>' +
        '<span class="chip2 ' + (chip[p.status] || 'ok') + '">' + (p.status === 'retrógrado' ? '℞ ' : '') + p.status + '</span></div>' +
        (note ? '<p class="kw">' + esc(note) + '</p>' : '') + '<p>' + esc(TX.planetText(p)) + '</p></article>';
    }).join('');
    return '<article class="rd sum"><div class="rd-h"><div><small>El clima del cielo</small><b>' + mi.emoji + ' Hoy</b></div></div><p>' + esc(TX.skyWeather(pl, mi)) + '</p></article>' +
      '<h3 class="sec">Aspectos activos</h3>' + (asp.length ? asp.map(function (a) {
        return '<article class="rd"><div class="rd-h"><div><small>' + a.type + ' · orbe ' + a.orb.toFixed(1) + '°</small><b>' + TX.PLANETS[a.a].g + ' ' + esc(a.a) + ' · ' + TX.PLANETS[a.b].g + ' ' + esc(a.b) + '</b></div></div><p>' + esc(TX.aspectText(a)) + '</p></article>';
      }).join('') : '<p class="hint">Sin aspectos exactos hoy.</p>') +
      '<h3 class="sec">Planetas ahora</h3>' + list +
      '<p class="fine">Posiciones geocéntricas aproximadas (precisión de ~1°). Plutón no se incluye.</p>';
  }

  /* ---------- Horóscopo diario ---------- */
  function stars(n) { var s = ''; for (var i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? 'on' : '') + '">★</i>'; return '<span class="stars5">' + s + '</span>'; }
  function signoHTML() {
    var my = ARC.sunSign(), cur = SK.sign !== null ? SK.sign : (my !== null ? my : 0);
    var d = new Date(); d.setDate(d.getDate() + SK.dayOff);
    var h = TX.daily(cur, d), lbl = ['Ayer', 'Hoy', 'Mañana'][SK.dayOff + 1];
    var chips = AS.map(function (s, i) { return '<button data-a="skySign" data-v="' + i + '" class="' + (i === cur ? 'on' : '') + '" aria-label="' + s.n + '">' + s.g + '</button>'; }).join('');
    var nav = '<div class="seg three">' + [-1, 0, 1].map(function (o, i) { return '<button data-a="skyDay" data-v="' + o + '" class="' + (SK.dayOff === o ? 'on' : '') + '">' + ['Ayer', 'Hoy', 'Mañana'][i] + '</button>'; }).join('') + '</div>';
    return '<div class="chips signs">' + chips + '</div>' + nav +
      '<div class="hcard"><div class="hsign"><span>' + AS[cur].g + '</span><div><h2>' + AS[cur].n + '</h2><small>' + AS[cur].el + ' · ' + AS[cur].mod + ' · rige ' + AS[cur].ruler + (my === cur ? ' · <b>tu signo</b>' : '') + '</small></div></div>' +
      '<p class="lead2">' + esc(h.intro) + '</p>' +
      h.areas.map(function (a) { return '<div class="area"><div class="ah"><b>' + a.e + ' ' + a.k + '</b>' + stars(a.s) + '</div><p>' + esc(a.t) + '</p></div>'; }).join('') +
      '<div class="area tip"><div class="ah"><b>✨ Consejo del día</b></div><p>' + esc(h.tip) + (h.notes.length ? ' ' + esc(h.notes[0]) : '') + '</p></div>' +
      '<div class="lucky"><span>🍀 Número ' + h.lucky.n + '</span><span>🎨 Color ' + h.lucky.c + '</span><span>' + h.moon.emoji + ' Luna en ' + AS[h.moon.sign].n + '</span></div></div>' +
      '<h3 class="sec">Versión personalizada con IA</h3><div id="skyai">' + skyAIHTML() + '</div>' +
      '<p class="fine">' + lbl + ' · El horóscopo se calcula con el tránsito real de la Luna por tu casa del día; sirve para reflexionar, no para predecir.</p>';
  }
  function skyAIHTML() {
    if (SK.aiState === 'loading') return '<div class="ai load"><div class="orb-s"></div><p>Leyendo el cielo…</p></div>';
    if (SK.aiState === 'done') return '<div class="ai">' + ARC.fmt(SK.ai) + '</div><button class="btn link" data-a="skyAI">↻ Otra versión</button>';
    return (SK.aiState === 'error' ? '<p class="err">' + esc(SK.aiError) + '</p>' : '') + '<button class="btn primary big" data-a="skyAI">✨ Horóscopo de hoy con IA</button>';
  }
  A.skyAI = function () {
    ARC.ai.guard(function () {
      var my = ARC.sunSign(), cur = SK.sign !== null ? SK.sign : (my !== null ? my : 0), d = new Date(); d.setDate(d.getDate() + SK.dayOff);
      var h = TX.daily(cur, d), pl = ASTRO.planets(d), asp = ASTRO.aspects(pl).slice(0, 3);
      var user = 'CONTEXTO\n' + ARC.ctx() + '\n\nSigno para el que escribes: ' + AS[cur].n + '. Fecha: ' + d.toLocaleDateString('es-ES') + '. ' + h.intro + ' ' + TX.skyWeather(pl, h.moon) +
        ' Aspectos: ' + asp.map(function (a) { return a.a + ' ' + a.type + ' ' + a.b; }).join('; ') + '. Escribe un horóscopo del día breve (máx. 160 palabras) con amor, trabajo y bienestar, en tono cálido y reflexivo, sin predicciones absolutas, y termina con una pregunta de introspección.';
      SK.aiState = 'loading'; var el = $('#skyai'); if (el) el.innerHTML = skyAIHTML();
      ARC.ai.ask({ system: 'Eres una astróloga cálida que escribe en español. Usa solo los datos astronómicos que se te dan, no inventes posiciones. No hagas predicciones absolutas ni des consejos médicos, legales o financieros. ' + ARC.PERSONALIZE, messages: [{ role: 'user', content: user }], max: 500 })
        .then(function (t) { SK.ai = t; SK.aiState = 'done'; })
        .catch(function (e) { SK.aiState = 'error'; SK.aiError = e.message; })
        .then(function () { var e2 = $('#skyai'); if (e2) e2.innerHTML = skyAIHTML(); });
    });
  };

  /* ---------- Zodiaco chino ---------- */
  function birthForm(msg) {
    return '<div class="panel"><div class="lbl">' + msg + '</div><div class="datebar"><input type="date" id="bdate" value="' + (P.birth ? P.birth.y + '-' + ARC.pad(P.birth.m) + '-' + ARC.pad(P.birth.d) : '') + '"><button class="btn primary sm" data-a="setBirth">Guardar</button></div>' +
      '<p class="hint">Se guarda solo en tu dispositivo.</p></div>';
  }
  function chinoHTML() {
    var n = new Date(), cur = ASTRO.chineseYear(n.getFullYear(), n.getMonth() + 1, n.getDate());
    var b = SK.cn || P.birth;
    var h = '';
    h += '<article class="rd sum"><div class="rd-h"><div><small>Año chino actual · empezó el ' + cur.cny.d + ' ' + MONTHS[cur.cny.m - 1] + '</small><b>' + ASTRO.ANIMAL_EMOJI[cur.animal] + ' ' + ASTRO.ANIMALS[cur.animal] + ' de ' + cur.element + ' ' + cur.year + '</b></div></div>' +
      '<p>' + esc(TX.CN[cur.animal].t) + ' El elemento ' + cur.element + ' aporta ' + esc(TX.ELCN[cur.element]) + '.</p></article>';
    if (!b) return h + birthForm('Tu fecha de nacimiento para conocer tu animal');
    var me = ASTRO.chineseYear(b.y, b.m, b.d), d = TX.CN[me.animal], rel = TX.relation(me.animal, cur.animal), cp = TX.compat(me.animal);
    h += '<div class="hcard"><div class="hsign"><span>' + ASTRO.ANIMAL_EMOJI[me.animal] + '</span><div><h2>' + ASTRO.ANIMALS[me.animal] + ' de ' + me.element + '</h2><small>' + (me.yang ? 'Yang' : 'Yin') + ' · año chino ' + me.year + ' · elemento propio ' + d.el + '</small></div></div>' +
      '<p class="lead2">' + esc(d.t) + '</p><div class="area"><div class="ah"><b>💪 Fortalezas</b></div><p>' + esc(d.f) + '</p></div><div class="area"><div class="ah"><b>⚠️ A vigilar</b></div><p>' + esc(d.w) + '</p></div>' +
      '<div class="area tip"><div class="ah"><b>📅 Tu relación con el año ' + ASTRO.ANIMALS[cur.animal] + '</b></div><p>' + esc(rel.t) + '</p></div>' +
      '<div class="lucky"><span>🍀 Números ' + d.n + '</span><span>🎨 ' + esc(d.c) + '</span></div>' +
      '<div class="area"><div class="ah"><b>💞 Mejor sintonía</b></div><p>' + cp.best.map(function (i) { return ASTRO.ANIMAL_EMOJI[i] + ' ' + ASTRO.ANIMALS[i]; }).join(' · ') + '</p>' +
      '<p class="kw">Choque tradicional: ' + ASTRO.ANIMAL_EMOJI[cp.clash] + ' ' + ASTRO.ANIMALS[cp.clash] + '</p></div></div>' +
      '<div class="panel"><div class="lbl">Probar otra fecha</div><div class="datebar"><input type="date" id="cnDate" value="' + b.y + '-' + ARC.pad(b.m) + '-' + ARC.pad(b.d) + '"><button class="btn ghost sm" data-a="cnReset"' + (SK.cn ? '' : ' disabled') + '>Mi fecha</button></div>' +
      '<p class="hint">El año chino cambia con el Año Nuevo Lunar (entre el 21 de enero y el 20 de febrero): quien nace antes pertenece al animal del año anterior.</p></div>';
    return h;
  }

  /* ---------- Numerología ---------- */
  function numeroHTML() {
    var b = P.birth;
    if (!b) return birthForm('Tu fecha de nacimiento para calcular tus números');
    var lp = TX.lifePath(b.y, b.m, b.d), bd = TX.reduce(b.d, true), py = TX.personalYear(b.m, b.d, new Date().getFullYear()), nm = P.name ? TX.nameNumber(P.name) : 0;
    function card(lbl, n, sub) { var x = TX.NUM[n]; return '<article class="rd"><div class="rd-h"><i>' + n + '</i><div><small>' + lbl + '</small><b>' + esc(x ? x[0] : sub) + '</b></div></div><p>' + esc(x ? x[1] : '') + '</p></article>'; }
    return card('Camino de vida', lp) + card('Número del día de nacimiento', bd) + (nm ? card('Número de tu nombre (' + esc(P.name) + ')', nm) : '') +
      '<article class="rd sum"><div class="rd-h"><i>' + py + '</i><div><small>Tu año personal ' + new Date().getFullYear() + '</small><b>Ciclo ' + py + ' de 9</b></div></div><p>' + esc(TX.YEAR[py]) + '</p>' +
      '<p class="kw">Pregúntate: ¿qué quiero sembrar, cuidar o soltar este año?</p></article>' +
      '<div class="panel"><button class="btn ghost sm" data-a="clearBirth">Cambiar fecha</button></div>' +
      '<p class="fine">Numerología pitagórica: sirve como espejo simbólico, no como predicción.</p>';
  }

  ARC.views.sky = function () {
    var body = SK.sub === 'luna' ? lunaHTML() : SK.sub === 'planetas' ? planetasHTML() : SK.sub === 'natal' ? (ARC.natal ? ARC.natal.html() : '') : SK.sub === 'local' ? (ARC.loc ? ARC.loc.html() : '') : SK.sub === 'signo' ? signoHTML() : SK.sub === 'chino' ? chinoHTML() : (ARC.num ? ARC.num.html() : numeroHTML());
    return '<section class="page">' + head() + '<div class="skybody">' + body + '</div></section>';
  };

  A.skySub = function (el) { SK.sub = el.dataset.v; ARC.render(); };
  A.skySign = function (el) { SK.sign = Number(el.dataset.v); SK.ai = ''; SK.aiState = 'idle'; ARC.render(true); };
  A.skyDay = function (el) { SK.dayOff = Number(el.dataset.v); SK.ai = ''; SK.aiState = 'idle'; ARC.render(true); };
  A.moonToday = function () { SK.date = null; ARC.render(true); };
  A.moonJournal = function () {
    var mi = ASTRO.moonInfo(now()), tx = TX.moonText(mi);
    ARC.draft = { type: 'luna', title: mi.emoji + ' ' + mi.name + ' en ' + AS[mi.sign].n, question: tx[1][0], items: [] };
    ARC.openModal('<h3>📓 ' + esc(mi.name) + '</h3><p class="hint">' + esc(tx[1][0]) + '</p><textarea id="jnote" rows="6" placeholder="Escribe lo que te surja…"></textarea><button class="btn primary big" data-a="journalSave">Guardar</button>');
  };
  A.setBirth = function () {
    var v = $('#bdate').value; if (!v) { ARC.toast('Elige una fecha'); return; }
    var p = v.split('-'); P.birth = { y: +p[0], m: +p[1], d: +p[2] }; ARC.save('profile'); SK.cn = null; ARC.render(true);
  };
  A.clearBirth = function () { P.birth = null; ARC.save('profile'); ARC.render(true); };
  A.cnReset = function () { SK.cn = null; ARC.render(true); };
  ARC.changes.moonDate = function (v) { if (v) { var p = v.split('-'); SK.date = new Date(+p[0], +p[1] - 1, +p[2], 12, 0); ARC.render(true); } };
  ARC.changes.cnDate = function (v) { if (v) { var p = v.split('-'); SK.cn = { y: +p[0], m: +p[1], d: +p[2] }; ARC.render(true); } };

  ARC.sky = { setSub: function (s) { SK.sub = s; }, moonSVG: moonSVG };
})();
