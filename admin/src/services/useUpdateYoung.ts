import { updateYoung } from "@/scenes/phase0/utils/service";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { translate, YoungDto } from "snu-lib";

export default function useUpdateYoung(youngId: string) {
  return useMutation({
    mutationFn: (payload: Partial<YoungDto>) => updateYoung(youngId, payload),
    onSuccess: () => {
      toastr.success("Succès", "Modification enregistrée");
    },
    onError: (e) => {
      toastr.error("Erreur", translate(e.message));
    },
  });
}
