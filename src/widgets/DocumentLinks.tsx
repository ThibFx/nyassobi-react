import { BookOpenText, FileText, Scales, UserCirclePlus } from "@phosphor-icons/react";

import { useSettings } from "@/lib/content";
import { ButtonLink } from "@/ui/Button";

/** Boutons vers les documents de l'association, dont les adresses vivent dans WordPress. */
export function DocumentLinks({ set }: { set: "statuts" | "adhesion" }) {
  const settings = useSettings();
  if (set === "statuts") {
    return (
      <div className="not-prose my-6 flex flex-wrap gap-3">
        <ButtonLink to={settings.associationStatusUrl} variant="soft" icon={<Scales size={19} aria-hidden />}>
          Statuts associatifs
        </ButtonLink>
        <ButtonLink to={settings.internalRulesUrl} variant="soft" icon={<BookOpenText size={19} aria-hidden />}>
          Règlement intérieur
        </ButtonLink>
      </div>
    );
  }
  // Le formulaire d'adhésion est désormais sur la page même.
  return (
    <div className="my-6 flex flex-wrap gap-3">
      <ButtonLink to="#formulaire" icon={<UserCirclePlus size={19} aria-hidden />}>
        Formulaire d'adhésion
      </ButtonLink>
      <ButtonLink to={settings.parentalAgreementUrl} variant="soft" icon={<FileText size={19} aria-hidden />}>
        Autorisation parentale
      </ButtonLink>
    </div>
  );
}
