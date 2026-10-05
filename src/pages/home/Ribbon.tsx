import { Fragment } from "react";

const WORDS = ["Conventions", "Concerts", "Meet & greet", "Live drawing", "Ateliers", "Conférences", "Jeux interactifs", "VTuber Awards FR", "Événements en ligne"];

/**
 * Ruban orange qui défile en biais entre l'accueil et la suite : il dit en un
 * coup d'œil ce que fait l'association. Pour les lecteurs d'écran, la liste
 * est lue une fois, sans la copie qui sert à boucler.
 */
export function Ribbon() {
  const line = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {WORDS.map((word) => (
        <Fragment key={word}>
          <li className="px-6 font-display text-[22px] font-semibold whitespace-nowrap text-white sm:text-[26px]">{word}</li>
          <li aria-hidden className="text-[20px] text-[#ffd7bd]">
            ✦
          </li>
        </Fragment>
      ))}
    </ul>
  );

  return (
    <div className="relative z-10 -my-7 overflow-hidden py-7">
      <div className="marquee -rotate-[1.8deg] bg-accent py-4 shadow-[0_18px_40px_-20px_var(--accent)]">
        <div className="marquee-track flex w-max">
          {line(false)}
          {line(true)}
        </div>
      </div>
    </div>
  );
}
