import { useState, useEffect, useRef, type FormEvent, type CSSProperties } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ─── Paleta: negro & dorado (+ champán, bronce, platino, marfil) ─────────────
const C = {
  black: "#080808",
  panel: "#0f0f0f",
  panel2: "#15120c",
  gold: "#d4af37",
  goldBright: "#f6d66b",
  goldDeep: "#9a7b1f",
  champagne: "#ead9a6",
  bronze: "#b87333",
  platinum: "#c9cdd4",
  ivory: "#f3eee3",
  muted: "#a29c90",
  dim: "#6b665d",
  win: "#3dd68c",
  telegram: "#229ed9",
} as const;

const GOLD_GRAD = "linear-gradient(135deg, #9a7b1f 0%, #f6d66b 45%, #d4af37 100%)";

// Máscara de los retratos que "salen" de su tarjeta: difumina los laterales
// y la base para que el recorte se funda con el fondo sin bordes rectos.
const POP_MASK =
  "linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%), " +
  "linear-gradient(to bottom, #000 0%, #000 86%, transparent 100%)";

// ─── Utils ──────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Animation variants ───────────────────────────────────────────────────────
const easeOut = [0.0, 0.0, 0.2, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
};
const stagger = { visible: {} };

// ─── Animated section wrapper ──────────────────────────────────────────────────
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Self-contained count-up hook (no external dependency) ────────────────────
function useCountUp(end: number, active: boolean, duration = 2.5) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let start: number | null = null;
    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, end, duration]);
  return value;
}

// ─── Animated stat counter ─────────────────────────────────────────────────────
function AnimatedStat({
  end,
  suffix = "",
  prefix = "",
  label,
  decimals = 0,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const value = useCountUp(end, inView);
  const display =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");
  return (
    <motion.div ref={ref} variants={fadeUp} className="text-center">
      <div
        className="text-3xl md:text-4xl font-extrabold gradient-text"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {prefix}
        {display}
        {suffix}
      </div>
      <div className="text-sm mt-1" style={{ color: C.muted }}>
        {label}
      </div>
    </motion.div>
  );
}

// ─── Imagen con respaldo ──────────────────────────────────────────────────────
// Las fotos brayan2/brayan3 se muestran en cuanto el cliente las suba a /public.
// Mientras tanto cae a una foto de la galería para que nada quede roto.
function PhotoWithFallback({
  src,
  fallback,
  alt,
  className,
  style,
}: {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [current, setCurrent] = useState(src);
  useEffect(() => setCurrent(src), [src]);
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}

// ─── Benefit icons ──────────────────────────────────────────────────────────
type IconProps = { size?: number };
const iconBase = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconTarget({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconBase}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconChartBar({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconBase}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}
function IconCheck({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconBase} strokeWidth={2.4}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function IconUsers({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconBase}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconInstagram({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconBase}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconTelegram({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.12.56l.4-5.63 10.24-9.26c.44-.4-.1-.62-.68-.22L7.62 13.67l-5.44-1.7c-1.18-.37-1.2-1.18.26-1.75L22.4 2.09c.99-.36 1.85.24 1.51 1.7z" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Fernando Rojas",
    city: "Lima, Perú",
    time: "37 años",
    comment:
      "Llevo mucho tiempo en su VIP y la verdad es un tipo sincero que hace su trabajo correctamente, lo que más valoro es su capacidad de enseñanza.",
    rating: 5,
    initials: "FR",
  },
  {
    name: "Diego López",
    city: "Medellín, Colombia",
    time: "34 años",
    comment:
      "Brian hace un trabajo genial y transparente, desde que entré al VIP veo como mis ganancias han aumentado en poco tiempo.",
    rating: 5,
    initials: "DL",
  },
  {
    name: "Andrés Muñoz",
    city: "Bogotá, Colombia",
    time: "27 años",
    comment:
      "Me ayudó mucho ya que no paraba de perder, con su asesoría cambié mi mentalidad acerca de esto y ahora lo hago con inteligencia, mis resultados mejoraron un montón.",
    rating: 5,
    initials: "AM",
  },
  {
    name: "Esteban Ríos",
    city: "Miembro VIP",
    time: "Comunidad TipsterGold",
    comment:
      "Bendiciones profe. Gracias por su conocimiento y sabiduría, de esta manera nos coloca a todos a ganar. Vamos adelante con esta comunidad ganadora, acá ganamos todos 💪",
    rating: 5,
    initials: "ER",
  },
  {
    name: "Miembro VIP",
    city: "Comunidad TipsterGold",
    time: "Cliente verificado",
    comment:
      "Profe buenas tardes, quiero felicitarlo por el buen trabajo de este fin de semana y agradecerle por todo lo bueno. Llevo una semana y mi bank ha subido bastante, gracias profe. Vamos por más 👍",
    rating: 5,
    initials: "VIP",
  },
  {
    name: "Miembro VIP",
    city: "Comunidad TipsterGold",
    time: "Cliente verificado",
    comment:
      "Profe en verdad es admirable su talento, muchas gracias por eso que hace, usted es un crack. Que Dios bendiga su mente y su vida, gracias.",
    rating: 5,
    initials: "VIP",
  },
];

const professionalGallery = [
  { img: "/gallery/gallery-01.png", caption: "Emirates Stadium · Londres" },
  { img: "/gallery/gallery-02.png", caption: "Anfield · Liverpool vs Real Madrid" },
  { img: "/gallery/gallery-03.png", caption: "Estádio José Alvalade · Lisboa" },
  { img: "/gallery/gallery-04.png", caption: "Cartagena · Colombia" },
  { img: "/gallery/gallery-05.png", caption: "Días de descanso y análisis" },
  { img: "/gallery/gallery-06.png", caption: "Un año 2025 con muchas experiencias" },
  { img: "/gallery/gallery-07.png", caption: "Anfield · Liverpool FC" },
  { img: "/gallery/gallery-08.png", caption: "Old Trafford · Manchester United" },
  { img: "/gallery/gallery-09.png", caption: "Signal Iduna Park · Borussia Dortmund" },
  { img: "/gallery/gallery-10.png", caption: "Stadio Olimpico · Lazio" },
  { img: "/gallery/gallery-11.png", caption: "Tottenham Hotspur Stadium · Londres" },
  { img: "/gallery/gallery-12.png", caption: "San Siro · Milán" },
  { img: "/gallery/gallery-13.png", caption: "Estádio da Luz · Benfica" },
  { img: "/gallery/gallery-14.png", caption: "Estádio José Alvalade · Sporting CP" },
  { img: "/gallery/gallery-15.png", caption: "Análisis en cualquier lugar del mundo" },
  { img: "/gallery/gallery-16.png", caption: "Pasión por el fútbol" },
];

// Retratos del cliente (una foto distinta por sección, siempre con el rostro visible)
const PHOTO_HERO = "/Brayan.png";
const PHOTO_FREE = { src: "/brayan3.png", fallback: "/Brayan.png" };
const PHOTO_ELITE = { src: "/brayan2.png", fallback: "/Brayan.png" };

const musicTracks = [
  { src: "/track-uefa-anthem.mp3", title: "UEFA Champions League Anthem" },
  { src: "/track-mix-mundial.mp3", title: "Mix Mundial Fútbol 2022" },
];

const featuredVideos = [
  { id: "FcNq4P1Ywjs", title: "Cómo ganar apuestas aplicando stake" },
  { id: "2c0K4QLyYxg", title: "Cómo emprender e invertir" },
  {
    id: "q9zjH4dluw4",
    title: "Argentina vs España · Análisis completo de la final del Mundial 2026",
  },
  {
    id: "lafzkIMEJf8",
    title: "Argentina vs Inglaterra · Pronóstico Semifinales Mundial 2026",
  },
];

const results = [
  {
    img: "/resultado1.png",
    date: "Verificado",
    desc: "Combinada Cuádruple · 4 selecciones ganadas · Cuota 3.05",
    amount: "✅ Ganada",
  },
  {
    img: "/resultado2.png",
    date: "Verificado",
    desc: "Combinada Triple · 3 selecciones ganadas · Cuota 3.00",
    amount: "✅ Ganada",
  },
  {
    img: "/resultado3.png",
    date: "26 Nov 2025",
    desc: "Champions League · 6 selecciones analizadas",
    amount: "✅ Ganada",
  },
];

const KUNFUPAY_BASE = "https://store.kunfupay.com/tipstergold-gsy9-mdnninaoocif/";

const products = [
  {
    name: "Canal Tenis NBA MLB / Premium",
    price: "105.559,76",
    desc: "Predicciones diarias de tenis, NBA y MLB",
    id: "69f2c6b96a7ca109978aba70",
    highlight: false,
  },
  {
    name: "Grupo Fútbol Semanal",
    price: "78.192,42",
    desc: "Selecciones de fútbol de las principales ligas cada semana",
    id: "69f2c556a9cc1c2db63383a6",
    highlight: false,
  },
  {
    name: "Grupo Semanal Tenis NBA MLB",
    price: "39.096,21",
    desc: "Acceso semanal a pronósticos de tenis, NBA y MLB",
    id: "69f2c72df7deec8c214a4eef",
    highlight: false,
  },
  {
    name: "Membresía Elite",
    price: "195.481,04",
    desc: "Acceso total a todos los deportes y estrategias privadas",
    id: "699873e74287554b8104726d",
    highlight: true,
  },
  {
    name: "Membresía VIP",
    price: "136.836,73",
    desc: "Predicciones premium y soporte prioritario",
    id: "6998730808b11193969c1602",
    highlight: false,
  },
];

// Los dos grupos que el cliente quiere destacar, con sus beneficios.
// Precios e IDs de pago salen de `products`, así no se duplican datos.
const groupPlans = [
  {
    name: "Grupo VIP",
    id: "6998730808b11193969c1602",
    price: "136.836,73",
    desc: "Pronósticos premium de fútbol con seguimiento diario y soporte prioritario.",
    featured: false,
    cta: "Acceder al VIP",
    benefits: [
      "Pronósticos premium todos los días",
      "Fútbol de las principales ligas",
      "Gestión de banca profesional",
      "Alertas en tiempo real",
      "Soporte prioritario",
      "Acceso por Telegram",
    ],
  },
  {
    name: "Grupo Élite",
    id: "699873e74287554b8104726d",
    price: "195.481,04",
    desc: "Acceso total a todos los deportes y a las estrategias privadas.",
    featured: true,
    cta: "Acceder al Élite",
    benefits: [
      "Todo lo del Grupo VIP incluido",
      "Acceso total a todos los deportes",
      "Tenis, NBA y MLB",
      "Estrategias privadas",
      "Combinadas exclusivas",
      "Acompañamiento directo",
    ],
  },
];

// Plan destacado, usado por la seccion Elite y por el CTA final
const ELITE_PRODUCT = products.find((p) => p.highlight) ?? products[0];

// "Otros servicios": lo que no son los grupos VIP/Elite, que ya salen arriba
const otherServices = products.filter((p) => !groupPlans.some((g) => g.id === p.id));

// ─── Textos legales ─────────────────────────────────────────────────────────
// Protegen a TipsterGold frente a reclamaciones por resultados, dejan claro
// que el servicio es informativo y cubren datos personales y cookies.
// PENDIENTE: añadir razón social, NIT y domicilio cuando el cliente los
// facilite, y que un abogado revise el conjunto antes de darlo por definitivo.
type LegalDoc = { key: string; menu: string; title: string; body: [string, string[]][] };

const LEGAL_CONTACT = "tipstergold@outlook.com";

const legalDocs: LegalDoc[] = [
  {
    key: "aviso",
    menu: "Aviso Legal",
    title: "Aviso Legal y Juego Responsable",
    body: [
      [
        "Naturaleza del servicio",
        [
          "TipsterGold es un servicio de información, formación y análisis deportivo. No es una casa de apuestas, no organiza juegos de azar, no acepta apuestas ni intermedia en ellas, y no administra dinero de terceros.",
          "Todo el contenido publicado —análisis, pronósticos, estadísticas y estrategias— tiene finalidad informativa y educativa. En ningún caso constituye asesoría financiera, de inversión, jurídica o fiscal.",
        ],
      ],
      [
        "Ausencia de garantía de resultados",
        [
          "TipsterGold no garantiza ganancias ni resultados concretos de ningún tipo. Cualquier cifra de rendimiento, porcentaje de acierto o retorno mostrada en esta página corresponde a registros históricos y no constituye una promesa ni una previsión.",
          "Los resultados pasados no garantizan resultados futuros. El comportamiento de un mercado deportivo puede variar por causas ajenas a cualquier análisis.",
          "La decisión de apostar, el importe destinado y la gestión del capital son responsabilidad exclusiva y personal del usuario. TipsterGold no responde por pérdidas económicas derivadas del uso de su contenido.",
        ],
      ],
      [
        "Mayores de 18 años",
        [
          "El acceso a este sitio y a los canales de TipsterGold está reservado a personas mayores de 18 años. Al utilizarlo, el usuario declara cumplir la edad mínima legal exigida en su país de residencia.",
          "El usuario es responsable de verificar que la participación en apuestas deportivas sea legal en su jurisdicción y de cumplir la normativa que le resulte aplicable.",
        ],
      ],
      [
        "Juego responsable",
        [
          "Las apuestas deportivas conllevan riesgo económico y pueden generar adicción. Apuesta solo dinero que puedas permitirte perder y nunca lo utilices como fuente de ingresos ni para recuperar pérdidas anteriores.",
          "Fija límites de tiempo y de dinero antes de empezar y respétalos. No apuestes bajo los efectos del alcohol, de sustancias o en estados de ansiedad, euforia o frustración.",
          "Si el juego ha dejado de ser un entretenimiento o afecta a tu economía, tu descanso o tus relaciones, interrumpe la actividad y busca ayuda profesional especializada en ludopatía.",
          "En Colombia, los juegos de suerte y azar están regulados por Coljuegos. Opera únicamente con operadores autorizados en tu país.",
        ],
      ],
      [
        "Independencia y marcas de terceros",
        [
          "TipsterGold no está afiliado, patrocinado ni respaldado por ninguna casa de apuestas, liga, federación o club deportivo.",
          "Los nombres, marcas y logotipos que puedan aparecer pertenecen a sus respectivos titulares y se mencionan únicamente con fines informativos.",
        ],
      ],
    ],
  },
  {
    key: "terminos",
    menu: "Términos de Uso",
    title: "Términos y Condiciones",
    body: [
      [
        "Objeto",
        [
          "Estas condiciones regulan el acceso al sitio web de TipsterGold y la contratación de sus canales y membresías de contenido deportivo. Al acceder al sitio o adquirir cualquier plan, el usuario acepta estas condiciones en su totalidad.",
        ],
      ],
      [
        "Contratación y acceso",
        [
          "Los pagos se procesan a través de la pasarela KunFuPay. TipsterGold no almacena datos de tarjetas ni de medios de pago.",
          "Una vez confirmado el pago, el acceso al canal contratado se entrega por Telegram. Es responsabilidad del usuario facilitar un contacto correcto y revisar la bandeja de entrada del correo indicado.",
          "El acceso es personal e intransferible. Está prohibido compartir, revender, difundir o reproducir el contenido de los canales, total o parcialmente, por cualquier medio.",
        ],
      ],
      [
        "Duración, renovación y cancelación",
        [
          "Los planes se contratan por el periodo indicado en cada uno de ellos. El usuario puede cancelar la renovación en cualquier momento antes del siguiente cobro escribiendo a " +
            LEGAL_CONTACT +
            " o por los canales de soporte publicados.",
          "La cancelación surte efecto al final del periodo ya abonado; el usuario conserva el acceso hasta esa fecha.",
        ],
      ],
      [
        "Derecho de retracto y devoluciones",
        [
          "Al tratarse de contenido digital de acceso inmediato, el usuario reconoce que la ejecución del servicio comienza en el momento en que se le da acceso al canal.",
          "Las solicitudes de devolución se atienden caso por caso conforme a la normativa de protección al consumidor aplicable, escribiendo a " +
            LEGAL_CONTACT +
            " dentro de los plazos que dicha normativa establezca.",
        ],
      ],
      [
        "Obligaciones del usuario",
        [
          "Utilizar el contenido de forma lícita y personal, sin fines comerciales ni de reventa.",
          "No suplantar la identidad de TipsterGold ni de sus responsables, ni crear canales, perfiles o comunidades que puedan inducir a confusión.",
          "Mantener un trato respetuoso en las comunidades. TipsterGold podrá suspender el acceso, sin derecho a reembolso del periodo en curso, ante incumplimientos graves, conductas ofensivas o filtración del contenido.",
        ],
      ],
      [
        "Propiedad intelectual",
        [
          "Los análisis, textos, imágenes, vídeos, planillas, marca y diseño de TipsterGold están protegidos por la normativa de propiedad intelectual y su titularidad corresponde a TipsterGold o a quienes hayan cedido su uso.",
          "Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización previa y por escrito.",
        ],
      ],
      [
        "Limitación de responsabilidad",
        [
          "TipsterGold no responde por las decisiones de apuesta del usuario ni por pérdidas económicas derivadas de ellas.",
          "Tampoco responde por interrupciones del servicio ajenas a su control, como caídas de Telegram, de la pasarela de pago, del proveedor de alojamiento o de la conexión del usuario.",
        ],
      ],
      [
        "Modificaciones y ley aplicable",
        [
          "TipsterGold puede actualizar estas condiciones, sus planes y sus precios. Los cambios se publican en esta misma página y rigen desde su publicación, sin afectar a periodos ya contratados.",
          "Estas condiciones se rigen por la legislación colombiana. Para cualquier controversia, las partes se someten a los jueces y tribunales competentes de Colombia.",
        ],
      ],
    ],
  },
  {
    key: "privacidad",
    menu: "Privacidad",
    title: "Política de Privacidad",
    body: [
      [
        "Responsable y contacto",
        [
          "El responsable del tratamiento de los datos es TipsterGold. Puedes escribir a " +
            LEGAL_CONTACT +
            " para cualquier cuestión relacionada con tus datos personales.",
        ],
      ],
      [
        "Qué datos se tratan",
        [
          "Este sitio web no dispone de formularios de registro y no recoge datos por sí mismo.",
          "Se tratan únicamente los datos que el propio usuario facilita al contactar por Telegram o correo (nombre o alias y datos de contacto) y los necesarios para gestionar una compra, que recaba y procesa la pasarela KunFuPay.",
        ],
      ],
      [
        "Para qué se usan",
        [
          "Gestionar el alta, el acceso y la renovación de los canales contratados.",
          "Atender consultas y dar soporte.",
          "Cumplir obligaciones legales, contables y fiscales.",
          "No se elaboran perfiles automatizados con efectos jurídicos ni se venden datos a terceros.",
        ],
      ],
      [
        "Terceros que intervienen",
        [
          "KunFuPay, como pasarela de pago.",
          "Telegram, como canal de comunicación y entrega del contenido.",
          "Vercel, como proveedor de alojamiento del sitio.",
          "YouTube, al reproducir los vídeos incrustados en la página.",
          "Cada uno de estos servicios aplica sus propias políticas de privacidad, que el usuario acepta al utilizarlos.",
        ],
      ],
      [
        "Conservación",
        [
          "Los datos se conservan mientras se mantenga la relación con el usuario y, después, durante los plazos exigidos por la normativa contable y fiscal.",
        ],
      ],
      [
        "Tus derechos",
        [
          "Puedes solicitar el acceso, la actualización, la rectificación o la supresión de tus datos, así como revocar la autorización otorgada, conforme a la Ley 1581 de 2012 de protección de datos personales de Colombia.",
          "Para ejercerlos, escribe a " + LEGAL_CONTACT + " indicando tu solicitud.",
        ],
      ],
    ],
  },
  {
    key: "cookies",
    menu: "Cookies",
    title: "Política de Cookies",
    body: [
      [
        "Cookies propias",
        [
          "TipsterGold no instala cookies propias de seguimiento, publicidad ni analítica. La navegación por esta página no requiere aceptar cookies para funcionar.",
        ],
      ],
      [
        "Cookies de terceros",
        [
          "Al reproducir un vídeo incrustado, YouTube puede instalar cookies propias en el navegador del usuario, sujetas a la política de privacidad de Google.",
          "El proveedor de alojamiento puede utilizar cookies o registros técnicos estrictamente necesarios para servir la página y garantizar su seguridad.",
        ],
      ],
      [
        "Cómo gestionarlas",
        [
          "Cualquier navegador permite consultar, bloquear o eliminar las cookies instaladas desde su apartado de configuración o privacidad.",
          "Bloquear las cookies de terceros puede impedir la reproducción de los vídeos incrustados, sin afectar al resto del sitio.",
        ],
      ],
    ],
  },
];

// Pasos del método, con una foto real de Brayan en cada uno
const analysisSteps = [
  {
    img: "/gallery/gallery-15.png",
    alt: "Brayan analizando partidos con el portátil",
    pos: "center 35%",
    title: "Primero el estudio",
    text: "Antes de poner un peso reviso forma reciente, bajas, calendario, motivación y contexto del partido. La cuota dice cuánto paga, no si vale la pena.",
  },
  {
    img: "/gallery/gallery-09.png",
    alt: "Signal Iduna Park, Borussia Dortmund",
    pos: "center 30%",
    title: "Los datos mandan",
    text: "Una racha, un presentimiento o el equipo del corazón no son argumentos. La decisión se sostiene con números, no con ganas de que salga.",
  },
  {
    img: "/gallery/gallery-12.png",
    alt: "San Siro, Milán",
    pos: "center 32%",
    title: "Gestiona tu banca",
    text: "Ninguna selección merece que arriesgues todo. Define tu unidad, respétala siempre y nunca persigas una pérdida con una apuesta más grande.",
  },
  {
    img: "/gallery/gallery-06.png",
    alt: "Brayan viviendo el fútbol de cerca",
    pos: "center 28%",
    title: "Registra y revisa",
    text: "Lo que no se mide no mejora. Anotar cada entrada es lo que te muestra qué mercados dominas y en cuáles estás perdiendo dinero.",
  },
];

const TELEGRAM_FREE = "https://t.me/Tgfutboltips";
const TELEGRAM_CONTACT = "https://t.me/TipsterGold_1";

// Métricas del hero. En escritorio flotan alrededor de la foto (posición en
// left/right, nunca en transform); en móvil se listan quietas debajo.
const heroMetrics = [
  {
    icon: IconTarget,
    value: "89%",
    label: "Precisión histórica",
    pos: "top-[6%] left-[-16%]",
    delay: 0.8,
    floatDelay: "0s",
  },
  {
    icon: IconInstagram,
    value: "+19.000",
    label: "Seguidores en IG",
    pos: "top-[30%] right-[-14%]",
    delay: 0.95,
    floatDelay: "-1.4s",
  },
  {
    icon: IconChartBar,
    value: "+42%",
    label: "ROI mensual",
    pos: "top-[58%] left-[-16%]",
    delay: 1.1,
    floatDelay: "-2.7s",
  },
  {
    icon: IconUsers,
    value: "+10.000",
    label: "Usuarios activos",
    pos: "top-[72%] right-[-12%]",
    delay: 1.25,
    floatDelay: "-4s",
  },
];

// Menú desplegable. Cada entrada apunta al id real de su sección.
const navLinks = [
  { label: "Inicio", hint: "Volver arriba", id: "hero" },
  { label: "Plan Gratis", hint: "Canal gratuito en Telegram", id: "gratuito" },
  { label: "Plan Elite", hint: "Acceso total a todos los deportes", id: "elite" },
  { label: "Planes VIP y Élite", hint: "Compara y elige el tuyo", id: "grupos" },
  { label: "Resultados", hint: "Comprobantes verificados", id: "resultados" },
  { label: "Más servicios", hint: "Canales por deporte", id: "planes" },
];

// ─── Marca (logo tipográfico reutilizable) ──────────────────────────────────
function BrandName({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <span className={className} style={{ fontFamily: "Poppins", ...style }}>
      Tipster<span className="gradient-text">Gold</span>
    </span>
  );
}

// ─── Ambiente dorado detrás del retrato ─────────────────────────────────────
// Nada de `mix-blend-mode` ni de blur sobre la capa de color: el navegador
// rasteriza esa combinación en un búfer rectangular y deja ver la caja. Aquí
// el volumen se construye solo con degradados de parada larga, más bokeh y
// polvo en suspensión enmascarados, así el resplandor muere en la oscuridad.
function HeroAmbience() {
  // Focos desenfocados: posición, tamaño (%) y opacidad
  const bokeh = [
    { top: "14%", left: "6%", size: 22, o: 0.1, blur: 14 },
    { top: "30%", left: "82%", size: 15, o: 0.085, blur: 10 },
    { top: "58%", left: "-4%", size: 27, o: 0.07, blur: 18 },
    { top: "70%", left: "76%", size: 19, o: 0.075, blur: 12 },
    { top: "8%", left: "58%", size: 11, o: 0.09, blur: 8 },
    { top: "46%", left: "34%", size: 30, o: 0.045, blur: 22 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Volumen principal: 7 paradas para un desvanecido muy progresivo que
          llega a transparente mucho antes del borde de su caja. */}
      <div
        className="absolute"
        style={{
          inset: "-70%",
          background: `radial-gradient(closest-side ellipse at 50% 45%,
            ${hexToRgba(C.gold, 0.2)} 0%,
            ${hexToRgba(C.gold, 0.145)} 16%,
            ${hexToRgba(C.gold, 0.095)} 30%,
            ${hexToRgba(C.gold, 0.055)} 44%,
            ${hexToRgba(C.gold, 0.026)} 58%,
            ${hexToRgba(C.gold, 0.01)} 72%,
            ${hexToRgba(C.gold, 0.003)} 84%,
            transparent 94%)`,
        }}
      />
      {/* Núcleo cálido, más estrecho, para dar profundidad */}
      <div
        className="absolute"
        style={{
          inset: "-28%",
          background: `radial-gradient(closest-side ellipse at 50% 40%,
            ${hexToRgba(C.goldBright, 0.12)} 0%,
            ${hexToRgba(C.gold, 0.06)} 30%,
            ${hexToRgba(C.gold, 0.02)} 54%,
            transparent 82%)`,
        }}
      />

      {/* Bokeh: esferas de luz muy desenfocadas */}
      <div className="absolute" style={{ inset: "-40%" }}>
        {bokeh.map((b, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              top: b.top,
              left: b.left,
              width: `${b.size}%`,
              aspectRatio: "1",
              background: `radial-gradient(circle, ${hexToRgba(C.goldBright, b.o)} 0%, ${hexToRgba(C.gold, b.o * 0.45)} 42%, transparent 72%)`,
              filter: `blur(${b.blur}px)`,
            }}
          />
        ))}
      </div>

      {/* Micro-partículas de polvo en suspensión, recortadas por una máscara
          radial para que el campo de puntos no forme un rectángulo. */}
      <div
        className="absolute"
        style={{
          inset: "-35%",
          backgroundImage: `radial-gradient(${hexToRgba(C.goldBright, 0.55)} 0.9px, transparent 1.1px),
                            radial-gradient(${hexToRgba(C.champagne, 0.4)} 0.7px, transparent 0.9px)`,
          backgroundSize: "58px 58px, 91px 91px",
          backgroundPosition: "0 0, 29px 41px",
          opacity: 0.16,
          maskImage:
            "radial-gradient(closest-side ellipse at 50% 45%, #000 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 66%, transparent 88%)",
          WebkitMaskImage:
            "radial-gradient(closest-side ellipse at 50% 45%, #000 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 66%, transparent 88%)",
        }}
      />
    </div>
  );
}

// ─── Ventana con los textos legales ─────────────────────────────────────────
function LegalModal({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Evita que la página de fondo se desplace mientras se lee
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={doc.title}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.28, ease: easeOut }}
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "min(86vh, 780px)",
          background: C.panel,
          border: `1px solid ${hexToRgba(C.gold, 0.3)}`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${hexToRgba(C.gold, 0.08)}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between gap-4 px-6 md:px-8 py-5 flex-shrink-0"
          style={{ borderBottom: `1px solid ${hexToRgba(C.gold, 0.18)}` }}
        >
          <h3 className="text-lg md:text-xl font-black" style={{ fontFamily: "Poppins" }}>
            <span className="gradient-text">{doc.title}</span>
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: hexToRgba(C.gold, 0.12), color: C.champagne }}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-6 md:px-8 py-6 space-y-6">
          {doc.body.map(([heading, paragraphs]) => (
            <section key={heading}>
              <h4
                className="text-sm font-bold mb-2 tracking-wide"
                style={{ fontFamily: "Poppins", color: C.goldBright }}
              >
                {heading}
              </h4>
              <div className="space-y-2">
                {paragraphs.map((text, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: C.muted }}>
                    {text}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <p className="text-xs pt-2" style={{ color: C.dim }}>
            Última actualización: agosto de 2026 · Para cualquier consulta legal escribe a{" "}
            <a href={`mailto:${LEGAL_CONTACT}`} style={{ color: C.gold }}>
              {LEGAL_CONTACT}
            </a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Disparador del menú: rejilla de puntos dorada que gira y se abre ───────
function MenuTrigger({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={open}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="relative flex items-center gap-2.5 rounded-full pl-2.5 pr-2.5 md:pr-4 py-2 -ml-1"
      style={{
        background: open ? hexToRgba(C.gold, 0.14) : hexToRgba(C.gold, 0.05),
        border: `1px solid ${hexToRgba(C.gold, open ? 0.5 : 0.2)}`,
        transition: "background 0.25s ease, border-color 0.25s ease",
      }}
    >
      <motion.span
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
        className="grid grid-cols-3 gap-[3px]"
      >
        {Array.from({ length: 9 }).map((_, i) => {
          // Al abrir, los puntos de las esquinas se desvanecen y queda una cruz
          const isCross = [1, 3, 4, 5, 7].includes(i);
          return (
            <motion.span
              key={i}
              animate={{
                opacity: open ? (isCross ? 1 : 0) : 1,
                scale: open ? (isCross ? 1.15 : 0.4) : 1,
              }}
              transition={{ duration: 0.32, ease: easeOut, delay: i * 0.015 }}
              className="block w-[4px] h-[4px] rounded-full"
              style={{ background: open ? C.goldBright : C.gold }}
            />
          );
        })}
      </motion.span>
      <span
        className="hidden md:block text-[11px] font-bold tracking-[0.2em]"
        style={{ color: open ? C.goldBright : C.muted, fontFamily: "Inter" }}
      >
        {open ? "CERRAR" : "MENÚ"}
      </span>
    </motion.button>
  );
}

// ─── Balón girando (loader) ─────────────────────────────────────────────────
function SpinningBall({ size = 96 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Anillo orbital dorado */}
      <div
        className="absolute inset-[-14px] rounded-full ring-spin"
        style={{
          border: "1px dashed rgba(212,175,55,0.45)",
          borderTopColor: C.goldBright,
          borderTopStyle: "solid",
        }}
      />
      {/* Halo */}
      <div
        className="absolute inset-[-30px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${hexToRgba(C.gold, 0.28)} 0%, transparent 70%)`,
          filter: "blur(10px)",
        }}
      />
      <img
        src="/balon.png"
        alt=""
        aria-hidden="true"
        className="relative w-full h-full rounded-full object-cover spin-ball"
        style={{ boxShadow: `0 0 0 2px ${hexToRgba(C.gold, 0.35)}, 0 14px 40px rgba(0,0,0,0.6)` }}
      />
    </div>
  );
}

// ─── Pantalla de carga tras el login ────────────────────────────────────────
function LoaderScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center px-6"
      style={{ background: C.black }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 42%, ${hexToRgba(C.gold, 0.14)} 0%, transparent 62%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <SpinningBall size={104} />

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-12 fs-hero font-black tracking-tight gold-shimmer text-center"
          style={{ fontFamily: "Poppins" }}
        >
          TIPSTER GOLD
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 text-xs md:text-sm tracking-[0.35em] uppercase"
          style={{ color: C.muted }}
        >
          Preparando tu acceso
        </motion.p>

        {/* Barra de progreso */}
        <div
          className="mt-8 h-[3px] w-56 md:w-72 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div className="h-full w-full load-bar" style={{ background: GOLD_GRAD }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Demo access gate ───────────────────────────────────────────────────────
// Desactivado: la página es de acceso libre. Poner en `true` para volver a
// exigir la palabra clave (por ejemplo, si se quiere enseñar en privado).
const DEMO_LOCK_ENABLED = false;
const DEMO_PASSWORD = "PRUEBA";

function DemoGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim().toUpperCase() === DEMO_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setValue("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: C.black }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 38%, ${hexToRgba(C.gold, 0.13)} 0%, transparent 62%)`,
        }}
      />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm rounded-3xl p-8 text-center"
        style={{
          background: "rgba(15,15,15,0.92)",
          border: `1px solid ${hexToRgba(C.gold, 0.28)}`,
          boxShadow: `0 24px 70px rgba(0,0,0,0.7), 0 0 40px ${hexToRgba(C.gold, 0.08)}`,
        }}
      >
        <img src="/logo.png" alt="TipsterGold" className="w-16 h-16 mx-auto mb-4 object-contain" />
        <BrandName className="block text-lg font-black mb-2" />
        <p className="text-xs mb-6" style={{ color: C.muted }}>
          Vista previa privada. Ingresa la palabra clave para continuar.
        </p>
        <motion.input
          animate={error ? { x: [0, -8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          type="text"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder="Palabra clave"
          className="w-full text-center px-4 py-3 rounded-xl text-sm mb-3 outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: error ? "1px solid #ff4d4d" : `1px solid ${hexToRgba(C.gold, 0.22)}`,
            color: C.ivory,
            fontFamily: "Inter",
            letterSpacing: "0.1em",
          }}
        />
        {error && (
          <p className="text-xs mb-3" style={{ color: "#ff6b6b" }}>
            Palabra clave incorrecta, intenta de nuevo.
          </p>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-bold text-sm"
          style={{
            background: GOLD_GRAD,
            color: C.black,
            fontFamily: "Poppins",
            boxShadow: `0 8px 26px ${hexToRgba(C.gold, 0.3)}`,
          }}
        >
          Desbloquear
        </button>
      </motion.form>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Sin bloqueo, la visita entra directa pero pasando por la intro del balón.
  const [stage, setStage] = useState<"gate" | "loading" | "site">(
    DEMO_LOCK_ENABLED ? "gate" : "loading"
  );

  return (
    <>
      {stage === "gate" && <DemoGate onUnlock={() => setStage("loading")} />}
      <AnimatePresence>
        {stage === "loading" && <LoaderScreen key="loader" onDone={() => setStage("site")} />}
      </AnimatePresence>
      {stage === "site" && <SiteContent />}
    </>
  );
}

// ─── SITE CONTENT (only mounted once unlocked) ─────────────────────────────
function SiteContent() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedResult, setSelectedResult] = useState<(typeof results)[0] | null>(null);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [testimonialsPaused, setTestimonialsPaused] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);
  const [avisoAbierto, setAvisoAbierto] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenu(false);
    // Defer until after the mobile menu's close reflow so the target
    // section's position is measured against its final, settled layout.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (!el) return;
        const headerOffset = window.innerWidth < 768 ? 72 : 96;
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo(0, Math.max(top, 0));
      });
    });
  };

  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % professionalGallery.length));
  const prevPhoto = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + professionalGallery.length) % professionalGallery.length
    );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex]);

  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroInView = useInView(heroVideoRef, { margin: "200px" });

  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    if (heroInView) v.play().catch(() => {});
    else v.pause();
  }, [heroInView]);

  const bannerVideoRef = useRef<HTMLVideoElement>(null);
  const bannerInView = useInView(bannerVideoRef, { margin: "200px" });

  useEffect(() => {
    const v = bannerVideoRef.current;
    if (!v) return;
    if (bannerInView) v.play().catch(() => {});
    else v.pause();
  }, [bannerInView]);

  // ─── Background music player ───────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerBoundsRef = useRef<HTMLDivElement>(null);
  const wantsPlayingRef = useRef(true);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.1);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.play().catch(() => {});
    const resume = () => {
      if (wantsPlayingRef.current && !document.hidden && a.paused) a.play().catch(() => {});
    };
    // Si el visitante cambia de pestaña, minimiza o bloquea el móvil, la
    // música se detiene; al volver, sigue solo si él no la había apagado.
    const onVisibility = () => {
      if (document.hidden) a.pause();
      else if (wantsPlayingRef.current) a.play().catch(() => {});
    };
    // `pagehide` cubre el cierre de la pestaña y la navegación fuera del sitio,
    // incluido Safari en iOS, donde `beforeunload` no es fiable.
    const stop = () => a.pause();

    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", stop);

    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", stop);
      a.pause();
    };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.load();
    a.volume = volume;
    if (wantsPlayingRef.current) a.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
      wantsPlayingRef.current = true;
      setIsPlaying(true);
    } else {
      a.pause();
      wantsPlayingRef.current = false;
      setIsPlaying(false);
    }
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const switchTrack = () => setTrackIndex((i) => (i + 1) % musicTracks.length);
  const onTrackEnded = () => setTrackIndex((i) => (i + 1) % musicTracks.length);

  return (
    <div style={{ background: C.black, minHeight: "100vh", overflowX: "hidden" }}>
      {/* ── HEADER ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: scrolled ? "rgba(8,8,8,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          boxShadow: scrolled ? `0 1px 0 ${hexToRgba(C.gold, 0.18)}` : "none",
          transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
        }}
      >
        <div className="wrap h-16 md:h-[86px] flex items-center relative">
          {/* Hamburguesa (móvil) / Nav (escritorio) — a la izquierda */}
          <div className="flex-1 flex items-center">
            <MenuTrigger open={mobileMenu} onToggle={() => setMobileMenu((v) => !v)} />
          </div>

          {/* Marca centrada — logo + nombre de la página */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => scrollTo("hero")}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 md:gap-3.5"
            aria-label="Ir al inicio"
          >
            <img
              src="/logo.png"
              alt="TipsterGold"
              className="w-10 h-10 md:w-[54px] md:h-[54px] rounded-full object-cover"
              style={{ boxShadow: `0 0 0 1px ${hexToRgba(C.gold, 0.35)}, 0 0 22px ${hexToRgba(C.gold, 0.2)}` }}
            />
            <span
              className="font-black tracking-[0.14em] whitespace-nowrap"
              style={{
                fontFamily: "Poppins",
                fontSize: "clamp(0.9rem, 1.5vw, 1.25rem)",
                color: C.ivory,
              }}
            >
              TIPSTER <span className="gradient-text">GOLD</span>
            </span>
          </motion.button>

          {/* CTA a la derecha */}
          <div className="flex-1 flex items-center justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollTo("grupos")}
              className="hidden sm:block px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: GOLD_GRAD,
                color: C.black,
                fontFamily: "Poppins",
                boxShadow: `0 0 22px ${hexToRgba(C.gold, 0.32)}`,
              }}
            >
              Únete Ahora
            </motion.button>
          </div>
        </div>

        {/* Desplegable de navegación (móvil y escritorio) */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: easeOut }}
              className="overflow-hidden"
              style={{
                background: "rgba(8,8,8,0.985)",
                borderTop: `1px solid ${hexToRgba(C.gold, 0.2)}`,
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
              }}
            >
              <div className="wrap py-5 md:py-7">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                  {navLinks.map((link, i) => (
                    <motion.button
                      key={link.label}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.28 }}
                      onClick={() => scrollTo(link.id)}
                      className="group text-left rounded-xl px-4 py-3.5 transition-all"
                      style={{
                        background: hexToRgba(C.gold, 0.04),
                        border: `1px solid ${hexToRgba(C.gold, 0.14)}`,
                        color: C.ivory,
                        fontFamily: "Inter",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = hexToRgba(C.gold, 0.12);
                        e.currentTarget.style.borderColor = hexToRgba(C.gold, 0.45);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = hexToRgba(C.gold, 0.04);
                        e.currentTarget.style.borderColor = hexToRgba(C.gold, 0.14);
                      }}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block text-base font-semibold leading-tight">
                            {link.label}
                          </span>
                          <span
                            className="block text-[11px] mt-0.5 truncate"
                            style={{ color: C.muted }}
                          >
                            {link.hint}
                          </span>
                        </span>
                        <span
                          className="flex-shrink-0 transition-transform group-hover:translate-x-1"
                          style={{ color: C.gold }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </span>
                      </span>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-4 sm:hidden">
                  <button
                    onClick={() => scrollTo("grupos")}
                    className="w-full py-3.5 rounded-xl font-bold text-base"
                    style={{ background: GOLD_GRAD, color: C.black, fontFamily: "Poppins" }}
                  >
                    Únete Ahora
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section
        id="hero"
        className="relative flex items-center overflow-hidden"
        style={{ paddingTop: "84px", minHeight: "min(100svh, 900px)" }}
      >
        {/* Background stadium video */}
        <video
          ref={heroVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "translateZ(0)", filter: "saturate(0.55) contrast(1.05)" }}
          src="/hero-stadium.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.72) 45%, rgba(8,8,8,0.92) 100%)",
          }}
        />
        {/* Luz ambiental dorada: muchas paradas para un desvanecido largo,
            sin ningún corte perceptible. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 62% 52% at 68% 46%, ${hexToRgba(C.gold, 0.11)} 0%, ${hexToRgba(C.gold, 0.075)} 22%, ${hexToRgba(C.gold, 0.042)} 40%, ${hexToRgba(C.gold, 0.02)} 58%, ${hexToRgba(C.gold, 0.007)} 74%, transparent 90%)`,
          }}
        />
        {/* Transiciones largas arriba y abajo para que el vídeo no arranque
            ni termine con una línea recta. */}
        <div
          className="absolute top-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${C.black}, transparent)` }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${C.black} 0%, rgba(8,8,8,0.75) 32%, rgba(8,8,8,0.35) 62%, transparent 100%)`,
          }}
        />

        <div className="relative z-10 wrap w-full grid items-center gap-8 md:gap-6 lg:gap-10 md:grid-cols-[0.95fr_1.05fr] pt-4 pb-8 md:py-8">
          {/* ── Columna de texto ── */}
          <div className="order-2 md:order-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="fs-hero font-black mb-4 md:mb-5"
              style={{ fontFamily: "Poppins" }}
            >
              GANA CON <span className="gradient-text">ANÁLISIS</span>
              <br className="hidden sm:block" /> BASADO EN{" "}
              <span className="gradient-text">DATOS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="fs-lead mb-7 mx-auto md:mx-0"
              style={{ color: C.muted, fontFamily: "Inter", maxWidth: "50ch" }}
            >
              Te enseño a ser exitoso en el juego deportivo: análisis profesionales, estadísticas
              verificadas y gestión de banca para que decidas con cabeza, no con suerte.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => scrollTo("grupos")}
                className="px-6 py-3.5 rounded-xl text-sm font-bold whitespace-nowrap"
                style={{
                  background: GOLD_GRAD,
                  color: C.black,
                  fontFamily: "Poppins",
                  boxShadow: `0 0 30px ${hexToRgba(C.gold, 0.35)}, 0 8px 22px rgba(0,0,0,0.5)`,
                }}
              >
                Comenzar Ahora →
              </motion.button>
              <motion.a
                href={TELEGRAM_FREE}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-6 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap"
                style={{
                  background: "rgba(34,158,217,0.14)",
                  color: "#7fd0f5",
                  border: "1px solid rgba(34,158,217,0.45)",
                  fontFamily: "Poppins",
                }}
              >
                <IconTelegram size={16} />
                Únete Gratis
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.04, color: C.goldBright }}
                whileTap={{ scale: 0.96 }}
                onClick={() => scrollTo("resultados")}
                className="px-6 py-3.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                style={{
                  background: "transparent",
                  color: C.ivory,
                  border: `1px solid ${hexToRgba(C.gold, 0.28)}`,
                  fontFamily: "Poppins",
                }}
              >
                Ver Resultados
              </motion.button>
            </motion.div>

            {/* Prueba social */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="mt-6 flex items-center justify-center md:justify-start gap-3"
            >
              <div className="flex -space-x-2.5">
                {testimonials.slice(0, 4).map((t, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: `linear-gradient(140deg, ${hexToRgba(C.gold, 0.28)}, rgba(20,18,12,0.95))`,
                      border: `2px solid ${C.black}`,
                      color: C.champagne,
                      fontFamily: "Poppins",
                    }}
                  >
                    {t.initials.slice(0, 2)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="text-xs" style={{ color: C.gold, letterSpacing: "1.5px" }}>
                  ★★★★★
                </div>
                <p className="text-[11px]" style={{ color: C.muted }}>
                  +10.000 usuarios satisfechos
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Columna de la foto ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="order-1 md:order-2 relative flex flex-col items-center self-center w-full"
          >
            {/* La caja define el encuadre: la foto lo llena por completo y se
                recorta por abajo, así ocupa todo el ancho de su columna. */}
            <div className="hero-photo relative mx-auto">
              <HeroAmbience />

              <div className="relative w-full h-full">
                <img
                  src={PHOTO_HERO}
                  alt="Brayan · TipsterGold"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: "center top",
                    // Dos máscaras cruzadas: difuminan los laterales y la base,
                    // para que el fondo del recorte se funda con la sección.
                    maskImage:
                      "linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%), linear-gradient(to bottom, #000 0%, #000 70%, transparent 97%)",
                    WebkitMaskImage:
                      "linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%), linear-gradient(to bottom, #000 0%, #000 70%, transparent 97%)",
                    maskComposite: "intersect",
                    WebkitMaskComposite: "source-in",
                    filter: `drop-shadow(0 24px 55px rgba(0,0,0,0.8)) drop-shadow(0 0 34px ${hexToRgba(C.gold, 0.18)})`,
                  }}
                />

                {/* Escritorio: las tarjetas rodean la silueta.
                    La posición va en left/right (no en transform) para no
                    chocar con las transformaciones de framer-motion. */}
                <div className="hidden md:block absolute inset-0 pointer-events-none">
                  {heroMetrics.map((m) => (
                    <motion.div
                      key={m.value}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: m.delay, duration: 0.5 }}
                      className={`absolute ${m.pos}`}
                    >
                      <div
                        className="float-card flex items-center gap-2.5 rounded-xl px-2.5 py-2 backdrop-blur-md whitespace-nowrap"
                        style={{
                          background: "rgba(15,15,15,0.86)",
                          border: `1px solid ${hexToRgba(C.gold, 0.3)}`,
                          boxShadow: "0 12px 30px rgba(0,0,0,0.55)",
                          animationDelay: m.floatDelay,
                        }}
                      >
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: hexToRgba(C.gold, 0.12),
                            border: `1px solid ${hexToRgba(C.gold, 0.24)}`,
                            color: C.gold,
                          }}
                        >
                          <m.icon size={14} />
                        </span>
                        <span className="leading-tight">
                          <span
                            className="block text-[15px] font-black gradient-text"
                            style={{ fontFamily: "Poppins" }}
                          >
                            {m.value}
                          </span>
                          <span className="block text-[10px]" style={{ color: C.muted }}>
                            {m.label}
                          </span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Móvil: las cuatro métricas quedan quietas y compactas bajo la foto */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="md:hidden mt-3 grid grid-cols-2 gap-2 w-full max-w-[20rem] mx-auto"
            >
              {heroMetrics.map((m) => (
                <div
                  key={m.value}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                  style={{
                    background: "rgba(15,15,15,0.86)",
                    border: `1px solid ${hexToRgba(C.gold, 0.24)}`,
                  }}
                >
                  <span className="flex-shrink-0" style={{ color: C.gold }}>
                    <m.icon size={13} />
                  </span>
                  <span className="leading-tight min-w-0">
                    <span
                      className="block text-[12px] font-black gradient-text"
                      style={{ fontFamily: "Poppins" }}
                    >
                      {m.value}
                    </span>
                    <span className="block text-[9px] truncate" style={{ color: C.muted }}>
                      {m.label}
                    </span>
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* ── PROFESSIONAL GALLERY ── */}
      <section className="sec-pad overflow-hidden" style={{ background: C.black }}>
        <div className="wrap mb-10">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-2">
              <h2 className="fs-h2 font-black mb-3" style={{ fontFamily: "Poppins" }}>
                Cumpliendo Sueños, <span className="gradient-text">Ayudándote a Ti</span>
              </h2>
              <p className="text-base" style={{ color: C.muted }}>
                De estadio en estadio, viviendo el fútbol en primera fila
              </p>
            </motion.div>
          </Section>
        </div>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setGalleryPaused(true)}
          onMouseLeave={() => setGalleryPaused(false)}
          onTouchStart={() => setGalleryPaused(true)}
          onTouchEnd={() => setGalleryPaused(false)}
        >
          <div
            className="flex gap-4 scroll-left"
            style={{
              width: "max-content",
              animationPlayState: galleryPaused ? "paused" : "running",
              animationDuration: "70s",
            }}
          >
            {[...professionalGallery, ...professionalGallery].map((photo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxIndex(i % professionalGallery.length)}
                className="relative rounded-2xl overflow-hidden flex-shrink-0 group text-left cursor-pointer w-[190px] h-[250px] md:w-[280px] md:h-[360px]"
                style={{ border: `1px solid ${hexToRgba(C.gold, 0.16)}` }}
              >
                <img
                  src={photo.img}
                  alt={photo.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.15) 45%, transparent 70%)",
                  }}
                />
                <div
                  className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: GOLD_GRAD, color: C.black }}
                >
                  🔍
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-sm font-bold" style={{ fontFamily: "Poppins", color: C.ivory }}>
                    {photo.caption}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Edge fades */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-28"
            style={{ background: `linear-gradient(to right, ${C.black}, transparent)` }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-28"
            style={{ background: `linear-gradient(to left, ${C.black}, transparent)` }}
          />
        </div>
      </section>

      {/* Gallery lightbox modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.94)", backdropFilter: "blur(8px)" }}
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full flex items-center justify-center z-10"
              style={{ background: hexToRgba(C.gold, 0.15), color: C.champagne }}
              onClick={closeLightbox}
            >
              ✕
            </button>

            <button
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-2xl z-10"
              style={{ background: hexToRgba(C.gold, 0.15), color: C.champagne }}
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
            >
              ‹
            </button>
            <button
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-2xl z-10"
              style={{ background: hexToRgba(C.gold, 0.15), color: C.champagne }}
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
            >
              ›
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) nextPhoto();
                  else if (info.offset.x > 80) prevPhoto();
                }}
                className="relative max-w-3xl w-full rounded-3xl overflow-hidden"
                style={{ background: C.panel, border: `1px solid ${hexToRgba(C.gold, 0.3)}` }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={professionalGallery[lightboxIndex].img}
                  alt={professionalGallery[lightboxIndex].caption}
                  className="w-full max-h-[70vh] object-contain bg-black"
                  draggable={false}
                />
                <div className="p-5 flex items-center justify-between">
                  <p className="text-base font-bold" style={{ fontFamily: "Poppins" }}>
                    {professionalGallery[lightboxIndex].caption}
                  </p>
                  <span className="text-xs" style={{ color: C.muted }}>
                    {lightboxIndex + 1} / {professionalGallery.length}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GRUPO GRATUITO (foto brayan3) ── */}
      <section id="gratuito" className="sec-pad" style={{ background: C.panel }}>
        <div className="wrap">
          <Section>
            <motion.div
              variants={scaleIn}
              // Sin `overflow-hidden`: la foto sobresale por arriba y da
              // sensación de relieve, como si saliera de la tarjeta.
              className="rounded-3xl grid md:grid-cols-2 relative mt-8 md:mt-12"
              style={{
                background: `linear-gradient(120deg, rgba(10,10,10,0.98) 0%, ${hexToRgba(C.gold, 0.07)} 100%)`,
                border: `1px solid ${hexToRgba(C.gold, 0.2)}`,
                boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
              }}
            >
              {/* Texto */}
              <div className="p-6 md:p-12 lg:p-14 flex flex-col justify-center order-2 md:order-1">
                <div
                  className="text-xs font-bold tracking-[0.28em] uppercase mb-3"
                  style={{ color: C.gold, fontFamily: "Inter" }}
                >
                  100% Gratis
                </div>
                <h2
                  className="fs-h2 font-black mb-4 leading-[1.05]"
                  style={{ fontFamily: "Poppins" }}
                >
                  CANAL <span className="gradient-text">GRATUITO</span>
                </h2>
                <p className="fs-body mb-7" style={{ color: C.muted }}>
                  Entra sin costo a la comunidad oficial en Telegram. Recibe análisis, selecciones
                  del día y contenido para que aprendas a jugar con estrategia, no con suerte.
                </p>

                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3.5 mb-8">
                  {[
                    "Análisis gratuitos",
                    "Selecciones del día",
                    "Contenido educativo",
                    "Gestión de banca para principiantes",
                    "Acceso vía Telegram",
                    "Comunidad organizada",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm md:text-[15px]"
                      style={{ color: C.ivory }}
                    >
                      <span className="flex-shrink-0" style={{ color: C.gold }}>
                        <IconCheck size={16} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <motion.a
                  href={TELEGRAM_FREE}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="self-start w-full sm:w-auto text-center px-8 py-4 rounded-2xl font-black text-sm md:text-base inline-flex items-center justify-center gap-2.5 tracking-wide"
                  style={{
                    background: GOLD_GRAD,
                    color: C.black,
                    fontFamily: "Poppins",
                    boxShadow: `0 12px 34px ${hexToRgba(C.gold, 0.3)}`,
                  }}
                >
                  <IconTelegram size={17} />
                  ENTRAR AL CANAL GRATUITO
                </motion.a>
              </div>

              {/* Foto: anclada abajo y más alta que su columna, así asoma
                  por encima del borde superior de la tarjeta. */}
              <div className="relative min-h-[300px] sm:min-h-[380px] md:min-h-[520px] order-1 md:order-2">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 52% 46% at 50% 46%, ${hexToRgba(C.gold, 0.22)} 0%, ${hexToRgba(C.gold, 0.07)} 42%, transparent 72%)`,
                    filter: "blur(34px)",
                  }}
                />
                <PhotoWithFallback
                  src={PHOTO_FREE.src}
                  fallback={PHOTO_FREE.fallback}
                  alt="Brayan · Canal gratuito TipsterGold"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-auto max-w-none object-contain"
                  style={{
                    height: "108%",
                    maskImage: POP_MASK,
                    WebkitMaskImage: POP_MASK,
                    maskComposite: "intersect",
                    WebkitMaskComposite: "source-in",
                    filter: `drop-shadow(0 26px 40px rgba(0,0,0,0.75)) drop-shadow(0 0 30px ${hexToRgba(C.gold, 0.18)})`,
                  }}
                />
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── MEMBRESÍA ELITE (foto brayan2) ── */}
      <section id="elite" className="sec-pad" style={{ background: C.black }}>
        <div className="wrap">
          <Section>
            <motion.div
              variants={scaleIn}
              // Sin `overflow-hidden` para que el retrato asome por arriba.
              className="rounded-3xl grid md:grid-cols-2 relative mt-8 md:mt-12"
              style={{
                background: `linear-gradient(120deg, ${hexToRgba(C.gold, 0.1)} 0%, rgba(12,11,8,0.98) 62%)`,
                border: `1px solid ${hexToRgba(C.gold, 0.4)}`,
                boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${hexToRgba(C.gold, 0.1)}`,
              }}
            >
              {/* Insignia en la esquina de la tarjeta, lejos del rostro */}
              <div
                className="absolute top-0 right-0 z-20 px-4 py-2 rounded-tr-3xl rounded-bl-2xl text-[10px] md:text-[11px] font-black tracking-[0.16em] uppercase whitespace-nowrap"
                style={{
                  background: GOLD_GRAD,
                  color: C.black,
                  fontFamily: "Poppins",
                  boxShadow: `0 8px 26px ${hexToRgba(C.gold, 0.35)}`,
                }}
              >
                Más elegido
              </div>

              {/* Foto: sobresale por encima del borde de la tarjeta */}
              <div className="relative min-h-[340px] sm:min-h-[420px] md:min-h-[580px]">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 50% 46% at 50% 46%, ${hexToRgba(C.gold, 0.24)} 0%, ${hexToRgba(C.gold, 0.08)} 42%, transparent 72%)`,
                    filter: "blur(34px)",
                  }}
                />
                <PhotoWithFallback
                  src={PHOTO_ELITE.src}
                  fallback={PHOTO_ELITE.fallback}
                  alt="Brayan · Membresía Elite TipsterGold"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-auto max-w-none object-contain"
                  style={{
                    height: "107%",
                    maskImage: POP_MASK,
                    WebkitMaskImage: POP_MASK,
                    maskComposite: "intersect",
                    WebkitMaskComposite: "source-in",
                    filter: `drop-shadow(0 26px 40px rgba(0,0,0,0.75)) drop-shadow(0 0 30px ${hexToRgba(C.gold, 0.18)})`,
                  }}
                />
              </div>

              {/* Texto */}
              <div className="p-6 md:p-12 lg:p-14 flex flex-col justify-center">
                <div
                  className="inline-block self-start px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-[0.28em] uppercase mb-4"
                  style={{
                    background: hexToRgba(C.gold, 0.1),
                    border: `1px solid ${hexToRgba(C.gold, 0.3)}`,
                    color: C.champagne,
                    fontFamily: "Inter",
                  }}
                >
                  Acceso Premium
                </div>
                <h2
                  className="fs-h2 font-black mb-4 leading-[1.05]"
                  style={{ fontFamily: "Poppins" }}
                >
                  MEMBRESÍA <span className="gradient-text">ELITE</span>
                </h2>
                <p className="fs-body mb-7" style={{ color: C.muted }}>
                  Para quienes quieren seguir mis mejores entradas, con acceso total a todos los
                  deportes, estrategias privadas y acompañamiento directo.
                </p>

                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3.5 mb-7">
                  {[
                    "Entradas exclusivas",
                    "Acceso a todos los deportes",
                    "Estrategias privadas",
                    "Gestión profesional de banca",
                    "Alertas en tiempo real",
                    "Soporte prioritario",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm md:text-[15px]"
                      style={{ color: C.ivory }}
                    >
                      <span className="flex-shrink-0" style={{ color: C.goldBright }}>
                        <IconCheck size={16} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Precio */}
                <div className="flex items-end flex-wrap gap-x-3 gap-y-1 mb-6">
                  <span
                    className="text-[11px] font-bold tracking-[0.2em] uppercase pb-2"
                    style={{ color: C.muted }}
                  >
                    Acceso por
                  </span>
                  <span
                    className="text-4xl md:text-5xl font-black gradient-text leading-none"
                    style={{ fontFamily: "Poppins" }}
                  >
                    ${ELITE_PRODUCT.price}
                  </span>
                  <span className="text-sm pb-1.5" style={{ color: C.muted }}>
                    COP
                  </span>
                </div>

                <motion.a
                  href={`${KUNFUPAY_BASE}${ELITE_PRODUCT.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto self-start text-center px-10 py-4 rounded-2xl font-black text-sm md:text-base tracking-wide"
                  style={{
                    background: GOLD_GRAD,
                    color: C.black,
                    fontFamily: "Poppins",
                    boxShadow: `0 12px 38px ${hexToRgba(C.gold, 0.35)}`,
                  }}
                >
                  ACCEDER AL ELITE
                </motion.a>

                <span
                  className="mt-4 self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase"
                  style={{
                    background: hexToRgba(C.gold, 0.1),
                    border: `1px solid ${hexToRgba(C.gold, 0.3)}`,
                    color: C.champagne,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full pulse-gold"
                    style={{ background: C.goldBright }}
                  />
                  Acceso inmediato
                </span>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── VIDEO BANNER ── */}
      <section className="relative sec-pad overflow-hidden">
        <video
          ref={bannerVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "translateZ(0)", filter: "saturate(0.5)" }}
          src="/section-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.62) 50%, rgba(8,8,8,0.94) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${hexToRgba(C.gold, 0.12)} 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 wrap text-center">
          <Section>
            <motion.div
              variants={fadeUp}
              className="text-xs font-bold tracking-[0.25em] mb-4"
              style={{ color: C.gold, fontFamily: "Inter" }}
            >
              DESDE CUALQUIER ESTADIO DEL MUNDO
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="fs-h2 font-black mb-6"
              style={{ fontFamily: "Poppins" }}
            >
              El fútbol se vive <span className="gradient-text">en cada rincón</span> del planeta
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="fs-lead mb-10"
              style={{ color: C.muted, maxWidth: "560px", margin: "0 auto" }}
            >
              Analizamos las mejores ligas del mundo para traerte predicciones con datos reales,
              estés donde estés.
            </motion.p>

            {/* Resultados comprobados, sobre el vídeo del estadio */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 max-w-5xl mx-auto">
              {[
                { end: 89, suffix: "%", label: "Precisión Histórica" },
                { end: 10000, suffix: "+", label: "Usuarios Activos" },
                { end: 2847, suffix: "", label: "Partidos Analizados/mes" },
                { end: 42, suffix: "%", label: "ROI Promedio Mensual" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={scaleIn}
                  className="card-hover rounded-2xl p-4 md:p-6 text-center backdrop-blur-md"
                  style={{
                    background: `linear-gradient(160deg, ${hexToRgba(C.gold, 0.08)} 0%, rgba(8,8,8,0.72) 55%)`,
                    border: `1px solid ${hexToRgba(C.gold, 0.22)}`,
                  }}
                >
                  <AnimatedStat end={stat.end} suffix={stat.suffix} label={stat.label} />
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── VIDEOS ── */}
      <section id="videos" className="sec-pad" style={{ background: C.black }}>
        <div className="wrap">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-8 md:mb-14">
              <h2 className="fs-h2 font-black mb-3" style={{ fontFamily: "Poppins" }}>
                Visita mi canal y haz tus{" "}
                <span className="gradient-text">propios análisis</span>
              </h2>
              <p style={{ color: C.muted }}>
                Aprende el método paso a paso con los vídeos de mi canal de YouTube
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {featuredVideos.map((v) => (
                <motion.div
                  key={v.id}
                  variants={fadeUp}
                  className="card-hover rounded-2xl overflow-hidden"
                  style={{
                    border: `1px solid ${hexToRgba(C.gold, 0.16)}`,
                    background: "rgba(15,15,15,0.95)",
                  }}
                >
                  <div className="relative aspect-video">
                    <button
                      type="button"
                      onClick={() => setPlayingVideo(v.id)}
                      className="absolute inset-0 w-full h-full group"
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                        alt={v.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.42)" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ background: GOLD_GRAD, color: C.black }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="md:w-5 md:h-5"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="p-2.5 md:p-4">
                    <p
                      className="text-xs md:text-sm font-semibold leading-snug"
                      style={{ fontFamily: "Inter", color: C.ivory }}
                    >
                      {v.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="text-center mt-10">
              <a
                href="https://www.youtube.com/@TgBrianfut"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: hexToRgba(C.gold, 0.08),
                  border: `1px solid ${hexToRgba(C.gold, 0.32)}`,
                  color: C.champagne,
                }}
              >
                Síguenos en Nuestro Canal →
              </a>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* Video modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.94)", backdropFilter: "blur(8px)" }}
            onClick={() => setPlayingVideo(null)}
          >
            <button
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full flex items-center justify-center z-10"
              style={{ background: hexToRgba(C.gold, 0.15), color: C.champagne }}
              onClick={() => setPlayingVideo(null)}
              aria-label="Cerrar video"
            >
              ✕
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${hexToRgba(C.gold, 0.3)}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full aspect-video" style={{ background: "#000" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`}
                  title={featuredVideos.find((v) => v.id === playingVideo)?.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ANALIZAR ANTES DE INVERTIR ── */}
      <section id="analisis" className="sec-pad" style={{ background: C.panel }}>
        <div className="wrap">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-8 md:mb-14 max-w-3xl mx-auto">
              <div
                className="text-xs font-bold tracking-[0.25em] mb-3"
                style={{ color: C.gold, fontFamily: "Inter" }}
              >
                MÉTODO, NO SUERTE
              </div>
              <h2 className="fs-h2 font-black mb-4" style={{ fontFamily: "Poppins" }}>
                La importancia de <span className="gradient-text">analizar antes de invertir</span>
              </h2>
              <p className="fs-body" style={{ color: C.muted }}>
                Nadie gana a largo plazo adivinando. Detrás de cada entrada hay horas de estudio,
                números y disciplina. Esto es lo que hago antes de poner un solo peso.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {analysisSteps.map((step, i) => (
                <motion.article
                  key={step.title}
                  variants={fadeUp}
                  className="card-hover rounded-2xl overflow-hidden flex flex-col"
                  style={{
                    background: "rgba(10,10,10,0.94)",
                    border: `1px solid ${hexToRgba(C.gold, 0.16)}`,
                  }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={step.img}
                      alt={step.alt}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectPosition: step.pos }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.25) 55%, transparent 100%)",
                      }}
                    />
                    <span
                      className="absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                      style={{
                        background: "rgba(8,8,8,0.72)",
                        border: `1px solid ${hexToRgba(C.gold, 0.4)}`,
                        color: C.goldBright,
                        fontFamily: "Poppins",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3
                      className="fs-h3 font-bold mb-2"
                      style={{ fontFamily: "Poppins", color: C.ivory }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                      {step.text}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.p
              variants={fadeUp}
              className="text-center fs-body mt-8 max-w-2xl mx-auto"
              style={{ color: C.champagne }}
            >
              Por eso aquí no se venden corazonadas: se enseña un método para que aprendas a
              decidir por ti mismo.
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── RESULTS ── */}
      <section id="resultados" className="sec-pad" style={{ background: C.panel }}>
        <div className="wrap">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-8 md:mb-14">
              <h2 className="fs-h2 font-black mb-3" style={{ fontFamily: "Poppins" }}>
                <span className="gradient-text">Resultados</span> Verificados
              </h2>
              <p style={{ color: C.muted }}>Comprobantes reales de ganancias de nuestra comunidad</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((r, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="card-hover rounded-2xl overflow-hidden cursor-pointer"
                  style={{ border: `1px solid ${hexToRgba(C.gold, 0.18)}` }}
                  onClick={() => setSelectedResult(r)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="relative h-56 overflow-hidden flex items-center justify-center"
                    style={{ background: "#f2f2f2" }}
                  >
                    <img
                      src={r.img}
                      alt={r.desc}
                      className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                    />
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-black"
                      style={{ background: GOLD_GRAD, color: C.black, fontFamily: "Poppins" }}
                    >
                      {r.amount}
                    </div>
                  </div>
                  <div className="p-4" style={{ background: "rgba(10,10,10,0.96)" }}>
                    <p className="text-xs mb-1" style={{ color: C.gold }}>
                      {r.date}
                    </p>
                    <p className="text-sm font-medium" style={{ color: C.ivory }}>
                      {r.desc}
                    </p>
                    <p className="text-xs mt-2 flex items-center gap-1" style={{ color: C.dim }}>
                      <span>👆</span> Click para ver detalle
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* Result modal */}
      <AnimatePresence>
        {selectedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
            onClick={() => setSelectedResult(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-2xl w-full rounded-3xl overflow-hidden"
              style={{ background: C.panel, border: `1px solid ${hexToRgba(C.gold, 0.35)}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-full h-80 flex items-center justify-center"
                style={{ background: "#f2f2f2" }}
              >
                <img
                  src={selectedResult.img}
                  alt={selectedResult.desc}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.65)", color: C.champagne }}
                onClick={() => setSelectedResult(null)}
              >
                ✕
              </button>
              <div className="p-6">
                <div
                  className="inline-block px-4 py-2 rounded-full text-lg font-black mb-3"
                  style={{
                    background: hexToRgba(C.gold, 0.14),
                    color: C.goldBright,
                    fontFamily: "Poppins",
                  }}
                >
                  {selectedResult.amount}
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "Poppins" }}>
                  {selectedResult.desc}
                </h3>
                <p className="text-sm" style={{ color: C.muted }}>
                  Resultado verificado · {selectedResult.date}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GRUPOS: VIP Y ÉLITE ── */}
      <section id="grupos" className="sec-pad relative overflow-hidden" style={{ background: C.black }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 52% 46% at 50% 40%, ${hexToRgba(C.gold, 0.1)} 0%, ${hexToRgba(C.gold, 0.04)} 38%, transparent 72%)`,
          }}
        />

        <div className="relative z-10 wrap">
          <Section>
            {/* Foto de Brayan presidiendo la elección (la misma del hero) */}
            <motion.div variants={scaleIn} className="relative flex justify-center mb-2">
              <img
                src={PHOTO_HERO}
                alt="Brayan · TipsterGold"
                className="relative w-[190px] sm:w-[230px] md:w-[280px] object-contain"
                style={{
                  maskImage:
                    "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%), linear-gradient(to bottom, #000 0%, #000 66%, transparent 99%)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%), linear-gradient(to bottom, #000 0%, #000 66%, transparent 99%)",
                  maskComposite: "intersect",
                  WebkitMaskComposite: "source-in",
                  filter: `drop-shadow(0 20px 46px rgba(0,0,0,0.8)) drop-shadow(0 0 28px ${hexToRgba(C.gold, 0.16)})`,
                }}
              />
            </motion.div>

            <motion.div variants={fadeUp} className="text-center mb-8 md:mb-12">
              <h2 className="fs-h2 font-black mb-3" style={{ fontFamily: "Poppins" }}>
                ¿LISTO PARA <span className="gradient-text">FORMAR PARTE?</span>
              </h2>
              <p className="fs-body" style={{ color: C.muted }}>
                Elige por dónde empezar. Puedes cambiar de plan cuando quieras.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {groupPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={fadeUp}
                  className="rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden"
                  style={{
                    background: plan.featured
                      ? `linear-gradient(160deg, ${hexToRgba(C.gold, 0.13)} 0%, rgba(10,10,10,0.97) 58%)`
                      : "rgba(13,13,13,0.94)",
                    border: `1px solid ${hexToRgba(C.gold, plan.featured ? 0.45 : 0.16)}`,
                    boxShadow: plan.featured ? `0 0 46px ${hexToRgba(C.gold, 0.14)}` : "none",
                  }}
                >
                  {plan.featured && (
                    <div
                      className="absolute top-0 right-0 px-3.5 py-1.5 text-[10px] font-black tracking-[0.16em] uppercase rounded-bl-2xl"
                      style={{ background: GOLD_GRAD, color: C.black, fontFamily: "Poppins" }}
                    >
                      Más elegido
                    </div>
                  )}

                  <h3
                    className="text-2xl font-black mb-2 pr-24"
                    style={{ fontFamily: "Poppins", color: plan.featured ? undefined : C.ivory }}
                  >
                    {plan.featured ? <span className="gradient-text">{plan.name}</span> : plan.name}
                  </h3>
                  <p className="fs-body mb-6" style={{ color: C.muted }}>
                    {plan.desc}
                  </p>

                  <ul className="space-y-3 mb-7">
                    {plan.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm" style={{ color: C.ivory }}>
                        <span
                          className="mt-0.5 flex-shrink-0"
                          style={{ color: plan.featured ? C.goldBright : C.gold }}
                        >
                          <IconCheck size={15} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <div className="flex items-end gap-2 mb-4">
                      <span
                        className="text-3xl font-black gradient-text leading-none"
                        style={{ fontFamily: "Poppins" }}
                      >
                        ${plan.price}
                      </span>
                      <span className="text-xs pb-1" style={{ color: C.muted }}>
                        COP
                      </span>
                    </div>
                    <motion.a
                      href={`${KUNFUPAY_BASE}${plan.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="block w-full text-center py-3.5 rounded-xl font-black text-sm tracking-wide"
                      style={{
                        background: plan.featured ? GOLD_GRAD : "transparent",
                        color: plan.featured ? C.black : C.goldBright,
                        border: plan.featured ? "none" : `1px solid ${hexToRgba(C.gold, 0.4)}`,
                        fontFamily: "Poppins",
                        boxShadow: plan.featured ? `0 10px 30px ${hexToRgba(C.gold, 0.28)}` : "none",
                      }}
                    >
                      {plan.cta}
                    </motion.a>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p variants={fadeUp} className="text-center text-xs mt-8" style={{ color: C.dim }}>
              Pagos procesados de forma segura por KunFuPay · Sin permanencia
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        id="testimonios"
        className="sec-pad overflow-hidden"
        style={{ background: C.panel }}
      >
        <div className="wrap mb-10">
          <Section>
            <motion.div variants={fadeUp} className="text-center">
              <h2 className="fs-h2 font-black mb-3" style={{ fontFamily: "Poppins" }}>
                Lo que Dice Nuestra <span className="gradient-text">Comunidad</span>
              </h2>
              <p style={{ color: C.muted }}>
                Más de 10.000 personas ya transformaron su forma de jugar
              </p>
            </motion.div>
          </Section>
        </div>

        {/* Testimonials infinite scroll */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-5 scroll-left cursor-pointer"
            style={{
              width: "max-content",
              animationPlayState: testimonialsPaused ? "paused" : "running",
            }}
            onClick={() => setTestimonialsPaused((p) => !p)}
            title={testimonialsPaused ? "Toca para reanudar" : "Toca para pausar"}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="flex-shrink-0 rounded-2xl p-6"
                style={{
                  width: "320px",
                  background: `linear-gradient(160deg, ${hexToRgba(C.gold, 0.05)} 0%, rgba(10,10,10,0.96) 50%)`,
                  border: `1px solid ${hexToRgba(C.gold, 0.16)}`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: hexToRgba(C.gold, 0.13),
                      color: C.goldBright,
                      border: `1px solid ${hexToRgba(C.gold, 0.28)}`,
                      fontFamily: "Poppins",
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ fontFamily: "Poppins", color: C.ivory }}>
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: C.muted }}>
                      {t.city}
                    </p>
                  </div>
                </div>
                <div className="text-sm mb-3" style={{ color: C.gold, letterSpacing: "2px" }}>
                  {"★".repeat(t.rating)}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                  "{t.comment}"
                </p>
                <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: C.win }}>
                  <IconCheck size={12} />
                  {t.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS ── */}
      <section id="planes" className="sec-pad" style={{ background: C.panel }}>
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-8 md:mb-14">
              <h2 className="fs-h2 font-black mb-3" style={{ fontFamily: "Poppins" }}>
                Otros <span className="gradient-text">Servicios</span>
              </h2>
              <p style={{ color: C.muted }}>
                Canales por deporte, aparte de los grupos VIP y Élite. Pago seguro, acceso
                inmediato.
              </p>
            </motion.div>

            <div className="space-y-4">
              {otherServices.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                  className="card-hover rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                  style={{
                    background: product.highlight
                      ? `linear-gradient(135deg, ${hexToRgba(C.gold, 0.14)} 0%, rgba(10,10,10,0.97) 60%)`
                      : "rgba(10,10,10,0.94)",
                    border: product.highlight
                      ? `1px solid ${hexToRgba(C.gold, 0.5)}`
                      : `1px solid ${hexToRgba(C.gold, 0.14)}`,
                    boxShadow: product.highlight
                      ? `0 0 40px ${hexToRgba(C.gold, 0.12)}`
                      : "none",
                  }}
                >
                  {product.highlight && (
                    <div
                      className="absolute top-0 right-0 px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-bl-xl"
                      style={{ background: GOLD_GRAD, color: C.black, fontFamily: "Poppins" }}
                    >
                      Más elegido
                    </div>
                  )}
                  <div>
                    <h3
                      className="fs-lead font-bold mb-1 pr-24 sm:pr-0"
                      style={{
                        fontFamily: "Poppins",
                        color: product.highlight ? C.goldBright : C.ivory,
                      }}
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs md:text-sm mb-2" style={{ color: C.muted }}>
                      {product.desc}
                    </p>
                    <p className="text-lg font-black" style={{ fontFamily: "Poppins", color: C.ivory }}>
                      ${product.price}{" "}
                      <span className="text-xs font-normal" style={{ color: C.muted }}>
                        COP
                      </span>
                    </p>
                  </div>
                  <motion.a
                    href={`${KUNFUPAY_BASE}${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="shrink-0 text-center px-6 py-3 rounded-xl font-bold text-sm transition-all"
                    style={{
                      background: product.highlight ? GOLD_GRAD : "transparent",
                      color: product.highlight ? C.black : C.goldBright,
                      border: product.highlight ? "none" : `1px solid ${hexToRgba(C.gold, 0.4)}`,
                      fontFamily: "Poppins",
                      boxShadow: product.highlight ? `0 0 22px ${hexToRgba(C.gold, 0.3)}` : "none",
                    }}
                  >
                    Ver Producto
                  </motion.a>
                </motion.div>
              ))}
            </div>

            <motion.p variants={fadeUp} className="text-center text-xs mt-8" style={{ color: C.dim }}>
              Pagos procesados de forma segura por KunFuPay
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="sec-pad"
        style={{ background: C.panel, borderTop: `1px solid ${hexToRgba(C.gold, 0.16)}` }}
      >
        <div className="wrap">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/logo.png"
                  alt="TipsterGold"
                  className="w-[52px] h-[52px] rounded-xl object-cover"
                  style={{ boxShadow: `0 0 0 1px ${hexToRgba(C.gold, 0.25)}` }}
                />
                <BrandName className="text-lg font-bold" />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: C.muted, maxWidth: "200px" }}>
                La plataforma de análisis deportivo más confiable para maximizar tus oportunidades.
              </p>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="text-sm font-bold mb-4" style={{ fontFamily: "Poppins", color: C.ivory }}>
                Empresa
              </h4>
              <ul className="space-y-2">
                {["Sobre Nosotros", "Blog", "Carreras", "Prensa"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm transition-colors"
                      style={{ color: C.muted }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = C.goldBright)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold mb-4" style={{ fontFamily: "Poppins", color: C.ivory }}>
                Legal
              </h4>
              <ul className="space-y-2">
                {legalDocs.map((doc) => (
                  <li key={doc.key}>
                    <button
                      type="button"
                      onClick={() => setLegalDoc(doc)}
                      className="text-sm text-left transition-colors"
                      style={{ color: C.muted }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = C.goldBright)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                    >
                      {doc.menu}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact + Social */}
            <div>
              <h4 className="text-sm font-bold mb-4" style={{ fontFamily: "Poppins", color: C.ivory }}>
                Contacto
              </h4>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">
                  <a
                    href="mailto:tipstergold@outlook.com"
                    style={{ color: C.muted }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.goldBright)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                  >
                    tipstergold@outlook.com
                  </a>
                </li>
                <li className="text-sm" style={{ color: C.muted }}>
                  Lun–Vie 9:00–20:00
                </li>
              </ul>

              <a
                href={TELEGRAM_CONTACT}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-6 transition-all"
                style={{
                  background: hexToRgba(C.gold, 0.08),
                  border: `1px solid ${hexToRgba(C.gold, 0.32)}`,
                  color: C.champagne,
                }}
              >
                <IconTelegram size={14} />
                Contáctanos por Telegram
              </a>

              <h4 className="text-sm font-bold mb-3" style={{ fontFamily: "Poppins", color: C.ivory }}>
                Redes Sociales
              </h4>
              <div className="flex gap-3">
                {[
                  {
                    href: "https://www.instagram.com/tgbrianfut_/",
                    label: "Instagram",
                    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                  },
                  {
                    href: "https://www.tiktok.com/@elprofetg",
                    label: "TikTok",
                    path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.78a4.85 4.85 0 01-1.07-.09z",
                  },
                  {
                    href: "https://www.youtube.com/@TgBrianfut",
                    label: "YouTube",
                    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: hexToRgba(C.gold, 0.05),
                      border: `1px solid ${hexToRgba(C.gold, 0.16)}`,
                      color: C.muted,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = hexToRgba(C.gold, 0.16);
                      e.currentTarget.style.borderColor = hexToRgba(C.gold, 0.45);
                      e.currentTarget.style.color = C.goldBright;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = hexToRgba(C.gold, 0.05);
                      e.currentTarget.style.borderColor = hexToRgba(C.gold, 0.16);
                      e.currentTarget.style.color = C.muted;
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Aviso legal: replegado tras el sello +18, se abre al pulsarlo */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setAvisoAbierto((v) => !v)}
              aria-expanded={avisoAbierto}
              aria-controls="aviso-legal"
              className="flex items-center gap-2.5 rounded-full pl-1.5 pr-4 py-1.5 transition-all"
              style={{
                background: hexToRgba(C.gold, avisoAbierto ? 0.12 : 0.05),
                border: `1px solid ${hexToRgba(C.gold, avisoAbierto ? 0.45 : 0.22)}`,
              }}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black"
                style={{
                  background: hexToRgba(C.gold, 0.16),
                  border: `1px solid ${hexToRgba(C.gold, 0.45)}`,
                  color: C.goldBright,
                  fontFamily: "Poppins",
                }}
              >
                +18
              </span>
              <span
                className="text-[11px] font-bold tracking-[0.14em] uppercase"
                style={{ color: avisoAbierto ? C.champagne : C.muted, fontFamily: "Inter" }}
              >
                Aviso importante
              </span>
              <motion.span
                animate={{ rotate: avisoAbierto ? 180 : 0 }}
                transition={{ duration: 0.28, ease: easeOut }}
                style={{ color: C.gold, lineHeight: 0 }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {avisoAbierto && (
                <motion.div
                  id="aviso-legal"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: easeOut }}
                  className="overflow-hidden w-full"
                >
                  <div
                    className="mt-4 rounded-2xl px-5 py-4 md:px-6 md:py-5"
                    style={{
                      background: hexToRgba(C.gold, 0.05),
                      border: `1px solid ${hexToRgba(C.gold, 0.18)}`,
                    }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
                      TipsterGold es un servicio de información y análisis deportivo: no es una
                      casa de apuestas, no acepta apuestas ni administra dinero de terceros. El
                      contenido tiene fines informativos y educativos y no constituye asesoría
                      financiera.{" "}
                      <strong style={{ color: C.champagne }}>No se garantizan ganancias</strong> y
                      los resultados pasados no garantizan resultados futuros; cada decisión de
                      apuesta es responsabilidad exclusiva del usuario. Actividad reservada a
                      mayores de 18 años. Las apuestas conllevan riesgo económico y pueden generar
                      adicción: apuesta solo lo que puedas permitirte perder y, si deja de ser un
                      entretenimiento, busca ayuda profesional.{" "}
                      <button
                        type="button"
                        onClick={() => setLegalDoc(legalDocs[0])}
                        className="underline underline-offset-2"
                        style={{ color: C.gold }}
                      >
                        Leer el aviso legal completo
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom bar */}
          <div
            className="mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: `1px solid ${hexToRgba(C.gold, 0.12)}` }}
          >
            <p className="text-xs" style={{ color: C.dim }}>
              © 2026 TipsterGold. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full pulse-gold" style={{ background: C.gold }} />
              <span className="text-xs" style={{ color: C.gold }}>
                Plataforma activa
              </span>
            </div>
          </div>

          <div className="pt-6 text-center">
            <a
              href="https://www.codecstudio.online/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-colors"
              style={{ color: C.dim }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.goldBright)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.dim)}
            >
              Desarrollado por CODE STUDIO
            </a>
          </div>
        </div>
      </footer>

      {/* ── VENTANA LEGAL ── */}
      <AnimatePresence>
        {legalDoc && <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />}
      </AnimatePresence>

      {/* ── FLOATING CONTACT BALL ── */}
      <motion.a
        href={TELEGRAM_CONTACT}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contáctanos por Telegram"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: "spring" }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        className="fixed z-50 bottom-4 right-4 md:bottom-5 md:right-5 w-14 h-14 md:w-16 md:h-16 rounded-full float-animation"
      >
        <img
          src="/balon.png"
          alt="Contacto"
          className="w-full h-full rounded-full object-cover"
          style={{
            boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 0 3px ${hexToRgba(C.gold, 0.35)}, 0 0 30px ${hexToRgba(C.gold, 0.32)}`,
          }}
        />
      </motion.a>

      {/* ── MUSIC PLAYER ── */}
      <audio ref={audioRef} src={musicTracks[trackIndex].src} onEnded={onTrackEnded} preload="auto" />
      {/* Móvil: solo un disco que enciende y apaga la música, abajo a la izquierda */}
      <motion.button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Apagar música" : "Encender música"}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: "spring" }}
        whileTap={{ scale: 0.9 }}
        className="sm:hidden fixed z-50 bottom-4 left-4 w-11 h-11 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(15,15,15,0.92)",
          border: `1px solid ${hexToRgba(C.gold, isPlaying ? 0.55 : 0.28)}`,
          boxShadow: `0 6px 18px rgba(0,0,0,0.6)${
            isPlaying ? `, 0 0 18px ${hexToRgba(C.gold, 0.28)}` : ""
          }`,
        }}
      >
        {/* Disco de vinilo: gira mientras suena */}
        <span
          className={`relative w-7 h-7 rounded-full flex items-center justify-center ${
            isPlaying ? "spin-ball" : ""
          }`}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${hexToRgba(C.gold, 0.22)} 0 34%, rgba(8,8,8,0.9) 35% 100%)`,
            border: `1px solid ${hexToRgba(C.gold, 0.45)}`,
            opacity: isPlaying ? 1 : 0.55,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: C.gold }}>
            <path d="M9 18V6l10-2v12" opacity="0" />
            <path d="M20 3v12.5a3.5 3.5 0 1 1-2-3.16V7.2L10 8.9v8.6a3.5 3.5 0 1 1-2-3.16V6.2L20 3z" />
          </svg>
        </span>
      </motion.button>

      {/* Escritorio: reproductor completo y arrastrable.
          La capa delimita hasta dónde se puede mover. */}
      <div
        ref={playerBoundsRef}
        className="hidden sm:flex fixed inset-0 z-50 pointer-events-none items-end justify-center pb-4 md:pb-5"
      >
      <motion.div
        drag
        dragConstraints={playerBoundsRef}
        dragMomentum={false}
        dragElastic={0}
        whileDrag={{ scale: 1.06, cursor: "grabbing" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="pointer-events-auto flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full touch-none"
        style={{
          background: "rgba(15,15,15,0.9)",
          border: `1px solid ${hexToRgba(C.gold, 0.28)}`,
          backdropFilter: "blur(12px)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
          cursor: "grab",
        }}
        title={`${musicTracks[trackIndex].title} · arrástrame`}
      >
        {/* Asa de arrastre */}
        <span
          className="flex flex-col gap-[3px] px-1 flex-shrink-0"
          aria-hidden="true"
          style={{ opacity: 0.55 }}
        >
          <span className="block w-[9px] h-[1.5px] rounded-full" style={{ background: C.gold }} />
          <span className="block w-[9px] h-[1.5px] rounded-full" style={{ background: C.gold }} />
          <span className="block w-[9px] h-[1.5px] rounded-full" style={{ background: C.gold }} />
        </span>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: GOLD_GRAD, color: C.black }}
        >
          {isPlaying ? (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="4" width="5" height="16" rx="1" />
              <rect x="14" y="4" width="5" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4l14 8-14 8V4z" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => changeVolume(parseFloat(e.target.value))}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Volumen"
          className="w-10 md:w-12 h-1"
          style={{ accentColor: C.gold }}
        />

        <button
          type="button"
          onClick={switchTrack}
          aria-label="Cambiar canción"
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: hexToRgba(C.gold, 0.12), color: C.champagne }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 5v14l9-7-9-7zM15 5v14l9-7-9-7z" />
          </svg>
        </button>
      </motion.div>
      </div>
    </div>
  );
}
