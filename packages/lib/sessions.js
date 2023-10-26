import { regionsListDROMS } from "./region-and-departments";
const oldSessions = [{ name: "2019" }, { name: "2020" }, { name: "2021" }, { name: "2022" }, { name: "Février 2022" }, { name: "Juin 2022" }, { name: "Juillet 2022" }];

const sessions2023CohortNames = ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023", "Octobre 2023 - NC"];

const getCohortNames = (with2023 = true, withToCome = false, withOld = false) => {
  let cohortNames = [];
  if (with2023) cohortNames = [...cohortNames, ...sessions2023CohortNames];
  if (withToCome) cohortNames = [...cohortNames, "à venir"];
  if (withOld) cohortNames = [...oldSessions.map((e) => e.name), ...cohortNames];
  return cohortNames;
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
  if (region && [...regionsListDROMS, "Polynésie française"].includes(region)) {
    return "du 4 au 16 Juillet 2023";
  }
  if (!cohort.dateStart || !cohort.dateEnd) {
    const cohortName = cohort.name || cohort;
    switch (cohortName) {
      case "2019":
        return "du 16 au 28 juin 2019";
      case "2020":
        return "du 21 juin au 2 juillet 2021"; // @todo: date to be confirmed
      case "2021":
        return "du 21 juin au 2 juillet 2021";
      case "2022":
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

export { oldSessions, getCohortPeriod, getCohortPeriodTemp, sessions2023CohortNames, getCohortNames };
