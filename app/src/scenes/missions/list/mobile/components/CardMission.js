import React from "react";
import { Link } from "react-router-dom";
import LocationMarker from "../../../../../assets/icons/LocationMarker";
import IconDomain from "../../../components/IconDomain";
import { getDistance, formatStringDateTimezoneUTC } from "../../../../../utils";
import House from "../../../components/HouseIcon";

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
            <div>
              <div className="flex flex-1 items-center justify-start">
                <div className="text-gray-500 text-xs font-medium">&nbsp;{mission?.placesLeft} places disponibles</div>
              </div>
            </div>

            {youngLocation && mission.location ? (
              <div className="flex items-center justify-end space-x-2">
                <LocationMarker className="text-gray-400" />
                <div className="text-gray-800 text-base font-bold">
                  à {getDistance(youngLocation.lat, youngLocation.lon, mission.location.lat, mission.location.lon).toFixed(1)} km
                </div>
                {mission?.hebergement === "true" ? (
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
                ) : (
                  <div className="p-1.5 w-[14px]" />
                )}
              </div>
            ) : (
              <div />
            )}
          </div>
          <div className="flex justify-start flex-row text-xs gap-2 mt-1">
            <div>
              <span className="text-gray-500">&nbsp;Du</span> {formatStringDateTimezoneUTC(mission.startAt)}
            </div>
            <div>
              <span className="text-gray-500">Au</span> {formatStringDateTimezoneUTC(mission.endAt)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
