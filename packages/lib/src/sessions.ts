import { regionsListDROMS } from "./region-and-departments";
import { COHORT_STATUS, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "./constants/constants";
import { getZonedDate } from "./utils/date";
import { EtablissementDto } from "./dto";
import { format, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { shouldDisplayDateByCohortName } from "./utils/cohortUtils";
import { CohortType } from "./mongoSchema/cohort";
import { YoungType } from "./mongoSchema/young";

const COHORTS_WITH_JDM_COUNT = ["2019", "2020", "2021", "2022", "Février 2022", "Juin 2022", "Juillet 2022", "Février 2023 - C", "Avril 2023 - B", "Avril 2023 - A", "Juin 2023"];

const getCohortStartDate = (cohort: CohortType) => {
  return getZonedDate(cohort.dateStart);
};

const getCohortEndDate = (cohort: CohortType) => {
  return getZonedDate(cohort.dateEnd);
};

const getSchoolYear = (etablissement?: EtablissementDto) => {
  const schoolYears = etablissement?.schoolYears || [];
  return schoolYears[schoolYears.length - 1];
};

const getCohortYear = (cohort?: CohortType) => cohort?.dateStart?.toString().slice(0, 4);

const getCohortPeriod = (cohort?: Pick<CohortType, "name" | "dateStart" | "dateEnd">, withBold = false) => {
  if (!cohort?.dateStart || !cohort?.dateEnd) return cohort?.name || cohort;

  if (!shouldDisplayDateByCohortName(cohort.name)) {
    return "à venir";
  }

  // Fonction pour formater les dates avec la localisation française
  const formatDate = (dateString, dateFormat) => {
    return format(getZonedDate(dateString), dateFormat, { locale: fr });
  };

  // Formater les mois et années pour comparaison
  const startMonthYear = formatDate(cohort.dateStart, "MMMM yyyy");
  const endMonthYear = formatDate(cohort.dateEnd, "MMMM yyyy");
  const startYear = formatDate(cohort.dateStart, "yyyy");
  const endYear = formatDate(cohort.dateEnd, "yyyy");

  let formattedPeriod;

  // Si même mois et même année
  if (startMonthYear === endMonthYear) {
    formattedPeriod = `du ${formatDate(cohort.dateStart, "d")} au ${formatDate(cohort.dateEnd, "d MMMM yyyy")}`;
  }
  // Si même année mais mois différents
  else if (startYear === endYear) {
    formattedPeriod = `du ${formatDate(cohort.dateStart, "d MMMM")} au ${formatDate(cohort.dateEnd, "d MMMM yyyy")}`;
  }
  // Si mois et années différents
  else {
    formattedPeriod = `du ${formatDate(cohort.dateStart, "d MMMM yyyy")} au ${formatDate(cohort.dateEnd, "d MMMM yyyy")}`;
  }

  // Si `withBold` est activé, on retourne le texte avec des balises <b>
  if (withBold) return `<b>${formattedPeriod}</b>`;

  return formattedPeriod;
};

const formatShortCohortPeriod = (cohort) => {
  if (!cohort.dateStart || !cohort.dateEnd) return cohort.name || cohort;
  if (cohort.name === "à venir") return "à venir";
  const startDate = getZonedDate(cohort.dateStart);
  const endDate = getZonedDate(cohort.dateEnd);

  const startDateformatOptions = {
    day: "numeric",
    month: "numeric",
  };

  const endDateformatOptions = {
    day: "numeric",
    month: "numeric",
  };

  const formattedStart = new Intl.DateTimeFormat("fr-FR", startDateformatOptions as any).format(startDate);
  const formattedEnd = new Intl.DateTimeFormat("fr-FR", endDateformatOptions as any).format(endDate);

  return formattedStart + " > " + formattedEnd;
};

const formatCohortPeriod = (cohort, format = "short", withBold = false) => {
  if (format === "short") {
    return formatShortCohortPeriod(cohort);
  }
  return getCohortPeriod(cohort, withBold);
};

// includes old cohorts and 2023 july with specific dates for DROMS
const getCohortPeriodTemp = (young) => {
  const { cohort, region } = young;
  const cohortName = cohort.name || cohort;
  if (cohortName === "Juillet 2023" && [...regionsListDROMS, "Polynésie française"].includes(region)) {
    return "du 4 au 16 Juillet 2023";
  }
  if (!cohort.dateStart || !cohort.dateEnd) {
    switch (cohortName) {
      case "2019":
        return "du 16 au 28 juin 2019";
      case "2020":
        return "du 21 juin au 2 juillet 2021";
      case "2021":
        return "du 21 juin au 2 juillet 2021";
      case "Février 2022":
        return "du 13 au 25 Février 2022";
      case "Juin 2022":
        return "du 12 au 24 Juin 2022";
      case "Juillet 2022":
        return "du 3 au 15 Juillet 2022";
      default:
        return cohortName;
    }
  }
  return getCohortPeriod(cohort);
};

function inscriptionCreationOpenForYoungs(cohort) {
  if (!cohort?.inscriptionEndDate) return false;
  return new Date() < new Date(cohort.inscriptionEndDate);
}

const isCohortTooOld = (cohort: CohortType) => {
  return cohort?.status === COHORT_STATUS.ARCHIVED;
};

function hasAccessToReinscription(young: YoungType) {
  if (young.departSejourMotif === "Exclusion") {
    return false;
  }
  if ([YOUNG_STATUS.DELETED].includes(young.status as any)) {
    return false;
  }
  return young.cohort === "à venir";
}

const hasValidatedPhase1 = (young: YoungType) =>
  (young.statusPhase2OpenedAt && isPast(young.statusPhase2OpenedAt)) || [YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1 as any);

const didAttendCohesionStay = (young: YoungType) => young.cohesionStayPresence === "true";

// Les volontaires peuvent voir les missions dès qu'ils sont pointés et tant que leur cohorte n'est pas archivée
function canViewMissions(young: YoungType, cohort: CohortType) {
  return (didAttendCohesionStay(young) || hasValidatedPhase1(young)) && !isCohortTooOld(cohort);
}

// Mais ils ne peuvent candidater qu'après avoir été validés
function canCreateApplications(young: YoungType, cohort: CohortType) {
  return hasValidatedPhase1(young) && !isCohortTooOld(cohort);
}

// Ils peuvent demander des reconnaissances d'équivalences même si leur cohorte est archivée.
function canCreateEquivalences(young: YoungType) {
  return hasValidatedPhase1(young);
}

export {
  getSchoolYear,
  getCohortYear,
  getCohortPeriod,
  formatCohortPeriod,
  getCohortPeriodTemp,
  inscriptionCreationOpenForYoungs,
  hasAccessToReinscription,
  isCohortTooOld,
  canViewMissions,
  canCreateApplications,
  canCreateEquivalences,
  getCohortStartDate,
  getCohortEndDate,
  COHORTS_WITH_JDM_COUNT,
};
