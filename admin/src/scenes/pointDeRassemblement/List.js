import { DataSearch, MultiDropdownList, ReactiveBase, SingleDropdownList } from "@appbaseio/reactivesearch";
import React from "react";
import { BsDownload } from "react-icons/bs";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { canCreateMeetingPoint, ES_NO_LIMIT, ROLES, START_DATE_SESSION_PHASE1, COHORTS, COHESION_STAY_START, getFilterLabel } from "snu-lib";
import FilterSvg from "../../assets/icons/Filter";
import Breadcrumbs from "../../components/Breadcrumbs";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import ExportComponent from "../../components/ExportXlsx";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import { apiURL } from "../../config";
import api from "../../services/api";
import { Loading, TabItem, Title } from "./components/common";
import ModalCreation from "./components/ModalCreation";
import Menu from "../../assets/icons/Menu";
import Calendar from "../../assets/icons/Calendar";
import DoubleProfil from "../plan-transport/ligne-bus/components/Icons/DoubleProfil";
import ExternalLink from "../../assets/icons/ExternalLink";
import BusSvg from "../../assets/icons/Bus";

const FILTERS = ["SEARCH", "COHORT", "REGION", "DEPARTMENT"];

export default function List() {
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = React.useState({ isOpen: false });
  const [firstSession, setFirstSession] = React.useState(null);
  const [currentTab, setCurrentTab] = React.useState("liste-points");
  const history = useHistory();

  const getFirstCohortAvailable = () => {
    for (const session of COHORTS) {
      if (Object.prototype.hasOwnProperty.call(COHESION_STAY_START, session) && COHESION_STAY_START[session].getTime() > new Date().getTime()) {
        return setFirstSession(session);
      }
    }
  };

  React.useEffect(() => {
    getFirstCohortAvailable();
    history.replace({
      search: null,
    });
    setCurrentTab("liste-points");
  }, []);

  if (!firstSession || !user) return <div></div>;
  return (
    <>
      <Breadcrumbs items={[{ label: "Points de rassemblement" }]} />
      <div className="flex flex-col w-full px-8">
        <div className="py-8 flex items-center justify-between">
          <Title>Points de rassemblement</Title>
          {canCreateMeetingPoint(user) ? (
            <button
              className="border-[1px] border-blue-600 bg-blue-600 shadow-sm px-4 py-2 text-white hover:!text-blue-600 hover:bg-white transition duration-300 ease-in-out rounded-lg"
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
                history.replace({
                  search: null,
                });
                setCurrentTab("liste-points");
              }}
              active={currentTab === "liste-points"}
            />
            <TabItem
              icon={<Calendar />}
              title="Sessions"
              onClick={() => {
                history.replace({
                  search: null,
                });
                setCurrentTab("session");
              }}
              active={currentTab === "session"}
            />
          </div>
          <div className={`bg-white rounded-b-lg rounded-tr-lg relative items-start`}>
            <div className="flex flex-col w-full">
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
  const [filterVisible, setFilterVisible] = React.useState(false);

  const getDefaultQuery = () => {
    return { query: { match_all: {} }, track_total_hits: true };
  };

  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  return (
    <ReactiveBase url={`${apiURL}/es`} app="pointderassemblement" headers={{ Authorization: `JWT ${api.getToken()}` }}>
      <div className="flex flex-col bg-white py-4 mb-8 rounded-lg">
        <div className="flex items-center justify-between bg-white py-2 px-4">
          <div className="flex items-center gap-2">
            <DataSearch
              defaultQuery={getDefaultQuery}
              showIcon={false}
              componentId="SEARCH"
              dataField={["name", "address", "region", "department", "code", "city", "zip"]}
              placeholder="Rechercher un point de rassemblement"
              react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
              URLParams={true}
              autosuggest={false}
              className="datasearch-searchfield"
              innerClass={{ input: "searchbox" }}
            />
            <div
              className="flex gap-2 items-center px-3 py-2 rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer hover:underline"
              onClick={() => setFilterVisible((e) => !e)}>
              <FilterSvg className="text-gray-400" />
              Filtres
            </div>
          </div>
          <ExportComponent
            title="Exporter"
            defaultQuery={getExportQuery}
            exportTitle="point_de_rassemblement"
            index="pointderassemblement"
            react={{ and: FILTERS }}
            css={{
              override: true,
              button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
              loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
            }}
            icon={<BsDownload className="text-gray-400" />}
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
          />
        </div>
        <div className={`flex items-center gap-2 py-2 px-4 ${!filterVisible ? "hidden" : ""}`}>
          <MultiDropdownList
            defaultQuery={getDefaultQuery}
            className="dropdown-filter"
            placeholder="Séjours"
            componentId="COHORT"
            dataField="cohorts.keyword"
            react={{ and: FILTERS.filter((e) => e !== "COHORT") }}
            title=""
            URLParams={true}
            sortBy="asc"
            showSearch={true}
            searchPlaceholder="Rechercher..."
            size={1000}
            renderLabel={(items) => <div>{getFilterLabel(items, "Cohorte", "Cohorte")}</div>}
          />
          <MultiDropdownList
            defaultQuery={getDefaultQuery}
            className="dropdown-filter"
            placeholder="Region"
            componentId="REGION"
            dataField="region.keyword"
            react={{ and: FILTERS.filter((e) => e !== "REGION") }}
            title=""
            URLParams={true}
            sortBy="asc"
            showSearch={true}
            searchPlaceholder="Rechercher..."
            size={1000}
            defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []}
            renderLabel={(items) => <div>{getFilterLabel(items, "Région", "Région")}</div>}
          />
          <MultiDropdownList
            defaultQuery={getDefaultQuery}
            className="dropdown-filter"
            placeholder="Département"
            componentId="DEPARTMENT"
            dataField="department.keyword"
            react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT") }}
            title=""
            URLParams={true}
            sortBy="asc"
            showSearch={true}
            searchPlaceholder="Rechercher..."
            size={1000}
            defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [...user.department] : []}
            renderLabel={(items) => <div>{getFilterLabel(items, "Département", "Département")}</div>}
          />
          <DeleteFilters />
        </div>

        <div className="reactive-result">
          <ReactiveListComponent
            pageSize={50}
            defaultQuery={getDefaultQuery}
            react={{ and: FILTERS }}
            paginationAt="bottom"
            showTopResultStats={false}
            render={({ data }) => (
              <div className="flex w-full flex-col mt-6 mb-2">
                <hr />
                <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4">
                  <div className="w-[40%]">Points de rassemblements</div>
                  <div className="w-[60%]">Cohortes</div>
                </div>
                {data?.map((hit) => {
                  return <Hit key={hit._id} hit={hit} user={user} />;
                })}
                <hr />
              </div>
            )}
          />
        </div>
      </div>
    </ReactiveBase>
  );
};

const Hit = ({ hit }) => {
  const history = useHistory();
  return (
    <>
      <hr />
      <div className="flex py-2 items-center px-4 hover:bg-gray-50">
        <div className="flex flex-col gap-1 w-[40%] cursor-pointer" onClick={() => history.push(`/point-de-rassemblement/${hit._id}`)}>
          <div className="font-bold leading-6 text-gray-900">{hit.name}</div>
          <div className="font-medium text-sm leading-4 text-gray-500">
            {hit.address}, {hit.zip}, {hit.city}
          </div>
          <div className="text-xs leading-4 text-gray-500">
            {hit.department}, {hit.region}
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2 w-[60%]">
          {hit.cohorts
            ?.sort((a, b) => START_DATE_SESSION_PHASE1[a] - START_DATE_SESSION_PHASE1[b])
            ?.map((cohort, index) => {
              const disabled = START_DATE_SESSION_PHASE1[cohort] < new Date();
              return (
                <div
                  key={cohort + hit.name + index}
                  onClick={() => history.push(`/point-de-rassemblement/${hit._id}?cohort=${cohort}`)}
                  className={`rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-1 border-[1px] ${
                    disabled ? "text-gray-500 bg-gray-100 border-gray-100" : "border-[#66A7F4] text-[#0C7CFF] bg-[#F9FCFF]"
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
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [selectedCohort, setSelectedCohort] = React.useState(firstSession);
  const [pdrIds, setPdrIds] = React.useState([]);
  const [nbYoungByPdr, setNbYoungByPdr] = React.useState([]);
  const [nbLinesByPdr, setNbLinesByPdr] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const getDefaultQuery = () => {
    return { query: { match_all: {} }, track_total_hits: true };
  };

  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

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

  return (
    <ReactiveBase url={`${apiURL}/es`} app="pointderassemblement" headers={{ Authorization: `JWT ${api.getToken()}` }}>
      <div className="flex flex-col bg-white py-4 mb-8 rounded-lg">
        <div className="flex items-center justify-between bg-white py-2 px-4">
          <div className="flex items-center gap-2">
            <DataSearch
              defaultQuery={getDefaultQuery}
              showIcon={false}
              componentId="SEARCH"
              dataField={["name", "address", "region", "department", "code", "city", "zip"]}
              placeholder="Rechercher un point de rassemblement"
              react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
              URLParams={true}
              autosuggest={false}
              className="datasearch-searchfield"
              innerClass={{ input: "searchbox" }}
            />
            <div
              className="flex gap-2 items-center px-3 py-2 rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer hover:underline"
              onClick={() => setFilterVisible((e) => !e)}>
              <FilterSvg className="text-gray-400" />
              Filtres
            </div>
          </div>
          <ExportComponent
            title="Exporter"
            defaultQuery={getExportQuery}
            exportTitle="point_de_rassemblement"
            index="pointderassemblement"
            react={{ and: FILTERS }}
            css={{
              override: true,
              button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
              loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
            }}
            icon={<BsDownload className="text-gray-400" />}
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
          />
        </div>
        <div className={`flex items-center gap-2 py-2 px-4 ${!filterVisible ? "hidden" : ""}`}>
          <SingleDropdownList
            URLParams={true}
            className="dropdown-filter"
            componentId="COHORT"
            placeholder="Séjours"
            dataField="cohorts.keyword"
            react={{ and: FILTERS.filter((e) => e !== "COHORT") }}
            showSearch={true}
            searchPlaceholder="Rechercher..."
            renderLabel={(item) => {
              if (!item) return <div>Cohorte</div>;
              return <div>Cohorte : {item}</div>;
            }}
            defaultValue={selectedCohort}
            onValueChange={(value) => setSelectedCohort(value)}
          />

          <MultiDropdownList
            defaultQuery={getDefaultQuery}
            className="dropdown-filter"
            placeholder="Region"
            componentId="REGION"
            dataField="region.keyword"
            react={{ and: FILTERS.filter((e) => e !== "REGION") }}
            title=""
            URLParams={true}
            sortBy="asc"
            showSearch={true}
            searchPlaceholder="Rechercher..."
            size={1000}
            defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []}
            renderLabel={(items) => <div>{getFilterLabel(items, "Région", "Région")}</div>}
          />
          <MultiDropdownList
            defaultQuery={getDefaultQuery}
            className="dropdown-filter"
            placeholder="Département"
            componentId="DEPARTMENT"
            dataField="department.keyword"
            react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT") }}
            title=""
            URLParams={true}
            sortBy="asc"
            showSearch={true}
            searchPlaceholder="Rechercher..."
            size={1000}
            defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [...user.department] : []}
            renderLabel={(items) => <div>{getFilterLabel(items, "Département", "Département")}</div>}
          />
        </div>

        <div className="reactive-result">
          <ReactiveListComponent
            pageSize={50}
            defaultQuery={getDefaultQuery}
            react={{ and: FILTERS }}
            paginationAt="bottom"
            showTopResultStats={false}
            onData={async ({ rawData }) => {
              if (rawData?.hits?.hits) setPdrIds(rawData.hits.hits.map((pdr) => pdr._id));
            }}
            render={({ data }) => (
              <div className="flex w-full flex-col mt-6 mb-2">
                <hr />
                <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4">
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
            )}
          />
        </div>
      </div>
    </ReactiveBase>
  );
};

const HitSession = ({ hit, session, nbYoung, nbLines, loading }) => {
  const history = useHistory();

  return (
    <>
      <hr />
      <div className="flex py-2 items-center px-4 hover:bg-gray-50">
        <div className="flex flex-col gap-1 w-[35%] cursor-pointer" onClick={() => history.push(`/point-de-rassemblement/${hit._id}`)}>
          <div className="font-bold leading-6 text-gray-900">{hit.name}</div>
          <div className="font-medium text-sm leading-4 text-gray-500">
            {hit.address}, {hit.zip}, {hit.city}
          </div>
          <div className="text-xs leading-4 text-gray-500">
            {hit.department}, {hit.region}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-[25%]">
          <div
            onClick={() => history.push(`/point-de-rassemblement/${hit._id}?cohort=${session}`)}
            className={`rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-1 border-[1px] border-[#66A7F4] text-[#0C7CFF] bg-[#F9FCFF]`}>
            {session}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-[20%]">
          {loading ? (
            <Loading width="w-1/2" />
          ) : (
            <div className="flex items-center gap-2">
              <DoubleProfil className="text-gray-400" />
              <div className="text-gray-900 text-sm leading-5">{nbYoung || 0} </div>
              <Link
                to={`/ligne-de-bus/volontaires/point-de-rassemblement/${hit._id.toString()}?cohort=${session}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                <ExternalLink className="text-gray-400" />
              </Link>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 w-[20%]">
          {loading ? (
            <Loading width="w-1/2" />
          ) : (
            <div className="flex items-center gap-2">
              <BusSvg className="text-gray-400 -rotate-12" />
              <div className="text-gray-900 text-sm leading-5">{nbLines || 0} </div>
              <Link
                to={`/ligne-de-bus?cohort=${session}&CODE_PDR=%5B"${hit.code}"%5D`}
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                <ExternalLink className="text-gray-400" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
