import React, { useState } from "react";
import Modal from "@/components/ui/modals/Modal";
import Input from "@/components/forms/inputs/Input";
import InlineButton from "@/components/dsfr/ui/buttons/InlineButton";

const ActivationCodeModalContent = ({ onSuccess, onCancel, newEmail }) => {
  const [activationCode, setActivationCode] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <Modal.Title>Entrer le code d’activation</Modal.Title>
      <Modal.Subtitle>
        <div className="md:text-center mb-3">
          Vous venez de recevoir un code d’activation sur la boîte mail de <strong className="text-gray-900">{newEmail}</strong>
        </div>
      </Modal.Subtitle>
      <Input label="Code d'activation reçu par email" name="email" onChange={() => {}} error={error} value={activationCode} />
      {/* refacto inline button gray en props */}
      <InlineButton className="text-gray-500 hover:text-gray-700 text-sm font-medium" onClick={() => {}}>
        Je n'ai rien reçu
      </InlineButton>
      <Modal.Buttons onCancel={onCancel} cancelText="Annuler" onConfirm={() => onSuccess()} confirmText="Valider" />
    </>
  );
};

export default ActivationCodeModalContent;
