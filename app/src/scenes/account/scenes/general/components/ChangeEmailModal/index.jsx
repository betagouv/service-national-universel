import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import Modal from "@/components/ui/modals/Modal";
import PasswordModalContent from "./PasswordModalContent";
import EmailModalContent from "./EmailModalContent";
import ActivationCodeModalContent from "./ActivationCodeModalContent";
import DidNotReceiveActivationCodeModalContent from "./DidNotReceiveActivationCodeModalContent";
import ConfirmationModalContent from "./ConfirmationModalContent";

import { updateYoung } from "../../../../../../services/young.service";
import { capture } from "../../../../../../sentry";
import api from "../../../../../../services/api";
import { setYoung } from "../../../../../../redux/auth/actions";

const changeEmailSteps = {
  ENTER_PASSWORD: "ENTER_PASSWORD",
  ENTER_EMAIL: "ENTER_EMAIL",
  ENTER_CODE: "ENTER_CODE",
  DID_NOT_RECEIVE_CODE: "DID_NOT_RECEIVE_CODE",
  CONFIRMATION: "CONFIRMATION",
};

const ChangeAddressModal = ({ onClose, isOpen, young }) => {
  const [step, setStep] = useState(changeEmailSteps.ENTER_PASSWORD);
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const onCancel = () => {
    onClose();
  };

  const onPasswordSuccess = (validatedPassword) => {
    setPassword(validatedPassword);
    setStep(changeEmailSteps.ENTER_EMAIL);
  };

  const onNewEmailRequestSuccess = (newEmail) => {
    setNewEmail(newEmail);
    setStep(changeEmailSteps.ENTER_CODE);
  };

  const onNewEmailValidationSuccess = () => {
    setStep(changeEmailSteps.CONFIRMATION);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} className="w-full bg-white p-4 md:w-[520px] md:p-6">
      <>
        {step === changeEmailSteps.ENTER_PASSWORD && <PasswordModalContent onCancel={onClose} onSuccess={onPasswordSuccess} />}
        {step === changeEmailSteps.ENTER_EMAIL && <EmailModalContent onCancel={onClose} onSuccess={onNewEmailRequestSuccess} password={password} />}
        {step === changeEmailSteps.ENTER_CODE && <ActivationCodeModalContent onCancel={onClose} onSuccess={onNewEmailValidationSuccess} newEmail={newEmail} />}
        {step === changeEmailSteps.DID_NOT_RECEIVE_CODE && <DidNotReceiveActivationCodeModalContent onCancel={onClose} onConfirm={() => setStep(changeEmailSteps.ENTER_CODE)} />}
        {step === changeEmailSteps.CONFIRMATION && <ConfirmationModalContent onCancel={onClose} onConfirm={() => setStep(changeEmailSteps.ENTER_CODE)} />}
      </>
    </Modal>
  );
};

export default ChangeAddressModal;
