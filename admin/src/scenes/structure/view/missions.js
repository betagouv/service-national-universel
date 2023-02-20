import React, { useState } from "react";
import api from "../../../services/api";
import Panel from "../../missions/panel";
import StructureViewV2 from "./wrapperv2";

import { DataSearch, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import { HiOutlineLockClosed } from "react-icons/hi";
import { useHistory } from "react-router-dom";
import { getFilterLabel, translate, translateMission, translateVisibilty } from "snu-lib";
import FilterSvg from "../../../assets/icons/Filter";
import DeleteFilters from "../../../components/buttons/DeleteFilters";
import Loader from "../../../components/Loader";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import { apiURL } from "../../../config";
import { formatStringDateTimezoneUTC } from "../../../utils";
import SelectStatusMissionV2 from "../../missions/components/SelectStatusMissionV2";

const FILTERS = [
  "DOMAIN",
  "SEARCH",
  "STATUS",
  "PLACES",
  "LOCATION",
  "TUTOR",
  "REGION",
  "DEPARTMENT",
  "STRUCTURE",
  "MILITARY_PREPARATION",
  "DATE",
  "SOURCE",
  "VISIBILITY",
  "HEBERGEMENT",
  "HEBERGEMENT_PAYANT",
  "PLACESTATUS",
  "APPLICATIONSTATUS",
];

export default function Mission({ structure }) {
  const [mission, setMission] = useState();
  const [filterVisible, setFilterVisible] = useState(false);
  const handleShowFilter = () => setFilterVisible(!filterVisible);

  if (!structure) return <Loader />;

  const getDefaultQuery = () => {
    return { query: { bool: { filter: { term: { "structureId.keyword": structure?._id } } } }, track_total_hits: true };
  };

  return (
    <div className="flex w-full">
      <StructureViewV2 tab="missions">
        <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          <div className="reactive-result">
            <ReactiveListComponent
              defaultQuery={getDefaultQuery}
              paginationAt="bottom"
              showTopResultStats={false}
              sortOptions={[
                { label: "Date de création (récent > ancien)", dataField: "createdAt", sortBy: "desc" },
                { label: "Date de création (ancien > récent)", dataField: "createdAt", sortBy: "asc" },
                { label: "Nombre de place (croissant)", dataField: "placesLeft", sortBy: "asc" },
                { label: "Nombre de place (décroissant)", dataField: "placesLeft", sortBy: "desc" },
                { label: "Nom de la mission (A > Z)", dataField: "name.keyword", sortBy: "asc" },
                { label: "Nom de la mission (Z > A)", dataField: "name.keyword", sortBy: "desc" },
              ]}
              render={({ data }) => (
                <div className="flex flex-col bg-white gap-1 rounded-xl">
                  <div className=" pt-4 pb-1 px-4 ">
                    <div className="flex items-center gap-2 py-2">
                      <DataSearch
                        defaultQuery={getDefaultQuery}
                        showIcon={false}
                        placeholder="Rechercher par mots clés, ville, code postal..."
                        componentId="SEARCH"
                        dataField={["name.folded", "structureName.folded", "city.folded", "zip"]}
                        react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                        // fuzziness={1}
                        URLParams={true}
                        queryFormat="and"
                        autosuggest={false}
                        className="datasearch-searchfield"
                        innerClass={{ input: "searchbox" }}
                      />
                      <div
                        className="flex gap-2 items-center px-3 py-2 rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer hover:underline"
                        onClick={handleShowFilter}>
                        <FilterSvg className="text-gray-400" />
                        Filtres
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 py-2 ${!filterVisible ? "hidden" : ""}`}>
                      <div className="flex items-center gap-x-2">
                        <MultiDropdownList
                          defaultQuery={getDefaultQuery}
                          className="dropdown-filter"
                          componentId="STATUS"
                          dataField="status.keyword"
                          react={{ and: FILTERS.filter((e) => e !== "STATUS") }}
                          renderItem={(e, count) => {
                            return `${translate(e)} (${count})`;
                          }}
                          title=""
                          URLParams={true}
                          showSearch={false}
                          renderLabel={(items) => getFilterLabel(items, "Statut")}
                        />
                        <MultiDropdownList
                          defaultQuery={getDefaultQuery}
                          className="dropdown-filter"
                          placeholder="Visibilité"
                          componentId="VISIBILITY"
                          dataField="visibility.keyword"
                          react={{ and: FILTERS.filter((e) => e !== "VISIBILITY") }}
                          renderItem={(e, count) => {
                            return `${translateVisibilty(e)} (${count})`;
                          }}
                          title=""
                          URLParams={true}
                          renderLabel={(items) => getFilterLabel(items, "Visibilité", "Visibilité")}
                        />
                      </div>

                      <MultiDropdownList
                        defaultQuery={getDefaultQuery}
                        className="dropdown-filter"
                        placeholder="Places restantes"
                        componentId="PLACES"
                        dataField="placesLeft"
                        react={{ and: FILTERS.filter((e) => e !== "PLACES") }}
                        title=""
                        URLParams={true}
                        showSearch={false}
                        sortBy="asc"
                        selectAllLabel="Tout sélectionner"
                        renderLabel={(items) => getFilterLabel(items, "Places restantes", "Places restantes")}
                      />
                      <MultiDropdownList
                        defaultQuery={getDefaultQuery}
                        className="dropdown-filter"
                        placeholder="Tuteur"
                        componentId="TUTOR"
                        dataField="tutorName.keyword"
                        react={{ and: FILTERS.filter((e) => e !== "TUTOR") }}
                        title=""
                        URLParams={true}
                        showSearch={true}
                        searchPlaceholder="Rechercher..."
                      />

                      <MultiDropdownList
                        defaultQuery={getDefaultQuery}
                        className="dropdown-filter"
                        placeholder="Place occupées"
                        componentId="PLACESTATUS"
                        dataField="placesStatus.keyword"
                        react={{ and: FILTERS.filter((e) => e !== "PLACESTATUS") }}
                        renderItem={(e, count) => {
                          return `${translateMission(e)} (${count})`;
                        }}
                        title=""
                        URLParams={true}
                        showSearch={false}
                        renderLabel={(items) => getFilterLabel(items, "Place occupées", "Place occupées")}
                        showMissing
                        missingLabel="Non renseigné"
                      />

                      <div className="flex items-center gap-x-2">
                        <DeleteFilters />
                      </div>
                    </div>
                    <div className="flex w-full flex-col mt-6 mb-2 divide-y divide-gray-100 border-y-[1px] border-gray-100">
                      <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4 ">
                        <div className="w-[40%]">Mission</div>
                        <div className="w-[5%]"></div>
                        <div className="w-[15%]">Places</div>
                        <div className="w-[20%]">Dates</div>
                        <div className="w-[20%]">Statut</div>
                      </div>
                      {data.map((hit) => (
                        <Hit
                          key={hit._id}
                          hit={hit}
                          callback={(e) => {
                            if (e._id === mission?._id) setMission(e);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        </ReactiveBase>
      </StructureViewV2>
      <Panel
        mission={mission}
        onChange={() => {
          setMission(null);
        }}
      />
    </div>
  );
}

const Hit = ({ hit, callback }) => {
  const history = useHistory();
  const onChangeStatus = (e) => {
    callback(e);
  };
  return (
    <>
      <div className="flex py-3 items-center px-4 hover:bg-gray-50">
        <div className="flex items-center gap-4 w-[40%] cursor-pointer " onClick={() => history.push(`/mission/${hit._id}`)}>
          {hit.isJvaMission === "true" ? (
            <img src={require("../../../assets/JVA_round.png")} className="h-7 w-7 group-hover:scale-105 mx-auto" />
          ) : (
            <img src={require("../../../assets/logo-snu.png")} className="h-7 w-7 group-hover:scale-105 mx-auto" />
          )}
          <div className="flex flex-col gap-1 w-full">
            <p className="font-bold leading-6 text-gray-900 truncate w-10/12">{hit.name}</p>
            <p className="font-normal text-sm leading-4 text-gray-500">
              {hit.address} • {hit.city} ({hit.department})
            </p>
          </div>
        </div>
        <div className="w-[5%]">
          {hit?.visibility === "HIDDEN" && (
            <div className="group relative cursor-pointer">
              <HiOutlineLockClosed size={20} className="text-gray-400" />
              <div className="hidden group-hover:block absolute bottom-[calc(100%+15px)] left-[50%] bg-white rounded-xl translate-x-[-58%] px-3 py-2.5 text-gray-600 text-xs leading-5 drop-shadow-xl z-10 min-w-[275px] text-center">
                <div className="absolute left-[50%] translate-x-[-50%] bg-white w-[15px] h-[15px] rotate-45 bottom-[-5px]"></div>
                La mission est <strong>fermée</strong> aux candidatures
              </div>
            </div>
          )}
        </div>

        <div className="w-[15%] flex flex-col gap-2">
          <p className="text-sm leading-none font-normal text-gray-900">{hit.placesLeft} places(s)</p>
          <p className="text-sm leading-none font-normal text-gray-500">
            sur <span className="text-gray-900">{hit.placesTotal}</span>
          </p>
        </div>
        <div className="flex flex-col gap-2 w-[20%] text-sm leading-none font-normal text-gray-500">
          <p>
            Du <span className="text-gray-900">{formatStringDateTimezoneUTC(hit.startAt)}</span>
          </p>
          <p>
            Au <span className="text-gray-900">{formatStringDateTimezoneUTC(hit.endAt)}</span>
          </p>
        </div>
        <div className="w-[20%]">
          <SelectStatusMissionV2 hit={hit} callback={onChangeStatus} />
        </div>
      </div>
    </>
  );
};
