import React from "react";
import { Modal } from "reactstrap";
import { translate } from "../../../../utils";
import CloseSvg from "../../../../assets/Close";
import Prepa from "../../../../assets/icons/Prepa";
import DocumentsPM from "../../../militaryPreparation/components/DocumentsPM";

export default function ModalPM({ theme, open, setOpen, young }) {
  return (
    <Modal isOpen={open} centered>
      <div className="w-full px-3 py-3">
        <div className="flex items-center justify-between">
          <div
            className={`text-xs font-normal ${theme.background[young.statusMilitaryPreparationFiles]} ${
              theme.text[young.statusMilitaryPreparationFiles]
            } px-2 py-[2px] rounded-sm `}>
            {translate(young.statusMilitaryPreparationFiles)}
          </div>
          <CloseSvg className="text-gray-500" height={12} width={12} onClick={() => setOpen(false)} />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Prepa className="w-6 h-6 mr-2 text-gray-500" />
          <div className="text-lg leading-5 font-bold">Dossier d&apos;éligibilité aux Préparations militaires</div>
        </div>
        <DocumentsPM showHelp={false} />
      </div>
    </Modal>
  );
}
