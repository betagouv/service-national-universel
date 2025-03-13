import PlanMarketingService from "@/services/planMarketingService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HttpError, translateMarketing } from "snu-lib";
import { toastr } from "react-redux-toastr";
import { CampagneSpecifiqueFormData } from "./CampagneSpecifiqueForm";
import { CampagneSpecifiqueMapper } from "./mapper/CampagneSpecifiqueMapper";

const CAMPAGNE_SPECIFIQUE_QUERY_KEY = "campagnes-specifiques";
const DEFAULT_SORT = "DESC";

export const useCampagneSpecifique = ({ sessionId }: { sessionId: string }) => {
  const queryClient = useQueryClient();

  const { mutate: saveCampagne } = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: CampagneSpecifiqueFormData & { generic: false } }) => {
      if (id) {
        return PlanMarketingService.update(id, CampagneSpecifiqueMapper.toUpdatePayload({ ...payload, id }));
      }
      return PlanMarketingService.create(CampagneSpecifiqueMapper.toCreatePayload(payload));
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<CampagneSpecifiqueFormData[]>([CAMPAGNE_SPECIFIQUE_QUERY_KEY, DEFAULT_SORT], (old = []) => {
        if (variables.id) {
          return old.map((item) => (item.id === variables.id ? ({ ...item, ...variables.payload } as CampagneSpecifiqueFormData) : item));
        }
        return [CampagneSpecifiqueMapper.toFormData(data), ...old];
      });
      toastr.clean();
      toastr.success("Succès", "Campagne sauvegardée avec succès", { timeOut: 5000 });
    },
    onError: (error: HttpError) => {
      if (error?.statusCode === 422) {
        toastr.clean();
        toastr.error("Erreur", translateMarketing(error.message) || "Une erreur est survenue lors de la sauvegarde de la campagne", { timeOut: 5000 });
      }
    },
  });

  const { data: campagnes, isLoading } = useQuery<CampagneSpecifiqueFormData[]>({
    queryKey: [CAMPAGNE_SPECIFIQUE_QUERY_KEY, DEFAULT_SORT, sessionId],
    enabled: true,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await PlanMarketingService.search({ generic: false, sort: DEFAULT_SORT, cohortId: sessionId });
      return response.map(CampagneSpecifiqueMapper.toFormData);
    },
  });

  return {
    campagnes: campagnes || [],
    isLoading,
    saveCampagne,
  };
};
