import { Play } from "@phosphor-icons/react";

import { atelierImage, atelierTitle } from "@/lib/atelier";
import { useAteliers } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Band } from "@/ui/Band";
import { ButtonLink, SmartLink } from "@/ui/Button";
import { Reveal } from "@/ui/Reveal";
import { SectionHeading } from "@/ui/SectionHeading";
import { Thumb } from "@/ui/Thumb";

/**
 * Les replays d'ateliers en bande défilante, comme une étagère de vidéos :
 * on fait glisser au doigt, les vignettes s'arrêtent net sur leur bord.
 */
export function AteliersStrip() {
  const { data: ateliers, isPending } = useAteliers();

  return (
    <Band tone="peche" labelledBy="ateliers-title">
      <SectionHeading
        id="ateliers-title"
        pose="prof"
        kicker="Apprendre ensemble"
        title="Les ateliers, en replay"
        actions={
          <ButtonLink to="/ateliers" variant="soft">
            Tous les ateliers
          </ButtonLink>
        }
      >
        Des ateliers gratuits pour se lancer et progresser dans la création de contenu.
      </SectionHeading>

      <ul className="-mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 [scrollbar-width:thin] sm:-mx-8 sm:px-8">
        {isPending &&
          [0, 1, 2].map((index) => (
            <li key={index} className="w-[300px] shrink-0 sm:w-[360px]">
              <div className="skeleton aspect-video w-full rounded-[22px]" />
              <div className="skeleton mt-4 h-6 w-3/4" />
            </li>
          ))}
        {ateliers?.map((atelier, index) => (
          <li key={atelier.id} className="w-[300px] shrink-0 snap-start sm:w-[360px]">
            <Reveal delay={index * 0.07}>
              <article className="group relative">
                <div className="relative">
                  <Thumb image={atelierImage(atelier)} sizes="360px" className="rounded-[22px]" />
                  <span aria-hidden className="absolute inset-0 grid place-items-center">
                    <span className="grid size-16 place-items-center rounded-full bg-white/90 text-accent shadow-pop transition-transform duration-300 group-hover:scale-110">
                      <Play size={26} weight="fill" />
                    </span>
                  </span>
                </div>
                <p className="mt-4 text-[14px] text-ink-3">{formatDate(atelier.date)}</p>
                <h3 className="mt-1 font-display text-[20px] leading-snug font-semibold text-ink">
                  <SmartLink to={`/ateliers/${atelier.slug}`} className="after:absolute after:inset-0 group-hover:text-accent-ink">
                    {atelierTitle(atelier)}
                  </SmartLink>
                </h3>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Band>
  );
}
