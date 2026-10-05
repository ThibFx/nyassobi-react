import { Moon, Sun } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";

import { switchTheme, useResolvedTheme } from "@/lib/theme";
import { cn } from "@/ui/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useResolvedTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        switchTheme(next, { x: box.left + box.width / 2, y: box.top + box.height / 2 });
      }}
      aria-label={next === "dark" ? "Passer en thème sombre" : "Passer en thème clair"}
      className={cn("relative grid size-11 place-items-center overflow-hidden rounded-full text-ink-2 transition-colors hover:bg-accent-wash hover:text-accent-ink", className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 18, rotate: -60, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -18, rotate: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="grid place-items-center"
        >
          {theme === "dark" ? <Moon size={21} weight="fill" aria-hidden /> : <Sun size={21} weight="fill" aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
