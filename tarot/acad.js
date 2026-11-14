/* Academia v2: libros con capítulos, examen final, colección, niveles y certificado de maestría. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, P = ARC.profile, progress = ARC.progress, ACT = ARC.act;
  progress.books = progress.books || {};
  var BOOKS = BK.list, PATHS = BK.paths;
  var PASS = 0.7, EXAM_N = 10;
  var save = function () { ARC.save('progress'); };
  var bookById = function (id) { return BOOKS.filter(function (b) { return b.id === id; })[0]; };
  var chDone = function (c) { return !!progress.done[c.id]; };
  var chaptersDone = function (b) { return b.chapters.filter(chDone).length; };
  var allChaptersDone = function (b) { return chaptersDone(b) === b.chapters.length; };
  var passed = function (b) { return !!progress.books[b.id]; };
  var totalPassed = function () { return BOOKS.filter(passed).length; };
  var totalChapters = function () { return BOOKS.reduce(function (s, b) { return s + b.chapters.length; }, 0); };
  var doneChapters = function () { return BOOKS.reduce(function (s, b) { return s + chaptersDone(b); }, 0); };
  function streakNow() { return progress.last === ARC.dayKey(0) || progress.last === ARC.dayKey(-1) ? progress.streak : 0; }

  var LEVELS = [[0, 'Curioso/a', '🌱'], [0.0001, 'Novicio/a', '🕯️'], [0.2, 'Aprendiz', '📜'], [0.45, 'Iniciado/a', '🔮'], [0.75, 'Adepto/a', '⚜️'], [1, 'Maestro/a', '👑']];
  function level() {
    var pct = BOOKS.length ? totalPassed() / BOOKS.length : 0, cur = LEVELS[0], nxt = null;
    LEVELS.forEach(function (l) { if (pct >= l[0] && (l[0] > 0 || pct === 0)) cur = l; });
    var i = LEVELS.indexOf(cur); nxt = LEVELS[i + 1] || null;
    return { name: cur[1], emoji: cur[2], pct: pct, next: nxt ? { name: nxt[1], need: Math.max(1, Math.ceil(nxt[0] * BOOKS.length - 1e-9) - totalPassed()) } : null };
  }
  ARC.level = level;

  /* ---------- vistas ---------- */
  var ST = { book: null };

  function bookCard(b) {
    var d = chaptersDone(b), n = b.chapters.length, ok = passed(b), pct = Math.round(d / n * 100);
    return '<button class="bk' + (ok ? ' ok' : '') + '" style="--h:' + b.hue + '" data-a="bookOpen" data-id="' + b.id + '"><span class="cover"><b>' + b.emoji + '</b>' + (ok ? '<i class="seal">✓</i>' : '') + '</span>' +
      '<span class="bt2"><b>' + esc(b.title) + '</b><small>' + esc(b.sub) + '</small><em>' + (ok ? 'Libro completado · ' + Math.round(progress.books[b.id].score * 100) + '%' : d + '/' + n + ' capítulos' + (d === n ? ' · examen pendiente' : '')) + '</em>' +
      '<span class="pbar"><i style="width:' + (ok ? 100 : pct) + '%"></i></span></span></button>';
  }

  function nextUp() {
    var started = BOOKS.filter(function (b) { return chaptersDone(b) > 0 && !passed(b); })[0] || BOOKS.filter(function (b) { return !passed(b); })[0];
    return started || null;
  }

  function cursosView() {
    if (ST.book) return bookView(bookById(ST.book));
    var lv = level(), tp = totalPassed(), nb = BOOKS.length, nx = nextUp();
    var h = '<div class="lvl"><div class="lvl-e">' + lv.emoji + '</div><div class="lvl-t"><small>Tu nivel</small><b>' + esc(lv.name) + '</b><div class="meter"><i style="width:' + Math.round(lv.pct * 100) + '%"></i></div>' +
      '<small>' + tp + ' de ' + nb + ' libros completados' + (lv.next ? ' · faltan ' + lv.next.need + ' para ' + esc(lv.next.name) : '') + '</small></div></div>' +
      '<div class="stats"><div><b>🔥 ' + streakNow() + '</b><small>racha</small></div><div><b>✨ ' + progress.xp + '</b><small>XP</small></div><div><b>📚 ' + doneChapters() + '/' + totalChapters() + '</b><small>capítulos</small></div></div>';
    if (nx) {
      var idx = Math.min(chaptersDone(nx), nx.chapters.length - 1), ch = nx.chapters[idx], ex = allChaptersDone(nx);
      h += '<button class="panel cont" data-a="bookOpen" data-id="' + nx.id + '"><div class="lbl">Continúa donde lo dejaste</div><div class="cont-r"><span>' + nx.emoji + '</span><div><b>' + esc(nx.title) + '</b><small>' + (ex ? 'Examen final disponible' : 'Capítulo ' + (idx + 1) + ': ' + esc(ch.title)) + '</small></div><i>→</i></div></button>';
    }
    PATHS.forEach(function (p) {
      var list = BOOKS.filter(function (b) { return b.path === p[0]; });
      if (!list.length) return;
      h += '<div class="pathh"><h3>' + esc(p[1]) + '</h3><small>' + esc(p[2]) + '</small></div><div class="bks">' + list.map(bookCard).join('') + '</div>';
    });
    return h;
  }

  function bookView(b) {
    var d = chaptersDone(b), n = b.chapters.length, ok = passed(b), cur = d;
    var h = '<button class="btn link left" data-a="bookBack">← Todos los libros</button><div class="bookhead" style="--h:' + b.hue + '"><span class="cover big"><b>' + b.emoji + '</b>' + (ok ? '<i class="seal">✓</i>' : '') + '</span><div><h2>' + esc(b.title) + '</h2><p>' + esc(b.desc) + '</p><small>' + n + ' capítulos · examen final de ' + Math.min(EXAM_N, examPool(b).length) + ' preguntas</small></div></div>';
    h += '<div class="chaps">' + b.chapters.map(function (c, i) {
      var state = chDone(c) ? 'done' : (i === cur ? 'cur' : (i < cur ? 'done' : 'lock'));
      return '<button class="chap ' + state + '" data-a="chapStart" data-b="' + b.id + '" data-i="' + i + '"><span class="cn">' + (state === 'done' ? '✓' : state === 'lock' ? '🔒' : i + 1) + '</span><span class="ct"><b>' + esc(c.title) + '</b><small>' + c.steps.length + ' pasos</small></span><span class="ce">' + c.emoji + '</span></button>';
    }).join('');
    var exState = ok ? 'done' : (allChaptersDone(b) ? 'cur' : 'lock');
    h += '<button class="chap exam ' + exState + '" data-a="examStart" data-b="' + b.id + '"><span class="cn">' + (ok ? '🏅' : exState === 'lock' ? '🔒' : '📝') + '</span><span class="ct"><b>Examen final</b><small>' +
      (ok ? 'Superado con ' + Math.round(progress.books[b.id].score * 100) + '% · puedes repetirlo' : exState === 'lock' ? 'Completa todos los capítulos para desbloquearlo' : 'Aprueba con ' + Math.round(PASS * 100) + '% para añadirlo a tu colección') + '</small></span><span class="ce">🎓</span></button></div>';
    return h;
  }

  function coleccionView() {
    var tp = totalPassed(), nb = BOOKS.length, all = tp === nb;
    var h = '<div class="lvl"><div class="lvl-e">' + level().emoji + '</div><div class="lvl-t"><small>Tu colección</small><b>' + tp + ' de ' + nb + ' libros</b><div class="meter"><i style="width:' + Math.round(tp / nb * 100) + '%"></i></div></div></div>';
    h += '<button class="panel certbtn' + (all ? ' ready' : '') + '" data-a="certShow"><span>📜</span><div><b>Certificado de Maestría Arcana</b><small>' + (all ? '¡Desbloqueado! Toca para ver y descargar tu certificado.' : 'Completa los ' + nb + ' libros y sus exámenes para desbloquearlo (' + tp + '/' + nb + ').') + '</small></div></button>';
    h += '<div class="shelf">' + BOOKS.map(function (b) {
      var ok = passed(b), d = chaptersDone(b);
      return '<button class="spine' + (ok ? ' ok' : '') + '" style="--h:' + b.hue + '" data-a="bookOpen" data-id="' + b.id + '" title="' + esc(b.title) + '"><b>' + b.emoji + '</b><span>' + esc(b.title) + '</span><small>' + (ok ? '✓ ' + Math.round(progress.books[b.id].score * 100) + '%' : d + '/' + b.chapters.length) + '</small></button>';
    }).join('') + '</div>';
    return h + '<p class="fine">Los libros se añaden a tu colección al aprobar su examen final.</p>';
  }

  ARC.regSub('study', 'cursos', '🎓', 'Cursos', cursosView);
  ARC.regSub('study', 'coleccion', '🏅', 'Colección', coleccionView);

  ACT.bookOpen = function (el) { ST.book = el.dataset.id; ARC.setSub('study', 'cursos'); ARC.tab = 'study'; ARC.render(); };
  ACT.bookBack = function () { ST.book = null; ARC.render(); };

  /* ---------- reproductor ---------- */
  var A = null;
  function shuffled(n) { return ARC.shuffle(n); }
  function examPool(b) { var q = []; b.chapters.forEach(function (c) { c.steps.forEach(function (s) { if (s.t === 'quiz') q.push(s); }); }); return q; }

  function openPlayer() { $('#overlay').hidden = false; document.body.classList.add('noscroll'); }
  function enterStep() {
    var st = A.steps[A.i]; A.sel = -1; A.checked = false; A.right = false; A.tries = 0;
    A.order = st && st.t === 'quiz' ? shuffled(st.opts.length) : null;
  }
  function startChapter(bid, idx) {
    var b = bookById(bid), c = b.chapters[idx];
    if (idx > chaptersDone(b)) { ARC.toast('Completa antes el capítulo anterior 🔒'); return; }
    A = { kind: 'ch', b: b, c: c, steps: c.steps, i: 0, firstTry: 0, finished: false }; enterStep(); openPlayer(); renderPlayer();
  }
  function startExam(bid) {
    var b = bookById(bid);
    if (!allChaptersDone(b)) { ARC.toast('Completa todos los capítulos para el examen 🔒'); return; }
    var pool = examPool(b), order = shuffled(pool.length).slice(0, Math.min(EXAM_N, pool.length));
    A = { kind: 'exam', b: b, steps: order.map(function (i) { return pool[i]; }), i: 0, correct: 0, finished: false, answered: false }; enterStep(); openPlayer(); renderPlayer();
  }
  function closePlayer() {
    ARC.anim.clear(); A = null;
    var ov = $('#overlay'); ov.hidden = true; ov.innerHTML = '';
    if ($('#modal').hidden) document.body.classList.remove('noscroll');
    ARC.render(true);
  }

  function confetti() {
    var c = ''; for (var i = 0; i < 22; i++) c += '<i style="left:' + ((i * 29) % 100) + '%;animation-delay:' + ((i % 9) * 0.25) + 's">' + ['✨', '⭐', '🌙', '💫'][i % 4] + '</i>';
    return '<div class="confetti">' + c + '</div>';
  }

  function renderPlayer() {
    ARC.anim.clear();
    var ov = $('#overlay'), b = A.b;
    if (A.finished) {
      if (A.kind === 'ch') {
        var gain = 10 + A.firstTry * 5, last = b.chapters.indexOf(A.c) === b.chapters.length - 1;
        ov.innerHTML = '<div class="player done">' + confetti() + '<div class="pbody c"><div class="trophy">' + A.c.emoji + '</div><h2>¡Capítulo completado!</h2><p>' + esc(A.c.title) + '</p><div class="gain"><b>+' + gain + ' XP</b><small>🔥 Racha: ' + progress.streak + (progress.streak === 1 ? ' día' : ' días') + '</small></div>' +
          (last ? '<p class="hint">📝 ¡Has terminado el libro! Ya puedes hacer su examen final.</p>' : '') + '</div><div class="pfoot"><button class="btn primary big" data-a="plClose">Continuar</button></div></div>';
      } else {
        var pct = Math.round(A.correct / A.steps.length * 100), ok = A.correct / A.steps.length >= PASS;
        ov.innerHTML = '<div class="player done">' + (ok ? confetti() : '') + '<div class="pbody c"><div class="trophy">' + (ok ? '🏅' : '📖') + '</div><h2>' + (ok ? '¡Examen superado!' : 'Casi lo tienes') + '</h2><p>' + esc(b.title) + '</p>' +
          '<div class="gain"><b>' + A.correct + ' / ' + A.steps.length + ' · ' + pct + '%</b><small>' + (ok ? (A.firstPass ? '+' + A.xp + ' XP · añadido a tu colección' : 'Ya estaba en tu colección') : 'Necesitas ' + Math.round(PASS * 100) + '% para aprobar. Repasa y vuelve a intentarlo.') + '</small></div>' +
          (A.allDone ? '<p class="hint">👑 ¡Has completado TODA la academia! Tu certificado te espera en Colección.</p>' : '') + '</div><div class="pfoot">' +
          (ok ? '<button class="btn primary big" data-a="plClose">Continuar</button>' : '<button class="btn primary big" data-a="plRetry">Reintentar examen</button><button class="btn link" data-a="plClose">Volver al libro</button>') + '</div></div>';
      }
      return;
    }
    var st = A.steps[A.i], pc = Math.round(A.i / A.steps.length * 100), body, foot;
    if (st.t === 'learn') {
      body = '<h2>' + esc(st.title) + '</h2>' + ARC.anim.html(st.anim) + '<p class="lead">' + st.body + '</p>';
      foot = '<button class="btn primary big" data-a="plNext">Continuar</button>';
    } else {
      body = (A.kind === 'exam' ? '<small class="gold">Examen · pregunta ' + (A.i + 1) + ' de ' + A.steps.length + '</small>' : '') + '<h2>' + esc(st.q) + '</h2><div class="opts">' + A.order.map(function (oi) {
        var cls = 'opt'; if (A.sel === oi) cls += ' sel';
        if (A.checked && A.sel === oi) cls += A.right ? ' ok' : ' bad';
        if (A.checked && A.kind === 'exam' && !A.right && oi === st.a) cls += ' ok';
        return '<button class="' + cls + '" data-a="plOpt" data-i="' + oi + '"' + (A.checked && (A.right || A.kind === 'exam') ? ' disabled' : '') + '>' + esc(st.opts[oi]) + '</button>';
      }).join('') + '</div>';
      if (!A.checked) foot = '<button class="btn primary big" data-a="plCheck"' + (A.sel < 0 ? ' disabled' : '') + '>Comprobar</button>';
      else if (A.right) foot = '<div class="fb ok"><b>¡Correcto! ✨</b><span>' + esc(st.why || '') + '</span></div><button class="btn primary big" data-a="plNext">Continuar</button>';
      else if (A.kind === 'exam') foot = '<div class="fb bad"><b>Incorrecto 🌙</b><span>' + esc(st.why || '') + '</span></div><button class="btn primary big" data-a="plNext">Continuar</button>';
      else foot = '<div class="fb bad"><b>Casi… 🌙</b><span>Inténtalo de nuevo.</span></div><button class="btn primary big" data-a="plRetry2">Reintentar</button>';
    }
    ov.innerHTML = '<div class="player"><div class="ptop"><button class="x2" data-a="plClose" aria-label="Salir">✕</button><div class="bar"><i style="width:' + pc + '%"></i></div></div><div class="pbody">' + body + '</div><div class="pfoot">' + foot + '</div></div>';
    ARC.anim.init(ov);
  }

  function touchStreak() {
    if (progress.last !== ARC.dayKey(0)) { progress.streak = progress.last === ARC.dayKey(-1) ? progress.streak + 1 : 1; progress.last = ARC.dayKey(0); }
  }
  function finishChapter() {
    var c = A.c, first = !chDone(c); A.finished = true;
    if (first) { progress.xp += 10 + A.firstTry * 5; progress.done[c.id] = true; touchStreak(); save(); }
    renderPlayer();
  }
  function finishExam() {
    var b = A.b, score = A.correct / A.steps.length, ok = score >= PASS; A.finished = true;
    if (ok) {
      var prev = progress.books[b.id]; A.firstPass = !prev; A.xp = 40 + Math.round(score * 20);
      if (!prev) progress.xp += A.xp;
      if (!prev || score > prev.score) progress.books[b.id] = { score: score, ts: Date.now() };
      touchStreak(); save();
      A.allDone = totalPassed() === BOOKS.length;
    }
    renderPlayer();
  }

  ACT.chapStart = function (el) { startChapter(el.dataset.b, Number(el.dataset.i)); };
  ACT.examStart = function (el) { startExam(el.dataset.b); };
  ACT.plClose = function () { closePlayer(); };
  ACT.closeLesson = function () { if (A) closePlayer(); };
  ACT.plRetry = function () { var bid = A.b.id; ARC.anim.clear(); startExam(bid); };
  ACT.plOpt = function (el) { if (A.checked && (A.right || A.kind === 'exam')) return; A.sel = Number(el.dataset.i); A.checked = false; renderPlayer(); };
  ACT.plCheck = function () {
    var st = A.steps[A.i]; A.checked = true; A.right = A.sel === st.a;
    if (A.kind === 'ch' && A.right && A.tries === 0) A.firstTry++;
    if (A.kind === 'exam' && A.right) A.correct++;
    renderPlayer();
  };
  ACT.plRetry2 = function () { A.tries++; A.sel = -1; A.checked = false; renderPlayer(); };
  ACT.plNext = function () {
    A.i++;
    if (A.i >= A.steps.length) { if (A.kind === 'ch') finishChapter(); else finishExam(); return; }
    enterStep(); renderPlayer();
  };

  /* ---------- certificado ---------- */
  function codeOf(str) { var h = SKYTXT.hash(str).toString(36).toUpperCase(); return ('ARC-' + h.slice(0, 4) + '-' + h.slice(4, 8)).replace(/-$/, ''); }
  function wrap(ctx, text, x, y, maxW, lh) {
    var words = text.split(' '), line = '';
    words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lh; } else line = t; });
    ctx.fillText(line, x, y); return y;
  }
  function drawCert(cv, name, dateStr, code) {
    var W = 1600, H = 1130; cv.width = W; cv.height = H; var c = cv.getContext('2d');
    var g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#120f22'); g.addColorStop(1, '#241a40'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (var i = 0; i < 160; i++) { c.globalAlpha = 0.2 + Math.random() * 0.6; c.fillStyle = Math.random() < 0.2 ? '#e6c97a' : '#fff'; c.beginPath(); c.arc(Math.random() * W, Math.random() * H, Math.random() * 1.6 + 0.3, 0, 6.283); c.fill(); }
    c.globalAlpha = 1; c.strokeStyle = '#e6c97a'; c.lineWidth = 6; c.strokeRect(50, 50, W - 100, H - 100); c.lineWidth = 2; c.strokeRect(74, 74, W - 148, H - 148);
    [[74, 74], [W - 74, 74], [74, H - 74], [W - 74, H - 74]].forEach(function (p) { c.fillStyle = '#e6c97a'; c.beginPath(); c.arc(p[0], p[1], 12, 0, 6.283); c.fill(); });
    // luna
    c.fillStyle = '#e6c97a'; c.beginPath(); c.arc(W / 2, 210, 62, 0, 6.283); c.fill(); c.fillStyle = '#1b1431'; c.beginPath(); c.arc(W / 2 + 26, 200, 56, 0, 6.283); c.fill();
    c.textAlign = 'center'; c.fillStyle = '#e6c97a'; c.font = '600 54px Georgia, serif'; c.fillText('A R C A N A', W / 2, 340);
    c.fillStyle = '#9a93b0'; c.font = 'italic 28px Georgia, serif'; c.fillText('Academia de Artes Esotéricas', W / 2, 382);
    c.fillStyle = '#ece7f5'; c.font = '600 78px Georgia, serif'; c.fillText('Certificado de Maestría', W / 2, 505);
    c.fillStyle = '#9a93b0'; c.font = '30px Georgia, serif'; c.fillText('Se otorga a', W / 2, 590);
    c.fillStyle = '#e6c97a'; c.font = 'italic 600 84px Georgia, serif'; c.fillText(name, W / 2, 690);
    c.strokeStyle = '#e6c97a66'; c.lineWidth = 2; c.beginPath(); c.moveTo(W / 2 - 360, 715); c.lineTo(W / 2 + 360, 715); c.stroke();
    c.fillStyle = '#ece7f5'; c.font = '32px Georgia, serif';
    var y = wrap(c, 'por completar los ' + BOOKS.length + ' libros de la academia y superar todos sus exámenes: tarot, oráculos, astrología, numerología, tradiciones del mundo, rituales y trabajo de sombra.', W / 2, 785, 1100, 46);
    c.fillStyle = '#e6c97a'; c.font = '600 34px Georgia, serif'; c.fillText('Nivel alcanzado: Maestro/a', W / 2, y + 80);
    c.fillStyle = '#9a93b0'; c.font = '24px Georgia, serif'; c.fillText(dateStr + '  ·  Código ' + code, W / 2, 1000);
    c.font = 'italic 20px Georgia, serif'; c.fillText('Certificado simbólico de la aplicación Arcana. No constituye una titulación oficial.', W / 2, 1040);
  }
  ACT.certShow = function () {
    if (totalPassed() < BOOKS.length) { ARC.toast('Completa todos los libros para desbloquear el certificado'); return; }
    var name = P.name || 'Aprendiz de lo oculto', d = new Date(), ds = d.getDate() + ' de ' + ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][d.getMonth()] + ' de ' + d.getFullYear();
    ARC.openModal('<h3>📜 Tu certificado</h3><canvas id="certcv" class="certcv"></canvas><button class="btn primary big" data-a="certDl">Descargar imagen</button><p class="hint">En iPhone, mantén pulsada la imagen para guardarla.</p>', 'tall');
    setTimeout(function () { var cv = $('#certcv'); if (cv) { drawCert(cv, name, ds, codeOf(name + '|' + BOOKS.length)); cv.dataset.name = name; } }, 30);
  };
  ACT.certDl = function () {
    var cv = $('#certcv'); if (!cv) return;
    cv.toBlob(function (blob) {
      if (!blob) { ARC.toast('No se pudo generar la imagen'); return; }
      var url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'certificado-arcana.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }, 'image/png');
  };

  ARC.study = { books: BOOKS, totalPassed: totalPassed, level: level };
})();
