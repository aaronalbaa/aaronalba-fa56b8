/* Textos interpretativos de la carta natal. */
(function () {
  'use strict';
  var SUN = [
    'Tu esencia es pionera: necesitas actuar, iniciar y sentirte vivo/a. Brillas cuando eliges con valentía; tu aprendizaje es la paciencia y la empatía con quien va a otro ritmo.',
    'Tu esencia busca seguridad, belleza y autenticidad. Brillas cuando construyes algo estable y sensorial; tu aprendizaje es soltar el apego y aceptar el cambio.',
    'Tu esencia es curiosa, verbal y versátil. Brillas cuando aprendes y conectas ideas y personas; tu aprendizaje es profundizar y sostener el foco.',
    'Tu esencia es emocional y protectora. Brillas cuando cuidas, creas hogar y confías en tu sensibilidad; tu aprendizaje es poner límites y no vivir desde el miedo a perder.',
    'Tu esencia es creativa, cálida y generosa. Brillas cuando expresas tu corazón y te atreves a ser visible; tu aprendizaje es dar sin necesitar aplauso.',
    'Tu esencia es analítica, útil y detallista. Brillas cuando mejoras algo con precisión y servicio; tu aprendizaje es aceptar la imperfección y soltar la autocrítica.',
    'Tu esencia es relacional y estética. Brillas cuando creas armonía y justicia; tu aprendizaje es decidir sin depender de la aprobación ajena.',
    'Tu esencia es intensa y profunda. Brillas cuando transformas lo oscuro en verdad; tu aprendizaje es confiar y soltar el control.',
    'Tu esencia es exploradora y optimista. Brillas cuando buscas sentido, viajas y compartes tu visión; tu aprendizaje es la humildad y el compromiso.',
    'Tu esencia es ambiciosa y responsable. Brillas cuando construyes con disciplina un legado; tu aprendizaje es permitirte descansar y sentir.',
    'Tu esencia es original e independiente. Brillas cuando aportas ideas nuevas al colectivo; tu aprendizaje es la intimidad emocional.',
    'Tu esencia es sensible, intuitiva y compasiva. Brillas cuando conectas con lo invisible, el arte y la ayuda; tu aprendizaje es poner límites y anclarte.'
  ];
  var MOON = [
    'Emocionalmente directo/a e impulsivo/a: sientes rápido y necesitas actuar para procesar. Te calma el movimiento; cuida los enfados súbitos.',
    'Necesitas calma, rutina y placer sensorial para sentirte a salvo. Eres fiel y estable; cuesta soltar lo conocido.',
    'Procesas hablando y pensando; necesitas variedad. Tu ánimo cambia rápido; escribir te ordena.',
    'Emocionalidad profunda, memoria afectiva y necesidad de pertenencia. Cuidas mucho; aprende a no absorber lo ajeno.',
    'Necesitas sentirte querido/a y reconocido/a; das calor y lealtad. Cuida el orgullo herido.',
    'Te sientes seguro/a siendo útil y ordenado/a; tiendes a analizar lo que sientes. Cuida la autoexigencia.',
    'Necesitas armonía y compañía; evitas el conflicto. Aprende a expresar lo que sientes aunque incomode.',
    'Emociones intensas y reservadas; necesitas profundidad y lealtad. Evita el control y la desconfianza.',
    'Necesitas libertad, aire y sentido; el optimismo te regula. Cuida la huida ante la intimidad.',
    'Contienes las emociones y te regulas con responsabilidad. Aprende a pedir apoyo.',
    'Procesas desde la distancia y las ideas; necesitas espacio. Cultiva la vulnerabilidad.',
    'Muy receptivo/a, empático/a y soñador/a; absorbes los ambientes. Necesitas silencio y límites.'
  ];
  var ASC = [
    'Te perciben directo/a, enérgico/a y valiente; entras en escena con iniciativa.',
    'Proyectas calma, solidez y sensualidad; inspiras confianza, aunque pareces lento/a al cambiar.',
    'Pareces curioso/a, comunicativo/a y juvenil; tu primera impresión es ágil e ingeniosa.',
    'Transmites sensibilidad y cuidado; eres cauteloso/a al principio y protector/a después.',
    'Tienes presencia, calidez y carisma; se nota cuando entras.',
    'Pareces atento/a, discreto/a y eficiente; observas antes de actuar.',
    'Das una imagen amable, elegante y diplomática; buscas agradar y equilibrar.',
    'Magnetismo intenso y reservado; impones respeto y misterio.',
    'Aire abierto, optimista y aventurero; te muestras franco/a y entusiasta.',
    'Imagen seria, responsable y madura; transmites autoridad tranquila.',
    'Original, independiente y algo distante; destacas por tu estilo propio.',
    'Suave, soñador/a y receptivo/a; tu presencia es etérea y empática.'
  ];
  var MERC = ['piensa y habla rápido y directo; impaciente con los rodeos.', 'piensa despacio, práctico y firme; cuesta cambiarle de opinión.', 'mente ágil, curiosa y versátil.', 'pensamiento emocional e intuitivo; memoria afectiva.', 'habla con convicción y dramatismo creativo.', 'analítico, preciso y crítico.', 'pondera y negocia; busca equilibrio al hablar.', 'mente penetrante, casi detectivesca; calla más de lo que dice.', 'visión amplia; honesto/a hasta la franqueza.', 'pensamiento estructurado, estratégico y sobrio.', 'ideas originales y abstractas; mente inventiva.', 'pensamiento imaginativo e intuitivo; difuso para lo concreto.'];
  var VEN = ['ama con pasión y conquista; intensidad e impaciencia.', 'afecto sensual, leal y posesivo; disfruta del placer.', 'se enamora de la mente; necesita charla y variedad.', 'ama protegiendo y necesita seguridad emocional.', 'romántico/a y generoso/a; necesita admiración.', 'ama con actos de servicio; discreto/a y exigente.', 'busca armonía y belleza en pareja; muy relacional.', 'amor intenso, total y transformador; celos posibles.', 'ama la libertad y la aventura; sincero/a en el afecto.', 'afecto sobrio y comprometido; tarda en abrirse.', 'ama desde la amistad y la libertad; original.', 'romántico/a e idealista; amor compasivo y fusional.'];
  var MARS = ['acción directa y valiente; mucho impulso.', 'energía constante y terca; lenta pero imparable.', 'acción dispersa y verbal; multitarea.', 'actúa por emoción y protección; de forma indirecta.', 'acción orgullosa y generosa; liderazgo natural.', 'esfuerzo metódico y eficiente.', 'acción diplomática; cuesta confrontar y decidir.', 'energía intensa y estratégica; gran resistencia.', 'acción entusiasta y aventurera.', 'ambición disciplinada y resistente.', 'acción rebelde y colectiva.', 'energía fluctuante e intuitiva; evita confrontar.'];
  var NODE = [
    'Tu crecimiento está en la autonomía y la iniciativa propia, soltando la dependencia de agradar.', 'Tu crecimiento está en la estabilidad, el cuerpo y los valores propios, soltando el drama intenso.',
    'Tu crecimiento está en la curiosidad, la comunicación y el aprendizaje cotidiano, soltando las certezas rígidas.', 'Tu crecimiento está en el cuidado emocional y el hogar interior, soltando la necesidad de control.',
    'Tu crecimiento está en la expresión creativa y el corazón, soltando el anonimato del colectivo.', 'Tu crecimiento está en el servicio concreto y la rutina sana, soltando la evasión.',
    'Tu crecimiento está en la cooperación y los vínculos, soltando el individualismo extremo.', 'Tu crecimiento está en la profundidad y la transformación, soltando la comodidad material.',
    'Tu crecimiento está en la visión amplia y la fe, soltando la dispersión de los detalles.', 'Tu crecimiento está en la responsabilidad y la madurez, soltando la dependencia emocional.',
    'Tu crecimiento está en lo colectivo y lo original, soltando la necesidad de aplauso.', 'Tu crecimiento está en la fe, la compasión y lo espiritual, soltando la crítica perfeccionista.'
  ];
  var HOUSE = [
    '', 'Casa I · Identidad: tu cuerpo, tu imagen y tu manera de empezar las cosas.', 'Casa II · Recursos: dinero, talentos y qué valoras.', 'Casa III · Mente cercana: comunicación, hermanos, estudios y entorno.',
    'Casa IV · Raíces: hogar, familia, pasado y emociones profundas.', 'Casa V · Creatividad: amor, juego, hijos, placer y autoexpresión.', 'Casa VI · Rutina: trabajo diario, salud y servicio.',
    'Casa VII · Pareja: vínculos de uno a uno, socios y espejos.', 'Casa VIII · Transformación: intimidad, crisis, recursos compartidos y muerte simbólica.', 'Casa IX · Sentido: viajes, estudios superiores, fe y filosofía.',
    'Casa X · Vocación: carrera, reputación y legado.', 'Casa XI · Comunidad: amistades, proyectos colectivos y esperanzas.', 'Casa XII · Inconsciente: retiro, secretos, espiritualidad y lo oculto.'
  ];
  var DIGN = {
    'domicilio': 'está en domicilio: se expresa con naturalidad y fuerza, como en casa.',
    'exaltación': 'está exaltado: brilla y recibe honra; su mejor versión se manifiesta con facilidad.',
    'exilio': 'está en exilio: se expresa con incomodidad y pide esfuerzo consciente.',
    'caída': 'está en caída: su energía es más frágil y se aprende desde la humildad.'
  };
  var ASP = {
    'conjunción': ['actúan como una sola fuerza: se potencian y a veces se confunden.', 'F'],
    'sextil': ['cooperan: hay un talento que se activa con poco esfuerzo si das el primer paso.', 'S'],
    'cuadratura': ['tiran en direcciones distintas: tensión que exige integrar y te impulsa a crecer.', 'H'],
    'trígono': ['fluyen con naturalidad: un don que conviene usar a conciencia para no darlo por hecho.', 'S'],
    'oposición': ['son polos que buscan equilibrio: tiendes a proyectarlos en otros hasta integrarlos.', 'H'],
    'quincuncio': ['no se entienden del todo: piden ajustes continuos y flexibilidad.', 'M']
  };
  var PLANET_NAMES = { 'Sol': 'identidad', 'Luna': 'emoción', 'Mercurio': 'mente', 'Venus': 'afecto', 'Marte': 'acción', 'Júpiter': 'expansión', 'Saturno': 'estructura', 'Urano': 'cambio', 'Neptuno': 'intuición', 'Plutón': 'transformación', 'Nodo Norte': 'rumbo', 'Lilith': 'instinto', 'AC': 'imagen', 'MC': 'vocación' };
  var GEN = {
    'Júpiter': 'Es un tránsito de un año por signo: marca dónde buscas crecer y confiar.',
    'Saturno': 'Pasa unos 2,5 años por signo: marca dónde necesitas madurez y límites.',
    'Urano': 'Pasa unos 7 años por signo: es un clima generacional de cambio e independencia.',
    'Neptuno': 'Pasa unos 14 años por signo: es un clima generacional de ideales y disolución.',
    'Plutón': 'Pasa de 12 a 30 años por signo: marca la transformación profunda de tu generación.'
  };
  var PLUTO = [
    'Plutón en Aries: generación de impulso, ruptura y pioneros de lo nuevo.', 'Plutón en Tauro: transformación de los valores, el dinero y la tierra.', 'Plutón en Géminis: transformación de la comunicación y el pensamiento.',
    'Plutón en Cáncer: transformación de la familia, el hogar y las raíces.', 'Plutón en Leo: transformación del ego, la creatividad y el liderazgo.', 'Plutón en Virgo: transformación del trabajo, la salud y el servicio.',
    'Plutón en Libra: transformación de las relaciones y la justicia.', 'Plutón en Escorpio: transformación del poder, el sexo y lo oculto (generación 1984–1995).', 'Plutón en Sagitario: transformación de las creencias y la visión del mundo (1995–2008).',
    'Plutón en Capricornio: transformación de las instituciones y el poder establecido (2008–2024).', 'Plutón en Acuario: transformación de la tecnología, lo colectivo y la sociedad (2024–2043).', 'Plutón en Piscis: transformación de lo espiritual y lo invisible.'
  ];

  window.NATXT = { SUN: SUN, MOON: MOON, ASC: ASC, MERC: MERC, VEN: VEN, MARS: MARS, NODE: NODE, HOUSE: HOUSE, DIGN: DIGN, ASP: ASP, NAMES: PLANET_NAMES, GEN: GEN, PLUTO: PLUTO };
})();
