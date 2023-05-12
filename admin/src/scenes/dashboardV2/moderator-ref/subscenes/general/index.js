import React, { useEffect, useMemo, useState } from "react";

import { HiChevronDown, HiChevronRight, HiChevronUp } from "react-icons/hi";
import { IoWarningOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { COHORTS, ES_NO_LIMIT, REFERENT_ROLES, ROLES, academyList, departmentToAcademy, region2department, regionList } from "snu-lib";
import api from "../../../../../services/api";
import { getLink as getOldLink } from "../../../../../utils";
import DashboardContainer from "../../../components/DashboardContainer";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import { getDepartmentOptions, getFilteredDepartment } from "../../../components/common";
import HorizontalBar from "../../../components/graphs/HorizontalBar";
import InfoMessage from "../../../components/ui/InfoMessage";
import Engagement from "../../../components/ui/icons/Engagement";
import Inscription from "../../../components/ui/icons/Inscription";
import Sejour from "../../../components/ui/icons/Sejour";
import CustomFilter from "./components/CustomFilter";
import VolontaireSection from "./components/VolontaireSection";
import { orderCohort } from "../../../../../components/filters-system-v2/components/filters/utils";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [fullNote, setFullNote] = useState(false);
  const [fullKeyNumber, setFullKeyNumber] = useState(false);

  const [inscriptionGoals, setInscriptionGoals] = useState();
  const [volontairesData, setVolontairesData] = useState();
  const [inAndOutCohort, setInAndOutCohort] = useState();

  // eslint-disable-next-line no-unused-vars
  const [notesFromDate, setNotesFromDate] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [notesToDate, setNotesToDate] = useState(null);
  const [notesPhase, setNotesPhase] = useState("all");
  const [stats, setStats] = useState({});

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

  React.useEffect(() => {
    const updateStats = async (id) => {
      const { responses } = await api.post("/elasticsearch/dashboard/default", { filters: { meetingPointIds: [id], cohort: [] } });
      setStats({
        inscription_en_attente_de_validation: responses[0].hits.total.value,
        inscription_corrigé_à_instruire_de_nouveau: responses[1].hits.total.value,
        inscription_en_attente_de_correction: responses[2].hits.total.value,
      });
    };
    updateStats();
  }, []);

  return (
    <DashboardContainer active="general" availableTab={["general", "engagement", "sejour", "inscription", "analytics"]}>
      <div className="flex flex-col gap-8">
        {/* <InfoMessage
          bg="bg-blue-800"
          Icon={HiOutlineInformationCircle}
          message="Message d’information (white + blue/800), l'instruction des dossiers pour le séjour de février est à finaliser pour ce soir à 23h59."
        />
        <InfoMessage
          bg="bg-yellow-700"
          Icon={HiOutlineExclamationCircle}
          message="Message important (white + yellow/700), l'instruction des dossiers pour le séjour de février est à finaliser pour ce soir à 23h59."
        /> */}
        <InfoMessage
          bg="bg-red-800"
          Icon={IoWarningOutline}
          message="Message urgent  (white + red/800), suite à un problème technique, nous vous invitons à revalider les missions que vous aviez validés entre le 3 janvier 15h et le 4 janvier 8h. Veuillez nous excuser pour le désagrément."
        />
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">En ce moment</h1>
        <div className="flex gap-4">
          <div className={`flex w-[70%] flex-col gap-4 rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] ${!fullNote ? "h-[584px]" : "h-fit"}`}>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Inscription />
                  <div className="text-sm font-bold leading-5 text-gray-900">Inscriptions</div>
                  <div className="rounded-full bg-blue-50 px-2.5 pt-0.5 pb-1 text-sm font-medium leading-none text-blue-600">4</div>
                </div>
                <NoteContainer
                  title="Dossier"
                  number={stats.inscription_en_attente_de_validation}
                  content="dossier d’inscriptions sont en attente de validation."
                  btnLabel="À instruire"
                />
                <NoteContainer
                  title="Dossier"
                  number={stats.inscription_corrigé_à_instruire_de_nouveau}
                  content="dossiers d’inscription corrigés sont à instruire de nouveau."
                  btnLabel="À instruire"
                />
                <NoteContainer
                  title="Dossier"
                  number={stats.inscription_en_attente_de_correction}
                  content="dossiers d’inscription en attente de correction."
                  btnLabel="À instruire"
                />
                {fullNote && <NoteContainer title="Dossier" number={2} content="dossier d’inscriptions sont en attente de validation." btnLabel="À instruire" />}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Sejour />
                  <div className="text-sm font-bold leading-5 text-gray-900">Séjours</div>
                  <div className=" rounded-full bg-blue-50 px-2.5 pt-0.5 pb-1 text-sm font-medium leading-none text-blue-600">7</div>
                </div>
                {Array.from(Array(7).keys())
                  .slice(0, fullNote ? 7 : 3)
                  .map((i) => (
                    <NoteContainer key={`sejour` + i} title="Dossier" number={2} content="dossier d’inscriptions sont en attente de validation." btnLabel="À instruire" />
                  ))}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Engagement />
                  <div className="text-sm font-bold leading-5 text-gray-900">Engagement</div>
                  <div className="rounded-full bg-blue-50 px-2.5 pt-0.5 pb-1 text-sm font-medium leading-none text-blue-600">9</div>
                </div>
                {Array.from(Array(9).keys())
                  .slice(0, fullNote ? 9 : 3)
                  .map((i) => (
                    <NoteContainer
                      key={`engagement` + i}
                      title="Dossier"
                      number={2}
                      content="dossier d’inscriptions sont en attente de validation.
                    dossier d’inscriptions sont en attente de validation. "
                      btnLabel="À instruire"
                    />
                  ))}
              </div>
            </div>
            <div className="flex justify-center">
              <button className="flex items-center gap-1 text-sm text-blue-600" onClick={() => setFullNote(!fullNote)}>
                <span>{fullNote ? "Voir moins" : "Voir plus"}</span>
                {fullNote ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className={`flex w-[30%]  flex-col rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] ${!fullKeyNumber ? "h-[584px]" : "h-fit"}`}>
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="text-sm font-bold leading-5 text-gray-900">Chiffres clés</div>
                <div className=" text-medium rounded-full bg-blue-50 px-2.5 py-0.5 text-sm leading-none text-blue-600">22</div>
              </div>
              <CustomFilter setFromDate={setNotesFromDate} setToDate={setNotesToDate} notesPhase={notesPhase} setNotesPhase={setNotesPhase} />
            </div>
            <div className="flex h-full flex-col justify-between">
              {Array.from(Array(22).keys())
                .slice(0, fullKeyNumber ? 22 : 7)
                .map((i) => (
                  <div key={`keyNumber` + i} className={`flex items-center gap-4 border-t-[1px] border-gray-200 ${fullKeyNumber ? "py-3" : "h-full"}`}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Inscription />
                    </div>
                    <div className="text-sm text-gray-900">
                      3 abandons de <strong>missions</strong>
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-4 flex justify-center">
              <button className="flex items-center gap-1 text-sm text-blue-600" onClick={() => setFullKeyNumber(!fullKeyNumber)}>
                <span>{fullKeyNumber ? "Voir moins" : "Voir plus"}</span>
                {fullKeyNumber ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
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
              getOldLink({ base: `/volontaire`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"VALIDATED"%5D'] }),
              getOldLink({ base: `/volontaire`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"WAITING_LIST"%5D'] }),
              getOldLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"WAITING_VALIDATION"%5D'] }),
              getOldLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"WAITING_CORRECTION"%5D'] }),
              getOldLink({ base: `/inscription`, filter: selectedFilters, filtersUrl: ['STATUS=%5B"IN_PROGRESS"%5D'] }),
            ]}
          />
        </div>
        <VolontaireSection volontairesData={volontairesData} inAndOutCohort={inAndOutCohort} filter={selectedFilters} />
      </div>
    </DashboardContainer>
  );
}

const NoteContainer = ({ title, number, content, btnLabel }) => {
  return (
    <div className="flex h-36 w-full flex-col justify-between rounded-lg bg-blue-50 py-3.5 px-3">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold leading-5 text-gray-900">{title}</span>
        <p className="text-xs font-normal leading-4 text-gray-900">
          <span className="font-bold text-blue-600">{number} </span>
          {content}
        </p>
      </div>
      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-full bg-blue-600 py-1 pr-2 pl-3 text-xs font-medium text-white">
          <span>{btnLabel}</span>
          <HiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

function filterByRegionAndDepartement(e, filters, user) {
  if (filters?.department?.length) return filters.department.includes(e.department);
  else if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) return user.department.includes(e.department);
  if (filters?.region?.length) return filters.region.includes(e.region);
  if (filters?.academy?.length) return filters.academy.includes(e.academy);
  return true;
}

const getInscriptionGoals = async () => {
  let dataMerged = [];
  const query = {
    query: { bool: { must: { match_all: {} } } },
    size: ES_NO_LIMIT,
  };
  const { responses } = await api.esQuery("inscriptiongoal", query);
  if (!responses?.length) {
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

async function getCurrentInscriptions(filters) {
  const body = {
    query: { bool: { must: { match_all: {} }, filter: [] } },
    aggs: {
      status: {
        terms: {
          field: "status.keyword",
          size: ES_NO_LIMIT,
        },
        aggs: {
          statusPhase1: {
            terms: {
              field: "statusPhase1.keyword",
              size: ES_NO_LIMIT,
            },
          },
          statusPhase2: {
            terms: {
              field: "statusPhase2.keyword",
              size: ES_NO_LIMIT,
            },
          },
          statusPhase3: {
            terms: {
              field: "statusPhase3.keyword",
              size: ES_NO_LIMIT,
            },
          },
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
  if (!responses?.length) return {};
  let result = responses[0].aggregations.status.buckets.reduce((acc, status) => {
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
  const cohortList = filters?.cohort?.length ? filters.cohort : COHORTS;

  const aggs = cohortList.reduce((acc, cohort) => {
    acc["in&" + cohort] = {
      filter: {
        bool: {
          must: [{ term: { "cohort.keyword": cohort } }, { term: { "status.keyword": "VALIDATED" } }, { exists: { field: "originalCohort.keyword" } }],
          must_not: [{ term: { "originalCohort.keyword": cohort } }],
          filter: [],
        },
      },
    };
    acc["out&" + cohort] = {
      filter: {
        bool: {
          must: [{ term: { "originalCohort.keyword": cohort } }, { term: { "status.keyword": "VALIDATED" } }, { exists: { field: "originalCohort.keyword" } }],
          must_not: [{ term: { "cohort.keyword": cohort } }],
          filter: [],
        },
      },
    };
    return acc;
  }, {});

  const body = {
    query: { bool: { must: { match_all: {} }, filter: [] } },
    aggs,
    size: 0,
  };

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
  if (!responses?.length) return {};
  const aggreg = responses[0].aggregations;
  let result = Object.keys(aggreg).reduce((acc, cohort) => {
    const type = cohort.split("&")[0];
    acc[type] = acc[type] ? acc[type] + aggreg[cohort].doc_count : aggreg[cohort].doc_count;
    return acc;
  }, {});

  return result;
}
