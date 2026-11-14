/* Mazos y oráculos: Tarot (RWS / Marsella / Thoth), Baraja española, Lenormand, Runas, Ogham. */
(function () {
  'use strict';
  var BASE = TAROT.CARDS;

  /* ---------- Tarot con tres estilos de nombres ---------- */
  var STYLES = {
    rws: { name: 'Rider-Waite-Smith', desc: 'El tarot más extendido' },
    marsella: { name: 'Tarot de Marsella', desc: 'El clásico francés' },
    thoth: { name: 'Tarot de Thoth', desc: 'De Aleister Crowley' }
  };
  var MARSELLA = { 1: 'El Bateleur', 2: 'La Papisa', 5: 'El Papa', 6: 'El Enamorado', 13: 'La Muerte', 16: 'La Casa de Dios' };
  var THOTH = { 2: 'La Suma Sacerdotisa', 8: 'Lujuria', 10: 'Fortuna', 11: 'Ajuste', 12: 'El Hombre Colgado', 14: 'Arte', 20: 'El Eón', 21: 'El Universo' };

  function tarot(style) {
    return BASE.map(function (c) {
      var o = {};
      Object.keys(c).forEach(function (k) { o[k] = c[k]; });
      o.group = c.suit || 'mayor';
      if (c.arcana === 'mayor') {
        if (style === 'marsella' || style === 'thoth') {
          if (c.id === 8) o.num = 'XI';
          if (c.id === 11) o.num = 'VIII';
        }
        if (style === 'marsella' && MARSELLA[c.id]) o.name = MARSELLA[c.id];
        if (style === 'thoth' && THOTH[c.id]) o.name = THOTH[c.id];
      } else if (style === 'thoth') {
        o.name = c.name.replace(/^Rey de/, 'Caballero de').replace(/^Caballo de/, 'Príncipe de').replace(/^Sota de/, 'Princesa de')
          .replace(/ Bastos$/, ' Bastones').replace(/ Oros$/, ' Discos');
      }
      return o;
    });
  }

  /* ---------- Baraja española (40 cartas) ---------- */
  function espanola() {
    var suitOrder = ['oros', 'copas', 'espadas', 'bastos'];
    var suitIdx = { bastos: 0, copas: 1, espadas: 2, oros: 3 };
    var ranks = [[0, '1'], [1, '2'], [2, '3'], [3, '4'], [4, '5'], [5, '6'], [6, '7'], [10, '10'], [11, '11'], [13, '12']];
    var out = [];
    suitOrder.forEach(function (s) {
      ranks.forEach(function (r) {
        var src = BASE[22 + suitIdx[s] * 14 + r[0]];
        var o = {}; Object.keys(src).forEach(function (k) { o[k] = src[k]; });
        o.id = out.length; o.group = s; o.num = r[1];
        out.push(o);
      });
    });
    return out;
  }

  function simple(list, extra) {
    return list.map(function (x, i) {
      var c = { id: i, num: x.num !== undefined ? x.num : String(i + 1), name: x.n, emoji: x.e, group: 'all',
        kwUp: x.k, kwRev: x.kr || x.k, up: x.t, rev: x.tr || x.t, suit: null, arcana: 'otro', norev: !!x.norev };
      if (extra) Object.keys(extra).forEach(function (k) { c[k] = extra[k]; });
      return c;
    });
  }

  /* ---------- Lenormand (36) ---------- */
  var LEN = [
    ['El Jinete', '🏇', 'Noticias, visita, movimiento', 'Llega algo rápido: un mensaje, una visita o una novedad que pone las cosas en marcha.'],
    ['El Trébol', '🍀', 'Suerte breve, oportunidad', 'Una pequeña suerte o alivio pasajero; aprovecha el momento, dura poco.'],
    ['El Barco', '⛵', 'Viaje, distancia, comercio', 'Desplazamientos, cambio de aires o algo que viene de lejos; también deseo de explorar.'],
    ['La Casa', '🏠', 'Hogar, estabilidad, familia', 'El terreno de lo seguro y propio: hogar, base y cosas que se construyen despacio.'],
    ['El Árbol', '🌳', 'Salud, raíces, crecimiento lento', 'Crecimiento paciente y vitalidad; mira tus raíces y cuida tu bienestar a largo plazo.'],
    ['Las Nubes', '☁️', 'Confusión, dudas, claridad pendiente', 'Algo está nublado: espera a ver con claridad antes de decidir.'],
    ['La Serpiente', '🐍', 'Complicación, astucia, deseo', 'Un camino sinuoso o alguien con segundas intenciones; también pasión y sabiduría instintiva.'],
    ['El Ataúd', '⚰️', 'Final, cierre, pausa profunda', 'Algo termina o necesita descanso total; cerrar permite renacer.'],
    ['El Ramo', '💐', 'Regalo, alegría, gratitud', 'Un gesto agradable, una invitación o un momento de belleza compartida.'],
    ['La Guadaña', '🌾', 'Corte, decisión brusca, cosecha', 'Un corte súbito o una decisión rápida; se siega lo que estaba maduro.'],
    ['El Látigo', '💢', 'Disputa, repetición, tensión', 'Discusiones o patrones que se repiten; también disciplina y energía física.'],
    ['Los Pájaros', '🐦', 'Conversación, nervios, chismes', 'Charla, ansiedad ligera o varias voces a la vez; baja el ritmo mental.'],
    ['El Niño', '🧒', 'Inicio, inocencia, algo pequeño', 'Un comienzo tierno, una idea nueva o una actitud de aprendiz.'],
    ['El Zorro', '🦊', 'Astucia, trabajo, cautela', 'Estrategia y cuidado: desconfía de lo que no está claro y protege tus intereses.'],
    ['El Oso', '🐻', 'Fuerza, protección, autoridad', 'Una figura poderosa o protectora; recursos y también tendencia a controlar.'],
    ['Las Estrellas', '⭐', 'Esperanza, claridad, guía', 'Buen rumbo e inspiración; confía en tu orientación interior.'],
    ['La Cigüeña', '🦢', 'Cambio, mejora, llegada', 'Un cambio positivo en camino, una mudanza o algo nuevo que llega con calma.'],
    ['El Perro', '🐕', 'Lealtad, amistad, apoyo', 'Alguien fiel o la necesidad de confiar; compañía honesta.'],
    ['La Torre', '🗼', 'Institución, soledad, distancia', 'Estructuras formales, aislamiento o perspectiva desde lo alto.'],
    ['El Jardín', '🌷', 'Vida social, público, encuentros', 'Reuniones, eventos y visibilidad; tu entorno social tiene protagonismo.'],
    ['La Montaña', '⛰️', 'Obstáculo, bloqueo, reto', 'Algo grande se interpone; requiere constancia o buscar otro camino.'],
    ['Los Caminos', '🛤️', 'Elección, bifurcación', 'Varias opciones abiertas: decide con conciencia de lo que descartas.'],
    ['Los Ratones', '🐭', 'Desgaste, pérdida, estrés', 'Algo se va royendo poco a poco: preocupaciones o pequeñas pérdidas.'],
    ['El Corazón', '❤️', 'Amor, emoción, afecto', 'El terreno del sentir: cariño, pasión o heridas que piden cuidado.'],
    ['El Anillo', '💍', 'Compromiso, pacto, ciclo', 'Una promesa, contrato o relación que se consolida (o se repite).'],
    ['El Libro', '📖', 'Secreto, estudio, conocimiento', 'Algo por descubrir o aprender; hay información que aún no se revela.'],
    ['La Carta', '✉️', 'Mensaje, documento', 'Comunicación escrita, trámites o noticias formales.'],
    ['El Hombre', '🧔', 'Figura masculina, el consultante', 'Un hombre importante en la situación o el consultante si se identifica con él.'],
    ['La Mujer', '👩', 'Figura femenina, la consultante', 'Una mujer importante en la situación o la consultante si se identifica con ella.'],
    ['Los Lirios', '🌸', 'Paz, madurez, armonía', 'Serenidad, sabiduría tranquila y relaciones sin dramatismo.'],
    ['El Sol', '☀️', 'Éxito, vitalidad, claridad', 'Energía positiva, logro y calor humano; las cosas se iluminan.'],
    ['La Luna', '🌙', 'Reconocimiento, emoción, intuición', 'Sensibilidad, fama o necesidad de reconocimiento; mira tu mundo emocional.'],
    ['La Llave', '🗝️', 'Solución, acceso, certeza', 'La respuesta está al alcance: una puerta se abre con lo que ya sabes.'],
    ['Los Peces', '🐟', 'Dinero, abundancia, flujo', 'Recursos que fluyen; independencia y generosidad bien dirigidas.'],
    ['El Ancla', '⚓', 'Estabilidad, constancia, llegada', 'Seguridad y permanencia; también el riesgo de quedarse inmóvil.'],
    ['La Cruz', '✝️', 'Carga, destino, sentido', 'Una responsabilidad pesada o una prueba con sentido; el final de un ciclo kármico.']
  ].map(function (x) { return { n: x[0], e: x[1], k: x[2], t: x[3], norev: true }; });

  /* ---------- Runas (Elder Futhark, 24) ---------- */
  var RUNES = [
    ['Fehu', 'ᚠ', 'Riqueza, recursos, energía vital', 'Abundancia en movimiento: gana y comparte; los recursos fluyen.', 'Pérdida o estancamiento de recursos; avaricia o gastos sin sentido.'],
    ['Uruz', 'ᚢ', 'Fuerza, salud, voluntad', 'Fuerza bruta y vitalidad; es momento de actuar con determinación.', 'Debilidad o energía mal dirigida; cuida tu salud y tus límites.'],
    ['Thurisaz', 'ᚦ', 'Defensa, umbral, espina', 'Una fuerza que protege o pone a prueba; piensa antes de cruzar el umbral.', 'Vulnerabilidad o conflicto impulsivo; evita reaccionar sin pensar.'],
    ['Ansuz', 'ᚨ', 'Mensaje, palabra, inspiración', 'Comunicación clara, consejo o inspiración; escucha el mensaje.', 'Malentendidos o consejos engañosos; revisa lo que se dice.'],
    ['Raidho', 'ᚱ', 'Viaje, ritmo, camino', 'Un viaje físico o interior; encuentra tu ritmo y sigue el camino.', 'Retrasos o desorden en el camino; replantea el rumbo.'],
    ['Kenaz', 'ᚲ', 'Antorcha, creatividad, conocimiento', 'Luz y creatividad; algo se ilumina y puedes darle forma.', 'La llama se apaga; bloqueo creativo o conocimiento oculto.'],
    ['Gebo', 'ᚷ', 'Regalo, reciprocidad, unión', 'Intercambio equilibrado y generosidad; las relaciones se nutren.', null],
    ['Wunjo', 'ᚹ', 'Alegría, armonía, bienestar', 'Alegría y sensación de pertenencia; las cosas encajan.', 'Desarmonía o alegría que se apaga; revisa lo que te desgasta.'],
    ['Hagalaz', 'ᚺ', 'Granizo, disrupción, prueba', 'Una sacudida que limpia: lo inevitable abre espacio a lo nuevo.', null],
    ['Nauthiz', 'ᚾ', 'Necesidad, resistencia, fricción', 'Una carencia que enseña; la necesidad impulsa la paciencia y el ingenio.', null],
    ['Isa', 'ᛁ', 'Hielo, pausa, quietud', 'Detención y calma forzada; espera, no fuerces el movimiento.', null],
    ['Jera', 'ᛃ', 'Cosecha, ciclo, recompensa', 'Recoges lo sembrado; los ciclos maduran a su tiempo.', null],
    ['Eihwaz', 'ᛇ', 'Tejo, resistencia, eje', 'Resistencia profunda y conexión entre mundos; aguanta con raíces firmes.', null],
    ['Perthro', 'ᛈ', 'Misterio, azar, destino oculto', 'Algo oculto sale a la luz; confía en el flujo del azar.', 'Secretos que pesan o estancamiento; algo no se revela aún.'],
    ['Algiz', 'ᛉ', 'Protección, instinto, conexión', 'Protección y alerta; tu instinto te resguarda.', 'Vulnerabilidad o falta de cautela; refuerza tus límites.'],
    ['Sowilo', 'ᛊ', 'Sol, éxito, claridad', 'Éxito, energía y dirección clara; el camino se ilumina.', null],
    ['Tiwaz', 'ᛏ', 'Justicia, valor, honor', 'Actúa con honor y valentía, incluso si cuesta; busca lo justo.', 'Injusticia o falta de coraje; revisa tu integridad.'],
    ['Berkano', 'ᛒ', 'Nacimiento, crecimiento, cuidado', 'Algo nuevo nace; nutre y protege el comienzo.', 'Crecimiento bloqueado o descuido; atiende lo que necesita cuidado.'],
    ['Ehwaz', 'ᛖ', 'Caballo, cooperación, avance', 'Avance en equipo y confianza mutua; el cambio fluye.', 'Desconfianza o desajuste en una alianza; replantea el vínculo.'],
    ['Mannaz', 'ᛗ', 'Persona, comunidad, el yo', 'Reconócete dentro de tu comunidad; autoconocimiento y ayuda mutua.', 'Aislamiento o egoísmo; pide o brinda ayuda.'],
    ['Laguz', 'ᛚ', 'Agua, intuición, fluir', 'Intuición y emoción profunda; déjate llevar por la corriente.', 'Confusión emocional o miedo; evita ahogarte en dudas.'],
    ['Ingwaz', 'ᛜ', 'Semilla, gestación, descanso', 'Una etapa de gestación: algo madura en silencio antes de manifestarse.', null],
    ['Dagaz', 'ᛞ', 'Amanecer, transformación, despertar', 'Un amanecer: despertar y cambio de conciencia luminoso.', null],
    ['Othala', 'ᛟ', 'Herencia, hogar, raíces', 'Hogar, herencia y valores propios; lo que te sostiene.', 'Desarraigo o conflicto con lo heredado; revisa a qué perteneces.']
  ].map(function (x, i) {
    return { n: x[0], e: x[1], k: x[2], t: x[3], tr: x[4] || x[3], norev: x[4] === null, num: String(i + 1) };
  });

  /* ---------- Ogham (20 árboles celtas) ---------- */
  var OGHAM = [
    ['Beith · Abedul', 'ᚁ', 'Comienzos, renovación', 'Un nuevo comienzo limpio; deja atrás lo viejo.'],
    ['Luis · Serbal', 'ᚂ', 'Protección, intuición', 'Protección contra influencias dañinas; confía en tu percepción.'],
    ['Fearn · Aliso', 'ᚃ', 'Escudo, guía', 'Fortaleza y orientación: protege tus límites y elige con criterio.'],
    ['Sail · Sauce', 'ᚄ', 'Ciclos, emoción, luna', 'Fluir con los ciclos y las emociones; flexibilidad y sanación.'],
    ['Nion · Fresno', 'ᚅ', 'Conexión, equilibrio', 'Conexión entre mundos y causas; todo está entrelazado.'],
    ['Uath · Espino', 'ᚆ', 'Prueba, paciencia', 'Una prueba que requiere paciencia; hay protección tras el obstáculo.'],
    ['Dair · Roble', 'ᚇ', 'Fuerza, estabilidad', 'Fortaleza serena, firmeza y puerta hacia lo nuevo.'],
    ['Tinne · Acebo', 'ᚈ', 'Equilibrio, desafío', 'Valentía y equilibrio ante un desafío; lucha con honor.'],
    ['Coll · Avellano', 'ᚉ', 'Sabiduría, inspiración', 'Sabiduría que se obtiene con atención; busca la fuente de tu conocimiento.'],
    ['Quert · Manzano', 'ᚊ', 'Elección, belleza', 'Una elección importante guiada por el corazón; belleza y encanto.'],
    ['Muin · Vid', 'ᚋ', 'Verdad, celebración', 'Verdad que sale a la luz y celebración; también advierte de excesos.'],
    ['Gort · Hiedra', 'ᚌ', 'Persistencia, ascenso', 'Perseverancia y crecimiento en espiral; no te rindas.'],
    ['Ngetal · Caña', 'ᚍ', 'Acción directa, curación', 'Actúa con claridad y precisión; curación y acción justa.'],
    ['Straif · Endrino', 'ᚎ', 'Destino, fuerza mayor', 'Algo ineludible impone un cambio; acepta lo que no puedes controlar.'],
    ['Ruis · Saúco', 'ᚏ', 'Fin de ciclo, renacimiento', 'Un ciclo termina y se prepara el renacer; transformación natural.'],
    ['Ailm · Abeto', 'ᚐ', 'Perspectiva, resistencia', 'Visión amplia desde lo alto; resistencia y claridad de miras.'],
    ['Onn · Aulaga', 'ᚑ', 'Reunir, impulso', 'Reúne tus recursos y avanza con calidez; entusiasmo que ilumina.'],
    ['Ur · Brezo', 'ᚒ', 'Pasión, sanación', 'Pasión y sanación; renueva tu energía en lo sencillo.'],
    ['Edad · Álamo', 'ᚓ', 'Resistencia, valor', 'Resistencia ante la dificultad y escucha del viento; sobrevivir y avanzar.'],
    ['Idad · Tejo', 'ᚔ', 'Transformación, eternidad', 'Muerte y renacimiento simbólicos; sabiduría que atraviesa las etapas.']
  ].map(function (x) { return { n: x[0], e: x[1], k: x[2], t: x[3], norev: true }; });

  /* ---------- registro ---------- */
  var LIST = [
    { id: 'tarot', name: 'Tarot', emoji: '🃏', desc: '78 cartas, el gran clásico', physical: true, reversible: true,
      spreads: ['una', 'ppf', 'sit', 'amor', 'herr', 'celta'],
      groups: [['all', 'Todas'], ['mayor', '🌟 Mayores'], ['bastos', '🔥 Bastos'], ['copas', '🏆 Copas'], ['espadas', '⚔️ Espadas'], ['oros', '🪙 Oros']] },
    { id: 'espanola', name: 'Baraja española', emoji: '🂡', desc: '40 cartas de cartomancia', physical: true, reversible: true,
      spreads: ['una', 'ppf', 'sit', 'amor', 'herr'],
      groups: [['all', 'Todas'], ['oros', '🪙 Oros'], ['copas', '🏆 Copas'], ['espadas', '⚔️ Espadas'], ['bastos', '🔥 Bastos']] },
    { id: 'lenormand', name: 'Lenormand', emoji: '🌹', desc: '36 cartas directas y prácticas', physical: true, reversible: false,
      spreads: ['una', 'ppf', 'linea5', 'sit'], groups: null },
    { id: 'runas', name: 'Runas', emoji: 'ᚱ', desc: 'Futhark antiguo, 24 runas', physical: true, reversible: true,
      spreads: ['una', 'nornas', 'cruz5'], groups: null },
    { id: 'ogham', name: 'Ogham', emoji: '🌳', desc: '20 árboles del alfabeto celta', physical: true, reversible: false,
      spreads: ['una', 'ppf'], groups: null }
  ];

  var cache = {};
  function cardsFor(id, style) {
    var key = id + ':' + (id === 'tarot' ? style : '');
    if (cache[key]) return cache[key];
    var cards;
    if (id === 'tarot') cards = tarot(style || 'rws');
    else if (id === 'espanola') cards = espanola();
    else if (id === 'lenormand') cards = simple(LEN);
    else if (id === 'runas') cards = simple(RUNES, { glyph: true });
    else cards = simple(OGHAM, { glyph: true });
    cache[key] = cards;
    return cards;
  }

  window.DECKS = {
    STYLES: STYLES,
    list: LIST,
    get: function (id, style) {
      var d = LIST.filter(function (x) { return x.id === id; })[0] || LIST[0];
      var o = {}; Object.keys(d).forEach(function (k) { o[k] = d[k]; });
      o.cards = cardsFor(d.id, style);
      if (d.id === 'tarot') o.name = (STYLES[style] || STYLES.rws).name;
      return o;
    }
  };
})();
