import React from "react";
import { Link } from "react-router-dom";
import { translateApplication, translate } from "../../../../utils";
import { translateApplicationForYoungs } from "snu-lib/translation";
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
        capture(code);
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
          className="bg-white relative  w-full  shadow-nina rounded-xl p-4 border-[1px] border-[#ffffff] hover:border-gray-200 mb-4"
          {...provided.draggableProps}>
          <div className="flex justify-between">
            <div className={`absolute top-0 right-0 flex space-x-2 p-4 ${loading ? "cursor-wait" : "cursor-pointer"}`} {...provided.dragHandleProps}>
              <div className="text-gray-500 text-xs font-normal tracking-wider">CHOIX Nº{application.priority}</div>
              <SixDotsVertical className="text-gray-400" />
            </div>
            <div className="flex flex-1">
              {/* icon */}
              <div className="flex items-center">
                <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
              </div>

              {/* infos mission */}
              <div className="flex flex-col flex-1">
                <div className="space-y-2">
                  <div className="flex space-x-4 ml-2">
                    <div className="text-gray-500 text-xs uppercase font-medium">{mission?.structureName}</div>
                    <div className="text-gray-500 text-xs font-normal">
                      Places disponibles:&nbsp;{mission?.placesLeft}/{mission?.placesTotal}
                    </div>
                  </div>
                  <Link to={`/mission/${application.missionId}`}>
                    <div className="text-gray-900 font-bold text-base hover:underline ml-2">{mission?.name}</div>
                  </Link>
                  <Tags>
                    {(tags || []).map((e, i) => (
                      <div key={i} className="flex justify-center items-center text-gray-600 border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs ml-2 mb-2">
                        {e}
                      </div>
                    ))}
                    {mission?.isMilitaryPreparation === "true" ? (
                      <div className="flex justify-center items-center bg-blue-900 text-white border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs ml-2 mb-2">
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
                <div className="text-gray-800 text-base font-bold">à 11 km</div>
              </div>
              {/* END DISTANCE */}

              {/* MASQUAGE */}
              <div className="flex basis-[25%] items-center">
                {application.hidden === "true" ? (
                  <div className="group flex items-center">
                    <div className="flex group-hover:hidden items-center space-x-2 text-gray-400" onClick={handleHide}>
                      <Check />
                      <div className="text-xs font-normal">masquée</div>
                    </div>
                    <div className="hidden group-hover:flex items-center space-x-2 text-gray-400 cursor-pointer hover:underline" onClick={handleHide}>
                      <Eye />
                      <div className="text-xs font-normal">afficher</div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-center space-x-2 text-gray-400 cursor-pointer hover:underline"
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
                <div className={`text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} px-2 py-[2px] rounded-sm`}>
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
