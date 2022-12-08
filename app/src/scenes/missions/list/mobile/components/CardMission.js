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
                {mission.hebergement === "true" && (
                  <>
                    {mission.hebergementPayant === "true" ? (
                      <div className="p-1.5 bg-yellow-100 rounded-full">
                        <House color="#D97706" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-green-50 rounded-full">
                        <House color="#059669" />
                      </div>
                    )}
                  </>
                )}
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

const House = ({ color }) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 7L2.33333 5.66667M2.33333 5.66667L7 1L11.6667 5.66667M2.33333 5.66667V12.3333C2.33333 12.7015 2.63181 13 3 13H5M11.6667 5.66667L13 7M11.6667 5.66667V12.3333C11.6667 12.7015 11.3682 13 11 13H9M5 13C5.36819 13 5.66667 12.7015 5.66667 12.3333V9.66667C5.66667 9.29848 5.96514 9 6.33333 9H7.66667C8.03486 9 8.33333 9.29848 8.33333 9.66667V12.3333C8.33333 12.7015 8.63181 13 9 13M5 13H9"
        stroke={color}
      />
    </svg>
  );
};
