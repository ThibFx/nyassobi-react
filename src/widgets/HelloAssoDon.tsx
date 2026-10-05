import { HandHeart } from "@phosphor-icons/react";
import { useState } from "react";

import { buttonClass } from "@/ui/Button";

const WIDGET = "https://www.helloasso.com/associations/nyassobi/formulaires/1/widget";

/**
 * Formulaire de don HelloAsso. Il ne se charge qu'au clic : l'iframe pèse
 * lourd et dépose des cookies tiers, inutile de l'imposer à qui lit la page.
 */
export function HelloAssoDon() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <div className="my-8 flex flex-col items-start gap-3 rounded-[26px] bg-accent-wash px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-ink">
          Le don passe par <strong>HelloAsso</strong>, la plateforme de paiement des associations.
        </p>
        <button type="button" className={buttonClass("primary")} onClick={() => setOpen(true)}>
          <HandHeart size={20} weight="fill" aria-hidden />
          Faire un don
        </button>
      </div>
    );
  }
  return (
    <iframe
      title="Formulaire de don HelloAsso"
      src={WIDGET}
      className="my-8 block h-[760px] w-full rounded-[26px] bg-white"
      style={{ border: 0, aspectRatio: "auto" }}
    />
  );
}
