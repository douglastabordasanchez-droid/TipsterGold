import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C, GOLD_GRAD, hexToRgba, TELEGRAM_FREE, SOCIAL } from "./theme";
import { posts, type Block, type Post } from "./blogPosts";

const easeOut = [0.0, 0.0, 0.2, 1] as const;

// El artículo abierto vive en el hash, así el enlace se puede compartir
// y el botón atrás del navegador funciona como se espera.
function slugFromHash() {
  const h = window.location.hash.replace(/^#\/?/, "");
  return h || null;
}

// ─── Cabecera ───────────────────────────────────────────────────────────────
function Header({ onHome }: { onHome: () => void }) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(8,8,8,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${hexToRgba(C.gold, 0.16)}`,
      }}
    >
      <div className="wrap h-16 md:h-20 flex items-center justify-between gap-4">
        <button onClick={onHome} className="flex items-center gap-2.5" aria-label="Blog TipsterGold">
          <img
            src="/logo.png"
            alt=""
            className="w-9 h-9 md:w-11 md:h-11 rounded-full object-cover"
            style={{ boxShadow: `0 0 0 1px ${hexToRgba(C.gold, 0.35)}` }}
          />
          <span
            className="font-black tracking-[0.12em] whitespace-nowrap"
            style={{ fontFamily: "Poppins", fontSize: "clamp(0.85rem, 1.4vw, 1.1rem)", color: C.ivory }}
          >
            TIPSTER <span className="gradient-text">GOLD</span>
            <span className="hidden sm:inline" style={{ color: C.muted, fontWeight: 600 }}>
              {" "}
              · BLOG
            </span>
          </span>
        </button>

        <a
          href="/"
          className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap"
          style={{
            background: hexToRgba(C.gold, 0.08),
            border: `1px solid ${hexToRgba(C.gold, 0.3)}`,
            color: C.champagne,
            fontFamily: "Poppins",
          }}
        >
          ← Volver a la web
        </a>
      </div>
    </header>
  );
}

// ─── Índice de artículos ────────────────────────────────────────────────────
function Index({ onOpen }: { onOpen: (slug: string) => void }) {
  const [featured, ...rest] = posts;

  return (
    <>
      {/* Portada */}
      <section className="relative overflow-hidden" style={{ background: C.black }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 55% 50% at 50% 0%, ${hexToRgba(C.gold, 0.12)} 0%, ${hexToRgba(C.gold, 0.04)} 40%, transparent 74%)`,
          }}
        />
        <div className="relative wrap pt-14 pb-12 md:pt-20 md:pb-16 text-center">
          <div
            className="text-xs font-bold tracking-[0.28em] mb-4"
            style={{ color: C.gold, fontFamily: "Inter" }}
          >
            APRENDE EL MÉTODO
          </div>
          <h1 className="fs-hero font-black mb-5" style={{ fontFamily: "Poppins" }}>
            Analiza antes de <span className="gradient-text">invertir</span>
          </h1>
          <p className="fs-lead mx-auto" style={{ color: C.muted, maxWidth: "60ch" }}>
            Guías de gestión de banca, lectura de cuotas, análisis previo y psicología. Sin
            pronósticos ni promesas: solo el método para que aprendas a decidir por ti mismo.
          </p>
        </div>
      </section>

      {/* Artículo destacado */}
      <section className="sec-pad" style={{ background: C.panel }}>
        <div className="wrap">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            onClick={() => onOpen(featured.slug)}
            className="card-hover group w-full text-left rounded-3xl overflow-hidden grid md:grid-cols-2"
            style={{
              background: `linear-gradient(120deg, rgba(10,10,10,0.98) 0%, ${hexToRgba(C.gold, 0.07)} 100%)`,
              border: `1px solid ${hexToRgba(C.gold, 0.22)}`,
            }}
          >
            <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[340px] overflow-hidden">
              <img
                src={featured.cover}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ objectPosition: featured.coverPos }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 60%)",
                }}
              />
            </div>

            <div className="p-6 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-black tracking-[0.16em] uppercase"
                  style={{ background: GOLD_GRAD, color: C.black, fontFamily: "Poppins" }}
                >
                  Empieza por aquí
                </span>
                <span className="text-xs" style={{ color: C.muted }}>
                  {featured.minutes} min de lectura
                </span>
              </div>
              <h2 className="fs-h2 font-black mb-3" style={{ fontFamily: "Poppins" }}>
                {featured.title}
              </h2>
              <p className="fs-body mb-6" style={{ color: C.muted }}>
                {featured.excerpt}
              </p>
              <span
                className="inline-flex items-center gap-2 text-sm font-bold"
                style={{ color: C.goldBright, fontFamily: "Poppins" }}
              >
                Leer artículo
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </motion.button>
        </div>
      </section>

      {/* Resto de artículos */}
      <section className="sec-pad" style={{ background: C.black }}>
        <div className="wrap">
          <h2 className="fs-h2 font-black mb-8" style={{ fontFamily: "Poppins" }}>
            Todos los <span className="gradient-text">artículos</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {rest.map((post, i) => (
              <motion.button
                key={post.slug}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.45, ease: easeOut }}
                onClick={() => onOpen(post.slug)}
                className="card-hover group text-left rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "rgba(13,13,13,0.94)",
                  border: `1px solid ${hexToRgba(C.gold, 0.16)}`,
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={post.cover}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: post.coverPos }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 65%)",
                    }}
                  />
                  <span
                    className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase"
                    style={{
                      background: "rgba(8,8,8,0.75)",
                      border: `1px solid ${hexToRgba(C.gold, 0.35)}`,
                      color: C.goldBright,
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {post.category}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3
                    className="fs-h3 font-bold mb-2 leading-snug"
                    style={{ fontFamily: "Poppins", color: C.ivory }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: C.muted }}>
                    {post.excerpt}
                  </p>
                  <span className="mt-auto text-xs" style={{ color: C.dim }}>
                    {post.minutes} min de lectura
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Bloques de contenido de un artículo ────────────────────────────────────
function Content({ block }: { block: Block }) {
  switch (block.t) {
    case "h":
      return (
        <h2
          className="fs-h3 font-black mt-9 mb-3"
          style={{ fontFamily: "Poppins", color: C.ivory }}
        >
          {block.text}
        </h2>
      );

    case "p":
      return (
        <p className="mb-4 leading-[1.75]" style={{ color: C.muted, fontSize: "1.02rem" }}>
          {block.text}
        </p>
      );

    case "ul":
    case "ol":
      return (
        <ul className="mb-5 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 leading-relaxed" style={{ color: C.muted }}>
              <span
                className="flex-shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full"
                style={{ background: C.gold }}
              />
              <span>
                {block.t === "ol" && (
                  <strong style={{ color: C.champagne }}>{i + 1}. </strong>
                )}
                {item}
              </span>
            </li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote
          className="my-7 pl-5 py-1 italic"
          style={{
            borderLeft: `3px solid ${C.gold}`,
            color: C.champagne,
            fontSize: "1.08rem",
            lineHeight: 1.6,
          }}
        >
          {block.text}
        </blockquote>
      );

    case "note":
      return (
        <aside
          className="my-7 rounded-2xl p-5"
          style={{
            background: hexToRgba(C.gold, 0.06),
            border: `1px solid ${hexToRgba(C.gold, 0.24)}`,
          }}
        >
          <div
            className="text-xs font-black tracking-[0.16em] uppercase mb-2"
            style={{ color: C.goldBright, fontFamily: "Poppins" }}
          >
            {block.title}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
            {block.text}
          </p>
        </aside>
      );

    case "table":
      return (
        <div className="my-7 -mx-4 px-4 overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: "460px" }}>
            <thead>
              <tr>
                {block.head.map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-black tracking-wider uppercase"
                    style={{
                      color: C.goldBright,
                      fontFamily: "Poppins",
                      background: hexToRgba(C.gold, 0.07),
                      borderBottom: `1px solid ${hexToRgba(C.gold, 0.24)}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-4 py-3"
                      style={{
                        color: j === 0 ? C.ivory : C.muted,
                        borderBottom: `1px solid ${hexToRgba(C.gold, 0.1)}`,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "img":
      return (
        <figure className="my-8">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${hexToRgba(C.gold, 0.18)}` }}
          >
            <img src={block.src} alt={block.alt} loading="lazy" className="w-full object-cover" />
          </div>
          <figcaption className="text-xs mt-3 text-center" style={{ color: C.dim }}>
            {block.caption}
          </figcaption>
        </figure>
      );
  }
}

// ─── Artículo completo ──────────────────────────────────────────────────────
function Article({ post, onBack, onOpen }: { post: Post; onBack: () => void; onOpen: (s: string) => void }) {
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      {/* Portada del artículo */}
      <div className="relative" style={{ background: C.black }}>
        <div className="relative h-[220px] md:h-[340px] overflow-hidden">
          <img
            src={post.cover}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: post.coverPos }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.55) 45%, rgba(8,8,8,0.35) 100%)",
            }}
          />
        </div>

        <div className="wrap relative -mt-20 md:-mt-28 pb-2">
          <button
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: C.champagne }}
          >
            ← Todos los artículos
          </button>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className="px-3 py-1 rounded-full text-[10px] font-black tracking-[0.16em] uppercase"
              style={{ background: GOLD_GRAD, color: C.black, fontFamily: "Poppins" }}
            >
              {post.category}
            </span>
            <span className="text-xs" style={{ color: C.muted }}>
              {post.minutes} min de lectura
            </span>
          </div>
          <h1 className="fs-h2 font-black" style={{ fontFamily: "Poppins", maxWidth: "22ch" }}>
            {post.title}
          </h1>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="wrap pt-8 pb-14">
        <div style={{ maxWidth: "72ch" }}>
          <p
            className="fs-lead mb-8 pb-6"
            style={{ color: C.champagne, borderBottom: `1px solid ${hexToRgba(C.gold, 0.16)}` }}
          >
            {post.excerpt}
          </p>

          {post.body.map((block, i) => (
            <Content key={i} block={block} />
          ))}

          {/* Cierre legal, coherente con el resto del sitio */}
          <div
            className="mt-10 rounded-2xl p-5 text-xs leading-relaxed"
            style={{
              background: hexToRgba(C.gold, 0.04),
              border: `1px solid ${hexToRgba(C.gold, 0.16)}`,
              color: C.dim,
            }}
          >
            Contenido formativo. No constituye asesoría financiera ni garantiza ganancias. Las
            apuestas conllevan riesgo económico y pueden generar adicción. Solo para mayores de 18
            años: apuesta únicamente lo que puedas permitirte perder.
          </div>

          {/* Llamada al canal gratuito */}
          <div
            className="mt-6 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
            style={{
              background: `linear-gradient(135deg, ${hexToRgba(C.gold, 0.12)} 0%, rgba(10,10,10,0.97) 65%)`,
              border: `1px solid ${hexToRgba(C.gold, 0.3)}`,
            }}
          >
            <div>
              <div className="font-black mb-1" style={{ fontFamily: "Poppins", color: C.ivory }}>
                ¿Quieres practicar el método?
              </div>
              <p className="text-sm" style={{ color: C.muted }}>
                En el canal gratuito publico análisis del día para que veas cómo se aplica.
              </p>
            </div>
            <a
              href={TELEGRAM_FREE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-center px-6 py-3 rounded-xl font-black text-sm"
              style={{ background: GOLD_GRAD, color: C.black, fontFamily: "Poppins" }}
            >
              Entrar al canal gratuito
            </a>
          </div>
        </div>
      </div>

      {/* Seguir leyendo */}
      <section className="sec-pad" style={{ background: C.panel }}>
        <div className="wrap">
          <h2 className="fs-h3 font-black mb-6" style={{ fontFamily: "Poppins" }}>
            Seguir <span className="gradient-text">leyendo</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {others.map((p) => (
              <button
                key={p.slug}
                onClick={() => onOpen(p.slug)}
                className="card-hover text-left rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(13,13,13,0.94)",
                  border: `1px solid ${hexToRgba(C.gold, 0.16)}`,
                }}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={p.cover}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: p.coverPos }}
                  />
                </div>
                <div className="p-4">
                  <div className="text-[10px] font-bold tracking-wider uppercase mb-1" style={{ color: C.gold }}>
                    {p.category}
                  </div>
                  <div className="text-sm font-semibold leading-snug" style={{ color: C.ivory }}>
                    {p.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </motion.article>
  );
}

// ─── Página ─────────────────────────────────────────────────────────────────
export default function Blog() {
  const [slug, setSlug] = useState<string | null>(() => slugFromHash());

  // Sincroniza con el historial del navegador
  useEffect(() => {
    const onHash = () => setSlug(slugFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const open = (s: string) => {
    window.location.hash = `/${s}`;
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const back = () => {
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const post = slug ? posts.find((p) => p.slug === slug) : null;

  useEffect(() => {
    document.title = post
      ? `${post.title} · Blog TipsterGold`
      : "Blog TipsterGold | Aprende a analizar antes de invertir";
  }, [post]);

  return (
    <div style={{ background: C.black, minHeight: "100vh", overflowX: "hidden" }}>
      <Header onHome={back} />

      <AnimatePresence mode="wait">
        {post ? (
          <Article key={post.slug} post={post} onBack={back} onOpen={open} />
        ) : (
          <motion.div key="index" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Index onOpen={open} />
          </motion.div>
        )}
      </AnimatePresence>

      <footer
        className="py-10"
        style={{ background: C.black, borderTop: `1px solid ${hexToRgba(C.gold, 0.14)}` }}
      >
        <div className="wrap flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs" style={{ color: C.dim }}>
            © 2026 TipsterGold · Contenido formativo para mayores de 18 años
          </p>
          <div className="flex items-center gap-4">
            {[
              { href: SOCIAL.instagram, label: "Instagram" },
              { href: SOCIAL.tiktok, label: "TikTok" },
              { href: SOCIAL.youtube, label: "YouTube" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs"
                style={{ color: C.muted }}
              >
                {s.label}
              </a>
            ))}
            <a href="/" className="text-xs font-semibold" style={{ color: C.gold }}>
              Ir a la web
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
