import React from "react";
import { translateStatusMilitaryPreparationFiles } from "../../../../utils";
import { BsChevronDown } from "react-icons/bs";
import DocumentsPM from "../../../militaryPreparation/components/DocumentsPM";
import Prepa from "../../../../assets/icons/Prepa";

export default function CardPM({ young }) {
  const [open, setOpen] = React.useState(false);

  const theme = {
    background: {
      WAITING_VERIFICATION: "bg-sky-100",
      WAITING_CORRECTION: "bg-[#FD7A02]",
      VALIDATED: "bg-[#71C784]",
      REFUSED: "bg-red-500",
    },
    text: {
      WAITING_VERIFICATION: "text-sky-600",
      WAITING_CORRECTION: "text-white",
      VALIDATED: "text-white",
      REFUSED: "text-white",
    },
  };

  return (
    <div className="flex flex-col w-full rounded-lg bg-white px-4 pt-3 mb-4 shadow-md">
      <div className="mb-3 cursor-pointer" onClick={() => setOpen(young.statusMilitaryPreparationFiles !== "REFUSED" ? !open : false)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Prepa className="w-6 h-6 mr-2 text-gray-500" />
            <div className="text-base leading-5 font-bold">Dossier d&apos;éligibilité aux Préparations militaires</div>
          </div>
          <div className="flex items-center gap-5">
            <div
              className={`text-xs font-normal ${theme.background[young.statusMilitaryPreparationFiles]} ${
                theme.text[young.statusMilitaryPreparationFiles]
              } px-2 py-[2px] rounded-sm `}>
              {translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}
            </div>
            {young.statusMilitaryPreparationFiles !== "REFUSED" ? <BsChevronDown className={`text-gray-400 h-5 w-5 ${open ? "rotate-180" : ""}`} /> : null}
          </div>
        </div>
      </div>
      {open ? (
        <>
          <hr className="text-gray-200" />
          <DocumentsPM showHelp={false} />
        </>
      ) : null}
    </div>
  );
}
