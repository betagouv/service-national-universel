import React, { useEffect, useMemo, useState } from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";
import { HorizontalBar } from "../../../components/graphs";

import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { academyList, COHORTS, departmentToAcademy, ES_NO_LIMIT, REFERENT_ROLES, region2department, regionList, ROLES } from "snu-lib";
import api from "../../../../../services/api";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import StatutPhase from "../../../components/inscription/StatutPhase";

import plausibleEvent from "../../../../../services/plausible";
import { getLink as getOldLink } from "../../../../../utils";
import { getDepartmentOptions, getFilteredDepartment } from "../../../components/common";
import Details from "../../../components/inscription/Details";
import TabSchool from "../../../components/inscription/TabSchool";
import ExportReport from "./ExportReport";
import { orderCohort } from "../../../../../components/filters-system-v2/components/filters/utils";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [inscriptionGoals, setInscriptionGoals] = useState();

  const [inscriptionDetailObject, setInscriptionDetailObject] = useState({});

  const [filterArray, setFilterArray] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const regionOptions = user.role === ROLES.REFERENT_REGION ? [{ key: user.region, label: user.region }] : regionList.map((r) => ({ key: r, label: r }));
  const academyOptions =
    user.role === ROLES.REFERENT_REGION
      ? [...new Set(region2department[user.region].map((d) => departmentToAcademy[d]))].map((a) => ({ key: a, label: a }))
      : academyList.map((a) => ({ key: a, label: a }));

  useEffect(() => {
    let filters = [
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
            options: academyOptions,
          }
        : null,
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
    cohort: ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023"],
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
    if (user.role === ROLES.REFERENT_DEPARTMENT) getDepartmentOptions(user, setDepartmentOptions);
    else getFilteredDepartment(setSelectedFilters, selectedFilters, setDepartmentOptions, user);
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
    <DashboardContainer
      active="inscription"
      availableTab={["general", "engagement", "sejour", "inscription", "analytics"]}
      navChildren={
        <div className="flex items-center gap-2">
          <ExportReport filter={selectedFilters} />
          <ButtonPrimary
            className="text-sm"
            onClick={() => {
              plausibleEvent("Dashboard/CTA - Exporter statistiques inscriptions");
              print();
            }}>
            Exporter les statistiques <span className="font-bold">“Inscription”</span>
          </ButtonPrimary>
        </div>
      }>
      <div className="flex flex-col gap-8 ">
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
              getOldLink({ base: `/volontaire`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"VALIDATED"%5D'] }),
              getOldLink({ base: `/volontaire`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"WAITING_LIST"%5D'] }),
              getOldLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"WAITING_VALIDATION"%5D'] }),
              getOldLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"WAITING_CORRECTION"%5D'] }),
              getOldLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"IN_PROGRESS"%5D'] }),
            ]}
          />
        </div>
        <StatutPhase values={inscriptionDetailObject} filter={selectedFilters} />
        <div className="flex gap-4">
          <Details selectedFilters={selectedFilters} />
          <TabSchool filters={selectedFilters} />
        </div>
      </div>
    </DashboardContainer>
  );
}

const getInscriptionGoals = async () => {
  let dataMerged = [];
  const query = {
    query: { bool: { must: { match_all: {} } } },
    size: ES_NO_LIMIT,
  };
  const { responses } = await api.esQuery("inscriptiongoal", query);
  if (!responses.length) {
    toastr.error("Une erreur est survenue");
    return [];
  }
  const result = responses[0].hits.hits;
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
  const body = {
    query: { bool: { must: { match_all: {} }, filter: [] } },
    aggs: {
      status: {
        terms: {
          field: "status.keyword",
          size: ES_NO_LIMIT,
        },
      },
    },
    size: 0,
  };

  if (filters?.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filters.cohort } });
  if (filters?.academy?.length) body.query.bool.filter.push({ terms: { "academy.keyword": filters.academy } });
  if (filters?.region?.length)
    body.query.bool.filter.push({
      bool: {
        should: [
          { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolRegion.keyword": filters.region } }] } },
          { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "region.keyword": filters.region } }] } },
        ],
      },
    });
  if (filters?.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filters.department } });

  const { responses } = await api.esQuery("young", body);
  if (!responses.length) return {};
  return api.getAggregations(responses[0]);
}
