import React from "react";
import PaperClip from "../../../../assets/icons/PaperClip";
import ButtonLight from "../../../../components/ui/buttons/ButtonLight";
import { createPortal } from "react-dom";

const IdCardReader = ({ cniFile }) => {
  const getFileTitle = () => {
    if (cniFile.category === "passport") {
      return "Passeport";
    }
    return "Carte Nationale d'Identité";
  };

  return (
    <>
      <div className="bg-gray-50 rounded-md p-6">
        <PaperClip className="text-blue-600 mb-4" />
        <p className="text-sm text-gray-900 font-medium mb-1">{getFileTitle()}</p>
        <p className="text-sm text-gray-500 mb-1">Nom : {cniFile.name}</p>
        <p className="text-sm text-gray-500 mb-4">Expire le {new Date(cniFile.expirationDate).toLocaleDateString("fr-fr")}</p>
        <ButtonLight>Télécharger</ButtonLight>
      </div>
    </>
  );
};

export default IdCardReader;

const FileReader = ({ isOpen, setIsOpen }) => {
  const handleClose = () => setIsOpen(false);

  return (
    isOpen &&
    createPortal(
      <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col justify-between">
        <div className="py-6 px-4 bg-gray-50 font-medium text-lg text-center">Visualisation du document</div>
        <div></div>
        <div className="py-3 px-4 bg-gray-50 font-medium text-lg">
          <ButtonLight className="w-full bg-white">Fermer</ButtonLight>
        </div>
      </div>,
      document.body,
    )
  );
};
