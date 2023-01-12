import React from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { TabItem, Title } from "../components/commons";
import Select from "../components/Select";
import { BsArrowLeft, BsArrowRight, BsDownload } from "react-icons/bs";
import { DataSearch, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import api from "../../../services/api";
import { apiURL } from "../../../config";
import FilterSvg from "../../../assets/icons/Filter";
import ExportComponent from "../../../components/ExportXlsx";
import { ES_NO_LIMIT, ROLES } from "snu-lib";
import History from "../../../assets/icons/History";
import { useHistory } from "react-router-dom";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import DeleteFilters from "../../../components/buttons/DeleteFilters";
import ArrowUp from "../../../assets/ArrowUp";
import Train from "../../../assets/train";
import { useSelector } from "react-redux";
import Comment from "../../../assets/comment";

const FILTERS = [
  "SEARCH",
  "COHORT",
  "LINE_NUMBER",
  "DATE_ALLER",
  "DATE_RETOUR",
  "TAUX_REMPLISSAGE",
  "REGION_PDR",
  "DEPARTMENT_PDR",
  "CITY_PDR",
  "NAME_PDR",
  "REGION_CENTER",
  "DEPARTMENT_CENTER",
  "NAME_CENTER",
  "CODE_CENTER",
  "MODIFICATION_ASKED",
  "MODIFICATION_STATUS",
  "MODIFICATION_OPINION",
];

const cohortList = [
  { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
  { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
  { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
  { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
  { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
];

const cohortDictionary = {
  "Février 2023 - C": "Séjour du 19 Février au 3 Mars 2023",
  "Avril 2023 - A": "Séjour du 9 au 21 Avril 2023",
  "Avril 2023 - B": "Séjour du 16 au 28 Avril 2023",
  "Juin 2023": "Séjour du 11 au 23 Juin 2023",
  "Juillet 2023": "Séjour du 4 au 16 Juillet 2023",
};

const translateFillingRate = (e) => {
  if (e == 0) return "Vide";
  if (e == 100) return "Rempli";
  return `${Math.floor(e / 10) * 10}-${Math.floor(e / 10) * 10 + 10}%`;
};

export default function List() {
  const { user } = useSelector((state) => state.Auth);
  const [cohort, setCohort] = React.useState("Février 2023 - C");
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState("aller");
  const history = useHistory();

  const getDefaultQuery = () => {
    return {
      query: {
        bool: {
          filter: [{ term: { "cohort.keyword": cohort } }],
        },
      },
      track_total_hits: true,
    };
  };

  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport" }]} />
      <div className="flex flex-col w-full px-8 pb-8 ">
        <ReactiveBase url={`${apiURL}/es`} app="plandetransport" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          <div className="py-8 flex items-center justify-between">
            <Title>Plan de transport</Title>
            <Select options={cohortList} value={cohort} onChange={(e) => setCohort(e)} />
          </div>

          <div className="flex flex-1">
            <TabItem icon={<BsArrowRight />} title="Aller" onClick={() => setCurrentTab("aller")} active={currentTab === "aller"} />
            <TabItem icon={<BsArrowLeft />} title="Retour" onClick={() => setCurrentTab("retour")} active={currentTab === "retour"} />
          </div>
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
              <div className="flex gap-2 items-center">
                <button
                  className="flex gap-2 items-center text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm"
                  onClick={() => history.push("/ligne-de-bus/historique")}>
                  <History className="text-gray-400" />
                  Historique
                </button>
                <button
                  className="text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm"
                  onClick={() => history.push("/ligne-de-bus/demande-de-modification")}>
                  Demande de modification
                </button>
                <ExportComponent
                  title="Exporter"
                  defaultQuery={getExportQuery}
                  exportTitle="Plan de transport"
                  icon={<BsDownload className="text-gray-400" />}
                  index="plandetransport"
                  react={{ and: FILTERS }}
                  css={{
                    override: true,
                    button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
                    loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
                  }}
                  transform={(all) => {
                    return all.map((data) => {
                      return { ...data };
                    });
                  }}
                />
              </div>
            </div>
            <div className={`flex items-center gap-2 py-2 px-4 ${!filterVisible ? "hidden" : ""}`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <div className="uppercase text-xs text-snu-purple-800 mr-2">Ligne de bus</div>
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Numéro de la ligne"
                    componentId="LINE_NUMBER"
                    dataField="busId.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "LINE_NUMBER") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Date aller"
                    componentId="DATE_ALLER"
                    dataField="departureString.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "LINE_NUMBER") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Date retour"
                    componentId="DATE_RETOUR"
                    dataField="returnString.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "LINE_NUMBER") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Taux de remplissage"
                    componentId="TAUX_REMPLISSAGE"
                    dataField="fillingRate"
                    react={{ and: FILTERS.filter((e) => e !== "TAUX_REMPLISSAGE") }}
                    renderItem={(e, count) => {
                      return `${translateFillingRate(e)} (${count})`;
                    }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                </div>
                <div className="flex items-center">
                  <div className="uppercase text-xs text-snu-purple-800 mr-2">Points de rassemblement</div>
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Nom"
                    componentId="NAME_PDR"
                    dataField="pointDeRassemblements.name.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "NAME_PDR") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Région"
                    componentId="REGION_PDR"
                    dataField="pointDeRassemblements.region.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "REGION_PDR") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Département"
                    componentId="DEPARTMENT_PDR"
                    dataField="pointDeRassemblements.department.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT_PDR") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Ville"
                    componentId="CITY_PDR"
                    dataField="pointDeRassemblements.city.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "CITY_PDR") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                </div>
                <div className="flex items-center">
                  <div className="uppercase text-xs text-snu-purple-800 mr-2">Centre</div>
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Nom"
                    componentId="NAME_CENTER"
                    dataField="centerName.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "NAME_CENTER") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Région"
                    componentId="REGION_CENTER"
                    dataField="centerRegion.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "REGION_CENTER") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Département"
                    componentId="DEPARTMENT_CENTER"
                    dataField="centerDepartment.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT_CENTER") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Code"
                    componentId="CODE_CENTER"
                    dataField="centerCode.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "CODE_CENTER") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                </div>
                <div className="flex items-center">
                  <div className="uppercase text-xs text-snu-purple-800 mr-2">Modifications de status</div>

                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Modification demandée"
                    componentId="MODIFICATION_ASKED"
                    dataField="modificationBuses.requestMessage.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "MODIFICATION_ASKED") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Status de la modification"
                    componentId="MODIFICATION_STATUS"
                    dataField="modificationBuses.status.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "MODIFICATION_STATUS") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  {user.role === ROLES.ADMIN && (
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="Opinion sur la modification"
                      componentId="MODIFICATION_OPINION"
                      dataField="modificationBuses.opinion.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "MODIFICATION_OPINION") }}
                      title=""
                      URLParams={true}
                      sortBy="asc"
                      showSearch={true}
                      searchPlaceholder="Rechercher..."
                      size={1000}
                    />
                  )}
                </div>
                <DeleteFilters />
              </div>
            </div>
            <div className="reactive-result">
              <ReactiveListComponent
                pageSize={10}
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                paginationAt="bottom"
                showTopResultStats={false}
                render={({ data }) => (
                  <div className="flex w-full flex-col mt-6 mb-2">
                    <hr />
                    <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4 w-full">
                      <div className="w-[30%]">Lignes</div>
                      <div className="w-[40%]">Points de rassemblements</div>
                      <div className="w-[15%]">Centres de destinations</div>
                      <div className="w-[10%]">Taux de remplissage</div>
                      <div className="w-[5%]">Comments</div>
                    </div>
                    {data?.map((hit) => {
                      return <Line key={hit._id} hit={hit} currentTab={currentTab} />;
                    })}
                    <hr />
                  </div>
                )}
              />
            </div>
          </div>
        </ReactiveBase>
      </div>
    </>
  );
}

const Line = ({ hit, currentTab }) => {
  console.log("🚀 ~ file: List.js:194 ~ Line ~ hit", hit);

  const meetingPoints = currentTab === "aller" ? hit.pointDeRassemblements : hit.pointDeRassemblements.slice().reverse();

  const hasPendingModification = hit.modificationBuses?.some((modification) => modification.status === "PENDING");

  if (hit.modificationBuses) console.log("🚀 ~ file: List.js:423 ~ hasPendingModification", hit.modificationBuses);

  return (
    <>
      <hr />
      <div className="flex py-2 items-center px-4 hover:bg-gray-50">
        <div className="w-[30%]">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{hit.busId}</div>
            <div className="text-xs text-gray-400">
              {currentTab === "retour" ? `${hit.pointDeRassemblements[0].region} > ${hit.centerRegion}` : `${hit.centerRegion} > ${hit.pointDeRassemblements[0].region}`}
            </div>
          </div>
        </div>
        <div className="w-[40%]">
          <div className="flex gap-2">
            {meetingPoints.map((meetingPoint) => {
              return (
                <TooltipMeetingPoint key={meetingPoint.meetingPointId} meetingPoint={meetingPoint}>
                  <a
                    href={`/point-de-rassemblement/${meetingPoint.meetingPointId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:scale-105 cursor-pointer gap-2 text-sm font-medium flex justify-center px-2 py-1 items-center bg-gray-100 rounded-3xl">
                    {meetingPoint.city}
                    <ArrowUp />
                  </a>
                </TooltipMeetingPoint>
              );
            })}
          </div>
        </div>
        <div className="w-[15%]">
          <div className="flex gap-2">
            <TooltipCenter key={hit.centerId} name={hit.centerName} region={hit.centerRegion} department={hit.centerDepartment}>
              <a
                href={`/centre/${hit.centerId}`}
                target="_blank"
                rel="noreferrer"
                className="hover:scale-105 cursor-pointer gap-2 text-sm font-medium flex justify-center px-2 py-1 items-center">
                {hit.centerCode}
                <ArrowUp />
              </a>
            </TooltipCenter>
          </div>
        </div>
        <div className="w-[10%]">{hit.fillingRate}%</div>
        <div className="w-[5%] flex justify-center">
          {hit.modificationBuses?.length > 0 ? (
            <div className={`flex p-1 rounded-full ${hasPendingModification ? "bg-orange-500" : "bg-gray-200"}`}>
              <Comment stroke={hasPendingModification && "white"} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const TooltipMeetingPoint = ({ children, meetingPoint, ...props }) => {
  if (!meetingPoint) return children;

  return (
    <div className="relative flex flex-col items-center group" {...props}>
      {children}
      <div className="absolute hidden group-hover:flex !top-8 mb-3 items-center">
        <div className="relative p-3 text-xs leading-2 text-[#414458] whitespace-nowrap bg-white shadow-sm z-[500] rounded-lg">
          <div className="flex items-center justify-between w-[524px]">
            <div className="flex items-center">
              <div className="text-sm font-medium flex justify-center px-2 py-1 items-center bg-gray-100 rounded-lg">{meetingPoint.meetingHour}</div>
              <svg id="triangle" viewBox="0 0 100 100" width={10} height={10} className="z-[600]">
                <polygon points="0 0, 100 0, 50 55" transform="rotate(-90 50 50)" fill="#F5F5F5" />
              </svg>
              <div className="flex flex-col ml-1">
                <div className="text-sm font-medium">{meetingPoint.name}</div>
                <div className="text-xs text-gray-400">{`${meetingPoint.region} • ${meetingPoint.department}`}</div>
              </div>
            </div>
            <Train />
          </div>
        </div>
      </div>
    </div>
  );
};

const TooltipCenter = ({ children, name, region, department, ...props }) => {
  return (
    <div className="relative flex flex-col items-center group" {...props}>
      {children}
      <div className="absolute flex flex-col hidden group-hover:flex !top-8 mb-3 items-center">
        <div className="relative py-3 px-3 text-xs leading-2 text-[#414458] whitespace-nowrap bg-white shadow-sm z-[500] rounded-lg">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{`${name}`}</div>
            <div className="text-xs text-gray-400">{`${region} • ${department}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
