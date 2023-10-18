import queryString from "query-string";
import React, { useEffect, useMemo, useState } from "react";
import { HorizontalBar } from "../../../components/graphs";

import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { COHORTS, departmentToAcademy, REFERENT_ROLES, region2department } from "snu-lib";
import api from "@/services/api";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import StatutPhase from "../../../components/inscription/StatutPhase";

import { orderCohort } from "../../../../../components/filters-system-v2/components/filters/utils";
import plausibleEvent from "../../../../../services/plausible";
import { getNewLink } from "../../../../../utils";
import { getFilteredDepartment } from "../../../components/common";
import Details from "../../../components/inscription/Details";
import TabSchool from "../../../components/inscription/TabSchool";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [inscriptionGoals, setInscriptionGoals] = useState();

  const [inscriptionDetailObject, setInscriptionDetailObject] = useState({});

  const [filterArray, setFilterArray] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const academyOptions = [...new Set(region2department[user.region].map((d) => departmentToAcademy[d]))].map((a) => ({ key: a, label: a }));

  useEffect(() => {
    let filters = [
      {
        id: "academy",
        name: "Académie",
        fullValue: "Toutes",
        options: academyOptions.sort((a, b) => a.label.localeCompare(b.label)),
      },
      {
        id: "department",
        name: "Département",
        fullValue: "Tous",
        options: departmentOptions,
      },
      {
        id: "cohort",
        name: "Cohorte",
        fullValue: "Toutes",
        options: COHORTS.map((cohort) => ({ key: cohort, label: cohort })),
        sort: (e) => orderCohort(e),
      },
    ].filter((e) => e);
    setFilterArray(filters);
  }, [departmentOptions]);

  const [selectedFilters, setSelectedFilters] = React.useState({
    cohort: ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023", "Octobre 2023 - NC"],
  });

  async function fetchInscriptionGoals() {
    const res = await getInscriptionGoals();
    setInscriptionGoals(res);
  }
  async function fetchCurrentInscriptions() {
    const res = await getCurrentInscriptions(selectedFilters);
    setInscriptionDetailObject(res);
  }

  useEffect(() => {
    fetchInscriptionGoals();
  }, []);

  useEffect(() => {
    getFilteredDepartment(setSelectedFilters, selectedFilters, setDepartmentOptions, user);
    fetchCurrentInscriptions();
  }, [JSON.stringify(selectedFilters)]);

  const goal = useMemo(
    () =>
      inscriptionGoals &&
      inscriptionGoals
        .filter((e) => filterByRegionAndDepartement(e, selectedFilters, user))
        // if selectedFilters.cohort is empty --> we select all cohorts thus no .filter()
        .filter((e) => !selectedFilters.cohort.length || selectedFilters.cohort.includes(e.cohort))
        .reduce((acc, current) => acc + (current.max && !isNaN(Number(current.max)) ? Number(current.max) : 0), 0),
    [inscriptionGoals, selectedFilters.cohort, selectedFilters.department, selectedFilters.region, selectedFilters.academy],
  );
  return (
    <div className="flex flex-col gap-8 p-8">
      <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
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
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "VALIDATED" })] }),
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "WAITING_LIST" })] }),
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "WAITING_VALIDATION" })] }),
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "WAITING_CORRECTION" })] }),
            getNewLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: [queryString.stringify({ status: "IN_PROGRESS" })] }),
          ]}
        />
      </div>
      <StatutPhase values={inscriptionDetailObject} filter={selectedFilters} />
      <div className="flex gap-4">
        <Details selectedFilters={selectedFilters} />
      </div>
    </div>
  );
}

const getInscriptionGoals = async () => {
  let dataMerged = [];
  const responses = await api.post("/elasticsearch/dashboard/inscription/inscriptionGoal");
  if (!responses?.hits?.hits) {
    toastr.error("Une erreur est survenue");
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
