import { regionsListDROMS } from "./region-and-departments";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "./constants/constants";
import { isCle } from "./young";
import { getZonedDate } from "./utils/date";

const oldSessions = [{ name: "2019" }, { name: "2020" }, { name: "2021" }, { name: "2022" }, { name: "Février 2022" }, { name: "Juin 2022" }, { name: "Juillet 2022" }];

const sessions2023CohortNames = ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023", "Octobre 2023 - NC"];

const sessions2024CohortNames = [
  "Février 2024 - C",
  "Février 2024 - A",
  "Février 2024 - B",
  "Avril 2024 - C",
  "Avril 2024 - A",
  "Avril 2024 - B",
  "Juin 2024 - 2",
  "Juin 2024 - Martinique",
  "Juin 2024 - NC",
  "Juillet 2024",
  "Juillet 2024 - Martinique",
  "Juillet 2024 - Mayotte",
  "Juillet 2024 - PF",
  "CLE 23-24",
  "CLE mars 2024 1",
  "CLE mars 2024 2",
  "CLE mai 2024",
  "CLE juin 2024",
  "CLE juin 2024 Martinique",
  "CLE février 2024 Réunion",
  "CLE GE1 2024",
  "CLE GE2 2024",
  "Toussaint 2024",
];

const getCohortNames = (withNew = true, withToCome = true, withOld = true) => {
  let cohortNames = ["Test"];
  if (withNew) cohortNames = [...cohortNames, ...sessions2023CohortNames, ...sessions2024CohortNames];
  if (withToCome) cohortNames = [...cohortNames, "à venir"];
  if (withOld) cohortNames = [...oldSessions.map((e) => e.name), ...cohortNames];
  return cohortNames;
};

// @todo: to be removed @hlecourt
const COHESION_STAY_START = {
  2019: new Date("06/16/2019"),
  2020: new Date("06/21/2020"),
  2021: new Date("06/21/2021"),
  "Février 2022": new Date("02/13/2022"),
  "Juin 2022": new Date("06/12/2022"),
  "Juillet 2022": new Date("07/03/2022"),
  "Février 2023 - C": new Date("02/19/2023"),
  "Avril 2023 - A": new Date("04/09/2023"),
  "Avril 2023 - B": new Date("04/16/2023"),
  "Juin 2023": new Date("06/11/2023"),
  "Juillet 2023": new Date("07/05/2023"),
  "Octobre 2023 - NC": new Date("10/09/2023"),
  "Février 2024 - C": new Date("02/12/2024"),
  "Février 2024 - A": new Date("02/19/2024"),
  "Février 2024 - B": new Date("02/26/2024"),
  "Avril 2024 - C": new Date("04/08/2024"),
  "Avril 2024 - A": new Date("04/15/2024"),
  "Avril 2024 - B": new Date("04/22/2024"),
  "Juin 2024 - 2": new Date("06/17/2024"),
  "Juin 2024 - Martinique": new Date("06/13/2024"),
  "Juin 2024 - NC": new Date("06/03/2024"),
  "Juillet 2024": new Date("07/03/2024"),
  "Juillet 2024 - Martinique": new Date("07/01/2024"),
  "Juillet 2024 - Mayotte": new Date("07/01/2024"),
  "Juillet 2024 - PF": new Date("07/08/2024"),
  "CLE 23-24": new Date("01/01/2024"),
  "CLE mars 2024 1": new Date("03/11/2024"),
  "CLE mars 2024 2": new Date("03/25/2024"),
  "CLE mai 2024": new Date("05/13/2024"),
  "CLE juin 2024": new Date("06/03/2024"),
  "CLE juin 2024 Martinique": new Date("05/26/2024"),
  "CLE février 2024 Réunion": new Date("02/12/2024"),
  "CLE GE1 2024": new Date("04/22/2024"),
  "CLE GE2 2024": new Date("06/17/2024"),
};

// @todo: to be removed @hlecourt
const START_DATE_SESSION_PHASE1 = {
  "Février 2022": new Date("03/13/2022"),
  "Juin 2022": new Date("06/12/2022"),
  "Juillet 2022": new Date("07/03/2022"),
  "Février 2023 - C": new Date("02/19/2023"),
  "Avril 2023 - A": new Date("04/09/2023"),
  "Avril 2023 - B": new Date("04/16/2023"),
  "Juin 2023": new Date("06/11/2023"),
  "Juillet 2023": new Date("07/04/2023"),
  "Octobre 2023 - NC": new Date("10/09/2023"),
  "Février 2024 - C": new Date("02/12/2024"),
  "Février 2024 - A": new Date("02/19/2024"),
  "Février 2024 - B": new Date("02/26/2024"),
  "Avril 2024 - C": new Date("04/08/2024"),
  "Avril 2024 - A": new Date("04/15/2024"),
  "Avril 2024 - B": new Date("04/22/2024"),
  "Juin 2024 - 2": new Date("06/17/2024"),
  "Juin 2024 - Martinique": new Date("06/13/2024"),
  "Juin 2024 - NC": new Date("06/03/2024"),
  "Juillet 2024": new Date("07/03/2024"),
  "Juillet 2024 - Martinique": new Date("07/01/2024"),
  "Juillet 2024 - Mayotte": new Date("07/01/2024"),
  "Juillet 2024 - PF": new Date("07/08/2024"),
  "CLE 23-24": new Date("01/01/2024"),
  "CLE février 2024 Réunion": new Date("02/12/2024"),
  "CLE mars 2024 1": new Date("03/11/2024"),
  "CLE mars 2024 2": new Date("03/25/2024"),
  "CLE mai 2024": new Date("05/13/2024"),
  "CLE juin 2024": new Date("06/03/2024"),
  "CLE juin 2024 Martinique": new Date("05/26/2024"),
  "CLE GE1 2024": new Date("04/22/2024"),
  "CLE GE2 2024": new Date("06/17/2024"),
};

// @todo: to be removed @hlecourt
const COHESION_STAY_END = {
  2019: new Date("06/28/2019"),
  2020: new Date("07/02/2021"),
  2021: new Date("07/02/2021"),
  "Février 2022": new Date("02/25/2022"),
  "Juin 2022": new Date("06/24/2022"),
  "Juillet 2022": new Date("07/15/2022"),
  "Février 2023 - C": new Date("03/03/2023"),
  "Avril 2023 - A": new Date("04/21/2023"),
  "Avril 2023 - B": new Date("04/28/2023"),
  "Juin 2023": new Date("06/23/2023"),
  "Juillet 2023": new Date("07/17/2023"),
  "Octobre 2023 - NC": new Date("10/20/2023"),
  "Février 2024 - C": new Date("02/24/2024"),
  "Février 2024 - A": new Date("03/02/2024"),
  "Février 2024 - B": new Date("03/09/2024"),
  "Avril 2024 - C": new Date("04/20/2024"),
  "Avril 2024 - A": new Date("04/27/2024"),
  "Avril 2024 - B": new Date("05/04/2024"),
  "Juin 2024 - 2": new Date("06/28/2024"),
  "Juin 2024 - Martinique": new Date("06/24/2024"),
  "Juin 2024 - NC": new Date("06/14/2024"),
  "Juillet 2024": new Date("07/15/2024"),
  "Juillet 2024 - Martinique": new Date("07/12/2024"),
  "Juillet 2024 - Mayotte": new Date("07/12/2024"),
  "Juillet 2024 - PF": new Date("07/20/2024"),
  "CLE 23-24": new Date("31/12/2024"),
  "CLE février 2024 Réunion": new Date("02/24/2024"),
  "CLE mars 2024 1": new Date("03/23/2024"),
  "CLE mars 2024 2": new Date("04/06/2024"),
  "CLE mai 2024": new Date("05/25/2024"),
  "CLE juin 2024": new Date("06/14/2024"),
  "CLE juin 2024 Martinique": new Date("06/07/2024"),
  "CLE GE1 2024": new Date("05/04/2024"),
  "CLE GE2 2024": new Date("06/28/2024"),
};

// @todo: to be removed after adding old cohorts in bd
const START_DATE_PHASE1 = {
  2019: new Date("06/16/2019"),
  2020: new Date("06/21/2021"),
  2021: new Date("06/21/2021"),
  "Février 2022": new Date("02/13/2022"),
  "Juin 2022": new Date("06/12/2022"),
  "Juillet 2022": new Date("07/03/2022"),
};

// @todo: to be removed after adding old cohorts in bd
const END_DATE_PHASE1 = {
  2019: new Date("06/28/2019"),
  2020: new Date("07/02/2021"),
  2021: new Date("07/02/2021"),
  "Février 2022": new Date("02/25/2022"),
  "Juin 2022": new Date("06/24/2022"),
  "Juillet 2022": new Date("07/15/2022"),
};

// @todo: remvove this list and use getCohortEndDate function @GuiPich91
const COHORTS_BEFORE_JULY_2023 = ["2019", "2020", "2021", "2022", "Février 2022", "Juin 2022", "Juillet 2022", "Février 2023 - C", "Avril 2023 - B", "Avril 2023 - A", "Juin 2023"];

const getCohortStartDate = (young, cohort) => {
  return cohort ? new Date(cohort.dateStart) : START_DATE_PHASE1[young.cohort];
};

const getCohortEndDate = (young, cohort) => {
  return cohort ? new Date(cohort.dateEnd) : END_DATE_PHASE1[young.cohort];
};

const getCohortYear = (cohort) => cohort?.dateStart?.slice(0, 4);

const getCohortPeriod = (cohort, withBold = false) => {
  if (!cohort.dateStart || !cohort.dateEnd) return cohort.name || cohort;
  const startDate = getZonedDate(cohort.dateStart);
  const endDate = getZonedDate(cohort.dateEnd);

  const endDateformatOptions = { year: "numeric", month: "long", day: "numeric" };
  const startDateformatOptions = { day: "numeric" };
  if (startDate.getMonth() !== endDate.getMonth()) {
    startDateformatOptions.month = "long";
  }
  if (startDate.getFullYear() !== endDate.getFullYear()) {
    startDateformatOptions.year = "numeric";
  }
  const formattedStart = new Intl.DateTimeFormat("fr-FR", startDateformatOptions).format(startDate);
  const formattedEnd = new Intl.DateTimeFormat("fr-FR", endDateformatOptions).format(endDate);

  if (withBold) return `du <b>${formattedStart} au ${formattedEnd}</b>`;

  return `du ${formattedStart} au ${formattedEnd}`;
};

const formatShortCohortPeriod = (cohort) => {
  if (!cohort.dateStart || !cohort.dateEnd) return cohort.name || cohort;
  const startDate = getZonedDate(cohort.dateStart);
  const endDate = getZonedDate(cohort.dateEnd);

  var startDateformatOptions = {
    day: "numeric",
    month: "numeric",
  };

  var endDateformatOptions = {
    day: "numeric",
    month: "numeric",
  };

  var formattedStart = new Intl.DateTimeFormat("fr-FR", startDateformatOptions).format(startDate);
  var formattedEnd = new Intl.DateTimeFormat("fr-FR", endDateformatOptions).format(endDate);

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

function inscriptionModificationOpenForYoungs(cohort) {
  // FIXME: remove this when all cohorts have inscriptionModificationEndDate
  const date = cohort?.type === "CLE" ? cohort?.inscriptionEndDate : cohort?.inscriptionModificationEndDate;
  if (!date) return false;
  return new Date() < new Date(date);
}

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

    if([YOUNG_STATUS_PHASE1.DONE].includes(young.statusPhase1)){
      return false
    }

    if ([YOUNG_STATUS.ABANDONED, YOUNG_STATUS.WITHDRAWN, ].includes(young.status)) {
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
  const dateEnd = getCohortEndDate(young, cohort);
  return ["DONE", "EXEMPTED"].includes(young.statusPhase1) && now >= dateEnd;
}

export {
  oldSessions,
  getCohortYear,
  getCohortPeriod,
  formatCohortPeriod,
  getCohortPeriodTemp,
  sessions2023CohortNames,
  getCohortNames,
  inscriptionModificationOpenForYoungs,
  inscriptionCreationOpenForYoungs,
  shouldForceRedirectToReinscription,
  shouldForceRedirectToInscription,
  hasAccessToReinscription,
  isCohortTooOld,
  canApplyToPhase2,
  getCohortStartDate,
  getCohortEndDate,
  COHESION_STAY_START,
  START_DATE_SESSION_PHASE1,
  START_DATE_PHASE1,
  END_DATE_PHASE1,
  COHESION_STAY_END,
  COHORTS_BEFORE_JULY_2023,
};
