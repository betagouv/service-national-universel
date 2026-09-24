import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { downloadConvocation, sendConvocationByEmail } from "./affectationRepository";
import useAuth from "@/services/useAuth";

export function useDownloadConvocation() {
  const { young } = useAuth();
  return useMutation({
    mutationFn: async () => {
      await downloadConvocation(young);
    },
    onError: (e) => {
      toastr.error("Une erreur est survenue lors de l'édition de votre convocation", e.message);
    },
  });
}

export function useSendConvocationByEmail() {
  const { young } = useAuth();
  return useMutation({
    mutationFn: () => sendConvocationByEmail(young),
    onSuccess: () => {
      toastr.success(`Document envoyé à ${young.email}`, "");
    },
    onError: (e) => {
      toastr.error("Erreur lors de l'envoi du document : ", e.message);
    },
  });
}
