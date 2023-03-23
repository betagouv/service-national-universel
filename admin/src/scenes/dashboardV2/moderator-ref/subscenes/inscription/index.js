import React, { useEffect, useMemo, useState } from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";
import HorizontalBar from "../../../components/graphs/HorizontalBar";

import { FilterDashBoard } from "../../../components/FilterDashBoard";
import api from "../../../../../services/api";
import { toastr } from "react-redux-toastr";
import { YOUNG_STATUS, REFERENT_ROLES, departmentList, regionList, COHORTS, ES_NO_LIMIT } from "snu-lib";
import { useSelector } from "react-redux";
import StatutPhase from "../../../components/inscription/StatutPhase.js";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [inscriptionGoals, setInscriptionGoals] = useState();

  const [inscriptionDetailObject, setInscriptionDetailObject] = useState({});

  const filterArray = [
    {
      id: "region",
      name: "Région",
      fullValue: "Toutes",
      options: regionList.map((region) => ({ key: region, label: region })),
    },
    {
      id: "department",
      name: "Département",
      fullValue: "Tous",
      options: departmentList.map((department) => ({ key: department, label: department })),
    },
    {
      id: "cohort",
      name: "Cohorte",
      fullValue: "Toutes",
      options: COHORTS.map((cohort) => ({ key: cohort, label: cohort })),
    },
  ];
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
    fetchCurrentInscriptions();
  }, []);

  useEffect(() => {
    fetchCurrentInscriptions();
  }, [selectedFilters]);

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
      availableTab={["general", "engagement", "sejour", "inscription"]}
      navChildren={
        <div className="flex items-center gap-2">
          <ButtonPrimary className="text-sm">
            Exporter le rapport <span className="font-bold">“Inscription”</span>
          </ButtonPrimary>
          <ButtonPrimary className="text-sm">
            Exporter les statistiques <span className="font-bold">“Inscription”</span>
          </ButtonPrimary>
        </div>
      }>
      <div>Inscription</div>
      <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
      <div className="bg-white my-4 p-8 rounded-lg">
        <HorizontalBar
          title="Objectif des inscriptions"
          labels={["Sur la liste principale", "Sur liste complémentaire", "En attente de validation", "En attente de correction", "En cours"]}
          values={[
            inscriptionDetailObject.VALIDATED,
            inscriptionDetailObject.WAITING_LIST,
            inscriptionDetailObject.WAITING_VALIDATION,
            inscriptionDetailObject.WAITING_CORRECTION,
            inscriptionDetailObject.IN_PROGRESS,
          ]}
          goal={goal}
        />
      </div>
      {/*
      <StatutPhase
        values={[
          inscriptionDetailObject.IN_PROGRESS,
          inscriptionDetailObject.WAITING_VALIDATION,
          inscriptionDetailObject.WAITING_CORRECTION,
          inscriptionDetailObject.VALIDATED,
          inscriptionDetailObject.WAITING_LIST,
          inscriptionDetailObject.REFUSED,
          inscriptionDetailObject.REINSCRIPTION,
          inscriptionDetailObject.NOT_ELIGIBLE,
          inscriptionDetailObject.ABANDONED,
          inscriptionDetailObject.NOT_AUTORISED,
          inscriptionDetailObject.DELETED,
        ]}
      />
    
        */}
      <StatutPhase values={inscriptionDetailObject} />
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
      IN_PROGRESS: {
        filter: { term: { "status.keyword": YOUNG_STATUS.IN_PROGRESS } },
      },
      WAITING_VALIDATION: {
        filter: { term: { "status.keyword": YOUNG_STATUS.WAITING_VALIDATION } },
      },
      WAITING_CORRECTION: {
        filter: { term: { "status.keyword": YOUNG_STATUS.WAITING_CORRECTION } },
      },
      VALIDATED: {
        filter: { term: { "status.keyword": YOUNG_STATUS.VALIDATED } },
      },
      WAITING_LIST: {
        filter: { term: { "status.keyword": YOUNG_STATUS.WAITING_LIST } },
      },
      REFUSED: {
        filter: { term: { "status.keyword": YOUNG_STATUS.REFUSED } },
      },
      REINSCRIPTION: {
        filter: { term: { "status.keyword": YOUNG_STATUS.REINSCRIPTION } },
      },
      NOT_ELIGIBLE: {
        filter: { term: { "status.keyword": YOUNG_STATUS.NOT_ELIGIBLE } },
      },
      ABANDONED: {
        filter: { term: { "status.Keyword": YOUNG_STATUS.ABANDONED } },
      },
      NOT_AUTORISED: {
        filter: { term: { "status.Keyword": YOUNG_STATUS.NOT_AUTORISED } },
      },
      DELETED: {
        filter: { term: { "status.Keyword": YOUNG_STATUS.DELETED } },
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
  const finalObject = {};
  Object.keys(responses[0].aggregations).map((key) => {
    finalObject[key] = responses[0].aggregations[key].doc_count;
  });
  return finalObject;
}
