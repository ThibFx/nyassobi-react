import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faTwitter, faTwitch, faYoutube, faTiktok, faBluesky } from "@fortawesome/free-brands-svg-icons";
import footerStyles from "../Footer.module.scss";

const SOCIAL_LINKS = [
  { href: "https://x.com/Nyassobi", icon: faTwitter, label: "Twitter" },
  { href: "https://bsky.app/profile/nyassobi.bsky.social", icon: faBluesky, label: "BlueSky" },
  { href: "https://www.twitch.tv/nyassobi", icon: faTwitch, label: "Twitch" },
  { href: "https://www.tiktok.com/@nyassobi", icon: faTiktok, label: "TikTok" },
  { href: "https://www.youtube.com/@Nyassobi", icon: faYoutube, label: "YouTube" },
  { href: "https://www.instagram.com/nyassobi/", icon: faInstagram, label: "Instagram" },
  { href: "mailto:nyassobi.association@gmail.com", icon: faEnvelope, label: "E-mail" },
];

function FooterSocialWidget({ wrapperClassName = "", blueIcons = false }) {
  const wrapperClasses = [footerStyles["footer-social-icons"], blueIcons ? footerStyles["social-icon-blue"] : "", wrapperClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      <ul className={footerStyles["social-icons"]}>
        {SOCIAL_LINKS.map(({ href, icon, label }) => (
          <li key={label} className={footerStyles["social-icon"]}>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
              <FontAwesomeIcon icon={icon} size="2x" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FooterSocialWidget;
