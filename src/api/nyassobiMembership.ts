import { gql } from "@apollo/client";

import { graphQLEndpoint } from "./wordPressQuery";

/**
 * Adresse des envois (adhésion, contact). Par défaut la même que pour les
 * contenus ; un environnement de test peut lire les vrais contenus tout en
 * envoyant ses formulaires à un WordPress de test.
 */
export const writeGraphQLEndpoint: string = import.meta.env.VITE_WRITE_GRAPHQL_URL ?? graphQLEndpoint;

/** À passer en `context` d'une requête Apollo pour la diriger vers les envois. */
export const writeContext = { uri: writeGraphQLEndpoint };

/**
 * Le WordPress reçoit-il les demandes d'adhésion, et à quels tarifs ? Si le
 * plugin n'est pas à jour, la requête échoue : le site garde alors les
 * anciens boutons vers Framaforms.
 */
export const GET_MEMBERSHIP_STATE = gql`
  query GetMembershipState {
    nyassobiMembershipOpen
    nyassobiDiscordJoin
    nyassobiMembershipFees {
      normal
      reduced
    }
  }
`;

export const SUBMIT_MEMBERSHIP = gql`
  mutation SubmitNyassobiMembership($input: SubmitNyassobiMembershipInput!) {
    submitNyassobiMembership(input: $input) {
      success
      message
    }
  }
`;

export const GET_COTISATION = gql`
  query GetCotisation($token: String!) {
    nyassobiCotisation(token: $token) {
      status
      amount
      reducedRate
      season
      cardUrl
      cardAutomatic
      paypalUrl
      discordJoinUrl
      discordJoined
      discordServerUrl
    }
  }
`;
