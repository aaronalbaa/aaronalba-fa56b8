/* Péndulo: digital (física, tablero y movimiento del móvil) y manual guiado con calibración. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, P = ARC.profile, A = ARC.act;
  var TAU = Math.PI * 2;

  var LET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  var BOARDS = {
    yesno: { n: 'Sí / No', e: '✅', items: [['SÍ', 0], ['QUIZÁ', -90], ['NO', 180], ['REFORMULA', 90]], full: true, hint: 'Cuatro zonas: sí a la derecha, no a la izquierda, quizá arriba y "reformula" abajo.' },
    letters: { n: 'Alfabeto', e: '🔤', items: LET.map(function (l, i) { return [l, 180 + (i / (LET.length - 1)) * 180]; }), full: false, hint: 'Cada tirada añade una letra. Forma una palabra con paciencia.' },
    numbers: { n: 'Números', e: '🔢', items: '0123456789'.split('').map(function (l, i) { return [l, 180 + (i / 9) * 180]; }), full: false, hint: 'Cada tirada añade un dígito.' },
    zodiac: { n: 'Zodiaco', e: '♈', items: ASTRO.SIGNS.map(function (s, i) { return [s.g + '︎', -90 + i * 30]; }), full: true, hint: 'Doce signos alrededor del círculo.' },
    chakras: { n: 'Chakras', e: '🌈', items: [['Raíz', 90], ['Sacro', 128], ['Plexo', 166], ['Corazón', -135 + 180], ['Garganta', 232], ['3er ojo', 270], ['Corona', 308]], full: false, hint: 'Siete centros energéticos: ¿cuál pide atención?' }
  };
  var PN = { mode: 'digital', board: 'yesno', q: '', phase: 'setup', word: '', result: null, run: null, tilt: false, left: 0, cal: P.pendCal || null, manual: { step: 0, yes: null, no: null, seen: null } };
  var raf = null, anim = null;

  function norm360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function zoneOf(board, x, y) {
    var r = Math.sqrt(x * x + y * y); if (r < 0.32) return null;
    var ang = norm360(Math.atan2(y, x) * 180 / Math.PI), best = null, bd = 999;
    BOARDS[board].items.forEach(function (it) { var d = Math.abs(((ang - norm360(it[1])) + 540) % 360 - 180); if (d < bd) { bd = d; best = it[0]; } });
    return bd < (BOARDS[board].items.length > 14 ? 9 : BOARDS[board].items.length > 7 ? 18 : 45) ? best : null;
  }

  /* ---------- vistas ---------- */
  function setupHTML() {
    return '<section class="page"><button class="btn link left" data-a="hub">← Todos los métodos</button><header class="hero"><h1>🔮 Péndulo</h1><p>Un espejo de tu intuición, digital o con tu propio péndulo</p></header>' +
      '<div class="panel"><div class="seg"><button data-a="pnMode" data-v="digital" class="' + (PN.mode === 'digital' ? 'on' : '') + '">📱 Digital</button><button data-a="pnMode" data-v="manual" class="' + (PN.mode === 'manual' ? 'on' : '') + '">🧶 Manual guiado</button></div>' +
      '<p class="hint">' + (PN.mode === 'digital' ? 'Un péndulo en pantalla que se mueve con tu pulso, el azar y (si quieres) el movimiento de tu móvil.' : 'Usas tu propio péndulo físico; yo te guío para calibrarlo e interpretar su movimiento.') + '</p>' +
      '<div class="lbl">Tu pregunta</div><textarea id="pnq" rows="3" maxlength="240" placeholder="Formula una pregunta clara…">' + esc(PN.q) + '</textarea>' +
      (PN.mode === 'digital' ? '<div class="lbl">Tablero</div><div class="spreads">' + Object.keys(BOARDS).map(function (k) { var b = BOARDS[k]; return '<button class="spread' + (PN.board === k ? ' on' : '') + '" data-a="pnBoard" data-v="' + k + '"><b>' + b.e + '</b><span>' + b.n + '</span></button>'; }).join('') + '</div><p class="hint">' + esc(BOARDS[PN.board].hint) + '</p>' : '') +
      '<button class="btn primary big" data-a="pnStart">' + (PN.mode === 'digital' ? 'Preparar el péndulo' : 'Empezar la guía') + '</button></div><p class="fine">El péndulo no predice el futuro: el movimiento se debe en gran parte a microgestos involuntarios (efecto ideomotor). Úsalo para escuchar tu intuición.</p></section>';
  }

  function digitalHTML() {
    var b = BOARDS[PN.board];
    return '<section class="page pndl"><header class="qh"><small>Péndulo · ' + b.n + '</small>' + (PN.q ? '<h2>“' + esc(PN.q) + '”</h2>' : '<h2>Pregunta libre</h2>') + '</header>' +
      '<div class="pcanvas"><canvas id="pcv" width="640" height="640"></canvas></div>' +
      (PN.word ? '<div class="pword">' + esc(PN.word) + '</div>' : '') +
      '<div class="pstat" id="pstat">' + (PN.phase === 'run' ? 'Concéntrate… ' + PN.left + ' s' : PN.result ? 'Respuesta: ' + esc(PN.result) : 'Sostén la pregunta en la mente y pulsa el botón') + '</div>' +
      '<div class="actions">' + (PN.phase === 'run' ? '<button class="btn ghost" disabled>El péndulo se está moviendo…</button>' : '<button class="btn primary big" data-a="pnSwing">' + (PN.result ? 'Preguntar otra vez' : 'Soltar el péndulo') + '</button>') +
      '<button class="btn ghost sm" data-a="pnTilt">' + (PN.tilt ? '✓ Usando el movimiento del móvil' : '📳 Usar el movimiento del móvil') + '</button>' +
      (PN.result ? '<button class="btn ghost" data-a="pnInterpret">✨ Interpretar con Sibila</button><button class="btn ghost" data-a="pnSave">📓 Guardar en mi diario</button>' : '') +
      '<button class="btn link" data-a="pnSetup">← Cambiar tablero</button></div><div id="pnai"></div></section>';
  }

  var STEPS = [
    ['Sujeta el hilo', 'Toma el hilo entre el pulgar y el índice, con el codo apoyado y el péndulo a unos dos dedos de la mesa. Respira y deja que quede quieto.'],
    ['Calibra el SÍ', 'Pregunta en voz alta: «Mi nombre es ' + (P.name || 'el que tengo') + '». Es verdad: observa cómo se mueve tu péndulo. Ese es tu SÍ.'],
    ['Calibra el NO', 'Ahora pregunta algo que sepas falso (por ejemplo, un nombre que no es el tuyo). Observa el movimiento: ese es tu NO.'],
    ['Haz tu pregunta', 'Concéntrate en tu pregunta, formúlala en voz alta y suelta el cuerpo. Observa sin forzar durante unos segundos.']
  ];
  var MOVES = [['Adelante y atrás', '↕️'], ['De lado a lado', '↔️'], ['Círculo horario', '🔃'], ['Círculo antihorario', '🔄'], ['Se queda quieto', '⏸️']];
  function manualHTML() {
    var m = PN.manual, st = STEPS[Math.min(m.step, 3)], body = '';
    if (m.step === 0) body = '<button class="btn primary big" data-a="pnM" data-v="next">Estoy listo/a</button>';
    else if (m.step === 1 || m.step === 2) body = '<div class="lbl">¿Cómo se movió?</div><div class="chips wrap">' + MOVES.slice(0, 4).map(function (x) { return '<button data-a="pnM" data-v="set" data-w="' + esc(x[0]) + '" class="' + ((m.step === 1 ? m.yes : m.no) === x[0] ? 'on' : '') + '">' + x[1] + ' ' + x[0] + '</button>'; }).join('') + '</div>' + ((m.step === 1 ? m.yes : m.no) ? '<button class="btn primary big" data-a="pnM" data-v="next">Continuar</button>' : '');
    else if (m.step === 3) body = '<div class="lbl">¿Qué observaste?</div><div class="chips wrap">' + MOVES.map(function (x) { return '<button data-a="pnM" data-v="seen" data-w="' + esc(x[0]) + '" class="' + (m.seen === x[0] ? 'on' : '') + '">' + x[1] + ' ' + x[0] + '</button>'; }).join('') + '</div>' + (m.seen ? '<button class="btn primary big" data-a="pnM" data-v="answer">Ver la respuesta</button>' : '');
    else {
      var ans = m.seen === m.yes ? 'SÍ' : m.seen === m.no ? 'NO' : m.seen === 'Se queda quieto' ? 'AÚN NO' : 'QUIZÁ';
      PN.result = ans;
      return '<section class="page"><header class="qh"><small>Péndulo manual</small>' + (PN.q ? '<h2>“' + esc(PN.q) + '”</h2>' : '') + '</header><div class="answer"><b>' + ans + '</b><p>' + esc(manualText(ans)) + '</p></div><div class="actions"><button class="btn ghost" data-a="pnInterpret">✨ Interpretar con Sibila</button><button class="btn ghost" data-a="pnSave">📓 Guardar en mi diario</button><button class="btn ghost" data-a="pnM" data-v="again">Otra pregunta</button><button class="btn link" data-a="pnSetup">← Salir</button></div><div id="pnai"></div></section>';
    }
    return '<section class="page"><button class="btn link left" data-a="pnSetup">← Salir</button><div class="gsteps">' + [0, 1, 2, 3].map(function (i) { return '<span class="' + (i === m.step ? 'on' : i < m.step ? 'done' : '') + '">' + (i + 1) + '</span>'; }).join('') + '</div><div class="gbody"><h2>' + esc(st[0]) + '</h2><p class="lead">' + esc(st[1]) + '</p>' + body + '</div></section>';
  }
  function manualText(ans) {
    return ans === 'SÍ' ? 'Tu péndulo indica afirmación. Pregúntate si el sí te trae calma o inquietud: también eso es una respuesta.' : ans === 'NO' ? 'Tu péndulo indica negación. Observa qué sientes al recibirla: alivio, tristeza o resistencia.' : ans === 'AÚN NO' ? 'El péndulo se queda quieto: puede que no sea el momento, o que la pregunta necesite otra forma. Reformúlala con calma.' : 'El movimiento no coincide con tu SÍ ni con tu NO: la respuesta aún no está clara. Pregúntate qué te impide decidir.';
  }

  function html() {
    var R = ARC.R;
    if (PN.phase === 'setup') return setupHTML();
    return PN.mode === 'digital' ? digitalHTML() : manualHTML();
  }

  /* ---------- simulación ---------- */
  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; if (window.removeEventListener) window.removeEventListener('devicemotion', onMotion); }
  var ax = 0, ay = 0, pointer = null;
  function onMotion(e) { var a = e.accelerationIncludingGravity || e.acceleration; if (!a) return; ax = (a.x || 0) / 9.8; ay = -(a.y || 0) / 9.8; }
  function draw() {
    var cv = $('#pcv'); if (!cv) { stop(); return; }
    var c = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / 2, cy = H / 2, R0 = W * 0.42, S = anim, b = BOARDS[PN.board], now = performance.now();
    // física
    var dt = Math.min(0.033, (now - S.t) / 1000); S.t = now;
    var tx = 0, ty = 0;
    if (pointer) { tx = pointer.x; ty = pointer.y; }
    var fx = -9 * (S.x - tx) - 1.6 * S.vx, fy = -9 * (S.y - ty) - 1.6 * S.vy;
    if (S.running) {
      S.noise += dt; var ph = S.noise * 1.3;
      fx += Math.sin(ph * 1.7 + S.p1) * 1.6 + Math.cos(ph * 0.9 + S.p2) * 1.1; fy += Math.cos(ph * 1.3 + S.p3) * 1.6 + Math.sin(ph * 0.7 + S.p4) * 1.1;
      var k = Math.min(1, S.noise / 5) * 3.4; fx += S.bx * k; fy += S.by * k;
    }
    if (PN.tilt) { fx += ax * 8; fy += ay * 8; }
    S.vx += fx * dt; S.vy += fy * dt; S.x += S.vx * dt; S.y += S.vy * dt;
    var rr = Math.sqrt(S.x * S.x + S.y * S.y); if (rr > 0.96) { S.x *= 0.96 / rr; S.y *= 0.96 / rr; S.vx *= 0.5; S.vy *= 0.5; }
    S.trail.push([S.x, S.y]); if (S.trail.length > 70) S.trail.shift();
    var zone = zoneOf(PN.board, S.x, S.y);
    if (S.running) { if (zone) S.dwell[zone] = (S.dwell[zone] || 0) + dt * (S.noise > 3 ? 1.6 : 1); S.left -= dt; }
    // dibujo
    c.clearRect(0, 0, W, H);
    var g = c.createRadialGradient(cx, cy, 10, cx, cy, R0 * 1.15); g.addColorStop(0, '#1d1738'); g.addColorStop(1, '#0d0b14'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R0 * 1.12, 0, TAU); c.fill();
    c.strokeStyle = '#e6c97a66'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R0, 0, TAU); c.stroke(); c.strokeStyle = '#e6c97a22'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, R0 * 0.32, 0, TAU); c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    b.items.forEach(function (it) {
      var a = it[1] * Math.PI / 180, lx = cx + Math.cos(a) * R0 * 0.78, ly = cy + Math.sin(a) * R0 * 0.78, hot = S.hot === it[0];
      c.fillStyle = hot ? '#e6c97a' : '#9a93b0'; c.font = (hot ? '700 ' : '500 ') + (b.items.length > 14 ? 30 : b.items.length > 7 ? 34 : 38) + 'px Georgia, serif';
      c.save(); if (hot) { c.shadowColor = '#e6c97a'; c.shadowBlur = 24; } c.fillText(it[0], lx, ly); c.restore();
    });
    // estela y cuerda
    var bx = cx + S.x * R0, by2 = cy + S.y * R0;
    c.lineWidth = 3; for (var i = 1; i < S.trail.length; i++) { c.strokeStyle = 'rgba(139,108,255,' + (i / S.trail.length * 0.5) + ')'; c.beginPath(); c.moveTo(cx + S.trail[i - 1][0] * R0, cy + S.trail[i - 1][1] * R0); c.lineTo(cx + S.trail[i][0] * R0, cy + S.trail[i][1] * R0); c.stroke(); }
    c.strokeStyle = '#e6c97a88'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy - R0 * 1.05); c.lineTo(bx, by2); c.stroke();
    var bg = c.createRadialGradient(bx - 8, by2 - 8, 2, bx, by2, 32); bg.addColorStop(0, '#fff'); bg.addColorStop(0.3, '#cdbaff'); bg.addColorStop(1, '#6a4df0'); c.fillStyle = bg; c.shadowColor = '#8b6cff'; c.shadowBlur = 30; c.beginPath(); c.arc(bx, by2, 26, 0, TAU); c.fill(); c.shadowBlur = 0;
    // resultado
    if (S.running) {
      var st = $('#pstat'); if (st) st.textContent = 'Concéntrate… ' + Math.max(0, Math.ceil(S.left)) + ' s';
      S.hot = zone;
      if (S.left <= 0) finish();
    }
    raf = requestAnimationFrame(draw);
  }
  function finish() {
    var S = anim, best = null, bv = 0; Object.keys(S.dwell).forEach(function (k) { if (S.dwell[k] > bv) { bv = S.dwell[k]; best = k; } });
    if (!best) { var items = BOARDS[PN.board].items; best = items[ARC.rnd(items.length)][0]; }
    S.running = false; S.hot = best; PN.phase = 'done'; PN.result = best;
    if (PN.board === 'letters' || PN.board === 'numbers') PN.word += best;
    ARC.render(true); startLoop(true);
  }
  function startLoop(keep) {
    stop(); if (!$('#pcv')) return;
    if (!keep || !anim) anim = { x: 0, y: 0, vx: 0, vy: 0, t: performance.now(), trail: [], dwell: {}, running: false, noise: 0, left: 0, hot: PN.result, p1: Math.random() * 6, p2: Math.random() * 6, p3: Math.random() * 6, p4: Math.random() * 6, bx: 0, by: 0 };
    else anim.t = performance.now();
    var cv = $('#pcv');
    var toP = function (e) { var r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; return { x: ((t.clientX - r.left) / r.width - 0.5) / 0.42 * 0.5, y: ((t.clientY - r.top) / r.height - 0.5) / 0.42 * 0.5 }; };
    cv.onpointerdown = function (e) { pointer = toP(e); cv.setPointerCapture && cv.setPointerCapture(e.pointerId); };
    cv.onpointermove = function (e) { if (pointer) pointer = toP(e); };
    cv.onpointerup = cv.onpointercancel = function () { pointer = null; };
    if (PN.tilt) window.addEventListener('devicemotion', onMotion);
    raf = requestAnimationFrame(draw);
  }

  /* ---------- interpretación ---------- */
  function interpretText() {
    var r = PN.result;
    return '“' + (PN.q || 'Pregunta libre') + '” → «' + r + '». ' + (PN.board === 'yesno' || PN.mode === 'manual' ? manualText(r) : 'Tu péndulo señala «' + r + '». Pregúntate qué te sugiere esa respuesta y cómo te hace sentir.');
  }
  A.pnInterpret = function () {
    ARC.ai.guard(function () {
      var box = $('#pnai'); if (box) box.innerHTML = '<div class="ai load"><div class="orb-s"></div><p>Sibila lo está meditando…</p></div>';
      var user = 'CONTEXTO\n' + ARC.ctx() + '\n\nPregunta: ' + (PN.q || '(libre)') + '\nHerramienta: péndulo ' + (PN.mode === 'manual' ? 'manual' : 'digital, tablero ' + BOARDS[PN.board].n) + '\nRespuesta obtenida: ' + PN.result + (PN.word ? '\nPalabra formada: ' + PN.word : '') + '\n\nInterpreta la respuesta de forma personal y honesta (máx. 170 palabras): recuerda que el péndulo es un espejo de la intuición, conecta con lo que sabes de la persona y termina con una pregunta de introspección.';
      ARC.ai.ask({ system: 'Eres una guía sabia y respetuosa que escribe en español. No presentes el péndulo como una fuente de certezas sobre el futuro; es una herramienta de intuición. ' + ARC.PERSONALIZE, messages: [{ role: 'user', content: user }], max: 450 })
        .then(function (t) { var b2 = $('#pnai'); if (b2) b2.innerHTML = '<div class="ai">' + ARC.fmt(t) + '</div>'; })
        .catch(function (e) { var b2 = $('#pnai'); if (b2) b2.innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
    });
  };
  A.pnSave = function () {
    ARC.draft = { type: 'lectura', title: 'Péndulo · ' + PN.result, question: PN.q, items: ['Respuesta: ' + PN.result + (PN.word ? ' · palabra: ' + PN.word : '')], ai: '' };
    ARC.openModal('<h3>📓 Guardar en mi diario</h3><p class="hint">' + esc(interpretText()) + '</p><textarea id="jnote" rows="5" placeholder="¿Cómo te sientes con esta respuesta?"></textarea><button class="btn primary big" data-a="journalSave">Guardar</button>');
  };

  /* ---------- acciones ---------- */
  A.pnMode = function (el) { PN.mode = el.dataset.v; ARC.render(true); };
  A.pnBoard = function (el) { PN.board = el.dataset.v; PN.word = ''; ARC.render(true); };
  A.pnSetup = function () { stop(); PN.phase = 'setup'; PN.result = null; PN.word = ''; PN.manual = { step: 0, yes: null, no: null, seen: null }; ARC.render(); };
  A.pnStart = function () { PN.q = ($('#pnq') || {}).value || PN.q; PN.phase = 'ready'; PN.result = null; PN.word = ''; ARC.render(); setTimeout(function () { if (PN.mode === 'digital') startLoop(false); }, 50); };
  A.pnSwing = function () {
    if (!anim) startLoop(false);
    var items = BOARDS[PN.board].items, tgt = items[ARC.rnd(items.length)], ang = tgt[1] * Math.PI / 180;
    anim.dwell = {}; anim.noise = 0; anim.left = 9; anim.running = true; anim.hot = null; anim.bx = Math.cos(ang); anim.by = Math.sin(ang); PN.phase = 'run'; PN.result = null; PN.left = 9;
    ARC.render(true); startLoop(true);
  };
  A.pnTilt = function () {
    if (PN.tilt) { PN.tilt = false; window.removeEventListener('devicemotion', onMotion); ARC.render(true); startLoop(true); return; }
    var go = function () { PN.tilt = true; ARC.render(true); startLoop(true); ARC.toast('Inclina el móvil para mover el péndulo'); };
    if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') DeviceMotionEvent.requestPermission().then(function (s) { if (s === 'granted') go(); else ARC.toast('Permiso denegado'); }).catch(function () { ARC.toast('No se pudo activar el movimiento'); });
    else if (window.DeviceMotionEvent) go(); else ARC.toast('Tu dispositivo no tiene sensor de movimiento');
  };
  A.pnM = function (el) {
    var m = PN.manual, v = el.dataset.v;
    if (v === 'next') m.step++;
    else if (v === 'set') { if (m.step === 1) m.yes = el.dataset.w; else m.no = el.dataset.w; }
    else if (v === 'seen') m.seen = el.dataset.w;
    else if (v === 'answer') m.step = 4;
    else if (v === 'again') { m.step = 3; m.seen = null; PN.result = null; }
    ARC.render(true);
  };
  ARC.inputs.pnq = function (v) { PN.q = v; };

  ARC.pend = { html: html, after: function () { if (PN.phase !== 'setup' && PN.mode === 'digital') { startLoop(true); } else stop(); }, stop: stop };
})();
