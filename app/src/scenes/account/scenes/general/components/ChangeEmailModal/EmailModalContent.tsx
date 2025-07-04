import React, { useState } from "react";
import validator from "validator";
import { translate } from "snu-lib";
import Modal from "@/components/ui/modals/Modal";
import Input from "@/components/forms/inputs/Input";
import api from "@/services/api";
import { capture } from "@/sentry";

interface PasswordModalContentProps {
  onSuccess: (email: string) => void;
  onCancel: () => void;
  password: string;
  enteredEmail?: string;
}

const PasswordModalContent = ({ onSuccess, onCancel, password, enteredEmail = "" }: PasswordModalContentProps) => {
  const [email, setEmail] = useState(enteredEmail);
  const [emailConfirmation, setEmailConfirmation] = useState(enteredEmail);
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setLoading] = useState(false);

  const trimmedEmail = email?.trim();
  const trimmedEmailConfirmation = emailConfirmation?.trim();

  const requestEmailUpdate = async (newEmail: string, password: string) => {
    try {
      setLoading(true);
      const { ok, code } = await api.post(`/young/email`, { email: newEmail, password });
      setLoading(false);
      if (!ok) return setErrors({ email: translate(code) });
      setErrors({});
      setEmail("");
      setEmailConfirmation("");
      return onSuccess(newEmail);
    } catch (e) {
      capture(e);
      setErrors({ email: translate(e.code) });
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    const errors: any = {};

    if (email === undefined || email === "") {
      errors["email"] = "Ce champ est obligatoire";
    }
    if (emailConfirmation === undefined || emailConfirmation === "") {
      errors["emailConfirmation"] = "Ce champ est obligatoire";
    }

    if (trimmedEmail && !validator.isEmail(trimmedEmail)) {
      errors.email = "L'e-mail renseigné est invalide";
    }

    if (trimmedEmail && trimmedEmailConfirmation && trimmedEmail !== trimmedEmailConfirmation) {
      errors.emailConfirmation = "Les emails ne correspondent pas";
    }

    setErrors(errors);

    if (!Object.keys(errors).length) {
      await requestEmailUpdate(email.trim(), password);
    }
  };

  return (
    <>
      <Modal.Title>Quelle est votre nouvelle adresse email ?</Modal.Title>
      <Input label="Nouvelle adresse email" name="email" onChange={(e) => setEmail(e.target.value)} error={errors.email} value={email} />
      <Input
        label="Confirmer la nouvelle adresse email"
        name="emailConfirmation"
        onChange={(e) => setEmailConfirmation(e.target.value)}
        error={errors.emailConfirmation}
        value={emailConfirmation}
      />
      <Modal.Buttons onCancel={onCancel} cancelText="Annuler" onConfirm={onSubmit} confirmText="Recevoir le code d'activation" disabled={isLoading} />
    </>
  );
};

export default PasswordModalContent;
