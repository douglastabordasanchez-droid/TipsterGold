// Contenido del blog. Cada artículo es formación pura: nada de pronósticos
// ni promesas de ganancia, solo método. Las fotos son de la galería real.
export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "quote"; text: string }
  | { t: "note"; title: string; text: string }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "img"; src: string; alt: string; caption: string };

export type Post = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  minutes: number;
  cover: string;
  coverPos: string;
  body: Block[];
};

export const posts: Post[] = [
  {
    slug: "gestion-de-banca",
    category: "Fundamentos",
    title: "Gestión de banca: la unidad es el pilar de todo",
    excerpt:
      "Antes de acertar hay que aprender a no arruinarse. La unidad es la herramienta que separa a quien aguanta una mala racha de quien desaparece en dos semanas.",
    minutes: 6,
    cover: "/gallery/gallery-15.png",
    coverPos: "center 35%",
    body: [
      {
        t: "p",
        text: "La mayoría de la gente que abandona no lo hace por fallar pronósticos, sino por gestionar mal el dinero. Se puede acertar el 60 % de las veces y aun así quedarse a cero si el tamaño de cada apuesta es un capricho. La gestión de banca es lo que convierte una buena lectura en un resultado sostenible.",
      },
      { t: "h", text: "Qué es la banca y qué es la unidad" },
      {
        t: "p",
        text: "La banca es el dinero que has separado para esta actividad y que puedes permitirte perder por completo sin que afecte a tu vida. No es el dinero del arriendo ni el de la comida. Es capital de riesgo.",
      },
      {
        t: "p",
        text: "La unidad es un porcentaje fijo de esa banca y es la medida con la que apuestas. Si tu banca es de 1.000.000 y decides que tu unidad es el 1 %, entonces una unidad son 10.000. A partir de ahí dejas de pensar en pesos y empiezas a pensar en unidades.",
      },
      {
        t: "note",
        title: "La regla que evita el desastre",
        text: "Nunca arriesgues más del 1 % al 3 % de tu banca en una sola entrada. Con el 2 % por apuesta harían falta cincuenta fallos seguidos para perderlo todo. Con el 20 %, bastan cinco.",
      },
      { t: "h", text: "Stake plano frente a stake variable" },
      {
        t: "p",
        text: "El stake plano consiste en apostar siempre la misma cantidad, una unidad, sin importar lo seguro que te parezca el partido. Es aburrido y es lo que mejor funciona cuando estás empezando: elimina el factor emocional y deja que el método hable.",
      },
      {
        t: "p",
        text: "El stake variable asigna entre media unidad y tres unidades según la confianza en la entrada. Solo tiene sentido cuando ya tienes cientos de registros que demuestran que tu escala de confianza acierta. Antes de eso, es una forma elegante de apostar por impulso.",
      },
      {
        t: "table",
        head: ["Banca", "Unidad al 1 %", "Unidad al 2 %", "Unidad al 3 %"],
        rows: [
          ["500.000", "5.000", "10.000", "15.000"],
          ["1.000.000", "10.000", "20.000", "30.000"],
          ["3.000.000", "30.000", "60.000", "90.000"],
        ],
      },
      { t: "h", text: "Recalcular, pero no cada día" },
      {
        t: "p",
        text: "La unidad se recalcula cuando la banca cambia de forma significativa, por ejemplo cada mes o cada vez que sube o baja un 25 %. Recalcularla después de cada apuesta te lleva a subir el riesgo justo cuando vas ganando y a reducirlo cuando más falta hace la calma.",
      },
      { t: "h", text: "El error que arruina a todos: perseguir la pérdida" },
      {
        t: "p",
        text: "Después de tres fallos aparece la tentación de recuperar con una apuesta grande. Ahí es donde se pierden las bancas. Doblar tras cada fallo, lo que se conoce como martingala, parece infalible sobre el papel y es matemáticamente ruinoso: basta una racha algo más larga de lo previsto, y esas rachas ocurren, para superar tu límite y quedarte fuera.",
      },
      {
        t: "quote",
        text: "Una mala racha con buena gestión es un mal mes. Una mala racha sin gestión es el final.",
      },
      { t: "h", text: "Qué llevarte de aquí" },
      {
        t: "ol",
        items: [
          "Separa una banca que puedas perder sin que te cambie la vida.",
          "Fija tu unidad entre el 1 % y el 3 % y escríbela donde la veas.",
          "Apuesta siempre esa unidad mientras no tengas datos que justifiquen otra cosa.",
          "No la subas para recuperar. Nunca.",
          "Revisa y recalcula una vez al mes, con la cabeza fría.",
        ],
      },
    ],
  },
  {
    slug: "leer-una-cuota",
    category: "Fundamentos",
    title: "Cómo leer una cuota y por qué el valor lo es todo",
    excerpt:
      "Una cuota no te dice quién va a ganar: te dice cuánto paga. Aprender a traducirla a probabilidad es lo que te permite saber si una apuesta merece la pena.",
    minutes: 7,
    cover: "/gallery/gallery-09.png",
    coverPos: "center 30%",
    body: [
      {
        t: "p",
        text: "Casi todo el mundo mira la cuota para calcular cuánto cobraría. Muy pocos la miran para calcular qué probabilidad le está asignando la casa al resultado. Ahí está la diferencia entre jugar y analizar.",
      },
      { t: "h", text: "De cuota a probabilidad" },
      {
        t: "p",
        text: "La conversión es una división simple: probabilidad implícita = 1 dividido entre la cuota. Una cuota de 2.00 equivale al 50 %. Una de 1.50, al 66,7 %. Una de 4.00, al 25 %.",
      },
      {
        t: "table",
        head: ["Cuota", "Probabilidad implícita", "Lectura"],
        rows: [
          ["1.25", "80 %", "La casa lo ve muy probable"],
          ["1.50", "66,7 %", "Favorito claro"],
          ["2.00", "50 %", "Moneda al aire"],
          ["3.00", "33,3 %", "Una de cada tres"],
          ["5.00", "20 %", "Una de cada cinco"],
        ],
      },
      {
        t: "note",
        title: "El margen de la casa",
        text: "Si sumas las probabilidades implícitas de las tres opciones de un partido, el total pasa del 100 %: suele estar entre el 103 % y el 108 %. Ese exceso es el margen de la casa. Por eso apostar al azar pierde dinero a largo plazo aunque aciertes la mitad.",
      },
      { t: "h", text: "Qué es el valor" },
      {
        t: "p",
        text: "Hay valor cuando tu estimación de probabilidad es mayor que la que ofrece la cuota. Si tú calculas que un equipo gana el 50 % de las veces y la casa lo paga a 2.30, es decir un 43,5 %, esa diferencia es tu ventaja. No garantiza que ganes ese partido; garantiza que, repetida muchas veces, esa decisión es rentable.",
      },
      {
        t: "p",
        text: "El cálculo del beneficio esperado ayuda a verlo: multiplica tu probabilidad por la cuota. Si el resultado supera 1, hay valor. En el ejemplo anterior, 0,50 por 2,30 da 1,15: por cada peso apostado esperas recuperar 1,15 a largo plazo.",
      },
      {
        t: "quote",
        text: "Apostar al favorito no es ganar. Ganar es pagar menos de lo que algo vale.",
      },
      { t: "h", text: "La trampa de las cuotas bajas" },
      {
        t: "p",
        text: "Una cuota de 1.20 parece dinero fácil y es donde más gente se arruina. A ese precio necesitas acertar más del 83 % de las veces solo para no perder. Un único fallo borra el beneficio de cinco aciertos. La sensación de seguridad no es lo mismo que la rentabilidad.",
      },
      { t: "h", text: "Cómo entrenar el ojo" },
      {
        t: "ul",
        items: [
          "Antes de mirar la cuota, escribe tu propia estimación de probabilidad.",
          "Después compárala con la probabilidad implícita del mercado.",
          "Apuesta solo cuando tu número sea claramente mayor, no por un pelo.",
          "Si tu estimación y la del mercado siempre coinciden, aún no tienes ventaja: sigue estudiando.",
        ],
      },
    ],
  },
  {
    slug: "checklist-antes-del-partido",
    category: "Método",
    title: "La checklist antes de un partido: qué mirar y en qué orden",
    excerpt:
      "Improvisar es apostar por impulso. Esta es la revisión sistemática que conviene hacer antes de considerar cualquier mercado.",
    minutes: 8,
    cover: "/gallery/gallery-12.png",
    coverPos: "center 32%",
    body: [
      {
        t: "p",
        text: "Un análisis serio no es ver dos resultados recientes en el móvil. Es un recorrido ordenado que siempre se hace igual, para que la conclusión dependa de los datos y no del ánimo del día.",
      },
      { t: "h", text: "1. Contexto de la competición" },
      {
        t: "p",
        text: "Qué se juega cada equipo. No es lo mismo la jornada 5 que una final, ni un equipo peleando el descenso que uno ya salvado a falta de tres fechas. La motivación cambia alineaciones, ritmo y planteamiento, y el mercado tarda en recogerla.",
      },
      { t: "h", text: "2. Calendario y descanso" },
      {
        t: "ul",
        items: [
          "Días de descanso desde el último partido de cada equipo.",
          "Viajes largos o cambios de altitud y de horario.",
          "Qué viene después: un rival importante en tres días suele significar rotaciones.",
        ],
      },
      { t: "h", text: "3. Bajas y alineaciones probables" },
      {
        t: "p",
        text: "No cuentes lesionados, mide su peso. Perder al goleador o al portero titular no equivale a perder al tercer central. Confirma las alineaciones cuando se publiquen: una noticia de última hora mueve el mercado en minutos.",
      },
      {
        t: "img",
        src: "/gallery/gallery-02.png",
        alt: "Anfield, Liverpool",
        caption: "Ver los partidos en directo enseña cosas que ninguna estadística recoge.",
      },
      { t: "h", text: "4. Estilo de juego, no solo resultados" },
      {
        t: "p",
        text: "Dos equipos con el mismo puntaje pueden jugar de forma opuesta. Fíjate en si presionan arriba, si tienen la pelota, cuántos centros lanzan, si son intensos por las bandas. El estilo predice mercados como córners, tarjetas o total de goles mucho mejor que la clasificación.",
      },
      { t: "h", text: "5. Local y visitante" },
      {
        t: "p",
        text: "El factor campo existe, pero varía muchísimo entre equipos y ligas. Míralo por separado: rendimiento en casa contra rendimiento fuera, no el promedio general que mezcla ambos y esconde la información.",
      },
      { t: "h", text: "6. El árbitro y las condiciones" },
      {
        t: "ul",
        items: [
          "Media de tarjetas del árbitro designado, clave en mercados disciplinarios.",
          "Estado del campo, lluvia o viento fuerte: reducen goles y precisión.",
          "Horario: el calor del mediodía baja la intensidad y el ritmo.",
        ],
      },
      { t: "h", text: "7. Movimiento del mercado" },
      {
        t: "p",
        text: "Compara la cuota de apertura con la actual. Un movimiento fuerte sin noticia pública suele indicar información que aún no es evidente. No lo sigas a ciegas, pero pregúntate qué sabe el mercado que tú no sabes.",
      },
      {
        t: "note",
        title: "La regla de oro",
        text: "Si al terminar la checklist no puedes explicar tu apuesta en dos frases claras, no hay apuesta. La duda es una respuesta válida y suele ser la más rentable.",
      },
    ],
  },
  {
    slug: "sesgos-que-te-hacen-perder",
    category: "Psicología",
    title: "Los cinco sesgos que te están haciendo perder dinero",
    excerpt:
      "El rival más duro no es la casa de apuestas, es tu propia cabeza. Estos son los atajos mentales que más caro se pagan y cómo desactivarlos.",
    minutes: 6,
    cover: "/gallery/gallery-06.png",
    coverPos: "center 28%",
    body: [
      {
        t: "p",
        text: "Se puede tener un buen método y aun así perder, porque en el momento de decidir se impone algo más rápido que el análisis. Reconocer estos patrones es la mitad del trabajo.",
      },
      { t: "h", text: "1. Perseguir la pérdida" },
      {
        t: "p",
        text: "Tras un mal día aparece la necesidad de recuperar hoy mismo. Se sube el importe, se baja el nivel de exigencia y se apuesta a partidos que ni se han mirado. Es, con diferencia, el que más bancas destruye.",
      },
      {
        t: "p",
        text: "Antídoto: un límite de pérdida diaria escrito antes de empezar. Si se alcanza, se cierra el día. Sin excepciones ni negociaciones contigo mismo.",
      },
      { t: "h", text: "2. El equipo del corazón" },
      {
        t: "p",
        text: "Es casi imposible estimar con frialdad la probabilidad de tu propio equipo. El afecto infla el número sin que te des cuenta.",
      },
      {
        t: "p",
        text: "Antídoto: no analizarlo. Y si lo haces, escribe la estimación antes de recordar de qué equipo se trata.",
      },
      { t: "h", text: "3. Dar demasiado peso a lo reciente" },
      {
        t: "p",
        text: "Tres victorias seguidas no convierten a un equipo mediocre en candidato, igual que dos derrotas no hunden a uno bueno. Las muestras pequeñas engañan y el mercado ya ha ajustado la cuota a esa racha.",
      },
      {
        t: "p",
        text: "Antídoto: mira ventanas de diez o quince partidos y compáralas con la temporada completa.",
      },
      { t: "h", text: "4. Confirmar lo que ya decidiste" },
      {
        t: "p",
        text: "Cuando una apuesta te gusta, empiezas a buscar datos que la respalden y a descartar los que la contradicen. El análisis deja de serlo y se convierte en una justificación.",
      },
      {
        t: "p",
        text: "Antídoto: obligarte a escribir dos argumentos en contra de tu propia apuesta. Si no encuentras ninguno, es que no has mirado lo suficiente.",
      },
      { t: "h", text: "5. Confundir suerte con acierto" },
      {
        t: "p",
        text: "Ganar una apuesta mal razonada refuerza un mal hábito. Perder una bien razonada no significa que te equivocaras. A corto plazo el resultado dice poco sobre la calidad de la decisión.",
      },
      {
        t: "quote",
        text: "Evalúa decisiones, no resultados. Los resultados se juzgan en cientos de apuestas, no en una tarde.",
      },
      {
        t: "note",
        title: "Señal de alarma",
        text: "Si apuestas para calmar la ansiedad, escondes lo que juegas o usas dinero que necesitas para otra cosa, el problema ya no es de método. Interrumpe la actividad y busca ayuda profesional.",
      },
    ],
  },
  {
    slug: "lleva-tu-registro",
    category: "Método",
    title: "Lleva tu registro: lo que no se mide, no mejora",
    excerpt:
      "Sin datos propios no sabes si ganas por método o por suerte. Así se monta un registro sencillo y cómo leer lo que te está diciendo.",
    minutes: 5,
    cover: "/gallery/gallery-05.png",
    coverPos: "center 25%",
    body: [
      {
        t: "p",
        text: "Pregúntale a alguien cómo le va y te dirá una sensación. Pregúntale a su hoja de cálculo y te dará un número. La diferencia entre ambos suele ser enorme, y casi siempre en la misma dirección.",
      },
      { t: "h", text: "Qué anotar en cada entrada" },
      {
        t: "ul",
        items: [
          "Fecha, competición y partido.",
          "Mercado exacto y selección.",
          "Cuota tomada y unidades arriesgadas.",
          "Resultado y unidades ganadas o perdidas.",
          "Un motivo en una línea: por qué la tomaste.",
        ],
      },
      {
        t: "p",
        text: "El motivo es el campo que casi nadie rellena y el que más enseña. Tres meses después es lo único que te permite saber si tu razonamiento funcionaba o si te estabas engañando.",
      },
      { t: "h", text: "Los números que importan" },
      {
        t: "table",
        head: ["Indicador", "Cómo se calcula", "Qué te dice"],
        rows: [
          ["Yield", "Beneficio ÷ total arriesgado", "Rentabilidad por peso arriesgado"],
          ["ROI", "Beneficio ÷ banca inicial", "Cuánto ha crecido tu capital"],
          ["Acierto", "Aciertos ÷ total de apuestas", "Poco útil sin la cuota media"],
          ["Cuota media", "Media de las cuotas jugadas", "Contextualiza el acierto"],
        ],
      },
      {
        t: "note",
        title: "Cuidado con el porcentaje de acierto",
        text: "Un 70 % de acierto a cuota 1.20 pierde dinero. Un 35 % a cuota 3.50 lo gana. El acierto por sí solo no significa nada si no lo lees junto a la cuota media.",
      },
      { t: "h", text: "Cuántas apuestas hacen falta para sacar conclusiones" },
      {
        t: "p",
        text: "Con veinte apuestas no sabes nada: eso es ruido. A partir de doscientas o trescientas registradas empiezan a aparecer tendencias reales. Antes de esa cifra, ni te vengas arriba con una buena racha ni cambies todo tu método por una mala.",
      },
      { t: "h", text: "Lee el registro por segmentos" },
      {
        t: "p",
        text: "El valor real aparece al filtrar. Separa por competición, por mercado y por rango de cuota. Es habitual descubrir que ganas de forma sólida en un mercado concreto y que todas tus pérdidas se concentran en otro que apuestas por costumbre. Ese hallazgo, por sí solo, ya paga el esfuerzo de llevar el registro.",
      },
    ],
  },
];
