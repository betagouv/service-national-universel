import API from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { LigneBusDto, LigneBusType, translate } from "snu-lib";

async function updateCentreSurLigneDeBus(busId: string, payload: Partial<LigneBusType>): Promise<LigneBusDto> {
  const { ok, code, data } = await API.put(`/ligne-de-bus/${busId}/centre`, payload);
  if (!ok) throw new Error(code);
  if (!data) throw new Error("No data returned");
  return data;
}

export default function useUpdateCentreSurLigneDeBus(busId: string) {
  return useMutation({
    mutationFn: (payload: Partial<LigneBusType>) => updateCentreSurLigneDeBus(busId, payload),
    onSuccess: () => toastr.success("Succès", "Votre modification a été prise en compte."),
    onError: (error: Error) => toastr.error("Oups, une erreur est survenue lors de la modification des informations du centre", translate(error.message)),
  });
}
