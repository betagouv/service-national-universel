import React, { Fragment, useEffect, useMemo, useState } from "react";

import { Popover, Transition } from "@headlessui/react";
import { HiChevronDown, HiChevronRight, HiChevronUp, HiOutlineExclamationCircle, HiOutlineInformationCircle } from "react-icons/hi";
import { IoWarningOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { COHORTS, ES_NO_LIMIT, REFERENT_ROLES, ROLES, academyList, departmentToAcademy, region2department, regionList } from "snu-lib";
import DatePicker from "../../../../../components/ui/forms/DatePicker";
import api from "../../../../../services/api";
import DashboardContainer from "../../../components/DashboardContainer";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import { getDepartmentOptions, getFilteredDepartment } from "../../../components/common";
import HorizontalBar from "../../../components/graphs/HorizontalBar";
import InfoMessage from "../../../components/ui/InfoMessage";
import Engagement from "../../../components/ui/icons/Engagement";
import Inscription from "../../../components/ui/icons/Inscription";
import Sejour from "../../../components/ui/icons/Sejour";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [fullNote, setFullNote] = useState(false);
  const [fullKeyNumber, setFullKeyNumber] = useState(false);

  const [inscriptionDetailObject, setInscriptionDetailObject] = useState({});
  const [inscriptionGoals, setInscriptionGoals] = useState();

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
    <DashboardContainer active="general" availableTab={["general", "engagement", "sejour", "inscription", "analytics"]}>
      <div className="flex flex-col gap-8">
        <InfoMessage
          bg="bg-blue-800"
          Icon={HiOutlineInformationCircle}
          message="Message d’information (white + blue/800), l'instruction des dossiers pour le séjour de février est à finaliser pour ce soir à 23h59."
        />
        <InfoMessage
          bg="bg-yellow-700"
          Icon={HiOutlineExclamationCircle}
          message="Message important (white + yellow/700), l'instruction des dossiers pour le séjour de février est à finaliser pour ce soir à 23h59."
        />
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
                  <div className="text-sm font-bold leading-5 text-gray-900">Inscription</div>
                  <div className=" text-medium rounded-full bg-blue-50 px-2.5 py-0.5 text-sm leading-none text-blue-600">4</div>
                </div>
                {Array.from(Array(4).keys())
                  .slice(0, fullNote ? 4 : 3)
                  .map((i) => (
                    <NoteContainer key={`inscriptions` + i} title="Dossier" number={2} content="dossier d’inscriptions sont en attente de validation." btnLabel="À instruire" />
                  ))}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Sejour />
                  <div className="text-sm font-bold leading-5 text-gray-900">Séjour</div>
                  <div className=" text-medium rounded-full bg-blue-50 px-2.5 py-0.5 text-sm leading-none text-blue-600">7</div>
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
                  <div className=" text-medium rounded-full bg-blue-50 px-2.5 py-0.5 text-sm leading-none text-blue-600">9</div>
                </div>
                {Array.from(Array(9).keys())
                  .slice(0, fullNote ? 9 : 3)
                  .map((i) => (
                    <NoteContainer key={`engagement` + i} title="Dossier" number={2} content="dossier d’inscriptions sont en attente de validation." btnLabel="À instruire" />
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
              <FilterPopOver />
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
            labels={["Sur la liste principale", "Sur liste complémentaire", "En attente de validation", "En attente de correction", "En cours"]}
            values={[
              inscriptionDetailObject.VALIDATED || 0,
              inscriptionDetailObject.WAITING_LIST || 0,
              inscriptionDetailObject.WAITING_VALIDATION || 0,
              inscriptionDetailObject.WAITING_CORRECTION || 0,
              inscriptionDetailObject.IN_PROGRESS || 0,
            ]}
            goal={goal}
          />
        </div>
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">Volontaires</h1>
        <div className="flex gap-4">
          <div className="flex w-1/4 flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
              <p className="text-base font-bold text-gray-900">Volontaires</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
              <p className="text-base font-bold text-gray-900">Désistements</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
          <div className="flex w-1/4 flex-col gap-8 rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
            <p className="text-base font-bold text-gray-900">Changement de cohorte</p>
            <div className="my-auto flex items-center ">
              <div className="flex w-[45%] flex-col items-center justify-center gap-4 ">
                <p className="text-xs text-gray-600">Sorties</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
              <div className="flex h-full w-[10%] items-center justify-center">
                <div className="h-full w-[1px] border-r-[1px] border-gray-300 "></div>
              </div>
              <div className="flex w-[45%] flex-col items-center justify-center gap-4">
                <p className="text-xs text-gray-600">Entrées</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          <div className="flex w-1/2 flex-col gap-2 rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
            <p className="text-base font-bold text-gray-900">Validations par phases</p>
            <div className="flex gap-4">
              <div className="flex w-[55%] items-center">
                <div className="flex w-[30%] flex-col items-center gap-2">
                  <div className="h-[10px] w-[10px] rounded-full bg-blue-800"></div>
                  <p className="text-2xl font-bold text-gray-900">146</p>
                  <p className="text-center text-xs text-gray-600">Ayant validé la Phase 1</p>
                </div>
                <div className="flex h-full w-[5%] gap-2">
                  <div className="m-auto h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
                </div>
                <div className="flex w-[30%] flex-col items-center gap-2">
                  <div className="h-[10px] w-[10px] rounded-full bg-blue-800"></div>
                  <p className="text-2xl font-bold text-gray-900">6</p>
                  <p className="text-center text-xs text-gray-600">Ayant validé la Phase 2</p>
                </div>
                <div className="flex h-full w-[5%] gap-2">
                  <div className="m-auto h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
                </div>
                <div className="flex w-[30%] flex-col items-center gap-2">
                  <div className="h-[10px] w-[10px] rounded-full bg-blue-800"></div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-center text-xs text-gray-600">Ayant validé la Phase 3</p>
                </div>
              </div>
              <div className="flex w-[45%] flex-col gap-2">
                <div className="w-full">
                  <div className="h-8  rounded-full bg-blue-800" style={{ width: "100%" }}></div>
                </div>
                <div className="w-full">
                  <div className="h-8  rounded-full bg-blue-500" style={{ width: "50%" }}></div>
                </div>
                <div className="w-full">
                  <div className="h-8  rounded-full bg-blue-300" style={{ width: "30%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
}

const NoteContainer = ({ title, number, content, btnLabel }) => {
  return (
    <div className="flex h-36 w-full flex-col justify-between rounded-lg bg-blue-50 py-4 px-3">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold leading-5 text-gray-900">{title}</span>
        <p className="text-xs font-normal leading-4 text-gray-900">
          <span className="font-bold text-blue-600">{number} </span>
          {content}
        </p>
      </div>
      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
          <span>{btnLabel}</span>
          <HiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const FilterPopOver = () => {
  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-bold text-gray-500 outline-none">
        <span>Filtrer</span>
        <HiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1">
        <Popover.Panel className="absolute right-0 z-10 mt-2 flex w-screen max-w-min">
          <div className="w-60 shrink rounded-lg bg-white pt-3 pb-1 text-sm leading-6 shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="flex flex-col">
              <span className="mb-1 px-4 text-sm text-gray-500">Phase</span>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="h-4 w-4 cursor-pointer" />
                <span className="text-sm font-normal leading-5 text-gray-700">Tous</span>
              </div>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="h-4 w-4 cursor-pointer" />
                <span className="text-sm font-normal leading-5 text-gray-700">Inscription</span>
              </div>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="h-4 w-4 cursor-pointer" />
                <span className="text-sm font-normal leading-5 text-gray-700">Séjour</span>
              </div>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="h-4 w-4 cursor-pointer" />
                <span className="text-sm font-normal leading-5 text-gray-700">Engagement</span>
              </div>
              <hr className="my-2 text-gray-100" />
              <span className="mb-1 px-4 text-sm text-gray-500">Période</span>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="h-4 w-4 cursor-pointer" />
                <span className="text-sm font-normal leading-5 text-gray-700">Les 15 derniers jours</span>
              </div>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="h-4 w-4 cursor-pointer" />
                <span className="text-sm font-normal leading-5 text-gray-700">Les 30 derniers jours</span>
              </div>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="h-4 w-4 cursor-pointer" />
                <span className="text-sm font-normal leading-5 text-gray-700">La semaine dernière</span>
              </div>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="h-4 w-4 cursor-pointer" />
                <span className="text-sm font-normal leading-5 text-gray-700">Le mois dernier</span>
              </div>
              <DatePickerPopOver />
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

const DatePickerPopOver = () => {
  return (
    <Popover className="relative">
      <Popover.Button className="flex w-full cursor-pointer items-center gap-3 px-4 py-1.5 outline-none hover:bg-gray-50">
        <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="h-4 w-4 cursor-pointer" />
        <span className="text-sm font-normal leading-5 text-gray-700">Une date spécifique</span>
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1">
        <Popover.Panel className="absolute right-0 z-10 mt-2 flex w-screen max-w-min">
          <div className="flex flex-auto rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 ">
            <DatePicker mode="range" fromYear={2022} toYear={2030} />
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
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
