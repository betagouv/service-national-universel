import { regionsListDROMS } from "./region-and-departments";
const oldSessions = [{ name: "2019" }, { name: "2020" }, { name: "2021" }, { name: "Février 2022" }, { name: "Juin 2022" }, { name: "Juillet 2022" }];

const getCohortPeriod = (cohort) => {
  //@todo : remove this after à venir and old cohort refacto
  if (!cohort.dateStart || !cohort.dateEnd) return cohort.name;
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

  return `du ${formattedStart} au ${formattedEnd}`;
};

const getCohortPeriodTemp = (young) => {
  const { cohort, region } = young;
  if ([...regionsListDROMS, "Polynésie française"].includes(region)) {
    return "du 4 au 16 Juillet 2023";
  }
  return getCohortPeriod(cohort);
};

export { oldSessions, getCohortPeriod, getCohortPeriodTemp };
