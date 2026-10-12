/* Enciclopedia (Grimorio): categorías con entradas, emblemas, favoritos, buscador, estudio y entrenamiento infinito. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, A = ARC.act, P = ARC.profile;
  var GR = { cats: {}, all: [] };

  /* ---------- registro de datos ---------- */
  GR.cat = function (id, name, emoji, desc, hue, dark) { GR.cats[id] = { id: id, name: name, emoji: emoji, desc: desc, hue: hue || '#e6c97a', dark: !!dark, entries: [] }; };
  function parseFacts(f) { return f ? f.split(' · ').map(function (x) { var i = x.indexOf(': '); return i > -1 ? [x.slice(0, i), x.slice(i + 2)] : ['', x]; }) : []; }
  // fila: [nombre, emoji, resumen, detalle, hechos "Clave: valor · Clave: valor", etiquetas "a,b"]
  GR.add = function (cat, rows) {
    var c = GR.cats[cat]; if (!c) return;
    rows.forEach(function (r) {
      var e = { id: cat + '/' + c.entries.length, cat: cat, n: r[0], e: r[1], s: r[2], l: r[3] || '', f: parseFacts(r[4]), t: (r[5] || '').split(',').filter(Boolean) };
      c.entries.push(e); GR.all.push(e);
    });
  };
  GR.byId = function (id) { var p = id.split('/'), c = GR.cats[p[0]]; return c ? c.entries[+p[1]] : null; };
  GR.count = function () { return GR.all.length; };

  var favs = ARC.store.get('arcana.fav', []);
  var saveFav = function () { ARC.store.set('arcana.fav', favs); };
  var isFav = function (id) { return favs.indexOf(id) > -1; };

  /* ---------- generador de preguntas ---------- */
  function trunc(s, n) { s = String(s); if (s.length <= n) return s; var cut = s.slice(0, n); return cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : n) + '…'; }
  function pickN(arr, n, not) { var pool = arr.filter(function (x) { return !not || not.indexOf(x) < 0; }), out = [], idx = ARC.shuffle(pool.length); for (var i = 0; i < Math.min(n, pool.length); i++) out.push(pool[idx[i]]); return out; }
  function build(correct, wrongs, q, why) {
    var opts = wrongs.concat([correct]), order = ARC.shuffle(opts.length), res = order.map(function (i) { return opts[i]; });
    return { t: 'quiz', q: q, opts: res, a: res.indexOf(correct), why: why || '' };
  }
  GR.question = function (entry, pool) {
    var same = (pool || GR.cats[entry.cat].entries).filter(function (x) { return x !== entry && x.s && x.s !== entry.s; });
    if (same.length < 3) return null;
    var types = ['name', 'summary'], keyed = entry.f.filter(function (kv) { return kv[0]; });
    if (keyed.length) types.push('fact', 'fact');
    var t = types[ARC.rnd(types.length)];
    if (t === 'fact') {
      var kv = keyed[ARC.rnd(keyed.length)], vals = {}; same.forEach(function (x) { x.f.forEach(function (y) { if (y[0] === kv[0] && y[1] !== kv[1]) vals[y[1]] = 1; }); });
      var vs = Object.keys(vals);
      if (vs.length >= 3) return build(kv[1], pickN(vs, 3), '¿' + kv[0] + ' de «' + entry.n + '»?', entry.n + ' — ' + kv[0] + ': ' + kv[1] + '.');
      t = 'name';
    }
    if (t === 'summary') {
      var w = pickN(same.map(function (x) { return x.n; }), 3);
      return build(entry.n, w, '«' + trunc(entry.s, 130) + '» ¿A qué corresponde?', entry.n + ': ' + trunc(entry.s, 140));
    }
    var w2 = pickN(same.map(function (x) { return trunc(x.s, 95); }), 3);
    return build(trunc(entry.s, 95), w2, '¿Cuál describe mejor «' + entry.n + '»?', entry.n + ': ' + trunc(entry.s, 140));
  };
  GR.quiz = function (entry, n) { var out = [], tries = 0; while (out.length < n && tries++ < n * 4) { var q = GR.question(entry); if (q && !out.some(function (x) { return x.q === q.q; })) out.push(q); } return out; };

  /* ---------- emblema + entrada ---------- */
  function emblemFor(e) { var c = GR.cats[e.cat]; return ARC.sig.emblem(e.n, c.hue, 150); }
  function entryCard(e) {
    return '<button class="gcard" data-a="grOpen" data-id="' + e.id + '" style="--h:' + GR.cats[e.cat].hue + '"><span class="ge">' + e.e + '</span><span class="gt"><b>' + esc(e.n) + '</b><small>' + esc(trunc(e.s, 90)) + '</small></span>' + (isFav(e.id) ? '<i class="gfav">★</i>' : '') + '</button>';
  }
  function related(e) {
    var c = GR.cats[e.cat], tagged = c.entries.filter(function (x) { return x !== e && x.t.some(function (t) { return e.t.indexOf(t) > -1; }); });
    if (tagged.length < 4) tagged = tagged.concat(pickN(c.entries.filter(function (x) { return x !== e && tagged.indexOf(x) < 0; }), 4 - tagged.length));
    return tagged.slice(0, 6);
  }
  function openEntry(e) {
    var c = GR.cats[e.cat], rel = related(e);
    var dark = c.dark ? '<p class="gdis">⚠️ Contenido presentado como historia, folclore y ficción. No es una instrucción para practicar nada ni un hecho comprobado.</p>' : '';
    ARC.openModal('<div class="gdet' + (c.dark ? ' dark' : '') + '"><div class="gemb">' + emblemFor(e) + '</div><small class="gold">' + c.emoji + ' ' + esc(c.name) + '</small><h3>' + e.e + ' ' + esc(e.n) + '</h3>' +
      (e.t.length ? '<div class="gtags">' + e.t.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
      '<p class="gsum">' + esc(e.s) + '</p>' + (e.l ? '<p>' + esc(e.l) + '</p>' : '') +
      (e.f.length ? '<div class="gfacts">' + e.f.map(function (kv) { return '<div>' + (kv[0] ? '<small>' + esc(kv[0]) + '</small>' : '') + '<b>' + esc(kv[1]) + '</b></div>'; }).join('') + '</div>' : '') + dark +
      '<div class="gact"><button class="btn ghost sm" data-a="grFav" data-id="' + e.id + '">' + (isFav(e.id) ? '★ En favoritos' : '☆ Guardar') + '</button><button class="btn primary sm" data-a="grStudy" data-id="' + e.id + '">🎓 Estudiar</button><button class="btn ghost sm" data-a="grAsk" data-id="' + e.id + '">💬 Preguntar a Sibila</button></div>' +
      (rel.length ? '<h4>Relacionado</h4><div class="grel">' + rel.map(function (r) { return '<button data-a="grOpen" data-id="' + r.id + '">' + r.e + ' ' + esc(r.n) + '</button>'; }).join('') + '</div>' : '') + '</div>', 'tall');
  }

  /* ---------- vistas ---------- */
  var GS = { q: '', cat: null, tq: '' };
  function visibleCats() { return Object.keys(GR.cats).map(function (k) { return GR.cats[k]; }).filter(function (c) { return !c.dark && c.entries.length; }); }
  function dayEntry() {
    var pool = GR.all.filter(function (x) { return !GR.cats[x.cat].dark; }); if (!pool.length) return null;
    return pool[SKYTXT.hash('gr|' + ARC.dayKey(0)) % pool.length];
  }
  function searchResults(q, dark) {
    var nq = ARC.norm(q.trim()), out = [];
    if (nq.length < 2) return out;
    GR.all.forEach(function (e) { if (GR.cats[e.cat].dark !== !!dark) return; if (ARC.norm(e.n).indexOf(nq) > -1 || ARC.norm(e.s).indexOf(nq) > -1 || e.t.some(function (t) { return ARC.norm(t).indexOf(nq) > -1; })) out.push(e); });
    return out.sort(function (a, b) { return (ARC.norm(a.n).indexOf(nq) === 0 ? 0 : 1) - (ARC.norm(b.n).indexOf(nq) === 0 ? 0 : 1); }).slice(0, 60);
  }
  function listHTML(catId) {
    var c = GR.cats[catId], q = ARC.norm(GS['q_' + catId] || ''), list = c.entries.filter(function (e) { return !q || ARC.norm(e.n).indexOf(q) > -1 || ARC.norm(e.s).indexOf(q) > -1 || e.t.some(function (t) { return ARC.norm(t).indexOf(q) > -1; }); });
    return '<div class="catbar"><div class="catx"><span>' + c.emoji + '</span><div><b>' + esc(c.name) + '</b><small>' + c.entries.length + ' entradas · ' + esc(c.desc) + '</small></div></div>' +
      '<input id="gq_' + catId + '" type="search" placeholder="Buscar en ' + esc(c.name) + '…" value="' + esc(GS['q_' + catId] || '') + '" autocomplete="off"></div>' +
      '<div class="glist">' + (list.length ? list.map(entryCard).join('') : '<p class="hint c">Sin resultados</p>') + '</div>';
  }
  function enciView() {
    if (GS.cat && GR.cats[GS.cat]) return '<button class="btn link left" data-a="grBack">← Enciclopedia</button>' + listHTML(GS.cat);
    var cats = visibleCats(), total = cats.reduce(function (s, c) { return s + c.entries.length; }, 0), de = dayEntry();
    var h = '<div class="panel"><div class="lbl">Buscar en toda la enciclopedia · ' + total + ' entradas</div><input id="gq_all" type="search" placeholder="Cristales, dioses, símbolos, rituales…" value="' + esc(GS.q) + '" autocomplete="off"></div>';
    if (GS.q.trim().length >= 2) {
      var r = searchResults(GS.q, false);
      return h + '<div class="glist">' + (r.length ? r.map(entryCard).join('') : '<p class="hint c">Sin resultados</p>') + '</div>';
    }
    if (de) h += '<button class="panel gday" data-a="grOpen" data-id="' + de.id + '" style="--h:' + GR.cats[de.cat].hue + '"><div class="gemb sm">' + ARC.sig.emblem(de.n, GR.cats[de.cat].hue, 84) + '</div><div><div class="lbl">Entrada del día</div><b>' + de.e + ' ' + esc(de.n) + '</b><p>' + esc(trunc(de.s, 120)) + '</p></div></button>';
    h += '<div class="duo"><button class="mini" data-a="grRandom"><b>🎲</b><span>Descubre algo</span><small>Una entrada al azar</small></button><button class="mini" data-a="grFavs"><b>★</b><span>Mis favoritos</span><small>' + favs.length + ' guardados</small></button></div>';
    h += '<div class="catgrid">' + cats.map(function (c) { return '<button class="catc" data-a="grCat" data-id="' + c.id + '" style="--h:' + c.hue + '"><b>' + c.emoji + '</b><span>' + esc(c.name) + '</span><small>' + c.entries.length + ' entradas</small></button>'; }).join('') + '</div>';
    return h;
  }
  function favsView() {
    var list = favs.map(GR.byId).filter(Boolean);
    return '<button class="btn link left" data-a="grBack">← Enciclopedia</button><h3 class="sec">Mis favoritos</h3><div class="glist">' + (list.length ? list.map(entryCard).join('') : '<p class="hint c">Aún no has guardado nada. Abre una entrada y toca ☆ Guardar.</p>') + '</div>';
  }

  /* ---------- entrenamiento infinito ---------- */
  var TR = { run: null, cats: [], len: 10 };
  function trainView() {
    if (TR.run) return trainRun();
    var cats = Object.keys(GR.cats).map(function (k) { return GR.cats[k]; }).filter(function (c) { return !c.dark && c.entries.length >= 6; });
    var books = ARC.study ? ARC.study.books.length : 0;
    return '<div class="panel"><div class="lbl">Entrenamiento infinito</div><p class="hint">Preguntas que se generan y se barajan cada vez, a partir de toda la enciclopedia y de los exámenes de los libros. Nunca son las mismas.</p>' +
      '<div class="chips wrap"><button data-a="trCat" data-id="*" class="' + (TR.cats.indexOf('*') > -1 ? 'on' : '') + '">🌐 Todo mezclado</button>' + (books ? '<button data-a="trCat" data-id="@" class="' + (TR.cats.indexOf('@') > -1 ? 'on' : '') + '">📚 Exámenes de libros</button>' : '') +
      cats.map(function (c) { return '<button data-a="trCat" data-id="' + c.id + '" class="' + (TR.cats.indexOf(c.id) > -1 ? 'on' : '') + '">' + c.emoji + ' ' + esc(c.name) + '</button>'; }).join('') + '</div>' +
      '<div class="lbl">Número de preguntas</div><div class="seg three">' + [10, 20, 30].map(function (n) { return '<button data-a="trLen" data-v="' + n + '" class="' + (TR.len === n ? 'on' : '') + '">' + n + '</button>'; }).join('') + '</div>' +
      '<button class="btn primary big" data-a="trStart">Empezar ⚡</button></div>';
  }
  function bookQuestions() { var q = []; (ARC.study ? ARC.study.books : []).forEach(function (b) { b.chapters.forEach(function (c) { c.steps.forEach(function (s) { if (s.t === 'quiz') q.push(s); }); }); }); return q; }
  function makeSet() {
    var out = [], sel = TR.cats.length ? TR.cats : ['*'], tries = 0;
    var cats = sel.indexOf('*') > -1 ? Object.keys(GR.cats).filter(function (k) { return !GR.cats[k].dark && GR.cats[k].entries.length >= 6; }) : sel.filter(function (k) { return GR.cats[k]; });
    var bq = (sel.indexOf('@') > -1 || sel.indexOf('*') > -1) ? bookQuestions() : [];
    while (out.length < TR.len && tries++ < TR.len * 8) {
      var useBook = bq.length && (sel.indexOf('@') > -1 && !cats.length ? true : ARC.rnd(4) === 0 && sel.indexOf('*') > -1);
      var q;
      if (useBook || !cats.length) { var s = bq[ARC.rnd(bq.length)]; var order = ARC.shuffle(s.opts.length), o2 = order.map(function (i) { return s.opts[i]; }); q = { t: 'quiz', q: s.q, opts: o2, a: o2.indexOf(s.opts[s.a]), why: s.why }; }
      else { var cat = GR.cats[cats[ARC.rnd(cats.length)]]; q = GR.question(cat.entries[ARC.rnd(cat.entries.length)]); }
      if (q && !out.some(function (x) { return x.q === q.q; })) out.push(q);
    }
    return out;
  }
  function trainRun() {
    var r = TR.run;
    if (r.i >= r.set.length) {
      var pct = Math.round(r.ok / r.set.length * 100);
      return '<div class="trres"><div class="trophy">' + (pct >= 80 ? '🏆' : pct >= 50 ? '✨' : '📖') + '</div><h2>' + r.ok + ' / ' + r.set.length + '</h2><p>' + pct + '% de aciertos · +' + r.ok + ' XP</p><button class="btn primary big" data-a="trStart">Otra tanda ⚡</button><button class="btn link" data-a="trExit">Salir</button></div>';
    }
    var q = r.set[r.i];
    return '<div class="trq"><div class="bar"><i style="width:' + Math.round(r.i / r.set.length * 100) + '%"></i></div><small class="gold">Pregunta ' + (r.i + 1) + ' de ' + r.set.length + ' · aciertos ' + r.ok + '</small><h2>' + esc(q.q) + '</h2><div class="opts">' +
      q.opts.map(function (o, i) { var cls = 'opt'; if (r.sel !== null) { if (i === q.a) cls += ' ok'; else if (i === r.sel) cls += ' bad'; } return '<button class="' + cls + '" data-a="trOpt" data-i="' + i + '"' + (r.sel !== null ? ' disabled' : '') + '>' + esc(o) + '</button>'; }).join('') + '</div>' +
      (r.sel !== null ? '<div class="fb ' + (r.sel === q.a ? 'ok' : 'bad') + '"><b>' + (r.sel === q.a ? '¡Correcto! ✨' : 'No era esa 🌙') + '</b><span>' + esc(q.why || '') + '</span></div><button class="btn primary big" data-a="trNext">Continuar</button>' : '') + '</div>';
  }

  /* ---------- acciones ---------- */
  A.grOpen = function (el) { var e = GR.byId(el.dataset.id); if (e) openEntry(e); };
  A.grCat = function (el) { GS.cat = el.dataset.id; ARC.render(); };
  A.grBack = function () { GS.cat = null; GS.favs = false; ARC.render(); };
  A.grFavs = function () { GS.cat = '__fav'; ARC.render(); };
  A.grRandom = function () { var pool = GR.all.filter(function (x) { return !GR.cats[x.cat].dark; }); openEntry(pool[ARC.rnd(pool.length)]); };
  A.grFav = function (el) { var id = el.dataset.id, i = favs.indexOf(id); if (i > -1) favs.splice(i, 1); else favs.push(id); saveFav(); el.textContent = isFav(id) ? '★ En favoritos' : '☆ Guardar'; };
  A.grStudy = function (el) {
    var e = GR.byId(el.dataset.id), qs = GR.quiz(e, 3);
    if (!qs.length) { ARC.toast('Aún no hay preguntas para esta entrada'); return; }
    var st = { i: 0, ok: 0, qs: qs, e: e, sel: null }; GS.study = st; studyRender();
  };
  function studyRender() {
    var st = GS.study; if (!st) return;
    if (st.i >= st.qs.length) { ARC.openModal('<div class="trres"><div class="trophy">' + (st.ok === st.qs.length ? '🌟' : '✨') + '</div><h3>' + esc(st.e.n) + '</h3><p>' + st.ok + ' de ' + st.qs.length + ' correctas</p><button class="btn primary big" data-a="close">Listo</button></div>'); GS.study = null; return; }
    var q = st.qs[st.i];
    ARC.openModal('<small class="gold">Estudiando: ' + esc(st.e.n) + ' · ' + (st.i + 1) + '/' + st.qs.length + '</small><h3>' + esc(q.q) + '</h3><div class="opts">' + q.opts.map(function (o, i) { var cls = 'opt'; if (st.sel !== null) { if (i === q.a) cls += ' ok'; else if (i === st.sel) cls += ' bad'; } return '<button class="' + cls + '" data-a="stOpt" data-i="' + i + '"' + (st.sel !== null ? ' disabled' : '') + '>' + esc(o) + '</button>'; }).join('') + '</div>' + (st.sel !== null ? '<div class="fb ' + (st.sel === q.a ? 'ok' : 'bad') + '"><span>' + esc(q.why || '') + '</span></div><button class="btn primary big" data-a="stNext">Continuar</button>' : ''), 'tall');
  }
  A.stOpt = function (el) { var st = GS.study; st.sel = Number(el.dataset.i); if (st.sel === st.qs[st.i].a) st.ok++; studyRender(); };
  A.stNext = function () { var st = GS.study; st.i++; st.sel = null; studyRender(); };
  A.grAsk = function (el) {
    var e = GR.byId(el.dataset.id); ARC.closeModal();
    ARC.chat.push({ role: 'user', content: 'Cuéntame más sobre «' + e.n + '» (' + GR.cats[e.cat].name + ') y cómo podría relacionarse con mi vida o mi práctica. Lo que sé: ' + e.s }); ARC.save('chat');
    ARC.go('chat'); setTimeout(function () { var i = $('#chatIn'); if (i && ARC.act.chatSend) { i.value = ''; } }, 0);
    if (ARC.chatKick) ARC.chatKick();
  };
  A.trCat = function (el) { var id = el.dataset.id, i = TR.cats.indexOf(id); if (i > -1) TR.cats.splice(i, 1); else { if (id === '*') TR.cats = []; else TR.cats = TR.cats.filter(function (x) { return x !== '*'; }); TR.cats.push(id); } ARC.render(true); };
  A.trLen = function (el) { TR.len = Number(el.dataset.v); ARC.render(true); };
  A.trStart = function () { var set = makeSet(); if (!set.length) { ARC.toast('Elige al menos una categoría con contenido'); return; } TR.run = { set: set, i: 0, ok: 0, sel: null }; ARC.render(); };
  A.trOpt = function (el) { var r = TR.run, q = r.set[r.i]; r.sel = Number(el.dataset.i); if (r.sel === q.a) { r.ok++; ARC.progress.xp += 1; ARC.save('progress'); } ARC.render(true); };
  A.trNext = function () { TR.run.i++; TR.run.sel = null; ARC.render(true); };
  A.trExit = function () { TR.run = null; ARC.render(); };
  ARC.inputs.gq_all = function (v) { GS.q = v; clearTimeout(GS.t); GS.t = setTimeout(function () { ARC.render(true); var i = $('#gq_all'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 350); };

  function bindCatInputs() {
    Object.keys(GR.cats).forEach(function (id) {
      ARC.inputs['gq_' + id] = function (v) { GS['q_' + id] = v; clearTimeout(GS.t); GS.t = setTimeout(function () { ARC.render(true); var i = $('#gq_' + id); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 300); };
    });
  }

  /* ---------- vistas registradas ---------- */
  function enciclo() { if (GS.cat === '__fav') return favsView(); return enciView(); }
  GR.catView = function (id) { return listHTML(id); };
  GR.register = function () {
    bindCatInputs();
    ARC.regSub('study', 'enciclopedia', '📖', 'Enciclopedia', enciclo);
    ARC.regSub('study', 'entrena', '⚡', 'Entrenar', trainView);
    Object.keys(GR.cats).forEach(function (id) { var c = GR.cats[id]; if (c.dark && c.entries.length && !c.custom) ARC.regSub('crypt', id, c.emoji, c.name, function () { return listHTML(id); }); });
  };
  ARC.grim = GR;
})();
