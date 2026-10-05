/**
 * Accès au WordPress de l'association, par WPGraphQL.
 *
 * Un simple `fetch` suffit : le cache et les états de chargement sont tenus par
 * React Query. Apollo, utilisé avant, pesait à lui seul plus que tout le reste
 * du site.
 */

export const GRAPHQL_URL: string = import.meta.env.VITE_WORDPRESS_GRAPHQL_URL ?? "https://admin.nyassobi.fr/graphql";

/**
 * Adresse des envois (adhésion, contact). Par défaut la même ; le bac à sable
 * lit les vrais contenus mais envoie ses formulaires à un WordPress de test.
 */
export const WRITE_GRAPHQL_URL: string = import.meta.env.VITE_WRITE_GRAPHQL_URL ?? GRAPHQL_URL;

/** Version de test du site : un bandeau le rappelle sur chaque page. */
export const IS_SANDBOX = import.meta.env.VITE_BAC_A_SABLE === "1";

/** Racine du WordPress (sans `/graphql`), pour reconnaître ses liens internes. */
export const WP_ORIGIN = new URL(GRAPHQL_URL, typeof window === "undefined" ? "http://localhost" : window.location.origin).origin;

export class WpError extends Error {}

export async function gql<T>(query: string, variables: Record<string, unknown> = {}, signal?: AbortSignal, endpoint = GRAPHQL_URL): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal,
  });
  if (!response.ok) throw new WpError(`WordPress a répondu ${response.status}.`);
  const payload = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (payload.errors?.length) throw new WpError(payload.errors[0]?.message ?? "Erreur WordPress.");
  if (!payload.data) throw new WpError("Réponse vide de WordPress.");
  return payload.data;
}

/**
 * Transforme un lien WordPress en chemin du site : les rédacteurs collent des
 * adresses `admin.nyassobi.fr/...` qui doivent rester dans le site React.
 * Les liens vers les fichiers téléversés, eux, restent sur WordPress.
 */
export function toSitePath(href: string): string | null {
  try {
    const url = new URL(href, WP_ORIGIN);
    const sameHost = url.origin === WP_ORIGIN || url.origin === window.location.origin;
    if (!sameHost || url.pathname.startsWith("/wp-")) return null;
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return `${path}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
