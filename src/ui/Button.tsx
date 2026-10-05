import { ArrowUpRight } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router";

import { prefetchPath } from "@/lib/content";

import { cn } from "./cn";

export type ButtonVariant = "primary" | "teal" | "soft" | "white" | "ghost";

const VARIANTS: Record<ButtonVariant, string> = {
  // Le bouton principal porte l'orange Nyassobi, avec une ombre de la même teinte.
  primary: "sheen bg-accent text-on-accent shadow-[0_10px_22px_-12px_var(--accent)] hover:brightness-105 hover:shadow-[0_14px_26px_-12px_var(--accent)]",
  teal: "sheen bg-teal text-white shadow-[0_10px_22px_-12px_var(--teal)] hover:brightness-105 dark:text-[#10201e]",
  soft: "bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:text-accent-ink hover:shadow-[inset_0_0_0_1.5px_var(--accent)]",
  // Sur la bande orange : blanc plein, texte orange foncé.
  white: "sheen bg-white text-[#b3441a] shadow-[0_10px_24px_-14px_rgb(0_0_0/0.5)] hover:bg-[#fff6f0]",
  ghost: "text-ink-2 hover:bg-accent-wash hover:text-accent-ink",
};

const BASE =
  "inline-flex min-h-12 select-none items-center justify-center gap-2 rounded-full px-6 font-display text-[16.5px] font-semibold whitespace-nowrap transition-[transform,background-color,color,box-shadow,filter] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]";

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(BASE, VARIANTS[variant], className);
}

/**
 * Lien en forme de bouton. Interne : passe par le routeur et précharge la page
 * au survol. Externe : s'ouvre dans un nouvel onglet, avec la flèche qui le dit.
 */
export function ButtonLink({
  to,
  variant = "primary",
  icon,
  className,
  children,
  ...props
}: { to: string; variant?: ButtonVariant; icon?: ReactNode; className?: string; children: ReactNode } & Omit<ComponentProps<"a">, "href">) {
  const client = useQueryClient();
  const external = /^(https?:|mailto:)/.test(to);
  if (external) {
    return (
      <a href={to} target={to.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" className={buttonClass(variant, className)} {...props}>
        {icon}
        {children}
        {!to.startsWith("mailto:") && <ArrowUpRight size={17} weight="bold" aria-hidden />}
        {!to.startsWith("mailto:") && <span className="sr-only">(nouvel onglet)</span>}
      </a>
    );
  }
  return (
    <Link to={to} className={buttonClass(variant, className)} onPointerEnter={() => prefetchPath(client, to)} onFocus={() => prefetchPath(client, to)} {...props}>
      {icon}
      {children}
    </Link>
  );
}

/** Lien de navigation interne qui précharge sa page au survol ou au focus. */
export function SmartLink({ to, children, ...props }: { to: string; children: ReactNode } & Omit<ComponentProps<typeof Link>, "to">) {
  const client = useQueryClient();
  return (
    <Link to={to} onPointerEnter={() => prefetchPath(client, to)} onFocus={() => prefetchPath(client, to)} {...props}>
      {children}
    </Link>
  );
}
