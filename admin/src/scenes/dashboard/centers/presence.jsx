import React, { useEffect, useState } from "react";
import { DataSearch, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import FilterSvg from "../../../assets/icons/Filter";
import { DepartmentFilter, RegionFilter } from "../../../components/filters";
import { Filter2, FilterRow, ResultTable } from "../../../components/list";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import { apiURL } from "../../../config";
import api from "../../../services/api";
import { getFilterLabel, ROLES, translate, formatLongDateFR, formatDateFRTimezoneUTC } from "../../../utils";
import Panel from "../../volontaires/panel";
import * as XLSX from "xlsx";
import { toastr } from "react-redux-toastr";
import * as FileSaver from "file-saver";
import dayjs from "dayjs";
import Download from "../../../assets/icons/Download";

const FILTERS = ["SEARCH", "PLACES", "COHORT", "DEPARTMENT", "REGION", "STATUS", "CODE2022"];

export default function Presence() {
  const [young, setYoung] = useState();
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState({ cohorts: [], region: [], department: [], code2022: [] });
  const user = useSelector((state) => state.Auth.user);
  const [loading, setLoading] = useState(false);

  const exportData = async () => {
    try {
      setLoading(true);
      const { ok, data, code } = await api.post(`/cohesion-center/export-presence`, filter);
      if (!ok) {
        toastr.error("Erreur !", translate(code));
      }
      const sheet = {
        name: "présence",
        data: data,
      };

      const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const fileExtension = ".xlsx";

      const wb = XLSX.utils.book_new();
      let ws = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const resultData = new Blob([excelBuffer], { type: fileType });
      setLoading(false);
      FileSaver.saveAs(resultData, `présence_séjour_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}` + fileExtension);
    } catch (e) {
      console.log(e);
      toastr.error("Erreur !", translate(e.code));
    }
  };

  return (
    <ReactiveBase url={`${apiURL}/es`} app="cohesioncenter" headers={{ Authorization: `JWT ${api.getToken()}` }}>
      <div className="mt-4">
        <h1 className="mb-8 text-xl leading-7 text-gray-900">Présence par centre</h1>
        <div className="flex w-full items-start rounded-lg bg-white p-3">
          <div className="flex flex-1 flex-col">
            <div className="flex h-full w-full items-start">
              <div className="relative flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Filter2 className="w-full">
                    <div className="mb-2 flex items-center justify-between">
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
                          className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-[14px] font-medium text-gray-700 hover:underline"
                          onClick={() => setFilterVisible((e) => !e)}>
                          <FilterSvg className="text-gray-400" />
                          Filtres
                        </div>
                      </div>
                      {user?.role === "admin" ? (
                        <button
                          disabled={loading}
                          className="flex cursor-pointer items-center space-x-2 rounded-md border-[1px] border-gray-300 px-3 py-2 hover:border-gray-400 disabled:cursor-progress disabled:bg-gray-200"
                          onClick={exportData}>
                          {loading ? (
                            <div className="text-sm font-medium text-gray-400">Export en cours...</div>
                          ) : (
                            <>
                              <Download className="text-gray-400" />
                              <div className="text-sm font-medium text-gray-700">Exporter</div>
                            </>
                          )}
                        </button>
                      ) : null}
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
                        onValueChange={(e) => setFilter((prev) => ({ ...prev, cohorts: e }))}
                      />
                      <RegionFilter
                        filters={FILTERS}
                        defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []}
                        onValueChange={(e) => setFilter((prev) => ({ ...prev, region: e }))}
                      />
                      <DepartmentFilter
                        filters={FILTERS}
                        defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? user.department : []}
                        onValueChange={(e) => setFilter((prev) => ({ ...prev, department: e }))}
                      />
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
                        onValueChange={(e) => setFilter((prev) => ({ ...prev, code2022: e }))}
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
                          <tr className="border-y-[1px] border-gray-100 text-xs uppercase text-gray-400">
                            <th className="py-3 pl-4">Centre</th>
                            <th className="">Présence à l&apos;arrivée</th>
                            <th className="">Absents à l&apos;arrivée</th>
                            <th className="">Présence non renseignée</th>
                            <th className="">Départs</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(data || []).map((centre) => (
                            <Centre key={centre._id} centre={centre} filterCohort={filter.cohorts} />
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
      <td className={`ml-2 rounded-l-lg py-3 pl-4`}>
        <div>
          <div className="text-xs">{cohort}</div>
          <div className={`text-[15px] font-bold text-[#242526]`}>{centre.name || <span>Non renseigné</span>}</div>
          <div className={`text-xs font-normal text-[#738297]`}>
            {centre.city} • {centre.department}
          </div>
        </div>
      </td>
      {!data ? (
        <>
          {[...Array(4)].map((e, i) => (
            <td key={centre.name + "-" + cohort + "-" + i}>
              <div className="mx-4 flex animate-pulse space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 h-2 rounded bg-gray-300"></div>
                    <div className="col-span-1 h-2 rounded bg-gray-300"></div>
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
