import { gql } from "@apollo/client";

/**
 * Conventions où Nyassobi cherche du staff et des animateurs. Comme pour
 * l'adhésion, tout passe par le point d'envoi (writeContext), qui peut être
 * un WordPress de test.
 */
export const GET_CONVENTIONS = gql`
  query GetConventions {
    nyassobiConventions {
      id
      name
      city
      dates
      needs
      open
      description
      link
      images
      news {
        date
        text
        image
      }
    }
    nyassobiConventionsLoginUrl
  }
`;

export const GET_CONVENTION_SESSION = gql`
  query GetConventionSession($session: String!) {
    nyassobiConventionSession(session: $session) {
      name
      member
      choices {
        conventionId
        role
        travel
        transport
      }
      animation
      comment
    }
  }
`;

export const SUBMIT_CONVENTION_RESPONSE = gql`
  mutation SubmitConventionResponse($input: SubmitNyassobiConventionResponseInput!) {
    submitNyassobiConventionResponse(input: $input) {
      success
      message
    }
  }
`;
