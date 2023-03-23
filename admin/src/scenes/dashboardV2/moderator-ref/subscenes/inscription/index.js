import React, { useEffect, useMemo, useState, useRef } from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";
import { FullDoughnut, HorizontalBar, BarChart } from "../../../components/graphs";

import { FilterDashBoard, FilterComponent } from "../../../components/FilterDashBoard";
import api from "../../../../../services/api";
import { toastr } from "react-redux-toastr";
import { YOUNG_STATUS, YOUNG_SITUATIONS, REFERENT_ROLES, departmentList, regionList, COHORTS, ES_NO_LIMIT, translate } from "snu-lib";
import { useSelector } from "react-redux";
import StatutPhase from "../../../components/inscription/StatutPhase.js";

import { BsChevronUp, BsChevronDown } from "react-icons/bs";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [inscriptionGoals, setInscriptionGoals] = useState();

  const [inscriptionDetailObject, setInscriptionDetailObject] = useState({});

  const [age, setAge] = useState({});
  const [sexe, setSexe] = useState({});
  const [grade, setGrade] = useState({});
  const [situation, setSituation] = useState({});
  const [qpv, setQpv] = useState({});
  const [rural, setRural] = useState({});

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

  const [selectedFiltersBottom, setSelectedFiltersBottom] = React.useState({});
  const filterArrayBottom = [
    {
      id: "status",
      name: "Statuts",
      fullValue: "Tous",
      options: Object.keys(YOUNG_STATUS).map((status) => ({ key: status, label: translate(status) })),
    },
  ];

  const [selectedDetail, setSelectedDetail] = useState("age");

  async function fetchInscriptionGoals() {
    const res = await getInscriptionGoals();
    setInscriptionGoals(res);
  }
  async function fetchCurrentInscriptions() {
    const res = await getCurrentInscriptions(selectedFilters);
    setInscriptionDetailObject(res);
  }

  async function fetchDetailInscriptions() {
    const res = await getDetailInscriptions({ ...selectedFilters, ...selectedFiltersBottom });
    // get all the years from the res object
    const objectYears = {};
    Object.keys(res.age).forEach((e) => {
      const year = new Date(parseInt(e)).getFullYear();
      if (!objectYears[year]) objectYears[year] = 1;
      else objectYears[year] += 1;
    });
    setAge(objectYears);
    setSexe(res.gender);
    setGrade(res.grade);
    setSituation(res.situation);
    setQpv(res.qpv);
    setRural(res.rural);
    console.log(res.rural);
  }

  useEffect(() => {
    fetchInscriptionGoals();
  }, []);

  useEffect(() => {
    fetchCurrentInscriptions();
    fetchDetailInscriptions();
  }, [selectedFilters]);

  useEffect(() => {
    fetchDetailInscriptions();
  }, [selectedFiltersBottom]);

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

      <StatutPhase values={inscriptionDetailObject} />

      <div className="min-w-[463px] w-[40%] bg-white rounded-lg my-4 py-6 px-8 flex items-center flex-col">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="text-base font-bold text-gray-900">En détail</div>
          <div className="w-fit">
            {filterArrayBottom.map((filter) => (
              <FilterComponent key={filter.id} filter={filter} selectedFilters={selectedFiltersBottom} setSelectedFilters={setSelectedFiltersBottom} />
            ))}
          </div>
        </div>
        {/* Filter to chose displayed graphs */}
        <div className="pb-10 pt-8">
          <FilterDetail selectedDetail={selectedDetail} setSelectedDetail={setSelectedDetail} />
        </div>

        {/* Displayed graphs */}
        {selectedDetail === "age" ? (
          <div className="flex flex-col justify-center items-center w-full gap-10">
            <FullDoughnut
              title="Âge"
              legendSide="right"
              labels={["Né en 2005", "Né en 2006", "Né en 2007", "Né en 2008"]}
              values={[age["2005"], age["2006"], age["2007"], age["2008"]]}
              maxLegends={2}
            />
            <FullDoughnut title="Sexe" legendSide="left" labels={["Garçons", "Filles"]} values={[sexe.male, sexe.female]} maxLegends={2} />
          </div>
        ) : selectedDetail === "class" ? (
          <div className="flex flex-col justify-center items-center w-full gap-10">
            <FullDoughnut
              title="Classe"
              legendSide="right"
              labels={["2nde GT", "1ère GT", "2nde Pro", "1ère Pro", "3ème", "Autre", "CAP"]}
              values={[grade["2ndeGT"], grade["1ereGT"], grade["2ndePro"], grade["1erePro"], grade["3eme"], grade["Autre"], grade["CAP"]]}
              maxLegends={3}
            />
            <FullDoughnut
              title="Situation"
              legendSide="left"
              labels={["En voie générale ou technologique", "En voie professionnelle (hors apprentissage)", "En enseignement adapté"]}
              values={[situation[YOUNG_SITUATIONS.GENERAL_SCHOOL], situation[YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL], situation[YOUNG_SITUATIONS.SPECIALIZED_SCHOOL]]}
              maxLegends={3}
            />
          </div>
        ) : selectedDetail === "situation" ? (
          <div className="flex flex-col justify-center items-center w-full gap-10">
            <BarChart values={[16, 9, 25, 3]} noValue className="h-[200px] mt-8" />
          </div>
        ) : selectedDetail === "qpv" ? (
          <div className="flex flex-col justify-center items-center w-full gap-10">
            <FullDoughnut title="Quartier prioritaires" legendSide="right" labels={["Oui", "Non"]} values={[qpv.true, qpv[""] + qpv.false]} maxLegends={3} />
            <FullDoughnut title="Zone rurale" legendSide="left" labels={["Oui", "Non"]} values={[rural.true, rural.false]} maxLegends={3} />
          </div>
        ) : null}
      </div>
    </DashboardContainer>
  );
}

const FilterDetail = ({ selectedDetail, setSelectedDetail }) => {
  const ref = useRef();
  const optionsDetail = [
    { key: "age", label: "Âge et sexe" },
    { key: "class", label: "Classe et situation" },
    { key: "situation", label: "Situations particulières" },
    { key: "qpv", label: "Issus quartiers prioritaires et zones rurales" },
  ];
  const [showDetailFilter, setShowDetailFilter] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowDetailFilter(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  return (
    <div className="relative">
      <div className="min-w-[200px] flex flex-row gap-2 items-center p-2 cursor-pointer justify-center" onClick={() => setShowDetailFilter((open) => !open)}>
        <div>{optionsDetail.find((e) => e.key === selectedDetail).label}</div>
        {showDetailFilter && <BsChevronUp className="h-4 w-4 text-gray-900" aria-hidden="true" />}
        {!showDetailFilter && <BsChevronDown className="h-4 w-4 text-gray-900" aria-hidden="true" />}
      </div>

      {showDetailFilter && (
        <div ref={ref} className="absolute bg-white z-50 w-fit rounded-md shadow-sm">
          {optionsDetail.map((option) => (
            <div
              key={option.key}
              onClick={() => {
                setShowDetailFilter(false);
                setSelectedDetail(option.key);
              }}
              className="hover:bg-gray-100 p-2 cursor-pointer">
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

async function getDetailInscriptions(filters) {
  const body = {
    query: { bool: { must: { match_all: {} }, filter: [] } },
    aggs: {
      age: {
        terms: {
          field: "birthdateAt",
          size: ES_NO_LIMIT,
        },
      },
      gender: {
        terms: {
          field: "gender.keyword",
          size: ES_NO_LIMIT,
        },
      },
      grade: {
        terms: {
          field: "grade.keyword",
          size: ES_NO_LIMIT,
        },
      },
      situation: {
        terms: {
          field: "situation.keyword",
          size: ES_NO_LIMIT,
        },
      },
      handicap: {
        terms: {
          field: "handicap.keyword",
          size: ES_NO_LIMIT,
        },
      },
      ppsBeneficiary: {
        terms: {
          field: "ppsBeneficiary.keyword",
          size: ES_NO_LIMIT,
        },
      },
      qpv: {
        terms: {
          field: "qpv.keyword",
          size: ES_NO_LIMIT,
        },
      },
      rural: {
        terms: {
          field: "isRegionRural.keyword",
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
  if (filters?.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": filters.status } });
  const { responses } = await api.esQuery("young", body);
  if (!responses.length) return;
  // get keys of aggregations
  const keys = Object.keys(responses[0].aggregations);
  const obj = {};
  keys.forEach((key) => {
    // for each key, get the buckets
    obj[key] = {};
    responses[0].aggregations[key].buckets.forEach((e) => {
      // for each bucket, get the key and the doc_count
      obj[key][e.key] = e.doc_count;
    });
  });

  return obj;
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
  console.log("responses", responses[0]);
  return api.getAggregations(responses[0]);
}
