import { formatDate } from "@/lib/format";

import { cn } from "./cn";

/** Catégorie en pastille turquoise, puis la date : la ligne qui coiffe chaque article. */
export function PostMeta({ date, categories, className }: { date: string | null; categories: string[]; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-ink-3", className)}>
      {categories[0] && <span className="rounded-full bg-teal-wash px-3 py-1 font-display text-[13.5px] font-semibold text-teal-ink">{categories[0]}</span>}
      {date && <time dateTime={date}>{formatDate(date)}</time>}
    </p>
  );
}
