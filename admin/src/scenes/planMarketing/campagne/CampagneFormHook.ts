import PlanMarketingService from "@/services/planMarketingService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { useSetState } from "react-use";
import { DestinataireListeDiffusion, PlanMarketingRoutes, translateMarketing } from "snu-lib";
import { CampagneModelWithNomSession } from "snu-lib/src/routes/planMarketing";
import { DraftCampagneDataProps } from "./CampagneForm";
import { ProgrammationProps } from "./ProgrammationForm";

type CampagneFormField = keyof Omit<DraftCampagneDataProps, "id"> | "reset";
type CampagneFormValue = string | DestinataireListeDiffusion[] | number | ProgrammationProps[] | boolean | undefined;

export const useCampagneForm = (formData: DraftCampagneDataProps, onSave: (campagneId: string) => void) => {
  const queryClient = useQueryClient();

  const [state, setState] = useSetState<DraftCampagneDataProps & { isTemplateOnError: boolean }>({
    nom: formData.nom,
    type: formData.type,
    listeDiffusionId: formData.listeDiffusionId,
    templateId: formData.templateId,
    objet: formData.objet,
    generic: formData.generic,
    destinataires: formData.destinataires,
    isTemplateOnError: false,
    programmations: formData.programmations || [],
    isProgrammationActive: formData.isProgrammationActive || false,
    isArchived: formData.isArchived || false,
  });

  const handleChange = (field: CampagneFormField, value?: CampagneFormValue) => {
    if (field === "reset") {
      setState({
        nom: formData.nom,
        type: formData.type,
        listeDiffusionId: formData.listeDiffusionId,
        templateId: formData.templateId,
        objet: formData.objet,
        generic: formData.generic,
        destinataires: formData.destinataires,
        isTemplateOnError: false,
        programmations: formData.programmations || [],
        isProgrammationActive: formData.isProgrammationActive || false,
        isArchived: formData.isArchived || false,
      });
    } else {
      setState({ [field]: value });
    }
  };

  const { mutate: saveCampagne, isPending } = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id?: string;
      payload: PlanMarketingRoutes["UpdatePlanMarketingRoute"]["payload"] | PlanMarketingRoutes["CreatePlanMarketingRoute"]["payload"];
    }) => {
      if (id) {
        return PlanMarketingService.update(id, payload as PlanMarketingRoutes["UpdatePlanMarketingRoute"]["payload"]);
      } else {
        return PlanMarketingService.create(payload);
      }
    },
    onSuccess: (data, variables) => {
      setState({ isTemplateOnError: false });
      const campagneId = variables.id || data.id;
      onSave(campagneId);
      toastr.clean();

      if (variables.id) {
        toastr.success("Succès", "La campagne a été mise à jour avec succès", { timeOut: 2000 });
      } else {
        toastr.success("Succès", "La campagne a été créée avec succès", { timeOut: 2000 });
      }
    },
    onError: (error: any) => {
      toastr.clean();
      toastr.error("Erreur", translateMarketing(error.message) || "Une erreur est survenue lors de la sauvegarde de la campagne", { timeOut: 5000 });
      if (error.message === "TEMPLATE_NOT_FOUND") {
        setState({ isTemplateOnError: true });
      }
    },
  });

  const { mutate: toggleArchivageCampagne, isPending: isToggleArchivagePending } = useMutation({
    mutationFn: async (id: string) => {
      return PlanMarketingService.toggleArchivage(id);
    },
    onSuccess: (data) => {
      toastr.clean();
      if (data.isArchived) {
        toastr.success("Succès", "La campagne a été archivée avec succès", { timeOut: 2000 });
      } else {
        toastr.success("Succès", "La campagne a été désarchivée avec succès", { timeOut: 2000 });
      }
      if (data && formData.id) {
        onSave(data.id);
      }

      queryClient.invalidateQueries({ queryKey: ["get-campagnes"] });
    },
    onError: (error: any) => {
      toastr.clean();
      toastr.error("Erreur", translateMarketing(error.message) || "Une erreur est survenue lors du changement d'état d'archivage", { timeOut: 5000 });
    },
  });

  const isDirty = () => {
    return (
      formData.destinataires?.join(",") !== state.destinataires?.join(",") ||
      formData.templateId !== state.templateId ||
      formData.objet !== state.objet ||
      formData.nom !== state.nom ||
      formData.type !== state.type ||
      formData.listeDiffusionId !== state.listeDiffusionId ||
      formData.isProgrammationActive !== state.isProgrammationActive ||
      formData.programmations?.length !== state.programmations?.length
    );
  };

  return {
    state,
    handleChange,
    saveCampagne,
    toggleArchivageCampagne,
    isPending,
    isToggleArchivagePending,
    isDirty,
  };
};

export const useCampagnesSpecifiques = (campagneId?: string) => {
  const [campagnesSpecifiques, setCampagnesSpecifiques] = useState<CampagneModelWithNomSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCampagnesSpecifiques = useCallback(async () => {
    if (!campagneId) {
      setCampagnesSpecifiques([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await PlanMarketingService.getCampagneSpecifiques(campagneId);
      setCampagnesSpecifiques(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch specific campaigns"));
    } finally {
      setIsLoading(false);
    }
  }, [campagneId]);

  useEffect(() => {
    fetchCampagnesSpecifiques();
  }, [fetchCampagnesSpecifiques]);

  return {
    campagnesSpecifiques,
    isLoading,
    error,
    reloadCampagnesSpecifiques: fetchCampagnesSpecifiques,
  };
};
