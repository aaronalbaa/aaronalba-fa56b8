/* Vida: hábitos, salud y descanso, metas, rueda de la vida y finanzas personales. Todo local; la IA solo ve resúmenes si tú lo pides. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, P = ARC.profile, A = ARC.act;
  var D = ARC.store.get('arcana.life', { habits: [], health: {}, goals: [], wheel: { cur: {}, hist: [] }, fin: { cur: '€', tx: [], budgets: {}, saves: [], share: false } });
  D.habits = D.habits || []; D.health = D.health || {}; D.goals = D.goals || []; D.wheel = D.wheel || { cur: {}, hist: [] }; D.fin = D.fin || { cur: '€', tx: [], budgets: {}, saves: [], share: false };
  function save() { D.rev = Date.now(); ARC.store.set('arcana.life', D); }
  var LF = { tab: 'hoy', month: ARC.dayKey(0).slice(0, 7), fk: 'out', hbPick: '' };
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function num(v) { v = String(v).trim(); if (v.indexOf(',') > -1) v = v.replace(/\./g, '').replace(',', '.'); return Number(v) || 0; }
  function money(n) { return (Math.round(n * 100) / 100).toLocaleString('es-ES', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' ' + D.fin.cur; }
  function today() { return ARC.dayKey(0); }
  function hday(k) { D.health[k] = D.health[k] || {}; return D.health[k]; }
  function monthName(m) { var p = m.split('-'); return ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][Number(p[1]) - 1] + ' ' + p[0]; }

  var AREAS = [['salud', '💪', 'Salud'], ['amor', '💞', 'Amor y pareja'], ['familia', '🏡', 'Familia y amigos'], ['trabajo', '💼', 'Trabajo y propósito'], ['dinero', '💰', 'Dinero'], ['crecer', '🌱', 'Crecimiento personal'], ['ocio', '🎨', 'Ocio y disfrute'], ['espiritu', '🔮', 'Espíritu']];
  var PRESET = [['🧘', 'Meditar'], ['🚶', 'Caminar 30 min'], ['💧', 'Beber 2 L de agua'], ['📖', 'Leer 15 min'], ['🙏', 'Gratitud'], ['😴', 'Acostarme pronto'], ['🥗', 'Comer saludable'], ['✍️', 'Escribir en el diario'], ['🏋️', 'Ejercicio'], ['📵', 'Sin pantallas antes de dormir'], ['🌅', 'Ver la salida del sol'], ['🃏', 'Mi carta del día']];
  var CATS = { out: ['Hogar', 'Comida', 'Transporte', 'Ocio', 'Salud', 'Compras', 'Suscripciones', 'Educación', 'Otros'], in: ['Nómina', 'Extra', 'Regalo', 'Otros'] };
  var CATE = { Hogar: '🏠', Comida: '🍽️', Transporte: '🚌', Ocio: '🎟️', Salud: '💊', Compras: '🛍️', Suscripciones: '🔁', Educación: '🎓', Otros: '📦', Nómina: '💼', Extra: '✨', Regalo: '🎁' };

  /* ---------- resúmenes ---------- */
  function streak(h) { var n = 0; for (var i = 0; i < 400; i++) { if (h.log && h.log[ARC.dayKey(-i)]) n++; else if (i > 0) break; else continue; } return n; }
  function avgHealth(f, days) { var s = 0, c = 0; for (var i = 0; i < days; i++) { var d = D.health[ARC.dayKey(-i)]; if (d && d[f]) { s += d[f]; c++; } } return c ? s / c : null; }
  function moodMoon() {
    var ms = (P.moods || []).filter(function (m) { return m.ts; }); if (ms.length < 12) return null;
    var all = ms.reduce(function (a, m) { return a + m.v; }, 0) / ms.length, buckets = { full: [], dark: [] };
    ms.forEach(function (m) { var il = ASTRO.moonInfo(new Date(m.ts)).illum; if (il > 0.85) buckets.full.push(m.v); else if (il < 0.15) buckets.dark.push(m.v); });
    function av(a) { return a.length >= 3 ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; }
    return { all: all, full: av(buckets.full), dark: av(buckets.dark), n: ms.length };
  }
  ARC.life = {
    data: function () { return D; }, save: save,
    summary: function () {
      var L = [], hb = D.habits.filter(function (h) { return !h.arch; });
      if (hb.length) L.push('hábitos que cultiva: ' + hb.slice(0, 6).map(function (h) { return h.n + ' (racha ' + streak(h) + ')'; }).join(', '));
      var sl = avgHealth('sleep', 7); if (sl) L.push('sueño medio 7 días: ' + sl.toFixed(1) + ' h');
      var en = avgHealth('energy', 7); if (en) L.push('energía media: ' + en.toFixed(1) + '/5');
      var wl = AREAS.filter(function (a) { return D.wheel.cur[a[0]]; }).sort(function (a, b) { return D.wheel.cur[a[0]] - D.wheel.cur[b[0]]; });
      if (wl.length) L.push('rueda de la vida: más baja ' + wl[0][2] + ' (' + D.wheel.cur[wl[0][0]] + '/10), más alta ' + wl[wl.length - 1][2] + ' (' + D.wheel.cur[wl[wl.length - 1][0]] + '/10)');
      var gl = D.goals.filter(function (g) { return !g.done; }).slice(0, 3).map(function (g) { return g.n + ' (' + g.p + '%)'; }); if (gl.length) L.push('metas activas: ' + gl.join(', '));
      if (D.fin.share) { var f = finMonth(LF.month); if (f.inc || f.out) L.push('finanzas del mes (compartidas por elección): ahorra el ' + (f.inc ? Math.round((f.inc - f.out) / f.inc * 100) : 0) + ' % de lo que ingresa; mayor gasto: ' + (f.top[0] ? f.top[0][0] : 'n/d')); }
      return L.length ? 'VIDA COTIDIANA: ' + L.join('; ') + '.' : '';
    }
  };

  /* ---------- gráficos ---------- */
  function bars(vals, max, color, labels) {
    var m = max || Math.max.apply(null, vals.concat([1]));
    return '<div class="bars lb">' + vals.map(function (v, i) { return '<i style="height:' + Math.max(v ? 6 : 2, v / m * 100) + '%;' + (color ? 'background:' + color : '') + '" title="' + (labels ? labels[i] : '') + '"></i>'; }).join('') + '</div>';
  }
  function radar(cur) {
    var n = AREAS.length, R = 100, c = 120, pts = [], grid = '';
    for (var g = 2; g <= 10; g += 2) { var gp = []; for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + i / n * 2 * Math.PI; gp.push((c + Math.cos(a) * R * g / 10).toFixed(1) + ',' + (c + Math.sin(a) * R * g / 10).toFixed(1)); } grid += '<polygon points="' + gp.join(' ') + '" class="rg"/>'; }
    var lab = '';
    AREAS.forEach(function (ar, i) { var a = -Math.PI / 2 + i / n * 2 * Math.PI, v = (cur[ar[0]] || 0) / 10; pts.push((c + Math.cos(a) * R * v).toFixed(1) + ',' + (c + Math.sin(a) * R * v).toFixed(1)); lab += '<line x1="' + c + '" y1="' + c + '" x2="' + (c + Math.cos(a) * R).toFixed(1) + '" y2="' + (c + Math.sin(a) * R).toFixed(1) + '" class="rg"/><text x="' + (c + Math.cos(a) * (R + 14)).toFixed(1) + '" y="' + (c + Math.sin(a) * (R + 14) + 5).toFixed(1) + '" text-anchor="middle" font-size="15">' + ar[1] + '</text>'; });
    return '<svg class="radar" viewBox="0 0 240 240">' + grid + lab + '<polygon points="' + pts.join(' ') + '" class="rf"/></svg>';
  }
  function adviceBox(kind) { return '<button class="btn ghost big" data-a="lfAdvice" data-v="' + kind + '">✨ Reflexión de Sibila</button><div id="lfai"></div>'; }
  A.lfAdvice = function (el) {
    var kind = el.dataset.v, sum = ARC.life.summary(), extra = '';
    if (kind === 'fin') { var f = finMonth(LF.month); extra = '\nMes ' + LF.month + ': ingresos ' + Math.round(f.inc) + ', gastos ' + Math.round(f.out) + ', categorías: ' + f.top.slice(0, 5).map(function (t) { return t[0] + ' ' + Math.round(t[1]); }).join(', ') + '.'; }
    ARC.ai.guard(function () {
      var box = $('#lfai'); if (box) box.innerHTML = '<div class="ai load"><div class="orb-s"></div><p>Sibila lo está pensando…</p></div>';
      var topic = kind === 'fin' ? 'sus finanzas personales (da consejos prudentes y generales, sin recomendar productos ni asegurar resultados; no eres asesora financiera)' : kind === 'wheel' ? 'su rueda de la vida' : kind === 'hab' ? 'sus hábitos y su constancia' : 'su salud, su descanso y su energía (sin dar consejo médico)';
      ARC.ai.ask({ system: 'Eres una mentora sabia que habla en español. ' + ARC.PERSONALIZE, messages: [{ role: 'user', content: 'CONTEXTO\n' + ARC.ctx() + '\n' + sum + extra + '\n\nOfrece una reflexión breve (máx. 160 palabras) y 3 acciones concretas y pequeñas para esta semana sobre ' + topic + '. Termina con una pregunta de introspección.' }], max: 520 })
        .then(function (t) { var b = $('#lfai'); if (b) b.innerHTML = '<div class="ai">' + ARC.fmt(t) + '</div>'; })
        .catch(function (e) { var b = $('#lfai'); if (b) b.innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
    });
  };

  /* ---------- vista ---------- */
  ARC.views.life = function () {
    var T = [['hoy', '☀️ Hoy'], ['hab', '✅ Hábitos'], ['salud', '💤 Salud'], ['metas', '🎯 Metas'], ['rueda', '🕸️ Rueda'], ['fin', '💶 Finanzas']];
    var body = { hoy: todayHTML, hab: habitsHTML, salud: healthHTML, metas: goalsHTML, rueda: wheelHTML, fin: finHTML }[LF.tab]();
    return '<section class="page life"><header class="hero small"><h1>Vida <span>🌿</span></h1><p>Pequeños gestos, grandes ciclos</p></header><div class="chips sub">' + T.map(function (t) { return '<button data-a="lfTab" data-v="' + t[0] + '" class="' + (LF.tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>' + body + '</section>';
  };
  A.lfTab = function (el) { LF.tab = el.dataset.v; ARC.render(); };

  /* HOY */
  function todayHTML() {
    var hb = D.habits.filter(function (h) { return !h.arch; }), t = today(), done = hb.filter(function (h) { return h.log && h.log[t]; }).length, d = hday(t);
    var pctD = hb.length ? done / hb.length : 0, r = 30, c = 2 * Math.PI * r;
    var h = '<div class="panel todayc"><div class="rwrap big"><svg class="ring2" viewBox="0 0 76 76"><circle cx="38" cy="38" r="' + r + '" class="rbg"/><circle cx="38" cy="38" r="' + r + '" class="rfg" style="stroke-dasharray:' + c.toFixed(1) + ';stroke-dashoffset:' + (c * (1 - pctD)).toFixed(1) + '"/></svg><b>' + done + '/' + hb.length + '</b></div><div><b>Tus hábitos de hoy</b><small>' + (hb.length ? (done === hb.length ? '¡Día completo! ✨' : 'Un paso a la vez') : 'Añade el primero en Hábitos') + '</small></div></div>';
    if (hb.length) h += '<div class="group">' + hb.slice(0, 6).map(habRow).join('') + '</div>';
    h += '<div class="group"><div class="grow"><span class="gi">😴</span><div><b>Sueño de anoche</b><small>' + (d.sleep ? d.sleep + ' h' : 'sin anotar') + '</small></div>' + stepper('sleep', 0.5) + '</div><div class="grow"><span class="gi">💧</span><div><b>Agua</b><small>' + (d.water || 0) + ' vasos</small></div>' + stepper('water', 1) + '</div><div class="grow"><span class="gi">🏃</span><div><b>Movimiento</b><small>' + (d.ex || 0) + ' min</small></div>' + stepper('ex', 10) + '</div></div>';
    var g = D.goals.filter(function (x) { return !x.done; })[0]; if (g) h += '<button class="grow card" data-a="lfTab" data-v="metas"><span class="gi">🎯</span><div><b>' + esc(g.n) + '</b><small>' + g.p + ' % completado</small></div><i class="chev">›</i></button>';
    var fm = finMonth(today().slice(0, 7)); if (fm.inc || fm.out) h += '<button class="grow card" data-a="lfTab" data-v="fin"><span class="gi">💶</span><div><b>Este mes: ' + money(fm.inc - fm.out) + '</b><small>Ingresos ' + money(fm.inc) + ' · gastos ' + money(fm.out) + '</small></div><i class="chev">›</i></button>';
    return h;
  }
  function stepper(f, st) { return '<div class="step"><button data-a="hSet" data-f="' + f + '" data-d="' + (-st) + '">−</button><button data-a="hSet" data-f="' + f + '" data-d="' + st + '">＋</button></div>'; }
  A.hSet = function (el) { var d = hday(today()), f = el.dataset.f, mx = { sleep: 14, water: 20, ex: 300 }[f]; d[f] = Math.max(0, Math.min(mx, Math.round(((d[f] || (f === 'sleep' && Number(el.dataset.d) > 0 ? 6.5 : 0)) + Number(el.dataset.d)) * 10) / 10)); save(); ARC.render(true); };
  function habRow(h) { var on = !!(h.log && h.log[today()]), s = streak(h); return '<button class="grow' + (on ? ' done' : '') + '" data-a="hbToggle" data-id="' + h.id + '"><span class="gi">' + h.e + '</span><div><b>' + esc(h.n) + '</b><small>' + (s ? '🔥 ' + s + (s === 1 ? ' día' : ' días') : 'Empieza hoy') + '</small></div><span class="chk">' + (on ? '✓' : '') + '</span></button>'; }
  A.hbToggle = function (el) {
    var h = D.habits.filter(function (x) { return x.id === el.dataset.id; })[0]; h.log = h.log || {}; var t = today();
    if (h.log[t]) delete h.log[t]; else { h.log[t] = 1; ARC.progress.xp += 1; ARC.save('progress'); } save(); ARC.render(true);
  };

  /* HÁBITOS */
  function habitsHTML() {
    var hb = D.habits.filter(function (h) { return !h.arch; });
    var h = '<button class="btn primary big" data-a="hbAdd">＋ Nuevo hábito</button>';
    if (!hb.length) return h + '<p class="hint c">Los hábitos pequeños y constantes cambian más que los grandes esfuerzos puntuales. Empieza con uno o dos.</p>';
    h += '<div class="group">' + hb.map(habRow).join('') + '</div><div class="lbl pad">Últimas 4 semanas</div>';
    hb.forEach(function (x) {
      var cells = ''; for (var i = 27; i >= 0; i--) cells += '<i class="' + (x.log && x.log[ARC.dayKey(-i)] ? 'on' : '') + '"></i>';
      h += '<div class="panel hgrid"><div class="hh"><b>' + x.e + ' ' + esc(x.n) + '</b><button class="btn link sm" data-a="hbDel" data-id="' + x.id + '">quitar</button></div><div class="cells">' + cells + '</div></div>';
    });
    return h + adviceBox('hab');
  }
  A.hbAdd = function () {
    LF.hbPick = '';
    ARC.openModal('<h3>Nuevo hábito</h3><div class="chips wrap">' + PRESET.map(function (p, i) { return '<button data-a="hbPreset" data-i="' + i + '">' + p[0] + ' ' + p[1] + '</button>'; }).join('') + '</div><div class="lbl">O escribe el tuyo</div><div class="row2"><input id="hb_e" maxlength="2" value="⭐" style="max-width:64px;text-align:center"><input id="hb_n" placeholder="Nombre del hábito"></div><button class="btn primary big" data-a="hbSave">Añadir</button>');
  };
  A.hbPreset = function (el) { var p = PRESET[Number(el.dataset.i)]; $('#hb_e').value = p[0]; $('#hb_n').value = p[1]; };
  A.hbSave = function () { var n = ($('#hb_n').value || '').trim(); if (!n) { ARC.toast('Ponle nombre'); return; } D.habits.push({ id: uid(), e: ($('#hb_e').value || '⭐').trim() || '⭐', n: n, created: Date.now(), log: {} }); save(); ARC.closeModal(); ARC.render(true); };
  A.hbDel = function (el) { var h = D.habits.filter(function (x) { return x.id === el.dataset.id; })[0]; h.arch = true; save(); ARC.render(true); };

  /* SALUD */
  function healthHTML() {
    var t = today(), d = hday(t), sl = [], en = [], lab = [];
    for (var i = 13; i >= 0; i--) { var x = D.health[ARC.dayKey(-i)] || {}; sl.push(x.sleep || 0); en.push(x.energy || 0); lab.push(ARC.dayKey(-i)); }
    var avs = avgHealth('sleep', 7), ave = avgHealth('energy', 7), mm = moodMoon();
    var h = '<div class="panel"><div class="lbl nm">¿Cómo está tu energía hoy?</div><div class="chips">' + [1, 2, 3, 4, 5].map(function (n) { return '<button data-a="hEnergy" data-v="' + n + '" class="' + (d.energy === n ? 'on' : '') + '">' + ['🪫', '😮‍💨', '😐', '🔋', '⚡'][n - 1] + ' ' + n + '</button>'; }).join('') + '</div><div class="lbl">Calidad del sueño</div><div class="chips">' + [1, 2, 3, 4, 5].map(function (n) { return '<button data-a="hQual" data-v="' + n + '" class="' + (d.q === n ? 'on' : '') + '">' + '⭐'.repeat(Math.min(n, 3)) + (n > 3 ? '+' : '') + ' ' + n + '</button>'; }).join('') + '</div></div>';
    h += '<div class="group"><div class="grow"><span class="gi">😴</span><div><b>Horas de sueño</b><small>' + (d.sleep ? d.sleep + ' h' : 'sin anotar') + '</small></div>' + stepper('sleep', 0.5) + '</div><div class="grow"><span class="gi">💧</span><div><b>Agua</b><small>' + (d.water || 0) + ' vasos</small></div>' + stepper('water', 1) + '</div><div class="grow"><span class="gi">🏃</span><div><b>Movimiento</b><small>' + (d.ex || 0) + ' min</small></div>' + stepper('ex', 10) + '</div></div>';
    h += '<div class="panel"><div class="lbl nm">Sueño · 14 días</div>' + bars(sl, 10, 'linear-gradient(#8b6cff,#5b43c9)', lab) + '<p class="hint">Media 7 días: <b>' + (avs ? avs.toFixed(1) + ' h' : '—') + '</b>' + (avs && avs < 6.5 ? ' · te vendría bien descansar un poco más' : '') + '</p><div class="lbl nm">Energía · 14 días</div>' + bars(en, 5, 'linear-gradient(#e6c97a,#b58f2e)', lab) + '<p class="hint">Media: <b>' + (ave ? ave.toFixed(1) + ' / 5' : '—') + '</b></p></div>';
    if (mm) h += '<div class="panel"><div class="lbl nm">🌙 Tu ánimo y la Luna</div><p class="hint">Con ' + mm.n + ' registros, tu ánimo medio es <b>' + mm.all.toFixed(1) + '</b>/5' + (mm.full ? '; en luna llena, <b>' + mm.full.toFixed(1) + '</b>' : '') + (mm.dark ? '; en luna nueva, <b>' + mm.dark.toFixed(1) + '</b>' : '') + '. Es una curiosidad estadística, no una causa demostrada.</p></div>';
    else h += '<p class="hint c">Registra tu ánimo cada día (misión «Chequeo de ánimo») y te mostraré cómo se relaciona con la Luna.</p>';
    return h + adviceBox('salud') + '<p class="fine">Esto no sustituye consejo médico. Si algo te preocupa de verdad, consulta a un profesional.</p>';
  }
  A.hEnergy = function (el) { hday(today()).energy = Number(el.dataset.v); save(); ARC.render(true); };
  A.hQual = function (el) { hday(today()).q = Number(el.dataset.v); save(); ARC.render(true); };

  /* METAS */
  function goalsHTML() {
    var act = D.goals.filter(function (g) { return !g.done; }), dn = D.goals.filter(function (g) { return g.done; });
    var h = '<button class="btn primary big" data-a="gAdd">＋ Nueva meta</button>';
    if (!D.goals.length) h += '<p class="hint c">Una buena meta es concreta, pequeña al principio y con fecha. Divídela en pasos.</p>';
    act.forEach(function (g) {
      h += '<div class="panel goal"><div class="gh"><b>' + esc(g.n) + '</b>' + (g.due ? '<small>hasta ' + esc(g.due) + '</small>' : '') + '</div><div class="pbar"><i style="width:' + g.p + '%"></i></div><div class="gstep">' + (g.steps || []).map(function (s, i) { return '<label><input type="checkbox" data-a="gStep" data-id="' + g.id + '" data-i="' + i + '"' + (s.d ? ' checked' : '') + '><span>' + esc(s.t) + '</span></label>'; }).join('') + '</div><div class="row2"><button class="btn ghost sm" data-a="gStepAdd" data-id="' + g.id + '">＋ Paso</button><button class="btn ghost sm" data-a="gProg" data-id="' + g.id + '" data-v="10">+10 %</button><button class="btn ghost sm" data-a="gDone" data-id="' + g.id + '">✓ Lograda</button></div></div>';
    });
    if (dn.length) h += '<div class="lbl pad">Logradas</div><div class="group">' + dn.map(function (g) { return '<div class="grow done"><span class="gi">🏆</span><div><b>' + esc(g.n) + '</b></div></div>'; }).join('') + '</div>';
    return h;
  }
  A.gAdd = function () { ARC.openModal('<h3>🎯 Nueva meta</h3><div class="lbl">¿Qué quieres lograr?</div><input id="g_n" placeholder="Correr 5 km, ahorrar 1.000 €, aprender tarot…"><div class="lbl">Fecha objetivo (opcional)</div><input id="g_d" type="date"><div class="lbl">Primer paso</div><input id="g_s" placeholder="Algo que puedas hacer hoy"><button class="btn primary big" data-a="gSave">Crear meta</button>'); };
  A.gSave = function () { var n = ($('#g_n').value || '').trim(); if (!n) { ARC.toast('Describe tu meta'); return; } var s = ($('#g_s').value || '').trim(); D.goals.push({ id: uid(), n: n, due: $('#g_d').value || '', p: 0, steps: s ? [{ t: s, d: false }] : [], ts: Date.now() }); save(); ARC.closeModal(); ARC.render(true); };
  function gGet(id) { return D.goals.filter(function (g) { return g.id === id; })[0]; }
  function gRecalc(g) { if (g.steps && g.steps.length) g.p = Math.round(g.steps.filter(function (s) { return s.d; }).length / g.steps.length * 100); }
  A.gStep = function (el) { var g = gGet(el.dataset.id), s = g.steps[Number(el.dataset.i)]; s.d = !s.d; gRecalc(g); save(); ARC.render(true); };
  A.gStepAdd = function (el) { ARC.openModal('<h3>Nuevo paso</h3><input id="g_st" placeholder="¿Qué sigue?"><button class="btn primary big" data-a="gStepSave" data-id="' + el.dataset.id + '">Añadir</button>'); };
  A.gStepSave = function (el) { var t = ($('#g_st').value || '').trim(); if (!t) return; var g = gGet(el.dataset.id); g.steps = g.steps || []; g.steps.push({ t: t, d: false }); gRecalc(g); save(); ARC.closeModal(); ARC.render(true); };
  A.gProg = function (el) { var g = gGet(el.dataset.id); g.p = Math.min(100, g.p + Number(el.dataset.v)); save(); ARC.render(true); };
  A.gDone = function (el) { var g = gGet(el.dataset.id); g.done = true; g.p = 100; save(); ARC.progress.xp += 15; ARC.save('progress'); ARC.toast('¡Meta lograda! 🏆'); ARC.render(true); };

  /* RUEDA */
  function wheelHTML() {
    var cur = D.wheel.cur, any = AREAS.some(function (a) { return cur[a[0]]; });
    var h = '<div class="panel">' + radar(cur) + '<p class="hint c">Puntúa de 1 a 10 cómo te sientes hoy en cada área. No hay respuestas correctas: es un espejo.</p></div><div class="group">' + AREAS.map(function (a) {
      var v = cur[a[0]] || 5; return '<div class="grow slid"><span class="gi">' + a[1] + '</span><div><b>' + a[2] + '</b><input type="range" id="wh_' + a[0] + '" min="1" max="10" value="' + v + '"></div><b class="wv" id="wv_' + a[0] + '">' + (cur[a[0]] || '·') + '</b></div>';
    }).join('') + '</div>';
    if (any) {
      var low = AREAS.filter(function (a) { return cur[a[0]]; }).sort(function (a, b) { return cur[a[0]] - cur[b[0]]; })[0];
      h += '<div class="panel"><div class="lbl nm">Tu área que más pide atención</div><p>' + low[1] + ' <b>' + low[2] + '</b> (' + cur[low[0]] + '/10). ' + wheelTip(low[0]) + '</p></div><button class="btn ghost big" data-a="wheelSnap">📌 Guardar una foto de este momento</button>';
      if (D.wheel.hist.length) h += '<p class="hint c">' + D.wheel.hist.length + ' fotos guardadas · la última: ' + new Date(D.wheel.hist[D.wheel.hist.length - 1].ts).toLocaleDateString('es-ES') + '</p>';
      h += adviceBox('wheel');
    }
    return h;
  }
  function wheelTip(k) { return { salud: 'Prueba con 10 minutos de movimiento y acostarte 30 minutos antes esta semana.', amor: 'Una conversación sincera o un gesto pequeño de cariño cambia más de lo que parece.', familia: 'Escribe hoy a alguien a quien llevas tiempo sin escribir.', trabajo: 'Anota qué parte de tu trabajo te da sentido y qué parte te drena.', dinero: 'Revisa tus gastos del mes y elige una sola cosa que ajustar.', crecer: 'Dedica 15 minutos al día a aprender algo que de verdad te interese.', ocio: 'Agenda ya un plan solo por disfrute, sin utilidad alguna.', espiritu: 'Regálate cinco minutos de silencio, respiración o meditación.' }[k]; }
  AREAS.forEach(function (a) { ARC.inputs['wh_' + a[0]] = function (v) { D.wheel.cur[a[0]] = Number(v); var e = $('#wv_' + a[0]); if (e) e.textContent = v; save(); var sv = $('.radar'); if (sv) { var tmp = document.createElement('div'); tmp.innerHTML = radar(D.wheel.cur); sv.replaceWith(tmp.firstChild); } }; });
  A.wheelSnap = function () { D.wheel.hist.push({ ts: Date.now(), s: JSON.parse(JSON.stringify(D.wheel.cur)) }); save(); ARC.toast('Foto guardada 📌'); ARC.render(true); };

  /* FINANZAS */
  function finMonth(m) {
    var inc = 0, out = 0, cat = {}; D.fin.tx.forEach(function (t) { if (t.d.slice(0, 7) !== m) return; if (t.t === 'in') inc += t.amt; else { out += t.amt; cat[t.cat] = (cat[t.cat] || 0) + t.amt; } });
    return { inc: inc, out: out, top: Object.keys(cat).map(function (k) { return [k, cat[k]]; }).sort(function (a, b) { return b[1] - a[1]; }) };
  }
  function finHTML() {
    var f = finMonth(LF.month), bal = f.inc - f.out, h = '<div class="mnav"><button data-a="finMonth" data-v="-1">‹</button><b>' + monthName(LF.month) + '</b><button data-a="finMonth" data-v="1">›</button></div>';
    h += '<div class="panel finsum"><div class="bal ' + (bal < 0 ? 'neg' : '') + '"><small>Balance del mes</small><b>' + money(bal) + '</b></div><div class="io"><span>⬆️ ' + money(f.inc) + '<small>ingresos</small></span><span>⬇️ ' + money(f.out) + '<small>gastos</small></span></div>' + (f.inc ? '<p class="hint c">Estás ahorrando el <b>' + Math.round(bal / f.inc * 100) + ' %</b> de lo que ingresas' + (bal / f.inc >= 0.2 ? ' — por encima de la regla clásica del 20 %.' : '.') + '</p>' : '') + '</div>';
    h += '<div class="row2"><button class="btn primary" data-a="finAdd" data-v="out">− Gasto</button><button class="btn ghost" data-a="finAdd" data-v="in">＋ Ingreso</button></div>';
    if (f.top.length) {
      var mx = f.top[0][1];
      h += '<div class="panel"><div class="lbl nm">En qué gastas</div>' + f.top.map(function (c) { var b = D.fin.budgets[c[0]]; return '<div class="catrow"><span>' + (CATE[c[0]] || '📦') + ' ' + c[0] + '</span><div class="cbar"><i style="width:' + c[1] / mx * 100 + '%;' + (b && c[1] > b ? 'background:#ff7a8a' : '') + '"></i></div><b>' + money(c[1]) + '</b>' + (b ? '<small class="' + (c[1] > b ? 'over' : '') + '">de ' + money(b) + '</small>' : '') + '</div>'; }).join('') + '<button class="btn link sm" data-a="finBudgets">Fijar presupuestos por categoría</button></div>';
    }
    var tx = D.fin.tx.filter(function (t) { return t.d.slice(0, 7) === LF.month; }).sort(function (a, b) { return b.d < a.d ? -1 : 1; });
    if (tx.length) h += '<div class="lbl pad">Movimientos</div><div class="group">' + tx.map(function (t) { return '<div class="grow tx"><span class="gi">' + (CATE[t.cat] || '📦') + '</span><div><b>' + esc(t.note || t.cat) + '</b><small>' + t.d.slice(8) + '/' + t.d.slice(5, 7) + ' · ' + t.cat + '</small></div><b class="amt ' + t.t + '">' + (t.t === 'in' ? '+' : '−') + money(t.amt) + '</b><button class="x2" data-a="finDel" data-id="' + t.id + '" aria-label="Borrar">✕</button></div>'; }).join('') + '</div>';
    else h += '<p class="hint c">Aún no hay movimientos este mes.</p>';
    // ahorro
    h += '<div class="lbl pad">Huchas de ahorro</div>' + (D.fin.saves.length ? '<div class="group">' + D.fin.saves.map(function (s) { var p = Math.min(100, Math.round(s.saved / s.target * 100)); return '<div class="grow col"><div class="sr"><b>' + esc(s.n) + '</b><small>' + money(s.saved) + ' de ' + money(s.target) + '</small></div><div class="pbar"><i style="width:' + p + '%"></i></div><div class="row2"><button class="btn ghost sm" data-a="saveDep" data-id="' + s.id + '">＋ Aportar</button><button class="btn link sm" data-a="saveDel" data-id="' + s.id + '">quitar</button></div></div>'; }).join('') + '</div>' : '') + '<button class="btn ghost big" data-a="saveAdd">＋ Nueva hucha</button>';
    h += '<div class="panel"><label class="toggle"><input type="checkbox" id="fin_share"' + (D.fin.share ? ' checked' : '') + '><span>Dejar que Sibila vea un resumen (sin importes exactos) para aconsejarme</span></label></div>' + adviceBox('fin') + '<div class="row2"><button class="btn ghost sm" data-a="finCsv">⬇️ Exportar CSV</button><button class="btn ghost sm" data-a="finCur">Moneda: ' + D.fin.cur + '</button></div><p class="fine">Tus datos económicos se guardan solo en este dispositivo. Esto es una herramienta de organización, no asesoramiento financiero.</p>';
    return h;
  }
  ARC.changes.fin_share = function (v) { D.fin.share = !!v; save(); };
  A.finMonth = function (el) { var p = LF.month.split('-'), d = new Date(Number(p[0]), Number(p[1]) - 1 + Number(el.dataset.v), 1); LF.month = d.getFullYear() + '-' + ARC.pad(d.getMonth() + 1); ARC.render(true); };
  A.finAdd = function (el) {
    LF.fk = el.dataset.v;
    ARC.openModal('<h3>' + (LF.fk === 'in' ? '⬆️ Nuevo ingreso' : '⬇️ Nuevo gasto') + '</h3><div class="lbl">Importe (' + D.fin.cur + ')</div><input id="f_a" type="text" inputmode="decimal" placeholder="0,00" autofocus><div class="lbl">Categoría</div><div class="chips wrap" id="f_c">' + CATS[LF.fk].map(function (c, i) { return '<button data-a="finCat" data-c="' + c + '" class="' + (i === 0 ? 'on' : '') + '">' + (CATE[c] || '') + ' ' + c + '</button>'; }).join('') + '</div><div class="lbl">Nota</div><input id="f_n" placeholder="Opcional"><div class="lbl">Fecha</div><input id="f_d" type="date" value="' + today() + '"><button class="btn primary big" data-a="finSave">Guardar</button>');
    LF.cat = CATS[LF.fk][0];
  };
  A.finCat = function (el) { LF.cat = el.dataset.c; Array.prototype.forEach.call(document.querySelectorAll('#f_c button'), function (b) { b.classList.toggle('on', b === el); }); };
  A.finSave = function () {
    var a = num($('#f_a').value); if (a <= 0) { ARC.toast('Indica un importe'); return; }
    var d = $('#f_d').value || today(); D.fin.tx.push({ id: uid(), d: d, t: LF.fk, cat: LF.cat, amt: a, note: ($('#f_n').value || '').trim() }); LF.month = d.slice(0, 7); save(); ARC.closeModal(); ARC.render(true);
  };
  A.finDel = function (el) { D.fin.tx = D.fin.tx.filter(function (t) { return t.id !== el.dataset.id; }); save(); ARC.render(true); };
  A.finBudgets = function () {
    ARC.openModal('<h3>Presupuestos mensuales</h3><p class="hint">Deja en blanco las categorías sin límite.</p>' + CATS.out.map(function (c) { return '<div class="grow bud"><span class="gi">' + CATE[c] + '</span><b>' + c + '</b><input id="bd_' + c + '" type="text" inputmode="decimal" placeholder="—" value="' + (D.fin.budgets[c] || '') + '"></div>'; }).join('') + '<button class="btn primary big" data-a="finBudgetSave">Guardar</button>');
  };
  A.finBudgetSave = function () { CATS.out.forEach(function (c) { var v = num($('#bd_' + c).value); if (v > 0) D.fin.budgets[c] = v; else delete D.fin.budgets[c]; }); save(); ARC.closeModal(); ARC.render(true); };
  A.saveAdd = function () { ARC.openModal('<h3>Nueva hucha</h3><div class="lbl">¿Para qué ahorras?</div><input id="s_n" placeholder="Viaje, fondo de emergencia…"><div class="lbl">Objetivo (' + D.fin.cur + ')</div><input id="s_t" type="text" inputmode="decimal" placeholder="1000"><button class="btn primary big" data-a="saveSave">Crear</button>'); };
  A.saveSave = function () { var n = ($('#s_n').value || '').trim(), t = num($('#s_t').value); if (!n || t <= 0) { ARC.toast('Completa nombre y objetivo'); return; } D.fin.saves.push({ id: uid(), n: n, target: t, saved: 0 }); save(); ARC.closeModal(); ARC.render(true); };
  A.saveDep = function (el) { ARC.openModal('<h3>Aportar a la hucha</h3><input id="s_a" type="text" inputmode="decimal" placeholder="0,00"><button class="btn primary big" data-a="saveDepOk" data-id="' + el.dataset.id + '">Aportar</button>'); };
  A.saveDepOk = function (el) { var a = num($('#s_a').value); if (a <= 0) return; var s = D.fin.saves.filter(function (x) { return x.id === el.dataset.id; })[0]; s.saved += a; save(); ARC.closeModal(); if (s.saved >= s.target) ARC.toast('¡Objetivo de ahorro cumplido! 🎉'); ARC.render(true); };
  A.saveDel = function (el) { D.fin.saves = D.fin.saves.filter(function (x) { return x.id !== el.dataset.id; }); save(); ARC.render(true); };
  A.finCur = function () { var l = ['€', '$', '£', 'MXN', 'ARS', 'COP', 'CLP']; D.fin.cur = l[(l.indexOf(D.fin.cur) + 1) % l.length]; save(); ARC.render(true); };
  A.finCsv = function () {
    var rows = ['fecha,tipo,categoria,importe,nota'].concat(D.fin.tx.map(function (t) { return [t.d, t.t === 'in' ? 'ingreso' : 'gasto', t.cat, t.amt, '"' + (t.note || '').replace(/"/g, '""') + '"'].join(','); }));
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' })); a.download = 'arcana-finanzas.csv'; document.body.appendChild(a); a.click(); a.remove();
  };
})();
