import ListeDiffusionService from "@/services/listeDiffusionService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HttpError, PlanMarketingRoutes, translateMarketing } from "snu-lib";
import { toastr } from "react-redux-toastr";
import { ListeDiffusionDataProps } from "./ListeDiffusionForm";
import { ListeDiffusionFilters } from "../components/filters/PlanMarketingFilters";

const LISTE_DIFFUSION_QUERY_KEY = "listes-diffusion";
const DEFAULT_SORT = "DESC";

export const useListeDiffusion = (filters?: ListeDiffusionFilters) => {
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
    onSuccess: (data, variables) => {
      queryClient.setQueryData<ListeDiffusionDataProps[]>([LISTE_DIFFUSION_QUERY_KEY, DEFAULT_SORT, filters], (old = []) => {
        if (variables.id) {
          return old.map((item) => (item.id === variables.id ? { ...item, ...variables.payload } : item));
        }
        return [data, ...old];
      });
      toastr.clean();
      toastr.success("Succès", "Liste de diffusion sauvegardée avec succès", { timeOut: 5000 });
    },
    onError: (error: HttpError) => {
      if (error?.statusCode === 422) {
        toastr.clean();
        toastr.error("Erreur", translateMarketing(error.message) || "Une erreur est survenue lors de la sauvegarde de la liste de diffusion", { timeOut: 5000 });
      }
    },
  });

  const { mutate: toggleArchivageListeDiffusion, isPending: isToggleArchivagePending } = useMutation({
    mutationFn: (id: string) => ListeDiffusionService.toggleArchivage(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [LISTE_DIFFUSION_QUERY_KEY, DEFAULT_SORT, filters] });
      toastr.clean();
      if (data?.isArchived) {
        toastr.success("Succès", "Liste de diffusion archivée", { timeOut: 3000 });
      } else {
        toastr.success("Succès", "Liste de diffusion désarchivée", { timeOut: 3000 });
      }
    },
    onError: (error: HttpError) => {
      toastr.clean();
      toastr.error("Erreur", translateMarketing(error.message) || "Une erreur est survenue lors du changement d'état d'archivage", { timeOut: 5000 });
    },
  });

  const { data: listesDiffusion, isLoading } = useQuery<ListeDiffusionDataProps[]>({
    queryKey: [LISTE_DIFFUSION_QUERY_KEY, DEFAULT_SORT, filters],
    enabled: true,
    refetchOnWindowFocus: false,
    queryFn: () => ListeDiffusionService.search({ sort: DEFAULT_SORT, isArchived: filters?.isArchived }),
  });

  return {
    listesDiffusion: listesDiffusion || [],
    isLoading,
    saveListeDiffusion,
    toggleArchivageListeDiffusion,
    isToggleArchivagePending,
  };
};
