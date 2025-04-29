import { setYoung } from "@/redux/auth/actions";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { ERRORS, translate, YoungType } from "snu-lib";
import { updateYoung } from "./repository";

export default function useUpdateAccount(section: string) {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (payload: Partial<YoungType & { parent2: boolean }>) => updateYoung(section, payload),
    onSuccess: (data) => {
      toastr.success("Succès", "Votre profil a été mis à jour.");
      dispatch(setYoung(data));
    },
    onError: (error) => {
      console.error(error);
      if (error.message === ERRORS.OPERATION_UNAUTHORIZED) {
        toastr.error(`${translate(error.message)} :`, "Vous n'avez pas les droits pour effectuer cette action.");
        return;
      }
      toastr.error("Une erreur s'est produite :", translate(error.message));
    },
  });
}
