import { ArrowRight } from "@phosphor-icons/react";

import { usePosts } from "@/lib/content";
import { plainText } from "@/lib/format";
import { Band } from "@/ui/Band";
import { ButtonLink, SmartLink } from "@/ui/Button";
import { PostMeta } from "@/ui/PostMeta";
import { Reveal } from "@/ui/Reveal";
import { SectionHeading } from "@/ui/SectionHeading";
import { Thumb } from "@/ui/Thumb";

/**
 * La dernière news en grand, les quatre suivantes en liste serrée à côté :
 * l'œil sait tout de suite ce qui est frais.
 */
export function LatestNews() {
  const { data: posts, isPending, isError } = usePosts();
  const [lead, ...rest] = posts ?? [];

  return (
    <Band tone="menthe" labelledBy="news-title">
      <SectionHeading
        id="news-title"
        pose="notes"
        kicker="Actualités"
        title="Les dernières news"
        actions={
          <ButtonLink to="/news" variant="soft">
            Toutes les news
          </ButtonLink>
        }
      />

      {isError && <p className="text-ink-2">Les news n'ont pas pu être chargées. Réessaie dans un instant.</p>}

      {isPending && (
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr]" aria-busy="true" aria-label="Chargement des news">
          <div>
            <div className="skeleton aspect-video w-full rounded-[26px]" />
            <div className="skeleton mt-5 h-8 w-4/5" />
          </div>
          <div className="space-y-6">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="flex gap-4">
                <div className="skeleton aspect-[4/3] w-28 shrink-0 rounded-[16px]" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-5 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lead && (
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <Reveal>
            <article className="group relative">
              <Thumb image={lead.image} sizes="(min-width: 1024px) 620px, 100vw" className="rounded-[26px] shadow-lift" eager />
              <PostMeta date={lead.date} categories={lead.categories} className="mt-5" />
              <h3 className="mt-2 font-display text-[27px] leading-tight font-semibold text-ink sm:text-[32px]">
                <SmartLink to={lead.path} className="after:absolute after:inset-0 after:rounded-[26px] hover:text-accent-ink">
                  {lead.title}
                </SmartLink>
              </h3>
              {lead.excerpt && <p className="mt-2 line-clamp-3 text-[16.5px] text-ink-2">{plainText(lead.excerpt)}</p>}
            </article>
          </Reveal>

          <ul className="flex flex-col">
            {rest.slice(0, 4).map((post, index) => (
              <li key={post.id}>
                <Reveal delay={0.06 * index}>
                  <article className="group relative flex items-center gap-4 border-b-[3px] border-dotted border-[var(--pointille)] py-5 first:pt-0">
                    <Thumb image={post.image} sizes="128px" ratio="4/3" className="w-28 shrink-0 rounded-[16px] sm:w-32" />
                    <div className="min-w-0 flex-1">
                      <PostMeta date={post.date} categories={post.categories} />
                      <h3 className="mt-1.5 line-clamp-2 font-display text-[18.5px] leading-snug font-semibold text-ink">
                        <SmartLink to={post.path} className="after:absolute after:inset-0 group-hover:text-accent-ink">
                          {post.title}
                        </SmartLink>
                      </h3>
                    </div>
                    <ArrowRight size={18} weight="bold" aria-hidden className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Band>
  );
}
