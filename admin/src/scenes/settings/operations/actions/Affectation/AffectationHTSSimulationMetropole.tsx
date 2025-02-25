import React from "react";
import { useHistory } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToggle } from "react-use";
import { HiOutlineInformationCircle } from "react-icons/hi";

import { AffectationRoutes, CohortDto, TaskName, TaskStatus } from "snu-lib";
import { Button, Tooltip } from "@snu/ds/admin";

import AffectationHTSSimulationMetropoleModal from "./AffectationHTSSimulationMetropoleModal";
import { AffectationService } from "@/services/affectationService";

interface AffectationHTSSimulationMetropoleProps {
  session: CohortDto;
}

export default function AffectationHTSSimulationMetropole({ session }: AffectationHTSSimulationMetropoleProps) {
  const history = useHistory();

  const [showModal, toggleModal] = useToggle(false);

  const {
    isPending: isLoading,
    isError,
    data: affectationStatus,
  } = useQuery<AffectationRoutes["GetAffectation"]["response"]>({
    queryKey: ["affectation", "hts", session._id], // check SimulationHtsResultStartButton.tsx and AffectationHTSSimulationMetropoleModal.tsx queryKey
    queryFn: async () => AffectationService.getAffectation(session._id!, "HTS"),
  });

  const isValidSession = session.type === "VOLONTAIRE"; // HTS
  const isInProgress = affectationStatus && [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(affectationStatus?.simulation?.status as TaskStatus);

  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex gap-2">
        <div className="text-sm leading-5 font-bold">Affectation HTS (Metropole, hors Corse)</div>
        <Tooltip id="affectation-hts-metropole" title="Permet d’effectuer les simulations et les affectations des jeunes HTS pour les cohortes de métropole (hors Corse)">
          <HiOutlineInformationCircle className="text-gray-400" size={20} />
        </Tooltip>
        {isInProgress && <div className="text-xs leading-4 font-normal text-orange-500 italic">Simulation en cours...</div>}
      </div>
      <div className="flex gap-2">
        <Button title="Voir les simulations" type="wired" onClick={() => history.push(`?tab=simulations&cohort=${session.name}&action=${TaskName.AFFECTATION_HTS_SIMULATION}`)} />
        <Button title="Lancer une simulation" onClick={toggleModal} loading={isInProgress || isLoading} disabled={!isValidSession || isLoading || isInProgress || isError} />
      </div>
      {showModal && <AffectationHTSSimulationMetropoleModal session={session} onClose={toggleModal} />}
    </div>
  );
}
