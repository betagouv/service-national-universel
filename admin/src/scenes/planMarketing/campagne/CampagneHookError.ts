import { useState } from "react";
import { CampagneFormProps } from "./CampagneForm";

interface FormErrors {
  nom?: string;
  type?: string;
  listeDiffusion?: string;
  templateId?: string;
  objet?: string;
  recipients?: string;
}

export const useCampagneError = (formData: CampagneFormProps["campagneData"]) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.nom?.trim()) {
      newErrors.nom = "Le nom de la campagne est requis";
    }

    if (!formData.type) {
      newErrors.type = "Le type de volontaires est requis";
    }

    if (!formData.listeDiffusionId) {
      newErrors.listeDiffusion = "La liste de diffusion est requise";
    }

    if (!formData.templateId) {
      newErrors.templateId = "L'ID du template est requis";
    }

    if (!formData.objet?.trim()) {
      newErrors.objet = "L'objet de la campagne est requis";
    }

    const hasSelectedRecipient = Object.values(formData.destinataires || {}).some((value) => value);
    if (!hasSelectedRecipient) {
      newErrors.recipients = "Au moins un destinataire doit être sélectionné";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validateForm };
};
