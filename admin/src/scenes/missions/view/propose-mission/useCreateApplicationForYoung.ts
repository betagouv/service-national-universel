import { useMutation } from "@tanstack/react-query";
import { createApplication, sendNotificationApplicationWasCreated } from "@/services/applicationService";
import { toastr } from "react-redux-toastr";

export default function useCreateApplicationForYoung() {
  return useMutation({
    mutationFn: createApplication,
    onError: (error) => {
      toastr.error("Oups, une erreur est survenue lors de la candidature", error.message);
    },
    onSuccess: async (_, variables) => {
      toastr.success("Candidature créée", "");
      sendNotificationApplicationWasCreated({ mission: variables.mission, young: variables.young });
    },
  });
}
