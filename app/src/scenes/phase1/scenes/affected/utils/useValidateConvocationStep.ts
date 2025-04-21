import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setYoung } from "@/redux/auth/actions";
import { toastr } from "react-redux-toastr";
import plausibleEvent from "@/services/plausible";
import { updateConvocationFileDownload } from "./affectationRepository";

export function useValidateConvocationStep() {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: () => updateConvocationFileDownload("true"),
    onSuccess: (data) => {
      plausibleEvent("affecté_step3");
      dispatch(setYoung(data));
      toastr.success("L'étape de convocation a bien été validée", "");
    },
    onError: (error) => {
      toastr.error("Une erreur est survenue lors de la validation de l'étape de convocation", error.message);
    },
  });
}
