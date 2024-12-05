import React from "react";
import { useHistory } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToggle } from "react-use";
import { HiOutlineInformationCircle, HiOutlineRefresh } from "react-icons/hi";

import { CohortDto, Phase1Routes, TaskName, TaskStatus } from "snu-lib";
import { Button, Tooltip } from "@snu/ds/admin";

import { Phase1Service } from "@/services/phase1Service";
import AffectationSimulationMetropoleModal from "./AffectationSimulationMetropoleModal";

interface AffectationSimulationMetropoleProps {
  session: CohortDto;
}

export default function AffectationSimulationMetropole({ session }: AffectationSimulationMetropoleProps) {
  const history = useHistory();

  const [showModal, toggleModal] = useToggle(false);

  const {
    isPending: isLoading,
    error,
    data: simulationsPending,
  } = useQuery<Phase1Routes["GetSimulationsRoute"]["response"]>({
    queryKey: ["affectation-simulations-pending"],
    queryFn: async () => Phase1Service.getSimulations(session._id!, { status: TaskStatus.PENDING, name: TaskName.AFFECTATION_HTS_SIMULATION }),
    // refetchInterval: 5000,
  });

  const isInProgress = !!simulationsPending?.length;

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex gap-2">
        <div className="text-sm leading-5 font-bold">Affectation HTS (Hors DOM TOM)</div>
        <Tooltip id="affectation-hts-metropole" title="Affectation HTS (Hors DOM TOM)">
          <HiOutlineInformationCircle className="text-gray-400" size={20} />
        </Tooltip>
        {isInProgress && <div className="text-xs leading-4 font-normal text-orange-500 italic">Simulation en cours...</div>}
      </div>
      <div className="flex gap-2">
        <Button title="Voir les simulations" type="wired" onClick={() => history.push(`?tab=simulations&cohort=${session.name}&action=${TaskName.AFFECTATION_HTS_SIMULATION}`)} />
        <Button title="Lancer une simulation" onClick={toggleModal} loading={isInProgress || isLoading} disabled={isLoading || isInProgress || !!error} />
      </div>
      {showModal && <AffectationSimulationMetropoleModal session={session} onClose={toggleModal} />}
    </div>
  );
}
