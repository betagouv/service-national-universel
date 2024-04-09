import React, { useState, useEffect } from "react";
import validator from "validator";
import Modal from "../../../components/ui/modals/Modal";
import ArrowRightBlue from "../../../assets/icons/ArrowRightBlue";
import Input from "@/components/dsfr/forms/input";
import SignupButtonContainer from "@/components/dsfr/ui/buttons/SignupButtonContainer";

const ModifyEmailModal = ({ onClose, isOpen, onEmailChange }) => {
  const [email, setEmail] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [error, setError] = useState({});

  const trimmedEmail = email?.trim();
  const trimmedEmailConfirmation = emailConfirmation?.trim();

  const validate = () => {
    let errors = {};
    //Email
    if (trimmedEmail && !validator.isEmail(trimmedEmail)) {
      errors.email = "L'e-mail renseigné est invalide";
    }
    //Email confirm
    if (trimmedEmail && trimmedEmailConfirmation && trimmedEmail !== trimmedEmailConfirmation) {
      errors.emailConfirmation = "Les emails ne correspondent pas";
    }
    return errors;
  };

  const reset = () => {
    setEmail("");
    setEmailConfirmation("");
    setError({});
  };

  const _onClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async () => {
    let errors = {};

    if (email === undefined || email === "") {
      errors["email"] = "Ce champ est obligatoire";
    }
    if (emailConfirmation === undefined || emailConfirmation === "") {
      errors["emailConfirmation"] = "Ce champ est obligatoire";
    }

    errors = { ...errors, ...validate() };
    setError(errors);

    if (!Object.keys(errors).length) {
      onEmailChange(email.trim());
    }
  };

  useEffect(() => {
    setError(validate());
  }, [email, emailConfirmation]);

  return (
    <Modal className="p-4 md:p-6 w-full bg-white md:w-[540px]" isOpen={isOpen} onClose={_onClose}>
      <h1 className="mb-3 text-2xl font-semibold text-[#161616]">
        <ArrowRightBlue className="inline mr-2" /> Modifier mon adresse e-mail
      </h1>
      <Input label="Email" value={email} onChange={setEmail} state={error?.email ? "error" : "default"} stateRelatedMessage={error?.email} />
      <Input
        label="Confirmez votre e-mail"
        state={error?.emailConfirmation ? "error" : "default"}
        stateRelatedMessage={error?.emailConfirmation}
        value={emailConfirmation}
        onChange={setEmailConfirmation}
      />
      <SignupButtonContainer className="w-full" onClickNext={onSubmit} onClickPrevious={_onClose} labelNext="Recevoir le code d’activation" labelPrevious="Annuler" />
    </Modal>
  );
};

export default ModifyEmailModal;
