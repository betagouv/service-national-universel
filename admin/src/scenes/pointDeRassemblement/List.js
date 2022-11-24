import { DataSearch, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import React from "react";
import { BsDownload } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { canCreateMeetingPoint, ES_NO_LIMIT, ROLES, START_DATE_SESSION_PHASE1 } from "snu-lib";
import FilterSvg from "../../assets/icons/Filter";
import Breadcrumbs from "../../components/Breadcrumbs";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import ExportComponent from "../../components/ExportXlsx";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import { apiURL } from "../../config";
import api from "../../services/api";
import { Title } from "./components/common";
import ModalCreation from "./components/ModalCreation";

const FILTERS = ["SEARCH", "COHORT", "REGION", "DEPARTMENT"];

export default function List() {
  const user = useSelector((state) => state.Auth.user);
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [modal, setModal] = React.useState({ isOpen: false });

  const getDefaultQuery = () => {
    return { query: { match_all: {} }, track_total_hits: true };
  };

  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

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
        <ReactiveBase url={`${apiURL}/es`} app="pointderassemblement" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          <div className="flex flex-col bg-white py-4 rounded-lg">
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
                      Identifiant: item.code,
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
                defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [user.department] : []}
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
                defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [user.department] : []}
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
                  <div className="flex w-full flex-col  mt-6 mb-2">
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
      </div>
      <ModalCreation isOpen={modal.isOpen} onCancel={() => setModal({ isOpen: false })} />
    </>
  );
}

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
