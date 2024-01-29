import React, { useEffect, useMemo, useState } from "react";
import queryString from "query-string";
import { toastr } from "react-redux-toastr";
import { REFERENT_ROLES, ROLES, academyList, departmentToAcademy, region2department, regionList, COHORT_TYPE, getDepartmentNumber } from "snu-lib";
import { orderCohort } from "@/components/filters-system-v2/components/filters/utils";
import api from "@/services/api";
import { getNewLink } from "@/utils";
import { FilterDashBoard } from "@/scenes/dashboardV2/components/FilterDashBoard";
import { getDepartmentOptions, getFilteredDepartment } from "@/scenes/dashboardV2/components/common";
import HorizontalBar from "@/scenes/dashboardV2/components/graphs/HorizontalBar";
import VolontaireSection from "./VolontaireSection";
import { useSelector } from "react-redux";

export default function Index({ user }) {
  const cohorts = useSelector((state) => state.Cohorts);
  const [inscriptionGoals, setInscriptionGoals] = useState();
  const [volontairesData, setVolontairesData] = useState();
  const [inAndOutCohort, setInAndOutCohort] = useState();
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    cohort: cohorts.filter((e) => e.type === COHORT_TYPE.VOLONTAIRE && e.name.match(/2024/)).map((e) => e.name),
  });

  const regionOptions = user.role === ROLES.REFERENT_REGION ? [{ key: user.region, label: user.region }] : regionList?.map((r) => ({ key: r, label: r }));
  const academyOptions =
    user.role === ROLES.REFERENT_REGION
      ? [...new Set(region2department[user.region]?.map((d) => departmentToAcademy[d]))]?.map((a) => ({ key: a, label: a }))
      : academyList?.map((a) => ({ key: a, label: a }));

  const filterArray = [
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
      options: cohorts.filter((e) => e.type === COHORT_TYPE.VOLONTAIRE)?.map((cohort) => ({ key: cohort.name, label: cohort.name })),
      sort: (e) => orderCohort(e),
    },
  ].filter((e) => e);

  async function fetchInscriptionGoals() {
    const res = await getInscriptionGoals();
    setInscriptionGoals(res);
  }
  async function fetchCurrentInscriptions() {
    const res = await getCurrentInscriptions(selectedFilters);
    setVolontairesData(res);
  }
  async function fetchInOutCohort() {
    const res = await getInAndOutCohort(selectedFilters);
    setInAndOutCohort(res);
  }

  useEffect(() => {
    fetchInscriptionGoals();
    fetchInOutCohort();
  }, []);

  useEffect(() => {
    if (user.role === ROLES.REFERENT_DEPARTMENT) getDepartmentOptions(user, setDepartmentOptions);
    else getFilteredDepartment(setSelectedFilters, selectedFilters, setDepartmentOptions, user);
    fetchCurrentInscriptions();
    fetchInOutCohort();
  }, [JSON.stringify(selectedFilters)]);

  const goal = useMemo(
    () =>
      inscriptionGoals &&
      inscriptionGoals
        .filter((e) => filterByRegionAndDepartement(e, selectedFilters, user))
        // if selectedFilters.cohort is empty --> we select all cohorts thus no .filter()
        .filter((e) => !selectedFilters?.cohort?.length || selectedFilters.cohort.includes(e.cohort))
        .reduce((acc, current) => acc + (current.max && !isNaN(Number(current.max)) ? Number(current.max) : 0), 0),
    [inscriptionGoals, selectedFilters.cohort, selectedFilters.department, selectedFilters.region, selectedFilters.academy],
  );

  return (
    <>
      <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
      <h1 className="text-[28px] font-bold leading-8 text-gray-900">Inscriptions</h1>
      <div className="rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
        <HorizontalBar
          title="Objectif des inscriptions"
          labels={["Sur liste principale", "Sur liste complémentaire", "En attente de validation", "En attente de correction", "En cours"]}
          values={[
            volontairesData?.VALIDATED?.total || 0,
            volontairesData?.WAITING_LIST?.total || 0,
            volontairesData?.WAITING_VALIDATION?.total || 0,
            volontairesData?.WAITING_CORRECTION?.total || 0,
            volontairesData?.IN_PROGRESS?.total || 0,
          ]}
          goal={goal}
          showTooltips={true}
          legendUrls={[
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "VALIDATED" })] }),
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "WAITING_LIST" })] }),
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "WAITING_VALIDATION" })] }),
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "WAITING_CORRECTION" })] }),
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "IN_PROGRESS" })] }),
          ]}
        />
      </div>
      <VolontaireSection volontairesData={volontairesData} inAndOutCohort={inAndOutCohort} filter={selectedFilters} />
    </>
  );
}

function filterByRegionAndDepartement(e, filters, user) {
  if (filters?.department?.length) return filters.department.includes(e.department);
  else if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) return user.department.includes(e.department);
  if (filters?.region?.length) return filters.region.includes(e.region);
  if (filters?.academy?.length) return filters.academy.includes(e.academy);
  return true;
}

const getInscriptionGoals = async () => {
  let dataMerged = [];
  const responses = await api.post("/elasticsearch/dashboard/inscription/inscriptionGoal");
  if (!responses?.hits?.hits) {
    toastr.error("Une erreur est survenue");
    return [];
  }
  const result = responses.hits.hits;
  result?.map((e) => {
    const { department, region, academy, cohort, max } = e._source;
    dataMerged[department] = { cohort, department, region, academy, max: (dataMerged[department]?.max ? dataMerged[department].max : 0) + max };
  });

  return result?.map((e) => e._source);
};

async function getCurrentInscriptions(filters) {
  const responses = await api.post("/elasticsearch/dashboard/inscription/youngForInscription", { filters: filters });
  if (!responses?.aggregations?.status?.buckets) return {};
  let result = responses.aggregations.status.buckets.reduce((acc, status) => {
    acc[status.key] = {
      total: status.doc_count,
      phase1: status.statusPhase1.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {}),
      phase2: status.statusPhase2.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {}),
      phase3: status.statusPhase3.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {}),
    };
    return acc;
  }, {});
  return result;
}

async function getInAndOutCohort(filters) {
  const responses = await api.post("/elasticsearch/dashboard/inscription/getInAndOutCohort", { filters: filters });
  if (!responses?.aggregations) return {};
  const aggreg = responses.aggregations;
  let result = Object.keys(aggreg).reduce((acc, cohort) => {
    const type = cohort.split("&")[0];
    acc[type] = acc[type] ? acc[type] + aggreg[cohort].doc_count : aggreg[cohort].doc_count;
    return acc;
  }, {});

  return result;
}
