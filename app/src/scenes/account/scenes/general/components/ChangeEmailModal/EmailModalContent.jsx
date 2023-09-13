import React, { useState } from "react";
import Modal from "@/components/ui/modals/Modal";
import Input from "@/components/forms/inputs/Input";

const PasswordModalContent = ({ onConfirm, onCancel }) => {
  const [email, setEmail] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <Modal.Title>Quelle est votre nouvelle adresse email ?</Modal.Title>
      <Input label="Nouvelle adresse email" name="email" onChange={() => {}} error={error} value={email} />
      <Input label="Confirmer la nouvelle adresse email" name="emailConfirmation" onChange={() => {}} error={error} value={emailConfirmation} />
      <Modal.Buttons onCancel={onCancel} cancelText="Annuler" onConfirm={() => onConfirm()} confirmText="Recevoir le code d'activation" />
    </>
  );
};

export default PasswordModalContent;
