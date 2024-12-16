import React from "react";
import Modal from "../../../components/ui/modals/Modal";
import Close from "../../../assets/Close";
import Calendar from "../../../assets/icons/Calendar";
import { CancelButton } from "../../../components/buttons/SimpleButtons";
import { Link } from "react-router-dom";
import ChevronRight from "../../../assets/icons/ChevronRight";

const WithdrawalModal = ({ isOpen, onCancel, young }) => {
  const abandonStatus = ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION"];

  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="w-full bg-white md:w-[512px]">
      <div className="flex flex-col p-6 md:items-center">
        <Close height={10} width={10} onClick={onCancel} className="self-end md:hidden" />
        <Modal.Title>{!abandonStatus.includes(young.status) ? "Voulez-vous vraiment vous désister ?" : "Voulez-vous vraiment abandonner votre inscription ?"}</Modal.Title>
        <Modal.Subtitle>Vous pouvez aussi simplement changer vos dates de séjour.</Modal.Subtitle>
        <div className="flex flex-col">
          <Link
            to={{
              pathname: "/changer-de-sejour",
              state: { backlink: "/account/withdrawn" },
            }}
            className="my-2 flex h-[86px] w-full items-center rounded-lg border border-gray-200 p-7 text-gray-700 md:w-[335px]">
            <Calendar className="mr-2 text-gray-400" />
            <div className="flex-1 text-start text-[13px] font-medium md:text-sm">Changer mes dates de séjour</div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB]">
              <ChevronRight className="text-white" />
            </div>
          </Link>
          <Link
            to={{
              pathname: "/changer-de-sejour/se-desister",
              state: { backlink: "/account/withdrawn" },
            }}
            className="my-2 flex h-[86px] w-full items-center rounded-lg border border-gray-200 p-7 text-gray-700 md:w-[335px]">
            <div className="flex-1 text-start text-[13px] font-medium md:text-sm">Je souhaite {!abandonStatus.includes(young.status) ? "me désister" : "abandonner"}</div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB]">
              <ChevronRight className="text-white" />
            </div>
          </Link>
        </div>
        <CancelButton className="mt-10 hidden md:block" onClick={onCancel} />
      </div>
    </Modal>
  );
};

export default WithdrawalModal;
