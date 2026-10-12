/* Cripta (+18): tablero Ouija digital (entretenimiento), test del valle inquietante y ambiente sonoro. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, A = ARC.act;
  var CR = ARC.store.get('arcana.crypt', { oui: [], uv: null });
  function save() { CR.rev = Date.now(); ARC.store.set('arcana.crypt', CR); }

  /* ---------- Ouija ---------- */
  var OB = { q: '', busy: false, word: '', log: [], px: 50, py: 62, mode: 'offline', scene: false };
  var ROW1 = 'ABCDEFGHIJKLM'.split(''), ROW2 = 'NÑOPQRSTUVWXYZ'.split(''), NUMS = '1234567890'.split('');
  var BANK = ['SI', 'NO', 'QUIZA', 'ESPERA', 'ESCUCHA', 'LUZ', 'SOMBRA', 'NADIE', 'TODOS', 'AHORA', 'PRONTO', 'TU', 'MIRA', 'ADENTRO', 'SILENCIO', 'ELIGE', 'CONFIA', 'RECUERDA', 'LA PUERTA', 'AGUA', 'NOCHE', 'ALGUIEN TE ESPERA', 'MAS TARDE', 'EL ESPEJO', 'TU MIEDO', 'DESPIERTA', 'VUELVE', 'LA LLAVE'];
  var ANS = ['SI', 'NO', 'QUIZA'];
  // posiciones (porcentaje) de cada símbolo del tablero
  var POS = {};
  (function layout() {
    function arc(arr, cy, r, a0, a1) { arr.forEach(function (c, i) { var a = a0 + (a1 - a0) * i / (arr.length - 1); POS[c] = [50 + r * Math.cos(a), cy + r * Math.sin(a) * 0.55]; }); }
    arc(ROW1, 58, 38, Math.PI * 1.12, Math.PI * 1.88);
    arc(ROW2, 74, 38, Math.PI * 1.1, Math.PI * 1.9);
    NUMS.forEach(function (c, i) { POS[c] = [20 + i * 7.1, 88]; });
    POS['SI'] = [22, 26]; POS['NO'] = [78, 26]; POS['ADIOS'] = [50, 96]; POS[' '] = [50, 62];
  })();
  function glyphs() {
    var h = '';
    ROW1.concat(ROW2).concat(NUMS).forEach(function (c) { var p = POS[c]; h += '<i class="og" style="left:' + p[0] + '%;top:' + p[1] + '%" data-c="' + c + '">' + c + '</i>'; });
    return h + '<i class="og big" style="left:22%;top:26%">SÍ</i><i class="og big" style="left:78%;top:26%">NO</i><i class="og" style="left:50%;top:96%;font-size:12px">ADIÓS</i><i class="oc" style="left:50%;top:8%">☾ ☼</i>';
  }
  function ouijaHTML() {
    var h = '<div class="panel oui"><p class="hint c">⚠️ Es un juego de entretenimiento. Las respuestas las genera la aplicación; no hay nadie al otro lado. Si te inquieta, ciérrala y ve a la sección «Ouija y espiritismo» para entender el efecto ideomotor.</p>' +
      '<div class="oboard" id="oboard">' + glyphs() + '<div class="plan" id="plan" style="left:' + OB.px + '%;top:' + OB.py + '%"><span></span></div></div>' +
      '<div class="oword" id="oword">' + esc(OB.word) + '</div>' +
      '<input id="oq" placeholder="Haz tu pregunta (sí/no o abierta)…" maxlength="120" value="' + esc(OB.q) + '" autocomplete="off">' +
      '<div class="seg"><button data-a="ouMode" data-v="offline" class="' + (OB.mode === 'offline' ? 'on' : '') + '">🎲 Respuestas al azar</button><button data-a="ouMode" data-v="ai" class="' + (OB.mode === 'ai' ? 'on' : '') + '">✨ Con Sibila</button></div>' +
      '<button class="btn primary big" data-a="ouAsk"' + (OB.busy ? ' disabled' : '') + '>' + (OB.busy ? 'Escuchando…' : '🕯️ Preguntar') + '</button><div class="row2"><button class="btn ghost" data-a="ouScene">🔊 Ambiente</button><button class="btn ghost" data-a="ouBye">Decir adiós</button></div></div>';
    if (OB.log.length) h += '<div class="lbl pad">Sesión</div><div class="group">' + OB.log.slice(0, 8).map(function (l) { return '<div class="grow"><div><b>' + esc(l.a) + '</b><small>' + esc(l.q) + '</small></div></div>'; }).join('') + '</div>';
    return h;
  }
  ARC.inputs.oq = function (v) { OB.q = v; };
  A.ouMode = function (el) { OB.q = ($('#oq') || {}).value || OB.q; OB.mode = el.dataset.v; ARC.render(true); };
  A.ouBye = function () { move('ADIOS', function () { OB.word = 'ADIÓS'; var w = $('#oword'); if (w) w.textContent = OB.word; setTimeout(function () { OB.word = ''; OB.px = 50; OB.py = 62; ARC.render(true); }, 1500); }); };
  A.ouScene = function () { if (ARC.sound) { if (ARC.sound.state.on) ARC.sound.stop(); else { ARC.act.sndScene({ dataset: { v: 'cripta' } }); } } };
  function move(sym, cb) {
    var p = POS[sym] || POS[' '], pl = $('#plan'); if (!pl) return;
    pl.style.transition = 'left 1.3s cubic-bezier(.45,.05,.3,1), top 1.3s cubic-bezier(.45,.05,.3,1)'; pl.style.left = (p[0] + (Math.random() * 1.4 - 0.7)) + '%'; pl.style.top = (p[1] + (Math.random() * 1.4 - 0.7)) + '%'; OB.px = p[0]; OB.py = p[1];
    setTimeout(cb, 1500);
  }
  function spell(txt, i, done) {
    var norm = ARC.norm(txt).toUpperCase().replace(/[^A-Z0-9 ]/g, '');
    if (i >= norm.length) { done(); return; }
    var ch = norm[i]; if (ch === ' ') { OB.word += ' '; setTimeout(function () { spell(txt, i + 1, done); }, 300); return; }
    move(ch, function () { OB.word += ch; var w = $('#oword'); if (w) w.textContent = OB.word; spell(txt, i + 1, done); });
  }
  A.ouAsk = function () {
    var q = ($('#oq') || {}).value || OB.q; q = q.trim(); if (!q || OB.busy) { ARC.toast('Escribe tu pregunta'); return; } OB.q = q;
    function run(ans) {
      OB.busy = true; OB.word = ''; ARC.render(true);
      setTimeout(function () {
        var short = ARC.norm(ans).toUpperCase().trim(); var yn = ANS.indexOf(short) > -1;
        function after() { OB.log.unshift({ q: q, a: ans.toUpperCase() }); OB.busy = false; CR.oui = OB.log.slice(0, 20); save(); setTimeout(function () { OB.px = 50; OB.py = 62; var pl = $('#plan'); if (pl) { pl.style.left = '50%'; pl.style.top = '62%'; } var b = document.querySelector('[data-a=ouAsk]'); if (b) { b.disabled = false; b.textContent = '🕯️ Preguntar'; } }, 2500); }
        if (yn) move(short, function () { OB.word = short === 'SI' ? 'SÍ' : short; var w = $('#oword'); if (w) w.textContent = OB.word; after(); });
        else spell(ans, 0, after);
      }, 700);
    }
    if (OB.mode === 'ai') {
      ARC.ai.guard(function () {
        OB.busy = true; ARC.render(true);
        ARC.ai.ask({ system: 'Eres el narrador de un juego de tablero Ouija de entretenimiento. Respondes SOLO con una palabra o frase MUY breve (máx. 3 palabras) en mayúsculas sin acentos, enigmática pero amable, o SI/NO/QUIZA si la pregunta es de sí/no. Nunca des consejos médicos ni legales, nunca hables de muertes reales ni de dañar a nadie, nunca pretendas ser una persona fallecida real.', messages: [{ role: 'user', content: 'Pregunta: ' + q }], max: 20 })
          .then(function (t) { var a = (t || '').split(/\n/)[0].replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, '').trim().slice(0, 28) || 'SILENCIO'; OB.busy = false; run(a); })
          .catch(function () { OB.busy = false; run(BANK[ARC.rnd(BANK.length)]); });
      }); return;
    }
    var yesno = /^(¿)?(es|esta|hay|tengo|debo|puedo|podre|sera|voy|va|me|se|ser[ae]|existe|volver|tiene|habr|deber|conviene|merece|funcion)/i.test(ARC.norm(q));
    run(yesno ? ANS[ARC.rnd(3)] : BANK[ARC.rnd(BANK.length)]);
  };

  /* ---------- Test del valle inquietante ---------- */
  var UV = { i: 0, rate: [] };
  function face(l) { // l: 0..6, realismo creciente; 5-6 con pequeños errores
    var skin = ['#e6c97a', '#f0cf9a', '#f2d3b0', '#efc9a8', '#edc7a6', '#e8c3a2', '#e4bf9f'][l], eyeR = [10, 8.5, 7, 6, 5.2, 5, 4.8][l], eyeY = 44, gap = [17, 16, 15, 14, 13, 13, 13][l];
    var svg = '<svg viewBox="0 0 100 120" class="uvface"><defs><radialGradient id="sk' + l + '" cx="50%" cy="40%"><stop offset="0" stop-color="' + skin + '"/><stop offset="1" stop-color="' + (l > 2 ? '#c9a07c' : skin) + '"/></radialGradient></defs>';
    svg += '<ellipse cx="50" cy="58" rx="' + (l > 2 ? 33 : 38) + '" ry="' + (l > 2 ? 44 : 38) + '" fill="url(#sk' + l + ')"/>';
    if (l >= 3) svg += '<path d="M20 40 Q50 8 80 40 Q70 22 50 20 Q30 22 20 40Z" fill="#3b2a1f"/>';
    var ex = l === 6 ? 2 : 0; // ojos algo desalineados
    function eye(cx, cy, r, mis) { var out = '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + (l < 2 ? r : r * 0.7) + '" fill="#fff"/>'; out += '<circle cx="' + (cx + (mis || 0)) + '" cy="' + cy + '" r="' + (r * (l < 1 ? 0.5 : 0.55)) + '" fill="' + (l === 5 ? '#233' : '#2a1a14') + '"/>'; if (l >= 3) out += '<circle cx="' + (cx + (mis || 0) - 1.2) + '" cy="' + (cy - 1.2) + '" r="1.1" fill="#fff"/>'; return out; }
    svg += eye(50 - gap, eyeY, eyeR, l === 6 ? -1.8 : 0) + eye(50 + gap + (l === 6 ? 3 : 0), eyeY + (l === 6 ? 2.5 : 0), eyeR + (l === 5 ? 1.4 : 0), l === 6 ? 1.6 : 0);
    if (l >= 2) svg += '<path d="M' + (50 - gap - 7) + ' ' + (eyeY - 10) + ' Q' + (50 - gap) + ' ' + (eyeY - 14) + ' ' + (50 - gap + 7) + ' ' + (eyeY - 10) + '" stroke="#3b2a1f" stroke-width="1.6" fill="none"/><path d="M' + (50 + gap - 7) + ' ' + (eyeY - 10) + ' Q' + (50 + gap) + ' ' + (eyeY - 14) + ' ' + (50 + gap + 7) + ' ' + (eyeY - 10) + '" stroke="#3b2a1f" stroke-width="1.6" fill="none"/>';
    if (l >= 3) svg += '<path d="M50 52 Q47 62 50 66 Q53 66 54 64" stroke="#b08060" stroke-width="1.2" fill="none"/>';
    var smile = l === 6 ? 'M34 80 Q50 94 68 78' : l === 5 ? 'M36 80 Q50 90 64 80' : 'M36 80 Q50 92 64 80';
    svg += '<path d="' + smile + '" stroke="' + (l < 2 ? '#7a3b2a' : '#a2574a') + '" stroke-width="' + (l < 2 ? 3 : 2.2) + '" fill="' + (l === 6 ? '#fff' : 'none') + '" stroke-linecap="round"/>';
    if (l === 6) svg += '<path d="M40 82 Q50 88 62 80" stroke="#7a3b2a" stroke-width="0.8" fill="none"/>';
    return svg + '</svg>';
  }
  var UVN = ['Dibujo simple', 'Mascota animada', 'Dibujo estilizado', 'Ilustración realista', 'Muy realista', 'Casi humano', 'Casi humano (algo falla)'];
  function valleHTML() {
    if (UV.i >= 7) {
      var max = Math.max.apply(null, UV.rate), pk = UV.rate.indexOf(max);
      var pts = UV.rate.map(function (r, i) { return (10 + i * 46.7).toFixed(0) + ',' + (110 - r * 20).toFixed(0); }).join(' ');
      CR.uv = UV.rate.slice(); save();
      return '<div class="panel"><h3 class="akq">Tu curva del valle</h3><svg viewBox="0 0 300 120" class="uvcurve"><polyline points="' + pts + '" fill="none" stroke="#e6c97a" stroke-width="2.5"/><line x1="10" y1="110" x2="290" y2="110" stroke="#3b3358"/>' + UV.rate.map(function (r, i) { return '<circle cx="' + (10 + i * 46.7).toFixed(0) + '" cy="' + (110 - r * 20).toFixed(0) + '" r="3.5" fill="#8b6cff"/>'; }).join('') + '</svg><p class="hint c">Tu mayor inquietud fue con: <b>' + UVN[pk] + '</b>.</p><p class="hint">El roboticista Masahiro Mori propuso en 1970 que, a medida que algo se parece más a un humano, nos resulta más cercano... hasta un punto en que un pequeño fallo (ojos que no miran bien, sonrisa sin ojos) nos produce rechazo. Tu curva probablemente baja entre «casi humano» y «algo falla».</p><button class="btn primary big" data-a="uvAgain">Repetir</button></div>';
    }
    return '<div class="panel c"><small class="kw">Cara ' + (UV.i + 1) + ' de 7</small>' + face(UV.i) + '<h3>' + UVN[UV.i] + '</h3><p class="hint c">¿Cuánta inquietud te produce?</p><div class="chips" style="justify-content:center">' + [1, 2, 3, 4, 5].map(function (n) { return '<button data-a="uvRate" data-v="' + n + '">' + n + '</button>'; }).join('') + '</div><p class="hint c">1 = ninguna · 5 = mucha</p></div>';
  }
  A.uvRate = function (el) { UV.rate.push(Number(el.dataset.v)); UV.i++; ARC.render(true); };
  A.uvAgain = function () { UV = { i: 0, rate: [] }; ARC.render(true); };

  function ambHTML() {
    var on = ARC.sound && ARC.sound.state.on;
    return '<div class="panel c"><div class="bigemo">🕯️</div><h3>Ambiente de la Cripta</h3><p class="hint c">Un paisaje sonoro sintetizado: bordón grave, viento y campanas lejanas. Ideal para leer la sección con auriculares.</p><button class="btn primary big" data-a="ouScene">' + (on ? '⏸ Detener' : '▶︎ Encender el ambiente') + '</button></div>';
  }

  ARC.regSub('crypt', 'ouija', '🪑', 'Ouija', ouijaHTML);
  ARC.regSub('crypt', 'valle', '🤖', 'Valle inquietante', valleHTML);
  ARC.regSub('crypt', 'ambiente', '🔊', 'Ambiente', ambHTML);
  ARC.curSub.crypt = 'ouija';
})();
