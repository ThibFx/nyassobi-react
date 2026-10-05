import { EnvelopeSimple, FolderOpen } from "@phosphor-icons/react";

import logo from "@/assets/logo.webp";
import { useMenu, useSettings } from "@/lib/content";
import { Nybi } from "@/nybi/Nybi";
import { FONDS } from "@/ui/Band";
import { SmartLink } from "@/ui/Button";
import { SocialLinks } from "@/ui/Social";

/**
 * Pied de page sur la bande « nuit » : le seul endroit sombre en thème clair,
 * qui ferme la page comme un rideau.
 */
export function SiteFooter() {
  const menu = useMenu();
  const settings = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto text-[#e9d6cc]">
      <div aria-hidden className="relative">
        <div className="absolute right-[8%] bottom-[18px] z-10 sm:bottom-[30px]">
          <Nybi pose="roule-sourire" size={110} motion="sway" interactive={false} />
        </div>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="block h-[46px] w-full sm:h-[72px]">
          <path d="M0,50 C300,88 520,10 820,32 C1080,52 1250,82 1440,38 L1440,80 L0,80 Z" fill={FONDS.nuit} />
        </svg>
      </div>
      <div style={{ background: FONDS.nuit }} className="-mt-px">
        <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-5 pt-10 pb-10 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <img src={logo} alt="Nyassobi" width={720} height={218} loading="lazy" className="h-auto w-[170px]" />
            <p className="mt-5 max-w-[34ch] text-[15.5px] leading-relaxed text-[#cdb5aa]">
              Association loi 1901 qui met en avant les VTubers francophones, en convention comme en ligne.
            </p>
            <SocialLinks tone="nuit" className="mt-6" />
          </div>

          <nav aria-label="Plan du site">
            <h2 className="mb-4 font-display text-[18px] font-semibold text-white">Explorer</h2>
            <ul className="space-y-1">
              {menu
                .flatMap((item) => (item.children.length ? item.children : [item]))
                .map((item) => (
                  <li key={item.path + item.label}>
                    <SmartLink to={item.path} className="inline-flex min-h-10 items-center text-[15.5px] text-[#cdb5aa] transition-colors hover:text-white">
                      {item.label}
                    </SmartLink>
                  </li>
                ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 font-display text-[18px] font-semibold text-white">Nous écrire</h2>
            <ul className="space-y-1 text-[15.5px]">
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="inline-flex min-h-10 items-center gap-2 break-all text-[#cdb5aa] transition-colors hover:text-white">
                  <EnvelopeSimple size={18} aria-hidden className="shrink-0" />
                  {settings.contactEmail}
                </a>
              </li>
              <li>
                <SmartLink to="/contact" className="inline-flex min-h-10 items-center text-[#cdb5aa] transition-colors hover:text-white">
                  Formulaire de contact
                </SmartLink>
              </li>
              {settings.pressKitUrl && (
                <li>
                  <a href={settings.pressKitUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 text-[#cdb5aa] transition-colors hover:text-white">
                    <FolderOpen size={18} aria-hidden />
                    Press kit
                    <span className="sr-only">(nouvel onglet)</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 px-5 py-6 text-[14px] text-[#a88f84] sm:px-8">
          <p>© {year} Nyassobi · Fièrement propulsé par Startingames™ pour la communauté ❤</p>
          <SmartLink to="/mentions-legales" className="inline-flex min-h-10 items-center transition-colors hover:text-white">
            Mentions légales
          </SmartLink>
        </div>
      </div>
    </footer>
  );
}
