import { YOUNG_SOURCE } from "snu-lib";

export const parcoursConfig = {
  [YOUNG_SOURCE.VOLONTAIRE]: {
    stepPreinscriptionDone: {
      youngAppellation: "volontaire",
      isCniRequested: true,
      welcomeText: "Bienvenue {firstName} 🎉",
      accountCreatedText: "Votre compte volontaire a été créé.",
      finalizeInscription:
        "Vous pouvez dès à présent **finaliser votre inscription** ou la reprendre à tout moment depuis le mail envoyé à {email}, ou depuis l’écran de connexion.",
      importantNote: "Attention, une inscription complète est indispensable pour valider votre candidature au SNU.",
    },
    stepInscriptionDone: {
      textValidated: "Vous pouvez désormais accéder à votre compte volontaire",
      textWaitingValidation: "Dès lors que votre Représentant Légal aura consenti à votre participation au SNU, votre dossier sera envoyé à l’administration pour le valider.",
      isJdaRequested: true,
    },
  },
  [YOUNG_SOURCE.CLE]: {
    stepPreinscriptionDone: {
      youngAppellation: "élève",
      isCniRequested: false,
      welcomeText: "Bienvenue {firstName} 🎉",
      accountCreatedText: "Votre compte élève a été créé.",
      finalizeInscription:
        "Vous pouvez dès à présent **finaliser votre inscription** ou la reprendre à tout moment depuis le mail envoyé à {email}, ou depuis l’écran de connexion.",
      importantNote: "Attention, une inscription complète est indispensable pour valider votre candidature au SNU.",
    },
    stepInscriptionDone: {
      textValidated: "Vous pouvez désormais accéder à votre compte élève",
      textWaitingValidation:
        "Dès lors que votre Représentant Légal aura consenti à votre participation au SNU, votre dossier sera envoyé à votre établissement scolaire pour le valider.",
      isJdaRequested: false,
    },
  },
};

export default parcoursConfig;
