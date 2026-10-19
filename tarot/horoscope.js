/* Textos y generadores: planetas, Luna, horóscopo diario, zodiaco chino, numerología e introspección. */
(function () {
  'use strict';
  var A = ASTRO, S = A.SIGNS;

  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = hash(String(seed)); return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function pick(arr, r) { return arr[Math.floor(r() * arr.length)]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function key(date) { return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(); }

  var STYLE = [
    'con impulso, franqueza y algo de prisa', 'con calma, constancia y apego al placer', 'con curiosidad, ingenio y cambios de ritmo',
    'con sensibilidad, memoria y ganas de proteger', 'con calidez, orgullo y ganas de brillar', 'con precisión, análisis y sentido práctico',
    'buscando equilibrio, armonía y acuerdos', 'con intensidad, profundidad y deseo de verdad', 'con optimismo, libertad y sed de sentido',
    'con disciplina, ambición y realismo', 'con originalidad, distancia y visión de futuro', 'con empatía, imaginación y sensibilidad difusa'
  ];
  var MOONMOOD = [
    'El ánimo pide acción directa y ganas de moverse.', 'El ánimo pide calma, comodidad y placeres sencillos.',
    'La mente está curiosa y con ganas de conversar.', 'La sensibilidad está a flor de piel; busca refugio y cuidado.',
    'Hay calidez, ganas de expresarse y de ser visto.', 'Es un buen día para ordenar, afinar detalles y ser útil.',
    'Se busca armonía, diplomacia y buena compañía.', 'Las emociones se sienten intensas y profundas.',
    'Hay optimismo y ganas de explorar o aprender algo nuevo.', 'El ánimo es serio y enfocado en metas y responsabilidades.',
    'Hay independencia mental y ganas de ideas distintas.', 'La intuición se agudiza; también la sensibilidad y el cansancio emocional.'
  ];

  var PLANETS = {
    'Sol': { g: '☉', kw: 'la vitalidad y la identidad', retro: '' },
    'Luna': { g: '☽', kw: 'las emociones y las necesidades', retro: '' },
    'Mercurio': { g: '☿', kw: 'la mente y la comunicación', retro: 'Mercurio retrógrado: revisa mensajes, contratos y planes; repite, reorganiza y evita empezar cosas importantes sin revisar los detalles.' },
    'Venus': { g: '♀', kw: 'el afecto, los valores y el placer', retro: 'Venus retrógrada: replantea vínculos y valores; evita decisiones impulsivas en amor o dinero.' },
    'Marte': { g: '♂', kw: 'la acción y el deseo', retro: 'Marte retrógrado: la energía se vuelve hacia dentro; ten paciencia con proyectos y evita choques innecesarios.' },
    'Júpiter': { g: '♃', kw: 'la expansión y el aprendizaje', retro: 'Júpiter retrógrado: la expansión se vuelve interior; revisa creencias y qué quieres de verdad hacer crecer.' },
    'Saturno': { g: '♄', kw: 'la estructura y la responsabilidad', retro: 'Saturno retrógrado: momento de revisar compromisos, límites y estructuras que ya no te sostienen.' },
    'Urano': { g: '♅', kw: 'el cambio y la libertad', retro: 'Urano retrógrado: los cambios se procesan por dentro; observa qué quiere liberarse en ti.' },
    'Neptuno': { g: '♆', kw: 'los sueños y la intuición', retro: 'Neptuno retrógrado: se disuelven ilusiones y gana claridad lo que es real.' },
    'Nodo Norte': { g: '☊', kw: 'el rumbo de crecimiento', retro: '' }
  };
  var SHORT = { 'Sol': 'identidad', 'Luna': 'emoción', 'Mercurio': 'mente', 'Venus': 'afecto', 'Marte': 'acción', 'Júpiter': 'expansión', 'Saturno': 'estructura', 'Urano': 'cambio', 'Neptuno': 'intuición' };
  var SLOW = { 'Júpiter': 'Permanece cerca de un año en cada signo.', 'Saturno': 'Permanece unos dos años y medio en cada signo.', 'Urano': 'Permanece unos siete años en cada signo.', 'Neptuno': 'Permanece unos catorce años en cada signo: es un clima generacional.' };

  function fmtDeg(p) { var d = Math.floor(p.deg), m = Math.floor((p.deg - d) * 60); return d + '° ' + (m < 10 ? '0' : '') + m + '′'; }

  function planetText(p) {
    var meta = PLANETS[p.id], t;
    if (p.id === 'Nodo Norte') t = 'El Nodo Norte en ' + S[p.sign].n + ' marca un rumbo de crecimiento ' + STYLE[p.sign] + '.';
    else t = 'En ' + S[p.sign].n + ', ' + meta.kw + ' se viven ' + STYLE[p.sign] + '.';
    if (p.status === 'retrógrado' && meta.retro) t += ' ' + meta.retro;
    if (p.status === 'estacionario') t += ' Está casi detenido: su efecto se siente más concentrado.';
    if (SLOW[p.id]) t += ' ' + SLOW[p.id];
    return t;
  }

  function planetPhaseNote(p) {
    if (p.id === 'Mercurio' || p.id === 'Venus') {
      var vis = p.elong > 0 ? 'Estrella vespertina (visible tras la puesta del Sol)' : 'Estrella matutina (visible antes del amanecer)';
      var ill = Math.round(p.illum * 100) + '% iluminado';
      return vis + ' · ' + ill;
    }
    if (p.id === 'Marte') return Math.round(p.illum * 100) + '% iluminado';
    if (p.elong !== undefined) {
      var e = Math.abs(p.elong);
      if (e > 165) return 'Cerca de la oposición: brilla más y está más cerca de la Tierra';
      if (e < 15) return 'Muy cerca del Sol: apenas visible';
    }
    return '';
  }

  var ASP = {
    'conjunción': 'se fusionan y se potencian', 'sextil': 'colaboran con facilidad si das el primer paso',
    'cuadratura': 'generan una fricción que pide ajustes', 'trígono': 'fluyen con naturalidad', 'oposición': 'piden equilibrar dos polos'
  };
  function aspectText(a) {
    return cap(SHORT[a.a]) + ' y ' + SHORT[a.b] + ' ' + ASP[a.type] + '.';
  }

  function skyWeather(planets, mi) {
    var retro = planets.filter(function (p) { return p.status === 'retrógrado' && ['Mercurio', 'Venus', 'Marte'].indexOf(p.id) > -1; });
    var t = 'La Luna está en ' + S[mi.sign].n + ' y el Sol en ' + S[planets[0].sign].n + '. ';
    if (retro.length) t += retro.map(function (p) { return p.id; }).join(' y ') + (retro.length > 1 ? ' están retrógrados' : (retro[0].id === 'Venus' ? ' está retrógrada' : ' está retrógrado')) + ': ritmo de revisión. ';
    else t += 'Los planetas personales avanzan en directo: buen momento para empezar y decidir. ';
    return t.trim();
  }

  /* ---------- Luna ---------- */
  var PHASE_TXT = {
    'Luna nueva': ['Es momento de sembrar. Escribe una intención sencilla y pregúntate qué quieres cultivar en este ciclo.', ['¿Qué quiero que nazca en las próximas semanas?', '¿Qué necesito soltar para tener espacio?']],
    'Luna creciente': ['La energía empieza a crecer. Da los primeros pasos pequeños hacia tu intención.', ['¿Cuál es el primer paso pequeño que puedo dar hoy?', '¿Qué me da ánimo para empezar?']],
    'Cuarto creciente': ['Aparece el primer reto. Ajusta, decide y no te rindas ante la fricción.', ['¿Qué obstáculo me está enseñando algo?', '¿Qué decisión llevo posponiendo?']],
    'Gibosa creciente': ['Pule los detalles y confía en el proceso; casi está madurando.', ['¿Qué necesito afinar antes del momento de culminar?', '¿Cómo estoy cuidando mi energía?']],
    'Luna llena': ['Máxima luz y emoción. Agradece lo logrado y observa lo que se hace evidente.', ['¿Qué ha salido a la luz en las últimas semanas?', '¿Por qué estoy agradecido/a hoy?']],
    'Gibosa menguante': ['Es momento de compartir lo aprendido y soltar lo que ya cumplió su función.', ['¿Qué aprendí que pueda compartir?', '¿Qué hábito ya no me sirve?']],
    'Cuarto menguante': ['Revisa y haz limpieza: perdona, suelta y ordena.', ['¿Qué necesito perdonar o soltar?', '¿Qué compromiso ya no me corresponde?']],
    'Luna menguante': ['Descanso e introspección antes de un nuevo ciclo. Baja el ritmo.', ['¿Qué necesita mi cuerpo y mi mente para descansar?', '¿Qué quiero dejar atrás antes de la luna nueva?']]
  };
  function moonText(mi) { return PHASE_TXT[mi.name] || PHASE_TXT['Luna nueva']; }

  /* ---------- Horóscopo diario ---------- */
  var HOUSE = [
    '', 'identidad y energía personal', 'dinero y valor propio', 'comunicación y entorno cercano', 'hogar y emociones profundas',
    'creatividad, amor y juego', 'rutinas, salud y trabajo diario', 'relaciones y pareja', 'transformación e intimidad',
    'viajes, estudios y sentido', 'carrera y metas', 'amistades y proyectos', 'descanso, cierre e inconsciente'
  ];
  var HOUSE_TIP = [
    '', 'Cuida cómo te presentas y qué necesitas tú.', 'Revisa tus gastos y lo que valoras.', 'Habla claro y escucha a quien tienes cerca.',
    'Busca un rato de recogimiento en casa.', 'Date permiso para disfrutar y crear.', 'Ordena una rutina que te haga bien.',
    'Escucha lo que pide una relación importante.', 'Atiende lo que sientes en profundidad, sin prisa.', 'Aprende algo nuevo o amplía tu mirada.',
    'Da un paso concreto hacia una meta.', 'Conecta con amistades o proyectos compartidos.', 'Descansa y deja que se asiente lo vivido.'
  ];
  var LOVE = {
    pos: ['El afecto fluye con facilidad: es un buen día para decir lo que sientes.', 'Hay química y buena disposición; atrévete a dar el primer paso.', 'Un gesto sencillo puede acercarte mucho a alguien.'],
    neu: ['Un día tranquilo en lo afectivo: cuida los detalles pequeños.', 'Escucha más de lo que hablas y las cosas se aclararán.', 'No fuerces nada: los vínculos se ordenan solos con tiempo.'],
    neg: ['Puede haber roces: respira antes de responder.', 'Evita dar por hecho lo que el otro siente; pregunta.', 'Hoy conviene dar espacio y no tomarte todo de forma personal.']
  };
  var WORK = {
    pos: ['Buen ritmo para avanzar: prioriza lo importante y acepta ayuda.', 'Tus ideas encuentran eco; compártelas con claridad.', 'Es un día favorable para cerrar tareas pendientes.'],
    neu: ['Avanza con constancia sin buscar resultados inmediatos.', 'Organiza tu agenda y evita multitarea.', 'Revisa un proyecto con calma antes de dar el siguiente paso.'],
    neg: ['La fricción pide paciencia: divide las tareas grandes en partes.', 'Evita decisiones importantes si estás cansado/a.', 'Si algo se atasca, pide perspectiva a otra persona.']
  };
  var ENERGY = {
    'nueva': 'Energía de comienzo: descansa y fija una pequeña intención.',
    'crece': 'Energía en alza: aprovecha para moverte y empezar.',
    'llena': 'Energía alta y emocional: canalízala y descansa por la noche.',
    'mengua': 'Energía que baja: prioriza el descanso y la limpieza.'
  };
  var COLORS = ['azul', 'verde', 'dorado', 'violeta', 'blanco', 'rojo', 'naranja', 'plata', 'turquesa', 'rosa'];

  function phaseKey(mi) { var p = mi.phase; return p < 0.06 || p > 0.94 ? 'nueva' : (p < 0.44 ? 'crece' : (p < 0.56 ? 'llena' : 'mengua')); }

  function daily(signIdx, date) {
    var d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    var mi = A.moonInfo(d), pl = A.planets(d);
    var r = rng('daily|' + key(date) + '|' + signIdx);
    var house = ((mi.sign - signIdx + 12) % 12) + 1;
    var dist = (mi.sign - signIdx + 12) % 12;
    var adj = ({ 0: 0, 2: 1, 10: 1, 3: -1, 9: -1, 4: 1, 8: 1, 6: -1 })[dist] || 0;
    var tone = adj > 0 ? 'pos' : (adj < 0 ? 'neg' : 'neu');
    function stars(extra) { return Math.max(1, Math.min(5, 3 + adj + extra + (r() < 0.25 ? 1 : (r() < 0.2 ? -1 : 0)))); }
    var retro = pl.filter(function (p) { return p.status === 'retrógrado' && ['Mercurio', 'Venus', 'Marte'].indexOf(p.id) > -1; });
    var intro = 'La Luna transita por ' + S[mi.sign].n + ' y pasa por tu casa ' + house + ' (' + HOUSE[house] + '). ' + MOONMOOD[mi.sign];
    var areas = [
      { k: 'Amor', e: '💞', s: stars(house === 5 || house === 7 ? 1 : 0), t: pick(LOVE[tone], r) },
      { k: 'Trabajo', e: '💼', s: stars(house === 6 || house === 10 ? 1 : 0), t: pick(WORK[tone], r) },
      { k: 'Energía', e: '⚡', s: stars(0), t: ENERGY[phaseKey(mi)] }
    ];
    var notes = [];
    if (retro.length) notes.push(PLANETS[retro[0].id].retro);
    return {
      sign: signIdx, moon: mi, house: house, intro: intro, tip: HOUSE_TIP[house], areas: areas, notes: notes,
      lucky: { n: 1 + Math.floor(r() * 99), c: pick(COLORS, r) }
    };
  }

  /* ---------- Zodiaco chino ---------- */
  var CN = [
    { t: 'Ingenioso, adaptable y observador. Sabe aprovechar las oportunidades.', f: 'Inteligencia, encanto y recursos.', w: 'Puede ser inquieto o calculador.', n: '2, 3', c: 'azul, dorado, verde', el: 'Agua' },
    { t: 'Paciente, fiable y trabajador. Valora la estabilidad.', f: 'Constancia, honestidad y firmeza.', w: 'Puede ser terco y cerrarse al cambio.', n: '1, 4', c: 'blanco, amarillo, verde', el: 'Tierra' },
    { t: 'Valiente, carismático y lleno de energía. Busca la acción.', f: 'Coraje, liderazgo y pasión.', w: 'Puede ser impulsivo o rebelde.', n: '1, 3, 4', c: 'azul, gris, naranja', el: 'Madera' },
    { t: 'Amable, diplomático y sensible. Busca la armonía.', f: 'Elegancia, tacto e intuición.', w: 'Puede evitar el conflicto en exceso.', n: '3, 4, 6', c: 'rosa, rojo, azul', el: 'Madera' },
    { t: 'Ambicioso, magnético y creativo. Tiene presencia natural.', f: 'Visión, carisma y vitalidad.', w: 'Puede ser exigente o arrogante.', n: '1, 6, 7', c: 'dorado, plata, gris', el: 'Tierra' },
    { t: 'Reflexivo, enigmático e intuitivo. Prefiere la profundidad.', f: 'Sabiduría, análisis y elegancia.', w: 'Puede ser celoso o reservado.', n: '2, 8, 9', c: 'negro, rojo, amarillo', el: 'Fuego' },
    { t: 'Independiente, enérgico y sociable. Ama la libertad.', f: 'Entusiasmo, honestidad y movimiento.', w: 'Puede ser impaciente o inconstante.', n: '2, 3, 7', c: 'amarillo, verde, rojo', el: 'Fuego' },
    { t: 'Gentil, creativo y empático. Busca la paz y la belleza.', f: 'Sensibilidad, arte y compasión.', w: 'Puede ser indeciso o dependiente.', n: '2, 7', c: 'verde, rojo, morado', el: 'Tierra' },
    { t: 'Ingenioso, curioso y divertido. Aprende rápido.', f: 'Inventiva, humor y versatilidad.', w: 'Puede dispersarse o ser caprichoso.', n: '1, 7, 8', c: 'blanco, azul, dorado', el: 'Metal' },
    { t: 'Observador, trabajador y valiente. Cuida los detalles.', f: 'Disciplina, honestidad y orgullo.', w: 'Puede ser crítico o perfeccionista.', n: '5, 7, 8', c: 'dorado, marrón, amarillo', el: 'Metal' },
    { t: 'Leal, justo y protector. Defiende a quienes quiere.', f: 'Lealtad, sinceridad y sentido de la justicia.', w: 'Puede ser ansioso o pesimista.', n: '3, 4, 9', c: 'rojo, verde, morado', el: 'Tierra' },
    { t: 'Generoso, sincero y disfrutón. Valora el bienestar.', f: 'Bondad, apertura y sinceridad.', w: 'Puede ser ingenuo o complaciente.', n: '2, 5, 8', c: 'amarillo, gris, marrón', el: 'Agua' }
  ];
  var ELCN = {
    Madera: 'crecimiento, creatividad y expansión', Fuego: 'pasión, rapidez y cambios intensos', Tierra: 'estabilidad, práctica y cuidado',
    Metal: 'claridad, disciplina y precisión', Agua: 'fluidez, intuición y adaptación'
  };
  var TRIAD = [[0, 4, 8], [1, 5, 9], [2, 6, 10], [3, 7, 11]];
  var SIXH = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
  function relation(a, b) {
    if (a === b) return { k: 'propio', t: 'Es el año de tu animal (Ben Ming Nian). Tradicionalmente pide revisar, cuidarte y no forzar grandes cambios; se asocia con llevar algo rojo.' };
    if (((a - b + 12) % 12) === 6) return { k: 'choque', t: 'Tu animal choca con el del año. La tradición lo ve como un año de tensiones y movimiento: prudencia, flexibilidad y cuidado de tu salud y de tus decisiones.' };
    for (var i = 0; i < SIXH.length; i++) if (SIXH[i].indexOf(a) > -1 && SIXH[i].indexOf(b) > -1) return { k: 'armonía', t: 'Tu animal está en armonía con el del año: se asocia con apoyo, buenas alianzas y facilidad para avanzar.' };
    for (var k = 0; k < TRIAD.length; k++) if (TRIAD[k].indexOf(a) > -1 && TRIAD[k].indexOf(b) > -1) return { k: 'triada', t: 'Compartes triada con el animal del año: sinergia, afinidad y buen impulso para tus proyectos.' };
    return { k: 'neutro', t: 'Tu relación con el animal del año es neutra: el resultado dependerá de tus decisiones más que del clima.' };
  }
  function compat(a) {
    var best = [];
    TRIAD.forEach(function (t) { if (t.indexOf(a) > -1) t.forEach(function (x) { if (x !== a) best.push(x); }); });
    SIXH.forEach(function (s) { if (s.indexOf(a) > -1) s.forEach(function (x) { if (x !== a && best.indexOf(x) < 0) best.push(x); }); });
    return { best: best, clash: (a + 6) % 12 };
  }

  /* ---------- Numerología ---------- */
  function digits(n) { return String(n).split('').reduce(function (s, c) { return s + Number(c); }, 0); }
  function reduce(n, master) {
    while (n > 9) { if (master && (n === 11 || n === 22 || n === 33)) return n; n = digits(n); }
    return n;
  }
  function lifePath(y, m, d) { return reduce(reduce(m, true) + reduce(d, true) + reduce(y, true), true); }
  function personalYear(m, d, year) { return reduce(reduce(m) + reduce(d) + reduce(year)); }
  function nameNumber(name) {
    var map = 'ABCDEFGHI'; var sum = 0;
    String(name).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '').split('').forEach(function (ch) {
      var i = ch.charCodeAt(0) - 65; sum += (i % 9) + 1;
    });
    return sum ? reduce(sum, true) : 0;
  }
  var NUM = {
    1: ['El iniciador', 'Independencia, liderazgo y comienzos. Aprende a confiar en tu iniciativa sin imponerte.'],
    2: ['El mediador', 'Cooperación, sensibilidad y diplomacia. Aprende a poner límites sin perder la empatía.'],
    3: ['El comunicador', 'Creatividad, expresión y alegría. Aprende a enfocar tu energía y a decir lo que sientes.'],
    4: ['El constructor', 'Orden, disciplina y fiabilidad. Aprende a flexibilizar sin perder tu base.'],
    5: ['El explorador', 'Libertad, cambio y aventura. Aprende a comprometerte sin sentirte atrapado/a.'],
    6: ['El cuidador', 'Responsabilidad, amor y armonía. Aprende a cuidarte tanto como cuidas a los demás.'],
    7: ['El buscador', 'Introspección, análisis y espiritualidad. Aprende a confiar y a abrirte a otros.'],
    8: ['El realizador', 'Poder personal, logro y abundancia. Aprende a equilibrar ambición y valores.'],
    9: ['El humanitario', 'Compasión, cierre y visión amplia. Aprende a soltar y a dar sin agotarte.'],
    11: ['El visionario (maestro)', 'Intuición elevada e inspiración. Requiere gestionar la sensibilidad y los nervios.'],
    22: ['El gran constructor (maestro)', 'Capacidad de materializar grandes visiones. Pide disciplina y paciencia.'],
    33: ['El maestro compasivo (maestro)', 'Servicio y cuidado amplio. Pide cuidar de tu propio equilibrio.']
  };
  var YEAR = {
    1: 'Año de siembra: nuevos comienzos, decisiones y proyectos propios.',
    2: 'Año de paciencia y vínculos: cooperar, escuchar y dejar madurar.',
    3: 'Año de expresión: creatividad, vida social y alegría.',
    4: 'Año de construcción: orden, esfuerzo y bases sólidas.',
    5: 'Año de cambio: movimiento, libertad y novedades.',
    6: 'Año de hogar y cuidado: responsabilidades, vínculos y armonía.',
    7: 'Año de introspección: estudio, descanso y búsqueda interior.',
    8: 'Año de cosecha y poder: logros, dinero y consolidación.',
    9: 'Año de cierre: soltar, perdonar y preparar un nuevo ciclo.'
  };

  /* ---------- Introspección ---------- */
  var PROMPTS = [
    '¿Qué emoción ha estado más presente en mí esta semana y qué me pide?', '¿Qué haría hoy si no tuviera miedo a equivocarme?',
    '¿Qué estoy aplazando y qué me lo impide realmente?', '¿Qué cosa pequeña me ha dado paz últimamente?', '¿A quién necesito perdonar (incluyéndome)?',
    '¿Qué me cuesta pedir y a quién?', '¿Qué parte de mí quiere más atención?', '¿Qué hábito me gustaría soltar y cuál cultivar?',
    '¿Cuándo me sentí más yo mismo/a este mes?', '¿Qué límite necesito poner o recordar?', '¿Qué me enseñó la última dificultad que viví?',
    '¿Qué quiero que sea diferente dentro de un año?', '¿Qué cosas agradezco hoy, aunque sean pequeñas?', '¿Qué historia me cuento sobre mí que ya no me sirve?',
    '¿Qué me da energía y qué me la quita?', '¿Dónde estoy cumpliendo expectativas ajenas?', '¿Qué necesito escuchar hoy de mí mismo/a?',
    '¿Cómo es mi día ideal, de principio a fin?', '¿Qué me da miedo desear?', '¿Qué conversación pendiente tengo?',
    '¿Qué parte de mi cuerpo está pidiendo cuidados?', '¿Qué quiero que se quede conmigo de este año?', '¿Qué valores quiero que guíen mis decisiones esta semana?',
    '¿Con quién me siento libre de ser yo?', '¿Qué estoy tolerando que en realidad me pesa?', '¿Qué me haría sentir orgulloso/a esta noche?',
    '¿Qué tipo de descanso necesito: físico, mental o emocional?', '¿Qué me gustaría decirle a mi yo de hace cinco años?', '¿Qué sueño o idea sigo guardando?', '¿Qué pequeño acto de amabilidad puedo hacer hoy?'
  ];
  function dayPrompt(date) { return PROMPTS[hash('prompt|' + key(date)) % PROMPTS.length]; }

  window.SKYTXT = {
    PLANETS: PLANETS, SHORT: SHORT, STYLE: STYLE, MOONMOOD: MOONMOOD, HOUSE: HOUSE, CN: CN, ELCN: ELCN, NUM: NUM, YEAR: YEAR,
    fmtDeg: fmtDeg, planetText: planetText, planetPhaseNote: planetPhaseNote, aspectText: aspectText, skyWeather: skyWeather,
    moonText: moonText, daily: daily, relation: relation, compat: compat, lifePath: lifePath, personalYear: personalYear,
    nameNumber: nameNumber, reduce: reduce, dayPrompt: dayPrompt, rng: rng, hash: hash, PROMPTS: PROMPTS
  };
})();
