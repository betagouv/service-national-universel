import React from "react";
import cx from "classnames";
import { toastr } from "react-redux-toastr";
import { useMutation } from "@tanstack/react-query";

import { CohortDto, HttpError, translate } from "snu-lib";
import { Button } from "@snu/ds/admin";

import { AffectationService } from "@/services/affectationService";

interface SyncPlacesPDTButtonProps {
  cohort: CohortDto;
  disabled: boolean;
  onChange: () => void;
  className?: string;
}

export default function SyncPlacesPDTButton({ cohort, disabled, onChange, className }: SyncPlacesPDTButtonProps) {
  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      await AffectationService.postSyncPlacesLigneDeBus(cohort._id!);
      await AffectationService.postSyncPlacesCentres(cohort._id!);
    },
    onSuccess: () => {
      toastr.success("Les places dans les lignes de bus ont bien été recalculés ainsi que le taux de remplissage", "", { timeOut: 5000 });
      onChange();
    },
    onError: (error: HttpError) => {
      console.log(error);
      toastr.error("Une erreur est survenue.", `${translate(error.message)}${error.description ? `: ${error.description}` : ""}`);
    },
  });

  return <Button title="Recalculer les places" loading={isPending} disabled={disabled} type="cancel" onClick={() => mutate()} className={cx(className)} />;
}
