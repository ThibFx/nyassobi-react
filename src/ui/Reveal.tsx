import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Fait monter un bloc en fondu quand il entre à l'écran, une seule fois.
 * Avec « réduire les animations », le bloc est simplement là.
 */
export function Reveal({ children, delay = 0, className, y = 22 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
