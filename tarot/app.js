/* Arranque de Arcana */
if (ARC.grim) ARC.grim.register();
ARC.boot();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(function () { /* sin sw */ });
