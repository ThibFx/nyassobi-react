import type { ReactNode } from "react";

import { Nybi, type NybiPose } from "@/nybi/Nybi";

import { cn } from "./cn";

/**
 * Intitulé de section : une émote officielle, un titre rond, une phrase qui
 * dit ce qui suit. Pas d'icône dans un carré de couleur : c'est Nybi qui
 * annonce la section.
 */
export function SectionHeading({
  id,
  pose,
  kicker,
  title,
  children,
  actions,
  className,
}: {
  id?: string;
  pose?: NybiPose;
  kicker?: string;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 flex flex-wrap items-end gap-x-5 gap-y-4", className)}>
      {pose && <Nybi pose={pose} size={72} motion="none" interactive={false} className="shrink-0 self-center" />}
      <div className="min-w-0 flex-1">
        {kicker && <p className="mb-1 font-display text-[15px] font-semibold tracking-wide text-teal-ink uppercase">{kicker}</p>}
        <h2 id={id} className="font-display text-[30px] leading-[1.1] font-semibold text-ink sm:text-[40px]">
          {title}
        </h2>
        {children && <p className="mt-2 max-w-[60ch] text-[16.5px] text-ink-2">{children}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
