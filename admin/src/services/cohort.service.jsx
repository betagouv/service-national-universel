import { getCohortPeriod, translate } from "snu-lib";
import API from "./api";
import React from "react";
import { HiUsers } from "react-icons/hi";

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

export const NewGetCohortSelectOptions = (cohorts) => {
  return cohorts.map((cohort) => ({
    value: cohort.name,
    label: (
      <div className="flex gap-4 py-2.5">
        <HiUsers size={20} className="mt-0.5" color={cohort.name.includes("CLE") ? "#EC4899" : "#6366F1"} />
        <p>
          <span className="text-gray-700 font-medium">{cohort.name + " "} </span> : <span className="text-gray-500 font-normal"> {getCohortPeriod(cohort)}</span>
        </p>
      </div>
    ),
  }));
};
