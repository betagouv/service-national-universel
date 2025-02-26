import React from "react";
import { useHistory } from "react-router-dom";
import { useToggle } from "react-use";
import { HiOutlineInformationCircle } from "react-icons/hi";

import { CohortDto, InscriptionRoutes, TaskName, TaskStatus } from "snu-lib";
import { Button, Tooltip } from "@snu/ds/admin";

import BasculeJeuneNonValidesModal from "./BasculeJeuneNonValidesModal";
import { InscriptionService } from "@/services/inscriptionService";
import { useQuery } from "@tanstack/react-query";

interface BasculeJeuneNonValidesProps {
  session: CohortDto;
}

export default function BasculeJeuneNonValides({ session }: BasculeJeuneNonValidesProps) {
  const history = useHistory();

  const [showModal, toggleModal] = useToggle(false);

  const {
    isPending: isLoading,
    isError,
    data: inscriptionStatus,
  } = useQuery<InscriptionRoutes["GetBasculeJeunesValides"]["response"]>({
    queryKey: ["inscription", "bascule-jeunes-non-valides", session._id], // check SimulationHtsResultStartButton.tsx and AffectationSimulationMetropoleModal.tsx queryKey
    queryFn: async () => InscriptionService.getBasculeJeunesNonValides(session._id!),
  });

  const isInProgress = inscriptionStatus && [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(inscriptionStatus?.simulation?.status as TaskStatus);

  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex gap-2">
        <div className="text-sm leading-5 font-bold">Bascule des jeunes non validés</div>
        <Tooltip
          id="basule-jeunes-non-valides"
          title={
            <ul>
              <li>
                basculer les jeunes “en cours”, “en attente de validation”, “réinscription”, “en attente de correction” vers le prochain séjour sur lequel ils sont éligibles ou
                vers la cohorte à venir
              </li>
              <li>possibilité d’envoyer une communication aux jeunes et à leurs RL</li>
              <li>une fois basculés, les jeunes gardent leur statut actuel</li>
            </ul>
          }>
          <HiOutlineInformationCircle className="text-gray-400" size={20} />
        </Tooltip>
        {isInProgress && <div className="text-xs leading-4 font-normal text-orange-500 italic">Simulation en cours...</div>}
      </div>
      <div className="flex gap-2">
        <Button
          title="Voir les simulations"
          type="wired"
          onClick={() => history.push(`?tab=simulations&cohort=${session.name}&action=${TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION}`)}
        />
        <Button title="Lancer une simulation" onClick={toggleModal} loading={isInProgress || isLoading} disabled={isLoading || isInProgress || isError} />
      </div>
      {showModal && <BasculeJeuneNonValidesModal session={session} onClose={toggleModal} />}
    </div>
  );
}
