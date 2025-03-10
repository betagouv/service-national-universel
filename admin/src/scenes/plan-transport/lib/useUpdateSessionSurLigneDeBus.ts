import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { LigneBusType, translate } from "snu-lib";
import { SessionPhase1Service } from "../../../services/sessionPhase1Service";

export default function useUpdateSessionSurLigneDeBus(busId: string) {
  return useMutation({
    mutationFn: (payload: Partial<LigneBusType>) => SessionPhase1Service.updateSessionSurLigneDeBus(busId, payload),
    onSuccess: () => toastr.success("Succès", "Votre modification a été prise en compte."),
    onError: (error: Error) => toastr.error("Oups, une erreur est survenue lors de la modification des informations du centre", translate(error.message)),
  });
}
