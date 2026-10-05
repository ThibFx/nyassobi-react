import "./styles/index.css";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { MotionConfig } from "motion/react";
import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import { Layout } from "./layout/Layout";
import HomePage from "./pages/HomePage";

// L'accueil part avec le premier téléchargement ; les autres pages arrivent à
// la demande, pour que la première visite reste légère.
const NewsPage = lazy(() => import("./pages/NewsPage"));
const WpPage = lazy(() => import("./pages/WpPage"));
const AteliersPage = lazy(() => import("./pages/AteliersPage"));
const AtelierPage = lazy(() => import("./pages/AtelierPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));

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

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "news", element: <NewsPage /> },
      // Ancienne adresse de la liste des articles.
      { path: "blog", element: <NewsPage /> },
      { path: "ateliers", element: <AteliersPage /> },
      { path: "ateliers/:slug", element: <AtelierPage /> },
      { path: "mentions-legales", element: <LegalPage /> },
      { path: "*", element: <WpPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: 7 * 24 * 60 * 60_000, buster: "v2" }}>
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </PersistQueryClientProvider>
  </StrictMode>,
);
