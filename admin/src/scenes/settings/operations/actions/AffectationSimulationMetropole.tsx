import { capture } from "@/sentry";
import { AffectationService } from "@/services/affectationService";
import { Button } from "@snu/ds/admin";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { HiOutlineInformationCircle, HiOutlineRefresh } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { translate } from "snu-lib";

interface AffectationSimulationMetropoleProps {
  cohortId: string;
  cohortName: string;
}

export default function AffectationSimulationMetropole({ cohortId, cohortName }: AffectationSimulationMetropoleProps) {
  const history = useHistory();

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      return await AffectationService.postAffectationMetropole({ cohortId });
    },
    onSuccess: () => {
      toastr.success("Le traitement a bien été ajouté", "");
    },
    onError: (error: any) => {
      capture(error);
      toastr.error("Une erreur est survenue lors de l'ajout du traitement", translate(JSON.parse(error.message).message));
    },
  });

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex gap-2">
        <div className="text-sm leading-5 font-bold">Affectation HTS (Hors DOM TOM)</div>
        <HiOutlineInformationCircle className="text-gray-400" size={20} />
        {isPending && <div className="text-xs leading-4 font-normal text-orange-500 italic">Simulation en cours...</div>}
      </div>
      <div className="flex gap-2">
        <Button title="Voir les simulations" type="wired" disabled={isPending} onClick={() => history.push(`?tab=simulations&cohort=${cohortName}`)} />
        <Button title="Lancer une simulation" onClick={() => mutate()} leftIcon={isPending && <HiOutlineRefresh />} disabled={isPending} />
      </div>
    </div>
  );
}
