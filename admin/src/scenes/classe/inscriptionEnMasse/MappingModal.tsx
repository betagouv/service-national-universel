import { Button, Modal } from "@snu/ds/admin";
import React from "react";
import { IoAlertCircle } from "react-icons/io5";
import { CLASSE_IMPORT_EN_MASSE_COLUMNS, ColumnsMapping } from "snu-lib";
import { SelectMapping } from "./SelectMapping";
import { useMappingColumns } from "./useMappingColumns";

interface MappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: (mappings: Omit<ColumnsMapping, CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI>) => void;
  fileColumns: string[];
  isValidating?: boolean;
}

export const MappingModal: React.FC<MappingModalProps> = ({ isOpen, onClose, onRetry, fileColumns, isValidating = false }) => {
  const { mappings, handleFieldChange, isButtonDisabled, isColumnAlreadyMapped } = useMappingColumns(fileColumns);

  const header = (
    <div className="flex flex-col items-center text-center">
      <div className="bg-red-100 rounded-full p-4 mb-4">
        <IoAlertCircle className="text-red-500 w-8 h-8" />
      </div>
      <h2 className="text-2xl font-medium">Votre fichier semble comporter quelques erreurs ...</h2>
      <p className="text-gray-600 mt-2">
        Des colonnes du fichier n'ont pas été reconnues correctement.
        <br />
        Veuillez associer chaque colonne de votre fichier à l'information attendue.
      </p>
    </div>
  );

  const content = (
    <div className="mt-8 space-y-10">
      {Object.entries(mappings).map(([expectedColumnName, fileColumnName]) => {
        return (
          <div key={expectedColumnName} className="relative">
            <SelectMapping
              key={expectedColumnName}
              fileColumns={fileColumns}
              expectedColumnName={expectedColumnName}
              onChange={(expectedColumnName, fileColumn) => handleFieldChange(expectedColumnName as CLASSE_IMPORT_EN_MASSE_COLUMNS, fileColumn)}
              selectedFileColumn={fileColumnName}
              className="pb-2"
            />
            {isColumnAlreadyMapped(fileColumnName) && (
              <div className="text-red-500 text-sm absolute top-full left-0">
                La colonne <span className="font-bold">{fileColumnName}</span> est déjà associée.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const footer = (
    <div className="flex justify-center w-full mt-6">
      <Button
        onClick={() => onRetry(mappings)}
        leftIcon={
          isValidating ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 01-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          )
        }
        title={isValidating ? "Validation en cours..." : "Relancer l'import"}
        disabled={isButtonDisabled || isValidating}
        className="mx-auto"
      />
    </div>
  );

  return <Modal isOpen={isOpen} onClose={onClose} header={header} content={content} footer={footer} className="md:max-w-xl xl:max-w-3xl 2xl:max-w-5xl" />;
};
