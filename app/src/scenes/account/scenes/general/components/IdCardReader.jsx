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
      <div className="flex flex-col rounded-md bg-gray-50 p-6 xl:flex-row xl:items-center xl:gap-5">
        <PaperClip className="mb-4 self-start text-blue-600 xl:text-xl" />
        <div>
          <p className="mb-1 text-sm font-medium text-gray-900">{getFileTitle()}</p>
          <div className="flex flex-col xl:flex-row xl:items-center">
            <p className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-500 xl:max-w-[300px]">
              Nom : <span>{cniFile.name}</span>
            </p>
            <p className="mx-2 hidden text-gray-500 xl:block">•</p>
            <p className="mb-[1rem] text-sm text-gray-500 xl:mb-0">Expire le {new Date(young.latestCNIFileExpirationDate).toLocaleDateString("fr-fr")}</p>
          </div>
        </div>
        <ButtonLight onClick={handleDownloadFile} disabled={isDownloading} className="bg-white xl:ml-auto">
          {isDownloading && <BiLoaderAlt className="animate-spin" />}
          Télécharger
        </ButtonLight>
      </div>
    </>
  );
};

export default IdCardReader;
