import PlanMarketingService from "@/services/planMarketingService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError, translateMarketing } from "snu-lib";
import { toastr } from "react-redux-toastr";

export const useSendMailTest = () => {
  const queryClient = useQueryClient();
  const { mutate: sendTest } = useMutation({
    mutationFn: (id: string) => {
      return PlanMarketingService.envoyerEmailTest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toastr.clean();
      toastr.success("Succès", "Mail test envoyé avec succès", { timeOut: 5000 });
    },
    onError: (error: HttpError) => {
      if (error?.statusCode === 422) {
        toastr.clean();
        toastr.error("Erreur", translateMarketing(error.message) || "Une erreur est survenue lors de l'envoi du mail test", { timeOut: 5000 });
      }
    },
  });
  return {
    sendTest,
  };
};
