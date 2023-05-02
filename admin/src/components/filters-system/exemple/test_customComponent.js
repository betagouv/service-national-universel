/* eslint-disable import/no-unused-modules */

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { HiOutlineLockClosed } from "react-icons/hi";
import { formatDateFR, formatStringDateTimezoneUTC, ROLES, translate } from "snu-lib";
import Breadcrumbs from "../../Breadcrumbs";
import Loader from "../../Loader";
import api from "../../../services/api";
import SelectStatusMissionV2 from "../../../scenes/missions/components/SelectStatusMissionV2";

import { Filters, ResultTable, SelectedFilters, Save } from "..";

import FromDate, { getQuery } from "../components/customComponent/FromDate";
import ToDate, { getQuery as getQueryToDate } from "../components/customComponent/ToDate";

export default function List() {
  const [mission, setMission] = useState(null);
  const [structure, setStructure] = useState();
  const [structureIds, setStructureIds] = useState();
  const user = useSelector((state) => state.Auth.user);

  // States for filters
  const [data, setData] = useState([]);

  // MUST BE UNIQUE
  const pageId = "mission";

  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    size: 20,
    page: 0,
  });

  const searchBarObject = {
    placeholder: "Rechercher une ligne (numéro, ville, region)",
    datafield: ["name.folded", "structureName.folded", "city.folded", "zip"],
  };
  const filterArray = [
    { title: "Statut", name: "statut", datafield: "status.keyword", parentGroup: "Ligne de Bus", missingLabel: "Non renseignée", translate: translate },
    {
      title: "Date de début",
      name: "fromDate",
      datafield: "fromDate.keyword",
      parentGroup: "Date",
      missingLabel: "Non renseignée",
      customComponent: (setQuery, filter) => <FromDate setQuery={setQuery} value={filter} />,
      //getQuery is needed only if you want to use customComponent
      getQuery: (value) => getQuery(value),
      translate: formatDateFR,
    },
    {
      title: "Date de fin",
      name: "toDate",
      datafield: "toDate.keyword",
      parentGroup: "Date",
      missingLabel: "Non renseignée",
      customComponent: (setQuery, filter) => <ToDate setQuery={setQuery} value={filter} />,
      getQuery: (value) => getQueryToDate(value),
      translate: formatDateFR,
    },
  ];

  const getDefaultQuery = () => {
    if (user.role === ROLES.SUPERVISOR)
      return {
        query: {
          bool: { filter: { terms: { "structureId.keyword": structureIds } }, must: [] },
        },
        track_total_hits: true,
      };
    return { query: { bool: { must: [{ match_all: {} }], filter: [] } }, track_total_hits: true };
  };

  useEffect(() => {
    if (user.role !== ROLES.SUPERVISOR) return;
    (async () => {
      if (!user.structureId) return;
      const { data } = await api.get(`/structure/${user.structureId}/children`);
      const ids = data.map((s) => s._id);
      setStructureIds([...ids, user.structureId]);
    })();
    return;
  }, []);
  useEffect(() => {
    (async () => {
      if (!user.structureId) return;
      const { data } = await api.get(`/structure/${user.structureId}`);
      setStructure(data);
    })();
    return;
  }, []);
  if (user.role === ROLES.SUPERVISOR && !structureIds) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Missions" }]} />
      <div className="mb-8 flex flex-row" style={{ fontFamily: "Marianne" }}>
        <div className="flex w-full flex-1 flex-col px-8">
          <div className="text-2xl font-bold leading-7 text-[#242526]">Missions</div>
          <Filters
            pageId={pageId}
            esId="mission"
            defaultQuery={getDefaultQuery()}
            setData={(value) => setData(value)}
            filters={filterArray}
            searchBarObject={searchBarObject}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
          />
          <div className="mt-2 flex flex-row flex-wrap items-center gap-2">
            <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
            <SelectedFilters
              filterArray={filterArray}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
            />
          </div>
          <div className="reactive-result">
            <ResultTable
              paramData={paramData}
              setParamData={setParamData}
              currentEntryOnPage={data?.length}
              render={
                <div className="mt-6 mb-2 flex w-full flex-col divide-y divide-gray-100 border-y-[1px] border-gray-100">
                  <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400 ">
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
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

const Hit = ({ hit, callback }) => {
  const history = useHistory();
  const onChangeStatus = (e) => {
    callback(e);
  };
  return (
    <>
      <div className="flex items-center py-3 px-4 hover:bg-gray-50">
        <div className="flex w-[40%] cursor-pointer items-center gap-4 " onClick={() => history.push(`/mission/${hit._id}`)}>
          {hit.isJvaMission === "true" ? (
            <img src={require("../../assets/JVA_round.png")} className="mx-auto h-7 w-7 group-hover:scale-105" />
          ) : (
            <img src={require("../../assets/logo-snu.png")} className="mx-auto h-7 w-7 group-hover:scale-105" />
          )}
          <div className="flex w-full flex-col gap-1">
            <p className="w-10/12 truncate font-bold leading-6 text-gray-900">{hit.name}</p>
            <p className="text-sm font-normal leading-4 text-gray-500">
              {hit.address} • {hit.city} ({hit.department})
            </p>
          </div>
        </div>
        <div className="w-[5%]">
          {hit?.visibility === "HIDDEN" && (
            <div className="group relative cursor-pointer">
              <HiOutlineLockClosed size={20} className="text-gray-400" />
              <div className="absolute bottom-[calc(100%+15px)] left-[50%] z-10 hidden min-w-[275px] translate-x-[-58%] rounded-xl bg-white px-3 py-2.5 text-center text-xs leading-5 text-gray-600 drop-shadow-xl group-hover:block">
                <div className="absolute left-[50%] bottom-[-5px] h-[15px] w-[15px] translate-x-[-50%] rotate-45 bg-white"></div>
                La mission est <strong>fermée</strong> aux candidatures
              </div>
            </div>
          )}
        </div>

        <div className="flex w-[15%] flex-col gap-2">
          <p className="text-sm font-normal leading-none text-gray-900">{hit.placesLeft} places(s)</p>
          <p className="text-sm font-normal leading-none text-gray-500">
            sur <span className="text-gray-900">{hit.placesTotal}</span>
          </p>
        </div>
        <div className="flex w-[20%] flex-col gap-2 text-sm font-normal leading-none text-gray-500">
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
