/* Academia estilo Duolingo: camino de lecciones, quizzes, XP, racha y animaciones. */
(function () {
  'use strict';
  const ARC = window.ARC, $ = ARC.$, $$ = ARC.$$, esc = ARC.esc, rnd = ARC.rnd, dayKey = ARC.dayKey, toast = ARC.toast;
  const progress = ARC.progress, UNITS = ACADEMY.UNITS;
  const saveProgress = () => ARC.save('progress');
  const render = k => ARC.render(k);
  const ACTIONS = ARC.act;

  /* ---------- vista: Academia ---------- */
  const ALL = [];
  UNITS.forEach(u => u.lessons.forEach(l => ALL.push({ unit: u, lesson: l })));
  const isDone = id => !!progress.done[id];
  function currentIndex() {
    const i = ALL.findIndex(x => !isDone(x.lesson.id));
    return i === -1 ? ALL.length : i;
  }
  function streakNow() {
    return progress.last === dayKey(0) || progress.last === dayKey(-1) ? progress.streak : 0;
  }

  function renderAcad() {
    const cur = currentIndex();
    const total = ALL.length;
    const doneN = ALL.filter(x => isDone(x.lesson.id)).length;
    let html = '<section class="page"><header class="stats">' +
      '<div><b>🔥 ' + streakNow() + '</b><small>racha</small></div>' +
      '<div><b>✨ ' + progress.xp + '</b><small>XP</small></div>' +
      '<div><b>📚 ' + doneN + '/' + total + '</b><small>lecciones</small></div></header>' +
      '<div class="bar"><i style="width:' + Math.round(doneN / total * 100) + '%"></i></div>';
    const off = [0, 38, 58, 38, 0, -38, -58, -38];
    let gi = 0;
    UNITS.forEach(u => {
      html += '<div class="unit"><div class="ub"><span>' + u.emoji + '</span><div><b>' + esc(u.title) + '</b><small>' + esc(u.sub) + '</small></div></div><div class="path">';
      u.lessons.forEach((l, li) => {
        const state = isDone(l.id) ? 'done' : (gi === cur ? 'cur' : (gi < cur ? 'done' : 'lock'));
        html += '<button class="node ' + state + '" style="transform:translateX(' + off[li % off.length] + 'px)" data-a="lesson" data-id="' + l.id + '" ' +
          (state === 'lock' ? 'aria-disabled="true"' : '') + '><span class="ic">' + (state === 'lock' ? '🔒' : l.emoji) + '</span>' +
          (state === 'done' ? '<i class="ck">✓</i>' : '') + '<em>' + esc(l.title) + '</em></button>';
        gi++;
      });
      html += '</div></div>';
    });
    if (cur === ALL.length) html += '<p class="hint c">🎉 ¡Has completado toda la academia! Pronto habrá más.</p>';
    return html + '</section>';
  }

  /* animaciones de la academia */
  let cleanups = [];
  function clearAnims() { cleanups.forEach(f => f()); cleanups = []; }

  function animHTML(name) {
    switch (name) {
      case 'stars': {
        let s = '';
        for (let i = 0; i < 16; i++) {
          s += '<i style="left:' + ((i * 37) % 92 + 3) + '%;top:' + ((i * 53) % 80 + 6) + '%;animation-delay:' + ((i % 7) * 0.4) + 's;font-size:' + (10 + (i % 4) * 5) + 'px">✦</i>';
        }
        return '<div class="anim stars">' + s + '<b class="moon-c">🌙</b></div>';
      }
      case 'cards':
        return '<div class="anim fan"><div class="mc c1">🌙</div><div class="mc c2">☀️</div><div class="mc c3">⭐</div></div>';
      case 'elements':
        return '<div class="anim els"><div class="el fire"><b>🔥</b><small>Fuego</small></div><div class="el water"><b>💧</b><small>Agua</small></div>' +
          '<div class="el air"><b>🌬️</b><small>Aire</small></div><div class="el earth"><b>🌍</b><small>Tierra</small></div></div>';
      case 'fool':
        return '<div class="anim fool"><div class="road"></div><span class="walker">🃏</span><span class="goal">🌍</span>' +
          '<div class="stops"><i>🪄</i><i>🌙</i><i>💞</i><i>🎡</i><i>🦋</i><i>⚡</i><i>⭐</i><i>☀️</i></div></div>';
      case 'breath':
        return '<div class="anim breath"><div class="orb"></div><div class="bt">Prepárate</div></div>';
      case 'moon':
        return '<div class="anim moon"><div class="mbig">🌑</div><div class="mname">Luna nueva</div><div class="mring">' +
          ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'].map(m => '<span>' + m + '</span>').join('') + '</div></div>';
      case 'chakra': {
        const cs = [['#e5484d', 'Raíz'], ['#f76b15', 'Sacro'], ['#f5c542', 'Plexo solar'], ['#30a46c', 'Corazón'], ['#3b82f6', 'Garganta'], ['#6e56cf', 'Tercer ojo'], ['#d9c8ff', 'Corona']].reverse();
        return '<div class="anim chakra">' + cs.map((c, i) => '<div class="ck" style="--c:' + c[0] + ';--d:' + ((6 - i) * 0.35) + 's"><i></i><span>' + c[1] + '</span></div>').join('') + '</div>';
      }
      case 'numbers':
        return '<div class="anim nums"><p style="--d:0s">1+4+0+3+1+9+9+0</p><p style="--d:.9s">= 27</p><p style="--d:1.8s">2 + 7</p><p class="big" style="--d:2.7s">9 ✨</p></div>';
      case 'candle':
        return '<div class="anim candle"><div class="glow"></div><span class="flame">🕯️</span><i class="sp s1">✦</i><i class="sp s2">✦</i><i class="sp s3">✦</i></div>';
      case 'crystals':
        return '<div class="anim gems"><span style="--d:0s">🤍</span><span style="--d:.3s">🟣</span><span style="--d:.6s">🌸</span><span style="--d:.9s">🟡</span><span style="--d:1.2s">⚫</span></div>';
      case 'zodiac': {
        const z = '♈♉♊♋♌♍♎♏♐♑♒♓'.split('');
        return '<div class="anim zod"><div class="wheel">' + z.map((s, i) => '<span style="transform:rotate(' + (i * 30) + 'deg) translateY(-72px) rotate(' + (-i * 30) + 'deg)">' + s + '</span>').join('') +
          '</div><b class="sun">☀️</b></div>';
      }
      case 'shuffle':
        return '<div class="anim shuf"><div class="sc a"></div><div class="sc b"></div><div class="sc c"></div><b>✦</b></div>';
      default:
        return '';
    }
  }

  function initAnim(root) {
    const br = $('.breath', root);
    if (br) {
      const orb = $('.orb', br), bt = $('.bt', br);
      let alive = true; const timers = [];
      const at = (ms, fn) => timers.push(setTimeout(() => alive && fn(), ms));
      const cycle = () => {
        bt.textContent = 'Inhala…'; orb.style.transition = 'transform 4s ease-in-out'; orb.style.transform = 'scale(1.35)';
        at(4000, () => { bt.textContent = 'Sostén'; });
        at(8000, () => { bt.textContent = 'Exhala…'; orb.style.transition = 'transform 6s ease-in-out'; orb.style.transform = 'scale(.7)'; });
        at(14000, cycle);
      };
      orb.style.transform = 'scale(.7)';
      at(600, cycle);
      cleanups.push(() => { alive = false; timers.forEach(clearTimeout); });
    }
    const mo = $('.moon', root);
    if (mo) {
      const ph = [['🌑', 'Luna nueva'], ['🌒', 'Creciente'], ['🌓', 'Cuarto creciente'], ['🌔', 'Gibosa creciente'], ['🌕', 'Luna llena'], ['🌖', 'Gibosa menguante'], ['🌗', 'Cuarto menguante'], ['🌘', 'Menguante']];
      const spans = $$('.mring span', mo);
      let i = 0;
      const tick = () => {
        $('.mbig', mo).textContent = ph[i][0];
        $('.mname', mo).textContent = ph[i][1];
        spans.forEach((s, k) => s.classList.toggle('on', k === i));
        i = (i + 1) % ph.length;
      };
      tick();
      const iv = setInterval(tick, 1300);
      cleanups.push(() => clearInterval(iv));
    }
  }

  /* reproductor de lecciones */
  let A = null;
  function shuffled(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function startLesson(id) {
    const idx = ALL.findIndex(x => x.lesson.id === id);
    if (idx === -1) return;
    if (idx > currentIndex()) { toast('Completa antes la lección anterior 🔒'); return; }
    A = { lesson: ALL[idx].lesson, i: 0, sel: -1, checked: false, right: false, tries: 0, firstTry: 0, quizzes: 0, order: null, finished: false };
    enterStep();
    const ov = $('#overlay');
    ov.hidden = false;
    document.body.classList.add('noscroll');
    renderPlayer();
  }
  function enterStep() {
    const st = A.lesson.steps[A.i];
    A.sel = -1; A.checked = false; A.right = false; A.tries = 0;
    A.order = st && st.t === 'quiz' ? shuffled(st.opts.length) : null;
  }
  function closeLesson() {
    clearAnims();
    A = null;
    $('#overlay').hidden = true;
    $('#overlay').innerHTML = '';
    if ($('#modal').hidden) document.body.classList.remove('noscroll');
    render();
  }

  function renderPlayer() {
    clearAnims();
    const ov = $('#overlay');
    const L = A.lesson;
    if (A.finished) {
      const gain = 10 + A.firstTry * 5;
      let conf = '';
      for (let i = 0; i < 18; i++) conf += '<i style="left:' + ((i * 29) % 100) + '%;animation-delay:' + ((i % 9) * 0.25) + 's">' + ['✨', '⭐', '🌙', '💫'][i % 4] + '</i>';
      ov.innerHTML = '<div class="player done"><div class="confetti">' + conf + '</div><div class="pbody c">' +
        '<div class="trophy">' + L.emoji + '</div><h2>¡Lección completada!</h2><p>' + esc(L.title) + '</p>' +
        '<div class="gain"><b>+' + gain + ' XP</b><small>🔥 Racha: ' + progress.streak + (progress.streak === 1 ? ' día' : ' días') + '</small></div></div>' +
        '<div class="pfoot"><button class="btn primary big" data-a="closeLesson">Continuar</button></div></div>';
      return;
    }
    const st = L.steps[A.i];
    const pct = Math.round(A.i / L.steps.length * 100);
    let body, foot;
    if (st.t === 'learn') {
      body = '<h2>' + esc(st.title) + '</h2>' + animHTML(st.anim) + '<p class="lead">' + st.body + '</p>';
      foot = '<button class="btn primary big" data-a="next">Continuar</button>';
    } else {
      body = '<h2>' + esc(st.q) + '</h2><div class="opts">' + A.order.map(oi => {
        let cls = 'opt';
        if (A.sel === oi) cls += ' sel';
        if (A.checked && A.sel === oi) cls += A.right ? ' ok' : ' bad';
        return '<button class="' + cls + '" data-a="opt" data-i="' + oi + '"' + (A.checked && A.right ? ' disabled' : '') + '>' + esc(st.opts[oi]) + '</button>';
      }).join('') + '</div>';
      if (!A.checked) foot = '<button class="btn primary big" data-a="check"' + (A.sel < 0 ? ' disabled' : '') + '>Comprobar</button>';
      else if (A.right) foot = '<div class="fb ok"><b>¡Correcto! ✨</b><span>' + esc(st.why || '') + '</span></div><button class="btn primary big" data-a="next">Continuar</button>';
      else foot = '<div class="fb bad"><b>Casi… 🌙</b><span>Inténtalo de nuevo.</span></div><button class="btn primary big" data-a="retry">Reintentar</button>';
    }
    ov.innerHTML = '<div class="player"><div class="ptop"><button class="x2" data-a="closeLesson" aria-label="Salir">✕</button>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div></div><div class="pbody">' + body + '</div><div class="pfoot">' + foot + '</div></div>';
    initAnim(ov);
  }

  function finishLesson() {
    const L = A.lesson;
    const first = !isDone(L.id);
    A.finished = true;
    if (first) {
      progress.xp += 10 + A.firstTry * 5;
      progress.done[L.id] = true;
      if (progress.last !== dayKey(0)) {
        progress.streak = progress.last === dayKey(-1) ? progress.streak + 1 : 1;
        progress.last = dayKey(0);
      }
      saveProgress();
    }
    renderPlayer();
  }


  ACTIONS.lesson = function (el) { startLesson(el.dataset.id); };
  ACTIONS.closeLesson = function () { closeLesson(); };
  ACTIONS.opt = function (el) {
      if (A.checked && A.right) return;
      A.sel = Number(el.dataset.i); A.checked = false;
      renderPlayer();
  };
  ACTIONS.check = function () {
      const st = A.lesson.steps[A.i];
      A.checked = true; A.right = A.sel === st.a;
      if (A.right && A.tries === 0) A.firstTry++;
      renderPlayer();
  };
  ACTIONS.retry = function () { A.tries++; A.sel = -1; A.checked = false; renderPlayer(); };
  ACTIONS.next = function () {
      A.i++;
      if (A.i >= A.lesson.steps.length) { finishLesson(); return; }
      enterStep();
      renderPlayer();
  };

  ARC.views.acad = renderAcad;
  // al volver a la pestaña con una lección abierta no se hace nada especial
})();
