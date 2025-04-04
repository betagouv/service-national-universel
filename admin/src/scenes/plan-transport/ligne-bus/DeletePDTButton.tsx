import React, { useState } from "react";
import cx from "classnames";
import { useToggle } from "react-use";
import { toastr } from "react-redux-toastr";
import { useMutation, useQuery } from "@tanstack/react-query";

import { CohortDto, HttpError, translate, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { Button, Modal } from "@snu/ds/admin";

import { getYoungCountByCohort } from "@/services/young.service";
import { Link } from "react-router-dom";
import { Input } from "@snu/ds";
import { Phase1Service } from "@/services/phase1Service";

interface DeletePDTButtonProps {
  cohort: CohortDto;
  disabled: boolean;
  onChange: () => void;
  className?: string;
}

export default function DeletePDTButton({ cohort, disabled, onChange, className }: DeletePDTButtonProps) {
  const [showModal, toggleModal] = useToggle(false);
  const [confirmValue, setConfirmValue] = useState("");

  const { isPending, mutate } = useMutation({
    mutationFn: async () => Phase1Service.deletePlanDeTransport(cohort._id!),
    onSuccess: () => {
      toastr.success("Le plan de transport a bien été supprimé", "", { timeOut: 5000 });
      onChange();
      toggleModal();
    },
    onError: (error: HttpError) => {
      console.log(error);
      toastr.error("Une erreur est survenue. Nous n'avons pu supprimer le PDT.", `${translate(error.message)}${error.description ? `: ${error.description}` : ""}`);
    },
  });

  const { data: youngAffectedCount, isPending: isCountPending } = useQuery({
    queryKey: ["getYoungCountByCohort", cohort._id],
    queryFn: async () =>
      getYoungCountByCohort(cohort.name, {
        status: [YOUNG_STATUS.VALIDATED],
        statusPhase1: [YOUNG_STATUS_PHASE1.AFFECTED],
      }),
  });

  const handleClose = () => {
    toggleModal(false);
  };

  const confirmText = `SUPPRIMER ${cohort.name.replaceAll("  ", " ")}`;

  return (
    <>
      <Button title="Supprimer le PDT" disabled={disabled} onClick={toggleModal} className={cx(className)} />
      <Modal
        isOpen={showModal}
        onClose={handleClose}
        className="md:max-w-[800px]"
        content={
          <div className="scroll-y-auto overflow-y-auto max-h-[80vh]">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50"></div>
              </div>
              <h1 className="font-bold text-xl m-0">Supprimer le plan de transport {cohort.name}</h1>
              <p className="text-red-600 text-lg">
                Êtes-vous certain de vouloir supprimer le PDT ? Toute suppression sera définitive. Pensez à exporter le PDT actuel afin de ne pas le perdre
              </p>
            </div>
            <div className="flex justify-center items-center gap-8 mb-6">
              <div className="w-fit font-bold">{youngAffectedCount} jeunes déjà affectés</div>
              <div className="flex justify-center items-center gap-2.5">
                <Link to={`/volontaire?cohort=${encodeURIComponent(cohort.name)}&statusPhase1=${YOUNG_STATUS_PHASE1.AFFECTED}&page=1`} target="_blank" className="w-full">
                  <Button className="w-full max-w-none" type="tertiary" title="Voir les volontaires"></Button>
                </Link>
              </div>
            </div>
            {youngAffectedCount > 0 && (
              <p className="text-red-600 text-sm mb-8">
                La suppression du PDT va désaffecter les jeunes associés, assurez vous d'exporter les jeunes au préalable afin de pouvoir les réaffecter manuellement si nécessaire.
              </p>
            )}
            <p className="text-sm mb-2">
              Veuillez indiquer "<i>{confirmText}</i>" dans le champ ci-desous pour confirmer
            </p>
            <Input type="text" value={confirmValue} onChange={setConfirmValue} />
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={handleClose} />
            <Button disabled={isPending || isCountPending || confirmText !== confirmValue} loading={isPending} title="Supprimer" onClick={() => mutate()} className="flex-1" />
          </div>
        }
      />
    </>
  );
}
