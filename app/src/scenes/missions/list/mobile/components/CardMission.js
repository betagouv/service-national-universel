import React from "react";
import { Link } from "react-router-dom";
import DomainThumb from "../../../../../components/DomainThumb";
import LocationMarker from "../../../../../assets/icons/LocationMarker";

export default function mission({ mission }) {
  return (
    <Link to={`/mission/${mission._id}`} className="bg-white relative flex  justify-between shadow-nina rounded-xl p-3 border-[1px] border-[#ffffff] mb-4 z-10">
      <div className="flex flex-1">
        {/* icon */}
        <div className="flex items-center">
          <DomainThumb domain={mission?.domain} size="3rem" />
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
              <div className="text-gray-500 text-xs font-normal">
                Places disponibles:&nbsp;{mission?.placesLeft}/{mission?.placesTotal}
              </div>
            </div>
            {mission?.sort?.length ? (
              <div className="flex items-center justify-end space-x-2">
                <LocationMarker className="text-gray-400" />
                <div className="text-gray-800 text-xs font-bold">à {Math.round((mission?.sort || [])[0])} km</div>
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
