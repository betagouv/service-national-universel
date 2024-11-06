import React from "react";
import { Link } from "react-router-dom";
import { translate } from "../../../../utils";
import { translateApplicationForYoungs } from "snu-lib";
import LocationMarker from "../../../../assets/icons/LocationMarker";
import EyeOff from "../../../../assets/icons/EyeOff";
import Eye from "../../../../assets/icons/Eye";
import Check from "../../../../assets/icons/Check";
import SixDotsVertical from "../../../../assets/icons/SixDotsVertical";
import { Draggable } from "react-beautiful-dnd";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { capture } from "../../../../sentry";
import IconDomain from "../../../missions/components/IconDomain";
import styled from "styled-components";

export default function application({ application: propsApplication, index, onChange, loading }) {
  const [application, setApplication] = React.useState(propsApplication);
  const [mission, setMission] = React.useState();
  const [tags, setTags] = React.useState();

  React.useEffect(() => {
    (async () => {
      const { ok, data, code } = await api.get(`/mission/${application.missionId}`);
      if (!ok) {
        capture(new Error(code));
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setMission(data);
      const t = [];
      data?.city && t.push(data?.city + (data?.zip ? ` - ${data?.zip}` : ""));
      (data?.domains || []).forEach((d) => t.push(translate(d)));
      setTags(t);
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
    const { ok, data } = await api.put(`/application/${application._id.toString()}/visibilite`, { hidden: value });
    if (!ok) return toastr.error("Une erreur est survenue lors du masquage de la candidature");
    setApplication((prev) => ({ ...prev, hidden: data.hidden }));
    onChange();
  };

  return (
    <Draggable draggableId={application._id} index={index} isDragDisabled={loading}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          className="relative mb-4  w-full  rounded-xl border-[1px] border-[#ffffff] bg-white p-4 shadow-nina hover:border-gray-200"
          {...provided.draggableProps}>
          <div className="flex justify-between">
            <div className={`absolute top-0 right-0 flex space-x-2 p-4 ${loading ? "cursor-wait" : "cursor-pointer"}`} {...provided.dragHandleProps}>
              <div className="text-xs font-normal tracking-wider text-gray-500">CHOIX Nº{application.priority}</div>
              <SixDotsVertical className="text-gray-400" />
            </div>
            <div className="flex flex-1">
              {/* icon */}
              <Link to={`/mission/${application.missionId}`}>
                <div className="mr-2 flex items-center">
                  <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
                </div>
              </Link>

              {/* infos mission */}
              <div className="flex flex-1 flex-col">
                <div className="space-y-2">
                  <Link to={`/mission/${application.missionId}`}>
                    <div className="ml-2 flex space-x-4">
                      <div className="text-xs font-medium uppercase text-gray-500">{mission?.structureName}</div>
                      <div className="text-xs font-normal text-gray-500">
                        Places disponibles:&nbsp;{mission?.placesLeft}/{mission?.placesTotal}
                      </div>
                    </div>
                    <div className="ml-2 text-base font-bold text-gray-900">{mission?.name}</div>
                  </Link>
                  <Tags className="absolute">
                    {(tags || []).map((e, i) => (
                      <div key={i} className="ml-2 mb-2 flex items-center justify-center rounded-full border-[1px] border-gray-200 px-4 py-1 text-xs text-gray-600">
                        {e}
                      </div>
                    ))}
                    {mission?.isMilitaryPreparation === "true" ? (
                      <div className="ml-2 mb-2 flex items-center justify-center rounded-full border-[1px] border-gray-200 bg-blue-900 px-4 py-1 text-xs text-white">
                        Préparation militaire
                      </div>
                    ) : null}
                  </Tags>
                </div>
              </div>
            </div>

            <div className="flex flex-1 justify-between">
              {/* TODO */}
              {/* DISTANCE */}
              <div className="flex basis-[31%] items-center space-x-2">
                <LocationMarker className="text-gray-400" />
                <div className="text-base font-bold text-gray-800">à 11 km</div>
              </div>
              {/* END DISTANCE */}

              {/* MASQUAGE */}
              <div className="flex basis-[25%] items-center">
                {application.hidden === "true" ? (
                  <div className="group flex items-center">
                    <div className="flex items-center space-x-2 text-gray-400 group-hover:hidden" onClick={handleHide}>
                      <Check />
                      <div className="text-xs font-normal">masquée</div>
                    </div>
                    <div className="hidden cursor-pointer items-center space-x-2 text-gray-400 hover:underline group-hover:flex" onClick={handleHide}>
                      <Eye />
                      <div className="text-xs font-normal">afficher</div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex cursor-pointer items-center space-x-2 text-gray-400 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHide({ value: "true" });
                    }}>
                    <EyeOff />
                    <div className="text-xs font-normal">masquer</div>
                  </div>
                )}
              </div>

              {/* END MASQUAGE */}

              {/* STATUT */}
              <div className="flex basis-[44%] items-center justify-end">
                <div className={`text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} rounded-sm px-2 py-[2px]`}>
                  {translateApplicationForYoungs(application.status)}
                </div>
              </div>
              {/* END STATUT */}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

const Tags = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
`;
