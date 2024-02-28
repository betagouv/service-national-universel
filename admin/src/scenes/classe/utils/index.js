import { ROLES, STATUS_CLASSE } from "snu-lib";

export const statusClassForBadge = (status) => {
  let statusClasse;

  switch (status) {
    case STATUS_CLASSE.INSCRIPTION_IN_PROGRESS:
      statusClasse = "IN_PROGRESS";
      break;

    case STATUS_CLASSE.INSCRIPTION_TO_CHECK:
      statusClasse = "WAITING_VALIDATION";
      break;

    case STATUS_CLASSE.CREATED:
      statusClasse = "WAITING_LIST";
      break;

    case STATUS_CLASSE.VALIDATED:
      statusClasse = "VALIDATED";
      break;

    case STATUS_CLASSE.WITHDRAWN:
      statusClasse = "CANCEL";
      break;
    case STATUS_CLASSE.DRAFT:
      statusClasse = "DRAFT";
      break;

    default:
      statusClasse = null;
      break;
  }
  return statusClasse;
};

export function getRights(user, classe, cohort) {
  if (!user || !classe || !cohort) return {};
  return {
    canEdit:
      [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE, ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) &&
      classe?.status !== STATUS_CLASSE.WITHDRAWN,
    canEditCohort: [ROLES.ADMIN].includes(user?.role) || (user?.role === ROLES.REFERENT_REGION && (cohort ? cohort.cleUpdateCohortForReferentRegion : true)),
    canEditCenter: user?.role === ROLES.ADMIN || (user?.role === ROLES.REFERENT_REGION && (cohort ? cohort.cleUpdateCentersForReferentRegion : true)),
    canEditPDR: user?.role === ROLES.ADMIN,
    showCohort:
      [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user?.role) ||
      (user?.role === ROLES.ADMINISTRATEUR_CLE && cohort?.cleDisplayCohortsForAdminCLE) ||
      (user?.role === ROLES.REFERENT_CLASSE && cohort?.cleDisplayCohortsForReferentClasse),
    showCenter:
      [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user?.role) ||
      (user?.role === ROLES.ADMINISTRATEUR_CLE && cohort?.cleDisplayCentersForAdminCLE) ||
      (user?.role === ROLES.REFERENT_CLASSE && cohort?.cleDisplayCentersForReferentClasse),
    showPDR:
      [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user?.role) ||
      (user?.role === ROLES.ADMINISTRATEUR_CLE && cohort?.cleDisplayPDRForAdminCLE) ||
      (user?.role === ROLES.REFERENT_CLASSE && cohort?.cleDisplayPDRForReferentClasse),
  };
}
