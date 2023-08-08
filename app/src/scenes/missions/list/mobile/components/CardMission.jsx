import React from "react";
import { Link } from "react-router-dom";
import LocationMarker from "../../../../../assets/icons/LocationMarker";
import IconDomain from "../../../components/IconDomain";
import { getDistance } from "../../../../../utils";
import dayjs from "dayjs";
import Calendar from "../../../../../assets/icons/Calendar";
import House from "../../../components/HouseIcon";

export default function mission({ mission: missionProp, youngLocation }) {
  const mission = missionProp._source;
  return (
    <Link to={`/mission/${mission._id}`} className="relative z-10 mb-4  flex justify-between overflow-hidden rounded-xl border-[#ffffff] bg-white p-3 pt-4 shadow-nina ">
      <div className="flex flex-1">
        {/* icon */}
        <div className="mr-3 flex items-center">
          <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
        </div>

        {/* infos mission */}
        <div className="flex flex-1 flex-col">
          <div className="space-y-2">
            <div className="flex space-x-4">
              <div className="text-xs font-medium uppercase text-gray-500">{mission?.structureName}</div>
            </div>
            <div className="text-base font-bold text-gray-900">{mission?.name}</div>
          </div>
          <div className="mt-2 flex w-full flex-1 flex-row items-center">
            {/* 
            

            */}
            <div className="mx-2 flex flex-1 flex-row items-center justify-start gap-2 text-xs  font-bold text-gray-900">
              <Calendar width={10} heigth={16} className=" min-h-[20px] min-w-[14px] text-gray-400" />
              <div className="flex flex-row flex-wrap gap-1">
                <div className="whitespace-nowrap">du {dayjs(mission.startAt).format("DD/MM/YYYY")}</div>
                <div className="whitespace-nowrap">au {dayjs(mission.endAt).format("DD/MM/YYYY")}</div>
              </div>
            </div>

            {youngLocation && mission.location ? (
              <div className="flex items-center justify-end space-x-2">
                <LocationMarker className="text-gray-400" />
                <div className="text-xs font-bold text-gray-800">
                  à {getDistance(youngLocation.lat, youngLocation.lon, mission.location.lat, mission.location.lon).toFixed(1)} km
                </div>
                {mission?.hebergement === "true" ? (
                  <>
                    {mission.hebergementPayant === "true" ? (
                      <div className="rounded-full bg-yellow-100 p-1.5">
                        <House color="#D97706" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-green-50 p-1.5">
                        <House color="#059669" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-[14px] p-1.5" />
                )}
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
        {/* top-[-1px] to overlap parent div border */}
        <div className="absolute right-[-1px] top-[-1px] overflow-hidden rounded-bl-lg border-[1px] border-gray-200 bg-gray-200 py-0.5 px-2">
          <div className="flex flex-1 items-center justify-start">
            <div className="text-xs font-medium text-gray-500">&nbsp;{mission?.placesLeft} places disponibles</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
