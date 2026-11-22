/* Datos de numerología: significados base, números maestros, deuda kármica, cuadrado de Pitágoras y números angélicos. */
(function () {
  'use strict';

  // Cada número: nombre, planeta, elemento, carta del tarot (id de Arcano Mayor), color, piedra, letra hebrea, claves, luz, sombra, amor, trabajo, cuerpo, práctica
  var N = {
    0: { n: 'El Vacío fértil', pl: 'Todos / ninguno', el: 'Éter', tarot: 0, col: 'blanco o transparente', st: 'cristal de roca', he: '—', kw: 'Potencial puro, infinito, ciclo',
      luz: 'Es el huevo cósmico: todo está por nacer. Amplifica los números que lo acompañan y recuerda que el vacío no es ausencia sino posibilidad.',
      sombra: 'Falta de forma, dispersión, miedo a comprometerse o a "ser algo".',
      amor: 'Pide partir de cero, sin expectativas heredadas.', trabajo: 'Fase de espera creativa antes de lanzar algo.', cuerpo: 'Descanso profundo.',
      prac: 'Siéntate 5 minutos en silencio y pregunta: ¿qué quiere nacer en mí?' },
    1: { n: 'El Iniciador', pl: 'Sol', el: 'Fuego', tarot: 1, col: 'rojo y dorado', st: 'granate', he: 'Alef', kw: 'Liderazgo, iniciativa, independencia, voluntad',
      luz: 'Abre caminos. Tiene coraje, originalidad y la capacidad de empezar solo. Cuando alguien vibra en 1, el mundo le pide que decida y que se haga responsable de su rumbo.',
      sombra: 'Egocentrismo, impaciencia, miedo a depender, necesidad de tener siempre la razón.',
      amor: 'Necesita un compañero que respete su espacio; aprende a pedir en vez de dar órdenes.', trabajo: 'Emprendedor, líder, pionero. Sufre bajo microgestión.', cuerpo: 'Cabeza, corazón y energía vital; cuidado con el estrés y la tensión.',
      prac: 'Elige una cosa que llevas aplazando y da hoy el primer paso, por pequeño que sea.' },
    2: { n: 'El Mediador', pl: 'Luna', el: 'Agua', tarot: 2, col: 'blanco y plata', st: 'piedra luna', he: 'Bet', kw: 'Cooperación, sensibilidad, diplomacia, paciencia',
      luz: 'Sabe escuchar, equilibrar y percibir lo que no se dice. Construye puentes y sostiene a otros con una presencia serena.',
      sombra: 'Dependencia emocional, indecisión, complacencia, resentimiento silencioso.',
      amor: 'Romántico y leal. Aprende a poner límites sin sentir culpa.', trabajo: 'Mediación, cuidado, arte, trabajo en equipo.', cuerpo: 'Sistema digestivo y emocional; el estrés se somatiza.',
      prac: 'Antes de decir "sí" por costumbre, haz una pausa de tres respiraciones y pregunta qué necesitas tú.' },
    3: { n: 'El Comunicador', pl: 'Júpiter', el: 'Fuego', tarot: 3, col: 'amarillo y violeta', st: 'citrino', he: 'Guímel', kw: 'Creatividad, expresión, alegría, sociabilidad',
      luz: 'Hace que las ideas se vuelvan palabras, arte y fiesta. Su luz contagia; es el niño interior que juega y celebra.',
      sombra: 'Dispersión, superficialidad, drama, miedo a no ser aceptado.',
      amor: 'Encantador y expresivo; necesita diversión y conversación.', trabajo: 'Escritura, enseñanza, arte, comunicación, entretenimiento.', cuerpo: 'Garganta y sistema nervioso; cuida la voz.',
      prac: 'Crea algo sin objetivo: un dibujo, un poema, un baile de tres minutos.' },
    4: { n: 'El Constructor', pl: 'Saturno (y Urano)', el: 'Tierra', tarot: 4, col: 'verde y marrón', st: 'jaspe', he: 'Dálet', kw: 'Orden, disciplina, estabilidad, esfuerzo',
      luz: 'Convierte los sueños en estructuras duraderas. Es fiable, metódico y leal; sus cimientos sostienen a otros.',
      sombra: 'Rigidez, terquedad, miedo al cambio, adicción al trabajo.',
      amor: 'Compromiso y constancia; le cuesta mostrar vulnerabilidad.', trabajo: 'Ingeniería, administración, oficios, proyectos a largo plazo.', cuerpo: 'Huesos, espalda y articulaciones; necesita descanso real.',
      prac: 'Diseña una rutina de 15 minutos al día para algo que importa y cúmplela durante 21 días.' },
    5: { n: 'El Explorador', pl: 'Mercurio', el: 'Aire', tarot: 5, col: 'turquesa y gris', st: 'aguamarina', he: 'He', kw: 'Libertad, cambio, aventura, versatilidad',
      luz: 'Es movimiento, curiosidad y adaptación. Aprende viviendo y enseña a los demás a soltar lo viejo.',
      sombra: 'Impulsividad, evasión, excesos, miedo al compromiso.',
      amor: 'Magnetismo y novedad; necesita libertad con responsabilidad afectiva.', trabajo: 'Viajes, ventas, comunicación, trabajos cambiantes.', cuerpo: 'Sistema nervioso y respiratorio; cuida los hábitos.',
      prac: 'Rompe una rutina hoy: cambia de ruta, de comida o de conversación, y observa qué despierta.' },
    6: { n: 'El Cuidador', pl: 'Venus', el: 'Tierra', tarot: 6, col: 'rosa y verde', st: 'cuarzo rosa', he: 'Vav', kw: 'Amor, responsabilidad, armonía, belleza',
      luz: 'Hace hogar allí donde va. Sostiene, embellece y busca la justicia en los vínculos.',
      sombra: 'Sobreprotección, perfeccionismo, control disfrazado de cuidado, olvido de sí.',
      amor: 'Entrega y ternura; debe aprender a recibir.', trabajo: 'Salud, educación, diseño, trabajo comunitario.', cuerpo: 'Corazón, garganta y zona lumbar.',
      prac: 'Haz hoy algo por ti con la misma dedicación con la que cuidas a los demás.' },
    7: { n: 'El Buscador', pl: 'Neptuno (y Luna)', el: 'Agua', tarot: 7, col: 'violeta y plata', st: 'amatista', he: 'Zayin', kw: 'Introspección, análisis, espiritualidad, sabiduría',
      luz: 'Necesita silencio y profundidad. Estudia, investiga y encuentra verdades que otros no ven.',
      sombra: 'Aislamiento, cinismo, frialdad, dificultad para confiar.',
      amor: 'Intimidad profunda con pocas personas; aprende a abrirse.', trabajo: 'Investigación, escritura, ciencia, terapias, estudios espirituales.', cuerpo: 'Sistema nervioso y sueño; necesita soledad regenerativa.',
      prac: 'Pasa 20 minutos en la naturaleza sin móvil y anota qué piensas sin dirigirlo.' },
    8: { n: 'El Realizador', pl: 'Saturno', el: 'Tierra', tarot: 11, col: 'negro, burdeos y dorado', st: 'ónix', he: 'Jet', kw: 'Poder personal, logro, abundancia, autoridad',
      luz: 'Maneja recursos, ambición y estrategia. Su lección es el equilibrio entre lo material y lo espiritual.',
      sombra: 'Obsesión por el control o el estatus, dureza, miedo a la escasez.',
      amor: 'Leal y protector; necesita compartir poder, no imponerlo.', trabajo: 'Dirección, finanzas, negocios, política, gestión.', cuerpo: 'Huesos, estómago y estrés.',
      prac: 'Revisa tus finanzas con calma y define un acto de generosidad concreto para este mes.' },
    9: { n: 'El Humanitario', pl: 'Marte (y Neptuno)', el: 'Fuego', tarot: 9, col: 'rojo y oro', st: 'rubí', he: 'Tet', kw: 'Compasión, cierre, visión amplia, desapego',
      luz: 'Completa ciclos y sirve a algo mayor que sí mismo. Entiende el dolor ajeno y sabe soltar.',
      sombra: 'Victimismo, dispersión, aferrarse a lo que ya terminó, mártir.',
      amor: 'Amor universal; le cuesta el amor cotidiano y concreto.', trabajo: 'Arte, ayuda social, enseñanza, causas colectivas.', cuerpo: 'Sistema inmune y emociones acumuladas.',
      prac: 'Despídete de algo que ya terminó: escribe una carta de cierre y quémala con seguridad.' },
    11: { n: 'El Visionario (maestro)', pl: 'Luna / Urano', el: 'Aire y agua', tarot: 11, col: 'plata y blanco', st: 'selenita', he: 'Kaf', kw: 'Intuición elevada, inspiración, sensibilidad, iluminación',
      luz: 'Número maestro: canal de ideas e intuiciones. Inspira a otros con su presencia y su visión.',
      sombra: 'Nerviosismo, hipersensibilidad, dudas de sí, vivir en las nubes.',
      amor: 'Busca almas gemelas; necesita ancla y rutina emocional.', trabajo: 'Arte, espiritualidad, enseñanza, innovación.', cuerpo: 'Sistema nervioso; el descanso es sagrado.',
      prac: 'Pon un ancla: 10 minutos de movimiento físico antes de meditar o crear.' },
    22: { n: 'El Gran Constructor (maestro)', pl: 'Saturno / Urano', el: 'Tierra y aire', tarot: 22, col: 'oro y verde profundo', st: 'fluorita', he: 'Resh (aprox.)', kw: 'Materializar grandes visiones, legado, disciplina visionaria',
      luz: 'Número maestro: lleva un sueño enorme al mundo físico con método y paciencia.',
      sombra: 'Presión excesiva, perfeccionismo paralizante, miedo a no estar a la altura.',
      amor: 'Compromiso a largo plazo; necesita descanso compartido.', trabajo: 'Proyectos de gran escala, arquitectura, organizaciones.', cuerpo: 'Estrés y espalda.',
      prac: 'Divide una gran meta en hitos de 90 días y celebra cada uno.' },
    33: { n: 'El Maestro Compasivo (maestro)', pl: 'Venus / Neptuno', el: 'Agua', tarot: 33, col: 'rosa dorado', st: 'cuarzo rosa y esmeralda', he: '—', kw: 'Servicio, ternura, enseñanza del amor incondicional',
      luz: 'Número maestro poco frecuente: amor que sirve y sana con humildad.',
      sombra: 'Agotamiento, sacrificio sin límites, idealismo rígido.',
      amor: 'Entrega profunda; debe cuidar su propio equilibrio.', trabajo: 'Sanación, docencia, liderazgo compasivo.', cuerpo: 'Corazón y energía vital.',
      prac: 'Pon un límite amoroso hoy: decir "no" también es cuidar.' }
  };

  // Deuda kármica: número intermedio antes de reducir
  var KARMIC = {
    13: ['13/4', 'Pereza o abuso de la libertad en vidas pasadas: la lección es el trabajo constante, la disciplina amable y el valor de construir paso a paso.'],
    14: ['14/5', 'Mal uso de la libertad, excesos o adicciones: aprendes la moderación, el compromiso y a canalizar el cambio sin destruir.'],
    16: ['16/7', 'Orgullo, ego o romper vínculos por vanidad: la lección es la humildad; las estructuras que se derrumban liberan una verdad más profunda.'],
    19: ['19/1', 'Abuso del poder o egoísmo: aprendes a pedir ayuda, a liderar con servicio y a ser independiente sin aislarte.']
  };

  // Cuadrado de Pitágoras: cada celda, y qué significa tener 0, 1-2, 3+ repeticiones
  var CELL = {
    1: ['Carácter y voluntad', 'Voluntad por desarrollar: cuesta imponerte, mantener el rumbo o decir "no".', 'Voluntad equilibrada y flexible.', 'Voluntad fuerte; cuida el exceso de terquedad o autoritarismo.'],
    2: ['Energía y sensibilidad', 'Energía vital a cuidar: te agotas rápido; necesitas descanso y entornos que te nutran.', 'Energía normal y empática.', 'Mucha energía y magnetismo; aprende a canalizarla y a descansar.'],
    3: ['Mente y curiosidad', 'Curiosidad intelectual por cultivar; el orden mental se entrena.', 'Mente ágil y creativa.', 'Mente muy inquieta; busca foco y estructura.'],
    4: ['Salud y cuerpo', 'Cuerpo sensible: crea rutinas de salud y presta atención a tu bienestar.', 'Salud estable con buenos hábitos.', 'Gran resistencia física; evita trabajar sin descanso.'],
    5: ['Intuición y lógica', 'Intuición por despertar: se entrena con silencio, meditación y diario.', 'Intuición presente; confía en las corazonadas.', 'Intuición muy desarrollada; verifica con los hechos.'],
    6: ['Trabajo y habilidad', 'El trabajo manual o la constancia necesitan práctica; busca vocación antes que obligación.', 'Buena capacidad práctica.', 'Gran necesidad de producir; cuida el equilibrio con el ocio.'],
    7: ['Suerte y aprendizaje', 'Aprendes por esfuerzo propio: la suerte llega con preparación.', 'Suerte moderada y aprendizaje continuo.', 'Mucho talento y aprendizaje; cuidado con confiarte demasiado.'],
    8: ['Deber y responsabilidad', 'El sentido del deber se construye: aprende a comprometerte contigo y con otros.', 'Buen sentido de la responsabilidad.', 'Muy responsable; cuidado con la autoexigencia o la carga ajena.'],
    9: ['Memoria y comprensión', 'La memoria y la visión global se fortalecen estudiando y escribiendo.', 'Memoria y comprensión sanas.', 'Gran capacidad de comprensión; aprende a olvidar y soltar.']
  };
  var LINES = [
    ['Autoestima', [1, 2, 3]], ['Ingresos y recursos', [4, 5, 6]], ['Talento', [7, 8, 9]],
    ['Determinación', [1, 4, 7]], ['Familia y vínculos', [2, 5, 8]], ['Estabilidad y hábitos', [3, 6, 9]],
    ['Propósito vital', [1, 5, 9]], ['Temperamento', [3, 5, 7]]
  ];

  // Números angélicos / repetidos
  var ANGEL = {
    '000': 'Ciclo que termina y empieza: vacío fértil, regreso al origen.',
    '111': 'Atención a tus pensamientos: lo que enfocas se manifiesta; nuevo comienzo y alineación.',
    '222': 'Equilibrio, confianza y cooperación: lo que plantaste está creciendo, ten paciencia.',
    '333': 'Creatividad, expansión y apoyo; tu voz importa, exprésala.',
    '444': 'Bases firmes y protección; sigues el camino correcto, construye con calma.',
    '555': 'Un gran cambio se acerca; adáptate y suelta lo que ya no te sirve.',
    '666': 'Equilibrio entre lo material y lo espiritual; revisa miedos, preocupaciones y cuidado de ti y de tu hogar.',
    '777': 'Introspección y sabiduría; momento de estudio, silencio y confianza en tu proceso.',
    '888': 'Abundancia y fluidez de energía; cosechas lo sembrado, comparte con generosidad.',
    '999': 'Cierre de ciclo: termina lo pendiente y prepárate para un nuevo capítulo.',
    '1010': 'Confía en tu intuición: es una señal de nuevos comienzos conscientes.',
    '1111': 'Portal de manifestación: alinea pensamiento, emoción y acción; pide con claridad.',
    '1212': 'Mantén el rumbo y confía; la cooperación y la fe traen estabilidad.',
    '1234': 'Un paso a la vez: vas progresando de forma ordenada, sigue la secuencia.',
    '2020': 'Visión clara, perspectiva y equilibrio en decisiones.',
    '2121': 'Cooperación y cambio: observa cómo la colaboración abre caminos.',
    '2222': 'Equilibrio y manifestación en tierra: el trabajo en equipo da fruto.',
    '3333': 'Maestros ascendidos y apoyo espiritual en tu creatividad.',
    '4444': 'Protección fuerte; estructura firme para tus proyectos.',
    '5555': 'Transformación profunda: libertad y cambio se hacen presentes.',
    '6666': 'Vuelve a tu centro: salud, hogar y equilibrio emocional.',
    '7777': 'Alineación espiritual y confirmación de tu camino de aprendizaje.',
    '8888': 'Gran ciclo de abundancia y poder personal: responsabilidad con lo que recibes.',
    '9999': 'Cierre completo y entrega de dones al mundo.',
    '1221': 'Reflejo y equilibrio: lo que das vuelve; observa tus relaciones.',
    '1331': 'Creatividad que nace de dentro; pon tu inspiración en acción.',
    '0101': 'Nuevos comienzos desde la calma.',
    '911': 'Atención y cuidado: una llamada a la acción o a pedir ayuda cuando sea necesario.',
    '123': 'Avanzas paso a paso: sencillez y progreso.',
    '321': 'Cuenta atrás: cuidado con las prisas; reduce el ritmo y simplifica.',
    '1313': 'Cambio y transformación hacia un nuevo orden.',
    '1414': 'Constancia y apoyo en el trabajo; lo estable crece.',
    '1515': 'Cambios positivos en tu estilo de vida.',
    '1616': 'Revisa tu seguridad interna y cuida tus hábitos.',
    '1717': 'Aprendizaje y espiritualidad guiando tus decisiones.',
    '1818': 'Cierre de ciclos materiales y renovación.',
    '1919': 'Nuevos comienzos tras un cierre.',
    '1122': 'Equilibrio entre inspiración y realidad.',
    '2323': 'Armonía en el cambio: abraza las transiciones.',
    '2424': 'Estabilidad y cooperación fortaleciendo tu base.',
    '2525': 'Cambio guiado por la sensibilidad.',
    '4545': 'Estructura y cambio en armonía.',
    '5050': 'Expansión: sigue tu libertad con cuidado.',
    '1357': 'Pasos impares hacia lo nuevo: confía en el proceso.'
  };

  // Letras pitagóricas
  var LETTERS = { A: 1, J: 1, S: 1, B: 2, K: 2, T: 2, C: 3, L: 3, U: 3, D: 4, M: 4, V: 4, E: 5, N: 5, W: 5, F: 6, O: 6, X: 6, G: 7, P: 7, Y: 7, H: 8, Q: 8, Z: 8, I: 9, R: 9 };
  var PLANES = {
    'Físico': [4, 5], 'Mental': [1, 8], 'Emocional': [2, 3, 6], 'Intuitivo': [7, 9]
  };
  var PLANE_TXT = {
    'Físico': 'Acción, cuerpo, practicidad: haces que las cosas ocurran.',
    'Mental': 'Análisis, estrategia, ideas: piensas antes de actuar.',
    'Emocional': 'Sentimiento, vínculo, expresión: te mueves por lo que sientes.',
    'Intuitivo': 'Percepción sutil, visión, espiritualidad: te guías por lo invisible.'
  };

  var PINNACLE_TXT = {
    1: 'Etapa de independencia, iniciativa y liderazgo personal.', 2: 'Etapa de cooperación, paciencia y vínculos.',
    3: 'Etapa de creatividad, expresión y vida social.', 4: 'Etapa de construcción, disciplina y trabajo duro.',
    5: 'Etapa de cambio, libertad y experiencias nuevas.', 6: 'Etapa de familia, responsabilidad y cuidado.',
    7: 'Etapa de estudio, introspección y búsqueda espiritual.', 8: 'Etapa de logro, poder personal y manejo de recursos.',
    9: 'Etapa de servicio, compasión y cierre de ciclos.', 11: 'Etapa de inspiración y sensibilidad elevada.', 22: 'Etapa de grandes construcciones.', 33: 'Etapa de servicio amoroso.'
  };
  var CHALLENGE_TXT = {
    0: 'Elegir con libertad: sin un reto fijo, tu desafío es decidir conscientemente.', 1: 'Confiar en ti y afirmar tu voz sin imponerte.',
    2: 'Gestionar la sensibilidad y la indecisión.', 3: 'Expresarte sin dispersarte ni criticarte.', 4: 'Ser flexible sin perder la estructura.',
    5: 'Manejar la libertad y los excesos.', 6: 'Equilibrar cuidar a otros y cuidarte.', 7: 'Confiar y abrirte sin aislarte.', 8: 'Usar el poder con ética y equilibrio.'
  };

  var COMPAT_FAM = { 1: 'A', 5: 'A', 7: 'A', 2: 'B', 4: 'B', 8: 'B', 3: 'C', 6: 'C', 9: 'C' };

  window.NUMDATA = { N: N, KARMIC: KARMIC, CELL: CELL, LINES: LINES, ANGEL: ANGEL, LETTERS: LETTERS, PLANES: PLANES, PLANE_TXT: PLANE_TXT, PINNACLE_TXT: PINNACLE_TXT, CHALLENGE_TXT: CHALLENGE_TXT, COMPAT_FAM: COMPAT_FAM };
})();
