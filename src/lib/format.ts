const LONG = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : LONG.format(date);
}

/** Texte brut d'un extrait HTML de WordPress (entités décodées, « [...] » retiré). */
export function plainText(html: string): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "")
    .replace(/\s*\[(?:…|\.\.\.|&hellip;)\]\s*$/, "…")
    .replace(/\s+/g, " ")
    .trim();
}

/** Identifiant d'une vidéo YouTube, quelle que soit la forme du lien collé. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1) || null;
    if (parsed.hostname.endsWith("youtube.com") || parsed.hostname.endsWith("youtube-nocookie.com")) {
      if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
      const match = parsed.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{6,})/);
      return match?.[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
