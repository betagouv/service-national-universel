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
    stepCoordonnees: {
      title: "Mon profil volontaire",
      selectSchoolSituation: true,
      articleSlug: "je-minscris-et-remplis-mon-profil",
      supportEvent: "Phase0/aide inscription - coordonnees",
      CTAEvent: "Phase0/CTA inscription - profil",
    },
    // TODO: Déplacer la liste des étapes depuis le fichier utils de admin vers la lib
    // et l'utiliser ici à la place des "stepMachin"
    stepRepresentant: {
      articleSlug: "je-minscris-et-indique-mes-representants-legaux",
      supportEvent: "Phase0/aide inscription - rep leg",
      CTAEvent: "Phase0/CTA inscription - representants legaux",
      // TODO: centraliser la gestion des successions d'étapes
      nextStepURL: "/inscription2023/documents",
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
    stepCoordonnees: {
      title: "Mon profil élève",
      selectSchoolSituation: false,
      articleSlug: "je-minscris-et-remplis-mon-profil",
      supportEvent: "Phase0/aide inscription - coordonnees",
      CTAEvent: "",
    },
    stepRepresentant: {
      articleSlug: "je-minscris-et-indique-mes-representants-legaux",
      supportEvent: "Phase0/aide inscription - rep leg",
      CTAEvent: "",
      nextStepURL: "/inscription2023/confirm",
    },
  },
};

export default parcoursConfig;
