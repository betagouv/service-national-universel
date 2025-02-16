import { useState } from "react";
import { generateCsvBuffer } from "snu-lib";

import { BrevoRecipient } from "./useBrevoRecipients";

export const useBrevoCSVGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const BREVO_CSV_FIELDS: (keyof BrevoRecipient)[] = [
    "type",
    "PRENOM",
    "NOM",
    "EMAIL",
    "COHORT",
    "CENTRE",
    "VILLECENTRE",
    "PRENOMVOLONTAIRE",
    "NOMVOLONTAIRE",
    "PDR_ALLER",
    "PDR_ALLER_ADRESSE",
    "PDR_ALLER_VILLE",
    "DATE_ALLER",
    "HEURE_ALLER",
    "PDR_RETOUR",
    "PDR_RETOUR_VILLE",
    "PDR_RETOUR_ADRESSE",
    "DATE_RETOUR",
    "HEURE_RETOUR",
  ];

  const generateCsv = async (data: BrevoRecipient[], fileName: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateCsvBuffer<BrevoRecipient>(data, fileName, BREVO_CSV_FIELDS);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setError(new Error(`Erreur lors de la génération du CSV: ${errorMessage}`));
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateCsv,
    isGenerating,
    error,
  };
};
