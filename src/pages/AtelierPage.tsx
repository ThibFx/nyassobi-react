import { ArrowLeft, DownloadSimple, Play, YoutubeLogo } from "@phosphor-icons/react";
import { useState } from "react";
import { useParams } from "react-router";

import { atelierImage, atelierSupport, atelierTitle } from "@/lib/atelier";
import { useAteliers } from "@/lib/content";
import { formatDate, plainText, youtubeId } from "@/lib/format";
import { WpContent } from "@/lib/WpContent";
import { Band } from "@/ui/Band";
import { ButtonLink, SmartLink } from "@/ui/Button";
import { Meta } from "@/ui/Meta";
import { PageHero } from "@/ui/PageHero";
import { Thumb } from "@/ui/Thumb";

import NotFoundPage from "./NotFoundPage";

/**
 * Lecteur YouTube en façade : on montre la miniature, et le vrai lecteur
 * (lourd, avec ses traceurs) ne se charge qu'au clic, en mode sans cookie.
 */
function VideoFacade({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return (
      <iframe
        title={`Replay : ${title}`}
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="aspect-video w-full rounded-[26px] bg-black shadow-lift"
      />
    );
  }
  return (
    <button type="button" onClick={() => setPlaying(true)} className="group relative block w-full rounded-[26px]" aria-label={`Lire le replay : ${title}`}>
      <Thumb image={{ src: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, fallback: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: "" }} sizes="1000px" className="rounded-[26px] shadow-lift" eager />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-24 place-items-center rounded-full bg-accent text-white shadow-pop transition-transform duration-300 group-hover:scale-110">
          <Play size={38} weight="fill" aria-hidden />
        </span>
      </span>
    </button>
  );
}

export default function AtelierPage() {
  const { slug } = useParams();
  const { data: ateliers, isPending } = useAteliers();
  const atelier = ateliers?.find((item) => item.slug === slug);

  if (isPending) {
    return (
      <div aria-busy="true" aria-label="Chargement de l'atelier" className="px-5 pt-40">
        <div className="mx-auto max-w-[1000px]">
          <div className="skeleton h-12 w-3/4" />
          <div className="skeleton mt-10 aspect-video w-full rounded-[26px]" />
        </div>
      </div>
    );
  }
  if (!atelier) return <NotFoundPage />;

  const video = youtubeId(atelier.videoUrl);
  const support = atelierSupport(atelier);
  const title = atelierTitle(atelier);

  return (
    <>
      <Meta title={`Atelier : ${title}`} description={plainText(atelier.excerpt || atelier.content).slice(0, 200)} />
      <PageHero
        kicker={
          <SmartLink to="/ateliers" className="inline-flex min-h-10 items-center gap-1.5 hover:text-accent-ink">
            <ArrowLeft size={16} weight="bold" aria-hidden />
            Tous les ateliers
          </SmartLink>
        }
        title={title}
        description={
          <p className="flex flex-wrap items-center gap-3 text-[15px] text-ink-3">
            {atelier.types.map((type) => (
              <span key={type} className="rounded-full bg-accent-wash px-3 py-1 font-display text-[14px] font-semibold text-accent-ink">
                {type}
              </span>
            ))}
            <span>Mis en ligne le {formatDate(atelier.date)}</span>
          </p>
        }
      />
      <Band tone="creme" className="pt-2">
        <div className="mx-auto max-w-[1000px]">
          {video ? <VideoFacade id={video} title={title} /> : <Thumb image={atelierImage(atelier)} sizes="1000px" className="rounded-[26px]" />}
          <div className="mt-6 flex flex-wrap gap-3">
            {support && (
              <ButtonLink to={support} variant="teal" icon={<DownloadSimple size={19} weight="bold" aria-hidden />}>
                Télécharger le support
              </ButtonLink>
            )}
            {atelier.videoUrl && (
              <ButtonLink to={atelier.videoUrl} variant="soft" icon={<YoutubeLogo size={20} weight="fill" aria-hidden />}>
                Voir sur YouTube
              </ButtonLink>
            )}
          </div>
        </div>
        {atelier.content && <WpContent html={atelier.content} className="mx-auto mt-12 max-w-[760px]" />}
      </Band>
    </>
  );
}
