import ListeDiffusionService from "@/services/listeDiffusionService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlanMarketingRoutes, translateMarketing } from "snu-lib";
import { toastr } from "react-redux-toastr";
import { ListeDiffusionDataProps } from "./ListeDiffusionForm";

export const useListeDiffusion = () => {
  const queryClient = useQueryClient();

  const { mutate: saveListeDiffusion } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id?: string;
      payload:
        | PlanMarketingRoutes["ListeDiffusionRoutes"]["CreateListeDiffusionRoute"]["payload"]
        | PlanMarketingRoutes["ListeDiffusionRoutes"]["UpdateListeDiffusionRoute"]["payload"];
    }) => {
      if (id) {
        return ListeDiffusionService.update(id, payload as PlanMarketingRoutes["ListeDiffusionRoutes"]["UpdateListeDiffusionRoute"]["payload"]);
      }
      return ListeDiffusionService.create(payload);
    },
    onSuccess: () => {
      // TODO: Voir pourquoi on ne peut pas mettre à jour la liste de diffusion
      // et que l'on doit invalider la query
      // queryClient.setQueryData<ListeDiffusionDataProps[]>(["listes-diffusion"], (old = []) => {
      //   if (data.id) {
      //     return old.map((item) => (item.id === data.id ? { ...data } : item));
      //   }
      //   return [{ ...data }, ...old];
      // });
      queryClient.invalidateQueries({ queryKey: ["listes-diffusion"] });
      toastr.clean();
      toastr.success("Succès", "Liste de diffusion sauvegardée avec succès", { timeOut: 5000 });
    },
    onError: (error) => {
      toastr.clean();
      toastr.error("Erreur", translateMarketing(error.message) || "Une erreur est survenue lors de la sauvegarde de la liste de diffusion", { timeOut: 5000 });
    },
  });

  const { data: listesDiffusion, isLoading } = useQuery<ListeDiffusionDataProps[]>({
    queryKey: ["listes-diffusion"],
    enabled: true,
    refetchOnWindowFocus: false,
    queryFn: () => ListeDiffusionService.search({ sort: "DESC" }),
  });

  return {
    listesDiffusion: listesDiffusion || [],
    isLoading,
    saveListeDiffusion,
  };
};
