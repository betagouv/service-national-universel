import { regionsListDROMS } from "./region-and-departments";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "./constants";
const oldSessions = [{ name: "2019" }, { name: "2020" }, { name: "2021" }, { name: "2022" }, { name: "Février 2022" }, { name: "Juin 2022" }, { name: "Juillet 2022" }];

const sessions2023CohortNames = ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023", "Octobre 2023 - NC"];

const getCohortNames = (with2023 = true, withToCome = true, withOld = true) => {
  let cohortNames = [];
  if (with2023) cohortNames = [...cohortNames, ...sessions2023CohortNames];
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

const getCohortPeriod = (cohort, withBold = false) => {
  if (!cohort.dateStart || !cohort.dateEnd) return cohort.name || cohort;
  const startDate = new Date(cohort.dateStart);
  const endDate = new Date(cohort.dateEnd);
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
  if (!cohort?.inscriptionModificationEndDate) return false;
  return new Date() < new Date(cohort.inscriptionModificationEndDate);
}

function inscriptionCreationOpenForYoungs(cohort) {
  if (!cohort?.inscriptionEndDate) return false;
  return new Date() < new Date(cohort.inscriptionEndDate);
}

//@todo: check in cohort list
function reInscriptionOpenForYoungs(env) {
  if (env !== undefined && env !== "production") return true;

  return new Date() >= new Date(2023, 10, 6, 8);
}

function shouldForceRedirectToReinscription(young) {
  return (
    young.cohort === "à venir" && [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.REINSCRIPTION].includes(young.status)
  );
}

function hasAccessToReinscription(young) {
  if (shouldForceRedirectToReinscription(young)) return true;

  if (young.cohort === "à venir" && (young.status === YOUNG_STATUS.VALIDATED || young.status === YOUNG_STATUS.WAITING_LIST)) {
    return true;
  }

  if (young.status === YOUNG_STATUS.VALIDATED && young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE && young.departSejourMotif !== "Exclusion") {
    return true;
  }

  return false;
}

function shouldForceRedirectToInscription(young, isInscriptionModificationOpen = false) {
  return (
    young.cohort !== "à venir" &&
    ([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.REINSCRIPTION].includes(young.status) ||
      (isInscriptionModificationOpen && young.status === YOUNG_STATUS.WAITING_VALIDATION && young.inscriptionStep2023 !== "DONE"))
  );
}

//@todo : for browser apps better logic in app isYoungCanApplyToPhase2Missions (also takes into account timezone)
function canApplyToPhase2(young, cohort) {
  const now = new Date();
  const dateEnd = getCohortEndDate(young, cohort);
  return ["DONE", "EXEMPTED"].includes(young.statusPhase1) && now >= dateEnd;
}

export {
  oldSessions,
  getCohortPeriod,
  getCohortPeriodTemp,
  sessions2023CohortNames,
  getCohortNames,
  inscriptionModificationOpenForYoungs,
  inscriptionCreationOpenForYoungs,
  reInscriptionOpenForYoungs,
  shouldForceRedirectToReinscription,
  shouldForceRedirectToInscription,
  hasAccessToReinscription,
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
