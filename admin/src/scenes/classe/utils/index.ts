import { canUpdateCenter, canUpdateCohort, isNowBetweenDates, ROLES, STATUS_CLASSE } from "snu-lib";
import { ReferentRoleDto, CohortDto } from "snu-lib/src/dto";
import api from "@/services/api";
import { User } from "@/types";

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

export function getRights(user: User, classe, cohort: CohortDto | undefined) {
  if (!user || !classe || !cohort) return {};
  return {
    canEdit:
      // [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE, ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) &&
      // classe?.status !== STATUS_CLASSE.WITHDRAWN, //à garder car ça va changer
      [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) && classe?.status !== STATUS_CLASSE.WITHDRAWN,
    canEditCohort: canUpdateCohort(cohort, user),
    canEditCenter: canUpdateCenter(cohort, user),
    canEditPDR: user?.role === ROLES.ADMIN,
    showCohort: showCohort(cohort, user),
    showCenter: showCenter(cohort, user),
    showPDR: showPdr(cohort, user),
  };
}

const showCohort = (cohort: CohortDto | undefined, user: User | undefined): boolean => {
  if (!user || !cohort) return false;
  let showCohort = [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user?.role);
  if (!showCohort && user?.role === ROLES.ADMINISTRATEUR_CLE) {
    showCohort = !!cohort.cleDisplayCohortsForAdminCLE && isNowBetweenDates(cohort.cleDisplayCohortsForAdminCLEDate?.from, cohort.cleDisplayCohortsForAdminCLEDate?.to);
  }
  if (!showCohort && user?.role === ROLES.REFERENT_CLASSE) {
    showCohort =
      !!cohort.cleDisplayCohortsForReferentClasse && isNowBetweenDates(cohort.cleDisplayCohortsForReferentClasseDate?.from, cohort.cleDisplayCohortsForReferentClasseDate?.to);
  }
  return showCohort;
};

const showCenter = (cohort: CohortDto | undefined, user: User | undefined): boolean => {
  if (!user || !cohort) return false;
  let showCenter = [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user?.role);
  if (!showCenter && user?.role === ROLES.ADMINISTRATEUR_CLE) {
    showCenter = !!cohort.cleDisplayCentersForAdminCLE && isNowBetweenDates(cohort.cleDisplayCentersForAdminCLEDate?.from, cohort.cleDisplayCentersForAdminCLEDate?.to);
  }
  if (!showCenter && user?.role === ROLES.REFERENT_CLASSE) {
    showCenter =
      !!cohort.cleDisplayCentersForReferentClasse && isNowBetweenDates(cohort.cleDisplayCentersForReferentClasseDate?.from, cohort.cleDisplayCentersForReferentClasseDate?.to);
  }
  return showCenter;
};

const showPdr = (cohort: CohortDto | undefined, user: User | undefined): boolean => {
  if (!user || !cohort) return false;
  let showPdr = [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user?.role);
  if (!showPdr && user?.role === ROLES.ADMINISTRATEUR_CLE) {
    showPdr = !!cohort.cleDisplayPDRForAdminCLE && isNowBetweenDates(cohort.cleDisplayPDRForAdminCLEDate?.from, cohort.cleDisplayPDRForAdminCLEDate?.to);
  }
  if (!showPdr && user?.role === ROLES.REFERENT_CLASSE) {
    showPdr = !!cohort.cleDisplayPDRForReferentClasse && isNowBetweenDates(cohort.cleDisplayPDRForReferentClasseDate?.from, cohort.cleDisplayPDRForReferentClasseDate?.to);
  }
  return showPdr;
};

export const searchSessions = async ({ q, cohort }) => {
  if (!cohort || cohort === "CLE 23-24") return [];

  const query = {
    filters: {
      cohort: [cohort],
    },
    page: 0,
    size: 10,
  };
  // @ts-ignore
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
  // @ts-ignore
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
