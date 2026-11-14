/* Efemérides y cartas: planetas (con Plutón), ascendente, medio cielo, casas, aspectos, patrones,
   tránsitos, progresiones, retorno solar, sinastría. Métodos públicos: Meeus y elementos keplerianos
   aproximados de E. M. Standish (JPL, 1800–2050). Precisión ~0,1°–0,5° (Luna ~0,05°). */
(function (root) {
  'use strict';
  var A = root.ASTRO, RAD = Math.PI / 180;
  var sin = function (d) { return Math.sin(d * RAD); }, cos = function (d) { return Math.cos(d * RAD); }, tan = function (d) { return Math.tan(d * RAD); };
  var norm = function (d) { d = d % 360; return d < 0 ? d + 360 : d; };
  var diff = function (a, b) { return ((a - b + 540) % 360) - 180; };

  /* ---------- elementos keplerianos (Standish, Tabla 1) ---------- */
  // [a, da, e, de, I, dI, L, dL, peri, dperi, node, dnode]  (por siglo juliano desde J2000)
  var EL = {
    'Mercurio': [0.38709927, 0.00000037, 0.20563593, 0.00001906, 7.00497902, -0.00594749, 252.2503235, 149472.67411175, 77.45779628, 0.16047689, 48.33076593, -0.12534081],
    'Venus': [0.72333566, 0.0000039, 0.00677672, -0.00004107, 3.39467605, -0.0007889, 181.9790995, 58517.81538729, 131.60246718, 0.00268329, 76.67984255, -0.27769418],
    'Tierra': [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0, 0],
    'Marte': [1.52371034, 0.00001847, 0.0933941, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343],
    'Júpiter': [5.202887, -0.00011607, 0.04838624, -0.00013253, 1.30439695, -0.00183714, 34.39644051, 3034.74612775, 14.72847983, 0.21252668, 100.47390909, 0.20469106],
    'Saturno': [9.53667594, -0.0012506, 0.05386179, -0.00050991, 2.48599187, 0.00193609, 49.95424423, 1222.49362201, 92.59887831, -0.41897216, 113.66242448, -0.28867794],
    'Urano': [19.18916464, -0.00196176, 0.04725744, -0.00004397, 0.77263783, -0.00242939, 313.23810451, 428.48202785, 170.9542763, 0.40805281, 74.01692503, 0.04240589],
    'Neptuno': [30.06992276, 0.00026291, 0.00859048, 0.00005105, 1.77004347, 0.00035372, -55.12002969, 218.45945325, 44.96476227, -0.32241464, 131.78422574, -0.00508664],
    'Plutón': [39.48211675, -0.00031596, 0.2488273, 0.0000517, 17.14001206, 0.00004818, 238.92903833, 145.20780515, 224.06891629, -0.04062942, 110.30393684, -0.01183482]
  };

  function kepler(M, e) {
    M = norm(M); if (M > 180) M -= 360;
    var E = M + (e / RAD) * sin(M);
    for (var i = 0; i < 15; i++) {
      var dM = M - (E - (e / RAD) * sin(E)), dE = dM / (1 - e * cos(E));
      E += dE; if (Math.abs(dE) < 1e-9) break;
    }
    return E;
  }
  function helio(name, T) {
    var p = EL[name], a = p[0] + p[1] * T, e = p[2] + p[3] * T, I = p[4] + p[5] * T, L = p[6] + p[7] * T, w = p[8] + p[9] * T, N = p[10] + p[11] * T;
    var M = L - w, om = w - N, E = kepler(M, e);
    var xp = a * (cos(E) - e), yp = a * Math.sqrt(1 - e * e) * sin(E);
    var co = cos(om), so = sin(om), cN = cos(N), sN = sin(N), cI = cos(I), sI = sin(I);
    return {
      x: (co * cN - so * sN * cI) * xp + (-so * cN - co * sN * cI) * yp,
      y: (co * sN + so * cN * cI) * xp + (-so * sN + co * cN * cI) * yp,
      z: (so * sI) * xp + (co * sI) * yp
    };
  }
  function jdOf(date) { return A.jd(date); }
  // longitud geocéntrica (eclíptica de la fecha) y latitud
  function geo(name, jd) {
    var T = (jd - 2451545) / 36525, h = helio(name, T), e = helio('Tierra', T);
    var x = h.x - e.x, y = h.y - e.y, z = h.z - e.z;
    var lon = norm(Math.atan2(y, x) / RAD + 1.3970 * T + 0.0003086 * T * T);
    return { lon: lon, lat: Math.atan2(z, Math.sqrt(x * x + y * y)) / RAD, dist: Math.sqrt(x * x + y * y + z * z) };
  }

  var ORDER = ['Sol', 'Luna', 'Mercurio', 'Venus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutón', 'Nodo Norte', 'Lilith'];
  var STATION = { Mercurio: 0.12, Venus: 0.08, Marte: 0.04, 'Júpiter': 0.025, Saturno: 0.015, Urano: 0.008, Neptuno: 0.005, 'Plutón': 0.004 };

  function lilithLon(jd) { var T = (jd - 2451545) / 36525; return norm(83.3532465 + 4069.0137287 * T - 0.01032 * T * T); }

  function bodies(jd) {
    var out = [], i;
    for (i = 0; i < ORDER.length; i++) {
      var id = ORDER[i], lon, speed;
      if (id === 'Sol') { lon = A.sunLon(jd); speed = diff(A.sunLon(jd + 0.5), A.sunLon(jd - 0.5)); }
      else if (id === 'Luna') { lon = A.moonLon(jd); speed = diff(A.moonLon(jd + 0.5), A.moonLon(jd - 0.5)); }
      else if (id === 'Nodo Norte') { lon = A.nodeLon(jd); speed = -0.053; }
      else if (id === 'Lilith') { lon = lilithLon(jd); speed = 0.111; }
      else { lon = geo(id, jd).lon; speed = diff(geo(id, jd + 0.5).lon, geo(id, jd - 0.5).lon); }
      var st = STATION[id] && Math.abs(speed) < STATION[id] ? 'estacionario' : (speed < 0 && id !== 'Nodo Norte' ? 'retrógrado' : 'directo');
      out.push({ id: id, lon: lon, speed: speed, status: id === 'Nodo Norte' ? 'medio' : st, sign: Math.floor(lon / 30), deg: lon % 30 });
    }
    return out;
  }

  /* ---------- tiempo sideral, ángulos y casas ---------- */
  function obliquity(jd) { var T = (jd - 2451545) / 36525; return 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T; }
  function gmst(jd) { var T = (jd - 2451545) / 36525; return norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - T * T * T / 38710000); }
  function lonOfRA(ra, eps) { return norm(Math.atan2(sin(ra), cos(ra) * cos(eps)) / RAD); }

  function angles(jd, lat, lon) {
    var eps = obliquity(jd), ramc = norm(gmst(jd) + lon);
    var mc = lonOfRA(ramc, eps);
    var asc = norm(Math.atan2(cos(ramc), -(sin(ramc) * cos(eps) + tan(lat) * sin(eps))) / RAD);
    if (norm(asc - mc) > 180) asc = norm(asc + 180);
    return { asc: asc, mc: mc, ramc: ramc, eps: eps };
  }

  function placidus(ang, lat) {
    var eps = ang.eps, ramc = ang.ramc, cusps = new Array(13);
    cusps[1] = ang.asc; cusps[10] = ang.mc; cusps[4] = norm(ang.mc + 180); cusps[7] = norm(ang.asc + 180);
    var ok = true;
    function cusp(f, upper, offsetRA) {
      var ra = norm(ramc + offsetRA);
      for (var i = 0; i < 40; i++) {
        var lam = lonOfRA(ra, eps), dec = Math.asin(sin(eps) * sin(lam)) / RAD, x = -tan(lat) * tan(dec);
        if (Math.abs(x) >= 1) { ok = false; return lam; }
        var sda = Math.acos(x) / RAD, nra = upper ? norm(ramc + f * sda) : norm(ramc + 180 - f * (180 - sda));
        if (Math.abs(diff(nra, ra)) < 1e-8) { ra = nra; break; }
        ra = nra;
      }
      return lonOfRA(ra, eps);
    }
    cusps[11] = cusp(1 / 3, true, 30); cusps[12] = cusp(2 / 3, true, 60);
    cusps[2] = cusp(2 / 3, false, 120); cusps[3] = cusp(1 / 3, false, 150);
    cusps[5] = norm(cusps[11] + 180); cusps[6] = norm(cusps[12] + 180); cusps[8] = norm(cusps[2] + 180); cusps[9] = norm(cusps[3] + 180);
    return ok ? cusps : null;
  }
  function equalHouses(asc) { var c = new Array(13); for (var i = 1; i <= 12; i++) c[i] = norm(asc + (i - 1) * 30); return c; }
  function wholeSign(asc) { var s = Math.floor(asc / 30) * 30, c = new Array(13); for (var i = 1; i <= 12; i++) c[i] = norm(s + (i - 1) * 30); return c; }
  function porphyry(ang) {
    var c = new Array(13), a = ang.asc, m = ang.mc, d1 = norm(a - m) / 3, d2 = norm(norm(m + 180) - a) / 3;
    c[10] = m; c[11] = norm(m + d1); c[12] = norm(m + 2 * d1); c[1] = a; c[2] = norm(a + d2); c[3] = norm(a + 2 * d2); c[4] = norm(m + 180);
    c[5] = norm(c[11] + 180); c[6] = norm(c[12] + 180); c[7] = norm(a + 180); c[8] = norm(c[2] + 180); c[9] = norm(c[3] + 180);
    return c;
  }
  function houseOf(lon, cusps) {
    for (var i = 1; i <= 12; i++) {
      var s = cusps[i], e = cusps[i === 12 ? 1 : i + 1], span = norm(e - s) || 360, off = norm(lon - s);
      if (off < span) return i;
    }
    return 1;
  }

  /* ---------- zona horaria ---------- */
  function tzOffsetMin(tz, date) {
    try {
      var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
      var o = {}; f.formatToParts(date).forEach(function (p) { if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10); });
      var asUTC = Date.UTC(o.year, o.month - 1, o.day, o.hour % 24, o.minute, o.second);
      return Math.round((asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000);
    } catch (e) { return null; }
  }
  // fecha/hora civil local → instante UTC (JS Date)
  function localToUTC(y, m, d, h, mi, tz, fallbackLon) {
    var guess = Date.UTC(y, m - 1, d, h, mi), off = tz ? tzOffsetMin(tz, new Date(guess)) : null;
    if (off === null) off = Math.round((fallbackLon || 0) / 15 * 60);
    var t = guess - off * 60000;
    if (tz) { var off2 = tzOffsetMin(tz, new Date(t)); if (off2 !== null && off2 !== off) t = guess - off2 * 60000; }
    return new Date(t);
  }

  /* ---------- carta ---------- */
  var DIGN = {
    'Sol': { dom: [4], exa: [0], det: [10], fall: [6] }, 'Luna': { dom: [3], exa: [1], det: [9], fall: [7] },
    'Mercurio': { dom: [2, 5], exa: [5], det: [8, 11], fall: [11] }, 'Venus': { dom: [1, 6], exa: [11], det: [7, 0], fall: [5] },
    'Marte': { dom: [0, 7], exa: [9], det: [6, 1], fall: [3] }, 'Júpiter': { dom: [8, 11], exa: [3], det: [2, 5], fall: [9] },
    'Saturno': { dom: [9, 10], exa: [6], det: [3, 4], fall: [0] }, 'Urano': { dom: [10], exa: [7], det: [4], fall: [1] },
    'Neptuno': { dom: [11], exa: [3], det: [5], fall: [9] }, 'Plutón': { dom: [7], exa: [4], det: [1], fall: [10] }
  };
  function dignity(id, sign) {
    var d = DIGN[id]; if (!d) return null;
    if (d.dom.indexOf(sign) > -1) return 'domicilio'; if (d.exa.indexOf(sign) > -1) return 'exaltación';
    if (d.det.indexOf(sign) > -1) return 'exilio'; if (d.fall.indexOf(sign) > -1) return 'caída'; return null;
  }
  var RULER = ['Marte', 'Venus', 'Mercurio', 'Luna', 'Sol', 'Mercurio', 'Venus', 'Plutón', 'Júpiter', 'Saturno', 'Urano', 'Neptuno'];

  var ASPECTS = [
    { n: 'conjunción', a: 0, orb: 8, k: 'conj' }, { n: 'sextil', a: 60, orb: 4.5, k: 'sext' }, { n: 'cuadratura', a: 90, orb: 7, k: 'cuad' },
    { n: 'trígono', a: 120, orb: 7, k: 'trig' }, { n: 'oposición', a: 180, orb: 8, k: 'opos' }, { n: 'quincuncio', a: 150, orb: 3, k: 'quin' }
  ];
  function orbFor(a, b, asp) {
    var lum = (a === 'Sol' || a === 'Luna' || b === 'Sol' || b === 'Luna'), ang = (a === 'AC' || a === 'MC' || b === 'AC' || b === 'MC'), out = (['Urano', 'Neptuno', 'Plutón', 'Nodo Norte', 'Lilith'].indexOf(a) > -1 && ['Urano', 'Neptuno', 'Plutón', 'Nodo Norte', 'Lilith'].indexOf(b) > -1);
    var o = asp.orb; if (lum) o += 1; if (ang) o -= 1; if (out) o -= 2; if (a === 'Lilith' || b === 'Lilith' || a === 'Nodo Norte' || b === 'Nodo Norte') o = Math.min(o, 3);
    return Math.max(1.5, o);
  }
  function aspectsAmong(list1, list2, same) {
    var out = [];
    for (var i = 0; i < list1.length; i++) {
      for (var j = same ? i + 1 : 0; j < list2.length; j++) {
        var a = list1[i], b = list2[j]; if (same && a.id === b.id) continue;
        var d = Math.abs(diff(a.lon, b.lon));
        for (var k = 0; k < ASPECTS.length; k++) {
          var orb = Math.abs(d - ASPECTS[k].a);
          if (orb <= orbFor(a.id, b.id, ASPECTS[k])) { out.push({ a: a.id, b: b.id, type: ASPECTS[k].n, k: ASPECTS[k].k, orb: orb, exact: orb < 1, applying: null }); break; }
        }
      }
    }
    return out.sort(function (x, y) { return x.orb - y.orb; });
  }

  function patterns(planets) {
    var main = planets.filter(function (p) { return ['Nodo Norte', 'Lilith'].indexOf(p.id) < 0; }), out = [], i, j, k;
    // stellium: 3+ cuerpos en el mismo signo
    var bySign = {}; main.forEach(function (p) { (bySign[p.sign] = bySign[p.sign] || []).push(p.id); });
    Object.keys(bySign).forEach(function (s) { if (bySign[s].length >= 3) out.push({ k: 'stellium', txt: 'Stellium en ' + A.SIGNS[s].n + ': ' + bySign[s].join(', ') + '.', ids: bySign[s] }); });
    function has(a, b, ang, orb) { return Math.abs(Math.abs(diff(a.lon, b.lon)) - ang) <= orb; }
    for (i = 0; i < main.length; i++) for (j = i + 1; j < main.length; j++) for (k = j + 1; k < main.length; k++) {
      var a = main[i], b = main[j], c = main[k];
      if (has(a, b, 120, 6) && has(b, c, 120, 6) && has(a, c, 120, 6)) out.push({ k: 'gran trígono', txt: 'Gran trígono: ' + [a.id, b.id, c.id].join(', ') + ' (talento fluido, facilidad natural; cuidado con la comodidad).', ids: [a.id, b.id, c.id] });
      [[a, b, c], [b, c, a], [a, c, b]].forEach(function (t) {
        if (has(t[0], t[1], 180, 7) && has(t[0], t[2], 90, 6) && has(t[1], t[2], 90, 6)) out.push({ k: 't-cuadrada', txt: 'Cuadratura en T: ' + t[0].id + ' y ' + t[1].id + ' en oposición, con ' + t[2].id + ' como punto de acción (tensión que impulsa a actuar).', ids: [t[0].id, t[1].id, t[2].id] });
        if (has(t[0], t[1], 60, 4) && has(t[0], t[2], 150, 3) && has(t[1], t[2], 150, 3)) out.push({ k: 'yod', txt: 'Yod: ' + t[0].id + ' y ' + t[1].id + ' en sextil apuntan a ' + t[2].id + ' (dedo del destino: una misión que pide ajuste).', ids: [t[0].id, t[1].id, t[2].id] });
      });
    }
    for (i = 0; i < main.length; i++) for (j = i + 1; j < main.length; j++) for (k = j + 1; k < main.length; k++) for (var l = k + 1; l < main.length; l++) {
      var q = [main[i], main[j], main[k], main[l]], opp = 0, sq = 0, p, r;
      for (p = 0; p < 4; p++) for (r = p + 1; r < 4; r++) { if (has(q[p], q[r], 180, 6)) opp++; if (has(q[p], q[r], 90, 6)) sq++; }
      if (opp === 2 && sq === 4) out.push({ k: 'gran cruz', txt: 'Gran cruz: ' + q.map(function (x) { return x.id; }).join(', ') + ' (mucha tensión y mucha energía).', ids: q.map(function (x) { return x.id; }) });
    }
    // eliminar duplicados
    var seen = {}; return out.filter(function (x) { var key = x.k + x.ids.slice().sort().join(); if (seen[key]) return false; seen[key] = 1; return true; });
  }

  // lugar: {lat, lon, tz}; when: Date (UTC)
  function chart(when, place, system) {
    var jd = jdOf(when), ang = angles(jd, place.lat, place.lon), sys = system || 'placidus', cusps = null;
    if (sys === 'placidus') cusps = placidus(ang, place.lat);
    if (!cusps) { cusps = sys === 'whole' ? wholeSign(ang.asc) : sys === 'equal' ? equalHouses(ang.asc) : porphyry(ang); if (sys === 'placidus') sys = 'porphyry'; }
    var pl = bodies(jd);
    pl.forEach(function (p) { p.house = houseOf(p.lon, cusps); p.dign = dignity(p.id, p.sign); });
    var sunH = houseOf(pl[0].lon, cusps), day = sunH >= 7;
    var fortuneLon = norm(ang.asc + (day ? pl[1].lon - pl[0].lon : pl[0].lon - pl[1].lon));
    var all = pl.concat([{ id: 'AC', lon: ang.asc, sign: Math.floor(ang.asc / 30), deg: ang.asc % 30, house: 1, status: 'ángulo' }, { id: 'MC', lon: ang.mc, sign: Math.floor(ang.mc / 30), deg: ang.mc % 30, house: 10, status: 'ángulo' }]);
    var asp = aspectsAmong(all, all, true);
    var elems = { Fuego: 0, Tierra: 0, Aire: 0, Agua: 0 }, modes = { Cardinal: 0, Fijo: 0, Mutable: 0 };
    pl.slice(0, 10).forEach(function (p) { var w = (p.id === 'Sol' || p.id === 'Luna') ? 2 : 1; elems[A.SIGNS[p.sign].el] += w; modes[A.SIGNS[p.sign].mod] += w; });
    var rulerName = RULER[Math.floor(ang.asc / 30)], rulerP = pl.filter(function (p) { return p.id === rulerName; })[0];
    var hemi = { sur: 0, norte: 0, este: 0, oeste: 0 };
    pl.slice(0, 10).forEach(function (p) { if (p.house >= 7) hemi.sur++; else hemi.norte++; if (p.house >= 10 || p.house <= 3) hemi.este++; else hemi.oeste++; });
    var mi = A.moonInfo(when);
    return {
      jd: jd, when: when, place: place, system: sys, asc: ang.asc, mc: ang.mc, ramc: ang.ramc, eps: ang.eps, cusps: cusps, planets: pl, points: all, aspects: asp,
      patterns: patterns(pl), elements: elems, modes: modes, sect: day ? 'diurna' : 'nocturna', fortune: { lon: fortuneLon, sign: Math.floor(fortuneLon / 30), deg: fortuneLon % 30, house: houseOf(fortuneLon, cusps) },
      ruler: rulerP, rulerName: rulerName, hemispheres: hemi, moonPhase: { name: mi.name, emoji: mi.emoji, illum: mi.illum }
    };
  }

  /* ---------- tránsitos, progresiones, retorno solar, sinastría ---------- */
  function transits(natal, when) {
    var tr = bodies(jdOf(when)).filter(function (p) { return ['Nodo Norte', 'Lilith'].indexOf(p.id) < 0; });
    var nat = natal.points.filter(function (p) { return p.id !== 'Lilith'; });
    var out = [];
    tr.forEach(function (t) {
      nat.forEach(function (n) {
        var d = Math.abs(diff(t.lon, n.lon));
        [0, 60, 90, 120, 180].forEach(function (a, idx) {
          var orb = Math.abs(d - a), lim = ['Sol', 'Luna', 'Mercurio', 'Venus', 'Marte'].indexOf(t.id) > -1 ? (t.id === 'Luna' ? 3 : 2) : 3;
          if (orb <= lim) out.push({ t: t.id, n: n.id, type: ['conjunción', 'sextil', 'cuadratura', 'trígono', 'oposición'][idx], orb: orb, tRetro: t.status === 'retrógrado', slow: ['Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutón'].indexOf(t.id) > -1 });
        });
      });
    });
    return { planets: tr, aspects: out.sort(function (a, b) { return (b.slow - a.slow) || (a.orb - b.orb); }) };
  }
  function progressed(natal, when) {
    var years = (when.getTime() - natal.when.getTime()) / 31556925974.7; // años trópicos
    var pw = new Date(natal.when.getTime() + years * 86400000);
    var c = chart(pw, natal.place, natal.system);
    c.age = years; c.progDate = pw; return c;
  }
  function solarReturn(natal, year, place) {
    var target = natal.planets[0].lon, jd0 = jdOf(new Date(Date.UTC(year, natal.when.getUTCMonth(), natal.when.getUTCDate(), 12))), jd = jd0;
    for (var i = 0; i < 40; i++) { var d = diff(target, A.sunLon(jd)); jd += d / 0.9856; if (Math.abs(d) < 1e-6) break; }
    var when = A.fromJD(jd), c = chart(when, place || natal.place, natal.system); c.returnYear = year; return c;
  }
  function synastry(c1, c2) {
    var a = c1.points.filter(function (p) { return p.id !== 'Lilith'; }), b = c2.points.filter(function (p) { return p.id !== 'Lilith'; });
    var asp = aspectsAmong(a, b, false).map(function (x) { return x; });
    var overlays = c2.planets.slice(0, 10).map(function (p) { return { id: p.id, house: houseOf(p.lon, c1.cusps) }; });
    return { aspects: asp, overlays: overlays };
  }
  function composite(c1, c2) {
    function mid(a, b) { var d = diff(b, a); return norm(a + d / 2); }
    var pl = c1.planets.slice(0, 10).map(function (p, i) { var q = c2.planets[i], lon = mid(p.lon, q.lon); return { id: p.id, lon: lon, sign: Math.floor(lon / 30), deg: lon % 30 }; });
    var asc = mid(c1.asc, c2.asc), mc = mid(c1.mc, c2.mc);
    return { planets: pl, asc: asc, mc: mc };
  }

  root.EPH = {
    ORDER: ORDER, bodies: bodies, geo: geo, angles: angles, placidus: placidus, houseOf: houseOf, chart: chart, transits: transits, progressed: progressed, solarReturn: solarReturn,
    synastry: synastry, composite: composite, aspectsAmong: aspectsAmong, tzOffsetMin: tzOffsetMin, localToUTC: localToUTC, dignity: dignity, RULER: RULER, norm: norm, diff: diff, ASPECTS: ASPECTS, gmst: gmst, obliquity: obliquity
  };
})(typeof window !== 'undefined' ? window : globalThis);
