import {
  canUpdateCenter,
  canUpdateCohort,
  isNowBetweenDates,
  ROLES,
  STATUS_CLASSE,
  canEditEstimatedSeats,
  canEditTotalSeats,
  TYPE_CLASSE_LIST,
  CLE_GRADE_LIST,
  CLE_FILIERE_LIST,
  translateColoration,
  translateGrade,
  CLE_COLORATION_LIST,
  translate,
  ClasseType,
  isAdmin,
} from "snu-lib";
import { CohortDto } from "snu-lib/src/dto";
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
      statusClasse = "VALIDATED";
      break;

    default:
      statusClasse = null;
      break;
  }
  return statusClasse;
};

export function getRights(user: User, classe?: Pick<ClasseType, "status" | "schoolYear">, cohort?: CohortDto) {
  if (!user || !classe) return {};
  return {
    canEdit:
      ([ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) && classe?.status !== STATUS_CLASSE.WITHDRAWN) ||
      (classe?.status !== STATUS_CLASSE.WITHDRAWN && classe?.schoolYear === "2024-2025" && [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role)),
    canEditEstimatedSeats: canEditEstimatedSeats(user),
    canEditTotalSeats: canEditTotalSeats(user),
    canEditColoration: [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role),
    canEditRef: classe.status === STATUS_CLASSE.CREATED && [ROLES.ADMIN, ROLES.ADMINISTRATEUR_CLE].includes(user.role),

    canEditCohort: cohort ? canUpdateCohort(cohort, user) : isAdmin(user) && classe.status === STATUS_CLASSE.VERIFIED,
    canEditCenter: cohort ? canUpdateCenter(cohort, user) : false,
    canEditPDR: cohort ? isAdmin(user) : false,
    showCohort: showCohort(cohort, user, classe),
    showCenter: cohort ? showCenter(cohort, user) : false,
    showPDR: cohort ? showPdr(cohort, user) : false,
  };
}

const showCohort = (cohort: CohortDto | undefined, user: User | undefined, classe: Pick<ClasseType, "status">): boolean => {
  if (!user) return false;
  if (!cohort) return isAdmin(user) && classe.status === STATUS_CLASSE.VERIFIED;
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

export const colorOptions: {
  value: string;
  label: string;
}[] = Object.keys(CLE_COLORATION_LIST).map((value) => ({
  value: CLE_COLORATION_LIST[value],
  label: translateColoration(CLE_COLORATION_LIST[value]),
}));
export const filiereOptions = Object.keys(CLE_FILIERE_LIST).map((value) => ({
  value: CLE_FILIERE_LIST[value],
  label: CLE_FILIERE_LIST[value],
}));
export const gradeOptions = CLE_GRADE_LIST.filter((value) => value !== "CAP").map((value) => ({
  value: value,
  label: translateGrade(value),
}));
export const typeOptions = Object.keys(TYPE_CLASSE_LIST).map((value) => ({
  value: TYPE_CLASSE_LIST[value],
  label: translate(TYPE_CLASSE_LIST[value]),
}));
