import { ArrowRight, Play } from "@phosphor-icons/react";

import { atelierImage, atelierTitle } from "@/lib/atelier";
import { useAteliers } from "@/lib/content";
import { formatDate, plainText } from "@/lib/format";
import { Band } from "@/ui/Band";
import { SmartLink } from "@/ui/Button";
import { cn } from "@/ui/cn";
import { Meta } from "@/ui/Meta";
import { PageHero } from "@/ui/PageHero";
import { Reveal } from "@/ui/Reveal";
import { Thumb } from "@/ui/Thumb";

export default function AteliersPage() {
  const { data: ateliers, isPending, isError } = useAteliers();

  return (
    <>
      <Meta title="Ateliers" description="Les ateliers gratuits de Nyassobi pour se lancer dans le VTubing et la création de contenu, en replay." />
      <PageHero
        kicker="Apprendre ensemble"
        title="Les ateliers Nyassobi"
        description="Débuter sur Twitch, créer son avatar, réaliser une cover… Des ateliers gratuits animés par la communauté, à revoir quand tu veux."
        pose="prof"
        sign="Atelier"
      />
      <Band tone="creme" className="pt-4">
        {isError && <p className="text-ink-2">Les ateliers n'ont pas pu être chargés. Réessaie dans un instant.</p>}
        {isPending && (
          <div className="space-y-14" aria-busy="true" aria-label="Chargement des ateliers">
            {[0, 1].map((index) => (
              <div key={index} className="grid gap-8 md:grid-cols-2">
                <div className="skeleton aspect-video rounded-[26px]" />
                <div className="space-y-3 pt-4">
                  <div className="skeleton h-4 w-1/4" />
                  <div className="skeleton h-9 w-4/5" />
                  <div className="skeleton h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Chaque atelier en rangée, l'image alternant de côté : un fil qui se
            déroule plutôt qu'une grille de vignettes identiques. */}
        <ol className="space-y-16 sm:space-y-20">
          {ateliers?.map((atelier, index) => (
            <li key={atelier.id}>
              <Reveal>
                <article className="group relative grid items-center gap-8 md:grid-cols-2 md:gap-14">
                  <div className={cn("relative", index % 2 === 1 && "md:order-2")}>
                    <Thumb image={atelierImage(atelier)} sizes="(min-width: 768px) 540px, 100vw" className="rounded-[26px] shadow-lift" />
                    <span aria-hidden className="absolute inset-0 grid place-items-center">
                      <span className="grid size-20 place-items-center rounded-full bg-white/92 text-accent shadow-pop transition-transform duration-300 group-hover:scale-110">
                        <Play size={32} weight="fill" />
                      </span>
                    </span>
                  </div>
                  <div>
                    <p className="flex flex-wrap items-center gap-3 text-[14px] text-ink-3">
                      {atelier.types.map((type) => (
                        <span key={type} className="rounded-full bg-accent-wash px-3 py-1 font-display text-[13.5px] font-semibold text-accent-ink">
                          {type}
                        </span>
                      ))}
                      <time dateTime={atelier.date}>{formatDate(atelier.date)}</time>
                    </p>
                    <h2 className="mt-3 font-display text-[28px] leading-tight font-semibold text-ink sm:text-[34px]">
                      <SmartLink to={`/ateliers/${atelier.slug}`} className="after:absolute after:inset-0 group-hover:text-accent-ink">
                        {atelierTitle(atelier)}
                      </SmartLink>
                    </h2>
                    {atelier.excerpt && <p className="mt-3 line-clamp-3 text-[16.5px] text-ink-2">{plainText(atelier.excerpt)}</p>}
                    <span aria-hidden className="mt-4 inline-flex items-center gap-1.5 font-display text-[17px] font-semibold text-teal-ink">
                      Voir l'atelier
                      <ArrowRight size={17} weight="bold" className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </Band>
    </>
  );
}
