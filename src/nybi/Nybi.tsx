import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition, type Transition } from "motion/react";
import { useRef, useState } from "react";

import { cn } from "@/ui/cn";

import actually from "./poses/actually.webp";
import artiste from "./poses/artiste.webp";
import bleh from "./poses/bleh.webp";
import calin from "./poses/calin.webp";
import coucou from "./poses/coucou.webp";
import feu from "./poses/feu.webp";
import gamer from "./poses/gamer.webp";
import idol from "./poses/idol.webp";
import notes from "./poses/notes.webp";
import panneau from "./poses/panneau.webp";
import prof from "./poses/prof.webp";
import roule from "./poses/roule.webp";
import rouleSourire from "./poses/roule-sourire.webp";
import stand from "./poses/stand.webp";
import tresor from "./poses/tresor.webp";

/**
 * Nybi, la mascotte de Nyassobi, à partir des émotes officielles de
 * l'association. Les images ne sont pas redessinées: seulement recadrées,
 * converties en WebP, et le vert d'incrustation des panneaux remplacé par une
 * couleur unie pour y écrire en HTML.
 *
 * L'animation porte sur l'image entière (flotter, rebondir, se balancer,
 * tourner): le dessin reste celui de l'association.
 */

interface Screen {
  /** Centre et taille de la zone d'écriture, en fraction de l'image. */
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
}

const POSES = {
  roule: { src: roule, width: 520, height: 452 },
  "roule-sourire": { src: rouleSourire, width: 520, height: 452 },
  coucou: { src: coucou, width: 520, height: 473 },
  calin: { src: calin, width: 520, height: 510 },
  idol: { src: idol, width: 507, height: 520 },
  gamer: { src: gamer, width: 513, height: 520 },
  artiste: { src: artiste, width: 503, height: 520 },
  feu: { src: feu, width: 519, height: 520 },
  bleh: { src: bleh, width: 520, height: 483 },
  actually: { src: actually, width: 520, height: 377 },
  tresor: { src: tresor, width: 520, height: 432 },
  notes: { src: notes, width: 395, height: 332 },
  panneau: { src: panneau, width: 520, height: 481, screen: { x: 0.388, y: 0.305, w: 0.5, h: 0.3, angle: -21 } as Screen },
  prof: { src: prof, width: 520, height: 387, screen: { x: 0.232, y: 0.318, w: 0.36, h: 0.36, angle: -17 } as Screen },
  stand: { src: stand, width: 520, height: 488 },
} as const;

export type NybiPose = keyof typeof POSES;
export type NybiMotion = "float" | "bounce" | "sway" | "spin" | "none";

const LOOPS: Record<Exclude<NybiMotion, "none">, { animate: TargetAndTransition; transition: Transition }> = {
  float: { animate: { y: [0, -6, 0] }, transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } },
  bounce: { animate: { y: [0, -12, 0], scaleY: [1, 1.03, 1] }, transition: { duration: 0.9, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1] } },
  sway: { animate: { rotate: [-4, 4, -4] }, transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" } },
  spin: { animate: { rotate: [0, 360] }, transition: { duration: 1.6, repeat: Infinity, ease: "linear" } },
};

function Heart({ x }: { x: number }) {
  return (
    <motion.svg
      viewBox="0 0 24 22"
      width={18}
      height={16}
      aria-hidden
      className="pointer-events-none absolute top-1/3 left-1/2"
      initial={{ opacity: 0, x, y: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 1, 0], y: -72, x: x * 1.6, scale: 1, rotate: x / 2 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <path d="M12 21C5 16 1 12 1 7A5.5 5.5 0 0 1 12 4A5.5 5.5 0 0 1 23 7C23 12 19 16 12 21Z" fill="var(--accent)" />
    </motion.svg>
  );
}

export function Nybi({
  pose,
  size = 120,
  motion: loop = "float",
  sign,
  interactive = true,
  label,
  className,
}: {
  pose: NybiPose;
  /** Largeur en pixels; la hauteur suit les proportions de l'image. */
  size?: number;
  motion?: NybiMotion;
  /** Texte écrit sur le panneau ou le tableau (poses « panneau » et « prof »). */
  sign?: string;
  /** Un clic fait frétiller Nybi et lâcher des cœurs. */
  interactive?: boolean;
  /** Texte lu par les lecteurs d'écran; sans lui, l'image est décorative. */
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const firstPose = useRef(pose);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [wiggle, setWiggle] = useState(0);
  const entry = POSES[pose];
  const height = Math.round((size * entry.height) / entry.width);
  const screen = "screen" in entry ? entry.screen : undefined;
  const active = reduce || loop === "none" ? undefined : LOOPS[loop];

  const pet = () => {
    if (!interactive) return;
    setWiggle((value) => value + 1);
    if (reduce) return;
    const burst = Array.from({ length: 5 }, (_, index) => ({ id: Date.now() + index, x: (index - 2) * 14 }));
    setHearts((current) => [...current, ...burst]);
    window.setTimeout(() => setHearts((current) => current.filter((heart) => !burst.includes(heart))), 1200);
  };

  const picture = (
    <motion.span className="relative block" style={{ width: size, height }} animate={active?.animate} transition={active?.transition}>
      <motion.span
        key={wiggle}
        className="relative block size-full"
        initial={false}
        animate={wiggle && !reduce ? { rotate: [0, -10, 8, -5, 0], scale: [1, 1.08, 1] } : undefined}
        transition={{ duration: 0.6 }}
      >
        {/* Un changement de pose (réaction à un événement) se fait en petit « pop »;
            la première pose s'affiche telle quelle. */}
        <motion.img
          key={pose}
          src={entry.src}
          alt={label ?? ""}
          width={size}
          height={height}
          draggable={false}
          loading="lazy"
          decoding="async"
          className="block size-full select-none"
          initial={firstPose.current === pose || reduce ? false : { opacity: 0, scale: 0.7, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 16 }}
        />
        {screen && sign && (
          <span
            aria-hidden
            className="absolute grid place-items-center text-center font-display leading-none font-semibold text-ink"
            style={{
              left: `${screen.x * 100}%`,
              top: `${screen.y * 100}%`,
              width: size * screen.w,
              height: height * screen.h,
              transform: `translate(-50%, -50%) rotate(${screen.angle}deg)`,
              fontSize: Math.max(11, (size * screen.w) / Math.max(4, sign.length * 0.62)),
              color: "#3d1a10",
            }}
          >
            {sign}
          </span>
        )}
      </motion.span>
    </motion.span>
  );

  if (!interactive) return <span className={cn("relative inline-block", className)}>{picture}</span>;

  return (
    <span className={cn("relative inline-block", className)}>
      <motion.button
        type="button"
        onClick={pet}
        whileHover={reduce ? undefined : { scale: 1.05 }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
        aria-label={label ? `${label}. Caresser Nybi` : "Caresser Nybi"}
        className="block rounded-card"
      >
        {picture}
      </motion.button>
      <AnimatePresence>
        {hearts.map((heart) => (
          <Heart key={heart.id} x={heart.x} />
        ))}
      </AnimatePresence>
    </span>
  );
}
