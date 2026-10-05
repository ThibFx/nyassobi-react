import type { Atelier, WpImage } from "./content";
import { youtubeId, youtubeThumb } from "./format";

/** Visuel d'un atelier : la miniature de son replay, sinon l'image jointe. */
export function atelierImage(atelier: Atelier): WpImage | null {
  const id = youtubeId(atelier.videoUrl);
  if (id) return { src: youtubeThumb(id), alt: "", width: 480, height: 360 };
  if (atelier.attachmentUrl && /\.(png|jpe?g|webp|gif)$/i.test(atelier.attachmentUrl)) return { src: atelier.attachmentUrl, alt: "" };
  return null;
}

/** Titre sans le préfixe « Atelier : » que portent tous les ateliers. */
export function atelierTitle(atelier: Atelier): string {
  return atelier.title.replace(/^atelier\s*[:\-–]\s*/i, "");
}

/** Le support n'est un document que s'il n'est pas déjà l'image de l'atelier. */
export function atelierSupport(atelier: Atelier): string | null {
  if (!atelier.attachmentUrl || /\.(png|jpe?g|webp|gif)$/i.test(atelier.attachmentUrl)) return null;
  return atelier.attachmentUrl;
}
