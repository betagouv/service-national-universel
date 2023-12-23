import { regionsListDROMS } from "./region-and-departments";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "./constants";
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
  "Juillet 2024",
  "CLE 23-24",
  "CLE mars 2024 1",
  "CLE mars 2024 2",
  "CLE mai 2024",
  "CLE juin 2024",
  "CLE mai 2024 Martinique",
  "CLE juin 2024 Martinique",
  "CLE mars 2024 Guadeloupe",
  "CLE mai 2024 Guadeloupe",
  "CLE mars 2024 Guyane",
  "CLE avril 2024 Guyane",
  "CLE mai 2024 Guyane",
  "CLE février 2024 Réunion",
  "CLE mars 2024 Réunion",
  "CLE avril 2024 Réunion",
  "CLE mai 2024 Mayotte",
  "CLE juin 2024 Mayotte",
];

const getCohortNames = (withNew = true, withToCome = true, withOld = true) => {
  let cohortNames = [];
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
  "Juillet 2024": new Date("07/03/2024"),
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
  "Juillet 2024": new Date("07/03/2024"),
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
  "Juillet 2024": new Date("07/15/2024"),
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

function shouldForceRedirectToReinscription(young) {
  return (
    young.cohort === "à venir" && [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.REINSCRIPTION].includes(young.status)
  );
}

function hasAccessToReinscription(young) {
  if (shouldForceRedirectToReinscription(young)) return true;

  if ([YOUNG_STATUS.ABANDONED, YOUNG_STATUS.WITHDRAWN].includes(young.status) && !(young.departSejourMotif === "Exclusion")) {
    return true;
  }

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
      (isInscriptionModificationOpen &&
        young.status === YOUNG_STATUS.WAITING_VALIDATION &&
        ((young.hasStartedReinscription && young.reinscriptionStep2023 !== "DONE") || (!young.hasStartedReinscription && young.inscriptionStep2023 !== "DONE"))))
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
  getCohortYear,
  getCohortPeriod,
  getCohortPeriodTemp,
  sessions2023CohortNames,
  getCohortNames,
  inscriptionModificationOpenForYoungs,
  inscriptionCreationOpenForYoungs,
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
