import { HandHeart, Heart } from "@phosphor-icons/react";

import { Nybi } from "@/nybi/Nybi";
import { Band } from "@/ui/Band";
import { ButtonLink } from "@/ui/Button";
import { Reveal } from "@/ui/Reveal";

/** Appel à rejoindre, sur la bande orange : le seul aplat vif de la page. */
export function JoinBand() {
  return (
    <Band tone="accent" labelledBy="join-title" className="overflow-hidden text-white">
      <span aria-hidden className="absolute -top-24 -right-24 size-[380px] rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-32 left-[12%] size-[260px] rounded-full bg-white/8" />
      <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto]">
        <Reveal>
          <p className="mb-2 font-display text-[15px] font-semibold tracking-wide text-[#ffe2d2] uppercase">Adhésion ouverte à tou·te·s</p>
          <h2 id="join-title" className="font-display text-[38px] leading-[1.05] font-semibold sm:text-[54px]">
            Rejoins la bande&nbsp;!
          </h2>
          <p className="mt-4 max-w-[52ch] text-[18px] leading-relaxed text-[#fff1ea]">
            VTuber, artiste, technicien·ne ou simple curieux·se : adhérer, c'est participer aux événements réservés aux membres, et faire grandir la scène francophone avec nous.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/adhesion" variant="white" icon={<Heart size={19} weight="fill" aria-hidden />}>
              Adhérer à Nyassobi
            </ButtonLink>
            <ButtonLink
              to="/donations"
              variant="ghost"
              icon={<HandHeart size={19} weight="fill" aria-hidden />}
              className="text-white shadow-[inset_0_0_0_2px_rgb(255_255_255/0.55)] hover:bg-white/12 hover:text-white"
            >
              Faire un don
            </ButtonLink>
          </div>
        </Reveal>
        <Nybi pose="calin" size={230} motion="float" label="Nybi tend les bras" className="mx-auto" />
      </div>
    </Band>
  );
}
