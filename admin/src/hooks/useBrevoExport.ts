import { useState, useCallback } from "react";
import { useBrevoRecipients } from "./useBrevoRecipients";
import { useBrevoCSVGenerator } from "./useBrevoCSVGenerator";
import { BrevoRecipientsService, FiltersYoungsForExport } from "@/services/brevoRecipientsService";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { BrevoListData } from "@/components/modals/ModalCreationListeBrevo";

export const useBrevoExport = (tab: "volontaire" | "inscription") => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { processRecipients } = useBrevoRecipients(tab);
  const { generateCsv, isGenerating } = useBrevoCSVGenerator();

  const { isPending, mutate } = useMutation({
    mutationFn: async ({ file, listData }: { file: File; listData: BrevoListData }) => {
      // 1. Import des recipients dans le bucket
      await BrevoRecipientsService.importRecipients(file);

      // 2. Création de la liste de diffusion
      await BrevoRecipientsService.createDistributionList({
        nom: listData.name,
        campagneId: listData.campaignId,
        pathFile: `plan-marketing/${file.name}`,
      });
    },
    onMutate: () => {
      setIsExporting(true);
    },
    onSuccess: () => {
      setIsExporting(false);
      toastr.success("La liste de diffusion a été créée avec succès", "", { timeOut: 5000 });
    },
    onError: (error: Error) => {
      console.log(error);
      setError(error);
      setIsExporting(false);
      toastr.error("Une erreur est survenue lors de la création de la liste de diffusion", "", { timeOut: 5000 });
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
        setError(error instanceof Error ? error : new Error("Une erreur est survenue lors de l'export"));
        throw error;
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
