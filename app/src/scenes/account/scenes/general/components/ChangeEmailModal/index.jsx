import React, { useState } from "react";

import Modal from "@/components/ui/modals/Modal";
import PasswordModalContent from "./PasswordModalContent";
import EmailModalContent from "./EmailModalContent";
import ActivationCodeModalContent from "./ActivationCodeModalContent";
import DidNotReceiveActivationCodeModalContent from "./DidNotReceiveActivationCodeModalContent";
import ConfirmationModalContent from "./ConfirmationModalContent";

const changeEmailSteps = {
  ENTER_PASSWORD: "ENTER_PASSWORD",
  ENTER_EMAIL: "ENTER_EMAIL",
  ENTER_CODE: "ENTER_CODE",
  DID_NOT_RECEIVE_CODE: "DID_NOT_RECEIVE_CODE",
  CONFIRMATION: "CONFIRMATION",
};

const ChangeAddressModal = ({ onClose, isOpen }) => {
  const [step, setStep] = useState(changeEmailSteps.ENTER_PASSWORD);
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

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

  const onCancel = () => {
    setStep(changeEmailSteps.ENTER_PASSWORD);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} className="w-full bg-white p-4 md:w-[520px] md:p-6">
      <>
        {step === changeEmailSteps.ENTER_PASSWORD && <PasswordModalContent onCancel={onCancel} onSuccess={onPasswordSuccess} />}
        {step === changeEmailSteps.ENTER_EMAIL && <EmailModalContent onCancel={onCancel} onSuccess={onNewEmailRequestSuccess} password={password} />}
        {step === changeEmailSteps.ENTER_CODE && (
          <ActivationCodeModalContent
            onCancel={onCancel}
            onSuccess={onNewEmailValidationSuccess}
            newEmail={newEmail}
            openDidNotReceiveCodeModal={() => {
              setStep(changeEmailSteps.DID_NOT_RECEIVE_CODE);
            }}
          />
        )}
        {step === changeEmailSteps.DID_NOT_RECEIVE_CODE && (
          <DidNotReceiveActivationCodeModalContent
            onConfirm={() => setStep(changeEmailSteps.ENTER_CODE)}
            modifiyEmail={() => {
              setStep(changeEmailSteps.ENTER_EMAIL);
            }}
          />
        )}
        {step === changeEmailSteps.CONFIRMATION && <ConfirmationModalContent onCancel={onCancel} />}
      </>
    </Modal>
  );
};

export default ChangeAddressModal;
