import React from "react";
import { Link } from "react-router-dom";
import LocationMarker from "../../../../../assets/icons/LocationMarker";
import IconDomain from "../../../components/IconDomain";
import { getDistance } from "../../../../../utils";
import dayjs from "dayjs";
import Calendar from "../../../../../assets/icons/Calendar";
import House from "../../../components/HouseIcon";

export default function mission({ mission, youngLocation }) {
  return (
    <Link to={`/mission/${mission._id}`} className="bg-white relative flex  justify-between shadow-nina rounded-xl p-3 border-[#ffffff] mb-4 z-10 pt-4 overflow-hidden ">
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
          <div className="flex flex-1 items-center flex-row w-full">
            {/* 
            

            */}
            <div className="flex flex-1 flex-row text-xs gap-2 mx-2 text-gray-900 font-bold  items-center justify-start">
              <Calendar width={10} heigth={16} className=" min-w-[14px] min-h-[20px] text-gray-400" />
              <div className="flex flex-row gap-1 flex-wrap">
                <div>du {dayjs(mission.startAt).format("DD/MM/YYYY")}</div>
                <div>au {dayjs(mission.endAt).format("DD/MM/YYYY")}</div>
              </div>
            </div>

            {youngLocation && mission.location ? (
              <div className="flex items-center justify-end space-x-2">
                <LocationMarker className="text-gray-400" />
                <div className="text-gray-800 text-xs font-bold">
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
        </div>
        {/* top-[-1px] to overlap parent div border */}
        <div className="absolute right-[-1px] top-[-1px] bg-gray-200 rounded-bl-lg py-0.5 px-2 border-[1px] border-gray-200 overflow-hidden">
          <div className="flex flex-1 items-center justify-start">
            <div className="text-gray-500 text-xs font-medium">&nbsp;{mission?.placesLeft} places disponibles</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
