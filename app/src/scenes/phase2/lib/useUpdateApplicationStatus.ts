import { useMutation } from "@tanstack/react-query";
import { APPLICATION_STATUS } from "snu-lib";
import { updateApplication } from "../engagement.repository";
import { notifyApplicationUpdated } from "@/scenes/missions/utils";
import { queryClient } from "@/services/react-query";
import { toastr } from "react-redux-toastr";

export default function useUpdateApplicationStatus(id: string) {
  return useMutation({
    mutationFn: (status: string) => {
      const payload = {
        _id: id,
        status,
        missionDuration: status === APPLICATION_STATUS.ABANDON ? "0" : undefined,
      };
      return updateApplication(payload);
    },
    onSuccess: async (data) => {
      await notifyApplicationUpdated(data._id, data.status);
      queryClient.invalidateQueries({ queryKey: ["mission", data.missionId] });
    },
    onError: () => {
      toastr.error("Oups", "Une erreur s'est produite lors de la mise à jour de  votre candidature");
    },
  });
}
