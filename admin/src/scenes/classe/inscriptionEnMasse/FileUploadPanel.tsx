import React from "react";
import { BsPeopleFill } from "react-icons/bs";
import { HiOutlineDownload, HiOutlineUpload } from "react-icons/hi";
import { Button } from "@snu/ds/admin";

interface FileUploadPanelProps {
  handleFileUploadClick: () => void;
}

export const FileUploadPanel = ({ handleFileUploadClick }: FileUploadPanelProps) => {
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
        <Button type="wired" leftIcon={<HiOutlineDownload size={20} />} title="Télécharger le modèle d'import" className="w-full md:w-auto" />

        <span className="text-gray-600 my-2 md:my-0">puis</span>

        <Button onClick={handleFileUploadClick} leftIcon={<HiOutlineUpload size={20} />} title="Téléverser votre fichier" className="w-full md:w-auto" />
      </div>
    </div>
  );
};
