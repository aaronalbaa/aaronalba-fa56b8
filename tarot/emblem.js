/* Sigilos (magia del caos) y emblemas generativos. Todo es matemática visual: sin imágenes externas. */
(function () {
  'use strict';
  var ARC = window.ARC, SIG = {};

  function clean(text) { return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, ''); }
  // Método clásico de Austin Osman Spare: quitar letras repetidas (y, opcionalmente, vocales)
  SIG.reduce = function (text, noVowels) {
    var seen = {}, out = '';
    clean(text).split('').forEach(function (c) { if (noVowels && 'AEIOU'.indexOf(c) > -1) return; if (!seen[c]) { seen[c] = 1; out += c; } });
    return out || clean(text).slice(0, 1) || 'A';
  };

  // Kameas planetarias (cuadrados mágicos de Agripa) 3×3 a 7×7
  var KAMEA = {
    3: { n: 'Saturno', sq: [[4, 9, 2], [3, 5, 7], [8, 1, 6]] },
    4: { n: 'Júpiter', sq: [[4, 14, 15, 1], [9, 7, 6, 12], [5, 11, 10, 8], [16, 2, 3, 13]] },
    5: { n: 'Marte', sq: [[11, 24, 7, 20, 3], [4, 12, 25, 8, 16], [17, 5, 13, 21, 9], [10, 18, 1, 14, 22], [23, 6, 19, 2, 15]] },
    6: { n: 'Sol', sq: [[6, 32, 3, 34, 35, 1], [7, 11, 27, 28, 8, 30], [19, 14, 16, 15, 23, 24], [18, 20, 22, 21, 17, 13], [25, 29, 10, 9, 26, 12], [36, 5, 33, 4, 2, 31]] },
    7: { n: 'Venus', sq: [[22, 47, 16, 41, 10, 35, 4], [5, 23, 48, 17, 42, 11, 29], [30, 6, 24, 49, 18, 36, 12], [13, 31, 7, 25, 43, 19, 37], [38, 14, 32, 1, 26, 44, 20], [21, 39, 8, 33, 2, 27, 45], [46, 15, 40, 9, 34, 3, 28]] }
  };
  SIG.KAMEA = KAMEA;
  SIG.kameaValid = function () { return Object.keys(KAMEA).every(function (k) { var n = +k, s = n * (n * n + 1) / 2, q = KAMEA[k].sq; var ok = true; for (var i = 0; i < n; i++) { var r = 0, c = 0; for (var j = 0; j < n; j++) { r += q[i][j]; c += q[j][i]; } if (r !== s || c !== s) ok = false; } return ok; }); };

  function pts(path) { return path.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }

  // Devuelve {svg, letters, points}
  SIG.make = function (text, opts) {
    opts = opts || {};
    var method = opts.method || 'circle', letters = SIG.reduce(text, !!opts.noVowels), size = 100, cx = 50, cy = 50, path = [], i;
    var accent = opts.color || '#e6c97a', bg = '';
    if (method === 'kamea') {
      var N = opts.kamea || 3, K = KAMEA[N], cell = 80 / N, pos = {};
      K.sq.forEach(function (row, r) { row.forEach(function (v, c) { pos[v] = [10 + c * cell + cell / 2, 10 + r * cell + cell / 2]; }); });
      letters.split('').forEach(function (ch) { var v = ((ch.charCodeAt(0) - 65) % (N * N)) + 1; path.push(pos[v]); });
      for (i = 0; i <= N; i++) bg += '<line x1="' + (10 + i * cell) + '" y1="10" x2="' + (10 + i * cell) + '" y2="90" class="sg-grid"/><line x1="10" y1="' + (10 + i * cell) + '" x2="90" y2="' + (10 + i * cell) + '" class="sg-grid"/>';
      K.sq.forEach(function (row, r) { row.forEach(function (v, c) { bg += '<text x="' + (10 + c * cell + cell / 2) + '" y="' + (10 + r * cell + cell / 2) + '" class="sg-num">' + v + '</text>'; }); });
    } else {
      var R = 36;
      bg += '<circle cx="50" cy="50" r="42" class="sg-ring"/><circle cx="50" cy="50" r="' + R + '" class="sg-ring thin"/>';
      for (i = 0; i < 26; i++) { var a = (i / 26) * 2 * Math.PI - Math.PI / 2; bg += '<circle cx="' + (50 + 39 * Math.cos(a)).toFixed(1) + '" cy="' + (50 + 39 * Math.sin(a)).toFixed(1) + '" r=".7" class="sg-dot"/>'; if (opts.showLetters) bg += '<text x="' + (50 + 46 * Math.cos(a)).toFixed(1) + '" y="' + (50 + 46 * Math.sin(a)).toFixed(1) + '" class="sg-let">' + String.fromCharCode(65 + i) + '</text>'; }
      letters.split('').forEach(function (ch) { var a2 = ((ch.charCodeAt(0) - 65) / 26) * 2 * Math.PI - Math.PI / 2; path.push([50 + R * Math.cos(a2), 50 + R * Math.sin(a2)]); });
    }
    var s = '<svg class="sigil-svg" viewBox="0 0 100 100" role="img" aria-label="Sigilo" style="--ac:' + accent + '">' + bg;
    if (path.length > 1) s += '<polyline class="sg-path" points="' + pts(path) + '" pathLength="1"/>';
    var f = path[0], l = path[path.length - 1];
    s += '<circle cx="' + f[0].toFixed(1) + '" cy="' + f[1].toFixed(1) + '" r="2.6" class="sg-start"/>';
    if (path.length > 1) {
      var p0 = path[path.length - 2], dx = l[0] - p0[0], dy = l[1] - p0[1], len = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / len * 3, ny = dx / len * 3;
      s += '<line x1="' + (l[0] - nx).toFixed(1) + '" y1="' + (l[1] - ny).toFixed(1) + '" x2="' + (l[0] + nx).toFixed(1) + '" y2="' + (l[1] + ny).toFixed(1) + '" class="sg-end"/>';
    }
    return { svg: s + '</svg>', letters: letters, count: path.length };
  };

  /* ---------- emblema generativo a partir de un nombre ---------- */
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  SIG.emblem = function (name, hue, size) {
    var h = hash(name), sides = 3 + (h % 7), rot = (h >> 3) % 360, star = (h >> 9) % 2 === 0, col = hue || '#e6c97a', letters = SIG.reduce(name, true), s = '';
    var poly = [], skip = sides > 4 && (h >> 5) % 2 ? 2 : 1, i;
    for (i = 0; i < sides; i++) { var a = (i * skip / sides) * 2 * Math.PI + rot * Math.PI / 180; poly.push([50 + 40 * Math.cos(a), 50 + 40 * Math.sin(a)]); }
    var inner = [];
    for (i = 0; i < sides; i++) { var a3 = ((i + 0.5) / sides) * 2 * Math.PI + rot * Math.PI / 180; inner.push([50 + 22 * Math.cos(a3), 50 + 22 * Math.sin(a3)]); }
    s += '<svg class="emb" viewBox="0 0 100 100" width="' + (size || 120) + '" height="' + (size || 120) + '" style="--ac:' + col + '" role="img" aria-label="Emblema">';
    s += '<circle cx="50" cy="50" r="46" class="em-ring"/><circle cx="50" cy="50" r="43" class="em-ring thin"/>';
    s += '<g class="em-spin">' + '<polygon points="' + pts(poly) + '" class="em-poly"/>' + (star ? '<polygon points="' + pts(inner) + '" class="em-poly in"/>' : '') + '</g>';
    var path = letters.split('').map(function (ch) { var a2 = ((ch.charCodeAt(0) - 65) / 26) * 2 * Math.PI - Math.PI / 2; return [50 + 25 * Math.cos(a2), 50 + 25 * Math.sin(a2)]; });
    if (path.length > 1) s += '<polyline class="em-sig" points="' + pts(path) + '" pathLength="1"/>';
    s += '<circle cx="' + path[0][0].toFixed(1) + '" cy="' + path[0][1].toFixed(1) + '" r="2" class="em-dot"/>';
    for (i = 0; i < 12; i++) { var a4 = (i / 12) * 2 * Math.PI; s += '<line x1="' + (50 + 46 * Math.cos(a4)).toFixed(1) + '" y1="' + (50 + 46 * Math.sin(a4)).toFixed(1) + '" x2="' + (50 + 49 * Math.cos(a4)).toFixed(1) + '" y2="' + (50 + 49 * Math.sin(a4)).toFixed(1) + '" class="em-tick"/>'; }
    return s + '</svg>';
  };

  ARC.sig = SIG;
})();
