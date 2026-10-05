import { CaretDown, List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { useLocation } from "react-router";

import logo from "@/assets/logo.webp";
import { useMenu, type MenuItem } from "@/lib/content";
import { Nybi } from "@/nybi/Nybi";
import { ButtonLink, SmartLink } from "@/ui/Button";
import { cn } from "@/ui/cn";
import { SocialLinks } from "@/ui/Social";

import { ThemeToggle } from "./ThemeToggle";

function isActive(item: MenuItem, pathname: string) {
  const matches = (path: string) => path !== "/" && (pathname === path || pathname.startsWith(`${path}/`));
  return matches(item.path) || item.children.some((child) => matches(child.path));
}

/**
 * En-tête du site. Transparent sur le ciel des pages ; dès qu'on descend, il
 * se resserre en une barre flottante arrondie, floutée, qui reste à portée.
 */
export function SiteHeader() {
  const menu = useMenu();
  const { pathname } = useLocation();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduce = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Un changement de page referme le menu mobile.
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <a href="#contenu" className="fixed top-3 left-3 z-[60] -translate-y-24 rounded-full bg-accent px-5 py-3 font-semibold text-on-accent focus:translate-y-0">
        Aller au contenu
      </a>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
        <motion.div
          initial={reduce ? false : { y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "pointer-events-auto mx-auto flex max-w-[1240px] items-center gap-3 rounded-full py-2 pr-2 pl-4 transition-[background-color,box-shadow,backdrop-filter] duration-300 sm:pl-5",
            scrolled ? "bg-[color-mix(in_srgb,var(--canvas)_82%,transparent)] shadow-pop backdrop-blur-xl" : "bg-transparent",
          )}
        >
          <SmartLink to="/" className="mr-auto shrink-0 rounded-full" aria-label="Nyassobi, accueil">
            <img src={logo} alt="" width={720} height={218} className={cn("h-auto transition-[width] duration-300", scrolled ? "w-[118px]" : "w-[138px] sm:w-[156px]")} />
          </SmartLink>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {menu.map((item) => (
                <DesktopItem key={item.label} item={item} active={isActive(item, pathname)} />
              ))}
            </ul>
          </nav>

          <ThemeToggle />
          <ButtonLink to="/adhesion" className="hidden min-h-11 px-5 text-[15.5px] sm:inline-flex">
            Adhérer
          </ButtonLink>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOpen}
            className="grid size-11 place-items-center rounded-full bg-accent-wash text-accent-ink lg:hidden"
          >
            <List size={22} weight="bold" aria-hidden />
          </button>
        </motion.div>
      </div>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} menu={menu} pathname={pathname} />
    </>
  );
}

function DesktopItem({ item, active }: { item: MenuItem; active: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeTimer = useRef<number | undefined>(undefined);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  const pill = active && (
    <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-accent-wash" transition={{ type: "spring", stiffness: 480, damping: 38 }} />
  );
  const itemClass = cn(
    "relative isolate inline-flex min-h-11 items-center gap-1 rounded-full px-4 font-display text-[16px] font-semibold transition-colors",
    active ? "text-accent-ink" : "text-ink-2 hover:text-ink",
  );

  if (!item.children.length) {
    return (
      <li>
        <SmartLink to={item.path} className={itemClass} aria-current={active ? "page" : undefined}>
          {pill}
          {item.label}
        </SmartLink>
      </li>
    );
  }

  return (
    <li
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        window.clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        closeTimer.current = window.setTimeout(() => setOpen(false), 160);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button type="button" className={itemClass} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
        {pill}
        {item.label}
        <CaretDown size={14} weight="bold" aria-hidden className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-1/2 z-10 w-[280px] -translate-x-1/2 origin-top pt-3"
          >
            <ul className="rounded-[22px] bg-surface p-2 shadow-sheet">
              {item.children.map((child) => (
                <li key={child.path + child.label}>
                  <SmartLink
                    to={child.path}
                    className={cn(
                      "flex min-h-11 items-center rounded-2xl px-4 font-medium transition-colors hover:bg-accent-wash hover:text-accent-ink",
                      pathname === child.path ? "text-accent-ink" : "text-ink-2",
                    )}
                  >
                    {child.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function MobileMenu({ open, onClose, menu, pathname }: { open: boolean; onClose: () => void; menu: MenuItem[]; pathname: string }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  // Les entrées à sous-menu sont aplaties : au doigt, tout est visible d'un coup.
  const links = menu.flatMap((item) => (item.children.length ? item.children : [item]));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-canvas lg:hidden"
          style={{ backgroundImage: "var(--ciel)" }}
          initial={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 40px) 40px)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 40px) 40px)", transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between px-5 pt-5">
            <img src={logo} alt="" width={720} height={218} className="h-auto w-[130px]" />
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Fermer le menu" className="grid size-12 place-items-center rounded-full bg-accent text-on-accent">
              <X size={22} weight="bold" aria-hidden />
            </button>
          </div>
          <nav aria-label="Navigation principale" className="px-5 pt-8">
            <ul className="space-y-1">
              {links.map((item, index) => (
                <motion.li
                  key={item.path + item.label}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + index * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SmartLink
                    to={item.path}
                    onClick={onClose}
                    aria-current={pathname === item.path ? "page" : undefined}
                    className={cn("flex min-h-13 items-center font-display text-[30px] leading-tight font-semibold", pathname === item.path ? "text-accent" : "text-ink")}
                  >
                    {item.label}
                  </SmartLink>
                </motion.li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex items-end justify-between gap-4 px-5 pt-10 pb-8">
            <div className="space-y-5">
              <ButtonLink to="/adhesion" onClick={onClose}>
                Adhérer à Nyassobi
              </ButtonLink>
              <SocialLinks />
              <ThemeToggle className="bg-accent-wash" />
            </div>
            <Nybi pose="coucou" size={120} motion="float" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
