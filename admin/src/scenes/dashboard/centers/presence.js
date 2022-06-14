import { DataSearch, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import FilterSvg from "../../../assets/icons/Filter";
import ExportComponent from "../../../components/ExportXlsx";
import { DepartmentFilter, RegionFilter } from "../../../components/filters";
import { Filter2, FilterRow, ResultTable } from "../../../components/list";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import { apiURL } from "../../../config";
import api from "../../../services/api";
import { ES_NO_LIMIT, getFilterLabel, ROLES, translate, formatLongDateFR } from "../../../utils";
import Panel from "../../volontaires/panel";

const FILTERS = ["SEARCH", "PLACES", "COHORT", "DEPARTMENT", "REGION", "STATUS", "CODE2022"];

export default function Presence() {
  const [young, setYoung] = useState();
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterCohort, setFilterCohort] = useState([]);
  const user = useSelector((state) => state.Auth.user);

  const getDefaultQuery = () => {
    return { query: { match_all: {} }, track_total_hits: true };
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  return (
    <ReactiveBase url={`${apiURL}/es`} app="cohesioncenter" headers={{ Authorization: `JWT ${api.getToken()}` }}>
      <div className="mt-4">
        <h1 className="leading-7 text-xl text-gray-900 mb-8">Présence par centre</h1>
        <div className="flex items-start w-full bg-white p-3 rounded-lg">
          <div className="flex flex-col flex-1">
            <div className="flex items-start w-full h-full">
              <div className="flex-1 relative">
                <div className="flex items-center mb-2 gap-2">
                  <Filter2 className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <DataSearch
                          showIcon={false}
                          placeholder="Rechercher par nom de centre, ville, code postal..."
                          componentId="SEARCH"
                          dataField={["name", "city", "zip", "code", "code2022"]}
                          react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                          innerClass={{ input: "searchbox" }}
                          autosuggest={false}
                          queryFormat="and"
                        />
                        <div
                          className="flex gap-2 items-center px-3 py-2 rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer hover:underline"
                          onClick={() => setFilterVisible((e) => !e)}>
                          <FilterSvg className="text-gray-400" />
                          Filtres
                        </div>
                      </div>
                      <ExportComponent
                        title="Exporter les présences"
                        defaultQuery={getExportQuery}
                        exportTitle="Centres_de_cohesion"
                        index="cohesioncenter"
                        react={{ and: FILTERS }}
                        transform={async (data) => {
                          let all = data.reduce((prev, current) => {}, []);
                          return all.map((data) => {
                            return {
                              Nom: data.name,
                              id: data._id,
                              "Code (2021)": data.code,
                              "Code (2022)": data.code2022,
                              "Cohorte(s)": data.cohorts?.join(", "),
                              COR: data.COR,
                              "Accessibilité aux personnes à mobilité réduite": translate(data.pmr),
                              Adresse: data.address,
                              Ville: data.city,
                              "Code Postal": data.zip,
                              "N˚ Département": data.departmentCode,
                              Département: data.department,
                              Région: data.region,
                              "Places total": data.placesTotal,
                              "Places disponibles": data.placesLeft,
                              "Tenues livrées": data.outfitDelivered,
                              Observations: data.observations,
                              "Créé lé": formatLongDateFR(data.createdAt),
                              "Mis à jour le": formatLongDateFR(data.updatedAt),
                            };
                          });
                        }}
                      />
                    </div>
                    <FilterRow visible={filterVisible}>
                      <MultiDropdownList
                        className="dropdown-filter"
                        componentId="COHORT"
                        dataField="cohorts.keyword"
                        react={{ and: FILTERS.filter((e) => e !== "COHORT") }}
                        renderItem={(e, count) => {
                          return `${translate(e)} (${count})`;
                        }}
                        title=""
                        URLParams={true}
                        showSearch={false}
                        renderLabel={(items) => getFilterLabel(items, "Cohortes", "Cohortes")}
                        onValueChange={setFilterCohort}
                      />
                      <RegionFilter filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []} />
                      <DepartmentFilter filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [user.department] : []} />
                      <MultiDropdownList
                        className="dropdown-filter"
                        placeholder="Code 2022"
                        componentId="CODE2022"
                        dataField="code2022.keyword"
                        react={{ and: FILTERS.filter((e) => e !== "CODE2022") }}
                        title=""
                        URLParams={true}
                        sortBy="asc"
                        showSearch={true}
                        searchPlaceholder="Rechercher..."
                        renderLabel={(items) => getFilterLabel(items, "Code 2022", "Code 2022")}
                        showMissing
                        missingLabel="Non renseigné"
                      />
                    </FilterRow>
                  </Filter2>
                </div>
                <ResultTable>
                  <ReactiveListComponent
                    react={{ and: FILTERS }}
                    dataField="name.keyword"
                    sortBy="asc"
                    paginationAt="bottom"
                    showTopResultStats={false}
                    showBottomResultStats={false}
                    render={({ data }) => (
                      <table className="w-full">
                        <thead className="">
                          <tr className="text-xs uppercase text-gray-400 border-y-[1px] border-gray-100">
                            <th className="py-3 pl-4">Centre</th>
                            <th className="">Présence à l&apos;arrivée</th>
                            <th className="">Absents à l&apos;arrivée</th>
                            <th className="">Présence non renseignée</th>
                            <th className="">Départs</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(data || []).map((centre) => (
                            <Centre key={centre._id} centre={centre} filterCohort={filterCohort} />
                          ))}
                        </tbody>
                      </table>
                    )}
                  />
                </ResultTable>
              </div>
            </div>
          </div>
          <Panel
            value={young}
            onChange={() => {
              setYoung(null);
            }}
          />
        </div>
      </div>
    </ReactiveBase>
  );
}

const Centre = ({ centre, filterCohort }) => {
  return (centre?.cohorts || [])
    .filter((cohort) => filterCohort.length === 0 || filterCohort.includes(cohort))
    .map((cohort) => <Session key={centre.name + "-" + cohort} centre={centre} cohort={cohort} />);
};

const Session = ({ centre, cohort }) => {
  const history = useHistory();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState({ presenceArrive: 0, absenceArrive: 0, nonRenseigneArrive: 0, depart: 0 });

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/cohesion-center/${centre._id}/cohort/${cohort}/stats`);
      setData(data);
    })();
  }, [centre, cohort]);

  useEffect(() => {
    if (!data || !data?.youngs) return;
    const newStats = (data?.youngs || []).reduce((previous, young) => {
      if (young.cohesionStayPresence === "true") {
        previous.presenceArrive = (previous.presenceArrive || 0) + 1;
      }
      if (young.cohesionStayPresence === "false") {
        previous.absenceArrive = (previous.absenceArrive || 0) + 1;
      }
      if (!young.cohesionStayPresence) {
        previous.nonRenseigneArrive = (previous.nonRenseigneArrive || 0) + 1;
      }
      if (young.departSejourAt) {
        previous.depart = (previous.depart || 0) + 1;
      }
      return previous;
    }, {});
    setStats((prev) => ({ ...prev, ...newStats }));
  }, [data]);

  return (
    <tr
      className={`hover:!bg-gray-100 ${!data?.sessionPhase1 ? "cursor-not-allowed" : "cursor-pointer"}`}
      onClick={() => data?.sessionPhase1 && history.push(`/centre/${centre._id}/${data?.sessionPhase1?._id}/general`)}>
      <td className={`py-3 pl-4 ml-2 rounded-l-lg`}>
        <div>
          <div className="text-xs">{cohort}</div>
          <div className={`font-bold text-[#242526] text-[15px]`}>{centre.name || <span>Non renseigné</span>}</div>
          <div className={`font-normal text-xs text-[#738297]`}>
            {centre.city} • {centre.department}
          </div>
        </div>
      </td>
      {!data ? (
        <>
          {[...Array(4)].map((e, i) => (
            <td key={centre.name + "-" + cohort + "-" + i}>
              <div className="animate-pulse flex space-x-4 mx-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-gray-300 rounded col-span-2"></div>
                    <div className="h-2 bg-gray-300 rounded col-span-1"></div>
                  </div>
                </div>
              </div>
            </td>
          ))}
        </>
      ) : (
        <>
          <td>
            <div className="flex gap-1">
              <div className="text-sm font-bold text-black">{stats.presenceArrive}</div>
              <div className="text-sm font-light text-gray-500">({Math.round((stats.presenceArrive / (data?.youngs?.length || 1)) * 100)}%)</div>
            </div>
          </td>
          <td>
            <div className="flex gap-1">
              <div className="text-sm font-bold text-black">{stats.absenceArrive}</div>
              <div className="text-sm font-light text-gray-500">({Math.round((stats.absenceArrive / (data?.youngs?.length || 1)) * 100)}%)</div>
            </div>
          </td>
          <td>
            <div className="flex gap-1">
              <div className="text-sm font-bold text-black">{stats.nonRenseigneArrive}</div>
              <div className="text-sm font-light text-gray-500">({Math.round((stats.nonRenseigneArrive / (data?.youngs?.length || 1)) * 100)}%)</div>
            </div>
          </td>
          <td>
            <div className="flex gap-1">
              <div className="text-sm font-bold text-black">{stats.depart}</div>
              <div className="text-sm font-light text-gray-500">({Math.round((stats.depart / (data?.youngs?.length || 1)) * 100)}%)</div>
            </div>
          </td>
        </>
      )}
    </tr>
  );
};
