import React from "react";
import { Link } from "react-router-dom";
import { HiLocationMarker } from "react-icons/hi";
import IconDomain from "@/scenes/missions/components/IconDomain";
import { translateApplication } from "snu-lib";
import { applicationBadgeStyle } from "@/utils";

export default function ApplicationCard({ application }) {
  return (
    <div className="bg-white rounded-xl border p-3 w-72 md:w-96 h-44 flex flex-col justify-between flex-none snap-always snap-center first:ml-4 md:first:ml-0 last:mr-4 md:last:mr-0">
      <p className={`text-xs rounded-full px-2 py-1 w-fit ${applicationBadgeStyle[application.status]}`}>{translateApplication(application.status)}</p>

      <p className="text-xs leading-5 text-gray-400">{application.mission.structureName}</p>

      <Link to={`/mission/${application.missionId}`} className="flex items-center gap-4">
        <IconDomain domain={application.mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : application.mission?.mainDomain} />
        <p className="text-lg leading-tight font-bold line-clamp-2">{application.missionName}</p>
      </Link>

      <div className="flex justify-between items-end">
        <p className="text-xs leading-5 text-gray-400">{application.mission.placesLeft} places disponibles</p>
        <div>
          <HiLocationMarker className="inline-block text-gray-300 mr-1 " />
          <span className="text-xs leading-5 text-gray-400">{application.mission.city}</span>
        </div>
      </div>
    </div>
  );
}
