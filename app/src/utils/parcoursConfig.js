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
      importantNote: "Attention, une inscription complète est indispensable pour valider votre candidature au SNU. aller sur [Google](https://www.google.com)",
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
  },
};

export default parcoursConfig;
