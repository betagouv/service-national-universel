import React, { useState } from "react";
import { Modal, Button } from "@snu/ds/admin";
import { SelectMapping } from "./SelectMapping";
import { IoAlertCircle } from "react-icons/io5";

export interface ColumnMapping {
  fileColumn: string;
  appField: string;
}

interface MappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: (mappings: ColumnMapping[]) => void;
  columns: string[];
}

export const MappingModal: React.FC<MappingModalProps> = ({ isOpen, onClose, onRetry, columns }) => {
  const [mappings, setMappings] = useState<ColumnMapping[]>(columns.map((col) => ({ fileColumn: col, appField: "" })));

  const requiredFields = ["firstName", "lastName", "birthDate", "gender"];
  const fieldLabels: Record<string, string> = {
    firstName: "Prénom",
    lastName: "Nom",
    birthDate: "Date de naissance",
    gender: "Genre",
  };

  const handleFieldChange = (fileColumn: string, appField: string) => {
    setMappings((prev) => prev.map((mapping) => (mapping.fileColumn === fileColumn ? { ...mapping, appField } : mapping)));
  };

  const handleSubmit = () => {
    onRetry(mappings);
  };

  const header = (
    <div className="flex flex-col items-center text-center">
      <div className="bg-red-100 rounded-full p-4 mb-4">
        <IoAlertCircle className="text-red-500 w-8 h-8" />
      </div>
      <h2 className="text-2xl font-medium">Votre fichier semble comporter quelques erreurs ...</h2>
      <p className="text-gray-600 mt-2">
        Des colonnes du fichier n'ont pas été reconnues correctement.
        <br />
        Veuillez associer chaque colonne de votre fichier au format attendu.
      </p>
    </div>
  );

  const content = (
    <div className="mt-8 space-y-8">
      {Object.entries(fieldLabels).map(([key, label]) => {
        return <SelectMapping key={key} fileColumn={columns} expectedField={label} />;
      })}
    </div>
  );

  const isButtonDisabled = mappings.some((m) => !m.appField) || new Set(mappings.map((m) => m.appField)).size !== requiredFields.length;

  const footer = (
    <div className="flex justify-center w-full mt-6">
      <Button
        onClick={handleSubmit}
        leftIcon={
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 01-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        }
        title="Relancer l'import"
        disabled={isButtonDisabled}
        className="mx-auto"
      />
    </div>
  );

  return <Modal isOpen={isOpen} onClose={onClose} header={header} content={content} footer={footer} className="sm:max-w-2xl mx-auto" />;
};
