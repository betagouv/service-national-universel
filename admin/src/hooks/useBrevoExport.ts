import { useCallback } from "react";
import { useBrevoRecipients } from "./useBrevoRecipients";
import { useBrevoCSVGenerator } from "./useBrevoCSVGenerator";
import { BrevoRecipientsService, FiltersYoungsForExport } from "@/services/brevoRecipientsService";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { BrevoListData } from "@/components/modals/ModalCreationListeBrevo";
import { PLAN_MARKETING_FOLDER_PATH_EXPORT } from "snu-lib";

interface ImportRecipientsError {
  code: "IMPORT_ERROR";
  message: string;
  details?: {
    fileSize?: number;
    fileName?: string;
  };
  originalError: unknown;
}

interface CreateDistributionListError {
  code: "DISTRIBUTION_LIST_ERROR";
  message: string;
  details?: {
    listName?: string;
    campaignId?: string;
  };
  originalError: unknown;
}

interface CampaignNotFoundError {
  code: "CAMPAIGN_NOT_FOUND";
  message: string;
  details?: {
    campaignId?: string;
  };
  originalError: unknown;
}

export const useBrevoExport = (tab: "volontaire" | "inscription") => {
  const { processRecipients } = useBrevoRecipients(tab);
  const { generateCsv, isGenerating } = useBrevoCSVGenerator();

  // Mutation pour l'import des recipients
  const importRecipientsMutation = useMutation({
    mutationFn: async (file: File) => {
      return await BrevoRecipientsService.importRecipients(file);
    },
    onError: (error: unknown) => {
      const importError: ImportRecipientsError = {
        code: "IMPORT_ERROR",
        message: "Impossible d'importer les destinataires",
        details: {
          fileName: (error as any).file?.name,
          fileSize: (error as any).file?.size,
        },
        originalError: error,
      };
      toastr.error(`Erreur lors de l'import des destinataires`, "", { timeOut: 5000 });
      throw importError;
    },
  });

  // Mutation pour la création de la liste de diffusion
  const createDistributionListMutation = useMutation({
    mutationFn: async ({ fileName, listData }: { fileName: string; listData: BrevoListData }) => {
      return await BrevoRecipientsService.createDistributionList({
        nom: listData.name,
        campagneId: listData.campaignId,
        pathFile: `${PLAN_MARKETING_FOLDER_PATH_EXPORT}/${fileName}`,
      });
    },
    onError: (error: unknown) => {
      if (["CAMPAIGN_NOT_FOUND", "NOT_FOUND"].includes((error as any).message) && (error as any).statusCode === 422) {
        const campaignNotFoundError: CampaignNotFoundError = {
          code: "CAMPAIGN_NOT_FOUND",
          message: "Impossible de trouver la campagne",
          details: {
            campaignId: (error as any).campaignId,
          },
          originalError: error,
        };
        toastr.error(`Impossible de créer la liste de diffusion`, `L'ID campagne "${(error as any).campaignId}" n'existe pas dans Brevo`, { timeOut: 5000 });
        throw campaignNotFoundError;
      }

      const distributionError: CreateDistributionListError = {
        code: "DISTRIBUTION_LIST_ERROR",
        message: "Impossible de créer la liste de diffusion",
        details: {
          listName: (error as any).listName,
          campaignId: (error as any).campaignId,
        },
        originalError: error,
      };
      toastr.error(`Erreur lors de la création de la liste de diffusion`, "", { timeOut: 5000 });
      throw distributionError;
    },
    onSuccess: (_, { listData }) => {
      toastr.success(`La liste de diffusion "${listData.name}" a été créée avec succès`, "", { timeOut: 5000 });
    },
  });

  const exportToCsv = useCallback(
    async (formDataBrevoList: BrevoListData, filters: FiltersYoungsForExport) => {
      try {
        // 1. Process recipients
        const recipients = await processRecipients(formDataBrevoList.recipients, filters);

        // 2. Generate CSV
        const csvFile = await generateCsv(recipients, formDataBrevoList.name);
        if (!csvFile) throw new Error("Impossible de générer le fichier CSV");

        // 3. Create file and import recipients
        const file = new File([csvFile.buffer], csvFile.filename, { type: csvFile.mimetype });
        await importRecipientsMutation.mutateAsync(file);

        // 4. Create distribution list
        await createDistributionListMutation.mutateAsync({ fileName: file.name, listData: formDataBrevoList });
      } catch (error) {
        const exportError: ImportRecipientsError = {
          code: "IMPORT_ERROR",
          message: error instanceof Error ? error.message : "Une erreur est survenue lors de l'export",
          originalError: error,
        };
        throw exportError;
      }
    },
    [processRecipients, generateCsv, importRecipientsMutation, createDistributionListMutation],
  );

  return {
    exportToCsv,
    isProcessing: isGenerating || importRecipientsMutation.isPending || createDistributionListMutation.isPending,
    error: importRecipientsMutation.error || createDistributionListMutation.error,
  };
};
