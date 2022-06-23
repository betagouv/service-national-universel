import React from "react";
import { BsArrowUpShort } from "react-icons/bs";
import Prepa from "../../../../assets/icons/Prepa";
import { translate } from "../../../../utils";
import ModalPM from "./ModalPM";

export default function CardPM({ young }) {
  const [open, setOpen] = React.useState(false);

  const theme = {
    background: {
      WAITING_VALIDATION: "bg-sky-100",
      WAITING_CORRECTION: "bg-[#FD7A02]",
      VALIDATED: "bg-[#71C784]",
      REFUSED: "bg-red-500",
    },
    text: {
      WAITING_VALIDATION: "text-sky-600",
      WAITING_CORRECTION: "text-white",
      VALIDATED: "text-white",
      REFUSED: "text-white",
    },
  };

  return (
    <>
      <div className="flex flex-col rounded-lg bg-white px-3 pt-2 mb-4 shadow-md -translate-y-4 space-y-4 ">
        <div className="mb-3 cursor-pointer" onClick={() => setOpen(young.statusMilitaryPreparationFiles !== "REFUSED" ? !open : false)}>
          <div className="flex items-center justify-between ">
            <div
              className={`text-xs font-normal ${theme.background[young.statusMilitaryPreparationFiles]} ${
                theme.text[young.statusMilitaryPreparationFiles]
              } px-2 py-[2px] rounded-sm `}>
              {translate(young.statusMilitaryPreparationFiles)}
            </div>
            {young.statusMilitaryPreparationFiles !== "REFUSED" ? <BsArrowUpShort className="rotate-45 text-gray-400 h-8 w-8" /> : null}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-base leading-5 font-bold">Dossier d&apos;éligibilité aux Préparations militaires</div>
          </div>
          <div className="flex justify-end items-center">
            <Prepa className="w-6 h-6 mr-2 text-gray-500" />
          </div>
        </div>
      </div>
      {open ? <ModalPM theme={theme} open={open} setOpen={setOpen} young={young} /> : null}
    </>
  );
}
