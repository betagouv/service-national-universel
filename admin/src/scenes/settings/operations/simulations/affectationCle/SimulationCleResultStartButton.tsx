import React, { useMemo } from "react";
import { useToggle } from "react-use";
import { toastr } from "react-redux-toastr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import cx from "classnames";
import { HiOutlineLightningBolt, HiPlay } from "react-icons/hi";

import { AffectationRoutes, formatDepartement, region2department, RegionsMetropole, SimulationAffectationCLETaskDto, TaskStatus, translate } from "snu-lib";
import { Button, Modal } from "@snu/ds/admin";

import { capture } from "@/sentry";
import { AffectationService } from "@/services/affectationService";
import { isBefore } from "date-fns";

interface SimulationCleResultStartButtonProps {
  simulation: unknown;
}

export default function SimulationCleResultStartButton({ simulation }: SimulationCleResultStartButtonProps) {
  const simulationCle = simulation as SimulationAffectationCLETaskDto;
  const queryClient = useQueryClient();

  const [showModal, toggleModal] = useToggle(false);

  const regions = useMemo(
    () =>
      RegionsMetropole.reduce((acc, region) => {
        acc[region] = simulationCle.metadata?.parameters?.departements?.filter((dep) => region2department[region].includes(dep)) || [];
        return acc;
      }, {}),
    [simulationCle],
  );

  const affectationKey = ["affectation", "cle", simulationCle.metadata!.parameters!.sessionId]; // check AffectationCLESimulationMetropoleModal.tsx queryKey
  const {
    isPending: isLoading,
    isError,
    data: affectationStatus,
  } = useQuery<AffectationRoutes["GetAffectation"]["response"]>({
    queryKey: affectationKey,
    queryFn: async () => AffectationService.getAffectation(simulationCle.metadata!.parameters!.sessionId, "CLE"),
  });

  const isOutdated =
    [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(affectationStatus?.traitement?.status as TaskStatus) ||
    (!!affectationStatus?.traitement?.lastCompletedAt && isBefore(new Date(simulationCle.createdAt), new Date(affectationStatus.traitement.lastCompletedAt)));

  const isDisabled = simulationCle.status !== TaskStatus.COMPLETED || isLoading || isError || isOutdated;

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      return await AffectationService.postValiderAffectationCleMetropole(simulationCle.metadata!.parameters!.sessionId!, simulationCle.id);
    },
    onSuccess: () => {
      toastr.success("Le traitement a bien été ajouté", "", { timeOut: 5000 });
      queryClient.invalidateQueries({ queryKey: affectationKey });
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
              <h1 className="font-bold text-xl m-0">Affectation CLE (Metropole, hors Corse)</h1>
              <p className="text-lg">Vérifier les paramètres avant de lancer ce traitement.</p>
            </div>
            <div className="flex items-start flex-col w-full gap-8">
              <div className="flex flex-col w-full gap-2.5">
                <h2 className="text-lg leading-7 font-bold m-0">Suivi</h2>
                <div>Classes : {simulationCle.metadata?.results?.classes ?? "--"}</div>
                <div>Erreurs : {simulationCle.metadata?.results?.erreurs ?? "--"}</div>
                <div>Affectés : {simulationCle.metadata?.results?.jeunesAffected ?? "--"}</div>
              </div>
              <div className="flex flex-col w-full gap-2.5">
                <h2 className="text-lg leading-7 font-bold m-0">Découpage territorial</h2>
                <div className="flex flex-col w-full gap-4">
                  {RegionsMetropole.map((region) => (
                    <div key={region} className="flex gap-2">
                      <div className="text-gray-400 min-w-[200px]">{region}&nbsp;:</div>
                      <div className="text-sm leading-5 font-normal">{regions[region].map(formatDepartement).join(", ") || "Aucun"}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="text-gray-400">Etranger&nbsp;:</div>
                  <div className="text-sm leading-5 font-normal">{simulationCle.metadata?.parameters?.etranger ? "Oui" : "Non"}</div>
                </div>
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
