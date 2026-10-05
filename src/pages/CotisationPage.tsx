import { CheckCircle, CreditCard, Info, LockSimple, WarningCircle } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { siPaypal } from "simple-icons";

import { cotisationQuery, useSettings } from "@/lib/content";
import { Nybi } from "@/nybi/Nybi";
import { Band } from "@/ui/Band";
import { buttonClass, ButtonLink } from "@/ui/Button";
import { cn } from "@/ui/cn";
import { PageHero } from "@/ui/PageHero";
import { BrandIcon } from "@/ui/Social";

/** Messages au retour de HelloAsso ou de PayPal (`?retour=` dans l'adresse). */
const RETOURS: Record<string, { tone: "info" | "bad"; text: string }> = {
  annule: { tone: "info", text: "Paiement annulé, rien n'a été prélevé. Tu peux réessayer quand tu veux." },
  erreur: { tone: "bad", text: "Le paiement n'a pas pu démarrer. Réessaie dans quelques minutes, ou réponds à l'e-mail reçu pour nous prévenir." },
  "en-cours": { tone: "info", text: "Ton paiement est en cours de validation par la banque. Cette page se met à jour toute seule." },
};

/**
 * Page de paiement personnelle, ouverte depuis l'e-mail d'acceptation. Elle
 * ne montre aucune donnée personnelle : seulement le montant et les moyens
 * de payer. Au retour d'un paiement, elle vérifie l'état quelques fois de
 * suite, le temps que la banque confirme.
 */
export default function CotisationPage() {
  const { jeton = "" } = useParams();
  const [params] = useSearchParams();
  const retour = params.get("retour") ?? "";
  const { contactEmail } = useSettings();
  const [polls, setPolls] = useState(0);
  const query = useQuery({
    ...cotisationQuery(jeton),
    refetchInterval: (q) => (["ok", "en-cours"].includes(retour) && q.state.data?.status === "a_payer" && polls < 10 ? 2500 : false),
  });
  const cotisation = query.data;

  useEffect(() => {
    if (query.isFetched) setPolls((value) => value + 1);
  }, [query.dataUpdatedAt, query.isFetched]);

  const waiting = ["ok", "en-cours"].includes(retour) && cotisation?.status === "a_payer";

  return (
    <>
      <title>Cotisation · Nyassobi</title>
      <meta name="robots" content="noindex" />
      <PageHero
        kicker="Adhésion"
        title={cotisation?.status === "payee" ? "C'est réglé, bienvenue !" : "Ta cotisation"}
        description={cotisation?.season ? `Cotisation ${cotisation.season}, valable jusqu'au 31 août.` : undefined}
        pose={cotisation?.status === "payee" ? "idol" : "tresor"}
      />
      <Band tone="creme" narrow className="pt-2">
        {query.isPending && (
          <div aria-busy="true" aria-label="Chargement" className="space-y-4">
            <div className="skeleton h-16 w-40" />
            <div className="skeleton h-14 w-full rounded-full" />
          </div>
        )}

        {query.isError && (
          <Notice tone="bad">La page n'a pas pu être chargée. Vérifie ta connexion et recharge la page.</Notice>
        )}

        {cotisation?.status === "introuvable" && (
          <div className="flex flex-col items-start gap-5">
            <Nybi pose="bleh" size={130} motion="sway" />
            <p className="text-[17px] text-ink-2">
              Ce lien n'est plus valable : la demande a peut-être expiré, ou l'adresse est incomplète. Pour toute question, écris-nous à{" "}
              <a href={`mailto:${contactEmail}`} className="font-semibold text-accent-ink underline underline-offset-3">
                {contactEmail}
              </a>
              .
            </p>
            <ButtonLink to="/adhesion" variant="soft">
              Faire une nouvelle demande
            </ButtonLink>
          </div>
        )}

        {cotisation?.status === "payee" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 rounded-[30px] bg-teal-wash px-6 py-10 text-center" role="status">
            <CheckCircle size={44} weight="fill" className="text-teal" aria-hidden />
            <h2 className="font-display text-[28px] font-semibold text-ink">Cotisation reçue</h2>
            <p className="max-w-[46ch] text-ink-2">Tu fais maintenant partie de Nyassobi. Un e-mail de bienvenue vient de partir, avec la suite pour nous rejoindre sur Discord.</p>
          </motion.div>
        )}

        {cotisation?.status === "a_payer" && (
          <div className="grid gap-7">
            {waiting && (
              <Notice tone="info" pulse>
                Paiement transmis, on attend sa confirmation… Cette page se met à jour toute seule.
              </Notice>
            )}
            {!waiting && RETOURS[retour] && <Notice tone={RETOURS[retour].tone}>{RETOURS[retour].text}</Notice>}

            <div>
              <p className="font-display text-[15px] font-semibold tracking-wide text-teal-ink uppercase">Montant</p>
              <p className="mt-1 flex items-baseline gap-3">
                <span className="font-display text-[64px] leading-none font-semibold text-ink">{cotisation.amount} €</span>
                {cotisation.reducedRate && <span className="rounded-full bg-accent-wash px-3 py-1 font-display font-semibold text-accent-ink">tarif réduit</span>}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {cotisation.cardUrl && (
                <a href={cotisation.cardUrl} className={buttonClass("primary", "min-h-14 px-7 text-[17.5px]")}>
                  <CreditCard size={22} weight="fill" aria-hidden />
                  Payer par carte
                </a>
              )}
              {cotisation.paypalUrl && (
                <a href={cotisation.paypalUrl} className={cn(buttonClass("soft", "min-h-14 px-7 text-[17.5px]"))}>
                  <span className="text-[#003087] dark:text-[#5ea2ff]">
                    <BrandIcon icon={siPaypal} size={20} />
                  </span>
                  Payer avec PayPal
                </a>
              )}
            </div>

            <ul className="grid gap-2 text-[15px] text-ink-2">
              <li className="flex items-start gap-2">
                <LockSimple size={18} weight="fill" aria-hidden className="mt-0.5 shrink-0 text-teal" />
                {cotisation.cardAutomatic
                  ? "La carte passe par HelloAsso, la plateforme de paiement des associations : aucun frais pour Nyassobi. HelloAsso te proposera un pourboire facultatif, libre à toi de le mettre à 0."
                  : "La carte passe par HelloAsso. Le bureau confirmera la réception de ton paiement à la main, sous quelques jours."}
              </li>
              {cotisation.paypalUrl && (
                <li className="flex items-start gap-2">
                  <Info size={18} weight="fill" aria-hidden className="mt-0.5 shrink-0 text-teal" />
                  Avec PayPal, tu paies depuis ton compte PayPal ou par carte, sans rien saisir de plus ici.
                </li>
              )}
            </ul>
          </div>
        )}
      </Band>
    </>
  );
}

function Notice({ tone, pulse = false, children }: { tone: "info" | "bad"; pulse?: boolean; children: React.ReactNode }) {
  const Icon = tone === "bad" ? WarningCircle : Info;
  return (
    <p
      role={tone === "bad" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-[18px] px-5 py-4 text-[15.5px]", tone === "bad" ? "bg-bad-wash text-bad" : "bg-teal-wash text-ink", pulse && "animate-pulse")}
    >
      <Icon size={20} weight="fill" aria-hidden className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
