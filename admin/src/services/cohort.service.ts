import { CohortDto, getCohortPeriod, translate } from "snu-lib";
import API from "./api";
import { IIntermediateFilter, DataFilter, RowFilter } from "@/components/filters-system-v2/components/Filter";
import { orderCohort } from "@/components/filters-system-v2/components/filters/utils";

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

export const getCohortNameList = (cohorts) => {
  return cohorts.map((cohort) => cohort.name);
};

export const getCohortSelectOptions = (cohorts, short = false) => {
  if (short) return cohorts.map((cohort) => ({ value: cohort.name, label: cohort.name }));
  return cohorts.map((cohort) => ({ value: cohort.name, label: `${cohort.name} (${getCohortPeriod(cohort, true)})` }));
};

function getGroupTitle(cohort: CohortDto) {
  if (cohort.status === "future") return "À venir";
  return `${cohort.type === "CLE" ? "CLE" : "HTS"} ${cohort.groupLabel}`;
}

export const getCohortGroups = (parentFilterKey: string = "cohort", cohorts: CohortDto[]): IIntermediateFilter => {
  return {
    key: parentFilterKey,
    filters: cohorts.reduce<RowFilter[]>((acc, cohort) => {
      const groupId = cohort.groupId;
      if (!acc.find((a) => a.name === groupId))
        acc.push({
          title: getGroupTitle(cohort),
          name: groupId,
          parentGroup: "Cohorte",
          parentFilter: parentFilterKey,
          missingLabel: "Non renseigné",
          sort: (data) => orderCohort(data),
          filter: (data: DataFilter) => data,
          filterRootFilter: (dataFiltered: DataFilter[]) =>
            dataFiltered?.filter((cohortFilter) => {
              const cohort = cohorts.find((cohort) => cohort.name === cohortFilter.key);
              return cohort?.groupId === groupId;
            }),
        });
      return acc;
    }, []),
  };
};
