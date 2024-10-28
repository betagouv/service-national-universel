import { CohortDto, getCohortPeriod, translate } from "snu-lib";
import API from "./api";
import { IIntermediateFilter, DataFilter } from "@/components/filters-system-v2/components/Filter";
import { orderCohort } from "@/components/filters-system-v2/components/filters/utils";
import { isBefore } from "date-fns";

export const getCohortByName = async (cohortName) => {
  try {
    const { ok, code, data } = await API.get(`/cohort/${cohortName}`);
    if (!ok) {
      throw {
        title: "Une erreur s'est produite :",
        message: translate(code),
      };
    }
    return {
      data,
    };
  } catch (error) {
    console.error(error);
    throw {
      title: "Oups, une erreur est survenue pendant la supression du (de la) volontaire :",
      message: translate(error.code),
    };
  }
};

export const getCohorts = async () => {
  try {
    const { ok, code, data } = await API.get("/cohort");
    if (!ok) {
      console.error("Error loading cohorts: ", code);
      return [];
    }

    data.sort((a, b) => {
      return a.dateStart.valueOf() - b.dateStart.valueOf();
    });
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getCohortNameList = (cohorts: CohortDto[]) => {
  return cohorts.map((cohort) => cohort.name);
};

// toutes les cohort en cours (date de fin non passée) + celles non commencées
export const filterCurrentAndNextCohorts = (cohorts: CohortDto[]) => {
  const cohortsFiltered = cohorts.filter((cohort) => (cohort.dateStart && isBefore(new Date(), cohort.dateStart)) || (cohort.dateEnd && isBefore(new Date(), cohort.dateEnd)));
  return cohortsFiltered;
};

export const getCohortSelectOptions = (cohorts, short = false) => {
  if (short) return cohorts.map((cohort) => ({ value: cohort.name, label: cohort.name }));
  return cohorts.map((cohort) => ({ value: cohort.name, label: `${cohort.name} (${getCohortPeriod(cohort, true)})` }));
};

export const getCohortGroups = (parentFilterKey: string = "cohort"): IIntermediateFilter => {
  return {
    key: parentFilterKey,
    filters: [
      {
        title: "CLE 2025",
        name: CohortGroup.CLE_2025,
        parentGroup: "Cohorte",
        parentFilter: parentFilterKey,
        missingLabel: "Non renseigné",
        sort: (data) => orderCohort(data),
        filter: (data: DataFilter) => data,
        filterRootFilter: (dataFiltered: DataFilter[]) =>
          dataFiltered?.filter((cohort) => (cohort.key.toLowerCase().includes("cle") && cohort.key.toLowerCase().includes("2025")) || cohort.key.toLowerCase().includes("cle 25")),
      },
      {
        title: "HTS 2025",
        name: CohortGroup.HTS_2025,
        parentGroup: "Cohorte",
        parentFilter: parentFilterKey,
        missingLabel: "Non renseigné",
        sort: (data) => orderCohort(data),
        filter: (data: DataFilter) => data,
        filterRootFilter: (dataFiltered: DataFilter[]) => dataFiltered?.filter((cohort) => !cohort.key.toLowerCase().includes("cle") && cohort.key.toLowerCase().includes("2025")),
      },
      {
        title: "CLE 2024",
        name: CohortGroup.CLE_2024,
        parentGroup: "Cohorte",
        parentFilter: parentFilterKey,
        missingLabel: "Non renseigné",
        sort: (data) => orderCohort(data),
        filter: (data: DataFilter) => data,
        filterRootFilter: (dataFiltered: DataFilter[]) =>
          dataFiltered?.filter(
            (cohort) => (cohort.key.toLowerCase().includes("cle") && cohort.key.toLowerCase().includes("2024")) || cohort.key.toLowerCase().includes("cle 23-24"),
          ),
      },
      {
        title: "HTS 2024",
        name: CohortGroup.HTS_2024,
        parentGroup: "Cohorte",
        parentFilter: parentFilterKey,
        missingLabel: "Non renseigné",
        sort: (data) => orderCohort(data),
        filter: (data: DataFilter) => data,
        filterRootFilter: (dataFiltered: DataFilter[]) => dataFiltered?.filter((cohort) => !cohort.key.toLowerCase().includes("cle") && cohort.key.toLowerCase().includes("2024")),
      },
      {
        title: "2023",
        name: CohortGroup._2023,
        parentGroup: "Cohorte",
        parentFilter: parentFilterKey,
        missingLabel: "Non renseigné",
        sort: (data) => orderCohort(data),
        filter: (data: DataFilter) => data,
        filterRootFilter: (dataFiltered: DataFilter[]) => dataFiltered?.filter((cohort) => cohort.key.toLowerCase().includes("2023")),
      },
      {
        title: "2022 et -",
        name: CohortGroup.LOWER_THAN_2022,
        parentGroup: "Cohorte",
        parentFilter: parentFilterKey,
        missingLabel: "Non renseigné",
        sort: (data) => orderCohort(data),
        filter: (data: DataFilter) => data,
        filterRootFilter: (dataFiltered: DataFilter[]) =>
          dataFiltered?.filter((cohort) => ["2019", "2020", "2021"].includes(cohort.key.toLowerCase()) || cohort.key.toLowerCase().includes("2022")),
      },
      {
        title: "à venir",
        name: CohortGroup.COMING_SOON,
        parentGroup: "Cohorte",
        parentFilter: parentFilterKey,
        missingLabel: "Non renseigné",
        sort: (data) => orderCohort(data),
        filter: (data: DataFilter) => data,
        filterRootFilter: (dataFiltered: DataFilter[]) => dataFiltered?.filter((cohort) => cohort.key.toLowerCase().includes("à venir")),
      },
    ],
  };
};

export enum CohortGroup {
  CLE_2025 = "CLE_2025",
  HTS_2025 = "HTS_2025",
  CLE_2024 = "CLE_2024",
  HTS_2024 = "HTS_2024",
  _2023 = "2023",
  LOWER_THAN_2022 = "LOWER_THAN_2022",
  COMING_SOON = "COMING_SOON",
}
