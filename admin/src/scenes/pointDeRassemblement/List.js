import React from "react";
import { BsDownload } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { canCreateMeetingPoint, ES_NO_LIMIT, ROLES, START_DATE_SESSION_PHASE1, COHORTS, COHESION_STAY_START, getDepartmentNumber } from "snu-lib";
import Breadcrumbs from "../../components/Breadcrumbs";
import { adminURL } from "../../config";
import api from "../../services/api";
import { Loading, TabItem, Title } from "./components/common";
import ModalCreation from "./components/ModalCreation";
import Menu from "../../assets/icons/Menu";
import Calendar from "../../assets/icons/Calendar";
import DoubleProfil from "../plan-transport/ligne-bus/components/Icons/DoubleProfil";
import ExternalLink from "../../assets/icons/ExternalLink";
import BusSvg from "../../assets/icons/Bus";

import { Filters, ResultTable, getDefaultQuery, Save, SelectedFilters, ExportComponentV2 } from "../../components/filters-system";

export default function List() {
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = React.useState({ isOpen: false });
  const [firstSession, setFirstSession] = React.useState(null);
  const history = useHistory();
  const { currentTab } = useParams();

  const getFirstCohortAvailable = () => {
    for (const session of COHORTS) {
      if (Object.prototype.hasOwnProperty.call(COHESION_STAY_START, session) && COHESION_STAY_START[session].getTime() > new Date().getTime()) {
        return setFirstSession(session);
      }
    }
  };

  React.useEffect(() => {
    const listTab = ["liste-points", "session"];
    if (!listTab.includes(currentTab)) return history.push(`/point-de-rassemblement/liste/liste-points`);
  }, [currentTab]);

  React.useEffect(() => {
    getFirstCohortAvailable();
  }, []);

  if (!firstSession || !user) return <div></div>;
  return (
    <>
      <Breadcrumbs items={[{ label: "Points de rassemblement" }]} />
      <div className="flex w-full flex-col px-8">
        <div className="flex items-center justify-between py-8">
          <Title>Points de rassemblement</Title>
          {canCreateMeetingPoint(user) ? (
            <button
              className="rounded-lg border-[1px] border-blue-600 bg-blue-600 px-4 py-2 text-white shadow-sm transition duration-300 ease-in-out hover:bg-white hover:!text-blue-600"
              onClick={() => setModal({ isOpen: true })}>
              Rattacher un point à un séjour
            </button>
          ) : null}
        </div>
        <div>
          <div className="flex flex-1">
            <TabItem
              icon={<Menu />}
              title="Liste des points"
              onClick={() => {
                history.replace(`/point-de-rassemblement/liste/liste-points`);
              }}
              active={currentTab === "liste-points"}
            />
            <TabItem
              icon={<Calendar />}
              title="Sessions"
              onClick={() => {
                history.replace(`/point-de-rassemblement/liste/session`);
              }}
              active={currentTab === "session"}
            />
          </div>
          <div className={`relative mb-8 items-start rounded-b-lg rounded-tr-lg bg-white`}>
            <div className="flex w-full flex-col pt-4">
              {currentTab === "liste-points" && <ListPoints user={user} />}
              {currentTab === "session" && <ListSessions user={user} firstSession={firstSession} />}
            </div>
          </div>
        </div>
      </div>
      <ModalCreation isOpen={modal.isOpen} onCancel={() => setModal({ isOpen: false })} />
    </>
  );
}

const ListPoints = ({ user }) => {
  const [data, setData] = React.useState([]);
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const pageId = "pdrList";
  const [paramData, setParamData] = React.useState({
    size: 20,
    page: 0,
  });
  const filterArray = [
    { title: "Cohorte", name: "cohorts", datafield: "cohorts.keyword", missingLabel: "Non renseignée" },
    { title: "Région", name: "region", datafield: "region.keyword", missingLabel: "Non renseignée" },
    {
      title: "Département",
      name: "department",
      datafield: "department.keyword",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
  ];
  const searchBarObject = {
    placeholder: "Rechercher un point de rassemblement",
    datafield: ["name", "address", "region", "department", "code", "city", "zip"],
  };

  return (
    <div className="flex flex-col rounded-lg bg-white">
      <div className="mx-4">
        <div className="flex w-full flex-row justify-between">
          <Filters
            pageId={pageId}
            esId="pointderassemblement"
            defaultQuery={getDefaultQuery()}
            setData={(value) => setData(value)}
            filters={filterArray}
            searchBarObject={searchBarObject}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
          />
          <ExportComponentV2
            title="Exporter"
            defaultQuery={getDefaultQuery()}
            filters={filterArray}
            exportTitle="point_de_rassemblement"
            index="pointderassemblement"
            transform={async (data) => {
              let res = [];
              for (const item of data) {
                res.push({
                  Identifiant: item._id.toString(),
                  Code: item.code,
                  Cohortes: item?.cohorts
                    .sort((a, b) => START_DATE_SESSION_PHASE1[a] - START_DATE_SESSION_PHASE1[b])
                    ?.map((e) => e)
                    .join(", "),
                  Nom: item.name,
                  Adresse: item.address,
                  Ville: item.city,
                  "Code postal": item.zip,
                  Département: item.department,
                  Région: item.region,
                });
              }
              return res;
            }}
            selectedFilters={selectedFilters}
            searchBarObject={searchBarObject}
            icon={<BsDownload className="text-gray-400" />}
            css={{
              override: true,
              button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
              loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
            }}
          />
        </div>
        <div className="mt-2 flex flex-row flex-wrap items-center">
          <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
          <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
        </div>
      </div>

      <ResultTable
        paramData={paramData}
        setParamData={setParamData}
        currentEntryOnPage={data?.length}
        render={
          <div className="mt-6 mb-2 flex w-full flex-col">
            <hr />
            <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400">
              <div className="w-[40%]">Points de rassemblements</div>
              <div className="w-[60%]">Cohortes</div>
            </div>
            {data?.map((hit) => {
              return <Hit key={hit._id} hit={hit} user={user} />;
            })}
            <hr />
          </div>
        }
      />
    </div>
  );
};

const Hit = ({ hit }) => {
  const history = useHistory();
  return (
    <>
      <hr />
      <div className="flex items-center py-2 px-4 hover:bg-gray-50">
        <div className="flex w-[40%] cursor-pointer flex-col gap-1" onClick={() => history.push(`/point-de-rassemblement/${hit._id}`)}>
          <div className="font-bold leading-6 text-gray-900">{hit.name}</div>
          <div className="text-sm font-medium leading-4 text-gray-500">
            {hit.address}, {hit.zip}, {hit.city}
          </div>
          <div className="text-xs leading-4 text-gray-500">
            {hit.department}, {hit.region}
          </div>
        </div>
        <div className="flex w-[60%] flex-wrap items-center gap-2">
          {hit.cohorts
            ?.sort((a, b) => START_DATE_SESSION_PHASE1[a] - START_DATE_SESSION_PHASE1[b])
            ?.map((cohort, index) => {
              const disabled = START_DATE_SESSION_PHASE1[cohort] < new Date();
              return (
                <div
                  key={cohort + hit.name + index}
                  onClick={() => history.push(`/point-de-rassemblement/${hit._id}?cohort=${cohort}`)}
                  className={`cursor-pointer rounded-full border-[1px] px-3 py-1 text-xs font-medium leading-5 ${
                    disabled ? "border-gray-100 bg-gray-100 text-gray-500" : "border-[#66A7F4] bg-[#F9FCFF] text-[#0C7CFF]"
                  }`}>
                  {cohort}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

const ListSessions = ({ user, firstSession }) => {
  const [data, setData] = React.useState([]);
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const pageId = "pdrListSession";
  const [paramData, setParamData] = React.useState({
    size: 20,
    page: 0,
  });
  const filterArray = [
    { title: "Cohorte", name: "cohorts", datafield: "cohorts.keyword", missingLabel: "Non renseignée", isSingle: true, defaultValue: [firstSession], allowEmpty: false },
    {
      title: "Région",
      name: "region",
      datafield: "region.keyword",
      missingLabel: "Non renseignée",
      defaultValue: user.role === ROLES.REGION ? [user.region] : [],
    },
    {
      title: "Département",
      name: "department",
      datafield: "department.keyword",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? [...user.department] : [],
    },
  ];
  const searchBarObject = {
    placeholder: "Rechercher un point de rassemblement",
    datafield: ["name", "address", "region", "department", "code", "city", "zip"],
  };

  const [pdrIds, setPdrIds] = React.useState([]);
  const [nbYoungByPdr, setNbYoungByPdr] = React.useState([]);
  const [nbLinesByPdr, setNbLinesByPdr] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const selectedCohort = selectedFilters?.cohorts?.filter ? selectedFilters.cohorts.filter[0] : firstSession;

  const getYoungsByPdr = async (ids) => {
    let body1 = {
      query: {
        bool: {
          filter: [{ terms: { "meetingPointId.keyword": ids } }, { terms: { "status.keyword": ["VALIDATED"] } }, { term: { "cohort.keyword": selectedCohort } }],
        },
      },
      aggs: {
        group_by_meetingPointId: {
          terms: { field: "meetingPointId.keyword", size: ES_NO_LIMIT },
        },
      },
      size: 0,
    };

    const { responses } = await api.esQuery("young", body1);
    return responses[0]?.aggregations?.group_by_meetingPointId?.buckets || [];
  };

  const getLinesByPdr = async (ids) => {
    let body2 = {
      query: { bool: { filter: [{ terms: { "meetingPointsIds.keyword": ids } }, { term: { "cohort.keyword": selectedCohort } }] } },
      aggs: {
        group_by_meetingPointId: {
          terms: { field: "meetingPointsIds.keyword", size: ES_NO_LIMIT },
        },
      },
      size: 0,
    };

    const { responses } = await api.esQuery("lignebus", body2);
    return responses[0]?.aggregations?.group_by_meetingPointId?.buckets || [];
  };

  const getInfoPdr = async () => {
    setLoading(true);
    const nbYoung = await getYoungsByPdr(pdrIds);
    const nbLines = await getLinesByPdr(pdrIds);
    setNbYoungByPdr(nbYoung);
    setNbLinesByPdr(nbLines);
    setLoading(false);
  };

  React.useEffect(() => {
    if (!pdrIds.length) {
      setNbLinesByPdr([]);
      setNbYoungByPdr([]);
    } else getInfoPdr();
  }, [pdrIds]);

  React.useEffect(() => {
    if (data) setPdrIds(data.map((pdr) => pdr._id));
  }, [data]);

  return (
    <div className="flex flex-col rounded-lg bg-white">
      <div className="mx-4">
        <div className="flex w-full flex-row justify-between">
          <Filters
            pageId={pageId}
            esId="pointderassemblement"
            defaultQuery={getDefaultQuery()}
            setData={(value) => setData(value)}
            filters={filterArray}
            searchBarObject={searchBarObject}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
          />
          <ExportComponentV2
            title="Exporter"
            defaultQuery={getDefaultQuery()}
            filters={filterArray}
            exportTitle="point_de_rassemblement"
            index="pointderassemblement"
            transform={async (data) => {
              const youngsByMettingPoints = await getYoungsByPdr(data.map((d) => d._id));
              const linesByMettingPoints = await getLinesByPdr(data.map((d) => d._id));

              let res = [];
              for (const item of data) {
                res.push({
                  Identifiant: item._id.toString(),
                  Code: item.code,
                  Cohort: selectedCohort,
                  Nom: item.name,
                  Adresse: item.address,
                  "Complément d'adresse": item?.complementAddress.find((e) => e.cohort === selectedCohort)?.complement || "",
                  Ville: item.city,
                  "Code postal": item.zip,
                  Département: item.department,
                  Région: item.region,
                  "Volontaires attendus sur le point": youngsByMettingPoints.find((e) => e.key === item._id)?.doc_count || 0,
                  "Lignes attendues sur le point": linesByMettingPoints.find((e) => e.key === item._id)?.doc_count || 0,
                });
              }
              return res;
            }}
            selectedFilters={selectedFilters}
            searchBarObject={searchBarObject}
            icon={<BsDownload className="text-gray-400" />}
            css={{
              override: true,
              button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
              loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
            }}
          />
        </div>
        <div className="mt-2 flex flex-row flex-wrap items-center">
          <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
          <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
        </div>
      </div>
      <ResultTable
        paramData={paramData}
        setParamData={setParamData}
        currentEntryOnPage={data?.length}
        render={
          <div className="mt-6 mb-2 flex w-full flex-col">
            <hr />
            <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400">
              <div className="w-[35%]">Points de rassemblements</div>
              <div className="w-[25%]">Cohortes</div>
              <div className="w-[20%]">Volontaires attendus sur le point</div>
              <div className="w-[20%]">Lignes attendues sur le point</div>
            </div>
            {data?.map((hit) => {
              return (
                <HitSession
                  key={hit._id}
                  hit={hit}
                  user={user}
                  session={selectedCohort}
                  nbYoung={nbYoungByPdr.find((e) => e.key === hit._id)?.doc_count || 0}
                  nbLines={nbLinesByPdr.find((e) => e.key === hit._id)?.doc_count || 0}
                  loading={loading}
                />
              );
            })}
            <hr />
          </div>
        }
      />
    </div>
  );
};

const HitSession = ({ hit, session, nbYoung, nbLines, loading }) => {
  const history = useHistory();

  return (
    <>
      <hr />
      <div className="flex items-center py-2 px-4 hover:bg-gray-50">
        <div className="flex w-[35%] cursor-pointer flex-col gap-1" onClick={() => history.push(`/point-de-rassemblement/${hit._id}`)}>
          <div className="font-bold leading-6 text-gray-900">{hit.name}</div>
          <div className="text-sm font-medium leading-4 text-gray-500">
            {hit.address}, {hit.zip}, {hit.city}
          </div>
          <div className="text-xs leading-4 text-gray-500">
            {hit.department}, {hit.region}
          </div>
        </div>
        <div className="flex w-[25%] flex-wrap gap-2">
          <div
            onClick={() => history.push(`/point-de-rassemblement/${hit._id}?cohort=${session}`)}
            className={`cursor-pointer rounded-full border-[1px] border-[#66A7F4] bg-[#F9FCFF] px-3 py-1 text-xs font-medium leading-5 text-[#0C7CFF]`}>
            {session}
          </div>
        </div>
        <div className="flex w-[20%] flex-wrap gap-2">
          {loading ? (
            <Loading width="w-1/2" />
          ) : (
            <div className="flex items-center gap-2">
              <DoubleProfil className="text-gray-400" />
              <div className="text-sm leading-5 text-gray-900">{nbYoung || 0} </div>
              <a target="_blank" rel="noreferrer" href={`${adminURL}/ligne-de-bus/volontaires/point-de-rassemblement/${hit._id.toString()}?cohort=${session}`}>
                <ExternalLink className="text-gray-400" />
              </a>
            </div>
          )}
        </div>
        <div className="flex w-[20%] flex-wrap gap-2">
          {loading ? (
            <Loading width="w-1/2" />
          ) : (
            <div className="flex items-center gap-2">
              <BusSvg className="-rotate-12 text-gray-400" />
              <div className="text-sm leading-5 text-gray-900">{nbLines || 0} </div>
              <a href={`${adminURL}/ligne-de-bus?cohort=${session}&CODE_PDR=%5B"${hit.code}"%5D`} target="_blank" rel="noreferrer">
                <ExternalLink className="text-gray-400" />
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
