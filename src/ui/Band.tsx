import type { ReactNode } from "react";

import { cn } from "./cn";

export type BandTone = "creme" | "menthe" | "peche" | "accent" | "nuit";

export const FONDS: Record<BandTone, string> = {
  creme: "var(--bande-creme)",
  menthe: "var(--bande-menthe)",
  peche: "var(--bande-peche)",
  accent: "var(--accent)",
  nuit: "var(--bande-nuit)",
};

/**
 * Bande de section, pleine largeur.
 *
 * C'est la pièce qui remplace les cartes : une partie de la page n'est pas un
 * cadre posé sur un fond, c'est une bande de couleur qui va d'un bord à
 * l'autre. Ce qui sépare deux parties, c'est le changement de teinte et la
 * vague qui les joint, jamais un contour.
 */
export function Band({
  tone = "creme",
  narrow = false,
  className,
  id,
  labelledBy,
  children,
}: {
  tone?: BandTone;
  /** Largeur de lecture, pour du texte suivi. */
  narrow?: boolean;
  className?: string;
  id?: string;
  labelledBy?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} style={{ background: FONDS[tone] }} className={cn("relative", className)}>
      <div className={cn("mx-auto w-full px-5 py-14 sm:px-8 sm:py-20", narrow ? "max-w-[760px]" : "max-w-[1180px]")}>{children}</div>
    </section>
  );
}

/** Trois vagues différentes : deux sections voisines ne se joignent jamais pareil. */
const VAGUES = [
  "M0,46 C240,86 420,8 700,34 C960,58 1160,86 1440,34 L1440,80 L0,80 Z",
  "M0,28 C280,-12 470,66 760,44 C1030,24 1220,-4 1440,42 L1440,80 L0,80 Z",
  "M0,50 C300,88 520,10 820,32 C1080,52 1250,82 1440,38 L1440,80 L0,80 Z",
];

/**
 * Jointure entre deux bandes : la couleur d'arrivée déborde en vague sur la
 * couleur de départ. Décorative, donc masquée aux lecteurs d'écran.
 */
export function Wave({ from, to, variant = 0, flip = false }: { from: BandTone | "ciel"; to: BandTone; variant?: 0 | 1 | 2; flip?: boolean }) {
  return (
    <div style={{ background: from === "ciel" ? "transparent" : FONDS[from] }} aria-hidden className="relative -my-px">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className={cn("block h-[46px] w-full sm:h-[72px]", flip && "-scale-x-100")}>
        <path d={VAGUES[variant]} fill={FONDS[to]} />
      </svg>
    </div>
  );
}
