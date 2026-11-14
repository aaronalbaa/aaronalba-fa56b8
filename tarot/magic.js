/* Magia: rituales guiados, forja de rituales, sigilos de magia del caos. (Geometría y sonido: sacred.js) */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, P = ARC.profile, A = ARC.act, RD = window.RITUALS;
  var M = ARC.store.get('arcana.magic', { custom: [], sigils: [], log: [] });
  M.custom = M.custom || []; M.sigils = M.sigils || []; M.log = M.log || [];
  function save() { M.rev = Date.now(); ARC.store.set('arcana.magic', M); }
  ARC.magic = { data: function () { return M; }, save: save };
  var MG = { cat: 'todas', sig: { text: '', method: 'circle', kamea: 3, noVowels: false, showLetters: false, made: false } };
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function allRituals() { return RD.list.concat(M.custom); }
  function ritual(id) { return allRituals().filter(function (r) { return r.id === id; })[0]; }

  /* ---------- Rituales ---------- */
  function moonSuggest() {
    var mi = ASTRO.moonInfo(new Date()), p = mi.phase, id = p < 0.06 || p > 0.94 ? 'luna-nueva' : p < 0.44 ? 'luna-creciente' : p < 0.56 ? 'luna-llena' : 'luna-menguante';
    return { mi: mi, r: ritual(id) };
  }
  function ritualsHTML() {
    var s = moonSuggest(), cats = [['todas', '✨', 'Todos']].concat(RD.cats);
    var list = allRituals().filter(function (r) { return MG.cat === 'todas' || r.cat === MG.cat; });
    var h = '<button class="grow card" data-a="ritOpen" data-id="' + s.r.id + '"><span class="gi">' + s.mi.emoji + '</span><div><small>Esta noche · ' + esc(s.mi.name) + '</small><b>' + esc(s.r.n) + '</b><small>' + esc(s.r.intent) + '</small></div><i class="chev">›</i></button>';
    h += '<div class="chips sub2">' + cats.map(function (c) { return '<button data-a="ritCat" data-v="' + c[0] + '" class="' + (MG.cat === c[0] ? 'on' : '') + '">' + c[1] + ' ' + c[2] + '</button>'; }).join('') + '</div>';
    h += '<div class="group">' + list.map(function (r) { return '<button class="grow" data-a="ritOpen" data-id="' + r.id + '"><span class="gi">' + r.e + '</span><div><b>' + esc(r.n) + '</b><small>' + esc(r.intent) + ' · ' + r.mins + ' min</small></div>' + (M.log.some(function (l) { return l.id === r.id; }) ? '<span class="chk done2">✓</span>' : '<i class="chev">›</i>') + '</button>'; }).join('') + '</div>';
    h += '<button class="btn primary big" data-a="forgeOpen">⚒️ Forjar mi propio ritual</button><p class="fine">Los rituales son prácticas simbólicas de introspección: ordenan tu atención y tus emociones, no alteran la realidad. Ninguno busca dañar ni controlar a nadie.</p>';
    return h;
  }
  A.ritCat = function (el) { MG.cat = el.dataset.v; ARC.render(true); };
  A.ritOpen = function (el) {
    var r = ritual(el.dataset.id); if (!r) return; var done = M.log.filter(function (l) { return l.id === r.id; }).length;
    ARC.openModal('<div class="det"><div class="bigemo">' + r.e + '</div><h3>' + esc(r.n) + '</h3><p class="hint c">' + esc(r.intent) + '</p><div class="gfacts"><div><small>Cuándo</small><b>' + esc(r.when) + '</b></div><div><small>Duración</small><b>~' + r.mins + ' min</b></div></div><div class="lbl">Necesitarás</div><p>' + r.mats.map(esc).join(' · ') + '</p><div class="lbl">Pasos</div><ol class="steps">' + r.steps.map(function (s) { return '<li>' + esc(s.t) + '</li>'; }).join('') + '</ol>' + (r.close ? '<p class="hint">' + esc(r.close) + '</p>' : '') + (done ? '<p class="hint c">Lo has realizado ' + done + (done === 1 ? ' vez' : ' veces') + '</p>' : '') + '<button class="btn primary big" data-a="ritStart" data-id="' + r.id + '">Comenzar</button>' + (r.custom ? '<button class="btn ghost danger" data-a="ritDel" data-id="' + r.id + '">Eliminar</button>' : '') + '</div>');
  };
  A.ritDel = function (el) { M.custom = M.custom.filter(function (r) { return r.id !== el.dataset.id; }); save(); ARC.closeModal(); ARC.render(true); };

  /* ---------- Ejecutor a pantalla completa ---------- */
  var RN = null, rt = null;
  function runner(r, opts) {
    ARC.closeModal(); clearInterval(rt); RN = { r: r, i: 0, left: 0, opts: opts || {}, ref: '' };
    var d = $('#ritual'); if (!d) { d = document.createElement('div'); d.id = 'ritual'; document.body.appendChild(d); }
    document.body.classList.add('noscroll'); draw();
  }
  function draw() {
    var d = $('#ritual'); if (!d || !RN) return; var r = RN.r, n = r.steps.length, i = RN.i;
    var dots = '<div class="rdots">' + r.steps.map(function (s, k) { return '<i class="' + (k < i ? 'done' : k === i ? 'on' : '') + '"></i>'; }).join('') + '</div>';
    if (i >= n) {
      d.innerHTML = '<div class="rit-in"><button class="rx" data-a="ritExit">✕</button><div class="bigemo">✨</div><h2>Ritual completado</h2><p class="lead">' + esc(r.close || 'Respira y agradece este momento.') + '</p><div class="lbl">Reflexión</div><p class="hint c">' + esc(r.reflect || '¿Cómo te sientes ahora?') + '</p><textarea id="rit_ref" rows="4" placeholder="Escribe lo que quieras recordar…"></textarea><button class="btn primary big" data-a="ritFinish">Guardar en mi diario</button><button class="btn link" data-a="ritExit">Cerrar sin guardar</button></div>';
      return;
    }
    var s = r.steps[i];
    d.innerHTML = '<div class="rit-in"><button class="rx" data-a="ritExit">✕</button>' + dots + '<small class="kw">' + esc(r.n) + ' · paso ' + (i + 1) + ' de ' + n + '</small>' + (RN.opts.svg && i === 0 ? '<div class="rsig">' + RN.opts.svg + '</div>' : '') + '<div class="rorb' + (s.s ? ' on' : '') + '"><b id="rleft">' + (s.s ? s.s : '✦') + '</b></div><h2>' + esc(s.t) + '</h2><p class="lead">' + esc(s.x) + '</p>' + (s.s ? '<p class="hint c" id="rhint">Respira con calma…</p>' : '') + '<div class="row2">' + (i > 0 ? '<button class="btn ghost" data-a="ritPrev">←</button>' : '') + '<button class="btn primary big" data-a="ritNext">' + (i === n - 1 ? 'Terminar' : 'Siguiente') + '</button></div></div>';
    clearInterval(rt);
    if (s.s) { RN.left = s.s; rt = setInterval(function () { RN.left--; var e = $('#rleft'); if (!e) { clearInterval(rt); return; } e.textContent = Math.max(RN.left, 0); if (RN.left <= 0) { clearInterval(rt); var h = $('#rhint'); if (h) h.textContent = 'Cuando estés lista/o, continúa.'; } }, 1000); }
  }
  A.ritStart = function (el) { var r = ritual(el.dataset.id); if (r) runner(r); };
  A.ritNext = function () { RN.i++; draw(); };
  A.ritPrev = function () { RN.i = Math.max(0, RN.i - 1); draw(); };
  A.ritExit = function () { clearInterval(rt); var d = $('#ritual'); if (d) d.remove(); document.body.classList.remove('noscroll'); RN = null; ARC.render(true); };
  A.ritFinish = function () {
    var note = ($('#rit_ref').value || '').trim(), r = RN.r;
    ARC.journal.unshift({ id: Date.now(), ts: Date.now(), type: 'reflexion', title: 'Ritual · ' + r.n, question: r.reflect || '', items: r.steps.map(function (s) { return s.t; }), note: note }); ARC.save('journal');
    M.log.unshift({ id: r.id, ts: Date.now() }); M.log = M.log.slice(0, 300); save(); ARC.progress.xp += 8; ARC.save('progress'); if (ARC.mission) ARC.mission('reflexion');
    ARC.toast('Ritual guardado en tu diario 📓'); A.ritExit();
  };

  /* ---------- Forja de rituales ---------- */
  var INT = {
    claridad: ['🔍', 'Claridad', 'Veo con calma lo que necesito ver', 'Escribe tres preguntas que te rondan. Subraya la que de verdad importa y escribe debajo la primera respuesta que aparezca, sin corregirla.', 'creciente o llena'],
    proteccion: ['🛡️', 'Seguridad y protección', 'Estoy a salvo y pongo límites con serenidad', 'Escribe tres límites que quieres sostener y, junto a cada uno, una frase para decirlo con amabilidad.', 'cualquier fase'],
    amor: ['💗', 'Amor propio', 'Merezco cuidado y lo empiezo por mí', 'Escribe una carta corta a ti misma/o con tres cosas que valoras de tu forma de ser.', 'cualquier fase'],
    abundancia: ['🌾', 'Abundancia y prosperidad', 'Reconozco y cultivo lo que ya tengo', 'Anota tres recursos que ya tienes (tiempo, habilidades, personas) y un paso concreto para usar uno esta semana.', 'creciente'],
    soltar: ['🍂', 'Soltar', 'Libero lo que ya no me sirve', 'Escribe lo que sueltas en un papel, léelo y rómpelo en trozos pequeños con tranquilidad.', 'menguante'],
    valentia: ['🦁', 'Valentía', 'Doy el paso aunque tenga miedo', 'Escribe el paso que temes y divídelo en tres micro-pasos; marca ya el primero con fecha.', 'creciente'],
    calma: ['🌊', 'Calma', 'Mi respiración me devuelve a mí', 'Haz tres rondas de respiración 4-6 y escribe cómo cambia tu cuerpo en cada una.', 'menguante o cualquiera'],
    creatividad: ['🎨', 'Creatividad', 'Dejo fluir lo que quiere nacer', 'Durante cinco minutos escribe o dibuja sin parar y sin juzgar; luego subraya lo que te sorprenda.', 'creciente'],
    gratitud: ['🙏', 'Gratitud', 'Veo lo bueno que ya está aquí', 'Escribe siete gratitudes, una por cada día de la semana pasada.', 'llena'],
    duelo: ['🕊️', 'Duelo y cierre', 'Honro lo que fue y me permito sentir', 'Escribe lo que querrías decir y no dijiste. Después elige guardarlo o romperlo con cuidado.', 'menguante']
  };
  var ELE = {
    fuego: ['🔥', 'Fuego', 'transformación y voluntad', 'Enciende una vela (con seguridad) y mira la llama unos instantes. Di: «Que mi voluntad sea clara y amable».'],
    agua: ['💧', 'Agua', 'emociones e intuición', 'Llena un vaso de agua, sostenlo con ambas manos y siente su peso. Di: «Que mis emociones fluyan sin ahogarme».'],
    aire: ['🌬️', 'Aire', 'mente y palabra', 'Abre una ventana, inhala hondo y exhala largo. Di: «Que mis pensamientos sean ligeros y claros».'],
    tierra: ['🌍', 'Tierra', 'cuerpo y estabilidad', 'Apoya los pies o las manos en el suelo o sostén una piedra. Di: «Que mi cuerpo me sostenga con firmeza».'],
    eter: ['✨', 'Éter', 'espíritu y silencio', 'Haz una pausa de silencio y mira hacia arriba. Di: «Estoy conectada/o con algo más grande que mis preocupaciones».']
  };
  var FORGE = { i: 'claridad', e: 'agua', m: 15, t: '' };
  A.forgeOpen = function () { renderForge(); };
  function renderForge() {
    ARC.openModal('<h3>⚒️ Forja tu ritual</h3><div class="lbl">Intención</div><div class="chips wrap">' + Object.keys(INT).map(function (k) { return '<button data-a="forgeSet" data-f="i" data-v="' + k + '" class="' + (FORGE.i === k ? 'on' : '') + '">' + INT[k][0] + ' ' + INT[k][1] + '</button>'; }).join('') + '</div><div class="lbl">Elemento</div><div class="chips">' + Object.keys(ELE).map(function (k) { return '<button data-a="forgeSet" data-f="e" data-v="' + k + '" class="' + (FORGE.e === k ? 'on' : '') + '">' + ELE[k][0] + ' ' + ELE[k][1] + '</button>'; }).join('') + '</div><div class="lbl">Duración</div><div class="chips">' + [5, 15, 30].map(function (m) { return '<button data-a="forgeSet" data-f="m" data-v="' + m + '" class="' + (FORGE.m === m ? 'on' : '') + '">' + m + ' min</button>'; }).join('') + '</div><div class="lbl">Con tus palabras (opcional)</div><input id="forge_t" placeholder="Ej.: antes de mi entrevista del jueves" value="' + esc(FORGE.t) + '"><button class="btn primary big" data-a="forgeGo">Crear ritual</button><button class="btn ghost big" data-a="forgeAI">✨ Que Sibila lo escriba para mí</button><p class="hint c">Mejor fase lunar para «' + INT[FORGE.i][1] + '»: <b>' + INT[FORGE.i][4] + '</b>.</p>');
  }
  A.forgeSet = function (el) { var f = el.dataset.f; FORGE.t = ($('#forge_t') || {}).value || FORGE.t; FORGE[f] = f === 'm' ? Number(el.dataset.v) : el.dataset.v; renderForge(); };
  function compose() {
    var it = INT[FORGE.i], el = ELE[FORGE.e], m = FORGE.m, ctx = FORGE.t ? ' Piensa en: ' + FORGE.t + '.' : '', st = [];
    st.push(['Prepara el espacio', 'Silencia el móvil, baja la luz y reúne lo que vayas a usar. Siéntate con la espalda cómoda.' + (FORGE.e === 'fuego' ? ' ' + RD.safe : '')]);
    st.push(['Centra tu respiración', 'Inhala contando cuatro y exhala contando seis, soltando los hombros.', m >= 15 ? 60 : 30]);
    st.push(['Invoca el elemento ' + el[1].toLowerCase(), 'Hoy trabajas con el elemento de ' + el[2] + '. ' + el[3]]);
    st.push(['Declara tu intención', 'Pronuncia, despacio y en presente: «' + it[2] + '».' + ctx]);
    if (m >= 15) st.push(['Acción simbólica', it[3]]);
    if (m >= 15) st.push(['Silencio y visualización', 'Cierra los ojos e imagínate dentro de una semana, habiendo vivido esta intención con naturalidad. Fíjate en los detalles.', m >= 30 ? 180 : 60]);
    if (m >= 30) st.push(['Escritura libre', 'Escribe durante cinco minutos todo lo que haya surgido, sin releer.', 300]);
    if (m >= 30) st.push(['Compromiso concreto', 'Elige una acción pequeña para las próximas 48 horas y anótala con día y hora.']);
    st.push(['Gratitud y cierre', 'Agradece al elemento y a ti misma/o. Apaga luces o velas con cuidado y bebe un poco de agua.']);
    var r = { id: 'f' + uid(), custom: true, cat: 'forja', e: it[0], n: 'Ritual de ' + it[1].toLowerCase() + ' · ' + el[1], intent: it[2], when: 'Mejor en luna ' + it[4], mats: ['Papel y bolígrafo', 'Un vaso de agua', el[0] + ' ' + el[1] + ' (según el elemento)'], steps: st.map(function (s) { return { t: s[0], x: s[1], s: s[2] || 0 }; }), close: 'Has dedicado tiempo a lo que importa: eso ya es el ritual.', reflect: '¿Qué ha cambiado en ti entre el principio y el final?', mins: m };
    return r;
  }
  A.forgeGo = function () { FORGE.t = ($('#forge_t') || {}).value || ''; var r = compose(); M.custom.unshift(r); M.custom = M.custom.slice(0, 40); save(); runner(r); };
  A.forgeAI = function () {
    FORGE.t = ($('#forge_t') || {}).value || '';
    ARC.ai.guard(function () {
      ARC.openModal('<div class="det"><div class="orb-s"></div><h3>Sibila escribe tu ritual…</h3></div>');
      var it = INT[FORGE.i], el = ELE[FORGE.e];
      var sys = 'Eres una guía ritual respetuosa. Respondes SOLO con JSON válido. Los rituales son prácticas simbólicas y seguras de introspección: nunca incluyas dañar, maldecir, controlar ni manipular a otras personas, ni sustancias peligrosas, ni consejos médicos.';
      var user = 'CONTEXTO\n' + ARC.ctx() + '\n\nCrea un ritual personal de ' + FORGE.m + ' minutos con intención «' + it[1] + '», elemento ' + el[1] + (FORGE.t ? ', situación: ' + FORGE.t : '') + '. Formato exacto: {"n":"nombre","intent":"una frase","when":"cuándo","mats":["..."],"steps":[{"t":"título corto","x":"instrucción de 1-2 frases","s":segundos_o_0}],"close":"frase de cierre","reflect":"pregunta de reflexión"} con ' + (FORGE.m === 5 ? '4-5' : FORGE.m === 15 ? '6-7' : '8-9') + ' pasos. Incluye al menos un paso con pausa/respiración (s>0). Usa un tono ' + (P.tone || 'sabio') + '. Si usas velas, recuerda la seguridad.';
      ARC.ai.ask({ system: sys, messages: [{ role: 'user', content: user }], max: 1500 }).then(function (t) {
        var m = /\{[\s\S]*\}/.exec(t), d = JSON.parse(m ? m[0] : t); if (!d.steps || d.steps.length < 3) throw new Error('formato');
        var r = { id: 'f' + uid(), custom: true, cat: 'forja', e: it[0], n: String(d.n || 'Ritual personal').slice(0, 70), intent: String(d.intent || it[2]).slice(0, 140), when: String(d.when || 'Cuando lo necesites').slice(0, 100), mats: (d.mats || []).slice(0, 8).map(String), steps: d.steps.slice(0, 10).map(function (s) { return { t: String(s.t || '').slice(0, 60), x: String(s.x || '').slice(0, 400), s: Math.min(Number(s.s) || 0, 300) }; }), close: String(d.close || '').slice(0, 200), reflect: String(d.reflect || '').slice(0, 160), mins: FORGE.m };
        M.custom.unshift(r); save(); runner(r);
      }).catch(function () { ARC.toast('Sibila no pudo; uso la forja local'); A.forgeGo(); });
    });
  };

  /* ---------- Sigilos ---------- */
  var KAMEAS = [[3, 'Saturno'], [4, 'Júpiter'], [5, 'Marte'], [6, 'Sol'], [7, 'Venus']];
  function sigilsHTML() {
    var S = MG.sig, h = '<div class="panel"><div class="lbl nm">Tu intención</div><textarea id="sg_text" rows="2" maxlength="140" placeholder="Escríbela afirmativa y en presente: «Hablo con seguridad y calma»">' + esc(S.text) + '</textarea>' +
      '<div class="lbl">Método</div><div class="seg"><button data-a="sgSet" data-f="method" data-v="circle" class="' + (S.method === 'circle' ? 'on' : '') + '">⭕ Círculo de letras</button><button data-a="sgSet" data-f="method" data-v="kamea" class="' + (S.method === 'kamea' ? 'on' : '') + '">🔢 Kamea planetaria</button></div>';
    if (S.method === 'kamea') h += '<div class="chips">' + KAMEAS.map(function (k) { return '<button data-a="sgSet" data-f="kamea" data-v="' + k[0] + '" class="' + (S.kamea === k[0] ? 'on' : '') + '">' + k[1] + ' · ' + k[0] + '×' + k[0] + '</button>'; }).join('') + '</div>';
    h += '<label class="toggle"><input type="checkbox" id="sg_nv"' + (S.noVowels ? ' checked' : '') + '><span>Quitar también las vocales</span></label><label class="toggle"><input type="checkbox" id="sg_sl"' + (S.showLetters ? ' checked' : '') + '><span>Mostrar letras en el círculo</span></label><button class="btn primary big" data-a="sgMake">✨ Forjar sigilo</button></div>';
    if (S.made && S.text.trim()) {
      var res = ARC.sig.make(S.text, { method: S.method, kamea: S.kamea, noVowels: S.noVowels, showLetters: S.showLetters });
      h += '<div class="panel" id="sgout">' + res.svg + '<p class="hint c">Letras únicas: <b>' + esc(res.letters) + '</b> · el punto marca el inicio y la barra el final</p><div class="row2"><button class="btn ghost" data-a="sgSave">💾 Guardar</button><button class="btn ghost" data-a="sgCharge">🔮 Cargarlo</button></div><button class="btn ghost" data-a="sgPng">⬇️ Descargar imagen</button></div>';
    }
    if (M.sigils.length) h += '<div class="lbl pad">Mis sigilos</div><div class="sgrid">' + M.sigils.map(function (s) { var r = ARC.sig.make(s.text, { method: s.method, kamea: s.kamea, noVowels: s.noVowels }); return '<div class="sgcard"><button data-a="sgLoad" data-id="' + s.id + '">' + r.svg.replace('sg-path', 'sg-path still') + '</button><small>' + esc(s.text.slice(0, 40)) + '</small><button class="x2" data-a="sgDel" data-id="' + s.id + '" aria-label="Borrar">✕</button></div>'; }).join('') + '</div>';
    h += '<details class="panel fold"><summary>¿Qué es un sigilo?</summary><p>Los sigilos de la <b>magia del caos</b> los popularizó el artista Austin Osman Spare (1913). El método clásico: escribes tu deseo, quitas las letras repetidas y combinas las que quedan en un símbolo personal. Luego lo «cargas» con atención intensa y lo <b>olvidas</b> para que no te genere ansiedad. Es una técnica de psicología simbólica: concentra tu intención y te recuerda lo que quieres cultivar.</p><p>Las <b>kameas</b> son los cuadrados mágicos planetarios descritos por Agripa (1533): cada letra se traza sobre su número. No hay fuerza sobrenatural comprobada; el valor está en tu atención y en las acciones que tomes después.</p></details>';
    return h;
  }
  A.sgSet = function (el) { MG.sig.text = ($('#sg_text') || {}).value || MG.sig.text; var f = el.dataset.f; MG.sig[f] = f === 'kamea' ? Number(el.dataset.v) : el.dataset.v; if (MG.sig.made) MG.sig.made = true; ARC.render(true); };
  ARC.inputs.sg_text = function (v) { MG.sig.text = v; };
  ARC.changes.sg_nv = function (v) { MG.sig.noVowels = v; };
  ARC.changes.sg_sl = function (v) { MG.sig.showLetters = v; };
  A.sgMake = function () { MG.sig.text = ($('#sg_text') || {}).value || ''; if (!MG.sig.text.trim()) { ARC.toast('Escribe tu intención'); return; } MG.sig.made = true; ARC.render(true); setTimeout(function () { var o = $('#sgout'); if (o) o.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 60); };
  A.sgSave = function () { var S = MG.sig; M.sigils.unshift({ id: uid(), text: S.text, method: S.method, kamea: S.kamea, noVowels: S.noVowels, ts: Date.now() }); M.sigils = M.sigils.slice(0, 60); save(); ARC.toast('Sigilo guardado'); ARC.render(true); };
  A.sgLoad = function (el) { var s = M.sigils.filter(function (x) { return x.id === el.dataset.id; })[0]; Object.assign(MG.sig, { text: s.text, method: s.method, kamea: s.kamea, noVowels: s.noVowels, made: true }); ARC.render(); };
  A.sgDel = function (el) { M.sigils = M.sigils.filter(function (x) { return x.id !== el.dataset.id; }); save(); ARC.render(true); };
  A.sgCharge = function () {
    var S = MG.sig, res = ARC.sig.make(S.text, { method: S.method, kamea: S.kamea, noVowels: S.noVowels });
    runner({ id: 'sigilo', n: 'Cargar un sigilo', e: '🔮', intent: S.text, mins: 4, close: 'Ahora olvídalo con naturalidad: el sigilo ya está cargado. Confía y ocúpate de actuar.', reflect: '¿Qué pequeña acción coherente con tu intención harás hoy?', steps: [
      { t: 'Contempla el símbolo', x: 'Mira el sigilo sin pensar en el deseo, solo en las líneas. Deja que tu mirada recorra el trazo de principio a fin.', s: 60 },
      { t: 'Intensifica la atención', x: 'Con los ojos entrecerrados, respira hondo y sostén la mirada en el centro del símbolo, sintiendo la intención con emoción.', s: 45 },
      { t: 'Cierra los ojos', x: 'Imagina el símbolo brillando con tu intención ya cumplida. Mantén la imagen unos segundos.', s: 30 },
      { t: 'Suéltalo', x: 'Exhala fuerte, abre los ojos y aparta la mirada. Cambia de actividad y no pienses en el sigilo.' }], custom: false }, { svg: res.svg });
  };
  A.sgPng = function () {
    var svg = $('#sgout svg'); if (!svg) return; var xml = new XMLSerializer().serializeToString(svg);
    var css = 'svg{background:#0d0b14}.sg-ring{fill:none;stroke:#e6c97a;stroke-opacity:.5;stroke-width:.6}.sg-ring.thin{stroke-opacity:.25;stroke-width:.35}.sg-dot{fill:#e6c97a;opacity:.6}.sg-path{fill:none;stroke:#e6c97a;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}.sg-start{fill:none;stroke:#e6c97a;stroke-width:1}.sg-end{stroke:#e6c97a;stroke-width:1.4}.sg-grid{stroke:#e6c97a;stroke-opacity:.2;stroke-width:.3}.sg-num{font-size:3.2px;fill:#9a93b0;text-anchor:middle;dominant-baseline:central;opacity:.55}.sg-let{font-size:3px;fill:#9a93b0;text-anchor:middle;dominant-baseline:central}';
    xml = xml.replace('>', '><style>' + css + '</style><rect width="100" height="100" fill="#0d0b14"/>').replace('stroke-dasharray', 'x');
    var img = new Image(); img.onload = function () {
      var c = document.createElement('canvas'); c.width = c.height = 1024; var x = c.getContext('2d'); x.drawImage(img, 0, 0, 1024, 1024);
      c.toBlob(function (b) { var f = new File([b], 'sigilo-arcana.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f] }).catch(function () { }); else { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'sigilo-arcana.png'; document.body.appendChild(a); a.click(); a.remove(); } });
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  };

  ARC.regSub('magic', 'rituales', '🕯️', 'Rituales', ritualsHTML);
  ARC.regSub('magic', 'sigilos', '🔱', 'Sigilos', sigilsHTML);
})();
