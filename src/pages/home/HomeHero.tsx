import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

import { Nybi, type NybiPose } from "@/nybi/Nybi";
import { ButtonLink } from "@/ui/Button";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Émotes qui gravitent autour de Nybi ; chacune dérive à sa vitesse au défilement. */
const SATELLITES: { pose: NybiPose; size: number; className: string; speed: number; delay: number; tilt: number }[] = [
  { pose: "idol", size: 112, className: "left-[2%] top-[4%]", speed: -60, delay: 0.5, tilt: -8 },
  { pose: "gamer", size: 104, className: "left-[-4%] bottom-[22%]", speed: -110, delay: 0.62, tilt: 6 },
  { pose: "artiste", size: 92, className: "right-[6%] top-[0%]", speed: -30, delay: 0.74, tilt: 10 },
];

function Satellite({ item, progress }: { item: (typeof SATELLITES)[number]; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], [0, reduce ? 0 : item.speed]);
  return (
    <motion.div
      style={{ y }}
      initial={reduce ? false : { opacity: 0, scale: 0.4, rotate: item.tilt * 3 }}
      animate={{ opacity: 1, scale: 1, rotate: item.tilt }}
      transition={{ type: "spring", stiffness: 220, damping: 14, delay: item.delay }}
      className={`absolute ${item.className}`}
    >
      <Nybi pose={item.pose} size={item.size} motion="sway" />
    </motion.div>
  );
}

export function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mascotY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);

  const enter = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.75, delay, ease: EASE } });

  return (
    <section ref={ref} aria-labelledby="hero-title" style={{ background: "var(--ciel)" }} className="relative overflow-hidden">
      <span aria-hidden className="absolute -top-56 -left-40 size-[620px] rounded-full opacity-70" style={{ background: "var(--accent-wash)" }} />
      <span aria-hidden className="absolute top-24 -right-40 size-[460px] rounded-full opacity-80" style={{ background: "var(--teal-wash)" }} />

      <div className="relative mx-auto grid w-full max-w-[1180px] items-center gap-6 px-5 pt-32 pb-10 sm:px-8 sm:pt-40 lg:grid-cols-[1.15fr_1fr] lg:pb-16">
        <motion.div style={{ y: textY }}>
          <motion.p {...enter(0.05)} className="mb-5 inline-flex items-center gap-2 rounded-full bg-surface/70 px-4 py-2 font-display text-[15px] font-semibold text-teal-ink shadow-[inset_0_0_0_1.5px_var(--teal-wash)] backdrop-blur">
            <Sparkle size={16} weight="fill" aria-hidden />
            Association loi 1901 du VTubing francophone
          </motion.p>
          <motion.h1 {...enter(0.12)} id="hero-title" className="font-display text-[44px] leading-[1.02] font-semibold tracking-[-0.01em] text-ink sm:text-[64px] lg:text-[74px]">
            Le VTubing francophone, on le fait grandir{" "}
            <span className="squiggle text-accent">ensemble</span>.
          </motion.h1>
          <motion.p {...enter(0.22)} className="mt-6 max-w-[48ch] text-[18.5px] leading-relaxed text-ink-2">
            Nyassobi met en avant les VTubeuses et VTubers francophones&nbsp;: en convention, en ligne et à travers des ateliers pour mieux créer.
          </motion.p>
          <motion.div {...enter(0.32)} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink to="/adhesion" className="min-h-14 px-7 text-[17.5px]">
              Rejoindre l'asso
              <ArrowRight size={19} weight="bold" aria-hidden />
            </ButtonLink>
            <ButtonLink to="/presentation" variant="soft" className="min-h-14 px-7 text-[17.5px]">
              Découvrir Nyassobi
            </ButtonLink>
          </motion.div>
        </motion.div>

        <div className="relative mx-auto h-[340px] w-full max-w-[460px] sm:h-[440px]">
          {SATELLITES.map((item) => (
            <Satellite key={item.pose} item={item} progress={scrollYProgress} />
          ))}
          <motion.div
            style={{ y: mascotY }}
            initial={reduce ? false : { opacity: 0, scale: 0.5, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.25 }}
            className="absolute inset-x-0 bottom-0 flex justify-center"
          >
            <Nybi pose="coucou" size={300} motion="float" label="Nybi, la mascotte de Nyassobi, fait coucou" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
