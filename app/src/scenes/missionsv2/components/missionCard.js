import React from "react";
import { Link } from "react-router-dom";

import DomainThumb from "../../../components/DomainThumb";

export default function MissionCard({ id, domain, tags = [], places, applied, isMilitaryPreparation, structureName, missionName }) {
  return (
    <Link to={`/mission/${id}`} className="bg-white flex justify-between shadow-nina mb-4 rounded-xl p-4 border-[1px] border-[#ffffff] hover:border-gray-200">
      <div className="flex">
        {/* icon */}
        <div className="flex items-center">
          <DomainThumb domain={domain} size="3rem" />
        </div>

        {/* infos mission */}
        <div className="flex flex-col">
          <div className="space-y-2">
            <div className="text-gray-500 text-xs uppercase">{structureName}</div>
            <div className="text-gray-900 font-bold text-base">{missionName}</div>
            <div className="flex space-x-2">
              {tags.map((e, i) => (
                <div key={i} className="flex justify-center items-center text-gray-600 border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">
                  {e}
                </div>
              ))}
              {isMilitaryPreparation === "true" ? (
                <div className="flex justify-center items-center bg-blue-900 text-white border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">Préparation militaire</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <div className="text-xs text-gray-700">
          {applied ? (
            <Link to={`/candidature`}>Voir la candidature</Link>
          ) : (
            <div to={`/mission/${id}`}>
              {places} place{places > 1 && "s"} disponible{places > 1 && "s"}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
