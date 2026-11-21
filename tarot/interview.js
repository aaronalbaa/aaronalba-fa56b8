/* Entrevista profunda: Big Five, eneagrama, estilo junguiano, apego, valores, lenguajes del amor, hábitos y creencias. */
(function () {
  'use strict';
  var ARC = window.ARC, $ = ARC.$, esc = ARC.esc, P = ARC.profile, A = ARC.act;
  P.psy = P.psy || {}; P.ans = P.ans || {}; P.open = P.open || {};

  /* ---------- banco de preguntas (redacción original) ---------- */
  var B5 = [
    ['E', 1, 'Me siento cómodo/a siendo el centro de atención.'], ['E', 1, 'Disfruto iniciando conversaciones con personas que no conozco.'], ['E', 0, 'Tras mucho trato social necesito quedarme a solas para recuperarme.'], ['E', 1, 'El ánimo de un grupo me contagia con facilidad.'], ['E', 0, 'Prefiero escuchar a hablar en las reuniones.'],
    ['E', 1, 'Tengo mucha energía cuando estoy rodeado de gente.'], ['E', 0, 'Paso desapercibido/a con gusto en los eventos.'], ['E', 1, 'Me lanzo a proponer planes.'], ['E', 0, 'Tardo en abrirme con la gente nueva.'], ['E', 1, 'Hablo con naturalidad de lo que siento.'],
    ['N', 1, 'Me preocupo con facilidad.'], ['N', 1, 'Mi estado de ánimo cambia rápido.'], ['N', 1, 'Me cuesta desconectar de los problemas.'], ['N', 0, 'Me recupero pronto de los disgustos.'], ['N', 0, 'Rara vez me siento ansioso/a.'],
    ['N', 1, 'Me afectan mucho las críticas.'], ['N', 1, 'Doy muchas vueltas a lo que he dicho o hecho.'], ['N', 0, 'Mantengo la calma bajo presión.'], ['N', 1, 'Me abruman los imprevistos.'], ['N', 0, 'Me siento seguro/a de mí la mayor parte del tiempo.'],
    ['O', 1, 'Me atraen las ideas abstractas y filosóficas.'], ['O', 1, 'Disfruto probando cosas nuevas.'], ['O', 0, 'Prefiero la rutina a la novedad.'], ['O', 1, 'El arte y la música me conmueven profundamente.'], ['O', 1, 'Imagino posibilidades con facilidad.'],
    ['O', 0, 'Me aburren los debates teóricos.'], ['O', 1, 'Me intriga entender por qué las personas somos como somos.'], ['O', 1, 'Me gusta viajar a lugares muy distintos al mío.'], ['O', 0, 'Prefiero lo práctico a lo simbólico.'], ['O', 1, 'Me fascinan los misterios y lo desconocido.'],
    ['A', 1, 'Me importan mucho los sentimientos de los demás.'], ['A', 1, 'Perdono con facilidad.'], ['A', 0, 'A veces me cuesta confiar en las intenciones ajenas.'], ['A', 1, 'Ayudo aunque nadie me lo pida.'], ['A', 0, 'Discuto para ganar.'],
    ['A', 1, 'Me pongo en el lugar de otras personas con facilidad.'], ['A', 0, 'Me cuesta ceder.'], ['A', 1, 'Evito herir a los demás aunque tenga razón.'], ['A', 0, 'Pienso que la gente suele mirar por sí misma.'], ['A', 1, 'Disfruto cooperando más que compitiendo.'],
    ['C', 1, 'Cumplo mis plazos y compromisos.'], ['C', 1, 'Mantengo mi espacio ordenado.'], ['C', 0, 'Dejo cosas a medias.'], ['C', 1, 'Pienso antes de actuar.'], ['C', 1, 'Me exijo hacer las cosas bien.'],
    ['C', 0, 'Me distraigo con facilidad cuando trabajo.'], ['C', 1, 'Planifico mis días con antelación.'], ['C', 0, 'Improviso casi todo.'], ['C', 1, 'Termino lo que empiezo.'], ['C', 1, 'Soy constante aunque me falte motivación.']
  ];
  var ENN = [
    [1, 'Siento que debo hacer las cosas bien o no hacerlas.'], [1, 'Me molesta mucho el error propio y el ajeno.'], [1, 'Tengo un crítico interior que casi nunca calla.'], [1, 'Me cuesta relajarme si queda algo por mejorar.'], [1, 'Valoro actuar con integridad aunque cueste.'], [1, 'Me irrita la injusticia.'], [1, 'Controlo mi enfado para no parecer incorrecto/a.'], [1, 'Creo que hay una manera correcta de hacer las cosas.'],
    [2, 'Me siento valioso/a cuando soy necesario/a.'], [2, 'Detecto enseguida qué necesitan los demás.'], [2, 'Me cuesta pedir ayuda.'], [2, 'Doy más de lo que recibo y a veces me resiento.'], [2, 'Quiero ser querido/a por lo que aporto.'], [2, 'Me cuesta decir que no.'], [2, 'Me anticipo a las necesidades ajenas.'], [2, 'Me duele que no valoren mi esfuerzo.'],
    [3, 'Me motiva lograr metas y ser reconocido/a.'], [3, 'Adapto mi imagen según el entorno.'], [3, 'Me incomoda mucho fracasar en público.'], [3, 'Soy eficiente y práctico/a.'], [3, 'Me cuesta frenar y sentir sin estar haciendo algo.'], [3, 'Valoro ser admirado/a.'], [3, 'Me defino mucho por lo que hago.'], [3, 'Compito con facilidad.'],
    [4, 'Siento que soy distinto/a de los demás.'], [4, 'Vivo emociones profundas e intensas.'], [4, 'Siento nostalgia por lo que me falta.'], [4, 'Necesito expresarme de forma auténtica y única.'], [4, 'A veces envidio lo que otros tienen con naturalidad.'], [4, 'Me atrae lo melancólico y lo bello.'], [4, 'Con frecuencia me siento incomprendido/a.'], [4, 'Busco un significado profundo en lo que vivo.'],
    [5, 'Necesito tiempo a solas para recargarme.'], [5, 'Prefiero observar antes de participar.'], [5, 'Acumulo conocimiento para sentirme seguro/a.'], [5, 'Me agota la demanda emocional de los demás.'], [5, 'Me cuesta compartir lo que siento.'], [5, 'Valoro mucho mi privacidad.'], [5, 'Quiero entender a fondo antes de actuar.'], [5, 'Cuido mucho mi energía y mis recursos.'],
    [6, 'Anticipo lo que puede salir mal.'], [6, 'Dudo antes de confiar en una autoridad.'], [6, 'Busco seguridad en personas de confianza.'], [6, 'Soy leal y me comprometo mucho.'], [6, 'Mi mente se llena de escenarios y preocupaciones.'], [6, 'Cuestiono a quien tiene poder.'], [6, 'Oscilo entre dudar y actuar con gran valentía.'], [6, 'Me tranquiliza tener siempre un plan B.'],
    [7, 'Me atraen las nuevas experiencias y planes.'], [7, 'Evito el dolor buscando alternativas positivas.'], [7, 'Me aburro con facilidad.'], [7, 'Tengo muchas ideas y proyectos a la vez.'], [7, 'Me cuesta comprometerme con una sola opción.'], [7, 'Busco el lado bueno de casi todo.'], [7, 'Detesto sentirme limitado/a.'], [7, 'Me distraigo para no sentir lo incómodo.'],
    [8, 'Me gusta tener el control y decidir.'], [8, 'Defiendo a los míos con mucha fuerza.'], [8, 'Soy directo/a, a veces brusco/a.'], [8, 'No soporto la injusticia ni que abusen de los débiles.'], [8, 'Me cuesta mostrar mi vulnerabilidad.'], [8, 'Disfruto los retos intensos.'], [8, 'Tomo la iniciativa en una crisis.'], [8, 'Odio sentir que me controlan.'],
    [9, 'Evito los conflictos para mantener la paz.'], [9, 'Me cuesta saber qué quiero realmente.'], [9, 'Me adapto a lo que quieren los demás.'], [9, 'Aplazo las cosas importantes.'], [9, 'Me distraigo con comodidades y rutinas.'], [9, 'Me enfado de forma pasiva en vez de expresarlo.'], [9, 'Veo con facilidad todos los puntos de vista.'], [9, 'Busco armonía interior y exterior.']
  ];
  var JUNG = [ // [dimensión, texto A (letra 1), texto B (letra 2)]
    ['EI', 'Me recargo estando con gente', 'Me recargo estando a solas'], ['EI', 'Pienso hablando', 'Pienso antes de hablar'], ['EI', 'Tengo muchos conocidos', 'Tengo pocos vínculos muy profundos'], ['EI', 'Actúo y luego reflexiono', 'Reflexiono y luego actúo'], ['EI', 'Me gusta lo social y lo animado', 'Me gusta lo íntimo y tranquilo'], ['EI', 'Conecto rápido con desconocidos', 'Necesito tiempo para abrirme'],
    ['SN', 'Me fío de los hechos concretos', 'Me fío de las intuiciones y patrones'], ['SN', 'Prefiero lo práctico', 'Prefiero lo teórico'], ['SN', 'Veo el presente con detalle', 'Veo posibilidades futuras'], ['SN', 'Aprendo con ejemplos reales', 'Aprendo con conceptos y analogías'], ['SN', 'Valoro la experiencia', 'Valoro la imaginación'], ['SN', 'Voy paso a paso', 'Salto de una idea a otra'],
    ['TF', 'Decido con lógica y criterio', 'Decido con valores y empatía'], ['TF', 'Valoro la justicia objetiva', 'Valoro la armonía personal'], ['TF', 'Digo la verdad aunque duela', 'Cuido cómo se sentirá el otro'], ['TF', 'Me convence el análisis', 'Me convence cómo me hace sentir'], ['TF', 'Critico para mejorar', 'Animo para motivar'], ['TF', 'Me guío por la razón', 'Me guío por el corazón'],
    ['JP', 'Me gusta planificar', 'Me gusta improvisar'], ['JP', 'Prefiero cerrar decisiones', 'Prefiero dejar opciones abiertas'], ['JP', 'Trabajo mejor con horarios', 'Trabajo mejor por impulsos'], ['JP', 'Me tranquiliza el orden', 'Me tranquiliza la flexibilidad'], ['JP', 'Termino las tareas con antelación', 'Rindo mejor sobre la hora'], ['JP', 'Una lista de tareas me motiva', 'Una lista de tareas me agobia']
  ];
  var ATT = [
    ['anx', 'Me preocupa que las personas cercanas dejen de quererme.'], ['anx', 'Necesito que me confirmen a menudo que me quieren.'], ['anx', 'Me cuesta soportar la distancia emocional de mi pareja o amigos.'], ['anx', 'Temo ser demasiado para los demás.'], ['anx', 'Interpreto con rapidez silencios como señal de rechazo.'], ['anx', 'Me angustia estar solo/a en una relación importante.'],
    ['av', 'Me siento incómodo/a cuando alguien depende mucho de mí.'], ['av', 'Prefiero resolver mis problemas sin pedir ayuda.'], ['av', 'Me agobia la intimidad emocional muy intensa.'], ['av', 'Me cuesta contar mis sentimientos más profundos.'], ['av', 'Necesito mucho espacio en mis relaciones.'], ['av', 'Me siento mejor cuando no necesito a nadie.']
  ];
  var VALS = ['Seguridad', 'Libertad', 'Logro y éxito', 'Amor y afecto', 'Conocimiento', 'Creatividad', 'Justicia', 'Espiritualidad', 'Aventura', 'Familia', 'Salud', 'Poder e influencia', 'Tradición', 'Placer', 'Ayudar a otros', 'Estabilidad económica', 'Reconocimiento', 'Autenticidad', 'Naturaleza', 'Comunidad'];
  var LOVE = [
    ['p', 'Palabras de afecto y reconocimiento', 'g', 'Un regalo pensado para mí'], ['t', 'Tiempo de calidad sin distracciones', 's', 'Un abrazo o una caricia'], ['a', 'Que me ayuden con algo que tengo pendiente', 'p', 'Que me digan lo que valoran de mí'], ['s', 'El contacto físico cercano', 't', 'Una tarde entera compartida'],
    ['g', 'Detalles y regalos simbólicos', 'a', 'Actos de servicio'], ['p', 'Cumplidos sinceros', 'a', 'Que alguien resuelva algo por mí'], ['t', 'Conversaciones largas y atentas', 'g', 'Sorpresas con cariño'], ['s', 'Estar cerca físicamente', 'p', 'Un mensaje lindo'], ['a', 'Que me quiten una carga', 't', 'Que dediquen tiempo solo para mí'], ['g', 'Recibir un recuerdo especial', 's', 'Un abrazo largo']
  ];
  var LOVEN = { p: 'Palabras de afirmación', t: 'Tiempo de calidad', a: 'Actos de servicio', s: 'Contacto físico', g: 'Regalos y detalles' };
  var LIFE = [
    ['Duermo entre 7 y 9 horas casi todas las noches.', 'sleep'], ['Me acuesto y levanto a horas parecidas.', 'sleep'], ['Hago actividad física al menos 3 veces por semana.', 'move'], ['Camino o me muevo a diario.', 'move'], ['Como de forma variada y con verdura casi a diario.', 'food'], ['Bebo suficiente agua.', 'food'],
    ['Gestiono bien el estrés cotidiano.', 'stress'], ['Dedico tiempo a descansar de verdad.', 'stress'], ['Mantengo contacto regular con personas queridas.', 'social'], ['Tengo alguien con quien hablar de lo importante.', 'social'], ['Limito el tiempo de pantallas antes de dormir.', 'screen'], ['Paso tiempo al aire libre cada semana.', 'screen']
  ];
  var BEL = [
    ['Uso el tarot como espejo de mi mente, no como predicción.', 'sim'], ['Creo que la magia funciona sobre todo a través de la intención y el simbolismo.', 'sim'], ['Me gusta que los rituales tengan un sentido emocional.', 'sim'], ['Creo que algunas cosas pueden influir en el mundo de forma sobrenatural.', 'lit'], ['Me atrae la idea de energías sutiles.', 'lit'], ['Pienso que las señales y sincronías son mensajes.', 'lit'],
    ['Quiero pruebas antes de creer algo.', 'esc'], ['Disfruto estas prácticas aunque dude de su efecto.', 'esc'], ['Me interesa la historia y los mitos detrás de los símbolos.', 'sim'], ['Prefiero una guía directa, sin demasiados rodeos místicos.', 'esc']
  ];
  var OPEN = [
    '¿Qué recuerdo de tu infancia te marcó más?', '¿Qué te hizo sentir más orgulloso/a en el último año?', '¿Qué cosas te quitan el sueño últimamente?', '¿Cuál es tu mayor miedo y de dónde crees que viene?', '¿Quién ha sido la persona más importante en tu vida y por qué?', '¿Qué cambiarías de tu vida si pudieras empezar hoy?',
    '¿Cómo es tu relación con tu familia?', '¿Cómo sueles reaccionar cuando te sientes herido/a?', '¿Qué te gustaría que los demás supieran de ti?', '¿Qué sueño sigues guardando?', '¿Qué hábito te gustaría construir?', '¿Qué te enfada con facilidad?',
    '¿Qué es para ti el éxito?', '¿Qué es para ti el amor?', '¿Qué decisión importante estás aplazando?', '¿Qué te hace sentir libre?', '¿Cómo te hablas a ti mismo/a cuando fallas?', '¿Qué parte de ti te cuesta más aceptar?',
    '¿Qué trabajo harías aunque no te pagaran?', '¿Qué te hace reír de verdad?', '¿Cómo es tu día ideal?', '¿Con qué personaje, real o ficticio, te identificas y por qué?', '¿Qué te da paz?', '¿Qué lecciones te dejó tu última relación o ruptura?',
    '¿Qué creencias heredadas de tu familia ya no te sirven?', '¿Qué te gustaría perdonar?', '¿Cómo manejas el dinero y qué sientes al respecto?', '¿Qué cuidas peor de ti mismo/a?', '¿Qué te inspira de la espiritualidad o el esoterismo?', '¿Cuál ha sido tu experiencia más extraña o inexplicable?',
    '¿Qué momento de tu vida volverías a vivir?', '¿Qué miedo te ha frenado alguna vez?', '¿Qué cosas haces para sentirte seguro/a?', '¿Qué esperas de Sibila?', '¿Qué te preocupa del futuro?', '¿Qué cualidad admiras más en otras personas?',
    '¿En qué situaciones sientes que no eres tú mismo/a?', '¿Qué rutina de mañana te gustaría tener?', '¿Cómo te gustaría ser recordado/a?', '¿Qué te falta ahora mismo?', '¿Qué te sobra ahora mismo?', '¿A qué le tienes cariño y casi nadie lo sabe?',
    '¿Qué te hace sentir culpa con frecuencia?', '¿Qué consejo darías a tu yo de hace diez años?', '¿Qué te da energía y qué te la quita?', '¿Cómo te llevas con la soledad?', '¿Qué parte de tu cuerpo o salud quieres cuidar mejor?', '¿Cuál es tu mayor talento?',
    '¿Qué cosas dejarías ir este año?', '¿Cómo te gustaría que fuera tu casa ideal?', '¿Qué libro, película o canción te cambió algo por dentro?', '¿Cómo tomas las decisiones importantes?', '¿Qué temas te apasionan y podrías hablar durante horas?', '¿Qué tipo de personas te hacen bien?',
    '¿Qué situaciones te estresan en el trabajo o los estudios?', '¿Qué meta financiera te importa?', '¿Qué significa para ti la espiritualidad?', '¿Qué ritual pequeño te hace sentir bien?', '¿Qué te gustaría preguntarle al universo hoy?', '¿Qué esperas encontrar en esta app?'
  ];

  /* ---------- textos de resultados ---------- */
  var ENN_TXT = {
    1: ['El Perfeccionista', 'Busca la integridad y la mejora. Tu don es la ética y el compromiso; tu trampa, el crítico interior y la rigidez.'],
    2: ['El Ayudador', 'Busca ser querido cuidando de otros. Tu don es la generosidad; tu trampa, descuidar tus necesidades y esperar reconocimiento.'],
    3: ['El Triunfador', 'Busca valía a través del logro. Tu don es la eficacia y la inspiración; tu trampa, vivir de la imagen y olvidar lo que sientes.'],
    4: ['El Individualista', 'Busca identidad y significado. Tu don es la profundidad y la creatividad; tu trampa, la melancolía y sentirte incomprendido.'],
    5: ['El Investigador', 'Busca comprender para sentirse seguro. Tu don es la lucidez; tu trampa, el aislamiento y guardar tus emociones.'],
    6: ['El Leal', 'Busca seguridad y confianza. Tu don es el compromiso y la valentía ante la duda; tu trampa, la ansiedad y el anticipar peligros.'],
    7: ['El Entusiasta', 'Busca libertad y disfrute. Tu don es la alegría y la visión; tu trampa, huir del dolor y dispersarte.'],
    8: ['El Desafiador', 'Busca fuerza y justicia. Tu don es el liderazgo protector; tu trampa, la dureza y esconder tu vulnerabilidad.'],
    9: ['El Pacificador', 'Busca paz y armonía. Tu don es la mediación y la serenidad; tu trampa, la pasividad y olvidarte de ti.']
  };
  var B5N = { O: 'Apertura', C: 'Responsabilidad', E: 'Extraversión', A: 'Amabilidad', N: 'Sensibilidad emocional' };
  var B5T = {
    O: ['Prefieres lo conocido y práctico.', 'Eres curioso/a, imaginativo/a y abierto/a a lo nuevo.'], C: ['Eres espontáneo/a y flexible, con poca necesidad de estructura.', 'Eres organizado/a, constante y fiable.'],
    E: ['Eres reservado/a y te recargas en soledad.', 'Eres sociable, enérgico/a y expresivo/a.'], A: ['Eres directo/a y competitivo/a, con espíritu crítico.', 'Eres empático/a, cooperador/a y cálido/a.'], N: ['Tienes buena estabilidad emocional y calma ante el estrés.', 'Sientes con intensidad y reaccionas con rapidez a las tensiones.']
  };
  var JUNGN = { 'E': 'Extrovertido/a', 'I': 'Introvertido/a', 'S': 'Concreto/a', 'N': 'Intuitivo/a', 'T': 'Analítico/a', 'F': 'Sensible', 'J': 'Estructurado/a', 'P': 'Flexible' };
  var ATTT = { seguro: 'Apego seguro: te sientes cómodo/a con la cercanía y con la autonomía.', ansioso: 'Apego ansioso: valoras mucho la cercanía y puedes temer el abandono. Pedir y recibir seguridad con calma te ayuda.', evitativo: 'Apego evitativo: valoras tu independencia y te incomoda la dependencia. Aprender a abrirte poco a poco te hace bien.', temeroso: 'Apego temeroso: deseas cercanía pero también la temes. Ir despacio y con personas de confianza ayuda mucho.' };
  var LIFEN = { sleep: 'Sueño', move: 'Movimiento', food: 'Alimentación', stress: 'Estrés', social: 'Vínculos', screen: 'Pantallas y naturaleza' };
  var BELT = { sim: 'Simbólico: usas las prácticas como espejo y lenguaje interior.', lit: 'Místico: sientes que hay fuerzas sutiles en juego.', esc: 'Escéptico-curioso: disfrutas explorando sin renunciar al pensamiento crítico.' };

  /* ---------- definición de tests ---------- */
  var TESTS = [
    { id: 'big5', e: '🧬', n: 'Personalidad (Big Five)', t: '50 afirmaciones · 8 min', items: B5.length },
    { id: 'ennea', e: '☸️', n: 'Eneagrama', t: '72 afirmaciones · 12 min', items: ENN.length },
    { id: 'jung', e: '🎭', n: 'Estilo cognitivo junguiano', t: '24 elecciones · 4 min', items: JUNG.length },
    { id: 'attach', e: '🔗', n: 'Estilo de apego', t: '12 afirmaciones · 3 min', items: ATT.length },
    { id: 'values', e: '🧭', n: 'Tus valores', t: 'Elige los 5 más importantes', items: 1 },
    { id: 'love', e: '💞', n: 'Lenguajes del amor', t: '10 elecciones · 2 min', items: LOVE.length },
    { id: 'life', e: '🌿', n: 'Hábitos y bienestar', t: '12 afirmaciones · 3 min', items: LIFE.length },
    { id: 'belief', e: '🔮', n: 'Tu relación con lo esotérico', t: '10 afirmaciones · 2 min', items: BEL.length }
  ];
  var LIK = [['😟', 'Nada'], ['🙁', 'Poco'], ['😐', 'A veces'], ['🙂', 'Bastante'], ['😄', 'Mucho']];

  function answers(id) { return P.ans[id] || (P.ans[id] = []); }
  function done(id) { var t = TESTS.filter(function (x) { return x.id === id; })[0]; return id === 'values' ? !!(P.psy.values && P.psy.values.length) : answers(id).filter(function (x) { return x !== undefined && x !== null; }).length >= t.items; }
  function progress(id) { var t = TESTS.filter(function (x) { return x.id === id; })[0]; return id === 'values' ? (done(id) ? 1 : 0) : Math.min(1, answers(id).filter(function (x) { return x !== undefined && x !== null; }).length / t.items); }

  function compute(id) {
    var a = answers(id), r;
    if (id === 'big5') {
      var sc = { O: [], C: [], E: [], A: [], N: [] };
      B5.forEach(function (it, i) { var v = a[i]; if (v === undefined) return; sc[it[0]].push(it[1] ? v : 6 - v); });
      r = {}; Object.keys(sc).forEach(function (k) { r[k] = sc[k].length ? Math.round((sc[k].reduce(function (s, x) { return s + x; }, 0) / sc[k].length - 1) / 4 * 100) : 50; });
    } else if (id === 'ennea') {
      var s = {}; for (var k = 1; k <= 9; k++) s[k] = 0;
      ENN.forEach(function (it, i) { if (a[i] !== undefined) s[it[0]] += a[i]; });
      var order = Object.keys(s).map(Number).sort(function (x, y) { return s[y] - s[x]; }), top = order[0], w1 = top === 1 ? 9 : top - 1, w2 = top === 9 ? 1 : top + 1;
      r = { scores: s, top: top, wing: s[w1] >= s[w2] ? w1 : w2, order: order.slice(0, 3) };
    } else if (id === 'jung') {
      var c = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
      JUNG.forEach(function (it, i) { if (a[i] === undefined) return; c[a[i] === 0 ? it[0][0] : it[0][1]]++; });
      r = { type: (c.E >= c.I ? 'E' : 'I') + (c.S >= c.N ? 'S' : 'N') + (c.T >= c.F ? 'T' : 'F') + (c.J >= c.P ? 'J' : 'P'), counts: c };
    } else if (id === 'attach') {
      var an = [], av = [];
      ATT.forEach(function (it, i) { if (a[i] === undefined) return; (it[0] === 'anx' ? an : av).push(a[i]); });
      var ax = an.length ? an.reduce(function (s, x) { return s + x; }, 0) / an.length : 3, vx = av.length ? av.reduce(function (s, x) { return s + x; }, 0) / av.length : 3;
      r = { anx: Math.round((ax - 1) / 4 * 100), avoid: Math.round((vx - 1) / 4 * 100), style: ax < 3 && vx < 3 ? 'seguro' : ax >= 3 && vx < 3 ? 'ansioso' : ax < 3 && vx >= 3 ? 'evitativo' : 'temeroso' };
    } else if (id === 'love') {
      var l = { p: 0, t: 0, a: 0, s: 0, g: 0 };
      LOVE.forEach(function (it, i) { if (a[i] === undefined) return; l[a[i] === 0 ? it[0] : it[2]]++; });
      r = { counts: l, top: Object.keys(l).sort(function (x, y) { return l[y] - l[x]; }).slice(0, 2) };
    } else if (id === 'life') {
      var g = {}, n = {};
      LIFE.forEach(function (it, i) { if (a[i] === undefined) return; g[it[1]] = (g[it[1]] || 0) + a[i]; n[it[1]] = (n[it[1]] || 0) + 1; });
      r = {}; Object.keys(g).forEach(function (k) { r[k] = Math.round((g[k] / n[k] - 1) / 4 * 100); });
    } else if (id === 'belief') {
      var b = { sim: 0, lit: 0, esc: 0 };
      BEL.forEach(function (it, i) { if (a[i] !== undefined) b[it[1]] += a[i]; });
      r = { scores: b, style: Object.keys(b).sort(function (x, y) { return b[y] - b[x]; })[0] };
    }
    if (r) { P.psy[id] = r; ARC.save('profile'); }
    return r;
  }

  /* ---------- vistas ---------- */
  var IV = { test: null, i: 0, view: null };
  function bars(r, names) { return Object.keys(names).map(function (k) { return '<div class="bar2"><span>' + esc(names[k]) + '</span><i style="width:' + (r[k] || 0) + '%"></i><b>' + (r[k] || 0) + '</b></div>'; }).join(''); }

  function resultHTML(id) {
    var r = P.psy[id] || compute(id); if (!r) return '<p class="hint">Aún no hay resultado.</p>';
    var h = '';
    if (id === 'big5') h = '<article class="rd sum"><div class="rd-h"><div><small>Resultado</small><b>🧬 Tus cinco rasgos</b></div></div>' + bars(r, B5N) + Object.keys(B5N).map(function (k) { return '<p><b>' + B5N[k] + ' (' + r[k] + '):</b> ' + esc(B5T[k][r[k] >= 50 ? 1 : 0]) + '</p>'; }).join('') + '</article>';
    else if (id === 'ennea') h = '<article class="rd sum"><div class="rd-h"><i>' + r.top + '</i><div><small>Tu tipo principal · ala ' + r.wing + '</small><b>' + esc(ENN_TXT[r.top][0]) + '</b></div></div><p>' + esc(ENN_TXT[r.top][1]) + '</p><p class="hint">Tipos más cercanos: ' + r.order.map(function (t) { return t + ' ' + ENN_TXT[t][0].replace('El ', ''); }).join(' · ') + '.</p></article>';
    else if (id === 'jung') h = '<article class="rd sum"><div class="rd-h"><i>' + r.type[0] + '</i><div><small>Tu estilo</small><b>' + r.type.split('').map(function (c) { return JUNGN[c]; }).join(' · ') + '</b></div></div><p>Código <b>' + r.type + '</b>. Es un estilo orientativo inspirado en la tipología de Jung; no es el test MBTI® oficial.</p></article>';
    else if (id === 'attach') h = '<article class="rd sum"><div class="rd-h"><div><small>Tu estilo</small><b>🔗 ' + r.style.charAt(0).toUpperCase() + r.style.slice(1) + '</b></div></div><div class="bar2"><span>Ansiedad</span><i style="width:' + r.anx + '%"></i><b>' + r.anx + '</b></div><div class="bar2"><span>Evitación</span><i style="width:' + r.avoid + '%"></i><b>' + r.avoid + '</b></div><p>' + esc(ATTT[r.style]) + '</p></article>';
    else if (id === 'values') h = '<article class="rd sum"><div class="rd-h"><div><small>Tus 5 valores</small><b>🧭 Lo que más importa</b></div></div><div class="gtags big">' + (P.psy.values || []).map(function (v) { return '<span>' + esc(v) + '</span>'; }).join('') + '</div></article>';
    else if (id === 'love') h = '<article class="rd sum"><div class="rd-h"><div><small>Tus lenguajes</small><b>💞 ' + r.top.map(function (k) { return LOVEN[k]; }).join(' y ') + '</b></div></div>' + bars(r.counts, LOVEN) + '</article>';
    else if (id === 'life') h = '<article class="rd sum"><div class="rd-h"><div><small>Tu bienestar</small><b>🌿 Mapa de hábitos</b></div></div>' + bars(r, LIFEN) + '<p class="hint">Estos datos alimentan la sección Vida y las sugerencias de Sibila.</p></article>';
    else if (id === 'belief') h = '<article class="rd sum"><div class="rd-h"><div><small>Tu enfoque</small><b>🔮 ' + esc(BELT[r.style].split(':')[0]) + '</b></div></div><p>' + esc(BELT[r.style]) + '</p><p class="hint">Sibila adapta su tono: más simbólico, más místico o más pragmático según esto.</p></article>';
    return h;
  }

  function sessionHTML() {
    var id = IV.test, t = TESTS.filter(function (x) { return x.id === id; })[0], a = answers(id);
    if (id === 'values') {
      var sel = (P.psy.values || []);
      return '<button class="btn link left" data-a="ivBack">← Conócete</button><h2 class="ivh">' + t.e + ' ' + t.n + '</h2><p class="hint">Toca los cinco valores que más importan en tu vida (' + sel.length + '/5).</p><div class="chips wrap big">' +
        VALS.map(function (v) { return '<button data-a="ivVal" data-v="' + esc(v) + '" class="' + (sel.indexOf(v) > -1 ? 'on' : '') + '">' + esc(v) + '</button>'; }).join('') + '</div>' + (sel.length === 5 ? '<button class="btn primary big" data-a="ivFinishVals">Ver resultado</button>' : '');
    }
    if (IV.i >= t.items) return '<button class="btn link left" data-a="ivBack">← Conócete</button><h2 class="ivh">' + t.e + ' ' + t.n + '</h2>' + resultHTML(id) + '<button class="btn ghost" data-a="ivRedo">Repetir el test</button>';
    var i = IV.i, q, opts;
    if (id === 'big5') { q = B5[i][2]; opts = 'lik'; }
    else if (id === 'ennea') { q = ENN[i][1]; opts = 'lik'; }
    else if (id === 'attach') { q = ATT[i][1]; opts = 'lik'; }
    else if (id === 'life') { q = LIFE[i][0]; opts = 'lik'; }
    else if (id === 'belief') { q = BEL[i][0]; opts = 'lik'; }
    else if (id === 'jung') { q = '¿Cuál se parece más a ti?'; opts = [JUNG[i][1], JUNG[i][2]]; }
    else { q = '¿Qué te hace sentir más querido/a?'; opts = [LOVE[i][1], LOVE[i][3]]; }
    var body = opts === 'lik' ? '<p class="ivq">' + esc(q) + '</p><div class="lik">' + LIK.map(function (l, k) { return '<button data-a="ivAns" data-v="' + (k + 1) + '" class="' + (a[i] === k + 1 ? 'on' : '') + '"><span>' + l[0] + '</span><small>' + l[1] + '</small></button>'; }).join('') + '</div>'
      : '<p class="ivq">' + esc(q) + '</p><div class="opts">' + opts.map(function (o, k) { return '<button class="opt' + (a[i] === k ? ' sel' : '') + '" data-a="ivAns" data-v="' + k + '">' + esc(o) + '</button>'; }).join('') + '</div>';
    return '<button class="btn link left" data-a="ivBack">← Conócete</button><div class="ivbar"><i style="width:' + Math.round(i / t.items * 100) + '%"></i></div><small class="gold">' + t.n + ' · ' + (i + 1) + ' de ' + t.items + '</small>' + body + (i > 0 ? '<button class="btn link" data-a="ivPrev">‹ Anterior</button>' : '');
  }

  function openAnswered() { return Object.keys(P.open).length; }
  function nextOpen() { for (var i = 0; i < OPEN.length; i++) if (!P.open[i]) return i; return -1; }

  function html() {
    if (IV.view === 'test') return sessionHTML();
    var kp = ARC.knowPct ? ARC.knowPct() : 0, nTests = TESTS.filter(function (t) { return done(t.id); }).length;
    var h = '<div class="lvl"><div class="lvl-e">🪞</div><div class="lvl-t"><small>Lo que Sibila sabe de ti</small><b>' + kp + '%</b><div class="meter"><i style="width:' + kp + '%"></i></div><small>' + nTests + ' de ' + TESTS.length + ' tests · ' + openAnswered() + ' de ' + OPEN.length + ' preguntas abiertas</small></div></div>';
    h += '<p class="hint">Tus respuestas se guardan <b>solo en tu dispositivo</b> y se usan para personalizar lecturas y conversaciones. Puedes hacerlas poco a poco: cada una afina a Sibila.</p>';
    h += '<div class="group">' + TESTS.map(function (t) {
      var p = progress(t.id), d = done(t.id);
      return '<button class="grow" data-a="ivOpen" data-id="' + t.id + '"><span class="gi">' + t.e + '</span><div><b>' + esc(t.n) + '</b><small>' + (d ? 'Completado · ver resultado' : p > 0 ? Math.round(p * 100) + '% · continuar' : esc(t.t)) + '</small></div><i class="chev">' + (d ? '✓' : '›') + '</i></button>';
    }).join('') + '</div>';
    var no = nextOpen();
    h += '<div class="panel"><div class="lbl">Pregunta abierta</div>' + (no > -1 ? '<p class="prompt">' + esc(OPEN[no]) + '</p><textarea id="openans" rows="3" placeholder="Escribe con total libertad…"></textarea><button class="btn primary big" data-a="ivOpenSave">Guardar y siguiente</button>' : '<p class="hint">¡Has respondido todas! Sibila seguirá haciéndote preguntas nuevas con el tiempo.</p>') + '</div>';
    if (ARC.FACTS) h += '<h3 class="sec">Datos básicos</h3>' + ARC.factsHTML();
    return h;
  }

  /* ---------- acciones ---------- */
  A.ivOpen = function (el) { IV.test = el.dataset.id; IV.view = 'test'; var t = TESTS.filter(function (x) { return x.id === IV.test; })[0]; var a = answers(IV.test), i = 0; while (i < t.items && a[i] !== undefined && a[i] !== null) i++; IV.i = done(IV.test) ? t.items : i; if (IV.test !== 'values' && done(IV.test) && !P.psy[IV.test]) compute(IV.test); ARC.render(); };
  A.ivBack = function () { IV.view = null; ARC.render(); };
  A.ivAns = function (el) {
    var id = IV.test, a = answers(id), t = TESTS.filter(function (x) { return x.id === id; })[0]; a[IV.i] = Number(el.dataset.v); IV.i++;
    ARC.save('profile'); if (IV.i >= t.items) compute(id); ARC.render(true);
  };
  A.ivPrev = function () { IV.i = Math.max(0, IV.i - 1); ARC.render(true); };
  A.ivRedo = function () { P.ans[IV.test] = []; delete P.psy[IV.test]; IV.i = 0; ARC.save('profile'); ARC.render(true); };
  A.ivVal = function (el) { var v = el.dataset.v, a = P.psy.values = P.psy.values || [], i = a.indexOf(v); if (i > -1) a.splice(i, 1); else if (a.length < 5) a.push(v); ARC.save('profile'); ARC.render(true); };
  A.ivFinishVals = function () { IV.i = 1; ARC.render(true); };
  A.ivOpenSave = function () {
    var i = nextOpen(), v = ($('#openans') || {}).value.trim(); if (i < 0 || !v) { ARC.toast('Escribe una respuesta'); return; }
    P.open[i] = { q: OPEN[i], a: v.slice(0, 600), ts: Date.now() }; ARC.save('profile'); if (ARC.mission) ARC.mission('conocer'); ARC.render(true); ARC.toast('Sibila lo recordará 🔮');
  };
  A.knowOne = function () {
    var i = nextOpen(); if (i < 0) { ARC.toast('Ya respondiste todas por ahora ✨'); return; }
    ARC.openModal('<h3>Conócete un poco más</h3><p class="prompt">' + esc(OPEN[i]) + '</p><textarea id="openans2" rows="4" placeholder="Escribe con libertad…"></textarea><button class="btn primary big" data-a="knowOneSave">Guardar</button>');
  };
  A.knowOneSave = function () {
    var i = nextOpen(), v = ($('#openans2') || {}).value.trim(); if (i < 0 || !v) { ARC.toast('Escribe una respuesta'); return; }
    P.open[i] = { q: OPEN[i], a: v.slice(0, 600), ts: Date.now() }; ARC.save('profile'); ARC.closeModal(); ARC.mission('conocer'); ARC.render(true); ARC.toast('Sibila lo recordará 🔮');
  };

  /* ---------- contexto para la IA ---------- */
  function summary() {
    var L = [], p = P.psy;
    if (p.big5) L.push('Big Five (0–100): apertura ' + p.big5.O + ', responsabilidad ' + p.big5.C + ', extraversión ' + p.big5.E + ', amabilidad ' + p.big5.A + ', sensibilidad emocional ' + p.big5.N + '.');
    if (p.ennea) L.push('Eneagrama: tipo ' + p.ennea.top + ' (' + ENN_TXT[p.ennea.top][0] + ') con ala ' + p.ennea.wing + '.');
    if (p.jung) L.push('Estilo junguiano: ' + p.jung.type + '.');
    if (p.attach) L.push('Estilo de apego: ' + p.attach.style + ' (ansiedad ' + p.attach.anx + ', evitación ' + p.attach.avoid + ').');
    if (p.values && p.values.length) L.push('Valores principales: ' + p.values.join(', ') + '.');
    if (p.love) L.push('Lenguajes del amor: ' + p.love.top.map(function (k) { return LOVEN[k]; }).join(' y ') + '.');
    if (p.life) L.push('Hábitos (0–100): ' + Object.keys(p.life).map(function (k) { return LIFEN[k] + ' ' + p.life[k]; }).join(', ') + '.');
    if (p.belief) L.push('Enfoque esotérico: ' + BELT[p.belief.style] + '.');
    var open = Object.keys(P.open).slice(-8).map(function (k) { return P.open[k].q + ' → ' + P.open[k].a.slice(0, 160); });
    if (open.length) L.push('Respuestas abiertas recientes: ' + open.join(' | '));
    var moods = (P.moods || []).slice(0, 5); if (moods.length) L.push('Ánimo reciente (1–5): ' + moods.map(function (m) { return m.v; }).join(', ') + '.');
    return L.length ? 'PERFIL PSICOLÓGICO: ' + L.join(' ') : '';
  }
  function nextQuestions(n) { var out = [], i; for (i = 0; i < OPEN.length && out.length < n; i++) if (!P.open[i]) out.push(OPEN[i]); return out; }

  ARC.interview = { html: html, summary: summary, nextQuestions: nextQuestions, TESTS: TESTS, ENN: ENN_TXT, OPEN: OPEN, counts: { items: B5.length + ENN.length + JUNG.length + ATT.length + LOVE.length + LIFE.length + BEL.length + 1, open: OPEN.length } };
})();
