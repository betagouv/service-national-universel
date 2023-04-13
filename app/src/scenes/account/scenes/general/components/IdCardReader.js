import React, { useState } from "react";
import PaperClip from "../../../../../assets/icons/PaperClip";
import ButtonLight from "../../../../../components/ui/buttons/ButtonLight";
import { downloadYoungDocument } from "../../../../../services/young.service";
import { toastr } from "react-redux-toastr";
import { BiLoaderAlt } from "react-icons/bi";

const IdCardReader = ({ young, cniFile }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const getFileTitle = () => {
    if (cniFile.category === "passport") {
      return "Passeport";
    }
    return "Carte Nationale d'Identité";
  };

  const handleDownloadFile = async () => {
    try {
      setIsDownloading(true);
      await downloadYoungDocument({ youngId: young._id, fileType: "cniFiles", fileId: cniFile._id });
    } catch (error) {
      const { title, message } = error;
      toastr.error(title, message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-50 rounded-md p-6">
        <PaperClip className="text-blue-600 mb-4" />
        <p className="text-sm text-gray-900 font-medium mb-1">{getFileTitle()}</p>
        <p className="text-sm text-gray-500 mb-1">Nom : {cniFile.name}</p>
        <p className="text-sm text-gray-500 mb-4">Expire le {new Date(cniFile.expirationDate).toLocaleDateString("fr-fr")}</p>
        <ButtonLight onClick={handleDownloadFile} disabled={isDownloading}>
          {isDownloading && <BiLoaderAlt className="animate-spin" />}
          Télécharger
        </ButtonLight>
      </div>
    </>
  );
};

export default IdCardReader;
