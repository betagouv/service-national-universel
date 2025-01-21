import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { HiOutlineDownload } from "react-icons/hi";
import { Button, Modal, Select } from "@snu/ds/admin";
import { ReferentielTaskType } from "snu-lib";
import { SelectOption } from "../../../../packages/ds/src/admin/form/Select/Select";

interface ImportSelectModalProps {
  onSubmit: (importType: keyof typeof ReferentielTaskType, file: File) => void;
  onClose: () => void;
}

export default function ImportSelectModal({ onSubmit, onClose }: ImportSelectModalProps) {
  const [importType, setImportType] = useState<SelectOption<string> | null>(null);

  const {
    acceptedFiles: [selectedFile],
    isDragActive,
    getRootProps: dropzoneRootProps,
    getInputProps: dropzoneInputProps,
  } = useDropzone({
    accept: {
      "application/vnd.ms-excel": [".xlsx"],
    },
    maxFiles: 1,
  });

  const importTypeOptions: SelectOption<string>[] = Object.keys(ReferentielTaskType).map((key) => ({
    value: key,
    label: ReferentielTaskType[key as keyof typeof ReferentielTaskType],
  }));

  const handleSubmit = async () => {
    if (selectedFile?.handle && importType && ReferentielTaskType[importType.value]) {
      onSubmit(ReferentielTaskType[importType.value], await selectedFile.handle.getFile());
      onClose();
    }
  };
  console.log("acceptedFiles", selectedFile);
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
              onChange={(importTypeOption: SelectOption<string>) => {
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
            className={`w-full h-[148px] max-w p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
            <input {...dropzoneInputProps()} />
            <div className="text-center">
              {isDragActive ? (
                <p className="text-blue-500">Déposez le fichier ici...</p>
              ) : (
                <div>
                  <p>Téléversez votre fichier ou glissez-déposez</p>
                  <p className="text-sm text-gray-500 mt-2">Fichier accepté : XSLX</p>
                </div>
              )}
              {selectedFile && <p className="mt-4 text-sm text-gray-600">Fichier sélectionné : {selectedFile.name}</p>}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-6">
          <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={onClose} />
          <Button disabled={!selectedFile || !importType} onClick={handleSubmit} title="Importer" className="flex-1" />
        </div>
      }
    />
  );
}
