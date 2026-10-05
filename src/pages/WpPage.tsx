import { ArrowLeft } from "@phosphor-icons/react";
import { useLocation } from "react-router";

import { useNode, usePosts, type WpNode } from "@/lib/content";
import { plainText } from "@/lib/format";
import { WpContent } from "@/lib/WpContent";
import type { NybiPose } from "@/nybi/Nybi";
import { Band, Wave } from "@/ui/Band";
import { SmartLink } from "@/ui/Button";
import { Meta } from "@/ui/Meta";
import { PageHero } from "@/ui/PageHero";
import { PostMeta } from "@/ui/PostMeta";
import { SectionHeading } from "@/ui/SectionHeading";
import { Thumb } from "@/ui/Thumb";
import { MembershipForm } from "@/widgets/MembershipForm";

import NotFoundPage from "./NotFoundPage";

/** L'émote qui accompagne chaque page : elle dit le ton de la page avant le texte. */
const POSES: Record<string, { pose: NybiPose; sign?: string; kicker: string }> = {
  "/presentation": { pose: "stand", kicker: "L'association" },
  "/status-rgpd": { pose: "prof", sign: "RGPD", kicker: "L'association" },
  "/adhesion": { pose: "calin", kicker: "Nous rejoindre" },
  "/partenaires": { pose: "coucou", kicker: "L'association" },
  "/donations": { pose: "tresor", kicker: "Nous soutenir" },
  "/prestations": { pose: "idol", kicker: "En convention" },
  "/contact": { pose: "panneau", sign: "Coucou !", kicker: "Nous écrire" },
};

/** Nom de fichier d'une image WordPress, sans ses suffixes de taille. */
function imageKey(src: string) {
  return (src.split("/").pop() ?? "").replace(/(-\d+x\d+|-scaled)+(?=\.\w+$)/, "");
}

/** Les rédacteurs remettent souvent l'image à la une en tête d'article : on ne l'affiche pas deux fois. */
function imageAlreadyInContent(node: WpNode) {
  if (!node.image) return false;
  const key = imageKey(node.image.src);
  return [...node.content.matchAll(/<img[^>]+src="([^"]+)"/g)].some((match) => imageKey(match[1] ?? "") === key);
}

function description(node: WpNode) {
  return plainText(node.content).slice(0, 200);
}

export default function WpPage() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  const { data: node, isPending, isError, refetch } = useNode(path);

  if (isPending) return <PageSkeleton />;
  if (isError) {
    return (
      <>
        <PageHero title="Oups, la page ne répond pas" description="WordPress n'a pas répondu à temps. Ça arrive : on réessaie ?" pose="bleh" />
        <Band tone="creme" narrow>
          <button type="button" onClick={() => void refetch()} className="font-display font-semibold text-accent-ink underline underline-offset-4">
            Réessayer
          </button>
        </Band>
      </>
    );
  }
  if (!node) return <NotFoundPage />;
  return node.kind === "post" ? <Article node={node} path={path} /> : <Page node={node} path={path} />;
}

function Page({ node, path }: { node: WpNode; path: string }) {
  const look = POSES[path] ?? { pose: "stand" as NybiPose, kicker: "Nyassobi" };
  const wide = /wp-block-columns/.test(node.content);
  return (
    <>
      <Meta title={node.title} description={description(node)} />
      <PageHero kicker={look.kicker} title={node.title} pose={look.pose} sign={look.sign} />
      <Band tone="creme" narrow={!wide} className="pt-2">
        <WpContent html={node.content} />
      </Band>
      {path === "/adhesion" && (
        <>
          <Wave from="creme" to="peche" variant={2} />
          <Band tone="peche" id="formulaire" labelledBy="formulaire-titre" narrow>
            <SectionHeading id="formulaire-titre" pose="coucou" kicker="Formulaire" title="Demander mon adhésion">
              Le conseil d'administration valide chaque demande. Tu reçois sa réponse par e-mail, puis le lien pour régler ta cotisation.
            </SectionHeading>
            <MembershipForm />
          </Band>
          <Wave from="peche" to="creme" variant={0} flip />
        </>
      )}
    </>
  );
}

function Article({ node, path }: { node: WpNode; path: string }) {
  const { data: posts } = usePosts();
  const others = (posts ?? []).filter((post) => post.path !== path).slice(0, 3);

  return (
    <>
      <Meta title={node.title} description={description(node)} />
      <PageHero
        kicker={
          <SmartLink to="/news" className="inline-flex min-h-10 items-center gap-1.5 hover:text-accent-ink">
            <ArrowLeft size={16} weight="bold" aria-hidden />
            Toutes les news
          </SmartLink>
        }
        title={node.title}
        description={<PostMeta date={node.date} categories={node.categories} />}
      />
      <Band tone="creme" narrow className="pt-2">
        {node.image && !imageAlreadyInContent(node) && <Thumb image={node.image} sizes="(min-width: 800px) 760px, 100vw" ratio="auto" zoom={false} eager className="mb-10 rounded-[26px] shadow-lift [&_img]:h-auto" />}
        <WpContent html={node.content} />
      </Band>
      {others.length > 0 && (
        <>
          <Wave from="creme" to="menthe" variant={1} />
          <Band tone="menthe" labelledBy="others-title">
            <SectionHeading id="others-title" pose="actually" title="À lire aussi" />
            <ul className="grid gap-x-10 gap-y-10 md:grid-cols-3">
              {others.map((post) => (
                <li key={post.id}>
                  <article className="group relative">
                    <Thumb image={post.image} sizes="(min-width: 768px) 360px, 100vw" className="rounded-[22px]" />
                    <PostMeta date={post.date} categories={post.categories} className="mt-4" />
                    <h3 className="mt-2 font-display text-[20px] leading-snug font-semibold text-ink">
                      <SmartLink to={post.path} className="after:absolute after:inset-0 group-hover:text-accent-ink">
                        {post.title}
                      </SmartLink>
                    </h3>
                  </article>
                </li>
              ))}
            </ul>
          </Band>
          <Wave from="menthe" to="creme" variant={2} />
        </>
      )}
    </>
  );
}

function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement de la page">
      <div style={{ background: "var(--ciel)" }} className="px-5 pt-36 pb-16 sm:px-8 sm:pt-44">
        <div className="mx-auto max-w-[1180px]">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton mt-4 h-12 w-[min(560px,90%)]" />
        </div>
      </div>
      <div className="mx-auto max-w-[760px] space-y-3 px-5 py-14">
        {[92, 100, 86, 97, 60].map((width, index) => (
          <div key={index} className="skeleton h-4" style={{ width: `${width}%` }} />
        ))}
      </div>
    </div>
  );
}
