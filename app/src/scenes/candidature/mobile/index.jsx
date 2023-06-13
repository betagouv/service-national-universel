import Img2 from "../../../assets/phase2MobileHeader.png";
import React from "react";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import Loader from "../../../components/Loader";
import api from "../../../services/api";
import CardCandidature from "./components/CardCandidature";
import EyeOff from "../../../assets/icons/EyeOff";
import Eye from "../../../assets/icons/Eye";

export default function IndexPhase2Mobile() {
  const young = useSelector((state) => state.Auth.young);
  const [applications, setApplications] = React.useState();
  const [toggleButtonDisplayHidden, setToggleButtonDisplayHidden] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const getApplications = async () => {
    try {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/application`);
      if (ok) {
        data.sort((a, b) => Number(a.priority) - Number(b.priority));
        return setApplications(data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  React.useEffect(() => {
    getApplications();
  }, []);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = async (result) => {
    setLoading(true);
    if (!result.destination || result.destination.index === result.source.index) return setLoading(false);
    // we change the front first for a better UX
    setApplications((prev) => reorder(prev, result.source.index, result.destination.index).map((application, index) => ({ ...application, priority: index + 1 })));

    //then we change in the back
    const { data } = await api.post(`/application/${result.draggableId}/change-classement/${result.destination.index}`);
    // and we update to make sure everything is ok
    setApplications(data);
    setLoading(false);
  };

  if (!applications) return <Loader />;

  return (
    <div className="bg-white pb-5">
      {/* BEGIN HEADER */}
      <div className="bg-gray-700">
        <div className="px-4 pt-4 pb-3">
          <div className="text-3xl font-bold text-white">Il vous reste {Math.max(0, 84 - Number(young.phase2NumberHoursDone || 0))}h à effectuer</div>
          <div className="mt-2 mb-2 text-sm font-normal text-gray-300">
            <div>L&apos;ordre de vos choix de missions sera pris en compte pour l&apos;attribution de votre MIG.</div>
            <div>Pour modifier l&apos;ordre, attrapez la droite du bloc et déplacez-le.</div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <ToggleVisibility value={toggleButtonDisplayHidden} onClick={() => setToggleButtonDisplayHidden((e) => !e)} />
          </div>
        </div>
        <img className="w-full rounded-t-lg " src={Img2} />
      </div>
      {/* END HEADER */}

      {/* BEGIN CANDIDATURES */}
      <div className="-mt-4 px-3">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {applications
                  .filter((application) => toggleButtonDisplayHidden || application.hidden !== "true")
                  .map((application, i) => (
                    <CardCandidature
                      key={`${application._id.toString()}_${application.priority}`}
                      application={application}
                      index={i}
                      onChange={getApplications}
                      loading={loading}
                    />
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      {/* END CANDIDATURES */}
    </div>
  );
}

const ToggleVisibility = ({ value, onClick }) => {
  return (
    <>
      <div onClick={onClick} className={`flex h-4 w-9 items-center rounded-full ${value ? "bg-blue-600" : "bg-gray-200"} cursor-pointer transition duration-100 ease-in`}>
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border-[1px] border-gray-200 bg-[#ffffff] ${
            value ? "translate-x-[16px]" : "translate-x-0"
          } shadow-nina transition duration-100 ease-in`}>
          {value ? <Eye className="text-gray-400" width={10} height={10} /> : <EyeOff className="text-gray-400" width={10} height={10} />}
        </div>
      </div>
      <div className="text-sm text-gray-300">Afficher les candidatures masquées</div>
    </>
  );
};
