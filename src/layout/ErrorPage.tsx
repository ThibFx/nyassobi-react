import { ArrowClockwise, House } from "@phosphor-icons/react";
import { isRouteErrorResponse, useRouteError } from "react-router";

import logo from "@/assets/logo.webp";
import { Nybi } from "@/nybi/Nybi";
import { buttonClass } from "@/ui/Button";

/**
 * Filet de sécurité : remplace l'écran technique (en anglais) du routeur quand
 * une page plante. Il ne dépend ni de l'en-tête ni des données, qui peuvent
 * être la cause de l'erreur.
 */
export function ErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main style={{ background: "var(--ciel)" }} className="grid min-h-dvh place-items-center px-5 py-16">
      <title>{notFound ? "Page introuvable · Nyassobi" : "Oups · Nyassobi"}</title>
      <div className="flex max-w-[560px] flex-col items-center gap-6 text-center">
        <a href="/" aria-label="Nyassobi, accueil">
          <img src={logo} alt="" width={720} height={218} className="h-auto w-[150px]" />
        </a>
        <Nybi pose="bleh" size={160} motion="sway" />
        <h1 className="font-display text-[34px] leading-tight font-semibold text-ink sm:text-[42px]">
          {notFound ? "Cette page s'est perdue en route" : "Oups, la page a trébuché"}
        </h1>
        <p className="text-[17px] text-ink-2">
          {notFound
            ? "Le lien est peut-être ancien, ou la page a déménagé."
            : "Un souci est survenu en l'affichant. Recharger la page règle le problème la plupart du temps."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {!notFound && (
            <button type="button" onClick={() => location.reload()} className={buttonClass("primary")}>
              <ArrowClockwise size={19} weight="bold" aria-hidden />
              Recharger la page
            </button>
          )}
          <a href="/" className={buttonClass(notFound ? "primary" : "soft")}>
            <House size={19} weight="fill" aria-hidden />
            Retour à l'accueil
          </a>
        </div>
      </div>
    </main>
  );
}
