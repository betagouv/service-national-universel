import React from "react";
import { useHistory } from "react-router-dom";
import { useToggle } from "react-use";
import { HiOutlineInformationCircle } from "react-icons/hi";

import { CohortDto, InscriptionRoutes, TaskName, TaskStatus } from "snu-lib";
import { Button, Tooltip } from "@snu/ds/admin";

import BasculeJeuneValidesModal from "./BasculeJeuneValidesModal";
import { InscriptionService } from "@/services/inscriptionService";
import { useQuery } from "@tanstack/react-query";

interface BasculeJeuneValidesProps {
  session: CohortDto;
}

export default function BasculeJeuneValides({ session }: BasculeJeuneValidesProps) {
  const history = useHistory();

  const [showModal, toggleModal] = useToggle(false);

  const {
    isPending: isLoading,
    isError,
    data: inscriptionStatus,
  } = useQuery<InscriptionRoutes["GetBasculeJeunesValides"]["response"]>({
    queryKey: ["inscription", "bascule-jeunes-valides", session._id], // check SimulationHtsResultStartButton.tsx and AffectationSimulationMetropoleModal.tsx queryKey
    queryFn: async () => InscriptionService.getBasculeJeunesValides(session._id!),
  });

  const isValidSession = session.type === "VOLONTAIRE"; // HTS
  const isInProgress = inscriptionStatus && [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(inscriptionStatus?.simulation?.status as TaskStatus);

  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex gap-2">
        <div className="text-sm leading-5 font-bold">Bascule des jeunes validés</div>
        <Tooltip
          title={`• Basculer les jeunes validés sur LC et/ou LP vers le prochain séjour sur lequel
  ils sont éligibles ou vers la cohorte à venir.\r
• Possibilité d'envoyer une communication aux jeunes et à leurs RL.\r
• Une fois basculés, les jeunes passent au statut "En attente de validation" et
  les informations liées à leur phase 1 sont réinitialisées.`}>
          <HiOutlineInformationCircle className="text-gray-400" size={20} />
        </Tooltip>
        {isInProgress && <div className="text-xs leading-4 font-normal text-orange-500 italic">Simulation en cours...</div>}
      </div>
      <div className="flex gap-2">
        <Button
          title="Voir les simulations"
          type="wired"
          onClick={() => history.push(`?tab=simulations&cohort=${session.name}&action=${TaskName.BACULE_JEUNES_VALIDES_SIMULATION}`)}
        />
        <Button title="Lancer une simulation" onClick={toggleModal} loading={isInProgress || isLoading} disabled={!isValidSession || isLoading || isInProgress || isError} />
      </div>
      {showModal && <BasculeJeuneValidesModal session={session} onClose={toggleModal} />}
    </div>
  );
}
