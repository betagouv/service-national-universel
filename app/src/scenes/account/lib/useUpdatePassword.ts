import { useMutation } from "@tanstack/react-query";
import { updatePassword } from "./repository";
import { toastr } from "react-redux-toastr";
import { useDispatch } from "react-redux";
import { setYoung } from "@/redux/auth/actions";

export default function useUpdatePassword() {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (variables: { password: string; newPassword: string; verifyPassword: string }) => updatePassword(variables),
    onSuccess: (data) => {
      toastr.success("Succès", "Votre mot de passe a été mis à jour.");
      dispatch(setYoung(data));
    },
    onError: (error: Error) => {
      console.error("error", error);
      if (error.message === "OPERATION_UNAUTHORIZED") {
        toastr.error("Une erreur s'est produite :", "Vous n'avez pas les droits pour effectuer cette action.");
        return;
      }
      toastr.error("Une erreur s'est produite :", error.message);
    },
  });
}
