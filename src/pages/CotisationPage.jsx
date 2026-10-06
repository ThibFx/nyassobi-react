import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

import styles from "./CotisationPage.module.scss";
import pageStyles from "./WordPressPage.module.scss";
import buttonStyles from "../components/NyassoButtonTwo.module.scss";
import TitleNyasso from "../TitleNyasso";
import Footer from "../Footer";
import Loader from "../components/Loader";
import { useNyassobiSettings } from "../hooks/useNyassobiSettings";
import { GET_COTISATION, writeContext } from "../api/nyassobiMembership";

/** Messages au retour de HelloAsso ou de PayPal (`?retour=` dans l'adresse). */
const RETOURS = {
  annule: { error: false, text: "Paiement annulé, rien n'a été prélevé. Tu peux réessayer quand tu veux." },
  erreur: { error: true, text: "Le paiement n'a pas pu démarrer. Réessaie dans quelques minutes, ou réponds à l'e-mail reçu pour nous prévenir." },
  "en-cours": { error: false, text: "Ton paiement est en cours de validation par la banque. Cette page se met à jour toute seule." },
};

/**
 * Page de paiement personnelle, ouverte depuis l'e-mail d'acceptation. Elle
 * ne montre aucune donnée personnelle : seulement le montant et les moyens de
 * payer. Au retour d'un paiement, elle revérifie quelques fois l'état, le
 * temps que la banque confirme.
 */
function CotisationPage() {
  const { jeton = "" } = useParams();
  const [params] = useSearchParams();
  const retour = params.get("retour") ?? "";
  const { settings } = useNyassobiSettings();
  const [checks, setChecks] = useState(0);
  const { data, loading, error, refetch } = useQuery(GET_COTISATION, {
    variables: { token: jeton },
    context: writeContext,
    fetchPolicy: "network-only",
  });
  const cotisation = data?.nyassobiCotisation;
  const waiting = ["ok", "en-cours"].includes(retour) && cotisation?.status === "a_payer";

  useEffect(() => {
    if (!waiting || checks >= 10) return undefined;
    const timer = setTimeout(() => {
      setChecks((value) => value + 1);
      refetch();
    }, 2500);
    return () => clearTimeout(timer);
  }, [waiting, checks, refetch]);

  let title = "Ta cotisation";
  if (cotisation?.status === "payee") title = "C'est réglé, bienvenue !";

  return (
    <>
      <div className={pageStyles.pageViewport}>
        <article className={pageStyles.simplePage}>
          <TitleNyasso title={title} />
          <div className={pageStyles.simpleContent}>
            {loading && <Loader label="Chargement de ta cotisation..." />}

            {error && <p className={styles.notice}>La page n'a pas pu être chargée. Vérifie ta connexion et recharge la page.</p>}

            {cotisation?.status === "introuvable" && (
              <p>
                Ce lien n'est plus valable : la demande a peut-être expiré, ou l'adresse est incomplète. Pour toute question, écris-nous à{" "}
                <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>.
              </p>
            )}

            {cotisation?.status === "payee" && (
              <div className={styles.paid} role="status">
                <p className={styles.paidTitle}>Cotisation reçue</p>
                <p>Tu fais maintenant partie de Nyassobi. Un e-mail de bienvenue vient de partir, avec la suite pour nous rejoindre sur Discord.</p>
              </div>
            )}

            {cotisation?.status === "a_payer" && (
              <>
                {waiting && (
                  <p className={styles.notice} role="status">
                    Paiement transmis, on attend sa confirmation… Cette page se met à jour toute seule.
                  </p>
                )}
                {!waiting && RETOURS[retour] && (
                  <p className={`${styles.notice} ${RETOURS[retour].error ? styles.noticeError : ""}`} role={RETOURS[retour].error ? "alert" : "status"}>
                    {RETOURS[retour].text}
                  </p>
                )}

                <p className={styles.season}>Cotisation {cotisation.season}, valable jusqu'au 31 août.</p>
                <p className={styles.amount}>
                  {cotisation.amount} €{cotisation.reducedRate && <span className={styles.reduced}>tarif réduit</span>}
                </p>

                <div className={buttonStyles.nyassoBtn}>
                  {cotisation.cardUrl && (
                    <a href={cotisation.cardUrl} className={buttonStyles.button}>
                      Payer par carte
                    </a>
                  )}
                  {cotisation.paypalUrl && (
                    <a href={cotisation.paypalUrl} className={`${buttonStyles.button} ${styles.paypal}`}>
                      Payer avec PayPal
                    </a>
                  )}
                </div>

                <p className={styles.small}>
                  {cotisation.cardAutomatic
                    ? "La carte passe par HelloAsso, la plateforme de paiement des associations : aucun frais pour Nyassobi. Tu y saisiras les coordonnées de la personne qui paie (toi, ou ton parent si tu es mineur·e). HelloAsso proposera un pourboire facultatif, libre à toi de le mettre à 0."
                    : "La carte passe par HelloAsso. Le bureau confirmera la réception de ton paiement à la main, sous quelques jours."}
                </p>
              </>
            )}
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
}

export default CotisationPage;
