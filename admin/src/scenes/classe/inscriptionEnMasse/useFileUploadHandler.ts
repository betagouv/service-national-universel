import { useState } from "react";

import { translateClasseImportEnMasse } from "snu-lib";
import { ColumnsMapping } from "snu-lib";

import { ClasseService } from "@/services/classeService";

import { ImportEnMasseError } from "./FileValidationErrorsList";
import { validateColumnsName } from "./MappingService";

type FileUploadOptions = {
  classeId: string;
  defaultStudentCount?: number;
};

type FileUploadHandlerReturn = {
  showErrorDisplay: boolean;
  errorMessage: ImportEnMasseError[];
  fileColumns: string[];
  mappingModalOpen: boolean;
  studentCount: number;
  successModalOpen: boolean;
  handleFileUpload: (file: File) => void;
  handleRetryImportWithMapping: (mapping: ColumnsMapping, file: File | undefined) => void;
  setMappingModalOpen: (open: boolean) => void;
  setSuccessModalOpen: (open: boolean) => void;
  setStudentCount: (count: number) => void;
};

export const useFileUploadHandler = (options: FileUploadOptions): FileUploadHandlerReturn => {
  const { defaultStudentCount = 0 } = options || {};

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

  const sendFileToBackend = async (classeId: string, mapping: ColumnsMapping | null, file: File) => {
    try {
      // Envoi au backend pour validation de la cohérence des données
      if (!mapping) {
        return;
      }
      const encodedMapping = Object.keys(mapping).reduce((acc, key) => {
        acc[encodeURIComponent(key)] = encodeURIComponent(mapping[key]);
        return acc;
      }, {}) as any;
      const { errors } = await ClasseService.validateInscriptionEnMasse(classeId, encodedMapping, file);
      const errorByColumn = errors.reduce((acc, error) => {
        const columnName = error.column ?? "inconnu";
        if (!acc[columnName]) {
          acc[columnName] = {
            category: columnName,
            details: [],
          };
        }
        acc[columnName].details.push({ line: error.line, message: translateClasseImportEnMasse(error.code, columnName) });
        return acc;
      }, {});
      setShowErrorDisplay(true);
      setErrorMessage(Object.values(errorByColumn));
    } catch (error) {
      setShowErrorDisplay(true);
      setErrorMessage([{ category: "Général", details: [{ line: 0, message: translateClasseImportEnMasse(error.message) }] }]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Valider le nom des colonnes
    const validationResult = await validateColumnsName(file);
    if (!validationResult.valid && validationResult.columns && validationResult.columns.length > 0) {
      setFileColumns(validationResult.columns);
      setMappingModalOpen(true);
      return;
    }

    sendFileToBackend(options.classeId, null, file);
  };

  const handleRetryImportWithMapping = async (mapping: ColumnsMapping, file: File | undefined) => {
    console.log("handleRetryImport", mapping, file);
    if (!file) {
      return;
    }

    sendFileToBackend(options.classeId, mapping, file);
    setMappingModalOpen(false);
  };

  return {
    showErrorDisplay,
    errorMessage,
    fileColumns,
    mappingModalOpen,
    studentCount,
    successModalOpen,
    handleFileUpload,
    setMappingModalOpen,
    setSuccessModalOpen,
    setStudentCount,
    handleRetryImportWithMapping,
  };
};
