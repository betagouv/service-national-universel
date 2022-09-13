import React from "react";
import { Link } from "react-router-dom";
import { translateApplication, translate } from "../../../../../utils";
import DomainThumb from "../../../../../components/DomainThumb";
import LocationMarker from "../../../../../assets/icons/LocationMarker";
import EyeOff from "../../../../../assets/icons/EyeOff";
import Eye from "../../../../../assets/icons/Eye";
import Check from "../../../../../assets/icons/Check";
import SixDotsVertical from "../../../../../assets/icons/SixDotsVertical";
import { Draggable } from "react-beautiful-dnd";
import api from "../../../../../services/api";
import { toastr } from "react-redux-toastr";
import IconDomain from "../../../components/IconDomain";

export default function mission({ mission, youngLocation }) {
  const tags = [];
  mission.city && tags.push(mission.city + (mission.zip ? ` - ${mission.zip}` : ""));
  mission.domains.forEach((d) => tags.push(translate(d)));

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      let radlat1 = (Math.PI * lat1) / 180;
      let radlat2 = (Math.PI * lat2) / 180;
      let theta = lon1 - lon2;
      let radtheta = (Math.PI * theta) / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;

      return dist;
    }
  };

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
