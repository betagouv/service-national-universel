import React, { useState, useEffect } from "react";
import validator from "validator";
import Modal from "../../../components/ui/modals/Modal";
import ArrowRightBlue from "../../../assets/icons/ArrowRightBlue";
import PrimaryButton from "../../../components/ui/dsfr/PrimaryButton";
import SecondaryButton from "../../../components/ui/dsfr/SecondaryButton";
import Input from "../../../components/inscription/input";

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
      // _onClose();
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
      <div className="mt-4 flex flex-col gap-1">
        <label>Email</label>
        <Input value={email} onChange={setEmail} />
        <div className="h-2">{error && <span className="text-sm text-red-500">{error?.email}</span>}</div>
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <label>Confirmez votre e-mail</label>
        <Input value={emailConfirmation} onChange={setEmailConfirmation} />
        <div className="h-2">{error && <span className="text-sm text-red-500">{error?.emailConfirmation}</span>}</div>
      </div>
      <hr className="mt-3 mb-1 h-px border-0 md:bg-gray-200" />
      <div className="flex flex-col md:flex-row justify-end gap-3 mt-4">
        <SecondaryButton className="flex-2" onClick={_onClose}>
          Annuler
        </SecondaryButton>
        <PrimaryButton className="flex-1" onClick={onSubmit}>
          Recevoir le code d’activation
        </PrimaryButton>
      </div>
    </Modal>
  );
};

export default ModifyEmailModal;
