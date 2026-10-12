/* Biblioteca: estantería, lector paginado (EPUB/PDF/TXT/HTML), subrayados y notas, tests de comprensión, estadísticas, libros físicos y colección. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, P = ARC.profile, A = ARC.act, LP = ARC.lp;
  var L = ARC.store.get('arcana.lib', { books: [], hl: [], log: [], quiz: {}, set: { size: 19, theme: 'night', font: 'serif' }, goal: 20 });
  L.set = L.set || { size: 19, theme: 'night', font: 'serif' }; L.goal = L.goal || 20; L.quiz = L.quiz || {}; L.hl = L.hl || []; L.log = L.log || [];
  function saveL() { L.rev = Date.now(); ARC.store.set('arcana.lib', L); }
  ARC.lib = { data: function () { return L; }, save: saveL, finished: function () { return L.books.filter(function (b) { return b.status === 'read'; }).length; } };
  var LV = { tab: 'estante' };
  function book(id) { return L.books.filter(function (b) { return b.id === id; })[0]; }
  function uid() { return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function hue(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }
  function pct(b) { if (b.fmt === 'physical') return b.pages ? Math.min(100, Math.round((b.cur || 0) / b.pages * 100)) : 0; if (b.status === 'read') return 100; var n = b.nch || 1, d = (b.done || []).length, f = b.pos ? b.pos.frac || 0 : 0; return Math.min(99, Math.round(((b.pos ? b.pos.ch : 0) + f) / n * 100) || Math.round(d / n * 100)); }
  function cover(b, cls) {
    var h = hue(b.title + (b.author || '')), t = b.title.length > 42 ? b.title.slice(0, 40) + '…' : b.title;
    return '<div class="cov ' + (cls || '') + '" style="--h:' + h + '"><span class="cg">' + (b.fmt === 'physical' ? '📕' : '✦') + '</span><b>' + esc(t) + '</b><small>' + esc(b.author || '') + '</small></div>';
  }
  function stars(n) { var s = ''; for (var i = 1; i <= 5; i++) s += '<span class="' + (i <= (n || 0) ? 'on' : '') + '">★</span>'; return s; }

  /* ---------- estadísticas ---------- */
  function stats() {
    var tot = 0, words = 0, days = {}, wpmW = 0, wpmS = 0;
    L.log.forEach(function (e) { tot += e.sec || 0; words += e.words || 0; days[e.d] = (days[e.d] || 0) + (e.sec || 0); if (e.sec >= 30 && e.words > 0 && e.words / (e.sec / 60) < 1000) { wpmW += e.words; wpmS += e.sec; } });
    L.books.forEach(function (b) { if (b.fmt === 'physical') (b.sessions || []).forEach(function (s) { tot += (s.min || 0) * 60; days[s.d] = (days[s.d] || 0) + (s.min || 0) * 60; }); });
    var wpm = wpmS > 120 ? Math.round(wpmW / (wpmS / 60)) : 0, qs = [], bookmap = L.quiz;
    Object.keys(bookmap).forEach(function (k) { Object.keys(bookmap[k]).forEach(function (c) { qs.push(bookmap[k][c]); }); });
    qs.sort(function (a, b) { return b.ts - a.ts; });
    var rec = qs.slice(0, 20), comp = rec.length ? Math.round(rec.reduce(function (a, q) { return a + q.score / q.total; }, 0) / rec.length * 100) : null;
    var streak = 0; for (var i = 0; i < 400; i++) { if (days[ARC.dayKey(-i)] > 60) streak++; else if (i > 0) break; }
    return { tot: tot, words: words, wpm: wpm, comp: comp, streak: streak, days: days, nq: qs.length };
  }
  function wpmLabel(w) { return w ? (w < 150 ? 'Lector pausado: saboreas cada línea' : w < 260 ? 'Ritmo promedio de lectura' : w < 400 ? 'Lector ágil' : 'Lectura muy veloz') : 'Lee unos minutos para medir tu ritmo'; }

  /* ---------- vistas ---------- */
  ARC.views.library = function () {
    var seg = [['estante', '📚 Estante'], ['descubrir', '🧭 Descubrir'], ['stats', '📈 Progreso']];
    if (ARC.social) seg.push(['amigos', '👥 Amigos']);
    var h = '<section class="page lib"><header class="hero small"><h1>Biblioteca <span>📖</span></h1><p>Tus libros, tus notas y lo que de verdad retienes</p></header>' +
      '<div class="chips sub">' + seg.map(function (s) { return '<button data-a="libTab" data-v="' + s[0] + '" class="' + (LV.tab === s[0] ? 'on' : '') + '">' + s[1] + '</button>'; }).join('') + '</div>';
    if (LV.tab === 'descubrir') h += discoverHTML(); else if (LV.tab === 'stats') h += statsHTML(); else if (LV.tab === 'amigos' && ARC.social) h += ARC.social.html(); else h += shelfHTML();
    return h + '</section>';
  };
  A.libTab = function (el) { LV.tab = el.dataset.v; if (LV.tab === 'amigos' && ARC.social && ARC.social.refresh) ARC.social.refresh(); ARC.render(); };
  ARC.changes.libfile = function (v, el) { importFiles(Array.prototype.slice.call(el.files)); el.value = ''; };

  function shelfHTML() {
    var h = '<div class="lib-add"><label class="btn primary"><input type="file" id="libfile" accept=".epub,.pdf,.txt,.md,.html,.htm,.xhtml,application/epub+zip,application/pdf,text/plain" multiple hidden>＋ Añadir libro</label><button class="btn ghost" data-a="bkPhys">📕 Libro físico</button></div>';
    if (!L.books.length) return h + '<div class="empty"><div class="eb">📖</div><h3>Tu estantería está vacía</h3><p class="hint">Añade un EPUB, PDF o texto de tu dispositivo, o registra un libro de papel. En <b>Descubrir</b> tienes clásicos de dominio público para empezar.</p></div>' + '<p class="fine">Tus libros se guardan solo en este dispositivo.</p>';
    var cur = L.books.filter(function (b) { return b.fmt !== 'physical' && b.status !== 'read' && b.lastOpen; }).sort(function (a, b) { return b.lastOpen - a.lastOpen; })[0];
    if (cur) h += '<button class="resume" data-a="bkRead" data-id="' + cur.id + '">' + cover(cur, 'sm') + '<div><small>Continuar leyendo</small><b>' + esc(cur.title) + '</b><div class="pbar"><i style="width:' + pct(cur) + '%"></i></div><small>' + pct(cur) + ' % · capítulo ' + ((cur.pos ? cur.pos.ch : 0) + 1) + ' de ' + cur.nch + '</small></div></button>';
    var groups = [['Leyendo', function (b) { return b.status !== 'read' && (b.lastOpen || b.fmt === 'physical' && (b.cur || 0) > 0); }], ['Por leer', function (b) { return b.status !== 'read' && !(b.lastOpen || b.fmt === 'physical' && (b.cur || 0) > 0); }], ['Colección · leídos', function (b) { return b.status === 'read'; }]];
    groups.forEach(function (g) {
      var list = L.books.filter(g[1]); if (!list.length) return;
      h += '<div class="lbl pad">' + g[0] + ' <em>' + list.length + '</em></div><div class="shelf">' + list.map(function (b) { return '<button class="bk" data-a="bkOpen" data-id="' + b.id + '">' + cover(b) + (b.status === 'read' ? '<i class="seal">✓</i>' : '<div class="pbar"><i style="width:' + pct(b) + '%"></i></div>') + '</button>'; }).join('') + '</div>';
    });
    return h;
  }

  var PD = [
    ['El Kybalión', 'Tres Iniciados · 1908', 'Los siete principios herméticos', 'kybalion'], ['The Pictorial Key to the Tarot', 'A. E. Waite · 1911', 'La referencia clásica de los arcanos', 'pictorial key tarot'],
    ['Transcendental Magic', 'Éliphas Lévi (trad. Waite) · 1896', 'Doctrina y ritual de la alta magia', 'transcendental magic levi'], ['The Key of Solomon the King', 'S. L. M. Mathers · 1889', 'El grimorio más célebre', 'key of solomon'],
    ['Three Books of Occult Philosophy', 'Agrippa · s. XVI', 'Magia natural, celeste y ceremonial', 'agrippa occult philosophy'], ['The Sacred Magic of Abramelin the Mage', 'Mathers · 1900', 'El ciclo de seis meses', 'abramelin'],
    ['Thrice-Greatest Hermes', 'G. R. S. Mead · 1906', 'Corpus Hermeticum y fragmentos', 'thrice greatest hermes'], ['Isis sin velo / Isis Unveiled', 'H. P. Blavatsky · 1877', 'Ciencia y religión antiguas', 'isis unveiled'],
    ['The Secret Doctrine', 'H. P. Blavatsky · 1888', 'Cosmogénesis y antropogénesis', 'secret doctrine blavatsky'], ['Sefer Yetzirah', 'Westcott · 1887', 'El Libro de la Formación', 'sefer yetzirah'],
    ['El libro de Enoc', 'R. H. Charles · 1917', 'Ángeles, vigilantes y apocalíptica', 'book of enoch charles'], ['El libro egipcio de los muertos', 'E. A. W. Budge · 1895', 'Papiro de Ani', 'egyptian book of the dead budge'],
    ['La rama dorada', 'J. G. Frazer · 1890', 'Magia, mito y religión comparada', 'golden bough frazer'], ['La interpretación de los sueños', 'S. Freud · 1899', 'La obra fundacional del análisis onírico', 'interpretation of dreams freud'],
    ['Las variedades de la experiencia religiosa', 'W. James · 1902', 'Psicología del misticismo', 'varieties of religious experience'], ['Tao Te Ching', 'Lao Tse', 'El camino y su virtud', 'tao te ching'],
    ['Bhagavad Gita', 'Anónimo', 'Diálogo de Krishna y Arjuna', 'bhagavad gita'], ['Meditaciones', 'Marco Aurelio', 'Estoicismo vivido', 'meditations marcus aurelius'],
    ['Drácula', 'Bram Stoker · 1897', 'Gótico y folclore vampírico', 'dracula stoker'], ['Frankenstein', 'Mary Shelley · 1818', 'Ciencia, creación y sombra', 'frankenstein shelley'], ['Cuentos de Poe', 'E. A. Poe', 'Lo macabro como arte', 'poe tales'], ['La Divina Comedia', 'Dante', 'Infierno, Purgatorio y Paraíso', 'divine comedy dante']
  ];
  function discoverHTML() {
    return '<p class="hint c">Clásicos de dominio público. Pulsa para buscarlos y descargar el EPUB o PDF; luego añádelo con <b>＋ Añadir libro</b>.</p><div class="group">' + PD.map(function (p) {
      var q = encodeURIComponent(p[3]);
      return '<div class="grow pd"><span class="gi">📜</span><div><b>' + esc(p[0]) + '</b><small>' + esc(p[1]) + ' · ' + esc(p[2]) + '</small><span class="lk"><a href="https://www.gutenberg.org/ebooks/search/?query=' + q + '" target="_blank" rel="noopener">Gutenberg</a><a href="https://archive.org/search?query=' + q + '" target="_blank" rel="noopener">Archive.org</a></span></div></div>';
    }).join('') + '</div><p class="fine">Los enlaces abren búsquedas en Project Gutenberg y Internet Archive; la disponibilidad y los idiomas dependen de cada sitio. Comprueba que la obra esté libre de derechos en tu país.</p>';
  }
  function statsHTML() {
    var s = stats(), read = L.books.filter(function (b) { return b.status === 'read'; }), today = Math.round((s.days[ARC.dayKey(0)] || 0) / 60), bars = '', mx = 1;
    for (var i = 13; i >= 0; i--) mx = Math.max(mx, (s.days[ARC.dayKey(-i)] || 0) / 60);
    for (var j = 13; j >= 0; j--) { var m = (s.days[ARC.dayKey(-j)] || 0) / 60; bars += '<i style="height:' + Math.max(3, m / mx * 100) + '%" title="' + Math.round(m) + ' min"></i>'; }
    var h = '<div class="stats"><div class="stile"><b>' + read.length + '</b><small>libros leídos</small></div><div class="stile"><b>' + (Math.round(s.tot / 360) / 10) + ' h</b><small>de lectura</small></div><div class="stile"><b>' + (s.wpm || '—') + '</b><small>palabras / min</small></div><div class="stile"><b>' + (s.comp === null ? '—' : s.comp + ' %') + '</b><small>comprensión</small></div></div>' +
      '<div class="panel"><div class="lbl nm">Tu ritmo</div><p>' + wpmLabel(s.wpm) + '.' + (s.wpm ? ' Un libro de 80.000 palabras te llevaría unas <b>' + Math.round(80000 / s.wpm / 60 * 10) / 10 + ' horas</b>.' : '') + '</p><div class="lbl nm">Últimos 14 días</div><div class="bars">' + bars + '</div><p class="hint">Hoy: ' + today + ' de ' + L.goal + ' min · racha de ' + s.streak + (s.streak === 1 ? ' día' : ' días') + '</p>' +
      '<div class="goalrow"><span>Objetivo diario</span><div class="chips">' + [10, 20, 30, 60].map(function (m) { return '<button data-a="libGoal" data-v="' + m + '" class="' + (L.goal === m ? 'on' : '') + '">' + m + ' min</button>'; }).join('') + '</div></div></div>';
    if (s.nq) h += '<div class="panel"><div class="lbl nm">Comprensión lectora</div><p class="hint">Basada en tus ' + s.nq + ' tests de capítulos. Si fallas, la app te lleva a releer el fragmento exacto.</p></div>';
    if (read.length) h += '<div class="lbl pad">Tu colección</div><div class="shelf">' + read.map(function (b) { return '<button class="bk" data-a="bkOpen" data-id="' + b.id + '">' + cover(b) + '<i class="seal">✓</i><div class="stars">' + stars(b.rating) + '</div></button>'; }).join('') + '</div>';
    return h;
  }
  A.libGoal = function (el) { L.goal = Number(el.dataset.v); saveL(); ARC.render(true); };

  /* ---------- importar ---------- */
  function importFiles(files) {
    if (!files.length) return;
    var i = 0, ok = 0;
    ARC.openModal('<div class="det"><h3>Importando…</h3><p class="hint c" id="impmsg">Preparando</p><div class="pbar"><i id="impbar" style="width:5%"></i></div></div>');
    function next() {
      if (i >= files.length) { ARC.closeModal(); if (ok) { ARC.toast(ok + (ok === 1 ? ' libro añadido 📚' : ' libros añadidos 📚')); LV.tab = 'estante'; ARC.render(); } return; }
      var f = files[i++], msg = $('#impmsg'); if (msg) msg.textContent = f.name;
      LP.parseFile(f, function (n, t) { var b = $('#impbar'); if (b) b.style.width = Math.round(n / t * 100) + '%'; }).then(function (r) {
        var chs = r.chapters.filter(function (c) { return c.w > 0 || /<img/.test(c.h); });
        if (!chs.length) throw new Error('No se encontró texto en el archivo');
        var words = chs.reduce(function (a, c) { return a + c.w; }, 0), id = uid();
        var dup = L.books.filter(function (b) { return b.title === r.title && b.words === words; })[0]; if (dup) { ARC.toast('«' + r.title + '» ya está en tu estantería'); return; }
        return LP.put({ id: id, file: f, chapters: chs }).then(function () { L.books.unshift({ id: id, title: r.title, author: r.author, fmt: r.fmt, added: Date.now(), words: words, nch: chs.length, pos: { ch: 0, frac: 0 }, status: 'new', done: [] }); saveL(); ok++; });
      }).catch(function (e) { ARC.toast('No se pudo abrir ' + f.name + ': ' + e.message); }).then(next);
    }
    next();
  }

  /* ---------- ficha del libro ---------- */
  A.bkOpen = function (el) {
    var b = book(el.dataset.id); if (!b) return;
    var nh = L.hl.filter(function (h) { return h.book === b.id; }).length, q = L.quiz[b.id] || {}, qn = Object.keys(q).length;
    var h = '<div class="det bkd">' + cover(b, 'lg') + '<h3>' + esc(b.title) + '</h3><p class="hint c">' + esc(b.author || 'Autor desconocido') + (b.fmt === 'physical' ? ' · libro físico' : ' · ' + b.fmt.toUpperCase() + ' · ' + Math.round(b.words / 1000) + ' k palabras') + '</p><div class="pbar"><i style="width:' + pct(b) + '%"></i></div><p class="hint c">' + pct(b) + ' %' + (b.status === 'read' ? ' · leído ✓' : '') + (qn ? ' · ' + qn + ' tests hechos' : '') + (nh ? ' · ' + nh + ' subrayados' : '') + '</p>';
    if (b.status === 'read') h += '<div class="stars big">' + [1, 2, 3, 4, 5].map(function (i) { return '<button data-a="bkRate" data-id="' + b.id + '" data-v="' + i + '" class="' + (i <= (b.rating || 0) ? 'on' : '') + '">★</button>'; }).join('') + '</div>';
    if (b.fmt === 'physical') {
      h += '<div class="lbl">Tu página</div><div class="phys"><button class="btn ghost" data-a="bkPage" data-id="' + b.id + '" data-v="-10">−10</button><b>' + (b.cur || 0) + ' / ' + (b.pages || '?') + '</b><button class="btn ghost" data-a="bkPage" data-id="' + b.id + '" data-v="10">+10</button></div><button class="btn primary big" data-a="bkSession" data-id="' + b.id + '">⏱️ Anotar una sesión de lectura</button><button class="btn ghost big" data-a="bkTestText" data-id="' + b.id + '">🧠 Test con mis apuntes o un fragmento</button>';
    } else {
      h += '<button class="btn primary big" data-a="bkRead" data-id="' + b.id + '">' + (b.lastOpen ? 'Continuar leyendo' : 'Empezar a leer') + '</button><button class="btn ghost big" data-a="bkQuizMenu" data-id="' + b.id + '">🧠 Test del libro</button>' + (nh ? '<button class="btn ghost big" data-a="bkNotes" data-id="' + b.id + '">📝 Mis apuntes y subrayados</button>' : '');
    }
    h += '<div class="row2">' + (b.fmt !== 'physical' ? '<button class="btn ghost" data-a="bkShare" data-id="' + b.id + '">🎁 Compartir</button>' : '') + (b.status !== 'read' ? '<button class="btn ghost" data-a="bkFinish" data-id="' + b.id + '">✓ Marcar leído</button>' : '<button class="btn ghost" data-a="bkFinish" data-id="' + b.id + '" data-v="0">↩︎ Marcar sin leer</button>') + '<button class="btn ghost danger" data-a="bkDel" data-id="' + b.id + '">🗑️</button></div></div>';
    ARC.openModal(h);
  };
  A.bkRate = function (el) { var b = book(el.dataset.id); b.rating = Number(el.dataset.v); saveL(); A.bkOpen({ dataset: { id: b.id } }); };
  A.bkFinish = function (el) { var b = book(el.dataset.id); if (el.dataset.v === '0') { b.status = 'new'; } else { b.status = 'read'; b.finished = Date.now(); ARC.progress.xp += 25; ARC.save('progress'); ARC.toast('Libro añadido a tu colección ✓'); } saveL(); ARC.closeModal(); ARC.render(true); };
  A.bkDel = function (el) {
    var b = book(el.dataset.id);
    ARC.openModal('<div class="det"><h3>¿Quitar «' + esc(b.title) + '»?</h3><p class="hint c">Se borrarán el archivo, tus subrayados y tus tests de este dispositivo.</p><button class="btn primary big danger" data-a="bkDelYes" data-id="' + b.id + '">Sí, quitar</button><button class="btn link" data-a="close">Cancelar</button></div>');
  };
  A.bkDelYes = function (el) {
    var id = el.dataset.id; L.books = L.books.filter(function (b) { return b.id !== id; }); L.hl = L.hl.filter(function (h) { return h.book !== id; }); delete L.quiz[id]; saveL(); LP.del(id).catch(function () { }); ARC.closeModal(); ARC.render(true);
  };
  A.bkShare = function (el) { var b = book(el.dataset.id); if (ARC.social && ARC.social.giftModal(b)) return; A.bkShareFile(el); };
  A.bkShareFile = function (el) {
    var b = book(el.dataset.id);
    LP.get(b.id).then(function (rec) {
      var f = rec.file, file = new File([f], f.name || b.title + '.' + b.fmt, { type: f.type || 'application/octet-stream' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file], title: b.title, text: 'Te regalo «' + b.title + '» 📖' }).catch(function () { });
      var a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); ARC.toast('Archivo descargado: envíaselo a quien quieras');
    });
  };

  /* ---------- libros físicos ---------- */
  A.bkPhys = function () {
    ARC.openModal('<h3>📕 Registrar un libro físico</h3><div class="lbl">Título</div><input id="pb_t" placeholder="Título"><div class="lbl">Autor</div><input id="pb_a" placeholder="Autor (opcional)"><div class="row2"><div><div class="lbl">Páginas</div><input id="pb_p" type="number" inputmode="numeric" min="1" placeholder="320"></div><div><div class="lbl">Voy por la página</div><input id="pb_c" type="number" inputmode="numeric" min="0" placeholder="0"></div></div><button class="btn primary big" data-a="bkPhysSave">Guardar</button>');
  };
  A.bkPhysSave = function () {
    var t = ($('#pb_t').value || '').trim(); if (!t) { ARC.toast('Escribe el título'); return; }
    var pg = Number($('#pb_p').value) || 0, cu = Math.min(Number($('#pb_c').value) || 0, pg || 99999);
    L.books.unshift({ id: uid(), title: t, author: ($('#pb_a').value || '').trim(), fmt: 'physical', added: Date.now(), words: 0, nch: 1, pages: pg, cur: cu, status: 'new', done: [], sessions: [], lastOpen: cu ? Date.now() : 0 });
    saveL(); ARC.closeModal(); ARC.toast('Libro registrado 📕'); ARC.render(true);
  };
  A.bkPage = function (el) { var b = book(el.dataset.id); b.cur = Math.max(0, Math.min(b.pages || 99999, (b.cur || 0) + Number(el.dataset.v))); b.lastOpen = Date.now(); if (b.pages && b.cur >= b.pages) b.status = 'read'; saveL(); A.bkOpen(el); ARC.render(true); };
  A.bkSession = function (el) {
    var id = el.dataset.id;
    ARC.openModal('<h3>⏱️ Sesión de lectura</h3><div class="row2"><div><div class="lbl">Minutos</div><input id="ps_m" type="number" inputmode="numeric" placeholder="25"></div><div><div class="lbl">Páginas leídas</div><input id="ps_p" type="number" inputmode="numeric" placeholder="12"></div></div><button class="btn primary big" data-a="bkSessionSave" data-id="' + id + '">Guardar</button>');
  };
  A.bkSessionSave = function (el) {
    var b = book(el.dataset.id), m = Number($('#ps_m').value) || 0, p = Number($('#ps_p').value) || 0; if (!m && !p) { ARC.toast('Indica minutos o páginas'); return; }
    b.sessions = b.sessions || []; b.sessions.push({ d: ARC.dayKey(0), min: m, pages: p }); b.cur = (b.cur || 0) + p; if (b.pages) b.cur = Math.min(b.cur, b.pages); b.lastOpen = Date.now();
    if (m && p) L.log.push({ d: ARC.dayKey(0), sec: 0, words: 0, book: b.id, phys: 1 });
    saveL(); ARC.closeModal(); ARC.toast('Sesión anotada ✓'); ARC.render(true);
  };
  A.bkTestText = function (el) {
    ARC.openModal('<h3>🧠 Test de comprensión</h3><p class="hint">Pega un fragmento del libro o tus propios apuntes de lo que has leído, y te haré preguntas.</p><textarea id="tt_txt" rows="8" placeholder="Pega aquí el texto…"></textarea><button class="btn primary big" data-a="bkTestTextGo" data-id="' + el.dataset.id + '">Crear test</button>');
  };
  A.bkTestTextGo = function (el) {
    var t = ($('#tt_txt').value || '').trim(); if (t.split(/\s+/).length < 60) { ARC.toast('Pega al menos unas 60 palabras'); return; }
    quizMenu({ book: el.dataset.id, ch: -1, text: t });
  };

  /* ---------- quiz ---------- */
  var QZ = null;
  A.bkQuizMenu = function (el) {
    var b = book(el.dataset.id);
    LP.get(b.id).then(function (rec) {
      var txt = rec.chapters.map(function (c) { return LP.textOf(c.h); });
      // trozos de varios capítulos
      var pick = ARC.shuffle(rec.chapters.length).slice(0, Math.min(3, rec.chapters.length)).map(function (i) { return { i: i, t: txt[i] }; });
      quizMenu({ book: b.id, ch: -1, text: pick.map(function (p) { return p.t.slice(0, 3500); }).join('\n'), whole: true, rec: rec });
    });
  };
  function quizMenu(ctx) {
    QZ = { ctx: ctx, qs: [], i: 0, score: 0, fails: [] };
    ARC.openModal('<div class="det"><h3>🧠 ¿Cuánto has retenido?</h3><p class="hint c">Elige cómo quieres el test. Si fallas, te llevaré al fragmento exacto para releerlo.</p><button class="btn primary big" data-a="qzGo" data-v="off">⚡ Test rápido (sin conexión)</button><button class="btn ghost big" data-a="qzGo" data-v="ai">✨ Test de comprensión con Sibila</button><p class="hint c">El de Sibila envía un extracto al proveedor de IA que hayas elegido.</p></div>');
  }
  A.qzGo = function (el) {
    var ctx = QZ.ctx, mode = el.dataset.v, n = 6;
    function offline() { var qs = LP.cloze(ctx.text, n); if (qs.length < 3) { ARC.openModal('<div class="det"><h3>Texto demasiado corto</h3><p class="hint c">Necesito más texto para preparar el test.</p></div>'); return; } startQuiz(qs); }
    if (mode === 'off') { offline(); return; }
    ARC.ai.guard(function () {
      ARC.openModal('<div class="det"><div class="orb-s"></div><h3>Sibila prepara tu test…</h3><p class="hint c">Leyendo el texto con atención</p></div>');
      var text = ctx.text.length > 11000 ? ctx.text.slice(0, 11000) : ctx.text;
      var sys = 'Eres un tutor de comprensión lectora. Respondes SOLO con JSON válido, sin texto adicional ni bloques de código.';
      var user = 'Texto:\n"""\n' + text + '\n"""\n\nCrea ' + n + ' preguntas de opción múltiple (4 opciones) sobre las ideas importantes del texto, de dificultad creciente y en el idioma del texto. Formato exacto: {"questions":[{"q":"...","options":["a","b","c","d"],"answer":0,"explain":"una frase","quote":"cita LITERAL y corta (máx. 140 caracteres) del texto donde está la respuesta"}]}. "answer" es el índice (0-3) de la opción correcta.';
      ARC.ai.ask({ system: sys, messages: [{ role: 'user', content: user }], max: 1800 }).then(function (t) {
        var m = /\{[\s\S]*\}/.exec(t), d = JSON.parse(m ? m[0] : t), qs = (d.questions || []).filter(function (q) { return q.q && Array.isArray(q.options) && q.options.length === 4 && q.answer >= 0 && q.answer < 4; });
        if (qs.length < 3) throw new Error('formato');
        qs.forEach(function (q) { q.at = locate(ctx.text, q.quote); });
        startQuiz(qs);
      }).catch(function () { ARC.toast('Sibila no pudo; usaré el test rápido'); offline(); });
    });
  };
  function locate(text, quote) {
    if (!quote) return -1; var i = text.indexOf(quote); if (i > -1) return i;
    var k = quote.replace(/\s+/g, ' ').trim(); i = text.indexOf(k.slice(0, 40)); if (i > -1) return i;
    i = text.indexOf(k.slice(0, 20)); return i;
  }
  function startQuiz(qs) { QZ.qs = qs; QZ.i = 0; QZ.score = 0; QZ.fails = []; quizStep(); }
  function quizStep() {
    var q = QZ.qs[QZ.i];
    ARC.openModal('<div class="det qz"><small class="kw">Pregunta ' + (QZ.i + 1) + ' de ' + QZ.qs.length + '</small><div class="pbar"><i style="width:' + (QZ.i / QZ.qs.length * 100) + '%"></i></div><h3 class="qq">' + esc(q.q).replace(/\n/g, '<br>') + '</h3><div class="qopts">' + q.options.map(function (o, i) { return '<button data-a="qzPick" data-i="' + i + '">' + esc(o) + '</button>'; }).join('') + '</div><div id="qzfb"></div></div>');
  }
  A.qzPick = function (el) {
    var q = QZ.qs[QZ.i], i = Number(el.dataset.i), right = i === q.answer;
    if (document.querySelector('.qopts.locked')) return;
    document.querySelector('.qopts').classList.add('locked');
    Array.prototype.forEach.call(document.querySelectorAll('.qopts button'), function (b, k) { if (k === q.answer) b.classList.add('ok'); else if (k === i) b.classList.add('bad'); });
    if (right) QZ.score++; else QZ.fails.push(QZ.i);
    $('#qzfb').innerHTML = '<p class="hint">' + (right ? '✅ ¡Correcto! ' : '❌ No era esa. ') + esc(q.explain || '') + '</p><button class="btn primary big" data-a="qzNext">' + (QZ.i + 1 < QZ.qs.length ? 'Siguiente' : 'Ver resultado') + '</button>';
  };
  A.qzNext = function () { QZ.i++; if (QZ.i < QZ.qs.length) quizStep(); else quizEnd(); };
  function quizEnd() {
    var ctx = QZ.ctx, tot = QZ.qs.length, sc = QZ.score, p = Math.round(sc / tot * 100);
    L.quiz[ctx.book] = L.quiz[ctx.book] || {}; L.quiz[ctx.book][ctx.ch < 0 ? 'all' : ctx.ch] = { score: sc, total: tot, ts: Date.now() }; saveL();
    ARC.progress.xp += 4 + sc * 2; ARC.save('progress');
    var h = '<div class="det qz"><div class="bigscore">' + p + '<small>%</small></div><h3>' + (p >= 80 ? 'Lo dominas ✨' : p >= 50 ? 'Vas bien' : 'Merece una segunda lectura') + '</h3><p class="hint c">Has acertado ' + sc + ' de ' + tot + '.</p>';
    if (QZ.fails.length) {
      h += '<div class="lbl">Para repasar</div>' + QZ.fails.map(function (i) { var q = QZ.qs[i]; return '<div class="fail"><p>' + esc(q.explain || q.quote || q.q) + '</p>' + (ctx.ch >= 0 && q.at > -1 ? '<button class="btn ghost sm" data-a="qzReread" data-i="' + i + '">📖 Releer este fragmento</button>' : '') + '</div>'; }).join('');
    }
    ARC.openModal(h + '<button class="btn primary big" data-a="close">Cerrar</button></div>');
  }
  A.qzReread = function (el) { var q = QZ.qs[Number(el.dataset.i)], ctx = QZ.ctx; ARC.closeModal(); openReader(ctx.book, { ch: ctx.ch, at: q.at, len: (q.quote || '').length || 60 }); };

  /* ---------- lector ---------- */
  var RD = null;
  var THEMES = { night: 'Noche', sepia: 'Sepia', paper: 'Papel' };
  function openReader(id, o) {
    o = o || {}; var b = book(id); if (!b) return;
    LP.get(id).then(function (rec) {
      if (!rec) { ARC.toast('No encuentro el archivo de este libro'); return; }
      closeReader(true);
      RD = { id: id, b: b, rec: rec, ch: o.ch !== undefined ? o.ch : (b.pos ? b.pos.ch : 0), page: 0, pages: 1, last: Date.now(), sec: 0, words: 0, chrome: true, sel: null, W: 0, H: 0, pad: 22, target: o.at !== undefined ? { at: o.at, len: o.len } : null };
      b.lastOpen = Date.now(); if (b.status === 'new') b.status = 'reading';
      var d = document.createElement('div'); d.id = 'rdr'; d.lang = 'es'; d.className = 'rdr th-' + L.set.theme + ' ft-' + L.set.font;
      d.innerHTML = '<header class="rd-top"><button data-a="rdClose" aria-label="Cerrar">✕</button><div class="rt"><b>' + esc(b.title) + '</b><small id="rdch"></small></div><button data-a="rdToc" aria-label="Capítulos">☰</button><button data-a="rdNotes" data-id="' + id + '" aria-label="Notas">📝</button><button data-a="rdSet" aria-label="Ajustes">Aa</button></header>' +
        '<div class="rd-view" id="rdview"><div class="rd-flow" id="rdflow"></div></div><div class="rd-sel" id="rdsel" hidden><button data-a="rdHl" data-c="1" class="c1"></button><button data-a="rdHl" data-c="2" class="c2"></button><button data-a="rdHl" data-c="3" class="c3"></button><button data-a="rdHl" data-c="4" class="c4"></button><button data-a="rdNote">📝</button><button data-a="rdAsk">✨</button></div>' +
        '<footer class="rd-bot"><div class="rbar"><i id="rdbar"></i></div><span id="rdinfo"></span></footer>';
      document.body.appendChild(d); document.body.classList.add('noscroll');
      bindReader(d); showChapter(RD.ch, o.at !== undefined ? 'at' : 'restore');
      document.addEventListener('selectionchange', onSel); window.addEventListener('resize', onResize); document.addEventListener('visibilitychange', onVis); document.addEventListener('keydown', onKey);
      var m = ARC.mission; if (m) { /* la lectura suma al progreso general */ }
    });
  }
  function bindReader(d) {
    var v = d.querySelector('#rdview'), x0 = 0, y0 = 0, t0 = 0;
    v.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now(); }, { passive: true });
    v.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - t0 < 700 && !hasSel()) { RD.swiped = Date.now(); turn(dx < 0 ? 1 : -1); }
    }, { passive: true });
    v.addEventListener('click', function (e) {
      if (RD.swiped && Date.now() - RD.swiped < 400) return; if (hasSel()) return;
      var mk = e.target.closest && e.target.closest('mark.uh'); if (mk) { hlModal(mk.dataset.h); return; }
      var r = v.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (x < 0.28) turn(-1); else if (x > 0.72) turn(1); else { RD.chrome = !RD.chrome; d.classList.toggle('nochrome', !RD.chrome); }
    });
  }
  function hasSel() { var s = window.getSelection(); return s && !s.isCollapsed && s.toString().trim().length > 0; }
  function onKey(e) { if (!RD || !$('#modal').hidden) return; if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); turn(1); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); turn(-1); } else if (e.key === 'Escape') A.rdClose(); }
  function onVis() { if (RD && document.hidden) flushTime(); else if (RD) RD.last = Date.now(); }
  var rzT = null; function onResize() { clearTimeout(rzT); rzT = setTimeout(function () { if (RD) { var f = RD.pages > 1 ? RD.page / (RD.pages - 1) : 0; layout(); setPage(Math.round(f * (RD.pages - 1)), true); } }, 200); }
  function onSel() {
    if (!RD) return; var bar = $('#rdsel'), s = hasSel() ? selOffsets() : null; RD.sel = s;
    if (bar) bar.hidden = !s;
  }
  function selOffsets() {
    var sel = window.getSelection(), flow = $('#rdflow'); if (!sel.rangeCount || !flow) return null; var r = sel.getRangeAt(0);
    if (!flow.contains(r.commonAncestorContainer)) return null;
    var pre = document.createRange(); pre.selectNodeContents(flow); pre.setEnd(r.startContainer, r.startOffset);
    var s = pre.toString().length, t = r.toString(); return t.trim() ? { s: s, e: s + t.length, text: t.replace(/\s+/g, ' ').trim() } : null;
  }
  function chap() { return RD.rec.chapters[RD.ch]; }
  function layout() {
    var v = $('#rdview'), f = $('#rdflow'); if (!v || !f) return;
    var W = v.clientWidth, H = v.clientHeight, pad = W > 640 ? 48 : 22, pv = 20;
    RD.W = W; RD.H = H; RD.pad = pad;
    f.style.width = (W - 2 * pad) + 'px'; f.style.height = (H - 2 * pv) + 'px'; f.style.marginTop = pv + 'px'; f.style.marginLeft = pad + 'px';
    f.style.columnWidth = (W - 2 * pad) + 'px'; f.style.columnGap = (2 * pad) + 'px'; f.style.fontSize = L.set.size + 'px';
    f.style.setProperty('--imgh', Math.round(H * 0.7) + 'px');
    RD.pages = Math.max(1, Math.round((f.scrollWidth + 2 * pad) / W));
  }
  function showChapter(i, how) {
    var c = RD.rec.chapters[i]; if (!c) return; RD.ch = i;
    var f = $('#rdflow'); f.style.transition = 'none'; f.style.transform = 'translateX(0)'; f.innerHTML = c.h; f.scrollLeft = 0;
    layout(); applyHL();
    var page = 0;
    if (how === 'restore' && RD.b.pos && RD.b.pos.ch === i) page = Math.round((RD.b.pos.frac || 0) * (RD.pages - 1));
    else if (how === 'last') page = RD.pages - 1;
    if (how === 'at' && RD.target) { var at = RD.target.at, len = RD.target.len; RD.target = null; flash(at, len); var m = f.querySelector('mark.hflash'); if (m) page = Math.max(0, Math.min(RD.pages - 1, Math.floor(m.offsetLeft / RD.W))); setTimeout(function () { if (RD) { applyHL(); } }, 5000); }
    setPage(page, true);
    $('#rdch').textContent = (i + 1) + '/' + RD.rec.chapters.length + ' · ' + (c.t || '');
  }
  function setPage(p, instant) {
    var f = $('#rdflow'); if (!f) return; RD.page = Math.max(0, Math.min(RD.pages - 1, p));
    f.style.transition = instant ? 'none' : 'transform .34s cubic-bezier(.22,.8,.3,1)'; f.style.transform = 'translateX(' + (-RD.page * RD.W) + 'px)';
    var n = RD.rec.chapters.length, frac = RD.pages > 1 ? RD.page / (RD.pages - 1) : 0;
    $('#rdbar').style.width = Math.round((RD.ch + (RD.pages > 1 ? (RD.page + 1) / RD.pages : 1)) / n * 100) + '%';
    $('#rdinfo').textContent = 'Pág. ' + (RD.page + 1) + ' de ' + RD.pages + ' del capítulo';
    RD.b.pos = { ch: RD.ch, frac: frac }; RD.b.nch = n; if (!instant) saveL();
  }
  function turn(d) {
    var now = Date.now(), dt = Math.min((now - RD.last) / 1000, 150); RD.last = now;
    if (d > 0) { RD.sec += dt; RD.words += chap().w / RD.pages; }
    var np = RD.page + d;
    if (np < 0) { if (RD.ch > 0) showChapter(RD.ch - 1, 'last'); return; }
    if (np >= RD.pages) { chapterDone(); return; }
    setPage(np);
  }
  function flushTime() {
    if (!RD) return; var now = Date.now(); RD.last = now;
    if (RD.sec >= 20) { L.log.push({ d: ARC.dayKey(0), sec: Math.round(RD.sec), words: Math.round(RD.words), book: RD.id }); RD.sec = 0; RD.words = 0; }
    saveL();
  }
  function chapterDone() {
    var b = RD.b, n = RD.rec.chapters.length; b.done = b.done || []; var first = b.done.indexOf(RD.ch) < 0; if (first) { b.done.push(RD.ch); ARC.progress.xp += 3; ARC.save('progress'); }
    saveL(); flushTime();
    var last = RD.ch >= n - 1, q = (L.quiz[b.id] || {})[RD.ch];
    if (last) { b.status = 'read'; b.finished = Date.now(); ARC.progress.xp += 25; ARC.save('progress'); saveL(); }
    ARC.openModal('<div class="det"><div class="bigscore">' + (last ? '🏁' : '✓') + '</div><h3>' + (last ? '¡Has terminado «' + esc(b.title) + '»!' : 'Capítulo terminado') + '</h3><p class="hint c">' + (q ? 'Tu último test de este capítulo: ' + Math.round(q.score / q.total * 100) + ' %.' : 'Un test breve ayuda a fijar lo leído.') + '</p><button class="btn primary big" data-a="rdQuiz">🧠 Test del capítulo</button>' + (last ? '<button class="btn ghost big" data-a="rdFinish">Ver mi colección</button>' : '<button class="btn ghost big" data-a="rdNextCh">Seguir leyendo →</button>') + '</div>');
  }
  A.rdNextCh = function () { ARC.closeModal(); if (RD && RD.ch < RD.rec.chapters.length - 1) showChapter(RD.ch + 1, 'first'); };
  A.rdFinish = function () { ARC.closeModal(); closeReader(); LV.tab = 'stats'; ARC.render(); };
  A.rdQuiz = function () {
    var c = chap(), text = LP.textOf(c.h), id = RD.id, ch = RD.ch;
    QZ = { ctx: { book: id, ch: ch, text: text }, qs: [], i: 0, score: 0, fails: [] };
    ARC.openModal('<div class="det"><h3>🧠 Test del capítulo</h3><p class="hint c">«' + esc(c.t || 'Capítulo ' + (ch + 1)) + '»</p><button class="btn primary big" data-a="qzGo" data-v="off">⚡ Test rápido (sin conexión)</button><button class="btn ghost big" data-a="qzGo" data-v="ai">✨ Con Sibila</button><button class="btn link" data-a="rdNextCh">Ahora no</button></div>');
  };
  A.rdClose = function () { closeReader(); ARC.render(true); };
  function closeReader(silent) {
    if (!RD) return; flushTime(); saveL();
    var d = $('#rdr'); if (d) d.remove(); document.body.classList.remove('noscroll');
    document.removeEventListener('selectionchange', onSel); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVis); document.removeEventListener('keydown', onKey);
    RD = null;
  }

  /* subrayados */
  function wrap(root, s, e, id, color) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), pos = 0, n, list = [];
    while ((n = w.nextNode())) { var len = n.nodeValue.length; if (pos + len > s && pos < e) list.push([n, Math.max(s - pos, 0), Math.min(e - pos, len)]); pos += len; if (pos >= e) break; }
    list.forEach(function (x) { var r = document.createRange(); r.setStart(x[0], x[1]); r.setEnd(x[0], x[2]); var m = document.createElement('mark'); m.className = 'uh c' + color; m.dataset.h = id; try { r.surroundContents(m); } catch (err) { /* rango complejo */ } });
  }
  function applyHL() {
    var f = $('#rdflow'); if (!f) return; f.innerHTML = RD.rec.chapters[RD.ch].h;
    L.hl.filter(function (h) { return h.book === RD.id && h.ch === RD.ch; }).forEach(function (h) { wrap(f, h.s, h.e, h.id, h.color || 1); });
  }
  function flash(at, len) { var f = $('#rdflow'); wrap(f, at, at + Math.max(len, 20), 'flash', 5); Array.prototype.forEach.call(f.querySelectorAll('mark[data-h=flash]'), function (m) { m.classList.add('hflash'); }); }
  function pageOf(m) { return Math.max(0, Math.min(RD.pages - 1, Math.floor(m.offsetLeft / RD.W))); }
  A.rdHl = function (el) {
    var s = RD.sel; if (!s) return;
    L.hl.push({ id: 'h' + Date.now().toString(36), book: RD.id, ch: RD.ch, s: s.s, e: s.e, text: s.text.slice(0, 400), color: Number(el.dataset.c), note: '', ts: Date.now() }); saveL();
    window.getSelection().removeAllRanges(); $('#rdsel').hidden = true; var p = RD.page; applyHL(); setPage(p, true); ARC.toast('Subrayado guardado');
  };
  A.rdNote = function () {
    var s = RD.sel; if (!s) return; RD.pending = s;
    ARC.openModal('<h3>📝 Nota</h3><blockquote class="qte">' + esc(s.text.slice(0, 220)) + '</blockquote><textarea id="hl_note" rows="4" placeholder="¿Qué piensas de este pasaje?"></textarea><button class="btn primary big" data-a="rdNoteSave">Guardar nota</button>');
  };
  A.rdNoteSave = function () {
    var s = RD.pending, note = ($('#hl_note').value || '').trim();
    L.hl.push({ id: 'h' + Date.now().toString(36), book: RD.id, ch: RD.ch, s: s.s, e: s.e, text: s.text.slice(0, 400), color: 2, note: note, ts: Date.now() }); saveL();
    ARC.closeModal(); window.getSelection().removeAllRanges(); var p = RD.page; applyHL(); setPage(p, true);
  };
  function hlModal(id) {
    var h = L.hl.filter(function (x) { return x.id === id; })[0]; if (!h) return;
    ARC.openModal('<h3>Subrayado</h3><blockquote class="qte">' + esc(h.text) + '</blockquote><textarea id="hl_edit" rows="3" placeholder="Añade una nota…">' + esc(h.note || '') + '</textarea><div class="chips">' + [1, 2, 3, 4].map(function (c) { return '<button class="hc c' + c + (h.color === c ? ' on' : '') + '" data-a="hlColor" data-id="' + id + '" data-c="' + c + '">●</button>'; }).join('') + '</div><button class="btn primary big" data-a="hlSave" data-id="' + id + '">Guardar</button><button class="btn ghost danger" data-a="hlDel" data-id="' + id + '">Quitar subrayado</button>');
  }
  A.hlColor = function (el) { var h = L.hl.filter(function (x) { return x.id === el.dataset.id; })[0]; h.color = Number(el.dataset.c); saveL(); hlModal(h.id); };
  A.hlSave = function (el) { var h = L.hl.filter(function (x) { return x.id === el.dataset.id; })[0]; h.note = ($('#hl_edit').value || '').trim(); saveL(); ARC.closeModal(); if (RD) { var p = RD.page; applyHL(); setPage(p, true); } };
  A.hlDel = function (el) { L.hl = L.hl.filter(function (x) { return x.id !== el.dataset.id; }); saveL(); ARC.closeModal(); if (RD) { var p = RD.page; applyHL(); setPage(p, true); } };
  A.rdAsk = function () {
    var s = RD.sel; if (!s) return; var text = s.text, title = RD.b.title; window.getSelection().removeAllRanges(); $('#rdsel').hidden = true;
    ARC.ai.guard(function () {
      ARC.openModal('<div class="det"><h3>✨ Sibila</h3><blockquote class="qte">' + esc(text.slice(0, 260)) + '</blockquote><div id="rdai"><div class="ai load"><div class="orb-s"></div><p>Meditando el pasaje…</p></div></div></div>');
      ARC.ai.ask({ system: 'Eres una mentora culta que explica pasajes de libros en español. ' + ARC.PERSONALIZE, messages: [{ role: 'user', content: 'Libro: «' + title + '».\nPasaje: «' + text.slice(0, 900) + '»\n\nExplica su sentido con claridad (máx. 150 palabras), aclara los términos difíciles y, si procede, conéctalo con la persona usando el contexto:\n' + ARC.ctx() }], max: 450 })
        .then(function (t) { var b = $('#rdai'); if (b) b.innerHTML = '<div class="ai">' + ARC.fmt(t) + '</div>'; })
        .catch(function (e) { var b = $('#rdai'); if (b) b.innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
    });
  };
  A.rdToc = function () {
    var b = RD.b, q = L.quiz[b.id] || {};
    ARC.openModal('<h3>Capítulos</h3><div class="group toc">' + RD.rec.chapters.map(function (c, i) { var t = q[i]; return '<button class="grow' + (i === RD.ch ? ' cur' : '') + '" data-a="rdGo" data-i="' + i + '"><div><b>' + (i + 1) + '. ' + esc(c.t || 'Parte') + '</b><small>' + Math.max(1, Math.round(c.w / 230)) + ' min' + (t ? ' · test ' + Math.round(t.score / t.total * 100) + ' %' : '') + '</small></div><span class="chk">' + ((b.done || []).indexOf(i) > -1 ? '✓' : '') + '</span></button>'; }).join('') + '</div>');
  };
  A.rdGo = function (el) { ARC.closeModal(); showChapter(Number(el.dataset.i), 'first'); };
  A.rdSet = function () {
    ARC.openModal('<h3>Aspecto de lectura</h3><div class="lbl">Tamaño</div><div class="chips"><button data-a="rdSize" data-v="-1">A−</button><button data-a="rdSize" data-v="1">A＋</button></div><div class="lbl">Tema</div><div class="chips">' + Object.keys(THEMES).map(function (k) { return '<button data-a="rdTheme" data-v="' + k + '" class="' + (L.set.theme === k ? 'on' : '') + '">' + THEMES[k] + '</button>'; }).join('') + '</div><div class="lbl">Tipografía</div><div class="chips"><button data-a="rdFont" data-v="serif" class="' + (L.set.font === 'serif' ? 'on' : '') + '">Con serifa</button><button data-a="rdFont" data-v="sans" class="' + (L.set.font === 'sans' ? 'on' : '') + '">Sin serifa</button></div>');
  };
  function restyle() { var d = $('#rdr'); if (d) d.className = 'rdr th-' + L.set.theme + ' ft-' + L.set.font + (RD.chrome ? '' : ' nochrome'); var f = RD.pages > 1 ? RD.page / (RD.pages - 1) : 0; layout(); setPage(Math.round(f * (RD.pages - 1)), true); saveL(); }
  A.rdSize = function (el) { L.set.size = Math.max(14, Math.min(30, L.set.size + Number(el.dataset.v))); restyle(); };
  A.rdTheme = function (el) { L.set.theme = el.dataset.v; restyle(); A.rdSet(); };
  A.rdFont = function (el) { L.set.font = el.dataset.v; restyle(); A.rdSet(); };
  A.bkRead = function (el) { ARC.closeModal(); openReader(el.dataset.id); };
  A.bkNotes = A.rdNotes = function (el) {
    var id = el.dataset.id || (RD && RD.id), hs = L.hl.filter(function (h) { return h.book === id; }).sort(function (a, b) { return a.ch - b.ch || a.s - b.s; }), b = book(id);
    ARC.openModal('<h3>📝 Apuntes · ' + esc(b.title) + '</h3>' + (hs.length ? '<div class="notes">' + hs.map(function (h) { return '<div class="note c' + h.color + '"><p>«' + esc(h.text) + '»</p>' + (h.note ? '<p class="nt">' + esc(h.note) + '</p>' : '') + '<small>Capítulo ' + (h.ch + 1) + '</small><div class="nacts"><button data-a="noteGo" data-b="' + id + '" data-ch="' + h.ch + '" data-s="' + h.s + '" data-l="' + (h.e - h.s) + '">Ir</button><button data-a="hlDelNote" data-id="' + h.id + '" data-b="' + id + '">Quitar</button></div></div>'; }).join('') + '</div><button class="btn ghost big" data-a="notesCopy" data-b="' + id + '">📋 Copiar apuntes</button>' : '<p class="hint c">Aún no hay subrayados. Mantén pulsado un texto mientras lees para seleccionarlo.</p>'));
  };
  A.noteGo = function (el) { ARC.closeModal(); openReader(el.dataset.b, { ch: Number(el.dataset.ch), at: Number(el.dataset.s), len: Number(el.dataset.l) }); };
  A.hlDelNote = function (el) { L.hl = L.hl.filter(function (x) { return x.id !== el.dataset.id; }); saveL(); A.bkNotes({ dataset: { id: el.dataset.b } }); };
  A.notesCopy = function (el) {
    var b = book(el.dataset.b), t = '# ' + b.title + '\n\n' + L.hl.filter(function (h) { return h.book === b.id; }).map(function (h) { return '> ' + h.text + (h.note ? '\n' + h.note : ''); }).join('\n\n');
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { ARC.toast('Apuntes copiados'); }).catch(function () { ARC.toast('No se pudo copiar'); });
  };
  ARC.libOpen = function (id) { openReader(id); };
})();
