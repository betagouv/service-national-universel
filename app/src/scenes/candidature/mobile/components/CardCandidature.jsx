import React from "react";
import { Link } from "react-router-dom";
import { translateApplicationForYoungs } from "snu-lib";
import LocationMarker from "../../../../assets/icons/LocationMarker";
import EyeOff from "../../../../assets/icons/EyeOff";
import Eye from "../../../../assets/icons/Eye";
import SixDotsVertical from "../../../../assets/icons/SixDotsVertical";
import { Draggable } from "react-beautiful-dnd";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { capture } from "../../../../sentry";
import IconDomain from "../../../missions/components/IconDomain";

export default function application({ application, index, onChange, loading }) {
  const [mission, setMission] = React.useState();

  React.useEffect(() => {
    (async () => {
      const { ok, data, code } = await api.get(`/mission/${application.missionId}`);
      if (!ok) {
        capture(new Error(code));
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setMission(data);
    })();
  }, [application]);

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

  const handleHide = async ({ value }) => {
    const { ok } = await api.put(`/application/${application._id.toString()}/visibilite`, { hidden: value });
    if (!ok) return toastr.error("Une erreur est survenue lors du masquage de la candidature");
    onChange();
  };

  return (
    <Draggable draggableId={application._id} index={index} isDragDisabled={loading}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          className="relative mb-3 flex w-full flex-col justify-between rounded-xl border-[1px] border-[#ffffff] bg-white p-3 shadow-nina hover:border-gray-200"
          {...provided.draggableProps}>
          <div className={`absolute top-0 right-0 flex space-x-2 p-3 ${loading ? "cursor-wait" : "cursor-pointer"}`} {...provided.dragHandleProps}>
            <div className="text-xs font-normal tracking-wider text-gray-500">CHOIX Nº{application.priority}</div>
            <SixDotsVertical className="text-gray-400" />
          </div>

          {/* STATUT */}
          <div className="flex items-center">
            <div className={`text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} rounded-sm px-2 py-[2px]`}>
              {translateApplicationForYoungs(application.status)}
            </div>
          </div>
          {/* END STATUT */}

          <div className="my-3 flex">
            {/* icon */}
            <div className="flex items-start">
              <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
            </div>

            {/* infos mission */}
            <div className="flex flex-1 flex-col">
              <div className="space-y-1">
                <div className="ml-2 flex space-x-4">
                  <div className="text-xs font-medium uppercase text-gray-500">{mission?.structureName}</div>
                </div>
                <div className="ml-2 text-base font-bold text-gray-900">{mission?.name}</div>
                <div className="ml-2 flex justify-between">
                  <div className="text-xs text-gray-500">{mission?.placesLeft} places disponibles</div>
                  {/* TODO */}
                  <div className="flex items-center space-x-2">
                    <LocationMarker className="text-gray-400" />
                    <div className="text-sm font-bold text-gray-800">à 11 km</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 justify-between divide-x divide-gray-200">
            {application.hidden === "true" ? (
              <div className="flex flex-1 items-center justify-center space-x-2 py-1 text-gray-400" onClick={() => handleHide({ value: "false" })}>
                <Eye />
                <div className="text-xs font-normal">afficher</div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center space-x-2 py-1 text-gray-400" onClick={() => handleHide({ value: "true" })}>
                <EyeOff />
                <div className="text-xs font-normal">masquer</div>
              </div>
            )}
            <div className="flex flex-1 items-center justify-center space-x-2 text-gray-400">
              <Link to={`/mission/${application.missionId}`}>
                <div className="text-xs font-normal">Voir plus&nbsp;›</div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
