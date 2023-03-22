import React from "react";
import { CancelButton } from "../../buttons/SimpleButtons";
import ButtonPrimary from "../buttons/ButtonPrimary";
import ButtonLight from "../buttons/ButtonLight";

import Modal from "./Modal";

const ConfirmationModal = ({ onConfirm, onCancel, title, subTitle, onClose, isOpen }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="bg-white w-full md:w-[512px] p-4 md:p-6">
      <h1 className={`font-medium md:text-center text-xl text-gray-900 mb-2`}>{title}</h1>
      {subTitle && <span className={`text-gray-500 text-sm md:text-center mb-7`}>{subTitle}</span>}
      <div className="flex flex-col md:flex-row mt-3 w-full gap-3">
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
