import React from "react";
import { Link, useHistory } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToggle } from "react-use";

import { CohortType, LigneBusDto, translate, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { Button, Modal } from "@snu/ds/admin";

import { Phase1Service } from "@/services/phase1Service";
import { toastr } from "react-redux-toastr";

interface DeleteLigneButtonProps {
  cohort: CohortType | null;
  ligneDeBus: LigneBusDto;
}

export default function DeleteLigneButton({ cohort, ligneDeBus }: DeleteLigneButtonProps) {
  const [showModal, toggleModal] = useToggle(false);
  const history = useHistory();

  const { mutate, isPending } = useMutation({
    mutationFn: () => Phase1Service.deleteLigneBus(cohort!._id!, ligneDeBus._id!),
    onSuccess: () => {
      toastr.success("Ligne de bus supprimée avec succès", "");
      toggleModal();
      history.push(`/ligne-de-bus?cohort=${cohort!.name}`);
    },
    onError: (erreur: any) => {
      toastr.error(`Une erreur est survenue lors de la suppression de la ligne de bus ${translate(erreur.message)}`, translate(erreur.description));
    },
  });

  const { data: youngAffectedCount, isPending: isCountPending } = useQuery({
    queryKey: ["getLigneBusStats", ligneDeBus._id],
    queryFn: async () => (await Phase1Service.getLigneBusStats(ligneDeBus._id!)).youngsCountBus,
    enabled: !!cohort,
  });

  return (
    <>
      <Button title="Supprimer la ligne" type="danger" onClick={toggleModal} />
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={toggleModal}
          className="md:max-w-[800px]"
          content={
            <div className="scroll-y-auto overflow-y-auto max-h-[80vh]">
              <div className="flex flex-col items-center text-center gap-6 mb-8">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50"></div>
                </div>
                <h1 className="font-bold text-xl m-0">Supprimer la ligne de bus {ligneDeBus?.busId}</h1>
                <p className="text-red-600 text-lg">
                  Êtes-vous certain de vouloir supprimer la ligne de bus ? Toute suppression sera définitive. Pensez à exporter le PDT actuel afin de ne pas le perdre.
                </p>
              </div>
              {!!ligneDeBus.mergedBusIds?.length && (
                <div className="text-center mb-8">
                  Cette ligne est <b>fusionnée</b> avec
                  {ligneDeBus.mergedBusDetails
                    ?.filter((mergedBus) => mergedBus.busId !== ligneDeBus.busId)
                    .map((mergedBus) => (
                      <Link key={mergedBus._id} to={`/ligne-de-bus/${mergedBus._id}`} target="_blank" className="text-primary">
                        {" "}
                        {mergedBus.busId}
                      </Link>
                    ))}
                  . Lors de la suppression, le lien entre les lignes sera rompu.
                </div>
              )}
              {!!ligneDeBus.mirrorBusDetails && (
                <div className="text-center mb-8">
                  Cette ligne est <b>en miroir</b> avec la ligne{" "}
                  <Link to={`/ligne-de-bus/${ligneDeBus.mirrorBusDetails._id}`} target="_blank" className="text-primary">
                    {ligneDeBus.mirrorBusDetails.busId}
                  </Link>
                  . Lors de la suppression, le lien entre les lignes sera rompu.
                </div>
              )}
              <div className="flex justify-center items-center gap-8 mb-6">
                <div className="w-fit font-bold">{youngAffectedCount} jeunes déjà affectés</div>
                <div className="flex justify-center items-center gap-2.5">
                  <Link
                    to={`/volontaire?cohort=${encodeURIComponent(cohort!.name)}&statusPhase1=${YOUNG_STATUS_PHASE1.AFFECTED}~${YOUNG_STATUS_PHASE1.DONE}&ligneId=${
                      ligneDeBus._id
                    }&page=1`}
                    target="_blank"
                    className="w-full">
                    <Button className="w-full max-w-none" type="tertiary" title="Voir les volontaires"></Button>
                  </Link>
                </div>
              </div>
              {!!youngAffectedCount && youngAffectedCount > 0 && (
                <p className="text-red-600 text-sm mb-8">
                  La suppression de la ligne de bus va désaffecter les jeunes associés, assurez vous d'exporter les jeunes au préalable afin de pouvoir les réaffecter manuellement
                  si nécessaire.
                </p>
              )}
            </div>
          }
          footer={
            <div className="flex items-center justify-between gap-6">
              <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={toggleModal} />
              <Button disabled={isPending || isCountPending} loading={isPending} title="Supprimer" onClick={() => mutate()} className="flex-1" />
            </div>
          }
        />
      )}
    </>
  );
}
