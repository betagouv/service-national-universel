import React from "react";
import { BsArrowUpShort } from "react-icons/bs";
import Prepa from "../../../../assets/icons/Prepa";
import { translateStatusMilitaryPreparationFiles } from "../../../../utils";
import ModalPM from "./ModalPM";

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
    <>
      <div className="mb-4 flex -translate-y-4 flex-col space-y-4 rounded-lg bg-white px-3 pt-2 shadow-md ">
        <div className="mb-3 cursor-pointer" onClick={() => setOpen(young.statusMilitaryPreparationFiles !== "REFUSED" ? !open : false)}>
          <div className="flex items-center justify-between ">
            <div
              className={`text-xs font-normal ${theme.background[young.statusMilitaryPreparationFiles]} ${
                theme.text[young.statusMilitaryPreparationFiles]
              } rounded-sm px-2 py-[2px] `}>
              {translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}
            </div>
            {young.statusMilitaryPreparationFiles !== "REFUSED" ? <BsArrowUpShort className="h-8 w-8 rotate-45 text-gray-400" /> : null}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-base font-bold leading-5">Dossier d&apos;éligibilité aux Préparations militaires</div>
          </div>
          <div className="flex items-center justify-end">
            <Prepa className="mr-2 h-6 w-6 text-gray-500" />
          </div>
        </div>
      </div>
      {open ? <ModalPM theme={theme} open={open} setOpen={setOpen} young={young} /> : null}
    </>
  );
}
