/* Carta natal profesional: datos de nacimiento, rueda, posiciones, casas, aspectos, informe, tránsitos,
   progresiones, retorno solar y sinastría. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, P = ARC.profile, A = ARC.act, AS = ASTRO.SIGNS, E = EPH, T = NATXT, TX = SKYTXT;
  var GL = { 'Sol': '☉', 'Luna': '☽', 'Mercurio': '☿', 'Venus': '♀', 'Marte': '♂', 'Júpiter': '♃', 'Saturno': '♄', 'Urano': '♅', 'Neptuno': '♆', 'Plutón': '♇', 'Nodo Norte': '☊', 'Lilith': '⚸', 'AC': 'AC', 'MC': 'MC' };
  var AG = { 'conjunción': '☌', 'sextil': '⚹', 'cuadratura': '□', 'trígono': '△', 'oposición': '☍', 'quincuncio': '⚻' };
  var gl = function (id) { return GL[id] + (id.length > 2 ? '︎' : ''); };
  var MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var SYS = [['placidus', 'Placidus'], ['whole', 'Signos enteros'], ['equal', 'Iguales'], ['porphyry', 'Porfirio']];

  var PLACES = [
    ['Madrid', 40.4168, -3.7038, 'Europe/Madrid'], ['Barcelona', 41.3874, 2.1686, 'Europe/Madrid'], ['Valencia', 39.4699, -0.3763, 'Europe/Madrid'], ['Sevilla', 37.3891, -5.9845, 'Europe/Madrid'],
    ['Zaragoza', 41.6488, -0.8891, 'Europe/Madrid'], ['Málaga', 36.7213, -4.4214, 'Europe/Madrid'], ['Murcia', 37.9922, -1.1307, 'Europe/Madrid'], ['Palma de Mallorca', 39.5696, 2.6502, 'Europe/Madrid'],
    ['Las Palmas de Gran Canaria', 28.1235, -15.4363, 'Atlantic/Canary'], ['Santa Cruz de Tenerife', 28.4636, -16.2518, 'Atlantic/Canary'], ['Bilbao', 43.263, -2.935, 'Europe/Madrid'], ['Alicante', 38.3452, -0.481, 'Europe/Madrid'],
    ['Córdoba (España)', 37.8882, -4.7794, 'Europe/Madrid'], ['Valladolid', 41.6523, -4.7245, 'Europe/Madrid'], ['Vigo', 42.2406, -8.7207, 'Europe/Madrid'], ['A Coruña', 43.3623, -8.4115, 'Europe/Madrid'],
    ['Gijón', 43.5322, -5.6611, 'Europe/Madrid'], ['Granada', 37.1773, -3.5986, 'Europe/Madrid'], ['Pamplona', 42.8125, -1.6458, 'Europe/Madrid'], ['San Sebastián', 43.3183, -1.9812, 'Europe/Madrid'],
    ['Santiago de Compostela', 42.8782, -8.5448, 'Europe/Madrid'], ['Toledo', 39.8628, -4.0273, 'Europe/Madrid'], ['Salamanca', 40.9701, -5.6635, 'Europe/Madrid'], ['Cádiz', 36.5271, -6.2886, 'Europe/Madrid'],
    ['Ciudad de México', 19.4326, -99.1332, 'America/Mexico_City'], ['Guadalajara', 20.6597, -103.3496, 'America/Mexico_City'], ['Monterrey', 25.6866, -100.3161, 'America/Monterrey'], ['Bogotá', 4.711, -74.0721, 'America/Bogota'],
    ['Medellín', 6.2442, -75.5812, 'America/Bogota'], ['Lima', -12.0464, -77.0428, 'America/Lima'], ['Santiago de Chile', -33.4489, -70.6693, 'America/Santiago'], ['Buenos Aires', -34.6037, -58.3816, 'America/Argentina/Buenos_Aires'],
    ['Córdoba (Argentina)', -31.4201, -64.1888, 'America/Argentina/Cordoba'], ['Montevideo', -34.9011, -56.1645, 'America/Montevideo'], ['Caracas', 10.4806, -66.9036, 'America/Caracas'], ['Quito', -0.1807, -78.4678, 'America/Guayaquil'],
    ['La Paz', -16.4897, -68.1193, 'America/La_Paz'], ['Asunción', -25.2637, -57.5759, 'America/Asuncion'], ['San José (Costa Rica)', 9.9281, -84.0907, 'America/Costa_Rica'], ['Ciudad de Panamá', 8.9824, -79.5199, 'America/Panama'],
    ['La Habana', 23.1136, -82.3666, 'America/Havana'], ['San Juan (Puerto Rico)', 18.4655, -66.1057, 'America/Puerto_Rico'], ['Santo Domingo', 18.4861, -69.9312, 'America/Santo_Domingo'], ['Ciudad de Guatemala', 14.6349, -90.5069, 'America/Guatemala'],
    ['Lisboa', 38.7223, -9.1393, 'Europe/Lisbon'], ['Londres', 51.5074, -0.1278, 'Europe/London'], ['París', 48.8566, 2.3522, 'Europe/Paris'], ['Berlín', 52.52, 13.405, 'Europe/Berlin'], ['Roma', 41.9028, 12.4964, 'Europe/Rome'],
    ['Nueva York', 40.7128, -74.006, 'America/New_York'], ['Los Ángeles', 34.0522, -118.2437, 'America/Los_Angeles'], ['Miami', 25.7617, -80.1918, 'America/New_York'], ['Houston', 29.7604, -95.3698, 'America/Chicago']
  ].map(function (p) { return { name: p[0], lat: p[1], lon: p[2], tz: p[3] }; });

  var N = { sub: 'rueda', sys: 'placidus', results: [], searching: false, q: '', srYear: new Date().getFullYear(), trDate: null, p2: null, p2res: [], p2q: '', form: null, chartKey: '', chart: null, aiState: 'idle', ai: '', aiErr: '' };

  /* ---------- datos de nacimiento ---------- */
  function natalData() { return P.natal && P.natal.place ? P.natal : null; }
  function getChart(sys) {
    var d = natalData(); if (!d) return null;
    var key = JSON.stringify([d, sys || N.sys]); if (N.chartKey === key && N.chart) return N.chart;
    var when = E.localToUTC(d.y, d.m, d.d, d.unknown ? 12 : d.h, d.unknown ? 0 : d.mi, d.place.tz, d.place.lon);
    N.chart = E.chart(when, d.place, sys || N.sys); N.chartKey = key; return N.chart;
  }
  function pad(n) { return ARC.pad(n); }
  function fmtDeg(lon) { var s = Math.floor(lon / 30), d = lon % 30, dd = Math.floor(d), m = Math.floor((d - dd) * 60); return AS[s].g + '︎ ' + dd + '°' + pad(m) + '′'; }
  function fmtLon(lon) { return AS[Math.floor(lon / 30)].n + ' ' + Math.floor(lon % 30) + '°'; }

  function formHTML() {
    var f = N.form || (N.form = { date: P.birth ? P.birth.y + '-' + pad(P.birth.m) + '-' + pad(P.birth.d) : '', time: '12:00', unknown: false, place: null });
    var res = N.results.map(function (r, i) { return '<button class="place" data-a="natPlace" data-i="' + i + '"><b>' + esc(r.name) + '</b><small>' + esc(r.sub || r.tz) + '</small></button>'; }).join('');
    return '<div class="panel"><div class="lbl">Tus datos de nacimiento</div><p class="hint">Para una carta natal profesional necesito la <b>fecha, la hora y el lugar</b>. Sin la hora exacta no se puede calcular bien el ascendente ni las casas. Todo se guarda solo en tu dispositivo.</p>' +
      '<div class="lbl">Fecha</div><input type="date" id="nat_date" value="' + esc(f.date) + '">' +
      '<div class="lbl">Hora (la que figura en tu partida de nacimiento)</div><input type="time" id="nat_time" value="' + esc(f.time) + '"' + (f.unknown ? ' disabled' : '') + '>' +
      '<label class="toggle"><input type="checkbox" id="nat_unknown"' + (f.unknown ? ' checked' : '') + '><span>No sé la hora (se usará el mediodía y las casas serán orientativas)</span></label>' +
      '<div class="lbl">Lugar de nacimiento</div>' + (f.place ? '<div class="placesel"><b>📍 ' + esc(f.place.name) + '</b><small>' + f.place.lat.toFixed(2) + '°, ' + f.place.lon.toFixed(2) + '° · ' + esc(f.place.tz) + '</small></div>' : '') +
      '<div class="datebar"><input id="nat_q" type="search" placeholder="Busca una ciudad…" value="' + esc(N.q) + '" autocomplete="off"><button class="btn primary sm" data-a="natSearch">Buscar</button></div>' +
      (N.searching ? '<p class="hint">Buscando…</p>' : '') + '<div class="places">' + res + '</div>' +
      '<button class="btn primary big" data-a="natSave">Calcular mi carta natal ✨</button></div>';
  }

  /* ---------- rueda ---------- */
  var ELCOL = { Fuego: '#ff7a45', Tierra: '#6bc48a', Aire: '#bfe3ff', Agua: '#4aa3ff' };
  function wheelSVG(ch, opts) {
    opts = opts || {};
    var cx = 300, cy = 300, rO = 288, rS = 248, rH = 212, rP = 186, rI = 118, asc = ch.asc;
    function pt(lon, r) { var th = (lon - asc) * Math.PI / 180; return [cx - r * Math.cos(th), cy + r * Math.sin(th)]; }
    function f(n) { return n.toFixed(1); }
    function sector(l1, l2, r1, r2) {
      var a = pt(l1, r2), b = pt(l2, r2), c = pt(l2, r1), d = pt(l1, r1);
      return 'M' + f(a[0]) + ' ' + f(a[1]) + ' A' + r2 + ' ' + r2 + ' 0 0 0 ' + f(b[0]) + ' ' + f(b[1]) + ' L' + f(c[0]) + ' ' + f(c[1]) + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + f(d[0]) + ' ' + f(d[1]) + ' Z';
    }
    var s = '<svg class="wheel-svg" viewBox="0 0 600 600" role="img" aria-label="Carta natal"><defs><radialGradient id="whbg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#1a1432"/><stop offset="1" stop-color="#0d0b14"/></radialGradient></defs>';
    s += '<circle cx="300" cy="300" r="' + rO + '" fill="url(#whbg)" stroke="#e6c97a66" stroke-width="1.5"/>';
    var i, p;
    for (i = 0; i < 12; i++) {
      s += '<path d="' + sector(i * 30, (i + 1) * 30, rS, rO) + '" fill="' + ELCOL[AS[i].el] + '22" stroke="#e6c97a44" stroke-width=".8"/>';
      p = pt(i * 30 + 15, (rS + rO) / 2); s += '<text x="' + f(p[0]) + '" y="' + f(p[1]) + '" class="wh-sign" fill="' + ELCOL[AS[i].el] + '">' + AS[i].g + '︎</text>';
    }
    for (i = 0; i < 360; i += 5) { var a1 = pt(i, rS), a2 = pt(i, rS - (i % 10 === 0 ? 9 : 5)); s += '<line x1="' + f(a1[0]) + '" y1="' + f(a1[1]) + '" x2="' + f(a2[0]) + '" y2="' + f(a2[1]) + '" stroke="#e6c97a55" stroke-width=".7"/>'; }
    s += '<circle cx="300" cy="300" r="' + rS + '" fill="none" stroke="#e6c97a77"/><circle cx="300" cy="300" r="' + rI + '" fill="#0d0b14" stroke="#e6c97a55"/>';
    for (i = 1; i <= 12; i++) {
      var c1 = pt(ch.cusps[i], rI), c2 = pt(ch.cusps[i], (i % 3 === 1) ? rO : rS), ang = (i % 3 === 1);
      s += '<line x1="' + f(c1[0]) + '" y1="' + f(c1[1]) + '" x2="' + f(c2[0]) + '" y2="' + f(c2[1]) + '" stroke="' + (ang ? '#e6c97a' : '#e6c97a55') + '" stroke-width="' + (ang ? 1.8 : .8) + '"/>';
      var next = ch.cusps[i === 12 ? 1 : i + 1], mid = ch.cusps[i] + (((next - ch.cusps[i] + 360) % 360) / 2), hp = pt(mid, rI + 14);
      s += '<text x="' + f(hp[0]) + '" y="' + f(hp[1]) + '" class="wh-house">' + i + '</text>';
    }
    // aspectos
    var main = ch.points.filter(function (x) { return x.id !== 'Lilith'; }), col = { conj: '#e6c97a', sext: '#6fb7ff', cuad: '#ff6b81', trig: '#6fe3a0', opos: '#ff6b81', quin: '#b794ff' };
    ch.aspects.forEach(function (a, k) {
      if (a.k === 'quin' || (['AC', 'MC'].indexOf(a.a) > -1 && ['AC', 'MC'].indexOf(a.b) > -1)) return;
      var pa = main.filter(function (x) { return x.id === a.a; })[0], pb = main.filter(function (x) { return x.id === a.b; })[0]; if (!pa || !pb) return;
      var u = pt(pa.lon, rI - 2), v = pt(pb.lon, rI - 2);
      s += '<line class="wh-asp" style="animation-delay:' + (k * 40) + 'ms" x1="' + f(u[0]) + '" y1="' + f(u[1]) + '" x2="' + f(v[0]) + '" y2="' + f(v[1]) + '" stroke="' + col[a.k] + '" stroke-width="' + (a.orb < 2 ? 1.6 : 1) + '" opacity="' + (a.orb < 2 ? .9 : .55) + '"' + (a.k === 'sext' || a.k === 'quin' ? ' stroke-dasharray="4 3"' : '') + '/>';
    });
    // planetas con separación
    var list = ch.planets.filter(function (x) { return x.id !== 'Lilith' || opts.lilith; }).map(function (x) { return { id: x.id, lon: x.lon, disp: x.lon, retro: x.status === 'retrógrado' && x.id !== 'Nodo Norte', deg: x.deg }; }).sort(function (a, b) { return a.lon - b.lon; });
    for (var it = 0; it < 40; it++) {
      var moved = false;
      for (i = 0; i < list.length; i++) {
        var j = (i + 1) % list.length, d = ((list[j].disp - list[i].disp) + 360) % 360;
        if (list.length > 1 && d < 9) { var push = (9 - d) / 2; list[i].disp = (list[i].disp - push + 360) % 360; list[j].disp = (list[j].disp + push) % 360; moved = true; }
      }
      if (!moved) break;
    }
    list.forEach(function (x, k) {
      var t0 = pt(x.lon, rS), t1 = pt(x.lon, rS - 8), pp = pt(x.disp, rP), dd = pt(x.disp, rP - 25);
      s += '<line x1="' + f(t0[0]) + '" y1="' + f(t0[1]) + '" x2="' + f(t1[0]) + '" y2="' + f(t1[1]) + '" stroke="#e6c97a" stroke-width="1.4"/>';
      s += '<g class="wp" data-a="wheelPlanet" data-id="' + x.id + '" style="animation-delay:' + (k * 70) + 'ms"><circle cx="' + f(pp[0]) + '" cy="' + f(pp[1]) + '" r="15" class="wp-bg"/><text x="' + f(pp[0]) + '" y="' + f(pp[1]) + '" class="wh-pl">' + gl(x.id) + '</text>' +
        '<text x="' + f(dd[0]) + '" y="' + f(dd[1]) + '" class="wh-deg">' + Math.floor(x.deg) + '°' + (x.retro ? 'R' : '') + '</text></g>';
    });
    [['AC', ch.asc], ['MC', ch.mc]].forEach(function (a) { var q = pt(a[1], rO + 0), q2 = pt(a[1], rO - 18); s += '<text x="' + f(q2[0]) + '" y="' + f(q2[1]) + '" class="wh-ang">' + a[0] + '</text>'; });
    return s + '</svg>';
  }

  /* ---------- texto base ---------- */
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function planetLine(p) {
    var t = '';
    if (p.id === 'Sol') t = T.SUN[p.sign]; else if (p.id === 'Luna') t = T.MOON[p.sign];
    else if (p.id === 'Mercurio') t = 'En ' + AS[p.sign].n + ', tu mente ' + T.MERC[p.sign]; else if (p.id === 'Venus') t = 'En ' + AS[p.sign].n + ', tu forma de amar ' + T.VEN[p.sign];
    else if (p.id === 'Marte') t = 'En ' + AS[p.sign].n + ', tu acción: ' + T.MARS[p.sign];
    else if (p.id === 'Plutón') t = T.PLUTO[p.sign] + ' ' + T.GEN['Plutón'];
    else if (p.id === 'Nodo Norte') t = T.NODE[p.sign];
    else if (p.id === 'Lilith') t = 'Lilith en ' + AS[p.sign].n + ' señala una zona de instinto, rechazo y poder reprimido que pide aceptación: ' + TX.STYLE[p.sign] + '.';
    else t = TX.planetText(p);
    if (p.dign) t += ' ' + cap(p.id) + ' ' + T.DIGN[p.dign];
    return t;
  }
  function houseLine(p) { return 'En la ' + T.HOUSE[p.house].replace(':', '').toLowerCase().replace('casa ', 'casa ') + '. Ahí viven ' + TX.PLANETS[p.id === 'Nodo Norte' ? 'Nodo Norte' : p.id].kw + (p.id === 'Lilith' ? '.' : '.'); }

  function bigThree(ch) {
    var sun = ch.planets[0], moon = ch.planets[1];
    return '<div class="big3"><div><small>Sol</small><b>' + AS[sun.sign].g + ' ' + AS[sun.sign].n + '</b><span>casa ' + sun.house + '</span></div><div><small>Luna</small><b>' + AS[moon.sign].g + ' ' + AS[moon.sign].n + '</b><span>casa ' + moon.house + '</span></div>' +
      '<div><small>Ascendente</small><b>' + AS[Math.floor(ch.asc / 30)].g + ' ' + AS[Math.floor(ch.asc / 30)].n + '</b><span>' + fmtLon(ch.mc).split(' ')[0] + ' MC</span></div></div>';
  }

  function ruleLine(ch, cuspIdx) {
    var sign = Math.floor(ch.cusps[cuspIdx] / 30), rn = E.RULER[sign], rp = ch.planets.filter(function (p) { return p.id === rn; })[0];
    return { sign: sign, rn: rn, rp: rp };
  }

  /* ---------- vistas ---------- */
  function ruedaHTML(ch) {
    var d = natalData(), when = ch.when;
    var h = '<div class="chips">' + SYS.map(function (s) { return '<button data-a="natSys" data-v="' + s[0] + '" class="' + (N.sys === s[0] ? 'on' : '') + '">' + s[1] + '</button>'; }).join('') + '</div>';
    h += '<div class="wheelwrap">' + wheelSVG(ch, { lilith: false }) + '</div>' + bigThree(ch);
    h += '<article class="rd sum"><div class="rd-h"><div><small>' + (d.unknown ? 'Hora desconocida (12:00)' : d.d + ' ' + MON[d.m - 1] + ' ' + d.y + ' · ' + pad(d.h) + ':' + pad(d.mi)) + ' · ' + esc(d.place.name) + '</small><b>Carta ' + ch.sect + ' · ' + ch.moonPhase.emoji + ' ' + esc(ch.moonPhase.name) + '</b></div></div>' +
      '<p>Sistema de casas: <b>' + (SYS.filter(function (s) { return s[0] === ch.system; })[0] || SYS[3])[1] + '</b>' + (ch.system !== N.sys ? ' (se usó Porfirio por la latitud extrema)' : '') + '. Regente de la carta: <b>' + esc(ch.rulerName) + '</b> en ' + AS[ch.ruler.sign].n + ', casa ' + ch.ruler.house + '.</p>' +
      (d.unknown ? '<p class="err">Sin la hora exacta, el ascendente y las casas son orientativos.</p>' : '') + '<button class="btn ghost sm" data-a="natEdit">Editar datos de nacimiento</button></article>';
    h += '<p class="hint c">Toca un planeta de la rueda para ver su interpretación.</p>';
    return h;
  }

  function posicionesHTML(ch) {
    var rows = ch.planets.concat([{ id: 'AC', lon: ch.asc, sign: Math.floor(ch.asc / 30), deg: ch.asc % 30, house: 1, status: 'ángulo' }, { id: 'MC', lon: ch.mc, sign: Math.floor(ch.mc / 30), deg: ch.mc % 30, house: 10, status: 'ángulo' }, { id: 'Fortuna', lon: ch.fortune.lon, sign: ch.fortune.sign, deg: ch.fortune.deg, house: ch.fortune.house, status: 'punto' }]);
    var h = '<div class="tbl">' + rows.map(function (p) {
      var g = GL[p.id] ? gl(p.id) : '⊗';
      return '<div class="trow" data-a="wheelPlanet" data-id="' + p.id + '"><span class="tg">' + g + '</span><b>' + esc(p.id) + '</b><span>' + AS[p.sign].g + '︎ ' + AS[p.sign].n + ' ' + Math.floor(p.deg) + '°' + pad(Math.floor((p.deg % 1) * 60)) + '′</span><span class="tc">casa ' + p.house + '</span>' +
        '<em class="chip2 ' + (p.status === 'retrógrado' ? 'rx' : p.status === 'estacionario' ? 'st' : 'ok') + '">' + (p.status === 'retrógrado' ? '℞ ' : '') + esc(p.status) + '</em>' + (p.dign ? '<i class="dg">' + p.dign + '</i>' : '') + '</div>';
    }).join('') + '</div>';
    h += '<h3 class="sec">Equilibrio</h3><div class="facts">' + Object.keys(ch.elements).map(function (k) { return '<div><small>' + k + '</small><b>' + ch.elements[k] + '</b></div>'; }).join('') + Object.keys(ch.modes).map(function (k) { return '<div><small>' + k + '</small><b>' + ch.modes[k] + '</b></div>'; }).join('') + '</div>';
    return h + '<p class="fine">Posiciones geocéntricas tropicales. Precisión ≈ 0,1°. Quirón y asteroides no se incluyen.</p>';
  }

  function casasHTML(ch) {
    var h = '<div class="tbl">';
    for (var i = 1; i <= 12; i++) {
      var r = ruleLine(ch, i), inH = ch.planets.filter(function (p) { return p.house === i && ['Nodo Norte', 'Lilith'].indexOf(p.id) < 0; }).map(function (p) { return gl(p.id); }).join(' ');
      h += '<div class="crow"><b>' + i + '</b><div><span>' + fmtDeg(ch.cusps[i]) + ' · ' + AS[r.sign].n + '</span><small>' + esc(T.HOUSE[i].split(': ')[0].replace('Casa ', '').replace(/^[IVX]+ · /, '')) + '</small></div><span class="cr">' + (inH || '·') + '</span>' +
        '<p>Regente: <b>' + esc(r.rn) + '</b> en ' + AS[r.rp.sign].n + ', casa ' + r.rp.house + ' → tu ' + esc(TX.HOUSE[i]) + ' se conecta con ' + esc(TX.HOUSE[r.rp.house]) + '.</p></div>';
    }
    return h + '</div>';
  }

  function aspectosHTML(ch) {
    var ids = ['Sol', 'Luna', 'Mercurio', 'Venus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutón', 'Nodo Norte', 'AC', 'MC'], map = {};
    ch.aspects.forEach(function (a) { map[a.a + '|' + a.b] = a; map[a.b + '|' + a.a] = a; });
    var h = '<div class="agrid"><table><tr><th></th>' + ids.slice(0, -1).map(function (i) { return '<th>' + gl(i) + '</th>'; }).join('') + '</tr>';
    for (var r = 1; r < ids.length; r++) {
      h += '<tr><th>' + gl(ids[r]) + '</th>';
      for (var c = 0; c < ids.length - 1; c++) {
        if (c >= r) { h += '<td class="x"></td>'; continue; }
        var a = map[ids[r] + '|' + ids[c]];
        h += '<td class="' + (a ? 'a-' + a.k : '') + '" title="' + (a ? a.type + ' ' + a.orb.toFixed(1) + '°' : '') + '">' + (a ? AG[a.type] : '') + '</td>';
      }
      h += '</tr>';
    }
    h += '</table></div>';
    h += '<h3 class="sec">Lista de aspectos (' + ch.aspects.length + ')</h3>' + ch.aspects.slice(0, 40).map(function (a) {
      return '<article class="rd"><div class="rd-h"><div><small>' + a.type + ' · orbe ' + a.orb.toFixed(1) + '°' + (a.exact ? ' · exacto' : '') + '</small><b>' + lab(a.a) + ' ' + AG[a.type] + ' ' + lab(a.b) + '</b></div></div><p>' + esc(cap(T.NAMES[a.a]) + ' y ' + T.NAMES[a.b] + ' ' + T.ASP[a.type][0]) + '</p></article>';
    }).join('');
    return h;
  }

  function informeHTML(ch) {
    var asc = Math.floor(ch.asc / 30), P0 = ch.planets, by = {}; P0.forEach(function (p) { by[p.id] = p; });
    var h = bigThree(ch);
    h += sec('☉ Sol en ' + AS[by['Sol'].sign].n + ', casa ' + by['Sol'].house, T.SUN[by['Sol'].sign] + (by['Sol'].dign ? ' El Sol ' + T.DIGN[by['Sol'].dign] : '') + ' En la ' + T.HOUSE[by['Sol'].house].toLowerCase().replace('casa ', 'casa '));
    h += sec('☽ Luna en ' + AS[by['Luna'].sign].n + ', casa ' + by['Luna'].house, T.MOON[by['Luna'].sign] + (by['Luna'].dign ? ' La Luna ' + T.DIGN[by['Luna'].dign] : '') + ' ' + T.HOUSE[by['Luna'].house]);
    h += sec('↑ Ascendente en ' + AS[asc].n, T.ASC[asc] + ' Su regente es ' + ch.rulerName + ' (' + AS[ch.ruler.sign].n + ', casa ' + ch.ruler.house + '): el rumbo de tu vida se orienta hacia ' + TX.HOUSE[ch.ruler.house] + '.');
    ['Mercurio', 'Venus', 'Marte'].forEach(function (id) { var p = by[id]; h += sec(lab(id) + ' en ' + AS[p.sign].n + ', casa ' + p.house + (p.status === 'retrógrado' ? ' ℞' : ''), planetLine(p) + (p.status === 'retrógrado' ? ' ' + TX.PLANETS[id].retro : '') + ' ' + T.HOUSE[p.house]); });
    ['Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutón'].forEach(function (id) { var p = by[id]; h += sec(lab(id) + ' en ' + AS[p.sign].n + ', casa ' + p.house + (p.status === 'retrógrado' ? ' ℞' : ''), planetLine(p) + ' ' + T.HOUSE[p.house]); });
    h += sec('☊ Nodo Norte en ' + AS[by['Nodo Norte'].sign].n + ', casa ' + by['Nodo Norte'].house, T.NODE[by['Nodo Norte'].sign] + ' El Nodo Sur (' + AS[(by['Nodo Norte'].sign + 6) % 12].n + ') marca lo que ya dominas y conviene no repetir.');
    h += sec('⚸ Lilith en ' + AS[by['Lilith'].sign].n + ', casa ' + by['Lilith'].house, planetLine(by['Lilith']));
    var strong = ch.aspects.filter(function (a) { return a.orb < 2.5 && a.k !== 'quin'; }).slice(0, 8);
    if (strong.length) h += sec('Aspectos más fuertes', strong.map(function (a) { return lab(a.a) + ' ' + AG[a.type] + ' ' + lab(a.b) + ': ' + cap(T.NAMES[a.a]) + ' y ' + T.NAMES[a.b] + ' ' + T.ASP[a.type][0]; }).join('\n'));
    if (ch.patterns.length) h += sec('Patrones de la carta', ch.patterns.map(function (x) { return x.txt; }).join('\n'));
    var el = Object.keys(ch.elements).sort(function (a, b) { return ch.elements[b] - ch.elements[a]; }), md = Object.keys(ch.modes).sort(function (a, b) { return ch.modes[b] - ch.modes[a]; });
    h += sec('Elementos y modalidades', 'Predomina el elemento ' + el[0].toLowerCase() + ' (' + ch.elements[el[0]] + ') y la modalidad ' + md[0].toLowerCase() + ' (' + ch.modes[md[0]] + '). ' + (ch.elements[el[3]] === 0 ? 'Falta el elemento ' + el[3].toLowerCase() + ': conviene cultivarlo conscientemente. ' : '') + 'Carta ' + ch.sect + ' (' + (ch.sect === 'diurna' ? 'el Sol sobre el horizonte: más orientada a la acción exterior' : 'el Sol bajo el horizonte: más orientada a lo interior') + '). Fase lunar al nacer: ' + ch.moonPhase.name + '.');
    var crowd = {}; P0.slice(0, 10).forEach(function (p) { crowd[p.house] = (crowd[p.house] || 0) + 1; });
    var hot = Object.keys(crowd).filter(function (k) { return crowd[k] >= 3; });
    if (hot.length) h += sec('Casas destacadas', hot.map(function (k) { return 'Casa ' + k + ' (' + crowd[k] + ' planetas): ' + T.HOUSE[k]; }).join('\n') + '\nLas áreas con varios planetas concentran gran parte de tu vida.');
    var retro = P0.slice(2, 10).filter(function (p) { return p.status === 'retrógrado'; });
    if (retro.length) h += sec('Planetas retrógrados natales', retro.map(function (p) { return p.id + ' ℞: su energía se vive hacia dentro y madura con el tiempo; revisa, repite y profundiza antes de expresarla.'; }).join('\n'));
    h += '<h3 class="sec">Informe profesional con IA</h3><div id="natai">' + aiBox() + '</div>';
    return h + '<p class="fine">Interpretación basada en astrología tradicional y psicológica. Es una herramienta de autoconocimiento, no una predicción.</p>';
  }
  function sec(title, body) { return '<article class="rd"><div class="rd-h"><div><small>' + '</small><b>' + esc(title) + '</b></div></div>' + ARC.fmt(body) + '</article>'; }
  function aiBox() {
    if (N.aiState === 'loading') return '<div class="ai load"><div class="orb-s"></div><p>Leyendo tu carta…</p></div>';
    if (N.aiState === 'done') return '<div class="ai">' + ARC.fmt(N.ai) + '</div><button class="btn link" data-a="natAI">↻ Regenerar</button>';
    return (N.aiState === 'error' ? '<p class="err">' + esc(N.aiErr) + '</p>' : '') + '<p class="hint">Un análisis largo y estructurado (propósito, relaciones, trabajo, sombras, ciclos) que integra tu carta con lo que Sibila sabe de ti.</p><button class="btn primary big" data-a="natAI">✨ Generar informe profesional</button>';
  }
  function chartSummary(ch) {
    var L = ['CARTA NATAL (' + ch.system + '; ' + ch.sect + '): Ascendente ' + fmtLon(ch.asc) + ', MC ' + fmtLon(ch.mc) + '.'];
    ch.planets.forEach(function (p) { L.push(p.id + ' en ' + fmtLon(p.lon) + ', casa ' + p.house + (p.status === 'retrógrado' ? ', retrógrado' : '') + (p.dign ? ', ' + p.dign : '')); });
    L.push('Aspectos: ' + ch.aspects.slice(0, 22).map(function (a) { return a.a + ' ' + a.type + ' ' + a.b + ' (' + a.orb.toFixed(1) + '°)'; }).join('; '));
    if (ch.patterns.length) L.push('Patrones: ' + ch.patterns.map(function (x) { return x.txt; }).join(' '));
    L.push('Elementos: ' + JSON.stringify(ch.elements) + '; modalidades: ' + JSON.stringify(ch.modes) + '. Regente: ' + ch.rulerName + ' en ' + AS[ch.ruler.sign].n + ', casa ' + ch.ruler.house + '. Fortuna en ' + fmtLon(ch.fortune.lon) + ', casa ' + ch.fortune.house + '.');
    return L.join('\n');
  }

  function transitosHTML(ch) {
    var when = N.trDate ? new Date(N.trDate + 'T12:00:00') : new Date(), tr = E.transits(ch, when), natal = ch;
    var h = '<div class="datebar"><input type="date" id="trdate" value="' + when.getFullYear() + '-' + pad(when.getMonth() + 1) + '-' + pad(when.getDate()) + '"><button class="btn ghost sm" data-a="trToday">Hoy</button></div>';
    h += '<div class="trpl">' + tr.planets.map(function (p) { return '<span title="' + p.id + '">' + gl(p.id) + ' ' + AS[p.sign].g + '︎ ' + Math.floor(p.deg) + '°' + (p.status === 'retrógrado' ? 'R' : '') + '</span>'; }).join('') + '</div>';
    var slow = tr.aspects.filter(function (a) { return a.slow; }), fast = tr.aspects.filter(function (a) { return !a.slow; }).slice(0, 8);
    h += '<h3 class="sec">Tránsitos lentos (los que marcan etapas)</h3>' + (slow.length ? slow.map(trCard).join('') : '<p class="hint">Sin tránsitos lentos activos en esta fecha.</p>');
    h += '<h3 class="sec">Tránsitos rápidos (el clima de estos días)</h3>' + (fast.length ? fast.map(trCard).join('') : '<p class="hint">Sin tránsitos rápidos exactos.</p>');
    return h + '<p class="fine">Se muestran tránsitos con orbe de hasta 3° (2° para los planetas personales) sobre tus planetas natales y ángulos.</p>';
  }
  function trCard(a) {
    var dur = { 'Júpiter': 'unas semanas', 'Saturno': 'varios meses', 'Urano': 'varios meses o años', 'Neptuno': 'años', 'Plutón': 'años' }[a.t] || 'unos días';
    var nature = T.ASP[a.type][1] === 'H' ? 'Tensión que activa un cambio' : T.ASP[a.type][1] === 'S' ? 'Apoyo y oportunidad' : 'Intensificación';
    return '<article class="rd"><div class="rd-h"><div><small>' + a.type + ' · orbe ' + a.orb.toFixed(1) + '° · dura ~' + dur + (a.tRetro ? ' · ℞' : '') + '</small><b>' + lab(a.t) + ' en tránsito ' + AG[a.type] + ' ' + lab(a.n) + ' natal</b></div></div>' +
      '<p>' + esc(nature + ': ' + cap(T.NAMES[a.t]) + ' (tránsito) y ' + T.NAMES[a.n] + ' (natal) ' + T.ASP[a.type][0]) + '</p></article>';
  }

  function progresionesHTML(ch) {
    var now = new Date(), pr = E.progressed(ch, now), nat = ch, sunP = pr.planets[0], moonP = pr.planets[1];
    var asp = E.aspectsAmong(pr.planets.slice(0, 10), nat.points.filter(function (p) { return p.id !== 'Lilith'; }), false).filter(function (a) { return a.orb <= 1.2; }).slice(0, 10);
    var ageY = pr.age;
    var h = '<article class="rd sum"><div class="rd-h"><div><small>Edad ' + ageY.toFixed(1) + ' · fecha progresada ' + pr.progDate.toLocaleDateString('es-ES') + '</small><b>Progresiones secundarias (un día = un año)</b></div></div>' +
      '<p><b>☉ Sol progresado:</b> ' + fmtLon(sunP.lon) + ', casa ' + E.houseOf(sunP.lon, nat.cusps) + ' natal. Tu identidad se está viviendo con la energía de ' + AS[sunP.sign].n + ' (' + TX.STYLE[sunP.sign] + ').</p>' +
      '<p><b>☽ Luna progresada:</b> ' + fmtLon(moonP.lon) + ', casa ' + E.houseOf(moonP.lon, nat.cusps) + ' natal. Tu ciclo emocional actual tiene tono de ' + AS[moonP.sign].n + ' (' + esc(TX.MOONMOOD[moonP.sign]) + ') y se centra en ' + TX.HOUSE[E.houseOf(moonP.lon, nat.cusps)] + '.</p>' +
      '<p><b>↑ Ascendente progresado:</b> ' + fmtLon(pr.asc) + ' · <b>MC:</b> ' + fmtLon(pr.mc) + '.</p></article>';
    h += '<h3 class="sec">Planetas progresados</h3><div class="trpl">' + pr.planets.slice(0, 10).map(function (p) { return '<span>' + gl(p.id) + ' ' + AS[p.sign].g + '︎ ' + Math.floor(p.deg) + '°' + (p.status === 'retrógrado' ? 'R' : '') + '</span>'; }).join('') + '</div>';
    h += '<h3 class="sec">Aspectos progresados activos</h3>' + (asp.length ? asp.map(function (a) { return '<article class="rd"><div class="rd-h"><div><small>' + a.type + ' · orbe ' + a.orb.toFixed(1) + '°</small><b>' + lab(a.a) + ' prog. ' + AG[a.type] + ' ' + lab(a.b) + ' natal</b></div></div><p>' + esc(cap(T.NAMES[a.a]) + ' y ' + T.NAMES[a.b] + ' ' + T.ASP[a.type][0]) + '</p></article>'; }).join('') : '<p class="hint">Sin aspectos progresados exactos ahora mismo.</p>');
    return h + '<p class="fine">Las progresiones muestran la evolución interior lenta; se leen junto a los tránsitos.</p>';
  }

  function retornoHTML(ch) {
    var y = N.srYear, sr = E.solarReturn(ch, y), sunH = E.houseOf(sr.planets[0].lon, ch.cusps), moonH = E.houseOf(sr.planets[1].lon, ch.cusps), asc = Math.floor(sr.asc / 30);
    var h = '<div class="datebar"><button class="btn ghost sm" data-a="srY" data-v="-1">‹</button><b class="yrbig">' + y + '</b><button class="btn ghost sm" data-a="srY" data-v="1">›</button></div>';
    h += '<div class="wheelwrap sm">' + wheelSVG(sr, {}) + '</div>';
    h += '<article class="rd sum"><div class="rd-h"><div><small>Revolución solar ' + y + ' · ' + sr.when.toLocaleString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + '</small><b>El tema de tu año</b></div></div>' +
      '<p><b>Ascendente de retorno:</b> ' + AS[asc].n + '. ' + esc(T.ASC[asc]) + ' Es la actitud con la que enfrentas este año.</p>' +
      '<p><b>Sol en tu casa natal ' + sunH + ':</b> el foco del año es ' + esc(TX.HOUSE[sunH]) + '.</p>' +
      '<p><b>Luna de retorno en ' + AS[sr.planets[1].sign].n + ', casa natal ' + moonH + ':</b> ' + esc(TX.MOONMOOD[sr.planets[1].sign]) + ' Tus emociones se vuelcan en ' + esc(TX.HOUSE[moonH]) + '.</p></article>';
    var sp = sr.planets.slice(2, 10).filter(function (p) { return p.status === 'retrógrado'; }).map(function (p) { return p.id; });
    h += '<article class="rd"><div class="rd-h"><div><small>Detalles</small><b>Claves del año</b></div></div><p>Planetas retrógrados en el retorno: ' + (sp.join(', ') || 'ninguno') + '.</p><p>Elemento dominante: ' + Object.keys(sr.elements).sort(function (a, b) { return sr.elements[b] - sr.elements[a]; })[0] + '.</p></article>';
    return h + '<p class="fine">El retorno solar se calcula para tu lugar de nacimiento (tradición clásica).</p>';
  }

  function p2form() {
    var f = N.p2form || (N.p2form = { date: '', time: '12:00', place: null });
    var res = N.p2res.map(function (r, i) { return '<button class="place" data-a="natPlace2" data-i="' + i + '"><b>' + esc(r.name) + '</b><small>' + esc(r.sub || r.tz) + '</small></button>'; }).join('');
    return '<div class="panel"><div class="lbl">Otra persona (sinastría)</div><input type="date" id="p2_date" value="' + esc(f.date) + '"><div class="lbl">Hora</div><input type="time" id="p2_time" value="' + esc(f.time) + '">' +
      '<div class="lbl">Lugar</div>' + (f.place ? '<div class="placesel"><b>📍 ' + esc(f.place.name) + '</b></div>' : '') + '<div class="datebar"><input id="p2_q" type="search" placeholder="Ciudad…" value="' + esc(N.p2q) + '"><button class="btn primary sm" data-a="natSearch2">Buscar</button></div><div class="places">' + res + '</div>' +
      '<button class="btn primary big" data-a="synRun">Comparar cartas</button></div>';
  }
  function sinastriaHTML(ch) {
    var h = p2form();
    if (!N.p2) return h;
    var c2 = N.p2, syn = E.synastry(ch, c2), comp = E.composite(ch, c2);
    var key = syn.aspects.filter(function (a) { return a.orb < 3 && a.k !== 'quin'; });
    function has(a, b) { return key.filter(function (x) { return (x.a === a && x.b === b) || (x.a === b && x.b === a); }); }
    var heat = key.filter(function (a) { return a.k === 'trig' || a.k === 'sext' || a.k === 'conj'; }).length, tens = key.filter(function (a) { return a.k === 'cuad' || a.k === 'opos'; }).length;
    var score = Math.max(15, Math.min(96, Math.round(55 + heat * 4 - tens * 3 + (has('Sol', 'Luna').length ? 8 : 0) + (has('Venus', 'Marte').length ? 8 : 0))));
    h += '<article class="rd sum"><div class="rd-h"><div><small>Resumen de la sinastría</small><b>💞 ' + score + '% de afinidad astrológica</b></div></div><div class="meter"><i style="width:' + score + '%"></i></div><p>' + heat + ' contactos armónicos y ' + tens + ' tensos. ' +
      (has('Sol', 'Luna').length ? 'Hay contacto Sol–Luna (conexión de fondo). ' : '') + (has('Venus', 'Marte').length ? 'Hay contacto Venus–Marte (atracción). ' : '') + (key.filter(function (x) { return x.a === 'Saturno' || x.b === 'Saturno'; }).length ? 'Saturno participa: compromiso y aprendizaje. ' : '') + '</p><p class="hint">Es un indicador simbólico: las relaciones dependen sobre todo de las personas.</p></article>';
    h += '<h3 class="sec">Compuesta (punto medio)</h3><article class="rd"><p>Sol compuesto en ' + fmtLon(comp.planets[0].lon) + ' · Luna ' + fmtLon(comp.planets[1].lon) + ' · Venus ' + fmtLon(comp.planets[3].lon) + ' · Ascendente ' + fmtLon(comp.asc) + '.</p><p class="hint">La carta compuesta describe la "personalidad" de la relación como tercer ente.</p></article>';
    h += '<h3 class="sec">Aspectos entre cartas</h3>' + syn.aspects.slice(0, 18).map(function (a) { return '<article class="rd"><div class="rd-h"><div><small>' + a.type + ' · orbe ' + a.orb.toFixed(1) + '°</small><b>Tu ' + lab(a.a) + ' ' + AG[a.type] + ' su ' + lab(a.b) + '</b></div></div><p>' + esc(cap(T.NAMES[a.a]) + ' (tuya) y ' + T.NAMES[a.b] + ' (suya) ' + T.ASP[a.type][0]) + '</p></article>'; }).join('');
    h += '<h3 class="sec">Superposición de casas</h3><div class="trpl">' + syn.overlays.map(function (o) { return '<span>' + gl(o.id) + ' suyo en tu casa ' + o.house + '</span>'; }).join('') + '</div>';
    return h;
  }

  var SUBS = [['rueda', '🧿 Rueda'], ['pos', '📋 Posiciones'], ['casas', '🏠 Casas'], ['asp', '🔗 Aspectos'], ['informe', '📖 Informe'], ['tr', '🌠 Tránsitos'], ['prog', '⏳ Progresiones'], ['sr', '🎂 Retorno solar'], ['syn', '💞 Sinastría']];
  function html() {
    var ch = getChart();
    if (!ch || N.editing) return formHTML();
    var tabs = '<div class="chips sub2">' + SUBS.map(function (s) { return '<button data-a="natSub" data-v="' + s[0] + '" class="' + (N.sub === s[0] ? 'on' : '') + '">' + s[1] + '</button>'; }).join('') + '</div>';
    var body = N.sub === 'rueda' ? ruedaHTML(ch) : N.sub === 'pos' ? posicionesHTML(ch) : N.sub === 'casas' ? casasHTML(ch) : N.sub === 'asp' ? aspectosHTML(ch) : N.sub === 'informe' ? informeHTML(ch) : N.sub === 'tr' ? transitosHTML(ch) : N.sub === 'prog' ? progresionesHTML(ch) : N.sub === 'sr' ? retornoHTML(ch) : sinastriaHTML(ch);
    return tabs + '<div class="natbody">' + body + '</div>';
  }

  /* ---------- geocodificación ---------- */
  function searchPlaces(q) {
    var nq = ARC.norm(q), local = PLACES.filter(function (p) { return ARC.norm(p.name).indexOf(nq) > -1; }).slice(0, 6);
    return fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(q) + '&count=6&language=es&format=json').then(function (r) { return r.json(); }).then(function (j) {
      var api = (j.results || []).filter(function (x) { return x.timezone; }).map(function (x) { return { name: x.name + (x.admin1 ? ', ' + x.admin1 : '') + (x.country ? ' (' + x.country + ')' : ''), lat: x.latitude, lon: x.longitude, tz: x.timezone, sub: x.timezone }; });
      return local.concat(api);
    }).catch(function () { return local; });
  }

  /* ---------- acciones ---------- */
  A.natSub = function (el) { N.sub = el.dataset.v; N.editing = false; ARC.render(true); };
  A.natSys = function (el) { N.sys = el.dataset.v; ARC.render(true); };
  A.natEdit = function () { N.editing = true; var d = natalData(); N.form = { date: d.y + '-' + pad(d.m) + '-' + pad(d.d), time: pad(d.h || 12) + ':' + pad(d.mi || 0), unknown: !!d.unknown, place: d.place }; ARC.render(true); };
  A.natSearch = function () {
    var q = ($('#nat_q') || {}).value || ''; N.q = q; if (q.trim().length < 2) { ARC.toast('Escribe al menos 2 letras'); return; }
    N.searching = true; N.results = []; ARC.render(true);
    searchPlaces(q.trim()).then(function (r) { N.results = r; N.searching = false; if (!r.length) ARC.toast('No encontré ese lugar'); ARC.render(true); });
  };
  A.natPlace = function (el) { N.form.place = N.results[Number(el.dataset.i)]; N.results = []; ARC.render(true); };
  A.natSave = function () {
    var f = N.form; if (!f.date) { ARC.toast('Elige la fecha'); return; } if (!f.place) { ARC.toast('Elige el lugar de nacimiento'); return; }
    var dp = f.date.split('-'), tp = (f.time || '12:00').split(':');
    P.natal = { y: +dp[0], m: +dp[1], d: +dp[2], h: f.unknown ? 12 : +tp[0], mi: f.unknown ? 0 : +tp[1], unknown: !!f.unknown, place: f.place };
    if (!P.birth) P.birth = { y: +dp[0], m: +dp[1], d: +dp[2] };
    ARC.save('profile'); N.chartKey = ''; N.editing = false; N.sub = 'rueda'; ARC.render(true); ARC.toast('Carta natal calculada ✨');
  };
  A.trToday = function () { N.trDate = null; ARC.render(true); };
  A.srY = function (el) { N.srYear += Number(el.dataset.v); ARC.render(true); };
  A.natSearch2 = function () {
    var q = ($('#p2_q') || {}).value || ''; N.p2q = q; if (q.trim().length < 2) return;
    searchPlaces(q.trim()).then(function (r) { N.p2res = r; ARC.render(true); });
  };
  A.natPlace2 = function (el) { N.p2form.place = N.p2res[Number(el.dataset.i)]; N.p2res = []; ARC.render(true); };
  A.synRun = function () {
    var f = N.p2form; if (!f || !f.date || !f.place) { ARC.toast('Faltan fecha o lugar'); return; }
    var dp = f.date.split('-'), tp = (f.time || '12:00').split(':');
    N.p2 = E.chart(E.localToUTC(+dp[0], +dp[1], +dp[2], +tp[0], +tp[1], f.place.tz, f.place.lon), f.place, N.sys); ARC.render(true);
  };
  A.wheelPlanet = function (el) {
    var ch = getChart(), id = el.dataset.id, p = ch.planets.filter(function (x) { return x.id === id; })[0];
    if (!p) {
      if (id === 'AC') p = { id: 'AC', sign: Math.floor(ch.asc / 30), deg: ch.asc % 30, house: 1, lon: ch.asc }; else if (id === 'MC') p = { id: 'MC', sign: Math.floor(ch.mc / 30), deg: ch.mc % 30, house: 10, lon: ch.mc };
      else p = { id: 'Fortuna', sign: ch.fortune.sign, deg: ch.fortune.deg, house: ch.fortune.house, lon: ch.fortune.lon };
    }
    var asp = ch.aspects.filter(function (a) { return a.a === id || a.b === id; }).slice(0, 8), txt = ['AC', 'MC', 'Fortuna'].indexOf(id) > -1 ? (id === 'AC' ? T.ASC[p.sign] : id === 'MC' ? 'Tu vocación y proyección pública se expresan ' + TX.STYLE[p.sign] + '.' : 'El Punto de Fortuna en ' + AS[p.sign].n + ' señala dónde fluye tu bienestar y suerte natural.') : planetLine(p);
    ARC.openModal('<h3>' + (GL[id] ? gl(id) : '⊗') + ' ' + esc(id) + '</h3><p class="kw">' + AS[p.sign].g + '︎ ' + AS[p.sign].n + ' ' + Math.floor(p.deg) + '° · casa ' + p.house + (p.status === 'retrógrado' ? ' · retrógrado' : '') + '</p><p>' + esc(txt) + '</p><p>' + esc(T.HOUSE[p.house]) + '</p>' +
      (asp.length ? '<h4>Aspectos</h4>' + asp.map(function (a) { var o = a.a === id ? a.b : a.a; return '<p>' + AG[a.type] + ' ' + a.type + ' con ' + lab(o) + ' (' + a.orb.toFixed(1) + '°): ' + esc(cap(T.NAMES[id] || '') + ' y ' + (T.NAMES[o] || '') + ' ' + T.ASP[a.type][0]) + '</p>'; }).join('') : ''), 'tall');
  };
  A.natAI = function () {
    var ch = getChart(); if (!ch) return;
    ARC.ai.guard(function () {
      N.aiState = 'loading'; var el = $('#natai'); if (el) el.innerHTML = aiBox();
      var user = 'CONTEXTO\n' + ARC.ctx() + '\n\n' + chartSummary(ch) + '\n\nEscribe un informe de carta natal de nivel profesional, claro y humano, en español, con estas secciones en negrita: Esencia (Sol, Luna, Ascendente), Mente y comunicación, Amor y relaciones, Vocación y dinero, Sombras y retos, Dones y recursos, Aspectos y patrones clave, Etapa actual de vida. Cita explícitamente los datos de la carta en los que te basas (planeta, signo, casa, aspecto). Máximo 900 palabras. Termina con 3 preguntas de introspección.';
      ARC.ai.ask({ system: 'Eres una astróloga profesional con enfoque psicológico y ético. Usa únicamente los datos astronómicos proporcionados; no inventes posiciones. No hagas predicciones absolutas ni des consejos médicos, legales o financieros. Presenta la astrología como lenguaje simbólico de autoconocimiento. ' + ARC.PERSONALIZE, messages: [{ role: 'user', content: user }], max: 1800 })
        .then(function (t) { N.ai = t; N.aiState = 'done'; }).catch(function (e) { N.aiState = 'error'; N.aiErr = e.message; })
        .then(function () { var e2 = $('#natai'); if (e2) e2.innerHTML = aiBox(); });
    });
  };
  ARC.changes.nat_date = function (v) { N.form.date = v; };
  ARC.changes.nat_time = function (v) { N.form.time = v; };
  ARC.changes.nat_unknown = function (v) { N.form.unknown = v; ARC.render(true); };
  ARC.inputs.nat_q = function (v) { N.q = v; };
  ARC.changes.trdate = function (v) { N.trDate = v; ARC.render(true); };
  ARC.changes.p2_date = function (v) { N.p2form.date = v; };
  ARC.changes.p2_time = function (v) { N.p2form.time = v; };
  ARC.inputs.p2_q = function (v) { N.p2q = v; };
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.id === 'nat_q') { e.preventDefault(); A.natSearch(); } if (e.key === 'Enter' && e.target.id === 'p2_q') { e.preventDefault(); A.natSearch2(); } });

  ARC.natal = { html: html, chart: getChart, PLACES: PLACES, searchPlaces: searchPlaces, chartSummary: chartSummary, summaryForAI: function () { var ch = getChart(); return ch ? chartSummary(ch) : ''; } };
})();
