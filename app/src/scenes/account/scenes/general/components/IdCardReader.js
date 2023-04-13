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
      <div className="bg-gray-50 rounded-md p-6 flex flex-col xl:flex-row xl:items-center xl:gap-5">
        <PaperClip className="text-blue-600 mb-4 self-start xl:text-xl" />
        <div>
          <p className="text-sm text-gray-900 font-medium mb-1">{getFileTitle()}</p>
          <div className="flex flex-col xl:flex-row xl:items-center">
            <p className="text-sm text-gray-500 mb-1 xl:max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
              Nom : <span>{cniFile.name}</span>
            </p>
            <p className="hidden xl:block mx-2 text-gray-500">•</p>
            <p className="text-sm text-gray-500 mb-[1rem] xl:mb-0">Expire le {new Date(cniFile.expirationDate).toLocaleDateString("fr-fr")}</p>
          </div>
        </div>
        <ButtonLight onClick={handleDownloadFile} disabled={isDownloading} className="xl:ml-auto">
          {isDownloading && <BiLoaderAlt className="animate-spin" />}
          Télécharger
        </ButtonLight>
      </div>
    </>
  );
};

export default IdCardReader;
