import { ReferentielService } from "@/services/ReferentielService";
import { Button, Modal, Select, SelectOption } from "@snu/ds/admin";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { HiOutlineDocumentAdd, HiOutlineDownload, HiOutlineX } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { HttpError, ReferentielRoutes, ReferentielTaskType, translateImportReferentiel } from "snu-lib";

interface ImportSelectModalProps {
  onSuccess: (task: ReferentielRoutes["Import"]["response"]) => void;
  onClose: () => void;
}

export default function ImportSelectModal({ onSuccess, onClose }: ImportSelectModalProps) {
  const [importType, setImportType] = useState<SelectOption<ReferentielTaskType> | null>(null);

  const {
    acceptedFiles: [selectedFile],
    isDragActive,
    getRootProps: dropzoneRootProps,
    getInputProps: dropzoneInputProps,
  } = useDropzone({
    onDrop: () => {
      reset();
      toastr.clean();
    },
    onFileDialogOpen() {
      reset();
      toastr.clean();
    },
    accept: {
      "application/vnd.ms-excel": [".xlsx"],
    },
    maxFiles: 1,
  });

  const importTypeOptions: SelectOption<string>[] = [
    {
      value: ReferentielTaskType.IMPORT_CLASSES,
      label: "Classes",
    },
  ];

  const { isPending, mutate, error, reset } = useMutation<ReferentielRoutes["Import"]["response"], HttpError>({
    mutationFn: async () => {
      return await ReferentielService.importFile(importType!.value, selectedFile);
    },
    onSuccess: (task) => {
      toastr.success("L'import est en cours", "", { timeOut: 5000 });
      onSuccess(task!);
    },
    onError: () => {
      toastr.error("Erreur", "Le fichier ne contient pas les colonnes requises", { timeOut: 5000 });
    },
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      className="md:max-w-[700px]"
      content={
        <div className="flex flex-col items-center text-center gap-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
              <HiOutlineDownload className="w-6 h-6" />
            </div>
          </div>
          <h1 className="font-bold text-xl m-0">Importer fichiers SI-SNU</h1>

          <div className="w-full max-w">
            <Select
              value={importType}
              onChange={(importTypeOption: SelectOption<ReferentielTaskType>) => {
                setImportType(importTypeOption);
              }}
              options={importTypeOptions}
              placeholder="Choisir un type de fichier"
              isClearable={true}
              closeMenuOnSelect
            />
          </div>

          <div
            {...dropzoneRootProps()}
            className={`relative w-full h-[160px] max-w p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"} ${selectedFile ? "bg-gray-50" : ""}`}>
            <input {...dropzoneInputProps()} />
            <div className={`text-center`}>
              {!selectedFile &&
                (isDragActive ? (
                  <p className="text-blue-500">Déposez le fichier ici...</p>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <HiOutlineDocumentAdd size={42} className="text-gray-500" style={{ strokeWidth: 1 }} />
                    <p>Téléversez votre fichier ou glissez-déposez</p>
                    <p className="text-sm text-gray-500 mt-2">Fichier accepté : XSLX</p>
                  </div>
                ))}

              {selectedFile && (
                <div>
                  <HiOutlineX className="absolute top-4 right-4 cursor-pointer" />
                  <p className="mt-4 text-lg text-gray-900">{selectedFile.name}</p>
                </div>
              )}
            </div>
          </div>
          {error && (
            <p className="text-red-500">
              {translateImportReferentiel(error.message)}
              {error.description && ` : ${error.description}`}
            </p>
          )}
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-6">
          <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={onClose} />
          <Button disabled={!selectedFile || !importType || isPending} onClick={() => mutate()} loading={isPending} title="Importer" className="flex-1" />
        </div>
      }
    />
  );
}
