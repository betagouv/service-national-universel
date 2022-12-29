import React from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { TabItem, Title } from "../components/commons";
import Select from "../components/Select";
import { BsArrowLeft, BsArrowRight, BsDownload } from "react-icons/bs";
import { DataSearch, MultiDropdownList, ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import api from "../../../services/api";
import { apiURL } from "../../../config";
import FilterSvg from "../../../assets/icons/Filter";
import ExportComponent from "../../../components/ExportXlsx";
import { ES_NO_LIMIT } from "snu-lib";
import History from "../../../assets/icons/History";
import { useHistory } from "react-router-dom";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import DeleteFilters from "../../../components/buttons/DeleteFilters";

const FILTERS = ["SEARCH"];

const cohortList = [
  { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
  { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
  { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
  { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
  { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
];

export default function List() {
  const [cohort, setCohort] = React.useState("Février 2023 - C");
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState("aller");
  const history = useHistory();

  const getDefaultQuery = () => {
    return { query: { match_all: {} }, track_total_hits: true };
  };

  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport" }]} />
      <div className="flex flex-col w-full px-8 pb-8 ">
        <div className="py-8 flex items-center justify-between">
          <Title>Plan de transport</Title>
          <Select options={cohortList} value={cohort} onChange={(e) => setCohort(e)} />
        </div>

        <ReactiveBase url={`${apiURL}/es`} app="plandetransport" headers={{ Authorization: `JWT ${api.getToken()}` }}>
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
                  exportTitle="Session"
                  icon={<BsDownload className="text-gray-400" />}
                  index="sessionphase1"
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
              {/* Filter */}
              {/* Sur la ligne - N° de ligne - Date du transport aller/retour - Taux de remplissage (100%-0%, le reste) Sur les points de rassemblement : - Région - Département -
              Commune (pour REF REG et DEP) - Nom Sur le centre : - Région - Département - Nom - Code Sur les demandes de modifications : - Demande de modification oui/non - Statut
              de la demande de modification (à instruire/validée/refusée) - Avis (favorable/défavorable) (pour MOD ONLY) */}
              {/* <MultiDropdownList
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
                // defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [user.department] : []}
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
                // defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []}
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
                // defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [user.department] : []}
              />
              <DeleteFilters />*/}
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
                      <div className="w-[40%]">Lignes</div>
                      <div className="w-[30%]">Points de rassemblements</div>
                      <div className="w-[15%]">Centres de destinations</div>
                      <div className="w-[10%]">Taux de remplissage</div>
                      <div className="w-[5%] h-1"></div>
                    </div>
                    {data?.map((hit) => {
                      return <Line key={hit._id} hit={hit} />;
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

const Line = ({ hit }) => {
  console.log("🚀 ~ file: List.js:194 ~ Line ~ hit", hit);
  return (
    <>
      <hr />
      <div className="flex py-2 items-center px-4 hover:bg-gray-50">
        <div className="w-[40%]">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{hit.busId}</div>
            <div className="text-xs text-gray-400">Région départ > Région arrivée</div>
          </div>
        </div>
        <div className="w-[30%]">
          {/* // Meeting points list */}
          <div className="flex gap-2">
            {hit.pointDeRassemblements.map((meetingPoint) => {
              return <div className="text-sm font-medium">{meetingPoint.department}</div>;
            })}
          </div>
        </div>
        <div className="w-[15%]">
          <div className="flex gap-2">{hit.center}</div>
        </div>
        <div className="w-[10%]">Cercle avec pourcentage</div>
        <div className="w-[5%]"></div>
      </div>
    </>
  );
};
