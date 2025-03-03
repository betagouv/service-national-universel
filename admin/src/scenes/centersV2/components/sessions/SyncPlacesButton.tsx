import React from "react";
import { Button } from "@snu/ds/admin";
import { toastr } from "react-redux-toastr";
import { useMutation } from "@tanstack/react-query";

import { CohortDto, translate } from "snu-lib";

import { AffectationService } from "@/services/affectationService";

interface SyncPlacesButtonProps {
  session: CohortDto;
  centreId: string;
  onChange: () => void;
}

export default function SyncPlacesButton({ session, centreId, onChange }: SyncPlacesButtonProps) {
  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      return await AffectationService.postSyncPlacesCentre(session._id!, centreId);
    },
    onSuccess: () => {
      toastr.success("Les places du séjour pour ce centre on bien été mis à jour", "");
      onChange();
    },
    onError(error) {
      toastr.error(translate(error?.message), "");
    },
  });

  return (
    <Button
      title="Recalculer les places occupées"
      type="cancel"
      loading={isPending}
      disabled={!session?._id || !centreId}
      className="!text-gray-400 mt-2"
      onClick={() => mutate()}
    />
  );
}
