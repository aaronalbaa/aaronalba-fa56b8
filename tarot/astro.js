/* Astronomía básica: Sol, Luna, planetas (Mercurio–Neptuno), nodo lunar y zodiaco chino.
   Algoritmos de baja precisión (Meeus / P. Schlyter): suficientes para signo, fase y retrogradación. */
(function (root) {
  'use strict';
  var RAD = Math.PI / 180;
  var sin = function (d) { return Math.sin(d * RAD); };
  var cos = function (d) { return Math.cos(d * RAD); };
  var norm = function (d) { d = d % 360; return d < 0 ? d + 360 : d; };
  var diff = function (a, b) { return ((a - b + 540) % 360) - 180; };

  var SIGNS = [
    { n: 'Aries', g: '♈', el: 'Fuego', mod: 'Cardinal', ruler: 'Marte' },
    { n: 'Tauro', g: '♉', el: 'Tierra', mod: 'Fijo', ruler: 'Venus' },
    { n: 'Géminis', g: '♊', el: 'Aire', mod: 'Mutable', ruler: 'Mercurio' },
    { n: 'Cáncer', g: '♋', el: 'Agua', mod: 'Cardinal', ruler: 'la Luna' },
    { n: 'Leo', g: '♌', el: 'Fuego', mod: 'Fijo', ruler: 'el Sol' },
    { n: 'Virgo', g: '♍', el: 'Tierra', mod: 'Mutable', ruler: 'Mercurio' },
    { n: 'Libra', g: '♎', el: 'Aire', mod: 'Cardinal', ruler: 'Venus' },
    { n: 'Escorpio', g: '♏', el: 'Agua', mod: 'Fijo', ruler: 'Plutón' },
    { n: 'Sagitario', g: '♐', el: 'Fuego', mod: 'Mutable', ruler: 'Júpiter' },
    { n: 'Capricornio', g: '♑', el: 'Tierra', mod: 'Cardinal', ruler: 'Saturno' },
    { n: 'Acuario', g: '♒', el: 'Aire', mod: 'Fijo', ruler: 'Urano' },
    { n: 'Piscis', g: '♓', el: 'Agua', mod: 'Mutable', ruler: 'Neptuno' }
  ];

  function jd(date) { return date.getTime() / 86400000 + 2440587.5; }
  function fromJD(j) { return new Date((j - 2440587.5) * 86400000); }

  /* ---------- Sol ---------- */
  function sunLon(j) {
    var T = (j - 2451545) / 36525;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T) * sin(M) + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
    return norm(L0 + C - 0.00569);
  }

  /* ---------- Luna (Meeus cap. 47, términos principales) ---------- */
  function moonLon(j) {
    var T = (j - 2451545) / 36525;
    var L = 218.3164477 + 481267.88123421 * T;
    var D = 297.8501921 + 445267.1114034 * T;
    var M = 357.5291092 + 35999.0502909 * T;
    var Mp = 134.9633964 + 477198.8675055 * T;
    var F = 93.272095 + 483202.0175233 * T;
    var E = 1 - 0.002516 * T - 0.0000074 * T * T;
    var A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.29 * T;
    var s = 6288774 * sin(Mp) + 1274027 * sin(2 * D - Mp) + 658314 * sin(2 * D) + 213618 * sin(2 * Mp) -
      185116 * E * sin(M) - 114332 * sin(2 * F) + 58793 * sin(2 * D - 2 * Mp) + 57066 * E * sin(2 * D - M - Mp) +
      53322 * sin(2 * D + Mp) + 45758 * E * sin(2 * D - M) - 40923 * E * sin(M - Mp) - 34720 * sin(D) -
      30383 * E * sin(M + Mp) + 15327 * sin(2 * D - 2 * F) - 12528 * sin(Mp + 2 * F) + 10980 * sin(Mp - 2 * F) +
      10675 * sin(4 * D - Mp) + 10034 * sin(3 * Mp) + 8548 * sin(4 * D - 2 * Mp) - 7888 * E * sin(2 * D + M - Mp) -
      6766 * E * sin(2 * D + M) - 5163 * sin(D - Mp) + 3958 * sin(A1) + 1962 * sin(L - F) + 318 * sin(A2);
    return norm(L + s / 1e6);
  }

  function nodeLon(j) { // nodo norte medio
    var T = (j - 2451545) / 36525;
    return norm(125.0445479 - 1934.1362891 * T);
  }

  var PHASES = [
    { max: 0.03, n: 'Luna nueva', e: '🌑' }, { max: 0.22, n: 'Luna creciente', e: '🌒' },
    { max: 0.28, n: 'Cuarto creciente', e: '🌓' }, { max: 0.47, n: 'Gibosa creciente', e: '🌔' },
    { max: 0.53, n: 'Luna llena', e: '🌕' }, { max: 0.72, n: 'Gibosa menguante', e: '🌖' },
    { max: 0.78, n: 'Cuarto menguante', e: '🌗' }, { max: 0.97, n: 'Luna menguante', e: '🌘' },
    { max: 1.01, n: 'Luna nueva', e: '🌑' }
  ];

  function elong(j) { return norm(moonLon(j) - sunLon(j)); }

  // próximo instante en que la elongación alcanza target (0,90,180,270)
  function nextElong(j0, target) {
    var step = 0.25, a = j0, fa = diff(elong(a), target), b, fb;
    for (var i = 0; i < 140; i++) {
      b = a + step; fb = diff(elong(b), target);
      if (fa < 0 && fb >= 0 && Math.abs(fa - fb) < 90) {
        var lo = a, hi = b;
        for (var k = 0; k < 30; k++) { var mid = (lo + hi) / 2; if (diff(elong(mid), target) < 0) lo = mid; else hi = mid; }
        return (lo + hi) / 2;
      }
      a = b; fa = fb;
    }
    return null;
  }

  // próximo cambio de signo de la Luna
  function nextMoonIngress(j0) {
    var s0 = Math.floor(moonLon(j0) / 30), a = j0;
    for (var i = 0; i < 120; i++) {
      var b = a + 1 / 24;
      if (Math.floor(moonLon(b) / 30) !== s0) {
        var lo = a, hi = b;
        for (var k = 0; k < 20; k++) { var mid = (lo + hi) / 2; if (Math.floor(moonLon(mid) / 30) === s0) lo = mid; else hi = mid; }
        return { jd: (lo + hi) / 2, sign: (s0 + 1) % 12 };
      }
      a = b;
    }
    return null;
  }

  function moonInfo(date) {
    var j = jd(date), el = elong(j), p = el / 360;
    var ph = PHASES.find(function (x) { return p < x.max; }) || PHASES[0];
    var lon = moonLon(j);
    return {
      jd: j, elong: el, phase: p, illum: (1 - cos(el)) / 2, age: p * 29.530588,
      lon: lon, sign: Math.floor(lon / 30), deg: lon % 30, name: ph.n, emoji: ph.e,
      waxing: p < 0.5
    };
  }

  /* ---------- Planetas (elementos orbitales, Schlyter) ---------- */
  var EL = {
    Mercurio: function (d) { return { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d }; },
    Venus: function (d) { return { N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d }; },
    Marte: function (d) { return { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d }; },
    'Júpiter': function (d) { return { N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.895 + 0.0830853001 * d }; },
    Saturno: function (d) { return { N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.967 + 0.0334442282 * d }; },
    Urano: function (d) { return { N: 74.0005 + 1.3978e-5 * d, i: 0.7733 + 1.9e-8 * d, w: 96.6612 + 3.0565e-5 * d, a: 19.18171 - 1.55e-8 * d, e: 0.047318 + 7.45e-9 * d, M: 142.5905 + 0.011725806 * d }; },
    Neptuno: function (d) { return { N: 131.7806 + 3.0173e-5 * d, i: 1.77 - 2.55e-7 * d, w: 272.8461 - 6.027e-6 * d, a: 30.05826 + 3.313e-8 * d, e: 0.008606 + 2.15e-9 * d, M: 260.2471 + 0.005995147 * d }; }
  };

  function kepler(M, e) {
    var E = M + (e / RAD) * sin(M) * (1 + e * cos(M));
    for (var i = 0; i < 12; i++) {
      var dE = (E - (e / RAD) * sin(E) - M) / (1 - e * cos(E));
      E -= dE;
      if (Math.abs(dE) < 1e-7) break;
    }
    return E;
  }

  function helio(name, d) {
    var o = EL[name](d), M = norm(o.M), E = kepler(M, o.e);
    var xv = o.a * (cos(E) - o.e), yv = o.a * Math.sqrt(1 - o.e * o.e) * sin(E);
    var v = Math.atan2(yv, xv) / RAD, r = Math.sqrt(xv * xv + yv * yv);
    var vw = v + o.w;
    var x = r * (cos(o.N) * cos(vw) - sin(o.N) * sin(vw) * cos(o.i));
    var y = r * (sin(o.N) * cos(vw) + cos(o.N) * sin(vw) * cos(o.i));
    var z = r * sin(vw) * sin(o.i);
    return { x: x, y: y, z: z, r: r, M: M };
  }

  function sunGeo(d) { // posición geocéntrica del Sol (plano eclíptico)
    var w = 282.9404 + 4.70935e-5 * d, e = 0.016709 - 1.151e-9 * d, M = norm(356.047 + 0.9856002585 * d);
    var E = kepler(M, e), xv = cos(E) - e, yv = Math.sqrt(1 - e * e) * sin(E);
    var v = Math.atan2(yv, xv) / RAD, r = Math.sqrt(xv * xv + yv * yv), lon = norm(v + w);
    return { x: r * cos(lon), y: r * sin(lon), r: r, lon: lon };
  }

  function planetGeo(name, j) {
    var d = j - 2451543.5;
    var h = helio(name, d), s = sunGeo(d);
    var lon = Math.atan2(h.y, h.x) / RAD, lat = Math.atan2(h.z, Math.sqrt(h.x * h.x + h.y * h.y)) / RAD, r = h.r;
    // perturbaciones de los gigantes
    var Mj = norm(19.895 + 0.0830853001 * d), Ms = norm(316.967 + 0.0334442282 * d), Mu = norm(142.5905 + 0.011725806 * d);
    if (name === 'Júpiter') {
      lon += -0.332 * sin(2 * Mj - 5 * Ms - 67.6) - 0.056 * sin(2 * Mj - 2 * Ms + 21) + 0.042 * sin(3 * Mj - 5 * Ms + 21) -
        0.036 * sin(Mj - 2 * Ms) + 0.022 * cos(Mj - Ms) + 0.023 * sin(2 * Mj - 3 * Ms + 52) - 0.016 * sin(Mj - 5 * Ms - 69);
    } else if (name === 'Saturno') {
      lon += 0.812 * sin(2 * Mj - 5 * Ms - 67.6) - 0.229 * cos(2 * Mj - 4 * Ms - 2) + 0.119 * sin(Mj - 2 * Ms - 3) +
        0.046 * sin(2 * Mj - 6 * Ms - 69) + 0.014 * sin(Mj - 3 * Ms + 32);
    } else if (name === 'Urano') {
      lon += 0.04 * sin(Ms - 2 * Mu + 6) + 0.035 * sin(Ms - 3 * Mu + 33) - 0.015 * sin(Mj - Mu + 20);
    }
    var xh = r * cos(lat) * cos(lon), yh = r * cos(lat) * sin(lon), zh = r * sin(lat);
    var xg = xh + s.x, yg = yh + s.y, zg = zh;
    var geoLon = norm(Math.atan2(yg, xg) / RAD);
    var delta = Math.sqrt(xg * xg + yg * yg + zg * zg);
    var cosI = (r * r + delta * delta - s.r * s.r) / (2 * r * delta);
    return { lon: geoLon, r: r, delta: delta, illum: (1 + cosI) / 2, sunLon: s.lon };
  }

  var SPEED_STATION = { Mercurio: 0.12, Venus: 0.08, Marte: 0.04, 'Júpiter': 0.025, Saturno: 0.015, Urano: 0.008, Neptuno: 0.005 };

  function planets(date) {
    var j = jd(date), out = [];
    out.push({ id: 'Sol', lon: sunLon(j), speed: 0.9856, status: 'directo' });
    var ml = moonLon(j);
    out.push({ id: 'Luna', lon: ml, speed: 13.2, status: 'directo' });
    Object.keys(EL).forEach(function (name) {
      var a = planetGeo(name, j - 0.5), b = planetGeo(name, j + 0.5), p = planetGeo(name, j);
      var speed = diff(b.lon, a.lon);
      var status = Math.abs(speed) < SPEED_STATION[name] ? 'estacionario' : (speed < 0 ? 'retrógrado' : 'directo');
      var el = diff(p.lon, p.sunLon); // elongación firmada (+ = al este del Sol)
      out.push({ id: name, lon: p.lon, speed: speed, status: status, elong: el, illum: p.illum, dist: p.delta });
    });
    var nn = nodeLon(j);
    out.push({ id: 'Nodo Norte', lon: nn, speed: -0.053, status: 'retrógrado' });
    out.forEach(function (p) { p.sign = Math.floor(p.lon / 30); p.deg = p.lon % 30; });
    return out;
  }

  var ASPECTS = [
    { a: 0, n: 'conjunción', orb: 7 }, { a: 60, n: 'sextil', orb: 4 }, { a: 90, n: 'cuadratura', orb: 6 },
    { a: 120, n: 'trígono', orb: 6 }, { a: 180, n: 'oposición', orb: 7 }
  ];
  function aspects(list) {
    var main = list.filter(function (p) { return p.id !== 'Nodo Norte'; }), out = [];
    for (var i = 0; i < main.length; i++) {
      for (var k = i + 1; k < main.length; k++) {
        var d = Math.abs(diff(main[i].lon, main[k].lon));
        for (var q = 0; q < ASPECTS.length; q++) {
          var orb = Math.abs(d - ASPECTS[q].a);
          var lim = (main[i].id === 'Luna' || main[k].id === 'Luna') ? ASPECTS[q].orb : ASPECTS[q].orb - 1;
          if (orb <= lim) { out.push({ a: main[i].id, b: main[k].id, type: ASPECTS[q].n, orb: orb }); break; }
        }
      }
    }
    return out.sort(function (x, y) { return x.orb - y.orb; });
  }

  /* ---------- Zodiaco chino ---------- */
  function newMoonJDE(k) {
    var T = k / 1236.85;
    var JDE = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T * T * T + 0.00000000073 * T * T * T * T;
    var E = 1 - 0.002516 * T - 0.0000074 * T * T;
    var M = 2.5534 + 29.1053567 * k - 0.0000014 * T * T;
    var Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T * T * T;
    var F = 160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T * T * T;
    var Om = 124.7746 - 1.56375588 * k + 0.0020672 * T * T;
    var c = -0.4072 * sin(Mp) + 0.17241 * E * sin(M) + 0.01608 * sin(2 * Mp) + 0.01039 * sin(2 * F) +
      0.00739 * E * sin(Mp - M) - 0.00514 * E * sin(Mp + M) + 0.00208 * E * E * sin(2 * M) - 0.00111 * sin(Mp - 2 * F) -
      0.00057 * sin(Mp + 2 * F) + 0.00056 * E * sin(2 * Mp + M) - 0.00042 * sin(3 * Mp) + 0.00042 * E * sin(M + 2 * F) +
      0.00038 * E * sin(M - 2 * F) - 0.00024 * E * sin(2 * Mp - M) - 0.00017 * sin(Om);
    return JDE + c - 69 / 86400; // aprox. TD→UT
  }

  function chinaDay(j) { // día civil (UTC+8) como número de día entero
    return Math.floor(j + 0.5 + 8 / 24);
  }
  function dayToYMD(dn) {
    var d = fromJD(dn - 0.5 + 1e-6); // medianoche UTC del día juliano dn
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
  }

  var cnyCache = {};
  function chineseNewYear(year) {
    if (cnyCache[year]) return cnyCache[year];
    // solsticio de diciembre del año anterior (Meeus cap. 27)
    var Y = ((year - 1) - 2000) / 1000;
    var jde0 = 2451900.05952 + 365242.74049 * Y - 0.06223 * Y * Y - 0.00823 * Y * Y * Y + 0.00032 * Y * Y * Y * Y;
    var solDay = chinaDay(jde0 - 69 / 86400);
    var k = Math.floor((jde0 - 2451550.09766) / 29.530588861) - 2, found = [];
    for (var i = 0; i < 8; i++) {
      var nm = newMoonJDE(k + i), dn = chinaDay(nm);
      found.push(dn);
    }
    // mes 11 comienza en la última luna nueva con fecha <= solsticio
    var idx = -1;
    for (var q = 0; q < found.length; q++) if (found[q] <= solDay) idx = q;
    var cny = found[idx + 2];
    var res = dayToYMD(cny);
    cnyCache[year] = res;
    return res;
  }

  var ANIMALS = ['Rata', 'Buey', 'Tigre', 'Conejo', 'Dragón', 'Serpiente', 'Caballo', 'Cabra', 'Mono', 'Gallo', 'Perro', 'Cerdo'];
  var ANIMAL_EMOJI = ['🐀', '🐂', '🐅', '🐇', '🐉', '🐍', '🐎', '🐐', '🐒', '🐓', '🐕', '🐖'];
  var ELEMENTS_CN = ['Metal', 'Metal', 'Agua', 'Agua', 'Madera', 'Madera', 'Fuego', 'Fuego', 'Tierra', 'Tierra'];

  // y,m,d: fecha de nacimiento (m 1-12). Devuelve año chino efectivo.
  function chineseYear(y, m, d) {
    var c = chineseNewYear(y);
    var before = (m < c.m) || (m === c.m && d < c.d);
    var cy = before ? y - 1 : y;
    return {
      year: cy, animal: ((cy - 4) % 12 + 12) % 12, element: ELEMENTS_CN[((cy % 10) + 10) % 10],
      yang: cy % 2 === 0, cny: c
    };
  }

  function signOfDate(y, m, d) { // signo solar a partir de la longitud del Sol a mediodía UT
    return Math.floor(sunLon(jd(new Date(Date.UTC(y, m - 1, d, 12)))) / 30);
  }

  root.ASTRO = {
    SIGNS: SIGNS, ANIMALS: ANIMALS, ANIMAL_EMOJI: ANIMAL_EMOJI,
    jd: jd, fromJD: fromJD, sunLon: sunLon, moonLon: moonLon, nodeLon: nodeLon,
    moonInfo: moonInfo, nextElong: nextElong, nextMoonIngress: nextMoonIngress,
    planets: planets, aspects: aspects, chineseNewYear: chineseNewYear, chineseYear: chineseYear,
    signOfDate: signOfDate, norm: norm, diff: diff
  };
})(typeof window !== 'undefined' ? window : globalThis);
