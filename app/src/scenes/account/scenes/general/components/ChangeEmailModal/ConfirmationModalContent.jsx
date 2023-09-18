import React from "react";
import Modal from "@/components/ui/modals/Modal";
import Check from "@/assets/icons/Check";

const ConfirmationModalContent = ({ onCancel }) => {
  return (
    <>
      <div className="rounded-full bg-blue-100 w-[48px] h-[48px] mx-auto flex justify-center items-center">
        <Check className="text-[#2563EB]" strokeWidth={2} width={16} height={14} />
      </div>
      <Modal.Title>Votre nouvelle adresse email a été enregistrée !</Modal.Title>
      <Modal.Buttons onCancel={onCancel} cancelText="J'ai compris" />
    </>
  );
};

export default ConfirmationModalContent;
