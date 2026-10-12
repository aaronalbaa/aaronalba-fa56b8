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
    v.innerHTML = fn ? fn() : '';
    var tabKey = ARC.tab === 'me' ? '' : ARC.tab;
    $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === tabKey); });
    document.body.dataset.tab = ARC.tab;
    if (ARC.after[ARC.tab]) ARC.after[ARC.tab]();
    if (keepScroll !== true) window.scrollTo(0, 0);
  }
  function go(tab) { ARC.tab = tab; closeModal(); render(); }

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
