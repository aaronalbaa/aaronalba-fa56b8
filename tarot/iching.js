/* I Ching: 64 hexagramas (resumen breve de cada uno) y mecánica de las tres monedas. */
(function () {
  'use strict';
  // Trigramas: líneas de abajo arriba (1 = yang, 0 = yin)
  var TRI = [
    { n: 'Cielo', c: 'Qián', e: '☰', l: [1, 1, 1] }, { n: 'Trueno', c: 'Zhèn', e: '☳', l: [1, 0, 0] },
    { n: 'Agua', c: 'Kǎn', e: '☵', l: [0, 1, 0] }, { n: 'Montaña', c: 'Gèn', e: '☶', l: [0, 0, 1] },
    { n: 'Tierra', c: 'Kūn', e: '☷', l: [0, 0, 0] }, { n: 'Viento', c: 'Xùn', e: '☴', l: [0, 1, 1] },
    { n: 'Fuego', c: 'Lí', e: '☲', l: [1, 0, 1] }, { n: 'Lago', c: 'Duì', e: '☱', l: [1, 1, 0] }
  ];
  // Tabla del Rey Wen: fila = trigrama inferior, columna = trigrama superior (orden TRI)
  var KW = [
    [1, 34, 5, 26, 11, 9, 14, 43], [25, 51, 3, 27, 24, 42, 21, 17], [6, 40, 29, 4, 7, 59, 64, 47], [33, 62, 39, 52, 15, 53, 56, 31],
    [12, 16, 8, 23, 2, 20, 35, 45], [44, 32, 48, 18, 46, 57, 50, 28], [13, 55, 63, 22, 36, 37, 30, 49], [10, 54, 60, 41, 19, 61, 38, 58]
  ];
  var H = [
    null,
    ['Qián', 'Lo Creativo', 'Fuerza pura y potencial: actúa con constancia y visión, sin forzar el momento.'],
    ['Kūn', 'Lo Receptivo', 'Receptividad y entrega: apoya, acompaña y deja que las cosas maduren.'],
    ['Zhūn', 'La Dificultad Inicial', 'Todo comienzo es confuso: avanza paso a paso y busca ayuda.'],
    ['Méng', 'La Necedad Juvenil', 'Es tiempo de aprender con humildad: pregunta con sinceridad y busca guía.'],
    ['Xū', 'La Espera', 'Aún no es el momento: espera con confianza y cuida tus fuerzas.'],
    ['Sòng', 'El Conflicto', 'Hay fricción: busca la solución justa antes que ganar la discusión.'],
    ['Shī', 'El Ejército', 'Organización y disciplina colectiva: un propósito claro y buen liderazgo.'],
    ['Bǐ', 'La Unión', 'Busca la cercanía sincera: la unión se construye con lealtad y apertura.'],
    ['Xiǎo Chù', 'La Pequeña Fuerza Domesticadora', 'Influencia suave: pequeños avances y paciencia, aún no es tiempo de grandes pasos.'],
    ['Lǚ', 'El Porte', 'Camina con cuidado y respeto: la conducta serena evita problemas.'],
    ['Tài', 'La Paz', 'Armonía y fluidez: aprovecha este período favorable para construir.'],
    ['Pǐ', 'El Estancamiento', 'Las energías no se encuentran: mantén tu integridad y espera a que gire la rueda.'],
    ['Tóng Rén', 'Comunidad con los Hombres', 'La unión basada en metas compartidas: coopera con transparencia.'],
    ['Dà Yǒu', 'La Gran Posesión', 'Abundancia y éxito: úsalos con generosidad y humildad.'],
    ['Qiān', 'La Modestia', 'La humildad abre caminos: equilibra lo que tienes sin presumir.'],
    ['Yù', 'El Entusiasmo', 'Impulso e ilusión compartida: canaliza la energía con orden.'],
    ['Suí', 'El Seguimiento', 'Adáptate y sigue lo que merece ser seguido; la flexibilidad atrae apoyo.'],
    ['Gǔ', 'El Trabajo sobre lo Echado a Perder', 'Hay que reparar lo heredado: asume la corrección con decisión.'],
    ['Lín', 'El Acercamiento', 'Algo se acerca con fuerza: aprovéchalo con atención y sin demora.'],
    ['Guān', 'La Contemplación', 'Observa antes de actuar: ver con claridad es el primer paso.'],
    ['Shì Kè', 'Morder a Través', 'Hay un obstáculo que resolver con firmeza y justicia.'],
    ['Bì', 'La Gracia', 'La belleza y la forma importan, pero no sustituyen lo esencial.'],
    ['Bō', 'La Desintegración', 'Algo se desmorona: mantén la calma y conserva lo esencial.'],
    ['Fù', 'El Retorno', 'La luz vuelve: un nuevo comienzo tras el punto más bajo; no lo precipites.'],
    ['Wú Wàng', 'La Inocencia', 'Actúa con naturalidad y sin cálculo: lo sincero guía mejor que la estrategia.'],
    ['Dà Chù', 'La Gran Fuerza Domesticadora', 'Acumula fuerza y sabiduría; contener ahora permite dar un gran paso luego.'],
    ['Yí', 'Las Comisuras de la Boca', 'Cuida lo que nutres: qué consumes, qué dices y qué alimentas en ti.'],
    ['Dà Guò', 'La Preponderancia de lo Grande', 'Una carga excesiva: actúa con decisión excepcional pero cuida los cimientos.'],
    ['Kǎn', 'Lo Abismal', 'Peligro repetido: avanza con sinceridad y no te dejes vencer por el miedo.'],
    ['Lí', 'Lo Adherente (el Fuego)', 'Claridad que depende de aquello a lo que te unes: elige bien tus apoyos.'],
    ['Xián', 'La Influencia', 'Atracción mutua y receptividad: la apertura sincera crea vínculo.'],
    ['Héng', 'La Duración', 'Constancia: lo duradero se sostiene con perseverancia y rumbo estable.'],
    ['Dùn', 'La Retirada', 'Un paso atrás estratégico: retirarse a tiempo no es rendirse.'],
    ['Dà Zhuàng', 'El Poder de lo Grande', 'Fuerza en auge: úsala con justicia y sin arrogancia.'],
    ['Jìn', 'El Progreso', 'Avance y reconocimiento: la claridad te hace avanzar con luz propia.'],
    ['Míng Yí', 'El Oscurecimiento de la Luz', 'Tiempos difíciles: protege tu luz interior y actúa con discreción.'],
    ['Jiā Rén', 'La Familia', 'El orden empieza en casa: roles claros, afecto y coherencia.'],
    ['Kuí', 'La Oposición', 'Hay divergencia: busca lo que une en lo pequeño sin forzar lo grande.'],
    ['Jiǎn', 'El Obstáculo', 'Un bloqueo: detente, reflexiona y busca ayuda en vez de forzar.'],
    ['Xiè', 'La Liberación', 'Se afloja la tensión: resuelve lo pendiente y sigue adelante sin rencor.'],
    ['Sǔn', 'La Disminución', 'Dar menos para ganar sentido: simplifica y entrega lo esencial.'],
    ['Yì', 'El Aumento', 'Período fértil: es buen momento para emprender y ayudar.'],
    ['Guài', 'La Resolución', 'Decisión firme y transparente: aclara lo que debe cortarse.'],
    ['Gòu', 'Venir al Encuentro', 'Algo inesperado aparece: evalúa con cuidado antes de comprometerte.'],
    ['Cuì', 'La Reunión', 'Reunirse en torno a algo valioso: prepara y cuida el vínculo.'],
    ['Shēng', 'El Empuje hacia Arriba', 'Ascenso gradual: esfuerzo constante y buenos apoyos.'],
    ['Kùn', 'La Opresión', 'Agotamiento y limitación: conserva la serenidad y la integridad.'],
    ['Jǐng', 'El Pozo', 'Una fuente que nutre a todos: cuida lo esencial y mantenlo limpio.'],
    ['Gé', 'La Revolución', 'Cambio profundo: actúa con claridad cuando el momento esté maduro.'],
    ['Dǐng', 'El Caldero', 'Transformación y nutrición: cultiva lo valioso y comparte el fruto.'],
    ['Zhèn', 'Lo Suscitativo (el Trueno)', 'Una sacudida despierta: mantén la calma, el susto pasa y te enseña.'],
    ['Gèn', 'El Aquietamiento (la Montaña)', 'Detente en el lugar correcto: calma la mente y detén la acción.'],
    ['Jiàn', 'El Desarrollo', 'Progreso gradual y firme: las relaciones y los logros maduran despacio.'],
    ['Guī Mèi', 'La Muchacha que se Casa', 'Cuidado con los compromisos precipitados: valora el contexto y el orden.'],
    ['Fēng', 'La Plenitud', 'Momento de apogeo: aprovecha la claridad antes de que cambie el ciclo.'],
    ['Lǚ', 'El Viajero', 'Etapa de tránsito: sé prudente, amable y adaptable.'],
    ['Xùn', 'Lo Suave (el Viento)', 'Influencia sutil y constante: penetra con suavidad y persistencia.'],
    ['Duì', 'Lo Sereno (el Lago)', 'Alegría compartida: el gozo auténtico se basa en la sinceridad.'],
    ['Huàn', 'La Disolución', 'Se disuelven rigideces: libera lo que separa y reúne con un propósito.'],
    ['Jié', 'La Limitación', 'Los límites ayudan: establece medidas sensatas y evita los extremos.'],
    ['Zhōng Fú', 'La Verdad Interior', 'Sinceridad profunda: la confianza interior transforma lo que te rodea.'],
    ['Xiǎo Guò', 'La Pequeña Preponderancia', 'Atiende lo pequeño y cotidiano: aún no es tiempo de grandes gestas.'],
    ['Jì Jì', 'Después de la Consumación', 'Todo está en su lugar: no te confíes, el equilibrio requiere cuidado.'],
    ['Wèi Jì', 'Antes de la Consumación', 'Aún falta poco: sé prudente en el tramo final y no te precipites.']
  ];

  function triIndex(lines3) {
    for (var i = 0; i < TRI.length; i++) {
      if (TRI[i].l[0] === lines3[0] && TRI[i].l[1] === lines3[1] && TRI[i].l[2] === lines3[2]) return i;
    }
    return 0;
  }
  // lines: 6 valores (6,7,8,9) de abajo arriba → número de hexagrama
  function number(bits) { return KW[triIndex(bits.slice(0, 3))][triIndex(bits.slice(3, 6))]; }

  function cast(rnd) {
    var lines = [];
    for (var i = 0; i < 6; i++) {
      var s = 0;
      for (var k = 0; k < 3; k++) s += rnd(2) === 0 ? 2 : 3; // cara = 3, cruz = 2
      lines.push(s); // 6 yin móvil, 7 yang, 8 yin, 9 yang móvil
    }
    return lines;
  }

  function resolve(lines) {
    var prim = lines.map(function (v) { return v === 7 || v === 9 ? 1 : 0; });
    var rel = lines.map(function (v) { return v === 6 ? 1 : v === 9 ? 0 : (v === 7 ? 1 : 0); });
    var moving = lines.map(function (v, i) { return (v === 6 || v === 9) ? i + 1 : 0; }).filter(Boolean);
    var a = number(prim), b = number(rel);
    return {
      lines: lines, bits: prim, moving: moving, num: a, rel: moving.length ? b : null,
      upper: TRI[triIndex(prim.slice(3, 6))], lower: TRI[triIndex(prim.slice(0, 3))]
    };
  }

  window.ICHING = { H: H, TRI: TRI, cast: cast, resolve: resolve, number: number };
})();
