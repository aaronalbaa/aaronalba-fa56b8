/* Biblioteca · lectura de archivos: EPUB (zip propio), TXT/MD/HTML y PDF (pdf.js bajo demanda), almacenamiento IndexedDB y generador de preguntas sin conexión. */
(function () {
  'use strict';
  var ARC = window.ARC;
  var LP = ARC.lp = {};

  /* ---------- IndexedDB ---------- */
  var dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      var r = indexedDB.open('arcana-lib', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('books', { keyPath: 'id' }); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
    return dbp;
  }
  function tx(mode, fn) { return db().then(function (d) { return new Promise(function (res, rej) { var t = d.transaction('books', mode), s = t.objectStore('books'), q = fn(s); t.oncomplete = function () { res(q && q.result); }; t.onerror = function () { rej(t.error); }; }); }); }
  LP.put = function (rec) { return tx('readwrite', function (s) { return s.put(rec); }); };
  LP.get = function (id) { return tx('readonly', function (s) { return s.get(id); }); };
  LP.del = function (id) { return tx('readwrite', function (s) { return s.delete(id); }); };

  /* ---------- ZIP mínimo ---------- */
  function u16(v, o) { return v.getUint16(o, true); } function u32(v, o) { return v.getUint32(o, true); }
  function inflate(bytes) { return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer(); }
  LP.unzip = function (buf) {
    var v = new DataView(buf), u8 = new Uint8Array(buf), i = buf.byteLength - 22, files = {};
    while (i >= 0 && u32(v, i) !== 0x06054b50) i--;
    if (i < 0) throw new Error('Archivo ZIP no válido');
    var n = u16(v, i + 10), p = u32(v, i + 16);
    for (var k = 0; k < n; k++) {
      if (u32(v, p) !== 0x02014b50) break;
      var method = u16(v, p + 10), csize = u32(v, p + 20), nl = u16(v, p + 28), el = u16(v, p + 30), cl = u16(v, p + 32), lo = u32(v, p + 42);
      var name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl));
      files[name] = { method: method, csize: csize, lo: lo };
      p += 46 + nl + el + cl;
    }
    function read(name) {
      var f = files[name]; if (!f) return Promise.reject(new Error('No existe ' + name));
      var lnl = u16(v, f.lo + 26), lel = u16(v, f.lo + 28), st = f.lo + 30 + lnl + lel, data = u8.subarray(st, st + f.csize);
      if (f.method === 0) return Promise.resolve(data.slice().buffer);
      if (f.method === 8) return inflate(data);
      return Promise.reject(new Error('Compresión no soportada'));
    }
    return { names: Object.keys(files), read: read, text: function (n) { return read(n).then(function (b) { return new TextDecoder('utf-8').decode(b); }); } };
  };

  /* ---------- saneado de HTML a un subconjunto seguro ---------- */
  var BLOCK = { DIV: 1, SECTION: 1, ARTICLE: 1, MAIN: 1, HEADER: 1, FOOTER: 1, BODY: 1, FIGURE: 1, ASIDE: 1, NAV: 0, TABLE: 1, TBODY: 1, TR: 1, TD: 1, TH: 1, DL: 1, DD: 1, DT: 1, FIGCAPTION: 1, CENTER: 1 };
  var SKIP = { SCRIPT: 1, STYLE: 1, HEAD: 1, TITLE: 1, SVG: 1, NAV: 1, NOSCRIPT: 1, META: 1, LINK: 1 };
  function escH(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function sanitize(root, imgMap) {
    function inline(node) {
      if (node.nodeType === 3) return escH(node.nodeValue.replace(/\s+/g, ' '));
      if (node.nodeType !== 1 || SKIP[node.tagName]) return '';
      var t = node.tagName, inner = Array.prototype.map.call(node.childNodes, inline).join('');
      if (t === 'EM' || t === 'I' || t === 'CITE') return inner ? '<em>' + inner + '</em>' : '';
      if (t === 'STRONG' || t === 'B') return inner ? '<strong>' + inner + '</strong>' : '';
      if (t === 'BR') return '<br>';
      if (t === 'IMG') { var s = node.getAttribute('src') || '', u = imgMap && imgMap(s); return u ? '<img src="' + u + '" alt="">' : ''; }
      return inner;
    }
    function blocks(node) {
      var out = [], buf = '';
      function flush() { var t = buf.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').trim(); if (t || /<img/.test(buf)) out.push('<p>' + buf.trim() + '</p>'); buf = ''; }
      Array.prototype.forEach.call(node.childNodes, function (c) {
        if (c.nodeType === 3) { buf += escH(c.nodeValue.replace(/\s+/g, ' ')); return; }
        if (c.nodeType !== 1 || SKIP[c.tagName]) return;
        var t = c.tagName;
        if (/^H[1-6]$/.test(t)) { flush(); var h = inline(c).trim(); if (h) out.push('<h' + (t === 'H1' ? 2 : 3) + '>' + h + '</h' + (t === 'H1' ? 2 : 3) + '>'); }
        else if (t === 'P') { flush(); var p = inline(c).trim(); if (p) out.push('<p>' + p + '</p>'); }
        else if (t === 'BLOCKQUOTE') { flush(); var q = blocks(c).join('\n'); if (q) out.push('<blockquote>' + q + '</blockquote>'); }
        else if (t === 'UL' || t === 'OL') { flush(); var li = Array.prototype.map.call(c.children, function (x) { var s2 = inline(x).trim(); return s2 ? '<li>' + s2 + '</li>' : ''; }).join(''); if (li) out.push('<' + t.toLowerCase() + '>' + li + '</' + t.toLowerCase() + '>'); }
        else if (t === 'HR') { flush(); out.push('<hr>'); }
        else if (t === 'PRE') { flush(); var pr = c.textContent.trim(); if (pr) out.push('<p>' + escH(pr).replace(/\n/g, '<br>') + '</p>'); }
        else if (BLOCK[t]) { flush(); out = out.concat(blocks(c)); }
        else buf += inline(c);
      });
      flush(); return out;
    }
    return blocks(root).join('\n');
  }
  LP.sanitize = sanitize;
  function textOf(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent; }
  LP.textOf = textOf;
  function wc(html) { var t = textOf(html).trim(); return t ? t.split(/\s+/).length : 0; }

  /* ---------- EPUB ---------- */
  function resolve(base, rel) {
    var parts = (base ? base.split('/') : []).concat(decodeURIComponent(rel.split('#')[0]).split('/')), out = [];
    parts.forEach(function (x) { if (x === '..') out.pop(); else if (x && x !== '.') out.push(x); });
    return out.join('/');
  }
  LP.parseEpub = function (buf) {
    var z = LP.unzip(buf), blobs = [];
    return z.text('META-INF/container.xml').then(function (cx) {
      var m = /full-path="([^"]+)"/.exec(cx); if (!m) throw new Error('EPUB sin contenido');
      var opfPath = m[1], dir = opfPath.indexOf('/') > -1 ? opfPath.replace(/\/[^/]*$/, '') : '';
      return z.text(opfPath).then(function (opf) {
        var doc = new DOMParser().parseFromString(opf, 'application/xml'), man = {}, spine = [];
        var q = function (sel) { return doc.querySelector(sel); };
        Array.prototype.forEach.call(doc.getElementsByTagName('item'), function (it) { man[it.getAttribute('id')] = { href: it.getAttribute('href'), type: it.getAttribute('media-type') }; });
        Array.prototype.forEach.call(doc.getElementsByTagName('itemref'), function (r) { var it = man[r.getAttribute('idref')]; if (it && /html|xml/.test(it.type)) spine.push(it.href); });
        var title = (doc.getElementsByTagName('dc:title')[0] || {}).textContent || '', author = (doc.getElementsByTagName('dc:creator')[0] || {}).textContent || '';
        var chain = Promise.resolve(), chapters = [];
        spine.forEach(function (href) {
          chain = chain.then(function () {
            var path = resolve(dir, href), cdir = path.indexOf('/') > -1 ? path.replace(/\/[^/]*$/, '') : '';
            return z.text(path).then(function (src) {
              var d = new DOMParser().parseFromString(src, 'text/html'), imgs = [];
              var tasks = [];
              Array.prototype.forEach.call(d.querySelectorAll('img'), function (im) {
                var p = resolve(cdir, im.getAttribute('src') || ''); if (!z.names.some(function (n) { return n === p; })) return;
                tasks.push(z.read(p).then(function (b) { var ext = (p.split('.').pop() || 'png').toLowerCase(); var u = URL.createObjectURL(new Blob([b], { type: ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'image/' + ext })); blobs.push(u); imgs[im.getAttribute('src')] = u; }).catch(function () { /* sin imagen */ }));
              });
              return Promise.all(tasks).then(function () {
                var html = sanitize(d.body || d.documentElement, function (s) { return imgs[s]; });
                var h = /<h[23]>(.*?)<\/h[23]>/.exec(html);
                chapters.push({ t: h ? textOf(h[1]).slice(0, 80) : '', h: html, w: wc(html) });
              });
            }).catch(function () { /* capítulo ilegible */ });
          });
        });
        return chain.then(function () {
          // une portadas y páginas vacías con el siguiente capítulo
          var merged = [], carry = '';
          chapters.forEach(function (c) { if (c.w < 60 && !/<img/.test(c.h)) { carry += c.h + '\n'; return; } c.h = carry + c.h; carry = ''; c.w = wc(c.h); merged.push(c); });
          if (carry && merged.length) { merged[merged.length - 1].h += '\n' + carry; }
          merged.forEach(function (c, i) { if (!c.t) c.t = 'Parte ' + (i + 1); });
          return { title: title.trim(), author: author.trim(), chapters: merged };
        });
      });
    });
  };

  /* ---------- texto plano / HTML ---------- */
  var HEAD = /^\s*(cap[ií]tulo|chapter|libro|book|parte|part|secci[oó]n|acto|canto|tratado|[ivxlc]{1,7}\.?)\s*[\dIVXLC]*[\.\:\-—]?\s*(.{0,80})$/i;
  LP.parseText = function (txt, title) {
    txt = txt.replace(/\r\n?/g, '\n');
    var lines = txt.split('\n'), chs = [], cur = { t: '', lines: [] };
    function push() { var body = cur.lines.join('\n').trim(); if (body) chs.push({ t: cur.t, body: body }); }
    lines.forEach(function (ln) {
      var md = /^#{1,3}\s+(.+)$/.exec(ln);
      var heading = md ? md[1] : (ln.trim().length > 0 && ln.trim().length < 70 && HEAD.test(ln) && /^\s*(cap|chap|libro|book|parte|part|secci|acto|canto|trat)/i.test(ln) ? ln.trim() : null);
      if (heading) { push(); cur = { t: heading.slice(0, 80), lines: [] }; } else cur.lines.push(ln);
    });
    push();
    if (chs.length < 2) { // sin títulos: trozos de ~4500 palabras
      var paras = txt.split(/\n\s*\n/), acc = [], n = 0; chs = [];
      paras.forEach(function (p) { var w = p.trim().split(/\s+/).length; acc.push(p); n += w; if (n >= 4500) { chs.push({ t: '', body: acc.join('\n\n') }); acc = []; n = 0; } });
      if (acc.join('').trim()) chs.push({ t: '', body: acc.join('\n\n') });
    }
    var out = chs.map(function (c, i) {
      var h = c.body.split(/\n\s*\n/).map(function (p) { p = p.replace(/\n(?!\n)/g, ' ').replace(/\s+/g, ' ').trim(); return p ? '<p>' + escH(p) + '</p>' : ''; }).filter(Boolean).join('\n');
      if (c.t) h = '<h2>' + escH(c.t) + '</h2>\n' + h;
      return { t: c.t || (chs.length > 1 ? 'Parte ' + (i + 1) : title || 'Texto'), h: h, w: wc(h) };
    });
    return { title: title || '', author: '', chapters: out };
  };
  LP.parseHtml = function (src, title) {
    var d = new DOMParser().parseFromString(src, 'text/html'), html = sanitize(d.body, null);
    var parts = html.split(/(?=<h2>)/), chs = parts.filter(function (p) { return p.trim(); }).map(function (p, i) { var h = /<h[23]>(.*?)<\/h[23]>/.exec(p); return { t: h ? textOf(h[1]).slice(0, 80) : 'Parte ' + (i + 1), h: p, w: wc(p) }; });
    if (!chs.length) chs = [{ t: title || 'Texto', h: html, w: wc(html) }];
    return { title: (d.title || title || '').trim(), author: '', chapters: chs };
  };

  /* ---------- PDF (pdf.js desde CDN, solo si hay conexión) ---------- */
  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = PDFJS + 'pdf.min.js';
      s.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; res(window.pdfjsLib); };
      s.onerror = function () { rej(new Error('Sin conexión para cargar el lector de PDF')); };
      document.head.appendChild(s);
    });
  }
  LP.parsePdf = function (buf, title, onProg) {
    return loadPdfJs().then(function (lib) { return lib.getDocument({ data: buf.slice(0) }).promise; }).then(function (pdf) {
      var paras = [], chain = Promise.resolve();
      for (var i = 1; i <= pdf.numPages; i++) (function (n) {
        chain = chain.then(function () { return pdf.getPage(n); }).then(function (pg) { return pg.getTextContent(); }).then(function (tc) {
          var lastY = null, line = '', lh = 12, cur = '', lines = [];
          tc.items.forEach(function (it) {
            if (!it.str && !it.hasEOL) return;
            var y = it.transform[5]; lh = Math.max(lh, Math.abs(it.transform[3]) || lh);
            if (lastY !== null && Math.abs(y - lastY) > lh * 0.5) { lines.push({ s: line.trim(), gap: Math.abs(y - lastY) }); line = ''; }
            line += it.str + (it.hasEOL ? ' ' : ''); lastY = y;
          });
          if (line.trim()) lines.push({ s: line.trim(), gap: 0 });
          lines.forEach(function (l, k) {
            if (/\w-$/.test(cur)) cur = cur.slice(0, -1); else if (cur) cur += ' ';
            cur += l.s;
            if (l.gap > lh * 1.7 || k === lines.length - 1 && /[.!?»”"]$/.test(cur)) { if (cur.trim()) paras.push(cur.trim()); cur = ''; }
          });
          if (cur.trim()) paras.push(cur.trim());
          if (onProg) onProg(n, pdf.numPages);
        });
      })(i);
      return chain.then(function () { return pdf.getMetadata().catch(function () { return {}; }); }).then(function (meta) {
        var info = (meta && meta.info) || {};
        var chs = [], acc = [], w = 0;
        paras.forEach(function (p) { acc.push('<p>' + escH(p) + '</p>'); w += p.split(/\s+/).length; if (w >= 3500) { chs.push({ t: '', h: acc.join('\n'), w: w }); acc = []; w = 0; } });
        if (acc.length) chs.push({ t: '', h: acc.join('\n'), w: w });
        chs.forEach(function (c, i) { c.t = 'Parte ' + (i + 1); });
        if (!chs.length) throw new Error('El PDF no tiene texto seleccionable (puede ser un escaneo)');
        return { title: (info.Title || title || '').trim(), author: (info.Author || '').trim(), chapters: chs };
      });
    });
  };

  LP.parseFile = function (file, onProg) {
    var name = file.name || 'libro', ext = (name.split('.').pop() || '').toLowerCase(), base = name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
    if (ext === 'epub') return file.arrayBuffer().then(LP.parseEpub).then(function (r) { r.fmt = 'epub'; r.title = r.title || base; return r; });
    if (ext === 'pdf') return file.arrayBuffer().then(function (b) { return LP.parsePdf(b, base, onProg); }).then(function (r) { r.fmt = 'pdf'; r.title = r.title || base; return r; });
    if (ext === 'html' || ext === 'htm' || ext === 'xhtml') return file.text().then(function (s) { var r = LP.parseHtml(s, base); r.fmt = 'html'; r.title = r.title || base; return r; });
    return file.text().then(function (s) { var r = LP.parseText(s, base); r.fmt = 'txt'; r.title = r.title || base; return r; });
  };

  /* ---------- preguntas sin conexión (huecos de texto) ---------- */
  var STOP = ('que como pero porque cuando donde desde hasta entre sobre bajo ante tras para por con sin del las los una uno unos unas este esta estos estas esto aquel aquella ese esa esos esas muy mas menos todo toda todos todas cada otro otra otros otras mismo misma tambien aunque siempre nunca ahora entonces donde quien cual cuales the and that with from this have were which their there would about into than them these those what when will your been more some other could after before while where because through between').split(' ');
  function strip(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  LP.sentences = function (text) {
    var out = [], re = /[^.!?\n]+[.!?]+["»”)]*/g, m;
    while ((m = re.exec(text))) { var s = m[0].trim(); if (s.split(/\s+/).length >= 9 && s.split(/\s+/).length <= 34) out.push({ s: s, at: m.index + m[0].indexOf(s) }); }
    return out;
  };
  LP.cloze = function (text, n) {
    var sents = LP.sentences(text), pool = {}, words = text.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{6,}/g) || [];
    words.forEach(function (w) { var k = strip(w); if (STOP.indexOf(k) < 0) pool[k] = w; });
    var keys = Object.keys(pool), qs = [], order = ARC.shuffle(sents.length);
    for (var i = 0; i < order.length && qs.length < n; i++) {
      var se = sents[order[i]], cands = (se.s.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{6,}/g) || []).filter(function (w) { return STOP.indexOf(strip(w)) < 0; });
      if (!cands.length) continue;
      var ans = cands[ARC.rnd(cands.length)], ak = strip(ans);
      var dis = keys.filter(function (k) { return k !== ak && Math.abs(k.length - ak.length) <= 2 && k[0] !== ak[0]; });
      if (dis.length < 3) continue;
      var opts = [ans]; ARC.shuffle(dis.length).slice(0, 3).forEach(function (j) { opts.push(pool[dis[j]]); });
      var perm = ARC.shuffle(4), shuffled = perm.map(function (j) { return opts[j]; });
      qs.push({ q: 'Completa la frase del texto:\n«' + se.s.replace(ans, '_____') + '»', options: shuffled, answer: shuffled.indexOf(ans), explain: 'En el texto: «' + se.s + '»', quote: se.s, at: se.at });
    }
    return qs;
  };
})();
