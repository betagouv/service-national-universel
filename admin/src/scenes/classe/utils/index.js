import { ROLES, STATUS_CLASSE } from "snu-lib";
import api from "@/services/api";

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
      // [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE, ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) &&
      // classe?.status !== STATUS_CLASSE.WITHDRAWN, //à garder car ça va changer
      [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) && classe?.status !== STATUS_CLASSE.WITHDRAWN,
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

export const searchSessions = async ({ q, cohort }) => {
  if (!cohort || cohort === "CLE 23-24") return [];

  const query = {
    filters: {
      cohort: [cohort],
    },
    page: 0,
    size: 10,
  };
  if (q) query.filters.searchbar = [q];

  const { responses } = await api.post(`/elasticsearch/sessionphase1/search?needCohesionCenterInfo=true`, query);
  return responses[0].hits.hits.map((hit) => {
    return {
      value: hit._source,
      _id: hit._id,
      label: hit._source.cohesionCenter.name,
      session: { ...hit._source, _id: hit._id },
    };
  });
};

export const searchPointDeRassemblements = async ({ q, cohort }) => {
  if (!cohort || cohort === "CLE 23-24") return [];

  const query = {
    filters: {
      cohorts: [cohort],
    },
    page: 0,
    size: 10,
  };
  if (q) query.filters.searchbar = [q];

  const { responses } = await api.post(`/elasticsearch/pointderassemblement/search`, query);
  return responses[0].hits.hits.map((hit) => {
    return {
      value: hit._source,
      _id: hit._id,
      label: `${hit._source.name}, ${hit._source.department}`,
      pointDeRassemblement: { ...hit._source, _id: hit._id },
    };
  });
};
