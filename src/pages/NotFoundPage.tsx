import { House } from "@phosphor-icons/react";

import { Band } from "@/ui/Band";
import { ButtonLink } from "@/ui/Button";
import { Meta } from "@/ui/Meta";
import { PageHero } from "@/ui/PageHero";

export default function NotFoundPage() {
  return (
    <>
      <Meta title="Page introuvable" />
      <PageHero kicker="Erreur 404" title="Cette page s'est perdue en route" description="Le lien est peut-être ancien, ou la page a déménagé. Nybi n'a rien trouvé non plus." pose="bleh">
        <ButtonLink to="/" icon={<House size={19} weight="fill" aria-hidden />}>
          Retour à l'accueil
        </ButtonLink>
      </PageHero>
      <Band tone="creme">
        <span />
      </Band>
    </>
  );
}
