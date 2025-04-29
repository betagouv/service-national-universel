import { ClasseService } from "@/services/classeService";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { ColumnsMapping } from "snu-lib";

export const useValidateInscriptionEnMasse = (classeId: string, payload: ColumnsMapping, file: File) => {
  const { mutate } = useMutation({
    mutationFn: () => ClasseService.validateInscriptionEnMasse(classeId, payload, file),
    onSuccess: () => {
      toastr.success("Inscription en masse réussie", "Les élèves ont été ajoutés à la classe");
    },
    onError: () => {
      toastr.error("Erreur lors de l'inscription en masse", "Veuillez réessayer");
    },
  });
  return mutate;
};
