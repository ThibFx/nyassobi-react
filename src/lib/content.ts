import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";

import { gql, toSitePath } from "./wp";

/* ------------------------------------------------------------------ Types */

export interface WpImage {
  src: string;
  /** Image de secours si la première n'existe pas (miniature YouTube en haute définition). */
  fallback?: string;
  srcSet?: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface PostSummary {
  id: string;
  title: string;
  path: string;
  date: string;
  excerpt: string;
  image: WpImage | null;
  categories: string[];
}

export interface WpNode {
  kind: "page" | "post";
  title: string;
  content: string;
  date: string | null;
  image: WpImage | null;
  categories: string[];
}

export interface Atelier {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  attachmentUrl: string | null;
  videoUrl: string | null;
  types: string[];
}

export interface Settings {
  contactEmail: string;
  signupFormUrl: string;
  parentalAgreementUrl: string;
  associationStatusUrl: string;
  internalRulesUrl: string;
  introTextNyassobi: string;
  pressKitUrl: string;
}

export interface MenuItem {
  label: string;
  path: string;
  children: MenuItem[];
}

/* ------------------------------------------------------- Normalisation */

interface RawImage {
  node?: { sourceUrl?: string | null; srcSet?: string | null; altText?: string | null; mediaDetails?: { width?: number; height?: number } | null } | null;
}

const IMAGE_FIELDS = `featuredImage { node { sourceUrl srcSet altText mediaDetails { width height } } }`;

function image(raw: RawImage | null | undefined, fallbackAlt: string): WpImage | null {
  const node = raw?.node;
  if (!node?.sourceUrl) return null;
  return {
    src: node.sourceUrl,
    srcSet: node.srcSet ?? undefined,
    alt: node.altText || fallbackAlt,
    width: node.mediaDetails?.width,
    height: node.mediaDetails?.height,
  };
}

function names(raw: { nodes?: ({ name?: string | null } | null)[] } | null | undefined): string[] {
  return (raw?.nodes ?? []).map((node) => node?.name ?? "").filter(Boolean);
}

/* -------------------------------------------------------------- Réglages */

/** Valeurs connues, affichées tant que WordPress n'a pas répondu (et s'il ne répond pas). */
export const DEFAULT_SETTINGS: Settings = {
  contactEmail: "nyassobi.association@gmail.com",
  signupFormUrl: "https://framaforms.org/adhesion-a-lassociation-nyassobi-1744015994",
  parentalAgreementUrl: "https://drive.google.com/file/d/1KJ-kZrnKLHoA9AM3qO4qKPcNdBudSwXJ/",
  associationStatusUrl: "https://drive.google.com/file/d/11PtZQckyWmOuyLgU2P0zW-4XhftSlCic/",
  internalRulesUrl: "https://docs.google.com/document/d/1IKJQm1VKrdHKaLktpq2G3O2L9XFkUd2t8zSlVJFrqEQ/",
  introTextNyassobi:
    "L'association Nyassobi cherche à mettre en avant la communauté des VTubers francophones. Avec des actions en ligne comme en physique, nous voulons permettre à un plus large public de découvrir ce milieu.",
  pressKitUrl: "",
};

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async ({ signal }) => {
    const data = await gql<{ nyassobiSettings: Partial<Record<keyof Settings, string | null>> | null }>(
      `{ nyassobiSettings { contactEmail signupFormUrl parentalAgreementUrl associationStatusUrl internalRulesUrl introTextNyassobi pressKitUrl } }`,
      {},
      signal,
    );
    const raw = data.nyassobiSettings ?? {};
    const merged = { ...DEFAULT_SETTINGS };
    for (const key of Object.keys(merged) as (keyof Settings)[]) {
      const value = raw[key]?.trim();
      if (value) merged[key] = value;
    }
    return merged;
  },
  staleTime: 30 * 60_000,
});

export function useSettings(): Settings {
  return useQuery(settingsQuery).data ?? DEFAULT_SETTINGS;
}

/* ----------------------------------------------------------------- Menu */

/** Le menu actuel de WordPress, pour que l'en-tête s'affiche sans attendre le réseau. */
export const DEFAULT_MENU: MenuItem[] = [
  {
    label: "L'association",
    path: "/presentation",
    children: [
      { label: "Présentation", path: "/presentation", children: [] },
      { label: "Statuts & RGPD", path: "/status-rgpd", children: [] },
      { label: "Rejoindre Nyassobi", path: "/adhesion", children: [] },
      { label: "Ateliers", path: "/ateliers", children: [] },
      { label: "Partenaires", path: "/partenaires", children: [] },
    ],
  },
  { label: "News", path: "/news", children: [] },
  { label: "Donations", path: "/donations", children: [] },
  { label: "Prestations", path: "/prestations", children: [] },
  { label: "Contact", path: "/contact", children: [] },
];

interface RawMenuItem {
  id: string;
  label?: string | null;
  url?: string | null;
  parentId?: string | null;
}

export const menuQuery = queryOptions({
  queryKey: ["menu"],
  queryFn: async ({ signal }) => {
    const data = await gql<{ menus: { nodes: { menuItems: { nodes: RawMenuItem[] } }[] } }>(
      `{ menus(where: { location: PRIMARY }) { nodes { menuItems(first: 100) { nodes { id label url parentId } } } } }`,
      {},
      signal,
    );
    const items = data.menus.nodes[0]?.menuItems.nodes ?? [];
    const toItem = (item: RawMenuItem): MenuItem => ({
      label: item.label ?? "",
      path: toSitePath(item.url ?? "/") ?? item.url ?? "/",
      children: [],
    });
    const roots = items.filter((item) => !item.parentId);
    const menu = roots.map((root) => ({ ...toItem(root), children: items.filter((item) => item.parentId === root.id).map(toItem) }));
    return menu.length ? menu : DEFAULT_MENU;
  },
  staleTime: 30 * 60_000,
});

export function useMenu(): MenuItem[] {
  return useQuery(menuQuery).data ?? DEFAULT_MENU;
}

/* ---------------------------------------------------------------- News */

interface RawPost {
  id: string;
  title?: string | null;
  uri?: string | null;
  date?: string | null;
  excerpt?: string | null;
  featuredImage?: RawImage | null;
  categories?: { nodes?: ({ name?: string | null } | null)[] } | null;
}

export const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: async ({ signal }) => {
    const data = await gql<{ posts: { nodes: RawPost[] } }>(
      `{ posts(first: 60, where: { orderby: { field: DATE, order: DESC } }) { nodes { id title uri date excerpt ${IMAGE_FIELDS} categories { nodes { name } } } } }`,
      {},
      signal,
    );
    return data.posts.nodes.map(
      (post): PostSummary => ({
        id: post.id,
        title: post.title ?? "",
        path: (post.uri ?? "/").replace(/\/+$/, ""),
        date: post.date ?? "",
        excerpt: post.excerpt ?? "",
        image: image(post.featuredImage, post.title ?? ""),
        categories: names(post.categories),
      }),
    );
  },
  staleTime: 5 * 60_000,
});

export function usePosts() {
  return useQuery(postsQuery);
}

/* ------------------------------------------------- Pages et articles */

export function nodeQuery(path: string) {
  const uri = path.replace(/^\/+|\/+$/g, "") || "/";
  return queryOptions({
    queryKey: ["node", uri],
    queryFn: async ({ signal }): Promise<WpNode | null> => {
      const data = await gql<{
        nodeByUri:
          | (RawPost & { __typename: string; content?: string | null })
          | null;
      }>(
        `query Node($uri: String!) { nodeByUri(uri: $uri) { __typename
          ... on Page { title content ${IMAGE_FIELDS} }
          ... on Post { title content date ${IMAGE_FIELDS} categories { nodes { name } } } } }`,
        { uri },
        signal,
      );
      const node = data.nodeByUri;
      if (!node || (node.__typename !== "Page" && node.__typename !== "Post")) return null;
      return {
        kind: node.__typename === "Post" ? "post" : "page",
        title: node.title ?? "",
        content: node.content ?? "",
        date: node.date ?? null,
        image: image(node.featuredImage, node.title ?? ""),
        categories: names(node.categories),
      };
    },
    staleTime: 5 * 60_000,
  });
}

export function useNode(path: string) {
  return useQuery(nodeQuery(path));
}

/** Précharge une page au survol d'un lien : le clic l'affiche sans attente. */
export function prefetchPath(client: QueryClient, path: string) {
  if (path === "/" || path.startsWith("http")) return;
  if (path === "/news") void client.prefetchQuery(postsQuery);
  else if (path.startsWith("/ateliers")) void client.prefetchQuery(ateliersQuery);
  else void client.prefetchQuery(nodeQuery(path));
}

/* ------------------------------------------------------------- Ateliers */

interface RawAtelier {
  id: string;
  slug: string;
  title?: string | null;
  content?: string | null;
  excerpt?: string | null;
  date?: string | null;
  attachmentUrl?: string | null;
  videoUrl?: string | null;
  atelierTypes?: { nodes?: ({ name?: string | null } | null)[] } | null;
}

export const ateliersQuery = queryOptions({
  queryKey: ["ateliers"],
  queryFn: async ({ signal }) => {
    const data = await gql<{ ateliers: { nodes: RawAtelier[] } }>(
      `{ ateliers(first: 100, where: { orderby: { field: DATE, order: DESC } }) { nodes { id slug title content excerpt date attachmentUrl videoUrl atelierTypes { nodes { name } } } } }`,
      {},
      signal,
    );
    return data.ateliers.nodes.map(
      (raw): Atelier => ({
        id: raw.id,
        slug: raw.slug,
        title: raw.title ?? "",
        content: raw.content ?? "",
        excerpt: raw.excerpt ?? "",
        date: raw.date ?? "",
        attachmentUrl: raw.attachmentUrl?.replace(/^http:/, "https:") || null,
        videoUrl: raw.videoUrl || null,
        types: names(raw.atelierTypes),
      }),
    );
  },
  staleTime: 5 * 60_000,
});

export function useAteliers() {
  return useQuery(ateliersQuery);
}

/* ------------------------------------------------------------ Contact */

export async function sendContactMessage(input: { fullname: string; email: string; subject: string; message: string }) {
  const data = await gql<{ sendNyassobiContactMessage: { success: boolean; message: string } }>(
    `mutation Send($input: SendNyassobiContactMessageInput!) { sendNyassobiContactMessage(input: $input) { success message } }`,
    { input },
  );
  return data.sendNyassobiContactMessage;
}

/* ------------------------------------------------------------ Adhésion */

export interface MembershipInput {
  pseudo: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  reducedRate: boolean;
  acceptsRules: boolean;
  acceptsPrivacy: boolean;
}

/** Levée quand le WordPress n'a pas encore le circuit d'adhésion du plugin. */
export class MembershipUnavailable extends Error {}

export async function submitMembership(input: MembershipInput) {
  try {
    const data = await gql<{ submitNyassobiMembership: { success: boolean; message: string } }>(
      `mutation Join($input: SubmitNyassobiMembershipInput!) { submitNyassobiMembership(input: $input) { success message } }`,
      { input },
    );
    return data.submitNyassobiMembership;
  } catch (error) {
    if (error instanceof Error && /Cannot query field|Unknown type/i.test(error.message)) throw new MembershipUnavailable(error.message);
    throw error;
  }
}
