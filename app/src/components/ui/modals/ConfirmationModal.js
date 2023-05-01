import React from "react";
import ButtonPrimary from "../buttons/ButtonPrimary";
import ButtonLight from "../buttons/ButtonLight";

import Modal from "./Modal";

const ConfirmationModal = ({ onConfirm, onCancel, title, subTitle, onClose, isOpen }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full bg-white p-4 md:w-[512px] md:p-6">
      <h1 className={`mb-2 text-xl font-medium text-gray-900 md:text-center`}>{title}</h1>
      {subTitle && <span className={`mb-7 text-sm text-gray-500 md:text-center`}>{subTitle}</span>}
      <div className="mt-3 flex w-full flex-col gap-3 md:flex-row">
        <ButtonPrimary className="flex-1 md:order-last" onClick={onConfirm}>
          Confirmer
        </ButtonPrimary>
        {onCancel && (
          <ButtonLight className="flex-1" onClick={onCancel}>
            Retour
          </ButtonLight>
        )}
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
