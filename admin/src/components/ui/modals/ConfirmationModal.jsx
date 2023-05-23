import React from "react";
import ShieldCheck from "../../../assets/icons/ShieldCheck";
import ButtonLight from "../buttons/ButtonLight";
import ButtonPrimary from "../buttons/ButtonPrimary";
import Modal from "./Modal";

const ConfirmationModal = ({ isOpen, icon = <ShieldCheck className="h-[36px] w-[36px] text-[#D1D5DB]" />, title, message, onClose, onConfirm, confirmLabel = "Confirmer" }) => {
  return (
    <Modal isOpen={isOpen}>
      <Modal.Header className="flex-col">
        {icon && <div className="mb-auto flex justify-center">{icon}</div>}
        <h2 className="m-0 text-center text-xl leading-7">{title}</h2>
      </Modal.Header>
      <Modal.Content>
        <p className="mb-0 text-center text-xl leading-7">{message}</p>
      </Modal.Content>
      <Modal.Footer>
        <div className="flex items-center justify-between gap-2">
          <ButtonLight className="grow" onClick={onClose}>
            Annuler
          </ButtonLight>
          <ButtonPrimary onClick={onConfirm} className="grow">
            {confirmLabel}
          </ButtonPrimary>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
