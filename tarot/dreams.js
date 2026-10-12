/* Sueños: diario onírico, detección de símbolos, diccionario, patrones (símbolos, emociones, Luna) y escuela de sueño lúcido. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, A = ARC.act, DD = window.DREAMDATA;
  var D = ARC.store.get('arcana.dreams', { list: [], intent: '' });
  D.list = D.list || [];
  function save() { D.rev = Date.now(); ARC.store.set('arcana.dreams', D); }
  var DS = { tab: 'diario', q: '', draft: { feel: '', viv: 3, lucid: false, rec: false } };
  var FEELS = [['😊', 'Agradable'], ['😨', 'Miedo'], ['😢', 'Triste'], ['😮', 'Asombro'], ['😐', 'Neutro'], ['🤩', 'Euforia'], ['😠', 'Enfado']];
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

  function detect(text) {
    var norm = ARC.norm(text), tokens = norm.split(/[^a-z]+/).filter(Boolean), found = [];
    DD.symbols.forEach(function (s, idx) {
      var kws = s[2].split(',');
      var hit = kws.some(function (k) { if (k.indexOf(' ') > -1) return norm.indexOf(k) > -1; return tokens.some(function (t) { return t === k || (k.length >= 5 && t.indexOf(k) === 0); }); });
      if (hit) found.push(idx);
    });
    return found.slice(0, 8);
  }
  function moonBucket(ts) { var p = ASTRO.moonInfo(new Date(ts)).phase; return p < 0.06 || p > 0.94 ? 'nueva' : p < 0.44 ? 'creciente' : p < 0.56 ? 'llena' : 'menguante'; }
  ARC.dreams = {
    data: function () { return D; }, save: save,
    summary: function () {
      if (!D.list.length) return '';
      var cnt = {}; D.list.slice(0, 30).forEach(function (d) { (d.syms || []).forEach(function (i) { cnt[i] = (cnt[i] || 0) + 1; }); });
      var top = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).slice(0, 4).map(function (i) { return DD.symbols[i][0]; });
      var last = D.list[0];
      return 'SUEÑOS: ' + D.list.length + ' registrados; símbolos que más se repiten: ' + (top.join(', ') || 'ninguno aún') + '; último sueño (' + last.date + '): «' + (last.title || last.text.slice(0, 80)) + '».';
    }
  };

  ARC.views.dreams = function () {
    var T = [['diario', '📓 Diario'], ['simbolos', '🔣 Símbolos'], ['patrones', '📊 Patrones'], ['lucido', '💫 Lúcido']];
    var body = { diario: diaryHTML, simbolos: symbolsHTML, patrones: patternsHTML, lucido: lucidHTML }[DS.tab]();
    return '<section class="page"><button class="btn link left" data-a="tab" data-tab="more">← Más</button><header class="hero small"><h1>Sueños <span>🌌</span></h1><p>El mapa nocturno de tu mente</p></header><div class="chips sub">' + T.map(function (t) { return '<button data-a="drTab" data-v="' + t[0] + '" class="' + (DS.tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>' + body + '</section>';
  };
  A.drTab = function (el) { DS.tab = el.dataset.v; ARC.render(); };

  function diaryHTML() {
    var h = '<button class="btn primary big" data-a="drAdd">＋ Anotar un sueño</button>';
    if (!D.list.length) return h + '<div class="empty"><div class="eb">🌙</div><h3>Aún no hay sueños</h3><p class="hint">Al despertar, anota lo que recuerdes antes de moverte o mirar el móvil: los sueños se evaporan en minutos. Incluso un fragmento sirve.</p></div>';
    return h + '<div class="group">' + D.list.map(function (d, i) { return '<button class="grow" data-a="drOpen" data-id="' + d.id + '"><span class="gi">' + (d.feel || '🌙') + '</span><div><b>' + esc(d.title || d.text.slice(0, 40)) + '</b><small>' + esc(d.date) + (d.lucid ? ' · 💫 lúcido' : '') + ' · ' + (d.syms || []).slice(0, 3).map(function (k) { return DD.symbols[k][1]; }).join(' ') + '</small></div><i class="chev">›</i></button>'; }).join('') + '</div>';
  }
  A.drAdd = function () {
    DS.draft = { feel: '', viv: 3, lucid: false, rec: false };
    ARC.openModal('<h3>🌙 Nuevo sueño</h3><div class="lbl">Título (opcional)</div><input id="dr_t" placeholder="Una frase que lo resuma"><div class="lbl">¿Qué soñaste?</div><textarea id="dr_x" rows="7" placeholder="Escribe sin ordenar ni juzgar: escenas, personas, lugares, sensaciones…"></textarea><div class="lbl">¿Cómo te sentiste?</div><div class="chips wrap" id="dr_f">' + FEELS.map(function (f) { return '<button data-a="drFeel" data-v="' + f[0] + '">' + f[0] + ' ' + f[1] + '</button>'; }).join('') + '</div><div class="lbl">Intensidad</div><div class="chips" id="dr_v">' + [1, 2, 3, 4, 5].map(function (n) { return '<button data-a="drViv" data-v="' + n + '" class="' + (n === 3 ? 'on' : '') + '">' + n + '</button>'; }).join('') + '</div><label class="toggle"><input type="checkbox" id="dr_l"><span>Fue un sueño lúcido (supe que soñaba)</span></label><label class="toggle"><input type="checkbox" id="dr_r"><span>Es un sueño recurrente</span></label><button class="btn primary big" data-a="drSave">Guardar</button>');
  };
  A.drFeel = function (el) { DS.draft.feel = el.dataset.v; Array.prototype.forEach.call(document.querySelectorAll('#dr_f button'), function (b) { b.classList.toggle('on', b === el); }); };
  A.drViv = function (el) { DS.draft.viv = Number(el.dataset.v); Array.prototype.forEach.call(document.querySelectorAll('#dr_v button'), function (b) { b.classList.toggle('on', b === el); }); };
  A.drSave = function () {
    var text = ($('#dr_x').value || '').trim(); if (text.length < 8) { ARC.toast('Cuéntame un poco más'); return; }
    var now = Date.now(), e = { id: uid(), ts: now, date: ARC.dayKey(0), title: ($('#dr_t').value || '').trim(), text: text, feel: DS.draft.feel, viv: DS.draft.viv, lucid: $('#dr_l').checked, rec: $('#dr_r').checked, moon: moonBucket(now) };
    e.syms = detect((e.title + ' ' + text)); D.list.unshift(e); D.list = D.list.slice(0, 600); save(); ARC.progress.xp += 3; ARC.save('progress'); ARC.closeModal(); ARC.toast('Sueño guardado 🌙'); ARC.render(true); A.drOpen({ dataset: { id: e.id } });
  };
  A.drOpen = function (el) {
    var d = D.list.filter(function (x) { return x.id === el.dataset.id; })[0]; if (!d) return;
    ARC.openModal('<small class="gold">' + esc(d.date) + ' · luna ' + esc(d.moon || '') + (d.lucid ? ' · 💫 lúcido' : '') + (d.rec ? ' · 🔁 recurrente' : '') + '</small><h3>' + (d.feel || '🌙') + ' ' + esc(d.title || 'Sueño') + '</h3><p>' + esc(d.text).replace(/\n/g, '<br>') + '</p>' +
      (d.syms && d.syms.length ? '<div class="lbl">Símbolos que aparecen</div><div class="group">' + d.syms.map(function (i) { var s = DD.symbols[i]; return '<div class="grow"><span class="gi">' + s[1] + '</span><div><b>' + esc(s[0]) + '</b><small style="-webkit-line-clamp:5">' + esc(s[3]) + '</small></div></div>'; }).join('') + '</div>' : '<p class="hint">No he reconocido símbolos del diccionario; la mejor interpretación empieza por lo que sentiste.</p>') +
      '<div id="dr_ai"></div><button class="btn primary big" data-a="drAI" data-id="' + d.id + '">✨ Interpretar con Sibila</button><button class="btn ghost danger" data-a="drDel" data-id="' + d.id + '">Borrar</button><p class="fine">Los sueños se interpretan mejor desde tus asociaciones personales; esto es una guía simbólica, no una predicción.</p>');
  };
  A.drDel = function (el) { D.list = D.list.filter(function (x) { return x.id !== el.dataset.id; }); save(); ARC.closeModal(); ARC.render(true); };
  A.drAI = function (el) {
    var d = D.list.filter(function (x) { return x.id === el.dataset.id; })[0];
    ARC.ai.guard(function () {
      var box = $('#dr_ai'); if (box) box.innerHTML = '<div class="ai load"><div class="orb-s"></div><p>Sibila está leyendo tu sueño…</p></div>';
      var syms = (d.syms || []).map(function (i) { return DD.symbols[i][0] + ' (' + DD.symbols[i][3] + ')'; }).join('; ');
      ARC.ai.ask({ system: 'Eres una guía onírica sabia que escribe en español. Interpretas sueños desde la psicología simbólica (Jung, Gestalt) y el folclore, sin presentar predicciones ni certezas sobrenaturales, y animas a que la persona use sus propias asociaciones. ' + ARC.PERSONALIZE, messages: [{ role: 'user', content: 'CONTEXTO\n' + ARC.ctx() + '\n\nSUEÑO (' + d.date + ', luna ' + d.moon + ', emoción: ' + (d.feel || 'n/d') + ', intensidad ' + d.viv + '/5' + (d.lucid ? ', lúcido' : '') + (d.rec ? ', recurrente' : '') + '):\n' + d.text + '\n\nSímbolos detectados: ' + (syms || 'ninguno') + '\n\nOfrece: 1) lo que más destaca, 2) dos o tres lecturas posibles conectadas con la vida de la persona, 3) una pregunta para explorar y 4) una pequeña acción o práctica. Máx. 230 palabras.' }], max: 700 })
        .then(function (t) { var b = $('#dr_ai'); if (b) b.innerHTML = '<div class="ai">' + ARC.fmt(t) + '</div>'; })
        .catch(function (e) { var b = $('#dr_ai'); if (b) b.innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
    });
  };

  function symbolsHTML() {
    var q = ARC.norm(DS.q.trim()), list = DD.symbols.filter(function (s) { return !q || ARC.norm(s[0]).indexOf(q) > -1 || ARC.norm(s[3]).indexOf(q) > -1; });
    return '<div class="panel"><input id="dr_q" type="search" placeholder="Busca un símbolo: agua, serpiente, volar…" value="' + esc(DS.q) + '" autocomplete="off"></div><p class="hint c">' + list.length + ' de ' + DD.symbols.length + ' símbolos</p><div class="group">' + list.map(function (s) { return '<button class="grow" data-a="drSym" data-n="' + esc(s[0]) + '"><span class="gi">' + s[1] + '</span><div><b>' + esc(s[0]) + '</b><small>' + esc(s[3]) + '</small></div></button>'; }).join('') + '</div><p class="fine">Interpretaciones simbólicas desde la psicología y la tradición popular. Tu propio significado manda.</p>';
  }
  ARC.inputs.dr_q = function (v) { DS.q = v; clearTimeout(DS.t); DS.t = setTimeout(function () { ARC.render(true); var i = $('#dr_q'); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } }, 250); };
  A.drSym = function (el) { var s = DD.symbols.filter(function (x) { return x[0] === el.dataset.n; })[0]; ARC.openModal('<div class="det"><div class="bigemo">' + s[1] + '</div><h3>' + esc(s[0]) + '</h3><p>' + esc(s[3]) + '</p><p class="hint c">Pregúntate: ¿qué asocio yo con esto? ¿qué sentí en el sueño?</p></div>'); };

  function patternsHTML() {
    if (D.list.length < 3) return '<div class="empty"><div class="eb">📊</div><h3>Faltan datos</h3><p class="hint">Con tres o más sueños empiezo a mostrarte patrones: símbolos que se repiten, emociones y la relación con la Luna.</p></div>';
    var cnt = {}, feel = {}, moon = { nueva: 0, creciente: 0, llena: 0, menguante: 0 }, lucid = 0, viv = 0;
    D.list.forEach(function (d) { (d.syms || []).forEach(function (i) { cnt[i] = (cnt[i] || 0) + 1; }); if (d.feel) feel[d.feel] = (feel[d.feel] || 0) + 1; if (d.moon) moon[d.moon]++; if (d.lucid) lucid++; viv += d.viv || 0; });
    var top = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).slice(0, 6), mx = top.length ? cnt[top[0]] : 1, n = D.list.length;
    var topMoon = Object.keys(moon).sort(function (a, b) { return moon[b] - moon[a]; })[0];
    var h = '<div class="stats"><div class="stile"><b>' + n + '</b><small>sueños</small></div><div class="stile"><b>' + lucid + '</b><small>lúcidos</small></div><div class="stile"><b>' + (viv / n).toFixed(1) + '</b><small>intensidad media</small></div><div class="stile"><b>' + D.list.filter(function (d) { return d.rec; }).length + '</b><small>recurrentes</small></div></div>';
    if (top.length) h += '<div class="panel"><div class="lbl nm">Símbolos que más se repiten</div>' + top.map(function (i) { return '<div class="catrow"><span>' + DD.symbols[i][1] + ' ' + DD.symbols[i][0] + '</span><div class="cbar"><i style="width:' + cnt[i] / mx * 100 + '%"></i></div><b>' + cnt[i] + '×</b></div>'; }).join('') + '<p class="hint">Un símbolo recurrente suele señalar un tema vivo en tu vida. Pregúntate qué hay en común entre las veces que aparece.</p></div>';
    var fk = Object.keys(feel).sort(function (a, b) { return feel[b] - feel[a]; });
    if (fk.length) h += '<div class="panel"><div class="lbl nm">Emociones al despertar</div><p>' + fk.map(function (k) { return k + ' ' + feel[k]; }).join(' &nbsp; ') + '</p></div>';
    h += '<div class="panel"><div class="lbl nm">🌙 Luna y sueños</div><p class="hint">Sueños anotados por fase: nueva ' + moon.nueva + ' · creciente ' + moon.creciente + ' · llena ' + moon.llena + ' · menguante ' + moon.menguante + '.' + (n >= 12 ? ' Recuerdas más sueños en luna <b>' + topMoon + '</b>. Es una curiosidad: con pocos datos puede ser casualidad.' : ' Con unos 12 sueños la comparación empieza a tener sentido.') + '</p></div>';
    return h;
  }

  function lucidHTML() {
    return '<div class="panel"><div class="lbl nm">Tu intención de esta noche</div><input id="dr_int" placeholder="Esta noche me daré cuenta de que sueño…" value="' + esc(D.intent || '') + '"><button class="btn primary big" data-a="drPrep">🌙 Prepararme para soñar</button></div><div class="group">' + DD.lucid.map(function (l, i) { return '<div class="grow col"><div class="sr"><b>' + (i + 1) + '. ' + esc(l[0]) + '</b></div><small style="-webkit-line-clamp:6">' + esc(l[1]) + '</small></div>'; }).join('') + '</div><p class="fine">El sueño lúcido está estudiado por la psicología del sueño; no es peligroso en general, pero no sustituye al descanso.</p>';
  }
  ARC.inputs.dr_int = function (v) { D.intent = v; save(); };
  A.drPrep = function () { if (A.ritStart) A.ritStart({ dataset: { id: 'sueno' } }); };
})();
