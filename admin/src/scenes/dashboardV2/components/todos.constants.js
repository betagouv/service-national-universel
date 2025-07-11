import { ROLES, DASHBOARD_TODOS_FUNCTIONS } from "snu-lib";
import { isResponsableDeCentre } from "snu-lib";
import { is } from "date-fns/locale";

const getNoteData = (key, user) => {
  const NOTES = {
    // Inscription
    [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_VALIDATION]: {
      title: "Dossier",
      content: "dossiers d'inscription sont en attente de validation.",
      link: `/inscription?status=WAITING_VALIDATION&cohort=$cohortsNotFinished`,
      btnLabel: "À instruire",
    },
    [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_VALIDATION_CORRECTION]: {
      title: "Dossier",
      content: "dossiers d'inscription corrigés sont à instruire de nouveau.",
      link: `/inscription?status=WAITING_VALIDATION&cohort=$cohortsNotFinished`,
      btnLabel: "À instruire",
    },
    [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_CORRECTION]: {
      title: "Dossier",
      content: "dossiers d'inscription en attente de correction.",
      link: `/inscription?status=WAITING_CORRECTION&cohort=$cohortsNotFinished`,
      btnLabel: "À relancer",
    },
    [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_VALIDATION_BY_COHORT]: {
      title: "Dossier",
      content: `dossiers d'inscription en attente de validation pour le séjour de $1`,
      link: `/inscription?cohort=$1&status=WAITING_VALIDATION`,
      args: ["cohort"],
      btnLabel: "À relancer",
    },
    [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.IMAGE_RIGHT]: {
      title: "Dossier",
      content: "volontaires sans accord renseigné pour le séjour de $1",
      link: isResponsableDeCentre(user) ? "centre/$centerId/$sessionId/general?status=VALIDATED&imageRight=N/A" : "volontaire?status=VALIDATED&imageRight=N/A",
      args: ["cohort"],
      btnLabel: "À relancer",
    },

    // Sejour
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_NOT_CONFIRMED]: {
      title: "Point de rassemblement",
      content: "volontaires n'ont pas confirmé leur point de rassemblement pour le séjour de $1",
      link: "/volontaire?status=VALIDATED&hasMeetingInformation=false~N/A&statusPhase1=AFFECTED&cohort=$1",
      args: ["cohort"],
      btnLabel: "À déclarer",
    },
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.PARTICIPATION_NOT_CONFIRMED]: {
      title: "Point de rassemblement",
      content: "volontaires n'ont pas confirmé leur participation pour le séjour de $1",
      link: "/volontaire?status=VALIDATED&youngPhase1Agreement=false~N/A&statusPhase1=AFFECTED&cohort=$1",
      args: ["cohort"],
      btnLabel: "À déclarer",
    },
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.SCHEDULE_NOT_UPLOADED]: {
      title: "Emploi du temps",
      content: "emplois du temps n'ont pas été déposés. $1",
      link: isResponsableDeCentre(user) ? "/centre/$centerId" : "/centre/liste/session?hasTimeSchedule=false&cohort=$1",
      args: ["cohort"],
      btnLabel: "À relancer",
    },
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.PROJECT_NOT_UPLOADED]: {
      title: "Projet pédagogique",
      content: "projets pédagogiques n'ont pas été déposés. $1",
      link: isResponsableDeCentre(user) ? "/centre/$centerId" : "/centre/liste/session?hasPedagoProject=false&cohort=$1",
      args: ["cohort"],
      btnLabel: "À relancer",
    },
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CONTACT_TO_FILL]: {
      title: "Contact",
      content: "Au moins 1 contact de convocation doit être renseigné pour le séjour de $1 ($2)",
      link: user.role === ROLES.REFERENT_DEPARTMENT ? "/team" : null,
      args: ["cohort", "department"],
      btnLabel: "À renseigner",
    },
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.YOUNG_TO_CONTACT]: {
      title: "Cas particuliers",
      content: "volontaires à contacter pour préparer leur accueil pour le séjour de $1",
      link: null,
      args: ["cohort"],
      btnLabel: "À contacter",
    },
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_MANAGER_TO_FILL]: {
      title: "Chef de centre",
      content: "chefs de centre sont à renseigner pour le séjour de $1",
      link: "centre/liste/session?headCenterExist=false&cohort=$1",
      args: ["cohort"],
      btnLabel: "À renseigner",
    },
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CHECKIN]: {
      title: "Pointage",
      content: "centres n'ont pas pointés tous leurs volontaires à l'arrivée au séjour de $1",
      link: isResponsableDeCentre(user) ? "/centre/$centerId/$sessionId/tableau-de-pointage?status=VALIDATED&cohesionStayPresence=N/A" : null,
      args: ["cohort"],
      btnLabel: "À renseigner",
    },
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MODIFICATION_REQUEST]: {
      title: "Plan de transport",
      content: "demandes de modification du plan de transport sont à traiter pour le séjour de $1",
      link: "/ligne-de-bus/demande-de-modification?cohort=$1",
      args: ["cohort"],
      btnLabel: "À traiter",
    },
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.EQUIVALENCE_WAITING_VERIFICATION]: {
      title: "Équivalence",
      content: "demandes d'équivalence MIG sont en attente de vérification",
      link: "/volontaire?status=VALIDATED&status_equivalence=WAITING_VERIFICATION",
      btnLabel: "À traiter",
    },

    // Engagement
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.CONTRACT_TO_EDIT]: {
      title: "Contrat",
      content: "contrats d'engagement sont à éditer par la structure d'accueil et à envoyer en signature.",
      link: "/volontaire?status=VALIDATED&statusPhase2=IN_PROGRESS~WAITING_REALISATION&phase2ApplicationStatus=VALIDATED~IN_PROGRESS&statusPhase2Contract=DRAFT",
      btnLabel: "À suivre",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.CONTRACT_TO_SIGN]: {
      title: "Contrat",
      content: "contrats d'engagement sont en attente de signature.",
      link: "/volontaire?status=VALIDATED&statusPhase2=IN_PROGRESS~WAITING_REALISATION&phase2ApplicationStatus=VALIDATED~IN_PROGRESS&statusPhase2Contract=SENT",
      btnLabel: "À suivre",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.MILITARY_FILE_TO_VALIDATE]: {
      title: "Dossier d’éligibilité",
      content: "dossiers d'éligibilité en préparation militaire sont en attente de vérification.",
      link: "/volontaire?status=VALIDATED&statusMilitaryPreparationFiles=WAITING_VERIFICATION",
      btnLabel: "À vérifier",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.MISSION_TO_VALIDATE]: {
      title: "Mission",
      content: "missions sont en attente de validation.",
      link: "/mission?status=WAITING_VALIDATION",
      btnLabel: "À instruire",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.PHASE3_TO_VALIDATE]: {
      title: "Phase 3",
      content: "demandes de validation de phase 3 à suivre.",
      link: "/volontaire?status=VALIDATED&statusPhase3=WAITING_VALIDATION",
      btnLabel: "À suivre",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT]: {
      title: "Volontaires",
      content: "volontaires ayant commencé leur mission sans contrat signé",
      link: null,
      btnLabel: "À suivre",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS]: {
      title: "Volontaires",
      content: "volontaires ayant commencé leur mission sans statut à jour",
      link: null,
      btnLabel: "À suivre",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS_AFTER_END]: {
      title: "Volontaires",
      content: "volontaires ayant achevé leur mission sans statut à jour",
      link: null,
      btnLabel: "À suivre",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.STRUCTURE_MANAGER]: {
      title: "Contrat",
      content: "représentant de l'État est à renseigner pour le département $1",
      link: "/equipe",
      args: ["department"],
      btnLabel: "À traiter",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_UPDATE_AFTER_END]: {
      title: "Volontaires",
      content: "volontaires ayant achevé leur mission à mettre à jour",
      link: null,
      btnLabel: "À actualiser",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_UPDATE_AFTER_START]: {
      title: "Volontaires",
      content: "volontaires ayant commencé leur mission à mettre à jour",
      link: null,
      btnLabel: "À actualiser",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT_AFTER_START]: {
      title: "Volontaires",
      content: "volontaires ayant commencé leur mission sans contrat signé",
      link: null,
      btnLabel: "À suivre",
    },
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.STRUCTURE_CONTRACT_TO_EDIT]: {
      // Contrat (À suivre) X contrats d’engagement sont à éditer par la structure d’accueil et à envoyer en signature
      title: "Contrat",
      content: "contrats d'engagement sont à éditer par la structure d'accueil et à envoyer en signature.",
      link: "/volontaire/list/all?status=VALIDATED~IN_PROGRESS~DONE&contractStatus=DRAFT",
      btnLabel: "À suivre",
    },
    //Missions (À corriger) X missions sont en attente de correction.
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.STRUCTURE_MISSION_TO_CORRECT]: {
      title: "Mission",
      content: "missions sont en attente de correction.",
      link: "/mission?status=WAITING_CORRECTION",
      btnLabel: "À corriger",
    },
    //Candidatures (À traiter) X candidatures sont en attente de validation.
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.STRUCTURE_APPLICATION_TO_VALIDATE]: {
      title: "Candidatures",
      content: "candidatures sont en attente de validation.",
      link: "/volontaire/list/pending?status=WAITING_VALIDATION",
      btnLabel: "À traiter",
    },
  };

  return NOTES[key];
};

export default getNoteData;
