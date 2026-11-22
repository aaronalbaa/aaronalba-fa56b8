/* Rituales guiados: prácticas simbólicas de introspección, intención y celebración. Ninguno busca dañar ni controlar a nadie. */
(function () {
  'use strict';
  var R = [], CATS = [['luna', '🌙', 'Luna'], ['limpieza', '🧹', 'Limpieza y protección'], ['alma', '💗', 'Amor propio y calma'], ['abundancia', '🌾', 'Abundancia y camino'], ['cierre', '🕊️', 'Soltar y cerrar'], ['rueda', '🌿', 'Rueda del año'], ['diario', '☀️', 'Cada día'], ['tarot', '🃏', 'Con tus cartas']];
  function r(id, cat, e, name, intent, when, mats, steps, close, reflect, mins) { R.push({ id: id, cat: cat, e: e, n: name, intent: intent, when: when, mats: mats, steps: steps.map(function (s) { return { t: s[0], x: s[1], s: s[2] || 0 }; }), close: close, reflect: reflect, mins: mins }); }
  var SAFE = 'Si usas velas o fuego, hazlo sobre una superficie estable, lejos de telas y nunca sin vigilarlo; apágalas con un apagavelas o con agua.';

  r('luna-nueva', 'luna', '🌑', 'Luna nueva: sembrar intenciones', 'Empezar un ciclo con claridad', 'Luna nueva (o los dos días siguientes)', ['Papel y bolígrafo', 'Una vela pequeña (opcional)'],
    [['Hazte un espacio', 'Silencia el móvil, baja la luz y siéntate cómodamente. Respira tres veces profundo, soltando el aire despacio.', 30],
    ['Mira el ciclo que termina', 'Anota en una línea qué cierras con esta luna: un hábito, una preocupación, una etapa.'],
    ['Escribe tres intenciones', 'Redáctalas en presente y en positivo («Cuido mi descanso», no «Dejo de dormir mal»). Que sean pequeñas y reales.'],
    ['Léelas en voz alta', 'Di cada intención despacio. Nota en qué parte del cuerpo resuena y cuál te emociona más.', 20],
    ['Sella el momento', 'Dobla el papel y guárdalo en un lugar visible o en tu diario. Agradece este comienzo con una mano en el pecho.', 15]],
    'Revisa tu papel en la próxima luna llena para ver qué ha crecido.', '¿Cuál de las tres intenciones te dio más energía al leerla?', 12);
  r('luna-creciente', 'luna', '🌓', 'Luna creciente: dar un paso', 'Pasar de la idea a la acción', 'Luna creciente', ['Papel', 'Un objeto que te represente impulso (una semilla, una piedra…)'],
    [['Centra la atención', 'Sostén el objeto en las manos y respira lento hasta notar su peso y su temperatura.', 25], ['Elige una acción', 'Decide un único paso concreto que puedas dar en las próximas 72 horas.'], ['Visualiza el primer minuto', 'Imagina con detalle cómo empiezas ese paso: dónde estás, qué haces, cómo te sientes.', 30], ['Compromiso', 'Escribe fecha y hora para tu paso y deja el objeto junto a ese papel como recordatorio.']],
    'La luna crece: úsala para avanzar sin esperar a sentirte «preparada/o».', '¿Qué te frena realmente: miedo, falta de tiempo o falta de claridad?', 8);
  r('luna-llena', 'luna', '🌕', 'Luna llena: gratitud y cosecha', 'Reconocer lo logrado y soltar lo que sobra', 'Luna llena', ['Papel', 'Un vaso de agua', 'Vela (opcional)'],
    [['Sal a la luz de la luna', 'Si puedes, mírala unos instantes desde la ventana o el balcón. Si está nublado, imagínala sobre ti.', 30], ['Cosecha', 'Anota tres cosas que han florecido desde la luna nueva, aunque sean pequeñas.'], ['Gratitud', 'Di «gracias por…» tres veces, una por cada logro, y bebe un sorbo de agua tras cada una.', 25], ['Suelta', 'Escribe algo que ya no necesitas llevar contigo. Léelo, rómpelo en trozos y tíralo con la intención de dejarlo ir.'], ['Cierra', 'Respira hondo tres veces y sonríe: has completado un ciclo.', 15]],
    SAFE, '¿Qué has aprendido sobre ti en este ciclo lunar?', 14);
  r('luna-menguante', 'luna', '🌗', 'Luna menguante: soltar', 'Aligerar lo que pesa', 'Luna menguante', ['Papel', 'Agua corriente'],
    [['Escanea tu cuerpo', 'Cierra los ojos y recorre el cuerpo de pies a cabeza. ¿Dónde guardas tensión?', 40], ['Nombra lo que pesa', 'Escribe una frase por cada peso: una culpa, una expectativa ajena, una preocupación repetida.'], ['Lava y suelta', 'Rompe el papel y deja correr agua sobre tus manos imaginando que se lleva el peso. Seca tus manos despacio.', 25], ['Un hueco nuevo', 'Pregúntate qué te gustaría que ocupara ese espacio liberado y anótalo.']],
    'Soltar no es olvidar: es dejar de cargar.', '¿Qué parte de ese peso es tuya y qué parte es de otras personas?', 10);
  r('eclipse', 'luna', '🌘', 'Noche de eclipse: pausa y observación', 'Detenerte a mirar lo que cambia', 'Días de eclipse (consulta en Cielo → Local)', ['Cuaderno', 'Una infusión'],
    [['Observa sin mirar al Sol', 'Nunca mires un eclipse solar sin gafas homologadas. Si es lunar, puedes mirarlo con tranquilidad.'], ['Apaga el ruido', 'Cinco minutos sin pantallas: solo respiración y sonidos del entorno.', 40], ['Pregunta honesta', 'Escribe: «¿Qué está terminando en mi vida aunque me dé miedo admitirlo?».'], ['Un pequeño gesto', 'Elige algo concreto que harás esta semana para acompañar ese cambio.']],
    'Los eclipses son fenómenos astronómicos; su simbolismo es una invitación a la pausa.', '¿Qué cambio llevas tiempo viendo venir?', 12);

  r('limpieza-espacio', 'limpieza', '🌬️', 'Limpieza de un espacio', 'Renovar la atmósfera de tu casa', 'Cuando lo sientas pesado, o al mudarte', ['Ventana abierta', 'Una campana, cuenco o palmas', 'Incienso o hierbas secas (opcional, con ventilación)'],
    [['Ordena primero', 'Recoge lo que sobra y tira lo roto. Un espacio limpio ya cambia la sensación.'], ['Abre las ventanas', 'Deja entrar aire y luz durante unos minutos.', 40], ['Recorre cada estancia', 'Camina en sentido horario haciendo sonar la campana o dando palmadas suaves en los rincones.'], ['Palabras de cuidado', 'Di en voz baja: «Este espacio es de calma, descanso y respeto».'], ['Cierra con luz', 'Enciende una luz cálida y agradece al hogar que te cobije.']],
    'Con humo, hazlo siempre ventilado y apaga bien las brasas.', '¿Qué rincón de tu casa te pesaba más y por qué?', 15);
  r('bano', 'limpieza', '🛁', 'Baño o ducha de renovación', 'Despejar la mente tras un día denso', 'Por la noche', ['Agua templada', 'Sal marina o lo que prefieras', 'Música suave'],
    [['Entra con intención', 'Antes de meterte en el agua, dile a tu cuerpo: «Gracias por sostenerme hoy».'], ['Siente el agua', 'Deja que el agua cubra tus hombros y presta atención solo a la temperatura y al sonido.', 60], ['Suelta el día', 'Con cada exhalación, imagina que el día se disuelve en el agua.', 40], ['Sal despacio', 'Al secarte, nota tu piel y dedica una frase amable a tu cuerpo.']],
    'Si prefieres ducha, el gesto es el mismo: agua, atención y gratitud.', '¿Qué dejaste en el agua esta noche?', 15);
  r('escudo-luz', 'limpieza', '🛡️', 'Escudo de luz (visualización)', 'Sentir seguridad en entornos intensos', 'Antes de una reunión, viaje o encuentro difícil', ['Nada, solo tu atención'],
    [['Pies en el suelo', 'Siente el contacto con el suelo y reparte tu peso. Respira por la nariz.', 20], ['Imagina una luz', 'Visualiza una luz cálida naciendo en tu pecho y expandiéndose hasta rodearte como una esfera.', 30], ['Define su regla', 'Decide mentalmente: «Entra lo que me suma, se queda fuera lo que no».'], ['Ancla el gesto', 'Elige un gesto discreto (apoyar la mano en el esternón) para recordar la sensación cuando la necesites.']],
    'Es una técnica de visualización: su poder es calmar tu sistema nervioso.', '¿Qué situación pondrías hoy dentro de tu escudo?', 6);
  r('amuleto', 'limpieza', '🧿', 'Preparar un amuleto personal', 'Crear un objeto que te recuerde tu fuerza', 'Cuando quieras', ['Un objeto pequeño (piedra, medalla, cordón)', 'Papel'],
    [['Elige el símbolo', 'Escoge un objeto que te guste tocar. Pregúntate qué cualidad quieres que te recuerde (valor, calma, ternura).'], ['Límpialo', 'Pásalo bajo agua corriente (si aguanta) o déjalo un rato al sol suave o a la luna.', 20], ['Cárgalo con intención', 'Sostenlo entre las manos y repite durante un minuto una frase breve que resuma esa cualidad.', 60], ['Guárdalo', 'Llévalo contigo o ponlo donde lo veas. Cuando lo toques, respira y recuerda tu frase.']],
    'Un amuleto es un recordatorio tangible, no un escudo mágico.', '¿Qué cualidad te cuesta más recordar en los momentos difíciles?', 6);

  r('amor-propio', 'alma', '🪞', 'Ritual del espejo amable', 'Mirarte con respeto', 'Cuando tu voz interior sea dura', ['Un espejo', 'Una vela cálida o luz suave'],
    [['Siéntate frente al espejo', 'Mírate a los ojos unos segundos sin juzgar. Si cuesta, es normal.', 30], ['Di tres verdades amables', 'Por ejemplo: «Hago lo que puedo», «Merezco descanso», «Sigo aprendiendo». Pronúncialas despacio.'], ['Reconoce algo difícil', 'Nombra una cosa que te duele y responde como lo harías con una buena amiga.'], ['Gesto de cuidado', 'Pon una mano en el corazón y otra en el abdomen y respira cinco veces.', 30]],
    SAFE, '¿Qué le dirías hoy a tu yo de hace cinco años?', 8);
  r('calma', 'alma', '🌊', 'Calma en cinco sentidos', 'Bajar la ansiedad en el momento', 'Cuando te sientas desbordada/o', ['Nada'],
    [['5 cosas que ves', 'Nómbralas en voz baja mirando alrededor.', 20], ['4 que puedes tocar', 'Siente la textura de cada una.', 20], ['3 que oyes', 'Distingue sonidos lejanos y cercanos.', 15], ['2 que hueles', 'Si no hay olores, recuerda uno que te guste.', 10], ['1 que saboreas', 'Respira y traga despacio. Dite: «Estoy aquí, estoy a salvo ahora».', 10]],
    'Si la ansiedad es frecuente o intensa, consulta a un profesional de la salud.', '¿Qué cambió en tu cuerpo al terminar?', 3);
  r('autocuidado', 'alma', '🫖', 'Ritual de la infusión consciente', 'Parar con presencia', 'Cualquier tarde', ['Una infusión que te guste', 'Una taza bonita'],
    [['Prepárala despacio', 'Escucha el agua, mira el vapor, huele las hierbas.', 40], ['Primer sorbo', 'Siente la temperatura y el sabor antes de pensar en nada más.', 30], ['Una pregunta', 'Mientras bebes, pregúntate: «¿Qué necesito ahora mismo?». No contestes: escucha.', 60], ['Anota la respuesta', 'Escribe lo que haya aparecido, sea una palabra o una frase.']],
    'Si tomas medicación, comprueba con tu médico las hierbas que bebes.', '¿Qué necesitabas y estabas ignorando?', 10);
  r('sueno', 'alma', '😴', 'Ritual del descanso', 'Preparar un buen sueño', 'Justo antes de dormir', ['Libreta', 'Luz tenue'],
    [['Descarga la mente', 'Anota todo lo pendiente de mañana para que no tengas que recordarlo.'], ['Tres gratitudes', 'Escribe tres cosas, aunque sean mínimas, que salieron bien hoy.'], ['Respiración 4-6', 'Inhala contando cuatro, exhala contando seis, durante dos minutos.', 120], ['Cierra el día', 'Di: «Lo que no pude hacer hoy, puede esperar. Descanso».']],
    'Evita pantallas los últimos 30 minutos si puedes.', '¿Qué te quitaba hoy el sueño sin que lo supieras?', 7);

  r('abundancia', 'abundancia', '🌾', 'Tarro de la abundancia', 'Reconocer lo que ya tienes', 'Luna creciente o el primer día del mes', ['Un tarro', 'Papelitos', 'Un bolígrafo'],
    [['Prepara el tarro', 'Límpialo y colócalo donde lo veas. Será tu archivo de buenas noticias.'], ['Primer papel', 'Escribe algo bueno que te haya pasado esta semana (dinero, ayuda, un detalle, una sonrisa).'], ['Rutina', 'Añade un papel al día o a la semana. No hace falta que sean grandes cosas.'], ['Apertura', 'Al terminar el mes o el año, vacía el tarro y relee todo con calma.']],
    'La abundancia empieza por la atención a lo que sí hay.', '¿Qué cosa buena has dado por sentada últimamente?', 6);
  r('encrucijada', 'abundancia', '🧭', 'Ritual de la encrucijada', 'Tomar una decisión difícil', 'Cuando dudes entre dos caminos', ['Dos papeles', 'Una moneda (opcional)'],
    [['Nombra los caminos', 'Escribe cada opción en un papel, con sus pros y miedos.'], ['Vive cada camino', 'Durante un minuto, imagina que has elegido el primero: ¿qué sientes en el cuerpo? Repite con el segundo.', 60], ['La moneda como espejo', 'Asigna cara y cruz, lánzala y mira tu primera reacción emocional al resultado, no el resultado.'], ['Elige con datos y corazón', 'Escribe la decisión y el primer paso concreto.']],
    'La decisión es tuya; el ritual solo te ayuda a escucharte.', '¿Qué miedo estaba detrás de tu duda?', 10);
  r('estudio', 'abundancia', '📚', 'Ritual de estudio profundo', 'Concentrarte antes de aprender', 'Antes de estudiar', ['Agua', 'Tu material', 'Un temporizador'],
    [['Despeja el escritorio', 'Deja solo lo necesario. Un entorno ordenado enfoca.'], ['Declara el objetivo', 'Escribe qué quieres comprender hoy, en una frase.'], ['Respira y enfoca', 'Tres respiraciones largas y mirada al frente.', 20], ['Bloque de 25 minutos', 'Trabaja sin interrupciones y descansa cinco minutos después.']],
    '', '¿Qué entendiste hoy que ayer no?', 30);
  r('hogar-nuevo', 'abundancia', '🏡', 'Bienvenida a un nuevo comienzo', 'Estrenar casa, trabajo o etapa', 'El primer día', ['Una vela o luz', 'Pan y sal (tradición simbólica)'],
    [['Entra con calma', 'Pasa por el umbral despacio y observa el espacio.'], ['Comparte algo simple', 'Come un trozo de pan con una pizca de sal como símbolo de hospitalidad y sustento.'], ['Di tu propósito', 'Pronuncia qué quieres que viva en este lugar o etapa.'], ['Agradece', 'Una frase de gratitud a quienes te ayudaron a llegar aquí.']],
    SAFE, '¿Qué quieres que sea distinto en esta nueva etapa?', 8);

  r('despedida', 'cierre', '✉️', 'Carta de despedida', 'Cerrar una relación o etapa', 'Menguante o cuando estés lista/o', ['Papel', 'Un lugar seguro para romperlo o guardarlo'],
    [['Escribe sin filtro', 'Cuéntale lo que sientes a esa persona o etapa. Nadie lo leerá.', 120], ['Agradece lo que fue', 'Añade lo bueno que te dejó, aunque haya sido dolor y aprendizaje.'], ['Decide el final', 'Puedes romper la carta, quemarla con seguridad en un recipiente o guardarla. Elige con calma.'], ['Respira', 'Dite: «Me llevo lo aprendido y dejo lo demás».', 25]],
    SAFE + ' Si el duelo te sobrepasa, busca apoyo profesional.', '¿Qué parte de ti ya no necesita seguir en ese vínculo?', 15);
  r('duelo', 'cierre', '🕯️', 'Homenaje a quien se fue', 'Honrar un recuerdo con cariño', 'Aniversarios o cuando lo necesites', ['Una foto', 'Una luz o vela', 'Una flor'],
    [['Crea un rincón', 'Coloca la foto, la luz y la flor en un lugar tranquilo.'], ['Cuenta un recuerdo', 'Dilo en voz alta como si estuviera presente.'], ['Di lo que no dijiste', 'Si hay algo pendiente, exprésalo con tus palabras.', 40], ['Cierra con gratitud', 'Agradece lo compartido y apaga la luz con cuidado.']],
    SAFE + ' El duelo no tiene prisa; si pesa demasiado, acompáñate de alguien.', '¿Qué recuerdo te hace sonreír incluso con tristeza?', 12);
  r('perdon', 'cierre', '🤝', 'Perdón que libera', 'Soltar rencor sin justificar el daño', 'Cuando estés preparada/o', ['Papel'],
    [['Reconoce el daño', 'Escribe qué pasó y cómo te afectó. Perdonar no es negar el daño.'], ['Separa persona y acto', 'Anota qué parte necesitas soltar para sentirte en paz, incluso si no hay reconciliación.'], ['Frase de liberación', 'Di: «Elijo soltar esta carga por mi bienestar».', 20], ['Cuida tus límites', 'Define qué límite mantendrás a partir de ahora.']],
    '', '¿Qué ganarías al dejar de cargar con esto?', 12);

  r('ostara', 'rueda', '🌱', 'Equinoccio de primavera (Ostara)', 'Celebrar el renacer y el equilibrio', '≈ 20-21 de marzo', ['Semillas o una planta', 'Un huevo cocido o flores (tradición)'],
    [['Observa el equilibrio', 'Día y noche miden lo mismo: reconoce qué quieres equilibrar en tu vida.'], ['Siembra', 'Planta una semilla mientras nombras una intención para los próximos meses.'], ['Gratitud', 'Agradece lo que sobrevivió al invierno.'], ['Comparte', 'Prepara una comida sencilla con alguien querido.']],
    '', '¿Qué estás listo/a para empezar a cultivar?', 15);
  r('beltane', 'rueda', '🔥', 'Beltane: fuego de la vida', 'Celebrar la vitalidad y el placer', '≈ 1 de mayo', ['Flores', 'Vela o fogata segura'],
    [['Sal a la naturaleza', 'Camina entre flores o árboles, observando la vida que brota.'], ['Un ramo de intención', 'Reúne flores y asigna a cada una un deseo de vitalidad.'], ['Pasa a la acción', 'Haz algo que te dé placer sin culpa: bailar, cantar, cocinar.'], ['Agradece', 'Cierra con gratitud al ciclo de la vida.']],
    SAFE, '¿Qué te hace sentir viva/o de verdad?', 20);
  r('solsticio-verano', 'rueda', '☀️', 'Solsticio de verano (Litha)', 'Celebrar la plenitud de la luz', '≈ 21 de junio', ['Velas o fuego seguro', 'Hierbas de temporada'],
    [['Recibe la luz', 'Dedica unos minutos a tomar el sol suavemente o a mirar el atardecer.', 30], ['Balance de media año', 'Anota qué ha florecido y qué te gustaría ajustar.'], ['Escribe tu luz', 'Una frase sobre lo que aportas a los demás.'], ['Brinda', 'Con agua o tu bebida favorita, brinda por la luz propia.']],
    SAFE, '¿Qué parte de tu luz estás escondiendo?', 18);
  r('lughnasadh', 'rueda', '🌾', 'Lughnasadh: primera cosecha', 'Agradecer el esfuerzo', '≈ 1 de agosto', ['Pan o fruta', 'Papel'],
    [['Recuenta tu esfuerzo', 'Anota qué has trabajado este año y qué frutos ves.'], ['Comparte el pan', 'Parte un pan o fruta y compártelo agradeciendo.'], ['Reconoce lo que no fructificó', 'Y qué aprendiste de ello.'], ['Una semilla para guardar', 'Elige qué aprendizaje conservarás para sembrar el año próximo.']],
    '', '¿Qué merece que te felicites hoy?', 15);
  r('mabon', 'rueda', '🍂', 'Equinoccio de otoño (Mabon)', 'Dar gracias y preparar el recogimiento', '≈ 22-23 de septiembre', ['Frutos de temporada', 'Vela (opcional)'],
    [['Equilibrio otra vez', 'Día y noche vuelven a igualarse: revisa tu balance entre dar y recibir.'], ['Mesa de gratitud', 'Coloca frutos de temporada y nombra algo por lo que das las gracias con cada uno.'], ['Prepárate para el recogimiento', 'Decide qué rutinas de cuidado quieres para los meses oscuros.'], ['Brinda', 'Con una bebida cálida, por lo cosechado.']],
    SAFE, '¿Qué necesitas guardar para pasar el invierno bien?', 18);
  r('samhain', 'rueda', '🎃', 'Samhain: noche de los recuerdos', 'Honrar a quienes se fueron y mirar tu sombra', '≈ 31 de octubre', ['Fotos o nombres', 'Vela', 'Papel'],
    [['Enciende la luz', 'Una vela por quienes ya no están. Di sus nombres.', 20], ['Cuenta historias', 'Recuerda una anécdota de cada persona en voz alta.'], ['Mira tu sombra', 'Escribe una cualidad tuya que sueles esconder y ponla frente a la vela.'], ['Cierra el ciclo', 'Agradece y apaga la luz con cuidado.']],
    SAFE + ' Samhain es una fiesta de memoria, no un llamado a invocar a nadie.', '¿Qué parte de tu sombra pide ser escuchada?', 20);
  r('yule', 'rueda', '❄️', 'Solsticio de invierno (Yule)', 'Celebrar el regreso de la luz', '≈ 21 de diciembre', ['Velas o luces cálidas', 'Ramas de pino o hojas'],
    [['Noche más larga', 'Apaga luces y siéntate unos minutos en la penumbra.', 60], ['Enciende una luz', 'Con una vela, di: «La luz vuelve».'], ['Una promesa pequeña', 'Elige algo sencillo que cultivarás en la parte luminosa del año.'], ['Comparte calor', 'Tiempo con alguien querido o una carta de afecto.']],
    SAFE, '¿Qué esperanza quieres mantener encendida?', 15);
  r('año-nuevo', 'rueda', '🎆', 'Cierre y apertura del año', 'Revisar y empezar con claridad', '31 de diciembre – 1 de enero', ['Papel', 'Bolígrafo'],
    [['Balance del año', 'Anota tres logros, tres lecciones y tres cosas que sueltas.'], ['Carta al próximo año', 'Escribe qué quieres cultivar, en presente y en positivo.'], ['Una palabra guía', 'Elige una palabra que te acompañe todo el año.'], ['Guarda la carta', 'Ábrela dentro de un año.']],
    '', '¿Qué palabra guía elegiste y por qué?', 25);
  r('cumple', 'rueda', '🎂', 'Retorno solar: tu cumpleaños', 'Honrar el comienzo de tu año personal', 'Tu cumpleaños', ['Papel', 'Una vela por cada década (opcional)'],
    [['Mira atrás', 'Repasa tu año: lugares, personas, decisiones.'], ['Agradece a tu yo del año pasado', 'Escríbele una nota de reconocimiento.'], ['Tres deseos para tu nuevo año', 'Escríbelos con detalle y fecha.'], ['Revisa tu retorno solar', 'Consulta Cielo → Natal → Retorno solar para inspirarte.']],
    SAFE, '¿Qué versión de ti quieres explorar este año?', 20);

  r('amanecer', 'diario', '🌅', 'Saludo al día', 'Empezar con presencia', 'Por la mañana', ['Una ventana'],
    [['Respira antes de mirar el móvil', 'Tres respiraciones profundas al despertar.', 15], ['Siente el cuerpo', 'Estira brazos y espalda. Nota qué te pide el cuerpo hoy.'], ['Elige una intención', 'Di: «Hoy quiero…» y completa con una palabra.'], ['Mira la luz', 'Unos segundos mirando al cielo o a la ventana, agradeciendo.']],
    '', '¿Cuál fue tu intención de hoy?', 4);
  r('atardecer', 'diario', '🌇', 'Cierre del día', 'Soltar la jornada', 'Al final de la tarde', ['Cuaderno'],
    [['Para y respira', 'Apoya la espalda y suelta los hombros.', 20], ['Tres momentos', 'Anota tres momentos del día: uno agradable, uno difícil, uno neutro.'], ['Una lección', 'Escribe una frase con lo que te llevas.'], ['Cierra', 'Di «Día cerrado» y cambia de actividad.']],
    '', '¿Qué lección te llevas del día?', 6);
  r('micro', 'diario', '⚡', 'Micro-ritual de un minuto', 'Reiniciar tu atención', 'Entre tareas', ['Nada'],
    [['Para', 'Detén lo que haces.', 5], ['Tres respiraciones', 'Largas, por la nariz.', 20], ['Una pregunta', '«¿Qué es lo importante ahora?»', 10], ['Sigue', 'Retoma con esa respuesta.']],
    '', '¿Qué era lo importante ahora?', 1);

  r('preparar-baraja', 'tarot', '🃏', 'Preparar tu baraja', 'Conectar con tus cartas antes de leer', 'Antes de cada lectura importante', ['Tu baraja', 'Un paño o superficie limpia'],
    [['Crea el espacio', 'Despeja la mesa, apaga notificaciones y coloca el paño.'], ['Toca las cartas', 'Sostén el mazo con ambas manos unos segundos y respira.', 20], ['Baraja con una pregunta', 'Formula una pregunta clara y abierta («¿Qué necesito comprender sobre…?»).'], ['Corta y coloca', 'Corta con la mano izquierda (tradición) y reparte la tirada elegida.']],
    'Cuando termines, agradece y guarda la baraja en un lugar cuidado.', '¿Con qué actitud te acercaste a las cartas hoy?', 5);
  r('limpiar-baraja', 'tarot', '✨', 'Limpiar tu baraja', 'Empezar de cero con tu mazo', 'Al estrenarla o tras una lectura intensa', ['Tu baraja', 'Sonido o humo suave (opcional)'],
    [['Hojea las cartas', 'Pásalas una a una, mirando cada imagen.'], ['Ordénalas', 'Del Loco al Mundo y luego los palos: es un ritual de familiaridad.'], ['Sonido o aire', 'Haz sonar un cuenco o abanica suavemente sobre el mazo.'], ['Dile algo bueno', 'Una frase de cariño al mazo cierra el ritual.']],
    '', '¿Qué carta te llama más hoy?', 8);
  window.RITUALS = { list: R, cats: CATS, safe: SAFE };
})();
