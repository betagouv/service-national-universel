import { canUpdateCenter, canUpdateCohort, isNowBetweenDates, ROLES, STATUS_CLASSE, canEditEstimatedSeats, canEditTotalSeats, CohortDto } from "snu-lib";
import api from "@/services/api";
import { User } from "@/types";

export const statusClassForBadge = (status) => {
  let statusClasse;

  switch (status) {
    case STATUS_CLASSE.CREATED:
      statusClasse = "WAITING_LIST";
      break;

    case STATUS_CLASSE.VERIFIED:
      statusClasse = "WAITING_VALIDATION";
      break;

    case STATUS_CLASSE.ASSIGNED:
      statusClasse = "WAITING_VALIDATION";
      break;

    case STATUS_CLASSE.WITHDRAWN:
      statusClasse = "REFUSED";
      break;
    case STATUS_CLASSE.CLOSED:
      statusClasse = "CANCEL";
      break;
    case STATUS_CLASSE.OPEN:
      statusClasse = "OPEN";
      break;

    default:
      statusClasse = null;
      break;
  }
  return statusClasse;
};

export function getRights(user: User, classe, cohort: CohortDto | undefined) {
  if (!user || !classe) return {};
  return {
    canEdit:
      ([ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) && classe?.status !== STATUS_CLASSE.WITHDRAWN) ||
      ([STATUS_CLASSE.CREATED, STATUS_CLASSE.VERIFIED].includes(classe?.status) && [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role)),
    canEditEstimatedSeats: canEditEstimatedSeats(user),
    canEditTotalSeats: canEditTotalSeats(user),
    canEditColoration: [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role),

    canEditCohort: cohort ? canUpdateCohort(cohort, user) : false,
    canEditCenter: cohort ? canUpdateCenter(cohort, user) : false,
    canEditPDR: cohort ? user?.role === ROLES.ADMIN : false,
    showCohort: cohort ? showCohort(cohort, user) : false,
    showCenter: cohort ? showCenter(cohort, user) : false,
    showPDR: cohort ? showPdr(cohort, user) : false,
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
