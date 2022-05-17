import React, { useState, useEffect, useRef } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";

import api from "../../services/api";
import { apiURL } from "../../config";
import { Filter2, FilterRow, ResultTable } from "../../components/list";
import FilterSvg from "../../assets/icons/Filter";
import BusSvg from "../../assets/icons/Bus";
import ArrowCircleRightSvg from "../../assets/icons/ArrowCircleRight";
import Badge from "../../components/Badge";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import { Link } from "react-router-dom";
import Pencil from "../../assets/icons/Pencil";

const FILTERS = ["SEARCH", "CENTER", "DEPARTMENT", "BUS", "COHORT"];

export default function MeetingPoint() {
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
                          <th className="py-3 pl-4">Transport</th>
                          <th>Adresse de départ</th>
                          <th>déstination</th>
                          <th>places disponibles</th>
                          <th className="text-center">actions</th>
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

const Hit = ({ hit }) => {
  let mounted = useRef(true);
  const [bus, setBus] = useState();
  const [center, setCenter] = useState();

  useEffect(() => {
    (async () => {
      const { data, ok } = await api.get(`/bus/${hit.busId}`);
      if (!ok) return;
      if (data && mounted) setBus(data);
    })();
    return () => (mounted = false);
  }, [hit]);
  useEffect(() => {
    (async () => {
      const { data, ok } = await api.get(`/cohesion-center/${hit.centerId}`);
      if (!ok) return;
      if (data && mounted) setCenter(data);
    })();
    return () => (mounted = false);
  }, [hit]);

  return (
    <tr className="hover:!bg-gray-100">
      <td className={` py-3 pl-4 ml-2 rounded-l-lg`}>
        <div className="flex gap-2 items-center text-sm">
          <BusSvg />
          {hit.busExcelId}
        </div>
      </td>
      <td className="">
        <div className="text-[#242526] text-[15px]">{hit.departureAddress}</div>
        <div className="font-normal text-xs text-[#738297]">{hit.departureDepartment}</div>
      </td>
      <td className="">
        <a className="flex gap-2 items-center text-sm" href={`/centre/${hit.centerId}`} target="_blank" rel="noreferrer">
          <ArrowCircleRightSvg className="text-[#9CA3AF]" />
          <div>
            <div className="text-[#242526] text-[15px]">{hit.centerCode}</div>
            <div className="font-normal text-xs text-[#738297]">{center?.department}</div>
          </div>
        </a>
      </td>
      {bus && mounted ? (
        <td className={` rounded-r-lg`}>
          <div>
            {bus.placesLeft === 0 ? (
              <Badge text="Complet" />
            ) : (
              <span className="text-[#242526] text-xs">
                <span className="font-bold text-[15px]">{bus.placesLeft} </span>places disponibles
              </span>
            )}
            <div className="font-normal text-xs text-[#738297]">sur {bus.capacity} places proposées</div>
          </div>
        </td>
      ) : (
        <td className={`rounded-r-lg`}>chargement...</td>
      )}
      <td>
        <div className="flex justify-center items-center">
          <Link to={`/point-de-rassemblement/${hit._id}/edit`}>
            <div className="flex justify-center items-center h-8 w-8 bg-gray-100 group-hover:bg-white text-gray-600 rounded-full hover:scale-105">
              <Pencil width={16} height={16} />
            </div>
          </Link>
        </div>
      </td>
    </tr>
  );
};
