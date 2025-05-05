import { useState } from "react";

import { CLASSE_IMPORT_EN_MASSE_COLUMNS, translateClasseImportEnMasse } from "snu-lib";
import { ColumnsMapping } from "snu-lib";

import { ClasseService } from "@/services/classeService";

import { ImportEnMasseError } from "./FileValidationErrorsList";
import { validateColumnsName } from "./MappingService";

type FileUploadOptions = {
  classeId: string;
};

type ImportState =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "mapping"; columns: string[] }
  | { status: "error"; errors: ImportEnMasseError[] }
  | { status: "success"; studentCount: number };

type FileUploadHandlerReturn = {
  importState: ImportState;
  handleFileUpload: (file: File) => void;
  handleRetryImportWithMapping: (mapping: Omit<ColumnsMapping, CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI>, file: File | undefined) => void;
  resetState: () => void;
  closeMapping: () => void;
  closeSuccess: () => void;
};

export const useFileUploadHandler = (options: FileUploadOptions): FileUploadHandlerReturn => {
  const [importState, setImportState] = useState<ImportState>({ status: "idle" });

  const resetState = () => {
    setImportState({ status: "idle" });
  };

  const closeMapping = () => {
    setImportState({ status: "idle" });
  };

  const closeSuccess = () => {
    setImportState({ status: "idle" });
  };

  const sendFileToBackend = async (classeId: string, mapping: ColumnsMapping | null, file: File) => {
    try {
      // TODO : in a multipart form, utf-8 is not applied
      let encodedMapping;
      if (mapping) {
        encodedMapping = Object.keys(mapping)
          .filter((key) => key !== CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI) // TODO: à supprimer en fonction de la RG
          .reduce((acc, key) => {
            acc[encodeURIComponent(key)] = encodeURIComponent(mapping[key]);
            return acc;
          }, {}) as any;
      }

      const { errors } = await ClasseService.validateInscriptionEnMasse(classeId, encodedMapping, file);

      if (errors.length === 0) {
        setImportState({ status: "success", studentCount: 0 }); // Set actual student count here
        return;
      }

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

      setImportState({ status: "error", errors: Object.values(errorByColumn) });
    } catch (error) {
      setImportState({
        status: "error",
        errors: [
          {
            category: "Général",
            details: [{ line: 0, message: translateClasseImportEnMasse(error.message) }],
          },
        ],
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setImportState({ status: "validating" });

    // Valider le nom des colonnes
    const validationResult = await validateColumnsName(file);
    if (!validationResult.valid && validationResult.columns && validationResult.columns.length > 0) {
      setImportState({ status: "mapping", columns: validationResult.columns });
      return;
    }

    sendFileToBackend(options.classeId, null, file);
  };

  const handleRetryImportWithMapping = async (mapping: ColumnsMapping, file: File | undefined) => {
    if (!file) return;

    setImportState({ status: "validating" });
    sendFileToBackend(options.classeId, mapping, file);
  };

  return {
    importState,
    handleFileUpload,
    handleRetryImportWithMapping,
    resetState,
    closeMapping,
    closeSuccess,
  };
};
