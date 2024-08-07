import React from "react";
import { Link } from "react-router-dom";
import { HiLocationMarker } from "react-icons/hi";
import IconDomain from "@/scenes/missions/components/IconDomain";
import ApplicationStatusBadge from "./ApplicationStatusBadge";

export default function ApplicationCard({ application }) {
  return (
    <div className="bg-white rounded-xl border w-full shadow-sm">
      <Link to={`/mission/${application.missionId}`}>
        <div className="h-48 p-3 flex flex-col justify-between">
          <ApplicationStatusBadge status={application.status} />

          <p className="text-xs leading-5 text-gray-500 line-clamp-1">{application.mission.structureName}</p>

          <div className="flex items-center gap-4">
            <IconDomain domain={application.mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : application.mission?.mainDomain} />
            <p className="text-lg leading-tight font-bold line-clamp-2 text-gray-800">{application.missionName}</p>
          </div>

          <div className="flex justify-between items-end">
            <p className="text-xs leading-5 text-gray-500 line-clamp-1">
              {application.mission.placesLeft} place{application.mission.placesLeft > 1 ? "s" : ""} disponible{application.mission.placesLeft > 1 ? "s" : ""}
            </p>
            <p className="text-xs leading-5 text-gray-500 line-clamp-1">
              <HiLocationMarker className="inline-block text-gray-300 mr-1 text-base align-text-top" />
              {application.mission.city}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
