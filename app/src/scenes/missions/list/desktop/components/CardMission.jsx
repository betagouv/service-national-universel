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
      className="relative z-10 mb-4 flex w-full justify-between rounded-xl border-[1px] border-[#ffffff] bg-white p-4 shadow-nina transition duration-200 ease-in hover:translate-x-1">
      <div className="flex flex-1 basis-[60%]">
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
            <div className="flex flex-wrap gap-2">
              {tags.map((e, i) => (
                <div key={i} className="flex items-center justify-center rounded-full border-[1px] border-gray-200 px-4 py-1 text-xs text-gray-600">
                  {e}
                </div>
              ))}
              {mission?.isMilitaryPreparation === "true" ? (
                <div className="flex items-center justify-center rounded-full border-[1px] border-gray-200 bg-blue-900 px-4 py-1 text-xs text-white">Préparation militaire</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 basis-[40%] items-center justify-end">
        <div className="flex w-full flex-row flex-wrap items-center justify-end">
          <div className="mx-2 flex flex-row items-center justify-center gap-2 text-sm font-bold text-gray-900">
            <Calendar className=" min-h-[20px] min-w-[14px] text-gray-400" />
            <div className="flex max-w-min flex-row flex-wrap gap-1 xl:max-w-full">
              <div className="whitespace-nowrap">du {dayjs(mission.startAt).format("DD/MM/YYYY")}</div>
              <div className="whitespace-nowrap">au {dayjs(mission.endAt).format("DD/MM/YYYY")}</div>
            </div>
          </div>
          {/* DISTANCE */}
          {youngLocation && mission.location ? (
            <div className="ml-4 flex flex-none items-center justify-end space-x-2">
              <LocationMarker className="text-gray-400" />
              <div className="text-base font-bold text-gray-800">
                à {getDistance(youngLocation.lat, youngLocation.lon, mission.location.lat, mission.location.lon).toFixed(1)} km
              </div>
              {mission?.hebergement === "true" ? (
                <>
                  {mission.hebergementPayant === "true" ? (
                    <div className="rounded-full bg-yellow-100 p-2">
                      <House tooltip={"Hébergement payant proposé"} color="#D97706" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-green-50 p-2">
                      <House tooltip={"Hébergement gratuit proposé"} color="#059669" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-[14px] p-2" />
              )}
            </div>
          ) : (
            <div />
          )}
          {/* END DISTANCE */}
        </div>

        <div className="absolute top-2 rounded-lg bg-gray-100 px-3 py-1.5">
          <div className="text-xs font-medium text-gray-700">&nbsp;{mission?.placesLeft} places disponibles</div>
        </div>

        {/* END STATUT */}
      </div>
    </Link>
  );
}
