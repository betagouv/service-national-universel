import { useState, useCallback } from "react";
import { useBrevoRecipients } from "./useBrevoRecipients";
import { useBrevoCSVGenerator } from "./useBrevoCSVGenerator";
import { BrevoRecipientsService, FiltersYoungsForExport } from "@/services/brevoRecipientsService";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { BrevoListData } from "@/components/modals/ModalCreationListeBrevo";

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

type BrevoExportError = ImportRecipientsError | CreateDistributionListError;

export const useBrevoExport = (tab: "volontaire" | "inscription") => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<BrevoExportError | null>(null);

  const { processRecipients } = useBrevoRecipients(tab);
  const { generateCsv, isGenerating } = useBrevoCSVGenerator();

  const { isPending, mutate } = useMutation({
    mutationFn: async ({ file, listData }: { file: File; listData: BrevoListData }) => {
      // 1. Import des recipients dans le bucket
      await BrevoRecipientsService.importRecipients(file).catch((error) => {
        const importError: ImportRecipientsError = {
          code: "IMPORT_ERROR",
          message: "Impossible d'importer les destinataires",
          details: {
            fileName: file.name,
            fileSize: file.size,
          },
          originalError: error,
        };
        toastr.error(`Erreur lors de l'import des destinataires`, "", { timeOut: 5000 });
        throw importError;
      });

      // 2. Création de la liste de diffusion
      return BrevoRecipientsService.createDistributionList({
        nom: listData.name,
        campagneId: listData.campaignId,
        pathFile: `plan-marketing/${file.name}`,
      }).catch((error) => {
        const distributionError: CreateDistributionListError = {
          code: "DISTRIBUTION_LIST_ERROR",
          message: "Impossible de créer la liste de diffusion",
          details: {
            listName: listData.name,
            campaignId: listData.campaignId,
          },
          originalError: error,
        };
        toastr.error(`Erreur lors de la création de la liste de diffusion`, "", { timeOut: 5000 });
        throw distributionError;
      });
    },
    onMutate: () => {
      setIsExporting(true);
      setError(null);
    },
    onError: (error: unknown) => {
      console.error("Erreur détaillée:", error);
      const typedError = error as BrevoExportError;
      setError(typedError);
      setIsExporting(false);
    },
  });

  const exportToCsv = useCallback(
    async (formDataBrevoList: BrevoListData, filters: FiltersYoungsForExport) => {
      setIsExporting(true);
      setError(null);

      try {
        const recipients = await processRecipients(formDataBrevoList.recipients, filters);
        const csvFile = await generateCsv(recipients, "export_brevo");

        if (csvFile) {
          const file = new File([csvFile.buffer], csvFile.filename, { type: csvFile.mimetype });
          await mutate({ file, listData: formDataBrevoList });
        }
      } catch (error) {
        const exportError: ImportRecipientsError = {
          code: "IMPORT_ERROR",
          message: error instanceof Error ? error.message : "Une erreur est survenue lors de l'export",
          originalError: error,
        };
        setError(exportError);
        throw exportError;
      } finally {
        setIsExporting(false);
      }
    },
    [processRecipients, generateCsv, mutate],
  );

  return {
    exportToCsv,
    isProcessing: isExporting || isGenerating || isPending,
    error,
  };
};
