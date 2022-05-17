import React, { useState, useEffect, useRef } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import api from "../../services/api";
import { apiURL } from "../../config";
import { Filter2, FilterRow, ResultTable } from "../../components/list";
import FilterSvg from "../../assets/icons/Filter";
import Badge from "../../components/Badge";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import DeleteFilters from "../../components/buttons/DeleteFilters";

const FILTERS = ["SEARCH", "CENTER", "DEPARTMENT", "BUS", "COHORT"];

export default function MeetingPoint() {
  useDocumentTitle("Points de rassemblement");
  const [filterVisible, setFilterVisible] = useState(false);
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const getDefaultQuery = () => {
    return { query: { match_all: {} }, track_total_hits: true };
  };

  return (
    <div className="m-4">
      <div className="font-bold text-2xl mb-4">Points de rassemblements</div>
      <div className="bg-white pt-4 rounded-lg">
        <ReactiveBase url={`${apiURL}/es`} app="meetingpoint" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
            <div style={{ flex: 2, position: "relative" }}>
              <Filter2>
                <div className="flex items-center mb-2 gap-2 bg-white">
                  <DataSearch
                    defaultQuery={getDefaultQuery}
                    showIcon={false}
                    placeholder="Rechercher..."
                    componentId="SEARCH"
                    dataField={["centerCode", "departureAddress", "busExcelId"]}
                    react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                    innerClass={{ input: "searchbox" }}
                    URLParams={true}
                    autosuggest={false}
                  />
                  <div
                    className="flex gap-2 items-center px-3 py-2 rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer hover:underline"
                    onClick={() => setFilterVisible((e) => !e)}>
                    <FilterSvg className="text-gray-400" />
                    Filtres
                  </div>
                </div>
                <FilterRow visible={filterVisible}>
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Département"
                    componentId="DEPARTMENT"
                    dataField="departureDepartment.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT") }}
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
                    placeholder="Cohorte"
                    componentId="COHORT"
                    dataField="cohort.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "COHORT") }}
                    renderItem={(e, count) => {
                      return `${e} (${count})`;
                    }}
                    title=""
                    URLParams={true}
                    showSearch={false}
                  />
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Centre"
                    componentId="CENTER"
                    dataField="centerCode.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "CENTER") }}
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
                    placeholder="Transport"
                    componentId="BUS"
                    dataField="busExcelId.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "BUS") }}
                    title=""
                    URLParams={true}
                    sortBy="asc"
                    showSearch={true}
                    searchPlaceholder="Rechercher..."
                    size={1000}
                  />
                  <DeleteFilters />
                </FilterRow>
              </Filter2>
              <ResultTable>
                <ReactiveListComponent
                  defaultQuery={getDefaultQuery}
                  react={{ and: FILTERS }}
                  paginationAt="bottom"
                  showTopResultStats={false}
                  render={({ data }) => (
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs uppercase text-gray-400 border-y-[1px] border-gray-100">
                          <th className="py-3 pl-4">Département départ</th>
                          <th>Adresse</th>
                          <th>Centre</th>
                          <th>Transport</th>
                          <th>places dispo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.map((hit) => {
                          return <Hit key={hit._id} hit={hit} />;
                        })}
                      </tbody>
                    </table>
                  )}
                />
              </ResultTable>
            </div>
          </div>
        </ReactiveBase>
      </div>
    </div>
  );
}

const Hit = ({ hit, selected }) => {
  let mounted = useRef(true);
  const [bus, setBus] = useState();

  useEffect(() => {
    (async () => {
      const { data, ok } = await api.get(`/bus/${hit.busId}`);
      if (!ok) return;
      if (data && mounted) setBus(data);
    })();
    return () => (mounted = false);
  }, [hit]);

  const bgColor = selected && "bg-snu-purple-300";

  return (
    <tr className={`${!selected && "hover:!bg-gray-100"}`}>
      <td className={`${bgColor} py-3 pl-4 ml-2 rounded-l-lg`}>
        <div>{hit.departureDepartment}</div>
      </td>
      <td>{hit.departureAddress}</td>
      <td className={`${bgColor}`}>
        <a href={`/centre/${hit.centerId}`} target="_blank" rel="noreferrer">
          {hit.centerCode}
        </a>
      </td>
      <td className={`${bgColor}`}>{hit.busExcelId}</td>
      {bus && mounted ? (
        <td className={`${bgColor} rounded-r-lg`}>
          <div>
            {bus.placesLeft === 0 ? <Badge text="Complet" /> : <span className="font-bold text-black">{bus.placesLeft} places disponibles</span>}
            <div className="text-xs text-gray-500">sur {bus.capacity} places proposées</div>
          </div>
        </td>
      ) : (
        <td className={`${bgColor} rounded-r-lg`}>chargement...</td>
      )}
    </tr>
  );
};
