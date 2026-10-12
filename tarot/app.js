/* Arcana — lecturas de tarot + academia esotérica. Sin dependencias, sin build. */
(function () {
  'use strict';

  const CARDS = TAROT.CARDS;
  const SUITS = TAROT.SUITS;
  const UNITS = ACADEMY.UNITS;

  /* ---------- utilidades ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const pad = n => (n < 10 ? '0' : '') + n;

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };

  function rnd(n) {
    if (window.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(1);
      const lim = Math.floor(4294967296 / n) * n;
      do { crypto.getRandomValues(a); } while (a[0] >= lim);
      return a[0] % n;
    }
    return Math.floor(Math.random() * n);
  }

  function dayKey(offset) {
    const d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
  }

  /* ---------- estado persistente ---------- */
  const settings = Object.assign({ apiKey: '', model: 'claude-sonnet-5-5', reversed: true }, store.get('arcana.settings', {}));
  const progress = Object.assign({ xp: 0, streak: 0, last: '', done: {} }, store.get('arcana.progress', {}));
  const saveSettings = () => store.set('arcana.settings', settings);
  const saveProgress = () => store.set('arcana.progress', progress);

  /* ---------- tiradas ---------- */
  // layout: filas de celdas. 0 = vacío, n = posición n, [a,b] = carta a con carta b cruzada encima
  const SPREADS = [
    { id: 'una', name: 'Una carta', emoji: '🌅', desc: 'El mensaje del momento',
      pos: ['Mensaje'], layout: [[1]] },
    { id: 'ppf', name: 'Pasado · Presente · Futuro', emoji: '⏳', desc: 'La línea del tiempo clásica',
      pos: ['Pasado', 'Presente', 'Futuro'], layout: [[1, 2, 3]] },
    { id: 'sit', name: 'Situación y consejo', emoji: '🧭', desc: 'Qué pasa, qué pesa y qué hacer',
      pos: ['Situación', 'Desafío', 'Consejo'], layout: [[1, 2, 3]] },
    { id: 'amor', name: 'Amor y vínculos', emoji: '💞', desc: 'Tú, la conexión y la otra persona',
      pos: ['Tú', 'La conexión', 'La otra persona'], layout: [[1, 2, 3]] },
    { id: 'herr', name: 'Herradura', emoji: '🧲', desc: 'Siete cartas en arco',
      pos: ['Pasado', 'Presente', 'Futuro cercano', 'Tú', 'Tu entorno', 'Obstáculos', 'Resultado'],
      layout: [[0, 0, 0, 4, 0, 0, 0], [0, 0, 3, 0, 5, 0, 0], [0, 2, 0, 0, 0, 6, 0], [1, 0, 0, 0, 0, 0, 7]] },
    { id: 'celta', name: 'Cruz Celta', emoji: '☘️', desc: 'La lectura profunda de diez cartas',
      pos: ['Presente', 'Desafío', 'Base', 'Pasado', 'Meta o corona', 'Futuro cercano', 'Tú', 'Entorno', 'Esperanzas y miedos', 'Resultado'],
      layout: [[0, 5, 0, 10], [4, [1, 2], 6, 9], [0, 3, 0, 8], [0, 0, 0, 7]] }
  ];
  const spreadById = id => SPREADS.find(s => s.id === id) || SPREADS[1];

  /* ---------- estado de la lectura ---------- */
  function freshRead(keep) {
    return {
      stage: 'setup', question: '', mode: keep ? keep.mode : 'virtual', spread: keep ? keep.spread : 'ppf',
      cards: [], revealed: [], dealt: false, shuffling: false, ai: '', aiState: 'idle', aiError: ''
    };
  }
  let R = freshRead();
  let tab = 'read';

  /* ---------- carta ---------- */
  function tcard(c, o) {
    o = o || {};
    const d = c ? CARDS[c.id] : null;
    let face = '<div class="face"></div>';
    if (d) {
      face = '<div class="face ' + (d.suit ? 's-' + d.suit : 's-mayor') + (c.rev ? ' rev' : '') + '">' +
        '<span class="top">' + esc(d.num) + '</span><span class="em">' + d.emoji + '</span>' +
        '<span class="nm">' + esc(d.name) + '</span></div>';
    }
    return '<div class="tcard' + (o.flipped ? ' flipped' : '') + (o.cls ? ' ' + o.cls : '') + '" ' + (o.attrs || '') +
      (o.style ? ' style="' + o.style + '"' : '') + '><div class="in">' + face +
      '<div class="back"><span>✦</span></div></div>' + (o.num ? '<i class="badge">' + o.num + '</i>' : '') + '</div>';
  }

  /* ---------- vista: Leer ---------- */
  function cardOfDay() {
    const k = dayKey(0).split('-').reduce((a, b) => a * 31 + Number(b), 7);
    return CARDS[k % CARDS.length];
  }

  function renderSetup() {
    const cod = cardOfDay();
    const sp = spreadById(R.spread);
    return '<section class="page">' +
      '<header class="hero"><h1>Arcana <span>🔮</span></h1><p>Pregunta. Respira. Deja que las cartas hablen.</p></header>' +
      '<button class="cod" data-a="cod"><span class="cod-card">' + tcard({ id: cod.id, rev: false }, { flipped: true }) + '</span>' +
      '<span class="cod-t"><small>Carta del día</small><b>' + esc(cod.name) + '</b><em>' + esc(cod.kwUp) + '</em></span></button>' +
      '<div class="panel"><label class="lbl" for="q">Tu pregunta</label>' +
      '<textarea id="q" rows="3" maxlength="300" placeholder="Ej.: ¿Qué necesito entender sobre mi trabajo ahora?">' + esc(R.question) + '</textarea>' +
      '<div class="lbl">¿Quién echa las cartas?</div>' +
      '<div class="seg">' +
      '<button data-a="mode" data-v="virtual" class="' + (R.mode === 'virtual' ? 'on' : '') + '">🎴 La baraja</button>' +
      '<button data-a="mode" data-v="fisica" class="' + (R.mode === 'fisica' ? 'on' : '') + '">🖐️ Mis cartas</button></div>' +
      '<p class="hint">' + (R.mode === 'virtual'
        ? 'Barajamos y repartimos por ti. Tú giras las cartas.'
        : 'Echa tus cartas físicas y dinos cuáles salieron: las interpretamos.') + '</p>' +
      '<div class="lbl">Tirada</div><div class="spreads">' +
      SPREADS.map(s => '<button class="spread' + (s.id === R.spread ? ' on' : '') + '" data-a="spread" data-v="' + s.id + '">' +
        '<b>' + s.emoji + '</b><span>' + esc(s.name) + '</span><small>' + s.pos.length + (s.pos.length === 1 ? ' carta' : ' cartas') + '</small></button>').join('') +
      '</div><p class="hint">' + esc(sp.desc) + '</p>' +
      '<button class="btn primary big" data-a="start">Continuar ✨</button></div>' +
      '<p class="fine">El tarot es una herramienta de reflexión y entretenimiento, no sustituye consejo médico, legal ni financiero.</p></section>';
  }

  function slotHTML(p) {
    const sp = spreadById(R.spread);
    const c = R.cards[p];
    const num = p + 1;
    if (R.stage === 'reading') return tcard(c, { flipped: true, num, attrs: 'data-a="detail" data-p="' + p + '"' });
    if (R.mode === 'fisica') {
      if (!c) return '<button class="slot" data-a="pick" data-p="' + p + '" aria-label="Elegir carta ' + num + '"><span>+</span><i class="badge">' + num + '</i></button>';
      return tcard(c, { flipped: true, num, attrs: 'data-a="pick" data-p="' + p + '"' });
    }
    return tcard(c, { flipped: !!R.revealed[p], num, cls: 'deal', style: 'animation-delay:' + (p * 90) + 'ms',
      attrs: (R.revealed[p] ? 'data-a="detail"' : 'data-a="flip"') + ' data-p="' + p + '"' });
  }

  function gridHTML() {
    const sp = spreadById(R.spread);
    const cols = sp.layout[0].length;
    const dense = cols >= 7;
    let html = '<div class="grid' + (dense ? ' dense' : '') + ' g-' + sp.id + '" style="--cols:' + cols + '">';
    sp.layout.forEach(row => {
      row.forEach(cell => {
        if (!cell) { html += '<div class="cell empty"></div>'; return; }
        const base = Array.isArray(cell) ? cell[0] : cell;
        const over = Array.isArray(cell) ? cell[1] : 0;
        html += '<div class="cell">' + slotHTML(base - 1);
        if (over) html += '<div class="overlay">' + slotHTML(over - 1) + '</div>';
        if (!dense) html += '<div class="plabel">' + esc(sp.pos[base - 1]) + (over ? ' + ' + esc(sp.pos[over - 1]) : '') + '</div>';
        html += '</div>';
      });
    });
    return html + '</div>';
  }

  function allReady() {
    const n = spreadById(R.spread).pos.length;
    if (R.mode === 'fisica') return R.cards.filter(Boolean).length === n;
    return R.dealt && R.revealed.filter(Boolean).length === n;
  }

  function actionsHTML() {
    const sp = spreadById(R.spread);
    const n = sp.pos.length;
    let html = '';
    if (R.mode === 'fisica') {
      const k = R.cards.filter(Boolean).length;
      html += k < n ? '<p class="hint c">Toca cada hueco y elige la carta que te salió (' + k + '/' + n + ')</p>' : '';
    } else if (R.dealt && !allReady()) {
      html += '<p class="hint c">Toca cada carta para girarla</p>' +
        '<button class="btn ghost" data-a="revealAll">Revelar todas</button>';
    }
    if (allReady()) html += '<button class="btn primary big" data-a="reading">Ver lectura ✨</button>';
    return html + '<button class="btn link" data-a="back">← Cambiar tirada</button>';
  }

  function renderTable() {
    const sp = spreadById(R.spread);
    let body;
    if (R.mode === 'virtual' && !R.dealt) {
      body = '<div class="deck-wrap"><div class="deck' + (R.shuffling ? ' shuffling' : '') + '">' +
        '<div class="tcard"><div class="in"><div class="back"><span>✦</span></div></div></div>'.repeat(5) + '</div>' +
        '<button class="btn primary big" data-a="shuffle"' + (R.shuffling ? ' disabled' : '') + '>' +
        (R.shuffling ? 'Barajando…' : '🔀 Barajar y repartir') + '</button>' +
        '<p class="hint c">Piensa en tu pregunta mientras barajas</p></div>' +
        '<button class="btn link" data-a="back">← Cambiar tirada</button>';
    } else {
      body = gridHTML() + '<div id="actions" class="actions">' + actionsHTML() + '</div>';
    }
    return '<section class="page">' + qHeader(sp) + body + '</section>';
  }

  function qHeader(sp) {
    return '<header class="qh"><small>' + sp.emoji + ' ' + esc(sp.name) + '</small>' +
      (R.question ? '<h2>“' + esc(R.question) + '”</h2>' : '<h2>Lectura general</h2>') + '</header>';
  }

  /* lectura base (sin IA) */
  function baseReading() {
    const sp = spreadById(R.spread);
    const items = sp.pos.map((name, i) => {
      const c = R.cards[i], d = CARDS[c.id];
      return { pos: name, n: i + 1, card: d, rev: c.rev, text: c.rev ? d.rev : d.up, kw: c.rev ? d.kwRev : d.kwUp };
    });
    const n = items.length;
    const majors = items.filter(x => x.card.arcana === 'mayor').length;
    const revs = items.filter(x => x.rev).length;
    const suitCount = {};
    items.forEach(x => { if (x.card.suit) suitCount[x.card.suit] = (suitCount[x.card.suit] || 0) + 1; });
    const ranked = Object.keys(suitCount).sort((a, b) => suitCount[b] - suitCount[a]);
    const suitMsg = {
      bastos: 'dominan los Bastos 🔥: la clave está en la acción y la motivación',
      copas: 'dominan las Copas 🏆: lo emocional y los vínculos llevan la voz',
      espadas: 'dominan las Espadas ⚔️: pesan los pensamientos, las palabras y las decisiones',
      oros: 'dominan los Oros 🪙: el terreno material, el trabajo y el cuerpo tienen protagonismo'
    };
    const parts = [];
    if (n >= 3 && majors >= Math.ceil(n / 2)) parts.push('Predominan los Arcanos Mayores: es un tema de peso, con aprendizaje profundo detrás.');
    if (ranked.length && suitCount[ranked[0]] >= 2 && (ranked.length === 1 || suitCount[ranked[0]] > suitCount[ranked[1]])) {
      parts.push('En esta tirada ' + suitMsg[ranked[0]] + '.');
    }
    if (n >= 2 && revs >= Math.ceil(n / 2)) parts.push('Varias cartas salen invertidas: hay procesos internos o bloqueos que conviene revisar con calma.');
    else if (revs === 0 && n >= 3) parts.push('Todas las cartas salen derechas: la energía fluye con claridad.');
    if (!parts.length) parts.push('Las cartas se complementan entre sí: léelas como una pequeña historia, de la primera a la última.');
    parts.push('Recuerda: el tarot refleja posibilidades, no sentencias. Tú decides el siguiente paso. 🌿');
    return { items, summary: parts.join(' ') };
  }

  function renderReading() {
    const sp = spreadById(R.spread);
    const b = baseReading();
    const list = b.items.map(x =>
      '<article class="rd"><div class="rd-h"><i>' + x.n + '</i><div><small>' + esc(x.pos) + '</small>' +
      '<b>' + x.card.emoji + ' ' + esc(x.card.name) + '</b></div>' +
      (x.rev ? '<span class="tag">↺ Invertida</span>' : '') + '</div>' +
      '<p class="kw">' + esc(x.kw) + '</p><p>' + esc(x.text) + '</p></article>').join('');
    return '<section class="page">' + qHeader(sp) + gridHTML() +
      '<h3 class="sec">Lectura base</h3>' + list +
      '<article class="rd sum"><div class="rd-h"><div><small>Síntesis</small><b>🌙 Qué te cuentan juntas</b></div></div><p>' +
      (R.question ? 'Sobre tu pregunta, «' + esc(R.question) + '»: ' : '') + esc(b.summary) + '</p></article>' +
      '<h3 class="sec">Interpretación con IA</h3><div id="ai">' + aiHTML() + '</div>' +
      '<div class="actions"><button class="btn ghost" data-a="again">Nueva lectura</button></div></section>';
  }

  function fmt(text) {
    return esc(text).replace(/^#+\s*/gm, '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .split(/\n{2,}/).map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
  }

  function aiHTML() {
    if (R.aiState === 'loading') return '<div class="ai load"><div class="orb-s"></div><p>Las cartas se están alineando…</p></div>';
    if (R.aiState === 'done') return '<div class="ai">' + fmt(R.ai) + '</div><button class="btn link" data-a="ai">↻ Otra interpretación</button>';
    let html = '';
    if (R.aiState === 'error') html += '<p class="err">' + esc(R.aiError) + '</p>';
    if (!settings.apiKey) {
      html += '<div class="ai empty"><p>Conecta tu clave de Anthropic en Ajustes para recibir una interpretación personalizada con IA a partir de tu pregunta y tus cartas.</p>' +
        '<button class="btn primary" data-a="tab" data-tab="set">Ir a Ajustes ⚙️</button></div>';
    } else {
      html += '<button class="btn primary big" data-a="ai">✨ Interpretar con IA</button>';
    }
    return html;
  }

  function updateAI() { const el = $('#ai'); if (el) el.innerHTML = aiHTML(); }

  const SYSTEM = 'Eres una tarotista cálida, serena y respetuosa que escribe en español. Interpretas la tirada que recibes ' +
    'conectando cada carta con su posición y con la pregunta de la persona. Reglas: usa un tono empático y claro; ' +
    'no hagas predicciones absolutas ni afirmes certezas sobre el futuro; presenta el tarot como una herramienta de reflexión; ' +
    'no des diagnósticos médicos, legales ni financieros (si el tema los toca, recomienda con suavidad consultar a un profesional); ' +
    'si hay señales de crisis emocional, responde con cuidado y sugiere buscar apoyo. ' +
    'Formato: una breve introducción, una interpretación de cada carta (en negrita el nombre y la posición), ' +
    'una síntesis que una las cartas y un consejo práctico final. Máximo unas 350 palabras y algunos emojis sutiles.';

  function aiInterpret() {
    if (!settings.apiKey) { toast('Añade tu clave en Ajustes'); return; }
    const sp = spreadById(R.spread);
    const lines = sp.pos.map((name, i) => {
      const c = R.cards[i], d = CARDS[c.id];
      return (i + 1) + '. ' + name + ': ' + d.name + (c.rev ? ' (invertida)' : '') + ' — ' + (c.rev ? d.kwRev : d.kwUp);
    });
    const user = 'Pregunta: ' + (R.question || '(sin pregunta concreta; lectura general)') + '\nTirada: ' + sp.name + '\nCartas:\n' + lines.join('\n');
    R.aiState = 'loading'; updateAI();
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({ model: settings.model || 'claude-sonnet-5-5', max_tokens: 1200, system: SYSTEM, messages: [{ role: 'user', content: user }] })
    }).then(r => r.json().then(j => ({ ok: r.ok, status: r.status, j }))).then(res => {
      if (!res.ok) {
        const m = res.j && res.j.error && res.j.error.message ? res.j.error.message : 'Error ' + res.status;
        throw new Error(res.status === 401 ? 'La clave no es válida. Revísala en Ajustes.' : m);
      }
      const text = (res.j.content || []).map(b => b.text || '').join('\n').trim();
      if (!text) throw new Error('La IA no devolvió texto. Inténtalo de nuevo.');
      R.ai = text; R.aiState = 'done'; updateAI();
    }).catch(err => {
      R.aiState = 'error';
      R.aiError = err instanceof TypeError ? 'No se pudo conectar con la IA. Revisa tu conexión.' : err.message;
      updateAI();
    });
  }

  /* ---------- modales ---------- */
  function openModal(html, cls) {
    const m = $('#modal');
    m.innerHTML = '<div class="backdrop" data-a="close"></div><div class="sheet ' + (cls || '') + '" role="dialog" aria-modal="true">' +
      '<button class="x" data-a="close" aria-label="Cerrar">✕</button>' + html + '</div>';
    m.hidden = false;
    document.body.classList.add('noscroll');
  }
  function closeModal() {
    $('#modal').hidden = true;
    $('#modal').innerHTML = '';
    if ($('#overlay').hidden) document.body.classList.remove('noscroll');
  }

  function detailModal(c, pos) {
    const d = CARDS[c.id];
    openModal('<div class="det">' + tcard(c, { flipped: true, cls: 'big' }) +
      '<div class="det-t">' + (pos ? '<small>' + esc(pos) + '</small>' : '') + '<h3>' + d.emoji + ' ' + esc(d.name) + '</h3>' +
      (c.rev ? '<span class="tag">↺ Invertida</span>' : '') +
      '<p class="kw">' + esc(c.rev ? d.kwRev : d.kwUp) + '</p><p>' + esc(c.rev ? d.rev : d.up) + '</p>' +
      '<details><summary>Ver el significado ' + (c.rev ? 'derecho' : 'invertido') + '</summary><p class="kw">' + esc(c.rev ? d.kwUp : d.kwRev) + '</p><p>' + esc(c.rev ? d.up : d.rev) + '</p></details></div></div>');
  }

  const pk = { slot: -1, q: '', f: 'all', rev: false };
  function pickerList() {
    const q = norm(pk.q.trim());
    return CARDS.filter(c => {
      if (pk.f === 'mayor' && c.arcana !== 'mayor') return false;
      if (pk.f !== 'all' && pk.f !== 'mayor' && c.suit !== pk.f) return false;
      return !q || norm(c.name).includes(q);
    }).map(c => '<button class="pk" data-a="choose" data-id="' + c.id + '"><span>' + c.emoji + '</span>' + esc(c.name) + '</button>').join('') ||
      '<p class="hint c">Sin resultados</p>';
  }
  function pickerModal(slot) {
    pk.slot = slot; pk.q = ''; pk.f = 'all'; pk.rev = false;
    const sp = spreadById(R.spread);
    const filters = [['all', 'Todas'], ['mayor', '🌟 Mayores']].concat(SUITS.map(s => [s.id, s.emoji + ' ' + s.name]));
    openModal('<h3>Carta ' + (slot + 1) + ' · ' + esc(sp.pos[slot]) + '</h3>' +
      '<input id="pkq" type="search" placeholder="Buscar carta…" autocomplete="off">' +
      '<div class="chips" id="pkf">' + filters.map(f => '<button data-a="pkfilter" data-v="' + f[0] + '" class="' + (f[0] === 'all' ? 'on' : '') + '">' + f[1] + '</button>').join('') + '</div>' +
      '<label class="toggle"><input type="checkbox" id="pkrev"><span>↺ Salió invertida</span></label>' +
      '<div class="pklist" id="pklist">' + pickerList() + '</div>', 'tall');
  }

  /* ---------- vista: Academia ---------- */
  const ALL = [];
  UNITS.forEach(u => u.lessons.forEach(l => ALL.push({ unit: u, lesson: l })));
  const isDone = id => !!progress.done[id];
  function currentIndex() {
    const i = ALL.findIndex(x => !isDone(x.lesson.id));
    return i === -1 ? ALL.length : i;
  }
  function streakNow() {
    return progress.last === dayKey(0) || progress.last === dayKey(-1) ? progress.streak : 0;
  }

  function renderAcad() {
    const cur = currentIndex();
    const total = ALL.length;
    const doneN = ALL.filter(x => isDone(x.lesson.id)).length;
    let html = '<section class="page"><header class="stats">' +
      '<div><b>🔥 ' + streakNow() + '</b><small>racha</small></div>' +
      '<div><b>✨ ' + progress.xp + '</b><small>XP</small></div>' +
      '<div><b>📚 ' + doneN + '/' + total + '</b><small>lecciones</small></div></header>' +
      '<div class="bar"><i style="width:' + Math.round(doneN / total * 100) + '%"></i></div>';
    const off = [0, 38, 58, 38, 0, -38, -58, -38];
    let gi = 0;
    UNITS.forEach(u => {
      html += '<div class="unit"><div class="ub"><span>' + u.emoji + '</span><div><b>' + esc(u.title) + '</b><small>' + esc(u.sub) + '</small></div></div><div class="path">';
      u.lessons.forEach((l, li) => {
        const state = isDone(l.id) ? 'done' : (gi === cur ? 'cur' : (gi < cur ? 'done' : 'lock'));
        html += '<button class="node ' + state + '" style="transform:translateX(' + off[li % off.length] + 'px)" data-a="lesson" data-id="' + l.id + '" ' +
          (state === 'lock' ? 'aria-disabled="true"' : '') + '><span class="ic">' + (state === 'lock' ? '🔒' : l.emoji) + '</span>' +
          (state === 'done' ? '<i class="ck">✓</i>' : '') + '<em>' + esc(l.title) + '</em></button>';
        gi++;
      });
      html += '</div></div>';
    });
    if (cur === ALL.length) html += '<p class="hint c">🎉 ¡Has completado toda la academia! Pronto habrá más.</p>';
    return html + '</section>';
  }

  /* animaciones de la academia */
  let cleanups = [];
  function clearAnims() { cleanups.forEach(f => f()); cleanups = []; }

  function animHTML(name) {
    switch (name) {
      case 'stars': {
        let s = '';
        for (let i = 0; i < 16; i++) {
          s += '<i style="left:' + ((i * 37) % 92 + 3) + '%;top:' + ((i * 53) % 80 + 6) + '%;animation-delay:' + ((i % 7) * 0.4) + 's;font-size:' + (10 + (i % 4) * 5) + 'px">✦</i>';
        }
        return '<div class="anim stars">' + s + '<b class="moon-c">🌙</b></div>';
      }
      case 'cards':
        return '<div class="anim fan"><div class="mc c1">🌙</div><div class="mc c2">☀️</div><div class="mc c3">⭐</div></div>';
      case 'elements':
        return '<div class="anim els"><div class="el fire"><b>🔥</b><small>Fuego</small></div><div class="el water"><b>💧</b><small>Agua</small></div>' +
          '<div class="el air"><b>🌬️</b><small>Aire</small></div><div class="el earth"><b>🌍</b><small>Tierra</small></div></div>';
      case 'fool':
        return '<div class="anim fool"><div class="road"></div><span class="walker">🃏</span><span class="goal">🌍</span>' +
          '<div class="stops"><i>🪄</i><i>🌙</i><i>💞</i><i>🎡</i><i>🦋</i><i>⚡</i><i>⭐</i><i>☀️</i></div></div>';
      case 'breath':
        return '<div class="anim breath"><div class="orb"></div><div class="bt">Prepárate</div></div>';
      case 'moon':
        return '<div class="anim moon"><div class="mbig">🌑</div><div class="mname">Luna nueva</div><div class="mring">' +
          ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'].map(m => '<span>' + m + '</span>').join('') + '</div></div>';
      case 'chakra': {
        const cs = [['#e5484d', 'Raíz'], ['#f76b15', 'Sacro'], ['#f5c542', 'Plexo solar'], ['#30a46c', 'Corazón'], ['#3b82f6', 'Garganta'], ['#6e56cf', 'Tercer ojo'], ['#d9c8ff', 'Corona']].reverse();
        return '<div class="anim chakra">' + cs.map((c, i) => '<div class="ck" style="--c:' + c[0] + ';--d:' + ((6 - i) * 0.35) + 's"><i></i><span>' + c[1] + '</span></div>').join('') + '</div>';
      }
      case 'numbers':
        return '<div class="anim nums"><p style="--d:0s">1+4+0+3+1+9+9+0</p><p style="--d:.9s">= 27</p><p style="--d:1.8s">2 + 7</p><p class="big" style="--d:2.7s">9 ✨</p></div>';
      case 'candle':
        return '<div class="anim candle"><div class="glow"></div><span class="flame">🕯️</span><i class="sp s1">✦</i><i class="sp s2">✦</i><i class="sp s3">✦</i></div>';
      case 'crystals':
        return '<div class="anim gems"><span style="--d:0s">🤍</span><span style="--d:.3s">🟣</span><span style="--d:.6s">🌸</span><span style="--d:.9s">🟡</span><span style="--d:1.2s">⚫</span></div>';
      case 'zodiac': {
        const z = '♈♉♊♋♌♍♎♏♐♑♒♓'.split('');
        return '<div class="anim zod"><div class="wheel">' + z.map((s, i) => '<span style="transform:rotate(' + (i * 30) + 'deg) translateY(-72px) rotate(' + (-i * 30) + 'deg)">' + s + '</span>').join('') +
          '</div><b class="sun">☀️</b></div>';
      }
      case 'shuffle':
        return '<div class="anim shuf"><div class="sc a"></div><div class="sc b"></div><div class="sc c"></div><b>✦</b></div>';
      default:
        return '';
    }
  }

  function initAnim(root) {
    const br = $('.breath', root);
    if (br) {
      const orb = $('.orb', br), bt = $('.bt', br);
      let alive = true; const timers = [];
      const at = (ms, fn) => timers.push(setTimeout(() => alive && fn(), ms));
      const cycle = () => {
        bt.textContent = 'Inhala…'; orb.style.transition = 'transform 4s ease-in-out'; orb.style.transform = 'scale(1.35)';
        at(4000, () => { bt.textContent = 'Sostén'; });
        at(8000, () => { bt.textContent = 'Exhala…'; orb.style.transition = 'transform 6s ease-in-out'; orb.style.transform = 'scale(.7)'; });
        at(14000, cycle);
      };
      orb.style.transform = 'scale(.7)';
      at(600, cycle);
      cleanups.push(() => { alive = false; timers.forEach(clearTimeout); });
    }
    const mo = $('.moon', root);
    if (mo) {
      const ph = [['🌑', 'Luna nueva'], ['🌒', 'Creciente'], ['🌓', 'Cuarto creciente'], ['🌔', 'Gibosa creciente'], ['🌕', 'Luna llena'], ['🌖', 'Gibosa menguante'], ['🌗', 'Cuarto menguante'], ['🌘', 'Menguante']];
      const spans = $$('.mring span', mo);
      let i = 0;
      const tick = () => {
        $('.mbig', mo).textContent = ph[i][0];
        $('.mname', mo).textContent = ph[i][1];
        spans.forEach((s, k) => s.classList.toggle('on', k === i));
        i = (i + 1) % ph.length;
      };
      tick();
      const iv = setInterval(tick, 1300);
      cleanups.push(() => clearInterval(iv));
    }
  }

  /* reproductor de lecciones */
  let A = null;
  function shuffled(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function startLesson(id) {
    const idx = ALL.findIndex(x => x.lesson.id === id);
    if (idx === -1) return;
    if (idx > currentIndex()) { toast('Completa antes la lección anterior 🔒'); return; }
    A = { lesson: ALL[idx].lesson, i: 0, sel: -1, checked: false, right: false, tries: 0, firstTry: 0, quizzes: 0, order: null, finished: false };
    enterStep();
    const ov = $('#overlay');
    ov.hidden = false;
    document.body.classList.add('noscroll');
    renderPlayer();
  }
  function enterStep() {
    const st = A.lesson.steps[A.i];
    A.sel = -1; A.checked = false; A.right = false; A.tries = 0;
    A.order = st && st.t === 'quiz' ? shuffled(st.opts.length) : null;
  }
  function closeLesson() {
    clearAnims();
    A = null;
    $('#overlay').hidden = true;
    $('#overlay').innerHTML = '';
    if ($('#modal').hidden) document.body.classList.remove('noscroll');
    render();
  }

  function renderPlayer() {
    clearAnims();
    const ov = $('#overlay');
    const L = A.lesson;
    if (A.finished) {
      const gain = 10 + A.firstTry * 5;
      let conf = '';
      for (let i = 0; i < 18; i++) conf += '<i style="left:' + ((i * 29) % 100) + '%;animation-delay:' + ((i % 9) * 0.25) + 's">' + ['✨', '⭐', '🌙', '💫'][i % 4] + '</i>';
      ov.innerHTML = '<div class="player done"><div class="confetti">' + conf + '</div><div class="pbody c">' +
        '<div class="trophy">' + L.emoji + '</div><h2>¡Lección completada!</h2><p>' + esc(L.title) + '</p>' +
        '<div class="gain"><b>+' + gain + ' XP</b><small>🔥 Racha: ' + progress.streak + (progress.streak === 1 ? ' día' : ' días') + '</small></div></div>' +
        '<div class="pfoot"><button class="btn primary big" data-a="closeLesson">Continuar</button></div></div>';
      return;
    }
    const st = L.steps[A.i];
    const pct = Math.round(A.i / L.steps.length * 100);
    let body, foot;
    if (st.t === 'learn') {
      body = '<h2>' + esc(st.title) + '</h2>' + animHTML(st.anim) + '<p class="lead">' + st.body + '</p>';
      foot = '<button class="btn primary big" data-a="next">Continuar</button>';
    } else {
      body = '<h2>' + esc(st.q) + '</h2><div class="opts">' + A.order.map(oi => {
        let cls = 'opt';
        if (A.sel === oi) cls += ' sel';
        if (A.checked && A.sel === oi) cls += A.right ? ' ok' : ' bad';
        return '<button class="' + cls + '" data-a="opt" data-i="' + oi + '"' + (A.checked && A.right ? ' disabled' : '') + '>' + esc(st.opts[oi]) + '</button>';
      }).join('') + '</div>';
      if (!A.checked) foot = '<button class="btn primary big" data-a="check"' + (A.sel < 0 ? ' disabled' : '') + '>Comprobar</button>';
      else if (A.right) foot = '<div class="fb ok"><b>¡Correcto! ✨</b><span>' + esc(st.why || '') + '</span></div><button class="btn primary big" data-a="next">Continuar</button>';
      else foot = '<div class="fb bad"><b>Casi… 🌙</b><span>Inténtalo de nuevo.</span></div><button class="btn primary big" data-a="retry">Reintentar</button>';
    }
    ov.innerHTML = '<div class="player"><div class="ptop"><button class="x2" data-a="closeLesson" aria-label="Salir">✕</button>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div></div><div class="pbody">' + body + '</div><div class="pfoot">' + foot + '</div></div>';
    initAnim(ov);
  }

  function finishLesson() {
    const L = A.lesson;
    const first = !isDone(L.id);
    A.finished = true;
    if (first) {
      progress.xp += 10 + A.firstTry * 5;
      progress.done[L.id] = true;
      if (progress.last !== dayKey(0)) {
        progress.streak = progress.last === dayKey(-1) ? progress.streak + 1 : 1;
        progress.last = dayKey(0);
      }
      saveProgress();
    }
    renderPlayer();
  }

  /* ---------- vista: Ajustes ---------- */
  function renderSettings() {
    return '<section class="page"><header class="hero"><h1>Ajustes <span>⚙️</span></h1></header>' +
      '<div class="panel"><div class="lbl">Interpretación con IA</div>' +
      '<p class="hint">Pega tu clave de la API de Anthropic para que la app interprete tus tiradas. Se guarda <b>solo en este navegador</b> y se envía únicamente a Anthropic cuando pides una interpretación.</p>' +
      '<input id="apikey" type="password" placeholder="sk-ant-…" autocomplete="off" spellcheck="false" value="' + esc(settings.apiKey) + '">' +
      '<div class="lbl">Modelo</div><input id="model" type="text" value="' + esc(settings.model) + '" spellcheck="false">' +
      '<label class="toggle"><input type="checkbox" id="rev"' + (settings.reversed ? ' checked' : '') + '><span>↺ Permitir cartas invertidas</span></label>' +
      '<button class="btn ghost" data-a="clearKey">Borrar clave</button></div>' +
      '<div class="panel"><div class="lbl">Academia</div><button class="btn ghost" data-a="resetProgress">Reiniciar progreso</button></div>' +
      '<p class="fine">Arcana es una herramienta de reflexión y entretenimiento. Las lecturas no predicen el futuro ni sustituyen el consejo de profesionales de la salud, el derecho o las finanzas.</p></section>';
  }

  /* ---------- render principal ---------- */
  function render(keepScroll) {
    const v = $('#view');
    if (tab === 'read') {
      v.innerHTML = R.stage === 'setup' ? renderSetup() : R.stage === 'table' ? renderTable() : renderReading();
    } else if (tab === 'acad') {
      v.innerHTML = renderAcad();
    } else {
      v.innerHTML = renderSettings();
    }
    $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    if (keepScroll !== true) window.scrollTo(0, 0);
  }

  function refreshActions() { const a = $('#actions'); if (a) a.innerHTML = actionsHTML(); }

  /* ---------- acciones ---------- */
  const ACTIONS = {
    tab(el) { tab = el.dataset.tab; closeModal(); render(); },
    mode(el) { R.mode = el.dataset.v; render(); },
    spread(el) { R.spread = el.dataset.v; render(); },
    cod() { const c = cardOfDay(); detailModal({ id: c.id, rev: false }, 'Carta del día'); },
    start() {
      const n = spreadById(R.spread).pos.length;
      R.stage = 'table'; R.dealt = false; R.shuffling = false;
      R.cards = R.mode === 'fisica' ? new Array(n).fill(null) : [];
      R.revealed = new Array(n).fill(false);
      R.ai = ''; R.aiState = 'idle';
      render();
    },
    back() { R.stage = 'setup'; render(); },
    shuffle() {
      if (R.shuffling) return;
      R.shuffling = true;
      const d = $('.deck'); if (d) d.classList.add('shuffling');
      const b = $('[data-a=shuffle]'); if (b) { b.disabled = true; b.textContent = 'Barajando…'; }
      const n = spreadById(R.spread).pos.length;
      setTimeout(() => {
        const deck = CARDS.map(c => c.id);
        for (let i = deck.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
        R.cards = deck.slice(0, n).map(id => ({ id, rev: settings.reversed && rnd(100) < 30 }));
        R.revealed = new Array(n).fill(false);
        R.dealt = true; R.shuffling = false;
        render();
      }, 1400);
    },
    flip(el) {
      const p = Number(el.dataset.p);
      if (R.revealed[p]) return;
      R.revealed[p] = true;
      el.classList.add('flipped');
      el.dataset.a = 'detail';
      refreshActions();
    },
    revealAll() {
      $$('.grid .tcard').forEach((c, i) => setTimeout(() => { c.classList.add('flipped'); c.dataset.a = 'detail'; }, i * 140));
      R.revealed = R.revealed.map(() => true);
      refreshActions();
    },
    pick(el) { pickerModal(Number(el.dataset.p)); },
    pkfilter(el) {
      pk.f = el.dataset.v;
      $$('#pkf button').forEach(b => b.classList.toggle('on', b === el));
      $('#pklist').innerHTML = pickerList();
    },
    choose(el) {
      R.cards[pk.slot] = { id: Number(el.dataset.id), rev: settings.reversed && pk.rev };
      closeModal();
      render(true);
    },
    reading() { R.stage = 'reading'; render(); },
    detail(el) {
      const p = Number(el.dataset.p);
      if (R.cards[p]) detailModal(R.cards[p], spreadById(R.spread).pos[p]);
    },
    ai() { aiInterpret(); },
    again() { R = freshRead(R); render(); },
    close() { closeModal(); },
    lesson(el) { startLesson(el.dataset.id); },
    closeLesson() { closeLesson(); },
    opt(el) {
      if (A.checked && A.right) return;
      A.sel = Number(el.dataset.i); A.checked = false;
      renderPlayer();
    },
    check() {
      const st = A.lesson.steps[A.i];
      A.checked = true; A.right = A.sel === st.a;
      if (A.right && A.tries === 0) A.firstTry++;
      renderPlayer();
    },
    retry() { A.tries++; A.sel = -1; A.checked = false; renderPlayer(); },
    next() {
      A.i++;
      if (A.i >= A.lesson.steps.length) { finishLesson(); return; }
      enterStep();
      renderPlayer();
    },
    clearKey() { settings.apiKey = ''; saveSettings(); render(); toast('Clave borrada'); },
    resetProgress() {
      if (!confirm('¿Reiniciar todo tu progreso en la academia?')) return;
      progress.xp = 0; progress.streak = 0; progress.last = ''; progress.done = {};
      saveProgress(); toast('Progreso reiniciado'); render();
    }
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-a]');
    if (!el || el.disabled) return;
    const fn = ACTIONS[el.dataset.a];
    if (fn) fn(el, e);
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'q') R.question = t.value;
    else if (t.id === 'pkq') { pk.q = t.value; $('#pklist').innerHTML = pickerList(); }
    else if (t.id === 'apikey') { settings.apiKey = t.value.trim(); saveSettings(); }
    else if (t.id === 'model') { settings.model = t.value.trim(); saveSettings(); }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'pkrev') pk.rev = t.checked;
    else if (t.id === 'rev') { settings.reversed = t.checked; saveSettings(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('#modal').hidden) closeModal();
      else if (!$('#overlay').hidden) closeLesson();
    }
  });

  render();
})();
