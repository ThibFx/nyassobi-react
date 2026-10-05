import { ArrowRight } from "@phosphor-icons/react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo } from "react";
import { useSearchParams } from "react-router";

import { usePosts } from "@/lib/content";
import { plainText } from "@/lib/format";
import { Band } from "@/ui/Band";
import { SmartLink } from "@/ui/Button";
import { cn } from "@/ui/cn";
import { Meta } from "@/ui/Meta";
import { PageHero } from "@/ui/PageHero";
import { PostMeta } from "@/ui/PostMeta";
import { Thumb } from "@/ui/Thumb";

export default function NewsPage() {
  const { data: posts, isPending, isError } = usePosts();
  const [params, setParams] = useSearchParams();
  const category = params.get("categorie");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    posts?.forEach((post) => post.categories.forEach((name) => counts.set(name, (counts.get(name) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [posts]);

  const shown = category ? (posts ?? []).filter((post) => post.categories.includes(category)) : (posts ?? []);

  const choose = (name: string | null) => {
    const next = new URLSearchParams(params);
    if (name) next.set("categorie", name);
    else next.delete("categorie");
    setParams(next, { replace: true, preventScrollReset: true });
  };

  return (
    <>
      <Meta title="News" description="Les actualités de Nyassobi : conventions, vie associative, ateliers et VTuber Awards FR." />
      <PageHero kicker="Actualités" title="Les news de Nyassobi" description="Conventions, vie de l'association, ateliers, VTuber Awards FR : tout ce qui se passe chez nous." pose="notes">
        {categories.length > 0 && (
          <LayoutGroup>
            <div role="group" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
              {[null, ...categories].map((name) => {
                const active = category === name;
                return (
                  <button
                    key={name ?? "toutes"}
                    type="button"
                    aria-pressed={active}
                    onClick={() => choose(name)}
                    className={cn(
                      "relative isolate min-h-11 rounded-full px-4 font-display text-[15.5px] font-semibold transition-colors",
                      active ? "text-on-accent" : "bg-surface/70 text-ink-2 hover:text-accent-ink",
                    )}
                  >
                    {active && <motion.span layoutId="news-filter" className="absolute inset-0 -z-10 rounded-full bg-accent" transition={{ type: "spring", stiffness: 480, damping: 36 }} />}
                    {name ?? "Toutes"}
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        )}
      </PageHero>

      <Band tone="creme" className="pt-4">
        {isError && <p className="text-ink-2">Les news n'ont pas pu être chargées. Réessaie dans un instant.</p>}
        {isPending && (
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2" aria-busy="true" aria-label="Chargement des news">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <div className="skeleton aspect-video w-full rounded-[24px]" />
                <div className="skeleton mt-4 h-4 w-1/3" />
                <div className="skeleton mt-3 h-7 w-4/5" />
              </div>
            ))}
          </div>
        )}
        <p className="sr-only" role="status">
          {posts ? `${shown.length} article${shown.length > 1 ? "s" : ""}` : ""}
        </p>
        {/* Une grille en quinconce : la colonne de droite est décalée, la page
            se lit comme un journal plutôt que comme un tableau de tuiles. */}
        <motion.ul layout className="grid gap-x-12 gap-y-14 md:grid-cols-2 md:[&>li:nth-child(even)]:translate-y-16">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((post) => (
              <motion.li
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <article className="group relative">
                  <Thumb image={post.image} sizes="(min-width: 768px) 540px, 100vw" className="rounded-[24px]" />
                  <PostMeta date={post.date} categories={post.categories} className="mt-4" />
                  <h2 className="mt-2 font-display text-[24px] leading-tight font-semibold text-ink">
                    <SmartLink to={post.path} className="after:absolute after:inset-0 group-hover:text-accent-ink">
                      {post.title}
                    </SmartLink>
                  </h2>
                  {post.excerpt && <p className="mt-2 line-clamp-2 text-ink-2">{plainText(post.excerpt)}</p>}
                  <span aria-hidden className="mt-3 inline-flex items-center gap-1.5 font-semibold text-teal-ink">
                    Lire
                    <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </article>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        <div className="h-16" />
      </Band>
    </>
  );
}
