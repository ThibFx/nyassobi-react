import { motion, useReducedMotion } from "motion/react";
import { Suspense } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";

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
      <ScrollRestoration />
    </div>
  );
}
