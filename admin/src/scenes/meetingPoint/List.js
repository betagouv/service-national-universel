import { DataSearch, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import React, { useEffect, useRef, useState } from "react";
import { MdOutlineOpenInNew } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ArrowCircleRightSvg from "../../assets/icons/ArrowCircleRight";
import BusSvg from "../../assets/icons/Bus";
import FilterSvg from "../../assets/icons/Filter";
import Pencil from "../../assets/icons/Pencil";
import Eye from "../../assets/icons/Eye";
import Badge from "../../components/Badge";
import Breadcrumbs from "../../components/Breadcrumbs";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import ExportComponent from "../../components/ExportXlsx";
import { Filter2, FilterRow, ResultTable } from "../../components/list";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import { apiURL, environment } from "../../config";
import api from "../../services/api";
import { canCreateMeetingPoint, ES_NO_LIMIT, getDepartmentNumber, ROLES } from "../../utils";

const FILTERS = ["SEARCH", "CENTER", "DEPARTMENT", "BUS", "COHORT", "REGION"];

export default function MeetingPoint() {
  const [filterVisible, setFilterVisible] = useState(false);
  const user = useSelector((state) => state.Auth.user);

  const getDefaultQuery = () => {
    return { query: { match_all: {} }, track_total_hits: true };
  };

  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  return (
    <>
      <Breadcrumbs items={[{ label: "Points de rassemblement" }]} />
      <div className="m-4">
        <ReactiveBase url={`${apiURL}/es`} app="meetingpoint" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          <div className="flex flex-row justify-between items-center">
            <div className="font-bold text-2xl mb-4" style={{ fontFamily: "Marianne" }}>
              Points de rassemblements
            </div>
            <div className="flex space-x-2">
              {environment !== "production" && canCreateMeetingPoint(user) ? (
                <Link to={`/point-de-rassemblement/nouveau`}>
                  <div className="font-marianne bg-snu-purple-300 rounded-lg flex justify-center items-center px-6 py-2 text-white hover:bg-snu-purple-200">
                    <div>Créer un nouveau point de rassemblement</div>
                  </div>
                </Link>
              ) : null}
              <ExportComponent
                title="Exporter les points de rassemblements"
                defaultQuery={getExportQuery}
                exportTitle="point_de_rassemblement"
                index="meetingpoint"
                react={{ and: FILTERS }}
                transform={async (data) => {
                  let res = [];
                  for (const item of data) {
                    let bus = {};
                    if (item.busId) {
                      const { data: busResult } = await api.get(`/bus/${item.busId}`);
                      if (!busResult) bus = {};
                      else bus = busResult;
                    }

                    res.push({
                      Cohorte: item?.cohort,
                      "ID de transport": item?.busExcelId,
                      [`N° du département de départ`]: getDepartmentNumber(item?.departureDepartment),
                      "Centre de destination": item?.centerCode,
                      "Département de départ / du point de rassemblement": item?.departureDepartment,
                      "Code postal du point de rassemblement": item?.departureZip,
                      "Adresse du point de rassemblement": item?.departureAddress,
                      "ID du point de rassemblement": item?._id,
                      "Nombre de place proposées": bus?.capacity || 0,
                      "Nombre de places occupées": bus?.capacity && bus?.placesLeft ? bus?.capacity - bus.placesLeft : 0,
                      "Date/heure aller": item?.departureAtString,
                      "Date/heure retour": item?.returnAtString,
                    });
                  }
                  return res;
                }}
              />
            </div>
          </div>
          <div className="bg-white pt-4 rounded-lg">
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
                      placeholder="Region"
                      componentId="REGION"
                      dataField="departureRegion.keyword"
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
                      dataField="departureDepartment.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT") }}
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
                      defaultValue={["Juin 2022", "Juillet 2022"]}
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
                    pageSize={50}
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
                            return <Hit key={hit._id} hit={hit} user={user} />;
                          })}
                        </tbody>
                      </table>
                    )}
                  />
                </ResultTable>
              </div>
            </div>
          </div>
        </ReactiveBase>
      </div>
    </>
  );
}

const Hit = ({ hit, user }) => {
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
      <td className={`pl-4 ml-2 rounded-l-lg`}>
        <div className="flex gap-2 items-center text-sm">
          <BusSvg className="text-gray-400" />
          {hit.busExcelId}
        </div>
      </td>
      <td className="py-2">
        <div className="text-[#242526] text-[15px]">{hit.departureAddress}</div>
        <div className="font-normal text-xs text-[#738297]">{hit.departureDepartment}</div>
        <div className="font-normal text-xs text-[#738297] mt-2">{hit.departureAtString}</div>
      </td>
      <td className="">
        <a className="group flex gap-2 items-center text-sm" href={`/centre/${hit.centerId}`} target="_blank" rel="noreferrer">
          <ArrowCircleRightSvg className="text-[#9CA3AF] group-hover:scale-105" />
          <div>
            <div className="text-[#242526] text-[15px] flex items-center gap-1 group-hover:underline">
              {hit.centerCode}
              <MdOutlineOpenInNew />
            </div>
            <div className="font-normal text-xs text-[#738297]">{center?.department}</div>
          </div>
        </a>
      </td>
      {bus && mounted ? (
        <td>
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
        <td>chargement...</td>
      )}
      {user.role === ROLES.ADMIN ? (
        <td className="rounded-r-lg">
          <div className="flex justify-center items-center">
            <Link to={`/point-de-rassemblement/${hit._id}`}>
              <div className="flex justify-center items-center h-8 w-8 bg-gray-100 group-hover:bg-white text-gray-600 rounded-full hover:scale-105">
                <Pencil width={16} height={16} />
              </div>
            </Link>
          </div>
        </td>
      ) : (
        <td className="rounded-r-lg">
          <div className="flex justify-center items-center">
            <Link to={`/point-de-rassemblement/${hit._id}`}>
              <div className="flex justify-center items-center h-8 w-8 bg-gray-100 group-hover:bg-white text-gray-600 rounded-full hover:scale-105">
                <Eye width={16} height={16} />
              </div>
            </Link>
          </div>
        </td>
      )}
    </tr>
  );
};
