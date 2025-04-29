import { useState } from "react";

import { translateClasseImportEnMasse } from "snu-lib";

import { ClasseService } from "@/services/classeService";

import { ImportEnMasseError } from "./ValidationFile";

type FileUploadOptions = {
  classeId: string;
  onMappingNeeded?: (columns: string[]) => void;
  onSuccess?: (studentCount: number) => void;
  onError?: (errors: ImportEnMasseError[]) => void;
  defaultStudentCount?: number;
};

type FileUploadHandlerReturn = {
  showErrorDisplay: boolean;
  errorMessage: ImportEnMasseError[];
  fileColumns: string[];
  mappingModalOpen: boolean;
  studentCount: number;
  successModalOpen: boolean;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setMappingModalOpen: (open: boolean) => void;
  setSuccessModalOpen: (open: boolean) => void;
  setStudentCount: (count: number) => void;
};

export const useFileUploadHandler = (options: FileUploadOptions): FileUploadHandlerReturn => {
  const { onMappingNeeded, onSuccess, onError, defaultStudentCount = 0 } = options || {};

  // Error state
  const [showErrorDisplay, setShowErrorDisplay] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ImportEnMasseError[]>([]);

  // Success modal state
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [studentCount, setStudentCount] = useState(defaultStudentCount);

  // Mapping modal state
  const [mappingModalOpen, setMappingModalOpen] = useState(false);

  // TODO : Récupérer les colonnes du fichier
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("File selected:", file);
    event.target.value = "";

    try {
      // Simulate different responses based on file name for demonstration
      // Mapping error example: file needs column mapping
      if (file.name.includes("mapping")) {
        const columns = ["prenom_élève", "nom_élève", "date_naissance", "sexe"];
        setFileColumns(columns);
        setMappingModalOpen(true);
        onMappingNeeded?.(columns);
      }

      // Success example
      else if (file.name.includes("success")) {
        const count = 24; // Example count
        setStudentCount(count);
        setSuccessModalOpen(true);
        onSuccess?.(count);
      }

      // Error example
      else {
        // Example error response
        try {
          const { errors } = await ClasseService.validateInscriptionEnMasse(options.classeId, null, file);
          const errorByColumn = errors.reduce((acc, error) => {
            if (!acc[error.column]) {
              acc[error.column] = {
                category: error.column,
                details: [],
              };
            }
            acc[error.column].details.push({ line: error.line, message: translateClasseImportEnMasse(error.code, error.column) });
            return acc;
          }, {});
          setShowErrorDisplay(true);
          setErrorMessage(Object.values(errorByColumn));
        } catch (error) {
          setShowErrorDisplay(true);
          setErrorMessage([{ category: "Général", details: [{ line: 0, message: translateClasseImportEnMasse(error.message) }] }]);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify([]);
      const parsedErrors = JSON.parse(errorMsg) as ImportEnMasseError[];
      setErrorMessage(parsedErrors);
      setShowErrorDisplay(true);
      onError?.(parsedErrors);
    }
  };

  return {
    showErrorDisplay,
    errorMessage,
    fileColumns,
    mappingModalOpen,
    studentCount,
    successModalOpen,
    handleFileChange,
    setMappingModalOpen,
    setSuccessModalOpen,
    setStudentCount,
  };
};
