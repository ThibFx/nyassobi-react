import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { Nybi, type NybiPose } from "@/nybi/Nybi";

import { Wave, type BandTone } from "./Band";
import { cn } from "./cn";

/**
 * En-tête d'une page intérieure : le titre sur le ciel de l'association, une
 * émote de Nybi qui flotte à droite, puis une vague vers la première bande.
 */
export function PageHero({
  kicker,
  title,
  description,
  pose,
  sign,
  next = "creme",
  children,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  pose?: NybiPose;
  /** Texte écrit sur le panneau, pour les poses qui en ont un. */
  sign?: string;
  /** Couleur de la bande qui suit, pour que la vague s'y fonde. */
  next?: BandTone;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const enter = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const } };

  return (
    <header style={{ background: "var(--ciel)" }} className="relative overflow-hidden">
      <span aria-hidden className="absolute -top-40 -left-24 size-[420px] rounded-full opacity-60" style={{ background: "var(--accent-wash)" }} />
      <span aria-hidden className="absolute -right-28 top-10 size-[280px] rounded-full opacity-70" style={{ background: "var(--teal-wash)" }} />
      <div className="relative mx-auto flex w-full max-w-[1180px] items-center gap-8 px-5 pt-32 pb-6 sm:px-8 sm:pt-40 sm:pb-10">
        <div className="min-w-0 flex-1">
          {kicker && (
            <motion.p {...enter(0)} className="mb-3 font-display text-[15px] font-semibold tracking-wide text-teal-ink uppercase">
              {kicker}
            </motion.p>
          )}
          <motion.h1 {...enter(0.06)} className="font-display text-[38px] leading-[1.05] font-semibold text-ink sm:text-[56px]">
            {title}
          </motion.h1>
          {description && (
            <motion.div {...enter(0.14)} className="mt-4 max-w-[58ch] text-[17.5px] text-ink-2">
              {description}
            </motion.div>
          )}
          {children && <motion.div {...enter(0.2)} className="mt-7">{children}</motion.div>}
        </div>
        {pose && (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.6, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
            className={cn("hidden shrink-0 md:block")}
          >
            <Nybi pose={pose} sign={sign} size={210} motion="float" />
          </motion.div>
        )}
      </div>
      <Wave from="ciel" to={next} variant={1} />
    </header>
  );
}
