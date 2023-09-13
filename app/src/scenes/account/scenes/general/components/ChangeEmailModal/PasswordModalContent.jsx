import React, { useState } from "react";
import Modal from "@/components/ui/modals/Modal";
import InputPassword from "@/components/forms/inputs/InputPassword";

const PasswordModalContent = ({ onConfirm, onCancel }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <Modal.Title>Saisir votre mot de passe de connexion</Modal.Title>
      <Modal.Subtitle>
        <div className="md:text-center mb-3">Pour sécuriser votre demande de changement d'adresse email, veuillez saisir votre mot de passe.</div>
      </Modal.Subtitle>
      <InputPassword label="Mot de passe" name="password" onChange={() => {}} error={error} value={password} />
      <Modal.Buttons onCancel={onCancel} cancelText="Annuler" onConfirm={() => onConfirm()} confirmText="Continuer" />
    </>
  );
};

export default PasswordModalContent;
