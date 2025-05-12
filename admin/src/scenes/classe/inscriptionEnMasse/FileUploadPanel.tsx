import React from "react";
import { BsPeopleFill } from "react-icons/bs";
import { HiOutlineDownload, HiOutlineUpload } from "react-icons/hi";
import { Button } from "@snu/ds/admin";
import { cleanFileNamePath } from "@/utils";
import { downloadSecuredFile } from "@/services/file.service";

interface FileUploadPanelProps {
  classeName?: string;
  etablissementName?: string;
  isValidating?: boolean;
  handleFileUploadClick: () => void;
}

export const FileUploadPanel = ({ classeName, etablissementName, handleFileUploadClick, isValidating = false }: FileUploadPanelProps) => {
  const handleDownloadFile = async () => {
    downloadSecuredFile("file/snu-cle-model-import-liste-eleves.xlsx", {
      fileName: `snu-${cleanFileNamePath(classeName)}-${cleanFileNamePath(etablissementName)}-liste_eleves.xlsx`,
    });
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <BsPeopleFill size={40} className="text-gray-800" />
      </div>

      <h2 className="text-2xl font-bold mb-6">Importez votre liste d'élèves par fichier</h2>

      <p className="text-lg mb-2">
        Ce fichier doit lister les élèves d'<span className="font-bold">une seule et même classe</span>,
      </p>
      <p className="text-lg mb-6">
        et comporter les informations suivantes : <span className="font-bold">Prénom, Nom, Date de naissance</span> et <span className="font-bold">Genre</span>.
      </p>

      <p className="text-md mb-8 text-gray-600">Format .xlsx • Jusqu'à 5Mo</p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <Button type="wired" leftIcon={<HiOutlineDownload size={20} />} title="Télécharger le modèle d'import" className="w-full md:w-auto" onClick={handleDownloadFile} />

        <span className="text-gray-600 my-2 md:my-0">puis</span>

        <Button
          onClick={handleFileUploadClick}
          leftIcon={
            isValidating ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <HiOutlineUpload size={20} />
            )
          }
          title={isValidating ? "Validation en cours..." : "Téléverser votre fichier"}
          className="w-full md:w-auto"
          disabled={isValidating}
        />
      </div>
    </div>
  );
};
