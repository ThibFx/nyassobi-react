import { useQuery } from "@apollo/client/react";

import styles from "./NyassoButtonTwo.module.scss";
import AdhesionForm from "./AdhesionForm";
import { useNyassobiSettings } from "../hooks/useNyassobiSettings";
import { GET_MEMBERSHIP_STATE, writeContext } from "../api/nyassobiMembership";

const DEFAULT_FEES = { normal: 20, reduced: 15 };

/**
 * Bloc « adhésion » de la page Rejoindre. Quand WordPress reçoit les demandes
 * (plugin à jour et Discord configuré), le formulaire du site s'affiche ici ;
 * sinon, les boutons vers le formulaire Framaforms restent comme avant. La
 * page WordPress n'a donc pas besoin d'être modifiée.
 */
function NyassoButtonTwo() {
  const { settings } = useNyassobiSettings();
  const { data, loading } = useQuery(GET_MEMBERSHIP_STATE, {
    context: writeContext,
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  // Rien pendant la vérification, pour ne pas montrer les anciens boutons
  // une fraction de seconde avant le formulaire.
  if (loading) {
    return <div className={styles.nyassoBtn} aria-busy="true" />;
  }

  if (data?.nyassobiMembershipOpen) {
    return <AdhesionForm fees={data.nyassobiMembershipFees ?? DEFAULT_FEES} discordJoin={Boolean(data.nyassobiDiscordJoin)} />;
  }

  return (
    <div className={styles.nyassoBtn}>
      <a href={settings.signupFormUrl} target="_blank" rel="noopener noreferrer">
        <button className={styles.button}>
          Formulaire d'adhésion
        </button>
      </a>

      <a href={settings.parentalAgreementUrl} target="_blank" rel="noopener noreferrer">
        <button className={styles.button}>
          Autorisation parentale
        </button>
      </a>
    </div>
  );
}

export default NyassoButtonTwo;
