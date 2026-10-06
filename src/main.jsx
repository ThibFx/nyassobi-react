import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// App.tsx (or wherever this lives)
import { Suspense, lazy } from "react";

import HttpsRedirect from "react-https-redirect";
import { AnimatePresence } from "motion/react";

import { ApolloProvider } from "@apollo/client/react";
import wordPressClient from "./api/wordPressQuery";

// 🔹 Lazy-loaded pages/routes
const Root = lazy(() => import("./routes/root"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const LegalsMentionPage = lazy(() => import("./pages/LegalsMentionPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const AdhesionPage = lazy(() => import("./pages/AdhesionPage"));
const DonationPage = lazy(() => import("./pages/DonationPage"));
const PrestationPage = lazy(() => import("./pages/PrestationPage"));
const WordPressPage = lazy(() => import("./pages/WordPressPage"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const PresentationPage = lazy(() => import("./pages/PresentationPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AteliersPage = lazy(() => import("./pages/AteliersPage"));
const AtelierDetailPage = lazy(() => import("./pages/AtelierDetailPage"));
const CotisationPage = lazy(() => import("./pages/CotisationPage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root/>,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <HomePage/>
      },
      {
        path: "mentions-legales",
        element: <LegalsMentionPage/>
      },
      // {
      //   path: "adhesion",
      //   element: <AdhesionPage/>
      // },
      // {
      //   path: "donations",
      //   element: <DonationPage/>
      // },
      // {
      //   path: "prestations",
      //   element: <PrestationPage/>
      // },
      // {
      //   path: "presentation",
      //   element: <PresentationPage/>
      // },
      // {
      //   path: "contact",
      //   element: <ContactPage/>
      // },
      {
        path: "news",
        element: <BlogIndex/>
      },
      {
        path: "ateliers",
        element: <AteliersPage/>
      },
      {
        path: "ateliers/:slug",
        element: <AtelierDetailPage/>
      },
      {
        path: "cotisation/:jeton",
        element: <CotisationPage/>
      },
      {
        path: "*",
        element: <WordPressPage/>
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <ApolloProvider client={wordPressClient}>
      {/* Une copie de test servie en HTTP (sur un réseau local) ne doit pas
          être renvoyée vers un HTTPS qui n'existe pas. */}
      <HttpsRedirect disabled={import.meta.env.VITE_SANS_HTTPS === "1"}>
        <AnimatePresence>
          <Suspense fallback={<div className="app-loader"></div>}>
            <RouterProvider router={router} />
          </Suspense>
        </AnimatePresence>
      </HttpsRedirect>
    </ApolloProvider>
  </React.StrictMode>,
)
