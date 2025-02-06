import { setYoung } from "@/redux/auth/actions";
import { capture } from "@/sentry";
import API from "@/services/api";
import useAuth from "@/services/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { YoungType } from "snu-lib";

async function updateMPStatus({ young, status }): Promise<YoungType> {
  const url = `/young/${young._id}/phase2/militaryPreparation/status`;
  const body = { statusMilitaryPreparationFiles: status };
  const { ok, code, data } = await API.put(url, body);
  if (!ok) throw new Error(code);
  return data;
}

export default function useUpdateMPStatus() {
  const { young } = useAuth();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (status) => updateMPStatus({ young, status }),
    onError: (error) => {
      toastr.error("Oups", "Une erreur est survenue lors de la modification de votre dossier.");
      capture(error);
    },
    onSettled: (data: YoungType) => {
      dispatch(setYoung(data));
      toastr.success("Votre dossier a bien été mis à jour !", "");
    },
  });
}
