import React from "react";
import { useToggle } from "react-use";
import { toastr } from "react-redux-toastr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import cx from "classnames";
import { HiOutlineLightningBolt, HiPlay } from "react-icons/hi";

import { DesistementRoutes, DesistementSimulationTaskDto, TaskStatus, translate } from "snu-lib";
import { Button, Modal } from "@snu/ds/admin";

import { capture } from "@/sentry";
import { isBefore } from "date-fns";
import { DesistementService } from "@/services/desistementService";

interface DesistementStartButtonProps {
  simulation: unknown;
}

export default function DesistementStartButton({ simulation }: DesistementStartButtonProps) {
  const simulationDesistement = simulation as DesistementSimulationTaskDto;
  const queryClient = useQueryClient();

  const [showModal, toggleModal] = useToggle(false);

  const desistementKey = ["desistement", simulationDesistement.metadata!.parameters!.sessionId]; // check BasculeJeuneValidesModal.tsx queryKey
  const {
    isPending: isLoading,
    isError,
    data: desistementStatus,
  } = useQuery<DesistementRoutes["GetDesistement"]["response"]>({
    queryKey: desistementKey,
    queryFn: async () => DesistementService.getDesistement(simulationDesistement.metadata!.parameters!.sessionId),
  });

  const isOutdated =
    [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(desistementStatus?.traitement.status as TaskStatus) ||
    (!!desistementStatus?.traitement?.lastCompletedAt && isBefore(new Date(simulationDesistement.createdAt), new Date(desistementStatus.traitement.lastCompletedAt)));

  const isDisabled = simulationDesistement.status !== TaskStatus.COMPLETED || isLoading || isError || isOutdated;

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      return await DesistementService.postValiderDesistement({ sessionId: simulationDesistement.metadata!.parameters!.sessionId!, taskId: simulationDesistement.id });
    },
    onSuccess: () => {
      toastr.success("Le traitement a bien été ajouté", "", { timeOut: 5000 });
      queryClient.invalidateQueries({ queryKey: desistementKey });
      toggleModal(false);
    },
    onError: (error: any) => {
      capture(error);
      toastr.error("Une erreur est survenue lors de l'ajout du traitement", translate(JSON.parse(error.message).message), { timeOut: 5000 });
    },
  });

  return (
    <>
      <button onClick={toggleModal}>
        <HiPlay className={cx({ "text-gray-400": isDisabled, "text-blue-600": !isDisabled })} size={50} />
      </button>
      <Modal
        isOpen={showModal}
        noBodyScroll
        onClose={toggleModal}
        className="md:max-w-[800px]"
        content={
          <div className="scroll-y-auto overflow-y-auto max-h-[80vh]">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
                  <HiOutlineLightningBolt className="w-6 h-6" />
                </div>
              </div>
              <h1 className="font-bold text-xl m-0">Désistement des volontaires n'ayant pas confirmé leur présence</h1>
              <p className="text-lg">Vérifier les paramètres avant de lancer ce traitement.</p>
            </div>
            <div className="flex items-start flex-col w-full gap-8">
              <div className="flex flex-col w-full gap-1.5">
                <h2 className="text-lg leading-7 font-bold m-0">Suivi</h2>
                <div>Désistements préalables : {simulationDesistement.metadata?.results?.jeunesDesistes ?? "--"}</div>
                <div>Changements de séjour : {simulationDesistement.metadata?.results?.jeunesAutreSession ?? "--"}</div>
                <div>Confirmations de la participation : {simulationDesistement.metadata?.results?.jeunesConfirmes ?? "--"}</div>
                <div>Désistés par ce traitement : {simulationDesistement.metadata?.results?.jeunesNonConfirmes ?? "--"}</div>
              </div>
              <div className="flex flex-col w-full gap-2.5">
                <h2 className="text-lg leading-7 font-bold m-0">Affectation sélectionnée</h2>
              </div>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={() => toggleModal(false)} />
            <Button disabled={isPending || isDisabled} loading={isPending} onClick={() => mutate()} title="Lancer le traitement" className="flex-1" />
          </div>
        }
      />
    </>
  );
}
