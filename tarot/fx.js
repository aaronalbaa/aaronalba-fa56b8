/* Efectos: cielo estrellado animado, aparición al hacer scroll, inclinación 3D en escritorio y contadores. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv = document.getElementById('fx');

  /* ---------- cielo de estrellas ---------- */
  if (cv && cv.getContext && !reduce) {
    var c = cv.getContext('2d'), W = 0, H = 0, dpr = 1, stars = [], shoot = null, last = 0, running = true;
    var resize = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(120, Math.round(W * H / 11000)); stars = [];
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + 0.25, p: Math.random() * 6.28, s: 0.4 + Math.random() * 1.4, g: Math.random() < 0.18 });
    };
    var frame = function (t) {
      if (!running) return;
      if (t - last > 33) { // ~30 fps
        last = t; c.clearRect(0, 0, W, H);
        for (var i = 0; i < stars.length; i++) {
          var s = stars[i], a = 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t / 1000 * s.s + s.p));
          c.globalAlpha = a; c.fillStyle = s.g ? '#e6c97a' : '#ffffff'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 6.283); c.fill();
          s.y -= 0.02 * s.s; if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
        }
        if (!shoot && Math.random() < 0.0035) shoot = { x: Math.random() * W * 0.8, y: Math.random() * H * 0.4, vx: 6 + Math.random() * 4, vy: 3 + Math.random() * 2, life: 1 };
        if (shoot) {
          var g = c.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 8, shoot.y - shoot.vy * 8);
          g.addColorStop(0, 'rgba(255,255,255,' + shoot.life + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
          c.globalAlpha = 1; c.strokeStyle = g; c.lineWidth = 1.5; c.beginPath(); c.moveTo(shoot.x, shoot.y); c.lineTo(shoot.x - shoot.vx * 8, shoot.y - shoot.vy * 8); c.stroke();
          shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life -= 0.02; if (shoot.life <= 0 || shoot.x > W + 40) shoot = null;
        }
      }
      requestAnimationFrame(frame);
    };
    resize(); window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(frame); });
    requestAnimationFrame(frame);
  }

  /* ---------- aparición al entrar en pantalla + contadores ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; el.classList.add('in'); io.unobserve(el);
      var cnt = el.querySelector && el.querySelector('[data-count]');
      if (cnt && !reduce) countUp(cnt);
    });
  }, { threshold: 0.08 }) : null;

  function countUp(el) {
    var to = parseInt(el.getAttribute('data-count'), 10); if (isNaN(to) || to > 999) return;
    var t0 = performance.now(), dur = 700;
    (function tick(t) { var k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); else el.textContent = to; })(t0);
  }

  var SEL = '.rd, .tile, .entry, .panel, .numc, .pl, .hcard, .mini, .bk, .gcard, .rit, .lib, .area, .cert, .fbar, .phases > div, .facts > div';
  function scan(root) {
    if (!io || reduce) return;
    var nodes = (root || document).querySelectorAll(SEL), delay = 0;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i]; if (n.classList.contains('reveal')) continue;
      n.classList.add('reveal'); n.style.transitionDelay = Math.min(delay, 240) + 'ms'; delay += 40; io.observe(n);
    }
  }
  var view = document.getElementById('view');
  if (view && 'MutationObserver' in window) {
    var pending = false;
    new MutationObserver(function () { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; scan(view); }); }).observe(view, { childList: true, subtree: true });
  }

  /* ---------- inclinación 3D (solo ratón) ---------- */
  if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    var cur = null;
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('.tile, .tcard.flipped, .bk, .gcard, .rit, .numc');
      if (cur && cur !== el) { cur.style.removeProperty('--rx'); cur.style.removeProperty('--ry'); }
      cur = el; if (!el) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg'); el.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
    });
  }

  window.FX = { scan: scan, countUp: countUp };
})();
