import React from "react";
import Calendar from "../../../assets/icons/Calendar";
import { CancelButton } from "../../../components/buttons/SimpleButtons";
import ActionButton from "./ActionButton";
import Modal from "../../../components/ui/modals/Modal";

const WithdrawOrChangeDateModalContent = ({ onCancel, title, subTitle, confirmButtonName, onConfirm, onChangeDate }) => {
  return (
    <>
      <Modal.Title>{title}</Modal.Title>
      <Modal.Subtitle>{subTitle}</Modal.Subtitle>
      <div className="flex flex-col">
        <ActionButton icon={<Calendar className="mr-2 text-gray-400" />} onClick={onChangeDate}>
          Changer mes dates de séjour
        </ActionButton>
        <ActionButton onClick={onConfirm}>{confirmButtonName}</ActionButton>
      </div>
      <CancelButton className="mt-10 hidden md:block" onClick={onCancel} />
    </>
  );
};

export default WithdrawOrChangeDateModalContent;
