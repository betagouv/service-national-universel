import React from "react";
import { Link } from "react-router-dom";
import { translate } from "../../../../../utils";
import LocationMarker from "../../../../../assets/icons/LocationMarker";
import IconDomain from "../../../components/IconDomain";
import { getDistance } from "../../../../../utils";

export default function mission({ mission, youngLocation }) {
  const tags = [];
  mission.city && tags.push(mission.city + (mission.zip ? ` - ${mission.zip}` : ""));
  mission.domains.forEach((d) => tags.push(translate(d)));

  return (
    <Link
      to={`/mission/${mission._id}`}
      className="bg-white relative flex w-full justify-between shadow-nina rounded-xl p-4 border-[1px] border-[#ffffff] mb-4 hover:translate-x-1 transition duration-200 ease-in z-10">
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
            <div className="flex flex-wrap gap-2">
              {tags.map((e, i) => (
                <div key={i} className="flex justify-center items-center text-gray-600 border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">
                  {e}
                </div>
              ))}
              {mission?.isMilitaryPreparation === "true" ? (
                <div className="flex justify-center items-center bg-blue-900 text-white border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">Préparation militaire</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 justify-between">
        {/* DISTANCE */}
        {youngLocation && mission.location ? (
          <div className="flex basis-[60%] items-center justify-end space-x-2">
            <LocationMarker className="text-gray-400" />
            <div className="text-gray-800 text-base font-bold">à {getDistance(youngLocation.lat, youngLocation.lon, mission.location.lat, mission.location.lon).toFixed(1)} km</div>
            {mission.hebergement === "true" && (
              <>
                {mission.hebergementPayant === "true" ? (
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <House color="#D97706" />
                  </div>
                ) : (
                  <div className="p-2 bg-green-50 rounded-full">
                    <House color="#059669" />
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div />
        )}
        {/* END DISTANCE */}

        {/* STATUT */}
        <div className="flex basis-[40%] items-center justify-end">
          <div className="text-gray-500 text-xs font-medium">&nbsp;{mission?.placesLeft} places disponibles</div>
        </div>
        {/* END STATUT */}
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
