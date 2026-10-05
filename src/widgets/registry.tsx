import type { ComponentType } from "react";

import { ContactForm } from "./ContactForm";
import { DocumentLinks } from "./DocumentLinks";
import { HelloAssoDon } from "./HelloAssoDon";
import { PressKitLink } from "./PressKitLink";
import { SocialWidget } from "./SocialWidget";

/**
 * Widgets que les rédacteurs placent dans une page WordPress avec
 * `<wp-component name="…">`. Les noms sont ceux de l'ancien site : les pages
 * déjà écrites continuent de marcher sans retouche.
 */
export const WIDGETS: Record<string, ComponentType> = {
  NyassoButtonOne: () => <DocumentLinks set="statuts" />,
  NyassoButtonTwo: () => <DocumentLinks set="adhesion" />,
  DonNyassoWidget: HelloAssoDon,
  NyassoContact: ContactForm,
  NyassoSocial: SocialWidget,
  PressKitButton: PressKitLink,
  PressKit: PressKitLink,
};
