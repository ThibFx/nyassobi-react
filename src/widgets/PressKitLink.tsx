import { FolderOpen } from "@phosphor-icons/react";

import { useSettings } from "@/lib/content";
import { ButtonLink } from "@/ui/Button";

export function PressKitLink() {
  const { pressKitUrl } = useSettings();
  if (!pressKitUrl) return null;
  return (
    <div className="my-5">
      <ButtonLink to={pressKitUrl} variant="teal" icon={<FolderOpen size={19} weight="fill" aria-hidden />}>
        Télécharger le press kit
      </ButtonLink>
    </div>
  );
}
