/* Tu ubicación: Sol y Luna locales, horas planetarias, eclipses y clima real (Open-Meteo). */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, P = ARC.profile, A = ARC.act, AS = ASTRO.SIGNS, E = EPH;
  var RAD = Math.PI / 180, sin = function (d) { return Math.sin(d * RAD); }, cos = function (d) { return Math.cos(d * RAD); };
  var norm = ASTRO.norm;

  /* ---------- latitud de la Luna (Meeus 47, términos principales) ---------- */
  function moonLat(jd) {
    var T = (jd - 2451545) / 36525;
    var D = 297.8501921 + 445267.1114034 * T, M = 357.5291092 + 35999.0502909 * T, Mp = 134.9633964 + 477198.8675055 * T, F = 93.272095 + 483202.0175233 * T;
    var Ee = 1 - 0.002516 * T - 0.0000074 * T * T;
    var b = 5128122 * sin(F) + 280602 * sin(Mp + F) + 277693 * sin(Mp - F) + 173237 * sin(2 * D - F) + 55413 * sin(2 * D - Mp + F) + 46271 * sin(2 * D - Mp - F) + 32573 * sin(2 * D + F) +
      17198 * sin(2 * Mp + F) + 9266 * sin(2 * D + Mp - F) + 8822 * sin(2 * Mp - F) + 8216 * Ee * sin(2 * D - M - F) + 4324 * sin(2 * D - 2 * Mp - F) + 4200 * sin(2 * D + Mp + F);
    return b / 1e6;
  }

  /* ---------- posición horizontal ---------- */
  function raDec(id, jd) {
    var lon = id === 'Sol' ? ASTRO.sunLon(jd) : ASTRO.moonLon(jd), lat = id === 'Sol' ? 0 : moonLat(jd), eps = E.obliquity(jd);
    var ra = Math.atan2(sin(lon) * cos(eps) - Math.tan(lat * RAD) * sin(eps), cos(lon)) / RAD, dec = Math.asin(sin(lat) * cos(eps) + cos(lat) * sin(eps) * sin(lon)) / RAD;
    return { ra: norm(ra), dec: dec };
  }
  function altitude(id, jd, lat, lon) {
    var o = raDec(id, jd), ha = norm(E.gmst(jd) + lon - o.ra);
    return Math.asin(sin(lat) * sin(o.dec) + cos(lat) * cos(o.dec) * cos(ha)) / RAD;
  }
  function crossings(id, jd0, lat, lon) {
    var h0 = id === 'Sol' ? -0.833 : 0.125, step = 1 / 144, prev = altitude(id, jd0, lat, lon) - h0, rise = null, set = null;
    for (var i = 1; i <= 145; i++) {
      var jd = jd0 + i * step, cur = altitude(id, jd, lat, lon) - h0;
      if (prev < 0 && cur >= 0 && rise === null) rise = refine(id, jd - step, jd, lat, lon, h0);
      if (prev >= 0 && cur < 0 && set === null) set = refine(id, jd - step, jd, lat, lon, h0);
      prev = cur;
    }
    return { rise: rise, set: set };
  }
  function refine(id, a, b, lat, lon, h0) {
    var fa = altitude(id, a, lat, lon) - h0;
    for (var i = 0; i < 20; i++) { var m = (a + b) / 2, fm = altitude(id, m, lat, lon) - h0; if ((fa < 0) === (fm < 0)) { a = m; fa = fm; } else b = m; }
    return (a + b) / 2;
  }
  function dayStartJD(date, tz) {
    var u = E.localToUTC(date.getFullYear(), date.getMonth() + 1, date.getDate(), 0, 0, tz, 0);
    return ASTRO.jd(u);
  }
  function sunMoonTimes(date, loc) {
    var jd0 = dayStartJD(date, loc.tz), s = crossings('Sol', jd0, loc.lat, loc.lon), m = crossings('Luna', jd0, loc.lat, loc.lon);
    var tom = crossings('Sol', jd0 + 1, loc.lat, loc.lon);
    return { sunrise: s.rise, sunset: s.set, moonrise: m.rise, moonset: m.set, nextSunrise: tom.rise, jd0: jd0 };
  }
  var fmtT = function (jd, tz) { return jd === null ? '—' : ASTRO.fromJD(jd).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: tz }); };

  /* ---------- horas planetarias ---------- */
  var CHALDEAN = ['Saturno', 'Júpiter', 'Marte', 'Sol', 'Venus', 'Mercurio', 'Luna'];
  var DAYRULER = ['Sol', 'Luna', 'Marte', 'Mercurio', 'Júpiter', 'Venus', 'Saturno'];
  var HOURUSE = {
    'Sol': 'éxito, vitalidad, liderazgo y reconocimiento', 'Luna': 'intuición, sueños, hogar y emociones', 'Marte': 'coraje, acción, protección y disciplina física',
    'Mercurio': 'comunicación, estudio, viajes y negocios', 'Júpiter': 'abundancia, expansión, justicia y aprendizaje', 'Venus': 'amor, belleza, arte y armonía', 'Saturno': 'límites, estructura, limpieza y constancia'
  };
  var PGL = { 'Sol': '☉', 'Luna': '☽', 'Mercurio': '☿', 'Venus': '♀', 'Marte': '♂', 'Júpiter': '♃', 'Saturno': '♄' };
  function planetaryHours(date, loc, times) {
    if (times.sunrise === null || times.sunset === null || times.nextSunrise === null) return null;
    var dow = date.getDay(), start = CHALDEAN.indexOf(DAYRULER[dow]), out = [], dl = (times.sunset - times.sunrise) / 12, nl = (times.nextSunrise - times.sunset) / 12;
    for (var i = 0; i < 24; i++) {
      var day = i < 12, from = day ? times.sunrise + i * dl : times.sunset + (i - 12) * nl, to = from + (day ? dl : nl);
      out.push({ n: i + 1, day: day, from: from, to: to, ruler: CHALDEAN[(start + i) % 7] });
    }
    return out;
  }

  /* ---------- eclipses (aproximados) ---------- */
  function eclipses(fromDate, months) {
    var j = ASTRO.jd(fromDate), end = j + months * 30.5, out = [], guard = 0;
    [0, 180].forEach(function (target) {
      var t = j - 1;
      while (guard++ < 80) {
        var n = ASTRO.nextElong(t, target); if (!n || n > end) break;
        var b = Math.abs(moonLat(n)), solar = target === 0;
        if (b < 1.55) out.push({ jd: n, solar: solar, kind: solar ? (b < 0.97 ? 'total o anular' : 'parcial') : (b < 0.44 ? 'total' : b < 0.96 ? 'parcial' : 'penumbral (muy sutil)'), beta: b, sign: Math.floor((solar ? ASTRO.sunLon(n) : ASTRO.moonLon(n)) / 30) });
        t = n + 20;
      }
    });
    return out.sort(function (a, b) { return a.jd - b.jd; });
  }

  /* ---------- clima (Open-Meteo, sin clave) ---------- */
  var WMO = { 0: ['Despejado', '☀️'], 1: ['Mayormente despejado', '🌤️'], 2: ['Parcialmente nublado', '⛅'], 3: ['Nublado', '☁️'], 45: ['Niebla', '🌫️'], 48: ['Niebla con escarcha', '🌫️'], 51: ['Llovizna ligera', '🌦️'], 53: ['Llovizna', '🌦️'], 55: ['Llovizna intensa', '🌧️'],
    61: ['Lluvia ligera', '🌧️'], 63: ['Lluvia', '🌧️'], 65: ['Lluvia fuerte', '🌧️'], 71: ['Nieve ligera', '🌨️'], 73: ['Nieve', '🌨️'], 75: ['Nieve fuerte', '❄️'], 80: ['Chubascos', '🌦️'], 81: ['Chubascos fuertes', '🌧️'], 82: ['Chubascos violentos', '⛈️'], 95: ['Tormenta', '⛈️'], 96: ['Tormenta con granizo', '⛈️'], 99: ['Tormenta fuerte', '⛈️'] };
  var wx = { data: null, ts: 0, key: '', err: '', loading: false };
  function loadWeather(force) {
    var L = P.loc; if (!L) return;
    var key = L.lat.toFixed(2) + ',' + L.lon.toFixed(2);
    if (!force && wx.data && wx.key === key && Date.now() - wx.ts < 600000) return;
    if (wx.loading) return; wx.loading = true; wx.err = '';
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + L.lat + '&longitude=' + L.lon + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,cloud_cover,wind_speed_10m,weather_code,is_day,precipitation&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto&forecast_days=1';
    fetch(url).then(function (r) { return r.json(); }).then(function (j) { if (!j.current) throw new Error('sin datos'); wx.data = j; wx.ts = Date.now(); wx.key = key; })
      .catch(function () { wx.err = 'No se pudo cargar el clima (revisa tu conexión).'; })
      .then(function () { wx.loading = false; if (ARC.tab === 'sky' || ARC.tab === 'home') ARC.render(true); });
  }
  function weatherCard(compact) {
    if (!P.loc) return '';
    loadWeather(false);
    if (!wx.data) return '<article class="rd wx"><div class="rd-h"><div><small>Clima ahora</small><b>' + (wx.err ? '⚠️ ' + esc(wx.err) : '☁️ Cargando clima…') + '</b></div></div></article>';
    var c = wx.data.current, w = WMO[c.weather_code] || ['—', '🌡️'], d = wx.data.daily || {};
    var vis = c.cloud_cover < 25 ? 'cielo despejado: la Luna y las estrellas se ven muy bien' : c.cloud_cover < 60 ? 'algo de nubes: se verá a ratos' : 'muy nublado: difícil ver el cielo';
    if (compact) return '<div class="wxmini"><span>' + w[1] + '</span><b>' + Math.round(c.temperature_2m) + '°</b><small>' + esc(w[0]) + ' · ' + esc(P.loc.name) + '</small></div>';
    return '<article class="rd wx sum"><div class="rd-h"><div><small>Clima ahora · ' + esc(P.loc.name) + '</small><b>' + w[1] + ' ' + Math.round(c.temperature_2m) + '° · ' + esc(w[0]) + '</b></div></div>' +
      '<div class="facts"><div><small>Sensación</small><b>' + Math.round(c.apparent_temperature) + '°</b></div><div><small>Humedad</small><b>' + c.relative_humidity_2m + '%</b></div><div><small>Viento</small><b>' + Math.round(c.wind_speed_10m) + ' km/h</b></div><div><small>Nubes</small><b>' + c.cloud_cover + '%</b></div></div>' +
      '<p>' + (c.is_day ? '☀️ Es de día.' : '🌙 Es de noche:') + ' ' + esc(vis.charAt(0).toUpperCase() + vis.slice(1)) + '.</p>' + (d.temperature_2m_max ? '<p class="hint">Hoy: máx. ' + Math.round(d.temperature_2m_max[0]) + '° · mín. ' + Math.round(d.temperature_2m_min[0]) + '° · UV ' + (d.uv_index_max ? d.uv_index_max[0] : '—') + '</p>' : '') + '</article>';
  }

  /* ---------- vista ---------- */
  var LS = { q: '', res: [], msg: '' };
  function locSetup() {
    return '<div class="panel"><div class="lbl">Tu ubicación</div><p class="hint">Con tu ubicación calculamos <b>cuándo salen y se ponen el Sol y la Luna donde estás</b>, las <b>horas planetarias</b>, los eclipses y el <b>clima real</b>. Se guarda solo en tu dispositivo.</p>' +
      '<button class="btn primary big" data-a="locGet">📍 Usar mi ubicación</button>' + (LS.msg ? '<p class="err">' + esc(LS.msg) + '</p>' : '') +
      '<div class="lbl">O busca una ciudad</div><div class="datebar"><input id="loc_q" type="search" placeholder="Ciudad…" value="' + esc(LS.q) + '" autocomplete="off"><button class="btn ghost sm" data-a="locSearch">Buscar</button></div>' +
      '<div class="places">' + LS.res.map(function (r, i) { return '<button class="place" data-a="locPick" data-i="' + i + '"><b>' + esc(r.name) + '</b><small>' + esc(r.tz) + '</small></button>'; }).join('') + '</div></div>';
  }
  function html() {
    var L = P.loc; if (!L) return locSetup();
    var now = new Date(), t = sunMoonTimes(now, L), mi = ASTRO.moonInfo(now), alt = altitude('Luna', ASTRO.jd(now), L.lat, L.lon), salt = altitude('Sol', ASTRO.jd(now), L.lat, L.lon);
    var hours = planetaryHours(now, L, t), nowJD = ASTRO.jd(now), cur = hours ? hours.filter(function (h) { return nowJD >= h.from && nowJD < h.to; })[0] : null;
    if (hours && !cur) {
      // antes del amanecer: pertenece a la noche del día anterior
      var y = new Date(now); y.setDate(y.getDate() - 1); var ty = sunMoonTimes(y, L), hy = planetaryHours(y, L, ty); if (hy) cur = hy.filter(function (h) { return nowJD >= h.from && nowJD < h.to; })[0];
    }
    var h = weatherCard(false);
    h += '<article class="rd sum"><div class="rd-h"><div><small>Luna ahora en ' + esc(L.name) + '</small><b>' + mi.emoji + ' ' + esc(mi.name) + ' · ' + Math.round(mi.illum * 100) + '%</b></div></div><p>' +
      (alt > 0 ? '🌙 La Luna está <b>sobre el horizonte</b>, a ' + Math.round(alt) + '° de altura.' : '🌙 La Luna está <b>bajo el horizonte</b> ahora mismo.') + ' ' + (salt > 0 ? '☀️ Es de día.' : '☀️ El Sol ya se ha puesto.') + '</p></article>';
    h += '<div class="sunmoon"><div><span>🌅</span><small>Amanece</small><b>' + fmtT(t.sunrise, L.tz) + '</b></div><div><span>🌇</span><small>Atardece</small><b>' + fmtT(t.sunset, L.tz) + '</b></div><div><span>🌙</span><small>Sale la Luna</small><b>' + fmtT(t.moonrise, L.tz) + '</b></div><div><span>🌘</span><small>Se pone la Luna</small><b>' + fmtT(t.moonset, L.tz) + '</b></div></div>';
    if (cur) h += '<article class="rd sum"><div class="rd-h"><div><small>Hora planetaria actual · ' + fmtT(cur.from, L.tz) + '–' + fmtT(cur.to, L.tz) + '</small><b>' + PGL[cur.ruler] + '︎ Hora de ' + esc(cur.ruler) + '</b></div></div><p>Favorece: ' + esc(HOURUSE[cur.ruler]) + '.</p><p class="hint">Día de ' + esc(DAYRULER[now.getDay()]) + ' (' + ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][now.getDay()] + ').</p></article>';
    if (hours) h += '<h3 class="sec">Horas planetarias de hoy</h3><div class="phr">' + hours.map(function (x) { return '<div class="' + (x === cur ? 'on' : '') + (x.day ? '' : ' night') + '"><span>' + PGL[x.ruler] + '︎</span><b>' + esc(x.ruler) + '</b><small>' + fmtT(x.from, L.tz) + '</small></div>'; }).join('') + '</div>';
    else h += '<p class="hint">En esta latitud el Sol no sale o no se pone hoy: no se pueden calcular las horas planetarias.</p>';
    var ec = eclipses(now, 24).slice(0, 6);
    h += '<h3 class="sec">Próximos eclipses (aproximados)</h3>' + (ec.length ? ec.map(function (e) {
      var d = ASTRO.fromJD(e.jd);
      return '<article class="rd"><div class="rd-h"><i>' + (e.solar ? '☀️' : '🌕') + '</i><div><small>' + d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · en ' + AS[e.sign].n + '</small><b>Eclipse ' + (e.solar ? 'solar' : 'lunar') + ' ' + e.kind + '</b></div></div><p class="hint">' + (e.solar ? 'La visibilidad depende de tu ubicación y del recorrido de la sombra.' : 'Visible desde donde sea de noche y la Luna esté sobre el horizonte.') + '</p></article>';
    }).join('') : '<p class="hint">Sin eclipses en los próximos 24 meses.</p>') + '<p class="fine">El tipo exacto (total, anular, parcial) y la visibilidad local deben confirmarse en fuentes astronómicas oficiales.</p>';
    h += '<div class="panel"><button class="btn ghost sm" data-a="locClear">Cambiar ubicación</button></div>';
    return h;
  }

  function searchCities(q) { return ARC.natal ? ARC.natal.searchPlaces(q) : Promise.resolve([]); }
  A.locGet = function () {
    if (!navigator.geolocation) { LS.msg = 'Tu navegador no permite geolocalización. Busca tu ciudad.'; ARC.render(true); return; }
    ARC.toast('Pidiendo tu ubicación…');
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude, lon = pos.coords.longitude, tz = (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';
      P.loc = { lat: lat, lon: lon, tz: tz, name: 'Mi ubicación', ts: Date.now() }; ARC.save('profile'); LS.msg = '';
      fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json&zoom=10&accept-language=es').then(function (r) { return r.json(); })
        .then(function (j) { var a = j.address || {}; P.loc.name = a.city || a.town || a.village || a.municipality || a.county || 'Mi ubicación'; ARC.save('profile'); }).catch(function () { })
        .then(function () { ARC.render(true); });
      ARC.render(true);
    }, function (err) { LS.msg = err.code === 1 ? 'No diste permiso de ubicación. Puedes buscar tu ciudad manualmente.' : 'No se pudo obtener la ubicación. Busca tu ciudad.'; ARC.render(true); }, { timeout: 12000, maximumAge: 600000 });
  };
  A.locSearch = function () { var q = ($('#loc_q') || {}).value || ''; LS.q = q; if (q.trim().length < 2) return; searchCities(q.trim()).then(function (r) { LS.res = r; ARC.render(true); }); };
  A.locPick = function (el) { var r = LS.res[Number(el.dataset.i)]; P.loc = { lat: r.lat, lon: r.lon, tz: r.tz, name: r.name.split(',')[0], ts: Date.now() }; ARC.save('profile'); LS.res = []; ARC.render(true); };
  A.locClear = function () { P.loc = null; ARC.save('profile'); wx.data = null; ARC.render(true); };
  ARC.inputs.loc_q = function (v) { LS.q = v; };
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.id === 'loc_q') { e.preventDefault(); A.locSearch(); } });

  ARC.loc = { html: html, weatherMini: function () { return weatherCard(true); }, sunMoonTimes: sunMoonTimes, moonLat: moonLat, eclipses: eclipses, planetaryHours: planetaryHours, altitude: altitude, setupHTML: locSetup, getWeather: function () { return wx.data; } };
})();
