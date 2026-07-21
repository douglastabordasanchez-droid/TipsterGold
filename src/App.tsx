import { useState, useEffect, useRef, type FormEvent } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

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
      <div className="text-3xl md:text-4xl font-extrabold" style={{ fontFamily: "Poppins, sans-serif", color: "#00ff66" }}>
        {prefix}
        {display}
        {suffix}
      </div>
      <div className="text-sm mt-1" style={{ color: "#b3b3b3" }}>
        {label}
      </div>
    </motion.div>
  );
}

// ─── Benefit icons ──────────────────────────────────────────────────────────
type IconProps = { size?: number };
const iconBase = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function IconTarget({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconBase}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconCpu({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconBase}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M19.5 4.5l-2 2M6.5 17.5l-2 2" />
    </svg>
  );
}
function IconShield({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconBase}>
      <path d="M12 3l7 3v5.5c0 4.5-3 7.7-7 9.5-4-1.8-7-5-7-9.5V6l7-3z" />
      <path d="M9 12l2 2 4-4.5" />
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
function IconBolt({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconBase}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}
function IconBell({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconBase}>
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const monthlyData = [
  { mes: "Ene", roi: 12, precision: 68 },
  { mes: "Feb", roi: 18, precision: 71 },
  { mes: "Mar", roi: 15, precision: 74 },
  { mes: "Abr", roi: 22, precision: 78 },
  { mes: "May", roi: 28, precision: 82 },
  { mes: "Jun", roi: 24, precision: 80 },
  { mes: "Jul", roi: 31, precision: 85 },
  { mes: "Ago", roi: 35, precision: 87 },
  { mes: "Sep", roi: 29, precision: 83 },
  { mes: "Oct", roi: 38, precision: 89 },
  { mes: "Nov", roi: 42, precision: 91 },
  { mes: "Dic", roi: 45, precision: 93 },
];

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

const musicTracks = [
  { src: "/track-uefa-anthem.mp3", title: "UEFA Champions League Anthem" },
  { src: "/track-mix-mundial.mp3", title: "Mix Mundial Fútbol 2022" },
];

const featuredVideos = [
  {
    id: "FcNq4P1Ywjs",
    title: "Cómo ganar apuestas aplicando stake",
  },
  {
    id: "2c0K4QLyYxg",
    title: "Cómo emprender e invertir",
  },
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

const benefits = [
  {
    icon: IconTarget,
    accent: "#00ff66",
    title: "Predicciones Exclusivas",
    desc: "Accede a análisis diarios de más de 20 ligas globales con probabilidades calculadas por nuestros expertos.",
  },
  {
    icon: IconCpu,
    accent: "#22d3ee",
    title: "Inteligencia Artificial",
    desc: "Algoritmos entrenados con más de 2M partidos analizados para detectar valor real en cada mercado.",
  },
  {
    icon: IconShield,
    accent: "#fbbf24",
    title: "Gestión de Riesgo",
    desc: "Sistema de bankroll profesional. Protege tu capital y escala gradualmente tus ganancias.",
  },
  {
    icon: IconChartBar,
    accent: "#60a5fa",
    title: "Estadísticas Avanzadas",
    desc: "Dashboards en tiempo real con datos de rendimiento, historial y tendencias actualizadas al minuto.",
  },
  {
    icon: IconBolt,
    accent: "#fb923c",
    title: "Combinadas Estratégicas",
    desc: "Selecciones pre-armadas con cuotas aumentadas y control de riesgo para maximizar el retorno.",
  },
  {
    icon: IconBell,
    accent: "#c084fc",
    title: "Alertas en Tiempo Real",
    desc: "Notificaciones instantáneas por Telegram y email cuando aparecen oportunidades con valor.",
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

const navLinks = ["Inicio", "Beneficios", "Resultados", "Estadísticas", "Testimonios", "Productos"];
const sectionIds = ["hero", "beneficios", "resultados", "estadisticas", "testimonios", "planes"];

// ─── Demo access gate ───────────────────────────────────────────────────────
// Set to false to remove the password gate once the client purchases the site.
const DEMO_LOCK_ENABLED = true;
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
      style={{ background: "#0a0a0a" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 40%, rgba(0,255,102,0.1) 0%, transparent 60%)",
        }}
      />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm rounded-3xl p-8 text-center"
        style={{
          background: "rgba(17,17,17,0.9)",
          border: "1px solid rgba(0,255,102,0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <img src="/logo.png" alt="TipsterGold" className="w-16 h-16 mx-auto mb-4 object-contain" />
        <h1 className="text-lg font-black mb-2" style={{ fontFamily: "Poppins" }}>
          Tipster<span style={{ color: "#00ff66" }}>Gold</span>
        </h1>
        <p className="text-xs mb-6" style={{ color: "#b3b3b3" }}>
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
            border: error ? "1px solid #ff4d4d" : "1px solid rgba(255,255,255,0.12)",
            color: "#ffffff",
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
          style={{ background: "#00ff66", color: "#0a0a0a", fontFamily: "Poppins" }}
        >
          Desbloquear
        </button>
      </motion.form>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [unlocked, setUnlocked] = useState(() => !DEMO_LOCK_ENABLED);

  if (DEMO_LOCK_ENABLED && !unlocked) {
    return <DemoGate onUnlock={() => setUnlocked(true)} />;
  }

  return <SiteContent />;
}

// ─── SITE CONTENT (only mounted once unlocked) ─────────────────────────────
function SiteContent() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedResult, setSelectedResult] = useState<(typeof results)[0] | null>(null);
  const [activeTab, setActiveTab] = useState<"roi" | "precision">("roi");
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [testimonialsPaused, setTestimonialsPaused] = useState(false);

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
    setLightboxIndex((i) => (i === null ? null : (i - 1 + professionalGallery.length) % professionalGallery.length));

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
      if (wantsPlayingRef.current && a.paused) a.play().catch(() => {});
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
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
    <div style={{ background: "#0a0a0a", minHeight: "100vh", overflowX: "hidden" }}>
      {/* ── HEADER ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.05)" : "none",
          transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => scrollTo("hero")}
          >
            <img src="/logo.png" alt="TipsterGold" className="w-[52px] h-[52px] rounded-lg object-cover" />
            <span className="text-lg font-bold hidden sm:block" style={{ fontFamily: "Poppins" }}>
              Tipster<span style={{ color: "#00ff66" }}>Gold</span>
            </span>
          </motion.div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <button
                key={link}
                onClick={() => scrollTo(sectionIds[i])}
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: "#b3b3b3", fontFamily: "Inter" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff66")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#b3b3b3")}
              >
                {link}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollTo("planes")}
              className="hidden sm:block px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: "#00ff66",
                color: "#0a0a0a",
                fontFamily: "Poppins",
                boxShadow: "0 0 20px rgba(0,255,102,0.3)",
              }}
            >
              Únete Ahora
            </motion.button>
            {/* Hamburger */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenu(!mobileMenu)}
              style={{ color: "#ffffff" }}
            >
              <div className="space-y-1.5">
                <span
                  className="block w-6 h-0.5 transition-all"
                  style={{ background: "#ffffff", transform: mobileMenu ? "rotate(45deg) translate(4px,4px)" : "" }}
                />
                <span
                  className="block w-6 h-0.5 transition-all"
                  style={{ background: "#ffffff", opacity: mobileMenu ? 0 : 1 }}
                />
                <span
                  className="block w-6 h-0.5 transition-all"
                  style={{ background: "#ffffff", transform: mobileMenu ? "rotate(-45deg) translate(4px,-4px)" : "" }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
              style={{ background: "rgba(10,10,10,0.98)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link, i) => (
                  <button
                    key={link}
                    onClick={() => scrollTo(sectionIds[i])}
                    className="text-left text-base font-medium py-2"
                    style={{ color: "#ffffff", fontFamily: "Inter" }}
                  >
                    {link}
                  </button>
                ))}
                <button
                  onClick={() => scrollTo("planes")}
                  className="mt-2 py-3 rounded-xl font-bold text-base"
                  style={{ background: "#00ff66", color: "#0a0a0a", fontFamily: "Poppins" }}
                >
                  Únete Ahora
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ paddingTop: "80px" }}
      >
        {/* Background stadium video */}
        <video
          ref={heroVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "translateZ(0)" }}
          src="/hero-stadium.mp4"
          poster="https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1600&h=900&fit=crop&auto=format"
          autoPlay
          muted
          loop
          playsInline
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.8) 100%)",
          }}
        />
        {/* Green accent light */}
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,255,102,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6"
              style={{ fontFamily: "Poppins" }}
            >
              Aprende a{" "}
              <span className="gradient-text">Ganar</span>{" "}
              con Estrategias Deportivas Basadas en{" "}
              <span style={{ color: "#00ff66" }}>Datos</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-base md:text-lg leading-relaxed mb-8"
              style={{ color: "#b3b3b3", fontFamily: "Inter", maxWidth: "520px" }}
            >
              Análisis profesionales, estadísticas verificadas, gestión de riesgo y
              estrategias diseñadas para maximizar tus oportunidades.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollTo("planes")}
                className="px-8 py-4 rounded-2xl text-base font-bold"
                style={{
                  background: "#00ff66",
                  color: "#0a0a0a",
                  fontFamily: "Poppins",
                  boxShadow: "0 0 30px rgba(0,255,102,0.4), 0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                Comenzar Ahora →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, borderColor: "#00ff66", color: "#00ff66" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollTo("resultados")}
                className="px-8 py-4 rounded-2xl text-base font-semibold transition-all"
                style={{
                  background: "transparent",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontFamily: "Poppins",
                }}
              >
                Ver Resultados
              </motion.button>
              <motion.a
                href="https://t.me/Tgfutboltips"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2"
                style={{
                  background: "#229ED9",
                  color: "#ffffff",
                  fontFamily: "Poppins",
                  boxShadow: "0 0 30px rgba(34,158,217,0.4), 0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.12.56l.4-5.63 10.24-9.26c.44-.4-.1-.62-.68-.22L7.62 13.67l-5.44-1.7c-1.18-.37-1.2-1.18.26-1.75L22.4 2.09c.99-.36 1.85.24 1.51 1.7z" />
                </svg>
                Únete Gratis
              </motion.a>
            </motion.div>

            {/* Social proof row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex items-center gap-4"
            >
              <div className="flex -space-x-3">
                {[
                  "photo-1507003211169-0a1dd7228f2d",
                  "photo-1494790108377-be9c29b29330",
                  "photo-1500648767791-00dcc994a43e",
                  "photo-1472099645785-5658abf4ff4e",
                ].map((id, i) => (
                  <img
                    key={i}
                    src={`https://images.unsplash.com/${id}?w=40&h=40&fit=crop&auto=format`}
                    alt="member"
                    className="w-9 h-9 rounded-full border-2"
                    style={{ borderColor: "#0a0a0a" }}
                  />
                ))}
              </div>
              <div>
                <div className="flex" style={{ color: "#00ff66" }}>
                  {"★★★★★"}
                </div>
                <p className="text-xs" style={{ color: "#b3b3b3" }}>
                  +10.000 usuarios satisfechos
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right – Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="hidden md:block float-animation"
          >
            <div
              className="rounded-3xl p-6 relative"
              style={{
                background: "rgba(17,17,17,0.8)",
                border: "1px solid rgba(0,255,102,0.2)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,255,102,0.1)",
              }}
            >
              {/* Mock header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold" style={{ color: "#00ff66", fontFamily: "Inter" }}>
                  Dashboard · Live
                </span>
                <span
                  className="w-2 h-2 rounded-full pulse-green"
                  style={{ background: "#00ff66", display: "inline-block" }}
                />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Precisión", value: "89.3%", up: true },
                  { label: "ROI Mes", value: "+42%", up: true },
                  { label: "Predicciones", value: "2,847", up: true },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="text-xs mb-1" style={{ color: "#b3b3b3" }}>
                      {s.label}
                    </div>
                    <div className="text-lg font-bold" style={{ fontFamily: "Poppins", color: "#00ff66" }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini chart */}
              <div className="mb-4 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs mb-2" style={{ color: "#b3b3b3" }}>
                  Rendimiento semanal
                </p>
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={monthlyData.slice(-7)}>
                    <defs>
                      <linearGradient id="miniGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff66" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00ff66" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="roi"
                      stroke="#00ff66"
                      strokeWidth={2}
                      fill="url(#miniGreen)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Predictions list */}
              {[
                { match: "Real Madrid vs Bayern", tip: "Ambos marcan", odd: "2.10", status: "WIN" },
                { match: "Man City vs PSG", tip: "+2.5 goles", odd: "1.85", status: "WIN" },
                { match: "Inter vs Barcelona", tip: "Inter gana", odd: "2.40", status: "LIVE" },
              ].map((p) => (
                <div
                  key={p.match}
                  className="flex items-center justify-between py-2 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <div>
                    <p className="text-xs font-medium" style={{ fontFamily: "Inter", color: "#fff" }}>
                      {p.match}
                    </p>
                    <p className="text-xs" style={{ color: "#b3b3b3" }}>
                      {p.tip}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#00ff66" }}>
                      {p.odd}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background:
                          p.status === "WIN"
                            ? "rgba(0,255,102,0.15)"
                            : "rgba(255,165,0,0.15)",
                        color: p.status === "WIN" ? "#00ff66" : "#ffa500",
                      }}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PROFESSIONAL GALLERY ── */}
      <section className="py-12 md:py-24 overflow-hidden" style={{ background: "#0a0a0a" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-10">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-2">
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ fontFamily: "Poppins" }}>
                Cumpliendo Sueños, <span style={{ color: "#00ff66" }}>Ayudándote a Ti</span>
              </h2>
              <p className="text-base" style={{ color: "#b3b3b3" }}>
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
              >
                <img
                  src={photo.img}
                  alt={photo.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)" }}
                />
                <div
                  className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,255,102,0.9)", color: "#0a0a0a" }}
                >
                  🔍
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-sm font-bold" style={{ fontFamily: "Poppins" }}>
                    {photo.caption}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Edge fades */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-28"
            style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-28"
            style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }}
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
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full flex items-center justify-center text-white z-10"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onClick={closeLightbox}
            >
              ✕
            </button>

            <button
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl z-10"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
            >
              ‹
            </button>
            <button
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl z-10"
              style={{ background: "rgba(255,255,255,0.1)" }}
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
                style={{ background: "#111111", border: "1px solid rgba(0,255,102,0.25)" }}
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
                  <span className="text-xs" style={{ color: "#b3b3b3" }}>
                    {lightboxIndex + 1} / {professionalGallery.length}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TRUST / STATS ── */}
      <section
        className="py-12 md:py-24"
        style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #111111 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-8 md:mb-14">
              <h2
                className="text-3xl md:text-4xl font-black mb-3"
                style={{ fontFamily: "Poppins" }}
              >
                Resultados <span style={{ color: "#00ff66" }}>Comprobados</span>
              </h2>
              <p className="text-base" style={{ color: "#b3b3b3" }}>
                Números reales de nuestra comunidad activa
              </p>
            </motion.div>

            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
            >
              {[
                { end: 89, suffix: "%", label: "Precisión Histórica" },
                { end: 10000, suffix: "+", label: "Usuarios Activos" },
                { end: 2847, suffix: "", label: "Apuestas Analizadas/mes" },
                { end: 42, suffix: "%", label: "ROI Promedio Mensual" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={scaleIn}
                  className="card-hover rounded-2xl p-6 text-center"
                  style={{
                    background: "rgba(17,17,17,0.8)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <AnimatedStat end={stat.end} suffix={stat.suffix} label={stat.label} />
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="beneficios" className="py-12 md:py-28" style={{ background: "#0a0a0a" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-8 md:mb-14">
              <h2
                className="text-3xl md:text-4xl font-black mb-3"
                style={{ fontFamily: "Poppins" }}
              >
                Todo lo que Incluye tu{" "}
                <span style={{ color: "#00ff66" }}>Membresía</span>
              </h2>
              <p style={{ color: "#b3b3b3" }}>
                Herramientas profesionales para tomar decisiones basadas en datos
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {benefits.map((b) => (
                <motion.div
                  key={b.title}
                  variants={fadeUp}
                  className="card-hover rounded-2xl p-4 md:p-6"
                  style={{
                    background: `linear-gradient(160deg, ${hexToRgba(b.accent, 0.07)} 0%, rgba(17,17,17,0.9) 45%)`,
                    border: `1px solid ${hexToRgba(b.accent, 0.25)}`,
                  }}
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4"
                    style={{ background: hexToRgba(b.accent, 0.12), color: b.accent }}
                  >
                    <b.icon size={18} />
                  </div>
                  <h3
                    className="text-sm md:text-lg font-bold mb-1.5 md:mb-2"
                    style={{ fontFamily: "Poppins" }}
                  >
                    {b.title}
                  </h3>
                  <p className="text-xs md:text-sm leading-relaxed" style={{ color: "#b3b3b3" }}>
                    {b.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── VIDEO BANNER ── */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <video
          ref={bannerVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "translateZ(0)" }}
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
              "linear-gradient(180deg, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.88) 100%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
          <Section>
            <motion.div
              variants={fadeUp}
              className="text-xs font-bold tracking-widest mb-4"
              style={{ color: "#00ff66", fontFamily: "Inter" }}
            >
              DESDE CUALQUIER ESTADIO DEL MUNDO
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-black leading-tight mb-6"
              style={{ fontFamily: "Poppins" }}
            >
              El fútbol se vive <span className="gradient-text">en cada rincón</span> del planeta
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base md:text-lg" style={{ color: "#e5e5e5", maxWidth: "560px", margin: "0 auto" }}>
              Analizamos las mejores ligas del mundo para traerte predicciones con datos reales, estés donde estés.
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-12 md:py-24" style={{ background: "#111111" }}>
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-8 md:mb-14">
              <h2
                className="text-3xl md:text-4xl font-black mb-3"
                style={{ fontFamily: "Poppins" }}
              >
                Cómo <span style={{ color: "#00ff66" }}>Funciona</span>
              </h2>
              <p style={{ color: "#b3b3b3" }}>
                Tres pasos para comenzar a ganar con estrategia
              </p>
            </motion.div>

            <div className="relative">
              {/* Connecting line (desktop) */}
              <div
                className="hidden md:block absolute top-10 left-16 right-16 h-0.5"
                style={{ background: "linear-gradient(to right, #00ff66, #00cc55, #00ff66)" }}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Te Registras",
                    desc: "Elige tu plan y accede en minutos. Sin complicaciones, sin contratos largos.",
                    icon: "📋",
                  },
                  {
                    step: "02",
                    title: "Recibes Acceso",
                    desc: "Accedes al dashboard, Telegram VIP y todas las herramientas de análisis inmediatamente.",
                    icon: "🔓",
                  },
                  {
                    step: "03",
                    title: "Aplicas la Estrategia",
                    desc: "Sigues las predicciones con gestión de bankroll y maximizas tus resultados cada día.",
                    icon: "🚀",
                  },
                ].map((step, i) => (
                  <motion.div
                    key={step.step}
                    variants={fadeUp}
                    className="relative flex flex-col items-center text-center"
                    style={{ transitionDelay: `${i * 0.15}s` }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-5 relative z-10"
                      style={{
                        background: "rgba(0,255,102,0.1)",
                        border: "2px solid rgba(0,255,102,0.3)",
                        boxShadow: "0 0 30px rgba(0,255,102,0.15)",
                      }}
                    >
                      {step.icon}
                    </motion.div>
                    <div
                      className="text-xs font-bold mb-1"
                      style={{ color: "#00ff66", fontFamily: "Inter", letterSpacing: "0.1em" }}
                    >
                      PASO {step.step}
                    </div>
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{ fontFamily: "Poppins" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#b3b3b3" }}>
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── VIDEOS ── */}
      <section className="py-12 md:py-28" style={{ background: "#0a0a0a" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-8 md:mb-14">
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ fontFamily: "Poppins" }}>
                Contenido en <span style={{ color: "#00ff66" }}>Video</span>
              </h2>
              <p style={{ color: "#b3b3b3" }}>
                Análisis y pronósticos directo desde nuestro canal de YouTube
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {featuredVideos.map((v) => (
                <motion.div
                  key={v.id}
                  variants={fadeUp}
                  className="card-hover rounded-2xl overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(17,17,17,0.9)" }}
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
                      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ background: "rgba(0,255,102,0.9)", color: "#0a0a0a" }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="md:w-5 md:h-5">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="p-2.5 md:p-4">
                    <p className="text-xs md:text-sm font-semibold leading-snug" style={{ fontFamily: "Inter", color: "#ffffff" }}>
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
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
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
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full flex items-center justify-center text-white z-10"
              style={{ background: "rgba(255,255,255,0.1)" }}
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
              style={{ border: "1px solid rgba(0,255,102,0.25)" }}
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

      {/* ── RESULTS ── */}
      <section id="resultados" className="py-12 md:py-28" style={{ background: "#0a0a0a" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-8 md:mb-14">
              <h2
                className="text-3xl md:text-4xl font-black mb-3"
                style={{ fontFamily: "Poppins" }}
              >
                Resultados
              </h2>
              <p style={{ color: "#b3b3b3" }}>
                Comprobantes reales de ganancias de nuestra comunidad
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((r, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="card-hover rounded-2xl overflow-hidden cursor-pointer"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                  onClick={() => setSelectedResult(r)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative h-56 overflow-hidden flex items-center justify-center" style={{ background: "#f2f2f2" }}>
                    <img
                      src={r.img}
                      alt={r.desc}
                      className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                    />
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-black"
                      style={{ background: "#00ff66", color: "#0a0a0a", fontFamily: "Poppins" }}
                    >
                      {r.amount}
                    </div>
                  </div>
                  <div
                    className="p-4"
                    style={{ background: "rgba(17,17,17,0.9)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: "#00ff66" }}>
                      {r.date}
                    </p>
                    <p className="text-sm font-medium" style={{ color: "#ffffff" }}>
                      {r.desc}
                    </p>
                    <p
                      className="text-xs mt-2 flex items-center gap-1"
                      style={{ color: "#b3b3b3" }}
                    >
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
            style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)" }}
            onClick={() => setSelectedResult(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-2xl w-full rounded-3xl overflow-hidden"
              style={{ background: "#111111", border: "1px solid rgba(0,255,102,0.3)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full h-80 flex items-center justify-center" style={{ background: "#f2f2f2" }}>
                <img
                  src={selectedResult.img}
                  alt={selectedResult.desc}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ background: "rgba(0,0,0,0.6)" }}
                onClick={() => setSelectedResult(null)}
              >
                ✕
              </button>
              <div className="p-6">
                <div
                  className="inline-block px-4 py-2 rounded-full text-lg font-black mb-3"
                  style={{ background: "rgba(0,255,102,0.15)", color: "#00ff66", fontFamily: "Poppins" }}
                >
                  {selectedResult.amount}
                </div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ fontFamily: "Poppins" }}
                >
                  {selectedResult.desc}
                </h3>
                <p className="text-sm" style={{ color: "#b3b3b3" }}>
                  Resultado verificado · {selectedResult.date}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STATS DASHBOARD ── */}
      <section id="estadisticas" className="py-12 md:py-28" style={{ background: "#111111" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2
                className="text-3xl md:text-4xl font-black mb-3"
                style={{ fontFamily: "Poppins" }}
              >
                Dashboard de{" "}
                <span style={{ color: "#00ff66" }}>Estadísticas</span>
              </h2>
              <p style={{ color: "#b3b3b3" }}>
                Rendimiento verificado mes a mes
              </p>
            </motion.div>

            {/* Tab selector */}
            <motion.div variants={fadeUp} className="flex justify-center gap-3 mb-8">
              {(["roi", "precision"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: activeTab === tab ? "#00ff66" : "rgba(255,255,255,0.06)",
                    color: activeTab === tab ? "#0a0a0a" : "#b3b3b3",
                    fontFamily: "Inter",
                  }}
                >
                  {tab === "roi" ? "ROI Mensual %" : "Precisión %"}
                </button>
              ))}
            </motion.div>

            <motion.div
              variants={scaleIn}
              className="rounded-3xl p-6 md:p-8"
              style={{
                background: "rgba(17,17,17,0.8)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff66" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00ff66" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="mes" tick={{ fill: "#b3b3b3", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#b3b3b3", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a1a",
                      border: "1px solid rgba(0,255,102,0.3)",
                      borderRadius: "12px",
                      color: "#ffffff",
                    }}
                    formatter={(v) => [`${v}${activeTab === "roi" ? "%" : "%"}`, activeTab === "roi" ? "ROI" : "Precisión"]}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeTab}
                    stroke="#00ff66"
                    strokeWidth={2.5}
                    fill="url(#greenGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Sport breakdown */}
            <motion.div variants={fadeUp} className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { sport: "⚽ Fútbol", coverage: "95%" },
                { sport: "🏀 Basketball", coverage: "80%" },
                { sport: "🎾 Tenis", coverage: "72%" },
                { sport: "🏈 NFL", coverage: "68%" },
              ].map((s) => (
                <div
                  key={s.sport}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: "rgba(17,17,17,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="text-xl mb-1">{s.sport.split(" ")[0]}</div>
                  <div className="text-sm font-semibold" style={{ color: "#b3b3b3" }}>
                    {s.sport.split(" ").slice(1).join(" ")}
                  </div>
                  <div className="text-lg font-black mt-1" style={{ color: "#00ff66", fontFamily: "Poppins" }}>
                    {s.coverage}
                  </div>
                </div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonios" className="py-12 md:py-28 overflow-hidden" style={{ background: "#0a0a0a" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-10">
          <Section>
            <motion.div variants={fadeUp} className="text-center">
              <h2
                className="text-3xl md:text-4xl font-black mb-3"
                style={{ fontFamily: "Poppins" }}
              >
                Lo que Dice Nuestra{" "}
                <span style={{ color: "#00ff66" }}>Comunidad</span>
              </h2>
              <p style={{ color: "#b3b3b3" }}>
                Más de 10.000 personas ya transformaron su forma de apostar
              </p>
            </motion.div>
          </Section>
        </div>

        {/* Testimonials infinite scroll */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-5 scroll-left cursor-pointer"
            style={{ width: "max-content", animationPlayState: testimonialsPaused ? "paused" : "running" }}
            onClick={() => setTestimonialsPaused((p) => !p)}
            title={testimonialsPaused ? "Toca para reanudar" : "Toca para pausar"}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="flex-shrink-0 rounded-2xl p-6"
                style={{
                  width: "320px",
                  background: "rgba(17,17,17,0.9)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "rgba(0,255,102,0.12)", color: "#00ff66", fontFamily: "Poppins" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ fontFamily: "Poppins" }}>
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: "#b3b3b3" }}>
                      {t.city}
                    </p>
                  </div>
                </div>
                <div className="text-yellow-400 text-sm mb-3">{"★".repeat(t.rating)}</div>
                <p className="text-sm leading-relaxed" style={{ color: "#b3b3b3" }}>
                  "{t.comment}"
                </p>
                <p className="text-xs mt-3" style={{ color: "#00ff66" }}>
                  {t.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS ── */}
      <section id="planes" className="py-12 md:py-28" style={{ background: "#111111" }}>
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-8 md:mb-14">
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ fontFamily: "Poppins" }}>
                Nuestros <span style={{ color: "#00ff66" }}>Productos</span>
              </h2>
              <p style={{ color: "#b3b3b3" }}>
                Elige el canal o membresía que se ajuste a ti. Pago seguro, acceso inmediato.
              </p>
            </motion.div>

            <div className="space-y-4">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                  className="card-hover rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{
                    background: product.highlight
                      ? "linear-gradient(135deg, rgba(0,255,102,0.08) 0%, rgba(17,17,17,0.95) 100%)"
                      : "rgba(17,17,17,0.9)",
                    border: product.highlight
                      ? "1px solid rgba(0,255,102,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div>
                    <h3
                      className="text-base md:text-lg font-bold mb-1"
                      style={{ fontFamily: "Poppins", color: product.highlight ? "#00ff66" : "#ffffff" }}
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs md:text-sm mb-2" style={{ color: "#b3b3b3" }}>
                      {product.desc}
                    </p>
                    <p className="text-lg font-black" style={{ fontFamily: "Poppins", color: "#ffffff" }}>
                      ${product.price} <span className="text-xs font-normal" style={{ color: "#b3b3b3" }}>COP</span>
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
                      background: product.highlight ? "#00ff66" : "transparent",
                      color: product.highlight ? "#0a0a0a" : "#00ff66",
                      border: product.highlight ? "none" : "1px solid rgba(0,255,102,0.4)",
                      fontFamily: "Poppins",
                      boxShadow: product.highlight ? "0 0 20px rgba(0,255,102,0.3)" : "none",
                    }}
                  >
                    Ver Producto
                  </motion.a>
                </motion.div>
              ))}
            </div>

            <motion.p variants={fadeUp} className="text-center text-xs mt-8" style={{ color: "#555" }}>
              Pagos procesados de forma segura por KunFuPay
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="relative py-24 md:py-40 text-center overflow-hidden"
        style={{ background: "#111111" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=700&fit=crop&auto=format')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.07,
          }}
        />
        {/* Green radial glow */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,255,102,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <Section>
            <motion.div
              variants={fadeUp}
              className="text-xs font-bold tracking-widest mb-4"
              style={{ color: "#00ff66", fontFamily: "Inter" }}
            >
              ¿LISTO PARA EL SIGUIENTE NIVEL?
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-6xl font-black leading-tight mb-6"
              style={{ fontFamily: "Poppins" }}
            >
              ¿Listo para llevar tus{" "}
              <span className="gradient-text">resultados</span>{" "}
              al siguiente nivel?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg mb-10"
              style={{ color: "#b3b3b3" }}
            >
              Únete a más de 10.000 usuarios que ya ganan con estrategia y datos.
              Sin riesgos, sin contratos.
            </motion.p>
            <motion.div variants={fadeUp}>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollTo("planes")}
                className="px-12 py-5 rounded-2xl text-xl font-black"
                style={{
                  background: "#00ff66",
                  color: "#0a0a0a",
                  fontFamily: "Poppins",
                  boxShadow:
                    "0 0 60px rgba(0,255,102,0.5), 0 0 120px rgba(0,255,102,0.2), 0 16px 40px rgba(0,0,0,0.5)",
                }}
              >
                Únete Hoy →
              </motion.button>
              <p className="mt-4 text-sm" style={{ color: "#555" }}>
                Sin tarjeta de crédito requerida · Cancela en cualquier momento
              </p>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-16 md:py-20"
        style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="TipsterGold" className="w-[52px] h-[52px] rounded-xl object-cover" />
                <span className="text-lg font-bold" style={{ fontFamily: "Poppins" }}>
                  Tipster<span style={{ color: "#00ff66" }}>Gold</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#b3b3b3", maxWidth: "200px" }}>
                La plataforma de análisis deportivo más confiable para maximizar tus oportunidades.
              </p>
            </div>

            {/* Empresa */}
            <div>
              <h4
                className="text-sm font-bold mb-4"
                style={{ fontFamily: "Poppins", color: "#ffffff" }}
              >
                Empresa
              </h4>
              <ul className="space-y-2">
                {["Sobre Nosotros", "Blog", "Carreras", "Prensa"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm transition-colors"
                      style={{ color: "#b3b3b3" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff66")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#b3b3b3")}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4
                className="text-sm font-bold mb-4"
                style={{ fontFamily: "Poppins", color: "#ffffff" }}
              >
                Legal
              </h4>
              <ul className="space-y-2">
                {["Términos de Uso", "Privacidad", "Cookies", "Aviso Legal"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm transition-colors"
                      style={{ color: "#b3b3b3" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff66")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#b3b3b3")}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact + Social */}
            <div>
              <h4
                className="text-sm font-bold mb-4"
                style={{ fontFamily: "Poppins", color: "#ffffff" }}
              >
                Contacto
              </h4>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">
                  <a
                    href="mailto:tipstergold@outlook.com"
                    style={{ color: "#b3b3b3" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff66")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#b3b3b3")}
                  >
                    tipstergold@outlook.com
                  </a>
                </li>
                <li className="text-sm" style={{ color: "#b3b3b3" }}>
                  Lun–Vie 9:00–20:00
                </li>
              </ul>

              <a
                href="https://t.me/TipsterGold_1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-6 transition-all"
                style={{ background: "rgba(34,158,217,0.12)", border: "1px solid rgba(34,158,217,0.4)", color: "#4fc3f7" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.12.56l.4-5.63 10.24-9.26c.44-.4-.1-.62-.68-.22L7.62 13.67l-5.44-1.7c-1.18-.37-1.2-1.18.26-1.75L22.4 2.09c.99-.36 1.85.24 1.51 1.7z" />
                </svg>
                Contáctanos por Telegram
              </a>

              <h4
                className="text-sm font-bold mb-3"
                style={{ fontFamily: "Poppins", color: "#ffffff" }}
              >
                Redes Sociales
              </h4>
              <div className="flex gap-3">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/tgbrianfut_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#b3b3b3" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,255,102,0.15)";
                    e.currentTarget.style.borderColor = "rgba(0,255,102,0.4)";
                    e.currentTarget.style.color = "#00ff66";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#b3b3b3";
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@elprofetg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#b3b3b3" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,255,102,0.15)";
                    e.currentTarget.style.borderColor = "rgba(0,255,102,0.4)";
                    e.currentTarget.style.color = "#00ff66";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#b3b3b3";
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.78a4.85 4.85 0 01-1.07-.09z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@TgBrianfut"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#b3b3b3" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,255,102,0.15)";
                    e.currentTarget.style.borderColor = "rgba(0,255,102,0.4)";
                    e.currentTarget.style.color = "#00ff66";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#b3b3b3";
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs" style={{ color: "#555" }}>
              © 2025 TipsterGold. Todos los derechos reservados.
            </p>
            <p className="text-xs text-center" style={{ color: "#555", maxWidth: "400px" }}>
              Las apuestas deportivas implican riesgo. Apuesta responsablemente.
              Solo mayores de 18 años.
            </p>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full pulse-green"
                style={{ background: "#00ff66" }}
              />
              <span className="text-xs" style={{ color: "#00ff66" }}>
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
              style={{ color: "#555" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff66")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
            >
              Desarrollado por CODE STUDIO
            </a>
          </div>
        </div>
      </footer>

      {/* ── FLOATING CONTACT BALL ── */}
      <motion.a
        href="https://t.me/TipsterGold_1"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contáctanos por Telegram"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: "spring" }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        className="fixed z-50 bottom-5 right-5 md:bottom-6 md:right-6 w-16 h-16 md:w-[72px] md:h-[72px] rounded-full float-animation"
      >
        <img
          src="/balon.png"
          alt="Contacto"
          className="w-full h-full rounded-full object-cover"
          style={{
            boxShadow: "0 8px 24px rgba(0,0,0,0.6), 0 0 0 4px rgba(0,255,102,0.25), 0 0 30px rgba(0,255,102,0.3)",
          }}
        />
      </motion.a>

      {/* ── MUSIC PLAYER ── */}
      <audio ref={audioRef} src={musicTracks[trackIndex].src} onEnded={onTrackEnded} preload="auto" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="fixed z-50 bottom-5 left-5 md:bottom-6 md:left-6 flex items-center gap-2 pl-2 pr-3 py-2 rounded-full"
        style={{
          background: "rgba(17,17,17,0.85)",
          border: "1px solid rgba(0,255,102,0.25)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}
        title={musicTracks[trackIndex].title}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#00ff66", color: "#0a0a0a" }}
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="4" width="5" height="16" rx="1" />
              <rect x="14" y="4" width="5" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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
          aria-label="Volumen"
          className="w-12 md:w-16 accent-[#00ff66]"
        />

        <button
          type="button"
          onClick={switchTrack}
          aria-label="Cambiar canción"
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.08)", color: "#ffffff" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 5v14l9-7-9-7zM15 5v14l9-7-9-7z" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
}
