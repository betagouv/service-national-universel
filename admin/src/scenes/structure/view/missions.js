import React, { useState } from "react";
import api from "../../../services/api";
import Panel from "../../missions/panel";
import StructureViewV2 from "./wrapperv2";

import { ReactiveBase } from "@appbaseio/reactivesearch";
import { HiOutlineLockClosed } from "react-icons/hi";
import { useHistory } from "react-router-dom";
import Loader from "../../../components/Loader";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import { apiURL } from "../../../config";
import { formatStringDateTimezoneUTC } from "../../../utils";
import SelectStatusMissionV2 from "../../missions/components/SelectStatusMissionV2";

export default function Mission({ structure }) {
  const [mission, setMission] = useState();

  if (!structure) return <Loader />;

  const getDefaultQuery = () => {
    return { query: { bool: { filter: { term: { "structureId.keyword": structure?._id } } } }, track_total_hits: true };
  };

  return (
    <div className="flex w-full">
      <StructureViewV2 tab="missions">
        <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          <div className="reactive-result bg-white rounded-xl pt-4 mb-8">
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
      <div className="flex py-4 items-center px-4 hover:bg-gray-50">
        <div className="flex items-center gap-4 w-[40%] cursor-pointer " onClick={() => history.push(`/mission/${hit._id}`)}>
          {hit.isJvaMission === "true" ? (
            <img src={require("../../../assets/JVA_round.png")} className="h-9 w-9 group-hover:scale-105 mx-auto" />
          ) : (
            <img src={require("../../../assets/logo-snu.png")} className="h-9 w-9 group-hover:scale-105 mx-auto" />
          )}
          <div className="flex flex-col gap-1 w-full">
            <p className="font-bold leading-6 text-gray-900 truncate w-10/12">{hit.name}</p>
            <p className="font-normal text-sm leading-4 text-gray-500">
              {hit.address} • {hit.city} ({hit.department})
            </p>
          </div>
        </div>
        <div className="w-[5%]">{hit?.visibility === "HIDDEN" && <HiOutlineLockClosed size={20} className="text-gray-400" />}</div>
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
