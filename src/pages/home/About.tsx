import { ArrowRight } from "@phosphor-icons/react";

import { useSettings } from "@/lib/content";
import { Nybi, type NybiPose } from "@/nybi/Nybi";
import { Band } from "@/ui/Band";
import { SmartLink } from "@/ui/Button";
import { Reveal } from "@/ui/Reveal";

const ACTIONS: { pose: NybiPose; sign?: string; title: string; text: string; to: string; link: string }[] = [
  {
    pose: "idol",
    title: "En convention",
    text: "Concerts, jeux, conférences, meet & greet : des VTubers en direct sur nos écrans, et le staff Nyassobi sur place.",
    to: "/prestations",
    link: "Nos prestations",
  },
  {
    pose: "gamer",
    title: "En ligne",
    text: "Des événements réservés aux adhérent·e·s, pour se rencontrer, jouer et créer ensemble toute l'année.",
    to: "/presentation",
    link: "Ce qu'on organise",
  },
  {
    pose: "prof",
    sign: "Atelier",
    title: "En atelier",
    text: "Débuter sur Twitch, créer son avatar PNGTuber, réaliser une cover : des ateliers gratuits, en replay.",
    to: "/ateliers",
    link: "Voir les ateliers",
  },
];

export function About() {
  const { introTextNyassobi } = useSettings();
  const paragraphs = introTextNyassobi.split(/\r?\n\s*\r?\n/).map((text) => text.trim()).filter(Boolean);

  return (
    <Band tone="creme" labelledBy="about-title" className="pt-10">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <Reveal>
          <p className="mb-2 font-display text-[15px] font-semibold tracking-wide text-teal-ink uppercase">Qui sommes-nous</p>
          <h2 id="about-title" className="font-display text-[34px] leading-[1.08] font-semibold text-ink sm:text-[46px]">
            C'est quoi, <span className="text-accent">Nyassobi</span>&nbsp;?
          </h2>
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-ink-2">
            {paragraphs.map((text, index) => (
              <p key={index} className={index === 0 ? "text-[19.5px] leading-[1.55] text-ink" : undefined}>
                {text}
              </p>
            ))}
          </div>
          <SmartLink to="/presentation" className="group mt-7 inline-flex min-h-11 items-center gap-2 font-display text-[17px] font-semibold text-accent-ink">
            Lire la présentation complète
            <ArrowRight size={18} weight="bold" aria-hidden className="transition-transform group-hover:translate-x-1" />
          </SmartLink>
        </Reveal>

        <ol className="relative">
          {ACTIONS.map((action, index) => (
            <li key={action.title}>
              <Reveal delay={index * 0.08} className="group flex items-center gap-5 border-b-[3px] border-dotted border-[var(--pointille)] py-7 first:pt-0 last:border-0">
                <span aria-hidden className="w-14 shrink-0 font-display text-[44px] leading-none font-bold text-transparent [-webkit-text-stroke:2px_var(--accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[24px] font-semibold text-ink">{action.title}</h3>
                  <p className="mt-1 text-[16px] text-ink-2">{action.text}</p>
                  <SmartLink to={action.to} className="mt-2 inline-flex min-h-10 items-center gap-1.5 font-semibold text-teal-ink hover:underline">
                    {action.link}
                    <ArrowRight size={16} weight="bold" aria-hidden />
                  </SmartLink>
                </div>
                <Nybi pose={action.pose} sign={action.sign} size={104} motion="none" interactive={false} className="hidden shrink-0 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 sm:block" />
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Band>
  );
}
