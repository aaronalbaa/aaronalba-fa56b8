/* Juegos: «El Oráculo adivina» (tipo Akinator: elige la mejor pregunta por ganancia de información y aprende de tus partidas), Memoria arcana y Adivina el arcano. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, A = ARC.act, K = window.AKIDATA;
  var G = ARC.store.get('arcana.games', { akin: { custom: [], learn: {}, played: 0, won: 0 }, mem: { best: 0 }, arc: { best: 0 } });
  G.akin = G.akin || { custom: [], learn: {}, played: 0, won: 0 }; G.mem = G.mem || { best: 0 }; G.arc = G.arc || { best: 0 };
  function save() { G.rev = Date.now(); ARC.store.set('arcana.games', G); }
  K.q.snake = '¿Se relaciona con serpientes?'; K.q.blue = '¿Su color característico es el azul?';
  var QIDS = Object.keys(K.q);
  var GS = { tab: 'hub' };

  /* ---------- base de datos de personajes ---------- */
  var ITEMS = K.raw.map(function (r) { var p = r.split('|'), t = {}; p[1].split(' ').forEach(function (x) { t[x] = 1; }); return { n: p[0], t: t, builtin: true }; });
  function allItems() { return ITEMS.concat(G.akin.custom.map(function (c) { return { n: c.n, t: c.t || {}, custom: true }; })); }
  function icon(it) { var t = it.t; return t.tarot ? '🃏' : t.animal ? '🐾' : t.monster ? '🐉' : t.god ? '🔱' : t.angel ? '👼' : t.myth ? '📜' : t.sport ? '🏅' : t.art ? '🎨' : t.sci ? '🔬' : t.pol ? '👑' : t.fic ? '📖' : t.real ? '🧑' : '✨'; }
  // probabilidad de «sí» para (item, pregunta), con lo aprendido
  function pYes(it, q) {
    var base = it.custom && !(q in it.t) ? 0.5 : (it.t[q] ? 0.97 : 0.03), L = G.akin.learn[it.n], c = L && L[q];
    if (!c) return base; return (base * 4 + c[0]) / (4 + c[0] + c[1]);
  }

  /* ---------- motor ---------- */
  var AK = null;
  function startAk() { var items = allItems(); AK = { items: items, w: items.map(function () { return 1; }), asked: [], ans: {}, rej: [], phase: 'q', cur: null, tries: 0 }; nextQ(); }
  function nextQ() {
    var tot = AK.w.reduce(function (a, b) { return a + b; }, 0), best = [];
    QIDS.forEach(function (q) {
      if (AK.asked.indexOf(q) > -1) return; var p = 0; AK.items.forEach(function (it, i) { p += AK.w[i] * pYes(it, q); }); p /= tot;
      best.push([q, 1 - Math.abs(2 * p - 1), p]);
    });
    best.sort(function (a, b) { return b[1] - a[1]; });
    var top = AK.w.map(function (w, i) { return [w / tot, i]; }).sort(function (a, b) { return b[0] - a[0]; });
    var share = top[0][0], n = AK.asked.length;
    if ((n >= 6 && share > 0.62) || (n >= 24) || !best.length || best[0][1] < 0.06 && n > 3) { guess(); return; }
    var pick = best[ARC.rnd(Math.min(3, best.length))]; AK.cur = pick[0]; AK.phase = 'q'; ARC.render(true);
  }
  function guess() {
    var tot = AK.w.reduce(function (a, b) { return a + b; }, 0), order = AK.w.map(function (w, i) { return [w, i]; }).filter(function (x) { return AK.rej.indexOf(x[1]) < 0 && x[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; });
    if (!order.length || AK.tries >= 3) { AK.phase = 'lost'; ARC.render(true); return; }
    AK.guess = order[0][1]; AK.conf = order[0][0] / tot; AK.phase = 'guess'; ARC.render(true);
  }
  var VAL = { y: 1, py: 0.75, u: 0.5, pn: 0.25, n: 0 };
  A.akAns = function (el) {
    var v = VAL[el.dataset.v], q = AK.cur; AK.asked.push(q); AK.ans[q] = v;
    AK.items.forEach(function (it, i) { var p = pYes(it, q); AK.w[i] *= v * p + (1 - v) * (1 - p) + 0.02; });
    // normaliza para evitar underflow
    var m = Math.max.apply(null, AK.w); AK.w = AK.w.map(function (w) { return w / m; });
    nextQ();
  };
  A.akBack = function () { if (!AK || !AK.asked.length) return; var q = AK.asked.pop(); delete AK.ans[q]; AK.w = AK.items.map(function () { return 1; }); AK.asked.forEach(function (qq) { var v = AK.ans[qq]; AK.items.forEach(function (it, i) { var p = pYes(it, qq); AK.w[i] *= v * p + (1 - v) * (1 - p) + 0.02; }); var m = Math.max.apply(null, AK.w); AK.w = AK.w.map(function (w) { return w / m; }); }); AK.rej = []; AK.tries = 0; AK.cur = q; AK.phase = 'q'; ARC.render(true); };
  function learnFrom(name) {
    var L = G.akin.learn[name] = G.akin.learn[name] || {};
    Object.keys(AK.ans).forEach(function (q) { var v = AK.ans[q]; if (v === 0.5) return; var c = L[q] = L[q] || [0, 0]; c[0] += v; c[1] += 1 - v; });
  }
  A.akRight = function () { var it = AK.items[AK.guess]; learnFrom(it.n); G.akin.played++; G.akin.won++; save(); ARC.progress.xp += 3; ARC.save('progress'); AK.phase = 'win'; ARC.render(true); };
  A.akWrong = function () { AK.rej.push(AK.guess); AK.tries++; guess(); };
  A.akName = function () {
    var raw = ($('#ak_name').value || '').trim(); if (!raw) return; var nn = ARC.norm(raw), found = allItems().filter(function (i) { return ARC.norm(i.n) === nn; })[0];
    G.akin.played++;
    if (found) learnFrom(found.n);
    else { var t = {}; Object.keys(AK.ans).forEach(function (q) { if (AK.ans[q] >= 0.75) t[q] = 1; }); G.akin.custom.push({ n: raw, t: t }); G.akin.custom = G.akin.custom.slice(-300); learnFrom(raw); }
    save(); AK.phase = 'learned'; AK.learnName = raw; ARC.render(true);
  };
  A.akAgain = function () { startAk(); };
  A.akExit = function () { AK = null; ARC.render(true); };

  function akHTML() {
    if (!AK) {
      return '<div class="panel akhero"><div class="akorb"><i></i></div><h2>El Oráculo adivina</h2><p class="hint c">Piensa en un personaje real, de ficción o mitológico, un animal o una carta del tarot. Haré preguntas y trataré de adivinarlo.</p><button class="btn primary big" data-a="akStart">Estoy listo/a 🔮</button><p class="hint c">Conozco ' + allItems().length + ' personajes y aprendo de cada partida (' + G.akin.won + ' aciertos de ' + G.akin.played + ' partidas).</p></div>';
    }
    var h = '<div class="panel akplay"><div class="akorb think"><i></i></div>';
    if (AK.phase === 'q') {
      h += '<small class="kw">Pregunta ' + (AK.asked.length + 1) + '</small><h2 class="akq">' + esc(K.q[AK.cur]) + '</h2><div class="akans">' + [['y', 'Sí'], ['py', 'Probablemente sí'], ['u', 'No lo sé'], ['pn', 'Probablemente no'], ['n', 'No']].map(function (a) { return '<button data-a="akAns" data-v="' + a[0] + '" class="a-' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</div>' + (AK.asked.length ? '<button class="btn link" data-a="akBack">← Volver a la anterior</button>' : '') + '<button class="btn link" data-a="akExit">Salir</button>';
    } else if (AK.phase === 'guess') {
      var it = AK.items[AK.guess];
      h += '<small class="kw">Creo que es…</small><div class="bigemo">' + icon(it) + '</div><h2 class="akq">' + esc(it.n) + '</h2><p class="hint c">Seguridad: ' + Math.round(Math.min(0.99, AK.conf) * 100) + ' %</p><div class="row2"><button class="btn primary" data-a="akRight">¡Sí, lo adivinaste!</button><button class="btn ghost" data-a="akWrong">No es</button></div>';
    } else if (AK.phase === 'win') {
      h += '<div class="bigemo">🎉</div><h2 class="akq">¡Lo sabía!</h2><p class="hint c">He tomado nota para ser aún más certero la próxima vez.</p><button class="btn primary big" data-a="akAgain">Otra partida</button><button class="btn link" data-a="akExit">Salir</button>';
    } else if (AK.phase === 'lost') {
      h += '<div class="bigemo">🙈</div><h2 class="akq">Me has ganado</h2><p class="hint c">¿En quién pensabas? Así aprendo para la próxima.</p><input id="ak_name" placeholder="Nombre del personaje" maxlength="60"><button class="btn primary big" data-a="akName">Enseñar al Oráculo</button><button class="btn link" data-a="akExit">Salir</button>';
    } else {
      h += '<div class="bigemo">📚</div><h2 class="akq">Aprendido: ' + esc(AK.learnName) + '</h2><p class="hint c">La próxima vez te sorprenderé.</p><button class="btn primary big" data-a="akAgain">Otra partida</button><button class="btn link" data-a="akExit">Salir</button>';
    }
    return h + '</div>';
  }
  A.akStart = function () { startAk(); };

  /* ---------- Memoria arcana ---------- */
  var MM = null;
  function memStart(n) { var D = DECKS.get('tarot', 'rws').cards.slice(0, 22), idx = ARC.shuffle(22).slice(0, n), cards = []; idx.forEach(function (i) { cards.push({ k: i, e: D[i].emoji, n: D[i].name }, { k: i, e: D[i].emoji, n: D[i].name }); }); var o = ARC.shuffle(cards.length); MM = { n: n, cards: o.map(function (i) { return cards[i]; }), open: [], done: {}, moves: 0, lock: false }; }
  function memHTML() {
    if (!MM) return '<div class="panel c"><div class="bigemo">🃏</div><h2>Memoria arcana</h2><p class="hint c">Encuentra las parejas de Arcanos Mayores con el menor número de movimientos.</p><div class="row2"><button class="btn primary" data-a="memStart" data-v="6">Fácil · 6 pares</button><button class="btn ghost" data-a="memStart" data-v="10">Difícil · 10 pares</button></div><p class="hint c">Mejor marca (difícil): ' + (G.mem.best || '—') + ' movimientos</p></div>';
    var won = Object.keys(MM.done).length === MM.n;
    var h = '<div class="mmhead"><b>Movimientos: ' + MM.moves + '</b><button class="btn link sm" data-a="memExit">Salir</button></div><div class="mmgrid" style="grid-template-columns:repeat(' + (MM.n > 6 ? 5 : 4) + ',1fr)">' + MM.cards.map(function (c, i) { var open = MM.open.indexOf(i) > -1 || MM.done[c.k]; return '<button class="mmc' + (open ? ' open' : '') + (MM.done[c.k] ? ' done' : '') + '" data-a="memFlip" data-i="' + i + '"><span class="mf">' + (open ? c.e : '✦') + '</span></button>'; }).join('') + '</div>';
    if (won) { if (MM.n === 10 && (!G.mem.best || MM.moves < G.mem.best)) { G.mem.best = MM.moves; save(); } ARC.progress.xp += 5; ARC.save('progress'); h += '<div class="panel c"><div class="bigemo">🏆</div><h3>¡Completado en ' + MM.moves + ' movimientos!</h3><button class="btn primary big" data-a="memStart" data-v="' + MM.n + '">Jugar otra vez</button></div>'; MM.xp = 1; }
    return h;
  }
  A.memStart = function (el) { memStart(Number(el.dataset.v)); ARC.render(true); };
  A.memExit = function () { MM = null; ARC.render(true); };
  A.memFlip = function (el) {
    var i = Number(el.dataset.i); if (!MM || MM.lock || MM.open.indexOf(i) > -1 || MM.done[MM.cards[i].k]) return;
    MM.open.push(i); ARC.render(true);
    if (MM.open.length === 2) {
      MM.moves++; var a = MM.cards[MM.open[0]], b = MM.cards[MM.open[1]];
      if (a.k === b.k) { MM.done[a.k] = true; MM.open = []; ARC.render(true); }
      else { MM.lock = true; setTimeout(function () { if (MM) { MM.open = []; MM.lock = false; ARC.render(true); } }, 900); }
    }
  };

  /* ---------- Adivina el arcano ---------- */
  var GA = null;
  function arcNext() {
    var D = DECKS.get('tarot', 'rws').cards.slice(0, 22), c = ARC.rnd(22), opts = [c]; while (opts.length < 4) { var x = ARC.rnd(22); if (opts.indexOf(x) < 0) opts.push(x); }
    GA.q = { c: c, opts: ARC.shuffle(4).map(function (i) { return opts[i]; }), sel: null, kw: D[c].kwUp, mean: D[c].up || '' };
  }
  function arcHTML() {
    var D = DECKS.get('tarot', 'rws').cards.slice(0, 22);
    if (!GA) return '<div class="panel c"><div class="bigemo">🔮</div><h2>Adivina el arcano</h2><p class="hint c">Te doy las palabras clave: ¿qué Arcano Mayor es? Diez rondas.</p><button class="btn primary big" data-a="arcStart">Empezar</button><p class="hint c">Mejor marca: ' + (G.arc.best || 0) + ' / 10</p></div>';
    if (GA.i >= 10) { if (GA.ok > G.arc.best) { G.arc.best = GA.ok; save(); } ARC.progress.xp += GA.ok; ARC.save('progress'); return '<div class="panel c"><div class="bigemo">' + (GA.ok >= 8 ? '🏆' : '✨') + '</div><h2>' + GA.ok + ' / 10</h2><button class="btn primary big" data-a="arcStart">Otra vez</button><button class="btn link" data-a="arcExit">Salir</button></div>'; }
    var q = GA.q;
    return '<div class="panel"><small class="kw">Ronda ' + (GA.i + 1) + ' de 10 · aciertos ' + GA.ok + '</small><div class="lbl">Palabras clave</div><h2 class="akq">' + esc(q.kw) + '</h2><div class="opts">' + q.opts.map(function (o) { var cls = 'opt'; if (q.sel !== null) { if (o === q.c) cls += ' ok'; else if (o === q.sel) cls += ' bad'; } return '<button class="' + cls + '" data-a="arcPick" data-v="' + o + '"' + (q.sel !== null ? ' disabled' : '') + '>' + D[o].emoji + ' ' + esc(D[o].name) + '</button>'; }).join('') + '</div>' + (q.sel !== null ? '<button class="btn primary big" data-a="arcNext">Continuar</button>' : '') + '<button class="btn link" data-a="arcExit">Salir</button></div>';
  }
  A.arcStart = function () { GA = { i: 0, ok: 0 }; arcNext(); ARC.render(true); };
  A.arcPick = function (el) { var v = Number(el.dataset.v); GA.q.sel = v; if (v === GA.q.c) GA.ok++; ARC.render(true); };
  A.arcNext = function () { GA.i++; if (GA.i < 10) arcNext(); ARC.render(true); };
  A.arcExit = function () { GA = null; ARC.render(true); };

  /* ---------- vista ---------- */
  ARC.views.games = function () {
    var body;
    if (GS.tab === 'hub') {
      body = '<div class="catgrid"><button class="catc" data-a="gmGo" data-v="aki" style="--h:#8b6cff"><b>🔮</b><span>El Oráculo adivina</span><small>Piensa en alguien y lo descubro</small></button><button class="catc" data-a="gmGo" data-v="mem" style="--h:#e6c97a"><b>🃏</b><span>Memoria arcana</span><small>Empareja los arcanos</small></button><button class="catc" data-a="gmGo" data-v="arc" style="--h:#ff7eb6"><b>✨</b><span>Adivina el arcano</span><small>Por sus palabras clave</small></button><button class="catc" data-a="gmTrain" style="--h:#6fe3a0"><b>⚡</b><span>Entrenamiento</span><small>Preguntas infinitas</small></button></div>';
    } else body = '<button class="btn link left" data-a="gmGo" data-v="hub">← Juegos</button>' + (GS.tab === 'aki' ? akHTML() : GS.tab === 'mem' ? memHTML() : arcHTML());
    return '<section class="page games"><header class="hero small"><h1>Juegos <span>🎮</span></h1><p>Diviértete y aprende sin darte cuenta</p></header>' + body + '</section>';
  };
  A.gmGo = function (el) { GS.tab = el.dataset.v; AK = null; MM = null; GA = null; ARC.render(); };
  A.gmTrain = function () { ARC.go('study'); ARC.setSub('study', 'entrena'); ARC.render(); };
  ARC.games = { data: function () { return G; }, save: save, _ak: function () { return AK; }, _items: function () { return ITEMS; } };
})();
