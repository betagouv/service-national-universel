import React from "react";
import { Link } from "react-router-dom";
import { translateApplication, translate } from "../../../../utils";
import DomainThumb from "../../../../components/DomainThumb";
import LocationMarker from "../../../../assets/icons/LocationMarker";
import EyeOff from "../../../../assets/icons/EyeOff";
import SixDotsVertical from "../../../../assets/icons/SixDotsVertical";
import { Draggable } from "react-beautiful-dnd";

export default function application({ application, index }) {
  const theme = {
    background: {
      WAITING_VALIDATION: "bg-sky-100",
      WAITING_VERIFICATION: "bg-sky-100",
      WAITING_ACCEPTATION: "bg-orange-500",
      VALIDATED: "bg-[#71C784]",
      DONE: "bg-[#5694CD]",
      REFUSED: "bg-[#0B508F]",
      CANCEL: "bg-[#F4F4F4]",
      IN_PROGRESS: "bg-indigo-600",
      ABANDON: "bg-gray-50",
    },
    text: {
      WAITING_VALIDATION: "text-sky-600",
      WAITING_VERIFICATION: "text-sky-600",
      WAITING_ACCEPTATION: "text-white",
      VALIDATED: "text-white",
      DONE: "text-white",
      REFUSED: "text-white",
      CANCEL: "text-[#6B6B6B]",
      IN_PROGRESS: "text-white",
      ABANDON: "text-gray-400",
    },
  };

  const tags = [];
  application.mission.city && tags.push(application.mission.city + (application.mission.zip ? ` - ${application.mission.zip}` : ""));
  application.mission.domains.forEach((d) => tags.push(translate(d)));

  return (
    <Draggable draggableId={application._id} index={index}>
      {(provided) => (
        <Link
          ref={provided.innerRef}
          to={`/mission/${application.missionId}`}
          className="bg-white relative flex w-full justify-between shadow-nina rounded-xl p-4 border-[1px] border-[#ffffff] hover:border-gray-200 mb-4"
          {...provided.draggableProps}>
          <div className="absolute top-0 right-0 flex space-x-2 p-4" {...provided.dragHandleProps}>
            <div className="text-gray-500 text-xs font-normal tracking-wider">CHOIX Nº{application.priority}</div>
            <SixDotsVertical className="text-gray-400" />
          </div>
          <div className="flex flex-[2_2_0%]">
            {/* icon */}
            <div className="flex items-center">
              <DomainThumb domain={application.mission?.domain} size="3rem" />
            </div>

            {/* infos mission */}
            <div className="flex flex-col flex-1">
              <div className="space-y-2">
                <div className="flex space-x-4">
                  <div className="text-gray-500 text-xs uppercase font-medium">{application.mission?.structureName}</div>
                  <div className="text-gray-500 text-xs font-normal">
                    Places disponibles:&nbsp;{application.mission?.placesLeft}/{application.mission?.placesTotal}
                  </div>
                </div>
                <div className="text-gray-900 font-bold text-base">{application.mission?.name}</div>
                <div className="flex space-x-2">
                  {tags.map((e, i) => (
                    <div key={i} className="flex justify-center items-center text-gray-600 border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">
                      {e}
                    </div>
                  ))}
                  {application.mission?.isMilitaryPreparation === "true" ? (
                    <div className="flex justify-center items-center bg-blue-900 text-white border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">Préparation militaire</div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 justify-between">
            {/* TODO */}
            {/* DISTANCE */}
            <div className="flex items-center space-x-2">
              <LocationMarker className="text-gray-400" />
              <div className="text-gray-800 text-base font-bold">à 11 km</div>
            </div>
            {/* END DISTANCE */}

            {/* MASQUAGE */}
            <div className="flex items-center space-x-2 text-gray-400">
              <EyeOff />
              <div className="text-xs font-normal">masquer</div>
            </div>
            {/* END MASQUAGE */}

            {/* STATUT */}
            <div className="flex items-center">
              <div className={`text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} px-2 py-[2px] rounded-sm`}>
                {translateApplication(application.status)}
              </div>
            </div>
            {/* END STATUT */}
          </div>
        </Link>
      )}
    </Draggable>
  );
}
