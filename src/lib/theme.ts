/**
 * Thème: le système tant que le visiteur n'a rien choisi, puis clair ou
 * sombre. « system » reste un état interne, le bouton ne le propose pas.
 */

import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "nyassobi-theme";
const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

let preference: ThemePreference = typeof window === "undefined" ? "system" : readPreference();

function apply(next: ThemePreference): void {
  const root = document.documentElement;
  if (next === "system") delete root.dataset.theme;
  else root.dataset.theme = next;
}

export function setThemePreference(next: ThemePreference): void {
  preference = next;
  try {
    if (next === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Stockage indisponible (navigation privée): le choix vaut pour la session.
  }
  apply(next);
  listeners.forEach((listener) => listener());
}

/**
 * Change de thème en révélant le nouveau par un cercle qui s'ouvre depuis
 * `origin` (le bouton cliqué) jusqu'aux coins de la fenêtre. Passe par l'API
 * View Transitions: le navigateur fige une image de l'ancien thème et découpe
 * le nouveau par-dessus. Sans cette API, ou avec « réduire les animations »,
 * le changement est immédiat.
 */
export function switchTheme(next: ThemePreference, origin?: { x: number; y: number }): void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!origin || reduce || typeof document.startViewTransition !== "function") {
    setThemePreference(next);
    return;
  }
  const radius = Math.hypot(Math.max(origin.x, window.innerWidth - origin.x), Math.max(origin.y, window.innerHeight - origin.y));
  const transition = document.startViewTransition(() => {
    flushSync(() => setThemePreference(next));
  });
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
        { duration: 560, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {
      // Transition abandonnée (autre changement en cours): le thème est déjà appliqué.
    });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", listener);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", listener);
  };
}

/** Thème effectivement affiché, préférence système résolue. */
export function useResolvedTheme(): "light" | "dark" {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (preference !== "system") return preference;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    },
    () => "light",
  );
}
