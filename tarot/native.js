/* Puente con la app nativa (iOS/macOS). Fuera de la app no hace nada. */
(function () {
  'use strict';
  var h = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.arcana;
  if (!h) return;
  document.documentElement.classList.add('native');
  document.documentElement.classList.add(/Mac/.test(navigator.platform || '') && !(navigator.maxTouchPoints > 1) ? 'native-mac' : 'native-ios');
  function snap() {
    try { var o = {}; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf('arcana') === 0) o[k] = localStorage.getItem(k); } h.postMessage({ t: 'backup', data: JSON.stringify(o) }); } catch (e) { /* nada */ }
  }
  setInterval(snap, 15000);
  document.addEventListener('visibilitychange', function () { if (document.hidden) snap(); });
  window.addEventListener('pagehide', snap);
  function haptic(s) { try { h.postMessage({ t: 'haptic', s: s || 'light' }); } catch (e) { /* nada */ } }
  window.ARC = window.ARC || {}; window.ARC.native = { haptic: haptic, backup: snap };
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('#tabs button, .btn.primary, .chips button, .tile, .door');
    if (el) haptic(el.closest('#tabs') ? 'soft' : 'light');
  }, true);
})();
