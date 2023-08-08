import React, { useState, useEffect } from "react";
import Modal from "../../../components/ui/modals/Modal";
import ArrowRightBlue from "../../../assets/icons/ArrowRightBlue";
import PrimaryButton from "../../../components/ui/dsfr/PrimaryButton";
import SecondaryButton from "../../../components/ui/dsfr/SecondaryButton";
import Input from "../../../components/inscription/input";

const ModifyEmailModal = ({ onClose, isOpen }) => {
  const [email, setEmail] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [error, setError] = useState("");
  return (
    <Modal className="p-4 md:p-6 w-full bg-white md:w-[540px]" isOpen={isOpen} onClose={() => {}}>
      <h1 className="mb-3 text-2xl font-semibold text-[#161616]">
        <ArrowRightBlue className="inline mr-2" /> Modifier mon adresse e-mail
      </h1>
      <div className="mt-4 flex flex-col gap-1">
        <label>Email</label>
        <Input value={email} onChange={setEmail} />
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <label>Confirmez votre e-mail</label>
        <Input value={emailConfirmation} onChange={setEmailConfirmation} />
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
      <hr className="h-px border-0 md:bg-gray-200" />
      <div className="flex flex-col md:flex-row justify-end gap-3 mt-4">
        <SecondaryButton className="flex-2" onClick={() => {}}>
          Annuler
        </SecondaryButton>
        <PrimaryButton className="flex-1" onClick={() => {}}>
          Recevoir un nouveau code d’activation
        </PrimaryButton>
      </div>
    </Modal>
  );
};

export default ModifyEmailModal;
