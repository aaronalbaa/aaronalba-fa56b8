/* Núcleo de Arcana: utilidades, estado persistente, navegación y modales. */
(function () {
  'use strict';
  var ARC = window.ARC = {};

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var norm = function (s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* nada */ } }
  };

  function rnd(n) {
    if (window.crypto && crypto.getRandomValues) {
      var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n;
      do { crypto.getRandomValues(a); } while (a[0] >= lim);
      return a[0] % n;
    }
    return Math.floor(Math.random() * n);
  }
  function shuffle(n) {
    var a = []; for (var i = 0; i < n; i++) a.push(i);
    for (var k = n - 1; k > 0; k--) { var j = rnd(k + 1), t = a[k]; a[k] = a[j]; a[j] = t; }
    return a;
  }
  function dayKey(offset) {
    var d = new Date(); d.setDate(d.getDate() + (offset || 0));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2800);
  }

  /* ---------- estado persistente ---------- */
  var oldS = store.get('arcana.settings', {});
  var settings = Object.assign({
    provider: 'free', freeUrl: 'https://text.pollinations.ai/openai', freeModel: 'openai',
    geminiKey: '', geminiModel: 'gemini-2.5-flash', anthropicKey: '', anthropicModel: 'claude-sonnet-5-5', reversed: true
  }, oldS);
  if (oldS.apiKey && !oldS.anthropicKey) { settings.anthropicKey = oldS.apiKey; settings.provider = 'anthropic'; }
  if (oldS.model && !oldS.anthropicModel) settings.anthropicModel = oldS.model;

  var profile = Object.assign({
    done: false, name: '', birth: null, owned: [], tarotStyle: 'rws', intentions: [], consent: {}, memory: ''
  }, store.get('arcana.profile', {}));
  var progress = Object.assign({ xp: 0, streak: 0, last: '', done: {} }, store.get('arcana.progress', {}));
  var journal = store.get('arcana.journal', []);
  var chat = store.get('arcana.chat', []);
  var daily = store.get('arcana.daily', null);

  var saveFns = {
    settings: function () { store.set('arcana.settings', settings); },
    profile: function () { store.set('arcana.profile', profile); },
    progress: function () { store.set('arcana.progress', progress); },
    journal: function () { store.set('arcana.journal', journal.slice(0, 300)); },
    chat: function () { store.set('arcana.chat', chat.slice(-60)); },
    daily: function () { store.set('arcana.daily', ARC.daily); }
  };

  /* ---------- modales ---------- */
  function openModal(html, cls) {
    var m = $('#modal');
    m.innerHTML = '<div class="backdrop" data-a="close"></div><div class="sheet ' + (cls || '') + '" role="dialog" aria-modal="true">' +
      '<button class="x" data-a="close" aria-label="Cerrar">✕</button>' + html + '</div>';
    m.hidden = false;
    document.body.classList.add('noscroll');
  }
  function closeModal() {
    $('#modal').hidden = true; $('#modal').innerHTML = '';
    if ($('#overlay').hidden && $('#ob').hidden) document.body.classList.remove('noscroll');
  }

  function fmt(text) {
    return esc(text).replace(/^#+\s*/gm, '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .split(/\n{2,}/).map(function (p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>'; }).join('');
  }

  /* ---------- perfil derivado ---------- */
  function sunSign() {
    var b = profile.birth;
    return b ? ASTRO.signOfDate(b.y, b.m, b.d) : null;
  }
  function chineseInfo() {
    var b = profile.birth;
    return b ? ASTRO.chineseYear(b.y, b.m, b.d) : null;
  }
  function primaryDeck() {
    var o = profile.owned || [];
    for (var i = 0; i < o.length; i++) if (DECKS.list.some(function (d) { return d.id === o[i]; })) return o[i];
    return 'tarot';
  }
  function greeting() {
    var h = new Date().getHours();
    return h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
  }

  /* ---------- navegación ---------- */
  ARC.tab = 'home';
  ARC.views = {}; ARC.after = {}; ARC.act = {}; ARC.inputs = {}; ARC.changes = {};

  function render(keepScroll) {
    var v = $('#view'), fn = ARC.views[ARC.tab];
    if (ARC.unlocked && !ARC.unlocked(ARC.tab) && ARC.lockedHTML) fn = function () { return ARC.lockedHTML(ARC.tab); };
    v.innerHTML = fn ? fn() : '<section class="page"><header class="hero small"><h1>Pronto ✨</h1><p>Esta sección se está preparando</p></header></section>';
    var GROUP = { sky: 1, study: 1, magic: 1, crypt: 1, chat: 1, me: 1, games: 1, codex: 1, more: 1 };
    $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === ARC.tab || (b.dataset.tab === 'more' && !!GROUP[ARC.tab])); });

    document.body.dataset.tab = ARC.tab;
    document.body.classList.toggle('crypt', ARC.tab === 'crypt' && !!ARC.profile.darkOk);
    document.body.classList.toggle('norev', keepScroll === true);
    if (ARC.after[ARC.tab]) ARC.after[ARC.tab]();
    if (keepScroll !== true) window.scrollTo(0, 0);
  }
  function go(tab) { ARC.tab = tab; closeModal(); render(); }

  // Pestañas con subsecciones registradas por otros módulos (study, magic)
  ARC.subs = { study: [], magic: [], crypt: [] };
  ARC.curSub = { study: 'cursos', magic: 'rituales', crypt: 'demonios' };
  ARC.regSub = function (tab, id, emoji, label, fn) { ARC.subs[tab].push({ id: id, emoji: emoji, label: label, fn: fn }); };
  ARC.setSub = function (tab, id) { ARC.curSub[tab] = id; };
  var TITLES = { study: ['Estudio', '📚', 'Aprende, colecciona y consulta'], magic: ['Magia', '✨', 'Rituales, sigilos y sonido'], crypt: ['Cripta', '🕯️', 'Lo oscuro, como historia, folclore y misterio'] };
  function subView(tab) {
    var list = ARC.subs[tab], cur = ARC.curSub[tab], t = TITLES[tab];
    if (tab === 'crypt' && !ARC.profile.darkOk) return ARC.gateHTML();
    if (!list.length) return '<section class="page"><header class="hero small"><h1>' + t[0] + ' <span>' + t[1] + '</span></h1><p>Próximamente…</p></header></section>';
    var active = list.filter(function (s) { return s.id === cur; })[0] || list[0];
    var chips = list.map(function (s) { return '<button data-a="subGo" data-tab="' + tab + '" data-v="' + s.id + '" class="' + (s.id === active.id ? 'on' : '') + '">' + s.emoji + ' ' + s.label + '</button>'; }).join('');
    return '<section class="page"><header class="hero small"><h1>' + t[0] + ' <span>' + t[1] + '</span></h1><p>' + t[2] + '</p></header><div class="chips sub">' + chips + '</div><div class="subbody">' + active.fn() + '</div></section>';
  }
  ARC.views.study = function () { return subView('study'); };
  ARC.views.magic = function () { return subView('magic'); };
  ARC.views.crypt = function () { return subView('crypt'); };
  // Aviso obligatorio antes de entrar en la Cripta (contenido oscuro, +18)
  ARC.gateHTML = function () {
    return '<section class="page gate"><div class="gate-in"><div class="gate-eye">👁️</div><h1>Cripta</h1><p class="gate-sub">Aquí se guarda lo oscuro del esoterismo: demonología, ouija, criaturas, folclore perturbador y misterios.</p>' +
      '<div class="gate-box"><b>⚠️ Descargo de responsabilidad</b><ul>' +
      '<li>Es una zona <b>solo para mayores de 18 años</b>.</li>' +
      '<li>El contenido se presenta como <b>historia, cultura, folclore, literatura y ficción</b>, con fines educativos y de entretenimiento.</li>' +
      '<li><b>No se incluyen maldiciones, rituales para dañar a nadie ni instrucciones peligrosas.</b> Dañar a otras personas es antiético y puede ser delito.</li>' +
      '<li>Nada de esto sustituye la ayuda médica o psicológica. Si algo te inquieta de verdad, habla con un profesional (en España, 024 o 112).</li>' +
      '<li>Los juegos como la ouija son <b>entretenimiento</b>: las respuestas las genera la aplicación, no seres sobrenaturales.</li></ul>' +
      '<label class="toggle"><input type="checkbox" id="darkchk"><span>Tengo 18 años o más y acepto lo anterior</span></label></div>' +
      '<button class="btn primary big" data-a="gateEnter">Entrar en la Cripta</button><button class="btn link" data-a="tab" data-tab="home">Mejor no</button></div></section>';
  };
  ARC.act.gateEnter = function () {
    var c = document.getElementById('darkchk');
    if (!c || !c.checked) { toast('Marca la casilla para continuar'); return; }
    ARC.profile.darkOk = true; ARC.save('profile'); render();
  };
  ARC.act.subGo = function (el) { ARC.curSub[el.dataset.tab] = el.dataset.v; render(); };

  Object.assign(ARC, {
    $: $, $$: $$, esc: esc, norm: norm, pad: pad, store: store, rnd: rnd, shuffle: shuffle, dayKey: dayKey, toast: toast,
    settings: settings, profile: profile, progress: progress, journal: journal, chat: chat, daily: daily,
    save: function (k) { saveFns[k](); },
    openModal: openModal, closeModal: closeModal, fmt: fmt,
    sunSign: sunSign, chineseInfo: chineseInfo, primaryDeck: primaryDeck, greeting: greeting,
    render: render, go: go
  });

  ARC.act.tab = function (el) { go(el.dataset.tab); };
  ARC.act.close = function () { closeModal(); };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-a]');
    if (!el || el.disabled) return;
    if (el.tagName === 'A') e.preventDefault();
    var fn = ARC.act[el.dataset.a];
    if (fn) fn(el, e);
  });
  document.addEventListener('input', function (e) { var f = ARC.inputs[e.target.id]; if (f) f(e.target.value, e.target); });
  document.addEventListener('change', function (e) {
    var t = e.target, f = ARC.changes[t.id];
    if (f) f(t.type === 'checkbox' ? t.checked : t.value, t);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!$('#modal').hidden) closeModal();
      else if (!$('#overlay').hidden && ARC.act.closeLesson) ARC.act.closeLesson();
    }
  });
})();
