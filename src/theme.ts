// Paleta y utilidades compartidas por la página principal y el blog.
// Negro & dorado, con champán, bronce, platino y marfil de apoyo.
export const C = {
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

export const GOLD_GRAD = "linear-gradient(135deg, #9a7b1f 0%, #f6d66b 45%, #d4af37 100%)";

/** Verde metalizado de los CTA principales (mismo relieve que el dorado). */
export const GREEN_GRAD = "linear-gradient(135deg, #0d6b42 0%, #6cf0a9 45%, #17a86a 100%)";

/** Convierte un color hex a rgba con la opacidad indicada. */
export function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Enlaces que comparten ambas páginas
export const TELEGRAM_FREE = "https://t.me/+zVVw0a3H5JtmZjQx";
export const TELEGRAM_CONTACT = "https://t.me/Tipstergold_1";
/** Perfil auditado en METRIKA: la única fuente de las cifras de la web. */
export const METRIKA_PROFILE = "https://profile.metrika.tips/tipstergold";
export const SITE_URL = "https://www.tipstergold.com";
export const SOCIAL = {
  instagram: "https://www.instagram.com/tgbrianfut_/",
  tiktok: "https://www.tiktok.com/@elprofetg",
  youtube: "https://www.youtube.com/@TgBrianfut",
  email: "tipstergold@outlook.com",
};
