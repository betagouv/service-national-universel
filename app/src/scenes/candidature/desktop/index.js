import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import api from "../../../services/api";
import CardCandidature from "./components/CardCandidature";
import Loader from "../../../components/Loader";

export default function IndexDesktop() {
  const young = useSelector((state) => state.Auth.young);
  const [applications, setApplications] = React.useState();

  React.useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/application`);
      if (ok) {
        data.sort((a, b) => Number(a.priority) - Number(b.priority));
        return setApplications(data);
      }
    })();
  }, []);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const res = reorder(applications, result.source.index, result.destination.index);
    setApplications(res.map((application, index) => ({ ...application, priority: index + 1 })));
    updatePriority(res);
  };

  const updatePriority = async (value) => {
    for (let i = 0; i < value.length; i++) {
      //todo put /id
      await api.put("/application", { ...value[i], priority: i + 1 });
    }
  };

  if (!applications) return <Loader />;

  return (
    <div className="bg-white mx-4 pb-12 my-3 rounded-lg w-full">
      {/* BEGIN HEADER */}
      <div className="bg-gray-700 rounded-t-lg flex">
        <div className="p-14 flex-1">
          <div className="text-white font-bold text-3xl">Il vous reste {Math.max(0, 84 - Number(young.phase2NumberHoursDone))}h à effectuer</div>
          <div className="text-gray-300 text-sm mt-2 mb-4">
            <div>L&apos;ordre de vos choix de missions sera pris en compte pour l&apos;attribution de votre MIG.</div>
            <div>Pour modifier l&apos;ordre, attrapez la droite du bloc et déplacez-le.</div>
          </div>
        </div>
        <img className="rounded-t-lg" src={require("../../../assets/phase2Header.png")} />
      </div>
      {/* END HEADER */}

      {/* BEGIN CANDIDATURES */}
      <div className="px-14 -mt-4 ">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {(applications || []).map((application, i) => (
                  <CardCandidature key={application._id.toString()} application={application} index={i} />
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
