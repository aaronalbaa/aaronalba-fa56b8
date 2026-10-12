/* Bienvenida, pantalla "Hoy" y perfil (diario + ajustes). */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, $$ = ARC.$$, esc = ARC.esc, P = ARC.profile, S = ARC.settings, A = ARC.act, AS = ASTRO.SIGNS, TX = SKYTXT;
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  /* ================= Bienvenida ================= */
  var OWN = [
    ['tarot:rws', '🃏', 'Tarot Rider-Waite-Smith', 'El más común'],
    ['tarot:marsella', '⚜️', 'Tarot de Marsella', 'El clásico francés'],
    ['tarot:thoth', '👁️', 'Tarot de Thoth', 'De Aleister Crowley'],
    ['espanola', '🂡', 'Baraja española', 'De 40 cartas'],
    ['lenormand', '🌹', 'Lenormand', '36 cartas'],
    ['runas', 'ᚱ', 'Runas', 'Futhark antiguo'],
    ['ogham', '🌳', 'Ogham', 'Árboles celtas'],
    ['none', '📱', 'Ninguna todavía', 'Usaré la baraja virtual']
  ];
  var INTENTS = ['🪞 Introspección', '💞 Amor', '💼 Trabajo', '🧭 Decisiones', '🌿 Bienestar', '✨ Espiritualidad', '🔭 Curiosidad'];
  var OB = { step: 0, name: '', birth: '', owned: [], intents: [] };
  var STEPS = 7;

  function obDots() { var h = ''; for (var i = 0; i < STEPS; i++) h += '<i class="' + (i === OB.step ? 'on' : (i < OB.step ? 'done' : '')) + '"></i>'; return '<div class="dots">' + h + '</div>'; }

  function obHTML() {
    var h = '', s = OB.step, mi = ASTRO.moonInfo(new Date());
    if (s === 0) {
      h = '<div class="ob-c">' + '<div class="ob-moon">' + ARC.sky.moonSVG(mi.phase, 180) + '</div><h1>Arcana</h1>' +
        '<p class="ob-lead">Tarot, oráculos, Luna y cielo en un solo lugar,<br>pensados para conocerte mejor. 🌙</p>' +
        '<button class="btn primary big" data-a="obNext">Empezar ✨</button></div>';
    } else if (s === 1) {
      h = '<div class="ob-c left"><h2>¿Cómo te llamamos?</h2><p class="hint">Tu nombre solo se guarda en este dispositivo.</p>' +
        '<input id="obName" type="text" maxlength="30" placeholder="Tu nombre o apodo" value="' + esc(OB.name) + '" autocomplete="off">' +
        '<button class="btn primary big" data-a="obNext">Continuar</button></div>';
    } else if (s === 2) {
      h = '<div class="ob-c left"><h2>¿Cuándo naciste?</h2><p class="hint">Con tu fecha calculamos tu signo, tu animal chino, tus números y tu horóscopo. Es opcional.</p>' +
        '<input id="obBirth" type="date" value="' + esc(OB.birth) + '" max="' + ARC.dayKey(0) + '">' +
        '<button class="btn primary big" data-a="obNext">Continuar</button><button class="btn link" data-a="obSkip">Prefiero no decirlo</button></div>';
    } else if (s === 3) {
      h = '<div class="ob-c left"><h2>¿Qué cartas tienes?</h2><p class="hint">Elige las que uses, puedes marcar varias. Así adaptamos los nombres y las tiradas a tu baraja.</p><div class="owngrid">' +
        OWN.map(function (o) { return '<button class="ownc' + (OB.owned.indexOf(o[0]) > -1 ? ' on' : '') + '" data-a="obOwn" data-v="' + o[0] + '"><b>' + o[1] + '</b><span>' + esc(o[2]) + '</span><small>' + esc(o[3]) + '</small></button>'; }).join('') +
        '</div><button class="btn primary big" data-a="obNext">Continuar</button></div>';
    } else if (s === 4) {
      h = '<div class="ob-c left"><h2>¿Dónde estás?</h2><p class="hint">Con tu ubicación calculamos cuándo sale y se pone la Luna donde vives, las horas planetarias y el clima real. Es opcional y se queda en tu dispositivo.</p>' +
        (P.loc ? '<div class="placesel"><b>📍 ' + esc(P.loc.name) + '</b><small>ubicación guardada</small></div>' : '<button class="btn primary big" data-a="obLoc">📍 Usar mi ubicación</button>') +
        '<button class="btn primary big" data-a="obNext">Continuar</button><button class="btn link" data-a="obSkip2">Prefiero no compartirla</button></div>';
    } else if (s === 5) {
      h = '<div class="ob-c left"><h2>¿Qué buscas aquí?</h2><p class="hint">Elige lo que quieras. Puedes cambiarlo cuando quieras.</p><div class="chips wrap big">' +
        INTENTS.map(function (t) { return '<button data-a="obIntent" data-v="' + esc(t) + '" class="' + (OB.intents.indexOf(t) > -1 ? 'on' : '') + '">' + t + '</button>'; }).join('') +
        '</div><button class="btn primary big" data-a="obNext">Continuar</button></div>';
    } else {
      var b = parseBirth(OB.birth), ss = b ? ASTRO.signOfDate(b.y, b.m, b.d) : null, ci = b ? ASTRO.chineseYear(b.y, b.m, b.d) : null;
      h = '<div class="ob-c"><div class="ob-moon">' + ARC.sky.moonSVG(mi.phase, 120) + '</div><h2>Todo listo' + (OB.name ? ', ' + esc(OB.name) : '') + '</h2><div class="ob-sum">' +
        (ss !== null ? '<span>' + AS[ss].g + ' ' + AS[ss].n + '</span>' : '') + (ci ? '<span>' + ASTRO.ANIMAL_EMOJI[ci.animal] + ' ' + ASTRO.ANIMALS[ci.animal] + ' de ' + ci.element + '</span>' : '') +
        '<span>' + mi.emoji + ' ' + esc(mi.name) + ' hoy</span></div>' +
        '<p class="ob-lead">Tu guía Sibila, tus oráculos y el cielo de hoy te esperan.</p><button class="btn primary big" data-a="obDone">Entrar en Arcana</button></div>';
    }
    return '<div class="ob-top">' + (s > 0 ? '<button class="x2" data-a="obBack" aria-label="Atrás">←</button>' : '<span></span>') + obDots() + '<span></span></div><div class="ob-body">' + h + '</div>';
  }
  function parseBirth(v) { if (!v) return null; var p = v.split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
  function obRender() { $('#ob').innerHTML = obHTML(); }
  function showOb() { $('#ob').hidden = false; $('#app').hidden = true; document.body.classList.add('noscroll'); obRender(); }

  A.obNext = function () {
    if (OB.step === 1) { var n = $('#obName'); if (n) OB.name = n.value.trim(); }
    if (OB.step === 2) { var b = $('#obBirth'); if (b) OB.birth = b.value; }
    OB.step = Math.min(STEPS - 1, OB.step + 1); obRender();
  };
  A.obSkip = function () { OB.birth = ''; OB.step++; obRender(); };
  A.obSkip2 = function () { OB.step++; obRender(); };
  A.obLoc = function () { ARC.act.locGet(); setTimeout(function () { if (!$('#ob').hidden) obRender(); }, 1500); setTimeout(function () { if (!$('#ob').hidden) obRender(); }, 5000); };
  A.obBack = function () { OB.step = Math.max(0, OB.step - 1); obRender(); };
  A.obOwn = function (el) {
    var v = el.dataset.v, i = OB.owned.indexOf(v);
    if (v === 'none') OB.owned = i > -1 ? [] : ['none'];
    else { OB.owned = OB.owned.filter(function (x) { return x !== 'none'; }); i = OB.owned.indexOf(v); if (i > -1) OB.owned.splice(i, 1); else OB.owned.push(v); }
    obRender();
  };
  A.obIntent = function (el) { var v = el.dataset.v, i = OB.intents.indexOf(v); if (i > -1) OB.intents.splice(i, 1); else OB.intents.push(v); obRender(); };
  A.obDone = function () {
    P.name = OB.name; P.birth = parseBirth(OB.birth);
    var decks = [], style = 'rws';
    OB.owned.forEach(function (o) {
      if (o === 'none') return;
      if (o.indexOf('tarot:') === 0) { if (decks.indexOf('tarot') < 0) { decks.push('tarot'); style = o.split(':')[1]; } }
      else decks.push(o);
    });
    P.owned = decks; P.tarotStyle = style; P.intentions = OB.intents.map(function (t) { return t.replace(/^\S+\s/, ''); });
    P.done = true; ARC.save('profile');
    $('#ob').hidden = true; $('#app').hidden = false; document.body.classList.remove('noscroll');
    ARC.tab = 'home'; ARC.render();
  };
  ARC.inputs.obName = function (v) { OB.name = v; };
  ARC.changes.obBirth = function (v) { OB.birth = v; };

  /* ================= Hoy ================= */
  function dailyCard() {
    var D = ARC.daily, key = ARC.dayKey(0);
    if (!D || D.date !== key) {
      var deckId = ARC.primaryDeck(), dk = DECKS.get(deckId, P.tarotStyle), c = dk.cards[ARC.rnd(dk.cards.length)];
      D = ARC.daily = { date: key, deck: deckId, id: c.id, rev: !!(S.reversed && dk.reversible && !c.norev && ARC.rnd(100) < 30), revealed: false };
      ARC.save('daily');
    }
    return D;
  }

  function sageLine(mi, card, rev) {
    var tx = TX.moonText(mi)[0];
    return tx + ' Hoy te acompaña «' + card.name + (rev ? ' (invertida)' : '') + '»: ' + (rev ? card.rev : card.up);
  }
  function knowPct() {
    var f = P.facts || {}, n = ARC.FACTS ? ARC.FACTS.filter(function (q) { var v = f[q.k]; return v && (!Array.isArray(v) || v.length); }).length : 0, tot = ARC.FACTS ? ARC.FACTS.length : 1;
    var psy = P.psy ? Object.keys(P.psy).length : 0;
    return Math.min(100, Math.round(((n / tot) * 60) + Math.min(psy, 4) * 10 + (P.birth ? 5 : 0) + (P.natal ? 5 : 0)));
  }
  ARC.knowPct = knowPct;

  ARC.views.home = function () {
    var now = new Date(), mi = ASTRO.moonInfo(now), ss = ARC.sunSign(), D = dailyCard(), dk = DECKS.get(D.deck, P.tarotStyle), card = dk.cards[D.id];
    var h = '<section class="page home2"><header class="homeh"><div><small>' + DAYS[now.getDay()] + ' ' + now.getDate() + ' de ' + MONTHS[now.getMonth()] + '</small><h1>' + ARC.greeting() + (P.name ? ',<br>' + esc(P.name) : '') + '</h1></div>' +
      '<button class="avatar" data-a="tab" data-tab="me" aria-label="Mi perfil">' + (P.name ? esc(P.name.charAt(0).toUpperCase()) : '👤') + '</button></header>';

    h += '<button class="hero-orb" data-a="goSkyLuna"><span class="orbglow"></span><span class="orbmoon">' + ARC.sky.moonSVG(mi.phase, 168) + '</span><span class="orb-t"><b>' + mi.emoji + ' ' + esc(mi.name) + '</b><small>' + Math.round(mi.illum * 100) + '% · en ' + AS[mi.sign].g + ' ' + AS[mi.sign].n + '</small></span></button>';
    h += '<p class="sage">' + esc(sageLine(mi, card, D.rev)) + '</p>';

    h += '<div class="group">';
    h += '<button class="grow" data-a="dayOpen"><span class="gthumb">' + ARC.read.tcard({ id: D.id, rev: D.rev }, { deck: dk, flipped: D.revealed }) + '</span><div><b>Carta del día</b><small>' + (D.revealed ? esc(card.name) + (D.rev ? ' · invertida' : '') : 'Toca para descubrirla') + '</small></div><i class="chev">›</i></button>';
    if (P.loc && ARC.loc) h += '<button class="grow" data-a="goSkyLocal"><span class="gi">🌤️</span><div><b>Tu cielo</b><small>' + (ARC.loc.getWeather() && ARC.loc.getWeather().current ? Math.round(ARC.loc.getWeather().current.temperature_2m) + '° en ' + esc(P.loc.name) + ' · luna y horas planetarias' : 'Luna y horas planetarias en ' + esc(P.loc.name)) + '</small></div><i class="chev">›</i></button>';
    else h += '<button class="grow" data-a="goSkyLocal"><span class="gi">📍</span><div><b>Activa tu ubicación</b><small>Luna local, clima y horas planetarias</small></div><i class="chev">›</i></button>';
    if (ss !== null) h += '<button class="grow" data-a="goSkySigno"><span class="gi gsign">' + AS[ss].g + '</span><div><b>Horóscopo de ' + AS[ss].n + '</b><small>' + esc(TX.daily(ss, now).areas[0].t) + '</small></div><i class="chev">›</i></button>';
    h += '</div>';

    h += ARC.missionsHTML();

    var kp = knowPct();
    h += '<button class="group know" data-a="goKnow"><div class="grow"><span class="gi">🔮</span><div><b>Sibila te conoce al ' + kp + '%</b><small>Cuanto más sabe de ti, más personales son sus respuestas</small></div><i class="chev">›</i></div><div class="meter"><i style="width:' + kp + '%"></i></div></button>';
    h += '<p class="fine">' + esc(TX.dayPrompt(now)) + '</p>';
    return h + '</section>';
  };

  A.dayOpen = function () {
    var D = ARC.daily; if (!D) return;
    var dk = DECKS.get(D.deck, P.tarotStyle), card = dk.cards[D.id];
    if (!D.revealed) { D.revealed = true; ARC.save('daily'); ARC.mission('carta'); }
    var kw = (D.rev ? card.kwRev : card.kwUp);
    ARC.openModal('<div class="det">' + ARC.read.tcard({ id: D.id, rev: D.rev }, { deck: dk, flipped: true, cls: 'big' }) + '<div class="det-t"><small>Tu carta del día</small><h3>' + (card.glyph ? '' : card.emoji + ' ') + esc(card.name) + '</h3>' + (D.rev ? '<span class="tag">↺ Invertida</span>' : '') +
      '<p class="kw">' + esc(kw) + '</p><p>' + esc(D.rev ? card.rev : card.up) + '</p><p class="ask">💭 ¿Dónde aparece «' + esc(kw.split(',')[0].toLowerCase()) + '» en mi día de hoy?</p></div><button class="btn primary big" data-a="daySave">📓 Escribir en mi diario</button></div>');
    ARC.render(true);
  };
  A.dayFlip = function () {
    var D = ARC.daily; if (!D || D.revealed) return;
    D.revealed = true; ARC.save('daily'); ARC.mission && ARC.mission('carta'); ARC.render(true);
  };
  A.daySave = function () {
    var D = ARC.daily, card = DECKS.get(D.deck, P.tarotStyle).cards[D.id];
    ARC.draft = { type: 'carta', title: 'Carta del día · ' + card.name + (D.rev ? ' (invertida)' : ''), question: '', items: [] };
    var q = '¿Dónde aparece «' + (D.rev ? card.kwRev : card.kwUp).split(',')[0].toLowerCase() + '» en mi día?';
    ARC.openModal('<h3>📓 ' + esc(card.name) + '</h3><p class="hint">' + esc(q) + '</p><textarea id="jnote" rows="6" placeholder="Escribe lo que te surja…"></textarea><button class="btn primary big" data-a="journalSave">Guardar</button>');
  };
  A.promptWrite = function () {
    var q = TX.dayPrompt(new Date());
    ARC.draft = { type: 'reflexion', title: 'Reflexión del día', question: q, items: [] };
    ARC.openModal('<h3>💭 Reflexión</h3><p class="hint">' + esc(q) + '</p><textarea id="jnote" rows="7" placeholder="Escribe sin juzgarte…"></textarea><button class="btn primary big" data-a="journalSave">Guardar</button>');
  };
  A.goSkyLuna = function () { ARC.sky.setSub('luna'); ARC.go('sky'); };
  A.goKnow = function () { ME.sub = 'conocete'; ARC.go('me'); };
  A.goSkyLocal = function () { ARC.sky.setSub('local'); ARC.go('sky'); };
  A.goSkySigno = function () { ARC.sky.setSub('signo'); ARC.go('sky'); };


  /* ================= Conócete: preguntas que afinan toda la IA ================= */
  var FACTS = [
    { k: 'momento', l: 'Momento vital', q: '¿En qué momento de tu vida estás?', t: 'one', o: ['Empezando algo nuevo', 'En plena transición', 'En estabilidad', 'En crisis o duelo', 'Reinventándome'] },
    { k: 'area', l: 'Área que más le preocupa', q: '¿Qué área de tu vida te ocupa más ahora?', t: 'one', o: ['Amor y relaciones', 'Trabajo y vocación', 'Dinero', 'Salud y bienestar', 'Familia', 'Propósito', 'Autoestima'] },
    { k: 'pareja', l: 'Situación sentimental', q: '¿Cómo está tu vida sentimental?', t: 'one', o: ['Soltero/a', 'En pareja', 'Es complicado', 'Separación reciente', 'Prefiero no decirlo'] },
    { k: 'decide', l: 'Cómo decide', q: '¿Cómo sueles decidir?', t: 'one', o: ['Con la cabeza', 'Con el corazón', 'Con la intuición', 'Depende'] },
    { k: 'nivel', l: 'Experiencia en esoterismo', q: '¿Cuánta experiencia tienes en esoterismo?', t: 'one', o: ['Soy novato/a', 'Aprendiz', 'Practico a menudo', 'Avanzado/a'] },
    { k: 'tradiciones', l: 'Tradiciones que le atraen', q: '¿Qué tradiciones te atraen?', t: 'multi', o: ['Tarot', 'Astrología', 'Numerología', 'Wicca y brujería', 'Nórdica', 'Celta', 'Hermetismo', 'Chamanismo', 'Magia del caos', 'Cristales y hierbas'] },
    { k: 'sanar', l: 'Quiere sanar o cambiar', q: '¿Qué te gustaría sanar o cambiar?', t: 'text' },
    { k: 'fortaleza', l: 'Su mayor fortaleza', q: '¿Cuál reconoces como tu mayor fortaleza?', t: 'text' },
    { k: 'miedo', l: 'Miedo recurrente', q: '¿Qué miedo se repite en tu vida?', t: 'text' },
    { k: 'calma', l: 'Lo que le da calma', q: '¿Qué te hace sentir en calma?', t: 'text' },
    { k: 'trabajo', l: 'Trabajo o estudios', q: '¿A qué te dedicas o qué estudias?', t: 'text' },
    { k: 'meta', l: 'Meta de este año', q: '¿Cuál es tu meta más importante este año?', t: 'text' }
  ];
  ARC.FACTS = FACTS;
  ARC.factsHTML = function () { return conocete(); };
  function conocete() {
    var f = P.facts = P.facts || {}, done = FACTS.filter(function (q) { var v = f[q.k]; return v && (!Array.isArray(v) || v.length); }).length;
    var h = '<div class="panel"><div class="lbl">Conócete · ' + done + '/' + FACTS.length + '</div><div class="meter"><i style="width:' + Math.round(done / FACTS.length * 100) + '%"></i></div>' +
      '<p class="hint">Cuanto más cuentes, más personales y precisas serán las lecturas, el horóscopo y las respuestas de Sibila. Todo se guarda solo en tu dispositivo y solo se envía a la IA al pedir una interpretación.</p></div>';
    FACTS.forEach(function (q) {
      h += '<div class="panel"><div class="lbl">' + esc(q.q) + '</div>';
      if (q.t === 'text') h += '<textarea id="fact_' + q.k + '" rows="2" maxlength="300" placeholder="Escribe con libertad…">' + esc(f[q.k] || '') + '</textarea>';
      else {
        var cur = f[q.k] || (q.t === 'multi' ? [] : '');
        h += '<div class="chips wrap">' + q.o.map(function (o) { var on = q.t === 'multi' ? cur.indexOf(o) > -1 : cur === o; return '<button data-a="factPick" data-k="' + q.k + '" data-v="' + esc(o) + '" class="' + (on ? 'on' : '') + '">' + esc(o) + '</button>'; }).join('') + '</div>';
      }
      h += '</div>';
    });
    return h;
  }
  A.factPick = function (el) {
    var q = FACTS.filter(function (x) { return x.k === el.dataset.k; })[0], f = P.facts = P.facts || {}, v = el.dataset.v;
    if (q.t === 'multi') { var a = f[q.k] || []; var i = a.indexOf(v); if (i > -1) a.splice(i, 1); else a.push(v); f[q.k] = a; }
    else f[q.k] = f[q.k] === v ? '' : v;
    ARC.save('profile'); ARC.render(true);
  };
  FACTS.forEach(function (q) { if (q.t === 'text') ARC.inputs['fact_' + q.k] = function (v) { (P.facts = P.facts || {})[q.k] = v; ARC.save('profile'); }; });

  /* ================= Yo: diario, perfil y ajustes ================= */
  var ME = { sub: 'diario' };
  var TABS = [['diario', '📓 Diario'], ['perfil', '👤 Perfil'], ['conocete', '🪞 Conócete'], ['ajustes', '⚙️ Ajustes']];
  function fmtTs(ts) { var d = new Date(ts); return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); }

  function diarioHTML() {
    var j = ARC.journal;
    if (!j.length) return '<div class="empty"><b>📓</b><p>Tu diario está vacío.</p><p class="hint">Guarda aquí tus lecturas, tu carta del día y tus reflexiones para ver cómo evolucionas.</p></div>';
    return j.map(function (e, i) {
      return '<button class="entry" data-a="entryOpen" data-i="' + i + '"><small>' + fmtTs(e.ts) + ' · ' + esc(e.type === 'lectura' ? 'Lectura' : e.type === 'carta' ? 'Carta del día' : e.type === 'luna' ? 'Luna' : 'Reflexión') + '</small><b>' + esc(e.title || 'Entrada') + '</b>' +
        (e.note ? '<p>' + esc(e.note.slice(0, 120)) + (e.note.length > 120 ? '…' : '') + '</p>' : '') + '</button>';
    }).join('');
  }
  function perfilHTML() {
    var ss = ARC.sunSign(), ci = ARC.chineseInfo();
    var owned = DECKS.list.map(function (d) { var on = (P.owned || []).indexOf(d.id) > -1; return '<button data-a="ownToggle" data-v="' + d.id + '" class="' + (on ? 'on' : '') + '">' + d.emoji + ' ' + esc(d.id === 'tarot' ? 'Tarot' : d.name) + '</button>'; }).join('');
    return '<div class="panel"><div class="lbl">Nombre</div><input id="pname" type="text" maxlength="30" value="' + esc(P.name) + '" placeholder="Tu nombre">' +
      '<div class="lbl">Fecha de nacimiento</div><input id="pbirth" type="date" value="' + (P.birth ? P.birth.y + '-' + ARC.pad(P.birth.m) + '-' + ARC.pad(P.birth.d) : '') + '">' +
      (ss !== null ? '<div class="ob-sum left"><span>' + AS[ss].g + ' ' + AS[ss].n + '</span>' + (ci ? '<span>' + ASTRO.ANIMAL_EMOJI[ci.animal] + ' ' + ASTRO.ANIMALS[ci.animal] + ' de ' + ci.element + '</span>' : '') + '</div>' : '') +
      '<div class="lbl">Mis barajas</div><div class="chips wrap">' + owned + '</div>' +
      '<div class="lbl">Estilo de tarot</div><div class="seg three">' + Object.keys(DECKS.STYLES).map(function (k) { return '<button data-a="tstyleMe" data-v="' + k + '" class="' + (P.tarotStyle === k ? 'on' : '') + '">' + esc(DECKS.STYLES[k].name.replace('Tarot de ', '')) + '</button>'; }).join('') + '</div></div>';
  }
  function ajustesHTML() {
    var pr = ARC.ai.PROVIDERS, cur = S.provider;
    var keyField = cur === 'gemini' ? '<div class="lbl">Clave de Gemini</div><input id="gkey" type="password" placeholder="AIza…" autocomplete="off" spellcheck="false" value="' + esc(S.geminiKey) + '">' +
      '<p class="hint">Gratis en <b>aistudio.google.com</b> → “Get API key”. Se guarda solo en este navegador.</p><div class="lbl">Modelo</div><input id="gmodel" type="text" value="' + esc(S.geminiModel) + '" spellcheck="false">'
      : cur === 'anthropic' ? '<div class="lbl">Clave de Anthropic</div><input id="akey" type="password" placeholder="sk-ant-…" autocomplete="off" spellcheck="false" value="' + esc(S.anthropicKey) + '"><div class="lbl">Modelo</div><input id="amodel" type="text" value="' + esc(S.anthropicModel) + '" spellcheck="false">'
        : '<div class="lbl">Modelo</div><input id="fmodel" type="text" value="' + esc(S.freeModel) + '" spellcheck="false"><div class="lbl">Dirección del servicio</div><input id="furl" type="text" value="' + esc(S.freeUrl) + '" spellcheck="false">';
    return '<div class="panel"><div class="lbl">Inteligencia artificial</div><div class="seg three">' +
      Object.keys(pr).map(function (k) { return '<button data-a="provider" data-v="' + k + '" class="' + (cur === k ? 'on' : '') + '">' + esc({ free: 'Gratis', gemini: 'Gemini', anthropic: 'Claude' }[k]) + '</button>'; }).join('') + '</div>' +
      '<p class="hint">' + esc(pr[cur].note) + '</p>' + keyField +
      '<button class="btn ghost" data-a="aiTest">Probar conexión</button><div id="aiTestOut" class="hint"></div></div>' +
      '<div class="panel"><div class="lbl">Tono de Sibila</div><div class="seg three">' + [['sabio', 'Mentor sabio'], ['cercano', 'Cercano'], ['directo', 'Directo']].map(function (t) { return '<button data-a="tone" data-v="' + t[0] + '" class="' + ((P.tone || 'sabio') === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div><p class="hint">Cambia cómo te habla en lecturas, horóscopos y conversaciones.</p>' +
      '<label class="toggle"><input type="checkbox" id="revealall"' + (P.revealAll ? ' checked' : '') + '><span>Mostrar todas las puertas desde el principio</span></label></div>' +
      '<div class="panel"><div class="lbl">Lecturas</div><label class="toggle"><input type="checkbox" id="rev"' + (S.reversed ? ' checked' : '') + '><span>↺ Permitir cartas invertidas</span></label></div>' +
      (ARC.cloud ? ARC.cloud.panelHTML() : '') +
      '<div class="panel"><div class="lbl">Tus datos</div><p class="hint">Todo se guarda en este dispositivo (y en tu nube cifrada si la conectas): perfil, diario, chat, biblioteca y progreso.</p>' +
      '<button class="btn ghost" data-a="progReset">Reiniciar la academia</button><button class="btn ghost danger" data-a="wipeAll">Borrar todos mis datos</button></div>' +
      '<p class="fine">Arcana es una herramienta de reflexión y entretenimiento. No predice el futuro ni sustituye a profesionales de la salud, el derecho o las finanzas.</p>';
  }
  ARC.views.me = function () {
    var body = ME.sub === 'diario' ? diarioHTML() : ME.sub === 'perfil' ? perfilHTML() : ME.sub === 'conocete' ? (ARC.interview ? ARC.interview.html() : conocete()) : ajustesHTML();
    return '<section class="page"><button class="btn link left" data-a="tab" data-tab="home">← Hoy</button><header class="hero small"><h1>Yo <span>🌙</span></h1></header><div class="chips sub">' +
      TABS.map(function (t) { return '<button data-a="meSub" data-v="' + t[0] + '" class="' + (ME.sub === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>' + body + '</section>';
  };
  A.meSub = function (el) { ME.sub = el.dataset.v; ARC.render(); };
  A.entryOpen = function (el) {
    var i = Number(el.dataset.i), e = ARC.journal[i]; if (!e) return;
    ARC.openModal('<small class="gold">' + fmtTs(e.ts) + '</small><h3>' + esc(e.title || 'Entrada') + '</h3>' + (e.question ? '<p class="kw">“' + esc(e.question) + '”</p>' : '') +
      (e.items && e.items.length ? '<p>' + e.items.map(esc).join('<br>') + '</p>' : '') + (e.note ? '<div class="ai">' + ARC.fmt(e.note) + '</div>' : '') +
      (e.ai ? '<details><summary>Interpretación guardada</summary>' + ARC.fmt(e.ai) + '</details>' : '') +
      '<button class="btn ghost danger" data-a="entryDel" data-i="' + i + '">Borrar entrada</button>');
  };
  A.entryDel = function (el) { ARC.journal.splice(Number(el.dataset.i), 1); ARC.save('journal'); ARC.closeModal(); ARC.render(true); };
  A.ownToggle = function (el) {
    var v = el.dataset.v, i = P.owned.indexOf(v); if (i > -1) P.owned.splice(i, 1); else P.owned.push(v); ARC.save('profile'); ARC.render(true);
  };
  A.tstyleMe = function (el) { P.tarotStyle = el.dataset.v; ARC.save('profile'); ARC.render(true); };
  A.tone = function (el) { P.tone = el.dataset.v; ARC.save('profile'); ARC.render(true); };
  ARC.changes.revealall = function (v) { P.revealAll = v; ARC.save('profile'); ARC.toast(v ? 'Todas las puertas abiertas' : 'Las puertas se revelarán con tu avance'); };
  A.provider = function (el) { S.provider = el.dataset.v; ARC.save('settings'); ARC.render(true); };
  A.aiTest = function () {
    var out = $('#aiTestOut'); out.textContent = 'Probando…';
    ARC.ai.ask({ system: 'Responde solo con la palabra: listo', messages: [{ role: 'user', content: 'Prueba' }], max: 20 })
      .then(function (t) { out.textContent = '✅ Conectado: ' + t.slice(0, 40); })
      .catch(function (e) { out.textContent = '⚠️ ' + e.message; });
  };
  A.progReset = function () {
    if (!confirm('¿Reiniciar todo tu progreso en la academia?')) return;
    var p = ARC.progress; p.xp = 0; p.streak = 0; p.last = ''; p.done = {}; ARC.save('progress'); ARC.toast('Progreso reiniciado');
  };
  A.wipeAll = function () {
    if (!confirm('¿Borrar TODOS tus datos (perfil, diario, chat, progreso y claves)? No se puede deshacer.')) return;
    ['settings', 'profile', 'progress', 'journal', 'chat', 'daily', 'missions', 'lib', 'life', 'fav', 'sync', 'magic', 'dreams', 'games', 'courses', 'codex', 'cloud'].forEach(function (k) { ARC.store.del('arcana.' + k); });
    location.reload();
  };
  ARC.inputs.pname = function (v) { P.name = v.trim(); ARC.save('profile'); };
  ARC.changes.pbirth = function (v) { P.birth = parseBirth(v); ARC.save('profile'); ARC.render(true); };
  ARC.inputs.gkey = function (v) { S.geminiKey = v.trim(); ARC.save('settings'); };
  ARC.inputs.gmodel = function (v) { S.geminiModel = v.trim(); ARC.save('settings'); };
  ARC.inputs.akey = function (v) { S.anthropicKey = v.trim(); ARC.save('settings'); };
  ARC.inputs.amodel = function (v) { S.anthropicModel = v.trim(); ARC.save('settings'); };
  ARC.inputs.fmodel = function (v) { S.freeModel = v.trim(); ARC.save('settings'); };
  ARC.inputs.furl = function (v) { S.freeUrl = v.trim(); ARC.save('settings'); };
  ARC.changes.rev = function (v) { S.reversed = v; ARC.save('settings'); };

  ARC.boot = function () {
    if (!P.done) showOb(); else { $('#app').hidden = false; ARC.render(); }
  };
})();
