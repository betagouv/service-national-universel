import queryString from "query-string";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { academyList, departmentToAcademy, REFERENT_ROLES, region2department, regionList, ROLES, getDepartmentNumber, CohortDto } from "snu-lib";
import api from "@/services/api";
import { getCohortNameList } from "@/services/cohort.service";
import { getNewLink } from "@/utils";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";
import TotalInscription from "@/scenes/dashboardV2/components/inscription/TotalInscriptions";
import { orderCohort } from "@/components/filters-system-v2/components/filters/utils";

import { HorizontalBar } from "../graphs";
import { FilterDashBoard } from "../FilterDashBoard";
import { getDepartmentOptions, getFilteredDepartment } from "../common";
import StatutPhase from "./StatutPhase";
import Details from "./Details";
import TabSchool from "./TabSchool";

type FilterOption = {
  key: string;
  label: string;
};

type Filter = {
  id: string;
  name: string;
  fullValue: string;
  options: FilterOption[];
  translate?: (value: string) => string;
  sort?: (value: string) => number;
} | null;

type InscriptionGoalInfo = {
  cohort: string;
  department: string;
  region: string;
  academy: string;
  max: number;
};

interface GeneralProps {
  selectedFilters: { cohort: CohortDto[]; department?: string; region?: string; academy?: string };
  onSelectedFiltersChange: (filters: { cohort: CohortDto[] }) => void;
}

export default function General({ selectedFilters, onSelectedFiltersChange }: GeneralProps) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);

  const [inscriptionGoals, setInscriptionGoals] = useState<InscriptionGoalInfo[]>();
  const [inscriptionDetailObject, setInscriptionDetailObject] = useState<{
    [key: string]: number;
  }>({});
  const [totalInscriptions, setTotalInscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterArray, setFilterArray] = useState<Filter[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const regionOptions = [ROLES.VISITOR, ROLES.REFERENT_REGION].includes(user.role) ? [{ key: user.region, label: user.region }] : regionList.map((r) => ({ key: r, label: r }));
  const academyOptions = [ROLES.VISITOR, ROLES.REFERENT_REGION].includes(user.role)
    ? [...new Set(region2department[user.region].map((d) => departmentToAcademy[d]))].map((a: string) => ({ key: a, label: a }))
    : academyList.map((a: string) => ({ key: a, label: a }));

  useEffect(() => {
    // regex to get all cohort 2024
    const cohortsFilters: CohortDto[] = getCohortNameList(cohorts).filter((e) => e.match(/2025/));
    onSelectedFiltersChange({ cohort: cohortsFilters });

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const filters = [
      ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
        ? {
            id: "region",
            name: "Région",
            fullValue: "Toutes",
            options: regionOptions,
          }
        : null,
      ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
        ? {
            id: "academy",
            name: "Académie",
            fullValue: "Toutes",
            options: academyOptions.sort((a, b) => a.label.localeCompare(b.label)),
          }
        : null,
      {
        id: "department",
        name: "Département",
        fullValue: "Tous",
        options: departmentOptions,
        translate: (e) => getDepartmentNumber(e) + " - " + e,
      },
      {
        id: "cohort",
        name: "Cohorte",
        fullValue: "Toutes",
        options: getCohortNameList(cohorts).map((cohort) => ({ key: cohort, label: cohort })),
        sort: (e) => orderCohort(e),
      },
    ].filter((e) => e);
    setFilterArray(filters);
  }, [departmentOptions]);

  async function fetchInscriptionGoals() {
    const res = await getInscriptionGoals();
    setInscriptionGoals(res);
  }
  async function fetchCurrentInscriptions() {
    const res = await getCurrentInscriptions(selectedFilters);
    setInscriptionDetailObject(res);
  }

  async function fetchTotalInscriptions() {
    const res = await getTotalInscriptions(selectedFilters);
    setTotalInscriptions(res);
  }

  useEffect(() => {
    fetchInscriptionGoals();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (user.role === ROLES.REFERENT_DEPARTMENT) getDepartmentOptions(user, setDepartmentOptions);
    else getFilteredDepartment(onSelectedFiltersChange, selectedFilters, setDepartmentOptions, user);
    fetchCurrentInscriptions();
    fetchTotalInscriptions();
  }, [JSON.stringify(selectedFilters)]);

  const goal = useMemo(
    () =>
      inscriptionGoals &&
      inscriptionGoals
        .filter((ig) => filterByRegionAndDepartement(ig, selectedFilters, user))
        // if selectedFilters.cohort is empty --> we select all cohorts thus no .filter()
        .filter((ig) => !selectedFilters.cohort.length || selectedFilters.cohort.find((cohort) => cohort.name === ig.cohort))
        .reduce((acc, current) => acc + (current.max && !isNaN(Number(current.max)) ? Number(current.max) : 0), 0),
    [inscriptionGoals, selectedFilters.cohort, selectedFilters.department, selectedFilters.region, selectedFilters.academy],
  );

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-8 ">
      <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={onSelectedFiltersChange} filterArray={filterArray} />
      <div className="rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
        <HorizontalBar
          title="Objectif des inscriptions"
          labels={["Sur la liste principale", "Sur liste complémentaire", "En attente de validation", "En attente de correction", "En cours"]}
          values={[
            inscriptionDetailObject.VALIDATED || 0,
            inscriptionDetailObject.WAITING_LIST || 0,
            inscriptionDetailObject.WAITING_VALIDATION || 0,
            inscriptionDetailObject.WAITING_CORRECTION || 0,
            inscriptionDetailObject.IN_PROGRESS || 0,
          ]}
          goal={goal}
          showTooltips={true}
          legendUrls={[
            // @ts-expect-error js function
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "VALIDATED" })] }),
            // @ts-expect-error js function
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "WAITING_LIST" })] }),
            // @ts-expect-error js function
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "WAITING_VALIDATION" })] }),
            // @ts-expect-error js function
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "WAITING_CORRECTION" })] }),
            // @ts-expect-error js function
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "IN_PROGRESS" })] }),
          ]}
        />
      </div>
      <TotalInscription totalInscriptions={totalInscriptions} goal={goal} />
      <StatutPhase values={inscriptionDetailObject} filter={selectedFilters} />
      <div className="flex gap-4">
        {/* @ts-expect-error jsx */}
        <Details selectedFilters={selectedFilters} />
        <TabSchool filters={selectedFilters} />
      </div>
    </div>
  );
}

const getInscriptionGoals = async (): Promise<InscriptionGoalInfo[]> => {
  const dataMerged: {
    cohort: string;
    department: string;
    region: string;
    academy: string;
    max: number;
  }[] = [];
  const responses = await api.post("/elasticsearch/dashboard/inscription/inscriptionGoal");
  if (!responses?.hits?.hits) {
    toastr.error("Une erreur est survenue", "");
    return [];
  }
  const result = responses.hits.hits;
  result.map((e) => {
    const { department, region, academy, cohort, max } = e._source;
    dataMerged[department] = { cohort, department, region, academy, max: (dataMerged[department]?.max ? dataMerged[department].max : 0) + max };
  });

  return result.map((e) => e._source);
};

function filterByRegionAndDepartement(e, filters, user) {
  if (filters?.department?.length) return filters.department.includes(e.department);
  else if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) return user.department.includes(e.department);
  if (filters?.region?.length) return filters.region.includes(e.region);
  if (filters?.academy?.length) return filters.academy.includes(e.academy);
  return true;
}

async function getCurrentInscriptions(filters) {
  const responses = await api.post("/elasticsearch/dashboard/inscription/youngForInscription", { filters: filters });
  // if (!responses.length) return {};
  return api.getAggregations(responses);
}

async function getTotalInscriptions(filters) {
  const responses = await api.post("/elasticsearch/dashboard/inscription/totalYoungByDate", { filters: filters });
  if (!responses || !responses?.aggregations?.aggs?.buckets) {
    return [];
  }
  return responses?.aggregations?.aggs?.buckets;
}
