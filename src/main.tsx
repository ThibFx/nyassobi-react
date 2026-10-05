import "./styles/index.css";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, type Query } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { MotionConfig } from "motion/react";
import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import { ErrorPage } from "./layout/ErrorPage";
import { Layout } from "./layout/Layout";
import HomePage from "./pages/HomePage";

// L'accueil part avec le premier téléchargement ; les autres pages arrivent à
// la demande, pour que la première visite reste légère.
const NewsPage = lazy(() => import("./pages/NewsPage"));
const WpPage = lazy(() => import("./pages/WpPage"));
const AteliersPage = lazy(() => import("./pages/AteliersPage"));
const AtelierPage = lazy(() => import("./pages/AtelierPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const CotisationPage = lazy(() => import("./pages/CotisationPage"));

/**
 * Après un déploiement, un onglet resté ouvert peut demander un morceau de
 * page qui n'existe plus. Vite le signale par cet événement : on recharge la
 * page une fois pour prendre la nouvelle version, sans boucler si ça échoue.
 */
window.addEventListener("vite:preloadError", (event) => {
  try {
    if (sessionStorage.getItem("nyassobi-recharge") === location.href) return;
    sessionStorage.setItem("nyassobi-recharge", location.href);
  } catch {
    // Stockage indisponible : on recharge quand même, une seule fois par chargement.
  }
  event.preventDefault();
  location.reload();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 24 * 60 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Le contenu déjà vu est gardé dans le navigateur : à la visite suivante, la
 * page s'affiche aussitôt avec la dernière version connue, puis se met à jour
 * en silence si WordPress a changé.
 */
const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? safeStorage() : undefined,
  key: "nyassobi-cache",
});

function safeStorage(): Storage | undefined {
  try {
    const probe = "__nyassobi__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Seuls les contenus publics sont gardés dans le navigateur : ni l'état d'un
 * paiement (dont le lien personnel sert de clé), ni l'ouverture des adhésions.
 */
function shouldDehydrateQuery(query: Query) {
  return query.state.status === "success" && !["cotisation", "membership-open"].includes(String(query.queryKey[0]));
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "news", element: <NewsPage /> },
      // Ancienne adresse de la liste des articles.
      { path: "blog", element: <NewsPage /> },
      { path: "ateliers", element: <AteliersPage /> },
      { path: "ateliers/:slug", element: <AtelierPage /> },
      { path: "mentions-legales", element: <LegalPage /> },
      { path: "cotisation/:jeton", element: <CotisationPage /> },
      { path: "*", element: <WpPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: 7 * 24 * 60 * 60_000, buster: "v2", dehydrateOptions: { shouldDehydrateQuery } }}>
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </PersistQueryClientProvider>
  </StrictMode>,
);
