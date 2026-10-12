/* "Más": las puertas del códice (se revelan con el progreso), misiones diarias y rachas. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, P = ARC.profile, A = ARC.act;
  P.stats = P.stats || { readings: 0 };

  /* ---------- progreso total: determina qué puertas se abren ---------- */
  function points() {
    var pr = ARC.progress, ch = Object.keys(pr.done || {}).length, books = Object.keys(pr.books || {}).length;
    return ch + books * 5 + (P.stats.readings || 0) + Math.floor((ARC.journal.length || 0) / 2) + Math.floor((pr.xp || 0) / 60) + ((ARC.missionsState && ARC.missionsState().total) || 0);
  }
  var DOORS = [
    { id: 'sky', e: '🌙', n: 'Cielo', t: 'Luna, planetas, carta natal y números', need: 0 },
    { id: 'study', e: '📚', n: 'Estudio', t: 'Cursos, enciclopedia y entrenamiento', need: 0 },
    { id: 'chat', e: '💬', n: 'Sibila', t: 'Tu mentora: conversa y te conoce', need: 0 },
    { id: 'games', e: '🎮', n: 'Juegos', t: 'Adivina, aprende y diviértete', need: 0 },
    { id: 'magic', e: '✨', n: 'Magia', t: 'Rituales, sigilos, sonido y geometría', need: 4, hint: 'Se revela al completar tus primeras lecturas y capítulos' },
    { id: 'codex', e: '📜', n: 'Códice', t: 'La historia secreta de Arcana', need: 8, hint: 'Se revela al seguir estudiando' },
    { id: 'crypt', e: '🕯️', n: 'Cripta', t: 'Lo oscuro, como historia y misterio (+18)', need: 24, hint: 'Solo se abre a quien ya recorrió un buen trecho del camino' },
    { id: 'me', e: '👤', n: 'Yo', t: 'Tu diario, tu perfil y ajustes', need: 0 }
  ];
  function unlocked(id) {
    if (P.revealAll) return true;
    var d = DOORS.filter(function (x) { return x.id === id; })[0]; if (!d) return true;
    return points() >= d.need;
  }
  ARC.unlocked = unlocked; ARC.points = points; ARC.DOORS = DOORS;

  function ring(pct) {
    var r = 22, c = 2 * Math.PI * r;
    return '<svg class="ring2" viewBox="0 0 56 56"><circle cx="28" cy="28" r="' + r + '" class="rbg"/><circle cx="28" cy="28" r="' + r + '" class="rfg" style="stroke-dasharray:' + c.toFixed(1) + ';stroke-dashoffset:' + (c * (1 - pct)).toFixed(1) + '"/></svg>';
  }

  ARC.lockedHTML = function (tab) {
    var d = DOORS.filter(function (x) { return x.id === tab; })[0] || { n: 'Esta puerta', e: '🔒', hint: '' };
    return '<section class="page lockpage"><div class="lockbig">🔒</div><h1>' + d.n + '</h1><p class="hint c">' + esc(d.hint || 'Aún no se ha revelado.') + '</p><p class="kw">Llevas ' + points() + ' de ' + (d.need || 0) + ' sellos</p><button class="btn primary big" data-a="tab" data-tab="more">Volver a Más</button></section>';
  };

  ARC.views.more = function () {
    var pts = points();
    var h = '<section class="page more"><header class="hero small"><h1>Más <span>✦</span></h1><p>Cada puerta guarda algo distinto</p></header><div class="doors">';
    DOORS.forEach(function (d) {
      var open = unlocked(d.id);
      if (open) h += '<button class="door" data-a="tab" data-tab="' + d.id + '"><span class="di">' + d.e + '</span><b>' + d.n + '</b><small>' + esc(d.t) + '</small></button>';
      else h += '<button class="door lock" data-a="doorLocked" data-id="' + d.id + '"><span class="di">🔒</span><b>' + d.n + '</b><small>' + ring(Math.min(1, pts / d.need)) + ' ' + pts + ' / ' + d.need + '</small></button>';
    });
    h += '</div><p class="fine">Tu avance (' + pts + ' sellos) abre nuevas puertas. Puedes verlo todo desde Yo → Ajustes si lo prefieres.</p></section>';
    return h;
  };
  A.doorLocked = function (el) {
    var d = DOORS.filter(function (x) { return x.id === el.dataset.id; })[0];
    ARC.openModal('<div class="det"><div class="lockbig">🔒</div><h3>' + d.n + '</h3><p class="hint c">' + esc(d.hint || '') + '</p><p class="kw">Llevas ' + points() + ' de ' + d.need + ' sellos</p><p class="hint c">Los sellos se ganan estudiando, leyendo las cartas, escribiendo en tu diario y cumpliendo tus misiones diarias.</p><button class="btn primary big" data-a="close">Seguir avanzando</button></div>');
  };

  /* ---------- misiones diarias ---------- */
  var MS = ARC.store.get('arcana.missions', { date: '', done: {}, total: 0, streak: 0, last: '' });
  function save() { ARC.store.set('arcana.missions', MS); }
  function roll() {
    var today = ARC.dayKey(0);
    if (MS.date !== today) { MS.date = today; MS.done = {}; save(); }
  }
  ARC.missionsState = function () { roll(); return MS; };
  var MISSIONS = [
    ['checkin', '🌤️', 'Chequeo de ánimo', 'Cómo te sientes hoy'], ['carta', '🃏', 'Tu carta del día', 'Descúbrela y reflexiona'],
    ['respira', '🌬️', 'Respira un minuto', 'Calma tu cuerpo'], ['reflexion', '📓', 'Una reflexión', 'Escribe unas líneas']
  ];
  ARC.mission = function (id) {
    roll(); if (MS.done[id]) return;
    MS.done[id] = true; MS.total++; ARC.progress.xp += 5;
    var all = MISSIONS.every(function (m) { return MS.done[m[0]]; });
    if (all) { ARC.progress.xp += 10; if (MS.last !== MS.date) { MS.streak = MS.last === ARC.dayKey(-1) ? MS.streak + 1 : 1; MS.last = MS.date; } ARC.toast('Misiones completas ✨ +10 XP'); }
    save(); ARC.save('progress');
  };
  ARC.missionsHTML = function () {
    roll();
    var n = MISSIONS.filter(function (m) { return MS.done[m[0]]; }).length;
    return '<div class="group"><div class="grow head"><div class="rwrap">' + ring(n / MISSIONS.length) + '<b>' + n + '/' + MISSIONS.length + '</b></div><div><b>Tus misiones de hoy</b><small>' + (MS.last === ARC.dayKey(0) || MS.last === ARC.dayKey(-1) ? '🔥 Racha de ' + MS.streak + (MS.streak === 1 ? ' día' : ' días') : 'Empieza tu racha hoy') + '</small></div></div>' +
      MISSIONS.map(function (m) { var d = !!MS.done[m[0]]; return '<button class="grow' + (d ? ' done' : '') + '" data-a="mission" data-id="' + m[0] + '"><span class="gi">' + m[1] + '</span><div><b>' + m[2] + '</b><small>' + m[3] + '</small></div><span class="chk">' + (d ? '✓' : '') + '</span></button>'; }).join('') + '</div>';
  };
  var MOODS = [['😔', 'Bajo'], ['😕', 'Regular'], ['😐', 'Neutral'], ['🙂', 'Bien'], ['😄', 'Genial']];
  A.mission = function (el) {
    var id = el.dataset.id;
    if (id === 'checkin') {
      ARC.openModal('<h3>¿Cómo te sientes hoy?</h3><div class="moods">' + MOODS.map(function (m, i) { return '<button data-a="moodPick" data-i="' + i + '"><span>' + m[0] + '</span><small>' + m[1] + '</small></button>'; }).join('') + '</div><textarea id="moodnote" rows="3" placeholder="Si quieres, cuéntalo en una frase…"></textarea>');
    } else if (id === 'carta') { ARC.go('home'); ARC.act.dayFlip && ARC.act.dayFlip(); ARC.mission('carta'); ARC.render(true); }
    else if (id === 'respira') { breathe(); }
    else if (id === 'reflexion') { ARC.act.promptWrite && ARC.act.promptWrite(); }
  };
  A.moodPick = function (el) {
    var i = Number(el.dataset.i), note = ($('#moodnote') || {}).value || '';
    P.moods = P.moods || []; P.moods.unshift({ ts: Date.now(), v: i + 1, note: note }); P.moods = P.moods.slice(0, 400); ARC.save('profile');
    ARC.closeModal(); ARC.mission('checkin'); ARC.render(true); ARC.toast('Anotado ' + MOODS[i][0]);
  };
  var bTimer = null;
  function breathe() {
    ARC.openModal('<div class="breathm"><h3>Respira un minuto</h3><div class="orbwrap"><div class="bigorb" id="bigorb"></div><div class="bword" id="bword">Prepárate</div></div><p class="hint c" id="bleft">60 s</p><button class="btn ghost" data-a="breatheStop">Terminar</button></div>');
    var left = 60, phase = 0, orb = $('#bigorb'), word = $('#bword'), lab = $('#bleft');
    var cycle = [['Inhala', 4000, 1.35], ['Sostén', 2000, 1.35], ['Exhala', 6000, 0.72]], idx = 0;
    function step() { if (!$('#bigorb')) return; var c = cycle[idx % 3]; word.textContent = c[0]; orb.style.transition = 'transform ' + c[1] + 'ms ease-in-out'; orb.style.transform = 'scale(' + c[2] + ')'; setTimeout(function () { idx++; if (left > 0 && $('#bigorb')) step(); }, c[1]); }
    clearInterval(bTimer); bTimer = setInterval(function () { left--; var l = $('#bleft'); if (l) l.textContent = Math.max(left, 0) + ' s'; if (left <= 0 || !$('#bigorb')) { clearInterval(bTimer); if (left <= 0) { ARC.mission('respira'); ARC.closeModal(); ARC.render(true); ARC.toast('Bien hecho 🌬️'); } } }, 1000);
    step();
  }
  A.breatheStop = function () { clearInterval(bTimer); ARC.closeModal(); };
  ARC.breathe = breathe;
})();
