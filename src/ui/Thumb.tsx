import { useState } from "react";

import type { WpImage } from "@/lib/content";
import { Nybi } from "@/nybi/Nybi";

import { cn } from "./cn";

/**
 * Image d'article ou de vidéo, à ratio fixe pour que rien ne saute au
 * chargement. WordPress fournit plusieurs tailles : le navigateur prend la plus
 * légère qui suffit. Sans image, une émote de Nybi tient la place.
 */
export function Thumb({
  image,
  sizes,
  ratio = "16/9",
  className,
  zoom = true,
  eager = false,
}: {
  image: WpImage | null;
  sizes: string;
  ratio?: string;
  className?: string;
  zoom?: boolean;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-sunken", className)} style={{ aspectRatio: ratio }}>
      {image ? (
        <img
          src={failed && image.fallback ? image.fallback : image.src}
          srcSet={image.srcSet}
          sizes={sizes}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "size-full object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            loaded ? "opacity-100" : "opacity-0",
            zoom && "group-hover:scale-[1.05]",
          )}
        />
      ) : (
        <div className="grid size-full place-items-center bg-accent-wash">
          <Nybi pose="notes" size={90} motion="none" interactive={false} />
        </div>
      )}
    </div>
  );
}
