import React, { useState } from "react";
import Modal from "../../../components/ui/modals/Modal";
import { YOUNG_STATUS } from "../../../utils";
import { ACTION_ABANDON, ACTION_WITHDRAW, CONTENT_CHANGE_DATE, steps } from "../utils";
import WithdrawOrChangeDateModalContent from "./WithdrawOrChangeDateModalContent";
import Close from "../../../assets/Close";

const WithdrawalModal = ({ isOpen, onCancel: onCancelProps, young }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);

  const onCancel = () => {
    if (isLoading) {
      return null;
    }
    setStep(0);
    onCancelProps();
  };

  const action = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status) ? ACTION_ABANDON : ACTION_WITHDRAW;

  const filteredSteps = steps[action].filter((step) => step.parcours.includes(young.source));
  const { content, title, subTitle } = filteredSteps[step];
  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="w-full bg-white md:w-[512px]">
      <div className="flex flex-col p-6 md:items-center">
        <Close height={10} width={10} onClick={onCancel} className="self-end md:hidden" />
        {content === CONTENT_CHANGE_DATE && <WithdrawOrChangeDateModalContent onCancel={onCancel} title={title} subTitle={subTitle} />}
      </div>
    </Modal>
  );
};

export default WithdrawalModal;
