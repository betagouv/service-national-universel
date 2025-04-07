import PlanMarketingService from "@/services/planMarketingService";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { useSetState } from "react-use";
import { DestinataireListeDiffusion, PlanMarketingRoutes, translateMarketing } from "snu-lib";
import { DraftCampagneDataProps } from "./CampagneForm";

export const useCampagneForm = (formData: DraftCampagneDataProps, onSave: () => void) => {
  const [state, setState] = useSetState<DraftCampagneDataProps & { isTemplateOnError: boolean }>({
    nom: formData.nom,
    type: formData.type,
    listeDiffusionId: formData.listeDiffusionId,
    templateId: formData.templateId,
    objet: formData.objet,
    generic: formData.generic,
    destinataires: formData.destinataires,
    isTemplateOnError: false,
  });

  const handleChange = (field: string, value?: string | DestinataireListeDiffusion[] | number) => {
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
      onSave();
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

  const isDirty = () => {
    return (
      formData.destinataires?.join(",") !== state.destinataires?.join(",") ||
      formData.templateId !== state.templateId ||
      formData.objet !== state.objet ||
      formData.nom !== state.nom ||
      formData.type !== state.type ||
      formData.listeDiffusionId !== state.listeDiffusionId
    );
  };

  return { state, handleChange, saveCampagne, isPending, isDirty };
};
