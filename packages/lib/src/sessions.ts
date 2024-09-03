import { regionsListDROMS } from "./region-and-departments";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "./constants/constants";
import { isCle } from "./young";
import { getZonedDate } from "./utils/date";
import { EtablissementDto } from "./dto";

const COHORTS_WITH_JDM_COUNT = ["2019", "2020", "2021", "2022", "Février 2022", "Juin 2022", "Juillet 2022", "Février 2023 - C", "Avril 2023 - B", "Avril 2023 - A", "Juin 2023"];

const getCohortStartDate = (cohort) => {
  return new Date(cohort.dateStart);
};

const getCohortEndDate = (cohort) => {
  return new Date(cohort.dateEnd);
};

const getSchoolYear = (etablissement: EtablissementDto) => {
  const schoolYears = etablissement?.schoolYears || [];
  return schoolYears[schoolYears.length - 1];
};

const getCohortYear = (cohort) => cohort?.dateStart?.slice(0, 4);

const getCohortPeriod = (cohort, withBold = false) => {
  if (!cohort.dateStart || !cohort.dateEnd) return cohort.name || cohort;
  if (cohort.name === "à venir") return "à venir";
  const startDate = getZonedDate(cohort.dateStart);
  const endDate = getZonedDate(cohort.dateEnd);

  const endDateformatOptions = { year: "numeric", month: "long", day: "numeric" };
  const startDateformatOptions: Partial<typeof endDateformatOptions> = { day: "numeric" };
  if (startDate.getMonth() !== endDate.getMonth()) {
    startDateformatOptions.month = "long";
  }
  if (startDate.getFullYear() !== endDate.getFullYear()) {
    startDateformatOptions.year = "numeric";
  }
  const formattedStart = new Intl.DateTimeFormat("fr-FR", startDateformatOptions as any).format(startDate);
  const formattedEnd = new Intl.DateTimeFormat("fr-FR", endDateformatOptions as any).format(endDate);

  if (withBold) return `du <b>${formattedStart} au ${formattedEnd}</b>`;

  return `du ${formattedStart} au ${formattedEnd}`;
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

function shouldForceRedirectToReinscription(young) {
  return young.cohort === "à venir" && [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.REINSCRIPTION].includes(young.status);
}

const isCohortTooOld = (young) => ["2019", "2020"].includes(young.cohort);

function hasAccessToReinscription(young) {
  if (young.departSejourMotif === "Exclusion") {
    return false;
  }

  if (isCle(young)) {
    if (young.frenchNationality === "false") {
      return false;
    }

    if ([YOUNG_STATUS_PHASE1.DONE].includes(young.statusPhase1)) {
      return false;
    }

    if ([YOUNG_STATUS.ABANDONED, YOUNG_STATUS.WITHDRAWN].includes(young.status)) {
      return true;
    }

    if ([YOUNG_STATUS_PHASE1.NOT_DONE].includes(young.statusPhase1)) {
      return true;
    }

    return false;
  }

  if (isCohortTooOld(young)) {
    return false;
  }

  if (young.cohort === "à venir" && ![YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.REFUSED, YOUNG_STATUS.DELETED, YOUNG_STATUS.NOT_ELIGIBLE].includes(young.status)) {
    return true;
  }
  if (young.status === YOUNG_STATUS.ABANDONED) {
    return true;
  }
  if (young.status === YOUNG_STATUS.WITHDRAWN && ![YOUNG_STATUS_PHASE1.EXEMPTED, YOUNG_STATUS_PHASE1.DONE].includes(young.statusPhase1)) {
    return true;
  }
  if (young.status === YOUNG_STATUS.VALIDATED && young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) {
    return true;
  }

  return false;
}

function shouldForceRedirectToInscription(young, isInscriptionModificationOpen = false) {
  return (
    [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.REINSCRIPTION].includes(young.status) ||
    (isInscriptionModificationOpen &&
      young.status === YOUNG_STATUS.WAITING_VALIDATION &&
      ((young.hasStartedReinscription && young.reinscriptionStep2023 !== "DONE") || (!young.hasStartedReinscription && young.inscriptionStep2023 !== "DONE")))
  );
}

//@todo : for browser apps better logic in app isYoungCanApplyToPhase2Missions (also takes into account timezone)
function canApplyToPhase2(young, cohort) {
  if (young.statusPhase2OpenedAt && new Date(young.statusPhase2OpenedAt) < new Date()) return true;
  const now = new Date();
  const dateEnd = getCohortEndDate(cohort);
  return ["DONE", "EXEMPTED"].includes(young.statusPhase1) && now >= dateEnd;
}

export {
  getSchoolYear,
  getCohortYear,
  getCohortPeriod,
  formatCohortPeriod,
  getCohortPeriodTemp,
  inscriptionCreationOpenForYoungs,
  shouldForceRedirectToReinscription,
  shouldForceRedirectToInscription,
  hasAccessToReinscription,
  isCohortTooOld,
  canApplyToPhase2,
  getCohortStartDate,
  getCohortEndDate,
  COHORTS_WITH_JDM_COUNT,
};
