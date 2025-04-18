import PlanMarketingService from "@/services/planMarketingService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CampagneEnvoi, HttpError, translateMarketing } from "snu-lib";
import { toastr } from "react-redux-toastr";
import { CampagneSpecifiqueFormData, ValidationErrors } from "./CampagneSpecifiqueForm";
import { CampagneSpecifiqueMapper } from "./mapper/CampagneSpecifiqueMapper";

const CAMPAGNE_SPECIFIQUE_QUERY_KEY = "campagnes-specifiques";
const DEFAULT_SORT = "DESC";

interface SaveCampagneParams {
  id?: string;
  payload: CampagneSpecifiqueFormData & { generic: false };
  onSuccess?: (success: boolean, errors?: ValidationErrors, savedId?: string) => void;
}

const mapErrorCodeToValidationErrors = (errorCode: string): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (errorCode === "TEMPLATE_NOT_FOUND") {
    errors.templateId = true;
  }

  return errors;
};

export const useCampagneSpecifique = ({ sessionId }: { sessionId: string }) => {
  const queryClient = useQueryClient();

  const { mutate: saveCampagne } = useMutation({
    mutationFn: ({ id, payload }: SaveCampagneParams) => {
      if (id) {
        return PlanMarketingService.update(id, CampagneSpecifiqueMapper.toUpdatePayload({ ...payload, id }));
      }
      return PlanMarketingService.create(CampagneSpecifiqueMapper.toCreatePayload(payload));
    },
    onSuccess: (campagne, variables) => {
      // Force la récupération des campagnes spécifiques
      // pour mettre à jour la liste des campagnes spécifiques avec la référence à la campagne générique
      queryClient.invalidateQueries({ queryKey: [CAMPAGNE_SPECIFIQUE_QUERY_KEY, DEFAULT_SORT, sessionId] });
      toastr.clean();
      toastr.success("Succès", "Campagne sauvegardée avec succès", { timeOut: 5000 });

      if (variables.onSuccess) {
        const savedId = campagne?.id || variables.id;
        variables.onSuccess(true, undefined, savedId);
      }
    },
    onError: (error: HttpError, variables) => {
      if (error?.statusCode === 422) {
        toastr.clean();
        toastr.error("Erreur", translateMarketing(error.message) || "Une erreur est survenue lors de la sauvegarde de la campagne", { timeOut: 5000 });
      }

      const errors = mapErrorCodeToValidationErrors(error.message);

      if (variables.onSuccess) {
        variables.onSuccess(false, errors);
      }
    },
  });

  const { mutate: sendCampagne } = useMutation({
    mutationFn: (params: { id: string; isProgrammationActive?: boolean }) => {
      return PlanMarketingService.envoyer(params.id, params.isProgrammationActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toastr.clean();
      toastr.success("Succès", "Campagne envoyée avec succès", { timeOut: 5000 });
    },
    onError: (error: HttpError) => {
      if (error?.statusCode === 422) {
        toastr.clean();
        toastr.error("Erreur", translateMarketing(error.message) || "Une erreur est survenue lors de l'envoi de la campagne", { timeOut: 5000 });
      }
    },
  });

  const { mutate: toggleArchivageCampagne, isPending: isToggleArchivagePending } = useMutation({
    mutationFn: (id: string) => {
      return PlanMarketingService.toggleArchivage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAGNE_SPECIFIQUE_QUERY_KEY, DEFAULT_SORT, sessionId] });
      toastr.clean();
      toastr.success("Succès", "Statut d'archivage de la campagne modifié avec succès", { timeOut: 5000 });
    },
    onError: () => {
      toastr.clean();
      toastr.error("Erreur", "Une erreur est survenue lors de l'archivage ou du désarchivage de la campagne", { timeOut: 5000 });
    },
  });

  const { data: campagnes, isLoading } = useQuery<(CampagneSpecifiqueFormData & { envois?: CampagneEnvoi[] })[]>({
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
    sendCampagne,
    toggleArchivageCampagne,
    isToggleArchivagePending,
  };
};
