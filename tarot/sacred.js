/* Magia: geometría sagrada (SVG generativo y sólidos platónicos giratorios) y Santuario sonoro (Web Audio). */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, A = ARC.act;
  var PHI = (1 + Math.sqrt(5)) / 2, TAU = Math.PI * 2;
  function f(n) { return n.toFixed(2); }
  function circ(x, y, r, cls) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" class="' + (cls || 'gl') + '" pathLength="1"/>'; }
  function line(a, b, cls) { return '<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" class="' + (cls || 'gl') + '" pathLength="1"/>'; }
  function poly(pts, cls) { return '<polygon points="' + pts.map(function (p) { return f(p[0]) + ',' + f(p[1]); }).join(' ') + '" class="' + (cls || 'gl') + '" pathLength="1"/>'; }
  function ring(n, r, off) { var o = []; for (var i = 0; i < n; i++) { var a = (i / n) * TAU + (off || -Math.PI / 2); o.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]); } return o; }

  var GEO = [
    { id: 'semilla', e: '🌱', n: 'Semilla de la vida', d: 'Siete círculos iguales: uno central y seis a su alrededor, todos pasando por el centro de los vecinos.', m: 'En tradiciones antiguas simboliza los siete días de la creación y el principio de todo crecimiento.', svg: function () { var s = circ(50, 50, 14); ring(6, 14).forEach(function (p) { s += circ(p[0], p[1], 14); }); return s + circ(50, 50, 28, 'gl thin'); } },
    { id: 'flor', e: '🌸', n: 'Flor de la vida', d: 'Diecinueve círculos entrelazados que forman un patrón hexagonal perfecto.', m: 'Se ha encontrado como ornamento en templos de Egipto, Asia y Europa. Simboliza la interconexión de todo lo vivo.', svg: function () { var r = 10, s = ''; var pts = [[0, 0]]; for (var k = 1; k <= 2; k++) for (var i = 0; i < 6; i++) { var a1 = i * Math.PI / 3, a2 = (i + 1) * Math.PI / 3; for (var j = 0; j < k; j++) { var x = k * r * Math.cos(a1) + j * r * (Math.cos(a2) - Math.cos(a1)), y = k * r * Math.sin(a1) + j * r * (Math.sin(a2) - Math.sin(a1)); pts.push([x, y]); } } pts.forEach(function (p) { s += circ(50 + p[0], 50 + p[1], r); }); return s + circ(50, 50, 3 * r, 'gl thin') + circ(50, 50, 3 * r + 3, 'gl thin'); } },
    { id: 'vesica', e: '👁️', n: 'Vesica piscis', d: 'La lente que nace de dos círculos iguales cuyo centro está en el borde del otro.', m: 'Su proporción √3 aparece en la arquitectura gótica y en las mandorlas del arte cristiano: umbral entre dos mundos.', svg: function () { return circ(38, 50, 22) + circ(62, 50, 22) + line([50, 50 - 22 * Math.sin(Math.PI / 3) * 1.0], [50, 50 + 22 * Math.sin(Math.PI / 3)], 'gl thin') + line([38, 50], [62, 50], 'gl thin'); } },
    { id: 'aurea', e: '🐚', n: 'Espiral áurea', d: 'Cuadrados de un rectángulo áureo (φ ≈ 1,618) y el cuarto de círculo que traza cada uno.', m: 'La proporción áurea fascinó a Pitágoras, Euclides y Da Vinci; aparece de forma aproximada en algunos crecimientos naturales, aunque no en todas partes donde se afirma.', svg: function () {
      var k = 58, ox = 3, oy = 21, x = 0, y = 0, w = PHI, h = 1, sq = '', d = '', i, q;
      function P(px, py) { return f(ox + px * k) + ',' + f(oy + py * k); }
      for (i = 0; i < 9; i++) {
        q = i % 4;
        if (q === 0) { sq += '<rect x="' + f(ox + x * k) + '" y="' + f(oy + y * k) + '" width="' + f(h * k) + '" height="' + f(h * k) + '" class="gl thin" pathLength="1"/>'; d += (i ? '' : 'M' + P(x, y + h) + ' ') + 'A' + f(h * k) + ',' + f(h * k) + ' 0 0 1 ' + P(x + h, y) + ' '; x += h; w -= h; }
        else if (q === 1) { sq += '<rect x="' + f(ox + x * k) + '" y="' + f(oy + y * k) + '" width="' + f(w * k) + '" height="' + f(w * k) + '" class="gl thin" pathLength="1"/>'; d += 'A' + f(w * k) + ',' + f(w * k) + ' 0 0 1 ' + P(x + w, y + w) + ' '; y += w; h -= w; }
        else if (q === 2) { sq += '<rect x="' + f(ox + (x + w - h) * k) + '" y="' + f(oy + y * k) + '" width="' + f(h * k) + '" height="' + f(h * k) + '" class="gl thin" pathLength="1"/>'; d += 'A' + f(h * k) + ',' + f(h * k) + ' 0 0 1 ' + P(x + w - h, y + h) + ' '; w -= h; }
        else { sq += '<rect x="' + f(ox + x * k) + '" y="' + f(oy + (y + h - w) * k) + '" width="' + f(w * k) + '" height="' + f(w * k) + '" class="gl thin" pathLength="1"/>'; d += 'A' + f(w * k) + ',' + f(w * k) + ' 0 0 1 ' + P(x, y + h - w) + ' '; h -= w; }
      }
      return sq + '<path d="' + d + '" class="gl gold" pathLength="1"/>';
    } },
    { id: 'metatron', e: '🔷', n: 'Cubo de Metatrón', d: 'Trece círculos (la «fruta de la vida») unidos por líneas rectas: contiene los cinco sólidos platónicos.', m: 'Su nombre alude al arcángel Metatrón de la tradición mística judía. En geometría es una proyección que contiene todas las formas regulares.', svg: function () { var c = [[50, 50]], r1 = 16, r2 = 32, s = ''; ring(6, r1, 0).forEach(function (p) { c.push(p); }); ring(6, r2, 0).forEach(function (p) { c.push(p); }); for (var i = 0; i < c.length; i++) for (var j = i + 1; j < c.length; j++) s += line(c[i], c[j], 'gl thin'); c.forEach(function (p) { s += circ(p[0], p[1], 5.4, 'gl gold'); }); return s; } },
    { id: 'merkaba', e: '✡️', n: 'Merkaba', d: 'Dos tetraedros entrelazados que, proyectados en 2D, dibujan la estrella de seis puntas.', m: 'En el misticismo de la Merkabah (carro divino) y en sistemas modernos de nueva era simboliza la unión de opuestos: arriba y abajo, espíritu y materia.', svg: function () { return poly(ring(3, 38), 'gl') + poly(ring(3, 38, Math.PI / 2), 'gl') + circ(50, 50, 38, 'gl thin') + circ(50, 50, 19, 'gl thin'); } },
    { id: 'pentagrama', e: '⭐', n: 'Pentagrama', d: 'Estrella de cinco puntas trazada de un solo trazo; cada intersección divide las líneas en proporción áurea.', m: 'Para los pitagóricos era símbolo de salud; en el simbolismo clásico representa los cinco elementos (tierra, agua, fuego, aire y espíritu) o los cinco sentidos.', svg: function () { var p = ring(5, 38), o = [0, 2, 4, 1, 3, 0], s = circ(50, 50, 40, 'gl thin'); for (var i = 0; i < 5; i++) s += line(p[o[i]], p[o[i + 1]]); return s + poly(p, 'gl thin'); } },
    { id: 'hexagrama', e: '🔯', n: 'Hexagrama', d: 'Dos triángulos opuestos: el de fuego y aire hacia arriba y el de agua y tierra hacia abajo.', m: 'Aparece como sello en muchas culturas. En alquimia, la unión de los opuestos complementarios.', svg: function () { return poly(ring(3, 38), 'gl') + poly(ring(3, 38, Math.PI / 2), 'gl') + poly(ring(6, 22, 0), 'gl thin'); } },
    { id: 'arbol', e: '🌳', n: 'Árbol de la vida (Sefirot)', d: 'Diez esferas (sefirot) y veintidós senderos que las unen.', m: 'Es el diagrama central de la cábala: describe cómo, según la tradición, lo infinito se manifiesta en diez emanaciones. Los senderos se asocian a las 22 letras hebreas y a los Arcanos Mayores.', svg: function () {
      var N = { kether: [50, 8], chokmah: [74, 20], binah: [26, 20], chesed: [74, 40], geburah: [26, 40], tiphareth: [50, 50], netzach: [74, 66], hod: [26, 66], yesod: [50, 78], malkuth: [50, 94] };
      var E = [['kether', 'chokmah'], ['kether', 'binah'], ['kether', 'tiphareth'], ['chokmah', 'binah'], ['chokmah', 'tiphareth'], ['chokmah', 'chesed'], ['binah', 'tiphareth'], ['binah', 'geburah'], ['chesed', 'geburah'], ['chesed', 'tiphareth'], ['chesed', 'netzach'], ['geburah', 'tiphareth'], ['geburah', 'hod'], ['tiphareth', 'netzach'], ['tiphareth', 'hod'], ['tiphareth', 'yesod'], ['netzach', 'hod'], ['netzach', 'yesod'], ['netzach', 'malkuth'], ['hod', 'yesod'], ['hod', 'malkuth'], ['yesod', 'malkuth']];
      var s = ''; E.forEach(function (e) { s += line(N[e[0]], N[e[1]], 'gl thin'); }); Object.keys(N).forEach(function (k) { s += circ(N[k][0], N[k][1], 5, 'gl gold'); }); return s;
    } },
    { id: 'mandala', e: '🏵️', n: 'Mandala de rosetas', d: 'Capas de pétalos generadas con simetría radial de 12 pliegues.', m: 'Mandala significa «círculo» en sánscrito. En budismo e hinduismo se contempla como mapa del cosmos; Jung lo estudió como imagen espontánea del yo.', svg: function () { var s = ''; for (var l = 0; l < 4; l++) { var n = 12, r = 12 + l * 9; for (var i = 0; i < n; i++) { var a = (i / n) * TAU + l * 0.13; var c1 = [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; s += circ(c1[0], c1[1], 5 + l * 1.4, l % 2 ? 'gl thin' : 'gl'); } s += circ(50, 50, r + 5.5, 'gl thin'); } return s + circ(50, 50, 6, 'gl gold'); } }
  ];

  /* ---------- Sólidos platónicos giratorios ---------- */
  function solid(name) {
    var V = [], i, j, a = 1 / PHI;
    if (name === 'tetraedro') V = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
    else if (name === 'cubo') for (i = 0; i < 8; i++) V.push([(i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1]);
    else if (name === 'octaedro') V = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    else if (name === 'icosaedro') [[0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI]].forEach(function (v) { V.push(v, [v[1], v[2], v[0]], [v[2], v[0], v[1]]); });
    else if (name === 'dodecaedro') { for (i = 0; i < 8; i++) V.push([(i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1]); [[0, a, PHI], [0, -a, PHI], [0, a, -PHI], [0, -a, -PHI]].forEach(function (v) { V.push(v, [v[1], v[2], v[0]], [v[2], v[0], v[1]]); }); }
    var dm = 1e9; for (i = 0; i < V.length; i++) for (j = i + 1; j < V.length; j++) dm = Math.min(dm, dist(V[i], V[j]));
    var E = []; for (i = 0; i < V.length; i++) for (j = i + 1; j < V.length; j++) if (Math.abs(dist(V[i], V[j]) - dm) < 1e-6) E.push([i, j]);
    var mx = Math.max.apply(null, V.map(function (v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); }));
    return { V: V.map(function (v) { return [v[0] / mx, v[1] / mx, v[2] / mx]; }), E: E };
  }
  function dist(p, q) { return Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2) + Math.pow(p[2] - q[2], 2)); }
  var SOL = [['tetraedro', '🔺', 'Tetraedro', 'Fuego', '4 caras triangulares · 4 vértices · 6 aristas. Para Platón, el fuego: la forma más afilada y móvil.'], ['cubo', '🟫', 'Cubo (hexaedro)', 'Tierra', '6 caras cuadradas · 8 vértices · 12 aristas. La tierra: estable e inmóvil.'], ['octaedro', '🔷', 'Octaedro', 'Aire', '8 caras triangulares · 6 vértices · 12 aristas. El aire: ligero y equilibrado.'], ['icosaedro', '💠', 'Icosaedro', 'Agua', '20 caras triangulares · 12 vértices · 30 aristas. El agua: la más «redonda» y fluida.'], ['dodecaedro', '⬟', 'Dodecaedro', 'Éter', '12 caras pentagonales · 20 vértices · 30 aristas. Según Platón, la forma que Dios usó para el cosmos entero.']];
  var raf = null, GS = { tab: 'formas', id: 'semilla', sol: 'icosaedro', ax: 0.5, ay: 0 };

  function geoHTML() {
    var g = GEO.filter(function (x) { return x.id === GS.id; })[0];
    var h = '<div class="seg"><button data-a="geoTab" data-v="formas" class="' + (GS.tab === 'formas' ? 'on' : '') + '">✨ Formas</button><button data-a="geoTab" data-v="solidos" class="' + (GS.tab === 'solidos' ? 'on' : '') + '">🧊 Sólidos de Platón</button></div>';
    if (GS.tab === 'formas') {
      h += '<div class="panel geo"><svg viewBox="0 0 100 100" class="gsvg" id="gsvg">' + g.svg() + '</svg><h3>' + g.e + ' ' + esc(g.n) + '</h3><p>' + esc(g.d) + '</p><p class="hint">' + esc(g.m) + '</p><button class="btn ghost" data-a="geoRedraw">▶︎ Volver a trazar</button></div><div class="chips wrap">' + GEO.map(function (x) { return '<button data-a="geoPick" data-v="' + x.id + '" class="' + (GS.id === x.id ? 'on' : '') + '">' + x.e + ' ' + x.n.split(' (')[0] + '</button>'; }).join('') + '</div>';
    } else {
      var s = SOL.filter(function (x) { return x[0] === GS.sol; })[0];
      h += '<div class="panel geo"><svg viewBox="0 0 100 100" class="gsvg" id="solid"></svg><h3>' + s[1] + ' ' + s[2] + ' · ' + s[3] + '</h3><p class="hint">' + esc(s[4]) + '</p><p class="hint c">Arrastra para girarlo</p></div><div class="chips wrap">' + SOL.map(function (x) { return '<button data-a="solPick" data-v="' + x[0] + '" class="' + (GS.sol === x[0] ? 'on' : '') + '">' + x[1] + ' ' + x[2].split(' (')[0] + '</button>'; }).join('') + '</div>';
    }
    return h + '<p class="fine">La geometría sagrada es una tradición simbólica y artística. Las proporciones matemáticas son reales; los significados espirituales son interpretaciones culturales.</p>';
  }
  A.geoTab = function (el) { GS.tab = el.dataset.v; ARC.render(true); };
  A.geoPick = function (el) { GS.id = el.dataset.v; ARC.render(true); };
  A.geoRedraw = function () { var s = $('#gsvg'); if (s) { var c = s.innerHTML; s.innerHTML = ''; void s.getBoundingClientRect(); s.innerHTML = c; } };
  A.solPick = function (el) { GS.sol = el.dataset.v; ARC.render(true); };
  function startSolid() {
    var svg = $('#solid'); stopSolid(); if (!svg) return; var S = solid(GS.sol), drag = null, t0 = performance.now();
    svg.onpointerdown = function (e) { drag = [e.clientX, e.clientY]; svg.setPointerCapture(e.pointerId); };
    svg.onpointermove = function (e) { if (!drag) return; GS.ay += (e.clientX - drag[0]) * 0.01; GS.ax += (e.clientY - drag[1]) * 0.01; drag = [e.clientX, e.clientY]; };
    svg.onpointerup = svg.onpointercancel = function () { drag = null; };
    (function frame(now) {
      if (!$('#solid')) { raf = null; return; }
      if (!drag) GS.ay += 0.008;
      var ca = Math.cos(GS.ax), sa = Math.sin(GS.ax), cb = Math.cos(GS.ay), sb = Math.sin(GS.ay);
      var P2 = S.V.map(function (v) { var x = v[0] * cb + v[2] * sb, z = -v[0] * sb + v[2] * cb, y = v[1] * ca - z * sa, z2 = v[1] * sa + z * ca, k = 1 / (2.6 - z2 * 0.5); return [50 + x * 34 * k * 1.6, 50 + y * 34 * k * 1.6, z2]; });
      svg.innerHTML = S.E.map(function (e) { var a = P2[e[0]], b = P2[e[1]], depth = (a[2] + b[2]) / 2; return '<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="#e6c97a" stroke-width="' + f(0.7 + depth * 0.3) + '" stroke-opacity="' + f(0.5 + depth * 0.4) + '" stroke-linecap="round"/>'; }).join('') + P2.map(function (p) { return '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(1.1 + p[2] * 0.5) + '" fill="#fff" opacity="' + f(0.6 + p[2] * 0.3) + '"/>'; }).join('');
      raf = requestAnimationFrame(frame);
    })();
  }
  function stopSolid() { if (raf) cancelAnimationFrame(raf); raf = null; }

  /* ---------- Santuario sonoro ---------- */
  var SND = { ctx: null, master: null, on: false, layers: {}, vol: { drone: 0.6, bowl: 0.5, rain: 0, ocean: 0, wind: 0, bin: 0 }, tonic: 136.1, bin: 'theta', timer: 0, endAt: 0, bowlTimer: null, tick: null, analyser: null, scene: 'templo' };
  var BIN = { delta: [2, 'Delta · 2 Hz', 'sueño profundo'], theta: [6, 'Theta · 6 Hz', 'meditación'], alpha: [10, 'Alfa · 10 Hz', 'calma despierta'], beta: [18, 'Beta · 18 Hz', 'foco'] };
  var TON = [[136.1, 'Om · 136,1 Hz'], [174, '174 Hz'], [285, '285 Hz'], [396, '396 Hz'], [432, '432 Hz'], [528, '528 Hz'], [639, '639 Hz']];
  var SCENES = { templo: ['🛕', 'Templo', { drone: 0.6, bowl: 0.6, rain: 0, ocean: 0, wind: 0.1, bin: 0 }], bosque: ['🌲', 'Bosque', { drone: 0.2, bowl: 0.2, rain: 0, ocean: 0, wind: 0.6, bin: 0 }], lluvia: ['🌧️', 'Lluvia nocturna', { drone: 0.2, bowl: 0.2, rain: 0.7, ocean: 0, wind: 0.2, bin: 0 }], sueno: ['😴', 'Sueño profundo', { drone: 0.25, bowl: 0, rain: 0, ocean: 0.55, wind: 0, bin: 0.5 }], foco: ['🎯', 'Foco', { drone: 0, bowl: 0, rain: 0.3, ocean: 0, wind: 0, bin: 0.5 }], meditacion: ['🧘', 'Meditación', { drone: 0.5, bowl: 0.4, rain: 0, ocean: 0.2, wind: 0, bin: 0.4 }] };

  function noiseBuf(ctx, type) {
    var len = ctx.sampleRate * 4, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c), last = 0; for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; if (type === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; } }
    return b;
  }
  function build() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    var ctx = SND.ctx = new AC(), L = SND.layers = {};
    SND.master = ctx.createGain(); SND.master.gain.value = 0; SND.analyser = ctx.createAnalyser(); SND.analyser.fftSize = 256; SND.master.connect(SND.analyser); SND.analyser.connect(ctx.destination);
    function layer(name) { var g = ctx.createGain(); g.gain.value = SND.vol[name] * 0.5; g.connect(SND.master); L[name] = g; return g; }
    // bordón: tres osciladores desafinados + filtro con LFO
    var gd = layer('drone'), flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 600; flt.connect(gd);
    [[1, 'sine', 0], [2, 'sine', 4], [1.5, 'triangle', -3], [0.5, 'sine', 2]].forEach(function (o) { var os = ctx.createOscillator(); os.type = o[1]; os.frequency.value = SND.tonic * o[0]; os.detune.value = o[2]; var g = ctx.createGain(); g.gain.value = o[0] === 1 ? 0.5 : 0.22; os.connect(g); g.connect(flt); os.start(); (L.dronO = L.dronO || []).push(os); });
    var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 220; lfo.connect(lg); lg.connect(flt.frequency); lfo.start();
    // ruidos
    var gr = layer('rain'), nr = ctx.createBufferSource(); nr.buffer = noiseBuf(ctx, 'white'); nr.loop = true; var fr = ctx.createBiquadFilter(); fr.type = 'highpass'; fr.frequency.value = 1500; var fr2 = ctx.createBiquadFilter(); fr2.type = 'lowpass'; fr2.frequency.value = 9000; nr.connect(fr); fr.connect(fr2); fr2.connect(gr); nr.start();
    var go = layer('ocean'), no = ctx.createBufferSource(); no.buffer = noiseBuf(ctx, 'brown'); no.loop = true; var fo = ctx.createBiquadFilter(); fo.type = 'lowpass'; fo.frequency.value = 700; var ag = ctx.createGain(); ag.gain.value = 0.6; no.connect(fo); fo.connect(ag); ag.connect(go); var lo = ctx.createOscillator(), log = ctx.createGain(); lo.frequency.value = 0.09; log.gain.value = 0.4; lo.connect(log); log.connect(ag.gain); lo.start(); no.start();
    var gw = layer('wind'), nw = ctx.createBufferSource(); nw.buffer = noiseBuf(ctx, 'brown'); nw.loop = true; var fw = ctx.createBiquadFilter(); fw.type = 'bandpass'; fw.frequency.value = 500; fw.Q.value = 0.8; var lw = ctx.createOscillator(), lwg = ctx.createGain(); lw.frequency.value = 0.05; lwg.gain.value = 250; lw.connect(lwg); lwg.connect(fw.frequency); lw.start(); nw.connect(fw); fw.connect(gw); nw.start();
    // binaural (estéreo)
    var gb = layer('bin'), mrg = ctx.createChannelMerger(2); mrg.connect(gb);
    var bl = ctx.createOscillator(), br = ctx.createOscillator(); L.binL = bl; L.binR = br; bl.frequency.value = 200; br.frequency.value = 200 + BIN[SND.bin][0]; var ga = ctx.createGain(), gc = ctx.createGain(); ga.gain.value = gc.gain.value = 0.35; bl.connect(ga); br.connect(gc); ga.connect(mrg, 0, 0); gc.connect(mrg, 0, 1); bl.start(); br.start();
    L.bowl = layer('bowl');
    return true;
  }
  function strike() {
    if (!SND.on || !SND.ctx) return; var ctx = SND.ctx, t = ctx.currentTime, base = SND.tonic * (Math.random() < 0.5 ? 2 : 3);
    [[1, 1], [2.756, 0.5], [5.404, 0.25], [8.933, 0.12]].forEach(function (p) { var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = base * p[0]; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5 * p[1], t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 9 / p[0] + 3); o.connect(g); g.connect(SND.layers.bowl); o.start(t); o.stop(t + 14); });
  }
  function applyVol() { if (!SND.layers.drone) return; var t = SND.ctx.currentTime; ['drone', 'rain', 'ocean', 'wind', 'bin', 'bowl'].forEach(function (k) { var v = SND.vol[k] === undefined ? 0 : SND.vol[k]; SND.layers[k].gain.setTargetAtTime(k === 'bowl' ? 1 : v * (k === 'bin' ? 0.35 : 0.5), t, 0.2); }); }
  function applyTone() { if (!SND.layers.dronO) return; var mult = [1, 2, 1.5, 0.5]; SND.layers.dronO.forEach(function (o, i) { o.frequency.setTargetAtTime(SND.tonic * mult[i], SND.ctx.currentTime, 0.3); }); if (SND.layers.binR) SND.layers.binR.frequency.setTargetAtTime(200 + BIN[SND.bin][0], SND.ctx.currentTime, 0.3); }
  function play() {
    if (!SND.ctx && !build()) { ARC.toast('Tu navegador no admite audio'); return; }
    SND.ctx.resume(); SND.on = true; var t = SND.ctx.currentTime; SND.master.gain.cancelScheduledValues(t); SND.master.gain.setTargetAtTime(0.9, t, 1.5); applyVol(); applyTone();
    clearInterval(SND.bowlTimer); var every = function () { if (SND.vol.bowl > 0.05) strike(); }; setTimeout(every, 600); SND.bowlTimer = setInterval(function () { if (Math.random() < SND.vol.bowl + 0.2) strike(); }, 11000);
    clearInterval(SND.tick); SND.tick = setInterval(function () { if (SND.endAt && Date.now() >= SND.endAt) stop(); var l = $('#sndleft'); if (l) l.textContent = SND.endAt ? Math.max(0, Math.round((SND.endAt - Date.now()) / 60000)) + ' min' : ''; }, 1000); pill();
  }
  function stop() { if (!SND.ctx) return; SND.on = false; SND.master.gain.setTargetAtTime(0, SND.ctx.currentTime, 0.8); clearInterval(SND.bowlTimer); clearInterval(SND.tick); SND.endAt = 0; var c = SND.ctx; setTimeout(function () { if (!SND.on && SND.ctx === c) { try { c.close(); } catch (e) { /* ya cerrado */ } SND.ctx = null; SND.layers = {}; } }, 3500); pill(); if (ARC.tab === 'magic') ARC.render(true); }
  function pill() {
    var p = $('#sndpill'); if (SND.on && ARC.tab !== 'magic') { if (!p) { p = document.createElement('button'); p.id = 'sndpill'; p.setAttribute('data-a', 'sndStop'); p.innerHTML = '🔊 Santuario · detener'; document.body.appendChild(p); } } else if (p) p.remove();
  }
  function soundHTML() {
    var h = '<div class="panel snd"><canvas id="sndviz" width="300" height="300"></canvas><button class="btn primary big" data-a="sndToggle">' + (SND.on ? '⏸ Detener' : '▶︎ Comenzar') + '</button><p class="hint c" id="sndleft"></p>' +
      '<div class="lbl nm">Escenas</div><div class="chips wrap">' + Object.keys(SCENES).map(function (k) { return '<button data-a="sndScene" data-v="' + k + '" class="' + (SND.scene === k ? 'on' : '') + '">' + SCENES[k][0] + ' ' + SCENES[k][1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="panel"><div class="lbl nm">Capas</div>' + [['drone', '🕉️', 'Bordón'], ['bowl', '🔔', 'Cuenco tibetano'], ['rain', '🌧️', 'Lluvia'], ['ocean', '🌊', 'Oleaje'], ['wind', '🍃', 'Viento'], ['bin', '🎧', 'Binaural (auriculares)']].map(function (l) { return '<div class="grow slid"><span class="gi">' + l[1] + '</span><div><b>' + l[2] + '</b><input type="range" id="sv_' + l[0] + '" min="0" max="1" step="0.05" value="' + SND.vol[l[0]] + '"></div></div>'; }).join('') +
      '<div class="lbl">Nota del bordón</div><div class="chips wrap">' + TON.map(function (t) { return '<button data-a="sndTon" data-v="' + t[0] + '" class="' + (SND.tonic === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="lbl">Ritmo binaural</div><div class="chips wrap">' + Object.keys(BIN).map(function (k) { return '<button data-a="sndBin" data-v="' + k + '" class="' + (SND.bin === k ? 'on' : '') + '">' + BIN[k][1] + ' · ' + BIN[k][2] + '</button>'; }).join('') + '</div>' +
      '<div class="lbl">Temporizador</div><div class="chips"><button data-a="sndTimer" data-v="0" class="' + (!SND.timer ? 'on' : '') + '">Sin límite</button>' + [15, 30, 60].map(function (m) { return '<button data-a="sndTimer" data-v="' + m + '" class="' + (SND.timer === m ? 'on' : '') + '">' + m + ' min</button>'; }).join('') + '</div></div>' +
      '<p class="fine">Los sonidos se sintetizan en tu dispositivo (funciona sin conexión). Los ritmos binaurales requieren auriculares. Las frecuencias «sanadoras» son una tradición simbólica: sirven para relajarte, no para curar.</p>';
    return h;
  }
  ['drone', 'bowl', 'rain', 'ocean', 'wind', 'bin'].forEach(function (k) { ARC.inputs['sv_' + k] = function (v) { SND.vol[k] = Number(v); SND.scene = ''; applyVol(); }; });
  A.sndToggle = function () { if (SND.on) stop(); else play(); ARC.render(true); };
  A.sndStop = function () { stop(); };
  A.sndScene = function (el) { SND.scene = el.dataset.v; Object.assign(SND.vol, SCENES[SND.scene][2]); if (!SND.on) play(); else applyVol(); ARC.render(true); };
  A.sndTon = function (el) { SND.tonic = Number(el.dataset.v); applyTone(); ARC.render(true); };
  A.sndBin = function (el) { SND.bin = el.dataset.v; applyTone(); ARC.render(true); };
  A.sndTimer = function (el) { SND.timer = Number(el.dataset.v); SND.endAt = SND.timer ? Date.now() + SND.timer * 60000 : 0; ARC.render(true); };
  var vraf = null;
  function viz() {
    if (vraf) cancelAnimationFrame(vraf); vraf = null; var cv = $('#sndviz'); if (!cv) return; var c = cv.getContext('2d'), data = new Uint8Array(64), ph = 0;
    (function fr() {
      var cv2 = $('#sndviz'); if (!cv2) { vraf = null; return; }
      var lv = 0; if (SND.analyser && SND.on) { SND.analyser.getByteFrequencyData(data); for (var i = 0; i < 32; i++) lv += data[i]; lv = lv / 32 / 255; }
      c.clearRect(0, 0, 300, 300); ph += 0.01 + lv * 0.05;
      for (var k = 0; k < 5; k++) { var r = 30 + k * 20 + Math.sin(ph * (1 + k * 0.3)) * (4 + lv * 24), g = c.createRadialGradient(150, 150, r * 0.6, 150, 150, r); c.strokeStyle = 'rgba(' + (139 + k * 18) + ',' + (108 + k * 22) + ',255,' + (0.5 - k * 0.07 + lv * 0.4) + ')'; c.lineWidth = 2; c.beginPath(); for (var a = 0; a <= 64; a++) { var th = a / 64 * TAU, rr = r + Math.sin(th * (3 + k) + ph * 2) * (2 + lv * 12); var x = 150 + Math.cos(th) * rr, y = 150 + Math.sin(th) * rr; if (a) c.lineTo(x, y); else c.moveTo(x, y); } c.closePath(); c.stroke(); }
      c.fillStyle = 'rgba(230,201,122,' + (0.5 + lv) + ')'; c.beginPath(); c.arc(150, 150, 5 + lv * 14, 0, TAU); c.fill();
      vraf = requestAnimationFrame(fr);
    })();
  }
  ARC.sound = { state: SND, play: play, stop: stop };

  ARC.regSub('magic', 'geometria', '🔷', 'Geometría', geoHTML);
  ARC.regSub('magic', 'sonido', '🔔', 'Sonido', soundHTML);
  var prevAfter = ARC.after.magic;
  ARC.after.magic = function () { if (prevAfter) prevAfter(); stopSolid(); if (ARC.curSub.magic === 'geometria' && GS.tab === 'solidos') startSolid(); if (ARC.curSub.magic === 'sonido') viz(); pill(); };
  setInterval(pill, 700);
})();
