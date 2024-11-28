import { setYoung } from "@/redux/auth/actions";
import useAuth from "@/services/useAuth";
import { changeYoungCohort } from "@/services/young.service";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";

type ChangeCohortArgs = { reason: string; message?: string } & ({ cohortId: string; cohortName?: never } | { cohortName: string; cohortId?: never });

export default function useChangeSejour() {
  const { young } = useAuth();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: ({ reason, message, cohortId, cohortName }: ChangeCohortArgs) => changeYoungCohort({ youngId: young._id, reason, message, cohortId, cohortName }),
    onSuccess: (data) => {
      toastr.success("Succès", "Votre séjour a bien été modifié.");
      dispatch(setYoung(data));
    },
    onError: () => {
      toastr.error("Erreur", "Une erreur est survenue lors du changement de séjour.");
    },
  });
}
