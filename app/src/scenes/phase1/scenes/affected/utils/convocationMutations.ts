import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setYoung } from "@/redux/auth/actions";
import { toastr } from "react-redux-toastr";
import plausibleEvent from "@/services/plausible";
import { downloadConvocation, sendConvocationByEmail, updateConvocationFileDownload } from "./affectationRepository";
import useAuth from "@/services/useAuth";
// eslint-disable-next-line import/extensions
import { STEPS, useSteps } from "./steps.utils";

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

export function useDownloadConvocation() {
  const { young } = useAuth();
  const { isStepDone } = useSteps();
  const { mutate: validateConvocationStep } = useValidateConvocationStep();
  return useMutation({
    mutationFn: async () => {
      await downloadConvocation(young);
    },
    onSuccess: () => {
      if (!isStepDone(STEPS.CONVOCATION)) {
        validateConvocationStep();
      }
    },
    onError: (e) => {
      toastr.error("Une erreur est survenue lors de l'édition de votre convocation", e.message);
    },
  });
}

export function useSendConvocationByEmail() {
  const { young } = useAuth();
  const { isStepDone } = useSteps();
  const { mutate: validateConvocationStep } = useValidateConvocationStep();
  return useMutation({
    mutationFn: () => sendConvocationByEmail(young),
    onSuccess: () => {
      toastr.success(`Document envoyé à ${young.email}`, "");
      if (!isStepDone(STEPS.CONVOCATION)) {
        validateConvocationStep();
      }
    },
    onError: (e) => {
      toastr.error("Erreur lors de l'envoi du document : ", e.message);
    },
  });
}
