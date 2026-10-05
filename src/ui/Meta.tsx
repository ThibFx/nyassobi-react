/**
 * Titre d'onglet et description de la page. React 19 remonte ces balises
 * dans le <head> tout seul ; elles servent aux moteurs de recherche qui
 * exécutent le JavaScript (Google) et à l'historique du navigateur.
 */
export function Meta({ title, description }: { title?: string; description?: string }) {
  const full = title ? `${title} · Nyassobi` : "Nyassobi · Association du VTubing francophone";
  return (
    <>
      <title>{full}</title>
      {description && <meta name="description" content={description.slice(0, 300)} />}
    </>
  );
}
