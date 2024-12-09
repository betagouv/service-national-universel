import React from "react";
import Calendar from "../../../assets/icons/Calendar";
import { CancelButton } from "../../../components/buttons/SimpleButtons";
import { Link } from "react-router-dom";
import Modal from "../../../components/ui/modals/Modal";
import ChevronRight from "../../../assets/icons/ChevronRight";

const WithdrawOrChangeDateModalContent = ({ onCancel, title, subTitle }) => {
  return (
    <>
      <Modal.Title>{title}</Modal.Title>
      <Modal.Subtitle>{subTitle}</Modal.Subtitle>
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
          <div className="flex-1 text-start text-[13px] font-medium md:text-sm">Je souhaite me désister</div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB]">
            <ChevronRight className="text-white" />
          </div>
        </Link>
      </div>
      <CancelButton className="mt-10 hidden md:block" onClick={onCancel} />
    </>
  );
};

export default WithdrawOrChangeDateModalContent;
