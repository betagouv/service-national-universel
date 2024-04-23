import { getCohortPeriod, translate } from "snu-lib";
import API from "./api";
import { SubFilter } from "@/components/filters-system-v2/components/Filter";

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

export const getCohortGroups = (): SubFilter => {
  return {
    key: "cohort",
    filters: [
      {
        title: "CLE 2024",
        name: CohortGroup.CLE_2024,
        parentGroup: "Cohorte",
        missingLabel: "Non renseigné",
        sort: (e) => e,
        filter: (dataFiltered) => dataFiltered?.cohort?.filter((cohort) => cohort.key.toLowerCase().includes("cle") && cohort.key.toLowerCase().includes("2024")),
      },
      {
        title: "HTS 2024",
        name: CohortGroup.HTS_2024,
        parentGroup: "Cohorte",
        missingLabel: "Non renseigné",
        sort: (e) => e,
        filter: (dataFiltered) => dataFiltered?.cohort?.filter((cohort) => !cohort.key.toLowerCase().includes("cle") && cohort.key.toLowerCase().includes("2024"))
      },
      {
        title: "2024",
        name: CohortGroup._2024,
        parentGroup: "Cohorte",
        missingLabel: "Non renseigné",
        sort: (e) => e,
        filter: (dataFiltered) => dataFiltered?.cohort?.filter((cohort) => cohort.key.toLowerCase().includes("2024")),
      },
    ],
  };
};

export enum CohortGroup {
  CLE_2024 = "cle_2024",
  HTS_2024 = "hts_2024",
  _2024 = "2024",
  _2023 = "2023",
  LOWER_THAN_2022 = "< 2022",
}
