/* Contenido de la Academia. Cada paso es "learn" (explicación con animación) o "quiz". */
(function () {
  function quiz(q, opts, a, why) { return { t: 'quiz', q: q, opts: opts, a: a, why: why }; }
  function learn(title, body, anim) { return { t: 'learn', title: title, body: body, anim: anim }; }

  var UNITS = [
    {
      id: 'u1', emoji: '🃏', title: 'Tarot desde cero', sub: 'Lo esencial de la baraja',
      lessons: [
        {
          id: 'u1l1', emoji: '🔮', title: '¿Qué es el tarot?',
          steps: [
            learn('Una baraja de 78 cartas',
              'El tarot clásico tiene <b>78 cartas</b>: 22 Arcanos Mayores y 56 Arcanos Menores. "Arcano" significa <b>secreto</b> o <b>misterio</b>.', 'cards'),
            learn('Un espejo, no una sentencia',
              'El tarot no dicta un destino fijo. Es un <b>espejo simbólico</b> para pensar tu situación, tus opciones y tus emociones con más claridad.', 'stars'),
            quiz('¿Cuántas cartas tiene un tarot clásico?', ['56', '72', '78', '22'], 2, 'Son 22 Mayores + 56 Menores = 78.'),
            quiz('¿Qué significa "arcano"?', ['Carta', 'Secreto o misterio', 'Futuro', 'Baraja'], 1, 'Arcano viene del latín arcanus: oculto, secreto.')
          ]
        },
        {
          id: 'u1l2', emoji: '🌟', title: 'Mayores y Menores',
          steps: [
            learn('Arcanos Mayores',
              '<b>22 cartas</b> numeradas del 0 al 21. Hablan de los <b>grandes temas</b> y etapas de la vida: El Loco, La Luna, El Sol…', 'cards'),
            learn('Arcanos Menores',
              '<b>56 cartas</b> del día a día, en cuatro palos de 14 cartas: del As al 10, más Sota, Caballo, Reina y Rey.', 'cards'),
            quiz('Un 7 de Copas pertenece a…', ['Arcanos Mayores', 'Arcanos Menores'], 1, 'Las cartas de palo (Bastos, Copas, Espadas, Oros) son Menores.'),
            quiz('¿Cuántas cartas tiene cada palo?', ['10', '14', '22', '12'], 1, 'As a 10 (10 cartas) + 4 figuras = 14.')
          ]
        },
        {
          id: 'u1l3', emoji: '🔥', title: 'Los cuatro palos',
          steps: [
            learn('Cuatro elementos, cuatro áreas',
              '🔥 <b>Bastos</b>: fuego, acción y pasión.<br>💧 <b>Copas</b>: agua, emociones y amor.<br>🌬️ <b>Espadas</b>: aire, mente y verdad.<br>🌍 <b>Oros</b>: tierra, dinero, trabajo y cuerpo.', 'elements'),
            quiz('¿Qué palo habla de emociones y amor?', ['Bastos', 'Copas', 'Espadas', 'Oros'], 1, 'Copas = agua = emociones.'),
            quiz('Tu pregunta es sobre dinero y trabajo. ¿Qué palo esperarías ver?', ['Oros', 'Copas', 'Espadas'], 0, 'Oros = tierra = lo material.'),
            quiz('Las Espadas se asocian con…', ['La tierra y el dinero', 'El aire y la mente', 'El fuego y la pasión'], 1, 'Espadas = aire = pensamiento, palabra y verdad.')
          ]
        },
        {
          id: 'u1l4', emoji: '❓', title: 'Invertidas y buenas preguntas',
          steps: [
            learn('Cartas invertidas',
              'Una carta <b>invertida</b> sale cabeza abajo. No es "mala": suele indicar una energía <b>bloqueada</b>, interna o con otro matiz. Algunas personas no las usan, y está bien.', 'cards'),
            learn('Preguntar bien',
              'Las mejores preguntas son <b>abiertas</b>: "¿Qué necesito entender sobre…?". Evita el sí/no rígido y las preguntas sobre salud grave, temas legales o la muerte.', 'stars'),
            quiz('¿Cuál es una mejor pregunta?',
              ['¿Cuándo moriré?', '¿Qué necesito entender sobre mi trabajo ahora?', '¿Me tocará la lotería?', '¿Volverá sí o no?'], 1,
              'Las preguntas abiertas dan lecturas más útiles que las de sí/no.')
          ]
        }
      ]
    },
    {
      id: 'u2', emoji: '🌟', title: 'El viaje del Loco', sub: 'Los Arcanos Mayores como historia',
      lessons: [
        {
          id: 'u2l1', emoji: '🎒', title: 'El Loco se pone en marcha',
          steps: [
            learn('Una historia en 22 pasos',
              'Los Arcanos Mayores se leen como un <b>viaje</b>. <b>El Loco (0)</b> sale con fe y sin mapa; el camino acaba en <b>El Mundo (21)</b>.', 'fool'),
            quiz('¿Qué número tiene El Loco?', ['0', '1', '21', '22'], 0, 'El Loco es el 0: el punto de partida.'),
            quiz('¿Qué carta cierra el viaje?', ['El Sol', 'La Muerte', 'El Mundo', 'El Mago'], 2, 'El Mundo (21) simboliza plenitud y cierre.')
          ]
        },
        {
          id: 'u2l2', emoji: '🧙', title: 'Los primeros maestros',
          steps: [
            learn('Del 1 al 7',
              '🪄 <b>Mago</b>: voluntad · 🌙 <b>Sacerdotisa</b>: intuición · 🌹 <b>Emperatriz</b>: abundancia · 🏛️ <b>Emperador</b>: estructura · 📿 <b>Hierofante</b>: tradición · 💞 <b>Enamorados</b>: elección · 🏇 <b>Carro</b>: determinación.', 'cards'),
            quiz('¿Qué carta representa la intuición y el misterio?', ['El Mago', 'La Sacerdotisa', 'El Carro'], 1, 'La Sacerdotisa guarda el silencio y la voz interior.'),
            quiz('Una elección tomada con el corazón sería…', ['Los Enamorados', 'El Emperador', 'La Torre'], 0, 'Los Enamorados hablan de elegir según tus valores.')
          ]
        },
        {
          id: 'u2l3', emoji: '🌗', title: 'Luz y sombra',
          steps: [
            learn('Cuatro cartas que marcan',
              '☀️ <b>El Sol</b>: alegría y éxito.<br>🌕 <b>La Luna</b>: ilusión y subconsciente.<br>⭐ <b>La Estrella</b>: esperanza y sanación.<br>⚡ <b>La Torre</b>: ruptura que libera.', 'stars'),
            learn('La Torre no es un castigo',
              'Cuando sale La Torre, algo construido sobre bases falsas cae. Duele, pero abre espacio para <b>reconstruir sobre verdad</b>.', 'stars'),
            quiz('¿Qué carta habla de esperanza tras la tormenta?', ['La Torre', 'La Estrella', 'La Luna'], 1, 'La Estrella llega después de La Torre.'),
            quiz('La Luna advierte de…', ['Éxito rotundo', 'Ilusiones y cosas que no son lo que parecen', 'Un final'], 1, 'La Luna es el mundo de los sueños y la confusión.'),
            quiz('El Sol representa…', ['Alegría y claridad', 'Soledad', 'Conflicto'], 0, 'El Sol es vitalidad y éxito.')
          ]
        }
      ]
    },
    {
      id: 'u3', emoji: '🕯️', title: 'Ritual y presencia', sub: 'Prepárate antes de leer',
      lessons: [
        {
          id: 'u3l1', emoji: '🌬️', title: 'Respira antes de leer',
          steps: [
            learn('Respiración 4 · 4 · 6',
              'Sigue el círculo: <b>inhala 4</b> segundos, <b>sostén 4</b>, <b>exhala 6</b>. Haz 3 ciclos. Calmar el cuerpo ayuda a que la mente esté presente.', 'breath'),
            quiz('¿Cuándo es buen momento para esta respiración?', ['Antes de barajar, para centrarte', 'Nunca', 'Solo al terminar'], 0, 'Centrarte antes ayuda a formular mejor la pregunta.')
          ]
        },
        {
          id: 'u3l2', emoji: '🕯️', title: 'Prepara tu espacio',
          steps: [
            learn('Un pequeño ritual',
              'Ordena la mesa, baja las luces, enciende una vela o incienso si te gusta y ten agua cerca. No es obligatorio: es una forma de decirle a tu mente <b>"ahora toca escuchar"</b>.', 'candle'),
            learn('Seguridad primero',
              'Si usas velas o incienso: <b>nunca los dejes sin vigilancia</b>, mantenlos lejos de telas y papeles, y ventila la habitación.', 'candle'),
            quiz('¿Qué haces con una vela encendida?', ['La dejo sola un rato', 'No la pierdo de vista y la apago al terminar', 'La pongo junto a las cortinas'], 1, 'La seguridad es parte del ritual.')
          ]
        },
        {
          id: 'u3l3', emoji: '🎴', title: 'Barajar con intención',
          steps: [
            learn('Baraja pensando en la pregunta',
              'Mientras barajas, mantén la pregunta en mente. Cuando sientas que basta, <b>corta el mazo</b> y reparte según la tirada. No existe una única forma correcta: lo importante es la <b>atención</b>.', 'shuffle'),
            quiz('¿Qué debes tener en mente al barajar?', ['La pregunta que quieres explorar', 'La lista de la compra', 'Nada en absoluto'], 0, 'La intención da foco a la lectura.')
          ]
        }
      ]
    },
    {
      id: 'u4', emoji: '🌙', title: 'Luna y ciclos', sub: 'Los ritmos de la Luna',
      lessons: [
        {
          id: 'u4l1', emoji: '🌓', title: 'Las fases lunares',
          steps: [
            learn('Ocho fases',
              'La Luna recorre <b>8 fases</b> en unos <b>29,5 días</b>: nueva, creciente, cuarto creciente, gibosa creciente, llena, gibosa menguante, cuarto menguante y menguante.', 'moon'),
            quiz('¿Cuánto dura aproximadamente un ciclo lunar?', ['7 días', '15 días', '29-30 días', '60 días'], 2, 'Unos 29,5 días entre dos lunas nuevas.'),
            quiz('Simbólicamente, la Luna nueva invita a…', ['Soltar', 'Sembrar intenciones', 'Celebrar'], 1, 'La nueva es un lienzo en blanco.')
          ]
        },
        {
          id: 'u4l2', emoji: '📝', title: 'Rituales con la Luna',
          steps: [
            learn('Un ritual para cada fase',
              '🌑 <b>Nueva</b>: escribe intenciones.<br>🌓 <b>Creciente</b>: pasa a la acción.<br>🌕 <b>Llena</b>: agradece y celebra.<br>🌗 <b>Menguante</b>: suelta lo que ya no sirve.', 'moon'),
            quiz('¿Qué fase se asocia con soltar?', ['Creciente', 'Menguante', 'Llena'], 1, 'Al menguar, la luz se retira: es momento de soltar.'),
            quiz('Escribir tus intenciones encaja mejor en…', ['Luna nueva', 'Luna llena'], 0, 'La nueva es el inicio del ciclo.')
          ]
        }
      ]
    },
    {
      id: 'u5', emoji: '💎', title: 'Chakras y cristales', sub: 'Energía y símbolos',
      lessons: [
        {
          id: 'u5l1', emoji: '🌈', title: 'Los siete chakras',
          steps: [
            learn('Siete centros de energía',
              'En la tradición india, los chakras son centros de energía a lo largo de la columna. Cada uno tiene un color y un tema.', 'chakra'),
            learn('De abajo arriba',
              '🔴 <b>Raíz</b>: seguridad · 🟠 <b>Sacro</b>: emoción y creatividad · 🟡 <b>Plexo solar</b>: voluntad · 🟢 <b>Corazón</b>: amor · 🔵 <b>Garganta</b>: expresión · 🟣 <b>Tercer ojo</b>: intuición · ⚪ <b>Corona</b>: conexión espiritual.', 'chakra'),
            quiz('¿Qué chakra se asocia con el amor?', ['Raíz', 'Corazón', 'Garganta'], 1, 'El chakra del corazón es verde y habla de amor y compasión.'),
            quiz('¿Cuál es el chakra de la intuición?', ['Tercer ojo', 'Sacro', 'Plexo solar'], 0, 'El tercer ojo, entre las cejas.'),
            quiz('El chakra Raíz se relaciona con…', ['Seguridad y estabilidad', 'Creatividad', 'Comunicación'], 0, 'Es la base: lo seguro y lo terrenal.')
          ]
        },
        {
          id: 'u5l2', emoji: '🔮', title: 'Cristales básicos',
          steps: [
            learn('Cinco cristales para empezar',
              '🤍 <b>Cuarzo cristal</b>: claridad.<br>🟣 <b>Amatista</b>: calma e intuición.<br>🌸 <b>Cuarzo rosa</b>: amor y ternura.<br>🟡 <b>Citrino</b>: optimismo y abundancia.<br>⚫ <b>Turmalina negra</b>: protección.', 'crystals'),
            learn('Un apunte honesto',
              'Los significados de los cristales son <b>simbólicos y tradicionales</b>; no hay evidencia científica de efectos físicos. Úsalos como recordatorio de tu intención.', 'crystals'),
            quiz('¿Qué cristal se asocia con el amor?', ['Citrino', 'Cuarzo rosa', 'Turmalina negra'], 1, 'El cuarzo rosa es el cristal del corazón.'),
            quiz('La amatista suele simbolizar…', ['Calma e intuición', 'Dinero', 'Fuerza física'], 0, 'Se asocia con la serenidad y el tercer ojo.')
          ]
        }
      ]
    },
    {
      id: 'u6', emoji: '♈', title: 'Astrología básica', sub: 'Elementos y tu trío principal',
      lessons: [
        {
          id: 'u6l1', emoji: '🔥', title: 'Los cuatro elementos',
          steps: [
            learn('Doce signos, cuatro elementos',
              '🔥 <b>Fuego</b>: Aries, Leo, Sagitario<br>🌍 <b>Tierra</b>: Tauro, Virgo, Capricornio<br>🌬️ <b>Aire</b>: Géminis, Libra, Acuario<br>💧 <b>Agua</b>: Cáncer, Escorpio, Piscis', 'elements'),
            quiz('Leo es un signo de…', ['Fuego', 'Agua', 'Aire', 'Tierra'], 0, 'Aries, Leo y Sagitario son de fuego.'),
            quiz('Escorpio es de…', ['Tierra', 'Agua', 'Aire'], 1, 'Cáncer, Escorpio y Piscis son de agua.'),
            quiz('Capricornio es de…', ['Tierra', 'Fuego', 'Aire'], 0, 'Tauro, Virgo y Capricornio son de tierra.')
          ]
        },
        {
          id: 'u6l2', emoji: '☀️', title: 'Sol, Luna y Ascendente',
          steps: [
            learn('Tu trío principal',
              '☀️ <b>Sol</b>: tu esencia e identidad.<br>🌙 <b>Luna</b>: tus emociones y tu mundo interior.<br>⬆️ <b>Ascendente</b>: cómo te muestras y la primera impresión.', 'zodiac'),
            learn('Para calcular el Ascendente',
              'Necesitas tu <b>fecha, hora y lugar</b> de nacimiento: el Ascendente cambia aproximadamente cada dos horas.', 'zodiac'),
            quiz('¿Qué representa la Luna en una carta natal?', ['Emociones y mundo interior', 'Tu trabajo', 'Tu suerte'], 0, 'La Luna habla de lo que sientes por dentro.'),
            quiz('Para el Ascendente necesitas…', ['Solo tu signo', 'Fecha, hora y lugar de nacimiento', 'Tu color favorito'], 1, 'Sin la hora exacta no se puede calcular con precisión.')
          ]
        }
      ]
    },
    {
      id: 'u7', emoji: '🔢', title: 'Numerología', sub: 'El lenguaje de los números',
      lessons: [
        {
          id: 'u7l1', emoji: '🧮', title: 'Tu camino de vida',
          steps: [
            learn('Reduce tu fecha',
              'Suma todos los dígitos de tu fecha de nacimiento hasta quedarte con <b>un solo dígito</b>. Ejemplo: 14/03/1990 → 1+4+0+3+1+9+9+0 = 27 → 2+7 = <b>9</b>.', 'numbers'),
            learn('Significados breves',
              '1 iniciativa · 2 cooperación · 3 creatividad · 4 estabilidad · 5 cambio · 6 cuidado · 7 introspección · 8 logro · 9 cierre y compasión.', 'numbers'),
            quiz('¿Cuál es el camino de vida de 01/01/2000?', ['3', '4', '5', '7'], 1, '0+1+0+1+2+0+0+0 = 4.'),
            quiz('El número 7 se asocia con…', ['Introspección', 'Acción rápida', 'Dinero'], 0, 'El 7 busca profundidad y silencio.')
          ]
        },
        {
          id: 'u7l2', emoji: '🎯', title: 'Números en las cartas',
          steps: [
            learn('Los números del tarot',
              'En los Menores, cada número tiene un tema: el <b>As</b> es un comienzo, el <b>5</b> trae conflicto y cambio, el <b>10</b> culmina el ciclo.', 'numbers'),
            quiz('El As de cualquier palo habla de…', ['Un final', 'Un comienzo', 'Un conflicto'], 1, 'El As es la semilla.'),
            quiz('El 5 suele hablar de…', ['Conflicto o cambio', 'Descanso', 'Plenitud'], 0, 'Es el número de la tensión que impulsa a crecer.')
          ]
        }
      ]
    },
    {
      id: 'u8', emoji: '🔮', title: 'Más formas de adivinar', sub: 'Runas, I Ching, Lenormand y el cielo',
      lessons: [
        {
          id: 'u8l1', emoji: 'ᚱ', title: 'Las runas',
          steps: [
            learn('El alfabeto sagrado',
              'El <b>Futhark antiguo</b> tiene <b>24 runas</b> germánicas. Cada una es una letra y un concepto: <b>Fehu</b> (riqueza), <b>Uruz</b> (fuerza), <b>Raidho</b> (viaje), <b>Othala</b> (herencia)…', 'stars'),
            learn('¿Y las invertidas?',
              'Las runas simétricas (como <b>Isa</b>, <b>Gebo</b> o <b>Dagaz</b>) se ven igual al revés, así que <b>no tienen versión invertida</b>.', 'cards'),
            quiz('¿Cuántas runas tiene el Futhark antiguo?', ['16', '20', '24', '36'], 2, 'El Futhark antiguo tiene 24 runas.'),
            quiz('¿Qué runa se asocia con la riqueza y los recursos?', ['Fehu', 'Isa', 'Raidho'], 0, 'Fehu significa originalmente “ganado”, riqueza móvil.'),
            quiz('¿Cuál de estas runas no tiene versión invertida?', ['Fehu', 'Isa', 'Ansuz'], 1, 'Isa es una línea vertical: simétrica.')
          ]
        },
        {
          id: 'u8l2', emoji: '☯️', title: 'El I Ching',
          steps: [
            learn('El libro de las mutaciones',
              'El I Ching es un texto chino milenario con <b>64 hexagramas</b>. Cada hexagrama son <b>seis líneas</b>: <b>yang</b> (continua) o <b>yin</b> (cortada).', 'stars'),
            learn('Las tres monedas',
              'Se lanzan tres monedas seis veces. Cara vale 3 y cruz 2; la suma da <b>6, 7, 8 o 9</b>. El <b>6</b> y el <b>9</b> son <b>líneas móviles</b>: se transforman y forman un segundo hexagrama que muestra hacia dónde evoluciona la situación.', 'gems'),
            quiz('¿Cuántos hexagramas tiene el I Ching?', ['8', '36', '64', '78'], 2, '8 trigramas × 8 trigramas = 64 hexagramas.'),
            quiz('Una línea continua es…', ['Yin', 'Yang'], 1, 'Continua = yang; cortada = yin.'),
            quiz('¿Qué sumas indican una línea móvil?', ['7 y 8', '6 y 9', '6 y 7'], 1, 'El 6 (yin móvil) y el 9 (yang móvil) cambian.')
          ]
        },
        {
          id: 'u8l3', emoji: '🌹', title: 'Lenormand y baraja española',
          steps: [
            learn('Lenormand: directo y práctico',
              'El Lenormand tiene <b>36 cartas</b> con imágenes cotidianas (Jinete, Casa, Barco…). Se leen en <b>combinación</b>, como palabras de una frase, y <b>no se invierten</b>.', 'cards'),
            learn('La baraja española',
              'La cartomancia con baraja española usa <b>40 cartas</b> en cuatro palos: <b>oros, copas, espadas y bastos</b>, los mismos símbolos que el tarot (oros = pentáculos).', 'elements'),
            quiz('¿Cuántas cartas tiene el Lenormand?', ['22', '36', '40', '52'], 1, 'Son 36 cartas.'),
            quiz('El palo de la baraja española equivalente a los Pentáculos es…', ['Copas', 'Bastos', 'Oros'], 2, 'Oros = pentáculos = tierra.'),
            quiz('Una diferencia clave del Lenormand con el tarot es que…', ['Se lee por combinaciones de cartas', 'Tiene 78 cartas', 'Solo se usa invertido'], 0, 'El sentido surge de combinar cartas contiguas.')
          ]
        },
        {
          id: 'u8l4', emoji: '🔮', title: 'El péndulo',
          steps: [
            learn('Sí, no y quizá',
              'Sujeta el péndulo, quédate quieto y pide que te muestre su <b>“sí”</b> y su <b>“no”</b> (suele ser adelante-atrás o de lado a lado y un giro). Después haz preguntas <b>cerradas</b>.', 'shuffle'),
            learn('Un espejo de tu intuición',
              'El movimiento se debe a microgestos involuntarios (<b>efecto ideomotor</b>). No es una fuente externa: <b>refleja lo que ya intuyes</b>, y eso lo hace útil para la introspección.', 'stars'),
            quiz('¿Qué tipo de preguntas funcionan mejor con el péndulo?', ['Cerradas (sí/no)', 'Abiertas y largas', 'Sobre el futuro lejano'], 0, 'El péndulo responde a opciones claras.'),
            quiz('El movimiento del péndulo se explica principalmente por…', ['Microgestos involuntarios', 'Energía magnética', 'El viento'], 0, 'Es el efecto ideomotor.')
          ]
        },
        {
          id: 'u8l5', emoji: '🪐', title: 'Leer el cielo de hoy',
          steps: [
            learn('Retrógrado no es “malo”',
              'Un planeta <b>retrógrado</b> parece ir hacia atrás visto desde la Tierra (es un efecto óptico). En astrología simboliza <b>revisar y repensar</b>. Mercurio lo hace unas tres veces al año.', 'zodiac'),
            learn('La Luna cambia de signo',
              'La Luna pasa por un signo nuevo cada <b>2 o 3 días</b> y por los 12 en unos 27 días. Marca el <b>ánimo del momento</b>. Mira la pestaña <b>Cielo</b> para ver dónde está ahora.', 'moon'),
            quiz('¿Qué significa que un planeta esté retrógrado?', ['Parece ir hacia atrás visto desde la Tierra', 'Está a punto de chocar', 'Se ha apagado'], 0, 'Es un movimiento aparente.'),
            quiz('¿Cada cuánto cambia la Luna de signo, aproximadamente?', ['Cada 2-3 días', 'Cada mes', 'Cada año'], 0, 'Unos 2,5 días por signo.')
          ]
        }
      ]
    }
  ];

  window.ACADEMY = { UNITS: UNITS };
})();
