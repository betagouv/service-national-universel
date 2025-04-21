import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setYoung } from "@/redux/auth/actions";
import { toastr } from "react-redux-toastr";
import { validateStepConvocation } from "./affectationRepository";
import plausibleEvent from "@/services/plausible";

export function useValidateStepConvocation() {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: validateStepConvocation,
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
