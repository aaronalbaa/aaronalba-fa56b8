/* Nube y amigos (Supabase): sincronización cifrada de extremo a extremo cada 15 s, perfil público, amistades y regalos de libros.
   Todo es opcional: sin configurar, Arcana funciona solo en local. El servidor guarda únicamente texto cifrado (AES-GCM). */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, P = ARC.profile, A = ARC.act;
  var CK = 'arcana.cloud';
  var C = ARC.store.get(CK, { url: '', key: '', email: '', uid: '', access: '', refresh: '', exp: 0, ck: '', hash: {}, pulled: {}, handle: '', display: '', cardHash: '' });
  C.hash = C.hash || {}; C.pulled = C.pulled || {};
  var KEYS = ['profile', 'progress', 'journal', 'chat', 'daily', 'missions', 'lib', 'life', 'fav', 'sync', 'magic'];
  var INTERVAL = 15000, started = Date.now(), timer = null, busy = false, status = { st: C.uid ? 'idle' : 'off', last: 0, err: '' };
  function save() { ARC.store.set(CK, C); }
  function configured() { return !!(C.url && C.key && C.uid && C.ck); }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h) + ':' + s.length; }

  /* ---------- cifrado ---------- */
  function b64(buf) { var u = new Uint8Array(buf), s = ''; for (var i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(s); }
  function unb64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  var keyCache = null;
  function aesKey() {
    if (keyCache) return Promise.resolve(keyCache);
    return crypto.subtle.importKey('raw', unb64(C.ck), 'AES-GCM', false, ['encrypt', 'decrypt']).then(function (k) { keyCache = k; return k; });
  }
  function deriveRaw(pass, uid) {
    var te = new TextEncoder();
    return crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveBits']).then(function (k) {
      return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: te.encode('arcana:' + uid), iterations: 150000, hash: 'SHA-256' }, k, 256);
    }).then(b64);
  }
  function enc(str) {
    return aesKey().then(function (k) { var iv = crypto.getRandomValues(new Uint8Array(12)); return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, new TextEncoder().encode(str)).then(function (ct) { return 'v1.' + b64(iv) + '.' + b64(ct); }); });
  }
  function dec(s) {
    var p = s.split('.'); if (p[0] !== 'v1' || p.length !== 3) return Promise.reject(new Error('formato'));
    return aesKey().then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(p[1]) }, k, unb64(p[2])); }).then(function (b) { return new TextDecoder().decode(b); });
  }

  /* ---------- HTTP ---------- */
  function base() { return C.url.replace(/\/+$/, ''); }
  function raw(method, path, body, headers, token) {
    var h = Object.assign({ apikey: C.key, 'content-type': 'application/json' }, headers || {});
    h.Authorization = 'Bearer ' + (token || C.access || C.key);
    return fetch(base() + path, { method: method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) }).then(function (r) {
      return r.text().then(function (t) { var d = null; try { d = t ? JSON.parse(t) : null; } catch (e) { d = t; } if (!r.ok) { var e = new Error((d && (d.msg || d.message || d.error_description || d.error)) || ('Error ' + r.status)); e.status = r.status; throw e; } return d; });
    });
  }
  function refresh() {
    return raw('POST', '/auth/v1/token?grant_type=refresh_token', { refresh_token: C.refresh }, {}, C.key).then(setSession);
  }
  function setSession(d) {
    if (!d || !d.access_token) throw new Error('Sin sesión: revisa tu correo (puede que debas confirmar la cuenta) y vuelve a entrar');
    C.access = d.access_token; C.refresh = d.refresh_token || C.refresh; C.exp = Date.now() + (d.expires_in || 3600) * 1000 - 60000; if (d.user && d.user.id) C.uid = d.user.id; save(); return d;
  }
  function api(method, path, body, headers) {
    var go = function () { return raw(method, path, body, headers); };
    var pre = Date.now() > C.exp ? refresh() : Promise.resolve();
    return pre.then(go).catch(function (e) { if (e.status === 401 && C.refresh) return refresh().then(go); throw e; });
  }

  /* ---------- sincronización ---------- */
  function mergeVal(k, local, remote) {
    try {
      var a = JSON.parse(local), b = JSON.parse(remote);
      if (Array.isArray(a) && Array.isArray(b)) {
        var seen = {}, out = [];
        a.concat(b).forEach(function (x) { var id = x && (x.id || x.ts) ? String(x.id || x.ts) : JSON.stringify(x); if (!seen[id]) { seen[id] = 1; out.push(x); } });
        if (out.length && out[0] && out[0].ts) out.sort(function (x, y) { return (y.ts || 0) - (x.ts || 0); });
        return JSON.stringify(out);
      }
      if (k === 'arcana.lib' && a && b) { // une subrayados y libros por id
        var books = {}, hl = {};
        (a.books || []).concat(b.books || []).forEach(function (x) { if (!books[x.id] || (x.lastOpen || 0) >= (books[x.id].lastOpen || 0)) books[x.id] = x; });
        (a.hl || []).concat(b.hl || []).forEach(function (x) { hl[x.id] = x; });
        var m = Object.assign({}, b, { books: Object.keys(books).map(function (i) { return books[i]; }), hl: Object.keys(hl).map(function (i) { return hl[i]; }), log: (b.log || []).length >= (a.log || []).length ? b.log : a.log, quiz: Object.assign({}, a.quiz, b.quiz) });
        return JSON.stringify(m);
      }
    } catch (e) { /* no mezclable */ }
    return remote;
  }
  function pushKey(k, v) {
    return enc(v).then(function (data) {
      return api('POST', '/rest/v1/blobs?on_conflict=user_id,key&select=updated_at', { user_id: C.uid, key: k, data: data, updated_at: new Date().toISOString() }, { Prefer: 'resolution=merge-duplicates,return=representation' });
    }).then(function (r) { C.hash[k] = hash(v); C.pulled[k] = (r && r[0] && r[0].updated_at) || new Date().toISOString(); });
  }
  function tick(force) {
    if (!configured() || busy || (document.hidden && !force)) return Promise.resolve(false);
    busy = true; status.st = 'sync'; var applied = [];
    return api('GET', '/rest/v1/blobs?select=key,updated_at&user_id=eq.' + C.uid).then(function (rows) {
      var chain = Promise.resolve();
      (rows || []).forEach(function (r) {
        var k = r.key; if (KEYS.indexOf(k.replace('arcana.', '')) < 0) return;
        if (Date.parse(r.updated_at) <= Date.parse(C.pulled[k] || 0)) return;
        chain = chain.then(function () {
          return api('GET', '/rest/v1/blobs?select=data&user_id=eq.' + C.uid + '&key=eq.' + encodeURIComponent(k)).then(function (d) {
            return dec(d[0].data);
          }).then(function (plain) {
            var local = localStorage.getItem(k), changedLocal = local !== null && C.hash[k] !== hash(local), final = plain;
            if (changedLocal) final = mergeVal(k, local, plain);
            if (local !== final) { localStorage.setItem(k, final); applied.push(k); }
            C.hash[k] = hash(final); C.pulled[k] = r.updated_at;
            if (changedLocal && final !== plain) C.hash[k] = '';   // forzar subida de la mezcla
          });
        });
      });
      return chain;
    }).then(function () {
      var chain = Promise.resolve();
      KEYS.forEach(function (n) { var k = 'arcana.' + n, v = localStorage.getItem(k); if (v === null) return; if (C.hash[k] !== hash(v)) chain = chain.then(function () { return pushKey(k, v); }); });
      return chain;
    }).then(function () { return pushCard(); }).then(function () {
      status = { st: 'ok', last: Date.now(), err: '' }; save();
      if (applied.length) onApplied();
      return true;
    }).catch(function (e) { status = { st: 'err', last: status.last, err: e.message || 'error' }; return false; }).then(function (v) { busy = false; var el = $('#cloudst'); if (el) el.innerHTML = statusLine(); return v; });
  }
  function onApplied() {
    var fresh = Date.now() - started < 25000, g = sessionStorage.getItem('arc.rl');
    if (fresh && (!g || Date.now() - Number(g) > 60000)) { try { sessionStorage.setItem('arc.rl', String(Date.now())); } catch (e) { /* nada */ } location.reload(); return; }
    var bar = $('#syncbar'); if (bar) return;
    bar = document.createElement('div'); bar.id = 'syncbar'; bar.innerHTML = '<span>☁️ Datos nuevos de otro dispositivo</span><button data-a="cloudReload">Actualizar</button>'; document.body.appendChild(bar);
  }
  A.cloudReload = function () { location.reload(); };
  function start() { if (timer) clearInterval(timer); if (!configured()) return; timer = setInterval(tick, INTERVAL); setTimeout(function () { tick(true); }, 800); document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); }); }
  function statusLine() { return status.st === 'ok' ? '✅ Sincronizado ' + new Date(status.last).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : status.st === 'sync' ? '🔄 Sincronizando…' : status.st === 'err' ? '⚠️ ' + esc(status.err) : '☁️ Conectada'; }

  /* ---------- tarjeta pública ---------- */
  function cardData() {
    var lib = ARC.lib ? ARC.lib.data() : { books: [] };
    var fin = lib.books.filter(function (b) { return b.status === 'read'; }).slice(0, 40).map(function (b) { return { t: b.title, a: b.author || '', r: b.rating || 0 }; });
    var xp = (ARC.progress && ARC.progress.xp) || 0;
    return { xp: xp, books: fin, n: fin.length };
  }
  function pushCard() {
    if (!C.handle) return Promise.resolve();
    var card = cardData(), h = hash(JSON.stringify(card) + C.display); if (h === C.cardHash) return Promise.resolve();
    return api('PATCH', '/rest/v1/profiles?user_id=eq.' + C.uid, { card: card, display: C.display, updated_at: new Date().toISOString() }).then(function () { C.cardHash = h; save(); });
  }

  /* ---------- cuenta ---------- */
  ARC.cloud = {
    configured: configured, tick: function () { return tick(true); }, status: function () { return status; }, cfg: function () { return C; },
    panelHTML: function () {
      if (configured()) return '<div class="panel"><div class="lbl">Nube y sincronización</div><p class="hint">Cuenta: <b>' + esc(C.email) + '</b>' + (C.handle ? ' · @' + esc(C.handle) : '') + '</p><p class="hint" id="cloudst">' + statusLine() + '</p><p class="hint">Se sincroniza cada 15 s entre tus dispositivos. Los datos viajan <b>cifrados</b> con tu frase secreta: ni el servidor puede leerlos.</p><div class="row2"><button class="btn ghost" data-a="cloudNow">Sincronizar ya</button><button class="btn ghost danger" data-a="cloudOut">Salir</button></div></div>';
      return '<div class="panel"><div class="lbl">Nube y sincronización</div><p class="hint">Sincroniza móvil y ordenador, y conecta con amigos. Necesitas tu propio proyecto gratuito de Supabase (guía en <b>backend/README.md</b>).</p><button class="btn primary big" data-a="cloudOpen">☁️ Conectar mi nube</button></div>';
    }
  };
  A.cloudOpen = function () {
    ARC.openModal('<h3>☁️ Conectar mi nube</h3><p class="hint">Datos de tu proyecto de Supabase (Settings → API).</p><div class="lbl">URL del proyecto</div><input id="cl_url" placeholder="https://abcd1234.supabase.co" value="' + esc(C.url) + '" autocapitalize="off" spellcheck="false"><div class="lbl">Clave pública (anon)</div><input id="cl_key" placeholder="eyJ…" value="' + esc(C.key) + '" autocapitalize="off" spellcheck="false"><div class="lbl">Correo</div><input id="cl_mail" type="email" placeholder="tu@correo.com" value="' + esc(C.email) + '"><div class="lbl">Contraseña de la cuenta</div><input id="cl_pw" type="password" autocomplete="off"><div class="lbl">Frase secreta de cifrado</div><input id="cl_pp" type="password" autocomplete="off" placeholder="Solo tú la conoces"><p class="hint">⚠️ Si olvidas la frase secreta, tus datos en la nube no se pueden recuperar. Usa la misma en todos tus dispositivos.</p><div class="row2"><button class="btn primary" data-a="cloudGo" data-v="in">Entrar</button><button class="btn ghost" data-a="cloudGo" data-v="up">Crear cuenta</button></div><p class="err" id="cl_err"></p>');
  };
  A.cloudGo = function (el) {
    var url = ($('#cl_url').value || '').trim().replace(/\/+$/, ''), key = ($('#cl_key').value || '').trim(), mail = ($('#cl_mail').value || '').trim(), pw = $('#cl_pw').value || '', pp = $('#cl_pp').value || '', up = el.dataset.v === 'up', err = $('#cl_err');
    if (!/^https:\/\//.test(url) && !/^http:\/\/localhost/.test(url) || !key || !mail || pw.length < 6 || pp.length < 8) { err.textContent = 'Completa todo: URL https, clave, correo, contraseña (6+) y frase secreta (8+).'; return; }
    err.textContent = 'Conectando…'; var old = JSON.stringify(C);
    C.url = url; C.key = key; C.email = mail; C.access = ''; C.exp = 0; C.refresh = '';
    raw('POST', up ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password', { email: mail, password: pw }, {}, key).then(function (d) {
      if (up && !d.access_token) throw new Error('Cuenta creada. Confirma tu correo (o desactiva «Confirm email» en Supabase) y pulsa Entrar.');
      setSession(d); if (!C.uid && d.user) C.uid = d.user.id;
      return deriveRaw(pp, C.uid);
    }).then(function (ck) {
      C.ck = ck; keyCache = null;
      // comprobar la frase contra datos existentes
      return api('GET', '/rest/v1/blobs?select=data&user_id=eq.' + C.uid + '&limit=1').then(function (rows) { if (rows && rows[0]) return dec(rows[0].data).catch(function () { throw new Error('La frase secreta no coincide con la de tus otros dispositivos.'); }); });
    }).then(function () {
      C.hash = {}; C.pulled = {}; save(); ARC.closeModal(); ARC.toast('Nube conectada ☁️'); start(); tick(true).then(function () { ARC.render(true); });
    }).catch(function (e) { var keep = JSON.parse(old); Object.keys(C).forEach(function (k) { delete C[k]; }); Object.assign(C, keep); err.textContent = '⚠️ ' + e.message; });
  };
  A.cloudNow = function () { ARC.toast('Sincronizando…'); tick(true).then(function (ok) { ARC.toast(ok ? 'Sincronizado ✅' : 'No se pudo sincronizar'); ARC.render(true); }); };
  A.cloudOut = function () { if (!confirm('¿Salir de la nube? Tus datos locales se conservan.')) return; clearInterval(timer); var u = C.url, k = C.key; Object.keys(C).forEach(function (x) { delete C[x]; }); Object.assign(C, { url: u, key: k, email: '', uid: '', access: '', refresh: '', exp: 0, ck: '', hash: {}, pulled: {}, handle: '', display: '', cardHash: '' }); keyCache = null; save(); status = { st: 'off', last: 0, err: '' }; ARC.render(true); };

  /* ---------- amigos ---------- */
  var SO = { loaded: false, loading: false, friends: [], incoming: [], outgoing: [], gifts: [], names: {}, cards: {}, err: '' };
  function loadSocial() {
    if (!configured() || SO.loading) return; SO.loading = true;
    var done = function () { SO.loading = false; SO.loaded = true; if (ARC.tab === 'library') ARC.render(true); };
    var go = C.handle ? Promise.resolve() : api('GET', '/rest/v1/profiles?select=handle,display&user_id=eq.' + C.uid).then(function (r) { if (r && r[0]) { C.handle = r[0].handle; C.display = r[0].display; save(); } });
    go.then(function () {
      if (!C.handle) return;
      return Promise.all([api('GET', '/rest/v1/friendships?select=*'), api('GET', '/rest/v1/gifts?select=*&order=created_at.desc&limit=50')]).then(function (res) {
        var fr = res[0] || [], me = C.uid; SO.gifts = res[1] || [];
        SO.friends = fr.filter(function (f) { return f.status === 'accepted'; }); SO.incoming = fr.filter(function (f) { return f.status === 'pending' && f.addressee === me; }); SO.outgoing = fr.filter(function (f) { return f.status === 'pending' && f.requester === me; });
        var ids = {}; fr.forEach(function (f) { ids[f.requester] = 1; ids[f.addressee] = 1; }); SO.gifts.forEach(function (g) { ids[g.from_user] = 1; ids[g.to_user] = 1; }); delete ids[me];
        var list = Object.keys(ids); if (!list.length) return;
        return api('POST', '/rest/v1/rpc/names_for', { ids: list }).then(function (n) { (n || []).forEach(function (x) { SO.names[x.user_id] = x; }); });
      });
    }).then(done).catch(function (e) { SO.err = e.message; done(); });
  }
  function nm(id) { var n = SO.names[id]; return n ? (n.display || '@' + n.handle) + (n.display ? ' · @' + n.handle : '') : 'Alguien'; }
  function other(f) { return f.requester === C.uid ? f.addressee : f.requester; }
  ARC.social = {
    refresh: function () { SO.loaded = false; },
    html: function () {
      if (!configured()) return '<div class="empty"><div class="eb">👥</div><h3>Biblioteca social</h3><p class="hint">Conecta tu nube para añadir amigos, ver sus colecciones y regalarte libros.</p><button class="btn primary big" data-a="cloudOpen">☁️ Conectar mi nube</button></div>';
      if (!SO.loaded && !SO.loading) loadSocial();
      if (!SO.loaded) return '<p class="hint c">Cargando…</p>';
      if (!C.handle) return '<div class="panel"><div class="lbl nm">Crea tu perfil</div><p class="hint">Elige un @usuario único. Tus amigos lo usarán para encontrarte.</p><input id="so_h" placeholder="usuario (a-z, 0-9, _)" maxlength="20" autocapitalize="off" spellcheck="false"><div class="lbl">Nombre visible</div><input id="so_d" maxlength="40" placeholder="Tu nombre" value="' + esc(P.name || '') + '"><button class="btn primary big" data-a="soCreate">Crear perfil</button><p class="err" id="so_err"></p></div>';
      var h = '<div class="panel"><b>@' + esc(C.handle) + '</b> <small class="hint">· ' + esc(C.display) + '</small><div class="row2" style="margin-top:10px"><input id="so_f" placeholder="@usuario de tu amigo" autocapitalize="off" spellcheck="false"><button class="btn primary" data-a="soFind" style="flex:none">Añadir</button></div><p class="err" id="so_ferr">' + esc(SO.err) + '</p></div>';
      if (SO.incoming.length) h += '<div class="lbl pad">Solicitudes</div><div class="group">' + SO.incoming.map(function (f) { return '<div class="grow"><span class="gi">🤝</span><div><b>' + esc(nm(f.requester)) + '</b><small>quiere ser tu amigo/a</small></div><button class="btn ghost sm" data-a="soAccept" data-id="' + f.id + '">Aceptar</button><button class="x2" data-a="soRemove" data-id="' + f.id + '">✕</button></div>'; }).join('') + '</div>';
      var unseen = SO.gifts.filter(function (g) { return g.to_user === C.uid && !g.seen; });
      if (SO.gifts.some(function (g) { return g.to_user === C.uid; })) h += '<div class="lbl pad">Regalos recibidos' + (unseen.length ? ' <em>' + unseen.length + ' nuevos</em>' : '') + '</div><div class="group">' + SO.gifts.filter(function (g) { return g.to_user === C.uid; }).map(function (g) { return '<button class="grow" data-a="soGiftSeen" data-id="' + g.id + '"><span class="gi">🎁</span><div><b>' + esc(g.title) + (g.author ? ' · ' + esc(g.author) : '') + '</b><small>' + esc(nm(g.from_user)) + (g.message ? ': «' + esc(g.message) + '»' : '') + '</small></div>' + (g.seen ? '' : '<i class="seal2">●</i>') + '</button>'; }).join('') + '</div><p class="fine">El archivo del libro te llega por AirDrop, mensajes o correo desde el botón «Regalar» de quien te lo envía.</p>';
      h += '<div class="lbl pad">Amigos <em>' + SO.friends.length + '</em></div>' + (SO.friends.length ? '<div class="group">' + SO.friends.map(function (f) { var id = other(f); return '<button class="grow" data-a="soFriend" data-id="' + id + '"><span class="gi">👤</span><div><b>' + esc(nm(id)) + '</b><small>Ver su colección</small></div><i class="chev">›</i></button>'; }).join('') + '</div>' : '<p class="hint c">Aún no tienes amigos. Pídele a alguien su @usuario.</p>');
      if (SO.outgoing.length) h += '<p class="hint c">Solicitudes enviadas: ' + SO.outgoing.map(function (f) { return esc(nm(f.addressee)); }).join(', ') + '</p>';
      return h;
    },
    giftModal: function (b) {
      if (!configured() || !C.handle || !SO.friends.length) return false;
      ARC.openModal('<h3>🎁 Regalar «' + esc(b.title) + '»</h3><div class="lbl">¿A quién?</div><div class="chips wrap">' + SO.friends.map(function (f) { var id = other(f); return '<button data-a="soPick" data-id="' + id + '">' + esc(nm(id)) + '</button>'; }).join('') + '</div><div class="lbl">Dedicatoria</div><textarea id="so_msg" rows="3" maxlength="400" placeholder="Para que lo disfrutes…"></textarea><button class="btn primary big" data-a="soGift" data-b="' + b.id + '">Enviar aviso del regalo</button><p class="hint c">Enviamos el aviso por Arcana; el archivo lo compartes tú con el botón de compartir (AirDrop, mensajes…).</p>');
      SO.pick = null; return true;
    }
  };
  A.soCreate = function () {
    var h = ($('#so_h').value || '').trim().toLowerCase(), d = ($('#so_d').value || '').trim(), err = $('#so_err');
    if (!/^[a-z0-9_]{3,20}$/.test(h)) { err.textContent = 'Usa 3-20 letras minúsculas, números o _'; return; }
    api('POST', '/rest/v1/profiles', { user_id: C.uid, handle: h, display: d, card: cardData() }, { Prefer: 'return=minimal' }).then(function () { C.handle = h; C.display = d; save(); SO.loaded = false; ARC.render(true); }).catch(function (e) { err.textContent = /duplicate|unique|23505/i.test(e.message) ? 'Ese @usuario ya existe' : e.message; });
  };
  A.soFind = function () {
    var h = ($('#so_f').value || '').trim().replace(/^@/, '').toLowerCase(), err = $('#so_ferr'); if (!h) return;
    api('POST', '/rest/v1/rpc/find_profile', { h: h }).then(function (r) {
      if (!r || !r[0]) throw new Error('No existe @' + h);
      if (r[0].user_id === C.uid) throw new Error('Ese eres tú 🙂');
      return api('POST', '/rest/v1/friendships', { requester: C.uid, addressee: r[0].user_id, status: 'pending' }, { Prefer: 'return=minimal' }).then(function () { ARC.toast('Solicitud enviada a @' + h); SO.loaded = false; SO.err = ''; ARC.render(true); });
    }).catch(function (e) { err.textContent = /duplicate|23505/i.test(e.message) ? 'Ya hay una solicitud o amistad' : e.message; });
  };
  A.soAccept = function (el) { api('PATCH', '/rest/v1/friendships?id=eq.' + el.dataset.id, { status: 'accepted' }, { Prefer: 'return=minimal' }).then(function () { SO.loaded = false; ARC.render(true); }); };
  A.soRemove = function (el) { api('DELETE', '/rest/v1/friendships?id=eq.' + el.dataset.id).then(function () { SO.loaded = false; ARC.closeModal(); ARC.render(true); }); };
  A.soGiftSeen = function (el) { api('PATCH', '/rest/v1/gifts?id=eq.' + el.dataset.id, { seen: true }, { Prefer: 'return=minimal' }).then(function () { SO.loaded = false; ARC.render(true); }); };
  A.soFriend = function (el) {
    var id = el.dataset.id; ARC.openModal('<h3>' + esc(nm(id)) + '</h3><p class="hint c" id="so_card">Cargando su colección…</p>');
    api('GET', '/rest/v1/profiles?select=card,display,handle&user_id=eq.' + id).then(function (r) {
      var c = (r && r[0] && r[0].card) || {}, b = c.books || [], f = SO.friends.filter(function (x) { return other(x) === id; })[0];
      $('#so_card').outerHTML = '<div><p class="hint c">✨ ' + (c.xp || 0) + ' XP · ' + (c.n || 0) + ' libros leídos</p>' + (b.length ? '<div class="group">' + b.map(function (x) { return '<div class="grow"><span class="gi">📗</span><div><b>' + esc(x.t) + '</b><small>' + esc(x.a || '') + ' ' + '★'.repeat(x.r || 0) + '</small></div></div>'; }).join('') + '</div>' : '<p class="hint c">Aún no ha marcado libros como leídos.</p>') + (f ? '<button class="btn ghost danger" data-a="soRemove" data-id="' + f.id + '">Quitar amistad</button>' : '') + '</div>';
    }).catch(function (e) { var x = $('#so_card'); if (x) x.textContent = e.message; });
  };
  A.soPick = function (el) { SO.pick = el.dataset.id; Array.prototype.forEach.call(document.querySelectorAll('[data-a=soPick]'), function (b) { b.classList.toggle('on', b === el); }); };
  A.soGift = function (el) {
    if (!SO.pick) { ARC.toast('Elige a quién'); return; }
    var b = ARC.lib.data().books.filter(function (x) { return x.id === el.dataset.b; })[0];
    api('POST', '/rest/v1/gifts', { from_user: C.uid, to_user: SO.pick, title: b.title, author: b.author || '', message: ($('#so_msg').value || '').trim() }, { Prefer: 'return=minimal' }).then(function () { ARC.toast('Aviso enviado 🎁'); ARC.closeModal(); if (A.bkShareFile) A.bkShareFile({ dataset: { id: b.id } }); }).catch(function (e) { ARC.toast(e.message); });
  };

  start();
})();
