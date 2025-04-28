import React, { RefObject } from "react";
import { BsPeopleFill } from "react-icons/bs";
import { HiOutlineDownload, HiOutlineUpload } from "react-icons/hi";

interface FileUploadPanelProps {
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileUploadClick: () => void;
}

export const FileUploadPanel = ({ fileInputRef, handleFileChange, handleFileUploadClick }: FileUploadPanelProps) => {
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

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" className="hidden" />

      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <button className="flex items-center justify-center bg-white text-blue-600 border border-blue-600 px-4 py-3 rounded-lg hover:bg-blue-50 transition w-full md:w-auto">
          <HiOutlineDownload size={20} className="mr-2" />
          Télécharger le modèle d'import
        </button>

        <span className="text-gray-600 my-2 md:my-0">puis</span>

        <button
          onClick={handleFileUploadClick}
          className="flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition w-full md:w-auto">
          <HiOutlineUpload size={20} className="mr-2" />
          Téléverser votre fichier
        </button>
      </div>
    </div>
  );
};
