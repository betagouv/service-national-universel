import React from "react";
import { useToggle } from "react-use";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { useHistory } from "react-router-dom";

import { COHORT_TYPE, CohortDto, DesistementRoutes, TaskName, TaskStatus } from "snu-lib";
import { Button, Tooltip } from "@snu/ds/admin";

import SimulationDesistementModal from "./SimulationDesistementModal";
import { useQuery } from "@tanstack/react-query";
import { DesistementService } from "@/services/desistementService";

export default function SimulationDesistement({ session }: { session: CohortDto }) {
  const history = useHistory();

  const [showModal, toggleModal] = useToggle(false);

  const {
    isPending: isLoading,
    isError,
    data: desistementStatus,
  } = useQuery<DesistementRoutes["GetDesistement"]["response"]>({
    queryKey: ["desistement", session._id], // check SimulationDesistementResultStartButton.tsx and SimulationDesistementButton.tsx queryKey
    queryFn: async () => DesistementService.getDesistement(session._id!),
    refetchInterval: (data) => {
      if ([TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(data.state.data?.simulation?.status as TaskStatus)) {
        return 1000;
      }
      return false;
    },
  });
  const isValidSession = session.type === COHORT_TYPE.VOLONTAIRE; // HTS
  const isInProgress = desistementStatus && [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(desistementStatus?.simulation?.status as TaskStatus);

  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex gap-2">
        <div className="text-sm leading-5 font-bold">Désistement des volontaires n'ayant pas confirmé leur présence</div>
        <Tooltip id="desistement-metropole" title="Désistement (Metropole, hors Corse)">
          <HiOutlineInformationCircle className="text-gray-400" size={20} />
        </Tooltip>
        {isInProgress && <div className="text-xs leading-4 font-normal text-orange-500 italic">Simulation en cours...</div>}
      </div>
      <div className="flex gap-2">
        <Button
          title="Voir les simulations"
          type="wired"
          onClick={() => history.push(`?tab=simulations&cohort=${session.name}&action=${TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION}`)}
        />
        <Button title="Lancer une simulation" onClick={toggleModal} loading={isInProgress || isLoading} disabled={!isValidSession || isLoading || isInProgress || isError} />
      </div>
      {showModal && <SimulationDesistementModal session={session} onClose={toggleModal} />}
    </div>
  );
}
