import React from "react";
import Calendar from "../../../assets/icons/Calendar";
import { CancelButton } from "../../../components/buttons/SimpleButtons";
import ActionButton from "./ActionButton";
import Modal from "../../../components/ui/modals/Modal";
// import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

const WithdrawOrChangeDateModalContent = ({ onCancel, title, subTitle }) => {
  const history = useHistory();
  const handleChangeDate = () => {
    history.push("/changer-de-sejour");
  };

  const handleWithdraw = () => {
    history.push("/changer-de-sejour/se-desister");
  };
  return (
    <>
      <Modal.Title>{title}</Modal.Title>
      <Modal.Subtitle>{subTitle}</Modal.Subtitle>
      <div className="flex flex-col">
        <ActionButton icon={<Calendar className="mr-2 text-gray-400" />} onClick={handleChangeDate}>
          Changer mes dates de séjour
        </ActionButton>
        <ActionButton onClick={handleWithdraw}>Je souhaite me désister</ActionButton>
      </div>
      <CancelButton className="mt-10 hidden md:block" onClick={onCancel} />
    </>
  );
};

export default WithdrawOrChangeDateModalContent;
