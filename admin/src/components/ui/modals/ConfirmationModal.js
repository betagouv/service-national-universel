import React from "react";
import ShieldCheck from "../../../assets/icons/ShieldCheck";
import ButtonLight from "../buttons/ButtonLight";
import ButtonPrimary from "../buttons/ButtonPrimary";
import Modal from "./Modal";

const ConfirmationModal = ({ isOpen, icon = <ShieldCheck className="text-[#D1D5DB] w-[36px] h-[36px]" />, title, message, onClose, onConfirm, confirmLabel = "Confirmer" }) => {
  return (
    <Modal isOpen={isOpen}>
      <Modal.Header className="flex-col">
        {icon && <div className="flex justify-center mb-auto">{icon}</div>}
        <h2 className="leading-7 text-xl text-center m-0">{title}</h2>
      </Modal.Header>
      <Modal.Content>
        <p className="leading-7 text-xl mb-0 text-center">{message}</p>
      </Modal.Content>
      <Modal.Footer>
        <div className="flex gap-2 items-center justify-between">
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
