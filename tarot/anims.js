/* Animaciones de las lecciones: HTML + pequeños scripts. */
(function () {
  'use strict';
  const ARC = window.ARC, $ = ARC.$, $$ = ARC.$$;
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
      case 'runes': {
        const rs = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'.split('');
        return '<div class="anim zod runes"><div class="wheel">' + rs.map((s, i) => '<span class="glyph" style="transform:rotate(' + (i * 15) + 'deg) translateY(-74px) rotate(' + (-i * 15) + 'deg)">' + s + '</span>').join('') + '</div><b class="sun glyph">ᛟ</b></div>';
      }
      case 'tree': {
        const P = [[100, 20, 'Kéter'], [155, 55, 'Jojmá'], [45, 55, 'Biná'], [155, 110, 'Jésed'], [45, 110, 'Gueburá'], [100, 130, 'Tiféret'], [155, 175, 'Nétsaj'], [45, 175, 'Hod'], [100, 200, 'Yesod'], [100, 245, 'Maljut']];
        const L = [[0, 1], [0, 2], [0, 5], [1, 2], [1, 5], [1, 3], [2, 5], [2, 4], [3, 4], [3, 5], [4, 5], [3, 6], [4, 7], [5, 6], [5, 7], [5, 8], [6, 7], [6, 8], [7, 8], [6, 9], [7, 9], [8, 9]];
        return '<div class="anim tree"><svg viewBox="0 0 200 262" height="180">' + L.map(l => '<line x1="' + P[l[0]][0] + '" y1="' + P[l[0]][1] + '" x2="' + P[l[1]][0] + '" y2="' + P[l[1]][1] + '" stroke="#e6c97a55" stroke-width="1.2"/>').join('') +
          P.map((p, i) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="10" class="sph" style="animation-delay:' + (i * 0.3) + 's"/>').join('') + '</svg></div>';
      }
      case 'wheel': {
        const sb = ['🕯️', '❄️', '🕊️', '🐣', '🌸', '☀️', '🌾', '🍂'];
        return '<div class="anim zod wyear"><div class="wheel">' + sb.map((s, i) => '<span style="transform:rotate(' + (i * 45) + 'deg) translateY(-70px) rotate(' + (-i * 45) + 'deg)">' + s + '</span>').join('') + '</div><b class="sun">🌍</b></div>';
      }
      case 'pentagram':
        return '<div class="anim penta"><svg viewBox="0 0 120 120" height="170"><circle cx="60" cy="60" r="52" class="pc1"/><polygon class="pg1" points="60,10 95,108 10,45 110,45 25,108"/></svg></div>';
      case 'yinyang':
        return '<div class="anim yy"><svg viewBox="0 0 100 100" height="150" class="yysvg"><circle cx="50" cy="50" r="46" fill="#f2ead2"/><path d="M50 4a46 46 0 0 1 0 92a23 23 0 0 1 0-46a23 23 0 0 0 0-46" fill="#15121f"/><circle cx="50" cy="27" r="7" fill="#15121f"/><circle cx="50" cy="73" r="7" fill="#f2ead2"/></svg></div>';
      case 'alchemy':
        return '<div class="anim alch"><div class="orbs"><i class="o1"></i><i class="o2"></i><i class="o3"></i></div><div class="alname">Nigredo</div></div>';
      case 'flower': {
        let c = '<circle cx="60" cy="60" r="20" style="animation-delay:0s"/>';
        for (let i = 0; i < 6; i++) c += '<circle cx="' + (60 + 20 * Math.cos(i * Math.PI / 3)).toFixed(1) + '" cy="' + (60 + 20 * Math.sin(i * Math.PI / 3)).toFixed(1) + '" r="20" style="animation-delay:' + ((i + 1) * 0.35) + 's"/>';
        return '<div class="anim flower"><svg viewBox="0 0 120 120" height="170">' + c + '</svg></div>';
      }
      case 'yggdrasil': {
        let o = '';
        for (let i = 0; i < 9; i++) o += '<i style="--a:' + (i * 40) + 'deg;animation-delay:' + (i * 0.4) + 's"></i>';
        return '<div class="anim ygg"><div class="orbit">' + o + '</div><b>🌳</b></div>';
      }
      case 'sun':
        return '<div class="anim sunr"><div class="rays"></div><b>☀️</b></div>';
      case 'cauldron': {
        let b = '';
        for (let i = 0; i < 7; i++) b += '<i style="left:' + (38 + i * 4.5) + '%;animation-delay:' + (i * 0.45) + 's"></i>';
        return '<div class="anim caul"><div class="bubbles">' + b + '</div><b>🫕</b></div>';
      }
      case 'herbs':
        return '<div class="anim gems herbs"><span style="--d:0s">🌿</span><span style="--d:.4s">🍃</span><span style="--d:.8s">🌱</span><span style="--d:1.2s">🌾</span><span style="--d:1.6s">🍀</span></div>';
      case 'ankh':
        return '<div class="anim ankh"><b>☥</b></div>';
      case 'wave': {
        let w = '';
        for (let i = 0; i < 26; i++) w += '<i style="animation-delay:' + (i * 0.06) + 's"></i>';
        return '<div class="anim wave">' + w + '</div>';
      }
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
    const al = $('.alch', root);
    if (al) {
      const names = ['Nigredo · lo oscuro', 'Albedo · la purificación', 'Rubedo · la integración'];
      let i = 0; const lab = $('.alname', al);
      const tick = () => { lab.textContent = names[i % 3]; al.dataset.s = i % 3; i++; };
      tick(); const iv = setInterval(tick, 2200); cleanups.push(() => clearInterval(iv));
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


  ARC.anim = { html: animHTML, init: initAnim, clear: clearAnims };
})();
