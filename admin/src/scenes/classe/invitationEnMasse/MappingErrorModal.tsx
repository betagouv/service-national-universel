import React, { useState } from "react";
import { Modal } from "@snu/ds/admin";
import { HiOutlineExclamation, HiOutlineRefresh } from "react-icons/hi";
import { SelectMapping } from "./SelectMapping";

export type ColumnMapping = {
  fileColumn: string;
  expectedField: string;
};

export type MappingErrorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRetry: (mappings: ColumnMapping[]) => void;
  columns: string[];
};

export const MappingErrorModal = ({ isOpen, onClose, onRetry, columns }: MappingErrorModalProps) => {
  const expectedFields = ["Prénom", "Nom", "Date de naissance", "Genre"];

  const initialColumnMappings = columns.map((col) => ({
    fileColumn: col,
    expectedField: "",
  }));

  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>(initialColumnMappings);

  const handleSelectChange = (fileColumn: string, newValue: string) => {
    setColumnMappings(columnMappings.map((mapping) => (mapping.fileColumn === fileColumn ? { ...mapping, expectedField: newValue } : mapping)));
  };

  const handleRetry = () => {
    onRetry(columnMappings);
  };

  const header = (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
        <HiOutlineExclamation className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Votre fichier semble comporter quelques erreurs...</h2>
    </div>
  );

  const content = (
    <div className="mt-4">
      <p className="text-center mb-6">
        Des colonnes du fichier n'ont pas été reconnues correctement.
        <br />
        Veuillez associer chaque colonne de votre fichier au format attendu.
      </p>

      {columnMappings.map((mapping, index) => (
        <SelectMapping
          key={index}
          fileColumn={mapping.fileColumn}
          expectedField={mapping.expectedField}
          expectedFieldOptions={expectedFields}
          onChangeExpectedField={(value) => handleSelectChange(mapping.fileColumn, value)}
          className="mb-6"
        />
      ))}
    </div>
  );

  const footer = (
    <div className="text-center">
      <button
        onClick={handleRetry}
        className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-blue-600 text-white text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        <HiOutlineRefresh className="mr-2 h-5 w-5" />
        Relancer l'import
      </button>
    </div>
  );

  return <Modal isOpen={isOpen} onClose={onClose} header={header} content={content} footer={footer} className="sm:max-w-3xl mx-auto" />;
};
