/* IA: proveedores (gratuito sin clave, Gemini, Anthropic) y la guía de conversación "Sibila". */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, S = ARC.settings, P = ARC.profile;

  var PROVIDERS = {
    free: { name: 'IA gratuita (sin clave)', note: 'Funciona sin cuenta. Tus textos se envían a un servicio gratuito de terceros (Pollinations): no escribas datos sensibles.' },
    gemini: { name: 'Google Gemini', note: 'Usa tu clave gratuita de Google AI Studio. Google puede usar los datos del plan gratuito para mejorar sus productos.' },
    anthropic: { name: 'Anthropic (Claude)', note: 'Usa tu clave de Anthropic. Los textos se envían a Anthropic.' }
  };

  function ready() {
    if (S.provider === 'gemini') return !!S.geminiKey;
    if (S.provider === 'anthropic') return !!S.anthropicKey;
    return true;
  }

  function parseError(res, data, fallback) {
    var m = data && (data.error && (data.error.message || data.error) || data.message);
    if (typeof m === 'object') m = JSON.stringify(m);
    if (res.status === 401 || res.status === 403) return 'La clave no es válida o no tiene permiso. Revísala en Ajustes.';
    if (res.status === 429) return 'Se ha alcanzado el límite de uso gratuito. Espera un momento e inténtalo de nuevo.';
    return (m ? String(m).slice(0, 200) : fallback) + (res.status ? ' (' + res.status + ')' : '');
  }

  function json(res) { return res.text().then(function (t) { try { return JSON.parse(t); } catch (e) { return { raw: t }; } }); }

  // opts: { system, messages:[{role:'user'|'assistant', content}], max }
  function ask(opts) {
    var max = opts.max || 900, msgs = opts.messages;
    var req;
    if (S.provider === 'gemini') {
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(S.geminiModel || 'gemini-2.5-flash') + ':generateContent';
      req = fetch(url, {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': S.geminiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: opts.system }] },
          contents: msgs.map(function (m) { return { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }; }),
          generationConfig: { maxOutputTokens: max, temperature: 0.8 }
        })
      }).then(function (res) {
        return json(res).then(function (d) {
          if (!res.ok) throw new Error(parseError(res, d, 'Error de Gemini'));
          var parts = d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts;
          return (parts || []).map(function (p) { return p.text || ''; }).join('\n');
        });
      });
    } else if (S.provider === 'anthropic') {
      req = fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': S.anthropicKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: S.anthropicModel || 'claude-sonnet-5-5', max_tokens: max, system: opts.system, messages: msgs })
      }).then(function (res) {
        return json(res).then(function (d) {
          if (!res.ok) throw new Error(parseError(res, d, 'Error de Anthropic'));
          return (d.content || []).map(function (b) { return b.text || ''; }).join('\n');
        });
      });
    } else {
      req = fetch(S.freeUrl || 'https://text.pollinations.ai/openai', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: S.freeModel || 'openai', max_tokens: max, temperature: 0.8, private: true,
          messages: [{ role: 'system', content: opts.system }].concat(msgs)
        })
      }).then(function (res) {
        return json(res).then(function (d) {
          if (!res.ok) throw new Error(parseError(res, d, 'Error del servicio gratuito'));
          if (d.raw && !d.choices) return d.raw;
          return d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || '';
        });
      });
    }
    return req.then(function (t) {
      t = String(t || '').trim();
      if (!t) throw new Error('La IA no devolvió texto. Inténtalo de nuevo.');
      return t;
    }).catch(function (err) {
      if (err instanceof TypeError) throw new Error('No se pudo conectar con la IA. Revisa tu conexión o cambia de proveedor en Ajustes.');
      throw err;
    });
  }

  // Pide consentimiento la primera vez que se usa cada proveedor
  function guard(cb) {
    if (!ready()) { ARC.toast('Añade tu clave en Ajustes o usa la IA gratuita'); ARC.go('me'); return; }
    if (P.consent && P.consent[S.provider]) { cb(); return; }
    ARC.openModal('<h3>Antes de usar la IA 🔒</h3><p>' + esc(PROVIDERS[S.provider].note) + '</p>' +
      '<p class="hint">Puedes cambiar de proveedor o borrar tus datos cuando quieras desde Ajustes.</p>' +
      '<button class="btn primary big" data-a="aiConsent">Entiendo, continuar</button>');
    ARC.pendingAI = cb;
  }
  ARC.act.aiConsent = function () {
    P.consent = P.consent || {}; P.consent[S.provider] = true; ARC.save('profile');
    ARC.closeModal();
    var cb = ARC.pendingAI; ARC.pendingAI = null; if (cb) cb();
  };

  /* Contexto profundo de la persona: se incluye en todas las consultas a la IA */
  ARC.ctx = function () {
    var L = [], b = P.birth, ss = ARC.sunSign(), ci = ARC.chineseInfo(), now = new Date(), mi = ASTRO.moonInfo(now), pl = ASTRO.planets(now);
    var who = [];
    if (P.name) who.push('nombre ' + P.name);
    if (b) {
      var age = now.getFullYear() - b.y - ((now.getMonth() + 1 < b.m || (now.getMonth() + 1 === b.m && now.getDate() < b.d)) ? 1 : 0);
      who.push(age + ' años');
      var nat = ASTRO.planets(new Date(Date.UTC(b.y, b.m - 1, b.d, 12))), by = {};
      nat.forEach(function (p) { by[p.id] = p; });
      who.push('Sol en ' + ASTRO.SIGNS[ss].n);
      L.push('Datos natales (calculados, sin hora ni lugar de nacimiento): Mercurio en ' + ASTRO.SIGNS[by['Mercurio'].sign].n + ', Venus en ' + ASTRO.SIGNS[by['Venus'].sign].n + ', Marte en ' + ASTRO.SIGNS[by['Marte'].sign].n + ', Júpiter en ' + ASTRO.SIGNS[by['Júpiter'].sign].n + ', Saturno en ' + ASTRO.SIGNS[by['Saturno'].sign].n + ' y Luna aproximada en ' + ASTRO.SIGNS[by['Luna'].sign].n + '. No se conoce el ascendente.');
    }
    if (ARC.natal && P.natal && P.natal.place) {
      try {
        var ch = ARC.natal.chart('placidus'), by2 = {}; ch.planets.forEach(function (p) { by2[p.id] = p; });
        var sn = function (lon) { return ASTRO.SIGNS[Math.floor(lon / 30)].n; };
        L.push('CARTA NATAL COMPLETA (' + (P.natal.unknown ? 'sin hora exacta' : 'con hora y lugar') + '): Ascendente ' + sn(ch.asc) + ', MC ' + sn(ch.mc) + '; Sol ' + sn(by2['Sol'].lon) + ' casa ' + by2['Sol'].house + ', Luna ' + sn(by2['Luna'].lon) + ' casa ' + by2['Luna'].house + ', Mercurio ' + sn(by2['Mercurio'].lon) + ' casa ' + by2['Mercurio'].house + ', Venus ' + sn(by2['Venus'].lon) + ' casa ' + by2['Venus'].house + ', Marte ' + sn(by2['Marte'].lon) + ' casa ' + by2['Marte'].house + ', Saturno ' + sn(by2['Saturno'].lon) + ' casa ' + by2['Saturno'].house + ', Nodo Norte ' + sn(by2['Nodo Norte'].lon) + '. Regente del ascendente: ' + ch.rulerName + '.');
      } catch (err) { /* sin carta */ }
    }
    L.unshift('PERSONA: ' + (who.join(', ') || 'sin datos básicos') + (ci ? '; año chino ' + ASTRO.ANIMALS[ci.animal] + ' de ' + ci.element : '') + (P.intentions && P.intentions.length ? '; busca: ' + P.intentions.join(', ') : '') + '.');
    if (ARC.num && ARC.num.summary) { var ns = ARC.num.summary(); if (ns) L.push(ns); }
    var F = ARC.FACTS || [], f = P.facts || {}, fl = [];
    F.forEach(function (q) { var v = f[q.k]; if (v && (!Array.isArray(v) || v.length)) fl.push(q.l + ': ' + (Array.isArray(v) ? v.join(', ') : v)); });
    if (fl.length) L.push('LO QUE ELLA/ÉL HA CONTADO DE SÍ: ' + fl.join(' | '));
    if (P.memory) L.push('MEMORIA de conversaciones previas: ' + P.memory);
    var j = ARC.journal.slice(0, 4);
    if (j.length) L.push('DIARIO RECIENTE: ' + j.map(function (e) { return (e.title || '') + (e.question ? ' (pregunta: ' + e.question + ')' : '') + (e.items && e.items.length ? ' [' + e.items.slice(0, 4).join('; ') + ']' : '') + (e.note ? ' — ' + e.note.slice(0, 140) : ''); }).join(' || '));
    var retro = pl.filter(function (p) { return p.status === 'retrógrado' && ['Mercurio', 'Venus', 'Marte'].indexOf(p.id) > -1; }).map(function (p) { return p.id + ' retrógrado'; });
    L.push('CIELO HOY: ' + mi.name + ' en ' + ASTRO.SIGNS[mi.sign].n + ' (' + Math.round(mi.illum * 100) + '% iluminada), Sol en ' + ASTRO.SIGNS[pl[0].sign].n + (retro.length ? '; ' + retro.join(', ') : '') + '.');
    return L.join('\n');
  };
  ARC.PERSONALIZE = 'PERSONALIZACIÓN: usa el CONTEXTO de la persona para que la respuesta sea específica y relevante para ella, no genérica. Indica de forma explícita en qué te basas (por ejemplo «porque sacaste…», «por tu Venus en…», «porque me contaste que…»). Distingue lo que dicen las cartas de lo que infieres de la persona. Si falta información clave, dilo y haz una sola pregunta concreta. Nunca afirmes certezas sobre el futuro: ofrece posibilidades, símbolos y preguntas útiles.';

  ARC.ai = { PROVIDERS: PROVIDERS, ready: ready, ask: ask, guard: guard };

  /* ================= Sibila: guía de conversación ================= */
  var NAME = 'Sibila';
  var CRISIS = /suicid|quitarme la vida|matarme|no quiero vivir|hacerme da[ñn]o|autolesi|cortarme|acabar con todo/i;
  var CRISIS_MSG = 'Siento mucho que estés pasando por algo tan duro, y me alegra que lo cuentes. No estás solo/a. ' +
    'Si estás en España, puedes llamar al **024** (línea de atención a la conducta suicida, gratuita y 24 h) o al **112** si hay peligro inmediato. ' +
    'Si estás en otro país, busca la línea de ayuda local. Hablar con una persona de confianza o con un profesional puede marcar la diferencia. ' +
    'Yo sigo aquí para acompañarte, pero no puedo sustituir ese apoyo. 💜';

  var busy = false;
  var userSince = 0;

  function systemPrompt() {
    var lines = [];
    lines.push('Eres ' + NAME + ', una guía de introspección cálida, curiosa y serena dentro de una app de tarot y esoterismo. Escribes en español.');
    lines.push('Tu objetivo es conocer mejor a la persona y ayudarla a reflexionar. Haz UNA pregunta abierta por mensaje, escucha, refleja lo que dice y conecta con símbolos (cartas, Luna, signos) solo cuando ayude, como metáfora y no como verdad. Respuestas breves (máx. ~110 palabras), sin listas largas, con algún emoji sutil.');
    lines.push('Reglas: no hagas predicciones ni afirmes certezas sobre el futuro; no des diagnósticos médicos, psicológicos, legales ni financieros; no eres terapeuta (si el tema es serio, sugiere con suavidad apoyo profesional). Si detectas señales de crisis o autolesión, responde con cuidado y recomienda llamar al 024 (España) o al 112. No inventes datos sobre la persona.');
    lines.push(ARC.PERSONALIZE);
    lines.push('CONTEXTO\n' + ARC.ctx());
    return lines.join('\n');
  }

  function updateMemory() {
    var recent = ARC.chat.slice(-16).map(function (m) { return (m.role === 'user' ? 'Persona' : NAME) + ': ' + m.content; }).join('\n');
    ask({
      system: 'Eres un asistente que mantiene notas breves sobre una persona para recordarla en futuras conversaciones. Escribe en español, en tercera persona, máximo 90 palabras, solo hechos y preferencias que la persona haya expresado (nunca inventes ni deduzcas diagnósticos).',
      messages: [{ role: 'user', content: 'Notas actuales: ' + (P.memory || '(vacías)') + '\n\nConversación reciente:\n' + recent + '\n\nDevuelve las notas actualizadas, sin introducción.' }],
      max: 300
    }).then(function (t) { P.memory = t.slice(0, 700); ARC.save('profile'); }).catch(function () { /* silencioso */ });
  }

  function bubble(m) {
    return '<div class="msg ' + (m.role === 'user' ? 'u' : 'a') + '">' + ARC.fmt(m.content) + '</div>';
  }
  function msgsHTML() {
    var h = '';
    if (!ARC.chat.length) {
      h += bubble({ role: 'assistant', content: '¡Hola' + (P.name ? ', ' + P.name : '') + '! Soy ' + NAME + ', tu guía de introspección. 🌙 Estoy aquí para charlar contigo y conocerte un poco mejor. No hay respuestas correctas.\n\nPara empezar: ¿cómo te sientes hoy, en una frase?' });
    }
    ARC.chat.forEach(function (m) { h += bubble(m); });
    if (busy) h += '<div class="msg a typing"><i></i><i></i><i></i></div>';
    return h;
  }
  function refreshMsgs() {
    var el = $('#msgs'); if (!el) return;
    el.innerHTML = msgsHTML();
    window.scrollTo(0, document.body.scrollHeight);
  }

  ARC.views.chat = function () {
    var starters = ['Cuéntame de ti', '¿Qué me pide hoy la Luna?', 'Ayúdame a reflexionar sobre algo', 'Quiero hablar de cómo me siento'];
    return '<section class="page chatpage"><header class="chath"><span class="av">🔮</span><div><b>' + NAME + '</b><small>Tu guía de introspección · ' + esc(PROVIDERS[S.provider].name) + '</small></div>' +
      '<button class="icon" data-a="chatMemory" aria-label="Lo que sé de ti">🧠</button><button class="icon" data-a="chatClear" aria-label="Borrar chat">🗑️</button></header>' +
      '<div id="msgs" class="msgs">' + msgsHTML() + '</div>' +
      (!ARC.chat.length ? '<div class="starters">' + starters.map(function (s) { return '<button data-a="chatStarter" data-t="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="composer"><textarea id="chatIn" rows="1" maxlength="1200" placeholder="Escribe aquí…" enterkeyhint="send"></textarea>' +
      '<button class="send" data-a="chatSend" aria-label="Enviar">➤</button></div>' +
      '<p class="fine">' + NAME + ' es una IA, no un profesional de la salud. Las respuestas son de reflexión y entretenimiento.</p></section>';
  };
  ARC.after.chat = function () { window.scrollTo(0, document.body.scrollHeight); };

  function send(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    guard(function () {
      ARC.chat.push({ role: 'user', content: text }); ARC.save('chat');
      userSince++;
      var input = $('#chatIn'); if (input) { input.value = ''; input.style.height = ''; }
      if (CRISIS.test(text)) {
        ARC.chat.push({ role: 'assistant', content: CRISIS_MSG }); ARC.save('chat');
        var starters = $('.starters'); if (starters) starters.remove();
        refreshMsgs(); return;
      }
      busy = true;
      var st = $('.starters'); if (st) st.remove();
      refreshMsgs();
      var hist = ARC.chat.slice(-20).map(function (m) { return { role: m.role, content: m.content }; });
      while (hist.length && hist[0].role !== 'user') hist.shift();
      ask({ system: systemPrompt(), messages: hist, max: 500 }).then(function (t) {
        ARC.chat.push({ role: 'assistant', content: t }); ARC.save('chat');
        if (userSince >= 6) { userSince = 0; updateMemory(); }
      }).catch(function (err) {
        ARC.chat.push({ role: 'assistant', content: '⚠️ ' + err.message });
      }).then(function () { busy = false; refreshMsgs(); });
    });
  }
  ARC.act.chatSend = function () { var i = $('#chatIn'); if (i) send(i.value); };
  ARC.act.chatStarter = function (el) { send(el.dataset.t); };
  ARC.act.chatClear = function () {
    if (!ARC.chat.length) return;
    if (!confirm('¿Borrar la conversación? La memoria de ' + NAME + ' se mantiene (puedes verla en 🧠).')) return;
    ARC.chat.length = 0; ARC.save('chat'); ARC.render();
  };
  ARC.act.chatMemory = function () {
    ARC.openModal('<h3>🧠 Lo que ' + NAME + ' recuerda de ti</h3><p class="hint">Son notas breves que se guardan solo en este dispositivo para que la conversación tenga continuidad. Puedes editarlas o borrarlas.</p>' +
      '<textarea id="memText" rows="6" placeholder="Todavía no hay notas. Se irán creando mientras charlas.">' + esc(P.memory || '') + '</textarea>' +
      '<button class="btn primary big" data-a="memSave">Guardar</button><button class="btn link" data-a="memClear">Borrar memoria</button>');
  };
  ARC.act.memSave = function () { P.memory = $('#memText').value.slice(0, 900); ARC.save('profile'); ARC.closeModal(); ARC.toast('Memoria guardada'); };
  ARC.act.memClear = function () { P.memory = ''; ARC.save('profile'); ARC.closeModal(); ARC.toast('Memoria borrada'); };

  document.addEventListener('keydown', function (e) {
    if (e.target.id === 'chatIn' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e.target.value); }
  });
  ARC.inputs.chatIn = function (v, el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 130) + 'px'; };
})();
