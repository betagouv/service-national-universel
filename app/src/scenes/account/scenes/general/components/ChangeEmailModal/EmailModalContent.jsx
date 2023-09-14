import React, { useState } from "react";
import validator from "validator";
import Modal from "@/components/ui/modals/Modal";
import Input from "@/components/forms/inputs/Input";

const PasswordModalContent = ({ onConfirm, onCancel }) => {
  const [email, setEmail] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setLoading] = useState(false);

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

  const onSubmit = async () => {
    let errors = {};

    if (email === undefined || email === "") {
      errors["email"] = "Ce champ est obligatoire";
    }
    if (emailConfirmation === undefined || emailConfirmation === "") {
      errors["emailConfirmation"] = "Ce champ est obligatoire";
    }

    errors = { ...errors, ...validate() };
    setErrors(errors);

    if (!Object.keys(errors).length) {
      // onEmailChange(email.trim());
      console.log("onEmailChange", email.trim());
    }
  };

  return (
    <>
      <Modal.Title>Quelle est votre nouvelle adresse email ?</Modal.Title>
      <Input label="Nouvelle adresse email" name="email" onChange={setEmail} error={errors.email} value={email} />
      <Input label="Confirmer la nouvelle adresse email" name="emailConfirmation" onChange={setEmailConfirmation} error={errors.emailConfirmation} value={emailConfirmation} />
      <Modal.Buttons onCancel={onCancel} cancelText="Annuler" onConfirm={onSubmit} confirmText="Recevoir le code d'activation" />
    </>
  );
};

export default PasswordModalContent;
