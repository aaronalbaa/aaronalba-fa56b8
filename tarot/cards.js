/* Baraja completa: 22 Arcanos Mayores + 56 Menores */
(function () {
  // [nombre, emoji, claves (derecha), claves (invertida), significado, significado invertida]
  var MAJORS = [
    ['El Loco', '🃏', 'Inicio, libertad, fe', 'Imprudencia, miedo a saltar',
      'Un salto de fe al comenzar un camino nuevo; confía y mantén la mente abierta.',
      'Dudas o impulsividad: mira dónde pisas antes de dar el paso.'],
    ['El Mago', '🪄', 'Voluntad, recursos, acción', 'Manipulación, talento sin usar',
      'Tienes todas las herramientas para manifestar lo que deseas; es hora de actuar.',
      'Energía dispersa o promesas vacías; enfoca tu talento con honestidad.'],
    ['La Sacerdotisa', '🌙', 'Intuición, misterio, silencio', 'Secretos, desconexión interior',
      'Escucha tu voz interior: la respuesta está en lo que todavía no se dice.',
      'Ignoras tu intuición o algo se oculta; vuelve a la calma para oírla.'],
    ['La Emperatriz', '🌹', 'Abundancia, creatividad, cuidado', 'Dependencia, bloqueo creativo',
      'Fertilidad en todos los sentidos: crea, nutre y disfruta de lo sensorial.',
      'Sobreprotección o estancamiento; cuídate tú también.'],
    ['El Emperador', '🏛️', 'Estructura, autoridad, estabilidad', 'Rigidez, control',
      'Orden, límites claros y liderazgo para construir algo sólido.',
      'Exceso de control o falta de disciplina; busca equilibrio entre firmeza y flexibilidad.'],
    ['El Hierofante', '📿', 'Tradición, guía, aprendizaje', 'Rebeldía, dogmatismo',
      'Conocimiento heredado y mentores: aprender de lo que ya ha funcionado.',
      'Cuestiona las reglas que ya no te sirven y encuentra tu propio camino.'],
    ['Los Enamorados', '💞', 'Amor, elección, armonía', 'Desequilibrio, dudas',
      'Una decisión del corazón alineada con tus valores; un vínculo auténtico.',
      'Desacuerdo o elección evitada; revisa si actúas según lo que valoras.'],
    ['El Carro', '🏇', 'Determinación, victoria, rumbo', 'Falta de rumbo, agresividad',
      'Avanzas con disciplina y enfoque; dominas fuerzas opuestas para ganar.',
      'Dispersión o choque de voluntades; recupera las riendas.'],
    ['La Fuerza', '🦁', 'Coraje suave, paciencia, compasión', 'Inseguridad, ira contenida',
      'La verdadera fuerza es amable: vences el miedo con cariño y constancia.',
      'Dudas sobre ti mismo; recuerda tu poder interior.'],
    ['El Ermitaño', '🏮', 'Introspección, sabiduría, soledad', 'Aislamiento, evasión',
      'Un momento de retiro para encontrar tu propia luz y tu verdad.',
      'El aislamiento se alarga o evitas mirarte por dentro; vuelve a abrir la puerta.'],
    ['La Rueda de la Fortuna', '🎡', 'Ciclos, destino, cambio', 'Mala racha, resistencia al cambio',
      'La vida gira: llega un giro favorable y una oportunidad del destino.',
      'Un bache temporal; no te resistas, la rueda sigue girando.'],
    ['La Justicia', '⚖️', 'Verdad, equilibrio, causa y efecto', 'Injusticia, deshonestidad',
      'Decide con claridad y honestidad; recibirás lo que has sembrado.',
      'Falta de responsabilidad o juicio sesgado; busca la verdad completa.'],
    ['El Colgado', '🙃', 'Pausa, nueva perspectiva, entrega', 'Estancamiento, sacrificio inútil',
      'Detenerte te permite ver desde otro ángulo; suelta el control.',
      'Esperas sin aprender nada; es momento de decidir.'],
    ['La Muerte', '🦋', 'Transformación, final, renacer', 'Resistencia al cambio',
      'Algo termina para dejar espacio a lo nuevo. No es literal: es renovación.',
      'Te aferras a lo que ya acabó; soltar te liberaría.'],
    ['La Templanza', '🏺', 'Equilibrio, paciencia, armonía', 'Exceso, desajuste',
      'Mezcla las cosas con calma y moderación; el punto medio sana.',
      'Extremos o prisas; vuelve a la medida justa.'],
    ['El Diablo', '😈', 'Apegos, tentación, sombra', 'Liberación, romper cadenas',
      'Cadenas que tú mismo aceptaste: hábitos, miedos o vínculos que te limitan.',
      'Empiezas a soltar lo que te ataba y recuperas tu libertad.'],
    ['La Torre', '⚡', 'Ruptura, revelación, sacudida', 'Evitar el desastre, miedo al cambio',
      'Algo falso se derrumba de golpe y te libera; reconstruye sobre la verdad.',
      'Un cambio inevitable se retrasa; mejor afrontarlo que evitarlo.'],
    ['La Estrella', '⭐', 'Esperanza, sanación, inspiración', 'Desánimo, desconfianza',
      'Tras la tormenta llegan la calma y la fe renovada; confía en el futuro.',
      'Pierdes la esperanza por un momento; cuida tu luz.'],
    ['La Luna', '🌕', 'Ilusión, intuición, subconsciente', 'Claridad, miedos que se disipan',
      'No todo es lo que parece; atiende a tus sueños y emociones con cautela.',
      'La confusión se disipa y empiezas a ver las cosas como son.'],
    ['El Sol', '☀️', 'Alegría, éxito, vitalidad', 'Optimismo apagado, retrasos',
      'Claridad, éxito y calidez: tiempos luminosos y de celebración.',
      'La alegría se ve nublada; es algo temporal.'],
    ['El Juicio', '📯', 'Llamada interior, renacer, balance', 'Autocrítica, dudas',
      'Escuchas una llamada interior para renacer y perdonar el pasado.',
      'Te juzgas con dureza; perdónate para poder avanzar.'],
    ['El Mundo', '🌍', 'Plenitud, cierre, logro', 'Incompleto, falta de cierre',
      'Un ciclo se completa con éxito: integración y celebración.',
      'Te falta un último paso para cerrar; no abandones al final.']
  ];

  var ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV',
    'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

  var SUITS = [
    { id: 'bastos', name: 'Bastos', emoji: '🔥', element: 'Fuego', kw: 'Energía, pasión',
      inn: 'en el terreno de la acción, la pasión y los proyectos' },
    { id: 'copas', name: 'Copas', emoji: '🏆', element: 'Agua', kw: 'Emoción, vínculos',
      inn: 'en lo emocional y en las relaciones' },
    { id: 'espadas', name: 'Espadas', emoji: '⚔️', element: 'Aire', kw: 'Mente, verdad',
      inn: 'en la mente, la comunicación y las decisiones' },
    { id: 'oros', name: 'Oros', emoji: '🪙', element: 'Tierra', kw: 'Material, trabajo',
      inn: 'en lo material: dinero, trabajo y salud' }
  ];

  var RANKS = [
    ['As', 'A', 'Semilla, comienzo',
      'Una semilla de potencial y un nuevo comienzo', 'Una oportunidad que aún no despega o que se desperdicia'],
    ['2', '2', 'Dualidad, elección',
      'Una elección o un equilibrio entre dos fuerzas', 'Indecisión o desequilibrio'],
    ['3', '3', 'Crecimiento, colaboración',
      'Primer crecimiento y colaboración', 'Falta de cooperación o retrasos'],
    ['4', '4', 'Estabilidad, pausa',
      'Estabilidad, descanso y una base firme', 'Estancamiento o inquietud'],
    ['5', '5', 'Conflicto, cambio',
      'Tensión, conflicto o un desafío que obliga a cambiar', 'Un conflicto que se resuelve o se arrastra'],
    ['6', '6', 'Armonía, transición',
      'Armonía recuperada y un avance suave', 'Un avance lento o una deuda pendiente'],
    ['7', '7', 'Reto, evaluación',
      'Un reto que pide perseverancia y estrategia', 'Duda o esfuerzo mal dirigido'],
    ['8', '8', 'Movimiento, maestría',
      'Movimiento, trabajo y maestría en marcha', 'Prisas o falta de enfoque'],
    ['9', '9', 'Casi logrado, madurez',
      'Casi en la meta, con resistencia acumulada', 'Agotamiento o ansiedad cerca del final'],
    ['10', '10', 'Culminación, ciclo',
      'La culminación de un ciclo, para bien o para mal', 'Un cierre que cuesta o una carga prolongada'],
    ['Sota', 'S', 'Mensaje, curiosidad',
      'Un mensaje, curiosidad y energía de aprendiz', 'Inmadurez o noticias que tardan'],
    ['Caballo', 'C', 'Acción, impulso',
      'Acción decidida y movimiento hacia una meta', 'Impulsividad o estancamiento'],
    ['Reina', 'R', 'Madurez interior, cuidado',
      'Dominio interior y apoyo maduro', 'Inseguridad o energía desequilibrada'],
    ['Rey', 'K', 'Maestría, liderazgo',
      'Maestría, liderazgo y control sereno', 'Autoritarismo o abuso de poder']
  ];

  var CARDS = [];
  var i;
  for (i = 0; i < MAJORS.length; i++) {
    var m = MAJORS[i];
    CARDS.push({
      id: i, arcana: 'mayor', num: ROMAN[i], name: m[0], emoji: m[1],
      kwUp: m[2], kwRev: m[3], up: m[4], rev: m[5], suit: null
    });
  }
  SUITS.forEach(function (s) {
    RANKS.forEach(function (r, ri) {
      var plain = r[0].length <= 2;
      CARDS.push({
        id: CARDS.length, arcana: 'menor', num: r[1],
        name: plain ? r[0] + ' de ' + s.name : r[0] + ' de ' + s.name,
        emoji: s.emoji, suit: s.id,
        kwUp: r[2] + ' · ' + s.kw, kwRev: 'Bloqueo de: ' + r[2].toLowerCase(),
        up: r[3] + ' ' + s.inn + '.', rev: r[4] + ' ' + s.inn + '.'
      });
    });
  });

  window.TAROT = { CARDS: CARDS, SUITS: SUITS };
})();
