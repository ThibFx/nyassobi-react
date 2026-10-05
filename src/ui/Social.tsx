import { siBluesky, siInstagram, siTiktok, siTwitch, siX, siYoutube, type SimpleIcon } from "simple-icons";

import { cn } from "./cn";

export const SOCIALS: { label: string; href: string; icon: SimpleIcon }[] = [
  { label: "Twitch", href: "https://www.twitch.tv/nyassobi", icon: siTwitch },
  { label: "YouTube", href: "https://www.youtube.com/@Nyassobi", icon: siYoutube },
  { label: "X (Twitter)", href: "https://x.com/Nyassobi", icon: siX },
  { label: "Bluesky", href: "https://bsky.app/profile/nyassobi.bsky.social", icon: siBluesky },
  { label: "TikTok", href: "https://www.tiktok.com/@nyassobi", icon: siTiktok },
  { label: "Instagram", href: "https://www.instagram.com/nyassobi/", icon: siInstagram },
];

export function BrandIcon({ icon, size = 20 }: { icon: SimpleIcon; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="currentColor">
      <path d={icon.path} />
    </svg>
  );
}

/** Rangée de réseaux : des pastilles rondes de 48 px, confortables au doigt. */
export function SocialLinks({ className, tone = "page" }: { className?: string; tone?: "page" | "nuit" }) {
  return (
    <ul className={cn("flex flex-wrap gap-2.5", className)}>
      {SOCIALS.map(({ label, href, icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (nouvel onglet)`}
            title={label}
            className={cn(
              "grid size-12 place-items-center rounded-full transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5",
              tone === "nuit" ? "bg-white/8 text-[#fdf0e8] hover:bg-accent hover:text-white" : "bg-accent-wash text-accent-ink hover:bg-accent hover:text-on-accent",
            )}
          >
            <BrandIcon icon={icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}
