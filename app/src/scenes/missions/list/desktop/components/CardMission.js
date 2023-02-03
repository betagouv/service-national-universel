import React from "react";
import { Link } from "react-router-dom";
import { translate, getDistance } from "../../../../../utils";
import LocationMarker from "../../../../../assets/icons/LocationMarker";
import IconDomain from "../../../components/IconDomain";
import House from "../../../components/HouseIcon";
import dayjs from "dayjs";
import Calendar from "../../../../../assets/icons/Calendar";

export default function mission({ mission, youngLocation }) {
  const tags = [];
  mission.city && tags.push(mission.city + (mission.zip ? ` - ${mission.zip}` : ""));
  mission.domains.forEach((d) => tags.push(translate(d)));

  return (
    <Link
      to={`/mission/${mission._id}`}
      className="bg-white relative flex w-full justify-between shadow-nina rounded-xl p-4 border-[1px] border-[#ffffff] mb-4 hover:translate-x-1 transition duration-200 ease-in z-10">
      <div className="flex flex-1 basis-[60%]">
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

      <div className="flex flex-1 justify-end items-center basis-[40%]">
        <div className="flex flex-row w-full justify-end items-center flex-wrap">
          <div className="flex flex-row text-sm gap-2 mx-2 text-gray-900 font-bold items-center justify-center">
            <Calendar className=" min-w-[14px] min-h-[20px] text-gray-400" />
            <div className="flex flex-row gap-1 flex-wrap max-w-min xl:max-w-full">
              <div className="whitespace-nowrap">du {dayjs(mission.startAt).format("DD/MM/YYYY")}</div>
              <div className="whitespace-nowrap">au {dayjs(mission.endAt).format("DD/MM/YYYY")}</div>
            </div>
          </div>
          {/* DISTANCE */}
          {youngLocation && mission.location ? (
            <div className="flex flex-none items-center justify-end space-x-2 ml-4">
              <LocationMarker className="text-gray-400" />
              <div className="text-gray-800 text-base font-bold">
                à {getDistance(youngLocation.lat, youngLocation.lon, mission.location.lat, mission.location.lon).toFixed(1)} km
              </div>
              {mission?.hebergement === "true" ? (
                <>
                  {mission.hebergementPayant === "true" ? (
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <House tooltip={"Hébergement payant proposé"} color="#D97706" />
                    </div>
                  ) : (
                    <div className="p-2 bg-green-50 rounded-full">
                      <House tooltip={"Hébergement gratuit proposé"} color="#059669" />
                    </div>
                  )}
                </>
              ) : (
                <div className="p-2 w-[14px]" />
              )}
            </div>
          ) : (
            <div />
          )}
          {/* END DISTANCE */}
        </div>

        <div className="absolute top-2 bg-gray-100 rounded-lg px-3 py-1.5">
          <div className="text-gray-700 text-xs font-medium">&nbsp;{mission?.placesLeft} places disponibles</div>
        </div>

        {/* END STATUT */}
      </div>
    </Link>
  );
}
