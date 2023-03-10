import React from "react";
import Calendar from "../../../assets/icons/Calendar";
import { CancelButton } from "../../../components/buttons/SimpleButtons";
import { Title, SubTitle, ActionButton } from "./elements";

const WithdrawOrChangeDateModalContent = ({ onCancel, title, subTitle, confirmButtonName, onConfirm, onChangeDate }) => {
  return (
    <>
      <Title>{title}</Title>
      <SubTitle>{subTitle}</SubTitle>
      <div className="flex flex-col">
        <ActionButton icon={<Calendar className="mr-2 text-gray-400" />} onClick={onChangeDate}>
          Changer mes dates de séjour
        </ActionButton>
        <ActionButton onClick={onConfirm}>{confirmButtonName}</ActionButton>
      </div>
      <CancelButton className="mt-10" onClick={onCancel} />
    </>
  );
};

export default WithdrawOrChangeDateModalContent;
