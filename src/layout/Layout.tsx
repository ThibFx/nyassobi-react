import { motion, useReducedMotion } from "motion/react";
import { Suspense } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";

import { IS_SANDBOX } from "@/lib/wp";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function Layout() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      {/* Chaque page arrive en fondu : la clé suit l'adresse. */}
      <motion.main
        id="contenu"
        key={pathname}
        tabIndex={-1}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex-1 outline-none"
      >
        <Suspense fallback={<div className="min-h-[70vh]" />}>
          <Outlet />
        </Suspense>
      </motion.main>
      <SiteFooter />
      {IS_SANDBOX && (
        <p role="note" className="fixed bottom-3 left-3 z-[55] max-w-[calc(100%-1.5rem)] rounded-full bg-teal px-4 py-2 font-display text-[14px] font-semibold text-white shadow-pop">
          Bac à sable : les formulaires partent vers un WordPress de test, rien n'est envoyé pour de vrai.
        </p>
      )}
      <ScrollRestoration />
    </div>
  );
}
