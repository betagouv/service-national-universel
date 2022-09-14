import React from "react";
import { Link } from "react-router-dom";
import LocationMarker from "../../../../../assets/icons/LocationMarker";
import IconDomain from "../../../components/IconDomain";
import { getDistance } from "../../../../../utils";

export default function mission({ mission, youngLocation }) {
  return (
    <Link to={`/mission/${mission._id}`} className="bg-white relative flex  justify-between shadow-nina rounded-xl p-3 border-[1px] border-[#ffffff] mb-4 z-10">
      <div className="flex flex-1">
        {/* icon */}
        <div className="flex items-center mr-3">
          <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
        </div>

        {/* infos mission */}
        <div className="flex flex-col flex-1">
          <div className="space-y-2">
            <div className="flex space-x-4">
              <div className="text-gray-500 text-xs uppercase font-medium">{mission?.structureName}</div>
            </div>
            <div className="text-gray-900 font-bold text-base">{mission?.name}</div>
          </div>
          <div className="flex flex-1 items-center justify-between">
            <div className="flex flex-1 items-center justify-start">
              <div className="text-gray-500 text-xs font-medium">&nbsp;{mission?.placesLeft} places disponibles</div>
            </div>
            {youngLocation && mission.location ? (
              <div className="flex items-center justify-end space-x-2">
                <LocationMarker className="text-gray-400" />
                <div className="text-gray-800 text-base font-bold">
                  à {getDistance(youngLocation.lat, youngLocation.lon, mission.location.lat, mission.location.lon).toFixed(1)} km
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
