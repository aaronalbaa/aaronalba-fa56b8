/* Estudio · Cursos a tu medida: los genera Sibila (IA) o se componen sin conexión con la enciclopedia. Cada lección trae test y suma XP. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, A = ARC.act, GR = ARC.grim;
  var C = ARC.store.get('arcana.courses', { list: [] });
  C.list = C.list || [];
  function save() { C.rev = Date.now(); ARC.store.set('arcana.courses', C); }
  var CS = { topic: '', level: 'principiante', n: 4, run: null };
  function uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4); }

  function listHTML() {
    var h = '<div class="panel"><div class="lbl nm">Crea un curso sobre lo que quieras</div><input id="cs_topic" placeholder="Ej.: la Luna en la magia, símbolos del tarot, plantas de protección…" value="' + esc(CS.topic) + '" maxlength="100"><div class="lbl">Nivel</div><div class="seg three">' + [['principiante', 'Principiante'], ['intermedio', 'Intermedio'], ['avanzado', 'Avanzado']].map(function (l) { return '<button data-a="csSet" data-f="level" data-v="' + l[0] + '" class="' + (CS.level === l[0] ? 'on' : '') + '">' + l[1] + '</button>'; }).join('') + '</div><div class="lbl">Lecciones</div><div class="seg three">' + [4, 6, 8].map(function (n) { return '<button data-a="csSet" data-f="n" data-v="' + n + '" class="' + (CS.n === n ? 'on' : '') + '">' + n + '</button>'; }).join('') + '</div><button class="btn primary big" data-a="csAI">✨ Que Sibila lo escriba</button><button class="btn ghost big" data-a="csOff">📖 Componerlo con la enciclopedia (sin conexión)</button></div>';
    if (!C.list.length) return h + '<p class="hint c">Tus cursos aparecerán aquí. Cada uno se genera distinto: nunca hay dos iguales.</p>';
    return h + '<div class="lbl pad">Mis cursos</div><div class="group">' + C.list.map(function (c) { var d = (c.done || []).length; return '<button class="grow" data-a="csOpen" data-id="' + c.id + '"><span class="gi">' + (c.e || '🎓') + '</span><div><b>' + esc(c.title) + '</b><small>' + esc(c.level) + ' · ' + d + '/' + c.lessons.length + ' lecciones' + (c.src === 'ai' ? ' · IA' : '') + '</small></div>' + (d === c.lessons.length ? '<span class="chk done2">✓</span>' : '<i class="chev">›</i>') + '</button>'; }).join('') + '</div>';
  }
  ARC.inputs.cs_topic = function (v) { CS.topic = v; };
  A.csSet = function (el) { CS.topic = ($('#cs_topic') || {}).value || CS.topic; var f = el.dataset.f; CS[f] = f === 'n' ? Number(el.dataset.v) : el.dataset.v; ARC.render(true); };

  /* ---------- generación ---------- */
  A.csAI = function () {
    CS.topic = ($('#cs_topic') || {}).value || CS.topic; var topic = CS.topic.trim(); if (topic.length < 3) { ARC.toast('Escribe un tema'); return; }
    ARC.ai.guard(function () {
      ARC.openModal('<div class="det"><div class="orb-s"></div><h3>Sibila prepara tu curso…</h3><p class="hint c">Puede tardar unos segundos</p></div>');
      var sys = 'Eres una maestra de esoterismo, simbolismo y desarrollo personal que escribe cursos claros en español. Respondes SOLO con JSON válido. Presenta el esoterismo como tradición, historia y práctica simbólica, sin afirmar poderes comprobados ni dar consejos médicos o financieros; nunca incluyas daño a otras personas.';
      var user = 'Crea un curso de nivel ' + CS.level + ' sobre: «' + topic + '» con ' + CS.n + ' lecciones. Contexto de la persona (personaliza ejemplos si ayuda):\n' + ARC.ctx().slice(0, 1200) + '\n\nFormato exacto: {"title":"","emoji":"","summary":"una frase","lessons":[{"t":"título","text":"explicación de 110-170 palabras, clara y con un ejemplo","key":["idea clave 1","idea clave 2","idea clave 3"],"quiz":[{"q":"pregunta","options":["a","b","c","d"],"answer":0,"why":"explicación breve"}]}]} con exactamente 3 preguntas por lección (answer = índice 0-3 de la opción correcta, distribuye las respuestas correctas).';
      ARC.ai.ask({ system: sys, messages: [{ role: 'user', content: user }], max: 3600 }).then(function (t) {
        var m = /\{[\s\S]*\}/.exec(t), d = JSON.parse(m ? m[0] : t); if (!d.lessons || d.lessons.length < 2) throw new Error('formato');
        var lessons = d.lessons.slice(0, 10).map(function (l) {
          var qz = (l.quiz || []).filter(function (q) { return q.q && Array.isArray(q.options) && q.options.length === 4 && q.answer >= 0 && q.answer < 4; }).map(function (q) { return { q: String(q.q), opts: q.options.map(String), a: q.answer, why: String(q.why || '') }; });
          return { t: String(l.t || 'Lección').slice(0, 90), text: String(l.text || '').slice(0, 1600), key: (l.key || []).slice(0, 5).map(String), quiz: qz };
        }).filter(function (l) { return l.text; });
        if (lessons.length < 2) throw new Error('formato');
        var c = { id: uid(), title: String(d.title || topic).slice(0, 90), e: String(d.emoji || '🎓').slice(0, 4), summary: String(d.summary || ''), level: CS.level, src: 'ai', lessons: lessons, done: [], ts: Date.now() };
        C.list.unshift(c); C.list = C.list.slice(0, 40); save(); ARC.closeModal(); ARC.render(true); A.csOpen({ dataset: { id: c.id } });
      }).catch(function (e) { ARC.openModal('<div class="det"><h3>No he podido generarlo</h3><p class="hint c">' + esc(e.message === 'formato' ? 'La respuesta no tuvo el formato esperado. Inténtalo otra vez o usa la versión sin conexión.' : e.message) + '</p><button class="btn primary big" data-a="csOff">Componerlo sin conexión</button></div>'); });
    });
  };
  A.csOff = function () {
    CS.topic = ($('#cs_topic') || {}).value || CS.topic; var topic = CS.topic.trim(); ARC.closeModal();
    var words = ARC.norm(topic).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; }), pool = GR.all.filter(function (e) { return !GR.cats[e.cat].dark; });
    var scored = pool.map(function (e) { var hay = ARC.norm(e.n + ' ' + e.s + ' ' + e.t.join(' ') + ' ' + (GR.cats[e.cat].name)); var s = 0; words.forEach(function (w) { if (hay.indexOf(w) > -1) s += (ARC.norm(e.n).indexOf(w) > -1 ? 3 : 1); }); return [s, e]; }).filter(function (x) { return x[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; });
    var take = scored.slice(0, 14), picked = [];
    if (take.length < 3) { var all = pool.slice(); ARC.shuffle(all.length).slice(0, CS.n).forEach(function (i) { picked.push(all[i]); }); }
    else ARC.shuffle(take.length).slice(0, CS.n).forEach(function (i) { picked.push(take[i][1]); });
    var lessons = picked.map(function (e) {
      var qz = GR.quiz(e, 3);
      return { t: e.n, text: e.s + '\n\n' + (e.l || ''), key: e.f.slice(0, 3).map(function (kv) { return (kv[0] ? kv[0] + ': ' : '') + kv[1]; }), quiz: qz.map(function (q) { return { q: q.q, opts: q.opts, a: q.a, why: q.why || '' }; }), cat: e.cat };
    });
    var c = { id: uid(), title: topic ? 'Curso exprés: ' + topic : 'Curso exprés al azar', e: '📖', summary: 'Compuesto con la enciclopedia de Arcana', level: CS.level, src: 'off', lessons: lessons, done: [], ts: Date.now() };
    C.list.unshift(c); C.list = C.list.slice(0, 40); save(); ARC.render(true); A.csOpen({ dataset: { id: c.id } });
  };

  /* ---------- ejecutor ---------- */
  function get(id) { return C.list.filter(function (c) { return c.id === id; })[0]; }
  A.csOpen = function (el) {
    var c = get(el.dataset.id); if (!c) return;
    ARC.openModal('<div class="det"><div class="bigemo">' + (c.e || '🎓') + '</div><h3>' + esc(c.title) + '</h3><p class="hint c">' + esc(c.summary || '') + '</p><div class="group">' + c.lessons.map(function (l, i) { var d = (c.done || []).indexOf(i) > -1; return '<button class="grow' + (d ? ' done' : '') + '" data-a="csLesson" data-id="' + c.id + '" data-i="' + i + '"><div><b>' + (i + 1) + '. ' + esc(l.t) + '</b><small>' + (l.quiz.length ? l.quiz.length + ' preguntas' : 'lectura') + '</small></div><span class="chk">' + (d ? '✓' : '') + '</span></button>'; }).join('') + '</div><button class="btn ghost danger" data-a="csDel" data-id="' + c.id + '">Borrar curso</button></div>');
  };
  A.csDel = function (el) { C.list = C.list.filter(function (c) { return c.id !== el.dataset.id; }); save(); ARC.closeModal(); ARC.render(true); };
  A.csLesson = function (el) {
    var c = get(el.dataset.id), i = Number(el.dataset.i), l = c.lessons[i]; CS.run = { c: c, i: i, q: 0, ok: 0, sel: null, phase: 'read' };
    ARC.openModal('<small class="gold">' + esc(c.title) + ' · lección ' + (i + 1) + ' de ' + c.lessons.length + '</small><h3>' + esc(l.t) + '</h3>' + l.text.split(/\n+/).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + (l.key.length ? '<div class="lbl">Ideas clave</div><ul class="keys">' + l.key.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul>' : '') + (l.quiz.length ? '<button class="btn primary big" data-a="csQuiz">Hacer el test →</button>' : '<button class="btn primary big" data-a="csFinish">Marcar como leída</button>'));
  };
  function qRender() {
    var r = CS.run, l = r.c.lessons[r.i], q = l.quiz[r.q];
    ARC.openModal('<small class="gold">Test · ' + (r.q + 1) + ' de ' + l.quiz.length + '</small><h3>' + esc(q.q) + '</h3><div class="opts">' + q.opts.map(function (o, k) { var cls = 'opt'; if (r.sel !== null) { if (k === q.a) cls += ' ok'; else if (k === r.sel) cls += ' bad'; } return '<button class="' + cls + '" data-a="csOpt" data-i="' + k + '"' + (r.sel !== null ? ' disabled' : '') + '>' + esc(o) + '</button>'; }).join('') + '</div>' + (r.sel !== null ? '<div class="fb ' + (r.sel === q.a ? 'ok' : 'bad') + '"><b>' + (r.sel === q.a ? '¡Correcto! ✨' : 'No era esa 🌙') + '</b><span>' + esc(q.why || '') + '</span></div><button class="btn primary big" data-a="csNext">' + (r.q + 1 < l.quiz.length ? 'Continuar' : 'Terminar lección') + '</button>' : ''));
  }
  A.csQuiz = function () { CS.run.phase = 'quiz'; qRender(); };
  A.csOpt = function (el) { var r = CS.run; r.sel = Number(el.dataset.i); if (r.sel === r.c.lessons[r.i].quiz[r.q].a) r.ok++; qRender(); };
  A.csNext = function () { var r = CS.run; r.q++; r.sel = null; if (r.q < r.c.lessons[r.i].quiz.length) qRender(); else A.csFinish(); };
  A.csFinish = function () {
    var r = CS.run, c = r.c; c.done = c.done || []; var first = c.done.indexOf(r.i) < 0; if (first) { c.done.push(r.i); ARC.progress.xp += 6 + r.ok * 2; ARC.save('progress'); }
    var all = c.done.length === c.lessons.length; save();
    ARC.openModal('<div class="det"><div class="bigemo">' + (all ? '🏆' : '✨') + '</div><h3>' + (all ? '¡Curso completado!' : 'Lección terminada') + '</h3><p class="hint c">' + (r.phase === 'quiz' ? r.ok + ' de ' + c.lessons[r.i].quiz.length + ' correctas · ' : '') + (first ? '+' + (6 + r.ok * 2) + ' XP' : 'ya completada') + '</p><button class="btn primary big" data-a="csOpen" data-id="' + c.id + '">Volver al curso</button></div>'); ARC.render(true);
  };

  ARC.regSub('study', 'mis-cursos', '🪄', 'Cursos a tu medida', listHTML);
  ARC.courses = { data: function () { return C; } };
})();
