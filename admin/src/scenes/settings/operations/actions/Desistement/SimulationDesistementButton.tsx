import React from "react";
import { capture } from "@/sentry";
import { DesistementService } from "@/services/desistementService";
import { queryClient } from "@/services/react-query";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import { Button } from "@snu/ds/admin";

export default function SimulationDesistementButton({ sessionId, taskId, onClose, disabled }: { sessionId: string; taskId: string; onClose: () => void; disabled: boolean }) {
  const { isPending, mutate } = useMutation({
    mutationFn: () => DesistementService.postSimulationDesistement({ sessionId, taskId }),
    onSuccess: () => {
      toastr.success("Le traitement a bien été ajouté", "", { timeOut: 5000 });
      queryClient.invalidateQueries({ queryKey: ["desistement", sessionId] });
      onClose();
    },
    onError: (error: Error) => {
      capture(error);
      toastr.error("Une erreur est survenue lors de l'ajout du traitement", translate(JSON.parse(error.message).message), { timeOut: 5000 });
    },
  });

  return <Button onClick={() => mutate()} title="Lancer une simulation" disabled={disabled || isPending} className="w-full" />;
}
